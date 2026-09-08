"use client";
import { readCopybook, exportCopybook, readSpreadsheet, validateBook } from "./io";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCopybookTools } from "./use-tools";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronDown,
  Plus,
  Minus,
  Settings2,
  Save,
  FolderOpen,
  Printer,
  FileText,
  UserRound,
  Undo2,
  Redo2,
  Trash2,
  RotateCcw,
  Copy,
  Maximize2,
  PanelTop,
  Download,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  defaults,
  fields,
  initial,
  paperSizes,
  splits,
  type Field,
  type Copybook,
  type Addition,
} from "./config";

function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[][];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => v !== null && onChange(String(v))}>
      <SelectTrigger className="choice" aria-label={label}>
        <SelectValue>{options.find((o) => o[0] === value)?.[1] || value}</SelectValue>
      </SelectTrigger>
      <SelectContent className="choice-menu" alignItemWithTrigger={false}>
        {options.map((o) => (
          <SelectItem key={o[0]} value={o[0]}>
            {o[1]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function download(name: string, content: string, type = "application/json") {
  const u = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 10000);
}
function Color({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (s: string) => void;
  label: string;
}) {
  return (
    <span className="color-control">
      <span
        className="color-swatch"
        style={{ background: value || "repeating-linear-gradient(45deg,#ddd 0 4px,white 4px 8px)" }}
      >
        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <ChevronDown size={16} />
      </span>
      {value && (
        <button
          className="clear-color"
          onClick={() => onChange("")}
          aria-label={"清空" + label}
          title="清空颜色"
        >
          ×
        </button>
      )}
    </span>
  );
}
export default function Home() {
  const [book, setBook] = useState<Copybook>(initial),
    [ready, setReady] = useState(false),
    [mounted, setMounted] = useState(false),
    [customSize, setCustomSize] = useState(["210", "297"]),
    [downloadFile, setDownloadFile] = useState<{ url: string; name: string } | null>(null),
    [sheetData, setSheetData] = useState<{ name: string; rows: string[][] }[]>([]),
    [sheetIndex, setSheetIndex] = useState("0"),
    [skipHeader, setSkipHeader] = useState(false),
    [count, setCount] = useState(1),
    [page, setPage] = useState(1),
    [scale, setScale] = useState(0.78),
    [paperMore, setPaperMore] = useState(false),
    [more, setMore] = useState(false),
    [message, setMessage] = useState(""),
    [modal, setModal] = useState(""),
    [name, setName] = useState("英语单词描写练习"),
    [saved, setSaved] = useState<{ name: string; book: Copybook; date: string }[]>([]),
    [editing, setEditing] = useState<Addition | null>(null),
    [styleKey, setStyleKey] = useState(""),
    [styleForm, setStyleForm] = useState({
      size: "16",
      color: "#000000",
      font: "",
      bold: false,
      align: "center",
    }),
    [printMode, setPrintMode] = useState(false),
    [full, setFull] = useState(false),
    [gotoPage, setGotoPage] = useState("1");
  const frame = useRef<HTMLIFrameElement>(null),
    paperHost = useRef<HTMLDivElement>(null),
    file = useRef<HTMLInputElement>(null),
    imageFile = useRef<HTMLInputElement>(null),
    past = useRef<Copybook[]>([]),
    future = useRef<Copybook[]>([]),
    current = useRef(book),
    renderTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    didRestore = useRef(false);
  current.current = book;
  const notify = useCallback((s: string) => {
    setMessage(s);
  }, []);
  const commit = useCallback((value: Copybook) => {
    past.current.push(current.current);
    if (past.current.length > 40) past.current.shift();
    future.current = [];
    current.current = value;
    setBook(value);
  }, []);
  useCopybookTools(current, commit, frame);
  const patch = (key: string, value: string) =>
    commit({ ...book, config: { ...book.config, [key]: value } });
  const send = useCallback(
    (type: string, data: Record<string, unknown> = {}) =>
      frame.current?.contentWindow?.postMessage(
        { source: "copybook-editor", type, ...data },
        location.origin,
      ),
    [],
  );
  useEffect(() => {
    try {
      const s = localStorage.getItem("copybook-saved");
      if (s) setSaved(JSON.parse(s));
      const draft =
        localStorage.getItem("copybook-draft") || localStorage.getItem("copybook-defaults");
      if (draft) {
        const d = JSON.parse(draft);
        setBook({ ...initial, ...d, config: { ...defaults, ...d.config } });
      }
    } catch {
      notify("本设备保存的数据读取失败，已载入默认配置。");
    }
    didRestore.current = true;
    setMounted(true);
  }, [notify]);
  useEffect(() => {
    if (!didRestore.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem("copybook-draft", JSON.stringify(book));
      } catch {
        notify("设备存储空间不足，请保存为本地文件。");
      }
    }, 600);
    return () => clearTimeout(t);
  }, [book, notify]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(t);
  }, [message]);
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (
        e.origin !== location.origin ||
        e.source !== frame.current?.contentWindow ||
        e.data?.source !== "copybook-renderer"
      )
        return;
      const d = e.data;
      if (d.type === "ready") setReady(true);
      if (d.type === "rendered") {
        setCount(d.count);
        setPage(d.page);
        setGotoPage(String(d.page));
      }
      if (d.type === "error") notify(d.text);
      if (d.type === "html") {
        const bytes = new TextEncoder().encode(d.html);
        let binary = "";
        for (const b of bytes) binary += String.fromCharCode(b);
        setDownloadFile({
          url: "data:text/html;base64," + btoa(binary),
          name: "我的字帖-打印.html",
        });
        notify("打印文件已准备好，请点击下载。");
      }
      if (d.type === "move") {
        const b = current.current;
        commit({
          ...b,
          additions: b.additions.map((a) =>
            a.id === d.id
              ? { ...a, x: Math.round(d.x * 10) / 10, y: Math.round(d.y * 10) / 10 }
              : a,
          ),
        });
      }
      if (d.type === "edit-addition") {
        setEditing(current.current.additions.find((a) => a.id === d.id) || null);
        setModal("addition");
      }
      if (d.type === "edit-style") {
        setStyleKey(d.key);
        const s = current.current.moreText[d.key] || "";
        setStyleForm({
          size: s.match(/font-size:\s*([\d.]+)/)?.[1] || "16",
          color: s.match(/(?:^|;)\s*color:\s*([^;]+)/)?.[1] || "#000000",
          font: s.match(/font-family:\s*([^;]+)/)?.[1] || "",
          bold: s.includes("font-weight:bold"),
          align: s.includes("text-align:left")
            ? "left"
            : s.includes("text-align:right")
              ? "right"
              : "center",
        });
        setModal("style");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [commit, notify]);
  useEffect(() => {
    if (!ready) return;
    if (renderTimer.current) clearTimeout(renderTimer.current);
    const previewBook =
      modal === "addition" && editing && editing.width > 0 && editing.height > 0
        ? { ...book, additions: [...book.additions.filter((a) => a.id !== editing.id), editing] }
        : book;
    renderTimer.current = setTimeout(() => send("render", { ...previewBook, page }), 180);
    return () => {
      if (renderTimer.current) clearTimeout(renderTimer.current);
    };
  }, [book, ready, send, modal, editing]);
  const size = book.config.pagesize.split(",").map(Number),
    bleed = String(book.config.papercx).split("-").map(Number),
    pw = (size[0] || 210) + (bleed[1] ?? bleed[0] ?? 0) + (bleed[3] ?? bleed[1] ?? bleed[0] ?? 0),
    ph = (size[1] || 297) + (bleed[0] || 0) + (bleed[2] ?? bleed[0] ?? 0);
  useEffect(() => {
    const el = paperHost.current;
    if (!el) return;
    const o = new ResizeObserver(() => setScale(Math.min(el.clientWidth / (pw * 3.78), 1)));
    o.observe(el);
    return () => o.disconnect();
  }, [pw, full]);
  function changePage(n: number) {
    n = Math.max(1, Math.min(count, n));
    setPage(n);
    setGotoPage(String(n));
    send("page", { page: n });
  }
  function undo() {
    const old = past.current.pop();
    if (old) {
      future.current.push(book);
      setBook(old);
    }
  }
  function redo() {
    const next = future.current.pop();
    if (next) {
      past.current.push(book);
      setBook(next);
    }
  }
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        setModal("save");
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  function input(f: Field) {
    const value = book.config[f.key] ?? "";
    if (f.type === "color")
      return <Color value={value} onChange={(v) => patch(f.key, v)} label={f.label} />;
    if (f.type === "select")
      return (
        <Choice
          value={value}
          onChange={(v) => patch(f.key, v)}
          options={f.options!}
          label={f.label}
        />
      );
    if (f.type === "switch")
      return (
        <span className="switch-line">
          <Switch
            checked={value === "on"}
            onCheckedChange={(v) => patch(f.key, v ? "on" : "")}
            aria-label={f.label}
          />
          <small>
            {f.key === "smwznoheight" ? (value ? "不占高度" : "正常高度") : value ? "是" : "否"}
          </small>
        </span>
      );
    return (
      <input
        aria-label={f.label}
        name={f.key}
        value={value}
        type={f.type === "number" ? "number" : "text"}
        min={f.min}
        max={f.max}
        onChange={(e) => patch(f.key, e.target.value)}
        onBlur={(e) => {
          if (f.type === "number") {
            const n = Number(e.target.value);
            if (!Number.isFinite(n) || n < (f.min ?? -Infinity) || n > (f.max ?? Infinity))
              patch(
                f.key,
                String(Math.min(f.max ?? n, Math.max(f.min ?? 0, Number.isFinite(n) ? n : 0))),
              );
          }
        }}
      />
    );
  }
  function field(f: Field) {
    return (
      <div className="field" key={f.key}>
        <label htmlFor={f.key}>{f.label}</label>
        {input(f)}
        {f.help && (
          <button
            className="hint"
            title={f.help}
            aria-label={f.label + "说明"}
            onClick={() => notify(f.help!)}
          >
            ?
          </button>
        )}
      </div>
    );
  }
  function add(type: Addition["type"]) {
    setEditing({
      id: crypto.randomUUID(),
      type,
      text: type === "qr" ? "https://example.com" : type === "text" ? "在这里输入文字" : "",
      x: 15,
      y: 15,
      width: type === "qr" ? 25 : 60,
      height: type === "qr" ? 25 : 20,
      size: type === "grid" ? 12 : 24,
      color: "#000000",
      page: "all",
      opacity: 100,
      rotation: 0,
      behind: false,
      grid: "english",
    });
    setModal("addition");
  }
  async function saveLocal() {
    const safe = name.trim() || "我的字帖";
    try {
      const content = await exportCopybook(book);
      const bytes = new TextEncoder().encode(content);
      let binary = "";
      for (const b of bytes) binary += String.fromCharCode(b);
      setDownloadFile({
        url: "data:application/octet-stream;base64," + btoa(binary),
        name: safe + ".ezt",
      });
      notify("字帖文件已准备好，请点击下载文件。");
    } catch {
      notify("保存失败，请重试。");
    }
  }
  function saveDevice() {
    const safe = name.trim() || "我的字帖";
    const list = [
      { name: safe, book, date: new Date().toLocaleString("zh-CN") },
      ...saved.filter((s) => s.name !== safe),
    ];
    try {
      localStorage.setItem("copybook-saved", JSON.stringify(list));
      setSaved(list);
      notify("已保存到本设备。");
      setModal("");
    } catch {
      notify("设备空间不足，请使用保存本地文件。");
    }
  }
  async function openFile(f: File) {
    try {
      if (f.size > 20 * 1024 * 1024) throw Error("文件超过20MB，请缩小后导入。");
      if (/\.(xlsx|xls|csv|tsv)$/i.test(f.name)) {
        const result = await readSpreadsheet(f);
        setSheetData(result.sheets);
        setSheetIndex("0");
        setSkipHeader(false);
        setModal("spreadsheet");
        return;
      }
      const raw = await f.text();
      let b: Copybook;
      if (/\.txt$/i.test(f.name))
        b = validateBook({
          ...book,
          config: { ...book.config, words: raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n") },
        });
      else b = await readCopybook(raw);
      commit(b);
      setName(f.name.replace(/\.[^.]+$/, ""));
      notify("字帖已打开。");
    } catch (e) {
      notify(e instanceof Error ? e.message : "无法读取此文件。");
    }
  }
  const c = book.config;
  return (
    <>
      <header className="header">
        <div className="topnav">
          <a className="brand" href="/">
            我的字帖
          </a>
          <nav>
            {[
              ["汉语拼音", "https://www.nqez.com/html/hanyupinyin.html"],
              ["偏旁部首", "https://www.nqez.com/html/pianpanbushou.html"],
              ["教程帮助", "help"],
              ["样式字帖", "templates"],
              ["本地存档", "library"],
              ["使用文档", "help"],
            ].map(([label, url]) =>
              url.startsWith("https") ? (
                <a key={label} href={url} target="_blank" rel="noreferrer" title="打开参考资料">
                  {label}
                </a>
              ) : (
                <button key={label} onClick={() => setModal(url)}>
                  {label}
                </button>
              ),
            )}
          </nav>
          <button className="user-icon" aria-label="本设备字帖" onClick={() => setModal("library")}>
            <UserRound size={23} />
          </button>
        </div>
      </header>
      <main className={"workspace" + (full ? " full-preview" : "")}>
        <section className="left-pane">
          <div className="paper-toolbar">
            <b>纸张</b>
            <label className="paper-size-label">
              尺寸
              <span className="paper-size-box">
                <Choice
                  value={c.pagesize}
                  onChange={(v) => {
                    if (v === "custom") {
                      setCustomSize(c.pagesize.split(","));
                      setModal("paper");
                    } else patch("pagesize", v);
                  }}
                  options={[
                    ...paperSizes.map(([v, l]) => [v, l + " " + v]),
                    ["custom", "自定义尺寸…"],
                  ]}
                  label="纸张尺寸"
                />
                <span className="paper-dimensions">{c.pagesize}</span>
              </span>
            </label>
            <button className="teal" onClick={() => add("image")}>
              加图
            </button>
            <button className="teal" onClick={() => add("text")}>
              加字
            </button>
            <button className="teal" onClick={() => add("grid")}>
              加格
            </button>

            <label>
              页中页
              <Choice
                value={c.yzy}
                onChange={(v) => patch("yzy", v)}
                options={splits}
                label="页中页"
              />
            </label>
            <label>
              页码
              <input
                aria-label="页码"
                type="number"
                min="0"
                value={c.showpageon}
                onChange={(e) => patch("showpageon", e.target.value)}
              />
            </label>
            <label>
              边框
              <input
                aria-label="边框"
                value={c.cborder}
                onChange={(e) => patch("cborder", e.target.value)}
              />
            </label>
            <button
              className="paper-more"
              title="更多纸张设置"
              aria-label="更多纸张设置"
              onClick={() => setPaperMore(!paperMore)}
            >
              {paperMore ? <Minus /> : <Plus />}
            </button>
            {paperMore && (
              <div className="paper-expanded">
                <label>
                  标尺
                  <Switch
                    checked={c.toolbc === "on"}
                    onCheckedChange={(v) => patch("toolbc", v ? "on" : "")}
                    aria-label="标尺"
                  />
                </label>
                {[
                  ["papercx", "纸张出血"],
                  ["ppd", "纸张边距"],
                  ["yzyns", "左右内缩"],
                  ["yzynszx", "上下内缩"],
                  ["secondfont", "次字体"],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      aria-label={label}
                      value={c[key]}
                      onChange={(e) => patch(key, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="paper-host" ref={paperHost}>
            <div
              className="paper-window"
              style={{ width: pw * 3.78 * scale, height: ph * 3.78 * scale }}
            >
              {mounted && (
                <iframe
                  ref={frame}
                  onLoad={() => {
                    setReady(true);
                    send("render", { ...current.current, page: 1 });
                  }}
                  src="/renderer/frame.html"
                  title="字帖预览"
                  style={{
                    width: Math.ceil(pw * 3.78),
                    height: Math.ceil(ph * 3.78),
                    transform: `scale(${scale})`,
                  }}
                />
              )}
            </div>
          </div>
          <div className="pagination">
            <button aria-label="上一页" onClick={() => changePage(page - 1)} disabled={page <= 1}>
              ‹
            </button>
            <span>
              {page} / {count}
            </span>
            <button
              aria-label="下一页"
              onClick={() => changePage(page + 1)}
              disabled={page >= count}
            >
              ›
            </button>
            <label>
              到第
              <input
                aria-label="跳转页码"
                value={gotoPage}
                onChange={(e) => setGotoPage(e.target.value)}
              />
              页
            </label>
            <button onClick={() => changePage(Number(gotoPage) || 1)}>确定</button>
            <button
              title="刷新预览"
              aria-label="刷新预览"
              onClick={() => send("render", { ...book, page })}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </section>
        <section className="right-pane">
          <div className="grid-toolbar">
            <b>格子</b>
            <Color value={c.gc} onChange={(v) => patch("gc", v)} label="格子颜色" />
            <label>
              大小
              <input
                aria-label="格子大小"
                value={c.gsize}
                onChange={(e) => patch("gsize", e.target.value)}
              />
              <button className="hint" onClick={() => notify("四线格高度，单位毫米。")}>
                ?
              </button>
            </label>
            <label>
              透明度
              <input
                aria-label="透明度"
                type="number"
                min="0"
                max="100"
                value={c.bjtmd}
                onChange={(e) => patch("bjtmd", e.target.value)}
              />
            </label>
            <label>
              字号
              <input
                aria-label="字号"
                type="number"
                min="50"
                max="150"
                value={c.fsize}
                onChange={(e) => patch("fsize", e.target.value)}
              />
            </label>
          </div>
          <div
            className="settings-scroll"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files[0]) openFile(e.dataTransfer.files[0]);
            }}
          >
            <div className="word-input">
              <textarea
                aria-label="单词内容"
                name="words"
                value={c.words}
                rows={6}
                spellCheck={false}
                placeholder="每行一个单词，用 | 分隔音标、中文与例句"
                onChange={(e) => patch("words", e.target.value)}
              />
              <button
                aria-label="选择示例内容"
                title="选择示例内容"
                onClick={() => setModal("templates")}
              >
                <Plus size={25} />
              </button>
            </div>
            <div className="word-count">
              已输{c.words ? c.words.split("\n").length : 0}个词<span>自动保存到本设备</span>
            </div>
            {(
              [
                ["titlestr", "页头标题", "例：第一页标题@@第二页标题"],
                [
                  "headcont",
                  "页头内容",
                  "[]包裹自动分组，例：[姓名：][班级：][年月日]@@[第2页内容][年月日]",
                ],
                ["footcont", "页脚内容", "示例：[左边内容][#页码#][右边内容]"],
              ] as string[][]
            ).map(([key, label, placeholder]) => (
              <div className="text-row" key={key}>
                <label>{label}</label>
                <textarea
                  aria-label={label}
                  value={c[key]}
                  placeholder={placeholder}
                  rows={1}
                  onChange={(e) => patch(key, e.target.value)}
                />
                {key === "footcont" && (
                  <button
                    className="plus-inset"
                    title="插入居中页码"
                    onClick={() => patch("footcont", "[ ][#页码#][ ]")}
                  >
                    <Plus size={24} />
                  </button>
                )}
              </div>
            ))}
            <div className="fields-grid">
              {fields.filter((f) => !f.more || more).map(field)}
              <div className="config-actions">
                <button
                  title={more ? "关闭不常用配置项" : "打开全部配置项"}
                  aria-label="展开全部配置"
                  onClick={() => setMore(!more)}
                >
                  <Settings2 />
                </button>
                <button
                  title="保存默认配置，下次自动载入"
                  aria-label="保存默认配置"
                  onClick={() => {
                    try {
                      localStorage.setItem("copybook-defaults", JSON.stringify(book));
                      notify("默认配置已保存。");
                    } catch {
                      notify("保存失败，请导出本地文件。");
                    }
                  }}
                >
                  <Save />
                </button>
                <button
                  title="恢复初始配置"
                  aria-label="恢复初始配置"
                  onClick={() => setModal("reset")}
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
            <div className="instructions">
              <p>说明：每行输入一个单词，用“|”分隔音标、中文及短句，短句不能超过一行。</p>
              <p>输入示例：name|/neɪm/|名字|What's your name?|你叫什么名字。</p>
              <p>行首输入“□”插入空段，例如：□30,显示文字；单独一行“@@”表示分页。</p>
              <p>点击预览中的音标、中文文字，可设置颜色、字体等样式。</p>
            </div>
            {book.additions.length > 0 && (
              <div className="addition-list">
                <b>附加内容</b>
                {book.additions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setEditing(a);
                      setModal("addition");
                    }}
                  >
                    {{ text: "文字", image: "图片", grid: "格子", qr: "二维码" }[a.type]} ·{" "}
                    {a.text.slice(0, 12) || a.id.slice(0, 4)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <div className="action-bar">
        <button title="撤销" aria-label="撤销" onClick={undo}>
          <Undo2 size={18} />
        </button>
        <button title="重做" aria-label="重做" onClick={redo}>
          <Redo2 size={18} />
        </button>
        <button title="展开字帖预览" aria-label="展开字帖预览" onClick={() => setFull(!full)}>
          <PanelTop size={23} />
        </button>
        <span className="switch-line">
          <Switch checked={printMode} onCheckedChange={setPrintMode} aria-label="直接打印" />
          <small>本窗</small>
        </span>
        <button
          className="generate"
          onClick={() => {
            if (!c.words.trim()) {
              notify("请输入单词内容。");
              return;
            }
            if (printMode) send("print");
            else setModal("print");
          }}
        >
          生成字帖
        </button>
        <button className="save-btn" onClick={() => setModal("save")}>
          <Save size={15} />
          保存
        </button>
        <button
          className="open-btn"
          title="打开本地字帖或词表"
          aria-label="打开本地文件"
          onClick={() => file.current?.click()}
        >
          <FolderOpen size={28} />
        </button>
      </div>
      <input
        ref={file}
        type="file"
        className="hidden"
        accept=".ezt,.json,.txt,.csv,.tsv,.xlsx,.xls"
        onChange={(e) => {
          if (e.target.files?.[0]) openFile(e.target.files[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={imageFile}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            if (f.size > 10 * 1024 * 1024) {
              notify("图片请小于10MB。");
              return;
            }
            const r = new FileReader();
            r.onload = () => setEditing((a) => (a ? { ...a, src: String(r.result) } : a));
            r.readAsDataURL(f);
          }
          e.target.value = "";
        }}
      />
      {message && (
        <div className="toast" role="status">
          {message}
          <button onClick={() => setMessage("")} aria-label="关闭提示">
            ×
          </button>
        </div>
      )}
      <Dialog
        open={!!modal && modal !== "addition" && modal !== "style"}
        onOpenChange={(v) => !v && setModal("")}
      >
        <DialogContent className="copybook-dialog">
          <DialogTitle>
            {{
              paper: "自定义纸张",
              spreadsheet: "导入词表",
              save: "保存字帖",
              library: "本设备存档",
              print: "字帖已生成",
              help: "使用说明",
              templates: "示例内容",
              addition: "附加内容设置",
              style: "文字样式",
              reset: "恢复初始配置",
            }[modal] || "设置"}
          </DialogTitle>
          <DialogDescription className="sr-only">编辑、保存或打印你的个人字帖。</DialogDescription>
          {modal === "paper" && (
            <>
              <div className="dialog-grid">
                {["宽度（毫米）", "高度（毫米）"].map((label, i) => (
                  <label key={label}>
                    {label}
                    <input
                      aria-label={label}
                      type="number"
                      min="50"
                      max="1200"
                      value={customSize[i]}
                      onChange={(e) =>
                        setCustomSize(customSize.map((v, j) => (j === i ? e.target.value : v)))
                      }
                    />
                  </label>
                ))}
              </div>
              <button
                className="primary"
                onClick={() => {
                  try {
                    const next = validateBook({
                      ...book,
                      config: { ...book.config, pagesize: customSize.join(",") },
                    });
                    commit(next);
                    setModal("");
                  } catch (e) {
                    notify((e as Error).message);
                  }
                }}
              >
                应用纸张
              </button>
            </>
          )}
          {modal === "spreadsheet" && (
            <>
              <label>
                工作表
                <Choice
                  value={sheetIndex}
                  onChange={setSheetIndex}
                  options={sheetData.map((s, i) => [String(i), s.name])}
                  label="导入工作表"
                />
              </label>
              <p className="muted">
                按列顺序导入：单词、音标、中文、英文例句、例句翻译。每行对应一个单词。
              </p>
              <label className="switch-line">
                <Switch
                  checked={skipHeader}
                  onCheckedChange={setSkipHeader}
                  aria-label="跳过第一行"
                />
                跳过第一行（表头）
              </label>
              <pre className="import-preview">
                {sheetData[Number(sheetIndex)]?.rows
                  .slice(skipHeader ? 1 : 0, 6)
                  .map((r) => r.join(" | "))
                  .join("\n")}
              </pre>
              <button
                className="primary"
                onClick={() => {
                  try {
                    const rows = sheetData[Number(sheetIndex)]?.rows || [];
                    const words = rows
                      .slice(skipHeader ? 1 : 0)
                      .filter((r) => r.some((c) => String(c).trim()))
                      .map((r) => r.map((c) => String(c).replace(/\r?\n/g, " ")).join("|"))
                      .join("\n");
                    commit(validateBook({ ...book, config: { ...book.config, words } }));
                    setModal("");
                    notify("词表已导入。");
                  } catch (e) {
                    notify((e as Error).message);
                  }
                }}
              >
                导入词表
              </button>
            </>
          )}
          {modal === "save" && (
            <>
              <label className="dialog-field">
                保存名称
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label="保存名称"
                />
              </label>
              <p className="muted">同名设备存档会覆盖；本地文件可随时重新打开。</p>
              {downloadFile && downloadFile.name.endsWith(".ezt") && (
                <a className="download-link" href={downloadFile.url} download={downloadFile.name}>
                  下载文件：{downloadFile.name}
                </a>
              )}
              <div className="dialog-buttons">
                <button onClick={saveDevice}>保存本设备</button>
                <button className="primary" onClick={saveLocal}>
                  保存本地文件
                </button>
              </div>
            </>
          )}
          {modal === "library" && (
            <>
              <p className="muted">存档仅保存在当前浏览器中，可导出文件备份。</p>
              {saved.length ? (
                saved.map((s) => (
                  <div className="saved-item" key={s.name}>
                    <div>
                      <b>{s.name}</b>
                      <small>{s.date}</small>
                    </div>
                    <button
                      onClick={() => {
                        commit(s.book);
                        setName(s.name);
                        setModal("");
                      }}
                    >
                      打开
                    </button>
                    <button
                      aria-label={"导出" + s.name}
                      onClick={() =>
                        download(
                          s.name + ".ezt",
                          JSON.stringify({ format: "personal-copybook", version: 1, ...s.book }),
                        )
                      }
                    >
                      <Download size={17} />
                    </button>
                  </div>
                ))
              ) : (
                <p>还没有存档，点击“保存”即可添加。</p>
              )}
              <button onClick={() => file.current?.click()}>打开本地文件</button>
            </>
          )}
          {modal === "print" && (
            <>
              <p>
                共 {count} 页 ·{" "}
                {paperSizes.find((p) => p[0] === c.pagesize)?.[1] || c.pagesize + " mm"}
              </p>
              {downloadFile && downloadFile.name.endsWith(".html") && (
                <a className="download-link" href={downloadFile.url} download={downloadFile.name}>
                  下载打印文件（含字体）
                </a>
              )}
              <p className="muted">
                打印时选择对应纸张，缩放设为100%，关闭页眉和页脚。也可在打印窗口中选择“存储为PDF”。
              </p>
              <div className="dialog-buttons">
                <button
                  onClick={() => {
                    setFull(true);
                    setModal("");
                  }}
                >
                  <Maximize2 size={16} />
                  放大查看
                </button>
                <button onClick={() => send("export-html")}>下载打印文件</button>
                <button className="primary" onClick={() => send("print")}>
                  <Printer size={17} />
                  打印 / 保存PDF
                </button>
              </div>
            </>
          )}
          {modal === "help" && (
            <div className="help-content">
              <p>每行一个单词，内容按下面的顺序用英文竖线分隔：</p>
              <pre>单词|音标|中文|英文例句|例句翻译</pre>
              <p>可只输入“rule尺子”，也可输入完整音标、译文和例句。例句可继续成对追加。</p>
              <p>
                “描字次数”设置每行重复次数，超宽会自动减少；“描字行数”和“空行数量”分别控制描写行与空白练习行。
              </p>
              <p>单独一行输入 @@ 强制分页；□30,标题 插入30毫米空段；行首加反斜杠可生成整行英文。</p>
              <p>纸张边距顺序为上、右、下、左，单位毫米。行间距和字词宽度中，10表示1毫米。</p>
              <p>“加图”“加字”“加格”可放在任意位置。单击设置，拖动移动。</p>
              <p>
                所有字帖内容和上传图片都在本设备处理。通过“保存本地文件”备份，支持打开本工具的 .ezt
                文件及文本词表。
              </p>
              <p>中文和音标的默认字体也会受设备已安装字体影响。八种英文字体已随工具保存。</p>
            </div>
          )}
          {modal === "templates" && (
            <div className="template-list">
              {[
                ["原站默认示例", defaults.words],
                [
                  "基础单词",
                  "apple|/ˈæpəl/|苹果\nbanana|/bəˈnɑːnə/|香蕉\norange|/ˈɒrɪndʒ/|橙子\nwater|/ˈwɔːtə/|水",
                ],
                ["字母练习", "Aa\nBb\nCc\nDd\nEe\nFf\nGg"],
                [
                  "短句练习",
                  "\\Practice makes perfect.|熟能生巧。\n\\Where there is a will, there is a way.|有志者事竟成。",
                ],
              ].map(([title, words]) => (
                <button
                  key={title}
                  onClick={() => {
                    patch("words", words);
                    setModal("");
                  }}
                >
                  <b>{title}</b>
                  <small>{words.split("\n")[0]}</small>
                </button>
              ))}
            </div>
          )}
          {modal === "reset" && (
            <>
              <p>恢复默认纸张、字体和示例内容。当前内容可通过“撤销”恢复。</p>
              <button
                className="primary"
                onClick={() => {
                  commit(initial);
                  setModal("");
                }}
              >
                恢复默认
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Sheet
        open={modal === "addition" || modal === "style"}
        modal={false}
        onOpenChange={(v) => !v && setModal("")}
      >
        <SheetContent
          className="copybook-dialog addition-settings"
          side="right"
        >
          <SheetTitle>{modal === "style" ? "文字样式设置" : "附加功能设置"}</SheetTitle>
          <SheetDescription>调整右侧参数，左侧实时预览。</SheetDescription>
          {modal === "style" && (
            <>
              <div className="dialog-grid">
                <label>
                  字号
                  <input
                    aria-label="文字样式字号"
                    type="number"
                    min="6"
                    max="100"
                    value={styleForm.size}
                    onChange={(e) => setStyleForm({ ...styleForm, size: e.target.value })}
                  />
                </label>
                <label>
                  颜色
                  <Color
                    value={styleForm.color}
                    label="文字样式颜色"
                    onChange={(v) => setStyleForm({ ...styleForm, color: v })}
                  />
                </label>
                <label>
                  字体
                  <input
                    value={styleForm.font}
                    placeholder="本地字体名称"
                    onChange={(e) => setStyleForm({ ...styleForm, font: e.target.value })}
                  />
                </label>
                <label>
                  对齐
                  <Choice
                    label="文字对齐"
                    value={styleForm.align}
                    onChange={(v) => setStyleForm({ ...styleForm, align: v })}
                    options={[
                      ["left", "左对齐"],
                      ["center", "居中"],
                      ["right", "右对齐"],
                    ]}
                  />
                </label>
                <label>
                  粗体
                  <Switch
                    checked={styleForm.bold}
                    onCheckedChange={(v) => setStyleForm({ ...styleForm, bold: v })}
                  />
                </label>
              </div>
              <button
                className="primary"
                onClick={() => {
                  const font = styleForm.font.replace(/[<>;{}"']/g, "");
                  const css = `font-size:${Math.min(100, Math.max(6, Number(styleForm.size) || 16))}px;color:${styleForm.color || "#000000"};text-align:${styleForm.align};${font ? "font-family:" + font + ";" : ""}${styleForm.bold ? "font-weight:bold;" : ""}`;
                  commit({ ...book, moreText: { ...book.moreText, [styleKey]: css } });
                  setModal("");
                }}
              >
                应用
              </button>
            </>
          )}
          {modal === "addition" && editing && (
            <>
              <div className="dialog-grid">
                {editing.type === "image" ? (
                  <label className="span2">
                    图片<button onClick={() => imageFile.current?.click()}>选择本地图片</button>
                    {editing.src && (
                      <img className="image-thumb" src={editing.src} alt="所选图片" />
                    )}
                  </label>
                ) : editing.type === "grid" ? (
                  <label>
                    格子类型
                    <Choice
                      label="附加格子类型"
                      value={editing.grid || "english"}
                      onChange={(v) => setEditing({ ...editing, grid: v })}
                      options={[
                        ["english", "四线格"],
                        ["square", "方格"],
                      ]}
                    />
                  </label>
                ) : (
                  <label className="span2">
                    {editing.type === "qr" ? "二维码内容" : "文字内容"}
                    <textarea
                      aria-label="附加文字内容"
                      rows={3}
                      value={editing.text}
                      onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                    />
                  </label>
                )}
                {(["x", "y", "width", "height", "size", "opacity", "rotation"] as const).map(
                  (key, i) => (
                    <label key={key}>
                      {
                        [
                          "左距（mm）",
                          "上距（mm）",
                          "宽度（mm）",
                          "高度（mm）",
                          editing.type === "grid" ? "格高（mm）" : "字号（px）",
                          "透明度（%）",
                          "旋转角度",
                        ][i]
                      }
                      <input
                        aria-label={key}
                        type="number"
                        value={editing[key]}
                        onChange={(e) => setEditing({ ...editing, [key]: Number(e.target.value) })}
                      />
                    </label>
                  ),
                )}
                <label>
                  颜色
                  <Color
                    label="附加内容颜色"
                    value={editing.color}
                    onChange={(v) => setEditing({ ...editing, color: v })}
                  />
                </label>
                <label>
                  显示页面
                  <input
                    aria-label="显示页面"
                    value={editing.page}
                    placeholder="all或1,2或1-3"
                    onChange={(e) => setEditing({ ...editing, page: e.target.value })}
                  />
                </label>
                <label>
                  放在字帖后面
                  <Switch
                    checked={editing.behind}
                    onCheckedChange={(v) => setEditing({ ...editing, behind: v })}
                  />
                </label>
                <label>
                  锁定位置
                  <Switch
                    checked={!!editing.locked}
                    onCheckedChange={(v) => setEditing({ ...editing, locked: v })}
                  />
                </label>
              </div>
              <div className="dialog-buttons">
                {book.additions.some((a) => a.id === editing.id) && (
                  <>
                    <button
                      aria-label="删除附加内容"
                      onClick={() => {
                        commit({
                          ...book,
                          additions: book.additions.filter((a) => a.id !== editing.id),
                        });
                        setModal("");
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                    <button
                      aria-label="复制附加内容"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          id: crypto.randomUUID(),
                          x: editing.x + 5,
                          y: editing.y + 5,
                        })
                      }
                    >
                      <Copy size={17} />
                    </button>
                  </>
                )}
                <button
                  className="primary"
                  onClick={() => {
                    if (editing.width <= 0 || editing.height <= 0) {
                      notify("宽度和高度必须大于0。");
                      return;
                    }
                    if (editing.type === "image" && !editing.src) {
                      notify("请先选择图片。");
                      return;
                    }
                    commit({
                      ...book,
                      additions: [...book.additions.filter((a) => a.id !== editing.id), editing],
                    });
                    setModal("");
                  }}
                >
                  应用
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
