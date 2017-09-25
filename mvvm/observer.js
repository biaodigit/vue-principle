function Observer(data) {
    this.data = data
    this.walk(data)
}

Observer.prototype = {
    walk: function (data) {
        var self = this
        Object.keys(data).forEach(function (key) {
            self.convert(key, data[key])
        })
    },
    convert: function (key, val) {
        this.defineReactive(this.data, key, val)
    },
    defineReactive: function (data, key, val) {
        var dep = new Dep()
        var childObj = observer(val)

        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                if(Dep.target){
                    dep.depend()
                }
                return val;
            },
            set: function (newVal) {
                if (val === newVal) {
                    return
                }

                childObj = observer(newVal)
                dep.notify()
            }
        })
    }
}

function observer(data) {
    if (!data || typeof data !== 'object') {
        return
    }

    return new Observer(data)
}

var uid = 0

function Dep() {
    this.id = uid++
    this.subs = []
}

Dep.prototype = {
    addSub: function (sub) {
        this.subs.push(sub)
    },
    depend: function () {
      Dep.target.addDep(this)
    },
    removeSub: function(sub) {
        var index = this.subs.indexOf(sub);
        if (index !== -1) {
            this.subs.splice(index, 1);
        }
    },
    notify: function () {
        this.subs.forEach(function (sub) {
            sub.update();
        })
    }
}

Dep.target = null