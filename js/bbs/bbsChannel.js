mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: { //下拉刷新
			callback: pulldownRefresh,
			style: mui.os.android ? "circle" : "default"
		}
	},
	beforeback: function() {
		appPage.closeLogin();
	}
});

mui.plusReady(function() {
	storage.init();
	//注册登录事件
	appPage.registerCheckLoginEvent();

	//打开频道详情
	mui(".mui-table-view").on("tap", "a", function() {
		openNew("channelDetails.html", {
			nodeid: this.dataset.nodeid
		});
	})

	//添加订阅
	mui('#fav_list').on('tap', '.channelBtn', function() {
		if(storageUser.UId == 0) return;
		request('/Subscribes/addNodeSubscribes', {
			nodeid: this.dataset.nodeid,
			playerid: storageUser.UId
		}, function(r) {
			log(r);
		})
	})

	getList();

	//登录后刷新页面
	window.addEventListener('refreshPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "刷新页面");
		storageUser = kidstorageuser.getInstance();
		getList();
	});

})

//获取数据
function getList() {
	storageUser = kidstorageuser.getInstance();
	//	request('/Node/getNodeList',{
	//		playerid: storageUser.UId
	//	},function(r){
	//		log(r);
	//		if(r.data.fav_list.length>0){
	//			document.getElementById("subscribed").style.display='block';
	//		}else{
	//			document.getElementById("subscribed").style.display='none';
	//		}
	//		if(r.data.nofav_list.length>0){
	//			document.getElementById("recommend").style.display='block';
	//		}else{
	//			document.getElementById("recommend").style.display='none';
	//		}
	//		render('#fav_list','fav_listTep1',r.data);
	//		render('#nofav_list','nofav_listTep1',r.data);
	//		appPage.imgInit();
	//	})
}

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		getList();
		//下拉刷新结束
		mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
		//重置上拉加载
		mui('#pullrefresh').pullRefresh().refresh(true);
		//重置页码
		page = 1;
	}, 1500)
}

var pkEvent = {
	subscribe: function(nodeid) {
		storage.init();
		request('/Subscribes/addNodeSubscribes', {
			nodeid: nodeid,
			playerid: storageUser.UId
		}, function(r) {
			if(r.code == -1) {
				mui.toast(r.msg);
				return;
			}
			mui.fire(plus.webview.getWebviewById('bbs/bbsIndex.html'), 'refreshPage');
			getList();
			mui.toast(r.msg);
		})
	}
}

//自定义监听刷新
window.addEventListener('uploadList', function() {
	getList();
})