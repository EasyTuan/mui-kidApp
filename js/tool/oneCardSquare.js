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

var page = 1; //初始页码
var pageCount = 0; //总页数
var BrandId = "";

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	BrandId = self.info.BrandId;
	getList();
	//搜索
	mui("header").on("tap", ".iconfont", function() {
		openNew("cardSelect.html");
	});

	//打开二级
	mui(".list").on("tap", ".bg", function() {
		openNew("events.html", {
			CardGroupPlazaId: this.dataset.id,
			cardname: this.dataset.cardname
		});
	})

});

function getList() {
	request("/Card/getCardGroupPlazaList", {
		brandid: BrandId,
		pageno: 1
	}, function(r) {
		log(r);
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
			return;
		}
		pageCount = r.pageCount;
		render("#cardList", "cardListTep1", r);
		appPage.imgInit();
	}, true)
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

// 上拉加载具体业务实现
function pullupRefresh() {
	if(pageCount > page) {
		log(mklog() + '上拉加载开始！！');
		setTimeout(function() {
			request('/Card/getCardGroupPlazaList', {
				brandid: BrandId,
				pageno: page + 1
			}, function(r) {
				render("#cardList", "cardListTep1", r, true);
				appPage.imgInit();
				//停止上拉加载，参数为true代表没有更多数据了。
				mui('#pullrefresh').pullRefresh().endPullupToRefresh((page >= pageCount));
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