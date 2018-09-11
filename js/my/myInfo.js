var QrCodeUrl;
mui.init({
	beforeback: function() {
		appPage.closeLogin();
	}
});
mui.plusReady(function() {
	storage.init();
	initPage();
	mui("body").on("tap", ".myedit", function() {
		var val = this.getAttribute("data-val");
		var field = this.getAttribute("data-field");
		//log("我是"+field);
		var param = {
			field: field,
			value: val,
			backid: "my/myInfo.html"
		};
		//encodeURIComponent ()
		//log(url);
		openNew("myEdit.html", param);
	});

	//隐私设置
	document.getElementById("mySecurityCenter").addEventListener("tap", function() {
		openNew("myPrivateInfo.html");
	})

	//我的二维码
	mui("body").on("tap", "#myQRCode", function() {
		openNew("myQRCode.html", {
			url: QrCodeUrl
		});
	});
	window.addEventListener('initPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "不是新开的");
		//appPage.closeLogin();
		initPage();
	});
	window.addEventListener('refreshPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "刷新页面");
		initPage();
	});
	//appPage.closeLogin();
});

function initPage() {
	request("/Player/getPlayerInfo", {
		playerid: storageUser.UId,
		step: 1
	}, function(json) {
		if(json.code == 0) {
			if(json.data.Sex == 2) {
				json.data.SexName = "女";
			} else if(json.data.Sex == 1) {
				json.data.SexName = "男";
			}
			QrCodeUrl = json.data.QrCodeUrl;
			render("#myinfo_warp", "myinfo_view", json);

		} else {
			mui.toast(json.msg);
		}
	}, true);
}