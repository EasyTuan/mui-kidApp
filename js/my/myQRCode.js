mui.init();

mui.plusReady(function() {
	storage.init();
	//二维码生成
	var str = "http://www.kayou110.com?playerid=" + storageUser.UId;
	$('#code').qrcode(str);
});