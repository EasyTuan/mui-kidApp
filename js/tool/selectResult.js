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

var cardPage = 0; //卡牌当前页面&&总数
var cardList = []; //存储所有cardId
var page = 1; //初始页码
var pageCount = 0; //总页数
var rs = "";
var BrandId = "";
var cardname = '';

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	BrandId = self.info.BrandId;
	rs = self.info.rs;
	cardname = self.info.cardname;

	request("/Card/getCardListByCondition", {
		condition: rs,
		brandid: BrandId,
		cardname: cardname,
		pageno: 1
	}, function(r) {
		log(r);
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
			document.getElementsByClassName("none")[0].style.display = "block";
			return;
		}
		pageCount = r.pagecount;
		//注入序列号
		for(var i = 0; i < r.data.length; i++) {
			r.data[i].page = i + 1;
			cardList[i] = r.data[i].CardId;
			cardPage = i + 1;
		}
		render("#resultList", "resultListTep1", r);
		appPage.imgInit();
	}, true)

	//打开二级
	mui(".mui-table-view").on("tap", "li", function() {
		openNew("oneCardDetail.html", {
			CardId: this.dataset.cardid, //当前卡牌id
			pageIndex: this.dataset.page, //当前卡牌页码
			page: cardPage, //总页面
			cardList: cardList //页面对应id，数组形式
		});
	})

})

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		request("/Card/getCardListByCondition", {
			condition: rs,
			brandid: BrandId,
			cardname: cardname,
			pageno: 1
		}, function(r) {
			log(r);
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				document.getElementsByClassName("none")[0].style.display = "block";
				return;
			}
			pageCount = r.pagecount;
			//注入序列号
			for(var i = 0; i < r.data.length; i++) {
				r.data[i].page = i + 1;
				cardList[i] = r.data[i].CardId;
				cardPage = i + 1;
			}
			render("#resultList", "resultListTep1", r);
			appPage.imgInit();
			//下拉刷新结束
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
			//重置上拉加载
			mui('#pullrefresh').pullRefresh().refresh(true);
			//重置页码
			page = 1;
		}, true)
	}, 1500)
}

// 上拉加载具体业务实现
function pullupRefresh() {
	if(pageCount > page) {
		log(mklog() + '上拉加载开始！！');
		setTimeout(function() {
			request("/Card/getCardListByCondition", {
				condition: rs,
				brandid: BrandId,
				cardname: cardname,
				pageno: page + 1
			}, function(r) {
				if(r.code == -1) {
					appUI.showTopTip(r.msg);
					return;
				}
				//注入序列号
				for(var i = 0; i < r.data.length; i++) {
					r.data[i].page = cardPage + 1;
					cardList[cardPage] = r.data[i].CardId;
					cardPage = cardPage + 1;
				}
				render("#resultList", "resultListTep1", r, true);
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