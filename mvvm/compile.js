function Compile(el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)

    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el)
        this.init()
        this.$el.appendChild(this.$fragment)
    }
}

Compile.prototype = {
    node2Fragment: function (el) {
        var fragment = document.createDocumentFragment(),
            child;

        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            fragment.appendChild(child)
        }

        return fragment
    },
    init: function () {
        this.compileElement(this.$fragment)
    },
    compileElement: function (el) {
        var childNodes = el.childNodes;
        var self = this;

        [].slice.call(childNodes).forEach(function (node) {
            var text = node.textContent
            var reg = /\{\{(.*)\}\}/ // 表达式文本

            if (self.isElementNode(node)) {        //编译解析节点
                self.compile(node)
            } else if (self.isTextNode(node) && reg.test(text)) {  //编译解析文本模版
                self.compileText(node, RegExp.$1)
            }

            if (node.childNodes && node.childNodes.length) {   // 遍历编译子节点
                self.compileElement(node)
            }
        })
    },
    compile: function (node) {
        var nodeAttrs = node.attribute,
            self = this;

        [].slice.call(nodeAttrs).forEach(function (attr) {
            var attrName = attr.name
            // 规定：指令以 v-xxx 命名
            // 如 <span v-text="content"></span> 中指令为 v-text
            if (self.isDirective(attrName)) {
                var exp = attr.value, //content
                    dir = attrName.substring(2) //text
                if (self.isEventDirective(dir)) {
                    //事件指令, 如 v-on:click
                    compileUtil.eventHandler(node, self.$vm, exp, dir)
                } else {
                    //普通指令
                    compileUtil[dir] && compileUtil[dir](node, self.$vm, exp)
                }
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
        this.bind(node, vm, exp, 'model')

        var self = this,
            val = this._getVMVal(vm, exp)

        node.addEventListener('input', function (e) {
            var newVal = e.target.val

            if (val === newVal) {
                return
            }
            self._setVMVal(vm, exp, newVal)
            val = newVal

        })
    },
    class: function (node, vm, exp) {
        this.bind(node, vm, exp, 'class')
    },
    bind: function (node, vm, exp, dir) {
        var updaterFn = updater[dir + 'Updater']

        updaterFn && updaterFn(node,this._getVMVal(vm,exp))

    },
    eventHandler: function (node, vm, exp, dir) {

    },
    _getVMVal: function (vm, exp) {
        var val = vm
        exp = exp.split('.')
        exp.forEach(function (key) {
            val = val[key]
        })

        return val
    },
    _setVMVal: function (vm, exp, newVal) {
        var val = vm
        exp = exp.split('.')
        exp.forEach(function (key, index) {
            if (index < exp.length - 1) {
                val = val[key]
            } else {
                val = newVal
            }
        })
    }
}

var updater = {
    textUpdater: function (node, value) {
        node.innerText = typeof value === 'undefined' ? '' : value
    },
    htmlUpdater: function (node, value) {
        node.innerHtml = typeof value === 'undefined' ? '' : value
    },
    modelUpdater: function (node, value) {
        node.value = typeof value === 'undefined' ? '' : value
    },
    classUpdater: function (node, value) {

    },
}