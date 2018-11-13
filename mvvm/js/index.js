class Vue {
    constructor(options) {
        this.data = options.data;
        this.methods = options.methods;
        this.computed = options.computed;

        Object.keys(this.data).forEach((key) => {
            this._proxy(key)
        });

        observer(this.data);
        new Compile(options.el, this);
        options.mounted.call(this)
    }

    _proxy(key) {
        Object.defineProperty(this, key, {
            enumerable: true,
            configurable: false,
            get: () => this.data[key],
            set: (val) => this.data[key] = val
        })
    }
}