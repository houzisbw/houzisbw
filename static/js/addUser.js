//bmob云存储初始化
Bmob.initialize("e0a51a8e943e642a0269d0925d9e9688", "9335d129f2514d28bb20174d65dd75f5");
//普通用户个数,二级管理员个数
var globalNormalUserCount = 0;
var globalAdminSecondCount = 0;

//返回主页
$('#goback').click(function(){
    window.location.href = './../index.html';
});

//添加用户按钮处理
$('#user_input_button').click(function() {
    //用户名
    var usernameInput = $('#username_input').val().trim();
    //用户名不能有空格
    if(usernameInput.split(' ').length > 1){
        showConfirmOnlyModal('用户名不能有空格~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        })
        return;
    }
    if (!usernameInput) {
        showConfirmOnlyModal('请填写用户名~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        })
        return;
    }

    //密码
    var passwordInput = $('#password_input').val().trim();
    //密码不能有空格
    if(passwordInput.split(' ').length > 1){
        showConfirmOnlyModal('密码不能有空格~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        })
        return;
    }
    if (!passwordInput) {
        showConfirmOnlyModal('请填写密码~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        })
        return;
    }

    var userType = $('#usertype button').text().trim();
    if(userType == '用户类型'){
        showConfirmOnlyModal('请选择用户类型~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        })
        return;
    }

    //获得用户ul
    var userUl = document.getElementById('user_ul');
    //生成用户li
    var userLi = document.createElement('li');
    userLi.setAttribute('class','user_li');
    //生成用户div
    var userDiv = document.createElement('div');
    //添加点击事件
    userLi.onclick = function(){
        if(userType=='普通用户'){
            --globalNormalUserCount;
        }else{
            --globalAdminSecondCount;
        }
        //计算标题普通用户数量和二级管理员数量
        var userTitle = document.getElementsByClassName('title_left_description')[0];
        var titleText = '普通用户: '+globalNormalUserCount+' &nbsp;&nbsp;&nbsp;二级管理员: '+globalAdminSecondCount;
        $(userTitle).html(titleText);

        //删除
        this.parentNode.removeChild(this);
    }
    if(userType == '普通用户'){
        userDiv.setAttribute('class','user_div');
        globalNormalUserCount++;
    }else{
        userDiv.setAttribute('class','admin_div');
        globalAdminSecondCount++;
    }
    //给div添加文字
    var str = ' 用户名字:&nbsp;&nbsp;&nbsp;&nbsp;'+usernameInput+'<br>'+' 用户密码:&nbsp;&nbsp;&nbsp;&nbsp;'+passwordInput+'<br>'+' 用户权限:&nbsp;&nbsp;&nbsp;&nbsp;'+userType;
    $(userDiv).html(str);
    //给div添加一个不可见的span元素，用来保存用户名，密码，权限
    var span = document.createElement('span');
    span.setAttribute('class','span_invisible');
    var spanText = usernameInput+' '+passwordInput+' '+userType;
    setInnerText(span,spanText);
    userDiv.appendChild(span);

    //检查用户名是否重复
    //获取所有用户信息，他们存在span中,这里是从前端获取
    var userInfoObj = {};
    var userSpans = userUl.getElementsByTagName('span');
    for(var i=0,len=userSpans.length;i<len;i++){
        var usernameTemp = getInnerText(userSpans[i]).split(' ')[0];
        userInfoObj[usernameTemp] = usernameTemp;
    }
    //不能与超管名字一样,超管从云数据库
    //找到超管用户,超管可以有多个，这里要逐一判断
    //从bmob云数据库查询用户名和密码
    var userInfo = Bmob.Object.extend('user');
    var queryUser = new Bmob.Query(userInfo);
    //只查询超管
    queryUser.equalTo('authority','2');
    queryUser.find({
        //注意，不能在find函数后面再写逻辑，应该在success里写，因为是异步调用
        success: function(results) {
            if(results.length>0){
                for(var i=0;i<results.length;i++){
                    var object = results[i];
                    if(object.get('username') == usernameInput){
                        //保存
                        userInfoObj[usernameInput] = usernameInput;
                        break;
                    }
                }
                //如果有重复用户名
                if(userInfoObj.hasOwnProperty(usernameInput)){
                    showConfirmOnlyModal('该用户名已经存在，请重新填写~',function(){
                        $('.overlay').css('display','none');
                        $('#modal_confirm_only').css('display','none');
                    })
                    return;
                }else{
                    userLi.appendChild(userDiv);
                    userUl.appendChild(userLi);
                    //更新用户数量
                    //计算标题普通用户数量和二级管理员数量
                    var userTitle = document.getElementsByClassName('title_left_description')[0];
                    var titleText = '普通用户: '+globalNormalUserCount+' &nbsp;&nbsp;&nbsp;二级管理员: '+globalAdminSecondCount;
                    $(userTitle).html(titleText)
                }
            }
        },
        error: function(error) {
            alert("数据库查询出错: " + error.code + " " + error.message);
        }
    });
});

//保存用户处理
var saveUserButton = document.getElementById('save_user');
saveUserButton.onclick = function(){
    $('#save_user').attr({"disabled":"disabled"});
    $('#save_user').text('保存中...');
    //获取用户ul
    var userUl = document.getElementById('user_ul');
    var userSpans = userUl.getElementsByTagName('span');
    //获取所有用户名,从云端数据库
    var userInfo = Bmob.Object.extend('user');
    var queryUser = new Bmob.Query(userInfo);
    //这里的逻辑是：每次保存的时候都删除当前数据库用户(保存超管)
    queryUser.find().then(function(results) {
        var promise = Bmob.Promise.as();
        //除去超管
        var resultsWithoutSuperAdmin = [];
        for(var i=0;i<results.length;i++){
            if(results[i].get('authority') !== '2'){
                resultsWithoutSuperAdmin.push(results[i]);
            }
        }
        //undersocre.js对每一项数据处理
        _.each(resultsWithoutSuperAdmin, function(result) {
            // For each item, extend the promise with a function to delete it.
            promise = promise.then(function() {
                // Return a promise that will be resolved when the delete is finished.
                return result.destroy();
            });
        });
        return promise;

    }).then(function() {
        //除了超管的所有用户都删除完毕
        //开始添加新用户
        //promise很重要，要等待所有添加都添加了才行
        var promise = Bmob.Promise.as();
        //保存所有用户信息的array
        var userArray = [];
        //遍历用户ul获取用户信息
        for(var i=0,len=userSpans.length;i<len;i++){
            var tempUserInfo = getInnerText(userSpans[i]);
            var userInfoArray = tempUserInfo.split(' ');
            var userObj = {
                username:userInfoArray[0],
                password:userInfoArray[1],
                authority:userInfoArray[2]=='普通用户'?'0':'1'
            };
            userArray.push(userObj);
        }
        //undersocre.js对每一项数据处理
        _.each(userArray, function(result) {
            // For each item, extend the promise with a function to delete it.
            promise = promise.then(function() {
                //生成一个新的用户数据行,userInfo是数据库中对应的数据格式
                var tempUserInfo = new userInfo();
                //保存每一个用户
                return tempUserInfo.save(result);
            });
        });
        return promise;
    }).then(function(){
        showConfirmOnlyModal('保存用户信息成功~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
            window.location.reload();
        })
    })

}

//初始化处理
document.body.onload = function (){
    //用户类型下拉菜单处理
    var userTypeDiv = document.getElementById('usertype');
    var userTypeButton  = userTypeDiv.getElementsByTagName('button')[0];
    var normalUserAlink = document.getElementById('normal');
    normalUserAlink.onclick = function(){
        var text = getInnerText(this);
        setInnerText(userTypeButton,text);
    }
    var adminSecondALink = document.getElementById('admin_second');
    adminSecondALink.onclick = function(){
        var text = getInnerText(this);
        setInnerText(userTypeButton,text);
    };

    //初始化用户信息列表
    //获取云数据库中的用户信息，注意不能获取超管,否则超管被删了就尴尬了
    //获取所有用户名,从云端数据库
    var userInfo = Bmob.Object.extend('user');
    var queryUser = new Bmob.Query(userInfo);
    //不查询超管
    queryUser.notEqualTo('authority','2');
    //查询开始
    queryUser.find().then(function(results){
        //获取要添加的节点：用户ul
        var userUl = document.getElementById('user_ul');
        //遍历用户数组添加数据
        for(var i=0,len=results.length;i<len;i++){
            var userObj = results[i];
            var username = userObj.get('username');
            var password = userObj.get('password');
            var authority = userObj.get('authority')=='0'?'普通用户':'二级管理员';
            //统计用户类别数量
            if(userObj.get('authority')=='0'){
                globalNormalUserCount++;
            }else{
                globalAdminSecondCount++;
            }
            //生成用户li
            var userLi = document.createElement('li');
            userLi.setAttribute('class', 'user_li');
            //生成用户div
            var userDiv = document.createElement('div');
            //添加点击事件
            (function(auth){
                userLi.onclick = function () {
                    if(auth=='普通用户'){
                        globalNormalUserCount--;
                    }else{
                        globalAdminSecondCount--;
                    }
                    //计算标题普通用户数量和二级管理员数量
                    var userTitle = document.getElementsByClassName('title_left_description')[0];
                    var titleText = '普通用户: '+globalNormalUserCount+' &nbsp;&nbsp;&nbsp;二级管理员: '+globalAdminSecondCount;
                    $(userTitle).html(titleText);
                    this.parentNode.removeChild(this);
                }
            })(authority);

            if (authority == '普通用户') {
                userDiv.setAttribute('class', 'user_div');
            } else {
                userDiv.setAttribute('class', 'admin_div');
            }
            //给div添加文字
            var str = ' 用户名字:&nbsp;&nbsp;&nbsp;&nbsp;' + username + '<br>' + ' 用户密码:&nbsp;&nbsp;&nbsp;&nbsp;' + password + '<br>' + ' 用户权限:&nbsp;&nbsp;&nbsp;&nbsp;' + authority;
            $(userDiv).html(str);
            //给div添加一个不可见的span元素，用来保存用户名，密码，权限
            var span = document.createElement('span');
            span.setAttribute('class', 'span_invisible');
            var spanText = username + ' ' + password + ' ' + authority;
            setInnerText(span, spanText);
            //依次添加
            userDiv.appendChild(span);
            userLi.appendChild(userDiv);
            userUl.appendChild(userLi);


        }
        //计算标题普通用户数量和二级管理员数量
        var userTitle = document.getElementsByClassName('title_left_description')[0];
        var titleText = '普通用户: '+globalNormalUserCount+' &nbsp;&nbsp;&nbsp;二级管理员: '+globalAdminSecondCount;
        $(userTitle).html(titleText)
    })

}



