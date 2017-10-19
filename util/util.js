/**
 *登录处理
 */
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

/**
 *获取innerTEXT,兼容火狐
 */
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

/**
 *兼容ie8及以下去除空格
 */
String.prototype.trim = function () {
    return this.replace(/^\s*|\s*$/g, "");
}


/**
 *修改元素class
 */
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

/**
 *获取所有子节点，仅仅包含元素节点，为了兼容ie
 */
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

/**
 *弹出确认的模态框
 */
function showConfirmOnlyModal(contentTitle,confirmFunc){
    $('.overlay').css('display','block');
    //$('#modal_confirm_only').css('display','block');
    $('#modal_confirm_only').slideDown(200);

    $('#modal_confirm_only .modal-title').text(contentTitle);
    $('#modal-confirm-button-only').click(confirmFunc)
}