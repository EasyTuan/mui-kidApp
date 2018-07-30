var pageno = 1,
	pagecount = 1,
	storeid='',
	lon,lat;
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
			callback: pullupRefresh
			//auto: true

		}
	}
});

//下拉刷新具体业务实现
function pulldownRefresh() {
	if(pullrefresh.style.display=="none"){		
		appPage.endPullRefresh(true);
		return;
	}
	//重置页码
	pageno = 1;
	loadData();
}

// 上拉加载具体业务实现
function pullupRefresh() {
	if(pullrefresh.style.display=="none"){	
		appPage.endPullRefresh(true);
		return;
	}
	loadData(true);
}
mui.plusReady(function() {
	storage.init();
	lat=storageLocation.Lat;
	lon=storageLocation.Lon;
	var self=plus.webview.currentWebview();
	storeid=self.info.storeid;
	document.getElementById("shopName").innerHTML=self.info.shopname;
	loadData();

	//详情页
	mui("#searchresult_warp").on("tap", ".detail", function() {
		var id = this.getAttribute("data-id")		
		openNew("../match/detail.html", {
			id: id
		});
	})
	
	//注册登录事件
	appPage.registerCheckLoginEvent();

});

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
	request("/Store/getStoreMatchList", {
		playerid: storageUser.UId,
		pageindex: pageno,
		storeid:storeid,
		lon: lon,
		lat: lat
	}, function(json) {
		var nomore=true;
		if(json.code == 0) {
			pagecount = json.pagecount; //总页码			
			nomore = pageno >= json.pagecount;			
		} else {
			appUI.showTopTip(json.msg);
			//mui.toast(json.msg);
		}	
		render("#searchresult_warp", "searchresult_view", json,isappend);
		appPage.imgInit();
		appPage.endPullRefresh(nomore);
	},true,function(){
		appPage.endPullRefresh(true);
	});
}
//设置显示区域
function showWarp(type){
	if(type==1)//显示搜索历史
	{
		history_warp.style.display = "block";
		pullrefresh.style.display = "none";
		appPage.enablePullRefresh(false);//禁用上拉下拉
	}else{//显示搜索结果
		history_warp.style.display = "none";
		pullrefresh.style.display = "block";
		appPage.enablePullRefresh(true);//启用上拉下拉
	}
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
			json.item=json.data;
			render("#match_" + matchid, "detail_view", json);
			appPage.imgInit();
		} else {
			appUI.showTopTip(json.msg);
		}
	});
}
var pkEvent = {	
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
					openNew("../match/detail.html", {
						id: matchid,
						getMatchDetail: 'getMatchDetail' //说明从战帖列表页来的
					});
				})
			}
		})
	},
	acceptPK:function(matchid){
		mui.confirm('确定接受这场PK？', '', ['否', '是'], function(e) {
			if (e.index == 1) {
				request("/Match/inviteMatchYorN",{
					playerid:storageUser.UId,
					matchid:matchid,
					type:'Y',
					lon:storageLocation.Lon,
					lat:storageLocation.Lat
				},function(json){					
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
	refusePK:function(matchid){
		mui.confirm('确定拒绝这场PK？', '', ['否', '是'], function(e) {
			if (e.index == 1) {
				request("/Match/inviteMatchYorN",{
					playerid:storageUser.UId,
					matchid:matchid,
					type:'N',
					lon:storageLocation.Lon,
					lat:storageLocation.Lat
				},function(json){					
					appUI.showTopTip(json.msg);
					//刷新单条状态
					refreshDetail(matchid);
				})
			}
		})
	}
}