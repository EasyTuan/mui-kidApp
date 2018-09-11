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

mui.plusReady(function() {
	storage.init();

	//输入框变化
	document.getElementById("inpt_search").addEventListener("input", function(e) {
		if(this.value == "") {
			document.getElementById("backBtn").style.display = "block";
			document.getElementById("searchBtn").style.display = "none";
			return;
		}
		document.getElementById("searchBtn").style.display = "block";
		document.getElementById("backBtn").style.display = "none";
	})

	//搜索
	document.getElementById("searchBtn").addEventListener("tap", function() {
		var keyword = document.getElementById("inpt_search").value;
		appSearchHistory.searchShop.update(keyword);
		request('/Store/searchStoreList', {
			keyword: keyword,
			lon: storageLocation.Lon,
			lat: storageLocation.Lat,
			pageindex: 1
		}, function(r) {
			log(r);
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				return;
			}
			pageCount = r.pagecount;
			document.getElementById("shopList").style.display = 'block';
			document.getElementsByClassName("history")[0].style.display = 'none';
			render("#shopList", "shopListTep1", r);
		}, true)
	})

	//历史资料搜索
	mui(".historyList").on("tap", "span", function() {
		document.getElementById("inpt_search").value = this.innerHTML;
		document.getElementById("backBtn").style.display = "none";
		document.getElementById("searchBtn").style.display = "block";
		var keyword = document.getElementById("inpt_search").value;
		request('/Store/searchStoreList', {
			keyword: keyword,
			lon: storageLocation.Lon,
			lat: storageLocation.Lat,
			pageindex: 1
		}, function(r) {
			log(r);
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				return;
			}
			pageCount = r.pagecount;
			document.getElementById("shopList").style.display = 'block';
			document.getElementsByClassName("history")[0].style.display = 'none';
			render("#shopList", "shopListTep1", r);
		}, true)
	})

	//历史记录
	var fightList = appSearchHistory.searchShop.list();
	for(var i = 0; i < fightList.length; i++) {
		document.getElementsByClassName("historyList")[0].innerHTML += "<span>" + fightList[i] + "</span>"
	}

	//清除历史
	document.getElementById("clear").addEventListener("tap", function() {
		var btnArray = ['否', '是'];
		mui.confirm('确定删除所有记录吗？', "", btnArray, function(e) {
			if(e.index == 1) {
				appSearchHistory.searchShop.clear();
				var el = document.getElementsByClassName('historyList')[0];
				el.parentNode.removeChild(el);
			}
		})
	})

	//查看对战
	mui("#shopList").on("tap", ".war", function() {
		openNew("shopMatch.html", {
			storeid: this.dataset.id,
			shopname: this.dataset.shopname
		});
	})

	//二级
	mui(".mui-table-view").on("tap", ".details", function() {
		openNew("shopDetails.html", {
			storeid: this.dataset.storeid
		});
	})

})

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		var keyword = document.getElementById("search").value;
		if(keyword != '') {
			appSearchHistory.searchShop.update(keyword);
			request('/Store/searchStoreList', {
				keyword: keyword,
				lon: storageLocation.Lon,
				lat: storageLocation.lat,
				pageindex: 1
			}, function(r) {
				log(r);
				if(r.code == -1) {
					appUI.showTopTip(r.msg);
					return;
				}
				document.getElementById("shopList").style.display = 'block';
				document.getElementsByClassName("history")[0].innerHTML = '';
				render("#shopList", "shopListTep1", r);
				//下拉刷新结束
				mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
				mui('#pullrefresh').pullRefresh().refresh(true);
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
		setTimeout(function() {
			var keyword = document.getElementById("search").value;
			if(keyword != '') {
				appSearchHistory.searchShop.update(keyword);
				request('/Store/searchStoreList', {
					keyword: keyword,
					lon: storageLocation.Lon,
					lat: storageLocation.lat,
					pageindex: page + 1
				}, function(r) {
					log(r);
					if(r.code == -1) {
						appUI.showTopTip(r.msg);
						return;
					}
					render("#shopList", "shopListTep1", r, true);
					//下拉刷新结束
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
				}, true)
			}
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
			page++;
			log(mklog() + '上拉加载结束！！')
		}, 1500);
	} else {
		//mui.toast("温馨提示：没有更多数据");
		mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
	}

}