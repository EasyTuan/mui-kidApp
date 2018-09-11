var _path = "",
	_cropper,
	_bitmapPath = "../../userfile/headimg/headimg.",
	_bitmapSuffix = "jpeg";
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

var storeid = '', //店铺id
	starNum = 0, //星数
	imgNum = [], //上传图片数
	imgNumber = 0;

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	storeid = self.info.storeid;
	storage.init();

	//评价星级
	mui(".mui-content").on("tap", ".star", function() {
		var index = Number(this.dataset.index);
		var star = document.getElementsByClassName("star");
		for(var i = 0; i < star.length; i++) {
			star[i].setAttribute("class", "iconfont icon-collect_select star");
		}
		for(var i = 0; i < index + 1; i++) {
			star[i].setAttribute("class", "iconfont icon-collect_select star active");
		}
		starNum = index + 1;
		log('当前星数：' + starNum);
	})

	//删除照片
	mui('.imgList').on('tap', '.icon-close', function() {
		this.parentNode.parentNode.removeChild(this.parentNode);
		imgNumber--;
	})

	mui('.imgList').on("tap", '#addImg', function() {
		document.getElementById("text").focus();
		imgNumber < 5 ? actionSheet() : appUI.showTopTip('最多添加五张图片！');
	});

	//提交评论
	document.getElementById("comment").addEventListener("tap", function() {
		var text = document.getElementById("text").value;
		if(text == '') {
			appUI.showTopTip('请写下您的想法吧');
			return;
		}
		imgUrl = [];
		mui('.commentImg').each(function() {
			var imgUrl = this.getAttribute('src');
			imgNum.push(imgUrl);
		})
		log(imgNum.join(","));
		request('/Store/addStoreComment', {
			playerid: storageUser.UId,
			storeid: storeid,
			content: text,
			score: starNum,
			imgurl: imgNum.join(",")
		}, function(r) {
			if(r.code == 0) {
				mui.fire(plus.webview.getWebviewById('index/shopDetails.html'), 'uploadComment');
				mui.fire(plus.webview.getWebviewById('index/commentList.html'), 'uploadComment');
				mui.toast(r.msg);
				mui.back();
			} else {
				appUI.showTopTip(r.msg);
			}
		})
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
				quality: 35,
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
	plus.gallery.pick(function(path) {
		var url = path;
		plus.zip.compressImage({
			src: path,
			dst: path,
			quality: 35,
			overwrite: true
		}, function(e) {
			log("压缩成功");
			compressImage(url);
		}, function() {
			log("压缩失败");
		})
	}, function(err) {
		var code = err.code; // 错误编码
		var message = err.message; // 错误描述信息
		//$.toast(message)
	}, {
		filter: "image"
	});

};

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
	//创建上传任务
	var task = plus.uploader.createUpload(osshost, {
			method: "POST",
			blocksize: 0,
			priority: 10,
			timeout: 10
		},
		function(t, status) {
			plus.nativeUI.closeWaiting();
			plus.uploader.clear();
			//var json = JSON.parse(t.responseText);	
			if(status == 200) {
				mui.toast("上传成功");
				var url = osshost + ossSaveName;
				log(url);
				var imgList = document.getElementsByClassName("imgList")[0].innerHTML;
				document.getElementsByClassName("imgList")[0].innerHTML = "<div class='imgbox'><img class='commentImg' src='" + url + "'/><i class='iconfont icon-close'></i></div>" + imgList;
				imgNumber++;
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