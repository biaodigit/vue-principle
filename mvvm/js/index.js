function Vue(options) {
    this.options = options
    this.data = options.data
    this.methods = options.methods
    var self = this
    Object.keys(this.data).forEach(function (key) {
        self.proxyKeys(key)
    })

    this.initComputed()
    observe(this.data)
    new Compile(options.el, this)
    options.mounted.call(this)
}

Vue.prototype = {
    proxyKeys: function (key) {
        var self = this
        Object.defineProperty(this,key,{
            enumerable: true,
            configurable: false,
            get: function () {
                return self.data[key]
            },
            set: function (newVal) {
                self.data[key] = newVal
            }
        })
    },
    initComputed: function() {
        var self = this;
        var computed = this.options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function(key) {
                Object.defineProperty(self, key, {
                    get: typeof computed[key] === 'function'
                        ? computed[key]
                        : computed[key].get,
                    set: function() {}
                });
            });
        }
    }
}