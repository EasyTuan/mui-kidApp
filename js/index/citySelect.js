mui.init();
var city = "未知";

var picker = new mui.PopPicker({
	layer: 2
});

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	try {
		city = self.info.city;
	} catch(e) {
		//TODO handle the exception
	}
	storage.init();
	if(city != "未知") {
		appSearchHistory.searchCity.update(city);
	}

	//区域三级联动
	picker.setData(cityData3);

	document.getElementsByClassName("cut")[0].addEventListener("tap", function() {
		picker.show(function(selectItems) {
			//log(JSON.stringify(selectItems));
			if(typeof(selectItems[0].text) == "undefined") {
				province = "未知";
			} else {
				province = selectItems[0].text;
			}
			if(typeof(selectItems[1].text) == "undefined") {
				city = "未知";
			} else {
				city = selectItems[1].text;
			}
			document.getElementById("city").value = "当前：" + city;
			appSearchHistory.searchCity.update(city);
		})
	})

	document.getElementById("city").value = "当前：" + city;

	//完成
	document.getElementById("comment").addEventListener("tap", function() {
		if(city == "未知") {
			mui.toast("请选择城市！");
			return;
		}
		request('/Base/getPlaceInfo', {
			cityname: city
		}, function(r) {
			var posi = {
				"coordsType": "wgs84",
				"address": {
					"district": "徐汇区",
					"country": "中国",
					"street": "桂平路",
					"city": city,
					"streetNum": "415号"
				},
				"addresses": "桂平路415号",
				"coords": {
					"latitude": r.data.Lon,
					"longitude": r.data.Lat,
					"accuracy": 65,
					"altitude": 61.54365158081055,
					"heading": null,
					"speed": null,
					"altitudeAccuracy": 10
				},
				"timestamp": 1506496454842.604
			};
			storageLocation.refreshData(posi);
			storageLocation.refreshCityId(r.data.CityId);
			plus.storage.setItem('whether', true);
			mui.fire(plus.webview.getWebviewById('index/home.html'), "citySelect", {
				city: city
			});
			mui.fire(plus.webview.getWebviewById('pk/pk.html'), "refreshPage");
			mui.back();
		}, true)
	})

	//历史记录
	var cityList = appSearchHistory.searchCity.list();
	for(var i = 0; i < cityList.length; i++) {
		document.getElementById("cityList").innerHTML += "<span class='item'>" + cityList[i] + "</span>"
	}

	//清除历史
	document.getElementById("delete").addEventListener("tap", function() {
		appSearchHistory.searchCity.clear();
		document.getElementById("cityList").innerHTML = "";
	})

	//最近访问
	mui(".stoList").on("tap", "span", function() {
		var cityname = this.innerHTML;
		request('/Base/getPlaceInfo', {
			cityname: cityname
		}, function(r) {
			var posi = {
				"coordsType": "wgs84",
				"address": {
					"district": "徐汇区",
					"country": "中国",
					"street": "桂平路",
					"city": cityname,
					"streetNum": "415号"
				},
				"addresses": "桂平路415号",
				"coords": {
					"latitude": r.data.Lon,
					"longitude": r.data.Lat,
					"accuracy": 65,
					"altitude": 61.54365158081055,
					"heading": null,
					"speed": null,
					"altitudeAccuracy": 10
				},
				"timestamp": 1506496454842.604
			};
			storageLocation.refreshData(posi);
			storageLocation.refreshCityId(r.data.CityId);
			plus.storage.setItem('whether', true);
			mui.fire(plus.webview.getWebviewById('index/home.html'), "citySelect", {
				city: cityname
			});
			mui.fire(plus.webview.getWebviewById('pk/pk.html'), "refreshPage");
			mui.back();
		})
	})

})