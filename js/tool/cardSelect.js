mui.init();

var tagId = "";

mui('.mui-scroll-wrapper').scroll({
	deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
});

mui.plusReady(function() {
	//搜索
	document.getElementById("searchBtn").addEventListener("tap", function() {
		var value = document.getElementById("cardName").value;
		openNew("events.html", {
			keyword: value,
			tagid: tagId,
			CardGroupPlazaId: ""
		});
	});

	//热门赛事
	mui(".kind").on("tap", "span", function() {
		var els = document.getElementById("tap").getElementsByTagName("span");
		for(var i = 0; i < els.length; i++) {
			els[i].setAttribute("class", "");
		}
		this.setAttribute("class", "active");
		tagId = this.dataset.id;
		log("赛事id：" + tagId);
	});

	//热门赛事卡表
	request("/Card/layoutCardGroupPlazaTagPage", {}, function(r) {
		log(r);
		r.code == 0 ? render("#tap", "tapTep1", r.data, true) : appUI.showTopTip(r.msg);
	});
})