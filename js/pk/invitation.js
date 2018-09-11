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
			//auto:true,
			callback: pullupRefresh
		}
	},
	beforeback: function() {
		appPage.closeLogin();
	}
})

var pageno = 0; //初始页码
var pagecount = 1; //总页数
//下拉刷新具体业务实现
function pulldownRefresh() {
	getList();
}

// 上拉加载具体业务实现
function pullupRefresh() {
	getList(true);
}
mui.plusReady(function() {
	storage.init();
	getList();
	appPage.registerCheckLoginEvent();
	//二级
	mui("#invitation").on("tap", ".detail", function() {
		openNew("../match/detail.html", {
			id: this.dataset.id,
			getMatchDetail: 'getMatchDetail' //说明从战帖列表页来的
		});
	});

})

//渲染列表
function getList(isnextpage, isreload) {

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

	request("/Match/inviteMatchList", {
		playerid: storageUser.UId,
		pageindex: pageno
	}, function(json) {
		var nomore = true;
		if(json.code == 0) {
			pagecount = json.pagecount || 0; //总页码			
			render("#invitation", "invitationTep1", json, isappend);
			nomore = pageno >= pagecount;
		} else {
			appUI.showTopTip(json.msg);
		}
		appPage.endPullRefresh(nomore);
		appPage.imgInit();
	}, false, function() {
		appPage.endPullRefresh(true);
	});
}
//刷新单条详情
function refreshDetail(matchid) {
	request("/Match/getMatchOne", {
		playerid: storageUser.UId,
		matchid: matchid,
		lon: storageLocation.Lon,
		lat: storageLocation.Lat
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