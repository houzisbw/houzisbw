/**
 * Created by Administrator on 2017/9/17.
 */
//bmob云存储初始化
Bmob.initialize("e0a51a8e943e642a0269d0925d9e9688", "9335d129f2514d28bb20174d65dd75f5");
//云数据库表名字
var staffName = 'staffName';
var workshopName = 'workshop_config';
var recordType = 'recordType_config';

//返回主页
var goBackButton = document.getElementById('goback');
goBackButton.onclick = function(){
    window.location.href = './../index.html';
}

//获取innerTEXT,兼容火狐
function getInnerText(element) {
    return (typeof element.textContent == "string") ? element.textContent : element.innerText;
}

//车间名字
var workshopInputButton = document.getElementById('workshop_input_button');
var workshopInput = document.getElementById('workshop_input');
workshopInputButton.onclick = function(){
    var workshopValue = workshopInput.value;
    if(!workshopValue){
        alert('请输入车间名字!');
        return;
    }
    //添加一个li到ul
    var workshopUl = document.getElementById('workshop_ul');
    var li = document.createElement('li');
    li.innerText = workshopValue;
    li.onclick = function(){
        var parent = this.parentNode;
        parent.removeChild(this);
    }
    workshopUl.appendChild(li);
}

//记录类型
var recordInputButton = document.getElementById('record_input_button');
var recordInput = document.getElementById('record_input');
recordInputButton.onclick = function(){
    var recordValue = recordInput.value;
    if(!recordValue){
        alert('请输入记录类型!');
        return;
    }
    //添加一个li到ul
    var recordUl = document.getElementById('record_ul');
    var li = document.createElement('li');
    li.innerText = recordValue;
    li.onclick = function(){
        var parent = this.parentNode;
        parent.removeChild(this);
    }
    recordUl.appendChild(li);
}


//获取所有子节点，仅仅包含元素节点，为了兼容ie
function getElementChild(element){
    if(!element.children){
        var elementArr = [];//声明一个数组用以存放之后获取的子节点
        var nodeList = element.childNodes;//初始化接受参数的子节点集合
        for(var i=0;i<nodeList.length;i++){ //遍历集合
            if(nodeList[i].nodeType == 1){//若节点的元素类型属于1，即元素节点,存入数组
                elementArr.push(nodeList[i]);
            }
        }
        return elementArr;//返回存放子元素的数组
    }
    else{                   //若支持element.children,直接返回
        return element.children;
    }
}
//保存配置
var saveConfigButton = document.getElementById('save_config');
//保存的通用函数,configTable为数据库中配置表的名字
function saveItem(configTable,itemUl){
    //禁用按钮，这句话很关键啊，防止重复点击,页面重新加载后自动解除
    $("#save_config").attr({"disabled":"disabled"});
    var item_ul = document.getElementById(itemUl);
    var item_li = getElementChild(item_ul);
    //获取所有用户名,从云端数据库
    var itemInfo = Bmob.Object.extend(configTable);
    var queryItem = new Bmob.Query(itemInfo);

    //这里的逻辑是：每次保存的时候都删除当前数据库,然后重新写入
    queryItem.find().then(function(results) {
        var promise = Bmob.Promise.as();
        //undersocre.js对每一项数据处理
        _.each(results, function(result) {
            // For each item, extend the promise with a function to delete it.
            promise = promise.then(function() {
                // Return a promise that will be resolved when the delete is finished.
                return result.destroy();
            });
        });
        return promise;

    }).then(function() {
        //添加新的内容
        //promise很重要，要等待所有添加都添加了才行
        var promise = Bmob.Promise.as();
        //保存所有用户信息的array
        var itemArray = [];
        //遍历用户ul获取用户信息
        for(var i=0,len=item_li.length;i<len;i++){
            var tempItemInfo = getInnerText(item_li[i]);
            var itemObj = {
               name:tempItemInfo
            };
            itemArray.push(itemObj);
        }
        //undersocre.js对每一项数据处理
        _.each(itemArray, function(result) {
            // For each item, extend the promise with a function to delete it.
            promise = promise.then(function() {
                //生成一个新的用户数据行,userInfo是数据库中对应的数据格式
                var tempItemInfo = new itemInfo();

                //保存每一个用户
                return tempItemInfo.save(result);
            });
        });
        return promise;
    }).then(function(){

        //先保存上面的,此处代码不够优秀，采取了then嵌套，原因是没有掌握promise并发的用法,造成此处保存耗时过长
        //保存记录类型
        var tempitemUl = 'record_ul';
        var item_ul = document.getElementById(tempitemUl);
        var item_li = getElementChild(item_ul);
        //获取所有用户名,从云端数据库
        var itemInfo1 = Bmob.Object.extend('recordType_config');
        var queryItem1 = new Bmob.Query(itemInfo1);

        //这里的逻辑是：每次保存的时候都删除当前数据库,然后重新写入
        queryItem1.find().then(function(results) {
            var promise = Bmob.Promise.as();
            //undersocre.js对每一项数据处理
            _.each(results, function(result) {
                console.log(result.get('name'))
                // For each item, extend the promise with a function to delete it.
                promise = promise.then(function() {
                    // Return a promise that will be resolved when the delete is finished.
                    return result.destroy();
                });
            });
            return promise;

        }).then(function() {
            //添加新的内容
            //promise很重要，要等待所有添加都添加了才行
            var promise = Bmob.Promise.as();
            //保存所有用户信息的array
            var recordArray = [];
            //遍历用户ul获取用户信息
            for(var i=0,len=item_li.length;i<len;i++){
                var tempItemInfo = getInnerText(item_li[i]);
                var itemObj = {
                    name:tempItemInfo
                };
                recordArray.push(itemObj);
                //console.log(tempItemInfo)
            }
            //undersocre.js对每一项数据处理
            _.each(recordArray, function(result) {
                // For each item, extend the promise with a function to delete it.
                promise = promise.then(function() {
                    //生成一个新的用户数据行,userInfo是数据库中对应的数据格式
                    var tempItemInfo = new itemInfo1();

                    //保存每一个用户
                    return tempItemInfo.save(result);
                });
            });
            return promise;
        }).then(function(){
            alert('保存成功');
            window.location.reload();
        })
    })

}
saveConfigButton.onclick = function(){
    //同时执行就不行，醉了
    //保存记录和车间
    saveItem(workshopName,'workshop_ul');

}

//初始化每一项的通用函数,itemKey为数据库表名称
function initConfigList(tableName,itemId){
    //从数据库获取相应信息
    var item = Bmob.Object.extend(tableName);
    var queryItem = new Bmob.Query(item);
    queryItem.find().then(function(results){
        var itemUl = document.getElementById(itemId);
        for(var i=0;i<results.length;i++){
            //注意name是在所有config表里都存在的字段，表示名字
            var itemName = results[i].get('name');
            var li = document.createElement('li');
            setInnerText(li,itemName);
            li.onclick = function () {
                var parent = this.parentNode;
                parent.removeChild(this);
            };
            itemUl.appendChild(li);
        }
    })

}
//初始化
document.body.onload = function(){
    //初始化所有信息
    //初始化车间名字
    initConfigList(workshopName,'workshop_ul');
    //初始化记录类型
    initConfigList(recordType,'record_ul');
}

//设置innerText
function setInnerText(element,text){
    if(typeof element.textContent == "string"){
        element.textContent = text;
    }else{
        element.innerText = text;
    }
}


