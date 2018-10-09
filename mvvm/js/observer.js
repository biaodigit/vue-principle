function observer(data) {
    if (!data || typeof data !== 'object') return;

    new Observer(data)
}

class Observer {
    constructor(data) {
        this.data = data;
        Object.keys(data).forEach((key) => {
            this.defineReactive(this.data, key, this.data[key])
        })
    }

    defineReactive(data, key, val) {
        let dep = new Dep(),
            child = observer(data[key]);

        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: () => {
                if (Dep.target) {
                    dep.addSub(Dep.target)
                }
                return val
            },
            set: (newVal) => {
                if (newVal === val) return;

                val = newVal;
                dep.notify();
                child = observer(val)
            }
        })
    }
}

class Dep {
    constructor() {
        this.subs = []
    }

    addSub(sub) {
        this.subs.push(sub)
    }

    notify() {
        this.subs.forEach((sub) => {
            sub.update()
        })
    }
}