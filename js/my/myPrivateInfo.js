var auths = {};
mui.init();
mui.plusReady(function() {

	storage.init();
	initPage();
	//详情
	mui("body").on("tap", ".myedit", function() {
		var val = this.getAttribute("data-val");
		var field = this.getAttribute("data-field");
		var param = {
			field: field,
			value: val,
			backid: "my/myPrivateInfo.html"
		};
		openNew("myEdit.html", param);
	});
	plus.oauth.getServices(function(services) {

		var authBtns = ['weixin', 'qq'],
			qqinstall = false,
			wxinstall = false;
		for(var i in services) {
			var service = services[i];
			auths[service.id] = service;
			if(~authBtns.indexOf(service.id)) {

				var isInstalled = plusIsInstalled(service.id);

				if(service.id == "qq" && isInstalled) {
					qqinstall = true;
				}
				if(service.id == "weixin" && isInstalled) {
					wxinstall = true;
				}

				service.logout(function(e) {
					log(service.id + "注销成功")
				}, function(e) {
					log(service.id + "注销失败")
				});

				log(service.id + "," + isInstalled + "," + qqinstall + "," + wxinstall)
			}
		}
		mui("#myprivateinfo_warp").on('tap', '.oauth', function() {
			var btnArray = ['否', '是'];
			//			mui.confirm('退出后您将不能查看个人数据，确定退出？', '', btnArray, function(e) {
			//				if(e.index == 1) {
			//					
			//				}
			//			});
			var id = this.getAttribute("data-id");
			if(id == "qq" && !qqinstall) {
				plus.nativeUI.toast('您尚未安装QQ客户端');
				return;
			} else if(id == "weixin" && !wxinstall) {
				plus.nativeUI.toast('您尚未安装微信客户端');
				return;
			}

			//auth.logout(function(e) {
			oauthlogin(id);
			//			}, function(e) {
			//				appUI.closeWaiting();
			//				log(auth.id + "注销失败")
			//				log(JSON.stringify(e))
			//			});

		});

	});

	window.addEventListener('initPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "不是新开的");

		initPage();
	});
	window.addEventListener('refreshPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "刷新页面");
		initPage();
	});

	//隐私设置
	//	document.getElementById("mySecurityCenter").addEventListener("tap", function() {
	//		openNew("myPrivateInfo.html");
	//	})
});

function initPage() {
	request("/Player/getPlayerInfo", {
		playerid: storageUser.UId,
		step: 2
	}, function(json) {
		if(json.code == 0) {
			json.data.ProvinceId = json.data.ProvinceId || 0;
			json.data.CityId = json.data.CityId || 0;
			json.data.DistrictId = json.data.DistrictId || 0;
			json.data.QQ = json.data.BindQQ == "Y" ? "已绑定" : "未绑定";
			json.data.WeChat = json.data.BindWeChat == "Y" ? "已绑定" : "未绑定";
			render("#myprivateinfo_warp", "myprivateinfo_view", json);

		} else {
			mui.toast(json.msg);
		}
	}, true);
}

function oauthlogin(id) {
	appUI.showWaiting();
	var auth = auths[id];
	var thirdpartyid = 1,
		userinfo, authinfo, imgurl, nickname;
	auth.login(function() {
		if(auth.id == "qq") {
			thirdpartyid = 1;
		} else {
			thirdpartyid = 2;
		}
		log(JSON.stringify(auth))
		appUI.closeWaiting();
		//plus.nativeUI.toast("登录认证成功");
		auth.getUserInfo(function() {
			authinfo = auth.authResult;
			userinfo = auth.userInfo;
			imgurl = thirdpartyid == 1 ? userinfo.figureurl_2 : userinfo.ImgUrl;
			nickname = userinfo.nickname;
			if(userinfo) { //获取到信息
				request("/Base/UpdateThirdParty", {
					PlayerId: storageUser.UId,
					ThirdPartyId: thirdpartyid,
					OpenId: authinfo.openid,
					Memo: JSON.stringify(userinfo)
				}, function(json) {
					appUI.showTopTip(json.msg);
					if(json.code == 0) {
						initPage();
					} else {

					}
				});
			}

		}, function(e) {
			appUI.closeWaiting();
			plus.nativeUI.toast("获取用户信息失败：" + e.message);
		});
	}, function(e) {
		appUI.closeWaiting();
		plus.nativeUI.toast("登录认证失败：" + e.message);
	});
}