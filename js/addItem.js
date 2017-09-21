/**
 * Created by Administrator on 2017/9/17.
 */
if(!window.localStorage){
    alert('浏览器不支持本地存储');
}
//本地存储
var ls = window.localStorage;
//本地存储的key：配置信息的3个字段
var staffName = 'staffName';
var workshopName = 'workshopName';
var recordType = 'recordType';

//6个要保存的值,编号1-6
var staffNameToSave = '';
var monthToSave = '';
var dateToSave = '';
var workshopNameToSave = '';
var recordTypeToSave = '';
var errorInstructionToSave = '';

//控制日历是否显示
var isCalendarShow = true;
var divCalendar = document.getElementById('date');
var calendarButton = divCalendar.getElementsByTagName('button')[0];
document.body.onclick = function(){
    $('#calendar').hide();
    isCalendarShow = true;
}


calendarButton.onclick = function(e){
    if(isCalendarShow) {
        $('#calendar').show();
    }else{
        $('#calendar').hide();
    }
    isCalendarShow = !isCalendarShow;
    //防止body触发
    e.stopPropagation();
}

//返回主页
var goBackButton = document.getElementById('goback');
goBackButton.onclick = function(){
    window.location.href = './../index.html';
}

//初始化所有下拉列表
//初始化通用函数,itemKey指的是localStorage里面的key
function initDropDownList(divTypeName,itemKey){
    var itemDiv = document.getElementById(divTypeName);
    var itemUl = itemDiv.getElementsByTagName('ul')[0];
    //通过getItem获取到value
    var itemStr = ls.getItem(itemKey);
    var itemList = itemStr.split('**');
    //弹出最后一个空元素
    itemList.pop();
    for(var i=0,len=itemList.length;i<len;i++){
        var aLink = document.createElement('a');
        aLink.innerText = itemList[i];
        var li = document.createElement('li');
        li.appendChild(aLink);
        //给每个li添加点击事件：点击后对应的button的innerText会改变，同时记录下选中的值
        //匿名函数立即执行,达到传递参数的目的
        (function(i){
            li.onclick = function(){
                var button = itemDiv.getElementsByTagName('button')[0];
                button.innerText = itemList[i]+'    ';
                var span = document.createElement('span');
                span.setAttribute('class','caret');
                button.appendChild(span);
                //记录下对应的数据
                if(divTypeName == 'name'){
                    staffNameToSave = itemList[i];
                }else if(divTypeName == 'workshop'){
                    workshopNameToSave = itemList[i];
                }else{
                    recordTypeToSave = itemList[i];
                }
            }
        })(i);
        itemUl.appendChild(li);
    }
}
//初始化月份下拉
function initMonthDropDownList(){
    var monthDiv = document.getElementById('month');
    var monthUl = monthDiv.getElementsByTagName('ul')[0];
    var monthLi = getElementChild(monthUl);
    for(var i=0,len=monthLi.length;i<len;i++){
        (function(i){
            monthLi[i].onclick=function(){
                var button = monthDiv.getElementsByTagName('button')[0];
                var aLink = getElementChild(monthLi[i])[0];
                button.innerText = aLink.innerText+'月 ';
                var span = document.createElement('span');
                span.setAttribute('class','caret');
                button.appendChild(span);
                //记录下选中的值
                monthToSave = aLink.innerText;
            }
        })(i);
    }
}

//清空数据
var resetButton = document.getElementById('reset_data');
resetButton.onclick=function(){
    window.location.reload();
}
//保存修改
var saveDataButton = document.getElementById('save_data');
saveDataButton.onclick = function(){

    //获取错误说明
    errorInstructionToSave = document.getElementById('error').value;
    if(!staffNameToSave && !monthToSave && !dateToSave && !workshopNameToSave && !recordTypeToSave && !errorInstructionToSave){
        alert('请至少填写一项!');
        return;
    }
    //月份作为key，必须填写
    if(!monthToSave){
        alert('请填写月份!');
        return;
    }
    //通过6个数据生成一个json字符串，并保存在localStorage里
    //首先取得当月的数据,是一个字符串
    var currentMonthRecordsStr = ls.getItem(monthToSave);

    //console.log(currentMonthRecordsStr)

    var tempRecordsArray = [];
    var obj = {
        name:staffNameToSave,
        date:dateToSave,
        workshop:workshopNameToSave,
        type:recordTypeToSave,
        error:errorInstructionToSave
    }
    //如果不存在记录
    if(!currentMonthRecordsStr){
        tempRecordsArray.push(obj);
    }else{
        //存在记录，在记录后面添加新的obj
        tempRecordsArray = JSON.parse(currentMonthRecordsStr);
        tempRecordsArray.push(obj);
    }
    var tempStr = JSON.stringify(tempRecordsArray);
    //保存
    ls.setItem(monthToSave,tempStr);

    //提示保存成功
    alert('保存数据成功!');
    //清空所填写的
    window.location.reload();
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
document.body.onload = function (){
    //alert不能执行，因为window还没有onload

    //初始化姓名列表
    //直接给bootstrap的ul加id会混乱样式，不知道为啥
    initDropDownList('name',staffName);
    //初始化车间名称列表
    initDropDownList('workshop',workshopName);
    //初始化记录类型列表
    initDropDownList('category',recordType);
    //初始化月份,直接通过选择日期来确定月份
    //initMonthDropDownList();

}


//////////////////////////////////////////日历js
// 关于月份： 在设置时要-1，使用时要+1
$(function () {

    $('#calendar').calendar({
        ifSwitch: true, // 是否切换月份
        hoverDate: true, // hover是否显示当天信息
        backToday: true // 是否返回当天
    });

});

;(function ($, window, document, undefined) {

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