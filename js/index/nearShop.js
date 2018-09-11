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

var lon = '',
	lat = '';

mui.plusReady(function() {
	storage.init();

	getList();

	//打开地图
	mui(".mui-bar-nav").on("tap", ".icon-map", function() {
		openNew("map.html");
		//		if(plus.storage.getItem('location')){
		//			openNew("map.html");
		//		}else{
		//			mui.toast('定位服务未开启，无法打开地图！');
		//		}
	})

	//打开搜索
	document.getElementById("search").addEventListener("tap", function() {
		mui.openWindow({
			url: "searchShop.html",
			id: "searchShop.html",
			show: {
				autoShow: true, //页面loaded事件发生后自动显示，默认为true
				aniShow: "none", //页面显示动画，默认为”slide-in-right“；
				event: 'titleUpdate', //页面显示时机，默认为titleUpdate事件时显示
				extras: {} //窗口动画是否使用图片加速
			},
			waiting: {
				autoShow: false, //自动显示等待框，默认为true
			}
		})
	})

	//查看对战
	mui(".mui-table-view").on("tap", ".war", function() {
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

//拉取列表
function getList() {
	request("/Store/getStoreList", {
		lon: storageLocation.Lon,
		lat: storageLocation.Lat,
		pageindex: 1
	}, function(r) {
		log(r);
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
		}
		render("#shopList", "shopListTep1", r)
		appPage.imgInit();
		pageCount = r.pagecount;
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
		setTimeout(function() {
			request("/Store/getStoreList", {
				lon: storageLocation.Lon,
				lat: storageLocation.Lat,
				pageindex: page + 1
			}, function(r) {
				log(r);
				if(r.code == -1) {
					appUI.showTopTip(r.msg);
				}
				render("#shopList", "shopListTep1", r, true)
				appPage.imgInit();
			}, true, function() {
				appPage.endPullRefresh(true);
			})
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
			page++;
			log(mklog() + '上拉加载结束！！')
		}, 1500);
	} else {
		//mui.toast("温馨提示：没有更多数据");
		mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
	}

}