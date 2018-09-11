var lon, lat, city, timerobj, timer, bannerjson, singlematchjson, newmatchjson, nearstorejson, cardgroupjson, newsjson, newmatchpage = 2,
	nearstorepage = 2,
	swiper, hottopicjson;
mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: { //下拉刷新
			callback: pulldownRefresh,
			style: mui.os.android ? "circle" : "default"
		}
	}
});

mui.plusReady(function() {
	storage.init();
	//注册登录事件
	appPage.registerCheckLoginEvent();

	initPage();

	//	if(!storageLocation.Lon || storageLocation.Lon == "") { //未拿到定位信息
	//		plus.nativeUI.showWaiting("定位中...");
	//		plus.geolocation.getCurrentPosition(function(position) {
	//			plus.nativeUI.closeWaiting();
	//			storageLocation.refreshData(position);
	//			storageLocation.log();
	//			initPage();				
	//		}, function(e) {
	//			plus.nativeUI.closeWaiting();
	//			mui.alert(JSON.stringify(e));
	//			//appUI.showTopTip("定位失败，请手动选择位置"+JSON.stringify(e));
	//		}, {
	//			geocode: true
	//		});
	//	} else {
	//		initPage();
	//	}

	//赛事详情页
	mui("body").on("tap", ".matchInfo", function() {
		var id = this.getAttribute("data-id");
		openNew("../match/detail.html", {
			id: id
		});
	})

	//店铺详情页
	mui("#nearstore_warp").on("tap", ".storeinfo", function() {
		var id = this.getAttribute("data-id");
		openNew("shopDetails.html", {
			storeid: id
		});
	})

	//套牌详情页
	mui("#cardgroup_warp").on("tap", ".cardgroupdetail", function() {
		var id = this.getAttribute("data-id");
		openNew("../tool/cardDetails.html", {
			CardGroupId: id
		});
	})

	//新闻详情页
	mui("#news_warp").on("tap", ".newsinfo", function() {
		var id = this.getAttribute("data-id");
		openNew("../news/newsDetail.html", {
			id: id
		});
	})
	//热门头条详情页
	document.getElementById("topic_warp").addEventListener('tap', function() {
		openNew("../news/newsDetail.html", {
			id: this.dataset.id
		});
	})

	//城市选择
	document.getElementById("city").addEventListener("tap", function() {
		openNew("citySelect.html", {
			city: this.innerHTML
		});
	});

	//搜索
	document.getElementById("search").addEventListener("tap", function() {
		mui.openWindow({
			url: "search.html",
			id: "index/search.html",
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

	//官方资讯等二级
	mui(".navig").on("tap", "div", function() {
		if(this.dataset.href) {
			openNew(this.dataset.href);
		}
	})
	//轮播跳转
	mui("#banner_warp").on("tap", ".addetail", function() {
		if(this.dataset.href) {
			log(this.dataset.href + " | " + this.dataset.param)
			var jsonstr = this.dataset.param;
			log(jsonstr)
			var param = JSON.parse(jsonstr); // JSON.parse(jsonstr);
			log(JSON.stringify(param));
			openNew(this.dataset.href, param);
		}
	})
	//官方资讯
	document.getElementById("newslist").addEventListener("tap", function() {
		openNew("../news/newsList.html");
	})

	//参与比赛二级
	//	document.getElementById("participation").addEventListener("tap", function() {
	//		openNew("../pk/fightForJoin.html");
	//	})
	//店铺换一组
	document.getElementById("changestore").addEventListener("tap", function() {
		loadData_NearStore();
	})
	//赛事换一组
	document.getElementById("changematch").addEventListener("tap", function() {
		loadData_NewMatch();
	})

})

function initPage() {
	lon = storageLocation.Lon;
	lat = storageLocation.Lat;
	city = storageLocation.City;
	document.getElementById("city").innerText = city;
	swiper = new Swiper('.swiper-container', {
		autoplay: 3000, //可选选项，自动滑动
		pagination: '.swiper-pagination',
		loop: true,
		autoplayDisableOnInteraction: false,
	});
	loadData();
}
//下拉刷新具体业务实现
function pulldownRefresh() {
	loadData();
}
//一次性拉取数据
function loadData() {
	request("/Index/getIndexLis", {
		lon: lon,
		lat: lat,
		cityid: storageLocation.CityId
	}, function(json) {
		if(json.code == "0") {
			newmatchpage = 2, nearstorepage = 2;
			bannerjson = {};
			bannerjson.data = json.data.bannerdata;

			if(!swiper) {
				render("#banner_warp", "banner_view", bannerjson);
				swiper = new Swiper('.swiper-container', {
					autoplay: 3000, //可选选项，自动滑动
					pagination: '.swiper-pagination',
					loop: true,
					autoplayDisableOnInteraction: false,
				});
			} else {
				swiper.stopAutoplay();
				swiper.removeAllSlides();
				var item, str;
				for(var i = 0; i < bannerjson.data.length; i++) {
					item = bannerjson.data[i];
					str = '<div class="swiper-slide addetail" data-href="' + item.HrefUrl + '" data-param=\'' + item.HrefParam + '\'><img class="loadthumb" data-url="' + item.ImgUrl + '" data-wh=",320" />';
					//log(str);
					swiper.appendSlide(str);
				}

				//render("#banner_warp", "banner_view", bannerjson,true);
				//				swiper.appendSlide("<div class='swiper-slide'><img src='../../images/banner.png' /></div>"+"<div class='swiper-slide'><img src='../../images/banner.png' /></div>"+"<div class='swiper-slide'><img src='../../images/banner.png' /></div>"+"<div class='swiper-slide'><img src='../../images/banner.png' /></div>");
				swiper.startAutoplay();
			}

			singlematchjson = {};
			singlematchjson.data = json.data.recentmatchdata;
			showSigleMatch();

			newmatchjson = {};
			newmatchjson.data = json.data.newestmatchdata;
			showNewMatch();

			nearstorejson = {};
			nearstorejson.data = json.data.nearbystoredata;
			showNearStore();

			cardgroupjson = {};
			cardgroupjson.data = json.data.taopaidata;
			render("#cardgroup_warp", "cardgroup_view", cardgroupjson);

			newsjson = {};
			newsjson.data = json.data.newestnewsdata;
			render("#news_warp", "news_view", newsjson);

			hottopicjson = {};
			hottopicjson.data = json.data.hottopicdata;
			document.getElementById("topic_warp").setAttribute('data-id', hottopicjson.data.NewsId)

			appPage.imgInit();
		} else {
			appUI.showTopTip(json.msg)
		}
		appPage.endPullRefresh();
	}, false, function() {
		appPage.endPullRefresh();
		var arr = document.getElementsByClassName("nodata");
		for(var i = 0; i < arr.length; i++) {
			arr[i].innerText = "暂无数据";
		}
	});
}
//拉取单条报名中数据
function loadData_SigleMatch() {
	request("/Index/getRecentMatchOne", {
		lon: lon,
		lat: lat,
		cityid: storageLocation.CityId
	}, function(json) {
		singlematchjson = {};
		singlematchjson.data = json.data.matchDdistanceMin;
		showSigleMatch();
		appPage.imgInit();
	}, false, function() {}, false);
}
//赛事换一组
function loadData_NewMatch() {
	log(newmatchpage)
	request("/Index/newestMatchChangeGroup", {
		cityid: storageLocation.CityId,
		pageindex: newmatchpage
	}, function(json) {
		if(json.code == 0) {
			newmatchjson = {};
			newmatchjson.data = json.data;
			newmatchpage = json.pageindex;
			showNewMatch();
			appPage.imgInit();
		} else {
			log("空赛事" + json.msg)
		}
	}, true);
}
//店铺换一组
function loadData_NearStore() {
	request("/Index/nearbyStoreChangeGroup", {
		lon: lon,
		lat: lat,
		cityid: storageLocation.CityId,
		pageindex: nearstorepage
	}, function(json) {
		if(json.code == 0) {
			nearstorejson = {};
			nearstorejson.data = json.data;
			nearstorepage = json.pageindex;
			showNearStore();
			appPage.imgInit();
		} else {
			log("空店铺" + json.msg)
		}
	}, true);
}
//单条报名中赛事绑定显示
function showSigleMatch() {
	render("#siglematch_warp", "siglematch_view", singlematchjson);
	if(singlematchjson.data != null) {
		document.getElementById("siglematch_warp").style.display = 'block';
		timerobj = appUI.countDown(singlematchjson.data.MatchBeginTime || "2017-1-1 00:00:00");
		if(timerobj.hour == "0" && timerobj.minute == "0" && timerobj.second == "0") { //倒计时结束
			window.clearInterval(timer); //清除定时器	
			loadData_SigleMatch();
			return;
		}
		//倒计时
		timer = setInterval(function() {
			timerobj = appUI.countDown(singlematchjson.data.MatchBeginTime);
			//log(JSON.stringify(timerobj));
			if(timerobj.hour == "0" && timerobj.minute == "0" && timerobj.second == "0") { //倒计时结束
				window.clearInterval(timer); //清楚定时器			
				loadData_SigleMatch(); //更新显示内容
				return;
			}
			document.getElementById("timer_h").innerText = timerobj.hour < 10 ? "0" + timerobj.hour : timerobj.hour;
			document.getElementById("timer_m").innerText = timerobj.minute < 10 ? "0" + timerobj.minute : timerobj.minute;
			document.getElementById("timer_s").innerText = timerobj.second < 10 ? "0" + timerobj.second : timerobj.second;
		}, 1000);
	} else {
		document.getElementById("siglematch_warp").style.display = 'none';
	}
}
//赛事绑定显示
function showNewMatch() {
	render("#newmatch_warp", "newmatch_view", newmatchjson);
}
//店铺推荐绑定显示
function showNearStore() {
	render("#nearstore_warp", "nearstore_view", nearstorejson);
}

//自定义监听城市选择
window.addEventListener("citySelect", function(event) {
	storage.init();
	document.getElementById("city").innerHTML = event.detail.city;
	loadData();
})

var pkEvent = {
	gonearPeople: function() {
		openNew("nearPeople.html");
	}
}