// 订阅者构造器
function Watcher(vm,exp,cb){

    this.vm = vm // mVue实例
    this.exp = exp  // 被订阅的属性
    this.cb = cb    //更新该属性的回调方法

    this.value = this.get();  // 初始化时将自己添加到订阅器
}

Watcher.prototype  = {
    get(){
        // 令Dep.target等于当前的watcher实例
        Dep.target = this;
        // 触发对应属性的getter方法
        // 会将当前watcher添加到dep.subs中
        var value = this.vm.data[this.exp]
        // 添加完成后置空
        Dep.target = null
        return value
    },
    // 该订阅者的更新方法
    update(){
        this.run()
    },
    run(){
        // 也就是触发构造函数的cb回调，触发视图跟新
        let value = this.vm.data[this.exp]
        let oldVal = this.value
        if(value !== oldVal){
            this.value = value
            this.cb.call(this.vm,value,oldVal)
        }
    }
}