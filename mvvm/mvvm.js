class MVVM {
    constructor(options) {
        this.$options = options
        let data = this._data = this.$options.data,
            self = this
        Object.keys(data).forEach(function (key) {
            self._proxy(key)
        })
        this._initComputed()
        observer(data)
        new Compile(options.el || document.body, this)
    }

    $watch(key, cb) {
        new Watcher(this,key,cb)
    }

    _proxy(key) {
        let self = this
        Object.defineProperty(self, key, {
            enumerable: true,
            configurable: false,
            get: () => {
                return self._data[key]
            },
            set: (newVal) => {
                return self._data[key] = newVal
            }
        })
    }

    _initComputed() {
        let self = this,
            computed = this.$options.computed
        if(typeof computed === 'object'){
            Object.keys(computed).forEach(function(key){
                Object.defineProperty(self,key,{
                    get: () => {
                        return typeof computed[key] === 'function' ? computed[key] : computed[key].get
                    }
                })
            })
        }
    }
}