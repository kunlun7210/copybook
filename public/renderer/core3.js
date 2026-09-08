function makemkgz(t = "") {
  let e = ["", "", ""];
  return (
    t &&
      isNaN(t) &&
      (t.indexOf("-") > 0
        ? ((e = t.split("-")), 2 == e.length && e.unshift(""))
        : (e = ["", "", t])),
    e
  );
}
function clHtmlText(t) {
  return " " === t
    ? "&nbsp;"
    : t
        .replace(/<script/g, "&lt;script")
        .replace(/<\/script>/g, "&lt;/script&gt;")
        .replace(
          /#_#(.*)/gm,
          (t, e) => (
            (e = e ? e.replace(" ", "&nbsp;") : "&nbsp;"),
            `<div style="width: 100%;border-width: 0 0 1px 0;border-style:inherit;border-color: inherit;">${e}</div>`
          ),
        )
        .replace(/[\n]/g, "<br>")
        .replace(/ {2,}/g, (t) => {
          let e = "";
          for (let i = 1; i < t.length; i++) e += "&nbsp;";
          return e + " ";
        })
        .replace(
          /#([0-9]+)_#/g,
          (t, e) => `<span style="border-bottom: 1px solid;padding: 0 ${e / 2}mm;"></span>`,
        );
}
function clText(t) {
  if ("string" != typeof t) return null;
  if (-1 === t.indexOf("@@")) return [textFz(t)];
  let e = t.split("@@");
  for (let t = 0; t < e.length; t++) e[t] = textFz(e[t]);
  return e;
}
function textFz(t) {
  let e = "";
  if ("string" != typeof t) return e;
  let i = t.match(/\[(.*?)\]/g);
  if (!i) return t.replace(/[ 　]/g, "&nbsp;");
  for (let t = 0; t < i.length; t++)
    ((i[t] = i[t].replace(/[ 　]/g, "&nbsp;")),
      (i[t] = i[t].replace(/[\[\]]/g, "")),
      "年月日" == i[t]
        ? (e += "<div>&emsp;&emsp;年&emsp;&emsp;月&emsp;&emsp;日</div>")
        : (e += "<div>" + i[t] + "</div>"));
  return e;
}
function createSvg(t, e = {}) {
  var i = document.createElementNS("http://www.w3.org/2000/svg", t);
  for (let t in e) i.setAttribute(t, e[t]);
  return i;
}
function getPdL(t) {
  let e = [],
    i = 0;
  for (let s in t)
    (e.push(t[s][0] + " " + t[s][1]),
      s > 0 && (i += getPosLen({ x: t[s - 1][0], y: t[s - 1][1] }, { x: t[s][0], y: t[s][1] })));
  return { d: "M " + e.join(" L "), l: i };
}
function getPosLen(t, e) {
  return parseInt(Math.sqrt(Math.pow(Math.abs(t.x - e.x), 2) + Math.pow(Math.abs(t.y - e.y), 2)));
}
function message(t, e = 3e3) {
  if (t) {
    var i = "messageBox";
    if (!document.getElementById(i)) {
      var s =
        '<div id="' +
        i +
        '" style="position: fixed;width:100%;left: 0;top: 40%;opacity: 0.8;text-align:center;display:none;z-index: 9999;"></div>';
      $("body").append(s);
    }
    var h = $("#messageBox");
    (h.html(
      '<div style="padding: 6px 9px;max-width:500px;margin:8px;display:inline-block;background-color: #000;border-radius: 3px;color: #fff;opacity: 0.7;">' +
        t +
        "</div>",
    ),
      h.fadeIn("fast", function () {
        setTimeout(function () {
          h.fadeOut("slow");
        }, e);
      }));
  }
}
function shareUrl() {
  let t = window.location.href;
  var e = document.createElement("input");
  (e.setAttribute("value", t),
    document.body.appendChild(e),
    e.select(),
    document.execCommand("copy"),
    document.body.removeChild(e),
    message("分享地址已复制到剪切板！"),
    $("#qrcode").html() || jQrcode("#qrcode", { width: 192, height: 192, text: t }),
    $("#shareEwm").show());
}
function checkFont(t) {
  let e = document.fonts.values(),
    i = !1,
    s = e.next();
  for (; !s.done && !i;) {
    let h = s.value;
    (h.family == t && (i = !0), (s = e.next()));
  }
  return i;
}
async function getJsonData(t = "", e = "", i, s = {}) {
  let h = { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" } };
  (i && (h.body = new URLSearchParams(i).toString()),
    (h = { ...h, ...s }),
    loading.mess("正在加载数据"));
  try {
    let i = await fetch(t, h);
    return await i.json();
  } catch (t) {
    message("抱歉，" + e + "数据获取失败，请联系客服处理！", 6e3);
  } finally {
    loading.hide();
  }
}
function ye_show(t, e, i = "") {
  if (1 == e.length) {
    if (-1 == t) return "生字块" == e[0];
    if ("all" == e[0]) return !0;
    if (("奇数" == e[0] || "odd" == e[0]) && t % 2 == 1) return !0;
    if (("偶数" == e[0] || "even" == e[0]) && t % 2 == 0) return !0;
    if (!isNaN(e[0]) && e[0] <= t) {
      let s = [];
      "object" == typeof i && i.zitie && i.zitie.pages
        ? (s = i.zitie.pages)
        : "string" == typeof i && (s = i.split("@@"));
      let h = t - parseInt(e[0]);
      if (h < s.length) return { wz: s[h], n: h };
    }
  }
  for (let i in e) {
    let s = e[i].toString();
    if (s == t) return !0;
    if (s.indexOf("~") > 0) {
      let e = s.split("~");
      if (t >= e[0] && (!e[1] || t <= e[1])) return !0;
    }
  }
  return !1;
}
function setSvgHtmlColor(t = "", e = {}) {
  return (
    e.stroke && (t = t.replace(/stroke="#[0-9A-Fa-f]{3,8}"/g, `stroke="${e.stroke}"`)),
    e.fill && (t = t.replace(/fill="#[0-9A-Fa-f]{3,8}"/g, `fill="${e.fill}"`)),
    URL.createObjectURL(new Blob([t], { type: "image/svg+xml;charset=utf-8" })) +
      "#svgView(preserveAspectRatio(none))"
  );
}
function isMergeShow(t) {
  if (
    2 == t.length &&
    /[：，。；、！？》】（）‘’“”]/.test(t[0]) &&
    /[“”‘’，。、：；【】（）《》！？]/.test(t[1])
  )
    return !0;
  for (let e = 0; e < t.length; e++) {
    let i = t[e].charCodeAt(0);
    if (i < 0 || i > 127) return !1;
  }
  return !0;
}
class Zitie {
  constructor(t) {
    for (const e in t)
      ((this[e] = t[e]),
        "words" != e &&
          "titlestr" != e &&
          "sysfont" != e &&
          (isNaN(this[e]) || (this[e] = 1 * this[e])));
    if ("string" == typeof this.okwords)
      try {
        this.okwords = JSON.parse(this.okwords);
      } catch (t) {
        this.okwords = JSON.parse(LZString.decompressFromUTF16(this.okwords));
      }
    if (
      ((this.gw = this.gw && !isNaN(this.gw) ? 1 * this.gw : 1),
      (this.ljj = this.ljj ? parseInt(this.ljj) / 2 : -0.5),
      this.znhjj || (this.znhjj = -this.gw),
      (this.mkgz = makemkgz(this.mkgz)),
      this.xo || (this.xo = 1),
      this.mh || (this.mh = 0),
      this.kh || (this.kh = 0),
      this.tc || (this.tc = "#cccccc"),
      this.gc || (this.gc = "#13b061"),
      this.ybzc || (this.ybzc = "#333333"),
      this.gzyj || (this.gzyj = 0),
      this.gezicolors && (this.gezicolors = this.gezicolors.split(/[，,]/)),
      this.showpageon ? isNaN(this.showpageon) && (this.showpageon = 1) : (this.showpageon = 0),
      (this.wzhxpy = 1),
      this.wzsxpy)
    )
      if (isNaN(this.wzsxpy)) {
        let t = /[,，]/;
        if (t.test(this.wzsxpy)) {
          let e = this.wzsxpy.split(t);
          ((this.wzhxpy = (100 + parseInt(e[1])) / 100),
            (this.wzsxpy = (100 + parseInt(e[0])) / 100));
        } else this.wzsxpy = 1;
      } else this.wzsxpy = (100 + parseFloat(parseFloat(this.wzsxpy).toFixed(1))) / 100;
    else this.wzsxpy = 1;
    if (void 0 === this.bjtmd) this.bjtmd = 100;
    else {
      let t = this.bjtmd - parseInt(this.bjtmd);
      t > 0 && ((this.xo = t), (this.bjtmd = parseInt(this.bjtmd)));
    }
    if (
      (this.t || (this.t = "none"),
      (this.bsmb && "on" != this.bsmb) || (this.bsmb = "#F00"),
      !this.fsize || isNaN(this.fsize) ? (this.fsize = 1) : (this.fsize = this.fsize / 100),
      this.khfsize ? (this.khfsize = this.khfsize / 100) : (this.khfsize = this.fsize),
      void 0 === this.gzhjj)
    )
      this.gzhjj = "auto";
    else {
      if (isNaN(this.gzhjj) && this.gzhjj.indexOf("-") > 0) {
        let t = this.gzhjj.split("-");
        ((this.gzhjj = t[0]), t[1] && !isNaN(t[1]) && (this.znhjj = Dwzh.mm2px(t[1] / 10, 10)));
      }
      if (isNaN(this.gzhjj) || this.gzhjj < 0 || this.gzhjj > 1500) {
        let t = parseFloat(this.gzhjj);
        (t && (this.autominhjj = t), (this.gzhjj = "auto"));
      } else
        ((this.gzhjj = Dwzh.mm2px(this.gzhjj / 10, 10)),
          this.znhjj > 0 && (this.gzhjj -= this.znhjj),
          this.gzhjj < 0 && (this.gzhjj = 0));
    }
    if (
      (("number" != typeof this.autominhjj || isNaN(this.autominhjj)) && (this.autominhjj = 30),
      void 0 !== this.yzy && isNaN(this.yzy) && -1 != this.yzy.indexOf(",")
        ? ((this.cyzy = this.yzy.split(",")),
          (this.cyzy[0] = parseInt(this.cyzy[0])),
          (this.yzy = this.cyzy[0] * this.cyzy[1]))
        : (this.yzy = 1),
      !this.ppd || (void 0 !== this.okwords && this.okwords.bimg) || this.yzy > 1)
    ) {
      let t = $(".page");
      t.length
        ? ((this.ppd = [
            parseFloat(t.css("padding-top")),
            parseFloat(t.css("padding-right")),
            parseFloat(t.css("padding-bottom")),
            parseFloat(t.css("padding-left")),
          ]),
          (this.contw = t.width()),
          (this.conth = t.height()))
        : ((this.ppd = [1, 1, 1, 1]), (this.contw = 980), (this.conth = 800));
    } else {
      ((this.ppd = this.ppd.toString().split("-")),
        isNaN(this.ppd[0]) && (this.ppd[0] = 15),
        void 0 === this.ppd[1] || isNaN(this.ppd[1])
          ? (this.ppd[1] = this.ppd[2] = this.ppd[3] = this.ppd[0])
          : void 0 === this.ppd[2] || isNaN(this.ppd[2])
            ? ((this.ppd[2] = this.ppd[0]), (this.ppd[3] = this.ppd[1]))
            : (void 0 === this.ppd[3] || isNaN(this.ppd[3])) && (this.ppd[3] = this.ppd[1]));
      let t = this.pagesize.split(",");
      ((this.contw = Dwzh.mm2px(t[0] - this.ppd[1] - this.ppd[3])),
        (this.conth = Dwzh.mm2px(t[1] - this.ppd[0] - this.ppd[2])),
        (this.ppd[0] = Dwzh.mm2px(this.ppd[0])),
        (this.ppd[1] = Dwzh.mm2px(this.ppd[1])),
        (this.ppd[2] = Dwzh.mm2px(this.ppd[2])),
        (this.ppd[3] = Dwzh.mm2px(this.ppd[3])));
    }
    if (((this.borderWidth = [0, 0, 0, 0]), this.cborder)) {
      if (((this.cborder = this.cborder.toString().split("-")), this.cborder[0].indexOf(" ") > 0)) {
        let t = this.cborder[0].split(" ");
        ((this.borderWidth[0] = this.borderWidth[2] = parseInt(t[0])),
          (this.borderWidth[1] = this.borderWidth[3] = parseInt(t[1])),
          void 0 !== t[2] && (this.borderWidth[2] = parseInt(t[2])),
          void 0 !== t[3] && (this.borderWidth[3] = parseInt(t[3])),
          (this.cborder[0] =
            this.borderWidth[0] ||
            this.borderWidth[1] ||
            this.borderWidth[2] ||
            this.borderWidth[3]));
      } else
        ((this.borderWidth[0] =
          this.borderWidth[1] =
          this.borderWidth[2] =
          this.borderWidth[3] =
          this.cborder[0] =
            isNaN(this.cborder[0]) ? 3 : parseInt(this.cborder[0])),
          void 0 !== this.cborder[1] && 0 == this.cborder[1] && (this.borderWidth[0] -= 1));
      void 0 === this.cborder[1]
        ? (this.cborder[1] = this.cborder[0] < 3 ? 3 : this.cborder[0])
        : (this.cborder[1] = parseInt(this.cborder[1]));
    } else this.cborder = [0, 0];
    ((this.gzSize = this.gsize && !isNaN(this.gsize) ? Dwzh.mm2px(this.gsize, 10) : 57),
      (this.borderpadding = [this.cborder[1], this.cborder[1], this.cborder[1], this.cborder[1]]),
      this.cborder[1] > 0 &&
        ((this.borderpadding[1] = this.borderpadding[3] = this.cborder[1] - this.ljj),
        this.ljj > this.cborder[1] &&
          ((this.borderpadding[0] = this.borderpadding[2] = this.ljj),
          (this.borderpadding[1] = this.borderpadding[3] = 0)),
        (this.borderpadding[2] -= this.znhjj),
        this.borderpadding[2] < 0 && (this.borderpadding[2] = 0)),
      this.fgwjd &&
        (this.borderpadding[1] = this.borderpadding[3] = this.borderpadding[3] + this.fgwjd / 2));
    let e = this.borderWidth[1] + this.borderWidth[3] + 2 * this.borderpadding[1];
    ((this.contw -= e),
      (this.conth -=
        this.borderWidth[0] + this.borderWidth[2] + this.borderpadding[0] + this.borderpadding[2]),
      this.khgd && !isNaN(this.khgd) && (this.khgd = Dwzh.mm2px(this.khgd, 10)),
      this.mhlk && this.mhlk >= this.n && (this.mhlk = 0),
      (this.sjzywd = this.contw + e),
      this.titlestr && (this.titlestr = clText(this.titlestr)),
      this.headcont && (this.headcont = clText(this.headcont)),
      this.footcont && (this.footcont = clText(this.footcont)),
      (this.wxwidth = 0),
      "micromessenger" == window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) &&
        (this.wxwidth = 0.1),
      (this.defsobj = {}),
      (this.geziid = Math.round(1e8 * Math.random())),
      (this.pages = []),
      this.insertPage());
    let i = $("#myfontstyle"),
      s = `.gc{stroke:${this.gc};fill:${this.gc};} .bc{border-color:${this.gc};}`;
    i.length
      ? (this.pyfontcs &&
          isNaN(this.pyfontcs) &&
          ((this.pyfontcs = this.pyfontcs.split(/[，,]/g)),
          this.pyfontcs[0] &&
            " " != this.pyfontcs[0] &&
            (s += ` .pyfont{font-family: '${this.pyfontcs[0]}';}`)),
        $("#myfontstyle").text(s))
      : $("style").eq(0).append(s);
  }
  getText(t, e) {
    let i = { html: "", h: 0 };
    if (this[t]) {
      let s = this[t].length - 1;
      e >= s ? "#空#" != this[t][s] && (i.html = this[t][s]) : (i.html = this[t][e]);
    }
    let s = " movebox";
    if ("footcont" == t) {
      let t = this.showpageon || 0,
        h = e + 1;
      if (
        (t && (t > 0 ? (h = e + t) : (h += t)),
        -1 !== i.html.indexOf("#页码#")
          ? (i.html = i.html.replace("#页码#", h))
          : -1 !== i.html.indexOf("#奇数页码#")
            ? (i.html = i.html.replace("#奇数页码#", 2 * h - 1))
            : -1 !== i.html.indexOf("#偶数页码#")
              ? (i.html = i.html.replace("#偶数页码#", 2 * h))
              : t > 0 && (i.html = '<div class="pageon">第 ' + h + " 页</div>" + i.html),
        void 0 === this.flogo)
      ) {
        s = "";
        let t = i.html ? "" : "<div></div>";
        i.html +=
          t +
          '<div style="max-height:35px;" title="普通VIP不显示本标志，高级VIP可显示您的LOGO并改变大小和位置。"><img src="/class/zitie/img/flogo.png" style="height:35px;" draggable="false"/></div>';
      }
    }
    if (i.html) {
      let e = "width:" + Dwzh.px2mm(this.sjzywd) + "mm;";
      (this.okwords &&
      this.okwords.gconfig &&
      this.okwords.gconfig[t] &&
      this.okwords.gconfig[t].style
        ? (e += this.okwords.gconfig[t].style.replace(/"/g, "'"))
        : (e += "color:" + this.gc + ";"),
        (i.html =
          '<div class="' +
          t +
          s +
          ' bc" style="' +
          e +
          'z-index:500;">' +
          clHtmlText(i.html) +
          "</div>"));
      let h = $("#temp_cont"),
        o = h.html();
      (h.html(i.html), (i.h = h.outerHeight()), h.html(o));
    }
    if ("footcont" == t) {
      let t = Math.round(this.ppd[2] - (i.h + 29));
      if (
        ((i.html = i.html.replace('style="', 'style="top:' + t + "px;")),
        t > 80 && (i.html = i.html.replace("width:" + this.sjzywd + "px;", "")),
        this.flogo)
      ) {
        let e =
          this.okwords &&
          this.okwords.gconfig &&
          this.okwords.gconfig.flogobox &&
          this.okwords.gconfig.flogobox.style
            ? this.okwords.gconfig.flogobox.style
            : "height:35px;top:" + (t - 35) + "px;float: right;";
        i.html +=
          '<img class="flogobox movebox" src="' +
          this.flogo +
          '" style="' +
          e +
          '" draggable="false"/>';
      }
      i.h > 35 ? (i.h -= 35) : (i.h = 0);
    }
    return i;
  }
  addhtml(t, e = !1) {
    if ((t.h < 0.1 || "" == t.h) && e) return !0;
    let i = this.pages[this.pages.length - 1];
    if (i.h + t.h > this.conth) {
      if (e) return !0;
      if (t.h > this.conth)
        return void message(
          `第 ${this.pages.length} 页单块内容超出页面可显示区域，请调整参数或输入内容！`,
        );
      ("auto" != this.gzhjj && (i.h -= this.gzhjj),
        this.insertPage(),
        (i = this.pages[this.pages.length - 1]));
    }
    (i.html.push(t.html), (i.h += t.h), "auto" != this.gzhjj && (i.h += this.gzhjj));
  }
  getDefsHtml() {
    let t = "";
    for (let e in this.defsobj) t += this.defsobj[e];
    return t;
  }
  insertPage() {
    let t = this.pages.length,
      e = { html: [], h: 0 };
    ((e.titlestr = this.getText("titlestr", t)),
      (e.headcont = this.getText("headcont", t)),
      (e.footcont = this.getText("footcont", t)),
      (e.h = e.headcont.h + e.titlestr.h + e.footcont.h),
      this.dzgezi && (e.h += this.dzgezi.h),
      (this.thfdh = e.h),
      this.pages.push(e));
  }
  show(t = { html: "", h: 0 }, e = !1) {
    if (this.tcwy && t.h > 0)
      for (
        t.noclass || "function" != typeof this.addhanbox || (t.html = this.addhanbox(t.html));
        !this.addhtml(t, !0);
      );
    let i = "",
      s = this.okwords.gconfig;
    if (s && s.zts)
      for (let t = 0; t < s.zts.length; t++)
        s.zts[t] &&
          (s.zts[t].d && (i += s.zts[t].d),
          s.zts[t].zitie && (this.defsobj = { ...this.defsobj, ...s.zts[t].zitie.defsobj }));
    let h = ' style="margin:0 auto;background: rgb(255,255,255,' + this.bjtmd + "%);",
      o = "";
    (this.cborder[0] > 0 || this.borderpadding[0] > 0) &&
      ((o += `padding:${this.borderpadding.join("px ")}px;border-width:${this.borderWidth.join("px ")}px; border-style: solid;`),
      this.cborder[2] &&
        !isNaN(this.cborder[2]) &&
        (o += "border-radius:" + this.cborder[2] + "px;"));
    let r = "";
    if (this.yzy > 1 && this.pages.length % this.yzy > 0)
      for (let t = this.yzy - (this.pages.length % this.yzy); t > 0; t--)
        this.pages.push({
          html: [],
          h: 0,
          footcont: { html: "", h: 0 },
          headcont: { html: "", h: 0 },
          titlestr: { html: "", h: 0 },
        });
    this.yulian > this.pages.length && (this.yulian = this.pages.length);
    for (let t = this.yulian ? (this.yulian - 1) * this.yzy : 0; t < this.pages.length; t++) {
      let n = this.pages[t],
        l = this.conth - n.titlestr.h - n.headcont.h - n.footcont.h,
        d = "zitiebox-" + t,
        a =
          "height:" +
          (l +
            this.borderWidth[0] +
            this.borderWidth[2] +
            this.borderpadding[0] +
            this.borderpadding[2]) +
          "px;",
        p = h;
      if ((n.html.length > 0 && (p += o), 3 == e && (this.sysfont || "楷体" != this.fonttype))) {
        let t = this.getFontName(),
          e = this.secondfont ? `'${t}',${this.secondfont}` : `'${t}'`;
        p += `font-family:${e};`;
      }
      let g = "";
      if (this.yzyns && !isNaN(this.yzyns)) {
        let e = this.yzyns;
        (this.cyzy && 3 == this.cyzy[0]
          ? t % 3 == 2
            ? (e = -e)
            : t % 3 == 1 && (e = 0)
          : t % 2 != 0 && (e = -e),
          0 != e && (g = "left: " + e + "mm;"));
      }
      if (this.yzynszx && !isNaN(this.yzynszx) && this.cyzy && this.cyzy[1] > 1) {
        let e = t % (this.cyzy[0] * this.cyzy[1]);
        e < this.cyzy[0]
          ? (g += `top: ${this.yzynszx}mm;`)
          : (2 == this.cyzy[1] || e >= 2 * this.cyzy[0]) && (g += `top: ${-this.yzynszx}mm;`);
      }
      if ((g && (g = ' style="position: relative;' + g + '"'), s && s[d] && s[d].style)) {
        let t = s[d].style.split(";");
        for (let e in t)
          (-1 == t[e].indexOf("left:") && -1 == t[e].indexOf("top:")) || (p += t[e] + ";");
      }
      let c = '<div class="' + d + ' movebox borderbox bc"' + p + '">';
      ((r +=
        '<div class="page"' +
        g +
        ">" +
        n.titlestr.html +
        n.headcont.html +
        '<div class="cont kaiti" style="z-index:100;position: relative;' +
        a +
        '">'),
        this.dzgezi && n.html.push(this.dzgezi.html));
      let f =
        "auto" != this.gzhjj
          ? this.gzhjj
          : parseInt(
              ((l - (n.h - n.titlestr.h - n.headcont.h - n.footcont.h)) / (n.html.length - 1)) * 10,
            ) / 10;
      f > this.autominhjj && "auto" == this.gzhjj ? (f = 6) : f < 1 && (f = 0);
      for (let t in n.html)
        ((c += n.html[t]),
          t < n.html.length - 1 && (c += '<div style="height:' + f + 'px;clear: both;"></div>'));
      if (((c += "</div>"), 3 == e)) return c;
      r += c;
      let m = Math.ceil((t + 1) / this.yzy);
      (((t + 1) % this.yzy != 0 && t + 1 != this.pages.length) || (r += this.getYmzt(m)),
        (r += "</div>"));
      let y = this.pages.length;
      if (
        (this.showpageon &&
          (this.showpageon < 0
            ? (y += this.showpageon)
            : (y = this.pages.length + this.showpageon - 1)),
        (r += n.footcont.html.replace("#总页#", y)),
        (r += "</div>"),
        (t + 1) % this.yzy == 0 &&
          (this.yulian && (r += this.biaochi()),
          (i += '<div class="paper"' + this.getPskl(m) + ">" + r + this.getYmys(m) + "</div>"),
          (r = ""),
          this.yulian))
      )
        break;
    }
    let n = Math.ceil(this.pages.length / this.yzy);
    (r &&
      (this.yulian && (r += this.biaochi()),
      (i += '<div class="paper"' + this.getPskl(n) + ">" + r + this.getYmys(n) + "</div>")),
      (i = this.getDefsHtml() + i),
      e ? $("#allpage").append(i) : $("#allpage").html(i),
      this.yulian
        ? ((window.parent.ylPage.s.count = n), window.parent.ylPage.r(window.parent.ylPage.s))
        : $("#ztys").text("共 " + n + " 页"),
      this.setFont(),
      this.fgwjd &&
        ($(".cont").css("transform", "skewX(" + this.fgwjd + "deg)"),
        $("svg").css("transform", "skewX(-" + this.fgwjd + "deg)")),
      void 0 === this.flogo &&
        (window.onbeforeprint = function () {
          $(".paper").each(function () {
            let t = $(this).find(".footcont div img:first");
            ("/class/zitie/img/flogo.png" != t.attr("src") || t.is(":hidden") || t.height() < 35) &&
              $(this).find(".cont").hide();
          });
        }));
  }
  biaochi() {
    if (!this.toolbc) return "";
    let t = this.pagesize.split(","),
      e = [0, 0, 0, 0],
      i = "";
    this.papercx &&
      (isNaN(this.papercx)
        ? -1 != this.papercx.indexOf("-") &&
          ((e = this.papercx.split("-")),
          2 == e.length && ((e[2] = e[0]), (e[3] = e[1])),
          (e[0] = parseInt(e[0])),
          (e[1] = parseInt(e[1])),
          (e[2] = parseInt(e[2])),
          (e[3] = parseInt(e[3])))
        : (e[0] = e[1] = e[2] = e[3] = parseInt(this.papercx)),
      (i =
        '<rect width="' +
        t[0] +
        'mm" height="' +
        t[1] +
        'mm" x="0" y="0" style="stroke:#f00;stroke-width:0.5;fill:none;"></rect>'));
    let s =
      '<svg width="' +
      t[0] +
      'mm" height="' +
      t[1] +
      'mm" style="position: absolute;left: ' +
      e[3] +
      "mm;top: " +
      e[0] +
      'mm;user-select: none;">';
    s += '<g style="stroke:#999;stroke-width:0.5px;opacity: 0.5;fill:#999;font-size: 12px;">';
    for (let e = 10; e < t[0]; e += 10)
      ((s += '<text x="' + e + 'mm" y="4mm" style="stroke:none;">' + e / 10 + "</text>"),
        (s +=
          '<text x="' +
          e +
          'mm" y="' +
          (t[1] - 4) +
          'mm" style="stroke:none;">' +
          e / 10 +
          "</text>"),
        (s += '<line x1="' + e + 'mm" y1="8mm" x2="' + e + 'mm" y2="' + (t[1] - 6) + 'mm"/>'));
    for (let e = 10; e < t[1]; e += 10)
      ((s += '<text x="4mm" y="' + e + 'mm" style="stroke:none;">' + e / 10 + "</text>"),
        (s += '<line x1="8mm" y1="' + e + 'mm" x2="' + t[0] + 'mm" y2="' + e + 'mm"/>'));
    ((s += "</g>"), (s += '<g style="stroke:#999;stroke-width:0.5px;opacity: 0.2;">'));
    for (let e = 15, i = t[0] - 10; e < i; e += 10)
      s += '<line x1="' + e + 'mm" y1="10mm" x2="' + e + 'mm" y2="' + (t[1] - 7) + 'mm"/>';
    for (let e = 15, i = t[1] - 10; e < i; e += 10)
      s += '<line x1="10mm" y1="' + e + 'mm" x2="' + t[0] + 'mm" y2="' + e + 'mm"/>';
    return ((s += "</g>"), (s += i + "</svg>"), s);
  }
  getPskl(t) {
    if (!this.okwords.bimgs) return "";
    for (let e in this.okwords.bimgs)
      if (e.indexOf("-" + t + "-") > 0)
        return ' style="background-image: url(' + this.okwords.bimgs[e] + ');"';
    return "";
  }
  getYmys(t) {
    if (!this.okwords.gconfig) return "";
    let e = "",
      i = this;
    for (let s in this.okwords.gconfig) {
      let h = this.okwords.gconfig[s];
      if (!h.ye || -1 != s.indexOf("html-")) continue;
      let o = -1 == h.style.indexOf("z-index") ? "z-index:500;" : "";
      if (
        (-1 == h.style.indexOf("left:") && (o += "left: 0;"),
        -1 == h.style.indexOf("top:") && (o += "top: 0;"),
        (h.style = h.style.replace(
          /(width|height|top|left):\s*(-?)(\d+|\d+\.\d*|\.\d+)gz;/g,
          function () {
            let t = 0,
              e = parseFloat(arguments[3]);
            switch (
              ("-" != arguments[2] || ("left" != arguments[1] && "top" != arguments[1]) || (e = -e),
              arguments[1])
            ) {
              case "width":
                t = i.getRolWidth(e, -2 * i.ljj);
                break;
              case "left":
                ((t = i.getRolWidth(e)),
                  i.ljj > 0
                    ? ((t += 0.5), h.wd || (t += i.ljj))
                    : h.wd
                      ? (t -= i.ljj)
                      : (t += i.ljj));
                break;
              case "height":
                t = e * i.getRowHeight() - i.znhjj;
                break;
              case "top":
                t = e * i.getRowHeight();
            }
            return `${arguments[1]}: ${t}px;`;
          },
        )),
        h.wz)
      ) {
        let i = !1;
        if (this.yulian && "预览" == h.ye[0]) {
          if (-1 == t) continue;
          i = !0;
        } else i = ye_show(t, h.ye, h.wz);
        if (!1 === i) continue;
        ((i = !0 === i ? h.wz : i.wz),
          -1 != h.style.indexOf("text-indent") &&
            (i =
              '<p style="margin: 0;">' +
              i.replace(/\n\n/g, '</p><p style="margin: 0;">') +
              "</p>"));
        let r = clHtmlText(i),
          n = r.match(/#(-?[0-9]*)奇*偶*数*页码#/);
        (n && "" != n[1] ? ((n = parseInt(n[1]) - 1 + t), n[1] < 1 && (n += 1)) : (n = t),
          (r = r
            .replace(/#-?[0-9]*页码#/, n)
            .replace(/#-?[0-9]*奇数页码#/, 2 * n - 1)
            .replace(/#-?[0-9]*偶数页码#/, 2 * n)));
        let l = -1 == h.style.indexOf("border-color:") ? " bc" : "";
        if (-1 == h.style.indexOf("font-size:")) {
          let t = this.enfsize
            ? this.enfsize
            : Math.round((this.hzgSize - this.hzgSize / 6) * this.fsize);
          if (((h.style += "font-size: " + t + "px;"), -1 == h.style.indexOf("letter-spacing:"))) {
            let e =
              this.enfsize && void 0 !== this.lspacing
                ? this.lspacing + "px;"
                : Dwzh.px2mm(this.hzgSize - t + 2 * this.ljj, 100) + "mm;";
            h.style += "letter-spacing: " + e;
          }
          if (-1 == h.style.indexOf("line-height:")) {
            let e = this.gzSize + this.znhjj;
            ("function" == typeof this.getRowHeight &&
              ((r = r.replace(/&nbsp;/g, "&emsp;")), (e = this.getRowHeight())),
              (h.style += "line-height: " + Math.round((e / t) * 1e3) / 1e3 + ";"));
          }
        }
        if (-1 != h.style.indexOf("writing-mode: inherit;")) {
          let t = r.split("<br>");
          ((r = `<div style="text-align:center;width: 100%;position: absolute;">${t[0]}</div>`),
            t[1] &&
              (r += `<div style="text-align:center;height: 100%;writing-mode: vertical-lr;position: absolute;">${t[1]}</div>`),
            t[2] &&
              (r += `<div style="text-align:center;height: 100%;writing-mode: vertical-rl;right:0;position: absolute;">${t[2]}</div>`),
            t[3] &&
              (r += `<div style="text-align:center;width: 100%;bottom:0;position: absolute;">${t[3]}</div>`));
        }
        (-1 != h.style.indexOf("justify-content: space-between;") &&
          (r = "<span>" + r.split("<br>").join("</span><span>") + "</span>"),
          (e +=
            '<div class="' +
            s +
            " movebox makehtmlbox" +
            l +
            '" style="' +
            h.style.replace(/"/g, "'") +
            o +
            '">' +
            r +
            "</div>"));
      } else if (-1 != s.indexOf("img-")) {
        if (!1 === ye_show(t, h.ye)) continue;
        let i = h.src || "";
        if (!i) {
          let t = this.okwords.gconfig.zts[h.n];
          "string" == typeof t
            ? (i = t)
            : "object" == typeof t &&
              (i = t.svghtml && (h.stroke || h.fill) ? setSvgHtmlColor(t.svghtml, h) : t.src || "");
        }
        i && (e += '<img class="' + s + ' movebox" src="' + i + '" style="' + h.style + o + '" />');
      } else if (h.wd) {
        let i = ye_show(t, h.ye, h.pars.wzwords);
        if (!1 === i) continue;
        ((i = !0 === i ? 0 : i.n), (e += mobans.mkjiagehtml(h, i, s, o, this)));
      } else if (-1 != s.indexOf("ewm-")) {
        let i = ye_show(t, h.ye, h.ewmtext);
        if (!1 === i) continue;
        if (((i = !0 === i ? h.ewmtext : i.wz), h.isbs && (i = this.dhurl(i)), !h.src)) {
          let t = $("#tempewmdiv");
          (t.length < 1
            ? ($("body").append('<div id="tempewmdiv" style="display:none;"></div>'),
              (t = $("#tempewmdiv")))
            : t.html(""),
            h.color || (h.color = "#000000"),
            t.qrcode({ text: utf16to8(i), foreground: h.color, correctLevel: 1 }));
          let e = $("#tempewmdiv canvas").eq(0);
          h.src = e[0].toDataURL("image/png");
        }
        e += '<img class="' + s + ' movebox" src="' + h.src + '" style="' + h.style + o + '" />';
      }
    }
    if (e && -1 != t) {
      let i = "";
      if (this.yzyns && 1 == this.yzy) {
        let e = this.yzyns;
        if ((t % 2 == 0 && (e = e < 0 ? Math.abs(e) : -e), this.papercx))
          if (isNaN(this.papercx)) {
            let t = this.papercx.split("-");
            t[3] && !isNaN(t[3]) && (e += parseFloat(t[3]));
          } else e += this.papercx;
        i = ' style="left: ' + e + 'mm;"';
      }
      e = '<div class="ymysbox kaiti"' + i + ">" + e + "</div>";
    }
    return e;
  }
  getYmzt(t) {
    if (!this.okwords.gconfig) return "";
    let e = "",
      i = this.okwords.gconfig;
    for (let s in i) {
      let h = this.okwords.gconfig[s];
      if (-1 == s.indexOf("html-") || !h.ye || !ye_show(t, h.ye, i.zts[h.n])) continue;
      let o = "";
      if (i.zts[h.n].zitie) {
        let e = 0,
          s = i.zts[h.n].zitie;
        if (1 == h.ye.length && !isNaN(h.ye[0])) {
          let i = parseInt(h.ye[0]);
          s.pages[t - i] && (e = t - i);
        }
        s.pages[e] && ((s.yulian = e + 1), (o = s.show("", 3)));
      } else o = i.zts[h.n].h;
      o &&
        ((e += `<div class="${s} movebox" style="z-index:1000;${h.style}">`),
        (o = o.replace(/ fj-data="[^"]*"/g, "")),
        h.gezicolor
          ? (e += o.replaceAll('bc" style="', 'bc" style="border-color: ' + h.gezicolor + ";"))
          : (e += o),
        (e += "</div>"));
    }
    return e;
  }
  setFont(t) {
    let e = this.sysfont
        ? this.sysfont
        : this.fonttype && this.fonttype.indexOf("/") > 0
          ? this.fonttype.split("/")[2]
          : "",
      i = this,
      s = function (e, s) {
        (e &&
          ((e = i.secondfont ? `'${e}',${i.secondfont}` : `'${e}'`),
          $(".cont").css({ "font-family": e }),
          $(".ymysbox").css({ "font-family": e })),
          s || "function" != typeof t || t());
      };
    if (e || !this.fonttype) return void s(e);
    if ("楷体" == this.fonttype)
      if (!this.bsxs || this.loadkaiti) this.fonttype = "文鼎ＰＬ简中楷.woff";
      else if (this.okwords.gconfig)
        for (let t in this.okwords.gconfig)
          if (-1 != t.indexOf("text-") || -1 != t.indexOf("html-")) {
            this.fonttype = "文鼎ＰＬ简中楷.woff";
            break;
          }
    if ("楷体" == this.fonttype) return void s();
    let h = this.fonttype.split("."),
      o = checkFont(h[0]);
    if (("文鼎ＰＬ简中楷" != h[0] && s(h[0], !o), !o && window.FontFace)) {
      let t = new FontFace(h[0], 'local("' + h[0] + '"),url("/font/' + this.fonttype + '")');
      loading.mess("正在加载字体文件");
      let e = setTimeout(function () {
        loading.obj.is(":visible") &&
          (loading.hide(),
          message("加载字体超时了！如您的网络正常，请使用新版Edge或Chrome浏览器。", 6e3));
      }, 15e3);
      t.load().then(
        (t) => {
          (document.fonts.add(t), clearTimeout(e), loading.hide(), s());
        },
        (t) => {
          (loading.hide(), message(t, 5e3));
        },
      );
    }
  }
  getTextStyle(t = "", e = "") {
    let i = "";
    return (
      (t = "moretext-" + t),
      (i =
        t && this.okwords && this.okwords.moreText && this.okwords.moreText[t]
          ? this.okwords.moreText[t].replace(/font-family:\s*([^;]+);/, (t, e) => {
              if (-1 == e.indexOf("'") && -1 != e.indexOf(" ")) {
                let t = e.split(",");
                for (let e = 0; e < t.length; e++)
                  -1 != t[e].indexOf(" ") && (t[e] = `'${t[e].trim()}'`);
                return `font-family: ${t.join(",")};`;
              }
              return t;
            })
          : e),
      i
    );
  }
  getgzys(t, e, i, s = {}) {
    let h;
    h =
      this.okwords &&
      this.okwords.zuhegezi &&
      this.okwords.zuhegezi.hl &&
      this.okwords.zuhegezi.hl[t] &&
      this.okwords.zuhegezi.hl[t][e] &&
      this.okwords.zuhegezi.hl[t][e][i]
        ? JSON.parse(JSON.stringify(this.okwords.zuhegezi.hl[t][e][i]))
        : {};
    for (let t in s) h[t] = s[t];
    return h;
  }
  crkd(t, e) {
    if (void 0 === this.flogo) return;
    let i =
        !this.khgd || isNaN(this.khgd) || this.khgd < 0 || this.khgd > this.conth
          ? this.hzgSize || this.gzSize
          : this.khgd,
      s = "";
    e
      ? (s = `width:${e}px;`)
      : "function" == typeof this.getRolWidth &&
        this.mbpars_n &&
        (s = `width:${this.getRolWidth(this.n, 1)}px;`);
    let h = "";
    if (void 0 !== t) {
      let e =
        "line-height:1.2;width:100%;height:100%;" +
        this.getTextStyle("kdtext", `font-size: 18px;color:${this.ybzc};`);
      if (isNaN(t))
        h = t.replace("□", "").replace(/^(\d+(\.\d+)?)[,，]?/, function () {
          return ((i = Dwzh.mm2px(parseFloat(arguments[1]), 10)), "");
        });
      else if (
        this.okwords &&
        Array.isArray(this.okwords.words) &&
        Array.isArray(this.okwords.words[t]) &&
        "□" == this.okwords.words[t][0]
      ) {
        let e = this.okwords.words[t];
        ((h = e[1].toString().replace(/^(\d+(\.\d+)?)[,，]?/, function () {
          return ((i = Dwzh.mm2px(parseInt(arguments[1]), 10)), "");
        })),
          e[2] && (h = e[2]));
      }
      h && (h = `<div class="moretext-kdtext bc" style="${e}">${clHtmlText(h)}</div>`);
    }
    let o = this.cborder[0] && !this.borderpadding[1] ? -1 : this.ljj;
    this.addhtml({
      html: `<div style="height:${i}px;${s}margin: 0 ${o}px ${this.znhjj}px ${o}px;">${h}</div>`,
      h: i - this.znhjj,
    });
  }
  getFontName() {
    return this.sysfont
      ? this.sysfont
      : this.fonttype
        ? this.fonttype.indexOf("/") > 0
          ? this.fonttype.split("/")[2]
          : this.fonttype.split(".")[0]
        : "楷体";
  }
  async readDbData(t, e, i = "getbishun") {
    let s = this,
      h = "font",
      o = "bishuns" != e && s.fonttype ? s.fonttype.replace("/fonts/", "") : "楷体";
    "fjdata" == e && ((h = "fjdata"), s.uid && s.sysfont && (o = s.uid + s.sysfont));
    let r = await s.openDB(o);
    return (
      s[e] || (s[e] = {}),
      new Promise((o, n) => {
        let l = { words: "" },
          d = function () {
            let t = {},
              n = s.mobanid || s.mobanfile;
            if (l.words && !s.reload) {
              let i = localStorage.getItem("localword");
              i &&
                ((t = JSON.parse(i)),
                t[n + e] && -1 != t[n + e].w.indexOf(l.words) && (l.words = ""));
            }
            if (l.words) {
              ("bishuns" == e
                ? (l.bishuns = !0)
                : "myfont" == e
                  ? (l.myfontname = s.fonttype)
                  : (l.fontname = s.getFontName()),
                loading.mess("正在加载数据..."));
              let d = {
                url: "/data/" + i + ".php",
                data: l,
                type: "POST",
                dataType: "JSON",
                success: function (i) {
                  let o = i[e];
                  ((s[e] = { ...s[e], ...o }),
                    "fjdata" != e && s.syxx && "ydx" == s.syxx && s.dianzisc());
                  const d = r.transaction(h, "readwrite");
                  let a = d.objectStore(h);
                  for (let t in o) a.put({ zi: t, v: o[t] });
                  i.nozi &&
                    message("（" + i.nozi + "）字的数据会尽快完善，记得您明天再来试试！", 4e3);
                  let p = new Date().getTime(),
                    g = {};
                  for (let e in t) p - t[e].t < 432e5 && (g[e] = t[e]);
                  ((g[n + e] = { w: l.words, t: p }),
                    localStorage.setItem("localword", JSON.stringify(g)));
                },
                error: function (t, e, i) {
                  message(
                    "抱歉，数据获取失败，请联系客服处理！status：" + t.status + "；msg：" + i,
                    6e3,
                  );
                },
                complete: function () {
                  (loading.hide(), r.close(), o());
                },
              };
              ("getfjdata" == i && (d.data.uid = s.uid), $.ajax(d));
            } else (r.close(), o());
          };
        if (void 0 !== s.reload && (1 == s.reload || (2 == s.reload && "fjdata" == e)))
          ((l.words = t), d());
        else {
          const i = r.transaction(h);
          let o = i.objectStore(h);
          ((i.oncomplete = () => {
            d();
          }),
            (i.onerror = (t) => {
              n(t);
            }));
          let a = wordsToArr(t);
          (Array.isArray(a) || (a = Array.from(t)),
            a.forEach((t) => {
              o.get(t).onsuccess = (i) => {
                i.target.result
                  ? (s[e][t] = i.target.result.v)
                  : (l.words += t.length > 1 ? `(${t})` : t);
              };
            }));
        }
      })
    );
  }
  openDB(t) {
    if (indexedDB)
      return new Promise((e, i) => {
        const s = indexedDB.open(t, 1);
        ((s.onerror = function (t) {
          (console.error("Database error: ", t.target.errorCode), i(t));
        }),
          (s.onsuccess = function (t) {
            e(t.target.result);
          }),
          (s.onupgradeneeded = function (t) {
            let e = t.target.result;
            (e.objectStoreNames.contains("font") || e.createObjectStore("font", { keyPath: "zi" }),
              e.objectStoreNames.contains("fjdata") ||
                e.createObjectStore("fjdata", { keyPath: "zi" }));
          }));
      });
    alert("当前浏览器无法正常使用本程序，请更换Chrome、Edge浏览器使用！");
  }
  async getBishun(t) {
    let e = this;
    (localStorage.removeItem("bishuns"),
      localStorage.removeItem("dianzi"),
      localStorage.removeItem("fjdata"));
    let i = e.okwords && e.okwords.cds ? e.okwords.cds : e.words || "";
    if (e.okwords && e.okwords.gconfig)
      for (let t in e.okwords.gconfig)
        -1 != t.indexOf("gezi-") &&
          ((i += e.okwords.gconfig[t].pars.wzwords),
          e.okwords.gconfig[t].pars.bsxs && (e.bsxs = 1));
    ((i = i
      .replace(/[（]/g, "(")
      .replace(/[）]/g, ")")
      .replace(/[□\/\?\*\: 　]/g, "")),
      i &&
        (e.uid && e.fjtype && (await e.readDbData(i, "fjdata", "getfjdata")),
        !e.bsxs || (void 0 !== e.syzdbh && "on" == e.syzdbh) || (await e.readDbData(i, "bishuns")),
        e.fonttype && e.fonttype.indexOf("/") > 0 && (await e.readDbData(i, "myfont")),
        e.glbszt()),
      "function" == typeof t && t());
  }
  glbszt() {
    this.fonttype &&
      this.fonttype.indexOf("/") > 0 &&
      this.syzdbh &&
      this.myfont &&
      ("on" == this.syzdbh
        ? (this.bishuns = this.myfont)
        : (this.bishuns = { ...this.bishuns, ...this.myfont }));
  }
  zygs(t = "", e = 16) {
    let i = 0,
      s = 0;
    t = t.toString();
    let h = t.match(/[\u4e00-\u9fa5]/g);
    h && (i = h.length * e);
    let o = t.replace(/[^\w\s]+/gi, "");
    return (o && (s = o.length * (0.5 * e)), Math.ceil((i + s) / this.gzSize));
  }
  dhurl(t = "") {
    let e = this.uewmlink ? this.uewmlink : `https://${window.location.hostname}/dh`;
    return (this.uid ? (e += "?u=" + this.uid + "&z=") : (e += "?z="), e + t);
  }
  getGeziColor(t = "", e = 0) {
    if (t && this.gezicolors) {
      e > 0 && (e %= this.gezicolors.length);
      let i = this.gezicolors[e] || this.gc;
      t = t
        .replaceAll(this.gc, i)
        .replaceAll("#000001", i)
        .replace(/class="gc"/g, 'stroke="' + i + '"')
        .replace(/ bc" style="/g, '" style="border-color: ' + i + ";");
    }
    return t;
  }
}
var loading = {
  obj: null,
  mess: function (t) {
    null === this.obj && (this.obj = $("#loadingFont"));
    var e = '<div style="margin:30vh 0;"><img src="/js/loading.gif" /><br />' + t + "...</div>";
    (this.obj.html(e), this.obj.show());
  },
  hide: function () {
    this.obj && this.obj.hide();
  },
};
