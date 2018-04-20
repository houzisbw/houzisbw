//bmob云存储初始化
Bmob.initialize("e0a51a8e943e642a0269d0925d9e9688", "9335d129f2514d28bb20174d65dd75f5");
//云数据库表名字
var staffName = 'staffName';
var workshopName = 'workshop_config';
var recordType = 'recordType_config';
//组别信息
var group;
//存储所有组别信息的对象
var allGroupObj = {};
//返回主页
$('#goback').click(function(){
    window.location.href = './../index.html';
});

//检测组名input是否合格
$('#group').keyup(function(){
    console.log($('#group').val().length)
})

//车间名字
$('#workshop_input_button').click(function(){
    var workshopValue = $('#workshop_input').val();
    if(!workshopValue){
        showConfirmOnlyModal('请输入车间名字!',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        });
        return;
    }
    //添加一个li到ul
    var li = $("<li></li>");
    li.text(workshopValue);
    li.click(function(){
        $(this).remove();
    });
    $('#workshop_ul').append(li);
});

//记录类型
$('#record_input_button').click(function(){
    var recordValue = $('#record_input').val();
    if(!recordValue){
        showConfirmOnlyModal('请输入记录类型!',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        });
        return;
    }
    //添加一个li到ul
    var li = $("<li></li>");
    li.text(recordValue);
    li.click(function(){
        $(this).remove();
    });
    $('#record_ul').append(li);
});

//保存信息
function saveItem(){
    //禁用按钮，这句话很关键啊，防止重复点击,页面重新加载后自动解除
    $("#save_config").attr({"disabled":"disabled"});
    //改变按钮文本为：保存中
    $("#save_config").text('保存中');

    //获取组别名称
    var groupNameValue = $('#group').val();
    //获取公告内容
    var announcementContent = $('#announcement').val();

    //车间信息
    var item_ul = document.getElementById('workshop_ul');
    var item_li = getElementChild(item_ul);
    var itemInfo = Bmob.Object.extend('workshop_config');
    var queryItem = new Bmob.Query(itemInfo);
    queryItem.equalTo('group',group);

    //记录类型
    var item_ul1 = document.getElementById('record_ul');
    var item_li1 = getElementChild(item_ul1);
    var itemInfo1 = Bmob.Object.extend('recordType_config');
    var queryItem1 = new Bmob.Query(itemInfo1);
    queryItem1.equalTo('group',group);


    //本组名称
    var GroupName = Bmob.Object.extend('group');
    var queryGroupName = new Bmob.Query(GroupName);
    queryGroupName.equalTo('group_code',group);
    //判断是否重复的组名
    var isDuplicate = false;
    for(var k in allGroupObj){
        if(k!=group && allGroupObj[k] == groupNameValue){
            isDuplicate = true;
        }
    }
    if(isDuplicate){
        showConfirmOnlyModal('组名重复，请重新命名!',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
            $("#save_config").removeAttr('disabled');
            //改变按钮文本为：保存中
            $("#save_config").text('保存配置');
        });
        return;
    }


    //先执行3个并行的promise，处理删除对应数据库的操作，再执行3个写入数据库的操作，最后then输出结果
    var deletePromises = [];
    //删除自己组名信息
    var deleteGroupPromise = queryGroupName.find().then(function(results){
        var promise = Bmob.Promise.as();
        //undersocre.js对每一项数据处理
        _.each(results, function (result) {
            promise = promise.then(function () {
                return result.destroy();
            });
        });
        return promise;
    });
    deletePromises.push(deleteGroupPromise);

    //删除车间信息,只能删除自己组别的信息
    var deleteWorkShopPromise = queryItem.find().then(function(results) {
        var promise = Bmob.Promise.as();
        //undersocre.js对每一项数据处理
        _.each(results, function (result) {
            promise = promise.then(function () {
                return result.destroy();
            });
        });
        return promise;
    });
    deletePromises.push(deleteWorkShopPromise);

    //删除记录类型信息
    var deleteRecordTypePromise = queryItem1.find().then(function(results) {
        var promise = Bmob.Promise.as();
        //undersocre.js对每一项数据处理
        _.each(results, function (result) {
            promise = promise.then(function () {
                return result.destroy();
            });
        });
        return promise;
    });
    deletePromises.push(deleteRecordTypePromise);

    //等待3个删除操作完成,再执行添加操作
    Bmob.Promise.when(deletePromises).then(function(){
        //添加信息的promises
        var addPromises = [];

        //添加新的车间信息
        var promise = Bmob.Promise.as();
        //保存所有用户信息的array
        var itemArray = [];
        //遍历用户ul获取用户信息
        for(var i=0,len=item_li.length;i<len;i++){
            var tempItemInfo = getInnerText(item_li[i]);
            var itemObj = {
                name:tempItemInfo,
                group:group
            };
            itemArray.push(itemObj);
        }
        _.each(itemArray, function(result) {
            promise = promise.then(function() {
                //生成一个新的用户数据行,userInfo是数据库中对应的数据格式
                var tempItemInfo = new itemInfo();
                //保存每一个用户
                addPromises.push(tempItemInfo.save(result));
            });
        });


        //添加新的记录类型
        var promise1 = Bmob.Promise.as();
        //保存所有用户信息的array
        var recordArray = [];
        //遍历用户ul获取用户信息
        for(var i=0,len=item_li1.length;i<len;i++){
            var tempItemInfo1 = getInnerText(item_li1[i]);
            var itemObj1 = {
                name:tempItemInfo1,
                group:group
            };
            recordArray.push(itemObj1);
        }
        _.each(recordArray, function(result) {
            promise1 = promise1.then(function() {
                //生成一个新的用户数据行,userInfo是数据库中对应的数据格式
                var tempItemInfo = new itemInfo1();
                //保存每一个用户
                addPromises.push(tempItemInfo.save(result));
            });
        });

        //添加组别信息
        var itemGroupInfo = Bmob.Object.extend('group');
        var groupObj = {
            group_code:group,
            group_name:groupNameValue
        };
        var newGroup = new itemGroupInfo();
        addPromises.push(newGroup.save(groupObj));

        //添加公告信息
		var ContentInfo = Bmob.Object.extend('announcement');
		var queryItemContentInfo = new Bmob.Query(ContentInfo);
		var promise3 = queryItemContentInfo.first({
			success: function(object) {
				// 查询成功
				object.set('content', announcementContent);
				object.save();
			},
			error: function(error) {
				alert("查询失败: " + error.code + " " + error.message);
			}
		});
		addPromises.push(promise3);




		//4种数据都保存成功
        Bmob.Promise.when(addPromises).then(function(){
            showConfirmOnlyModal('保存成功!',function(){
                $('.overlay').css('display','none');
                $('#modal_confirm_only').css('display','none');
                window.location.reload();
            });
        });

    });
}

$('#save_config').click(function(){
    //保存记录
    saveItem();
});

//初始化每一项的通用函数,itemKey为数据库表名称
function initConfigList(tableName,itemId){
    //从数据库获取相应信息
    var item = Bmob.Object.extend(tableName);
    var queryItem = new Bmob.Query(item);
    queryItem.equalTo('group',group);
    queryItem.find().then(function(results){
        for(var i=0;i<results.length;i++){
            //注意name是在所有config表里都存在的字段，表示名字
            var itemName = results[i].get('name');
            var li = $("<li></li>");
            li.text(itemName);
            li.click(function () {
               $(this).remove();
            });
            $('#'+itemId).append(li);
        }
    })
}
//初始化组别信息
function initGroupName(){
    var item = Bmob.Object.extend('group');
    var queryItem = new Bmob.Query(item);
    queryItem.find().then(function(results){
        for(var i=0;i<results.length;i++){
            if(results[i].get('group_code') == group) {
                $('#group').val(results[i].get('group_name'));
            }
            var group_name = results[i].get('group_name');
            var group_code = results[i].get('group_code');
            allGroupObj[group_code] = group_name;
        }
    })
}

//初始化公告信息
function initAnnouncement(){
	var ContentInfo = Bmob.Object.extend('announcement');
	var queryItemContentInfo = new Bmob.Query(ContentInfo);
	//first只查询一条数据
	queryItemContentInfo.first({
		success: function(object) {
			// 查询成功
			$('#announcement').val(object.get('content'));
		},
		error: function(error) {
			alert("查询失败: " + error.code + " " + error.message);
		}
	});
}

//初始化
$(document).ready(function(){
    //判断身份是否是超管,不是的直接返回主页，防止地址栏直接登入此页面
    if(getCookie('authority') != '2'){
        window.location.href = './../index.html';
    }
    //获取组别信息
    group = getCookie('group');
    //初始化车间名字
    initConfigList(workshopName,'workshop_ul');
    //初始化记录类型
    initConfigList(recordType,'record_ul');
    //初始化组别名字
    initGroupName();
    //初始化公告
	initAnnouncement()
});



