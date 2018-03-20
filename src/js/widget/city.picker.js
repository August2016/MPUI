;(function(e) {
    "use strict";
    var n,
        a = e.rawCitiesData,
        c = function(e) {
            for (var n = [], a = 0; a < e.length; a++) {
                var c = e[a];
                /^请选择|市辖区/.test(c.name) || n.push(c)
            }
            return n.length ? n : []
        },
        o = function(e) {
            return e.sub ? c(e.sub) : [{
                name: "",
                code: e.code
            }]
        },
        m = function(e) {
            for (var n = 0; n < a.length; n++)
                if (a[n].code === e || a[n].name === e)
                    return o(a[n]);
            return []
        },
        d = function(e, n) {
            for (var c = 0; c < a.length; c++)
                if (a[c].code === e || a[c].name === e)
                    for (var m = 0; m < a[c].sub.length; m++)
                        if (a[c].sub[m].code === n || a[c].sub[m].name === n)
                            return o(a[c].sub[m])
        },
        u = function(e) {
            var n,
                c,
                o = a[0],
                m = e.split(" ");
            return a.map(function(e) {
                e.name === m[0] && (o = e)
            }), o.sub.map(function(e) {
                e.name === m[1] && (n = e)
            }), m[2] && n.sub.map(function(e) {
                e.name === m[2] && (c = e)
            }), c ? [o.code, n.code, c.code] : [o.code, n.code]
        };
    e.fn.cityPicker = function(c) {
        return c = e.extend({}, n, c), this.each(function() {
            var n = this,
                s = a.map(function(e) {
                    return e.name
                }),
                b = a.map(function(e) {
                    return e.code
                }),
                t = o(a[0]),
                r = t.map(function(e) {
                    return e.name
                }),
                i = t.map(function(e) {
                    return e.code
                }),
                l = o(a[0].sub[0]),
                f = l.map(function(e) {
                    return e.name
                }),
                p = l.map(function(e) {
                    return e.code
                }),
                v = s[0],
                h = r[0],
                V = f[0],
                y = [{
                    displayValues: s,
                    values: b,
                    cssClass: "col-province"
                }, {
                    displayValues: r,
                    values: i,
                    cssClass: "col-city"
                }];
            c.showDistrict && y.push({
                values: p,
                displayValues: f,
                cssClass: "col-district"
            });
            var g = {
                cssClass: "city-picker",
                rotateEffect: !1,
                formatValue: function(e, n, a) {
                    return a.join(" ")
                },
                onChange: function(a, o, u) {
                    var s,
                        b = a.cols[0].displayValue;
                    if (b !== v) {
                        var t = m(b);
                        s = t[0].name;
                        var r = d(b, s);
                        return a.cols[1].replaceValues(t.map(function(e) {
                            return e.code
                        }), t.map(function(e) {
                            return e.name
                        })), c.showDistrict && a.cols[2].replaceValues(r.map(function(e) {
                            return e.code
                        }), r.map(function(e) {
                            return e.name
                        })), v = b, h = s, a.updateValue(), !1
                    }
                    if (c.showDistrict && (s = a.cols[1].displayValue, s !== h)) {
                        var i = d(b, s);
                        return a.cols[2].replaceValues(i.map(function(e) {
                            return e.code
                        }), i.map(function(e) {
                            return e.name
                        })), h = s, a.updateValue(), !1
                    }
                    e(n).attr("data-code", o[o.length - 1]), e(n).attr("data-codes", o.join(",")), c.onChange && c.onChange.call(n, a, o, u)
                },
                cols: y
            };
            if (this) {
                var C = e.extend({}, c, g),
                    w = e(this).val();
                if (w || (w = "北京 北京市 东城区"), v = w.split(" ")[0], h = w.split(" ")[1], V = w.split(" ")[2], w) {
                    if (C.value = u(w), C.value[0]) {
                        var D = m(C.value[0]);
                        C.cols[1].values = D.map(function(e) {
                            return e.code
                        }), C.cols[1].displayValues = D.map(function(e) {
                            return e.name
                        })
                    }
                    if (C.value[1]) {
                        if (c.showDistrict) {
                            var k = d(C.value[0], C.value[1]);
                            C.cols[2].values = k.map(function(e) {
                                return e.code
                            }), C.cols[2].displayValues = k.map(function(e) {
                                return e.name
                            })
                        }
                    } else if (c.showDistrict) {
                        var k = d(C.value[0], C.cols[1].values[0]);
                        C.cols[2].values = k.map(function(e) {
                            return e.code
                        }), C.cols[2].displayValues = k.map(function(e) {
                            return e.name
                        })
                    }
                }
                e(this).picker(C)
            }
        })
    }, n = e.fn.cityPicker.prototype.defaults = {
        showDistrict: !0
    }
})($);