import { toCanvas } from "html-to-image";
import { PDFDocument } from "pdf-lib";

/** Capture each existing paper independently, at print resolution. Font glyphs
 * are baked into the lossless page image so system and handwriting fonts retain
 * their exact appearance on devices that do not have those fonts installed. */
export async function exportPdf(doc: Document, fontName: string, progress: (page: number, count: number) => void) {
  await doc.fonts.ready;
  const papers = Array.from(doc.querySelectorAll<HTMLElement>("#allpage > .paper"));
  if (!papers.length) throw new Error("请等待字帖生成后重试。");
  const fontCSS = (await Promise.all([fontName, "HwyPinyin.woff"].map(async name => {
    const response = await fetch(new URL("../font/" + encodeURIComponent(name), doc.baseURI));
    if (!response.ok) throw new Error("字体加载失败，请重试。");
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("字体读取失败。"));
      reader.onerror = () => reject(new Error("字体读取失败。"));
      response.blob().then(blob => reader.readAsDataURL(blob), reject);
    });
    return `@font-face{font-family:"${name === "HwyPinyin.woff" ? "hy-py" : name.replace(/\.woff$/, "")}";src:url("${data}")}`;
  }))).join("\n");
  const pdf = await PDFDocument.create();
  pdf.setTitle("我的字帖");
  pdf.setCreator("Copybook");
  const host = doc.createElement("div");
  host.style.cssText = "position:absolute;left:-100000px;top:0;pointer-events:none";
  doc.body.appendChild(host);
  try {
    for (const [index, paper] of papers.entries()) {
      progress(index + 1, papers.length);
      const copy = paper.cloneNode(true) as HTMLElement;
      // Freeze computed styles before moving the clone: preserve inherited styles
      // and fractional font sizes even when this paper is hidden in the preview.
      const sources = [paper, ...paper.querySelectorAll<HTMLElement | SVGElement>("*")];
      const targets = [copy, ...copy.querySelectorAll<HTMLElement | SVGElement>("*")];
      sources.forEach((source, i) => {
        const style = doc.defaultView!.getComputedStyle(source);
        for (const key of Array.from(style)) targets[i].style.setProperty(key, style.getPropertyValue(key));
      });
      Object.assign(copy.style, { display: "block", margin: "0", transform: "none" });
      // Grid definitions are shared outside individual papers. Inline each use
      // in the export copy so every PDF page contains its complete four-line grid.
      copy.querySelectorAll("use").forEach(use => {
        const id = (use.getAttribute("href") || use.getAttribute("xlink:href") || "").slice(1);
        const definition = doc.getElementById(id);
        if (!definition) throw new Error("四线格加载不完整，请重新生成字帖。");
        const group = doc.createElementNS("http://www.w3.org/2000/svg", "g");
        for (const attr of Array.from(use.attributes)) {
          if (!["href", "xlink:href", "x", "y"].includes(attr.name)) group.setAttribute(attr.name, attr.value);
        }
        group.setAttribute("transform", `translate(${use.getAttribute("x") || 0} ${use.getAttribute("y") || 0})`);
        const shape = definition.cloneNode(true) as Element;
        shape.removeAttribute("id");
        group.appendChild(shape);
        use.replaceWith(group);
      });
      host.replaceChildren(copy);
      const style = doc.defaultView!.getComputedStyle(copy);
      const width = parseFloat(style.width), height = parseFloat(style.height);
      // A4 uses 300 dpi; bound unusually large custom paper to mobile canvas limits.
      const ratio = Math.min(300 / 96, 8192 / Math.max(width, height), Math.sqrt(16000000 / (width * height)));
      const canvas = await toCanvas(copy, {
        width, height, pixelRatio: ratio, backgroundColor: "#ffffff", fontEmbedCSS: fontCSS,
        // html-to-image normally rounds font-size; retain our exact frozen sizes.
        includeStyleProperties: Array.from(style).filter(key => key !== "font-size"),
      });
      const image = await pdf.embedPng(canvas.toDataURL("image/png"));
      const page = pdf.addPage([width * 72 / 96, height * 72 / 96]);
      page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
      canvas.width = canvas.height = 0;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return await pdf.saveAsBase64({ dataUri: true });
  } finally {
    host.remove();
  }
}
