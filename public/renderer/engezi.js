function sxsg(t) {
  let i = 3.3,
    e = 2.8;
  switch (t.fonttype) {
    case "SegoeUIItalic.woff":
      ((i = 3.7), (e = 2.05));
      break;
    case "HengShuiTi1.woff":
    case "hwyHengShuiTi.woff":
      ((i = 3.9), (e = 2.2));
      break;
    case "Alibaba Sans.woff":
      ((i = 4), (e = 1.9));
      break;
    case "nxbbt.woff":
      ((i = 2.8), (e = 2.8));
      break;
    case "xuminH.woff":
      ((i = 3.9), (e = 2.4));
      break;
    case "mgt.woff":
      ((i = 2.3), (e = 3.1));
  }
  if (
    (void 0 === t.fgxxx ? (t.fgxxx = "solid") : "on" == t.fgxxx && (t.fgxxx = "dashed"), t.dwxys)
  ) {
    let i = t.dwxys.split(",");
    ((t.dwxys = i[0]),
      i[1] && (t.dwxqxjd = parseFloat(i[1])),
      i[2] && (t.dwxsdy = parseFloat(i[2])),
      i[3] && (t.dwxkd = parseFloat(i[3])),
      i[4] && (t.dwxjj = parseFloat(i[4])),
      t.dwxjj || isNaN(t.zckd) || (t.dwxjj = parseFloat(t.zckd)),
      t.dwxjj && (t.dwxjj = Dwzh.mm2px(t.dwxjj / 10, 10) + 1));
  }
  if ("string" == typeof t.xtcx) {
    let i = t.xtcx.split("-");
    (isNaN(i[0]) ? (t.xtcx = 2) : (t.xtcx = parseFloat(i[0])),
      isNaN(i[1]) || (t.nxtcx = parseFloat(i[1])));
  }
  ((t.gzSize = Dwzh.mm2px(t.gsize)),
    (t.enptop = Math.round(100 * (-t.gzSize / i + (100 * t.wzsxpy - 100))) / 100),
    (t.enfsize = (Math.round((t.gzSize / 3) * e * 100) / 100) * t.fsize),
    t.hglrnj || (t.hglrnj = 10),
    (t.enGeZi = enGeZi),
    (t.sxsg = mkhtml));
}
function enGeZi(t) {
  let i = {
    height: this.gzSize,
    width: this.contw,
    fgxxx: this.fgxxx,
    xtcx: this.xtcx || 0,
    nxtcx: this.nxtcx || 1,
    gc: this.gc,
    gc1: this.gc,
    excolor: "",
    jxcolor: this.jxcolor || "#ff3d00",
  };
  ((i = { ...i, ...t }), !i.excolor && this.excolor && (i.excolor = ` stroke="${this.excolor}"`));
  let e = Math.round((i.height / 3) * 100) / 100;
  void 0 === i.fill && this.gezifill && (i.fill = this.gezifill);
  let s = `en-${i.width}${i.height}${i.xtcx}${i.nxtcx + i.gc.replace(/[\(\), #]/g, "") + i.jxcolor.replace(/[\(\), #]/g, "")}`;
  if (
    (i.fill && (s += i.fill.replace(/[\(\), #]/g, "")), i.fgxxx && (s += i.fgxxx), !this.defsobj[s])
  ) {
    let t = `<svg width="${i.width}px" height="${i.height}px" style="display:none;"><defs><g id="${s}" style="fill:none;stroke:${i.gc};">`;
    if (
      (i.fill &&
        (t += `<rect width="${i.width}" height="${i.height}" x="0" y="0" style="stroke-width:0;fill:${i.fill};" />`),
      i.xtcx)
    ) {
      let e = i.xtcx / 2;
      t += `<path d="M0 ${e} L${i.width} ${e} M0 ${i.height - e} L${i.width} ${i.height - e}" stroke-width="${i.xtcx}" fill-opacity="0" />`;
    }
    if (i.fgxxx) {
      let s = "",
        h = "";
      (0 == i.fgxxx.indexOf("dashed")
        ? ((s = ' stroke-dasharray="3,2"'), "dashed" == i.fgxxx && (h = s))
        : 0 == i.fgxxx.indexOf("dotted") &&
          ((s = ' stroke-dasharray="0,2" stroke-linecap="round"'), "dotted" == i.fgxxx && (h = s)),
        (t += `<path d="M0 ${e} L${i.width} ${e}" stroke-width="${i.nxtcx}"${i.excolor} fill-opacity="0"${s}/>`),
        (t += `<path d="M0 ${2 * e} L${i.width} ${2 * e}" stroke-width="${i.nxtcx}" stroke="${i.jxcolor}" fill-opacity="0"${h} />`));
    }
    ((t += "</g></defs></svg>"), (this.defsobj[s] = t));
  }
  return `<use xlink:href="#${s}" x="0" y="0" class="gc" />`;
}
function mkhtml(t = "", i, e = {}) {
  let s = this.xtcx ? this.xtcx : 0,
    h = Math.round((this.gzSize / 3) * 10) / 10 + s;
  (void 0 === e.hglrnj && (e.hglrnj = this.hglrnj ? this.hglrnj : 0),
    e.width || (e.width = this.contw),
    e.height || (e.height = this.gzSize + 2 * this.xtcx),
    e.moretext || (e.moretext = "sxsg"),
    e.stylestr || (e.stylestr = ""));
  let x = { html: "", h: e.height },
    l = this.enfstyle ? "font-style: italic;" : "";
  this.enfweight && (l += "font-weight: bold;");
  let o = "";
  if (this.dwxys && this.dwxjj) {
    let t = this.dwxqxjd || 0,
      i = s,
      h = this.dwxkd || 0.5,
      x = void 0 === this.dwxsdy ? 2 : this.dwxsdy;
    ("#ffffff" == this.dwxys && ((i = -1), (x = 0)), (o = '<path d="'));
    let l = this.dwxjj + 1,
      d = t ? (e.height / 2) * Math.sin((t * Math.PI) / 180) : 0;
    for (; l <= e.width - 10;)
      ((o += `M${Math.round(10 * (l + d)) / 10} ${i} L${Math.round(10 * (l - d)) / 10} ${e.height - i}`),
        (l += this.dwxjj));
    o += `" stroke-dasharray="${x}" stroke-width="${h}" stroke="${this.dwxys}" fill="none" />`;
  }
  let d = `<svg width="${e.width}px" height="${e.height}px" style="position: absolute;${e.stylestr}">${this.enGeZi(e)}${o}</svg>`;
  if (
    ((x.html += `<div style="position: relative;text-align: left;overflow: hidden;width:${e.width}px;height:${e.height}px;">${d}<div style="line-height: 1;padding: 0 ${e.hglrnj}px;height:${Math.round((e.height / 3) * 10) / 10}px;margin:${h}px 0;font-size:${this.enfsize}px;${l}">${t}</div></div>`),
    i)
  ) {
    let t = this.hzfsize ? this.hzfsize : 18,
      s = `font-size:${t}px;`;
    this.smwznoheight &&
      this.smwzwz &&
      "sf" == this.smwzwz &&
      (s += `position: relative;top:-${t}px;`);
    let h = this.getTextStyle(e.moretext, s),
      l = "",
      o = "";
    if (
      (/justify-content:\s*center;/.test(h) || (h += "text-align: left;"), -1 !== i.indexOf("|"))
    ) {
      let t = 1,
        e = this;
      i.split("|").map((s) => {
        if ("" === s) return;
        let h = "s" + t;
        (1 == t
          ? (i = s)
          : (o += `<div class="borderbox moretext-${h}" style="${e.getTextStyle(h)}">${s}</div>`),
          t++);
      });
    }
    if (
      ((l = `<div class="kaiti moretext-${e.moretext}" style="box-sizing: border-box;line-height: 1;white-space: pre-wrap;width:${e.width}px;padding: 2px ${e.hglrnj}px;${h}">${i}${o}</div>`),
      this.smwznoheight)
    )
      l = `<div style="position: absolute;left:0;">${l}</div>`;
    else {
      const i = h.match(/font-size:\s*(\d+(?:\.\d+)?)px/);
      let e = i ? parseFloat(i[1]) : t;
      x.h += e + 4;
    }
    this.smwzwz && "xf" == this.smwzwz ? (x.html += l) : (x.html = l + x.html);
  }
  return x;
}
export { sxsg };
