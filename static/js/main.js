/**
 *index.html页面用到的全局变量以及初始化
 */
//localStorage用来存储登录框中用户名，只要用户登录成功，该名字就会被存储起来
var ls = window.localStorage;
//bmob云存储初始化
Bmob.initialize("e0a51a8e943e642a0269d0925d9e9688", "9335d129f2514d28bb20174d65dd75f5");
//是否在搜索过程中，防止二次点击出现2次相同的结果叠加
var isInSearch = false;
//修改状态下添加图片的按钮,记录是哪一行tr点了添加,这里有点问题，得用数字记录是第几行
var trInModify = null;
var trInModifyIndex = 0;
//修改状态下添加图片的按钮,记录是哪一行td点了添加
var tdInModify = null;
//图片添加状态下点击保存图片url的变量
var imagePathInModify = '';
//只用记录下点击的button，onclick不变，变的是颜色和文字
var imageAddModifyButton = null;
//分页处理：记录当前是第几页,初始为第一页
var currentPageIndex = 1;
//每一页最大记录条数
var maxRecordsPerPage = 17;
//判断是否进入修改状态的变量
var isInModify = false;
//当前所选的年月,员工
var currentMonthValue = '';
var currentYearValue = '';
var currentStaffValue = '';
//记录当月所有记录的数组，元素是一个object
var recordsOfCurrentMonth = [];
//要删除的行(记录),元素是id
var recordsToDelete = [];
//settimeout的id
var timeId = null;
//是否是只看未确认
var isOnlyNotConfirmed = false;
//是否处于搜全部的状态
var isInSearchAllState = false;
//是否显示模态框
var modalShow = false;
//记录是否是错误的点击
var isValidClick = true;
//内容记录的表格
var table = document.getElementById('content_table');
//未确认的总条数
var unconfirmedCount = 0;
//要添加或修改图片记录的id
var recordIdUsedByAddingModifying;
//存储当组用户名的列表
var groupUserList = [];

//处理下拉框日期部分
//年份下拉按钮
$('.dropBoxButton_year').click(function(){
    if($('.year_choice').css('display')==='none'){
        $('.year_choice').slideDown(200);
    }
    else{
        $('.year_choice').slideUp(200)
    }
});

//年份下拉按钮每一项li选中也要隐藏下拉框
$('.year_choice li').each(function(index,element){
    $(element).click(function(){
        $('.year_choice').slideUp(200)
        $('.yearInput').val($(element).text());
    })
});

//月份下拉按钮
$('.dropBoxButton_month').click(function(){
    if($('.month_choice').css('display')==='none'){
        $('.month_choice').slideDown(200);
    }
    else{
        $('.month_choice').slideUp(200)
    }
});

//月份下拉按钮每一项li选中也要隐藏下拉框
$('.month_choice li').each(function(index,element){
    $(element).click(function(){
        $('.month_choice').slideUp(200)
        //注意这里不能用attr('value',...),会导致无法设置input的value
        $('.monthInput').val($(element).text());
    })
});

//人员下拉按钮
$('.dropBoxButton_staff').click(function(){
    //登录了才能操作
    if(getCookie('username')) {
        //如果该下拉列表为空，则提示添加人员
        if(groupUserList.length == 0){
            showConfirmOnlyModal('用户列表空，请添加用户~',function(){
                $('.overlay').css('display','none');
                $('#modal_confirm_only').css('display','none');
            })
            return;
        }

        if ($('.staff_choice').css('display')==='none') {
            $('.staff_choice').slideDown(200);
        }
        else {
            $('.staff_choice').slideUp(200);
        }
    }else{
        showConfirmOnlyModal('请登录后查看用户名~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        })
    }
});

//搜索：只看未确认
$('.search').mouseover(function(){
    //不是普通用户
    if(getCookie('authority') != '0') {
        $('.only_search_unconfirmed').css('display', 'block');
        //清除计时器
        clearTimeout(timeId);
        //3秒后隐藏对话框
        timeId = setTimeout(function () {
            $('.only_search_unconfirmed').css('display', 'none');
        }, 3000);
    }
});

//按月份搜
$('.search').click(function(){
    //显示修改按钮
    $('#modify').show();
    //隐藏只看未确认按钮
    $('.only_search_unconfirmed').css('display','none');
    //判断用户是否登录
    var userCookie = getCookie('username');
    if(!userCookie){
        showConfirmOnlyModal('温馨提示:请登录后再操作~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
            window.location.reload();
        });
        return;
    }
    var monthValue = $('.monthInput').val().trim();
    var yearValue = $('.yearInput').val().trim();
    var staffValue = $('.staffInput').val().trim();
    //年月只选了一个  或者  3个都没选,注意这里异或优先级很低,必须加括号，还有异或2个数字得首先转化为true和false
    if((((!!monthValue)^(!!yearValue)) !==0)||(!monthValue && !yearValue && !staffValue)){
        showConfirmOnlyModal('请同时输入年份和月份！',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        });
        return;
    }else {
        currentMonthValue = monthValue;
        currentYearValue = yearValue;
        currentStaffValue = staffValue;
        //重置currentPageIndex,否则无法搜到数据
        currentPageIndex = 1;
        //如果不在搜索过程中
        if(!isInSearch) {
            searchRecordData(yearValue, monthValue, false);
        }
    }
});

//搜索普通用户的全部记录
$('.search_all_btn').click(function(){

    //判断用户是否登录
    var userCookie = getCookie('username');
    if(!userCookie){
        showConfirmOnlyModal('温馨提示:请登录后再操作~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        });
        return;
    }
    if(!isInSearch) {
        isInSearchAllState = true;
        searchRecordData('', '', true);
    }
});

//普通用户的只看未确认
$('.search_all_btn').mouseover(function(){
    //修正只看未确认按钮的位置
    $('.only_search_unconfirmed').css('display','block');
    $('.only_search_unconfirmed').css('width','100px');
    $('.only_search_unconfirmed').css('height','30px');
    $('.only_search_unconfirmed').css('position','absolute');
    $('.only_search_unconfirmed').css('z-index','200');
    $('.only_search_unconfirmed').css('left','850px');
    $('.only_search_unconfirmed').css('top','100px');
    clearTimeout(timeId);
    //3秒后隐藏对话框
    timeId = setTimeout(function () {
        $('.only_search_unconfirmed').css('display', 'none');
    }, 3000);
});



//根据年月查询数据
function searchRecordData(year,month,isSearchAll){
    //清空记录
    recordsOfCurrentMonth = [];
    //进入搜索过程
    isInSearch = true;
    //检查cookie是否过期
    //用户名
    var username = '';
    //用户权限
    var userAuthority = '';
    if(!checkCookie('username')){
       showConfirmOnlyModal('请重新登录~',function(){
           $('.overlay').css('display','none');
           $('#modal_confirm_only').css('display','none');
           window.location.reload();
       })
    }else{
        username = getCookie('username');
        userAuthority = getCookie('authority');
    }
    //清空标题
    $('.content_table_title').text('');
    //格式化年月
    var dateStr = year + '-' + month;
    //由得到的数据填充table
    var table = document.getElementById('content_table');
    //首先清空原有table
    while(table.children.length>0){
        table.removeChild(table.children[0]);
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
    var th6 = document.createElement('th');
    setInnerText(th6,'图片')
    var th7 = document.createElement('th');
    setInnerText(th7,'确认')

    tableHead.appendChild(th1);
    tableHead.appendChild(th2);
    tableHead.appendChild(th3);
    tableHead.appendChild(th4);
    tableHead.appendChild(th5);
    tableHead.appendChild(th6);
    tableHead.appendChild(th7);
    tbody.appendChild(tableHead);

    //从云端数据库搜索自己的记录
    var ownRecords = Bmob.Object.extend('record');
    var queryOwnRecords = new Bmob.Query(ownRecords);

    //分页查询,每页最多显示17条,这里是显示第一页
    queryOwnRecords.limit(maxRecordsPerPage);
    //这里要跳过多少页查询,初始状态currentPageIndex为1，所以skip 0条记录
    queryOwnRecords.skip(maxRecordsPerPage*(currentPageIndex-1));
    //按日期升序排列
    queryOwnRecords.ascending("date");

    //是否是只看未确认
    isOnlyNotConfirmed = $('#only_search_unconfirmed').prop('checked');
    if(isOnlyNotConfirmed){
        queryOwnRecords.equalTo('isConfirm','0');
    }
    //普通用户
    if(userAuthority == '0' ) {
        //只按年月搜索
        if(!isSearchAll) {
            //不是处于搜全部的状态
            isInSearchAllState = false;
            //startsWith方法有毒，咋试咋不对,只能再记录一个月份
            queryOwnRecords.equalTo('monthDate', dateStr);
            //只查询自己的记录
            queryOwnRecords.equalTo('username', username);
            //设置记录标题
            $('.content_table_title').text(username+year+'年'+month+'月错误记录详情');
        }
        //搜全部记录
        else{
            //只查询自己的记录
            queryOwnRecords.equalTo('username', username);
            //设置记录标题
            $('.content_table_title').text(username+'的所有错误记录详情');
        }
        //统计总页数,这里要测试一下
        queryOwnRecords.count({
            success:function(count){
                $('#totalPageNum').text('共'+(Math.ceil(count/maxRecordsPerPage))+'页');
            }
        })
        queryOwnRecords.find({
            success:function(results){
                //查到数据
                if(results.length>0) {
                    //未确认的记录
                    var recordsNotConfirmCount = 0;
                    for (var i = 0; i < results.length; i++) {
                        var obj = results[i];
                        //构造tr
                        var tr = document.createElement('tr');
                        //分别构造td
                        var tdList = ['username', 'date', 'workshop', 'type', 'error', 'imageUrl','isConfirm'];
                        for (var j = 0; j < tdList.length; j++) {
                            var td = document.createElement('td');
                            //确认一栏需要添加按钮来确认是否确定,如果isConfirm是0，则显示按钮，否则显示已确认
                            if(j==tdList.length-1){
                                //未确认
                                if(obj.get('isConfirm')=='0') {
                                    recordsNotConfirmCount++;
                                    var button = document.createElement('button');
                                    button.setAttribute("class", "confirmButton btn btn-success");
                                    //添加点击函数
                                    //保存该条记录的id,这个是bmob的方法
                                    var recordId = obj.id;
                                    (function(id,td,button){
                                        button.onclick = function(){
                                            //模态框,这里有error出现，但不知道为啥
                                            showModalConfirmAndCancel('该操作不可逆，确认继续？后续修改请联系管理员',function(){
                                                var Records = Bmob.Object.extend('record');
                                                var queryRecords = new Bmob.Query(Records);
                                                $(button).attr({'disabled':'disabled'});
                                                queryRecords.get(id,{
                                                    success:function(record){
                                                        //修改后端确认状态为已确认
                                                        record.set('isConfirm','1');
                                                        record.save();
                                                        //修改前端状态为已确认
                                                        td.removeChild(button);
                                                        setInnerText(td,'已确认');
                                                        //修改div的标题
                                                        var title = '当页错误记录共计: '+results.length+'条, 未确认: '+(--recordsNotConfirmCount)+'条'
                                                        $('.title_left_description').text(title);
                                                        //修改红点以及tab提示
                                                        $('.redSpot').text(recordsNotConfirmCount);
                                                        $('.unconfirmedTab').text('您有'+recordsNotConfirmCount+'条记录未确认~');
                                                        if(recordsNotConfirmCount == 0){
                                                            $('.redSpot').css('display','none');
                                                            $('.unconfirmedTab').css('display','none');
                                                        }
                                                        $('.overlay').css('display','none');
                                                        $('#modal_confirm').css('display','none');

                                                    },
                                                    error:function(object,error){
                                                        showConfirmOnlyModal('保存出错，请重试~',function(){
                                                            $('.overlay').css('display','none');
                                                            $('#modal_confirm_only').css('display','none');
                                                        })
                                                    }
                                                })
                                            })

                                        }
                                    })(recordId,td,button);
                                    setInnerText(button,'确认');
                                    td.appendChild(button)
                                }else{
                                    //已确认的情况
                                    setInnerText(td, '已确认');
                                }
                            }
                            //如果是图片查看这一列
                            else if(j==tdList.length-2){
                                //如果没有图片显示:无,但是超管的话要显示添加图片按钮
                                var image = obj.get('imageUrl');
                                if(image == ''){
                                    setInnerText(td,'无')
                                }else{
                                    var picButton = document.createElement('button');
                                    picButton.setAttribute('class','confirmButton btn btn-warning');
                                    //闭包里使用外部参数必须匿名函数传参数
                                    (function(img){
                                        picButton.onclick = function(){
                                            //弹出遮罩
                                            $('.overlay').css('display','block');
                                            //注意这里的路径：没有添加../因为这里要css的方法是指定内联样式，所以根路径是index.html的路径
                                            $('.overlay').css('background',"rgba(0, 0, 0, 0.5) url('./static/image/close.png') right top no-repeat")
                                            //显示图片
                                            $('#recordImage').attr('src',img);
                                            //设置图片固定长宽，防止图片太大遮住全部
                                            $('#recordImage').attr('width','800px');
                                            $('#recordImage').attr('height','600px');
                                            $('.overlay').click(function(){
                                                $('.overlay').css('display','none');
                                                $('.overlay').css('background',"rgba(0, 0, 0, 0.5)");
                                                $('#recordImage').attr('src','');
                                                //移除click事件,如果不加上则会导致点击查看图片按钮后，再次出现overlay点击都会消失
                                                $('.overlay').unbind("click");
                                            });
                                        }
                                    })(image);
                                    setInnerText(picButton,'查看');
                                    td.appendChild(picButton);
                                }
                            }
                            else{
                                setInnerText(td, obj.get(tdList[j]));
                                //第一列且是重要的记录才显示标签
                                if(j==0 && obj.get('isImportant')=='1'){
                                    $(td).css('position','relative');
                                    //生成一个img
                                    var isImportantDiv = document.createElement('img');
                                    //设置css
                                    $(isImportantDiv).css('position','absolute');
                                    $(isImportantDiv).css('left','-40px');
                                    $(isImportantDiv).css('top','2px');
                                    $(isImportantDiv).attr('src',"./static/image/important.png");
                                    $(isImportantDiv).attr('border','0');
                                    //添加标志
                                    td.appendChild(isImportantDiv);
                                }
                            }
                            //添加td到tr
                            tr.appendChild(td);
                        }
                        //添加tr到tbody
                        tbody.appendChild(tr);
                    }
                    //多了个tbody，注意了,自动加上的
                    table.appendChild(tbody);
                    //修改div的标题
                    var title = '当页错误记录共计: '+results.length+'条, 未确认: '+recordsNotConfirmCount+'条';
                    $('.title_left_description').text(title);
                    //显示分页
                    $('.pagination').css('display','block');
                    //显示当前页
                    $('#currentPageNum').text('第'+currentPageIndex+'页');
                    //隐藏empty.png(无数据的背景图片)
                    $('.content').css('background-image','none');
                }
                //未查到数据
                else{
                    var title = '当月错误记录';
                    $('.title_left_description').text(title);
                    $('.content_table_title').text('');
                    //隐藏分页
                    $('.pagination').css('display','none');
                    showConfirmOnlyModal('未找到数据,请重新输入年月或者姓名~',function(){
                        $('.overlay').css('display','none');
                        $('#modal_confirm_only').css('display','none');
                    })
                    //显示empty.png(无数据的背景图片)
                    $('.content').css('background-image','url(./static/image/empty.png)');

                }
                //完成搜索
                isInSearch=false;
            }
        });
    }
    //超级管理员和二级管理员
    else {
        //这里要按组别查看，超管和二级管理员先获取到自己的组别，再过滤搜索
        //此处是搜寻用户名在组别用户列表中的用户
        queryOwnRecords.containedIn("username", groupUserList);
        //这里要加上按人查看,获取人员输入input的值，判断是否为空
        //如果有人员，则加上筛选条件
        var staffName = currentStaffValue;
        if(staffName !== ''){
            queryOwnRecords.equalTo('username',staffName);
        }
        //只按月份查看,这里嘘需要判断是否选择了年月
        if(dateStr!=='-'){
            queryOwnRecords.equalTo('monthDate', dateStr);
        }

        //统计总页数
        queryOwnRecords.count({
            success:function(count){
                $('#totalPageNum').text('共'+Math.ceil(count/maxRecordsPerPage)+'页');
            }
        })

        //处理错误记录标题，要分类处理
        //1:没选员工，只按年月查看
        if(staffName == ''){
            $('.content_table_title').text(year+'年'+month+'月所有员工错误记录详情(第'+currentPageIndex+'页)');
            $('.current_month_records_count_button').css('display','block');
            $('.current_month_records_count_button_important').css('display','block');
        //2:选了员工，没选年月
        }else if(staffName!='' && dateStr=='-'){
            $('.content_table_title').text('员工 '+currentStaffValue+' 的全部错误记录详情');
        //3:选了员工，也选了年月
        }else {
            $('.content_table_title').text('员工 '+currentStaffValue+' '+year+'年'+month+'月错误记录详情');
        }

        queryOwnRecords.find({
            success:function(results){
                //查到数据
                if(results.length>0) {
                    //未确认的记录
                    var recordsNotConfirmCount = 0;
                    for (var i = 0; i < results.length; i++) {
                        var obj = results[i];
                        //加入数组,为了后面删除做准备,另外一个作用是重新构建table(修改模式下)
                        recordsOfCurrentMonth.push(obj);
                        //获取该行的id,后面保存时要根据id保存
                        var recordId = obj.id;
                        //构造tr
                        var tr = document.createElement('tr');
                        //分别构造td
                        var tdList = ['username', 'date', 'workshop', 'type', 'error', 'imageUrl','isConfirm'];
                        for (var j = 0; j < tdList.length; j++) {
                            var td = document.createElement('td');
                            //确认一栏需要添加按钮来确认是否确定,如果isConfirm是0，则显示按钮，否则显示已确认
                            if(tdList[j]=='isConfirm'){
                                //未确认
                                if(obj.get('isConfirm')=='0') {
                                    //颜色红色
                                    $(td).css('color','#d31723')
                                    setInnerText(td,'未确认');
                                    recordsNotConfirmCount++;
                                //已确认则显示修改
                                }else{
                                    //颜色绿色
                                    $(td).css('color','#33b829')
                                    setInnerText(td,'已确认');
                                }
                            //如果是图片查看这一列
                            }
                            else if(tdList[j]=='imageUrl'){
                                //如果没有图片显示:无,但是超管的话要显示添加图片按钮
                                var imagePath = obj.get('imageUrl');
                                if(imagePath == ''){
                                    setInnerText(td,'无');
                                }else{
                                    var buttonView = document.createElement('button');
                                    buttonView.setAttribute("class", "confirmButton btn btn-success");
                                    //添加点击函数
                                    //闭包里使用外部参数必须匿名函数传参数
                                    (function(img){
                                        buttonView.onclick = function(){
                                            //弹出遮罩
                                            $('.overlay').css('display','block');
                                            //注意这里的路径：没有添加../因为这里要css的方法是指定内联样式，所以根路径是index.html的路径
                                            $('.overlay').css('background',"rgba(0, 0, 0, 0.5) url('./static/image/close.png') right top no-repeat")
                                            //显示图片
                                            $('#recordImage').attr('src',img);
                                            //设置图片固定长宽，防止图片太大遮住全部
                                            $('#recordImage').attr('width','800px');
                                            $('#recordImage').attr('height','600px');
                                            $('.overlay').click(function(){
                                                $('.overlay').css('display','none');
                                                $('.overlay').css('background','rgba(0, 0, 0, 0.5)');
                                                $('#recordImage').attr('src','');
                                                //移除click事件,如果不加上则会导致点击查看图片按钮后，再次出现overlay点击都会消失
                                                $('.overlay').unbind("click");
                                            });
                                        }
                                    })(imagePath);
                                    setInnerText(buttonView,'查看');
                                    td.appendChild(buttonView)
                                }

                            }
                            else{
                                setInnerText(td, obj.get(tdList[j]));
                                //第一列且是重要的才显示标签
                                if(j==0 && obj.get('isImportant')=='1'){
                                    $(td).css('position','relative');
                                    //生成一个img
                                    var isImportantDiv = document.createElement('img');
                                    //设置css
                                    $(isImportantDiv).css('position','absolute');
                                    $(isImportantDiv).css('left','-40px');
                                    $(isImportantDiv).css('top','2px');
                                    $(isImportantDiv).attr('src',"./static/image/important.png");
                                    $(isImportantDiv).attr('border','0');
                                    //添加标志
                                    td.appendChild(isImportantDiv);
                                }
                            }
                            //添加td到tr
                            tr.appendChild(td);
                        }
                        //添加一个内容为id的td，隐藏不显示，是为了后面获取id
                        var idTd = document.createElement('td');
                        setInnerText(idTd,recordId);
                        $(idTd).css('display','none');
                        tr.appendChild(idTd);
                        //添加每一行
                        tbody.appendChild(tr);
                    }
                    //多了个tbody，注意了,自动加上的
                    table.appendChild(tbody);
                    //修改div的标题
                    var title = '当页错误记录共计: '+results.length+'条, 未确认: '+recordsNotConfirmCount+'条'
                    $('.title_left_description').text(title);
                    //显示分页
                    $('.pagination').css('display','block');
                    //显示当前页
                    $('#currentPageNum').text('第'+currentPageIndex+'页');
                    //隐藏empty.png(无数据的背景图片)
                    $('.content').css('background-image','none');

                }
                //未查到数据
                else{
                    var title = '当月错误记录';
                    $('.title_left_description').text(title);
                    $('.content_table_title').text('');
                    $('.current_month_records_count_button').css('display','none');
                    $('.current_month_records_count_button_important').css('display','none');
                    //隐藏分页
                    $('.pagination').css('display','none');
                    showConfirmOnlyModal('未找到数据,请重新输入年月或者姓名~',function(){
                        $('.overlay').css('display','none');
                        $('#modal_confirm_only').css('display','none');
                    })
                    //显示empty.png(无数据的背景图片)
                    $('.content').css('background-image','url(./static/image/empty.png)');
                }
                //完成搜索
                isInSearch=false;

            },
            error:function(error){
               alert('查找失败!')
            }

        });
    }

}
//分页处理
//上一页
$('#prevPage').click(function(){
    //清空当前保存记录的数组，否则进入修改状态就乱了
    recordsOfCurrentMonth = [];
    //如果是第一页则禁用该按钮
    if(currentPageIndex == 1){
        showConfirmOnlyModal('已经是第一页了~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        })
        return;
    }else{
        currentPageIndex--;
        //这里要判断普通用户搜索全部按钮的逻辑
        if(isInSearchAllState) {
            searchRecordData('', '', true);
        }else{
            searchRecordData(currentYearValue, currentMonthValue, false);
        }
    }
});

//下一页
$('#nextPage').click(function(){
    //清空当前保存记录的数组，否则进入修改状态就乱了
    recordsOfCurrentMonth = [];
    //获取总页码
    var totalPageNumTextStr = $('#totalPageNum').text();
    var totalPageNum = '';
    for(var i=0;i<totalPageNumTextStr.length;i++){
        if(i!==0 && i!==totalPageNumTextStr.length-1){
            totalPageNum+=totalPageNumTextStr[i];
        }
    }
    totalPageNum = parseInt(totalPageNum);
    //如果是最后一页则禁用该按钮
    if(currentPageIndex == totalPageNum){
        showConfirmOnlyModal('已经是最后一页了~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        });
        return;
    }else{
        currentPageIndex++;
        //这里要判断普通用户搜索全部按钮的逻辑
        if(isInSearchAllState) {
            searchRecordData('', '', true);
        }else{
            searchRecordData(currentYearValue, currentMonthValue, false);
        }
    }
});

//跳转指定页数的按钮
$('#goToPage').click(function(){
    //清空当前保存记录的数组，否则进入修改状态就乱了
    recordsOfCurrentMonth = [];
    //获取input的值
    var inputPageIndex = $('#pageIndex').val();
    //获取总页码
    var totalPageNumTextStr = $('#totalPageNum').text();
    var totalPageNum = '';
    for(var i=0;i<totalPageNumTextStr.length;i++){
        if(i!==0 && i!==totalPageNumTextStr.length-1){
            totalPageNum+=totalPageNumTextStr[i];
        }
    }
    totalPageNum = parseInt(totalPageNum);
    //判断输入是否合理,输入的不是数字parseint后会变为NaN
    if(!isNaN(parseInt(inputPageIndex))){
        var t = parseInt(inputPageIndex);
        if(t>=1 && t<=totalPageNum){
            currentPageIndex = t;
            searchRecordData(currentYearValue,currentMonthValue,false);
        }else{
            showConfirmOnlyModal('输入非法~',function(){
                $('.overlay').css('display','none');
                $('#modal_confirm_only').css('display','none');
            })
        }
    }else{
        showConfirmOnlyModal('输入非法~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        })
    }
});

//打印机提示
$('.printer').mouseover(function(){
    $('.printer_description').css('display','block');
});

$('.printer').mouseout(function(){
    $('.printer_description').css('display','none');
});

$('.printer').click(function(){
    if(!getCookie('username')){
        showConfirmOnlyModal('请登录后操作~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        });
        return;
    }
    //如果没有搜索到数据则不能打印
    if (table.children.length === 0) {
        showConfirmOnlyModal('当月错误记录为空，无法打印~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        });
        return;
    }
    //打印当前区域
    var extraCss = './static/css/main.css';
    $(".print_area").printArea({extraCss:extraCss});
});


//登录按钮
$('#login').click(function(){
    if(!modalShow){
        $('.overlay').css('display','block');
        $('#modal_login').addClass('md-show');
        $('#modal_login').css('display','block');
        //查找localStorage取得用户名
        var username = ls.getItem('username');
        if(username){
            $("[name='loginname']").val(username);
        }
    }
});

//对话框关闭
$('.md-close').click(function(){
    $('#modal_login').removeClass('md-show')
    $('#modal_login').css('display','none');
    $('.overlay').css('display','none');
});

//登录处理
function loginHandler(){
    //按钮变为登录中
    $('#loginButton').text('登录中...')
    //错误提示
    var errorTip = document.getElementById('errorTip');
    //用户权限
    var authority = '';
    //获取输入框内的用户名和密码
    var username = document.getElementsByName('loginname')[0].value;
    var password = document.getElementsByName('password')[0].value;
    //从bmob云数据库查询用户名和密码
    var userInfo = Bmob.Object.extend('user');
    var queryUser = new Bmob.Query(userInfo);
    //and查询:用户名和密码都相等的
    queryUser.equalTo("username", username);
    queryUser.equalTo('password',password);
    // 查询所有数据
    queryUser.find({
        //注意，不能在find函数后面再写逻辑，应该在success里写，因为是异步调用
        success: function(results) {
            //查询成功,注意查不到不代表进入error回调函数
            if(results.length>0) {
                //存储用户名到localStorage
                ls.setItem('username',username);
                //理论上只能查到一条,用户名是唯一的
                var object = results[0];
                //获取用户权限
                authority = object.get('authority');
                //登录成功
                $('#modal_login').removeClass('md-show');
                $('.overlay').css('display','none');
                //设置cookie
                //cookie过期时间
                var timeToExpire = 3000;
                setCookie('username',username,timeToExpire);
                //设置权限信息
                setCookie('authority',authority,timeToExpire);
                //存储组别信息
                var group = object.get('group');
                setCookie('group',group,timeToExpire);

                //刷新页面
                window.location.reload();

            }else{
                //登录失败
                toggleClass(errorTip,'error-show');
                //按钮变为登录中
                $('#loginButton').text('登录')
            }
        },
        error: function(error) {
            alert("登录失败: " + error.code + " " + error.message);
        }
    });
}
//登录按钮
$('#loginButton').click(function(){
    loginHandler();
});

//回车也会触发登录
$(document).keydown(function(event){
    var e = event || window.event ;
    //回车键
    if(e && e.keyCode==13){
        loginHandler();
    }
});

//显示不同内容的模态框(确定取消类型)
function showModalConfirmAndCancel(titleContent,funcConfirm){
    //显示遮罩和模态框
    $('.overlay').css('display','block');
    $('#modal_confirm').slideDown(200);
    //$('#modal_confirm').css('display','block');
    //改变标题
    $('#modal_confirm .modal-title').text(titleContent);

    //确认按钮绑定的函数,参数是函数
    $('#modal-confirm-button').click(funcConfirm);

    //取消按钮绑定的函数
    $('#modal-cancel-button').click(function(){
        $('.overlay').css('display','none');
        $('#modal_confirm').css('display','none');
    })
}

//登出
$('#logout').click(function(){
    showModalConfirmAndCancel('确认退出平台?',function(){
        //删除cookie
        delCookie('username');
        delCookie('authority');
        //刷新页面
        window.location.reload();
    });
});

//body加载时检查cookie
$(document).ready(function(){

    //初始化姓名列表
    initUsernameDropDownList();
    //修改状态初始化
    isInModify=false;
    //这里只判断了username，但是username和权限cookie的时间是一样的
    var hasCookie = checkCookie('username');
    if(hasCookie) {
        $('#login').css('display','none');
        $('#logout').css('display','block');
        //显示用户名
        var username = getCookie('username');
        //权限
        var userauthority = getCookie('authority');
        var userauthorityName = '';
        if (userauthority == '2') {
            userauthorityName = '超级管理员 ';
        } else if (userauthority == '1') {
            userauthorityName = '二级管理员 ';
        } else {
            userauthorityName = '用户 ';
            //修改原来的搜索区域css
            $('.monthSelect').css('width', '78%');
            $('.search').css('width', '150px');
            $('.search').css('margin-right', '35px');
            //添加一个搜索全部的div
            $('#div_search_all').css('display', 'block');
            $('#div_search_all').css('top', '-1px');
            //隐藏按人搜索的div
            $('.staff_select').css('display','none');
            //隐藏打印按钮
            $('.printer').css('display','none');
        }
        //所有用户都可以看到的：频率统计
        var recordGraphButton = document.createElement('a');
        recordGraphButton.setAttribute('class', 'alreadyLoginButton');
        setInnerText(recordGraphButton, '统计图表')
        recordGraphButton.setAttribute('id', 'graph');
        recordGraphButton.onclick = function () {
            window.location.href = './views/graph.html';
        }
        var bannerButton = document.getElementsByClassName('bannerButton')[0];
        bannerButton.appendChild(recordGraphButton);
        //登录才显示的按钮,超管才能看到
        if (userauthority == '2') {
            //必须动态添加，不能隐藏显示，这样有漏洞
            var settingButton = document.createElement('a');
            settingButton.setAttribute('class', 'alreadyLoginButton');
            setInnerText(settingButton, '设置信息')
            settingButton.setAttribute('id', 'setting');
            settingButton.onclick = function () {
                window.location.href = './views/setting.html';
            }
            bannerButton.appendChild(settingButton);

            var addItemButton = document.createElement('a');
            addItemButton.setAttribute('class', 'alreadyLoginButton');
            setInnerText(addItemButton, '添加记录')
            addItemButton.setAttribute('id', 'addItem');
            addItemButton.onclick = function () {
                window.location.href = './views/addItem.html';
            }
            bannerButton.appendChild(addItemButton);

            //修改按钮处理
            var modifyButton = document.createElement('a');
            modifyButton.setAttribute('class', 'alreadyLoginButton');
            setInnerText(modifyButton, '修改记录');
            modifyButton.setAttribute('id', 'modify');
            modifyButton.onclick = function () {
                //如果没有搜索到数据则不能修改
                if (table.children.length === 0) {
                    showConfirmOnlyModal('当月错误记录为空，请先查询记录后再修改!',function(){
                        $('.overlay').css('display','none');
                        $('#modal_confirm_only').css('display','none');
                    });
                    return;
                }

                //隐藏页码按钮
                $('.pagination').css('display','none');
                //隐藏查看次数统计的按钮
                $('.current_month_records_count_button').css('display','none');
                $('.current_month_records_count_button_important').css('display','none');
                //隐藏打印按钮
                $('.printer').css('display','none');

                //只在遮罩上显示表格
                $('.content').css('z-index','500');
                //加上遮罩
                $('.overlay').css('display','block');
                $('.overlay').css('background','rgba(0, 0, 0, 0.5)');
                //置空点击函数，防止overlay消失
                $('.overlay').click(function(){
                });
                //显示保存和取消2个按钮
                $('.confirm_modify').css('display','block');
                $('.cancel_modify').css('display','block');
                isInModify = true;

                //清空原有表格并构建新表
                while (table.children.length > 0) {
                    table.removeChild(table.children[0]);
                }
                var tbody = document.createElement('tbody');
                //添加表头
                var tableHead = document.createElement('tr');
                var th1 = document.createElement('th');
                setInnerText(th1, '姓名')
                var th2 = document.createElement('th');
                setInnerText(th2, '日期')
                var th3 = document.createElement('th');
                setInnerText(th3, '车间')
                var th4 = document.createElement('th');
                setInnerText(th4, '类型')
                var th5 = document.createElement('th');
                setInnerText(th5, '错误说明')
                var th6 = document.createElement('th');
                setInnerText(th6, '图片')
                var th7 = document.createElement('th');
                setInnerText(th7, '确认')
                var th8 = document.createElement('th');
                setInnerText(th8, '删除该行')

                tableHead.appendChild(th1);
                tableHead.appendChild(th2);
                tableHead.appendChild(th3);
                tableHead.appendChild(th4);
                tableHead.appendChild(th5);
                tableHead.appendChild(th6);
                tableHead.appendChild(th7);
                tableHead.appendChild(th8);
                tbody.appendChild(tableHead);

                //构建新表,因为有几列要改，所以得重新构建
                for (var i = 0; i < recordsOfCurrentMonth.length; i++) {
                    var obj = recordsOfCurrentMonth[i];
                    //获取该行的id,后面保存时要根据id保存
                    var recordId = obj.id;
                    //构造tr
                    var tr = document.createElement('tr');
                    //获取图片url
                    var imagePath = obj.get('imageUrl');
                    //分别构造td
                    var tdList = ['username', 'date', 'workshop', 'type', 'error', 'imageUrl', 'isConfirm'];
                    for (var j = 0; j < tdList.length; j++) {
                        //未确认的记录
                        var recordsNotConfirmCount = 0;
                        var td = document.createElement('td');
                        //确认一栏需要添加按钮来确认是否确定,如果isConfirm是0，则显示按钮，否则显示已确认
                        if (tdList[j] == 'isConfirm') {
                            //未确认
                            if (obj.get('isConfirm') == '0') {
                                //颜色红色
                                $(td).css('color', '#d31723');
                                setInnerText(td, '未确认');
                                recordsNotConfirmCount++;
                                //已确认则显示修改
                            } else {
                                //显示取消确认按钮
                                var cancelConfirmButton = document.createElement('button');
                                setInnerText(cancelConfirmButton, '取消');
                                cancelConfirmButton.setAttribute('class', 'confirmButton btn btn-warning')
                                cancelConfirmButton.onclick = function () {
                                    var r = confirm('是否取消确认该条记录?');
                                    //如果取消确认，则按钮变成文字未确认
                                    if (r) {
                                        //前端删除按钮
                                        var parentTd = this.parentNode;
                                        parentTd.removeChild(this);
                                        $(parentTd).css('color', '#d31723');
                                        setInnerText(parentTd,'未确认');
                                        //后台处理这里不用管，到时候重新遍历table的时候根据该td的内容来保存
                                    }
                                }
                                td.appendChild(cancelConfirmButton);
                            }

                        }
                        //如果是图片查看这一列
                        else if (tdList[j] == 'imageUrl') {
                            //如果没有图片显示:无,但是超管的话要显示添加图片按钮
                            if (imagePath == '') {
                                //增加添加按钮
                                var buttonAdd = document.createElement('button');
                                buttonAdd.setAttribute("class", "confirmButton btn btn-success");
                                //将该行tr传递进去，赋值给全局变量，以此记录下是哪一行点击的添加图片按钮
                                (function(tr,td){
                                    buttonAdd.onclick = function(){
                                        //设置overlay的z-index高于表格div的z-index(500)
                                        $('.overlay').css('z-index','501');
                                        //显示添加图片的div，事先隐藏了
                                        $('.add_image_div').css('display','block');
                                        $('#add_image_preview').css('display', 'block');
                                        //不能点击保存，如果没上传图片
                                        $('#add_image_button_confirm').attr({'disabled':'disabled'});
                                        //获取最后一个td中的图片url，如果有则显示在添加图片
                                        var imageUrl = $(tr).children("td:last-child").text();
                                        //显示该图片,必须加判断，否则会显示找不到图片的img标签
                                        if(imageUrl){
                                            $('#add_image_preview').attr('src',imageUrl);
                                        }
                                        $('#add_image_preview').css('display','block');
                                        //获取图片框的长宽
                                        var imageWidth = $('.add_image_preview_area').width();
                                        var imageHeight = $('.add_image_preview_area').height();
                                        $('#add_image_preview').attr('width',imageWidth);
                                        $('#add_image_preview').attr('height',imageHeight);

                                        //保存tr,判断当前是第几个tr
                                        var currentTrIndex = $("#content_table tbody tr").index(tr);
                                        trInModifyIndex = currentTrIndex;
                                        trInModify = tr;
                                        //保存td
                                        tdInModify = td;
                                        //保存点击的按钮
                                        imageAddModifyButton = this;
                                        //保存记录id
                                        recordIdUsedByAddingModifying = recordId;
                                    }
                                })(tr,td);

                                setInnerText(buttonAdd, '添加');
                                td.appendChild(buttonAdd)
                            } else {
                                //添加修改按钮,里面图片url从该tr最后一个td获取
                                var buttonMod = document.createElement('button');
                                buttonMod.setAttribute("class", "confirmButton btn btn-warning");
                                //添加点击函数
                                (function(tr,td,recordId){
                                    buttonMod.onclick = function(){
                                        //设置overlay的z-index高于表格div的z-index(500)
                                        $('.overlay').css('z-index','501');
                                        //显示添加图片的div，事先隐藏了
                                        $('.add_image_div').css('display','block');
                                        //不能点击保存，如果没上传图片
                                        $('#add_image_button_confirm').attr({'disabled':'disabled'});

                                        //获取最后一个td中的图片url，如果有则显示在添加图片
                                        var imageUrl = $(tr).children("td:last-child").text();
                                        //显示该图片
                                        $('#add_image_preview').attr('src',imageUrl);
                                        $('#add_image_preview').css('display','block');
                                        //获取图片框的长宽
                                        var imageWidth = $('.add_image_preview_area').width();
                                        var imageHeight = $('.add_image_preview_area').height();
                                        $('#add_image_preview').attr('width',imageWidth);
                                        $('#add_image_preview').attr('height',imageHeight);

                                        //保存tr,判断当前是第几个tr
                                        var currentTrIndex = $("#content_table tbody tr").index(tr);
                                        trInModifyIndex = currentTrIndex;
                                        trInModify = tr;
                                        //保存td
                                        tdInModify = td;
                                        //保存点击的按钮
                                        imageAddModifyButton = this;
                                        //保存记录id
                                        recordIdUsedByAddingModifying = recordId;
                                    }
                                })(tr,td,recordId);
                                setInnerText(buttonMod, '修改');
                                td.appendChild(buttonMod);
                            }
                        }
                        else {
                            setInnerText(td, obj.get(tdList[j]));
                        }
                        //添加td到tr
                        tr.appendChild(td);
                    }
                    tbody.appendChild(tr);

                    //添加删除按钮
                    var deleteButton = document.createElement('button');
                    deleteButton.setAttribute("class", "deleteButton btn btn-danger");
                    setInnerText(deleteButton, '删除');
                    //添加点击函数,表头不能删除
                    deleteButton.onclick = function () {
                        var r = confirm('确认删除该条记录？');
                        if (r) {
                            //记录下要删除元素的id
                            var idToDelete = getInnerText(this.parentNode.nextSibling);
                            recordsToDelete.push(idToDelete);
                            //这里很奇怪，table的子元素给加了个tbody进来，bootstrap搞的鬼？？？？
                            var tbody = this.parentNode.parentNode.parentNode;
                            var parentNode = this.parentNode.parentNode;
                            tbody.removeChild(parentNode);
                        }

                    };


                    //新加td
                    var deleteTd = document.createElement('td');
                    deleteTd.appendChild(deleteButton);
                    tr.appendChild(deleteTd);




                    //tr.appendChild(deleteButton);

                    //添加一个内容为id的td，隐藏不显示，是为了后面获取id
                    var idTd = document.createElement('td');
                    setInnerText(idTd, recordId);
                    $(idTd).css('display', 'none');
                    tr.appendChild(idTd);

                    //添加保存图片url的td
                    var imgTd = document.createElement('td');
                    setInnerText(imgTd, imagePath);
                    $(imgTd).css('display', 'none');
                    tr.appendChild(imgTd);
                }
                table.appendChild(tbody);
            }
            bannerButton.appendChild(modifyButton);

            //添加用户按钮
            var addUserButton = document.createElement('a');
            addUserButton.setAttribute('class', 'alreadyLoginButton');
            setInnerText(addUserButton, '添加用户');
            addUserButton.setAttribute('id', 'addUser');
            addUserButton.onclick = function () {
                window.location.href = './views/adduser.html';
            };
            bannerButton.appendChild(addUserButton);

        }
        //查询该用户有几条未确认
        var userRecord = Bmob.Object.extend('record');
        var queryUserRecord = new Bmob.Query(userRecord);
        queryUserRecord.equalTo('username',username);
        queryUserRecord.equalTo('isConfirm','0');
        queryUserRecord.find({
            success:function(results){
                //找到数据
                if(results.length>0){
                    $('.redSpot').css('display','block');
                    $('.redSpot').text(results.length);
                    $('.unconfirmedTab').text('您有'+results.length+"条记录未确认~");
                    unconfirmedCount = results.length;
                }
                else{
                    $('.redSpot').css('display','none');
                }
            }
        })
        $('.loginedName').text('您好, ' + userauthorityName + username);
    }else{
        $('.loginedName').text('');
    }
});
//初始化人员姓名列表
function initUsernameDropDownList(){
    //从云端数据库查询人员姓名,除了超管和管理员
    var userInfo = Bmob.Object.extend('user');
    var queryUser = new Bmob.Query(userInfo);
    //获取组别信息,只能查看自己组别的成员
    var group = getCookie('group');
    queryUser.equalTo('group',group);
    //获取姓名下拉ul
    var usernameUl = document.getElementsByClassName('staff_choice')[0];
    queryUser.find({
        success:function(results){
            for(var i=0;i<results.length;i++){
                //普通员工
                if(results[i].get('authority')=='0'){
                    var username = results[i].get('username');
                    //加入到列表中供后面使用
                    groupUserList.push(username);
                    var li = document.createElement('li');
                    (function(username){
                        li.onclick = function(){
                            $('.staff_choice').slideUp(200);
                            $('.staffInput').val(username);
                        }
                    })(username);
                    setInnerText(li,username);
                    usernameUl.appendChild(li);
                }
            }

        }
    })
}

//取消修改按钮处理
$('#cancel_modify').click(function(){
    //显示打印按钮
    $('.printer').css('display','block');
    //恢复变量(日期合法输入)
    isValidClick = true;
    $('.content').css('z-index','0');
    $('.overlay').css('display','none');
    $('.confirm_modify').css('display','none');
    $('.cancel_modify').css('display','none');
    isInModify=false;
    //关闭提示框
    $('.modify_tips').css('display','none');
    //清空要删除记录的数组
    recordsToDelete = [];
    recordsOfCurrentMonth = [];
    //重新查找数据，恢复原来的table
    searchRecordData(currentYearValue,currentMonthValue,false);

});

//确认修改按钮
$('#confirm_modify').click(function(){
    //如果是日期的非法修改
    if(!isValidClick){
        alert('请输入正确日期!');
        return;
    }
    $('.printer').css('display','block');
    $('.content').css('z-index','0');
    $('.overlay').css('display','none');
    $('.confirm_modify').css('display','none');
    $('.cancel_modify').css('display','none');

    //从云端数据库搜索全部记录，然后删除要删除的，其余的修改
    var Records = Bmob.Object.extend('record');
    var queryRecords = new Bmob.Query(Records);

    //并行的promises
    var promises = [];
    //删除要删除的tr,recordsToDelete里面存放记录的id
    for(var i=0;i<recordsToDelete.length;i++){
        var p = queryRecords.get(recordsToDelete[i],{
            success:function(obj){
                obj.destroy();
            }
        });
        promises.push(p);
    }

    //遍历table所有行，根据每行的记录id来get到该记录并改写，然后保存
    //从当前table生成新的数据
    var trs = table.getElementsByTagName('tr');
    //遍历table的每一行
    var name,date,workshop,type,error,recordId,imagePath,isConfirm;
    for(var k=0,len=trs.length;k<len;k++){
        //表头不能统计
        if(k>0){
            var tds = trs[k].getElementsByTagName('td');
            //取到每个td的innerText
            name = getInnerText(tds[0]);
            date = getInnerText(tds[1]);
            workshop = getInnerText(tds[2]);
            type = getInnerText(tds[3]);
            error = getInnerText(tds[4]);
            recordId = getInnerText(tds[8]);
            imagePath = getInnerText(tds[9]);
            //特殊处理：确认信息,因为原来td内是button
            isConfirm = getInnerText(tds[6])=='取消'?'1':'0';

            (function(name,date,workshop,type,error,recordId,imagePath,isConfirm){
                var recordToSavePromise = queryRecords.get(recordId,{
                    success:function(obj){
                        //姓名也要注意，万一乱改就查不到
                        obj.set('username',name);
                        //日期要注意,万一乱改就查不到
                        obj.set('date',date);
                        obj.set('workshop',workshop);
                        obj.set('type',type);
                        obj.set('error',error);
                        obj.set('imageUrl',imagePath);
                        obj.set('isConfirm',isConfirm);
                        //保存
                        obj.save();
                    }
                });
                promises.push(recordToSavePromise);
            })(name,date,workshop,type,error,recordId,imagePath,isConfirm);
        }
    }
    //清空表格，防止乱操作
    while(table.children.length>0){
        table.removeChild(table.children[0]);
    }
    //等待所有并行promise执行完成
    Bmob.Promise.when(promises).then(function(){
        //初始化当前页
        currentPageIndex = 1;
        showConfirmOnlyModal('修改保存成功!',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
            window.location.reload();
        });

    })

});


//点击表格中td，产生文本框的方法
function changeTotext(obj){
    var tdValue = getInnerText(obj);
    setInnerText(obj,'');
    var txt = document.createElement("input");
    txt.type = "text";
    txt.value = tdValue;
    txt.id = "_text_000000000_";
    txt.setAttribute("class","text");
    obj.appendChild(txt);
    txt.select();
    $(txt).css('border','2px solid #ff9900');
    $(txt).css('border-radius','5px');
}

// 取消单元格中的文本框，并将文本框中的值赋给单元格
function cancel(obj){
    var txtValue = document.getElementById("_text_000000000_").value;
    //获取该td的index(相对于其所在tr)
    var index = $(obj).index();
    //如果是日期一列
    if(index == 1) {
        //这里要判断填写的日期是否是指定格式:yyyy-mm-dd
        var reg = /^\d{4}-\d{2}-\d{2}$/g;
        if (!reg.test(txtValue)) {
            alert('请填写正确的日期格式:yyyy-mm-dd');
            document.getElementById("_text_000000000_").select();
            return;
        }
    }
    isValidClick = true;
    setInnerText(obj,txtValue)
}
//取消选中单元格
$(document).mouseup(function(){
    if(isInModify) {
        //兼容ie和火狐
        var obj = event.srcElement ? event.srcElement : event.target;
        if (document.getElementById("_text_000000000_") && obj.id != "_text_000000000_") {
            var obj1 = document.getElementById("_text_000000000_").parentElement;
            cancel(obj1);
        }
    }
});

//点击td修改td的内容
$(document).click(function(){
    //在修改状态下
    if(isInModify) {
        //兼容ie和火狐
        var obj = event.srcElement ? event.srcElement : event.target;
        if (obj.tagName.toLowerCase() == "td") {
            //表格中某些列不能点击修改，比如button和确认列
            //获取该td的index(相对于其所在tr)
            var index = $(obj).parents("tr").find("td").index($(obj));
            //4就是可修改的最后一列
            if(index<=4 && isValidClick){
                changeTotext(event.srcElement);
            }
        }
    }
    //隐藏搜索部分3个下拉选择菜单
    var objUl = event.srcElement ? event.srcElement : event.target;
    var dropDownClassNamePrefix = (objUl.className).split('_')[0];
    if (dropDownClassNamePrefix !== 'dropBoxButton') {
        $('.year_choice').slideUp(200);
        $('.month_choice').slideUp(200);
        $('.staff_choice').slideUp(200);

    }
});

//修改状态下给记录添加图片的保存按钮
$('#add_image_button_confirm').click(function(){
    //获取到当前点击的tr，通过index,然后改变innertext,保存图片url
    $("#content_table").find('tr').eq(trInModifyIndex).children("td:last-child").text(imagePathInModify);
    //清空数据
    $('.add_image_div').css('display','none');
    $('.overlay').css('z-index','500');
    //恢复背景添加的logo图片
    $('.add_image_preview_area').css('background',"url('./static/image/add_image.png') center center no-repeat");
    //清空已经显示出来的背景图,长宽也要归0,否则会多显示一个img的框，因为长宽不是0
    $('#add_image_preview').attr('src','');
    $('#add_image_preview').attr('width','0');
    $('#add_image_preview').attr('height','0');
    $('#add_image_preview').attr('display','none');
    //恢复input
    $('#record_add_image').css('display','block');
    //修改原来button的颜色和文字，原来button可能是添加或修改
    $(imageAddModifyButton).attr('class',"confirmButton btn btn-warning");
    $(imageAddModifyButton).text('修改');
});

//修改状态下给记录添加图片的取消按钮
$('#add_image_button_cancel').click(function(){
    $('.add_image_div').css('display','none');
    $('.overlay').css('z-index','500');
    //恢复背景添加的logo图片
    $('.add_image_preview_area').css('background',"url('./static/image/add_image.png') center center no-repeat");
    //清空已经显示出来的背景图,长宽也要归0,否则会多显示一个img的框，因为长宽不是0
    $('#add_image_preview').attr('src','');
    $('#add_image_preview').attr('width','0');
    $('#add_image_preview').attr('height','0');
    $('#add_image_preview').attr('display','none');
    //恢复input
    $('#record_add_image').css('display','block');
});

//添加图片的input处理
//图片添加按钮,选择了图片后就触发change方法
$('#record_add_image').change(function() {
    var f = this.files[0];
    //如果图片存在,因为不选中图片点击取消也会触发change
    if($(this).val()){
        //屏蔽2个按钮的点击
        $('#add_image_button_confirm').attr({'disabled':'disabled'});
        $('#add_image_button_cancel').attr({'disabled':'disabled'});
        var formData = new FormData();
        formData.append('smfile', f);
        //ajax发送,图床网站
        $.ajax({
            url: 'https://sm.ms/api/upload',
            type: 'POST',
            processData: false,
            contentType: false,
            data: formData,
            beforeSend: function (xhr) {
                //屏蔽img标签
                $('#add_image_preview').css('display','none');
                //屏蔽input
                $('#record_add_image').css('display','none');
                //提示文字：图片上传中
                $('.add_image_uploading_word').css('display','block');
                //屏蔽背景图片,这里不能直接赋给background空值，不知道为啥
                $('.add_image_preview_area').css('background',"url('')");
            },
            success: function (res) {
                $('#add_image_preview').css('display','block');
                //获取图片框的长宽
                var imageWidth = $('.add_image_preview_area').width();
                var imageHeight = $('.add_image_preview_area').height();
                $('#add_image_preview').attr('width',imageWidth);
                $('#add_image_preview').attr('height',imageHeight);
                $('#add_image_preview').attr('src',res.data.url);
                //取消屏蔽2个按钮的点击
                $('#add_image_button_confirm').removeAttr('disabled');
                $('#add_image_button_cancel').removeAttr('disabled');
                //屏蔽提示文字：图片上传中
                $('.add_image_uploading_word').css('display','none');
                //记录下图片地址
                imagePathInModify = res.data.url;
            },
            error: function () {
                alert('图片上传失败，可能是图片过大!');
                $('#add_image_button_confirm').removeAttr('disabled');
                $('#add_image_button_cancel').removeAttr('disabled');
                $('.add_image_uploading_word').css('display','none');
            }

        });
    }

});

//计算是否错误记录次数的函数，event.data.isImportant区分是否重要
var countFunc = function(event) {
    //隐藏页码按钮
    $('.pagination').css('display', 'none');
    //清空数组
    recordsOfCurrentMonth = [];
    recordsToDelete = [];
    //记录所有员工次数的对象
    var staffCountObj = {};
    //总错误次数
    var totalRecordsCount = 0;
    //重新查询当月数据
    var Records = Bmob.Object.extend('record');
    var queryMonthRecords = new Bmob.Query(Records);
    var dateStr = currentYearValue + '-' + currentMonthValue;
    queryMonthRecords.equalTo('monthDate', dateStr);
    //这里区分重要还是不重要的记录,这里要注意，数据库中只有1是重要，不填或者0都是不重要
    if (event.data.isImportant == 0) {
        //不重要
        queryMonthRecords.notEqualTo('isImportant', '1')
    } else {
        //重要
        queryMonthRecords.equalTo('isImportant', '1')
    }

    //这里只能看自己组的记录
    queryMonthRecords.containedIn("username", groupUserList);

    queryMonthRecords.find({
        success: function (results) {
            //如果找到数据
            if (results.length > 0) {
                totalRecordsCount = results.length;
                for (var i = 0; i < results.length; i++) {
                    var username = results[i].get('username');
                    if (staffCountObj.hasOwnProperty(username)) {
                        staffCountObj[username]++;
                    } else {
                        staffCountObj[username] = 1;
                    }
                }
                //清空原来的table
                while (table.children.length > 0) {
                    table.removeChild(table.children[0]);
                }
                //重置标题,非重要
                if (event.data.isImportant == 0) {
                    $('.content_table_title').text(currentYearValue + '年' + currentMonthValue + '月员工非重要错误记录次数详情(共计' + totalRecordsCount + '条)');
                } else {
                    $('.content_table_title').text(currentYearValue + '年' + currentMonthValue + '月员工重要错误记录次数详情(共计' + totalRecordsCount + '条)');
                }

                //重置div的标题
                $('.title_left_description').text('错误记录次数统计');
                //构建新的table
                var tbody = document.createElement('tbody');
                var tableHead = document.createElement('tr');
                var nameTh = document.createElement('th');
                var countTh = document.createElement('th');
                setInnerText(nameTh, '员工姓名')
                setInnerText(countTh, '本月错误次数')
                tableHead.appendChild(nameTh);
                tableHead.appendChild(countTh);
                tbody.appendChild(tableHead);
                for (var key in staffCountObj) {
                    var tr = document.createElement('tr');
                    var nameTd = document.createElement('td');
                    tr.appendChild(nameTd);
                    setInnerText(nameTd, key);
                    var countTd = document.createElement('td');
                    setInnerText(countTd, staffCountObj[key]);
                    tr.appendChild(countTd);
                    tbody.appendChild(tr);
                }
                table.appendChild(tbody);
                //隐藏次数统计按钮
                $('.current_month_records_count_button').css('display', 'none');
                $('.current_month_records_count_button_important').css('display', 'none');
                //隐藏掉修改按钮
                $('#modify').hide();
            //未找到数据
            }else{
                showConfirmOnlyModal('未搜索到数据~',function(){
                    $('.overlay').css('display','none');
                    $('#modal_confirm_only').css('display','none');
                })

            }
        }
    })
}


//不重要记录统计,前面对象是参数
$('#showCount').click({isImportant:0},countFunc);
//重要记录统计
$('#showCountImportant').click({isImportant:1},countFunc);



//鼠标移动到红点上显示tab
$('.redSpot').mouseover(function(){
    //show从左至有从上至下逐步显示,fade只改变透明度,slide滑动显示
    //如果未处于动画执行过程中则添加动画
    if(!$('.unconfirmedTab').is(':animated')) {
        $('.unconfirmedTab').slideDown(200)
    }
});
$('.redSpot').mouseout(function(){
    if(!$('.unconfirmedTab').is(':animated')) {
        $('.unconfirmedTab').slideUp(200)
    }
});
