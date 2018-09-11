mui.init();

var rules = ""; //规则
var cardList = [] //已选卡牌    
var CardTypeNum = 0; //已选总数
var BrandId = "";
var CardGroupId = 0;
var toast = 1;

//星数
var star = [];

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	storage.init();
	CardGroupId = self.info.CardGroupId
	BrandId = self.info.BrandId;
	cardList = self.info.cardList;
	CardTypeNum = Number(self.info.CardTypeNum);
	document.getElementById("selet").innerHTML = "已选" + CardTypeNum + "张";
	appPage.imgInit();
	//初始化数据
	request('/Card/getBrandCardStar', {
		brandid: BrandId
	}, function(r) {
		log(r);
		render("#starNum", "starNumTep1", r);
		render("#cardList", "cardListTep1", r);
		h(".star").find("li").eq(0).addClass('active');
		mui('.oneCardList').each(function() {
			this.style.display = 'none';
		});
		star = r.data;
		document.getElementsByClassName("oneCardList")[0].style.display = 'block';
		request("/Card/getCardGroupRuleByBrandId", {
			brandid: BrandId
		}, function(r) {
			r.code == 0 ? rules = r.data.rules : appUI.showTopTip(r.msg);
			//渲染列表
			for(var i = 0; i < star.length; i++) {
				request("/Card/getCardListForCardGroupByPlayerId", {
					starnum: star[i].StarNum,
					playerid: storageUser.UId,
					brandid: BrandId,
					cardgroupid: CardGroupId
				}, function(r) {
					r.code == 0 ? render("#i" + r.data[0].StarNum, "oneCardListTep1", r) : appUI.showTopTip(r.msg);
					appPage.imgInit();
				}, true)
			}

			//数量增删
			mui("#cardList").on("tap", ".remove", function() {
				var num = Number(this.parentNode.childNodes[3].innerHTML);
				if(num <= 0) {
					return;
				}
				this.parentNode.childNodes[3].innerHTML = num - 1;
				CardTypeNum--;
				document.getElementById("selet").innerHTML = "已选" + CardTypeNum + "张";
			})
			mui("#cardList").on("tap", ".add", function() {
				var num = Number(this.parentNode.childNodes[3].innerHTML);
				if(num >= rules[2].SingleCardRepeatNum) {
					if(toast == 1) {
						mui.toast("单张精灵卡只能选" + rules[2].SingleCardRepeatNum + "张！");
						toast = 0;
						setTimeout(function() {
							toast = 1;
						}, 1500);
					}
					return;
				}
				if(CardTypeNum - Number(self.info.CardTypeNum) >= rules[2].MaxNum) {
					if(toast == 1) {
						mui.toast("精灵卡只能选" + rules[2].MaxNum + "张！");
						toast = 0;
						setTimeout(function() {
							toast = 1;
						}, 1500);
					}
					return;
				}
				this.parentNode.childNodes[3].innerHTML = num + 1;
				CardTypeNum = CardTypeNum + 1;
				document.getElementById("selet").innerHTML = "已选" + CardTypeNum + "张";
			})
		})
	})

	//选择星数
	mui(".star").on("tap", "li", function() {
		h(".star").find("li").removeClass('active');
		this.setAttribute("class", "active");
		var starnum = this.dataset.star;
		mui('.oneCardList').each(function() {
			this.style.display = 'none';
		});
		document.getElementById("i" + starnum).style.display = 'block';
	})

	//完成
	document.getElementById("create").addEventListener("tap", function() {
		if(rules[2].MinNum > CardTypeNum - Number(self.info.card1Num)) {
			if(toast == 1) {
				mui.toast("精灵卡最少选" + rules[2].MinNum + "张！");
				toast = 0;
				setTimeout(function() {
					toast = 1;
				}, 1500);
			}
			return;
		}
		var btnArray = ['否', '是'];
		mui.confirm('确认提交修改？', '', btnArray, function(e) {
			if(e.index == 1) {
				mui(".num").each(function() {
					if(this.innerHTML != 0) {
						log(this.dataset.cardid);
						log(this.dataset.type);
						cardList.push(this.dataset.cardid + ":" + this.innerHTML);
					}
				})
				log(cardList);
				//关闭页面
				mui.fire(plus.webview.getWebviewById("tool/oneCardMeCreate.html"), "updataCardList", {
					CardTypeNum: CardTypeNum, //卡牌总数
					cardList: cardList //卡牌列表
				})
				mui.fire(plus.webview.getWebviewById("tool/oneCardMeEdit.html"), "updataCardList", {
					CardTypeNum: CardTypeNum, //卡牌总数
					cardList: cardList //卡牌列表
				})
				var ws = plus.webview.currentWebview();
				plus.webview.close(ws);
				var xx = plus.webview.getWebviewById("tool/addCard.html");
				plus.webview.close(xx);
			}
		})
	})
})

mui('.mui-scroll-wrapper').scroll({
	deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
});