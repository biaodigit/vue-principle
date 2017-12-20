function Watcher(vm, exp, cb) {
    this.vm = vm
    this.cb = cb
    this.exp = exp
    this.getter = this.parseGetter(exp)
    this.value = this.get()
}

Watcher.prototype = {
    update: function () {
        this.run()
    },
    run: function () {
        var value = this.get()
        var oldValue = this.value
        if(oldValue !== value){
            this.cb.call(this.vm,value)
            this.value = value
        }
    },
    get: function () {
        Dep.target = this
        var value = this.getter.call(this.vm, this.vm)
        Dep.target = null
        return value
    },
    parseGetter: function (exp) {
        var exps = exp.split('.')
        return function (obj) {
            for (var i = 0; i < exps.length; i++) {
                if (!obj) return
                obj = obj[exps[i]]
            }
            return obj
        }
    }
}
