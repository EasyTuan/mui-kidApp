mui.init({
	beforeback: function() {
		var backid = "my/myAccount.html";
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
	document.getElementById("changeMobile").addEventListener("tap", function() {
		openNew("changeMobile.html");
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
})

function initPage() {
	storageUser = kidstorageuser.getInstance();
	document.getElementById("span_mobile").innerText = storageUser.Mobile;
}