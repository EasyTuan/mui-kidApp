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
var CardGroupPlazaId = '';
var cardname = '';
var keyword = '';
var tagid = '';

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	CardGroupPlazaId = self.info.CardGroupPlazaId;
	cardname = self.info.cardname;
	keyword = self.info.keyword;
	tagid = self.info.tagid;
	//document.getElementById("cardName").innerHTML=cardname;
	if(CardGroupPlazaId == "") {
		//CardGroupPlazaId为空说明从cardSelect搜索页来的
		request("/Card/getCardGroupListByCondition", {
			keyword: keyword,
			tagid: tagid
		}, function(r) {
			log(r);
			//没有数据
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				document.getElementsByClassName("none")[0].style.display = "block";
				return;
			}
			render("#events", "eventsTep1", r);
			appPage.imgInit();
			pageCount = r.pagecount;
		}, true)
	} else {
		request("/Card/getCardGroupListByCardGroupPlazaId", {
			cardgroupplazaid: CardGroupPlazaId
		}, function(r) {
			log(r);
			//没有数据
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				document.getElementsByClassName("none")[0].style.display = "block";
				return;
			}
			render("#events", "eventsTep1", r);
			appPage.imgInit();
			pageCount = r.pagecount;
		}, true)
	}

	//打开二级
	mui("#events").on("tap", "li", function() {
		openNew("cardDetails.html", {
			CardGroupId: this.dataset.id
		});
	})
})

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		if(CardGroupPlazaId == "") {
			request("/Card/getCardGroupListByCondition", {
				keyword: keyword,
				tagid: tagid
			}, function(r) {
				log(r);
				//没有数据
				if(r.code == -1) {
					appUI.showTopTip(r.msg);
					document.getElementsByClassName("none")[0].style.display = "block";
					return;
				}
				render("#events", "eventsTep1", r);
				appPage.imgInit();
				pageCount = r.pagecount;
				//下拉刷新结束
				mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
				//重置上拉加载
				mui('#pullrefresh').pullRefresh().refresh(true);
				//重置页码
				page = 1;
			}, true)
		} else {
			request("/Card/getCardGroupListByCardGroupPlazaId", {
				cardgroupplazaid: CardGroupPlazaId
			}, function(r) {
				log(r);
				//没有数据
				if(r.code == -1) {
					appUI.showTopTip(r.msg);
					document.getElementsByClassName("none")[0].style.display = "block";
					return;
				}
				render("#events", "eventsTep1", r);
				appPage.imgInit();
				pageCount = r.pagecount;
				//下拉刷新结束
				mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
				//重置上拉加载
				mui('#pullrefresh').pullRefresh().refresh(true);
				//重置页码
				page = 1;
			}, true)
		}
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
			if(CardGroupPlazaId == "") {
				request("/Card/getCardGroupListByCondition", {
					keyword: keyword,
					tagid: tagid,
					pageno: page + 1
				}, function(r) {
					log(r);
					//没有数据
					if(r.code == -1) {
						appUI.showTopTip(r.msg);
						document.getElementsByClassName("none")[0].style.display = "block";
						return;
					}
					render("#events", "eventsTep1", r, true);
					appPage.imgInit();
					pageCount = r.pagecount;
					//停止上拉加载，参数为true代表没有更多数据了。
					mui('#pullrefresh').pullRefresh().endPullupToRefresh((page >= pageCount));
				}, false, function() {
					appPage.endPullRefresh(true);
				})
			} else {
				request("/Card/getCardGroupListByCardGroupPlazaId", {
					cardgroupplazaid: CardGroupPlazaId,
					pageno: page + 1
				}, function(r) {
					log(r);
					//没有数据
					if(r.code == -1) {
						appUI.showTopTip(r.msg);
						document.getElementsByClassName("none")[0].style.display = "block";
						return;
					}
					render("#events", "eventsTep1", r, true);
					appPage.imgInit();
					pageCount = r.pagecount;
					//停止上拉加载，参数为true代表没有更多数据了。
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