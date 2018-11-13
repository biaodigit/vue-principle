class Watcher {
    constructor(vm, exp, cb){
        this.cb = cb;
        this.vm = vm;
        this.exp = exp;
        this.value = this.get();
    }

    update() {
        this.run()
    }

    run() {
        let value = this.vm.data[this.exp];
        let oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    }

    get() {
        Dep.target = this;
        let value = this.vm.data[this.exp];
        Dep.target = null;
        return value
    }
}