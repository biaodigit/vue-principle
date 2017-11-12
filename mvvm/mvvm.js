class MVVM {
    constructor(options) {
        this.$options = options || {}
        var data = this._data = this.$options.data,
            self = this
        // 数据代理，实现 vm.xxx -> vm._data.xxx
        Object.keys(data).forEach(function (key) {
            self._proxy(key)
        })
        this._initComputed()
        observer(data)
        new Compile(options.el || document.body, this)
    }

    $watch(key, cb, options) {
        new Watcher(this, key, cb)
    }

    _proxy(key) {
        var self = this
        Object.defineProperty(self, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                return self._data[key]
            },
            set: function (newVal) {
                return self._data[key] = newVal
            }
        })
    }

    _initComputed() {
        var self = this
        var computed = this.$options.computed
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function (key) {
                Object.defineProperty(self, key, {
                    get: typeof computed[key] === 'function' ? computed[key] : computed[key].get
                })
            })
        }
    }
}
