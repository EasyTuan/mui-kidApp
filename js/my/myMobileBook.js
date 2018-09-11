mui.init();
mui.ready(function() {

	loadData();

	var header = document.querySelector('header.mui-bar');
	var movebox = document.getElementById('movebox');
	var list = document.getElementById('list');
	var search = document.getElementById('search');
	var bar = document.getElementById('barwarp');
	var baralert = document.getElementById('baralert');

	//calc hieght
	var h = (document.body.offsetHeight - header.offsetHeight);
	log(h);
	list.style.height = h + 'px';

	//create
	//window.indexedList = new mui.IndexedList(list, search, bar, baralert, movebox);
	window.indexedList = new mui.IndexedList(list);

	var elements = document.getElementsByClassName("userinfo");
	for(var i = 0; i < elements.length; i++) {
		elements[i].addEventListener("tap", function() {
			var id = this.getAttribute("data-id");
			var param = {
				id: id
			};
			openNew("userInfo.html", param);
		})
	};

	//	document.getElementById("myMobileBook").addEventListener("tap", function() {
	//		openNew("myMobileBook.html");
	//	});

});

function loadData() {
	//	request("getUserProfileByUid", {
	//		uid: uid
	//	}, function(r) {
	//		log(JSON.stringify(r))
	var r = {};
	r.data = [{
			group: "A",
			list: [{
					imgurl: "../../images/logo.jpg",
					notename: "李孝利1A",
					value: "lixiaoli1A",
					tags: "放什么呢1A",
					status: 0
				},
				{
					imgurl: "../../images/logo.jpg",
					notename: "李孝利2A",
					value: "lixiaoli2a",
					tags: "放什么呢2A",
					status: 0
				},
				{
					imgurl: "../../images/logo.jpg",
					notename: "李孝利3A",
					value: "lixiaoli3A",
					tags: "放什么呢3A",
					status: 1
				}

			]
		},
		{
			group: "B",
			list: [{
					imgurl: "../../images/logo.jpg",
					notename: "李孝利1B",
					value: "lixiaoli1B",
					tags: "放什么呢1B",
					status: 1
				},
				{
					imgurl: "../../images/logo.jpg",
					notename: "李孝利2B",
					value: "lixiaoli2b",
					tags: "放什么呢2B",
					status: 0
				},
				{
					imgurl: "../../images/logo.jpg",
					notename: "李孝利3B",
					value: "lixiaoli3B",
					tags: "放什么呢3B",
					status: 1
				}
			]
		},
		{
			group: "D",
			list: [{
					imgurl: "../../images/logo.jpg",
					notename: "李孝利1D",
					value: "lixiaoli1D",
					tags: "放什么呢1D",
					status: 1
				},
				{
					imgurl: "../../images/logo.jpg",
					notename: "李孝利2D",
					value: "lixiaoli2D",
					tags: "放什么呢2D",
					status: 0
				},
				{
					imgurl: "../../images/logo.jpg",
					notename: "李孝利3D",
					value: "lixiaoli3D",
					tags: "放什么呢3D",
					status: 1
				}
			]
		}
	];
	//log(JSON.stringify(r, null, 4));
	render("#barwarp", "bar_view", r);
	render("#listwarp", "list_view", r);
	//});
}