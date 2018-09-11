mui.init({
	beforeback: function() {
		appPage.closeLogin();
	}
});

mui.plusReady(function() {
	storage.init();
	getList();

	//删除工具
	mui("#selectedTool").on("tap", "li", function() {
		var BrandId = this.dataset.id;
		request("/Player/OpPlayerFavoriteBrand", {
			playerid: storageUser.UId,
			objectid: BrandId,
			op: 2
		}, function(r) {
			log(r);
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				return;
			}
			getList();
			mui.fire(plus.webview.getWebviewById('tool/tool.html'), "uploadList");
		})
	})

	//增加工具
	mui("#moreTool").on("tap", "li", function() {
		var BrandId = this.dataset.id;
		request("/Player/OpPlayerFavoriteBrand", {
			playerid: storageUser.UId,
			objectid: BrandId,
			op: 1
		}, function(r) {
			log(r);
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				return;
			}
			getList();
			mui.fire(plus.webview.getWebviewById('tool/tool.html'), "uploadList");
		})
	})

	//可能从登录页进来的，所以需要执行手动关闭登录页
	//appPage.closeLogin();

})

//1为已选，0为更多
function getList() {
	request("/Card/getBrandListByPlayerId", {
		playerid: storageUser.UId
	}, function(r) {
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
			return;
		}
		render("#selectedTool", "selectedToolTep1", r.data);
		render("#moreTool", "moreToolTep1", r.data);
		appPage.imgInit();
	}, true)
}