// 对 对象进行劫持的初始化方法
function observe(value,vm){
    // 只有当该值为对象时递归遍历劫持
    if(!value || typeof value !== 'object'){
        return
    }
    return new Observe(value)
}

// 观察者构造器
function Observe(data){
    this.data = data;

    // 初始化 对data的所有数据进行劫持
    this.walk(data)
}

Observe.prototype = {
    walk:function(data){
        var self = this
        // 遍历data的所有属性
        Object.keys(data).forEach(function(key){
            // 对属性进行劫持
            self.defineReactive(data,key,data[key])
        })
    },
    defineReactive:function(data,key,val){
        // dep==>用来存储这条属性的订阅信息的构造器
        // dep.subs 存储订阅者的数组
        // 例如 页面中有<p>{{id}}<p/> <h1>{{id}}<h1/> 两个标签都绑定了data中的id属性
        // 进行compile时，会被获取到,添加到该id属性的dep.subs中
        // 上例该dep.subs中就有两条数据,每条数据即一个watcher
        // 每个watcher中包含了该订阅者节点数据更新的方法
        // 当数据变化后只需遍历dep.subs数组，执行相关的更新方法即可
        var dep = new Dep()

        //这里对子属性进行递归操作，因为该属性可能是对象嵌套对象
        var childObj = val
        observe(childObj)

        // 这里开始利用Object.defineProperty进行属性劫持
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:true,
            // get方法 即数据的获取方法
            get(){ 
                // Dep.target默认是null
                // 只有当compile页面时，每发现一条绑定data中属性时,会生成一个watcher，
                // 让Dep.target = watcher,再触发该属性的get方法，完成添加
                // 再置空
                if(Dep.target){
                    // 添加一个订阅者Dep.target=watcher 到dep.subs
                    dep.addSub(Dep.target) 
                }
                // 普通访问时直接返回数据
                return val
            },
            set(newVal){
                // 当新旧值一样时，不触发更新
                if( newVal === val){
                    return
                }
                // 否则赋值 并 触发dep构造器的notice通知方法
                val = newVal
                dep.notice()
            }
        })
    }
}



// Dep构造器 存储每条属性的订阅信息
// 每个data中属性都会生成一个dep构造器
let Dep = function(){
    // 存储该属性被订阅的数组
    this.subs = []
}

Dep.prototype = {
    // 添加订阅信息
    addSub : function(sub){
        this.subs.push(sub)
    },
    // 触发更新
    notice:function(){
        // 遍历所有的订阅者 执行对应的跟新函数
        this.subs.forEach(function(sub){
            sub.update()
        })
    }
}

Dep.target = null