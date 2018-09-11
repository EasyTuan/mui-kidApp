mui.init({
	beforeback: function() {
		appPage.closeLogin();
	}
});
mui.plusReady(function() {
	storage.init();
	initPage();
	document.getElementById("myNewFriend").addEventListener("tap", function() {
		openNew("myNewFriends.html");
	});

	document.getElementById("addFriend").addEventListener("tap", function() {
		openNew("addFriend.html");
	});

	mui("#list_warp").on("tap", ".userinfo", function() {
		var id = this.getAttribute("data-id");
		openNew("userInfo.html", {
			id: id
		});
	});

	window.addEventListener('initPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "不是新开的");
		initPage();
	});
	window.addEventListener('refreshPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "刷新页面");
		initPage();
	});

	//appPage.closeLogin();
});

function initPage() {
	request("/Player/getPlayerFriendList", {
		step: 1,
		playerid: storageUser.UId
	}, function(json) {
		log(JSON.stringify(json))
		if(json.code == 0) {
			render("#bar_warp", "bar_view", json);
			render("#list_warp", "list_view", json);
			appPage.imgInit();
			initIndexList();
		} else {
			appUI.showTopTip(json.msg);
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