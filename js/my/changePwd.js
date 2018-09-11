mui.init();
mui.plusReady(function() {
	storage.init();
	var btn_ok = document.getElementById("btn_ok");
	var inpt_pwd = document.getElementById("pwd");
	var inpt_repwd = document.getElementById("repwd");

	//完成
	btn_ok.addEventListener("tap", function() {
		var val_pwdinpt = inpt_pwd.value;
		var val_repwdinpt = inpt_repwd.value;
		if(val_pwdinpt.trim() == "" || val_repwdinpt.trim() == "") {
			mui.toast("两次密码都不能为空");
		} else if(val_pwdinpt != val_repwdinpt) {
			mui.toast("两次密码不一致");
		} else if(val_pwdinpt.length < 6) {
			mui.toast("亲，密码不能少于6位");
		} else {
			appUI.showWaiting();
			appUI.setDisabled(btn_ok);
			request("/Player/editPlayerPwd", {
				playerid: storageUser.UId,
				newpwd: md5(val_pwdinpt || ""),
				repwd: md5(val_repwdinpt || ""),
			}, function(json) {
				appUI.closeWaiting();
				appUI.removeDisabled(btn_ok);
				if(json.code == 0) {
					var data = json.data;
					log(data);
					mui.toast(json.msg);
					mui.back();
				} else {
					mui.toast(json.msg);
				}
			});
		}

	});

});