function Observer(data) {
    this.data = data
    this.walk(data)
}

Observer.prototype = {
    walk: function (data) {
        var self = this
        Object.keys(data).forEach(function (key) {
            self.defineReactive(data, key, data[key])
        })
    },
    defineReactive: function (data, key, val) {
        var dep = new Dep()
        var child = observe(data[key])
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                if (Dep.target) {
                    dep.addSub(Dep.target)
                }
                return val
            },
            set: function (newVal) {
                if(val === newVal){
                    return
                }
                val = newVal
                dep.notify()
                child = observe(newVal)
            }
        })
    }
}

function observe(obj) {
    if (!obj || typeof obj !== 'object') {
        return
    }

    return new Observer(obj)
}

function Dep() {
    this.subs = []
}

Dep.prototype = {
    addSub: function (sub) {
        this.subs.push(sub)
    },
    notify: function () {
        this.subs.forEach(function (sub) {
            sub.update()
        })
    }
};

Dep.target = null;