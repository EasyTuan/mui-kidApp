mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: { //下拉刷新
			callback: pulldownRefresh,
			style: mui.os.android ? "circle" : "default"
		}
	},
	beforeback: function() {
		appPage.closeLogin();
	}
})

var page = 1; //初始页码
var pageCount = 0; //总页数

mui.plusReady(function() {
	storage.init();
	//注册登录事件
	appPage.registerCheckLoginEvent();

	//自定义监听工具增删
	window.addEventListener("uploadList", function() {
		getList();
	})

	//自定义监听刷新
	window.addEventListener('refreshPage', function() {
		getList();
	})

	//存储品牌id
	mui('#toolList').on('tap', '.ckecklogin', function() {
		plus.storage.setItem('BrandId', this.dataset.id);
	})

})

var pkEvent = {
	goInvitation: function() {
		openNew("oneCardCollect.html");
	},
	goOneCardMe: function() {
		openNew("oneCardMe.html");
	},
	goToolControl: function() {
		openNew("toolControl.html");
	}
}

//拉取数据
function getList() {
	request("/Card/layoutBrandMenuPage", {
		playerid: storageUser.UId
	}, function(r) {
		log(r);
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
			return;
		}
		render("#toolList", "toolListTep1", r);
		appPage.imgInit();
		//四个标签页二级
		mui(".mui-collapse-content").on("tap", "span", function() {
			if(this.dataset.href != '') {
				openNew(this.dataset.href, {
					type: "",
					BrandId: this.dataset.id
				});
			}

		})
	})
}

//下拉刷新具体业务实现
function pulldownRefresh() {
	setTimeout(function() {
		//下拉刷新结束
		getList();
		mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
		//重置上拉加载
		mui('#pullrefresh').pullRefresh().refresh(true);
		//重置页码
		page = 1;
	}, 1500)
}