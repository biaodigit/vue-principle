class Compile {
    constructor(el, vm) {
        this.$vm = vm;
        this.$el = this.isElementNode(el) ? el : document.querySelector(el)

        if (this.$el) {
            this.$fragment = this.node2Fragment(this.$el)
            this.init()
            this.$el.appendChild(this.$fragment)
        }
    }

    node2Fragment(el) {
        let fragment = document.createDocumentFragment(),
            child;

        while (child = el.firstChild) {
            fragment.appendChild(child)
        }

        return fragment
    }

    init() {
        this.compileElement(this.$fragment)
    }

    compileElement(el) {
        let childNodes = el.childNodes

        Array.from(childNodes).forEach((node) => {
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/; // 表达式文本
            if (this.isElementNode(node)) {        //编译解析节点
                this.compile(node);
            } else if (this.isTextNode(node) && reg.test(text)) {  //编译解析文本模版
                this.compileText(node, RegExp.$1);
            }

            if (node.childNodes && node.childNodes.length) {   // 遍历编译子节点
                this.compileElement(node);
            }
        })
    }

    compile(node) {
        let nodeAttr = node.attributes

        Array.from(nodeAttr).forEach((attr) => {
            // 规定：指令以 v-xxx 命名
            // 如 <span v-text="content"></span> 中指令为 v-text
            let attrName = attr.name // v-text
            if (this.isDirective(attrName)) {
                let exp = attr.value, //content
                    dir = attrName.substring(2)  //text

                if (this.isEventDirective(dir)) {
                    compileUtil.eventHandler(node, this.$vm, exp, dir)
                } else {
                    compileUtil[dir] && compileUtil[dir](node, this.$vm, exp)
                }
            }
        })

        node.removeAttribute(nodeAttr)

    }

    compileText(node, exp) {
        compileUtil.text(node, this.$vm, exp)
    }
    isDirective(attr) {
        return attr.indexOf('v-') === 0
    }
    isEventDirective(dir) {
        return dir.indexOf('on') === 0
    }
    isElementNode(node) {
        return node.nodeType === 1
    }
    isTextNode(node) {
        return node.nodeType === 3
    }
}

// 指令处理集合
let compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text')
    },
    html: function(node, vm, exp) {
        this.bind(node, vm, exp, 'html')
    },
    model: function(node, vm, exp) {
        this.bind(node, vm, exp, 'model');

        let me = this,
            val = this._getVMVal(vm, exp);

        node.addEventListener('input', function (e) {
            let newVal = e.target.value;

            if (val === newVal) {
                return
            }
            me._setVMVal(vm, exp, newVal)
            val = newVal

        })
    },
    bind: function(node, vm, exp,dir) {
        let updaterFn = updater[dir + 'Updater'];
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));

        new Watcher(vm, exp, function (value) {
            updaterFn && updaterFn(node, value)
        })
    },
    // 事件处理
    eventHandler: function(node, vm, exp, dir) {
        let eventType = dir.split(':')[1],
            fn = vm.$options.methods && vm.$options.methods[exp];

        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false)
        }
    },
    _getVMVal: function(vm, exp) {
        let val = vm
        exp = exp.split('.')
        exp.forEach(function (key) {
            console.log(val)
            val = val[key]
        });

        return val
    },
    _setVMVal: function(vm, exp, newVal) {
        let val = vm
        exp = exp.split('.')
        exp.forEach(function (key, index) {
            if (index < exp.length - 1) {
                val = val[key]
            } else {
                val[key] = newVal;
            }
        });
    }

}
let updater = {
    textUpdater: (node, value) => {
        node.textContent = typeof value === 'undefined' ? '' : value
    },

    htmlUpdater: (node, value) => {
        node.innerHTML = typeof value === 'undefined' ? '' : value
    },

    modelUpdater: (node, value) => {
        node.value = typeof value === 'undefined' ? '' : value
    }
}