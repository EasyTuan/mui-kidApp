mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: { //下拉刷新
			callback: pulldownRefresh,
			style: mui.os.android ? "circle" : "default"
			//auto: true
		}
	},
	beforeback: function() {
		appPage.closeLogin();
	}
});

mui.plusReady(function() {
	storage.init();
	//initPage();
	//	document.getElementById("test").addEventListener("tap", function() {
	//		openNew("test.html");
	//	});
	//监听退出,重新绑定检查登录事件
	window.addEventListener("loginOut", function(r) {
		setData();
	});
	window.addEventListener('initPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "不是新开的");
		setData();
	});
	window.addEventListener('refreshPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "刷新页面");
		initPage();
	});
	checkMsg();
	setInterval(function() {
		checkMsg();
	}, 5000);
});
//下拉刷新具体业务实现
function pulldownRefresh() {
	loadData();
}

function initPage() {
	setData();
	//appPage.closeLogin();
}

function setData() {
	storageUser = kidstorageuser.getInstance();
	var json = {};
	json.data = {
		UId: storageUser.UId,
		NickName: storageUser.NickName || "点我写昵称",
		ImgUrl: storageUser.ImgUrl,
		Signature: storageUser.Signature || "点我写签名",
		IsLogin: storageUser.IsLogin
	};

	render("#user_warp", "user_view", json);
	//注册通用事件
	appPage.registerCheckLoginEvent();
}

function loadData() {

	if(!storageUser.IsLogin) {
		appPage.endPullRefresh(true);
		return;
	}
	request("/Player/getPlayerIndexInfo", {
		playerid: storageUser.UId
	}, function(json) {
		if(json.code == 0) {
			if(json.data.ImgUrl != "") { //判断头像是否路径相同
				storageUser = kidstorageuser.getInstance();
				var arr = json.data.ImgUrl.split('/');
				var imgname = arr[arr.length - 1];
				var storageimgnamearr = storageUser.ImgUrl.split('/');
				var storageimgname = storageimgnamearr[storageimgnamearr.length - 1];
				log(imgname + "|" + storageimgname)
				if(imgname != storageimgname) { //本地图片名和网络图片名不同，显示为网络图，并下载
					//storageUser.refreshImgUrl(json.data.ImgUrl);//路径刷新为网络图片
					//下载网络图
					storageUser.downloadImg(json.data.ImgUrl);
				}
			}
			storageUser.login(json.data);
		}
		appPage.endPullRefresh();
		setData();
	}, false, function() {
		appPage.endPullRefresh();
	});

}
var loginEvent = {
	editSignature: function() {
		storageUser = kidstorageuser.getInstance();
		openNew("myEdit.html", {
			field: "signature",
			value: storageUser.Signature,
			backid: "my/user.html"
		});
	},
	editNickName: function() {
		storageUser = kidstorageuser.getInstance();
		openNew("myEdit.html", {
			field: "nickname",
			value: storageUser.NickName,
			backid: "my/user.html"
		});
	},
	myMsg: function() {
		openNew("myMsg.html");
	},
	myMatch: function() {
		openNew("myMatch.html");

	},
	myFriends: function() {
		openNew("myFriends.html");
	},
	myInfo: function() {
		openNew("myInfo.html");
	},
	mySetting: function() {
		openNew("mySetting.html");
	},
	upload_headimg: function() {
		openNew("uploadImg.html");
	}
}

function checkMsg() {
	if(storageUser.UId > 0) {
		//		request('/Player/getPlayerNoReadNotify', {
		//			playerid: storageUser.UId
		//		}, function(r) {
		//			r.code == 0 ? document.getElementById("msgStatus").setAttribute('class', 'redbadge') : document.getElementById("msgStatus").setAttribute('class', '')
		//		}, false, function() {}, false);
	}
}

//波浪线
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

requestAnimFrame = (function() {
	return function(callback) {
		setTimeout(callback, 18);
	};
})();

//初始角度为0  
var step = 90;
//定义三条不同波浪的颜色  
var lines = ["112,153,249, 0.7)",
	"rgba(112,153,249, 0.5)",
	"rgba(112,153,249, 0.7)",
	"rgba(112,153,249, 0.5)"
];

function loop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	step++;
	//画3个不同颜色的矩形  
	for(var j = lines.length - 1; j >= 0; j--) {
		ctx.fillStyle = lines[j];
		//每个矩形的角度都不同，每个之间相差45度  
		var angle = (step + j * 90) * Math.PI / 180;
		var deltaHeight = Math.sin(angle) * 50 + 30;
		var deltaHeightRight = Math.cos(angle) * 50 + 30;
		ctx.beginPath();
		ctx.moveTo(0, canvas.height / 2 + deltaHeight);
		ctx.bezierCurveTo(canvas.width / 2, canvas.height / 2 + deltaHeight, canvas.width / 2, canvas.height / 2 + deltaHeightRight, canvas.width, canvas.height / 2 + deltaHeightRight);
		ctx.lineTo(canvas.width, canvas.height);
		ctx.lineTo(0, canvas.height);
		ctx.lineTo(0, canvas.height / 2 + deltaHeight);
		ctx.closePath();
		ctx.fill();
	}
	requestAnimFrame(loop);
}
loop();