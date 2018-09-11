mui.init()

var storeid = '';

mui.plusReady(function() {
	storage.init();
	var self = plus.webview.currentWebview();
	storeid = self.info.storeid;

	request('/Store/getStorePlayerRanking', {
		storeid: storeid,
		playerid: storageUser.UId
	}, function(r) {
		log(r);
		r.code == 0 ? render('#rank', 'rankTep1', r) : appUI.showTopTip(r.msg);
		appPage.imgInit();
	}, true)

})