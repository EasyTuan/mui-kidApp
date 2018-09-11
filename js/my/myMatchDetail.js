var matchid, endtimer = true,
	desctype, btnsjson;
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

mui.plusReady(function() {
	storage.init();
	matchid = appPage.getParam("id");
	loadData();
	mui("#detail_warp").on("tap", ".userinfo", function() {
		var id = this.getAttribute("data-uid");
		openNew("userInfo.html", {
			id: id
		});
	});
})
//calcPosition();

function loadData() {
	request("/Player/getPlayerMatchDetail", {
		playerid: storageUser.UId,
		matchid: matchid
	}, function(json) {
		if(json.code == 0) {

			var json1 = {};
			json1.Status = json.data.match.Status;
			json1.UpshotImg = json.data.match.UpshotImg;
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

			render("#detail_warp", "detail_view", json.data); //详细信息

			if(json1.Status == 4 && json1.UpshotImg.length > 0) { //页面padding
				document.getElementById("pb").style.paddingBottom = "150px";
			} else {
				document.getElementById("pb").style.paddingBottom = "60px";
			}
			json1.IsCreater = json.data.match.CreatorId;
			json1.CanDel = json.data.match.IsCanDel;
			json1.MatchCanDelTime = json.data.match.MatchCanDelTime;
			btnsjson = json1;
			render("#img_warp", "img_view", json1); //活动图片
			mui.previewImage();
			render("#btn_warp", "btn_view", json1); //底部按钮

			var btn = document.getElementById("btn");
			if(btn) {
				btn.setAttribute("disabled", "disabled");
				if(json1.IsCreater && json1.CanDel) { //创建人可删除
					btn.removeAttribute("disabled");
					btn.addEventListener("tap", function() { //删除
						del();
					})
				} else if(json1.Status == 1) { //可退出
					btn.removeAttribute("disabled");
					btn.addEventListener("tap", function() { //退出
						out();
					})
				}
			}
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
			appPage.imgInit();
			appPage.endPullRefresh();
			calcPosition();

			var json2 = {}; //滚动动态数据
			json2.MatchTips = [{
					MatchId: 1,
					ImgUrl: "",
					PlayerName: "小王",
					CreatorName: "萧萧",
					Type: 1
				},
				{
					MatchId: 1,
					ImgUrl: "",
					PlayerName: "小长",
					CreatorName: "就开了",
					Type: 2
				},
				{
					MatchId: 1,
					ImgUrl: "",
					PlayerName: "小说",
					CreatorName: "蓝桑坤",
					Type: 2
				},
				{
					MatchId: 1,
					ImgUrl: "",
					PlayerName: "小王",
					CreatorName: "去问问",
					Type: 1
				}

			];

			render("#tipscont_warp", "tipscont_view", json2);
			initTip();

		} else {
			mui.toast(json.msg);
		}
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
			document.getElementById("btn").removeAttribute("disabled");
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
	if(endtimer) { //倒计时结束
		if(desctype == 1) {
			document.getElementById("desc").innerText = "提示：多人赛，参与人数少于2人时发起人不可退出";
		} else if(desctype == 2) {
			document.getElementById("desc").innerText = "提示：1vs1比赛，发起人不可退";
		}
	}
}
//删除比赛
function del() {
	var btnArray = ['否', '是'];
	mui.confirm('宝宝，要取消比赛？点“是”就真的取消了哦:-O', '', btnArray, function(e) {
		if(e.index == 1) {
			request("/Player/logicDelPlayerMatch", {
				playerid: storageUser.UId,
				matchid: matchid
			}, function(json) {
				if(json.code == 0) {
					mui.toast("删除成功");
					mui.back();
				} else {
					mui.toast(json.msg);
				}
			});
		}
	})
}
//退出比赛
function out() {
	var btnArray = ['否', '是'];
	mui.confirm('宝宝，我们不比赛了？点“是”就真的退出了哦:-O', '', btnArray, function(e) {
		if(e.index == 1) {
			request("/Player/exitPlayerMatch", {
				playerid: storageUser.UId,
				matchid: matchid
			}, function(json) {
				if(json.code == 0) {
					mui.toast("退出成功");
					mui.back();
				} else {
					mui.toast(json.msg);
				}
			});
		}
	})
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