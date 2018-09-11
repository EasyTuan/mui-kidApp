var _path = "",
	_cropper,
	_bitmapPath = "_doc/headimg/",
	_bitmapSuffix = "jpeg",
	_headimgname = "",
	dirpath = "";
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
});
mui.plusReady(function() {
	storage.init();
	var imgurl = storageUser.ImgUrl;
	var photodiv = document.getElementById("photo");
	var btn_save = document.getElementById("save");
	photodiv.innerHTML = "<img src='" + imgurl + "' class='defimg'/>";
	storageUser.log();
	log(imgurl)
	document.getElementById("opensel").addEventListener("tap", function() {
		actionSheet();
	});
	btn_save.addEventListener("tap", function() {
		if(_path == "") {
			mui.toast("先选择照片吧");
			actionSheet();
		} else {
			plus.nativeUI.showWaiting("上传图片...");
			uploadMe();
		}
	});
	window.addEventListener('initPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "不是新开的");
		initPage();
		//appPage.closeLogin();
	});
	window.addEventListener('refreshPage', function(event) {
		var pwc = plus.webview.currentWebview();
		log(pwc.id + "刷新页面");
		initPage();
		//appPage.closeLogin();
	});
	//appPage.closeLogin();
});

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
			compressImage(entry.toLocalURL());
		}, function(e) {
			mui.toast("获取图片失败")
		});
	}, function(s) {
		mui.toast("获取图片失败...")
	});
}

function galleryImg() {
	plus.gallery.pick(function(path) {
		compressImage(path);
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
	var suffix = path.split('.')[1].toLowerCase();
	if(suffix != "png") {
		_bitmapSuffix = "jpeg";
	} else {
		_bitmapSuffix = "png";
	}

	log(suffix + "," + _bitmapSuffix)

	document.getElementById("save").setAttribute("style", "");
	var self = this;
	var img = document.createElement("img");
	img.style.display = "none";
	img.id = "img";
	img.src　 = path;
	_path = path;
	plus.nativeUI.showWaiting("读取中...");
	var _date = new Date();
	var _time = _date.getTime();
	img.onload = function() {
		log("img读取消耗：" + (new Date().getTime() - _time));
		log("宽" + this.width + "高" + this.height);
		var photodiv = document.getElementById("photo");
		photodiv.innerHTML = '<img id="cuteimg" src="' + _path + '" style="display:none;">';
		plus.nativeUI.closeWaiting();
		cutImg();
	}
}

function cutImg() {
	var cuteimg = document.getElementById("cuteimg");
	_cropper = $('#photo #cuteimg').cropper({
		aspectRatio: 1 / 1,
		zoomable: false,
	});
	cuteimg.setAttribute("style", "");
}

function uploadMe() {
	log("i am here");
	var result = _cropper.cropper("getCroppedCanvas");
	result.id = "mycanvas";
	$("#canvas1").html(result); //style="display: none;"
	var dataURdataURL;
	try {
		var obj = document.getElementById("mycanvas");
		dataURdataURL = obj.toDataURL('image/' + _bitmapSuffix);
		log("我是dataurl:" + dataURdataURL);
	} catch(e) {
		appUI.showTopTip("出错了...");
		plus.nativeUI.closeWaiting();
		log("bug " + JSON.stringify(e));
	}
	_headimgname = storageUser.UId + '_' + new Date().getTime(); //图片名称,不带后缀
	dirpath = _bitmapPath + _headimgname + "." + _bitmapSuffix;
	var bitmap = new plus.nativeObj.Bitmap("headimg", dirpath);
	if(bitmap) {
		bitmap.clear();
	}
	try {
		bitmap = new plus.nativeObj.Bitmap("headimg");
	} catch(e) {
		mui.toast("出错了...");
		plus.nativeUI.closeWaiting();
		log("bug " + JSON.stringify(e));
	}
	log("这里3" + dataURdataURL);
	bitmap.loadBase64Data(dataURdataURL, function() {
		log("加载Base64图片数据成功");
		bitmap.save(dirpath, {}, function(i) {
			log('保存图片成功：' + JSON.stringify(i));
			bitmap.clear();
			start();
		}, function(e) {
			log('保存图片失败：' + JSON.stringify(e));
			bitmap.clear();
		});
	}, function() {
		log('加载Base64图片数据失败：' + JSON.stringify(e));
		bitmap.clear();
	});
}

function start() {
	var self = this;
	var policyBase64 = Base64.encode(JSON.stringify(policyText))
	var message = policyBase64;
	var bytes = Crypto.HMAC(Crypto.SHA1, message, accesskey, {
		asBytes: true
	});
	var signature = Crypto.util.bytesToBase64(bytes);
	var ossSaveName = 'player/headimg/' + _headimgname + "." + _bitmapSuffix;;
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
			log(JSON.stringify(t))
			log(status)
			if(status == 200) {
				mui.toast("上传成功");
				var url = osshost + ossSaveName;
				log(url);
				storageUser = kidstorageuser.getInstance();
				request("/Player/editPlayerHeadPortrait", {
					playerid: storageUser.UId,
					imgurl: url
				}, function(json) {
					if(json.code == 0) {
						plus.io.resolveLocalFileSystemURL(dirpath, function(entry) {
							log(entry.toLocalURL())
							storageUser.refreshImgUrl(entry.toLocalURL()); //路径刷新为本地图片
							storageUser.log();
						});
						mui.back();
					} else {
						mui.toast(json.msg);
					}
				});

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
	task.addFile(dirpath, {
		key: "file",
		name: "file"
	});
	task.start();
}