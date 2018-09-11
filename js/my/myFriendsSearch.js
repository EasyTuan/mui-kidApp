var inpt_search = document.getElementById("inpt_search");
var keyword = "";
mui.init();
mui.plusReady(function() {
	storage.init();
	//输入框变化
	document.getElementById("inpt_search").addEventListener("input", function(e) {
		if(this.value == "") {
			document.getElementById("backBtn").style.display = "block";
			document.getElementById("searchBtn").style.display = "none";
			return;
		}
		document.getElementById("backBtn").style.display = "none";
		document.getElementById("searchBtn").style.display = "block";
	})
	//清空
	mui(".searchbar").on("tap", "span.mui-icon-clear", function() {
		if(inpt_search.value == "") {
			document.getElementById("backBtn").style.display = "block";
			document.getElementById("searchBtn").style.display = "none";
			return;
		}
	})
	document.getElementById("searchBtn").addEventListener("tap", function() {
		var kw = inpt_search.value.trim();
		if(kw == keyword) {
			return;
		}
		keyword = kw;
		loadData();
	});
	mui("#list_warp").on("tap", ".userinfo", function() {
		//		for(var i in this){
		//			log(i+"="+this[i])
		//		}
		var id = this.getAttribute("data-id");
		openNew("userInfo.html", {
			id: id
		});
	});
});

function loadData() {
	request("/Player/searchPlayerNewFriendList", {
		playerid: storageUser.UId, //
		keyword: keyword
	}, function(json) {
		log(JSON.stringify(json))
		if(json.code == 0) {
			render("#list_warp", "list_view", json);
			appPage.imgInit();
		} else {
			mui.toast(json.msg);
		}
	});
}

function initEvent() {

}
//var storenamestr = "的第页";
//	var r = {};
//	r.data = [{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "未比赛",
//			state: 0
//		},
//		{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "文具店",
//			state: 0
//		},
//		{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "胜利",
//			state: 1
//		},
//		{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "文具店",
//			state: 2
//		},
//		{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "文具店",
//			state: 0
//		},
//		{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "文具店",
//			state: 0
//		},
//		{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "文具店",
//			state: 0
//		},
//		{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "文具店",
//			state: 1
//		},
//		{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "文具店",
//			state: 0
//		},
//		{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "文具店",
//			state: 1
//		},
//		{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "文具店",
//			state: 0
//		},
//		{
//			src: "../../images/tx1.png",
//			storename: storenamestr,
//			timestr: "2017-5-2 14:00 - 15:00",
//			joinpeople: 1,
//			maxpeople: "10",
//			statename: "文具店",
//			state: 0
//		}
//
//	];