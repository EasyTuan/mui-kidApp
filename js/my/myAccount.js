mui.init();

mui.plusReady(function() {
	storage.init();
	initPage();
	document.getElementById("bindMobile").addEventListener("tap", function() {
		openNew("bindMobile.html");
	})
	document.getElementById("changePwd").addEventListener("tap", function(e) {
		e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var btnArray = ['取消', '确定'];
		mui.prompt('为保障您的帐号安全，修改密码前请输入原密码：', '原密码', '验证原密码', btnArray, function(e) {
			if(e.index == 1) {
				var md5pwd = md5(e.value || "");
				request("/Player/checkPlayerOldPwd", {
					playerid: storageUser.UId,
					oldpwd: md5pwd
				}, function(json) {
					if(json.code == 0) {
						openNew("changePwd.html");
					} else {
						mui.alert('密码错误，请重新输入。如果忘记密码，可通过短信验证登录APP后重新设置密码', function() {

						});
						//mui.toast(json.msg);
					}
				});

			} else {
				//mui.toast("取消");

			}
		}, "div")
		document.querySelector('.mui-popup-input input').type = 'password';
	})
	document.getElementById("mySecurityCenter").addEventListener("tap", function() {
		openNew("mySecurityCenter.html");
	})

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
})

function initPage() {
	storageUser = kidstorageuser.getInstance();
	document.getElementById("span_nickname").innerText = storageUser.NickName;
	document.getElementById("span_mobile").innerText = storageUser.Mobile;
}