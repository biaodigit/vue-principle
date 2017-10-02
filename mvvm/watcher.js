class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm
        this.cb = cb
        this.depIds = {}
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        } else {
            this.getter = this.parseGetter(expOrFn)
        }

        this.value = this.get()
    }

    get() {
        // 将当前订阅者指向自己
        Dep.target = this
        //获取当前值
        let value = this.getter.call(this.vm, this.vm)
        //释放内存
        Dep.target = null
        return value
    }

    addDep(dep) {
        //如果在订阅者数组中没有当前订阅者Id,执行addSub
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this)
            this.depIds[dep.id] = dep
        }
    }

    update() {
        //获取最新值
        let value = this.get()
        let oldValue = this.value
        if (value !== oldValue) {
            this.value = value
            //调用compile类更新函数更新模版
            this.cb.call(this.vm, value)
        }
    }

    parseGetter(exp) {
        if (/[^\w.$]/.test(exp)) return;

        var exps = exp.split('.');

        return function (obj) {
            for (var i = 0, len = exps.length; i < len; i++) {
                if (!obj) return;
                obj = obj[exps[i]];
            }
            return obj;
        }
    }
}