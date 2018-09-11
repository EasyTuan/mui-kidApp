mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: { //下拉刷新
			callback: pulldownRefresh,
			style: mui.os.android ? "circle" : "default"
		}
	}
})

var page = 1, //初始页码
	pageCount = 0, //总页数
	swiper,
	channelNum = 0; //订阅数量，超过8展开

mui.plusReady(function() {
	storage.init();

	getList();

	//打开帖子详情
	mui("#bbsList").on("tap", "li", function() {
		var id = this.dataset.id;
		openNew("bbsDetails.html", {
			id: id
		});
		setTimeout(function() {
			request('/Topic/addTopicViews', {
				topicid: id
			}, function() {
				log('帖子阅读数+1');
				getList();
			})
		}, 200);
	})

	//打开频道详情
	mui('#channelList').on('tap', 'span', function() {
		openNew("channelDetails.html", {
			nodeid: this.dataset.nodeid
		});
	})
	//登录后刷新页面
	window.addEventListener('refreshPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "刷新页面");
		storageUser = kidstorageuser.getInstance();
		getList();
	});

	//轮播跳转
	mui("#banner_warp").on("tap", ".bannerImg", function() {
		if(this.dataset.href) {
			log(this.dataset.href + " | " + this.dataset.param)
			var jsonstr = this.dataset.param;
			log(jsonstr)
			var param = JSON.parse(jsonstr); // JSON.parse(jsonstr);
			log(JSON.stringify(param));
			openNew(this.dataset.href, param);
		}
	})

})

//添加订阅
mui('#channelList').on('tap', '#addchannel', function() {
	mui.fire(plus.webview.getWebviewById('bbs/bbs.html'), 'goChannel');
})

//展开收起
function spread() {
	if(channelNum > 8) {
		document.getElementById("channelBtn").style.display = 'block';
		document.getElementById("channelBtn").addEventListener('tap', function() {
			if(this.innerHTML == '展开') {
				document.getElementById("channellist").setAttribute('class', 'channelList channelFold');
				this.innerHTML = '收起';
			} else {
				document.getElementById("channelList").setAttribute('class', 'channelList');
				this.innerHTML = '展开';
			}
		})
	} else {
		document.getElementById("channelBtn").style.display = 'none';
		document.getElementById("channelList").setAttribute('class', 'channelList');
	}
}

//获取数据
function getList() {
	storageUser = kidstorageuser.getInstance();
	//	request('/Index/getBBSHomeList',{
	//		playerid: storageUser.UId
	//	},function(r){
	//		log(r);
	//		if(!swiper) {
	//			render("#banner_warp", "banner_view", r.data);
	//			swiper = new Swiper('.swiper-container', {
	//				autoplay: 3000, //可选选项，自动滑动
	//				pagination: '.swiper-pagination',
	//				loop: true,
	//				autoplayDisableOnInteraction: false,
	//			});
	//		} else {
	//			swiper.stopAutoplay();
	//			swiper.removeAllSlides();		
	//			var item,str;
	//			for (var i=0;i<r.data.banner_list.length;i++) {
	//				item=r.data.banner_list[i];
	//				str='<div class="swiper-slide bannerImg" data-href="'+item.HrefUrl+'" data-param=\''+item.HrefParam+'\'><img class="loadthumb" data-url="'+item.ImgUrl+'" data-wh=",320" />';
	//				swiper.appendSlide(str);
	//			}
	//			swiper.startAutoplay();
	//		}
	//		
	//		render('#bbsList','bbsListTep1',r.data);
	//		render('#channelList','channelListTep1',r.data);
	//		appPage.imgInit();
	//		channelNum=r.data.subscribe_list.length;
	//		spread();
	//	},true)
}

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		getList();
		//下拉刷新结束
		mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
		//重置上拉加载
		mui('#pullrefresh').pullRefresh().refresh(true);
		//重置页码
		page = 1;
	}, 1500)
}

// 上拉加载具体业务实现
//function pullupRefresh() {
//	if(pageCount > page) {
//		log(mklog() + '上拉加载开始！！');
//		setTimeout(function() {
//			/*request('getGiftList', {
//				categoryId: index,
//				pageIndex: page + 1
//			}, function(r) {
//				var pageCount = r.data.pageCount;
//				log(mklog() + '上拉加载：' + '第' + page + '页/共' + pageCount + '页')
//				//渲染数据
//				if(page <= pageCount){
//					render("#libao", "libaoTep1", r.data,true);
//				}
//				//停止上拉加载，参数为true代表没有更多数据了。
//				mui('#pullrefresh').pullRefresh().endPullupToRefresh((page >= pageCount));
//			});*/
//			page++;
//			log(mklog() + '上拉加载结束！！')
//		}, 1500);
//	} else {
//		//mui.toast("温馨提示：没有更多数据");
//		mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
//	}
//
//}

//自定义监听刷新
window.addEventListener('uploadList', function() {
	getList();
})

window.addEventListener('refreshPage', function() {
	storage.init();
	getList();
})