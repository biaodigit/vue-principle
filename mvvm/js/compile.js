class Compile {
    constructor(el, vm) {
        this.el = document.querySelector(el);
        this.vm = vm;
        this.fragment = null;
        this.init();
    }

    init() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        }
    }

    nodeToFragment(el) {
        let fragment = document.createDocumentFragment(),
            child = el.firstChild;
        while (child) {
            fragment.appendChild(child);
            child = el.firstChild;
        }
        return fragment
    }

    compileElement(node) {
        let childNodes = node.childNodes;

        [].slice.call(childNodes).forEach((node) => {
            let text = node.textContent,
                reg = /\{\{(.*)\}\}/;
            if (this.isElementNode(node)) {
                this.compile(node)
            } else if (this.isTextNode(node) && reg.test(text)) {
                compileUtil.text(node, this.vm, RegExp.$1)
            }

            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node)
            }
        })
    }

    compile(node) {
        let attributes = node.attributes;
        [].slice.call(attributes).forEach((attr) => {
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                let exp = attr.value,
                    dir = attrName.substring(2);
                if (this.isEventDirective(dir)) {
                    compileUtil.eventHandler(node, this.vm, exp, dir)
                } else {
                    compileUtil[dir] && compileUtil[dir](node, this.vm, exp)
                }
            }
        })
    }

    isElementNode(node) {
        return node.nodeType === 1
    }

    isTextNode(node) {
        return node.nodeType === 3
    }

    isDirective(attr) {
        return attr.indexOf('v-') === 0
    }

    isEventDirective(dir) {
        return dir.indexOf('on') === 0
    }

}

const compileUtil = {
    text: function (node, vm, exp) {
        this.bind(node, vm, exp, 'text')
    },

    html: function (node, vm, exp) {
        this.bind(node, vm, exp, 'html')
    },

    model: function (node, vm, exp) {
        this.bind(node, vm, exp, 'model');

        let oldVal = this.getVMVal(vm, exp),
            self = this;
        node.addEventListener('input', function (e) {
            let newVal = e.target.value;

            if (newVal === oldVal) return;

            self.setVMVal(vm, exp, newVal);

        }, false)
    },

    bind: function (node, vm, exp, dir) {
        let updateFn = updater[dir];

        updateFn && updateFn(node, this.getVMVal(vm, exp));
        new Watcher(vm, exp, function (value) {
            updateFn && updateFn(node, value);
        })
    },

    eventHandler: function (node, vm, exp, dir) {
        let eventType = dir.split(':')[1],
            fn = vm.methods[exp];

        node.addEventListener(eventType, fn.bind(vm), false)
    },

    getVMVal: function (vm, exp) {
        let val = vm,
            exps = exp.split('.');
        exps.forEach((exp) => {
            val = val[exp]
        });

        return val
    },

    setVMVal: function (vm, exp, newVal) {
        let val = vm,
            exps = exp.split('.');
        exps.forEach((exp, index) => {
            if (index < exps.length - 1) {
                val = val[exp]
            } else {
                val[exp] = newVal
            }
        })
    }
};

const updater = {
    html: function (node, value) {
        node.innerHTML = typeof value === 'undefined' ? '' : value
    },
    text: function (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value
    },
    model: function (node, value) {
        node.value = typeof value === 'undefined' ? '' : value
    }
};