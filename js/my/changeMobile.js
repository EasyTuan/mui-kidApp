mui.init({
	beforeback: function() {
		var backid = "my/bindMobile.html";
		var backurl = backid.replace("my/", "");
		var backpage = plus.webview.getWebviewById(backid);
		log("backid=" + backid + " backurl" + backurl);
		if(backpage) {
			mui.fire(backpage, 'initPage')
		}
	}
});
mui.plusReady(function() {
	storage.init();
	initPage();
	var btn_sendvalidcode = document.getElementById("btn_sendvalidcode");
	var btn_ok = document.getElementById("btn_ok");
	var inpt_mobile = document.getElementById("inpt_mobile");
	var inpt_validcode = document.getElementById("inpt_validcode");

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
				type: "SMS1004"
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
	btn_ok.addEventListener("tap", function() {
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
			appUI.setDisabled(btn_ok);
			request("/Player/editPlayerMobile", {
				playerid: storageUser.UId,
				newmobile: inpt_mobile.value,
				verifycode: inpt_validcode.value
			}, function(json) {
				appUI.removeDisabled(btn_ok);
				if(json.code == 0) {
					storageUser.refreshMobile(inpt_mobile.value);
					mui.toast(json.msg);
					mui.back();
				} else {
					mui.toast(json.msg);
				}
			});
		}

	})
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
});

function initPage() {
	storageUser = kidstorageuser.getInstance();
	document.getElementById("span_mobile").innerText = storageUser.Mobile;
}
//function btnDisabled(isShowMsg) {
//	var btn_sendvalidcode = document.getElementById("btn_sendvalidcode");
//	var btn_ok = document.getElementById("btn_ok");
//	var val_mobileinpt = document.getElementById("inpt_mobile").value;
//	var val_validcodeinpt = document.getElementById("inpt_validcode").value;
//	var ckb_agree = document.getElementById("ckb_agree");
//
//	var ck_ok = true,
//		ck_sendvalidcode = true;
//
//	if(val_mobileinpt.length != 11) {
//		if(isShowMsg)
//			mui.toast("手机号码长度不正确");
//		ck_ok = false;
//		ck_sendvalidcode = false;
//	} else if(!ismobileno(val_mobileinpt)) {
//		if(isShowMsg)
//			mui.toast("手机号码格式不正确");
//		ck_ok = false;
//		ck_sendvalidcode = false;
//	} else if(val_validcodeinpt.length != 6) {
//		if(isShowMsg)
//			mui.toast("验证码长度不正确");
//		ck_ok = false;
//	}
//	if(ck_ok) {
//		appUI.removeDisabled(btn_ok);
//	} else {
//		appUI.setDisabled(btn_ok);
//	}
//
//	if(ck_sendvalidcode) {
//		appUI.removeDisabled(btn_sendvalidcode);
//	} else {
//		appUI.setDisabled(btn_sendvalidcode);
//	}
//
//}