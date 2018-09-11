var backid = "main.html";
var backurl = "../" + backid;
//mui.init({
//	beforeback: function() {
//		appPage.loginBack(backid,backurl)
//	}
//});
mui.plusReady(function() {

	initOauth(); //初始化第三方登录
	storage.init(); //初始化本地缓存对象
	backid = appPage.getParam("backid") || "main.html";
	backurl = "../" + backid;

	var btn_sendvalidcode = document.getElementById("btn_sendvalidcode");
	var btn_login = document.getElementById("btn_login");
	var inpt_mobile = document.getElementById("inpt_mobile");
	var inpt_validcode = document.getElementById("inpt_validcode");
	storageUser = kidstorageuser.getInstance();
	inpt_mobile.value = storageUser.Mobile;

	//	if(ismobileno(inpt_mobile.value)) {
	//		appUI.removeDisabled(btn_sendvalidcode);
	//	}

	//	//输入手机号
	//	inpt_mobile.addEventListener("keyup", function() {
	//		btnDisabled(false);
	//	})
	//	//输入手机号
	//	inpt_mobile.addEventListener("focus", function() {
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
			appUI.showWaiting();
			appUI.setDisabled(btn_sendvalidcode);
			request("/Base/sendCode", {
				mobile: inpt_mobile.value,
				type: "SMS1003"
			}, function(json) {
				appUI.showTopTip(json.msg);
				appUI.closeWaiting();
				appUI.removeDisabled(btn_sendvalidcode);
				if(json.code == 0) {
					time(btn_sendvalidcode);
				}
			});
		}
	});

	//登录按钮
	btn_login.addEventListener("tap", function() {

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
			appUI.setDisabled(btn_login);
			request("/Base/loginViaSms", {
				mobile: inpt_mobile.value,
				verifycode: inpt_validcode.value
			}, function(json) {
				appUI.removeDisabled(btn_login);
				if(json.code == 0) {
					var data = json.data;
					log(data);
					storageUser.login(data);
					storageUser.log();
					appPage.loginBack(backid, backurl);
				} else {
					appUI.showTopTip(json.msg);
					//mui.toast(json.msg);
				}
			});
		}
	});

	//注册
	document.getElementById("reg").addEventListener("tap", function() {
		openNew("reg.html");
	});

	//帐号登录
	document.getElementById("btn_accountlogin").addEventListener("tap", function() {
		openNew("login.html");
	})

})

//function btnDisabled() {
//	var btn_sendvalidcode = document.getElementById("btn_sendvalidcode");
//	var btn_ok = document.getElementById("btn_login");
//	var val_mobileInpt = document.getElementById("inpt_mobile").value;
//	var val_validcodeInpt = document.getElementById("inpt_validcode").value;
//
//	var ck_ok = true,
//		ck_sendvalidcode = true;
//
//	if(val_mobileInpt.length != 11) {		
//		ck_ok = false;
//		ck_sendvalidcode = false;
//	} else if(!ismobileno(val_mobileInpt)) {		
//		ck_ok = false;
//		ck_sendvalidcode = false;
//	} else if(val_validcodeInpt.length != 6) {
//		if(isShowMsg)
//			appUI.showTopTip("验证码长度不正确");
//		//mui.toast("验证码长度不正确");
//		ck_ok = false;
//	}
//	if(ck_ok) {
//		appUI.removeDisabled(btn_ok);
//	} else {
//		appUI.setDisabled(btn_ok);
//	}
//
//	if(ck_sendvalidcode && btn_sendvalidcode.innerHTML.indexOf("重新") == -1) {
//		appUI.removeDisabled(btn_sendvalidcode);
//	} else {
//		appUI.setDisabled(btn_sendvalidcode);
//	}
//
//}