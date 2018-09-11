var pageno = 1,
	pagecount = 1,
	friendid;
mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: { //下拉刷新
			callback: pulldownRefresh,
			style: mui.os.android ? "circle" : "default",
			//auto: true
		},
		up: { //上拉加载
			contentinit: '',
			contentrefresh: '正在加载...',
			contentnomore: '没有更多了',
			callback: pullupRefresh
			//auto: true

		}
	}
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
mui.plusReady(function() {
	storage.init();
	friendid = appPage.getParam("id");
	loadData();
	//详情页
	mui("#pullrefresh").on("tap", ".detail", function() {
		var id = this.getAttribute("data-id")
		//alert(id);
		openNew("../match/detail.html", {
			id: id
		});
	})

});

//function initEvent() {
//	//详情页
//	mui(".mui-slider-group").on("tap", ".detail", function() {
//		var id = this.getAttribute("data-id")
//		openNew("myMatchDetail.html", {
//			id: id
//		});
//	})
//}

function loadData(isnextpage, isreload) {
	if(isnextpage) { //加载下一页
		pageno++;
	} else if(isreload) { //重新加载当前页
		pageno = pageno;
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
	request("/Player/getPlayerFriendMatchMore", {
		playerid: storageUser.UId,
		friendid: friendid,
		pageindex: pageno
	}, function(json) {
		var nomore = true;
		if(json.code == 0) {
			pagecount = json.pagecount; //总页码			
			nomore = pageno >= json.pagecount;
		} else {
			mui.toast(json.msg);
		}
		render("#searchresult_warp", "searchresult_view", json, isappend);
		appPage.imgInit();
		appPage.endPullRefresh(nomore);
	});
}