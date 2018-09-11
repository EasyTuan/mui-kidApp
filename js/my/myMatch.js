mui.init({
	swipeBack: false,
	beforeback: function() {
		appPage.closeLogin();
	}
});
var currpagenoarr = [0, 0, 0, 0]; //各tab当前页码
var pagecountarr = [1, 1, 1, 1]; //各tab总页数
var typearr = ["all", "not", "over", "cancel"];
var curr_index = 0; //当前类型下标
var _pullobj;
mui.plusReady(function() {
	storage.init();
	initPage();

	//详情页
	mui(".mui-slider-group").on("tap", ".detail", function() {
		if(plus.webview.getWebviewById('match/detail.html') == null) {
			openNew("../match/detail.html", {
				id: this.dataset.id
			});
		} else {
			mui.fire(plus.webview.getWebviewById('match/detail.html'), 'uploadList', {
				id: this.dataset.id
			});
			openNew("../match/detail.html", {
				id: this.dataset.id
			});
		}

	})
	//切换tab
	document.getElementById('slider').addEventListener('slide', function(e) {
		var index = e.detail.slideNumber;
		curr_index = index;
		var pageno = currpagenoarr[curr_index];
		if(pageno == 0) {
			loadData(curr_index);
		}
	});
	//搜索
	document.getElementById("search").addEventListener("tap", function() {
		mui.openWindow({
			url: "myMatchSearch.html",
			id: "myMatchSearch.html",
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
	});

	//循环初始化所有下拉刷新，上拉加载。
	for(var i = 0; i < 4; i++) {
		mui(document.getElementById("scroll" + i)).pullToRefresh({
			down: {
				callback: function() {
					var self = this;
					loadData(); //第一页
					self.endPullDownToRefresh();
				}
			},
			up: {
				//auto:true,
				callback: function() {
					var self = this;
					_pullobj = self;
					loadData(true, false, _pullobj); //下一页
				}
			}
		});
	}
	//阻尼系数
	var deceleration = mui.os.ios ? 0.003 : 0.0009;
	mui('.mui-scroll-wrapper').scroll({
		bounce: false,
		indicators: true, //是否显示滚动条
		deceleration: deceleration
	});

});

function initPage() {
	loadData(curr_index);
}

function loadData(isnextpage, isreload, pullobj) {
	var pageno = currpagenoarr[curr_index]; //从数组中取出当前类别的当前页码
	if(isnextpage) { //加载下一页
		pageno++;
	} else if(isreload) { //重新加载当前页
		pageno = curr_pageno;
	} else if(pageno == 0) {
		pageno = 1; //未加载过
	} else {
		pageno = 1; //默认加载第一页
	}
	var contwarp = "contwarp" + curr_index; //内容容器
	var showload = pageno == 1;
	var isappend = pageno > 1 ? true : false;
	var pagecount = pagecountarr[curr_index];
	log(curr_index + "," + pageno + "," + pagecount + "," + showload + "," + isappend + "," + contwarp)

	if(pageno > pagecount) {
		mui(document.getElementById("scroll" + curr_index)).pullToRefresh().endPullUpToRefresh(true);
		return;
	}
	request("/Player/getPlayerMatchList", {
		playerid: storageUser.UId,
		type: typearr[curr_index],
		pageindex: pageno
	}, function(json) {
		var nomore = true;
		if(json.code == 0) {
			currpagenoarr[curr_index] = pageno; //更新当前页码
			pagecountarr[curr_index] = json.pagecount; //总页码
			render("#" + contwarp, "mymatch_view", json, isappend);
			appPage.imgInit();
			nomore = pageno >= json.pagecount;
		} else {
			//appUI.showTopTip(json.msg);
			mui.toast(json.msg);
		}
		mui(document.getElementById("scroll" + curr_index)).pullToRefresh().endPullUpToRefresh(nomore);
	}, false, function() {
		mui(document.getElementById("scroll" + curr_index)).pullToRefresh().endPullUpToRefresh(true);
	});
}