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
			//auto: true,//iPhone4s 可能还没读出storage
			callback: pullupRefresh
		}
	},
	beforeback: function() {
		appPage.closeLogin();
	}
})

var pageno = 0; //初始页码
var pagecount = 1; //总页数
var type = 1 //当前状态，1为全部
var lon = ""; //经度
var lat = ""; //纬度
var showwaitting = false;
mui.plusReady(function() {
	storage.init();
	//注册登录事件
	appPage.registerCheckLoginEvent();

	//切换
	mui(".kidNav").on("tap", "a", function() {
		if(type == this.dataset.type) {
			return;
		}
		type = this.dataset.type;
		//切换tab重新加载数据
		pageno = 0;
		pagecount = 1;
		showwaitting = true;
		getList();
	})

	//搜索
	document.getElementById("search").addEventListener("tap", function() {
		mui.openWindow({
			url: "searchFight.html",
			id: "searchFight.html",
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
	//二级
	mui("#list_warp").on("tap", ".detail", function() {
		openNew("../match/detail.html", {
			id: this.dataset.id,
			getMatchDetail: 'getMatchDetail' //说明从战帖列表页来的
		});
	});
	//刷新页面
	window.addEventListener('refreshPage', function(event) {
		storage.init();
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "刷新页面");
		initPage();

	});
	//检查受邀
	//	window.addEventListener('checkPage', function(event) {
	//		var pwc = plus.webview.currentWebview();
	//		log(pwc.id + "checkPage页面");
	//		checkInvitation();		
	//	});
});

function initPage() {
	storageUser = kidstorageuser.getInstance();
	storageLocation = kidstoragelocation.getInstance();
	lon = storageLocation.Lon;
	lat = storageLocation.Lat;
	getList(); //第一次加载
	checkInvitation();
	setInterval(function() {
		checkInvitation(); //3秒刷新一次检查是否受邀请
	}, 3000);

	//关闭登录
	//appPage.closeLogin();
}
//渲染列表
function getList(isnextpage, isreload) {
	if(type == 3) {
		if(!storageUser.IsLogin) {
			mui.alert("宝宝，登录后才能查看好友参加赛事");
			return;
		}
	}
	if(type == 4) {
		if(!storageUser.IsLogin) {
			mui.alert("宝宝，登录后才能查看自己发起赛事");
			return;
		}
	}

	if(isnextpage) { //加载下一页
		pageno++;
	} else if(isreload) { //重新加载当前页
		//pageno = curr_pageno;
	} else if(pageno == 0) {
		pageno = 1; //未加载过
	} else {
		pageno = 1; //默认加载第一页
	}

	if(pageno > pagecount) {
		appPage.endPullRefresh(true);
		return;
	}
	var isappend = pageno > 1 ? true : false;

	var param = {},
		url = "/Match/getMatchList";
	storageLocation.log();
	lon = storageLocation.Lon;
	lat = storageLocation.Lat;
	//alert(type)
	if(type == 1) {
		param = {
			lon: lon,
			lat: lat,
			pageindex: pageno,
			playerid: storageUser.UId
		}
	} else if(type == 2) {
		param = {
			lon: lon,
			lat: lat,
			pageindex: pageno,
			playerid: storageUser.UId,
			type: "new"
		}
	} else if(type == 3) {
		url = "/Match/getFriendMatchList";
		param = {
			lon: lon,
			lat: lat,
			pageindex: pageno,
			playerid: storageUser.UId
		}
	} else if(type == 4) {
		url = "/Match/getMyCreateMatchList";
		param = {
			lon: lon,
			lat: lat,
			pageindex: pageno,
			playerid: storageUser.UId
		}
	}
	request(url, param, function(json) {
		var nomore = true;
		if(json.code == 0) {
			pagecount = json.pagecount || 0; //总页码
			render("#list_warp", "list_view", json, isappend);
			appPage.imgInit();
			nomore = pageno >= pagecount;
		} else {
			var arr = document.getElementsByClassName("nodata");
			for(var i = 0; i < arr.length; i++) {
				arr[i].innerText = "暂无内容";
			}
			if(type == 3) appUI.showTopTip(json.msg);
		}
		appPage.endPullRefresh(nomore);
	}, showwaitting, function() {
		appPage.endPullRefresh(true);
	});
}

function checkInvitation() {
	if(storageUser.UId > 0) {
		//		request("/Match/checkWhetherHaveInviteMatch", {
		//			playerid: storageUser.UId
		//		}, function(json) {
		//			if(json.code == 0) {
		//				if(json.countinvite > 0) { //包含受邀
		//					document.getElementById("yaoqing").setAttribute("class", "active ckecklogin");
		//				} else { //不包含受邀
		//					document.getElementById("yaoqing").setAttribute("class", "ckecklogin");
		//				}
		//			}
		//		}, false, function() {}, false);
	}
}
//下拉刷新具体业务实现
function pulldownRefresh() {
	showwaitting = false;
	pagecount = 1;
	getList(false);
	checkInvitation();
}

// 上拉加载具体业务实现
function pullupRefresh() {
	showwaitting = false;
	getList(true);
	//checkInvitation();
}
//刷新单条详情
function refreshDetail(matchid) {
	request("/Match/getMatchOne", {
		playerid: storageUser.UId,
		matchid: matchid,
		lon: lon,
		lat: lat
	}, function(json) {
		if(json.code == 0) {
			json.item = json.data;
			render("#match_" + matchid, "detail_view", json);
			appPage.imgInit();
		} else {
			appUI.showTopTip(json.msg);
		}
	});
}
var pkEvent = {
	goPK: function() {
		openNew("war.html");
	},
	goInvitation: function() {
		openNew("invitation.html");
	},
	joinPK: function(matchid) {
		mui.confirm('确定加入这场PK？', '', ['否', '是'], function(e) {
			if(e.index == 1) {
				request("/Match/joinMatch", {
					playerid: storageUser.UId,
					matchid: matchid,
					lon: lon,
					lat: lat
				}, function(json) {
					appUI.showTopTip(json.msg);
					if(json.code == 0) {
						//刷新单条状态
						refreshDetail(matchid);
						//进入详情页
						openNew("../match/detail.html", {
							id: matchid,
							getMatchDetail: 'getMatchDetail' //说明从战帖列表页来的
						});
					}

				})
			}
		})
	},
	acceptPK: function(matchid) {
		mui.confirm('确定接受这场PK？', '', ['否', '是'], function(e) {
			if(e.index == 1) {
				request("/Match/inviteMatchYorN", {
					playerid: storageUser.UId,
					matchid: matchid,
					type: 'Y',
					lon: storageLocation.Lon,
					lat: storageLocation.Lat
				}, function(json) {
					appUI.showTopTip(json.msg);
					//刷新单条状态
					refreshDetail(matchid);
					//进入详情页
					openNew("../match/detail.html", {
						id: matchid,
						getMatchDetail: 'getMatchDetail' //说明从战帖列表页来的
					});
				})
			}
		})
	},
	refusePK: function(matchid) {
		mui.confirm('确定拒绝这场PK？', '', ['否', '是'], function(e) {
			if(e.index == 1) {
				request("/Match/inviteMatchYorN", {
					playerid: storageUser.UId,
					matchid: matchid,
					type: 'N',
					lon: storageLocation.Lon,
					lat: storageLocation.Lat
				}, function(json) {
					appUI.showTopTip(json.msg);
					//刷新单条状态
					refreshDetail(matchid);
				})
			}
		})
	}
}