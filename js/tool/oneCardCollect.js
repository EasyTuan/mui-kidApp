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

var cardPage = 0; //卡牌当前页面&&总数
var cardList = []; //存储所有cardId
var page = 1; //初始页码
var pageCount = 0; //总页数
var BrandId = "";

mui.plusReady(function() {
	//var self = plus.webview.currentWebview();
	BrandId = plus.storage.getItem('BrandId');

	storage.init();

	request("/Card/getPlayerFavoriteCardListByPlayerId", {
		playerid: storageUser.UId,
		brandid: BrandId,
		pageno: 1
	}, function(r) {
		log(r);
		//没有数据
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
			document.getElementsByClassName("none")[0].style.display = "block";
			return;
		}
		document.getElementById("number").innerHTML = r.data.length;
		pageCount = r.pagecount;
		//注入序列号
		for(var i = 0; i < r.data.length; i++) {
			r.data[i].page = i + 1;
			cardList[i] = r.data[i].CardId;
			cardPage = i + 1;
		}
		render("#cardList", "cardListTep1", r);
		appPage.imgInit();
	}, true)

	//搜索
	document.getElementById("search").addEventListener("tap", function() {
		openNew("oneCardSearch.html", {
			BrandId: BrandId
		});
	})

	//可能从登录页进来的，所以需要执行手动关闭登录页
	//appPage.closeLogin();

})

//打开二级

mui("#cardList").on("tap", "li", function() {
	openNew("oneCardDetail.html", {
		CardId: this.dataset.cardid, //当前卡牌id
		pageIndex: this.dataset.page, //当前卡牌页码
		page: cardPage, //总页面
		cardList: cardList //页面对应id，数组形式
	});
})

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		request("/Card/getPlayerFavoriteCardListByPlayerId", {
			playerid: storageUser.UId,
			brandid: BrandId,
			pageno: 1
		}, function(r) {
			log(r);
			//没有数据
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				document.getElementsByClassName("none")[0].style.display = "block";
				return;
			}
			document.getElementById("number").innerHTML = r.data.length;
			pageCount = r.pagecount;
			//注入序列号
			for(var i = 0; i < r.data.length; i++) {
				r.data[i].page = i + 1;
				cardList[i] = r.data[i].CardId;
				cardPage = i + 1;
			}
			render("#cardList", "cardListTep1", r);
			appPage.imgInit();
			//下拉刷新结束
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
			//重置上拉加载
			mui('#pullrefresh').pullRefresh().refresh(true);
			//重置页码
			page = 1;
		});
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
			request("/Card/getPlayerFavoriteCardListByPlayerId", {
				playerid: storageUser.UId,
				brandid: BrandId,
				pageno: page + 1
			}, function(r) {
				if(r.code == -1) {
					appUI.showTopTip(r.msg);
					return;
				}
				var cardnum = Number(document.getElementById("number").innerHTML);
				document.getElementById("number").innerHTML = cardnum + r.data.length;
				//注入序列号
				for(var i = 0; i < r.data.length; i++) {
					r.data[i].page = cardPage + 1;
					cardList[cardPage] = r.data[i].CardId;
					cardPage = cardPage + 1;
				}
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