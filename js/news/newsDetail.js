var newsid;
mui.init();
mui.plusReady(function() {
	storage.init();
	newsid = appPage.getParam("id");
	loadData();
	refreshReadCount();

});

function refreshReadCount() {
	log("阅读数+1")
	request("/News/editNewsReadCount", {
		newsid: newsid
	}, function(json) {

	});
}

function loadData() {
	log("加载新闻")
	request("/News/getNewsDetailsByNewsId", {
		newsid: newsid
	}, function(json) {
		if(json.code == 0) {
			json.data.ReadCount = json.data.ReadCount || 0;
			render("#detail_warp", "detail_view", json);
			document.getElementById("body").innerHTML = HTMLDecode(json.data.Body);
			var imgs = document.getElementsByTagName("img");
			for(var i = 0; i < imgs.length; i++) {
				imgs[i].setAttribute("data-preview-src", "");
				imgs[i].setAttribute("data-preview-group", "1");
			}
			mui.previewImage();
		} else {
			var arr = document.getElementsByClassName("nodata");
			for(var i = 0; i < arr.length; i++) {
				arr[i].innerText = "记录不存在";
			}

		}
	});

}

function HTMLDecode(text) {
	var temp = document.createElement("div");
	temp.innerHTML = text;
	var output = temp.innerText || temp.textContent;
	temp = null;
	return output;
}