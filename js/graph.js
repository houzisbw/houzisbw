/**
 * Created by Administrator on 2017/9/17.
 */
//bmob云存储初始化
Bmob.initialize("e0a51a8e943e642a0269d0925d9e9688", "9335d129f2514d28bb20174d65dd75f5");

//返回主页
var goBackButton = document.getElementById('goback');
goBackButton.onclick = function(){
    window.location.href = './../index.html';
}


//设置innerText
function setInnerText(element,text){
    if(typeof element.textContent == "string"){
        element.textContent = text;
    }else{
        element.innerText = text;
    }
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
//获取innerTEXT,兼容火狐
function getInnerText(element) {
    return (typeof element.textContent == "string") ? element.textContent : element.innerText;
}
//兼容ie8及以下去除空格
String.prototype.trim = function () {
    return this.replace(/^\s*|\s*$/g, "");
}

//年份input
var yearInput = document.getElementById('year_input');
//月份input
var monthInput = document.getElementById('month_input');
//查询按钮
var graphSearchButton = document.getElementById('graph_search_button');
// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementsByClassName('bar_graph')[0]);
graphSearchButton.onclick = function(){
    var month = monthInput.value.trim();
    var year = yearInput.value.trim();
    if(month =='' || year == ''){
        alert('请输入年月！');
        return;
    }
    //对month做处理，比如输入9变成09，加0处理
    if(month.length == 1){
        month = '0'+month;
    }
    //查询当月数据
    var Records = Bmob.Object.extend('record');
    var queryMonthRecords = new Bmob.Query(Records);
    var dateStr = year+'-'+month;
    queryMonthRecords.equalTo('monthDate',dateStr);
    queryMonthRecords.find({
        success:function(results){
            //清空画布
            myChart.clear();
            //记录错误类型和次数的对象
            var recordTypeObj = {};
            if(results.length>0){
                //总次数
                var totalRecordsNum = 0;
                //y轴data数组
                var yAxisArray = [];
                for(var i=0;i<results.length;i++){
                    var currentType = results[i].get('type');
                    //这里要判断记录是否为空
                    if(currentType =='' ||currentType == undefined){
                        currentType = '(未命名)';
                    }
                    if(recordTypeObj.hasOwnProperty(currentType)){
                        recordTypeObj[currentType]++;
                    }else{
                        recordTypeObj[currentType] = 1;

                    }
                }



                //初始化x,y轴数组
                var xAxisArray = [];
                //最高次数的记录
                var mostFrequentRecordName = '',
                    mostFrequentRecordCount = 0;
                for(var key in recordTypeObj){
                    totalRecordsNum += recordTypeObj[key];
                    yAxisArray.push(key);
                    xAxisArray.push(recordTypeObj[key]);
                    if(recordTypeObj[key] > mostFrequentRecordCount){
                        mostFrequentRecordCount = recordTypeObj[key];
                        mostFrequentRecordName = key;
                    }
                }

                var option = {
                    title: {
                        text: year+'年'+month+'月错误记录次数 (拖动右侧滑块放大/缩小显示区域)',
                        subtext: '总错误记录次数: '+totalRecordsNum +' 最高频率记录：'+mostFrequentRecordName+'  出现次数: '+mostFrequentRecordCount+'   占比: '+(mostFrequentRecordCount/totalRecordsNum*100).toFixed(1).toString()+'%',
                        subtextStyle:{
                            color:'#706d6d',
                            fontSize:14
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        data: ['错误次数'],
                        height:'1000'
                    },
                    grid: {
                        left: '5%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'value',
                        boundaryGap: [0, 0.01],
                        name:'记录次数',
                        nameLocation:'center',
                        nameGap:20
                    },
                    yAxis: {
                        type: 'category',
                        data: yAxisArray,
                        name:'记录种类',
                        nameLocation:'center',
                        nameGap:60
                    },
                    series: [
                        {
                            name: '次数',
                            type: 'bar',
                            data: xAxisArray,
                            stack: 'chart',
                            label: {
                                normal: {
                                    position: 'right',
                                    show: true,
                                    formatter:function(obj){
                                        var c = obj['value'];
                                        var tailString = (c/totalRecordsNum*100).toFixed(1).toString()+'%';
                                        return c+'  ('+tailString+')';
                                    },
                                    fontSize:13,
                                    fontWeight:'bold',
                                    color:"#c46f6f"

                                }
                            }

                        }

                    ],
                    dataZoom: [
                        {
                            type: 'slider',
                            show: true,
                            yAxisIndex: [0],
                            left: '93%',
                            start: 0,
                            end: 100
                        }
                    ]
                };
                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(option);


            }else{
                alert('未找到该月数据，请重新输入年月~');
                return;
            }
        }
    })


}


//初始化处理
document.body.onload = function (){

}



