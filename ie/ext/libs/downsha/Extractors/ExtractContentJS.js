/**
 * @author: INA Lintaro
 * @copyright (C) 2009 INA Lintaro / Hatena. All rights reserved.
 * @copyright (C) 2007/2008 Nakatani Shuyo / Cybozu Labs Inc. All rights reserved.
 * @desc: hatena content extract algorithm
 */

if (typeof ExtractContentJS == "undefined") {
    var ExtractContentJS = {};
}
if (typeof ExtractContentJS.Lib == "undefined") {
    ExtractContentJS.Lib = {};
}
ExtractContentJS.Lib.Util = (function () {
    var a = {};
    a.BenchmarkTimer = function () {
        var c = function () {
                var f = new Date();
                var e = 0;
                e = f.getHours();
                e = e * 60 + f.getMinutes();
                e = e * 60 + f.getSeconds();
                e = e * 1000 + f.getMilliseconds();
                return e;
            };
        var d = function () {
                var e = {
                    elapsed: 0
                };
                e.reset = function () {
                    e.elapsed = 0;
                    return e;
                };
                e.start = function () {
                    e.msec = c();
                    return e;
                };
                e.stop = function () {
                    e.elapsed += c() - e.msec;
                    return e;
                };
                return e.start();
            };
        var b = {
            timers: {}
        };
        b.get = function (e) {
            if (!b.timers[e]) {
                b.timers[e] = new d();
            }
            return b.timers[e];
        };
        b.reset = function (e) {
            return b.get(e).reset();
        };
        b.start = function (e) {
            return b.get(e).start();
        };
        b.stop = function (e) {
            return b.get(e).stop();
        };
        return b;
    };
    a.Token = function (e) {
        var d = {
            hiragana: /[\u3042-\u3093\u304C-\u307C\u3041-\u3087\u308E\u3063\u30FC]/,
            katakana: /[\u30A2-\u30F3\u30AC-\u30DC\u30A1-\u30E7\u30EE\u30C3\u30FC]/,
            kanji: {
                test: function (f) {
                    return "\u4E00" <= f && f <= "\u9FA0" || f === "\u3005";
                }
            },
            alphabet: /[a-zA-Z]/,
            digit: /[0-9]/
        };
        var c = function (f) {
                var g = {};
                for (var h in d) {
                    if (d[h].test(f)) {
                        g[h] = d[h];
                    }
                }
                return g;
            };
        var b = {
            first: c(e.charAt(0)),
            last: c(e.charAt(e.length - 1))
        };
        b.isTokenized = function (h, g) {
            var i = h.length ? h.charAt(h.length - 1) : "";
            var j = g.length ? g.charAt(0) : "";
            var f = function (k, m) {
                    if (k.length) {
                        for (var l in m) {
                            if (m[l].test(k)) {
                                return false;
                            }
                        }
                    }
                    return true;
                };
            return f(i, b.first) && f(j, b.last);
        };
        return b;
    };
    a.inherit = function (e, b) {
        var c = e || {};
        for (var d in b) {
            if (typeof c[d] == "undefined") {
                c[d] = b[d];
            }
        }
        return c;
    };
    a.countMatch = function (c, b) {
        return c.split(b).length - 1;
    };
    a.countMatchTokenized = function (j, h) {
        var f = 0;
        var e = null;
        var c = new a.Token(h);
        var g = j.split(h);
        var b = g.length;
        for (var d = 0; d < b; d++) {
            if (e && c.isTokenized(e, g[d])) {
                f++;
            }
            e = g[d];
        }
        return f;
    };
    a.indexOfTokenized = function (f, e) {
        var c = f.indexOf(e);
        if (c >= 0) {
            var b = new a.Token(e);
            var d = c > 1 ? f.substr(c - 1, 1) : "";
            var g = f.substr(c + e.length, 1);
            if (b.isTokenized(d, g)) {
                return c;
            }
        }
        return -1;
    };
    a.dump = function (c) {
        if (typeof c == "undefined") {
            return "undefined";
        }
        if (typeof c == "string") {
            return '"' + c + '"';
        }
        if (typeof c != "object") {
            return "" + c;
        }
        if (c === null) {
            return "null";
        }
        if (c instanceof Array) {
            return "[" + c.map(function (e) {
                return "obj"
            }).join(",") + "]";
        } else {
            var b = [];
            for (var d in c) {
                b.push(d + ":obj");
            }
            return "{" + b.join(",") + "}";
        }
    };
    return a;
})();
ExtractContentJS.Lib.A = (function () {
    var a = {};
    a.indexOf = Array.indexOf ||
    function (d, e) {
        var c = 2;
        var b = d.length;
        var f = Number(arguments[c++]) || 0;
        f = (f < 0) ? Math.ceil(f) : Math.floor(f);
        if (f < 0) {
            f += b;
        }
        for (; f < b; f++) {
            if (f in d && d[f] === e) {
                return f;
            }
        }
        return -1;
    };
    a.filter = Array.filter ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw new TypeError("A.filter: not a function");
        }
        var j = new Array();
        var g = arguments[d++];
        for (var f = 0; f < b; f++) {
            if (f in e) {
                var h = e[f];
                if (c.call(g, h, f, e)) {
                    j.push(h);
                }
            }
        }
        return j;
    };
    a.forEach = Array.forEach ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw new TypeError("A.forEach: not a function");
        }
        var g = arguments[d++];
        for (var f = 0; f < b; f++) {
            if (f in e) {
                c.call(g, e[f], f, e);
            }
        }
    };
    a.every = Array.every ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw new TypeError("A.every: not a function");
        }
        var g = arguments[d++];
        for (var f = 0; f < b; f++) {
            if (f in e && !c.call(g, e[f], f, e)) {
                return false;
            }
        }
        return true;
    };
    a.map = Array.map ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw new TypeError("A.map: not a function");
        }
        var h = new Array(b);
        var g = arguments[d++];
        for (var f = 0; f < b; f++) {
            if (f in e) {
                h[f] = c.call(g, e[f], f, e);
            }
        }
        return h;
    };
    a.some = Array.some ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw new TypeError("A.some: not a function");
        }
        var g = arguments[d++];
        for (var f = 0; f < b; f++) {
            if (f in e && c.call(g, e[f], f, e)) {
                return true;
            }
        }
        return false;
    };
    a.reduce = Array.reduce ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw TypeError("A.reduce: not a function ");
        }
        var f = 0;
        if (arguments.length > d) {
            var h = arguments[d++];
        } else {
            do {
                if (f in e) {
                    h = e[f++];
                    break;
                }
                if (++f >= b) {
                    throw new TypeError("A.reduce: empty array");
                }
            } while (true)
        }
        for (; f < b; f++) {
            if (f in e) {
                h = c.call(null, h, e[f], f, e);
            }
        }
        return h;
    };
    a.zip = function (d) {
        if (d[0] instanceof Array) {
            var c = d[0].length;
            var b = d.length;
            var g = new Array(c);
            for (var f = 0; f < c; f++) {
                g[f] = [];
                for (var e = 0; e < b; e++) {
                    g[f].push(d[e][f]);
                }
            }
            return g;
        }
        return [];
    };
    a.first = function (b) {
        return b ? b[0] : null;
    };
    a.last = function (b) {
        return b ? b[b.length - 1] : null;
    };
    a.push = function (c, b) {
        return Array.prototype.push.apply(c, b);
    };
    return a;
})();
ExtractContentJS.Lib.DOM = (function () {
    var a = ExtractContentJS.Lib.A;
    var b = {};
    b.getElementStyle = function (g, i) {
        var d = (g && g.style) ? g.style[i] : null;
        if (!d) {
            var c = g.ownerDocument.defaultView;
            if (c && c.getComputedStyle) {
                try {
                    var f = c.getComputedStyle(g, null);
                } catch (h) {
                    return null;
                }
                i = i.replace(/([A-Z])/g, "-$1").toLowerCase();
                d = f ? f.getPropertyValue(i) : null;
            } else {
                if (g.currentStyle) {
                    d = g.currentStyle[i];
                }
            }
        }
        return d;
    };
    b.text = function (c) {
        if (typeof c.textContent != "undefined") {
            return c.textContent;
        } else {
            if (c.nodeName == "#text") {
                return c.nodeValue;
            } else {
                if (typeof c.innerText != "undefined") {
                    return c.innerText;
                }
            }
        }
        return null;
    };
    b.ancestors = function (g) {
        var c = g.ownerDocument.body;
        var f = [];
        var d = g;
        while (d != c) {
            f.push(d);
            d = d.parentNode;
        }
        f.push(c);
        return f;
    };
    b.commonAncestor = function (h, g) {
        var d = b.ancestors(h).reverse();
        var c = b.ancestors(g).reverse();
        var f = null;
        for (var e = 0; d[e] && c[e] && d[e] == c[e]; e++) {
            f = d[e];
        }
        return f;
    };
    b.countMatchTagAttr = function (e, l, j, g) {
        var k = function (i) {
                return i.test(e[j]);
            };
        if ((e.tagName || "").toLowerCase() == l && a.some(g, k)) {
            return 1;
        }
        var d = 0;
        var c = e.childNodes;
        for (var f = 0, h = c.length; f < h; f++) {
            d += b.countMatchTagAttr(c[f], l, j, g);
        }
        return d;
    };
    b.matchTag = function (d, c) {
        return a.some(c, function (e) {
            if (typeof e == "string") {
                return e == ((d && d.tagName) || "").toLowerCase();
            } else {
                if (e instanceof Array) {
                    return e[0] == ((d && d.tagName) || "").toLowerCase() && b.matchAttr(d, e[1]);
                } else {
                    return false;
                }
            }
        })
    };
    b.matchAttr = function (f, e) {
        var h = function (i, j) {
                if (typeof i == "string") {
                    return i == j;
                } else {
                    if (i instanceof RegExp) {
                        return i.test(j);
                    } else {
                        if (i instanceof Array) {
                            return a.some(i, function (m) {
                                return h(m, j);
                            })
                        } else {
                            if (i instanceof Object) {
                                for (var l in i) {
                                    var k = f[l];
                                    if (k && b.matchAttr(k, i[l])) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
                return false;
            };
        for (var g in e) {
            var c = f[g];
            var d = e[g];
            if (c) {
                return h(d, c);
            }
        }
        return false;
    };
    b.matchStyle = function (d, c) {
        var f = function (g, h) {
                if (typeof g == "string") {
                    return g == h;
                } else {
                    if (g instanceof RegExp) {
                        return g.test(h);
                    } else {
                        if (g instanceof Array) {
                            return a.some(g, function (i) {
                                return f(i, h);
                            });
                        }
                    }
                }
                return false;
            };
        for (var e in c) {
            if (f(c[e], b.getElementStyle(d, e))) {
                return true;
            }
        }
        return false;
    };
    return b;
})();
if (typeof ExtractContentJS == "undefined") {
    var ExtractContentJS = {};
}(function (d) {
    var g = d.Lib.Util;
    var a = d.Lib.A;
    var e = d.Lib.DOM;
    var f = g.inherit(function (k) {
        var l = arguments[1] || 0;
        var h = arguments[2] || {};
        var j = arguments[3] || 1048576;
        var i = {
            node: k,
            depth: l,
            inside: h
        };
        i.statistics = function () {
            var n = (e.text(k) || "").replace(/\s+/g, " ");
            var m = n.length;
            return {
                text: n.substr(0, j),
                noLinkText: (h.link || h.form) ? "" : n,
                listTextLength: h.list ? m : 0,
                noListTextLength: h.list ? 0 : m,
                linkCount: h.link ? 1 : 0,
                listCount: h.li ? 1 : 0,
                linkListCount: (h.li && h.link) ? 1 : 0
            }
        };
        return i;
    }, {
        commonAncestor: function () {
            var h = a.map(arguments, function (i) {
                return i.node;
            });
            if (h.length < 2) {
                return h[0];
            }
            return a.reduce(h, function (i, j) {
                return e.commonAncestor(i, j);
            })
        },
        mergeStatistics: function (i, h) {
            var j = {};
            for (var k in i) {
                j[k] = i[k] + h[k];
            }
            return j;
        }
    });
    var c = function (i) {
            i = a.filter(i, function (j) {
                var k = e.text(j.node) || "";
                k = k.replace(/\s+/g, "");
                return k.length != 0
            });
            var h = {
                score: 0,
                leaves: i
            };
            h.commonAncestor = function () {
                return f.commonAncestor.apply(null, h.leaves);
            };
            return h;
        };
    var b = function (i) {
            var h = {
                _content: i
            };
            h.asLeaves = function () {
                return h._content;
            };
            h.asNode = function () {
                if (h._node) {
                    return h._node;
                }
                h._node = f.commonAncestor.apply(null, h._content);
                return h._node;
            };
            h.asTextFragment = function () {
                if (h._textFragment) {
                    return h._textFragment;
                }
                if (h._content.length < 1) {
                    return "";
                }
                h._textFragment = a.reduce(h._content, function (k, l) {
                    var j = e.text(l.node);
                    j = j.replace(/^\s+/g, "").replace(/\s+$/g, "");
                    j = j.replace(/\s+/g, " ");
                    return k + j;
                }, "");
                return h._textFragment;
            };
            h.asText = function () {
                if (h._text) {
                    return h._text;
                }
                var j = h.asNode();
                h._text = j ? e.text(j) : "";
                return h._text;
            };
            h.toString = function () {
                return h.asTextFragment();
            };
            return h;
        };
    d.LayeredExtractor = function () {
        var h = {
            handler: arguments[0] || [],
            filter: arguments[1] || {}
        };
        h.factory = {
            getHandler: function (i) {
                if (typeof d.LayeredExtractor.Handler != "undefined") {
                    return new d.LayeredExtractor.Handler[i];
                }
                return null;
            }
        };
        h.addHandler = function (i) {
            if (typeof i != "undefined") {
                h.handler.push(i);
            }
            return h;
        };
        h.filterFor = function (i) {};
        h.extract = function (p) {
            var k = (p.URL) ? p.URL : p.location.href;
            var m = {
                title: p.title,
                url: (p.URL) ? p.URL : p.location.href
            };
            var j = h.handler.length;
            for (var l = 0; l < j; l++) {
                var n = h.handler[l].extract(p, k, m);
                if (!n) {
                    continue;
                }
                var o = h.filterFor(k);
                if (o) {
                    n = o.filter(n);
                }
                n = new b(n);
                if (!n.toString().length) {
                    continue;
                }
                m.content = n;
                m.isSuccess = true;
                m.engine = m.engine || h.handler[l];
                break;
            }
            return m;
        };
        return h;
    };
    d.LayeredExtractor.Handler = {};
    d.LayeredExtractor.Handler.Heuristics = function () {
        var h = {
            name: "Heuristics",
            content: [],
            opt: g.inherit(arguments[0], {
                threshold: 60,
                minLength: 30,
                factor: {
                    decay: 0.75,
                    noBody: 0.72,
                    continuous: 1.16
                },
                punctuationWeight: 10,
                minNoLink: 8,
                noListRatio: 0.2,
                limit: {
                    leaves: 800,
                    recursion: 20,
                    text: 1048576
                },
                debug: false
            }),
            pat: g.inherit(arguments[1], {
                sep: ["div", "center", "td", "h1", "h2"],
                waste: [/Copyright|All\s*Rights?\s*Reserved?/i],
                affiliate: [/amazon[a-z0-9\.\/\-\?&]+-22/i],
                list: ["ul", "dl", "ol"],
                li: ["li", "dd"],
                a: ["a"],
                form: ["form"],
                noContent: ["frameset"],
                ignore: ["iframe", "img", "script", "style", "select", "noscript", ["div",
                {
                    id: [/more/, /menu/, /side/, /navi/],
                    className: [/more/, /menu/, /side/, /navi/]
                }]],
                ignoreStyle: {
                    display: "none",
                    visibility: "hidden"
                },
                punctuations: /[\u3002\u3001\uFF0E\uFF0C\uFF01\uFF1F]|\.[^A-Za-z0-9]|,[^0-9]|!|\?/
            })
        };
        var i = g.inherit(function (k) {
            var j = new c(k);
            j.eliminateLinks = function () {
                var n = a.map(j.leaves, function (r) {
                    return r.statistics();
                });
                if (!n.length) {
                    return "";
                }
                if (n.length == 1) {
                    n = n[0];
                } else {
                    n = a.reduce(n, function (r, s) {
                        return f.mergeStatistics(r, s);
                    })
                }
                var q = n.noLinkText.length;
                var m = n.linkCount;
                var p = n.listTextLength;
                if (q < h.opt.minNoLink * m) {
                    return "";
                }
                var o = n.linkListCount / (n.listCount || 1);
                o *= o;
                var l = h.opt.noListRatio * o * p;
                if (q < l) {
                    return "";
                }
                return n.noLinkText;
            };
            j.noBodyRate = function () {
                var l = 0;
                if (j.leaves.length > 0) {
                    l += a.reduce(j.leaves, function (m, n) {
                        return m + e.countMatchTagAttr(n.node, "a", "href", h.pat.affiliate)
                    }, 0);
                }
                l /= 2;
                l += a.reduce(h.pat.waste, function (m, n) {
                    return m + g.countMatch(j._nolink, n);
                }, 0);
                return l;
            };
            j.calcScore = function (l, m) {
                j._nolink = j.eliminateLinks();
                if (j._nolink.length < h.opt.minLength) {
                    return 0;
                }
                var o = g.countMatch(j._nolink, h.pat.punctuations);
                o *= h.opt.punctuationWeight;
                o += j._nolink.length;
                o *= l;
                var n = j.noBodyRate();
                o *= Math.pow(h.opt.factor.noBody, n);
                j._c = j.score = o;
                j._c1 = o * m;
                return o;
            };
            j.isAccepted = function () {
                return j._c > h.opt.threshold;
            };
            j.isContinuous = function () {
                return j._c1 > h.opt.threshold;
            };
            j.merge = function (l) {
                j.score += l._c1;
                j.depth = Math.min(j.depth, l.depth);
                a.push(j.leaves, l.leaves);
                return j;
            };
            return j;
        }, {
            split: function (n) {
                var m = [];
                var l = [];
                var p = 0;
                var k = h.opt.limit.text;
                var j = function (q) {
                        if (q && l.length) {
                            m.push(new i(l));
                            l = [];
                        }
                    };
                var o = function (s, u, t) {
                        if (p >= h.opt.limit.leaves) {
                            return m;
                        }
                        if (u >= h.opt.limit.recursion) {
                            return m;
                        }
                        if (s && s.nodeName == "#comment") {
                            return m;
                        }
                        if (e.matchTag(s, h.pat.ignore)) {
                            return m;
                        }
                        if (e.matchStyle(s, h.pat.ignoreStyle)) {
                            return m;
                        }
                        var q = s.childNodes;
                        var z = h.pat.sep;
                        var x = q.length;
                        var r = {
                            form: t.form || e.matchTag(s, h.pat.form),
                            link: t.link || e.matchTag(s, h.pat.a),
                            list: t.list || e.matchTag(s, h.pat.list),
                            li: t.li || e.matchTag(s, h.pat.li)
                        };
                        for (var v = 0; v < x; v++) {
                            var y = q[v];
                            var w = e.matchTag(y, z);
                            j(w);
                            o(y, u + 1, r);
                            j(w);
                        }
                        if (!x) {
                            p++;
                            l.push(new f(s, u, r, k));
                        }
                        return m;
                    };
                o(n, 0, {});
                j(true);
                return m;
            }
        });
        h.extract = function (q) {
            var u = function (w) {
                    return q.getElementsByTagName(w).length != 0;
                };
            if (a.some(h.pat.noContent, u)) {
                return h;
            }
            var s = 1;
            var o = 1;
            var r = [];
            var j = i.split(q.body);
            var t;
            var p = j.length;
            for (var n = 0; n < p; n++) {
                var m = j[n];
                if (t) {
                    o /= h.opt.factor.continuous;
                }
                if (!m.calcScore(s, o)) {
                    continue;
                }
                s *= h.opt.factor.decay;
                if (m.isAccepted()) {
                    if (m.isContinuous() && t) {
                        t.merge(m);
                    } else {
                        t = m;
                        r.push(m);
                    }
                    o = h.opt.factor.continuous;
                } else {
                    if (!t) {
                        s = 1;
                    }
                }
            }
            h.blocks = r.sort(function (w, v) {
                return v.score - w.score;
            });
            var l = a.first(h.blocks);
            if (l) {
                h.content = l.leaves;
            }
            return h.content;
        };
        return h;
    };
    d.LayeredExtractor.Handler.GoogleAdSection = function () {
        var h = {
            name: "GoogleAdSection",
            content: [],
            state: [],
            opt: g.inherit(arguments[0], {
                limit: {
                    leaves: 800,
                    recursion: 20
                },
                debug: false
            })
        };
        var i = {
            ignore: /google_ad_section_start\(weight=ignore\)/i,
            section: /google_ad_section_start/i,
            end: /google_ad_section_end/i
        };
        var k = 1;
        var j = 2;
        h.inSection = function () {
            return a.last(h.state) == j;
        };
        h.ignore = function () {
            h.state.push(k);
        };
        h.section = function () {
            h.state.push(j);
        };
        h.end = function () {
            if (h.state.length) {
                h.state.pop();
            }
        };
        h.parse = function (o) {
            var p = arguments[1] || 0;
            if (o.nodeName == "#comment") {
                if (i.ignore.test(o.nodeValue)) {
                    h.ignore();
                } else {
                    if (i.section.test(o.nodeValue)) {
                        h.section();
                    } else {
                        if (i.end.test(o.nodeValue)) {
                            h.end();
                        }
                    }
                }
                return;
            }
            if (h.content.length >= h.opt.limit.leaves) {
                return;
            }
            if (p >= h.opt.limit.recursion) {
                return;
            }
            var n = o.childNodes;
            var l = n.length;
            for (var m = 0; m < l; m++) {
                var q = n[m];
                h.parse(q, p + 1);
            }
            if (!l && h.inSection()) {
                h.content.push(new f(o, p));
            }
        };
        h.extract = function (l) {
            h.parse(l);
            h.blocks = [new c(h.content)];
            return h.content;
        };
        return h;
    };
})(ExtractContentJS);
