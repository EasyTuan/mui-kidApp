mui.init({
	beforeback: function() {
		var backpage = plus.webview.getWebviewById("my/myFriends.html");
		if(backpage) {
			mui.fire(backpage, 'initPage')
		}
		appPage.closeLogin();
	}
});
mui.plusReady(function() {
	storage.init();
	initPage();

	document.getElementById("myMobileBook").addEventListener("tap", function() {
		mui.toast("宝宝，这个暂未开通呢，敬请期待:-D...");
	});

	document.getElementById("addFriend").addEventListener("tap", function() {
		openNew("addFriend.html");
	});
	//搜索
	document.getElementById("inpt_search").addEventListener("tap", function() {
		mui.openWindow({
			url: "myFriendsSearch.html",
			id: "myFriendsSearch.html",
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
	mui("#list_warp").on("tap", ".userinfo", function() {
		var id = this.getAttribute("data-id");
		openNew("userInfo.html", {
			id: id
		});
	});
	mui("#list_warp").on("tap", ".agree", function() {
		var id = this.getAttribute("data-id");
		agreeAdd(id);
	});
});

function agreeAdd(fid) {
	request("/Player/acceptPlayerFriendApply", {
		playerid: storageUser.UId,
		friendid: fid
	}, function(json) {
		log(JSON.stringify(json))
		if(json.code == 0) {
			mui.toast(json.msg);
			initPage();
		} else {
			mui.toast(json.msg);
		}
	});
}

function initPage() {
	request("/Player/getPlayerFriendList", {
		step: 2,
		playerid: storageUser.UId
	}, function(json) {
		log(JSON.stringify(json))
		if(json.code == 0) {
			render("#bar_warp", "bar_view", json);
			render("#list_warp", "list_view", json);
			appPage.imgInit();
			initIndexList();
		} else {
			mui.toast(json.msg);
		}
	}, true);
}

function initIndexList() {
	var header = document.querySelector('header.mui-bar');
	//var movebox = document.getElementById('movebox');
	var list = document.getElementById('list');
	//	var search = document.getElementById('search');
	//	var bar = document.getElementById('barwarp');
	//	var baralert = document.getElementById('baralert');

	//calc hieght
	var h = (document.body.offsetHeight - header.offsetHeight);
	log(h);
	list.style.height = h + 'px';

	//create
	//window.indexedList = new mui.IndexedList(list, search, bar, baralert, movebox);
	window.indexedList = new mui.IndexedList(list);
}