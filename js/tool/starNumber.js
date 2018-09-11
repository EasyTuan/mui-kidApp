mui.init();

mui('.mui-scroll-wrapper').scroll({
	deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
});

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	var cardgroupid = self.info.cardgroupid;

	request("/Card/getCardGroupStarNumStat", {
		cardgroupid: cardgroupid
	}, function(r) {
		log(r);
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
			return;
		}
		render("#star", "starTep1", r);
		var maxNum = '' //最大数
		maxNum = r.data[0].CardNum;
		for(var i = 0; i < r.data.length - 1; i++) {
			r.data[i].CardNum = Number(r.data[i].CardNum);
			if(maxNum < r.data[i].CardNum) {
				maxNum = r.data[i].CardNum;
			}
		}
		var part = 20 / maxNum //每份数量 单位vh
		if(maxNum >= 10) {
			part = 23 / maxNum;
			h('.charts').css({
				'top': 'calc(-23vh - 10px)'
			})
		}
		for(var i = 0; i < h(".charts").find("b").length; i++) {
			var num = h(".charts").find("b").eq(i).html(); //每列高度数
			var height = part * num + "vh";
			h(".charts").find("b").eq(i).css({
				"height": height
			});
		}
	}, true)
})