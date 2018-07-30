mui.init();
mui.plusReady(function() {
	storage.init();
	var btn_sendvalidcode = document.getElementById("btn_sendvalidcode");
	var btn_next = document.getElementById("btn_next");
	var inpt_mobile = document.getElementById("inpt_mobile");
	var inpt_validcode = document.getElementById("inpt_validcode");
	storageUser = kidstorageuser.getInstance();
	inpt_mobile.value = storageUser.UserName;

	if(ismobileno(inpt_mobile.value)) {
		appUI.removeDisabled(btn_sendvalidcode);
	}

	//	//输入手机号
	//	inpt_mobile.addEventListener("keyup", function() {
	//		btnDisabled(false);
	//	})
	//	//手机号失去焦点
	//	inpt_mobile.addEventListener("blur", function() {
	//		btnDisabled(false);
	//	})
	//	//输入验证码
	//	inpt_validcode.addEventListener("keyup", function() {
	//		btnDisabled(false);
	//	})
	//	//验证码失去焦点
	//	inpt_validcode.addEventListener("blur", function() {
	//		btnDisabled(false);
	//	})
	//发送验证码
	btn_sendvalidcode.addEventListener("tap", function() {
		if(inpt_mobile.value.trim() == "") {
			appUI.showTopTip("请输入手机号");
			//mui.toast("请输入手机号");
			//inpt_mobile.focus();
		} else if(!ismobileno(inpt_mobile.value)) {
			appUI.showTopTip("手机号格式不正确");
			//mui.toast("手机号格式不正确");
		} else {
			appUI.setDisabled(btn_sendvalidcode);
			request("/Base/sendCode", {
				mobile: inpt_mobile.value,
				type: "SMS1002"
			}, function(json) {
				appUI.showTopTip(json.msg);
				appUI.removeDisabled(btn_sendvalidcode);
				if(json.code == 0) {
					time(btn_sendvalidcode);
				}
			});
		}

	});

	//下一步
	btn_next.addEventListener("tap", function() {
		if(inpt_mobile.value.trim() == "") {
			appUI.showTopTip("请输入手机号");
			//mui.toast("请输入手机号");
			//inpt_mobile.focus();
		} else if(!ismobileno(inpt_mobile.value)) {
			appUI.showTopTip("手机号格式不正确");
			//mui.toast("手机号格式不正确");
		} else if(inpt_validcode.value.trim() == "") {
			appUI.showTopTip("请输入验证码");
			//mui.toast("请输入验证码");
			//inpt_pwd.focus();
		} else {
			appUI.setDisabled(btn_next);
			request("/Login/forgetPwd", {
				step: 1,
				mobile: inpt_mobile.value,
				verifycode: inpt_validcode.value
			}, function(json) {
				appUI.removeDisabled(btn_next);
				if(json.code == 0) {
					var data = json.data;
					log(data);
					openNew("setPwd.html", {
						mobile: inpt_mobile.value,
						type: "findpwd"
					});
				} else {
					appUI.showTopTip(json.msg);
					//mui.toast(json.msg);
				}
			});
		}
	});

	//帐号登录
	document.getElementById("btn_accountlogin").addEventListener("tap", function() {
		openNew("login.html");
	})

})

//function btnDisabled(isShowMsg) {
//	var btn_sendvalidcode = document.getElementById("btn_sendvalidcode");
//	var btn_next = document.getElementById("btn_next");
//	var val_mobileInpt = document.getElementById("inpt_mobile").value;
//	var val_validcodeInpt = document.getElementById("inpt_validcode").value;
//
//	var ck_ok = true,
//		ck_sendvalidcode = true;
//
//	if(val_mobileInpt.length != 11) {
//		if(isShowMsg)
//			appUI.showTopTip("手机号码长度不正确");
//		//mui.toast("手机号码长度不正确");
//		ck_ok = false;
//		ck_sendvalidcode = false;
//	} else if(!ismobileno(val_mobileInpt)) {
//		if(isShowMsg)
//			appUI.showTopTip("手机号码格式不正确");
//		//mui.toast("手机号码格式不正确");
//		ck_ok = false;
//		ck_sendvalidcode = false;
//	} else if(val_validcodeInpt.length != 6) {
//		if(isShowMsg)
//			appUI.showTopTip("验证码长度不正确");
//		//mui.toast("验证码长度不正确");
//		ck_ok = false;
//	}
//	if(ck_ok) {
//		appUI.removeDisabled(btn_next);
//	} else {
//		appUI.setDisabled(btn_next);
//	}
//	if(ck_sendvalidcode && btn_sendvalidcode.innerHTML.indexOf("重新") == -1) {
//		appUI.removeDisabled(btn_sendvalidcode);
//	} else {
//		appUI.setDisabled(btn_sendvalidcode);
//	}
//
//}