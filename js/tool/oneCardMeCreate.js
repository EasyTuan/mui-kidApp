mui.init();
var cardList = [], //已选卡牌
	CardTypeNum = "", //卡牌总数
	cardName = "", //套牌名称
	label = [], //标签
	keyword = '', //备注
	BrandId = "",
	cardgroupid = "", //套牌id
	rules = ''; //规则
isEdit = false; //是否增删单卡

mui('.mui-scroll-wrapper').scroll({
	deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
});

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	BrandId = self.info.BrandId;
	storage.init();
	//返回确认
	var old_back = mui.back;
	//	mui.back = function(){
	//	  var btn = ["确认离开","等一会"];
	//	  mui.confirm('退出将无法保存套牌信息','提示',btn,function(e){
	//	    if(e.index==0){
	//	    	old_back();
	//	    }
	//	  });
	//	}

	//缺省套牌名称
	cardName = storageUser.NickName + '的套牌';
	document.getElementById("cardName").innerHTML = cardName;

	//完成
	document.getElementById("create").addEventListener("tap", function() {
		if(cardList.length == 0) {
			mui.toast("请先添加单卡!");
			return;
		}
		if(CardTypeNum == 0) {
			mui.toast("请先添加单卡!");
			return;
		}
		if((rules[0].MinNum + rules[1].MinNum + rules[2].MinNum) > CardTypeNum) {
			mui.toast("套牌最少选" + (rules[0].MinNum + rules[1].MinNum + rules[2].MinNum) + "张！");
			return;
		}
		if((rules[0].MaxNum + rules[1].MaxNum + rules[2].MaxNum) < CardTypeNum) {
			mui.toast("套牌最多选" + (rules[0].MaxNum + rules[1].MaxNum + rules[2].MaxNum) + "张！");
			return;
		}
		cardList = [];
		mui(".num").each(function() {
			if(this.innerHTML != 0) {
				log(this.dataset.cardid);
				log(this.dataset.type);
				cardList.push(this.dataset.cardid + ":" + this.innerHTML);
			}
		})
		log(cardList);
		request("/Card/editCardGroup", {
			brandid: BrandId,
			playerid: storageUser.UId,
			cardgroupidd: cardgroupid,
			cardgroupname: cardName,
			imgurl: plus.storage.getItem('cardUrl'),
			tags: label.join(','),
			remark: keyword,
			cardids: cardList.join(',')
		}, function(r) {
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				return;
			}
			mui.fire(plus.webview.getWebviewById("tool/oneCardMe.html"), "updata");
			old_back();
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

//自定义监听刷新套牌列表
window.addEventListener("updataCardList", function(event) {
	document.getElementById("mainNum").innerHTML = "主牌：" + event.detail.CardTypeNum;
	cardList = event.detail.cardList;
	CardTypeNum = Number(event.detail.CardTypeNum);
	if(cardgroupid == '') {
		//创建套牌id
		request("/Card/createCardGroup", {
			playerid: storageUser.UId,
			cardgroupname: cardName,
			brandid: BrandId,
			imgurl: plus.storage.getItem('cardUrl'),
			remark: keyword,
			tags: label.join(','),
			cardids: cardList.join(',')
		}, function(r) {
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				return;
			}
			mui.fire(plus.webview.getWebviewById("tool/oneCardMe.html"), "updata");
			cardgroupid = r.cardgroupid;
			getList();
		})
	} else {
		request("/Card/editCardGroup", {
			brandid: BrandId,
			playerid: storageUser.UId,
			cardgroupidd: cardgroupid,
			cardgroupname: cardName,
			imgurl: plus.storage.getItem('cardUrl'),
			tags: label.join(','),
			remark: keyword,
			cardids: cardList.join(',')
		}, function(r) {
			if(r.code == -1) {
				appUI.showTopTip(r.msg);
				return;
			}
			mui.fire(plus.webview.getWebviewById("tool/oneCardMe.html"), "updata");
			mui.fire(plus.webview.getWebviewById("tool/oneCardMe.html"), "updata");
			getList();
		})
	}

})

//添加单卡
document.getElementById("addCard").addEventListener("tap", function() {
	if(isEdit) {
		var btn = ["是", "否"];
		mui.confirm('是否保存当前修改', '', btn, function(e) {
			if(e.index == 0) {
				cardList = [];
				mui(".num").each(function() {
					if(this.innerHTML != 0) {
						log(this.dataset.cardid);
						log(this.dataset.type);
						cardList.push(this.dataset.cardid + ":" + this.innerHTML);
					}
				})
				log(cardList);
				request("/Card/editCardGroup", {
					brandid: BrandId,
					playerid: storageUser.UId,
					cardgroupidd: cardgroupid,
					cardgroupname: cardName,
					imgurl: plus.storage.getItem('cardUrl'),
					tags: label.join(','),
					remark: keyword,
					cardids: cardList.join(',')
				}, function(r) {
					if(r.code == -1) {
						appUI.showTopTip(r.msg);
						return;
					}
					mui.fire(plus.webview.getWebviewById("tool/oneCardMe.html"), "updata");
					mui.fire(plus.webview.getWebviewById("tool/oneCardMe.html"), "updata");
					openNew("addCard.html", {
						BrandId: BrandId,
						CardGroupId: cardgroupid,
						CardNumber: CardTypeNum
					});
				})
			}
		});
	} else {
		if(cardgroupid == '') {
			openNew("addCard.html", {
				BrandId: BrandId
			});
		} else {
			openNew("addCard.html", {
				BrandId: BrandId,
				CardGroupId: cardgroupid,
				CardNumber: CardTypeNum
			});
		}
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
	mui.prompt('请输入套牌名称：', '', '', btnArray, function(e) {
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

function getList() {
	request("/Card/getCardGroupDetailByCardGroupId", {
		cardgroupid: cardgroupid
	}, function(r) {
		log(r);
		if(r.code == 0) {
			PlayerId = r.data.PlayerId;
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
					var type = Number(this.dataset.type) - 1;
					var typename = this.dataset.typename;
					if(num <= 0) {
						return;
					}
					if(num == rules[type].MinNum) {
						mui.toast("单张" + typename + "最少选" + rules[type].SingleCardRepeatNum + "张！");
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
					if(CardTypeNum >= rules[type].MaxNum) {
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
}