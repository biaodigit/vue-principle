function Watcher(vm, expfn, cb) {
    this.vm = vm
    this.cb = cb
    this.fn = expfn

    if (typeof expfn === 'function') {
        this.getter = expfn
    } else {
        this.getter = this.parseGetter(expfn)
    }
    this.value = this.get()

}

Watcher.prototype = {
    update: function () {
        this.run()
    },
    run: function () {
        var value = this.get()
        var oldVal = this.value
        if (value !== oldVal){
            this.value = value
            this.cb.call(this.vm,value,oldVal)
        }
    },
    addDep: function (dep) {
      if(!this.depIds.hasOwnProperty(dep.id)){
          dep.addSub(this)
          this.depIds[dep.id] = dep
      }
    },
    get: function () {
        Dep.target = this
        var value = this.vm[exp]
        Dep.target = null
        return value
    },
    parseGetter: function (exp) {
        var reg = /^\w.$/
        if (reg.text(exp)) {
            return
        }

        exps = exp.split('.')
        return function (obj) {
            for (var i = 0; i < exps.length; i++) {
                if (!obj) {
                    return
                }

                obj = obj[exps[i]]
            }
            return obj
        }
    }
}