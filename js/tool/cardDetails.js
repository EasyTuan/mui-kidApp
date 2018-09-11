mui.init({
	beforeback: function() {
		appPage.closeLogin();
	}
});

var page = 0; //卡牌当前页面&&总数
var cardList = []; //存储所有cardId
var cardgroupid = '';
mui('.mui-scroll-wrapper').scroll({
	deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
});

var isdefaut = true;

mui.plusReady(function() {
	storage.init();

	//注册登录事件
	appPage.registerCheckLoginEvent();
	var self = plus.webview.currentWebview();
	cardgroupid = self.info.CardGroupId;
	try {
		if(self.info.BrandId) {
			document.getElementById("openPopover").style.display = 'none';
			document.getElementById("create").style.display = 'block';
			document.getElementById("create").addEventListener("tap", function() {
				openNew('oneCardMeEdit.html', {
					CardGroupId: cardgroupid,
					BrandId: self.info.BrandId
				})
			})
		}
	} catch(e) {

	}

	collect = ""; //收藏状态
	request("/Card/getCardGroupDetailByCardGroupId", {
		cardgroupid: cardgroupid,
		playerid: storageUser.UId
	}, function(r) {
		log(r);
		if(r.code == 0) {
			r.data.PlayerId == storageUser.UId ? isdefaut = false : isdefaut = true;
			collect = r.data.IsFav;
			if(collect == 0) {
				//0为未收藏
				document.getElementById("collect").childNodes[1].setAttribute("class", "iconfont icon-collect_defaut");
				document.getElementById("collect").childNodes[4].innerHTML = "收藏";
			} else {
				document.getElementById("collect").childNodes[1].setAttribute("class", "iconfont icon-collect_select active");
				document.getElementById("collect").childNodes[4].innerHTML = "取消收藏";
			}
			PlayerId = r.data.PlayerId;
			document.getElementById("savaImg").src = r.data.ImgUrl;
			render("#cardDetailsTitle", "cardDetailsTitleTep1", r.data);
			render("#cardTag", "cardTagTep1", r.data);
			//注入序列号
			for(var i = 0; i < r.data.CardList.length; i++) {
				var list = r.data.CardList[i].CardList;
				for(var j = 0; j < list.length; j++) {
					cardList[page] = list[j].CardId;
					page++;
					list[j].page = page;
				}
			}

			render("#cardList", "cardListTep1", r.data);
			appPage.imgInit();
		} else {
			appUI.showTopTip(r.msg);
		}
	}, true)

	//星数比例
	document.getElementById("starNumber").addEventListener("tap", function() {
		openNew("starNumber.html", {
			cardgroupid: cardgroupid
		});
	})

	//复制套牌
	document.getElementById("copy").addEventListener("tap", function() {
		if(storageUser.UId == 0) {
			return;
		}
		request("/Card/copyCardGroupByPlayerId", {
			cardgroupid: cardgroupid,
			playerid: storageUser.UId
		}, function(r) {
			mui.toast(r.msg);
		})
	})

	//打开二级
	mui("#cardList").on("tap", "li", function() {
		var xx = plus.webview.getWebviewById("tool/oneCardDetail.html"),
			CardId = this.dataset.id,
			pageIndex = this.dataset.page;
		if(xx) {
			//plus.webview.close(xx);
			mui.fire(xx, 'uploadDetails', {
				CardId: CardId, //当前卡牌id
				pageIndex: pageIndex, //当前卡牌页码
				page: page, //总页面
				cardList: cardList //页面对应id，数组形式
			});
		}
		openNew("oneCardDetail.html", {
			CardId: CardId, //当前卡牌id
			pageIndex: pageIndex, //当前卡牌页码
			page: page, //总页面
			cardList: cardList //页面对应id，数组形式
		});
	})

	//保存图片到本地
	document.getElementById("save").addEventListener("tap", function() {
		var imgUrl = document.getElementById("savaImg").src;
		var suffix = cutImageSuffix(imgUrl);
		var downLoader = plus.downloader.createDownload(imgUrl, {
			method: 'GET',
			filename: '_downloads/image' + suffix
		}, function(download, status) {
			var fileName = download.filename;
			log('文件名:' + fileName);
			log('下载状态：' + status);

			plus.gallery.save(fileName, function() {
				mui.toast('已保存至本地相册');
				mui('.mui-popover').popover('hide');
			}, function(e) {
				mui.toast('保存失败: ' + JSON.stringify(e));
				mui('.mui-popover').popover('hide');
			});
		});
		downLoader.start();
	});

	// 截取图片后缀用于重命名图片，防止%E5%85%89%E6%98%8E%E8%A1%8C编码的文件不被系统相册识别；
	function cutImageSuffix(imageUrl) {
		var index = imageUrl.lastIndexOf('.');
		return imageUrl.substring(index);
	}

	//收藏
	document.getElementById("collect").addEventListener("tap", function() {
		if(storageUser.UId == 0) {
			return;
		}
		if(!isdefaut) {
			mui.toast('您不能收藏自己的套牌哦！');
			return;
		}
		var el = this;
		if(collect == 0) {
			request("/Player/OpPlayerFavoriteCardGroup", {
				objectid: cardgroupid,
				op: 1,
				playerid: storageUser.UId
			}, function(r) {
				if(r.code == -1) {
					appUI.showTopTip(r.msg);
					return;
				}
				el.childNodes[1].setAttribute("class", "iconfont icon-collect_select active");
				el.childNodes[4].innerHTML = "取消收藏";
				collect = 1;
				mui.toast("收藏成功");
			})
		} else {
			var btnArray = ['取消', '确定'];
			mui.confirm('确认取消收藏？', '', btnArray, function(e) {
				if(e.index == 1) {
					request("/Player/OpPlayerFavoriteCardGroup", {
						objectid: cardgroupid,
						op: 2,
						playerid: storageUser.UId
					}, function(r) {
						if(r.code == -1) {
							appUI.showTopTip(r.msg);
							return;
						}
						el.childNodes[1].setAttribute("class", "iconfont icon-collect_defaut");
						el.childNodes[4].innerHTML = "收藏";
						collect = 0;
						mui.toast("已取消收藏");
					})
				}
			})
		}
	})

	//自定义监听
	window.addEventListener('refreshPage', function() {
		storageUser = kidstorageuser.getInstance();
		request("/Card/getCardGroupDetailByCardGroupId", {
			cardgroupid: cardgroupid
		}, function(r) {
			log(r);
			if(r.code == 0) {
				collect = r.data.IsFav;
				if(collect == 0) {
					//0为未收藏
					document.getElementById("collect").childNodes[1].setAttribute("class", "iconfont icon-collect_defaut");
					document.getElementById("collect").childNodes[4].innerHTML = "收藏";
				} else {
					document.getElementById("collect").childNodes[1].setAttribute("class", "iconfont icon-collect_select active");
					document.getElementById("collect").childNodes[4].innerHTML = "取消收藏";
				}
				PlayerId = r.data.PlayerId;
				document.getElementById("savaImg").src = r.data.ImgUrl;
				render("#cardDetailsTitle", "cardDetailsTitleTep1", r.data);
				render("#cardTag", "cardTagTep1", r.data);

				//注入序列号
				for(var i = 0; i < r.data.CardList.length; i++) {
					var list = r.data.CardList[i].CardList;
					for(var j = 0; j < list.length; j++) {
						cardList[page] = list[j].CardId;
						page++;
						list[j].page = page;
					}
				}

				render("#cardList", "cardListTep1", r.data);
				appPage.imgInit();
			} else {
				appUI.showTopTip(r.msg);
			}
		}, true)
	})

});

//弹出分享
document.getElementById("share").addEventListener('tap', function() {
	mui.openWindow({
		url: '../popShare.html',
		id: '../popShare.html',
		styles: {
			background: "transparent"
		},
		extras: {
			info: null //页面传参
		},
		waiting: {
			options: waitingStyle
		},
		show: {
			aniShow: 'slide-in-bottom' //页面显示动画，默认为”slide-in-right“；
		}
	})
})

document.getElementById("share_").addEventListener('tap', function() {
	mui('.mui-popover').popover('hide');
	mui.openWindow({
		url: '../popShare.html',
		id: '../popShare.html',
		styles: {
			background: "transparent"
		},
		extras: {
			info: null //页面传参
		},
		waiting: {
			options: waitingStyle
		},
		show: {
			aniShow: 'slide-in-bottom' //页面显示动画，默认为”slide-in-right“；
		}
	})
})

var pkEvent = {
	goInvitation: function() {
		openNew("cardDetails.html");
	},
	gocardDetails: function() {
		openNew("cardDetails.html");
	}
}

//自定义监听刷新
window.addEventListener('uploadDetails', function() {
	page = 0; //卡牌当前页面&&总数
	cardList = []; //存储所有cardId
	request("/Card/getCardGroupDetailByCardGroupId", {
		cardgroupid: cardgroupid
	}, function(r) {
		log(r);
		if(r.code == 0) {
			collect = r.data.IsFav;
			if(collect == 0) {
				//0为未收藏
				document.getElementById("collect").childNodes[1].setAttribute("class", "iconfont icon-collect_defaut");
				document.getElementById("collect").childNodes[4].innerHTML = "收藏";
			} else {
				document.getElementById("collect").childNodes[1].setAttribute("class", "iconfont icon-collect_select active");
				document.getElementById("collect").childNodes[4].innerHTML = "取消收藏";
			}
			PlayerId = r.data.PlayerId;
			document.getElementById("savaImg").src = r.data.ImgUrl;
			render("#cardDetailsTitle", "cardDetailsTitleTep1", r.data);
			render("#cardTag", "cardTagTep1", r.data);

			//注入序列号
			for(var i = 0; i < r.data.CardList.length; i++) {
				var list = r.data.CardList[i].CardList;
				for(var j = 0; j < list.length; j++) {
					cardList[page] = list[j].CardId;
					page++;
					list[j].page = page;
				}
			}

			render("#cardList", "cardListTep1", r.data);
			appPage.imgInit();
		} else {
			appUI.showTopTip(r.msg);
		}
	}, true)
})