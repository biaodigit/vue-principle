function Compile(el, vm) {
    this.el = document.querySelector(el);
    this.vm = vm;
    this.init();
}

Compile.prototype = {
    init: function () {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        }
    },
    nodeToFragment: function (el) {
        var fragment = document.createDocumentFragment();
        var child = el.firstChild;
        while (child) {
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment
    },
    compileElement: function (node) {
        var childNodes = node.childNodes;
        var self = this;
        [].slice.call(childNodes).forEach(function (node) {
            var reg = /\{\{(.*)\}\}/;
            var text = node.textContent;
            if (self.isElementNode(node)) {
                self.compile(node)
            } else if (self.isTextNode(node) && reg.test(text)) {
                compileUtil.text(node, self.vm, RegExp.$1)
            }

            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node)
            }
        })
    },
    compile: function (node) {
        var attributes = node.attributes;
        var self = this;
        [].slice.call(attributes).forEach(function (attr) {
            var attrName = attr.name
            if (self.isDirective(attrName)) {
                var exp = attr.value;
                var dir = attrName.substring(2)
                if (self.isEventDirective(dir)) {
                    compileUtil.eventHandler(node, self.vm, exp, dir)
                } else {
                    compileUtil[dir] && compileUtil[dir](node, self.vm, exp)
                }
            }
        })
    },
    isElementNode: function (node) {
        return node.nodeType === 1
    },
    isTextNode: function (node) {
        return node.nodeType === 3
    },
    isDirective: function (attr) {
        return attr.indexOf('v-') === 0
    },
    isEventDirective: function (dir) {
        return dir.indexOf('on') === 0
    }
}

var compileUtil = {
    text: function (node, vm, exp) {
        this.bind(node, vm, exp, 'text')
    },
    html: function(node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },
    model: function (node, vm, exp) {
        this.bind(node, vm, exp, 'model');
        var self = this;
        var value = this.getVMVal(vm, exp)
        console.log(value)
        node.addEventListener('input', function (e) {
            var newVal = e.target.value
            if (value === newVal) {
                return
            }
            self.setVMVal(vm, exp, newVal)
            value = newVal
        })
    },
    bind: function (node, vm, exp, dir) {
        var updateFn = updater[dir + 'Updater'];
        updateFn && updateFn(node, this.getVMVal(vm, exp))
        new Watcher(vm, exp, function (value) {
            updateFn && updateFn(node, value)
        })
    },
    eventHandler: function (node, vm, exp, dir) {
        var eventType = dir.split(':')[1]
        var fn = vm.methods && vm.methods[exp]

        node.addEventListener(eventType, fn.bind(vm), false)
    },
    getVMVal: function (vm, exp) {
        var value = vm
        exp = exp.split('.')
        exp.forEach(function (key) {
            value = value[key]
        })
        return value
    },
    setVMVal: function (vm, exp, newVal) {
        var value = vm
        exp = exp.split('.')
        exp.forEach(function (key, i) {
            if (i < exp.length - 1) {
                value = value[key]
            } else {
                value[key] = newVal
            }
        })
        return value
    }
}

var updater = {
    textUpdater: function (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value
    },
    htmlUpdater: function (node, value) {
        node.innerHTML = typeof value === 'undefined' ? '' : value;
    },
    modelUpdater: function (node, value) {
        node.value = typeof value === 'undefined' ? '' : value
    }
}