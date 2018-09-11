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
		appSearchHistory.searchPeople.update(keyword);
		request('/Player/getNearbyPlayer', {
			playerid: storageUser.UId,
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
			document.getElementById("peopleList").style.display = 'block';
			document.getElementsByClassName("history")[0].style.display = 'none';
			render("#peopleList", "peopleListTep1", r);
			appPage.imgInit();
		}, true)
	})

	//历史资料搜索
	mui(".historyList").on("tap", "span", function() {
		document.getElementById("inpt_search").value = this.innerHTML;
		document.getElementById("backBtn").style.display = "none";
		document.getElementById("searchBtn").style.display = "block";
		var keyword = document.getElementById("inpt_search").value;
		request('/Player/getNearbyPlayer', {
			playerid: storageUser.UId,
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
			document.getElementById("peopleList").style.display = 'block';
			document.getElementsByClassName("history")[0].style.display = 'none';
			render("#peopleList", "peopleListTep1", r);
			appPage.imgInit();
		}, true)
	})

	//历史记录
	var fightList = appSearchHistory.searchPeople.list();
	for(var i = 0; i < fightList.length; i++) {
		document.getElementsByClassName("historyList")[0].innerHTML += "<span>" + fightList[i] + "</span>"
	}

	//清除历史
	document.getElementById("clear").addEventListener("tap", function() {
		var btnArray = ['否', '是'];
		mui.confirm('确定删除所有记录吗？', "", btnArray, function(e) {
			if(e.index == 1) {
				appSearchHistory.searchPeople.clear();
				var el = document.getElementsByClassName('historyList')[0];
				el.parentNode.removeChild(el);
			}
		})
	})

	//打开用户资料
	mui(".mui-table-view").on("tap", ".details", function() {
		openNew("../my/userInfo.html", {
			id: this.dataset.playerid
		});
	})

	//约战
	mui(".mui-table-view").on("tap", ".war", function() {
		openNew("../pk/war.html", {
			friendid: this.dataset.playerid,
			imgurl: this.dataset.imgurl,
			friendNickName: this.dataset.nickname
		});
	})

})

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		var keyword = document.getElementById("search").value;
		if(keyword != '') {
			appSearchHistory.searchShop.update(keyword);
			request('/Player/getNearbyPlayer', {
				playerid: storageUser.UId,
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
				document.getElementById("peopleList").style.display = 'block';
				document.getElementsByClassName("history")[0].innerHTML = '';
				render("#peopleList", "peopleListTep1", r);
				appPage.imgInit();
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
				request('/Player/getNearbyPlayer', {
					playerid: storageUser.UId,
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
					render("#peopleList", "peopleListTep1", r, true);
					appPage.imgInit();
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