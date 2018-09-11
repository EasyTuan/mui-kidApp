mui.init();
mui.plusReady(function() {
	storage.init();
	var btn_ok = document.getElementById("btn_ok");
	var inpt_pwd = document.getElementById("pwd");
	var inpt_repwd = document.getElementById("repwd");
	var inpt_nickname = document.getElementById("nickname");
	var type = appPage.getParam("type");
	if(type == "findpwd") {
		document.getElementById("nicknamewarp").style.display = "none";
	} else {
		document.getElementById("nicknamewarp").removeAttribute("style");
	}
	//完成
	btn_ok.addEventListener("tap", function() {
		var val_pwdinpt = inpt_pwd.value;
		var val_repwdinpt = inpt_repwd.value;
		var val_nickname = inpt_nickname.value;
		var url, ck = true;
		if(type == "reg") {
			url = "/Login/submitReg";

			if(val_nickname.trim() == "") {
				ck = false;
				appUI.showTopTip("昵称不能为空");
				//mui.toast("昵称不能为空");
				return false;
			}

		} else if(type == "findpwd") {
			url = "/Login/forgetPwd";
		}
		if(val_pwdinpt.trim() == "" || val_repwdinpt.trim() == "") {
			appUI.showTopTip("两次密码都不能为空");
			//mui.toast("两次密码都不能为空");
		} else if(val_pwdinpt != val_repwdinpt) {
			appUI.showTopTip("两次密码不一致");
			//mui.toast("两次密码不一致");
		} else if(val_pwdinpt.length < 6) {
			appUI.showTopTip("亲，密码不能少于6位");
			//mui.toast("亲，密码不能少于6位");
		} else {
			appUI.setDisabled(btn_ok);

			request(url, {
				step: 2,
				mobile: appPage.getParam("mobile"),
				pwd: md5(val_pwdinpt || ""),
				repwd: md5(val_repwdinpt || ""),
				nickname: val_nickname,
				cityid: storageLocation.CityId
			}, function(json) {
				appUI.removeDisabled(btn_ok);
				if(json.code == 0) {
					var data = json.data;
					log(data);
					openNew("login.html");
				} else {
					appUI.showTopTip(json.msg);
					//mui.toast(json.msg);
				}
			});
		}

	});

});