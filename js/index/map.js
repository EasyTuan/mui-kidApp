mui.init({
	swipeBack: false,
	gestureConfig: {
		dragend: true, //拖动结束
	}
});

var self = null, //当前wv
	gdMap = null, //高德地图总函数
	mapObj = null, //创建的地图对象
	cluster = null, //点聚合对象
	markers = [], //往地图上打的点们
	selectMaker = null, //选择了的地图上的点，用于打开popover传参
	isMarkedCity = [], //已经打过点的城市
	noNetworkDom = document.getElementById("noNetwork");
var codtArr = [];

var brandList = [];

mui.plusReady(function() {
	storage.init();
	var self = plus.webview.currentWebview();

	//拖动结束
	document.getElementById("map").addEventListener('dragend', function() {
		document.getElementsByClassName("center")[0].setAttribute('class', 'center centerAnimation');
		setTimeout(function() {
			document.getElementsByClassName("center")[0].setAttribute('class', 'center');
		}, 500)
	})

	//搜索
	document.getElementById("searchBtn").addEventListener("tap", function() {
		var keyword = document.getElementById("search").value;
		if(keyword == '') {
			mui.toast('请输入店铺名称！');
			return;
		}
		gdMap.mapInit(codtArr);
		gdMap.setLocalMarker(codtArr);
		gdMap.setMarkersBySearchResult(keyword);
	})

	self = plus.webview.currentWebview()
	//	在Android5以上设备， 如果默认没有开启硬件加速， 则强制设置开启
	if(!plus.webview.defaultHardwareAccelerated() && parseInt(plus.os.version) >= 5) {
		self.hardwareAccelerated = true;
	}
	//定义设备联网情况
	var network = true;
	if(plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) { //初始化检查网络
		network = false;
	}

	if(network) {
		appUI.showWaiting();
		log(JSON.stringify(plus.os.name));
		if(plus.os.name == 'Android') {
			var webapi_url = 'http://restapi.amap.com/v3/ip';
		} else {
			var webapi_url = 'http://restapi.amap.com/v3/ip?key=6d5a7a16c2b33a6aa281376dbc14dd3e';
		}

		//获取定位信息
		plus.geolocation.getCurrentPosition(function(p) {
			log(mklog() + "【当前位置】:" + p.coords.longitude + "|" + p.coords.latitude)
			//将用户当前位置存入storage
			localStorage.setItem("longitude", p.coords.longitude);
			localStorage.setItem("latitude", p.coords.latitude);
			codtArr = [p.coords.longitude, p.coords.latitude];
			log('【当前位置：codtArr =[' + p.coords.longitude + ',' + p.coords.latitude + ']】')
			//初始化高德地图
			gdMap.mapInit(codtArr)
			//打当前位置点
			gdMap.setLocalMarker(codtArr)
			//地图图块加载完毕
			mapObj.on('complete', function() {
				appUI.closeWaiting();
				log(mklog() + "地图图块加载完毕！当前地图中心点为：" + mapObj.getCenter())
				//获取当前城市数据
				gdMap.getCurrentCity(function(city) {
					if(city) {
						//	添加点聚合
						gdMap.setMoreMarkersWithCluster({
							city: city,
							scene: '',
							style: '',
							itemId: '',
							longitude: codtArr[0],
							latitude: codtArr[1]
						})
					}
					//城市存入localstorage
					localStorage.setItem("city", city);
				})
			})

			//打当前位置点
			document.getElementById("location").addEventListener('tap', function() {
				gdMap.mapInit(codtArr);
				gdMap.setLocalMarker(codtArr);
				gdMap.setMoreMarkersWithCluster({
					city: localStorage.getItem('city'),
					scene: '',
					style: '',
					itemId: '',
					longitude: codtArr[0],
					latitude: codtArr[1]
				})
			})

		}, function(e) {
			mui.toast(e.message)
			noNetworkDom.innerHTML = "地图初始化失败！点击重试"
			noNetworkDom.style.display = 'block'
			noNetworkDom.addEventListener('tap', function() {
				plus.webview.currentWebview().reload(true) //TODO 先用reload顶上，应重新初始化地图
			})
		}) //H5定位 end

	} else {
		log(mklog() + 'main:网络异常');
		plus.nativeUI.toast('当前设备未联网，先打开WIFI/2G/3G/4G信号');
		noNetworkDom.style.display = 'block';
		noNetworkDom.addEventListener('tap', function() {
			plus.webview.currentWebview().reload(true) //TODO 先用reload顶上，应重新初始化地图
		})
	}

	//点击重载(刷新)
	document.getElementById("reload").addEventListener('tap', function() {
		plus.webview.currentWebview().reload(true) //TODO 先用reload顶上，应重新初始化地图
	})

	//自定义放大缩小
	document.getElementById("add").addEventListener("tap", function() {
		gdMap.moveCamera(mapObj.zoomIn());
	})
	document.getElementById("subtract").addEventListener("tap", function() {
		gdMap.moveCamera(mapObj.zoomOut());
	})

}) //plusReady end

//高德地图相关
//初始化：mapInit(null)
//本地打点：setLocalMarker(coordinate||null)
//批量打点:setMarkersToMap(Arry)//自定义地图点信息
//当前城市名：getCurrentCity(callback)返回当前城市名称(基于ip定位需网)
//根据城市名称取店铺：setMoreMarkersWithCluster(filter)//绑定查询接口并打聚合点！

gdMap = {
	mapInit: function(CenterCoordinate) {
		mapObj = new AMap.Map('map', {
			resizeEnable: true,
			zoom: 12,
			center: CenterCoordinate || '',
		})
		mapObj.setMapStyle("fresh");
		mapObj.setFeatures(['road', 'point', 'bg']) //多个种类要素显示
		mapObj.setLimitBounds(mapObj.getBounds()); //限制地图显示区域
	},
	setLocalMarker: function(coordinate) { //打本地点
		coordinate = coordinate || ''
		//定义当前位置图片
		var iconLocation = new AMap.Icon({
			image: '../../images/locationX40.svg'
		})
		//当前位置预备打点
		var markerLocation = new AMap.Marker({
			position: coordinate,
			icon: iconLocation
		})
		//打本地！
		markerLocation.setMap(mapObj)
	},
	getCurrentCity: function(callback) { //获取当前城市
		//加载IP定位插件
		mapObj.plugin(["AMap.CitySearch"], function() {
			//实例化城市查询类
			var citysearch = new AMap.CitySearch();

			//自动获取用户IP，返回当前城市
			citysearch.getLocalCity();
			AMap.event.addListener(citysearch, "complete", function(result) {
				log(JSON.stringify(result));
				if(result && result.city && result.bounds) {
					var cityinfo = result.city;
					var citybounds = result.bounds;
					log(mklog() + '【当前城市】：' + cityinfo + '--by gdMap.getCurrentCity')
					return callback(cityinfo);
					//地图显示当前城市
					mapObj.setBounds(citybounds);
				} else {
					log('您当前所在城市失败：' + cityinfo + '--by gdMap.getCurrentCity')
					return callback();
				}
			})
			AMap.event.addListener(citysearch, "error", function(result) {
				mui.toast(result.info);
			})
		})
	},
	setMoreMarkersWithCluster: function(filter) {
		//点聚合对象(cluster)AMap.MarkerClusterer
		//API http://lbs.amap.com/api/javascript-api/reference/plugin/#AMap.MarkerClusterer
		log(mklog() + '进入批量打点：filter=' + JSON.stringify(filter))
		//						filter.city = '上海市'
		isMarkedCity.push(filter.city); //记录已经打过点的城市
		request('/Store/getStoreList', {
			lon: storageLocation.Lon,
			lat: storageLocation.Lat,
			pageindex: 1
		}, function(r) {
			mapObj.remove(markers);
			markers = [];
			mui.each(r.data, function(j, k) {
				var markerPosition = JSON.parse('[' + k.Lon + ',' + k.Lat + ']');
				var Shopstatus = 0;
				if(k.IsHaveMatch == 'Y') Shopstatus = 1;
				var iconUrl = "../../images/amp-mk" + k.Status + ".svg";
				var marker = new AMap.Marker({
					position: markerPosition,
					"content": "<div class='experience-image'>" +
						"<span class='map-icon-url' data_id='" + k.StoreId + "' data_name='" + k.StoreName + "' data_distance='" + k.distance + "' data_score='" + k.Score + "' style='position:absolute;border-radius:6px ;width:90px;height:20px;text-align: center;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;font-size:12px;color:#666;left:50%;bottom:50px;margin-left:-45px;border-radio:25%;background: #fff;'>" + k.StoreName + "</span>" +
						//"<img class='shopIcon' src='" + iconUrl + "'/>"+
						"<i class='shopIcon" + Shopstatus + "' style='background: url(" + iconUrl + ");'></i>" +
						"</div>",
					"extData": {
						"id": k.StoreId,
						"name": k.StoreName,
						"status": Shopstatus,
						"distance": k.distance,
						"Score": k.Score,
						"ImgUrl": k.ImgUrl
						//"designerId": k.designerId
					},

				}) //marker end

				markers.push(marker);

			})

			if(markers.length) {
				log(mklog() + '【debug】点数量:' + markers.length)
				gdMap.addClusterToMap(markers) //执行一次
			}
		}) //request end
	},
	setMarkersBySearchResult: function(dataParm) {
		//点聚合对象(cluster)AMap.MarkerClusterer
		//API http://lbs.amap.com/api/javascript-api/reference/plugin/#AMap.MarkerClusterer
		log(mklog(JSON.stringify(dataParm)) + '进入搜索结果打点')
		request('/Store/searchStoreList', {
			lon: storageLocation.Lon,
			lat: storageLocation.Lat,
			pageindex: 1,
			keyword: dataParm
		}, function(r) {
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				return;
			} else {
				mapObj.remove(markers);
				markers = [];
				mui.each(r.data, function(j, k) {
					var markerPosition = JSON.parse('[' + k.Lon + ',' + k.Lat + ']');
					var Shopstatus = 0;
					if(k.IsHaveMatch == 'Y') Shopstatus = 1;
					var iconUrl = "../../images/amp-mk" + k.Status + ".svg";
					var marker = new AMap.Marker({
						position: markerPosition,
						"content": "<div class='experience-image'>" +
							"<span class='map-icon-url' data_id='" + k.StoreId + "' data_name='" + k.StoreName + "' data_distance='" + k.distance + "' data_score='" + k.Score + "' style='position:absolute;border-radius:6px ;width:90px;height:20px;text-align: center;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;font-size:12px;color:#666;left:50%;bottom:50px;margin-left:-45px;border-radio:25%;background: #fff;'>" + k.StoreName + "</span>" +
							//"<img class='shopIcon' src='" + iconUrl + "'/>"+
							"<i class='shopIcon" + Shopstatus + "' style='background: url(" + iconUrl + ");'></i>" +
							"</div>",
						"extData": {
							"id": k.StoreId,
							"name": k.StoreName,
							"status": Shopstatus,
							"distance": k.distance,
							"Score": k.Score,
							"ImgUrl": k.ImgUrl
							//"designerId": k.designerId
						},

					}) //marker end
					markers.push(marker);
				})
			} //else end
			log(mklog() + '【debug】ajax获取到地图上的点集合:' + r.data.length)

			if(markers.length) {
				log(mklog() + '【debug】点数量:' + markers.length)
				gdMap.addClusterToMap(markers) //执行一次
			}
		})

	},
	addClusterToMap: function(markers) {
		//		log(mklog() + '【debug】addClusterToMap(' + JSON.stringify(markers) + ')')
		//		var cluster = null;
		var mkStyles = [{
			url: "../../images/aMapMk/m1.svg", //样式1 <10的图片
			size: new AMap.Size(53, 53), //图标构造尺寸
			//AMap.Size(width: Number, height: Number)
			//构造尺寸对象。 参数width： 宽度， height： 长度， 单位： 像素；
			offset: new AMap.Pixel(-16, -30),
			textColor: '#FFF', //白色
			textSize: 14
		}, {
			url: "../../images/aMapMk/m1.svg", //样式2 >=10的图片
			size: new AMap.Size(56, 56),
			offset: new AMap.Pixel(-16, -30),
			textColor: '#000', //黑色
			textSize: 16
		}, {
			url: "../../images/aMapMk/m1.svg", //样式3 >=100的时的图片
			size: new AMap.Size(66, 66),
			offset: new AMap.Pixel(-24, -45),
			textColor: '#ff0', //黄色
			textSize: 18
		}]
		mapObj.plugin(["AMap.MarkerClusterer"], function() {
			//			log(mklog() + '【debug】AMap.MarkerClusterer(mapObj,' + JSON.stringify(markers) + ')')
			cluster = new AMap.MarkerClusterer(mapObj, markers, {
				styles: mkStyles
			})
			//			log(mklog() + '【debug】cluster=' + cluster)
			mui.each(cluster.getMarkers(), function(i, j) {
				AMap.event.addListener(j, 'click', function(e) {
					gdMapMarkerClick(this.getExtData())
				})
			})

		})
	},
	removeCityMarkers: function(markers) {
		log('清除地图上的' + markers.length + '个点')
		//		mapObj.remove(markers);
	}

} //gdMAP end

//点击图标事件
function gdMapMarkerClick(extData) {
	log(mklog() + '点击地图上的点:' + JSON.stringify(extData));
	plus.nativeUI.showWaiting('', waitingStyle);
	selectMaker = extData; //用于openwindow传参
	var status = selectMaker.status
	var mkid = selectMaker.id;
	if(mkid != undefined) { //防止点击当前位置
		render("#mainPopoverEl", "popoverTep1", extData);
		appUI.closeWaiting();
		mui('#mainPopoverEl').popover('show');
		//右上角关闭
		document.getElementById("close").addEventListener("tap", function() {
			mui('#mainPopoverEl').popover('hide');
		})
		//查看战帖
		//		document.getElementById("lookFight").addEventListener("tap",function(){
		//			mui('#mainPopoverEl').popover('hide');
		//			openNew("shopMatch.html",{
		//				storeid:this.dataset.id,
		//				shopname:this.dataset.shopname
		//			});
		//		})
	}
}