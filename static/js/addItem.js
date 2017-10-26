//bmob云存储初始化
Bmob.initialize("e0a51a8e943e642a0269d0925d9e9688", "9335d129f2514d28bb20174d65dd75f5");
//本地存储的key：配置信息的3个字段
var staffName = 'staffName';
//7个要保存的值,编号1-7
var staffNameToSave = '';
var monthToSave = '';
var dateToSave = '';
var workshopNameToSave = '';
var recordTypeToSave = '';
var errorInstructionToSave = '';
var imageUrl = '';
//该条记录是否重要，0表示不重要
var isImportant = '0';
//控制日历是否显示
var isCalendarShow = true;
//隐藏日历
$(document.body).click(function(){
    $('#calendar').hide();
    isCalendarShow = true;
});

$('#date button').click(function(e){
    if(isCalendarShow) {
        $('#calendar').show();
    }else{
        $('#calendar').hide();
    }
    isCalendarShow = !isCalendarShow;
    //防止body触发
    e.stopPropagation();
});

//返回主页
$('#goback').click(function(){
    window.location.href = './../index.html';
});

//图片添加按钮,选择了图片后就触发change方法
$('#picInput').change(function() {
    var f = this.files[0];
    //如果图片存在,因为不选中图片点击取消也会触发change
    if($(this).val()){
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
                //清空图片
                $('#image_preview').attr('src','');
                $('.uploading_word').text('图片上传中...');
                $('.uploading_word').css('color','#bebebe');
            },
            success: function (res) {
                $('.uploading_word').css('color','#13b307');
                $('.uploading_word').text('图片上传成功!');
                //获取图片框的长宽
                var imageWidth = $('#picPreview').width();
                var imageHeight = $('#picPreview').height();
                $('#image_preview').attr('width',imageWidth);
                $('#image_preview').attr('height',imageHeight);
                $('#image_preview').attr('src',res.data.url);
                //记录下图片地址
                imageUrl = res.data.url;

            },
            error: function () {
                alert('图片上传失败，可能是图片过大!');
            }

        });
    }

});

//初始化人员姓名列表
function initUsernameDropDownList(){
    //从云端数据库查询人员姓名,除了超管
    var userInfo = Bmob.Object.extend('user');
    var queryUser = new Bmob.Query(userInfo);
    //获取组别信息
    var group = getCookie('group');
    queryUser.equalTo('group',group);
    queryUser.find({
        success:function(results){
            var nameHTMLDiv = document.getElementById('name');
            var nameHtmlUl = nameHTMLDiv.getElementsByTagName('ul')[0];
            for(var i=0;i<results.length;i++){
                //不是超管
                if(results[i].get('authority')!=='2'){
                    var username = results[i].get('username');
                    var aLink = document.createElement('a');
                    setInnerText(aLink,username);
                    var li = document.createElement('li');
                    li.appendChild(aLink);
                    //给每个li添加点击事件：点击后对应的button的innerText会改变，同时记录下选中的值
                    //匿名函数立即执行,达到传递参数的目的
                    (function(i){
                        li.onclick = function(){
                            var button = nameHTMLDiv.getElementsByTagName('button')[0];
                            setInnerText(button,results[i].get('username')+'    ')
                            var span = document.createElement('span');
                            span.setAttribute('class','caret');
                            button.appendChild(span);
                            //记录下对应的数据
                            staffNameToSave = results[i].get('username');
                        }
                    })(i);
                    nameHtmlUl.appendChild(li);
                }
            }

        }
    })
}
//初始化其他2个信息列表
function initOtherList(tableName,htmlDivName){
    //从云端数据库查询人员姓名,除了超管
    var itemInfo = Bmob.Object.extend(tableName);
    var queryItem = new Bmob.Query(itemInfo);
    queryItem.find({
        success:function(results){
            var itemHTMLDiv = document.getElementById(htmlDivName);
            var itemHtmlUl = itemHTMLDiv.getElementsByTagName('ul')[0];
            for(var i=0;i<results.length;i++){
                var itemName = results[i].get('name');
                var aLink = document.createElement('a');
                setInnerText(aLink,itemName);
                var li = document.createElement('li');
                li.appendChild(aLink);
                //给每个li添加点击事件：点击后对应的button的innerText会改变，同时记录下选中的值
                //匿名函数立即执行,达到传递参数的目的
                (function(i,tablename){
                    li.onclick = function(){
                        var name = results[i].get('name');
                        var button = itemHTMLDiv.getElementsByTagName('button')[0];
                        setInnerText(button,name+'    ');
                        var span = document.createElement('span');
                        span.setAttribute('class','caret');
                        button.appendChild(span);
                        //记录下对应的数据
                        if(tablename === 'workshop_config'){
                            workshopNameToSave = name;
                        }else{
                            recordTypeToSave = name;
                        }

                    }
                })(i,tableName);
                itemHtmlUl.appendChild(li);
            }
        }
    })
}
//初始化是否重要列表
function initIsImportantList(){
    var itemHTMLDiv = document.getElementById('important');
    var itemHtmlUl = itemHTMLDiv.getElementsByTagName('ul')[0];
    var resultList = ['是','否'];
    for(var i=0;i<resultList.length;i++){
        var itemName = resultList[i];
        var aLink = document.createElement('a');
        setInnerText(aLink,itemName);
        var li = document.createElement('li');
        li.appendChild(aLink);
        //给每个li添加点击事件：点击后对应的button的innerText会改变，同时记录下选中的值
        //匿名函数立即执行,达到传递参数的目的
        (function(i){
            li.onclick = function(){
                var name = resultList[i];
                var button = itemHTMLDiv.getElementsByTagName('button')[0];
                setInnerText(button,name+'    ');
                var span = document.createElement('span');
                span.setAttribute('class','caret');
                button.appendChild(span);
                //赋值,注意这里是string类型，否则数据库无法存储,也不会报错
                isImportant = name=='是'?'1':'0';
            }
        })(i);
        itemHtmlUl.appendChild(li);
    }
    //默认选择否
    var button = itemHTMLDiv.getElementsByTagName('button')[0];
    setInnerText(button,'否    ');
    var span = document.createElement('span');
    span.setAttribute('class','caret');
    button.appendChild(span);

}

//清空数据
$('#reset_data').click(function(){
    window.location.reload();
});

//保存修改
$('#save_data').click(function(){
    //禁用该按钮
    $('#save_data').attr({'disabled':'disabled'});
    //获取错误说明
    errorInstructionToSave = $('#error').val();
    if(!staffNameToSave && !monthToSave && !dateToSave && !workshopNameToSave && !recordTypeToSave && !errorInstructionToSave){
        $('#save_data').removeAttr('disabled');
        showConfirmOnlyModal('请至少填写一项!',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        });
        return;
    }
    //月份作为key，必须填写
    if(!monthToSave){
        $('#save_data').removeAttr('disabled');
        showConfirmOnlyModal('请填写月份!',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        });
        return;
    }
    //获得云端数据库中的表
    var recordTable = Bmob.Object.extend('record');
    //生成新的一行数据
    var recordTableToSave = new recordTable();
    //生成记录对象，isConfirm为0代表未确认，默认就是未确认
    var recordObj = {
        workshop:workshopNameToSave,
        username:staffNameToSave,
        type:recordTypeToSave,
        isConfirm:'0',
        imageUrl:imageUrl,
        error:errorInstructionToSave,
        date:dateToSave,
        //只记录年月
        monthDate:monthToSave,
        //是否重要
        isImportant:isImportant
    }
    //保存
    recordTableToSave.save(recordObj,{
        success:function(result){
            showConfirmOnlyModal('保存数据成功!',function(){
                $('.overlay').css('display','none');
                $('#modal_confirm_only').css('display','none');
                window.location.reload();
            });
        }
    });
});

$(document).ready(function (){
    //判断身份是否是超管,不是的直接返回主页，防止地址栏直接登入此页面
    if(getCookie('authority') != '2'){
        window.location.href = './../index.html';
    }
    //初始化姓名列表
    initUsernameDropDownList();
    //初始化车间名称列表
    initOtherList('workshop_config','workshop');
    //初始化记录类型列表
    initOtherList('recordType_config','category');
    //初始化是否重要列表
    initIsImportantList();
});


//////////////////////////////////////////日历js
// 关于月份： 在设置时要-1，使用时要+1
$(function () {

    $('#calendar').calendar({
        ifSwitch: true, // 是否切换月份
        hoverDate: true, // hover是否显示当天信息
        backToday: true // 是否返回当天
    });

});

(function ($, window, document, undefined) {

    var Calendar = function (elem, options) {
        this.$calendar = elem;

        this.defaults = {
            ifSwitch: true,
            hoverDate: false,
            backToday: false
        };

        this.opts = $.extend({}, this.defaults, options);

        // console.log(this.opts);
    };

    Calendar.prototype = {
        showHoverInfo: function (obj) { // hover 时显示当天信息
            var _dateStr = $(obj).attr('data');
            var offset_t = $(obj).offset().top + (this.$calendar_today.height() - $(obj).height()) / 2;
            var offset_l = $(obj).offset().left + $(obj).width();
            var changeStr = _dateStr.substr(0, 4) + '-' + _dateStr.substr(4, 2) + '-' + _dateStr.substring(6);
            var _week = changingStr(changeStr).getDay();
            var _weekStr = '';

            this.$calendar_today.show();

            this.$calendar_today
                .css({left: offset_l + 30, top: offset_t})
                .stop()
                .animate({left: offset_l + 16, top: offset_t, opacity: 1});

            switch(_week) {
                case 0:
                    _weekStr = '星期日';
                    break;
                case 1:
                    _weekStr = '星期一';
                    break;
                case 2:
                    _weekStr = '星期二';
                    break;
                case 3:
                    _weekStr = '星期三';
                    break;
                case 4:
                    _weekStr = '星期四';
                    break;
                case 5:
                    _weekStr = '星期五';
                    break;
                case 6:
                    _weekStr = '星期六';
                    break;
            }

            this.$calendarToday_date.text(changeStr);
            this.$calendarToday_week.text(_weekStr);
        },

        showCalendar: function () { // 输入数据并显示
            var self = this;
            var year = dateObj.getDate().getFullYear();
            var month = dateObj.getDate().getMonth() + 1;
            var dateStr = returnDateStr(dateObj.getDate());
            var firstDay = new Date(year, month - 1, 1); // 当前月的第一天

            this.$calendarTitle_text.text(year + '/' + dateStr.substr(4, 2));

            this.$calendarDate_item.each(function (i) {
                // allDay: 得到当前列表显示的所有天数
                var allDay = new Date(year, month - 1, i + 1 - firstDay.getDay());
                var allDay_str = returnDateStr(allDay);

                $(this).text(allDay.getDate()).attr('data', allDay_str);

                $(this).click(function(){
                    var _dateStr = $(this).attr('data');
                    var changeStr = _dateStr.substr(0, 4) + '-' + _dateStr.substr(4, 2) + '-' + _dateStr.substring(6);
                    //如何传递参数到外面:直接放在一个js里
                    var dateDiv = document.getElementById('date');
                    var dateButton = dateDiv.getElementsByTagName('button')[0];
                    dateButton.innerText = changeStr+' ';
                    var span = document.createElement('span');
                    span.setAttribute('class','caret');
                    dateButton.appendChild(span);
                    dateToSave = changeStr;

                    //确定所选月份
                    var monthStr = _dateStr.substr(0, 4) + '-' + _dateStr.substr(4, 2);
                    monthToSave = monthStr;
                    var monthDiv = document.getElementById('month');
                    var button = monthDiv.getElementsByTagName('button')[0];
                    button.innerText = monthStr+' ';
                    var span2 = document.createElement('span');
                    span.setAttribute('class','caret');
                    button.appendChild(span2);

                })

                if (returnDateStr(new Date()) === allDay_str) {
                    $(this).attr('class', 'item item-curDay');
                } else if (returnDateStr(firstDay).substr(0, 6) === allDay_str.substr(0, 6)) {
                    $(this).attr('class', 'item item-curMonth');
                } else {
                    $(this).attr('class', 'item');
                }
            });
        },

        renderDOM: function () { // 渲染DOM
            this.$calendar_title = $('<div class="calendar-title"></div>');
            this.$calendar_week = $('<ul class="calendar-week"></ul>');
            this.$calendar_date = $('<ul class="calendar-date"></ul>');
            this.$calendar_today = $('<div class="calendar-today"></div>');


            var _titleStr = '<a href="#" class="title"></a>'+
                '<a href="javascript:;" id="backToday">T</a>'+
                '<div class="arrow">'+
                '<span class="arrow-prev"><</span>'+
                '<span class="arrow-next">></span>'+
                '</div>';
            var _weekStr = '<li class="item">日</li>'+
                '<li class="item">一</li>'+
                '<li class="item">二</li>'+
                '<li class="item">三</li>'+
                '<li class="item">四</li>'+
                '<li class="item">五</li>'+
                '<li class="item">六</li>';
            var _dateStr = '';
            var _dayStr = '<i class="triangle"></i>'+
                '<p class="date"></p>'+
                '<p class="week"></p>';

            for (var i = 0; i < 6; i++) {
                _dateStr += '<li class="item">26</li>'+
                    '<li class="item">26</li>'+
                    '<li class="item">26</li>'+
                    '<li class="item">26</li>'+
                    '<li class="item">26</li>'+
                    '<li class="item">26</li>'+
                    '<li class="item">26</li>';
            }

            this.$calendar_title.html(_titleStr);
            this.$calendar_week.html(_weekStr);
            this.$calendar_date.html(_dateStr);
            this.$calendar_today.html(_dayStr);

            this.$calendar.append(this.$calendar_title, this.$calendar_week, this.$calendar_date, this.$calendar_today);
            //this.$calendar.show();
        },

        inital: function () { // 初始化
            var self = this;

            this.renderDOM();

            this.$calendarTitle_text = this.$calendar_title.find('.title');
            this.$backToday = $('#backToday');
            this.$arrow_prev = this.$calendar_title.find('.arrow-prev');
            this.$arrow_next = this.$calendar_title.find('.arrow-next');
            this.$calendarDate_item = this.$calendar_date.find('.item');
            this.$calendarToday_date = this.$calendar_today.find('.date');
            this.$calendarToday_week = this.$calendar_today.find('.week');

            this.showCalendar();

            if (this.opts.ifSwitch) {
                this.$arrow_prev.bind('click', function (e) {
                    var _date = dateObj.getDate();

                    dateObj.setDate(new Date(_date.getFullYear(), _date.getMonth() - 1, 1));

                    self.showCalendar();

                    e.stopPropagation();
                });

                this.$arrow_next.bind('click', function (e) {
                    var _date = dateObj.getDate();

                    dateObj.setDate(new Date(_date.getFullYear(), _date.getMonth() + 1, 1));

                    self.showCalendar();

                    e.stopPropagation();
                });
            }

            if (this.opts.backToday) {
                this.$backToday.bind('click', function () {
                    if (!self.$calendarDate_item.hasClass('item-curDay')) {
                        dateObj.setDate(new Date());

                        self.showCalendar();
                    }
                });
            }

            this.$calendarDate_item.hover(function () {
                //self.showHoverInfo($(this));
            }, function () {
                self.$calendar_today.css({left: 0, top: 0}).hide();
            });
        },

        constructor: Calendar
    };

    $.fn.calendar = function (options) {
        var calendar = new Calendar(this, options);

        return calendar.inital();
    };


    // ========== 使用到的方法 ==========

    var dateObj = (function () {
        var _date = new Date();

        return {
            getDate: function () {
                return _date;
            },

            setDate: function (date) {
                _date = date;
            }
        }
    })();

    function returnDateStr(date) { // 日期转字符串
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        month = month <= 9 ? ('0' + month) : ('' + month);
        day = day <= 9 ? ('0' + day) : ('' + day);

        return year + month + day;
    };

    function changingStr(fDate) { // 字符串转日期
        var fullDate = fDate.split("-");

        return new Date(fullDate[0], fullDate[1] - 1, fullDate[2]);
    };

})(jQuery, window, document);