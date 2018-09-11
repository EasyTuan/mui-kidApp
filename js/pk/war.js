mui.init({
	beforeback: function() {
		appPage.closeLogin();
	}
});

//下拉菜单
mui('.mui-popover').scroll({
	scrollY: true, //是否竖向滚动
	scrollX: false, //是否横向滚动
	deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
});

var brandid = '', //品牌
	matchName = '', //名称
	storedata = '', //比赛场地&&店铺id
	matchnamedata = '', //对战宣言
	matchTime = '', //比赛时间
	date = 0, //日期，0为今天，1为明天，2为后天 
	matchplayernum = '', //solo 为单人，multi 为多人
	storeName = "",
	//	storeProvince = "",
	//	storeCity = "",
	//	storeDistrict = "",
	//	storeAddress = "",
	storeAddressStr = "",
	friendNickName = '',
	openMapInfo = {}, //打开地图需要参数
	imgurl = '', //品牌图片
	mySwiper = '';

var matchnamedataIndex = '',
	lon, lat, friendid, friendheadimg, imgwarp, matchnamejson, matchsloganjson;

var nameNum = 1,
	sayNum = 1;

mui.plusReady(function() {
	storage.init();
	imgwarp = document.getElementById("img_warp");
	friendid = appPage.getParam("friendid");
	friendheadimg = appPage.getParam("imgurl");
	friendNickName = appPage.getParam("friendNickName");

	//多余时间隐藏
	function noneTime() {
		var oDate = new Date();
		var nowHour = oDate.getHours();
		var nowMinute = oDate.getMinutes();
		var numIndex = 0;
		mui('.matchTime').each(function() {
			this.style.margin = '1.5% 2.5% 1.5% 0';
			if(this.dataset.index <= nowHour) {
				this.style.display = 'none';
			}
			if(nowMinute < 30 && this.dataset.index == nowHour) {
				if(numIndex == 1) {
					this.style.display = 'block';
				}
				numIndex++;
			}
		})
		var timeIndex = 0;
		mui('.matchTime').each(function() {
			if(this.style.display != 'none') {
				timeIndex++;
				if(timeIndex % 5 == 0) {
					this.style.margin = '1.5% 0';
				}
			}
		})
	}
	//防止键盘挡住输入框
	if(mui.os.android) {
		document.getElementById("manifesto").addEventListener('focus', function() {
			setTimeout(function() {
				mui('.mui-scroll-wrapper').scroll().scrollToBottom();
			}, 300)
		})
	}

	noneTime();

	if(friendid) { //1v1
		document.getElementById("one").style.backgroundImage = "url(" + storageUser.ImgUrl + ")";
		document.getElementById("one").innerHTML = "<span>" + '我' + "</span>"
		friendheadimg == '' ? document.getElementById("two").style.backgroundImage = "url(../../images/defuser.jpg)" : document.getElementById("two").style.backgroundImage = "url(" + friendheadimg + ")";
		document.getElementById("two").innerHTML = "<span>" + friendNickName + "</span>";
		document.getElementById("gameNum").style.display = 'none';
		matchplayernum = 'solo';
		imgwarp.setAttribute("style", "");
	} else {
		document.getElementById("one").style.backgroundImage = "";
		document.getElementById("two").style.backgroundImage = "";
		document.getElementById("gameNum").setAttribute("style", "");
		imgwarp.setAttribute("style", "display: none;");
	}
	lon = storageLocation.Lon;
	lat = storageLocation.Lat;
	request("/Match/getAddMatchInitInfo", {
		lon: lon,
		lat: lat,
		playerid: storageUser.UId
	}, function(json) {
		if(json.code == 0) {
			matchnamejson = json.data.matchnamedata;
			matchsloganjson = json.data.slogandata;
			if(matchnamejson && matchnamejson.length > 0) {
				document.getElementById("matchName").value = matchnamejson[0];
			}
			if(matchsloganjson && matchsloganjson.length > 0) {
				document.getElementById("manifesto").value = matchsloganjson[0];
			}

			//随机切换
			document.getElementById("selectName").addEventListener('tap', function() {
				if(!matchnamejson || matchnamejson.length == 0) {
					return;
				}
				if(nameNum < matchnamejson.length) {
					document.getElementById("matchName").value = matchnamejson[nameNum];
					nameNum++
				} else {
					nameNum = 0;
				}

			})
			document.getElementById("selectSay").addEventListener('tap', function() {
				if(!matchsloganjson || matchsloganjson.length == 0) {
					return;
				}
				if(sayNum < matchsloganjson.length) {
					document.getElementById("manifesto").value = matchsloganjson[sayNum];
					sayNum++
				} else {
					sayNum = 0;
				}

			})
			//打开地图
			mui("body").on("tap", ".openMap", function() {
				openNew("pkMap.html");
				//				if(plus.storage.getItem('location')){
				//					openNew("pkMap.html");
				//				}else{
				//					mui.toast('定位服务未开启，无法打开地图！');
				//				}
			})

			if(json.data.storedata && json.data.storedata.length > 0) {
				var storeobj = json.data.storedata[0];
				document.getElementById("place").value = storeobj.StoreName;
				document.getElementById("place").setAttribute('data-id', storeobj.StoreId);
				document.getElementById("storeaddress").innerHTML = storeobj.Address;

				storeName = storeobj.StoreName;
				storeAddressStr = storeobj.ProvinceName + storeobj.CityName + storeobj.DistrictName + storeobj.Address;
			}

			//matchnamedataIndex = json.data.matchnamedata[0];

			render("#storedata", "storedataTep1", json.data);
			render("#swiperContainer", "swiperContainerTep1", json.data);
			appPage.imgInit();

			mySwiper = new Swiper('.swiper-container', {
				loop: true,
				slidesPerView: 2,
				centeredSlides: true,
				spaceBetween: 18
			});

			mui('.swiper-slide img').each(function() {
				this.style.height = this.style.width;
			})
		} else {
			mui.toast(json.msg);
		}
	})

	//下拉菜单
	mui(".group").on("tap", "input", function() {
		mui(this.parentNode.childNodes[7]).popover('toggle');
	})
	mui(".group").on("tap", ".icon-more1", function() {
		mui(this.parentNode.childNodes[7]).popover('toggle');
	})

	//下拉选择
	mui(".mui-popover").on("tap", "li", function() {
		this.setAttribute("class", "active");
		this.parentNode.parentNode.parentNode.childNodes[3].value = this.dataset.text;
		this.parentNode.parentNode.parentNode.childNodes[3].setAttribute("data-id", this.dataset.id);
		if(this.dataset.address && this.dataset.address != "") {
			//打开地图需要参数
			openMapInfo.StoreId = this.dataset.id;
			openMapInfo.StoreName = this.dataset.text;
			openMapInfo.Lon = this.dataset.lon;
			openMapInfo.Lat = this.dataset.lat;
			openMapInfo.distance = this.dataset.distance;

			storeName = this.dataset.text;
			//			storeProvince = this.dataset.province;
			//			storeCity = this.dataset.city;
			//			storeDistrict = this.dataset.district;
			//			storeAddress = this.dataset.address;
			storeAddressStr = this.dataset.province + this.dataset.city + this.dataset.district + this.dataset.address;
			document.getElementById("storeaddress").innerText = storeAddress;
		}

		mui('.mui-popover').popover('hide');
		var el = this;
		setTimeout(function() {
			el.setAttribute("class", "");
		}, 100)
	})

	//今明后
	mui("#dateSelect").on("tap", "a", function() {
		if(this.dataset.index == 0) {
			noneTime();
		} else {
			var timeIndex = 0;
			mui(".matchTime").each(function() {
				this.style.display = 'block';
				this.style.margin = '1.5% 2.5% 1.5% 0';
				timeIndex++;
				if(timeIndex % 5 == 0) {
					this.style.margin = '1.5% 0';
				}
			});
		}
		date = Number(this.dataset.index);
	})

	//时间单选
	mui(".kindTime").on("tap", "span", function() {
		var matchTime = document.getElementsByClassName("matchTime");
		for(var i = 0; i < matchTime.length; i++) {
			matchTime[i].setAttribute("class", "matchTime");
		}
		this.setAttribute("class", "matchTime active");
		var d = new Date();
		d.setDate(d.getDate() + date);
		matchTime = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + ' ' + this.innerText;
		document.getElementById("manifesto").setAttribute('data-time', matchTime);
		log("时间：" + matchTime);
	})

	//比赛人数
	mui(".matchNum").on("tap", "span", function() {
		mui('.selectMactchNum').each(function() {
			this.setAttribute('class', 'selectMactchNum');
		});
		this.setAttribute('class', 'active selectMactchNum');
		matchplayernum = this.dataset.status;
	})

	//约战
	document.getElementById("searchBtn").addEventListener("tap", function() {
		brandid = document.getElementsByClassName("swiper-slide-active")[0].dataset.id;
		imgurl = document.getElementsByClassName("swiper-slide-active")[0].dataset.imgurl;
		matchName = document.getElementById("matchName").value;
		storedata = document.getElementById("place").dataset.id;
		matchnamedata = document.getElementById("manifesto").value;
		matchTime = document.getElementById("manifesto").dataset.time;
		if(matchName == "") {
			mui.toast('请输入标题！')
			return;
		}
		if(storedata == "") {
			mui.toast('请选择赛地！')
			return;
		}
		if(matchplayernum == "") {
			mui.toast('请选择对战人数！')
			return;
		}
		if(matchTime == "") {
			mui.toast('请选择时间！')
			return;
		}
		if(matchnamedata == "") {
			mui.toast('请选择宣言！')
			return;
		}

		var data = {
			lon: lon,
			lat: lat,
			brandid: brandid,
			matchname: matchName,
			storeid: storedata,
			storename: storeName,
			//			storeprovince: storeProvince,
			//			storecity: storeCity,
			//			storedistrict: storeDistrict,
			//			storeaddress: storeAddress,
			storeaddressstr: storeAddressStr,
			slogan: matchnamedata,
			matchtime: matchTime,
			matchplayernum: matchplayernum,
			friendid: friendid,
			friendheadimg: friendheadimg,
			friendNickName: friendNickName,
			imgurl: imgurl
		};
		log(data);

		openNew("../match/detail_war.html", {
			data: JSON.stringify(data),
		});

	})

	//自定义监听店铺改变
	window.addEventListener('updateShop', function(event) {
		document.getElementById("place").value = event.detail.storeName;
		document.getElementById("place").setAttribute('data-id', event.detail.storeId);
		document.getElementById("storeaddress").innerHTML = event.detail.Address;

		storeName = event.detail.storeName;
		storeAddressStr = event.detail.AddressStr;

	})
})