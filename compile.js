function Compile(el, vm){
    this.vm  = vm;
    this.el = document.querySelector(el)
    // 虚拟dom
    this.fragment = null
    // 初始化第一次编译
    this.init()
}

Compile.prototype = {
    init(){
        // 判断绑定的元素是否存在
        if(this.el){
            // 创建一个虚拟dom
            this.fragment = this.nodeToFragment(this.el)
            this.compileElement(this.fragment)
            this.el.appendChild(this.fragment)
        }else{
            console.log('Dom元素不存在')
        }
    },
    nodeToFragment(el){
        // 创建虚拟dom
        var fragment = document.createDocumentFragment()
        var child = el.firstChild
        while(child){
            fragment.appendChild(child)
            child = el.firstChild
        }
        return fragment
    },
    // 编译元素
    compileElement(el){
        var self = this;
        var childNodes = el.childNodes;
        // [].slice.call() 将伪数组转化为数组 遍历
        [].slice.call(childNodes).forEach(function(node){
            var reg =  /\{\{(.*)\}\}/
            var text = node.textContent
            // 如果是文本节点 且 符合表达式
            if(self.isElementNode(node)){
                self.compile(node)
            }else if(self.isTextNode(node) && reg.test(text)){
                // 对文本进行编译
                self.compileText(node,reg.exec(text)[1])
            }
            // 如果存在子节点 递归编译
            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node);
            }
        })
    },
    // 文本进行编译
    compileText(node,exp){
        var self = this;
        var initText = this.vm[exp]
        // 初始化要更新一次文本 用于第一次页面显示内容
        this.updateText(node,initText)
        new Watcher(this.vm,exp,function(value){
            self.updateText(node,value)
        })
    },
    compile(node){
        var nodeAttrs = node.attributes;
        var self = this;
        // 节点伪数组 转化为数组
        [].slice.call(nodeAttrs).forEach(function(attr){
            var attrName = attr.name;
                // 判断是否是v-开头的指令
                if(self.isDirective(attrName)){
                    var exp = attr.value    // 绑定的数据
                    var dir = attrName.substring(2) // 指令名称
                    // 判断是否是:on事件指令
                    if(self.isEventDirective(dir)){
                        self.compileEvent(node, self.vm, exp, dir)
                    }else{
                        //否则 编译v-model指令
                        self.compileModel(node,self.vm,exp,dir);
                    }
                        // 对元素中的指令进行移除
                        node.removeAttribute(attrName);
                }
        })
    },
    // 编译事件
    compileEvent(node, vm, exp, dir){
        var eventType = dir.split(':')[1]
        var cb = vm.methods && vm.methods[exp]
        if(eventType && cb){
            node.addEventListener(eventType,cb.bind(vm),false)
        }
    },
    // 编译v-nodel
    compileModel(node, vm, exp, dir){
        console.log(dir)
            var self = this;
            var val = this.vm[exp]
            if(dir == 'model'){
                self.updateModel(node,val)
            }
            new Watcher(self.vm,exp,function(value){
                self.updateModel(node,value)
            })
            node.addEventListener('input',function(e){
                var newVal = e.target.value
                if(val === newVal){
                    return
                }
                self.vm[exp] = newVal;
                val = newVal;

            })
    },
    // 判断属性是否是指令
    isDirective(attr){
        return attr.indexOf('v-') == 0
    },
    // 判断属性是否是事件指令
    isEventDirective(dir){
        console.log('dir',dir,dir.indexOf('on:') == 0)
        return dir.indexOf('on:') == 0
    },
    // 判断是否是文本节点
    isTextNode(node){
        return node.nodeType == 3
     },
     // 判断是否是元素节点
     isElementNode(node){
         return node.nodeType == 1
      },
      // 跟新文本
      updateText(node,value){
          node.textContent = typeof value == 'undefined' ? '' : value
      },
      // 更新model绑定
      updateModel(node,value){
          node.value = typeof value == 'undefined' ? '' : value
      }
}