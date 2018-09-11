mui.init();
var storeid = '';
mui.previewImage();

mui('.mui-scroll-wrapper').scroll({
	deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
});

mui.plusReady(function() {
	storage.init();
	var self = plus.webview.currentWebview();
	storeid = self.info.storeid;

	//注册登录事件
	appPage.registerCheckLoginEvent();

	request('/Store/getStoreDetail', {
		storeid: storeid
		//storeid:285
	}, function(r) {
		log(r);
		r.code == 0 ? render('#details', 'detailsTep1', r) : appUI.showTopTip(r.msg);
		appPage.imgInit();
		//分类单选
		mui(".group").on("tap", ".kind", function() {
			var kind = document.getElementsByClassName("kind");
			for(var i = 0; i < kind.length; i++) {
				kind[i].setAttribute('class', 'kind');
			}
			this.setAttribute('class', 'kind active');
		}, true)
	}, true)

	//弹出分享
	document.getElementById("share").addEventListener('tap', function() {
		mui.openWindow({
			url: '../popShare.html',
			id: '../popShare.html',
			styles: {
				background: "transparent"
			},
			extras: {
				info: null //页面传参
			},
			waiting: {
				options: waitingStyle
			},
			show: {
				aniShow: 'slide-in-bottom' //页面显示动画，默认为”slide-in-right“；
			}
		})
	})

	//拨打电话
	mui('body').on("tap", "#phone", function() {
		var phone = this.innerHTML;
		var btnArray = ['取消', '立即拨打'];
		mui.confirm('联系店家', '', btnArray, function(e) {
			if(e.index == 1) {
				plus.device.dial(phone, true);
			} else {

			}
		})
	})

	//评价
	mui('body').on("tap", "#publish", function() {
		if(storageUser.UId != 0) {
			openNew("comment.html", {
				storeid: storeid
			});
		}
	})

	//评论更多
	mui('body').on("tap", "#commentMore", function() {
		openNew("commentList.html", {
			storeid: this.dataset.storeid
		});
	})

	//排行榜更多
	mui('body').on("tap", '#rankingMore', function() {
		openNew("ranking.html", {
			storeid: this.dataset.storeid
		});
	})

})

//自定义监听评论
window.addEventListener('uploadComment', function() {
	request('/Store/getStoreDetail', {
		storeid: storeid
	}, function(r) {
		log(r);
		r.code == 0 ? render('#details', 'detailsTep1', r) : appUI.showTopTip(r.msg);
		appPage.imgInit();
		//分类单选
		mui(".group").on("tap", ".kind", function() {
			var kind = document.getElementsByClassName("kind");
			for(var i = 0; i < kind.length; i++) {
				kind[i].setAttribute('class', 'kind');
			}
			this.setAttribute('class', 'kind active');
		}, true)
	})
})

var pkEvent = {
	goComment: function() {
		openNew("shopDetails.html");
	}
}