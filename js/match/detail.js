var matchid, endtimer = true,
	desctype, btnsjson, iscreator = false;
mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: { //下拉刷新
			callback: pulldownRefresh,
			style: mui.os.android ? "circle" : "default"
			//auto: true
		}
	}
});

mui.previewImage();

var requestUrl = '/Player/getPlayerMatchDetail';

mui.plusReady(function() {
	storage.init();
	matchid = appPage.getParam("id");

	//判断从哪个页面来的
	if(storageUser.UId <= 0) {
		requestUrl = '/Match/getMatchDetail';
	}
	loadTipData();
	loadData();
	mui("#detail_warp").on("tap", ".userinfo", function() {
		var id = this.getAttribute("data-uid");
		openNew("../my/userInfo.html", {
			id: id
		});
	});
	mui("#detail_warp").on("tap", ".join", function() {
		if(json1.Status == 1) {
			if(json1.WhetherJoin == "N") {
				mui.confirm('是否加入该场比赛', '', ['否', '是'], function(e) {
					if(e.index == 1) {
						request("/Match/joinMatch", {
							playerid: storageUser.UId,
							matchid: matchid,
							lon: storageLocation.Lon,
							lat: storageLocation.Lat
						}, function(json) {
							if(json.code == 0) {
								mui.toast("加入成功");
								//mui.fire(plus.webview.getWebviewById('pk/pk.html'), 'uploadList');
								loadData();
							} else {
								mui.toast(json.msg);
							}
						});
					}
				})
			} else {
				appUI.showTopTip("您已经加入该比赛了~");
			}
		}

	});
	//加入比赛
	mui('#btn_warp').on('tap', '#btn_join', function() {
		var btnArray = ['否', '是'];
		mui.confirm('是否加入该场比赛', '', btnArray, function(e) {
			if(e.index == 1) {
				request("/Match/joinMatch", {
					playerid: storageUser.UId,
					matchid: matchid,
					lon: storageLocation.Lon,
					lat: storageLocation.Lat
				}, function(json) {
					if(json.code == 0) {
						mui.toast("加入成功");
						//mui.fire(plus.webview.getWebviewById('pk/pk.html'), 'uploadList');
						loadData();
					} else {
						mui.toast(json.msg);
					}
				});
			}
		})
	})

	//接受比赛
	mui('#btn_warp').on('tap', '#btn_accept', function() {
		var btnArray = ['否', '是'];
		mui.confirm('是否接受该场比赛', '', btnArray, function(e) {
			if(e.index == 1) {
				request("/Match/inviteMatchYorN", {
					playerid: storageUser.UId,
					matchid: matchid,
					type: 'Y',
					lon: storageLocation.Lon,
					lat: storageLocation.Lat
				}, function(r) {
					log(r);
					mui.toast(r.msg);
					//mui.fire(plus.webview.getWebviewById('pk/invitation.html'), 'uploadList');
					loadData();
				})
			}
		})
	})

	//拒绝比赛
	mui('#btn_warp').on('tap', '#btn_refuse', function() {
		var btnArray = ['否', '是'];
		mui.confirm('确定拒绝这场PK？', '', btnArray, function(e) {
			if(e.index == 1) {
				request("/Match/inviteMatchYorN", {
					playerid: storageUser.UId,
					matchid: matchid,
					type: 'N'
				}, function(r) {
					log(r);
					mui.toast(r.msg);
					//mui.fire(plus.webview.getWebviewById('pk/invitation.html'), 'uploadList');
					mui.back();
				})
			}
		})
	})
	//退出比赛
	mui('#btn_warp').on('tap', '#btn_out', function() {
		var btnArray = ['否', '是'];
		mui.confirm('确定退出这场PK？', '', btnArray, function(e) {
			if(e.index == 1) {
				request("/Player/exitPlayerMatch", {
					playerid: storageUser.UId,
					matchid: matchid
				}, function(json) {
					if(json.code == 0) {
						appUI.showTopTip("退出成功");
						loadData();
					} else {
						appUI.showTopTip(json.msg);
					}
				});
			}
		})
	})
	//删除比赛
	mui('#btn_warp').on('tap', '#btn_del', function() {
		var btnArray = ['否', '是'];
		mui.confirm('确定删除这场PK？', '', btnArray, function(e) {
			if(e.index == 1) {
				request("/Player/logicDelPlayerMatch", {
					playerid: storageUser.UId,
					matchid: matchid
				}, function(json) {
					if(json.code == 0) {
						appUI.showTopTip("删除成功");
						mui.back();
					} else {
						appUI.showTopTip(json.msg);
					}
				});
			}
		})
	});
	//返回
	mui('#btn_warp').on('tap', '#btn_back', function() {
		mui.back();
	})
	//前往我的比赛
	//	mui('#btn_warp').on('tap', '#btn_gomymatch', function() {
	//		openNew("../my/myMatch.html");
	//	})

	//关闭发起约战、预览约战页
	var _war = plus.webview.getWebviewById("pk/war.html");
	var _detail_war = plus.webview.getWebviewById("match/detail_war.html");
	//	setTimeout(function() {
	//		if(_war) {
	//			_war.close();
	//		}
	//		if(_detail_war) {
	//			_detail_war.close();
	//		}
	//	}, 300);

	//var old_back = mui.back;
	mui.back = function() {
		var ws = plus.webview.currentWebview();
		plus.webview.close(ws);
		if(_war) {
			_war.close();
		}
		if(_detail_war) {
			_detail_war.close();
		}
	}

	appPage.registerCheckLoginEvent();
})
var json1 = {};
//加载数据
function loadData() {
	request(requestUrl, {
		playerid: storageUser.UId,
		matchid: matchid
	}, function(json) {
		if(json.code == 0) {

			json1.Status = json.data.match.Status;
			json1.UpshotImg = json.data.match.UpshotImg;
			json1.WhetherJoin = json.data.match.WhetherJoin;
			document.getElementById("matchname").innerText = json.data.match.MatchName;

			var StatusName = "";
			if(json1.Status == 1) {
				StatusName = "报名中";
			} else if(json1.Status == 2) {
				StatusName = "比赛中";
			} else if(json1.Status == 3) {
				StatusName = "已满员";
			} else if(json1.Status == 4) {
				StatusName = "已结束";
			} else if(json1.Status == 5) {
				StatusName = "已取消";
			}
			document.getElementById("matchstatus").setAttribute("class", "matchstatus status" + json1.Status);
			document.getElementById("matchstatus").innerText = StatusName;
			json.data.match.StatusName = StatusName;
			//			json.data.player.shift();
			//			json.data.player.shift();
			//			json.data.player.push(json.data.player[0])
			//			json.data.player.push(json.data.player[0])
			//			json.data.player.push(json.data.player[0])
			//			json.data.player.push(json.data.player[0])
			//			json.data.player.push(json.data.player[0])
			//			json.data.player.push(json.data.player[0])
			//			json.data.player.push(json.data.player[0])
			if(json.data.match.IsFixed == "1" && json.data.player.length == 1 && json.data.fixeddata && json.data.fixeddata.PlayerId > 0) { //定向赛，玩家列表数量为1，则把被邀请人数据填充到玩家列表里
				json.data.fixeddata.IsNoJoin = true;
				json.data.player.push(json.data.fixeddata);
				//alert(JSON.stringify(json.data.player))
			}

			render("#detail_warp", "detail_view", json.data); //详细信息
			var divcont = document.getElementById("boxcont");
			divcont.setAttribute("style", "background-image: url(" + json.data.match.PKImgUrl + ");")
			if(json1.Status == 1) {
				var needDefJoinPlayer = json.data.match.PlayerMaxNum - json.data.player.length;
				//alert(needDefJoinPlayer)
				if(needDefJoinPlayer > 0) {
					var div;
					for(var i = 0; i < needDefJoinPlayer; i++) {
						div = document.createElement("div");
						div.className = "box join";
						div.innerHTML = '<div class="imgbox"><div class="imgbg"><i class="iconfont icon-increse1"></i></div></div>';
						divcont.appendChild(div);
					}
				}
			}
			if(json1.Status == 4 && json1.UpshotImg.length > 0) { //页面padding
				document.getElementById("pb").style.paddingBottom = "70px";
			} else {
				document.getElementById("pb").style.paddingBottom = "50px";
			}

			json1.IsCreater = storageUser.UId == parseInt(json.data.match.CreatorId);
			json1.CanDel = json.data.match.IsCanDel;
			json1.MatchCanDelTime = json.data.match.MatchCanDelTime;
			json1.InviteStatus = json.data.match.InviteStatus;
			json1.WhetherJoin = json.data.match.WhetherJoin;
			json1.PlayerJoinNum = json.data.match.PlayerJoinNum;
			json1.PlayerMinNum = json.data.match.PlayerMinNum;
			btnsjson = json1;
			iscreator = json1.IsCreater;
			render("#img_warp", "img_view", json1); //活动图片

			render("#btn_warp", "btn_view", json1); //底部按钮 

			if(json1.Status == 1) {
				if(json1.IsCreater) { //创建人
					var t = appUI.countDown(json1.MatchCanDelTime);
					log(JSON.stringify(t))
					if(t.minute != 0 && t.second != 0) { //需开启计时器
						endtimer = false;
						document.getElementById("desc").innerHTML = '删除倒计时：<i id="timer_m"></i>分<i id="timer_s"></i>秒';
						showCountDown(json1.MatchCanDelTime);
					}
				}

			}
			if(json.data.match.PlayerNumType == "max") {
				desctype = 1;
			} else {
				desctype = 2;
			}
			showDesc();

			appPage.endPullRefresh();
			calcPosition();
			appPage.imgInit();
		} else {
			mui.toast(json.msg);
		}
	}, true, function() {
		appPage.endPullRefresh();
	});
}
//倒计时显示
function showCountDown(data) {
	var timerobj, timer;
	timer = setInterval(function() {
		timerobj = appUI.countDown(data);
		//log(JSON.stringify(timerobj));
		if(timerobj.minute == "0" && timerobj.second == "0") { //倒计时结束
			endtimer = true;
			btnsjson.CanDel = false;
			render("#btn_warp", "btn_view", btnsjson); //底部按钮	
			var btn = document.getElementById("btn_del");
			if(btn) {
				btn.setAttribute("style", "");
			}
			window.clearInterval(timer); //清楚定时器
			showDesc(); //更新提示内容
			return;
		}
		document.getElementById("timer_m").innerText = timerobj.minute;
		document.getElementById("timer_s").innerText = timerobj.second;
	}, 1000);
}
//显示提示
function showDesc() {
	if(endtimer && iscreator) { //倒计时结束
		if(desctype == 1) {
			document.getElementById("desc").innerText = "提示：多人赛，参与人数少于2人时发起人不可退出";
		} else if(desctype == 2) {
			document.getElementById("desc").innerText = "提示：1vs1比赛，发起人不可退";
		}
	}
}
//加载滚动赛事tip
function loadTipData() {
	request("/Match/getMatchDetailRoll", {},
		function(json) {
			render("#tipscont_warp", "tipscont_view", json);
			appPage.imgInit();
			initTip();
		});
}
var tips, prevIndex = 0,
	prevTip, currTip, timer;
var showIndex = 1;
//滚动赛事tip
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
//下拉刷新具体业务实现
function pulldownRefresh() {
	loadData();
}
var ww = window.screen.width,
	boxarr, boxw, boxlen, item;
//计算位置
function calcPosition() {
	boxarr = document.getElementsByClassName("box");
	boxlen = boxarr.length;
	boxw = calcw();
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
var pkEvent = {
	goMyMatch: function() {
		openNew("../my/myMatch.html");
	}
};

//自定义监听刷新
window.addEventListener('uploadList', function(event) {
	matchid = event.detail.id;
	loadData();
})