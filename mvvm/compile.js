function Compile(el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    node2Fragment: function (el) {
        var fragment = document.createDocumentFragment(),
            child;

        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            console.log(el.firstChild)
            fragment.appendChild(child);
        }
        console.log(fragment)

        return fragment
    },
    init: function () {
        this.compileElement(this.$fragment)
    },
    compileElement: function (el) {
        var childNodes = el.childNodes,
            me = this;

        [].slice.call(childNodes).forEach(function (node) {
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/; // 表达式文本

            if (me.isElementNode(node)) {        //编译解析节点
                me.compile(node);
            } else if (me.isTextNode(node) && reg.test(text)) {  //编译解析文本模版
                me.compileText(node, RegExp.$1);
            }

            if (node.childNodes && node.childNodes.length) {   // 遍历编译子节点
                me.compileElement(node);
            }
        })
    },
    compile: function (node) {
        var nodeAttrs = node.attributes,
            me = this;

        [].slice.call(nodeAttrs).forEach(function (attr) {
            var attrName = attr.name
            // 规定：指令以 v-xxx 命名
            // 如 <span v-text="content"></span> 中指令为 v-text
            if (me.isDirective(attrName)) {
                var exp = attr.value, //content
                    dir = attrName.substring(2);//text
                if (me.isEventDirective(dir)) {
                    //事件指令, 如 v-on:click
                    compileUtil.eventHandler(node, me.$vm, exp, dir)
                } else {
                    //普通指令
                    compileUtil[dir] && compileUtil[dir](node, me.$vm, exp)
                }

                node.removeAttribute(attrName);
            }
        })
    },
    compileText: function (node, exp) {
        compileUtil.text(node, this.$vm, exp)
    },
    isDirective: function (attr) {
        return attr.indexOf('v-') === 0
    },
    isEventDirective: function (dir) {
        return dir.indexOf('on') === 0
    },
    isElementNode: function (node) {
        return node.nodeType === 1
    },
    isTextNode: function (node) {
        return node.nodeType === 3
    }

}

// 指令处理集合
var compileUtil = {
    text: function (node, vm, exp) {
        this.bind(node, vm, exp, 'text')
    },
    html: function (node, vm, exp) {
        this.bind(node, vm, exp, 'html')
    },
    model: function (node, vm, exp) {
        this.bind(node, vm, exp, 'model');

        var me = this,
            val = this._getVMVal(vm, exp);

        node.addEventListener('input', function (e) {
            var newVal = e.target.value;

            if (val === newVal) {
                return
            }
            me._setVMVal(vm, exp, newVal)
            val = newVal

        })
    },
    // class: function (node, vm, exp) {
    //     this.bind(node, vm, exp, 'class')
    // },
    bind: function (node, vm, exp, dir) {
        var updaterFn = updater[dir + 'Updater'];
        var self = this;
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));

        new Watcher(vm, exp, function (value) {
            updaterFn && updaterFn(node, value)
        })
    },
    // 事件处理
    eventHandler: function (node, vm, exp, dir) {
        var eventType = dir.split(':')[1],
            fn = vm.$options.methods && vm.$options.methods[exp];

        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false)
        }
    },
    _getVMVal: function (vm, exp) {
        var val = vm
        exp = exp.split('.')
        exp.forEach(function (key) {
            val = val[key]
        });

        return val
    },
    _setVMVal: function (vm, exp, newVal) {
        var val = vm
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

var updater = {
    textUpdater: function (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value
    },
    htmlUpdater: function (node, value) {
        node.innerHTML = typeof value === 'undefined' ? '' : value
    },
    modelUpdater: function (node, value) {
        node.value = typeof value === 'undefined' ? '' : value
    }
}