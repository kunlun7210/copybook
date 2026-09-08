import { defaults, fonts, fields, type Copybook, type Addition } from "./config";
const scripts = new Map<string, Promise<void>>();
export function loadScript(path: string) {
  let p = scripts.get(path);
  if (!p) {
    p = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = path;
      s.onload = () => resolve();
      s.onerror = () => {
        scripts.delete(path);
        s.remove();
        reject(Error("文件解析组件加载失败，请刷新重试。"));
      };
      document.head.appendChild(s);
    });
    scripts.set(path, p);
  }
  return p;
}
type GlobalTools = typeof window & {
  LZString: { decompressFromUTF16: (s: string) => string; compressToUTF16: (s: string) => string };
  XLSX: {
    read: (
      s: ArrayBuffer | string,
      o?: object,
    ) => { SheetNames: string[]; Sheets: Record<string, unknown> };
    utils: { sheet_to_json: (s: unknown, o: object) => string[][] };
  };
};
export function cleanStyle(text: string) {
  return (
    String(text)
      .split(";")
      .map((s) => s.trim())
      .filter((s) =>
        /^(font-size:\s*[\d.]+px|font-family:\s*[\w\u3000-\uffff ,'-]+|color:\s*#[a-f\d]{3,8}|text-align:\s*(left|right|center)|font-weight:\s*(normal|bold|[1-9]00)|line-height:\s*[\d.]+|justify-content:\s*(center|space-between)|display:\s*(inline-flex|flex))$/i.test(
          s,
        ),
      )
      .join(";") + ";"
  );
}
export function validateBook(input: unknown): Copybook {
  if (!input || typeof input !== "object") throw Error("字帖文件不是有效对象。");
  const raw = input as Partial<Copybook>;
  const cfg = { ...defaults };
  if (!raw.config || typeof raw.config.words !== "string") throw Error("字帖缺少单词内容。");
  for (const key of Object.keys(defaults)) {
    const v = raw.config[key];
    if (v !== undefined) cfg[key] = String(v);
  }
  if (cfg.words.length > 200000 || cfg.words.split("\n").length > 3000)
    throw Error("一次最多导入3000行词表。");
  if (
    !/^\d+(\.\d+)?,\d+(\.\d+)?$/.test(cfg.pagesize) ||
    cfg.pagesize.split(",").some((n) => +n < 50 || +n > 1200)
  )
    throw Error("纸张尺寸应为50至1200毫米。");
  if (!/^[1-3],[1-3]$/.test(cfg.yzy)) throw Error("分页设置无效。");
  const textKeys = new Set([
    "words",
    "titlestr",
    "headcont",
    "footcont",
    "zttitle",
    "sysfont",
    "secondfont",
    "fonttype",
    "mobanfile",
  ]);
  const colors = new Set(["gc", "ybzc", "tc", "jxcolor", "lizifill", "excolor"]);
  for (const [key, v] of Object.entries(cfg)) {
    if (textKeys.has(key)) continue;
    if (colors.has(key)) {
      if (v && !/^#[a-f\d]{6}$/i.test(v)) throw Error("颜色格式无效。");
      continue;
    }
    if (/[<>&;{}"'\\]/.test(v)) throw Error("配置中包含无效字符。");
  }
  if (!fonts.some((f) => f[0] === cfg.fonttype)) throw Error("字帖使用了未安装的英文字体。");
  for (const f of fields) {
    if (f.type === "number") {
      const n = Number(cfg[f.key]);
      if (!Number.isFinite(n) || n < (f.min ?? -10000) || n > (f.max ?? 10000))
        throw Error(f.label + "超出允许范围。");
    }
    if (f.type === "select" && !f.options?.some((o) => o[0] === cfg[f.key]))
      throw Error(f.label + "的选项无效。");
  }
  if (!Number.isFinite(+cfg.gsize) || +cfg.gsize < 2 || +cfg.gsize > 100)
    throw Error("格子大小应为2至100毫米。");
  const moreText: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw.moreText || {}))
    if (/^(moretext-[\w-]+|titlestr|headcont|footcont)$/.test(k))
      moreText[k] = cleanStyle(String(v));
  if (!Array.isArray(raw.additions || [])) throw Error("附加内容格式不正确。");
  const additions = (raw.additions || []).map((a: Addition) => {
    if (!["text", "image", "grid", "qr"].includes(a.type)) throw Error("未知附加内容类型。");
    for (const k of ["x", "y", "width", "height", "size", "opacity", "rotation"] as const)
      if (!Number.isFinite(a[k])) throw Error("附加内容尺寸无效。");
    if (a.width <= 0 || a.height <= 0 || a.width > 1200 || a.height > 1200)
      throw Error("附加内容尺寸超出范围。");
    if (a.src && !/^data:image\/(png|jpeg|webp|gif);base64,[a-z\d+/=]+$/i.test(a.src))
      throw Error("只接受内嵌图片。");
    return {
      ...a,
      id: String(a.id),
      text: String(a.text || ""),
      page: String(a.page || "all"),
      color: /^#[a-f\d]{6}$/i.test(a.color) ? a.color : "#000000",
    };
  });
  return { config: cfg, moreText, additions };
}
export async function readCopybook(raw: string): Promise<Copybook> {
  await loadScript("./vendor/lzstr.js");
  const lz = (window as GlobalTools).LZString;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    const decoded = lz.decompressFromUTF16(raw);
    if (!decoded) throw Error("无法解压此字帖文件。");
    data = JSON.parse(decoded);
  }
  if (data.config) return validateBook(data);
  if (data.mobanfile !== "danci") throw Error("此文件不是英语单词模板，请使用对应模板打开。");
  let ok = data.okwords || {};
  if (typeof ok === "string") {
    try {
      ok = JSON.parse(ok);
    } catch {
      ok = JSON.parse(lz.decompressFromUTF16(ok));
    }
  }
  const extras = Object.keys(ok.gconfig || {}).filter((k) => /^(img|text|gezi|ewm|html)-/.test(k));
  if (extras.length)
    throw Error("此原站文件含有附加图层，尚不能无损导入。请先另存一份不含附加图层的英语单词文件。");
  return validateBook({
    config: { ...defaults, ...data, words: ok.cds || data.words || "" },
    moreText: ok.moreText || {},
    additions: [],
  });
}
export async function exportCopybook(book: Copybook) {
  await loadScript("./vendor/lzstr.js");
  const lz = (window as GlobalTools).LZString;
  return lz.compressToUTF16(
    JSON.stringify({
      format: "personal-copybook",
      version: 1,
      ...book,
      ...book.config,
      okwords: { cds: book.config.words, words: [], moreText: book.moreText },
    }),
  );
}
export async function readSpreadsheet(file: File) {
  await loadScript("./vendor/xlsx.full.min.js");
  const x = (window as GlobalTools).XLSX;
  const wb = x.read(await file.arrayBuffer(), { type: "array", sheetRows: 3001 });
  return {
    sheets: wb.SheetNames.map((name) => ({
      name,
      rows: x.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "", raw: false }),
    })),
  };
}
