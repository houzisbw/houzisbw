//bmob云存储初始化
Bmob.initialize("e0a51a8e943e642a0269d0925d9e9688", "9335d129f2514d28bb20174d65dd75f5");
//返回主页
$('#goback').click(function(){
    window.location.href = './../index.html';
});

// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementsByClassName('bar_graph')[0]);
//查询按钮
$('#graph_search_button').click(function(){
    var month = $('#month_input').val().trim();
    var year = $('#year_input').val().trim();
    if(month =='' || year == ''){
        showConfirmOnlyModal('请输入年月~',function(){
            $('.overlay').css('display','none');
            $('#modal_confirm_only').css('display','none');
        });
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

                //图表配置
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
                        nameGap:100
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
                showConfirmOnlyModal('未找到该月数据，请重新输入年月~',function(){
                    $('.overlay').css('display','none');
                    $('#modal_confirm_only').css('display','none');
                });
                return;
            }
        }
    })
});

