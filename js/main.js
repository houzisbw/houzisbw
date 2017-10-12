/**
 * Created by Administrator on 2017/9/17.
 */
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

//人员姓名
var isStaffListShow = false;
var staffList = document.getElementsByClassName('staff_choice')[0];
var staffDropDown = document.getElementsByClassName('dropBoxButton_staff')[0];
var staffInput = document.getElementsByClassName('staffInput')[0];
staffDropDown.onclick=function(){
    //登录了才能操作
    if(getCookie('username')) {
        if (!isStaffListShow) {
            isStaffListShow = true;
            staffList.style.display = 'block';
        }
        else {
            isStaffListShow = false;
            staffList.style.display = 'none';
        }
    }
};


//搜索按钮
var searchButton = document.getElementsByClassName('search')[0];
//settimeout的id
var timeId = null;
//是否是只看未确认
var isOnlyNotConfirmed = false;
//搜索：只看未确认
searchButton.onmouseover = function(){
    //不是普通用户
    if(getCookie('authority') != '0') {

        $('.only_search_unconfirmed').css('display', 'block');
        clearTimeout(timeId);
        //3秒后隐藏对话框
        timeId = setTimeout(function () {
            $('.only_search_unconfirmed').css('display', 'none');
        }, 3000);
    }
}


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
//按月份搜
searchButton.onclick = function(){
    //隐藏只看未确认按钮
    $('.only_search_unconfirmed').css('display','none');
    //判断用户是否登录
    var userCookie = getCookie('username');
    if(!userCookie){
        alert('温馨提示:请登录后再操作~');
        window.location.reload();
        return;
    }
    var monthValue = monthInput.value.trim();
    var yearValue = yearInput.value.trim();
    var staffValue = staffInput.value.trim();
    //年月只选了一个  或者  3个都没选,注意这里异或优先级很低,必须加括号，还有异或2个数字得首先转化为true和false
    if((((!!monthValue)^(!!yearValue)) !==0)||(!monthValue && !yearValue && !staffValue)){
        alert('请同时输入年份和月份！');
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
}
//搜索普通用户的全部记录
//搜索按钮
//是否处于搜全部的状态
var isInSearchAllState = false;
var searchAllButton = document.getElementsByClassName('search_all_btn')[0];
searchAllButton.onclick = function(){
    //判断用户是否登录
    var userCookie = getCookie('username');
    if(!userCookie){
        alert('温馨提示:请登录后再操作~');
        return;
    }
    if(!isInSearch) {
        isInSearchAllState = true;
        searchRecordData('', '', true);
    }

}
//普通用户的只看未确认
searchAllButton.onmouseover = function(){
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

}
//兼容ie8及以下去除空格
String.prototype.trim = function () {
    return this.replace(/^\s*|\s*$/g, "");
}

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
        alert('请重新登录~');
        window.location.reload();
    }else{
        username = getCookie('username');
        userAuthority = getCookie('authority');
    }
    //清空标题
    var tableTitle = document.getElementsByClassName('content_table_title')[0];
    setInnerText(tableTitle,'');
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

    //只看未确认,防止查找未确认的条目太难
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
                                            var r = confirm('该操作不可逆，确认继续？后续修改请联系管理员');
                                            //点击确认,点击后该按钮变成已确认，同时保存状态到后端云，但是页面不刷新
                                            if(r){
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
                                                    },
                                                    error:function(object,error){
                                                        alert('保存出错~~请重试');
                                                    }
                                                })
                                            }
                                        }
                                    })(recordId,td,button);
                                    setInnerText(button,'确认');
                                    td.appendChild(button)

                                    //已确认
                                }else{
                                    setInnerText(td, '已确认');
                                }

                                //如果是图片查看这一列
                            }
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
                                            $(overlay).css('display','block');
                                            //注意这里的路径：没有添加../因为这里要css的方法是指定内联样式，所以根路径是index.html的路径
                                            $(overlay).css('background',"rgba(0, 0, 0, 0.5) url('./static/image/close.png') right top no-repeat")
                                            //显示图片
                                            $('#recordImage').attr('src',img);
                                            //设置图片固定长宽，防止图片太大遮住全部
                                            $('#recordImage').attr('width','800px');
                                            $('#recordImage').attr('height','600px');
                                            overlay.onclick = function(){
                                                $(overlay).css('display','none');
                                                $('#recordImage').attr('src','');
                                            }
                                        }
                                    })(image);
                                    setInnerText(picButton,'查看');
                                    td.appendChild(picButton);
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

                }
                //未查到数据
                else{
                    // if(!isInModify) {
                    //     alert('未找到数据,请重新输入年月~');
                    // }
                    //修改div的标题
                    var title = '当月错误记录';
                    $('.title_left_description').text(title);
                    $('.content_table_title').text('');
                    //隐藏分页
                    $('.pagination').css('display','none');
                    alert('未找到数据,请重新输入年月或者姓名~');

                }
                //完成搜索
                isInSearch=false;
            }
        });
    }
    //超级管理员和二级管理员
    else {
        //这里要加上按人查看,获取人员输入input的值，判断是否为空
        //如果有人员，则加上筛选条件
        //var staffName = document.getElementsByClassName('staffInput')[0].value;
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
                                            $(overlay).css('display','block');
                                            //注意这里的路径：没有添加../因为这里要css的方法是指定内联样式，所以根路径是index.html的路径
                                            $(overlay).css('background',"rgba(0, 0, 0, 0.5) url('./static/image/close.png') right top no-repeat")
                                            //显示图片
                                            $('#recordImage').attr('src',img);
                                            //设置图片固定长宽，防止图片太大遮住全部
                                            $('#recordImage').attr('width','800px');
                                            $('#recordImage').attr('height','600px');
                                            overlay.onclick = function(){
                                                $(overlay).css('display','none');
                                                $('#recordImage').attr('src','');
                                            }
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
                        //添加删除按钮

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

                }
                //未查到数据
                else{
                    var title = '当月错误记录';
                    $('.title_left_description').text(title);
                    $('.content_table_title').text('');
                    $('.current_month_records_count_button').css('display','none');
                    //隐藏分页
                    $('.pagination').css('display','none');
                    alert('未找到数据,请重新输入年月或姓名~');
                }
                //完成搜索
                isInSearch=false;

            },
            error:function(error){
               console.log('fail')
            }

        });
    }

}
//分页处理
//上一页下一页按钮
var prevPageButton = document.getElementById('prevPage');
prevPageButton.onclick = function(){
    //清空当前保存记录的数组，否则进入修改状态就乱了
    recordsOfCurrentMonth = [];
    //如果是第一页则禁用该按钮
    if(currentPageIndex == 1){
        alert('已经是第一页了~');
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
}
var nextPageButton = document.getElementById('nextPage');
nextPageButton.onclick = function(){
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
        alert('已经是最后一页了~');
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
}
//页码go
var pageGoButton = document.getElementById('goToPage');
pageGoButton.onclick = function(){
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
    //判断输入是否合理
    if(!isNaN(parseInt(inputPageIndex))){
        var t = parseInt(inputPageIndex);
        if(t>=1 && t<=totalPageNum){
            currentPageIndex = t;
            searchRecordData(currentYearValue,currentMonthValue,false);
        }else{
            alert('输入非法~');
        }
    }else{
        alert('输入非法~');
    }
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
printer.onclick = function(){
    //如果没有搜索到数据则不能打印
    if (table.children.length === 0) {
        alert('当月错误记录为空，无法打印');
        return;
    }
    var extraCss = './css/main.css';
    $(".print_area").printArea({extraCss:extraCss});

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
    //console.log('loginButton')
    if(!modalShow){
        overlay.style.display='block';
        //toggleClass(modalLogin,'md-show');
        $(modalLogin).addClass('md-show')
        modalLogin.style.display='block'
    }
}
//对话框关闭
var closeButton = document.getElementsByClassName('md-close')[0];
closeButton.onclick = function(){
    //console.log('closeloginButton')
    //toggleClass(modalLogin,'md-show');
    $(modalLogin).removeClass('md-show')
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
//登录处理
function loginHandler(){
    //按钮变为登录中
    $('.btn-login').text('登录中...')
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
                //理论上只能查到一条,用户名是唯一的
                var object = results[0];
                //获取用户权限
                authority = object.get('authority');
                //登录成功
                toggleClass(modalLogin,'md-show');
                overlay.style.display='none';
                //设置cookie
                //cookie过期时间
                var timeToExpire = 3000;
                setCookie('username',username,timeToExpire);
                //设置权限信息
                setCookie('authority',authority,timeToExpire);
                //刷新页面
                window.location.reload();

            }else{
                //登录失败
                toggleClass(errorTip,'error-show');
                //按钮变为登录中
                $('.btn-login').text('登录')
            }
        },
        error: function(error) {
            alert("登录失败: " + error.code + " " + error.message);
        }
    });
}
//登录按钮
btnLogin.onclick = function(){
    loginHandler();
};
//回车也会触发登录
document.onkeydown = function(event){
    var e = event || window.event ;
    if(e && e.keyCode==13){ // enter 键
        loginHandler();
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
    //初始化姓名列表
    initUsernameDropDownList();
    //修改状态初始化
    isInModify=false;
    //这里只判断了username，但是username和权限cookie的时间是一样的
    var hasCookie = checkCookie('username');
    var nameDiv = document.getElementsByClassName('loginedName')[0];
    if(hasCookie) {
        var loginButton = document.getElementById('login');
        toggleClass(loginButton, 'toggleDisplay');
        var logoutButton = document.getElementById('logout');
        toggleClass(logoutButton, 'toggleDisplay');
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
            //只看未确认按钮位置移动到查看全部那里

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
                    alert('当月错误记录为空，请先查询记录后再修改!');
                    return;
                }
                //隐藏页码按钮
                $('.pagination').css('display','none');
                //隐藏查看次数统计的按钮
                $('.current_month_records_count_button').css('display','none');
                //隐藏打印按钮
                $('.printer').css('display','none');

                //只在遮罩上显示表格
                var content = document.getElementsByClassName('content')[0];
                //为啥不能用toggleClass呢
                content.style['z-index'] = 500;
                //加上遮罩
                overlay.style.display = 'block';
                $(overlay).css('background','rgba(0, 0, 0, 0.5)');
                overlay.onclick = function(){};
                //显示提示框
                //var modifyTips = document.getElementsByClassName('modify_tips')[0];
                //modifyTips.style.display = 'block';
                //显示保存和取消2个按钮
                toggleClass(confirmButton, 'toggleDisplay');
                toggleClass(cancelButton, 'toggleDisplay');
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
                                        $('#add_image_preview').css('display','none');
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
                                    }
                                })(tr,td);

                                setInnerText(buttonAdd, '添加');
                                td.appendChild(buttonAdd)
                            } else {
                                //添加修改按钮,里面图片url从该tr最后一个td获取
                                var buttonMod = document.createElement('button');
                                buttonMod.setAttribute("class", "confirmButton btn btn-warning");
                                //添加点击函数
                                (function(tr,td){
                                    buttonMod.onclick = function(){
                                        //设置overlay的z-index高于表格div的z-index(500)
                                        $('.overlay').css('z-index','501');
                                        //显示添加图片的div，事先隐藏了
                                        $('.add_image_div').css('display','block');
                                        //不能点击保存，如果没上传图片
                                        $('#add_image_button_confirm').attr({'disabled':'disabled'});

                                        //获取最后一个td中的图片url，如果有则显示在添加图片
                                        var imageUrl = $(tr).children("td:last-child").text();
                                        //console.log('click '+imageUrl);
                                        //显示该图片
                                        $('#add_image_preview').attr('src',imageUrl);
                                        $('#add_image_preview').css('display','block');
                                        //获取图片框的长宽
                                        var imageWidth = $('.add_image_preview_area').width();
                                        var imageHeight = $('.add_image_preview_area').height();
                                        $('#add_image_preview').attr('width',imageWidth);
                                        $('#add_image_preview').attr('height',imageHeight);

                                        //保存tr
                                        //保存tr,判断当前是第几个tr
                                        var currentTrIndex = $("#content_table tbody tr").index(tr);
                                        trInModifyIndex = currentTrIndex;
                                        trInModify = tr;
                                        //保存td
                                        tdInModify = td;
                                        //保存点击的按钮
                                        imageAddModifyButton = this;
                                    }
                                })(tr,td);


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
                    setInnerText(deleteButton, '删除')
                    //添加点击函数,表头不能删除
                    deleteButton.onclick = function () {
                        var r = confirm('确认删除该条记录？');
                        if (r) {
                            //记录下要删除元素的id
                            var idToDelete = getInnerText(this.nextSibling);
                            recordsToDelete.push(idToDelete);
                            //这里很奇怪，table的子元素给加了个tbody进来，bootstrap搞的鬼？？？？
                            var tbody = this.parentNode.parentNode;
                            var parentNode = this.parentNode;
                            tbody.removeChild(parentNode);
                        }

                    }
                    tr.appendChild(deleteButton);

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
            setInnerText(addUserButton, '添加用户')
            addUserButton.setAttribute('id', 'addUser');
            addUserButton.onclick = function () {
                window.location.href = './views/adduser.html';
            }
            bannerButton.appendChild(addUserButton);

        }
        setInnerText(nameDiv, '您好, ' + userauthorityName + username);
    }else{
        setInnerText(nameDiv, '');
    }
}
//初始化人员姓名列表
function initUsernameDropDownList(){
    //从云端数据库查询人员姓名,除了超管和管理员
    var userInfo = Bmob.Object.extend('user');
    var queryUser = new Bmob.Query(userInfo);
    //获取姓名下拉ul
    var usernameUl = document.getElementsByClassName('staff_choice')[0];
    queryUser.find({
        success:function(results){
            for(var i=0;i<results.length;i++){
                //普通员工或者二级管理员
                if(results[i].get('authority')=='0'){
                    var username = results[i].get('username');
                    var li = document.createElement('li');
                    (function(username){
                        li.onclick = function(){
                            staffList.style.display='none';
                            staffInput.value = username;
                        }
                    })(username);
                    setInnerText(li,username);
                    usernameUl.appendChild(li);
                }
            }

        }
    })
}
//修改按钮处理
var confirmButton =document.getElementById('confirm_modify');
var cancelButton =document.getElementById('cancel_modify');
var table = document.getElementById('content_table');
cancelButton.onclick = function(){
    //显示打印按钮
    $('.printer').css('display','block');
    //恢复变量(日期合法输入)
    isValidClick = true;
    var content = document.getElementsByClassName('content')[0];
    content.style['z-index']=0;
    overlay.style.display='none';
    toggleClass(cancelButton,'toggleDisplay');
    toggleClass(confirmButton,'toggleDisplay');
    isInModify=false;
    //关闭提示框
    var modifyTips = document.getElementsByClassName('modify_tips')[0];
    modifyTips.style.display = 'none';
    //清空要删除记录的数组
    recordsToDelete = [];
    recordsOfCurrentMonth = [];
    //重新查找数据，恢复原来的table
    searchRecordData(currentYearValue,currentMonthValue,false);

}
//确认修改按钮
confirmButton.onclick = function(){
    //如果是日期的非法修改
    if(!isValidClick){
        alert('请输入正确日期!');
        return;
    }
    //显示打印按钮
    $('.printer').css('display','block');

    var content = document.getElementsByClassName('content')[0];
    content.style['z-index']=0;
    overlay.style.display='none';
    toggleClass(confirmButton,'toggleDisplay');
    toggleClass(cancelButton,'toggleDisplay');
    //计算修改过后的表格
    //首先获取当前所选年月，注意不能直接从input的value获取，因为可以改变这2个值
    //var currentDate = currentYearValue+'-'+currentMonthValue;

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
            recordId = getInnerText(tds[7]);
            imagePath = getInnerText(tds[8]);
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
        alert('修改保存成功');
        //重新初始化
        window.location.reload();
    })

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
    $(txt).css('border','2px solid #ff9900');
    $(txt).css('border-radius','5px');
}

//记录是否是错误的点击
var isValidClick = true;
// 取消单元格中的文本框，并将文本框中的值赋给单元格
function cancel(obj)
{
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
            isValidClick = false;
            return;
        }
    }
    isValidClick = true;
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
        $(yearList).css('display','none');
        $(monthList).css('display','none');
        $(staffList).css('display','none');
        isStaffListShow =false;
        isMonthListShow = false;
        isYearListShow = false;
    }

}



/////////////修改状态下给记录添加图片的保存取消按钮
var addImageInModifySaveButton = document.getElementById('add_image_button_confirm');
addImageInModifySaveButton.onclick = function(){
    //获取到当前点击的tr，通过index,然后改变innertext
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

}
var addImageInModifyCancelButton = document.getElementById('add_image_button_cancel');
addImageInModifyCancelButton.onclick = function(){
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

}
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
            }

        });
    }

});



//只搜年月情况下的：查看次数统计 按钮,这里要注意是要统计当月所有的，而不是仅仅当前表格的
var recordsCountButton = document.getElementById('showCount');
recordsCountButton.onclick = function(){
    //隐藏页码按钮
    $('.pagination').css('display','none');
    //清空数组
    recordsOfCurrentMonth = [];
    recordsToDelete = [];
    //记录所有员工次数的对象
    var staffCountObj = {};
    //总错误次数
    var totalRecordsCount = 0;

    //重新查询当月数据
    //从云端数据库搜索
    var Records = Bmob.Object.extend('record');
    var queryMonthRecords = new Bmob.Query(Records);
    var dateStr = currentYearValue+'-'+currentMonthValue;
    queryMonthRecords.equalTo('monthDate', dateStr);
    queryMonthRecords.find({
        success:function(results){
            totalRecordsCount = results.length;
            for(var i=0;i<results.length;i++){
                var username = results[i].get('username');
                if(staffCountObj.hasOwnProperty(username)){
                    staffCountObj[username]++;
                }else{
                    staffCountObj[username] = 1;
                }
            }
            //清空原来的table
            while(table.children.length>0){
                table.removeChild(table.children[0]);
            }
            //重置标题
            $('.content_table_title').text(currentYearValue+'年'+currentMonthValue+'月员工错误记录次数详情(共计'+totalRecordsCount+'条)');
            //重置div的标题
            $('.title_left_description').text('错误记录次数统计');
            //构建新的table
            var tbody = document.createElement('tbody');
            var tableHead = document.createElement('tr');
            var nameTh = document.createElement('th');
            var countTh = document.createElement('th');
            setInnerText(nameTh,'员工姓名')
            setInnerText(countTh,'本月错误次数')
            tableHead.appendChild(nameTh);
            tableHead.appendChild(countTh);
            tbody.appendChild(tableHead);
            for(var key in staffCountObj){
                var tr = document.createElement('tr');
                var nameTd = document.createElement('td');
                tr.append(nameTd);
                setInnerText(nameTd,key);
                var countTd = document.createElement('td');
                setInnerText(countTd,staffCountObj[key]);
                tr.append(countTd);
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            //隐藏次数统计按钮
            $('.current_month_records_count_button').css('display','none');

        }
    })



}

