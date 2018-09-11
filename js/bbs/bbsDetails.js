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

mui.previewImage();

var commentType = 0, //0为帖子评论，1为单条评论
	timeout = '',
	index = 0,
	topicid = '', //帖子id
	page = 1, //初始页码
	pageCount = 0, //总页数
	author = '', //作者
	bbsType = 0, //0为全部评论，1为只看作者
	floor = 0, //帖子楼层
	pid = 0;

mui.plusReady(function() {
	storage.init();
	//注册登录事件
	appPage.registerCheckLoginEvent();

	var self = plus.webview.currentWebview();
	topicid = self.info.id;

	getDatails();

	//分享
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

	//弹出键盘
	var showKeyboard = function() {
		if(mui.os.ios) {
			var webView = plus.webview.currentWebview().nativeInstanceObject();
			webView.plusCallMethod({
				"setKeyboardDisplayRequiresUserAction": false
			});
			setTimeout(function() {
				document.getElementById("edit").focus();
			}, 100);
		} else {
			var Context = plus.android.importClass("android.content.Context");
			var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			var main = plus.android.runtimeMainActivity();
			var imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
			imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
			setTimeout(function() {
				document.getElementById("edit").focus();
			}, 100);
		}
	};

	//单条评论
	mui('#bbsDetail').on('tap', '.reply', function() {
		commentType = 1;
		pid = this.dataset.pid;
		document.getElementById("bottomTag").style.display = 'none';
		document.getElementById("commentInput").style.display = 'block';
		var contant = this.dataset.contant;
		//document.getElementById("oneComment").innerHTML=contant;
		//document.getElementById("edit").style.textIndent=contant.replace(/\s+/g, "").length*14-6+'px';
		document.getElementById("edit").placeholder = contant;
		showKeyboard();
	})

	//只看作者
	mui('body').on('tap', '#onlySee', function() {
		if(this.innerHTML == '只看作者回复') {
			bbsType = 1;
			getDatails();
		} else {
			bbsType = 0;
			getDatails();
		}

	})

	//提交评论
	document.getElementById("submit").addEventListener('tap', function() {
		var text = document.getElementById("edit").value;
		if(text == '') {
			mui.toast('评论不可为空!');
			return;
		}
		var placeholder = document.getElementById("edit").placeholder;
		var text_ = placeholder + ':' + text;
		if(placeholder == '写评论') {
			request('/Topic/addTopicComment', {
				topicid: topicid,
				content: text,
				playerid: storageUser.UId,
				pid: 0
			}, function(r) {
				log(r);
				if(r.code == -1) {
					mui.toast(r.msg);
					return;
				}
				document.getElementById("edit").value = '';
				bbsType = 0;
				getDatails();
			})
		} else {
			request('/Topic/addTopicComment', {
				topicid: topicid,
				content: text_,
				playerid: storageUser.UId,
				pid: pid
			}, function(r) {
				log(r);
				if(r.code == -1) {
					mui.toast(r.msg);
					return;
				}
				document.getElementById("edit").value = '';
				bbsType = 0;
				getDatails();
			})
		}
	})

});

//点击评论
document.getElementById("commentBtn").addEventListener('tap', function() {
	commentType = 0;
	document.getElementById("edit").placeholder = '写评论';
	document.getElementById("bottomTag").style.display = 'none';
	document.getElementById("commentInput").style.display = 'block';
	document.getElementById("edit").focus();
})

document.getElementById("edit").addEventListener('focus', function() {
	this.rows = 5;
	document.getElementById("bottomTag").style.display = 'none';
})

document.getElementById("edit").addEventListener('blur', function() {
	this.rows = 1;
	if(this.value == '') {
		commentType = 0;
		//		document.getElementById("oneComment").innerHTML='';
		//		document.getElementById("edit").style.textIndent=0;
		document.getElementById("edit").placeholder = '写评论';
	}
	document.getElementById("bottomTag").style.display = 'block';
	document.getElementById("commentInput").style.display = 'none';
	if(mui.os.android) goToWhere(1);
})

document.getElementById("edit").addEventListener('input', function() {
	if(this.value == '') {
		document.getElementById("submit").setAttribute('class', 'commentBtn');
	} else {
		document.getElementById("submit").setAttribute('class', 'commentBtn active');
	}
})

//获取帖子详情
function getDatails() {
	if(bbsType == 1) {
		request('/Topic/getTopicDetail', {
			topicid: topicid,
			authorid: author,
			pageindex: 1
		}, function(r) {
			log(r);
			floor = 0;
			pageCount = r.countpage;
			author = r.data.topicdetail.uid;
			r.data.topicdetail.content = HTMLDecode(r.data.topicdetail.content);
			//注入楼层
			for(var i = 0; i < r.data.commentlist.length; i++) {
				floor++;
				r.data.commentlist[i].floor = floor;
			}
			r.data.bbsType = bbsType;
			render('#bbsDetail', 'bbsDetailTep1', r.data);
			appPage.imgInit();
			document.getElementById("commentNum").innerHTML = '评论 ' + r.data.commentlist.length;
		}, true)
	} else {
		request('/Topic/getTopicDetail', {
			topicid: topicid,
			pageindex: 1
		}, function(r) {
			log(r);
			floor = 0;
			pageCount = r.countpage;
			author = r.data.topicdetail.uid;
			r.data.topicdetail.content = HTMLDecode(r.data.topicdetail.content);
			//注入楼层
			for(var i = 0; i < r.data.commentlist.length; i++) {
				floor++;
				r.data.commentlist[i].floor = floor;
			}
			r.data.bbsType = bbsType;
			render('#bbsDetail', 'bbsDetailTep1', r.data);
			appPage.imgInit();
			document.getElementById("commentNum").innerHTML = '评论 ' + r.data.commentlist.length;
		}, true)
	}

}

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		bbsType = 0;
		getDatails();
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
			if(bbsType == 1) {
				request('/Topic/getTopicDetail', {
					topicid: topicid,
					pageindex: page + 1,
					authorid: author
				}, function(r) {
					log(r);
					pageCount = r.countpage;
					author = r.data.topicdetail.uid;
					r.data.topicdetail.content = HTMLDecode(r.data.topicdetail.content);
					//注入楼层
					for(var i = 0; i < r.data.commentlist.length; i++) {
						floor++;
						r.data.commentlist[i].floor = floor;
					}
					r.data.bbsType = bbsType;
					render('#bbsDetail', 'bbsDetailTep1', r.data, true);
					appPage.imgInit();
					document.getElementById("commentNum").innerHTML = '评论 ' + r.data.commentlist.length;
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
				}, false, function() {
					appPage.endPullRefresh(true);
				});
			} else {
				request('/Topic/getTopicDetail', {
					topicid: topicid,
					pageindex: page + 1
				}, function(r) {
					log(r);
					pageCount = r.countpage;
					author = r.data.topicdetail.uid;
					r.data.topicdetail.content = HTMLDecode(r.data.topicdetail.content);
					//注入楼层
					for(var i = 0; i < r.data.commentlist.length; i++) {
						floor++;
						r.data.commentlist[i].floor = floor;
					}
					r.data.bbsType = bbsType;
					render('#bbsDetail', 'bbsDetailTep1', r.data, true);
					appPage.imgInit();
					document.getElementById("commentNum").innerHTML = '评论 ' + r.data.commentlist.length;
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
				}, false, function() {
					appPage.endPullRefresh(true);
				});
			}
			page++;
		}, 1500);
	} else {
		//mui.toast("温馨提示：没有更多数据");
		mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
	}

}

function HTMLDecode(text) {
	var temp = document.createElement("div");
	temp.innerHTML = text;
	var output = temp.innerText || temp.textContent;
	temp = null;
	return output;
}

function goToWhere(where) {
	var me = this;
	me.site = [];
	me.sleep = me.sleep ? me.sleep : 16;
	me.fx = me.fx ? me.fx : 6;
	clearInterval(me.interval);
	var dh = document.documentElement.scrollHeight || document.body.scrollHeight;
	var height = !!where ? dh : 0;
	me.interval = setInterval(function() {
		var top = document.documentElement.scrollTop || document.body.scrollTop;
		var speed = (height - top) / me.fx;
		if(speed === me.site[0]) {
			window.scrollTo(0, height);
			clearInterval(me.interval);
		}
		window.scrollBy(0, speed);
		me.site.unshift(speed);
	}, me.sleep);
};