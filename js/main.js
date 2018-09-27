var closeLoad = false;
mui.init();
var showMenu = false,
	showPop = "";

var subPages = ["index/home.html", "tool/tool.html", "pk/pk.html", "bbs/bbs.html", "my/user.html"];
var subPagesLoad = [false, false, false, false, false];
var subPageStyle = {
	top: '0',
	bottom: '51px',
	zindex: '0',
	position: 'relative'
}
var self, pkbtn_def, pkbtn_activity, defstyle, deftxt, activetxt, activestyle, activeTab, targetTab, firstPage, tabindex;
mui.plusReady(function() {
	self = plus.webview.currentWebview();
	storage.init();
	plus.navigator.setStatusBarBackground('#fff');
	plus.navigator.setStatusBarStyle('dark');

	for(var i = 0; i < subPages.length; i++) {
		var sub = plus.webview.create(subPages[i], subPages[i], subPageStyle);
		if(i == 0) {
			firstPage = sub;
		}
		self.append(sub);
	}
	plus.webview.show(subPages[0]);

	//底部切換
	activeTab = "index/home.html";
	mui('.mui-bar-tab').on('tap', 'a', function(e) {
		targetTab = this.dataset.href;
		tabindex = this.dataset.index;
		if(targetTab == 'my/user.html') {
			plus.navigator.setStatusBarBackground('#13D1BE');
			plus.navigator.setStatusBarStyle('light');
		} else {
			plus.navigator.setStatusBarBackground('#fff');
			plus.navigator.setStatusBarStyle('dark');
		}
		updatePKBtn(0);
		if(targetTab == activeTab) {
			return;
		}

		log("我是第" + tabindex + ",targetTab=" + targetTab)
		plus.webview.show(targetTab); //显示页面
		if(subPagesLoad[tabindex] == false) {
			mui.fire(plus.webview.getWebviewById(targetTab), 'refreshPage'); //初次刷新页面
			subPagesLoad[tabindex] = true;
		}
		//隐藏当前;
		plus.webview.hide(activeTab);
		//更改当前活跃的选项卡
		activeTab = targetTab;
	});

	//监听popover的状态，用于按下Back的时候逻辑处理
	mui('body').on('shown', '.mui-popover', function(e) {
		//		plus.nativeUI.closeWaiting();
		showPop = true
	})

	//首页返回键处理 逻辑：1秒内，连续两次按返回键，则退出应用；
	var first = null;
	mui.back = function() {
		if(showPop || showMenu) {
			if(showPop) {
				mui('#mainPopoverEl').popover('hide')
				showPop = false
			}
			showMenu ? closeMenu() : void(0);
		} else {
			if(!first) {
				first = new Date().getTime();
				mui.toast('再按一次会退出哦');
				setTimeout(function() {
					first = null;
				}, 1000);
			} else {
				if(new Date().getTime() - first < 1000) {
					plus.runtime.quit();
				}
			}
		}
	};

	// 获取本地应用资源版本号
	//	plus.runtime.getProperty(plus.runtime.appid, function(inf) {
	//		storageUser.refreshVersion(inf.version);
	//		if(storageUser.IsLogin) {
	//			request("/Player/editPlayerDeviceNum", {
	//				playerid: storageUser.UId,
	//				devicenum: JSON.stringify(inf)
	//			}, function(json) {
	//				log(json)
	//			})
	//		}
	//		log("当前应用版本：" + JSON.stringify(inf));
	//		setTimeout(function() {
	//			//alert(inf.version)
	//			checkUpdate(inf.version)
	//		}, 10000)
	//	});
	var needwait = localStorage.getItem("needwait");
	var ck = needwait != null && mui.os.android;
	//alert(needwait+","+mui.os.android+","+ck);
	if(ck) {
		//		mui.alert('恭喜，更新成功了~', '卡游精灵', function() {
		//			localStorage.removeItem("needwait");
		//			createPKBtn();
		//		});		
		setTimeout(function() {
			localStorage.removeItem("needwait");
			//createPKBtn();
		}, 1000 * 4);

	} else {
		//createPKBtn();
	}
})

function createPKBtn() {
	log("我是self：" + JSON.stringify(self))
	if(pkbtn_def || pkbtn_activity)
		return;
	var leftPos = Math.ceil((window.innerWidth - 60) / 2);
	var txtp1, txtp2;
	var iconp1, iconp2;
	if(mui.os.android) {
		txtp1 = {
			top: '2px',
			left: '2px',
			width: '56px',
			height: '56px'
		}
		iconp1 = {
			top: '0px',
			left: '0px',
			width: '60px',
			height: '60px'
		}
		txtp2 = {
			top: '2px',
			left: '2px',
			width: '56px',
			height: '56px'
		}
		iconp2 = {
			top: '1px',
			left: '1px',
			width: '56px',
			height: '56px'
		}
	} else {
		txtp1 = {
			top: '4px',
			left: '0px'
		}
		iconp1 = {
			top: '1px',
			left: '0px',
			width: '60px',
			height: '60px'
		}
		txtp2 = {
			top: '4px',
			left: '0px'
		}
		iconp2 = {
			top: '1px',
			left: '0px',
			width: '60px',
			height: '60px'
		}
	}
	//log("位置：" + txt_t + "," + txt_l + "," + icon_t + "," + icon_l)
	deftxt = {
		tag: 'font',
		id: 'icon',
		text: '\ue702',
		position: txtp1,
		textStyles: {
			fontSrc: '../fonts/iconfont.ttf',
			family: "iconfont",
			size: '56px',
			color: "#717171"
		}
	};
	defstyle = [{
		tag: 'rect',
		id: 'iconBg',
		position: iconp1,
		rectStyles: {
			color: '#fff',
			radius: '30px',
		}
	}, deftxt];
	activetxt = {
		tag: 'font',
		id: 'icon',
		text: '\ue703',
		position: txtp2,
		textStyles: {
			fontSrc: '../fonts/iconfont.ttf',
			family: "iconfont",
			size: '56px',
			color: '#fff'
		}
	};
	activestyle = [{
		tag: 'rect',
		id: 'iconBg',
		position: iconp2,
		rectStyles: {
			color: '#13D1BE',
			radius: '30px',
			borderColor: '#3e7ee7',
			borderWidth: '2px'
		}
	}, activetxt];
	pkbtn_def = new plus.nativeObj.View('pkbtn_def', {
		bottom: '0px',
		left: leftPos + 'px',
		width: '60px',
		height: '65px',
		position: 'dock' //此种停靠方式表明该控件应浮在窗口最上层，以免被其他窗口遮住
	}, defstyle);
	//	var defbmp = new plus.nativeObj.Bitmap('defbmp');
	//	defbmp.load('/images/PKdefault.svg', function() {
	//		log('defbmp.png load success!');
	//		pkbtn_def.drawBitmap(defbmp, {
	//		top: '0px',
	//		left: '0px',
	//		width: '60px',
	//		height: '60px'
	//	}, {
	//		top: '0px',
	//		left: '0px',
	//		width: '60px',
	//		height: '60px'
	//	});
	//		
	//	}, function(e) {
	//		log('defbmp.png load failed! ' + JSON.stringify(e));
	//	});

	pkbtn_activity = new plus.nativeObj.View('pkbtn_activity', {
		bottom: '0px',
		left: (leftPos + 1) + 'px',
		width: '60px',
		height: '65px',
		position: 'dock' //此种停靠方式表明该控件应浮在窗口最上层，以免被其他窗口遮住
	}, activestyle);
	//	var actbmp = new plus.nativeObj.Bitmap('actbmp');
	//	actbmp.load('/images/PK.svg', function() {
	//		log('actbmp.png load success!');
	//		
	//		pkbtn_activity.drawBitmap(actbmp, {
	//		top: '0px',
	//		left: '0px',
	//		width: '60px',
	//		height: '60px'
	//	}, {
	//		top: '0px',
	//		left: '0px',
	//		width: '60px',
	//		height: '60px'
	//	});
	//		
	//	}, function(e) {
	//		log('actbmp.png load failed! ' + JSON.stringify(e));
	//	});
	pkbtn_def.hide();
	pkbtn_activity.hide();

	self.append(pkbtn_activity);
	self.append(pkbtn_def);
	log("当前Webview窗口：" + self.getURL());

	if(mui.os.ios) {
		setTimeout(function() {
			pkbtn_def.draw(defstyle);
			pkbtn_activity.draw(activestyle);

			pkbtn_def.show();

		}, 800);
	} else {
		pkbtn_def.show();
	}

	//自定义监听图标点击事件
	pkbtn_def.addEventListener('click', function(e) {
		updatePKBtn(1);
		targetTab = "pk/pk.html";
		plus.navigator.setStatusBarBackground('#13D1BE');
		plus.navigator.setStatusBarStyle('light');
		if(targetTab == activeTab) {
			return;
		}
		plus.webview.show(targetTab);
		if(subPagesLoad[2] == false) {
			mui.fire(plus.webview.getWebviewById(targetTab), 'refreshPage'); //初次刷新页面
			subPagesLoad[2] = true;
		}
		//隐藏当前;
		plus.webview.hide(activeTab);
		//更改当前活跃的选项卡
		activeTab = targetTab;
		document.getElementsByClassName("mui-active")[0].setAttribute("class", "mui-tab-item");

	});

}

function updatePKBtn(type) {
	//	if(type == 1) { //显示活动
	//		pkbtn_def.hide();
	//		pkbtn_activity.show();
	//	} else { //显示默认
	//		pkbtn_def.show();
	//		pkbtn_activity.hide();
	//	}
}

// 检测更新
function checkUpdate(appVer) {
	mui.ajax(APP_DOMAIN + "/Base/getAPPInfo", {
		//data:{a:"123"},
		//crossDomain: true,
		dataType: 'json', //要求服务器返回json格式数据
		type: 'post', //HTTP请求类型，要和服务端对应，要么GET,要么POST
		timeout: 60000, //超时时间设置为6秒；	
		success: function(json) {
			log("服务应用版本：" + JSON.stringify(json));
			if(json.code == 0) {
				var data = json.data;
				var ckver = data.Version;
				var downurl = data.VersionUrl;
				var ck1 = compareVersion(appVer, ckver),
					ck2;
				log("检测结果1：" + ck1)
				//if(true) {
				if(ck1) {
					ck2 = compareVersion(appVer, ckver, 2);
					log("检测结果2：" + ck2)
					//if(true) { //大版本
					if(ck2) { //大版本
						log("true2")
						mui.openWindow({
							url: 'system/appUpdate.html',
							id: 'system/appUpdate.html',
							styles: {
								background: "transparent"
							},
							extras: {
								info: data //页面传参
							},
							waiting: {
								options: waitingStyle
							},
							show: {
								aniShow: 'slide-in-bottom' //页面显示动画，默认为”slide-in-right“；
							}
						})
					} else { //小更新
						downWgt(downurl);
					}
				} else {

				}
			}

		},
		error: function(xhr, type, errorThrown) { //失败，打一下失败的类型，主要用于调试和用户体验
			//log(mklog() + 'APP更新【' + method + '】错误');
			log(xhr.responseText + " " + xhr.status + " " + xhr.statusText)
			//log(mklog() + 'APP更新【' + method + '】错误T:' + type + '|H:' + errorThrown);
			if(type == 'timeout' || type == 'abort') {
				mui.toast("请求超时：请检查网络：" + type)
			} else {
				mui.toast("服务器累了：" + type)
			}
		}
	}); //ajax end

}
// 下载wgt文件
function downWgt(wgtUrl) {
	var wgtWaiting = '';
	var task = plus.downloader.createDownload(wgtUrl, {
		filename: "_doc/update/"
	}, function(d, status) {
		if(status == 200) {
			log("下载资源成功：" + d.filename);
			installWgt(d.filename); // 安装wgt包
		} else {
			mui.alert("下载升级文件失败！请检查网络再试！", '', function() {});
			//plus.nativeUI.alert("更新资源失败！");
		}
		plus.nativeUI.closeWaiting();
	});
	var totalSize = 0; //总大小
	var downloadedSize = 0;
	task.addEventListener("statechanged", function(download, status) {
		if(download.downloadedSize != 0) {
			downloadedSize = Math.floor(download.downloadedSize / 1048576 * 100) / 100;
		}
		if(download.totalSize != 0) {
			totalSize = Math.floor(download.totalSize / 1048576 * 100) / 100;
		}
		wgtWaiting.setTitle("已下载 " + downloadedSize + 'M /' + totalSize + "M");
	});

	if(plus.os.name == 'Android') {
		var btnArray = ['退出', '立即升级'];
		mui.confirm('有新的更新可用，是否升级', '', btnArray, function(e) {
			if(e.index == 1) {
				task.start();
				wgtWaiting = plus.nativeUI.showWaiting("开始下载");
			} else {
				plus.runtime.quit();
			}
		})
	} else {
		mui.alert('有新的更新可用,请立即升级', '', function() {
			task.start();
			wgtWaiting = plus.nativeUI.showWaiting("开始下载");
		});
	}
}
// 更新应用资源
function installWgt(path) {
	plus.nativeUI.showWaiting("更新中...");
	plus.runtime.install(path, {}, function() {
		plus.nativeUI.closeWaiting();
		log("安装wgt文件成功！");

		localStorage.setItem("needwait", "1");

		//		pkbtn_def.close();
		//		pkbtn_activity.close();

		//plus.nativeUI.alert("应用资源更新完成！", function() {
		plus.runtime.restart();
		//plus.runtime.quit();
		//});
	}, function(e) {
		plus.nativeUI.closeWaiting();
		log("安装wgt文件失败[" + e.code + "]：" + e.message);
		plus.nativeUI.alert("更新资源失败[" + e.code + "]：" + e.message);
	});
}
/**
 * 比较版本大小，如果新版本nv大于旧版本ov则返回true，否则返回false
 * @param {String} ov
 * @param {String} nv
 * @return {Boolean} 
 */
function compareVersion(ov, nv, len) {
	if(!ov || !nv || ov == "" || nv == "") {
		return false;
	}
	var b = false;
	var ova = ov.split(".", len);
	var nva = nv.split(".", len);

	var l = Math.min(ova.length, nva.length)
	for(var i = 0; i < l; i++) {
		var so = ova[i];
		var no = parseInt(so);
		var sn = nva[i];
		var nn = parseInt(sn);

		if(nn > no) {
			b = true;
			break;
		}
	}
	//新1.1.1 旧1.1 为版本升级
	if(nva.length > ova.length && 0 == nv.indexOf(ov)) {
		b = true;
	}
	return b;
}