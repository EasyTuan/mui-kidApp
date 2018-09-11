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

var page = 1; //初始页码
var pageCount = 0; //总页数
var type = 0 //1为收藏;0为我的
var BrandId = "";
var keyword = '';

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	BrandId = plus.storage.getItem('BrandId');

	storage.init();

	getCreateTag();
	getList();

	//创建
	document.getElementById("create").addEventListener("tap", function() {
		openNew("oneCardMeCreate.html", {
			BrandId: BrandId
		});
	});

	//套牌切换
	mui("nav").on("tap", "span", function() {
		if(this.dataset.type == type) {
			return;
		}
		if(this.dataset.type == 0) {
			type = 0;
			document.getElementById("wode").setAttribute("class", "");
			document.getElementById("chuangjian").setAttribute("class", "active");
			keyword = '';
			getCreateTag();
			getList();
		} else {
			type = 1;
			document.getElementById("wode").setAttribute("class", "active");
			document.getElementById("chuangjian").setAttribute("class", "");
			keyword = '';
			getCollectTag();
			getList();
		}
	});

	//标签选择
	mui(".kind").on("tap", "span", function() {
		if(this.getAttribute('class') == 'active') {
			return;
		}
		var span = document.getElementsByClassName("kind")[0].getElementsByTagName("span");
		for(var i = 0; i < span.length; i++) {
			span[i].setAttribute("class", "");
		}
		this.setAttribute("class", "active");
		if(this.dataset.tag != '全部') {
			keyword = this.dataset.tag;
		} else {
			keyword = '';
		}
		getList();
	});

	//自定义监听
	window.addEventListener("updata", function() {
		document.getElementById("wode").setAttribute("class", "");
		document.getElementById("chuangjian").setAttribute("class", "active");
		getList();
		type = 0;
	})

	//打开二级
	mui("#cardList").on("tap", "li", function() {
		//1为收藏;0为我的
		type == 1 ? openNew("cardDetails.html", {
			CardGroupId: this.dataset.id
		}) : openNew("cardDetails.html", {
			CardGroupId: this.dataset.id,
			BrandId: BrandId
		});
	})

});

//获取标签
function getCreateTag() {
	request("/Player/getCardGroupHotTagListByPlayerId", {
		brandid: BrandId,
		playerid: storageUser.UId,
		topn: 4
	}, function(r) {
		log(r);
		var alltag = {
			"Tag": "全部"
		};
		if(r.code == 0) {
			r.data.unshift(alltag);
			render('#tag', 'tagTep1', r);
		} else {
			r.data = [];
			r.data[0] = alltag;
			render('#tag', 'tagTep1', r);
		}
		document.getElementById("tag").childNodes[1].setAttribute('class', 'active');
	})
}

function getCollectTag() {
	request("/Player/getPlayerFavoriteGroupTagList", {
		playerid: storageUser.UId,
		topn: 4
	}, function(r) {
		log(r);
		var alltag = {
			"Tag": "全部"
		};
		if(r.code == 0) {
			r.data.unshift(alltag);
			render('#tag', 'tagTep1', r);
		} else {
			r.data = [];
			r.data[0] = alltag;
			render('#tag', 'tagTep1', r);
		}
		document.getElementById("tag").childNodes[1].setAttribute('class', 'active');
	})
}

//拉取列表
function getList() {
	if(type == 0) {
		request("/Card/getCardGroupListByPlayerId", {
			playerid: storageUser.UId,
			keyword: keyword,
			pageno: 1,
			brandid: BrandId
		}, function(r) {
			log(r);
			//没有数据
			if(r.code == -1) {
				//appUI.showTopTip(r.msg);
				mui.toast(r.msg);
				render("#cardList", "cardListTep1", {
					data: []
				});
				document.getElementsByClassName("none")[0].style.display = "block";
				document.getElementById("cardnum").innerHTML = 0;
				return;
			}
			pageCount = r.pagecount;
			document.getElementsByClassName("none")[0].style.display = "none";
			document.getElementById("cardnum").innerHTML = r.rowcount;
			render("#cardList", "cardListTep1", r);
			appPage.imgInit();
		}, true)
	} else {
		request("/Card/getPlayerFavoriteCardGroupListByPlayerId", {
			playerid: storageUser.UId,
			keyword: keyword,
			pageno: 1,
			brandid: BrandId
		}, function(r) {
			log(r);
			//没有数据
			if(r.code == -1) {
				//appUI.showTopTip(r.msg);
				mui.toast(r.msg);
				render("#cardList", "cardListTep1", {
					data: []
				});
				document.getElementsByClassName("none")[0].style.display = "block";
				document.getElementById("cardnum").innerHTML = 0;
				return;
			}
			pageCount = r.pagecount;
			document.getElementsByClassName("none")[0].style.display = "none";
			document.getElementById("cardnum").innerHTML = r.data.length;
			render("#cardList", "cardListTep1", r);
			appPage.imgInit();
		}, true)
	}
}

//左划删除
(function($) {
	$('.mui-table-view').on('tap', '.mui-btn', function(event) {
		var elem = this;
		var cardgroupid = this.dataset.id;
		var li = elem.parentNode.parentNode;
		if(type == 0) {
			mui.confirm('确认删除该套牌？', '', btnArray, function(e) {
				if(e.index == 0) {
					setTimeout(function() {
						$.swipeoutClose(li);
					}, 0);
				} else {
					request("/Card/deleteCardGroupByPlayerId", {
						playerid: storageUser.UId,
						cardgroupid: cardgroupid
					}, function(r) {
						log(r);
						if(r.code == -1) {
							//appUI.showTopTip(r.msg);
							mui.toast(r.msg);
							return;
						}
						li.parentNode.removeChild(li);
						getList();
					})
				}
			});
		} else {
			mui.confirm('确认取消收藏该套牌？', 'Kid', btnArray, function(e) {
				if(e.index == 0) {
					setTimeout(function() {
						$.swipeoutClose(li);
					}, 0);
				} else {
					request("/Player/OpPlayerFavoriteCardGroup", {
						playerid: storageUser.UId,
						objectid: cardgroupid,
						op: 2
					}, function(r) {
						log(r);
						if(r.code == -1) {
							//appUI.showTopTip(r.msg);
							mui.toast(r.msg);
							return;
						}
						li.parentNode.removeChild(li);
						getList();
					})
				}
			});
		}

	});
	var btnArray = ['取消', '确认'];
})(mui);

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		//下拉刷新结束
		getList();
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
			if(type == 0) {
				request("/Card/getCardGroupListByPlayerId", {
					playerid: storageUser.UId,
					keyword: keyword,
					pageno: 1,
					brandid: BrandId
				}, function(r) {
					log(r);
					pageCount = r.pagecount;
					document.getElementById("cardnum").innerHTML = r.rowcount;
					render("#cardList", "cardListTep1", r, true);
					appPage.imgInit();
					mui('#pullrefresh').pullRefresh().endPullupToRefresh((page >= pageCount));
				}, false, function() {
					appPage.endPullRefresh(true);
				})
			} else {
				request("/Card/getPlayerFavoriteCardGroupListByPlayerId", {
					playerid: storageUser.UId,
					keyword: keyword,
					pageno: 1
				}, function(r) {
					log(r);
					pageCount = r.pagecount;
					document.getElementById("cardnum").innerHTML = r.recordcount;
					render("#cardList", "cardListTep1", r, true);
					appPage.imgInit();
					mui('#pullrefresh').pullRefresh().endPullupToRefresh((page >= pageCount));
				}, false, function() {
					appPage.endPullRefresh(true);
				})
			}
			page++;
			log(mklog() + '上拉加载结束！！')
		}, 1500);
	} else {
		//mui.toast("温馨提示：没有更多数据");
		mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
	}

}