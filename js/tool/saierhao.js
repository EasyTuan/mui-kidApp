mui.init();

mui.plusReady(function() {
	mui(".mui-table-view").on("tap", "li", function() {
		openNew("cardList.html");
	})
})