/**
 * Created by Administrator on 2017/9/17.
 */
if(!window.localStorage){
    alert('浏览器不支持本地存储');
}
//本地存储
var ls = window.localStorage;
//本地存储：配置信息3个字段
var staffName = 'staffName';
var workshopName = 'workshopName';
var recordType = 'recordType';
//人员分隔符
var splitter = '**';

//返回主页
var goBackButton = document.getElementById('goback');
goBackButton.onclick = function(){
    window.location.href = './../index.html';
}

//人员姓名：点击确认，添加一个item
var nameInputButton = document.getElementById('name_input_button');
var nameInput = document.getElementById('name_input');
nameInputButton.onclick = function(){
    var nameValue = nameInput.value;
    if(!nameValue){
        alert('请输入姓名!');
        return;
    }
    //添加一个li到ul
    var nameUl = document.getElementById('name_ul');
    var li = document.createElement('li');
    li.innerText = nameValue;
    li.onclick = function(){
        var parent = this.parentNode;
        parent.removeChild(this);
    }
    nameUl.appendChild(li);
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
//保存的通用函数
function saveItem(itemKey,itemUl){
    var item_ul = document.getElementById(itemUl);
    var item_li = getElementChild(item_ul);
    var itemStr = '';
    for(var i=0,len=item_li.length;i<len;i++){
        itemStr += item_li[i].innerText + splitter;
    }
    //setItem保存数据
    ls.setItem(itemKey,itemStr);
}
saveConfigButton.onclick = function(){
    //保存所有项
    //姓名
    saveItem(staffName,'name_ul');
    //保存车间
    saveItem(workshopName,'workshop_ul');
    //保存记录
    saveItem(recordType,'record_ul');
    //提示保存成功
    alert('保存成功!');
}

//初始化每一项的通用函数
function initConfigList(itemKey,itemId){
    var itemNameStr = ls.getItem(itemKey);
    if(itemNameStr) {
        var itemNameList = itemNameStr.split(splitter);
        itemNameList.pop();
        var itemUl = document.getElementById(itemId);
        for (var i = 0, len = itemNameList.length; i < len; i++) {
            var li = document.createElement('li');
            li.innerText = itemNameList[i];
            li.onclick = function () {
                var parent = this.parentNode;
                parent.removeChild(this);
            }
            itemUl.appendChild(li);
        }
    }
}
//初始化
document.body.onload = function(){
    //初始化所有信息
    //初始化人员姓名
    initConfigList(staffName,'name_ul');
    //初始化车间名字
    initConfigList(workshopName,'workshop_ul');
    //初始化记录类型
    initConfigList(recordType,'record_ul');
}


