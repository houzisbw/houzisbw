/**
 * Created by Administrator on 2017/9/17.
 */
if(!window.localStorage){
    alert('浏览器不支持本地存储');
}
//本地存储
var ls = window.localStorage;
//设置管理员,以后要修改
//ls.setItem('adminName','sbw');
//ls.setItem('adminPassword','123');


//判断是否进入修改状态的变量
var isInModify = false;
//当前所选的年月
var currentMonthValue = '';
var currentYearValue = '';

//判断是哪一种用户,0,1,2分别代表普通，二级，超管
function checkUserAuthentication(){
    var auth = getCookie('authority');
    return auth;
}

//处理下拉框日期部分
//年份
var yearList = document.getElementsByClassName('year_choice')[0];
var yearDropDown = document.getElementsByClassName('dropBoxButton_year')[0];
var yearInput = document.getElementsByClassName('yearInput')[0];
var isYearListShow = false;
yearDropDown.onclick=function(){
    if(!isYearListShow){
        isYearListShow=true;
        yearList.style.display='block';
    }
    else{
        isYearListShow=false;
        yearList.style.display='none';
    }
}
//每一项li选中也要隐藏下拉框
var yearLi = yearList.getElementsByTagName('li');
for(var i=0,len=yearLi.length;i<len;i++){
    yearLi[i].onclick = function(){
        yearList.style.display='none';
        //yearInput.value = this.innerText;
        yearInput.value = getInnerText(this);
    }
}

//月份
var monthList = document.getElementsByClassName('month_choice')[0];
var monthDropDown = document.getElementsByClassName('dropBoxButton_month')[0];
var monthInput = document.getElementsByClassName('monthInput')[0];
var isMonthListShow = false;
monthDropDown.onclick=function(){
    if(!isMonthListShow){
        isMonthListShow=true;
        monthList.style.display='block';
    }
    else{
        isMonthListShow=false;
        monthList.style.display='none';
    }
}
//每一项li选中也要隐藏下拉框
var monthLi = monthList.getElementsByTagName('li');
for(var i=0,len=monthLi.length;i<len;i++){
    monthLi[i].onclick = function(){
        monthList.style.display='none';
        //monthInput.value = this.innerText;
        monthInput.value = getInnerText(this);
    }
}


//搜索按钮
var searchButton = document.getElementsByClassName('search')[0];
//获取innerTEXT,兼容火狐
function getInnerText(element) {
    return (typeof element.textContent == "string") ? element.textContent : element.innerText;
}
//设置innerText
function setInnerText(element,text){
    if(typeof element.textContent == "string"){
        element.textContent = text;
    }else{
        element.innerText = text;
    }
}
searchButton.onclick = function(){
    //判断用户是否登录
    var userCookie = getCookie('username');
    if(!userCookie){
        alert('温馨提示:请登录后再操作~');
        return;
    }
    var monthValue = monthInput.value.trim();
    var yearValue = yearInput.value.trim();
    if(!monthValue || !yearValue){
        alert('请输入年份或月份！');
        return;
    }else {
        currentMonthValue = monthValue;
        currentYearValue = yearValue;
        searchRecordData(yearValue,monthValue);
    }
}
//兼容ie8及以下去除空格
String.prototype.trim = function () {
    return this.replace(/^\s*|\s*$/g, "");
}
//根据年月查询数据
function searchRecordData(year,month){

    //清空标题
    var tableTitle = document.getElementsByClassName('content_table_title')[0];
    setInnerText(tableTitle,'');
    //查找数据，从ls里面获取数据并初始化表格
    var dateStr = year + '-' + month;
    var recordsStr = ls.getItem(dateStr);
    //由得到的数据填充table
    var table = document.getElementById('content_table');
    //首先清空原有table
    while(table.children.length>0){
        table.removeChild(table.children[0]);
    }
    //如果是null或者空数组则返回
    if(!recordsStr || recordsStr === '[]'){
        if(!isInModify) {
            alert('未找到数据,请重新输入年月~');
        }
        return;
    }

    var tbody = document.createElement('tbody');
    //添加表头
    var tableHead = document.createElement('tr');
    var th1 = document.createElement('th');
    setInnerText(th1,'姓名')
    var th2 = document.createElement('th');
    setInnerText(th2,'日期')
    var th3 = document.createElement('th');
    setInnerText(th3,'车间')
    var th4 = document.createElement('th');
    setInnerText(th4,'类型')
    var th5 = document.createElement('th');
    setInnerText(th5,'错误说明')
    tableHead.appendChild(th1);
    tableHead.appendChild(th2);
    tableHead.appendChild(th3);
    tableHead.appendChild(th4);
    tableHead.appendChild(th5);
    tbody.appendChild(tableHead);

    //添加内容
    var recordsArray = JSON.parse(recordsStr);
    for(var i=0,len=recordsArray.length;i<len;i++){
        var obj = recordsArray[i];
        var tr = document.createElement('tr');
        for(var k in obj){
            //避免访问原型链上的属性
            if(obj.hasOwnProperty(k)) {
                var td = document.createElement('td');
                setInnerText(td,obj[k])
                tr.appendChild(td);
            }
        }
        tbody.appendChild(tr);
    }

    //多了个tbody，注意了,自动加上的
    table.appendChild(tbody);
    //标题加上
    tableTitle = document.getElementsByClassName('content_table_title')[0];
    var titleStr = year + '年' + month +'月员工错误记录(一共' + recordsArray.length + "条)";
    setInnerText(tableTitle,titleStr);

}

//打印机提示
var printerDesc = document.getElementsByClassName('printer_description')[0];
var printer = document.getElementsByClassName('printer')[0];
printer.onmouseover = function(){
    printerDesc.style.display='block';
}
printer.onmouseout = function(){
    printerDesc.style.display='none';
}


//修改元素class
function hasClass(obj, cls) {
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

function addClass(obj, cls) {
    if (!this.hasClass(obj, cls)) {
        obj.className += " " + cls;
    }
}

function removeClass(obj, cls) {
    if (hasClass(obj, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        obj.className = obj.className.replace(reg, ' ');
    }
}

function toggleClass(obj,cls){
    if(hasClass(obj,cls)){
        removeClass(obj, cls);
    } else {
        addClass(obj, cls);
    }
}

//登录按钮
var loginButton = document.getElementById('login');
var modalShow = false;
var overlay = document.getElementsByClassName('overlay')[0];
var modalLogin = document.getElementById('modal_login');
loginButton.onclick = function(){
    if(!modalShow){
        overlay.style.display='block';
        toggleClass(modalLogin,'md-show');
        modalLogin.style.display='block'
    }
}
//对话框关闭
var closeButton = document.getElementsByClassName('md-close')[0];
closeButton.onclick = function(){
    toggleClass(modalLogin,'md-show');
    overlay.style.display='none';
}



///////////////////////登录处理
//cookie函数
function setCookie(name,value,expireSeconds)
{
    var exp = new Date();
    //getTime返回毫秒数,设置过期时间多少秒
    exp.setTime(exp.getTime() + 1000*expireSeconds);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}
function getCookie(name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}
function checkCookie(value)
{
    var username=getCookie(value)
    if (username!=null && username!="")
    {
        return true;
    }
    else
    {
        return false;
    }
}
function delCookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null) {
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    }
}

var btnLogin = document.getElementsByClassName('btn-login')[0];
btnLogin.onclick = function(){
    //获取输入框内的用户名和密码
    var username = document.getElementsByName('loginname')[0].value;
    var password = document.getElementsByName('password')[0].value;
    //遍历localStorage的user，从而判断当前账号密码是否存在
    var userList = JSON.parse(ls.getItem('user'));
    var isCurrentUserValid = false;
    var userAuthority = '';
    for(var i=0;i<userList.length;i++){
        var userObj = userList[i];
        if(userObj['password'] == password && userObj['username'] == username){
            isCurrentUserValid =true;
            userAuthority = userObj['authority'];
            break;
        }
    }
    //错误提示
    var errorTip = document.getElementById('errorTip');
    //验证
    if(isCurrentUserValid){
        //登录成功
        toggleClass(modalLogin,'md-show');
        overlay.style.display='none';
        //设置cookie
        //cookie过期时间
        var timeToExpire = 300;
        setCookie('username',username,timeToExpire);
        //设置权限信息
        setCookie('authority',userAuthority,timeToExpire);
        //刷新页面
        window.location.reload();

    }else{
        //登录失败
        toggleClass(errorTip,'error-show');
    }

};
//登出
var btnLogout = document.getElementById('logout');
btnLogout.onclick = function(){
    var result = confirm('确认退出？');
    if(result){
        delCookie('username');
        delCookie('authority');
    }
    //刷新页面
    window.location.reload();
}
//body加载时检查cookie
document.body.onload=function(){
    //检查是否存在key为user的item，这个user是管理所有用户的key
    var user = ls.getItem('user');
    //如果不存在user，也就是第一次启动网站
    if(!user){
        //添加超级管理员,权限为2
        var superAdminObj = {
            username:'superadmin',
            password:'19910516',
            authority:'2'
        }
        var tempArray = [];
        tempArray.push(superAdminObj);
        var tempStr = JSON.stringify(tempArray);
        ls.setItem('user',tempStr);
    }


    isInModify=false;
    //这里只判断了username，但是username和权限cookie的时间是一样的
    var hasCookie = checkCookie('username');
    var nameDiv = document.getElementsByClassName('loginedName')[0];
    if(hasCookie){
        var loginButton = document.getElementById('login');
        toggleClass(loginButton,'toggleDisplay');
        var logoutButton = document.getElementById('logout');
        toggleClass(logoutButton,'toggleDisplay');
        //显示用户名
        var username = getCookie('username');
        //权限
        var userauthority = getCookie('authority');
        var userauthorityName = '';
        if(userauthority == '2'){
            userauthorityName = '超级管理员 ';
        }else if(userauthority == '1'){
            userauthorityName = '二级管理员 ';
        }else{
            userauthorityName = '用户 ';
        }
        //登录才显示的按钮,超管才能看到
        if(userauthority=='2') {
            //必须动态添加，不能隐藏显示，这样有漏洞
            var bannerButton = document.getElementsByClassName('bannerButton')[0];
            var settingButton = document.createElement('a');
            settingButton.setAttribute('class','alreadyLoginButton');
            setInnerText(settingButton,'设置信息')
            settingButton.setAttribute('id','setting');
            settingButton.onclick = function(){
                window.location.href='./views/setting.html';
            }
            bannerButton.appendChild(settingButton);

            var addItemButton = document.createElement('a');
            addItemButton.setAttribute('class','alreadyLoginButton');
            setInnerText(addItemButton,'添加记录')
            addItemButton.setAttribute('id','addItem');
            addItemButton.onclick = function(){
                window.location.href='./views/addItem.html';
            }
            bannerButton.appendChild(addItemButton);

            var modifyButton = document.createElement('a');
            modifyButton.setAttribute('class','alreadyLoginButton');
            setInnerText(modifyButton,'修改记录')
            modifyButton.setAttribute('id','modify');
            modifyButton.onclick = function(){
                //如果没有搜索到数据则不能修改
                if(table.children.length === 0){
                    alert('当月表格内容为空，无法修改!');
                    return;
                }

                //只在遮罩上显示表格
                var content = document.getElementsByClassName('content')[0];
                //为啥不能用toggleClass呢
                content.style['z-index']=500;
                //加上遮罩
                overlay.style.display='block';
                //显示提示框
                var modifyTips = document.getElementsByClassName('modify_tips')[0];
                modifyTips.style.display = 'block';
                //显示保存和取消2个按钮
                toggleClass(confirmButton,'toggleDisplay');
                toggleClass(cancelButton,'toggleDisplay');
                isInModify = true;

                //显示每一行的删除按钮
                var trs = table.getElementsByTagName('tr');
                for(var i=0;i<trs.length;i++){
                    var deleteButton = document.createElement('button');
                    deleteButton.setAttribute("class", "deleteButton btn btn-warning");
                    //deleteButton.innerText = '删除';
                    setInnerText(deleteButton,'删除')
                    //添加点击函数,表头不能删除
                    if(i>0) {
                        deleteButton.onclick = function () {
                            //这里很奇怪，table的子元素给加了个tbody进来，bootstrap搞的鬼？？？？
                            var tbody = this.parentNode.parentNode;
                            var parentNode = this.parentNode;
                            tbody.removeChild(parentNode);
                        }
                    }
                    trs[i].appendChild(deleteButton);
                }
            }
            bannerButton.appendChild(modifyButton);

            var addUserButton = document.createElement('a');
            addUserButton.setAttribute('class','alreadyLoginButton');
            setInnerText(addUserButton,'添加用户')
            addUserButton.setAttribute('id','addUser');
            addUserButton.onclick = function(){
                window.location.href='./views/adduser.html';
            }
            bannerButton.appendChild(addUserButton);

        }

        setInnerText(nameDiv,'您好, '+userauthorityName+username);
    }else{
        //nameDiv.innerText = '';
        setInnerText(nameDiv,'');
    }


}

//修改按钮处理
var confirmButton =document.getElementById('confirm_modify');
var cancelButton =document.getElementById('cancel_modify');
var table = document.getElementById('content_table');
cancelButton.onclick = function(){
    var content = document.getElementsByClassName('content')[0];
    content.style['z-index']=0;
    overlay.style.display='none';
    toggleClass(cancelButton,'toggleDisplay');
    toggleClass(confirmButton,'toggleDisplay');
    isInModify=false;
    //关闭提示框
    var modifyTips = document.getElementsByClassName('modify_tips')[0];
    modifyTips.style.display = 'none';
    //重新查找数据，恢复原来的table
    searchRecordData(currentYearValue,currentMonthValue);
}
//确认修改按钮
confirmButton.onclick = function(){
    var content = document.getElementsByClassName('content')[0];
    content.style['z-index']=0;
    overlay.style.display='none';
    toggleClass(confirmButton,'toggleDisplay');
    toggleClass(cancelButton,'toggleDisplay');
    //计算修改过后的表格
    //首先获取当前所选年月，注意不能直接从input的value获取，因为可以改变这2个值
    var currentDate = currentYearValue+'-'+currentMonthValue;
    //从当前table生成新的数据
    var trs = table.getElementsByTagName('tr');
    //获取表头长度,减一是去除button按钮的那一列
    var tableHeadLength = trs[0].children.length-1;
    //最终要保存的对象数组
    var objRecordArray = [];
    //遍历table的每一行
    for(var i=0,len=trs.length;i<len;i++){
        //表头不能统计
        if(i>0){
            var tds = trs[i].getElementsByTagName('td');
            var obj = {
                name:getInnerText(tds[0]),
                date:getInnerText(tds[1]),
                workshop:getInnerText(tds[2]),
                type:getInnerText(tds[3]),
                error:getInnerText(tds[4])
            };
            objRecordArray.push(obj);
        }
    }
    //setItem保存
    var jsonStr = JSON.stringify(objRecordArray);
    ls.setItem(currentDate,jsonStr);
    //重新搜索数据
    searchRecordData(currentYearValue,currentMonthValue);
    //重置变量
    isInModify=false;
    //关闭提示框
    var modifyTips = document.getElementsByClassName('modify_tips')[0];
    modifyTips.style.display = 'none';
}



///////////点击表格中td，产生文本框的方法
function changeTotext(obj)
{
    var tdValue = getInnerText(obj);
    //obj.innerText = "";
    setInnerText(obj,'');
    var txt = document.createElement("input");
    txt.type = "text";
    txt.value = tdValue;
    txt.id = "_text_000000000_";
    txt.setAttribute("class","text");
    obj.appendChild(txt);
    txt.select();
    //obj.style.border = "1px dashed #ff9900";
}
// 取消单元格中的文本框，并将文本框中的值赋给单元格
function cancel(obj)
{
    var txtValue = document.getElementById("_text_000000000_").value;
    //obj.innerText = txtValue;
    setInnerText(obj,txtValue)
}
//取消选中单元格
document.onmouseup = function()
{
    if(isInModify) {
        //兼容ie和火狐
        var obj = event.srcElement ? event.srcElement : event.target;
        if (document.getElementById("_text_000000000_") && obj.id != "_text_000000000_") {
            var obj1 = document.getElementById("_text_000000000_").parentElement;
            cancel(obj1);
        }
    }
}
//点击td修改td的内容
document.onclick = function()
{
    //在修改状态下
    if(isInModify) {
        //兼容ie和火狐
        var obj = event.srcElement ? event.srcElement : event.target;
        if (obj.tagName.toLowerCase() == "td") {
            changeTotext(event.srcElement);
            //产生一个删除按钮，点击后删除该行
            //获得tr
            // var tr = obj.parentNode;
            // tr.style.position = 'relative';
            // var deleteButton = document.createElement('button');
            // deleteButton.setAttribute("className","btn btn-warning deleteButton");
            // deleteButton.type='button';
            // tr.appendChild(deleteButton);

        }

    }

}



///////////////////添加记录
// var addItemButton = document.getElementById('addItem');
// addItemButton.onclick = function(){
//     window.location.href='./views/addItem.html';
// }
//////////////////设置信息
// var settingButton  = document.getElementById('setting');
// settingButton.onclick = function(){
//     window.location.href='./views/setting.html';
// }
/////////////////添加用户
// var adduserButton = document.getElementById('addUser');
// adduserButton.onclick = function(){
//     window.location.href='./views/adduser.html';
// }



// var json = [];
// var obj1 = {
//     name:'sbw',
//     age:33
// }
// var obj2 = {
//     name:'lqy',
//     age:1
// }
// json.push(obj1)
// json.push(obj2)
// //字符串
// var jsonStr = JSON.stringify(json)
// //alert(jsonStr)
// //数组，里面是对象
// var jsonParsed = JSON.parse(jsonStr);