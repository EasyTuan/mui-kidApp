mui.init({
	beforeback: function() {
		appPage.closeLogin();
	}
});

mui('.mui-scroll-wrapper').scroll({
	deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
});

mui.previewImage();
var collect = ""; //收藏状态

mui.plusReady(function() {
	storage.init();
	//注册登录事件
	appPage.registerCheckLoginEvent();

	var self = plus.webview.currentWebview();
	var CardId = self.info.CardId, //当前卡牌id
		pageIndex = Number(self.info.pageIndex), //当前卡牌页码
		pageCount = self.info.page, //总页面
		cardList = self.info.cardList; //页面对应id，数组形式
	log("当前卡牌id：" + CardId);
	log("数组：" + cardList);
	getCardByCardId(CardId);

	//获取单卡数据
	function getCardByCardId(r) {
		request("/Card/getCardByCardId", {
			cardid: r,
			playerid: storageUser.UId
		}, function(r) {
			log(r);
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				document.getElementsByClassName("none")[0].style.display = 'block';
				document.getElementById("bottom").style.display = 'none';
				return;
			}
			//判断是否收藏
			collect = r.data[0].IsFav;
			if(collect == 0) {
				//0为未收藏
				document.getElementById("collect").childNodes[1].setAttribute("class", "iconfont icon-collect_defaut");
				document.getElementById("collect").childNodes[4].innerHTML = "收藏";
			} else {
				document.getElementById("collect").childNodes[1].setAttribute("class", "iconfont icon-collect_select active");
				document.getElementById("collect").childNodes[4].innerHTML = "取消收藏";
			}
			r.data[1].CardName ? document.getElementById("cardName").innerHTML = r.data[0].CardName + '&' + r.data[1].CardName : document.getElementById("cardName").innerHTML = r.data[0].CardName;
			for(var j in r.data) {
				if(r.data[j] != '') {
					for(var i in r.data[j].AttrList) {
						try {
							r.data[j].AttrList[i].CardAttrValue = r.data[j].AttrList[i].CardAttrValue.replace(/\r\n/g, "&lt;br//&gt;");
							r.data[j].AttrList[i].CardAttrValue = HTMLDecode(r.data[j].AttrList[i].CardAttrValue);
						} catch(e) {

						}
					}
				}
			}

			render("#detail", "detailTep1", r);
			appPage.imgInit();
		}, true)
	}

	//翻页
	document.getElementById("page").innerHTML = pageIndex + "/" + pageCount;
	document.getElementById("arrowleft").addEventListener("tap", function() {
		document.getElementById("arrowright").setAttribute("class", "mui-icon mui-icon-arrowright");
		if(pageIndex > 2) {
			pageIndex--;
			CardId = cardList[pageIndex - 1];
			log("当前卡牌id：" + CardId);
			getCardByCardId(CardId);
			this.setAttribute("class", "mui-icon mui-icon-arrowleft active");
			document.getElementById("page").innerHTML = pageIndex + "/" + pageCount;
		} else if(pageIndex == 2) {
			pageIndex--;
			CardId = cardList[pageIndex - 1];
			log("当前卡牌id：" + CardId);
			getCardByCardId(CardId);
			this.setAttribute("class", "mui-icon mui-icon-arrowleft end");
			document.getElementById("page").innerHTML = pageIndex + "/" + pageCount;
		}
		log(pageIndex);
	})

	document.getElementById("arrowright").addEventListener("tap", function() {
		document.getElementById("arrowleft").setAttribute("class", "mui-icon mui-icon-arrowleft");
		if(pageIndex < (pageCount - 1)) {
			pageIndex++;
			CardId = cardList[pageIndex - 1];
			log("当前卡牌id：" + CardId);
			getCardByCardId(CardId);
			this.setAttribute("class", "mui-icon mui-icon-arrowright active");
			document.getElementById("page").innerHTML = pageIndex + "/" + pageCount;
		} else if(pageIndex == (pageCount - 1)) {
			pageIndex++;
			CardId = cardList[pageIndex - 1]
			log("当前卡牌id：" + CardId);
			getCardByCardId(CardId);
			this.setAttribute("class", "mui-icon mui-icon-arrowright end");
			document.getElementById("page").innerHTML = pageIndex + "/" + pageCount;
		}
		log(pageIndex);
	})

	//收藏
	document.getElementById("collect").addEventListener("tap", function() {
		if(storageUser.UId == 0) {
			return;
			mui.toast('登录后才可收藏！');
		}
		var el = this;
		if(collect == 0) {
			request("/Player/OpPlayerFavoriteCard", {
				objectid: CardId,
				playerid: storageUser.UId,
				op: '1'
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
					request("/Player/OpPlayerFavoriteCard", {
						objectid: CardId,
						playerid: storageUser.UId,
						op: '2'
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

	//二级相关套牌
	document.getElementById("correlationCard").addEventListener("tap", function() {
		var xx = plus.webview.getWebviewById("tool/correlationCard.html");
		if(xx) {
			//plus.webview.close(xx);
			mui.fire(xx, 'uploadDetails', {
				CardId: CardId
			});
		}
		openNew("correlationCard.html", {
			CardId: CardId
		});
	})

	//自定义监听刷新
	window.addEventListener("uploadDetails", function(event) {
		CardId = event.detail.CardId, //当前卡牌id
			pageIndex = Number(event.detail.pageIndex), //当前卡牌页码
			pageCount = event.detail.page, //总页面
			cardList = event.detail.cardList; //页面对应id，数组形式
		document.getElementById("page").innerHTML = pageIndex + "/" + pageCount;
		getCardByCardId(event.detail.CardId);
	})

	window.addEventListener('refreshPage', function() {
		storageUser = kidstorageuser.getInstance();
		getCardByCardId(CardId);
	})

})

var pkEvent = {
	goInvitation: function() {
		openNew("oneCardDetail.html");
	}
}

function HTMLDecode(text) {
	var temp = document.createElement("div");
	temp.innerHTML = text;
	var output = temp.innerText || temp.textContent;
	temp = null;
	return output;
}