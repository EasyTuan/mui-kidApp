var pageno = 1,
	pagecount = 1,
	keyword = "",
	lon, lat;
mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: { //下拉刷新
			callback: pulldownRefresh,
			style: mui.os.android ? "circle" : "default"
			//auto: true
		}
	}
});

//下拉刷新具体业务实现
function pulldownRefresh() {
	if(pullrefresh.style.display == "none") {
		appPage.endPullRefresh(true);
		return;
	}
	//重置页码
	pageno = 1;
	loadData();
}

// 上拉加载具体业务实现
function pullupRefresh() {
	if(pullrefresh.style.display == "none") {
		appPage.endPullRefresh(true);
		return;
	}
	loadData(true);
}
mui.plusReady(function() {
	storage.init();
	lat = storageLocation.Lat;
	lon = storageLocation.Lon;
	loadHistoryData();
	var inpt_search = document.getElementById("inpt_search");
	var history_warp = document.getElementById("history_warp");
	var pullrefresh = document.getElementById("pullrefresh");
	var searchresult_warp = document.getElementById("searchresult_warp");

	document.getElementById("clear").addEventListener("tap", function() {
		var btnArray = ['否', '是'];
		mui.confirm('确定删除所有记录吗？', "", btnArray, function(e) {
			if(e.index == 1) {
				appSearchHistory.searchBbs.clear();
				var el = document.getElementsByClassName('historyList')[0];
				el.parentNode.removeChild(el);
			} else {

			}
		})
	});

	//帖子详情页
	mui("#searchresult_warp").on("tap", ".bbs", function() {
		openNew("../bbs/bbsDetails.html", {
			id: this.dataset.id
		});
	})

	//频道详情页
	mui("#searchresult_warp").on("tap", ".channel", function() {
		openNew("../bbs/channelDetails.html", {
			nodeid: this.dataset.id
		});
	})

	inpt_search.addEventListener("focus", function() {
		showWarp(1);
		loadHistoryData();
	});

	//输入框变化
	document.getElementById("inpt_search").addEventListener("input", function(e) {

		if(this.value == "") {
			document.getElementById("backBtn").style.display = "block";
			document.getElementById("searchBtn").style.display = "none";
			return;
		}
		document.getElementById("backBtn").style.display = "none";
		document.getElementById("searchBtn").style.display = "block";
	})
	//清空
	mui(".searchbar").on("tap", "span.mui-icon-clear", function() {
		if(inpt_search.value == "") {
			document.getElementById("backBtn").style.display = "block";
			document.getElementById("searchBtn").style.display = "none";
			return;
		}
	})
	document.getElementById("searchBtn").addEventListener("tap", function() {
		var val = inpt_search.value.trim();
		if(val != "") {
			appSearchHistory.searchBbs.update(val);
		}
		showWarp(2);
		var kw = document.getElementById("inpt_search").value.trim();
		if(kw == keyword)
			return;
		keyword = kw;
		loadData();
	});

});

//加载搜索历史
function loadHistoryData() {
	history_warp.style.display = "block";
	var json = {};
	json.data = appSearchHistory.searchBbs.list();
	render("#historylist_warp", "historylist_view", json);
	mui("#historylist_warp").on("tap", "span", function() {
		var _keyword = this.innerText;
		document.getElementById("backBtn").style.display = 'none';
		document.getElementById("searchBtn").style.display = 'block';
		document.getElementById("inpt_search").value = _keyword;
		showWarp(2);
		if(_keyword == keyword)
			return;
		keyword = _keyword;
		loadData();
	})
}
//加载数据
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
	request("/Index/bbsHomeSearch", {
		keywords: keyword,
	}, function(json) {
		log('搜索数据：' + json);
		var nomore = true;
		if(json.code == 0) {
			pagecount = json.pagecount; //总页码			
			nomore = pageno >= json.pagecount;
		} else {
			appUI.showTopTip(json.msg);
			//mui.toast(json.msg);
		}
		if(json.data == null || json.data.length == 0) {
			document.getElementById("searchresult_warp").innerHTML = "<div class='nodata'>暂无记录</div>";
			return;
		}
		render("#searchresult_warp", "searchresult_view", json.data, isappend);
		appPage.imgInit();
		appPage.endPullRefresh(nomore);
	}, true, function() {
		appPage.endPullRefresh(true);
	});
}
//设置显示区域
function showWarp(type) {
	if(type == 1) //显示搜索历史
	{
		history_warp.style.display = "block";
		pullrefresh.style.display = "none";
		//appPage.enablePullRefresh(false);//禁用上拉下拉
	} else { //显示搜索结果
		history_warp.style.display = "none";
		pullrefresh.style.display = "block";
		//appPage.enablePullRefresh(true);//启用上拉下拉
	}
}