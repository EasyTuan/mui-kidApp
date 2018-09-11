mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: {
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
var CardId = "";
var page = 1; //初始页码
var pageCount = 0; //总页数
mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	CardId = self.info.CardId; //卡牌id

	request("/Card/getCardGroupListByCardId", {
		cardid: CardId,
		pageno: 1
	}, function(r) {
		log(r);
		//没有数据
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
			document.getElementsByClassName("none")[0].style.display = "block";
			return;
		}
		pageCount = r.pagecount;
		render("#cardList", "cardListTep1", r);
		appPage.imgInit();
	}, true)

	//打开二级
	mui(".mui-table-view").on("tap", "li", function() {
		var xx = plus.webview.getWebviewById("tool/cardDetails.html");
		var CardGroupId = this.dataset.id;
		if(xx) {
			//plus.webview.close(xx);
			mui.fire(xx, 'uploadDetails', {
				CardGroupId: CardGroupId
			});
		}
		openNew("cardDetails.html", {
			CardGroupId: CardGroupId
		});

	})
})

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		request("/Card/getCardGroupListByCardId", {
			cardid: CardId,
			pageno: 1
		}, function(r) {
			log(r);
			//没有数据
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				document.getElementsByClassName("none")[0].style.display = "block";
				return;
			}
			pageCount = r.pagecount;
			render("#cardList", "cardListTep1", r);
			appPage.imgInit();
			//下拉刷新结束
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
			//重置上拉加载
			mui('#pullrefresh').pullRefresh().refresh(true);
			//重置页码
			page = 1;
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
		log(mklog() + '上拉加载开始！！');
		setTimeout(function() {
			request('/Card/getCardGroupListByCardId', {
				cardid: CardId,
				pageno: page + 1
			}, function(r) {
				render("#cardList", "cardListTep1", r, true);
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

//自定义监听刷新
window.addEventListener('uploadDetails', function(event) {
	request("/Card/getCardGroupListByCardId", {
		cardid: event.detail.CardId
	}, function(r) {
		log(r);
		//没有数据
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
			document.getElementsByClassName("none")[0].style.display = "block";
			return;
		}
		pageCount = r.pagecount;
		render("#cardList", "cardListTep1", r);
		appPage.imgInit();
	})
})