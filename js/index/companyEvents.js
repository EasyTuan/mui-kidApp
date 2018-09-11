mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: { //下拉刷新
			callback: pulldownRefresh,
			style: mui.os.android ? "circle" : "default"
		},
		up: {
			contentinit: '',
			contentrefresh: '正在加载...',
			contentnomore: '没有更多了',
			callback: pullupRefresh
		}
	}
})

var page = 1; //初始页码
var pageCount = 0; //总页数

mui.plusReady(function() {
	//打开二级
	mui(".infoList").on("tap", "li", function() {
		openNew("companyEventsDetails.html");
	})
})

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		//下拉刷新结束
		mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
		//重置上拉加载
		mui('#pullrefresh').pullRefresh().refresh(true);
		//重置页码
		page = 1;
	}, 1500)
}

// 上拉加载具体业务实现
function pullupRefresh() {
	if(pageCount > page) {
		log(mklog() + '上拉加载开始！！');
		setTimeout(function() {
			/*request('getGiftList', {
				categoryId: index,
				pageIndex: page + 1
			}, function(r) {
				var pageCount = r.data.pageCount;
				log(mklog() + '上拉加载：' + '第' + page + '页/共' + pageCount + '页')
				//渲染数据
				if(page <= pageCount){
					render("#libao", "libaoTep1", r.data,true);
				}
				//停止上拉加载，参数为true代表没有更多数据了。
				mui('#pullrefresh').pullRefresh().endPullupToRefresh((page >= pageCount));
			});*/
			page++;
			log(mklog() + '上拉加载结束！！')
		}, 1500);
	} else {
		//mui.toast("温馨提示：没有更多数据");
		mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
	}

}