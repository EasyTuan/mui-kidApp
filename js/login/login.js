var backid = "main.html";
var backurl = "../" + backid;

//mui.init({
//	beforeback: function() {
//		appPage.loginBack(backid,backurl)
//	}
//});
mui.plusReady(function() {

	initOauth();
	storage.init();

	backid = appPage.getParam("backid") || "main.html";
	backurl = "../" + backid;

	var btn_login = document.getElementById("btn_login");
	var inpt_mobile = document.getElementById("inpt_mobile");
	var inpt_pwd = document.getElementById("inpt_pwd");

	storageUser = kidstorageuser.getInstance();
	//	inpt_mobile.value = storageUser.UserName;

	//弹出软键盘
	//	var showKeyboard = function() {
	//		if(mui.os.ios) {
	//			var webView = plus.webview.currentWebview().nativeInstanceObject();
	//		    webView.plusCallMethod({"setKeyboardDisplayRequiresUserAction":false});
	//		    setTimeout(function(){
	//		    	storageUser.UserName==''?inpt_mobile.focus():inpt_pwd.focus();
	//		    },100);
	//		} else {
	//			var Context = plus.android.importClass("android.content.Context");
	//		    var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
	//		    var main = plus.android.runtimeMainActivity();
	//		    var imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
	//		    imm.toggleSoftInput(0,InputMethodManager.SHOW_FORCED);
	//		    setTimeout(function(){
	//		    	storageUser.UserName==''?inpt_mobile.focus():inpt_pwd.focus();
	//		    },100);
	//		}
	//	};
	//	showKeyboard();

	btn_login.addEventListener("tap", function() {
		//模拟登陆
		var data = {
			PlayerId: 1,
			Mobile: 13800000000,
			NickName: 'admin',
			imgurl: "../../images/defuser.jpg",
			SelfdomSign: '',
			//cityid:data.CityId
		}

		storageUser.login(data);
		storageUser.log();
		appPage.loginBack(backid, backurl);
		return;

		if(inpt_mobile.value.trim() == "") {
			appUI.showTopTip("请输入手机号");
			//mui.toast("请输入手机号");
			//inpt_mobile.focus();
		} else if(!ismobileno(inpt_mobile.value)) {
			appUI.showTopTip("手机号格式不正确");
			//mui.toast("手机号格式不正确");
		} else if(inpt_pwd.value.trim() == "") {
			appUI.showTopTip("请输入密码");
			//mui.toast("请输入密码");
			//inpt_pwd.focus();
		} else {

			var md5pwd = md5(inpt_pwd.value || "");
			appUI.setDisabled(btn_login);
			request("/Base/login", {
				mobile: inpt_mobile.value,
				pwd: md5pwd
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
			}, true, function() {
				appUI.removeDisabled(btn_login);
			});
		}
	});

	//注册
	document.getElementById("btn_reg").addEventListener("tap", function() {
		openNew("reg.html");
	});

	//忘记密码
	document.getElementById("btn_forgetpwd").addEventListener("tap", function() {
		openNew("forgetPwd.html");
	});
	//手机登录
	document.getElementById("btn_mobilelogin").addEventListener("tap", function() {
		openNew("mobileLogin.html", {
			backid: backid
		});
	});

})