var _path = "",
	_cropper;

var accessid = 'vfxh68Hrfv8Wi6mt';
var accesskey = '8z2BWHdOZG8HokmyMhVrHmlTJy2yXd';
var osshost = 'http://kid-test.oss-cn-shanghai.aliyuncs.com/';
//oss配置
var policyText = {
	"expiration": "2020-01-01T12:00:00.000Z", //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
	"conditions": [
		["content-length-range", 0, 1048576000] // 设置上传文件的大小限制
	]
};

mui.init({
	beforeback: function() {
		appPage.closeLogin();
	}
})

var imgNum = [], //上传图片数
	nodeid = '';

mui('.mui-scroll-wrapper').scroll({
	deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
});

mui.plusReady(function() {
	storage.init();
	nodeid = plus.storage.getItem('nodeid');

	scroll = mui('.mui-scroll-wrapper').scroll();
	document.querySelector('.mui-scroll-wrapper').addEventListener('scroll', function(e) {
		console.log(scroll.y);
	})

	//弹出键盘
	var showKeyboard = function() {
		if(mui.os.ios) {
			var webView = plus.webview.currentWebview().nativeInstanceObject();
			webView.plusCallMethod({
				"setKeyboardDisplayRequiresUserAction": false
			});
			setTimeout(function() {
				document.getElementById("bbsTitle").focus();
			}, 100);
		} else {
			var Context = plus.android.importClass("android.content.Context");
			var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			var main = plus.android.runtimeMainActivity();
			var imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
			imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
			setTimeout(function() {
				document.getElementById("bbsTitle").focus();
			}, 100);
		}
	};

	showKeyboard();

	//删除照片
	mui('.imgList').on('tap', '.icon-close', function() {
		this.parentNode.parentNode.removeChild(this.parentNode);
	})

	//添加图片
	mui('.imgList').on("tap", '#addImg', function() {
		document.getElementById("bbsTitle").blur();
		document.getElementById("bbsMbody").blur();
		actionSheet();
	});

	//发帖
	mui('body').on("tap", '#release', function() {
		var title = document.getElementById("bbsTitle").value;
		if(bbsTitle == '') {
			appUI.showTopTip('请输入标题');
			return;
		}
		var bbsMbody = document.getElementById("bbsMbody").value;
		if(bbsMbody == '') {
			appUI.showTopTip('请输入正文');
			return;
		}
		imgUrl = [];
		mui('.commentImg').each(function() {
			var imgUrl = this.getAttribute('src');
			//imgNum.push(imgUrl);
			bbsMbody = bbsMbody + "<img data-preview-src='' data-preview-group='2' src='" + imgUrl + "'/>";
		})

		var topicico = '';
		try {
			if(document.getElementsByClassName('commentImg')) {
				topicico = document.getElementsByClassName('commentImg')[0].getAttribute('src');
			}
		} catch(e) {
			//TODO handle the exception
		}

		log(bbsMbody);
		//		request('/Topic/addTopic',{
		//			nodeid:nodeid,
		//			title:title,
		//			content:bbsMbody,
		//			topicico:topicico,
		//			playerid:storageUser.UId
		//		},function(r){
		//			if(r.code==0){
		//				mui.fire(plus.webview.getWebviewById('bbs/channelDetails.html'),'uploadList');
		//				mui.fire(plus.webview.getWebviewById('bbs/bbsIndex.html'),'uploadList');
		//				mui.toast(r.msg);
		//				mui.back();
		//			}else{
		//				appUI.showTopTip(r.msg);
		//			}
		//		})
	})

})

function actionSheet() {
	if(mui.os.plus) {
		var a = [{
			title: "拍照"
		}, {
			title: "从手机相册选择"
		}];
		plus.nativeUI.actionSheet({
			cancel: "取消",
			buttons: a
		}, function(b) {
			switch(b.index) {
				case 0:
					break;
				case 1:
					getImage();
					break;
				case 2:
					galleryImg();
					break;
				default:
					break
			}
		})
	}
}

function getImage() {
	var c = plus.camera.getCamera();
	c.captureImage(function(e) {
		plus.io.resolveLocalFileSystemURL(e, function(entry) {
			var url = entry.toLocalURL();
			plus.zip.compressImage({
				src: entry.toLocalURL(),
				dst: entry.toLocalURL(),
				quality: 60,
				overwrite: true
			}, function(e) {
				log("压缩成功!");
				compressImage(entry.toLocalURL());
			}, function() {
				log("压缩失败!");
			})

		}, function(e) {
			mui.toast("获取图片失败")
		});
	}, function(s) {
		mui.toast("获取图片失败...")
	});
}

function galleryImg() {
	plus.gallery.pick(function(e) {
		var url = '';
		for(var i = 0; i < e.files.length; i++) {
			url = e.files[i];
			compressImage(zip(url));
		}
	}, function(err) {
		var code = err.code; // 错误编码
		var message = err.message; // 错误描述信息
		//$.toast(message)
	}, {
		filter: "image",
		multiple: true
	});

};

function zip(url) {
	plus.zip.compressImage({
		src: url,
		dst: url,
		quality: 60,
		overwrite: true
	}, function(e) {
		log("压缩成功");
		return url;
	}, function() {
		log("压缩失败");
	})
	return url;
}

function compressImage(path) {
	log(path);
	plus.nativeUI.showWaiting("上传图片...");
	start(path);
}

function start(path) {
	var policyBase64 = Base64.encode(JSON.stringify(policyText))
	var message = policyBase64;
	var bytes = Crypto.HMAC(Crypto.SHA1, message, accesskey, {
		asBytes: true
	});
	var signature = Crypto.util.bytesToBase64(bytes);
	var ossSaveName = 'player/commentimg/' + storageUser.UId + '_' + new Date().getTime() + ".png";
	var task = 'task' + path;
	//创建上传任务
	task = plus.uploader.createUpload(osshost, {
			method: "POST",
			blocksize: 0,
			priority: 10,
			timeout: 10
		},
		function(t, status) {
			plus.nativeUI.closeWaiting();
			plus.uploader.clear();
			if(status == 200) {
				mui.toast("上传成功");
				var url = osshost + ossSaveName;
				log(url);
				var imgList = document.getElementsByClassName("imgList")[0].innerHTML;
				document.getElementsByClassName("imgList")[0].innerHTML = "<div class='imgbox'><img class='commentImg' src='" + url + "'/><i class='iconfont icon-close'></i></div>" + imgList;
			} else {
				mui.toast("上传失败");
			}
		});

	//oss参数配置
	task.addData("key", ossSaveName);
	task.addData("policy", policyBase64);
	task.addData("OSSAccessKeyId", accessid);
	task.addData("success_action_status", "200");
	task.addData("signature", signature);
	task.addFile(path, {
		key: "file",
		name: "file"
	});
	task.start();
}