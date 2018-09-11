mui.init();

var subPages = ["bbs/bbsIndex.html", "bbs/bbsChannel.html"];
var subPageStyle = {
	top: '50px',
	bottom: '0'
}

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	for(var i = 0; i < subPages.length; i++) {
		var sub = plus.webview.create(subPages[i].replace("bbs/", ""), subPages[i], subPageStyle);
		self.append(sub);
	}
	plus.webview.show(subPages[0]);

	//底部切換
	var activeTab = subPages[0];
	var targetTab = '';
	mui('.mui-bar-tab').on('tap', 'a', function(e) {
		targetTab = this.dataset.href;
		if(targetTab == activeTab) {
			return;
		}
		plus.webview.show(targetTab);
		//隐藏当前;
		plus.webview.hide(activeTab);
		//更改当前活跃的选项卡
		activeTab = targetTab;
	});

	//前往频道
	window.addEventListener('goChannel', function() {
		mui('.mui-tab-item').each(function() {
			this.setAttribute('class', 'mui-tab-item');
		})
		document.getElementById("bbsChannel").setAttribute('class', 'mui-tab-item mui-active');
		plus.webview.show(subPages[1]);
		//隐藏当前;
		plus.webview.hide(activeTab);
		//更改当前活跃的选项卡
		activeTab = subPages[1];
	})

	//搜索
	document.getElementById("searchBtn").addEventListener('tap', function() {
		openNew('bbsSearch.html');
	})

})