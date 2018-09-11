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
	},
	beforeback: function() {
		appPage.closeLogin();
	}
})
var subscibeType = 0, //0表示没有订阅，1表示订阅
	page = 1, //初始页码
	pageCount = 0, //总页数
	nodeid = ''; //频道id

mui.plusReady(function() {
	storage.init();
	//注册登录事件
	appPage.registerCheckLoginEvent();

	var self = plus.webview.currentWebview();
	nodeid = self.info.nodeid || plus.storage.getItem('nodeid');

	getDetails();

	//搜索
	document.getElementById("search").addEventListener('tap', function() {
		openNew('bbsSearch.html');
	})

	//发帖前记录nodeid
	document.getElementById("newBbs").addEventListener('tap', function() {
		plus.storage.setItem('nodeid', nodeid);
	})

	//帖子详情
	mui('body').on('tap', '.bbsDetails', function() {
		var id = this.dataset.id;
		openNew('bbsDetails.html', {
			id: id
		});
		setTimeout(function() {
			request('/Topic/addTopicViews', {
				topicid: id
			}, function() {
				log('帖子阅读数+1');
			})
		}, 200);
	})
})

//展开收起
spread();

function spread() {
	document.getElementById("channelBtn").addEventListener('tap', function() {
		if(this.innerHTML == '展开') {
			document.getElementById("bbsHotList").style.display = 'block';
			this.innerHTML = '收起';
		} else {
			document.getElementById("bbsHotList").style.display = 'none';
			this.innerHTML = '展开';
		}
	})
}

//订阅
//mui('#channelHead').on('tap','#subscibe',function(){
//	if(subscibe==0){
//		this.setAttribute('class','channelBtn ckecklogin channelBtn_subscibe');
//		this.innerHTML='取消订阅';
//		subscibe=1;
//	}else{
//		this.setAttribute('class','channelBtn ckecklogin');
//		this.innerHTML='订阅';
//		subscibe=0;
//	}
//})

//标签
var sign = '';

mui('#channelHead').on('tap', 'span', function() {
	if(this.getAttribute('class') == 'active') return;
	mui('#pullrefresh').pullRefresh().refresh(true);
	getDetails(this.innerHTML);
	sign = this.innerHTML;
	mui('.tagList span').each(function() {
		this.setAttribute('class', '')
	})
	this.setAttribute('class', 'active');
})

//获取详情
function getDetails(keywords) {
	if(keywords) {
		request('/Node/getNodeDetail', {
			nodeid: nodeid,
			playerid: storageUser.UId,
			pageindex: 1,
			keywords: keywords
		}, function(r) {
			log(r);
			pageCount = r.countpage;
			document.getElementById("channelTitle").innerHTML = r.data.category.cname;
			r.data.category.is_fav == 'N' ? subscibeType = 0 : subscibeType = 1;
			if(r.data.top_list.length == 0) {
				document.getElementById("bbsHotListTitle").style.display = 'none';
				document.getElementById("bbsHotList").style.display = 'none';
			} else {
				document.getElementById("bbsHotListTitle").style.display = 'flex';
				document.getElementById("bbsHotList").style.display = 'block';
			}
			if(r.data.topic_list.length == 0) {
				document.getElementById("bbsListTitle").style.display = 'none';
				document.getElementById("bbsList").style.display = 'none';
			} else {
				document.getElementById("bbsListTitle").style.display = 'flex';
				document.getElementById("bbsList").style.display = 'block';
			}
			render('#channelHead', 'channelHeadTep1', r.data);
			render('#bbsHotList', 'bbsHotListTep1', r.data);
			render('#bbsList', 'bbsListTep1', r.data);
			appPage.imgInit();
			mui('.tagList span').each(function() {
				if(this.innerHTML == keywords)
					this.setAttribute('class', 'active');
			})
		}, true)
	} else {
		request('/Node/getNodeDetail', {
			nodeid: nodeid,
			playerid: storageUser.UId,
			pageindex: 1,
		}, function(r) {
			log(r);
			pageCount = r.countpage;
			document.getElementById("channelTitle").innerHTML = r.data.category.cname;
			r.data.category.is_fav == 'N' ? subscibeType = 0 : subscibeType = 1;
			if(r.data.top_list.length == 0) {
				document.getElementById("bbsHotListTitle").style.display = 'none';
				document.getElementById("bbsHotList").style.display = 'none';
			} else {
				document.getElementById("bbsHotListTitle").style.display = 'flex';
				document.getElementById("bbsHotList").style.display = 'block';
			}
			if(r.data.topic_list.length == 0) {
				document.getElementById("bbsListTitle").style.display = 'none';
				document.getElementById("bbsList").style.display = 'none';
			} else {
				document.getElementById("bbsListTitle").style.display = 'flex';
				document.getElementById("bbsList").style.display = 'block';
			}
			render('#channelHead', 'channelHeadTep1', r.data);
			render('#bbsHotList', 'bbsHotListTep1', r.data);
			render('#bbsList', 'bbsListTep1', r.data);
			appPage.imgInit();
		}, true)
	}

}

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		getDetails();
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
		log(mklog() + '上拉加载开始！！');
		setTimeout(function() {
			if(sign != '') {
				request('/Node/getNodeDetail', {
					nodeid: nodeid,
					playerid: storageUser.UId,
					pageindex: page + 1,
					keywords: sign
				}, function(r) {
					log(r);
					pageCount = r.countpage;
					render('#channelHead', 'channelHeadTep1', r.data);
					render('#bbsHotList', 'bbsHotListTep1', r.data, true);
					render('#bbsList', 'bbsListTep1', r.data, true);
					appPage.imgInit();
					mui('.tagList span').each(function() {
						if(this.innerHTML == keywords)
							this.setAttribute('class', 'active');
					})
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
				}, false, function() {
					appPage.endPullRefresh(true);
				});
			} else {
				request('/Node/getNodeDetail', {
					nodeid: nodeid,
					playerid: storageUser.UId,
					pageindex: page + 1
				}, function(r) {
					log(r);
					pageCount = r.countpage;
					render('#channelHead', 'channelHeadTep1', r.data);
					render('#bbsHotList', 'bbsHotListTep1', r.data, true);
					render('#bbsList', 'bbsListTep1', r.data, true);
					appPage.imgInit();
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
				}, false, function() {
					appPage.endPullRefresh(true);
				});
			}
			page++;
			log(mklog() + '上拉加载结束！！')
		}, 1500);
	} else {
		//mui.toast("温馨提示：没有更多数据");
		mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
	}

}

var pkEvent = {
	gonewBbs: function() {
		openNew("newBbs.html");
	},
	subscibe: function(nodeid) {
		storage.init();
		if(subscibeType == 0) {
			request('/Subscribes/addNodeSubscribes', {
				nodeid: nodeid,
				playerid: storageUser.UId
			}, function(r) {
				if(r.code == -1) {
					mui.toast(r.msg);
					return;
				}
				document.getElementById("subscibe").setAttribute('class', 'channelBtn ckecklogin channelBtn_subscibe');
				document.getElementById("subscibe").innerHTML = '取消订阅';
				subscibeType = 1;
				mui.fire(plus.webview.getWebviewById('bbs/bbsChannel.html'), 'refreshPage');
				mui.fire(plus.webview.getWebviewById('bbs/bbsIndex.html'), 'refreshPage');
				mui.toast(r.msg);
			})
		} else {
			request('/Subscribes/delNodeSubscribes', {
				nodeid: nodeid,
				playerid: storageUser.UId
			}, function(r) {
				if(r.code == -1) {
					mui.toast(r.msg);
					return;
				}
				document.getElementById("subscibe").setAttribute('class', 'channelBtn ckecklogin');
				document.getElementById("subscibe").innerHTML = '订阅';
				subscibeType = 0;
				mui.fire(plus.webview.getWebviewById('bbs/bbsChannel.html'), 'refreshPage');
				mui.fire(plus.webview.getWebviewById('bbs/bbsIndex.html'), 'refreshPage');
				mui.toast(r.msg);
			})
		}
	}
}

//自定义监听刷新
window.addEventListener('uploadList', function() {
	getDetails();
})

window.addEventListener('refreshPage', function() {
	storage.init();
	getDetails();
})