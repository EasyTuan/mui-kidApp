mui.init();
mui.plusReady(function() {
	document.getElementById("scan").addEventListener("tap", function() {
		mui.toast("宝宝，这个暂未开通呢，敬请期待:-D...");
	})
	document.getElementById("mobilebook").addEventListener("tap", function() {
		mui.toast("宝宝，这个暂未开通呢，敬请期待:-D...");
	})
	//搜索
	document.getElementById("search").addEventListener("tap", function() {
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

})