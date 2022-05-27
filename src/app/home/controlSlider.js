L.Control.Range = L.Control.extend({
    options: { 
        position: "topright", 
        min: 0, max: 100, 
        value: 0, step: 1, 
        orient: "vertical", 
        iconClass: "leaflet-range-icon", 
        icon: !0 
    },
    onAdd: function (a) {
        var b = L.DomUtil.create("div", "leaflet-range-control leaflet-bar " + this.options.orient);
        this.options.icon && L.DomUtil.create("span", this.options.iconClass, b);
        var c = L.DomUtil.create("input", "", b);
        return c.type = "range", c.setAttribute(
            "orient",
            this.options.orient),
            c.min = this.options.min,
            c.max = this.options.max,
            c.step = this.options.step,
            c.value = this.options.value,
            L.DomEvent.on(
                c,
                "mousedown mouseup click touchstart",
                L.DomEvent.stopPropagation),
            L.DomEvent.on(
                c,
                "mouseenter",
                function (b) {
                    a.dragging.disable()
                }),
            L.DomEvent.on(
                c,
                "mouseleave",
                function (b) {
                    a.dragging.enable()
                }), L.DomEvent.on(
                    c,
                    "change",
                    function (a) {
                        this.fire(
                            "change", {
                            value: a.target.value
                        })
                    }.bind(this)),
            L.DomEvent.on(
                c,
                "input",
                function (a) {
                    this.fire("input", {
                        value: a.target.value
                    })
                }.bind(this)),
            this._slider = c,
            this._container = b,
            this._container
    },
    setValue: function (a) {
        this.options.value = a, this._slider.value = a
    }
}),
    L.Control.Range.include(L.Evented.prototype),
    L.control.range = function (a) {
        return new L.Control.Range(a)
    };