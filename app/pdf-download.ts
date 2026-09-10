/** Reuse a completed PDF even if the browser blocks its automatic download. */
export function createPdfDownload(generate: () => Promise<string>, download: (url: string) => void) {
  let cached: { key: string; url: string } | null = null;
  let busy = false;
  return async (key: string, setLoading: (loading: boolean) => void) => {
    if (busy) return;
    if (cached?.key === key) {
      download(cached.url);
      return;
    }
    busy = true;
    setLoading(true);
    try {
      const url = await generate();
      cached = { key, url };
      download(url);
    } finally {
      busy = false;
      setLoading(false);
    }
  };
}

export function downloadPdfFile(url: string) {
  // The exporter already returns a PDF data URL. Keep it intact for retries;
  // no object URL is allocated and no premature revocation can break a download.
  const link = document.createElement("a");
  link.href = url;
  link.download = "我的字帖.pdf";
  link.style.display = "none";
  document.body.appendChild(link);
  try { link.click(); } finally { link.remove(); }
}
