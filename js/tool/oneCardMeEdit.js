mui.init();
var cardList = [], //已选卡牌
	CardTypeNum = "", //卡牌总数
	cardName = "", //套牌名称
	label = [], //标签
	page = 0; //卡牌当前页面&&总数
keyword = '', //备注
	CardGroupId = "",
	_cardList = [],
	BrandId = '',
	rules = "", //规则
	isEdit = false; //单卡是否被修改

mui('.mui-scroll-wrapper').scroll({
	deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
});

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	CardGroupId = self.info.CardGroupId;
	BrandId = self.info.BrandId;

	storage.init();
	//返回确认
	var old_back = mui.back;
	//	mui.back = function(){
	//	  var btn = ["确认离开","等一会"];
	//	  mui.confirm('是否放弃本次编辑','提示',btn,function(e){
	//	    if(e.index==0){
	//	    	//执行mui封装好的窗口关闭逻辑；
	//	    	old_back();
	//	    }
	//	  });
	//	}

	request("/Card/getCardGroupDetailByCardGroupId", {
		cardgroupid: CardGroupId
	}, function(r) {
		log(r);
		if(r.code == 0) {
			PlayerId = r.data.PlayerId;
			//注入序列号
			for(var i = 0; i < r.data.CardList.length; i++) {
				var list = r.data.CardList[i].CardList;
				for(var j = 0; j < list.length; j++) {
					cardList[page] = list[j].CardId;
					page++;
					list[j].page = page;
				}
			}
			cardName = r.data.CardGroupName;
			document.getElementById("cardName").innerHTML = cardName;
			CardTypeNum = Number(r.data.CardType1Num);
			document.getElementById("mainNum").innerHTML = "主牌：" + CardTypeNum;
			keyword = r.data.Remark;

			if(r.data.TagList.length > 0) {
				for(var i = 0; i < r.data.TagList.length; i++) {
					document.getElementsByClassName("lable")[0].innerHTML += '<span>' + r.data.TagList[i].Tag + '</span>';
					label.push(r.data.TagList[i].Tag);
				}
			}
			if(keyword != '') {
				document.getElementsByClassName("remark")[0].innerHTML = keyword;
			}

			render("#cardList", "cardListTep1", r.data);
			appPage.imgInit();
			//获取规则
			request("/Card/getCardGroupRuleByBrandId", {
				brandid: BrandId
			}, function(r) {
				log(r.data);
				rules = r.data.rules;
				//数量增删
				mui("#cardList").on("tap", ".remove", function() {
					var num = Number(this.parentNode.childNodes[3].innerHTML);
					if(num <= 0) {
						return;
					}
					var type = Number(this.dataset.type) - 1;
					var typename = this.dataset.typename;
					if(num == rules[type].MinNum) {
						mui.toast("单张" + typename + "最少选" + rules[type].MinNum + "张！");
						return;
					}
					this.parentNode.childNodes[3].innerHTML = num - 1;
					CardTypeNum--;
					document.getElementById("mainNum").innerHTML = "主牌：" + CardTypeNum;
					isEdit = true;
				})
				mui("#cardList").on("tap", ".add", function() {
					var num = Number(this.parentNode.childNodes[3].innerHTML);
					var type = Number(this.dataset.type) - 1;
					var typename = this.dataset.typename;
					if(num >= rules[type].SingleCardRepeatNum) {
						mui.toast("单张" + typename + "只能选" + rules[type].SingleCardRepeatNum + "张！");
						return;
					}
					if(CardTypeNum - Number(self.info.CardTypeNum) >= rules[type].MaxNum) {
						mui.toast(typename + "只能选" + rules[type].MaxNum + "张！");
						return;
					}
					this.parentNode.childNodes[3].innerHTML = num + 1;
					CardTypeNum = CardTypeNum + 1;
					document.getElementById("mainNum").innerHTML = "主牌：" + CardTypeNum;
					isEdit = true;
				})
			})
		} else {
			appUI.showTopTip(r.msg);
		}
	})

	//打开单卡详情
	mui("#cardList").on("tap", "a", function() {
		openNew("oneCardDetail.html", {
			CardId: this.dataset.id, //当前卡牌id
			pageIndex: this.dataset.page, //当前卡牌页码
			page: page, //总页面
			cardList: cardList //页面对应id，数组形式
		});
	})

	//完成提交修改
	document.getElementById("create").addEventListener("tap", function() {
		if(_cardList.length == 0) {
			mui(".num").each(function() {
				_cardList.push(this.dataset.cardid + ':' + this.innerHTML);
			})
		}
		if((rules[0].MinNum + rules[1].MinNum + rules[2].MinNum) > CardTypeNum) {
			mui.toast("套牌最少选" + (rules[0].MinNum + rules[1].MinNum + rules[2].MinNum) + "张！");
			return;
		}
		if((rules[0].MaxNum + rules[1].MaxNum + rules[2].MaxNum) < CardTypeNum) {
			mui.toast("套牌最多选" + (rules[0].MaxNum + rules[1].MaxNum + rules[2].MaxNum) + "张！");
			return;
		}
		request("/Card/editCardGroup", {
			brandid: BrandId,
			playerid: storageUser.UId,
			cardgroupidd: CardGroupId,
			imgurl: plus.storage.getItem('cardUrl'),
			cardgroupname: cardName,
			tags: label.join(','),
			remark: keyword,
			cardids: _cardList.join(',')
		}, function(r) {
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				return;
			}
			mui.fire(plus.webview.getWebviewById("tool/oneCardMe.html"), "updata");
			mui.fire(plus.webview.getWebviewById("tool/cardDetails.html"), 'uploadDetails');
			old_back();
		})
	})

	//星数比例
	document.getElementById("starNumber").addEventListener("tap", function() {
		openNew("starNumber.html", {
			cardgroupid: CardGroupId
		});
	})

	//复制套牌
	document.getElementById("copy").addEventListener("tap", function() {
		request("/Card/copyCardGroupByPlayerId", {
			cardgroupid: CardGroupId,
			playerid: storageUser.UId
		}, function(r) {
			mui.toast(r.msg);
		})
	})

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

})

//自定义监听标签备注
window.addEventListener("updataLabel", function() {
	label = event.detail.label;
	keyword = event.detail.keyword;
	var el = document.getElementsByClassName("lable")[0];
	var childs = el.childNodes;
	for(var i = childs.length - 1; i >= 0; i--) {
		el.removeChild(childs[i]);
	}
	for(var i = 0; i < label.length; i++) {
		document.getElementsByClassName("lable")[0].innerHTML += '<span>' + label[i] + '</span>';
	}
	if(keyword != '') {
		document.getElementsByClassName("remark")[0].innerHTML = keyword;
	}
	log(label);
})

//自定义监听选择套牌
window.addEventListener("updataCardList", function(event) {
	CardTypeNum = Number(event.detail.CardTypeNum) + CardTypeNum;
	document.getElementById("mainNum").innerHTML = "主牌：" + CardTypeNum;
	_cardList = event.detail.cardList;
	request("/Card/editCardGroup", {
		brandid: BrandId,
		playerid: storageUser.UId,
		cardgroupidd: CardGroupId,
		cardgroupname: cardName,
		imgurl: plus.storage.getItem('cardUrl'),
		tags: label.join(','),
		remark: keyword,
		cardids: _cardList.join(',')
	}, function(r) {
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
			return;
		}
		mui.fire(plus.webview.getWebviewById("tool/oneCardMe.html"), "updata");
		request("/Card/getCardGroupDetailByCardGroupId", {
			cardgroupid: CardGroupId
		}, function(r) {
			log(r);
			if(r.code == 0) {
				PlayerId = r.data.PlayerId;
				//注入序列号
				for(var i = 0; i < r.data.CardList.length; i++) {
					var list = r.data.CardList[i].CardList;
					for(var j = 0; j < list.length; j++) {
						cardList[page] = list[j].CardId;
						page++;
						list[j].page = page;
					}
				}
				cardName = r.data.CardGroupName;
				document.getElementById("cardName").innerHTML = cardName;
				CardTypeNum = Number(r.data.CardType1Num);
				document.getElementById("mainNum").innerHTML = "主牌：" + CardTypeNum;
				keyword = r.data.Remark;

				if(r.data.TagList.length > 0) {
					var el = document.getElementsByClassName("lable")[0];
					var childs = el.childNodes;
					for(var i = childs.length - 1; i >= 0; i--) {
						el.removeChild(childs[i]);
					}
					label = [];
					for(var i = 0; i < r.data.TagList.length; i++) {
						document.getElementsByClassName("lable")[0].innerHTML += '<span>' + r.data.TagList[i].Tag + '</span>';
						label.push(r.data.TagList[i].Tag);
					}
				}
				if(keyword != '') {
					document.getElementsByClassName("remark")[0].innerHTML = keyword;
					//					document.getElementById("moreBtn").style.display='block';
				}

				render("#cardList", "cardListTep1", r.data);
				appPage.imgInit();
			} else {
				appUI.showTopTip(r.msg);
			}
		})
	})
})

//添加单卡
document.getElementById("addCard").addEventListener("tap", function() {
	if(!isEdit) {
		openNew("addCard.html", {
			BrandId: BrandId,
			CardGroupId: CardGroupId,
			CardNumber: CardTypeNum
		});
	} else {
		var btnArray = ['否', '是'];
		mui.confirm('是否保存当前修改？', '', btnArray, function(e) {
			if(e.index == 1) {
				if(_cardList.length == 0) {
					mui(".num").each(function() {
						_cardList.push(this.dataset.cardid + ':' + this.innerHTML);
					})
				}
				request("/Card/editCardGroup", {
					brandid: BrandId,
					playerid: storageUser.UId,
					cardgroupidd: CardGroupId,
					cardgroupname: cardName,
					imgurl: plus.storage.getItem('cardUrl'),
					tags: label.join(','),
					remark: keyword,
					cardids: _cardList.join(',')
				}, function(r) {
					if(r.code == -1) {
						appUI.showTopTip(r.msg);
						return;
					}
					mui.fire(plus.webview.getWebviewById("tool/oneCardMe.html"), "updata");
					mui.fire(plus.webview.getWebviewById("tool/cardDetails.html"), 'uploadDetails');
					openNew("addCard.html", {
						BrandId: BrandId,
						CardGroupId: CardGroupId,
						CardNumber: CardTypeNum
					});
				})
			}
		})
	}

});

//标签和备注
document.getElementById("biaoqian").addEventListener("tap", function() {
	log(label);
	openNew("label.html", {
		kind: "biaoqian",
		label: label, //标签
		keyword: keyword //备注
	});
});
document.getElementById("beizhu").addEventListener("tap", function() {
	log(label);
	openNew("label.html", {
		kind: "beizhu",
		label: label, //标签
		keyword: keyword //备注
	});
});

//名称编辑
document.getElementById("hotspot").addEventListener("tap", function(e) {
	e.detail.gesture.preventDefault();
	var btnArray = ['取消', '确定'];
	mui.prompt('请输入套牌名称：', '', 'Kid', btnArray, function(e) {
		if(e.index == 1) {
			if(e.value == "" || e.value.length > 8) {
				mui.toast("请输入1-8个字符！");
				return;
			}
			document.getElementById("cardName").innerHTML = e.value;
			cardName = e.value;
		}
	})
});