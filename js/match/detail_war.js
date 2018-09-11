var desctype, btnsjson;
mui.init();

mui.plusReady(function() {
	storage.init();
	loadTipData();
	loadData();
})

var desctype = '';

function loadData() {
	storage.init();
	var json = {};
	var datastr = appPage.getParam("data");
	json.data = JSON.parse(datastr);
	log(JSON.stringify(json))
	var lon = storageLocation.Lon;
	var lat = storageLocation.Lat;

	//logo
	document.getElementsByClassName("container")[0].style.backgroundImage = 'url(' + json.data.imgurl + ')';

	//alert("人生处处是PK🙂😳😙")
	//alert(escape(json.data.matchname))
	document.getElementById("matchname").innerText = json.data.matchname;
	document.getElementById("matchslogan").innerText = json.data.slogan;
	document.getElementById("matchtime").innerText = json.data.matchtime;
	document.getElementById("matchstore").innerText = json.data.storename;
	document.getElementById("matchaddress").innerText = json.data.storeaddressstr;
	desctype = json.data.matchplayernum == "solo" ? 2 : 1;
	var len = (desctype == 1) ? 10 : 2;
	var div, divcont = document.getElementById("boxcont");
	for(var i = 0; i < len; i++) {
		div = document.createElement("div");
		div.className = "box";
		if(i == 0) {
			div.innerHTML = '<div class="imgbox"><img class="loadthumb" data-url="' + storageUser.ImgUrl + '"  data-wh="128,128"/></div><span>' + storageUser.NickName + '</span>';
			log(div.innerHTML)
		} else {
			try {
				if(json.data.friendid) {
					div.innerHTML = '<div class="imgbox ' + (json.data.matchplayernum == "solo" ? "op" : "") + '"><img class="loadthumb" data-url="' + json.data.friendheadimg + '"  data-wh="128,128"/></div><span>' + json.data.friendNickName + '</span>';
				} else {
					div.innerHTML = '<div class="imgbox"><div class="imgbg"><i class="iconfont icon-increse1"></i></div></div>';
				}
			} catch(e) {
				div.innerHTML = '<div class="imgbox"><div class="imgbg"><i class="iconfont icon-increse1"></i></div></div>';
			}

		}
		//alert(div.innerHTML);
		divcont.appendChild(div);
	}
	appPage.imgInit();
	showDesc();
	calcPosition();
	//打开第三方地图
	//	document.getElementById("openmap").addEventListener("tap", function() {
	//		
	//		if('Android' === plus.os.name && navigator.userAgent.indexOf('StreamApp') > 0) {
	//			plus.nativeUI.toast('当前环境暂不支持地图插件');			
	//			return;
	//		}
	//		// 设置目标位置坐标点和其实位置坐标点
	//		var dst = new plus.maps.Point(116.39131928, 39.90793074); // 天安门 
	//		var src = new plus.maps.Point(116.335, 39.966); // 大钟寺
	//		
	//		// 调用系统地图显示 
	//		plus.maps.openSysMap(dst, "天安门", src);
	//	});
	//完成
	var pkType = 1;
	document.getElementById("btn_save").addEventListener("tap", function() {
		var btnArray = ['否', '是'];
		mui.confirm('确定要发起这场对战吗？', '', btnArray, function(e) {
			if(e.index == 1) {
				if(pkType == 1) {
					pkType = 0;
					if(desctype == 1) {
						request("/Match/addMatch", {
							playerid: storageUser.UId,
							lon: json.data.lon,
							lat: json.data.lat,
							brandid: json.data.brandid,
							matchname: json.data.matchname,
							storeid: json.data.storeid,
							slogan: json.data.slogan,
							matchtime: json.data.matchtime + ':00',
							matchplayernum: json.data.matchplayernum
						}, function(json) {
							if(json.code == 0) {
								openNew("../match/detail.html", {
									id: json.data.MatchId,
								});
							} else {
								appUI.showTopTip(json.msg);
							}
						})
					} else {
						request("/Match/addMatch", {
							playerid: storageUser.UId,
							lon: json.data.lon,
							lat: json.data.lat,
							brandid: json.data.brandid,
							matchname: json.data.matchname,
							storeid: json.data.storeid,
							slogan: json.data.slogan,
							matchtime: json.data.matchtime + ':00',
							matchplayernum: json.data.matchplayernum,
							friendid: json.data.friendid,
							type: 'player'
						}, function(json) {
							if(json.code == 0) {
								openNew("../match/detail.html", {
									id: json.data.MatchId,
								});
							} else {
								appUI.showTopTip(json.msg);
							}
						})
					}
				}
				setTimeout(function() {
					pkType = 1;
				}, 1000)

			}
		})

	})
	//返回编辑
	document.getElementById("btn_back").addEventListener("tap", function() {
		mui.back();
	});

}

//显示提示
function showDesc() {
	if(desctype == 1) {
		document.getElementById("desc").innerText = "提示：多人赛，参与人数少于2人时发起人不可退出";
	} else if(desctype == 2) {
		document.getElementById("desc").innerText = "提示：1vs1比赛，发起人不可退";
	}
}

var tips, prevIndex = 0,
	prevTip, currTip, timer;
var showIndex = 1;
//赛事tip
function initTip() {
	tips = document.getElementById("tipscont_warp").querySelectorAll("div");
	tips[0].setAttribute("class", "active");
	//log(tips.length)
	timer = setInterval(function() {

		showTip(showIndex);
		showIndex++;

		if(showIndex == tips.length) {
			showIndex = 0;
		}

	}, 3000);
}
//加载滚动赛事tip
function loadTipData() {
	request("/Match/getMatchDetailRoll", {},
		function(json) {
			render("#tipscont_warp", "tipscont_view", json);
			initTip();
			appPage.imgInit();
		});
}
//赛事tip显示
function showTip(index) {
	prevTip = tips[prevIndex];
	prevTip.setAttribute("class", "activeend");

	currTip = tips[index];
	currTip.setAttribute("class", "");
	currTip.setAttribute("class", "active");
	//log(prevIndex + "," + index)
	document.getElementById("tipscont_warp").style.marginTop = "-" + ((34 * (index - 1))) + "px";

	prevIndex = index;
}
var ww = window.innerWidth, // window.screen.width,
	boxarr, boxw, boxlen, item;

//计算位置
function calcPosition() {
	boxarr = document.getElementsByClassName("box");
	boxlen = boxarr.length;
	boxw = calcw();
	//log(boxlen+","+boxw)
	//半径
	var radius = ww * 0.5 - boxw / 2;
	//每一个BOX对应的角度
	var avd = 360 / boxlen;
	//每一个BOX对应的弧度
	var ahd = -avd * Math.PI / 180;
	//中心点横坐标
	var dotLeft = ww * 0.5 - boxw / 2;
	//中心点纵坐标
	var dotTop = ww * 0.5 - boxw / 2;
	//起始角度
	var start = ahd * parseInt(boxlen / 2);
	if(boxlen == 1) {
		item = boxarr[0];
		item.style.width = boxw + "px";
		item.style.height = boxw + "px";
		item.style.left = ((ww - boxw) / 2) + "px";
		item.style.top = "0px";
	} else {
		for(var i = 0; i < boxlen; i++) {
			item = boxarr[i];
			item.style.width = boxw + "px";
			item.style.height = boxw + "px";
			item.style.left = Math.sin((ahd * i) + start) * radius + dotLeft + "px";
			item.style.top = Math.cos((ahd * i) + start) * radius + dotTop + "px";
		}
	}
}

//box 长宽计算
function calcw() {
	var num = boxlen;
	if(num > 4) {
		return ww / 4 - (num - 4) * 5 + 30;
	} else {
		return ww / 4 + 30;
	}
}