"use client";
import { useEffect, type RefObject } from "react";
import { type Copybook } from "./config";
import { validateBook } from "./io";
type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: object;
  execute: (args: unknown) => unknown;
};
export function useCopybookTools(
  current: RefObject<Copybook>,
  commit: (b: Copybook) => void,
  frame: RefObject<HTMLIFrameElement | null>,
) {
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: { registerTool: (t: Tool, o: { signal: AbortSignal }) => void };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const abort = new AbortController();
    const snapshot = () => {
      const d = frame.current?.contentDocument;
      return {
        config: current.current.config,
        moreText: current.current.moreText,
        additions: current.current.additions.map(({ src, ...a }) => ({ ...a, hasImage: !!src })),
        pages: d?.querySelectorAll(".paper").length || 0,
        text: d?.querySelector("#allpage")?.textContent?.slice(0, 2000) || "",
      };
    };
    const tools: Tool[] = [
      {
        name: "read_copybook",
        title: "读取字帖",
        description: "读取当前字帖配置、页数和预览文字。",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: () => snapshot(),
      },
      {
        name: "configure_copybook",
        title: "设置字帖",
        description:
          "批量修改单词、字体、纸张和排版配置，等待预览生成后返回页数。只修改提供的配置。",
        inputSchema: {
          type: "object",
          properties: { config: { type: "object", additionalProperties: { type: "string" } } },
          required: ["config"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        execute: async (input) => {
          const v = input as { config: Record<string, string> };
          if (!v || !v.config || typeof v.config !== "object" || Array.isArray(v.config))
            throw Error("请提供config对象。");
          if (Object.keys(v.config).some((k) => !(k in current.current.config)))
            throw Error("未知配置项。");
          const next = validateBook({
            ...current.current,
            config: { ...current.current.config, ...v.config },
          });
          const requestId = crypto.randomUUID();
          return await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              window.removeEventListener("message", done);
              reject(Error("预览生成超时"));
            }, 15000);
            const done = (e: MessageEvent) => {
              if (
                e.origin !== location.origin ||
                e.source !== frame.current?.contentWindow ||
                e.data?.requestId !== requestId
              )
                return;
              if (e.data.type === "rendered" || e.data.type === "error") {
                clearTimeout(timeout);
                window.removeEventListener("message", done);
                if (e.data.type === "error") reject(Error(e.data.text));
                else resolve({ pages: e.data.count, config: next.config });
              }
            };
            window.addEventListener("message", done);
            commit(next);
            frame.current?.contentWindow?.postMessage(
              { source: "copybook-editor", type: "render", ...next, page: 1, requestId },
              location.origin,
            );
          });
        },
      },
    ];
    for (const t of tools) {
      try {
        Promise.resolve(context.registerTool(t, { signal: abort.signal })).catch(() => {});
      } catch {}
    }
    return () => abort.abort();
  }, [current, commit, frame]);
}
