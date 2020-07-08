// 创建mVue类
function mVue(options){
    var self = this
    this.data = options.data
    this.el = options.el
    this.methods = options.methods

    // 遍历data对象
    Object.keys(this.data).forEach(function(key){
        // 对data里每个属性进行代理 
        self.proxyKey(key)
    })

    // 对data对象的数据进行劫持 监听
    observe(this.data)
    // 初始化 进行编译
    new Compile(this.el ,this)
}

// 属性代理
mVue.prototype = {
    proxyKey(key){
        var self = this;
        // 对vm实例进行数据劫持
        // 对data中存在的键 使类似于vm.id进行访问时 实际操作的是vm.data.id
        Object.defineProperty(this,key,{
            enumerable:true,    // 可枚举
            configurable:true,  // 可修改
            get(){
                return self.data[key] // 包裹data层
            },
            set(newVal){
                self.data[key] = newVal // 包裹data层
            }
        })
    }
}