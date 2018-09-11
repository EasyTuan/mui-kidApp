var pageno = 1;
var pagecount = 1;
mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: { //下拉刷新
			callback: pulldownRefresh,
			style: mui.os.android ? "circle" : "default"
			//auto: true
		},
		up: { //上拉加载
			contentinit: '',
			contentrefresh: '正在加载...',
			contentnomore: '没有更多了',
			callback: pullupRefresh,

		}
	}
});
mui.plusReady(function() {
	storage.init();
	loadData();
	//二级
	mui("#list_warp").on("tap", ".detail", function() {
		openNew("newsDetail.html", {
			id: this.dataset.id
		});
	})

	//搜索
	document.getElementById("search").addEventListener("tap", function() {
		mui.openWindow({
			url: "newsSearch.html",
			id: "news/newsSearch.html",
			show: {
				autoShow: true, //页面loaded事件发生后自动显示，默认为true
				aniShow: "none", //页面显示动画，默认为”slide-in-right“；
				event: 'titleUpdate', //页面显示时机，默认为titleUpdate事件时显示
				extras: {} //窗口动画是否使用图片加速
			},
			waiting: {
				autoShow: false, //自动显示等待框，默认为true
			}
		})
	})

});
//下拉刷新具体业务实现
function pulldownRefresh() {
	//重置页码
	pageno = 1;
	loadData();
}

// 上拉加载具体业务实现
function pullupRefresh() {
	loadData(true);
}

function loadData(isnextpage, isreload) {
	if(isnextpage) { //加载下一页
		pageno++;
	} else if(isreload) { //重新加载当前页
		pageno = curr_pageno;
	} else if(pageno == 0) {
		pageno = 1; //未加载过
	} else {
		pageno = 1; //默认加载第一页
	}
	var showload = pageno == 1;
	var isappend = pageno > 1 ? true : false;
	log(pageno + "," + pagecount + "," + showload + "," + isappend)
	if(pageno > pagecount) {
		appPage.endPullRefresh(true);
		return;
	}

	request("/News/getNewsList", {
		cityid: storageLocation.CityId,
		pageindex: pageno
	}, function(json) {
		var nomore = true;
		if(json.code == 0) {
			pagecount = json.pagecount || 0; //总页码
			render("#list_warp", "list_view", json, isappend);
			appPage.imgInit();
			nomore = pageno >= pagecount;
		} else {
			appUI.showTopTip(json.msg);
		}
		appPage.endPullRefresh(nomore);
	}, false, function() {
		appPage.endPullRefresh();
	});

}