function isPhone() {
  var e = navigator.userAgent.toLowerCase();
  return !!/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(e);
}
function getParm(e) {
  for (var t = window.location.search.substring(1), r = t.split("&"), n = 0; n < r.length; n++) {
    var o = r[n].split("=");
    if (o[0] == e) return o[1];
  }
  return !1;
}
function getCookie(e) {
  var t,
    r = new RegExp("(^| )" + e + "=([^;]*)(;|$)");
  return (t = document.cookie.match(r)) ? unescape(t[2]) : null;
}
function randomNum(e, t) {
  let r = 0;
  switch (arguments.length) {
    case 1:
      r = parseInt(Math.random() * e + 1, 10);
      break;
    case 2:
      r = parseInt(Math.random() * (t - e + 1) + e, 10);
  }
  return r;
}
function wordsToArr(e) {
  if (
    ((e = e.replace(/[（]/g, "(").replace(/[）]/g, ")").replace(/@@/g, "(@@)")),
    -1 == e.indexOf("(") || -1 == e.indexOf(")"))
  )
    return e;
  let t = [],
    r = Array.from(e),
    n = !1;
  for (let e = 0; e < r.length; e++)
    "(" == r[e]
      ? ((n = !0), t.push(""))
      : ")" == r[e]
        ? (n = !1)
        : n
          ? (t[t.length - 1] += r[e])
          : t.push(r[e]);
  return t;
}
function wordsToArr1(e, t = {}) {
  let r = [],
    n = "",
    o = Array.from(e);
  for (let e = 0; e < o.length; e++) {
    let l = o[e];
    if ("@" == l && e + 1 < o.length && "@" == o[e + 1]) ((l = "@@"), e++, (n += l));
    else if (!t.hkd || "□" != l || (0 != e && "\n" != o[e - 1]))
      if (t.notoarr || "(" != l) ((l = l.replace(t.reg, "")), (n += l));
      else {
        for (n += l, l = "", e++; e < o.length && ")" != o[e];) ((l += o[e]), e++);
        n += l + o[e];
      }
    else {
      for (; e + 1 < o.length && "\n" != o[e + 1];) (e++, (l += o[e]));
      n += l;
    }
    "" !== l && r.push(l);
  }
  return { f: r, w: n };
}
function updateFjWords(e) {
  e = Array.from(e);
  let t = okwords.words ? okwords.words : null;
  ((okwords.words = []), okwords.title || (okwords.title = [["字"]]));
  let r = 0,
    n = function (n, o) {
      let l = new Array(okwords.title.length).fill("");
      if (((l[0] = n), "□" == n[0] && n.length > 1)) {
        l[0] = "□";
        let e = n.replace("□", "");
        okwords.title.length > 2
          ? (l[2] = e.replace(/^(\d+(\.\d+)?)[,，]?/, function () {
              return ((l[1] = arguments[1]), "");
            }))
          : (l[1] = e);
      } else if (t && (o < t.length || r < t.length)) {
        let a = -1;
        for (let i = 0; i < t.length; i++) {
          if (t[i][0] != n) continue;
          let s = 1;
          for (; t[i + s] && e[o + s] && t[i + s][0] === e[o + s][0];) s++;
          if (
            (a < s - 1 && ("□" != n || s > 1) && ((l = t[i].concat()), (r = i), (a = s - 1)), a > 6)
          )
            break;
        }
      }
      return l;
    };
  for (let o = 0; o < e.length; o++)
    t && t[r] && t[r][0] == e[o]
      ? (okwords.words.push(t[r].concat()), r++)
      : okwords.words.push(n(e[o], o));
  okwords.pyxz = !1;
}
function loadScript(e, t) {
  let r = document.getElementById("loadjsbox");
  if (-1 == r.innerHTML.indexOf(e)) {
    let n = document.createElement("script");
    ((n.type = "text/javascript"), (n.onload = t), (n.async = !0), (n.src = e), r.appendChild(n));
  } else t();
}
function setLocalStorage(e, t) {
  try {
    localStorage.setItem(e, t);
  } catch (r) {
    (localStorage.removeItem("bishuns"),
      localStorage.removeItem("dianzi"),
      localStorage.setItem(e, t));
  }
}
function getRGBA(e, t) {
  var r = [0, 0, 0, t];
  const n = /#(..)(..)(..)/g.exec(e);
  return (
    n && (r = [parseInt(n[1], 16), parseInt(n[2], 16), parseInt(n[3], 16)]),
    "rgba(" + r.join(",") + ", " + t + ")"
  );
}
var Dwzh = {
  dpi: 96,
  px2mm: function (e, t = 100) {
    let r = (e / this.dpi) * 25.4;
    return (t > 0 && (r = Math.round(r * t) / t), r);
  },
  mm2px: function (e, t = 1) {
    let r = (e / 25.4) * this.dpi;
    return (t > 0 && (r = Math.round(r * t) / t), r);
  },
};
