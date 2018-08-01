//bmob云存储初始化
Bmob.initialize("e0a51a8e943e642a0269d0925d9e9688", "9335d129f2514d28bb20174d65dd75f5");
//返回主页
$('#goback').click(function(){
    window.location.href = './../index.html';
});

// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementsByClassName('bar_graph')[0]);
//存储该组员工的list
var groupUserList = [];
/** 任务分配系统的数据结构 **/
var taskList = [];
//当前选中的前置任务
var currentSelectedPretask = '';
//后置
var currentSelelctedAftertask = '';
//任务先后顺序的list
var taskOrderList = [];

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
    //只查询自己组员的数据
    queryMonthRecords.containedIn('username',groupUserList);
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

//添加任务的按钮
$('#task-input-add').click(function(){
    var task = $('#task-input').val();
    if(!task.trim()){
        return
    }
    //不能重复添加
    if(taskList.indexOf(task)===-1){
			taskList.push(task)
    }
    //清空panel
    $('#add-task-panel').html('');
    //添加任务
    var documentFragment = $('<div></div>');
    for(var i=0;i<taskList.length;i++){
			var btn = $('<button type="button" class="btn btn-success mr-btn">'+taskList[i]+'</button>');
      (function(i){
				btn.click(function(){
					//删除该按钮
          var taskIndex = taskList.indexOf(taskList[i]);
          taskList.splice(taskIndex,1);
          $(this).remove()
				});
      })(i)

			documentFragment.append(btn)
    }
    $('#add-task-panel').append(documentFragment)

});
//前置任务的下拉按钮
$('#pre-first').click(function(){
    if(taskList.length===0){
        return
    }
    //清空下面的ul
    $('#pre-ul').html('');
    //添加li
    for(var i=0;i<taskList.length;i++){
			var taskname = taskList[i];
			var aLink =$('<a></a>');
			aLink.text(taskname)
			var li = $('<li></li>');
			li.append(aLink);
			(function(i){
				li.click(function(){
					var btn = $('#pre-first')
					btn.text(taskList[i])
					var span = $('<span class="caret caret-margin-left"></span>')
					btn.append(span);
					currentSelectedPretask = taskList[i]
        })
			})(i);
			$('#pre-ul').append(li);
    }
})
//后置任务的下拉按钮
$('#pre-second').click(function(){
	if(taskList.length===0){
		return
	}
	//清空下面的ul
	$('#after-ul').html('');
	//添加li
	for(var i=0;i<taskList.length;i++){
		var taskname = taskList[i];
		var aLink =$('<a></a>');
		aLink.text(taskname)
		var li = $('<li></li>');
		li.append(aLink);
		(function(i){
			li.click(function(){
				var btn = $('#pre-second')
				btn.text(taskList[i])
				var span = $('<span class="caret caret-margin-left"></span>')
				btn.append(span);
				currentSelelctedAftertask = taskList[i];
			})
		})(i);
		$('#after-ul').append(li);
	}
})

//添加任务关系的按钮
$('#task-input-add-pre').click(function(){
    //任务不能一样且非空
    if(!currentSelelctedAftertask || !currentSelectedPretask || (currentSelelctedAftertask===currentSelectedPretask)){
        return
    }
    //如果重复了也不行
    var isDuplicated = false
    taskOrderList.forEach(function(item){
        if(item[0]===currentSelectedPretask && item[1]===currentSelelctedAftertask){
					isDuplicated=true
        }
    })
    if(isDuplicated){
        return
    }
    taskOrderList.push([currentSelectedPretask,currentSelelctedAftertask])
    //更新html
    $('#add-task-panel-pre').html('');
    //添加任务
    var documentFragment = $('<div></div>');
    for(var i=0;i<taskOrderList.length;i++){
      var btn = $('<button type="button" class="btn btn-primary mr-btn">'+taskOrderList[i][0]+' <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> '+taskOrderList[i][1]+'</button>');
      (function(i){
        var temp = taskOrderList[i];
        btn.click(function(){
          //删除该按钮
          for(var j=0;j<taskOrderList.length;j++){
            var item = taskOrderList[j];
						if(item[0]===temp[0] && item[1]===temp[1]){
							taskOrderList.splice(j,1)
              $(this).remove();
						}
          }
        });
      })(i)
      documentFragment.append(btn)
    }
    $('#add-task-panel-pre').append(documentFragment)

})

//生成任务方案
$('#generate-scheme').click(function(){
    if(taskList.length === 0 || taskOrderList.length === 0){
			//清空
			$('#task-result').html('');
			//无可行方案
			var title = $('<div class="not-avaliable">无可行方案，请重新规划</div>')
			$('#task-result').append(title)
      return;
    }
    //清空
    $('#task-result').html('');
    //构建序号的任务名称的对应关系
    var map = {},map2 = {};
    for(var i=0;i<taskList.length;i++){
        map[taskList[i]]=i;
        map2[i] = taskList[i];
    }
    //构建任务顺序序号关系数组
    var taskIndexOrderArray = [];
    for(var i=0;i<taskOrderList.length;i++){
        var arr = [map[taskOrderList[i][0]],map[taskOrderList[i][1]]];
			  taskIndexOrderArray.push(arr)
    }
    //获取方案结果
    var schemeResult = getAvaliableScheme(taskIndexOrderArray,taskList.length)
    if(schemeResult.isAvaliable){
        //存在可行方案
        var result = schemeResult.result;
        var taskResult = map2[result[0]];
        for(var i=1;i<result.length;i++){
            taskResult+=' <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> ';
            taskResult+=map2[result[i]]
        }
			  $('#task-result').html(taskResult);

    }else{
        //无可行方案
        var title = $('<div class="not-avaliable">无可行方案，请重新规划</div>')
			  $('#task-result').append(title)
    }


})
//拓扑排序算法
function getAvaliableScheme(prerequisiteArray,courseNum){
	//图，由邻接链表表示
	var graph = [];
	for(var i=0;i<courseNum;i++){
	    graph.push([])
  }
	//入度列表
	var inDegreeList = [];
	for(var i=0;i<courseNum;i++){
		inDegreeList.push(0)
	}
	//构建图和入度列表
	for(var i=0;i<prerequisiteArray.length;i++){
		var from = prerequisiteArray[i][0],
				to = prerequisiteArray[i][1];
		//入度加一
		inDegreeList[to]++;
		graph[from].push(to);
	}

	//入度为0的点的队列
	var queue = [];
	for(var i=0;i<inDegreeList.length;i++){
		if(inDegreeList[i]===0){
			queue.push(i);
		}
	}

	//拓扑排序,bfs
	var result = []
	while(queue.length>0){
		//获取队首元素
		var front = queue.pop();
		result.push(front)
		for(var i=0;i<graph[front].length;i++){
			var toIndex = graph[front][i];
			inDegreeList[toIndex]--;
			if(inDegreeList[toIndex]===0){
				queue.unshift(toIndex)
			}
		}
	}

	//检测是否存在环，若存在环则无法完成(还存在入度不为0的点)
	var isAvaliable = true;
	for(var i=0;i<inDegreeList.length;i++){
		if(inDegreeList[i]!==0){
			isAvaliable = false
			break;
		}
	}
	return {
	   isAvaliable:isAvaliable,
     result:result
  }
}

$(document).ready(function(){
    //获取到group
    var group = getCookie('group');
    //根据group获取到该员工所在组的所有员工
    var userInfo = Bmob.Object.extend('user');
    var queryUser = new Bmob.Query(userInfo);
    queryUser.equalTo('group',group);
    //查询员工
    queryUser.find({
        success:function(results){
            if(results.length>0){
                for(var i=0;i<results.length;i++){
                    groupUserList.push(results[i].get('username'))
                }
            }
        },
        error: function(error) {
            alert("初始化失败请刷新页面: " + error.code + " " + error.message);
        }
    })
});

