var pageno = 1;
var pagecount = 1;

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
			auto: true

		}
	},
	beforeback: function() {
		appPage.closeLogin();
	}
});
mui.plusReady(function() {
	storage.init();
	initPage();
	//系统消息详情页
	mui("#mymsg_warp").on("tap", ".msgtype1", function() {
		var nid = this.getAttribute("data-nid");
		if(this.querySelector(".redbadge")) {

			setRead(nid);
		}
		openNew("myMsgDetail.html", {
			id: nid
		});
	})
	//赛事消息详情页
	mui("#mymsg_warp").on("tap", ".msgtype2", function() {
		var nid = this.getAttribute("data-nid");
		if(this.querySelector(".redbadge")) {

			setRead(nid);
		}
		var id = this.getAttribute("data-id");
		openNew("../match/detail.html", {
			id: id
		});
	})
	//约战详情页
	mui("#mymsg_warp").on("tap", ".msgtype3", function() {
		var nid = this.getAttribute("data-nid");
		if(this.querySelector(".redbadge")) {

			setRead(nid);
		}
		var id = this.getAttribute("data-id");
		openNew("../match/detail.html", {
			id: id
		});
	})
	//好友详情页
	mui("#mymsg_warp").on("tap", ".msgtype4", function() {
		var nid = this.getAttribute("data-nid");
		if(this.querySelector(".redbadge")) {

			setRead(nid);
		}
		openNew("myNewFriends.html");
	})

});

function initPage() {
	loadData();
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
	request("/Player/getPlayerNotify", {
		playerid: storageUser.UId,
		cityid: storageLocation.CityId,
		pageindex: pageno
	}, function(json) {
		var nomore = true;
		if(json.code == 0) {
			pagecount = json.pagecount; //总页码			
			nomore = pageno >= json.pagecount;
			var obj, typeclassname;
			if(json.data && json.data.length > 0) {
				for(var i = 0; i < json.data.length; i++) {
					obj = json.data[i];
					typeclassname = "";
					if(obj.MessageType == 1) { //系统
						typeclassname = "computer bg-lan1";
					} else if(obj.MessageType == 2) { //赛事
						typeclassname = "schedule bg-fen";
					} else if(obj.MessageType == 3) { //约战
						typeclassname = "game bg-huang";
					} else if(obj.MessageType == 4) { //好友				
						typeclassname = "friends bg-lv";
					}
					obj.typeclassname = typeclassname;
				}
			}
			log(JSON.stringify(json.data))
			render("#mymsg_warp", "mymsg_view", json, isappend);
			appPage.imgInit();
		} else {
			appUI.showTopTip(json.msg);
			//mui.toast(json.msg);
		}
		appPage.endPullRefresh(nomore);
	}, true, function() {
		appPage.endPullRefresh(true);
	});
}

function setRead(id) {
	request("/Player/addPlayerReadNotify", {
		playerid: storageUser.UId,
		notifyid: id
	}, function(json) {
		if(json.code == 0) {
			loadData();
		}
	});
}