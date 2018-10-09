class Watcher {
    constructor(vm, exp, cb) {
        this.vm = vm;
        this.cb = cb;
        this.getter = this.parseGetter(exp);
        this.value = this.get();
    }

    update() {
        this.run()
    }

    run() {
        let newVal = this.get(),
            oldVal = this.value;
        if (newVal !== oldVal) {
            this.cb.call(this.vm, newVal)
            this.value = newVal
        }
    }

    get() {
        Dep.target = this;
        let value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value
    }

    parseGetter(exp) {
        const exps = exp.split('.')
        return function (obj) {
            for (let i = 0; i < exps.length; i++) {
                if (!obj) return

                obj = obj[exps[i]]
            }
            return obj
        }
    }
}