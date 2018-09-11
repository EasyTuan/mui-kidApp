mui.init();

mui('.mui-scroll-wrapper').scroll({
	deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
});

var rules = ""; //规则
var cardList = [] //已选卡牌    
var CardTypeNum = []; //已选总数
var BrandId = "";
var CardGroupId = 0;
var CardNumber = 0;
var toast = 1;

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	storage.init();
	BrandId = self.info.BrandId;
	try {
		CardGroupId = self.info.CardGroupId;
		CardNumber = Number(self.info.CardNumber); //卡牌总数
	} catch(e) {

	}
	request("/Card/getCardGroupRuleByBrandId", {
		brandid: BrandId
	}, function(r) {
		log(r.data);
		rules = r.data.rules;

		//渲染列表
		request("/Card/getCardListForCardGroupByPlayerId", {
			playerid: storageUser.UId,
			brandid: BrandId,
			cardgroupid: CardGroupId
		}, function(r) {
			log(r);
			if(r.code == 0) {
				for(var i = 0; i < r.data.length; i++) {
					if(r.data[i].CardType == '英雄卡') {
						document.getElementById("hero").style.display = 'block';
						CardTypeNum[0] = 0;
						if(r.data[i].CardNum > 0) {
							CardTypeNum[0] = Number(r.data[i].CardNum) + CardTypeNum[0];
						}
					} else if(r.data[i].CardType == '武装卡') {
						document.getElementById("arms").style.display = 'block';
						CardTypeNum[1] = 0;
						if(r.data[i].CardNum > 0) {
							CardTypeNum[1] = Number(r.data[i].CardNum) + CardTypeNum[1];
						}
					}
				}
				render("#kid1", "cardListTep1", r);
				render("#kid2", "cardListTep2", r);
				appPage.imgInit();
				mui(".num").each(function() {
					if(this.innerHTML != 0) {
						if(this.dataset.type == '英雄卡') {
							CardTypeNum[0]++;
						}
						if(this.dataset.type == '武装卡') {
							CardTypeNum[1]++;
						}
					}
				})
			} else {
				appUI.showTopTip(r.msg);
			}
		}, true)

		//数量增删

		mui("#kid" + rules[0].CardType).on("tap", ".remove", function() {
			var num = Number(this.parentNode.childNodes[3].innerHTML);
			if(num <= 0) {
				return;
			}
			this.parentNode.childNodes[3].innerHTML = num - 1;
			CardTypeNum[0]--;
			CardNumber ? CardNumber-- : '';
		})
		mui("#kid" + rules[0].CardType).on("tap", ".add", function() {
			var num = Number(this.parentNode.childNodes[3].innerHTML);
			if(num >= rules[0].SingleCardRepeatNum) {
				if(toast == 1) {
					mui.toast("单张英雄卡只能选" + rules[0].SingleCardRepeatNum + "张！");
					toast = 0;
					setTimeout(function() {
						toast = 1;
					}, 1500);
				}
				return;
			}
			if(CardTypeNum[0] >= rules[0].MaxNum) {
				if(toast == 1) {
					mui.toast("英雄卡只能选" + rules[0].SingleCardRepeatNum + "张！");
					toast = 0;
					setTimeout(function() {
						toast = 1;
					}, 1500);
				}
				return;
			}
			this.parentNode.childNodes[3].innerHTML = num + 1;
			CardTypeNum[0] = CardTypeNum[0] + 1;
			CardNumber ? CardNumber++ : '';
		})

		mui("#kid" + rules[1].CardType).on("tap", ".remove", function() {
			var num = Number(this.parentNode.childNodes[3].innerHTML);
			if(num <= 0) {
				return;
			}
			this.parentNode.childNodes[3].innerHTML = num - 1;
			CardTypeNum[1]--;
			CardNumber ? CardNumber-- : '';
		})
		mui("#kid" + rules[1].CardType).on("tap", ".add", function() {
			var num = Number(this.parentNode.childNodes[3].innerHTML);
			if(num >= rules[1].SingleCardRepeatNum) {
				if(toast == 1) {
					mui.toast("单张武装卡只能选" + rules[1].SingleCardRepeatNum + "张！");
					toast = 0;
					setTimeout(function() {
						toast = 1;
					}, 1500);
				}
				return;
			}
			if(CardTypeNum[1] >= rules[1].MaxNum) {
				if(toast == 1) {
					mui.toast("此英雄卡武装卡只能选" + rules[1].SingleCardRepeatNum + "张！");
					toast = 0;
					setTimeout(function() {
						toast = 1;
					}, 1500);
				}
				return;
			}
			this.parentNode.childNodes[3].innerHTML = num + 1;
			CardTypeNum[1] = CardTypeNum[1] + 1;
			CardNumber ? CardNumber++ : '';
		})

	})

	//下一步
	document.getElementById("create").addEventListener("tap", function() {
		mui(".num").each(function() {
			if(this.innerHTML != 0) {
				log(this.dataset.cardid);
				log(this.dataset.type);
				plus.storage.setItem('cardUrl', this.dataset.url);
				cardList.push(this.dataset.cardid + ":" + this.innerHTML);
				log(cardList);
			}
		})

		var count = 0;
		var card1Num = 0;

		for(var i = 0; i < CardTypeNum.length; i++) {
			if(CardTypeNum[i] < rules[i].MinNum) {
				if(i == 0) {
					mui.toast('英雄卡最少选' + rules[i].MinNum + '张');
					return;
				} else {
					mui.toast('武装卡最少选' + rules[i].MinNum + '张');
					return;
				}
			} else {
				count = count + CardTypeNum[i];
			}
		}
		card1Num = count;
		if(CardNumber) {
			count = CardNumber;
		}

		openNew("addCard2.html", {
			cardList: cardList,
			CardTypeNum: count,
			BrandId: BrandId,
			CardGroupId: CardGroupId,
			card1Num: card1Num
		});

	})
})