function initOauth() {
	//第三方登录
	var authBtns = ['weixin', 'qq']; //配置业务支持的第三方登录
	var auths = {};
	var oauthArea = document.querySelector('#oauth-area');
	//	log(storage.length);
	//	storage.clear();
	//	log(storage.length);
	//	for(var i = 0, len = storage.length; i < len; i++) {
	//		var key = storage.key(i);
	//		var value = storage.getItem(key);
	//		log(key + "=" + value);
	//	}

	//log(settings);
	plus.oauth.getServices(function(services) {
		for(var i in services) {
			var service = services[i];
			auths[service.id] = service;
			if(~authBtns.indexOf(service.id)) {
				var isInstalled = plusIsInstalled(service.id);

				service.logout(function(e) {
					log("注销成功")
				}, function(e) {
					log("注销失败")
				});

				var btn = document.createElement('div');
				var name = service.id.replace("weixin", "wechat");
				//如果微信未安装，则为不启用状态
				btn.setAttribute('class', 'oauth-btn' + ' ' + name + (!isInstalled && service.id === 'weixin' ? (' disabled') : ''));
				btn.authId = service.id;
				var span = document.createElement('span');
				span.setAttribute("class", "iconfont icon-" + name);
				btn.appendChild(span);
				oauthArea.appendChild(btn);
			}
		}

		//		for(var i in auths) {
		//			var auth = auths[i];
		////auth.getUserInfo(function() {
		////	log(JSON.stringify(auth.userInfo));
		////});
		//
		//
		//			auth.logout(function(e) {
		//				log(i + "注销成功")
		//			}, function(e) {
		//				log(i + "注销失败")
		//			});
		//
		//		}
		var thirdpartyid = 1,
			userinfo, authinfo, imgurl, nickname;
		var backid = "main.html";
		var backurl = "../" + backid;
		backid = appPage.getParam("backid") || "main.html";
		backurl = "../" + backid;
		mui(oauthArea).on('tap', '.oauth-btn', function() {
			if(this.classList.contains('disabled')) {
				plus.nativeUI.toast('您尚未安装微信客户端');
				return;
			}

			log(JSON.stringify(localStorage));

			var auth = auths[this.authId];

			//appUI.showWaiting();
			auth.login(function() {
				if(auth.id == "qq") {
					thirdpartyid = 1;
				} else {
					thirdpartyid = 2;
				}
				log(JSON.stringify(auth))
				//appUI.closeWaiting();
				plus.nativeUI.toast("登录认证成功");
				auth.getUserInfo(function() {
					authinfo = auth.authResult;
					userinfo = auth.userInfo;
					imgurl = thirdpartyid == 1 ? userinfo.figureurl_qq_2 : userinfo.ImgUrl;
					nickname = userinfo.nickname;
					if(userinfo) { //获取到信息
						request("/Base/loginThirdParty", {
							ThirdPartyId: thirdpartyid,
							OpenId: authinfo.openid
						}, function(json) {
							if(json.code == 0) {
								var data = json.data;
								log(data);
								storageUser.login(data);
								storageUser.log();
								appPage.loginBack(backid, backurl);

							} else {
								openNew("thirdReg.html", {
									backid: backid,
									openid: authinfo.openid,
									thirdpartyid: thirdpartyid,
									imgurl: imgurl,
									nickname: nickname,
									memo: JSON.stringify(userinfo)
								})
								//appUI.showTopTip(json.msg);
							}
						});
					}
					//log(JSON.stringify(auth.userInfo));

					plus.nativeUI.toast("获取用户信息成功");
					var name = auth.userInfo.nickname || auth.userInfo.name;
					log(JSON.stringify(auth.userInfo));
				}, function(e) {
					plus.nativeUI.toast("获取用户信息失败：" + e.message);
				});
			}, function(e) {
				//appUI.closeWaiting();
				plus.nativeUI.toast("登录认证失败：" + e.message + "，可能您的手机不支持啊...");
			});
		});
	}, function(e) {
		oauthArea.style.display = 'none';
		plus.nativeUI.toast("获取登录认证失败：" + e.message);
	});
}