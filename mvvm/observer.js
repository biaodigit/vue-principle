let observer = (data) => {
    if (!data || data.constructor !== Object) {
        return
    }
    return new Observer(data)
}

class Observer {
    constructor(data) {
        this.data = data
        this.convert(data)
    }


    convert(data) {
        Object.keys(data).forEach((key) => {
            this.defineReactive(data, key, data[key])
        })
    }

    defineReactive(data, key, val) {
        let dep = new Dep(),
            childObj = observer(val)

        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                if (Dep.target) {
                    dep.depend()
                }

                return val
            },
            set: function (newVal) {
                if (val === newVal) {
                    return
                }

                val = newVal
                // 新的值是object的话，进行监听
                childObj = observer(newVal);
                //通知订阅者
                dep.notify()
            }
        })
    }
}

let uid = 0

class Dep {
    constructor() {
        this.id = uid++
        this.subs = []
    }

    addSub(sub) {
        this.subs.push(sub)
    }

    depend() {
        Dep.target.addDep(this)
    }

    notify() {
        this.subs.forEach((sub) => {
            sub.update()
        })
    }
}

Dep.target = null