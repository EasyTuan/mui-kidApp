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
			callback: pullupRefresh
		}
	}
})

var page = 1; //初始页码
var pageCount = 0; //总页数
var storeid;
mui.previewImage();

mui.plusReady(function() {
	storage.init();
	var self = plus.webview.currentWebview();
	storeid = self.info.storeid;

	//注册登录事件
	appPage.registerCheckLoginEvent();

	//获取评论列表
	request('/Store/getStoreCommentList', {
		storeid: storeid,
		pageindex: 1
	}, function(r) {
		log(r);
		r.code == 0 ? render('#commentList', 'commentListTep1', r) : appUI.showTopTip(r.msg);
		pageCount = r.pagecount;
		appPage.imgInit();
	}, true);

	//分类单选
	mui(".group").on("tap", ".kind", function() {
		var kind = document.getElementsByClassName("kind");
		for(var i = 0; i < kind.length; i++) {
			kind[i].setAttribute('class', 'kind');
		}
		this.setAttribute('class', 'kind active');
	})

	//评价
	document.getElementById("publish").addEventListener("tap", function() {
		if(storageUser.UId != 0) {
			openNew("comment.html", {
				storeid: storeid
			});
		}
	})

})

//自定义监听评论
window.addEventListener('uploadComment', function() {
	request('/Store/getStoreCommentList', {
		storeid: storeid,
		pageindex: 1
	}, function(r) {
		log(r);
		r.code == 0 ? render('#commentList', 'commentListTep1', r) : appUI.showTopTip(r.msg);
		appPage.imgInit();
	}, true);
})

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		request('/Store/getStoreCommentList', {
			storeid: storeid,
			pageindex: 1
		}, function(r) {
			log(r);
			r.code == 0 ? render('#commentList', 'commentListTep1', r) : appUI.showTopTip(r.msg);
			pageCount = r.pagecount;
			appPage.imgInit();
			//下拉刷新结束
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
			//重置上拉加载
			mui('#pullrefresh').pullRefresh().refresh(true);
		}, true);
		//下拉刷新结束
		mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
		//重置上拉加载
		mui('#pullrefresh').pullRefresh().refresh(true);
		//重置页码
		page = 1;
	}, 1500)
}

// 上拉加载具体业务实现
function pullupRefresh() {
	if(pageCount > page) {
		setTimeout(function() {
			request('/Store/getStoreCommentList', {
				storeid: storeid,
				pageindex: 1
			}, function(r) {
				log(r);
				r.code == 0 ? render('#commentList', 'commentListTep1', r) : appUI.showTopTip(r.msg);
				pageCount = r.pagecount;
				appPage.imgInit();
				mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
			}, false, function() {
				appPage.endPullRefresh(true);
			});
			page++;
			log(mklog() + '上拉加载结束！！')
		}, 1500);
	} else {
		//mui.toast("温馨提示：没有更多数据");
		mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
	}

}

var pkEvent = {
	goComment: function() {
		openNew("commentList.html");
	}
}