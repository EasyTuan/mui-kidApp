mui.init();
var old_back = mui.back;

var label = 0; //标签数量
var objectid = 0; //套牌id

mui.plusReady(function() {
	storage.init();
	var self = plus.webview.currentWebview();
	var kind = self.info.kind;
	var labels = self.info.label;
	keyword = self.info.keyword;
	try {
		objectid = self.info.objectid;
	} catch(e) {

	}
	if(labels.length > 0) {
		for(var i = 0; i < labels.length; i++) {
			var inner = document.getElementById("tap").innerHTML;
			document.getElementById("tap").innerHTML = "<span><i class='tagList'>" + labels[i] + "</i><i class='iconfont icon-close close newClose'></i></span>" + inner;
			label++;
		}
	}
	if(keyword != '') {
		document.getElementById("text").value = keyword;
	}

	if(kind == "biaoqian") {
		document.getElementById("biaoqian").setAttribute("class", "active");
		document.getElementById("beizhu").setAttribute("class", "");
		document.getElementById("text").style.display = "none";
		document.getElementById("label").style.display = "block";
	}

	//返回确认
	//	mui.back = function(){
	//	  var btn = ["确认离开","等一会"];
	//	  mui.confirm('退出将无法保存标签和备注信息','提示',btn,function(e){
	//	    if(e.index==0){
	//	    	//执行mui封装好的窗口关闭逻辑；
	//	    	old_back();
	//	    }
	//	  });
	//	}

	request("/Player/getCardGroupHotTagListByPlayerId", {
		brandid: objectid,
		playerid: storageUser.UId,
		topn: 4
	}, function(r) {
		log(r);
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
			return;
		}
		//render("#tag","tagTep1",r.data);
		render("#manage", "manageTep1", r);
	})

})

//标签备注切换
mui("nav").on("tap", "span", function() {
	if(this.innerText == "备注") {
		document.getElementById("biaoqian").setAttribute("class", "");
		document.getElementById("beizhu").setAttribute("class", "active");
		document.getElementById("text").style.display = "block";
		document.getElementById("label").style.display = "none";
	} else {
		document.getElementById("biaoqian").setAttribute("class", "active");
		document.getElementById("beizhu").setAttribute("class", "");
		document.getElementById("text").style.display = "none";
		document.getElementById("label").style.display = "block";
	}
})

//删除标签
mui("#tap").on("tap", ".iconfont", function() {
	this.parentNode.parentNode.removeChild(this.parentNode);
	label--;

});
mui("#manage").on("tap", ".iconfont", function() {
	this.parentNode.parentNode.removeChild(this.parentNode);
});

//点击常用标签
mui("#manage").on("tap", ".manageList", function() {
	if(label >= 6) {
		mui.toast("标签数量已达上限");
		return;
	}
	var inner = document.getElementById("tap").innerHTML;
	document.getElementById("tap").innerHTML = "<span><i class='tagList'>" + this.innerHTML + "</i><i class='iconfont icon-close close newClose'></i></span>" + inner;
	label++;
});

var manageClose = document.getElementsByClassName("manageClose");
//管理标签
document.getElementById("manag").addEventListener("tap", function() {
	if(this.innerHTML == "编辑") {
		document.getElementById("manag").innerHTML = "完成";
		for(var i = 0; i < manageClose.length; i++) {
			manageClose[i].style.display = "inline-block";
		}
	} else {
		this.innerHTML = "编辑";
		for(var i = 0; i < manageClose.length; i++) {
			manageClose[i].style.display = "none";
		}
	}
})
var newClose = document.getElementsByClassName("newClose");
document.getElementById("newManag").addEventListener("tap", function() {
	if(this.innerHTML == "编辑") {
		document.getElementById("newManag").innerHTML = "完成";
		document.getElementById("addTap").style.display = 'none';
		for(var i = 0; i < newClose.length; i++) {
			newClose[i].style.display = "inline-block";
		}
	} else {
		this.innerHTML = "编辑";
		document.getElementById("addTap").style.display = 'block';
		for(var i = 0; i < newClose.length; i++) {
			newClose[i].style.display = "none";
		}
	}
})

//新建标签
mui('#label').on('tap', '#addTap', function(e) {
	if(label >= 6) {
		mui.toast("标签数量已达上限");
		return;
	}
	e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
	var btnArray = ['取消', '确定'];
	mui.prompt('请输入新标签：', '', '', btnArray, function(e) {
		if(e.index == 1) {
			if(e.value == "" || e.value.length > 8) {
				mui.toast("请输入1-8个字符！");
				return;
			}
			var inner = document.getElementById("tap").innerHTML;
			document.getElementById("tap").innerHTML = "<span><i class='tagList'>" + e.value + "</i><i class='iconfont icon-close close newClose'></i></span>" + inner;
			label++;
		} else {

		}
	})
});

//点击完成提交
document.getElementById("create").addEventListener("tap", function() {
	if(document.getElementById("text").value.length > 80) {
		mui.toast("备注不可超过八十字");
		return;
	}
	//标签
	var label = [];
	mui(".tagList").each(function() {
		label.push(this.innerHTML);
	})
	var str = "," + label.join(',') + ",",
		ckstr;
	for(var i = 0; i < label.length; i++) {
		ckstr = "," + label[i] + ",";
		if(str.replace(ckstr, ",,").indexOf(ckstr) != -1) {
			mui.toast("标签不可重复！")
			return;
		}
	}
	log(label);
	mui.fire(plus.webview.getWebviewById("tool/oneCardMeCreate.html"), "updataLabel", {
		label: label,
		keyword: document.getElementById("text").value
	});
	mui.fire(plus.webview.getWebviewById("tool/oneCardMeEdit.html"), "updataLabel", {
		label: label,
		keyword: document.getElementById("text").value
	});
	old_back();
	mui.toast("保存成功！");
})