var friendid, mark;
mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: { //下拉刷新
			callback: pulldownRefresh,
			style: mui.os.android ? "circle" : "default"
			//auto: true
		}
	},
	beforeback: function() {
		var xx = plus.webview.getWebviewById('index/richScan.html');
		if(xx)
			plus.webview.close(xx);
	}
});
//下拉刷新具体业务实现
function pulldownRefresh() {
	loadData();
}

var friendNickName = '';

mui.plusReady(function() {
	storage.init();
	friendid = appPage.getParam("id");
	loadData();
	//更多赛事
	document.getElementById("more").addEventListener("tap", function() {
		openNew("myFriendsMatch.html", {
			id: friendid
		});
	})

	//战帖详情
	mui(".mui-scroll").on("tap", ".detail", function() {
		openNew("../match/detail.html", {
			id: this.dataset.id,
			getMatchDetail: 'getMatchDetail' //说明从战帖列表页来的
		});
	})

	window.addEventListener('initPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "不是新开的");
		loadData();
	});
	window.addEventListener('refreshPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "刷新页面");
		loadData();
	});

	var old_back = mui.back;
	mui.back = function() {
		mui.fire(plus.webview.getWebviewById('my/myFriends.html'), 'refreshPage');
		old_back();
	}
})

function loadData() {
	request("/Player/getPlayerFriendDetail", {
		playerid: storageUser.UId,
		friendid: friendid
	}, function(json) {
		if(json.code == 0) {
			var json1 = {},
				json2 = {};
			friendNickName = json.data.uinfodata.NickName;
			json1.data = json.data.uinfodata;
			json1.ShowName = json.showname;
			mark = json1.data.MarkName;
			log(JSON.stringify(json1));
			render("#info_warp", "info_view", json1);
			mui.previewImage();

			if(json1.data.IsMutual == 1) { //互为好友
				document.getElementById("onewar").removeAttribute("style");
				document.getElementById("setmark").removeAttribute("style");
				document.getElementById("addFriend").setAttribute("style", "display: none;");
				//约战
				document.getElementById("onewar").addEventListener("tap", function() {
					openNew("../pk/war.html", {
						friendid: friendid,
						imgurl: json1.data.ImgUrl,
						friendNickName: friendNickName
					});
				})
				//设置备注
				document.getElementById("setmark").addEventListener("tap", function() {
					openNew("myEdit.html", {
						field: "setmark",
						value: '\"friendid\":' + friendid + ',\"mark\":\"' + mark + '\"',
						backid: "my/userInfo.html"
					});
				})
			} else {
				document.getElementById("onewar").setAttribute("style", "display: none;");
				document.getElementById("setmark").setAttribute("style", "display: none;");
				document.getElementById("addFriend").removeAttribute("style");
				//添加好友
				document.getElementById("addFriend").addEventListener("tap", function() {
					openNew("addMyFriend.html", {
						id: friendid
					});
				})
			}
			if(storageUser.UId == friendid) {
				document.getElementById("onewar").setAttribute("style", "display: none;");
				document.getElementById("setmark").setAttribute("style", "display: none;");
				document.getElementById("addFriend").setAttribute("style", "display: none;");
			}
			json2.data = json.data.matchdata;
			render("#match_warp", "match_view", json2);
		} else {
			mui.toast(json.msg);
		}
		appPage.imgInit();
		appPage.endPullRefresh();
	}, false, function() {
		appPage.endPullRefresh();
	});
}