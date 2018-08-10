//api连接前缀
var APP_DOMAIN = '';

//为true输出日志
var debug = true;









//页面回弹
var sw = document.getElementsByClassName(".mui-scroll-wrapper.scroll");
if(sw) {
	mui('.mui-scroll-wrapper.scroll').scroll();
}

//本地不可清除基础数据
var baseStorage;
//本地临时数据
var temporaryStorage;
//本地登录用户
var storageUser;
//本地用户地址信息
var storageLocation;
//单例 本地存储策略
var kidstorage = (function() {
	//单例数组
	var instancearr = [];

	function _getInstance(keyname) {
		var item;
		for(var i = 0; i < instancearr.length; i++) {
			item = instancearr[i];
			if(item.keyname == keyname) {
				return item.obj;
			}
		}
	}

	function setInstance(_keyname, _obj) {
		var item, oldobj;
		for(var i = 0; i < instancearr.length; i++) {
			item = instancearr[i];
			if(item.keyname == _keyname) {
				item = _obj;
			}
		}
		if(oldobj == undefined || oldobj == null) {
			instancearr.push({
				keyname: _keyname,
				obj: _obj
			})
		}
	}

	//单例方法
	function singlekidstorage(_keyname) {
		var self = this;
		self.keyname = _keyname;
		self.data = {};
		self.log = function() {
			var str = plus.storage.getItem(self.keyname);
			if(self.keyname.indexOf("base") == 0) {
				log("本地不可清除基础数据=" + str);
			} else
				log("本地可清除数据=" + str);
		};
		self.save = function() {
			plus.storage.setItem(self.keyname, JSON.stringify(self.data));
		};
		self.clear = function() {
			plus.storage.removeItem(self.keyname);
		};
		self.setItem = function(key, field, val) {
			var str = plus.storage.getItem(self.keyname);
			var obj = JSON.parse(str || "{}");
			if(str == undefined || str == "" || str == "{}") {
				plus.storage.setItem(self.keyname, JSON.stringify(obj));
			}
			var obj1 = obj[key];
			if(!obj1) {
				obj[key] = {};
			}
			if(field != undefined) { //属性名
				obj[key][field] = val;
				//alert(key + "|" + field + "|" + val)
			} else
				obj[key] = val;
			self.data = obj;
			//log(JSON.stringify(self.data));
			//alert(JSON.stringify(self.data))
			self.save();
		};
		self.getItem = function(key, field) {
			var str = plus.storage.getItem(self.keyname);
			var obj = JSON.parse(str || "{}");
			if(str == undefined || str == "" || str == "{}") {
				return null;
			}
			var obj1 = obj[key];
			if(obj1) {
				if(field != undefined) { //属性名
					return obj[key][field];
				} else
					return obj[key];
			}
			return null;
		};
		self.removeItem = function(key, field) {
			var str = plus.storage.getItem(self.keyname);
			var obj = JSON.parse(str || "{}");
			if(str == undefined || str == "" || str == "{}") {
				return null;
			}
			if(field != undefined) { //属性名
				delete obj[key][field];
			} else
				delete obj[key];
			self.data = obj;
			self.save();
		}
	}
	return {
		getInstance: function(_keyname) { //获取单例对象
			//单例实例 
			var instance = _getInstance(_keyname);
			if(instancearr === undefined || instance == undefined) {
				//log("又一个")
				instance = new singlekidstorage(_keyname);
				setInstance(_keyname, instance);
			}
			return instance;
		}
	};
})();
//所有缓存初始化
var storage = {
	init: function() {

		//本地不可清除基础数据
		baseStorage = kidstorage.getInstance("baseStorageDate");
		//本地临时数据
		temporaryStorage = kidstorage.getInstance("temporaryStorageDate");
		//本地登录用户
		storageUser = kidstorageuser.getInstance();
		//本地用户地址信息
		storageLocation = kidstoragelocation.getInstance();
	}
}
//单例 登录用户本地存储策略
var kidstorageuser = (function() {
	var keyname = 'user'; //缓存key
	var keyname_uid = "id",
		keyname_nickname = "nickname",
		keyname_realname = "realname",
		keyname_username = "username",
		keyname_imgurl = "imgurl",
		keyname_signature = "signature",
		keyname_msgnoreadcount = "msgnoreadcount",
		keyname_mobile = "mobile",
		keyname_version = "version";
	//单例方法 
	function singlekidstorageuser() {
		var self = this;
		init(self);
		self.log = function() {
			log(JSON.stringify(self));
		};
		self.login = function(data) { //登录成功保存数据					
			var args = {
				id: data.PlayerId,
				username: data.Mobile,
				mobile: data.Mobile,
				nickname: data.NickName,
				imgurl: data.ImgUrl || "../../images/defuser.jpg",
				signature: data.SelfdomSign,
				//cityid:data.CityId
			}
			self.refreshUserName(args.username) //单独设置登录名
			self.refreshMobile(args.mobile) //单独设置手机
			self.refreshNickName(args.nickname); //单独设置昵称
			baseStorage.setItem(keyname, undefined, args);
			init(self);
			//appPage.closeAllPage();
			//通知用户中心页，登录了
			//			var backid = "my/user.html";
			//			var backpage = plus.webview.getWebviewById(backid);
			//			if(backpage) {
			//				mui.fire(backpage, 'loginIn')
			//			}
		};
		self.loginOut = function() { //登出清空数据
			baseStorage.removeItem(keyname);
			kidstoragesearchhistory.clear();
			init(self);
			appPage.closeAllPage();
			//通知用户中心页，登出了
			//			var backid = "my/user.html";
			//			var backpage = plus.webview.getWebviewById(backid);
			//			if(backpage) {
			//				mui.fire(backpage, 'loginOut')
			//			}
		};
		self.refreshField = function(field, val) {
			if(field == keyname_signature) {
				self.refreshSignature(val);
			} else if(field == keyname_imgurl) {
				self.refreshImgUrl(val);
			} else if(field == keyname_mobile) {
				self.refreshMobile(val);
			} else if(field == keyname_realname) {
				self.refreshRealName(val);
			}
			//			else if(field == keyname_imgurl) {
			//				self.refreshImgUrl(val);
			//			} else if(field == keyname_imgurl) {
			//				self.refreshImgUrl(val);
			//			} else if(field == keyname_imgurl) {
			//				self.refreshImgUrl(val);
			//			} else if(field == keyname_imgurl) {
			//				self.refreshImgUrl(val);
			//			} else if(field == keyname_imgurl) {
			//				self.refreshImgUrl(val);
			//			} 

		};
		self._refreshField = function(field, val) {
			baseStorage.setItem(keyname, field, val);
			init(self);
		};
		self.refreshVersion = function(val) {
			baseStorage.setItem(keyname_version, undefined, val); //单独设置版本
			self.Version = baseStorage.getItem(keyname_version) || "";
		};
		//刷新登录名
		self.refreshUserName = function(val) {
			baseStorage.setItem(keyname_username, undefined, val); //单独设置登录名
			self.UserName = baseStorage.getItem(keyname_username) || "";
		};

		//刷新昵称
		self.refreshNickName = function(val) {
			baseStorage.setItem(keyname_nickname, undefined, val); //单独设置登录名
			self.NickName = baseStorage.getItem(keyname_nickname) || "";

		};
		//刷新真实姓名
		self.refreshRealName = function(val) {
			self._refreshField(keyname_realname, val);
		};
		//刷新头像
		self.refreshImgUrl = function(val) {
			self._refreshField(keyname_imgurl, val);

			//刷新页面显示
			var user_page = plus.webview.getWebviewById("my/user.html");
			//var myinfo_page = plus.webview.getWebviewById("my/myInfo.html");
			if(user_page) {
				mui.fire(user_page, 'initPage')
			}
			//			if(myinfo_page) {
			//				mui.fire(myinfo_page, 'initPage')
			//			}

		};
		//下载头像
		self.downloadImg = function(url) {

			//			plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
			//				log("fsname=" + fs.name);
			//				// 创建读取目录信息对象 
			//				var directoryReader = fs.root.createReader();
			//				directoryReader.readEntries(function(entries) {
			//					var entry, headimgreader, headimgentries, headentry;
			//					for(var i = 0; i < entries.length; i++) {
			//						entry = entries[i];
			//						log("i name="+entry.name)
			//						if(entry.name == "headimg") {
			//							headimgreader = entry.createReader();
			//							headimgreader.readEntries(function(headimgentries) {
			//								for(var j = 0; j < headimgentries.length; j++) {
			//									headentry = headimgentries[j];
			//									log(headentry.name);
			//									headentry.remove();
			//								}
			//							});
			//							break;
			//						}
			//						
			//						//entry.remove();
			//					}
			//
			//
			//				}, function(e) {
			//					alert("Read entries failed: " + e.message);
			//				});
			//			}, function(e) {
			//				alert("Request file system failed: " + e.message);
			//			});

			plus.downloader.createDownload(url, {
				filename: "_doc/headimg/"
			}, function(d, status) {
				if(status == 200) {
					plus.io.resolveLocalFileSystemURL(d.filename, function(entry) {
						log("下载头像成功：" + entry.toLocalURL());
						self.refreshImgUrl(entry.toLocalURL()); //路径刷新为本地图片
						self.log();
					});
				} else {

				}
			}).start();
		}
		//刷新签名
		self.refreshSignature = function(val) {
			self._refreshField(keyname_signature, val);

		};
		//刷新手机号
		self.refreshMobile = function(val) {
			baseStorage.setItem(keyname_mobile, undefined, val); //单独设置登录名
			self.Mobile = baseStorage.getItem(keyname_mobile) || "";
		};
	}

	function init(_self) {
		_self.UId = baseStorage.getItem(keyname, keyname_uid) || 0;
		_self.Mobile = baseStorage.getItem(keyname_mobile) || "";
		_self.UserName = baseStorage.getItem(keyname_username) || "";
		_self.NickName = baseStorage.getItem(keyname_nickname) || "";
		_self.RealName = baseStorage.getItem(keyname, keyname_realname) || "";
		_self.ImgUrl = baseStorage.getItem(keyname, keyname_imgurl) || "";
		_self.Signature = baseStorage.getItem(keyname, keyname_signature) || "";
		_self.Version = baseStorage.getItem(keyname_version) || "";
		_self.IsLogin = _self.UId > 0;
	}
	//单例实例 
	var instance;

	//返回对象 
	return {
		getInstance: function(args) {
			//if(instance === undefined) {
			//log("一个心得")
			instance = new singlekidstorageuser(args);
			//}
			return instance;
		},

	};
})();
//用户位置
var kidstoragelocation = (function() {
	var keyname = 'location'; //缓存key
	var keyname_lon = "lon",
		keyname_lat = "lat",
		keyname_province = "province",
		keyname_city = "city",
		keyname_district = "district",
		keyname_addresses = "addresses",
		keyname_timestamp = "timestamp",
		keyname_position = "position",
		keyname_cityid = "cityid",
		againNum=0;
	//单例方法 
	function singlekidstoragelocation() {
		var self = this;
		init(self);
		self.log = function() {
			log(JSON.stringify(self));
		};
		//刷新缓存中值
		self.refreshData = function(data) {
			if(!data || !data.coords || !data.address) {
				return;
			}
			var lon = data.coords.longitude,
				lat = data.coords.latitude,
				province = data.address.province || "",
				city = data.address.city || "",
				district = data.address.district || "",
				addresses = data.addresses,
				timespan = data.timestamp,
				position = data;

			self.Lon = lon || "";
			self.Lat = lat || "";
			self.Province = province || "";
			self.City = city || "";
			self.District = district || "";
			self.Addresses = addresses || "";
			self.Position = JSON.stringify(position) || "";
			self.Timestamp = timespan || "";

			if(city) {
				//刷新城市id
				request("/Base/getPlaceInfo", {
					cityname: city
				}, function(json) {
					if(json.code == 0) {
						log("城市id刷新成功" + json.data.CityId)
						self.CityId = json.data.CityId
						baseStorage.setItem(keyname, keyname_cityid, self.CityId);
					}
				});
			}

			baseStorage.setItem(keyname, keyname_lon, self.Lon);
			baseStorage.setItem(keyname, keyname_lat, self.Lat);
			baseStorage.setItem(keyname, keyname_province, self.Province);
			baseStorage.setItem(keyname, keyname_city, self.City);
			baseStorage.setItem(keyname, keyname_district, self.District);
			baseStorage.setItem(keyname, keyname_addresses, self.Addresses);
			baseStorage.setItem(keyname, keyname_timestamp, self.Position);
			baseStorage.setItem(keyname, keyname_position, self.Timestamp);

			self.log();
		};

		self.refreshCityId = function(cityid) {
			baseStorage.setItem(keyname, keyname_cityid, cityid);
		};

		//定时刷新位置信息
		self.timeRefresh = function(interval) {
			interval = interval || 0;
			if(interval == 0) { //只刷新一次
				plus.geolocation.getCurrentPosition(function(position) {
					self.refreshData(position);
					log('位置信息++++：'+JSON.stringify(position));
					plus.storage.setItem('location',true);
				}, function(e) {
					var btnArray = ['否', '是'];
					mui.confirm('定位失败，是否请手动选择城市?', '', btnArray, function(e) {
						if (e.index == 1) {
							openNew('index/citySelect.html');
						}else{
							if(!plus.storage.getItem('whether')){
								//取消手动定位，默认设置上海
								var posi={
								    "coordsType": "wgs84",
								    "address": {
								        "district": "徐汇区",
								        "country": "中国",
								        "street": "桂平路",
								        "city": "上海市",
								        "streetNum": "415号"
								    },
								    "addresses": "桂平路415号",
								    "coords": {
								        "latitude": 31.16612421590823,
								        "longitude": 121.3995927625786,
								        "accuracy": 65,
								        "altitude": 61.54365158081055,
								        "heading": null,
								        "speed": null,
								        "altitudeAccuracy": 10
								    },
								    "timestamp": 1506496454842.604
								};
								plus.storage.setItem('location',false);
								self.refreshData(posi);
								mui.fire(plus.webview.getWebviewById('index/home.html'),"citySelect",{
									city:'上海市'
								});
							}
						}
					})
				}, {
					geocode: true
				});
			} else if(interval > 0) { //每隔几秒刷新一次				
				var timer = setInterval(function() {
					plus.geolocation.getCurrentPosition(function(position) {
						self.refreshData(position);
						log('位置信息++++：'+JSON.stringify(position));
						plus.storage.setItem('location',true);
						if(storageUser.UId > 0) {
							request("/Player/savePlayerLonLat", {
								playerid: storageUser.UId,
								lon: position.coords.longitude,
								lat: position.coords.latitude
							}, function(json) {
								log("位置更新成功，" + JSON.stringify(json))
							});
						}
					}, function(e) {
						
					}, {
						geocode: true
					});
				}, interval);
			}
		}
	}

	function init(_self) {
		_self.Lon = baseStorage.getItem(keyname, keyname_lon) || "";
		_self.Lat = baseStorage.getItem(keyname, keyname_lat) || "";
		_self.Province = baseStorage.getItem(keyname, keyname_province) || "";
		_self.City = baseStorage.getItem(keyname, keyname_city) || "";
		_self.District = baseStorage.getItem(keyname, keyname_district) || "";
		_self.Addresses = baseStorage.getItem(keyname, keyname_addresses) || "";
		_self.Position = baseStorage.getItem(keyname, keyname_position) || "";
		_self.Timestamp = baseStorage.getItem(keyname, keyname_timestamp) || "";
		_self.CityId = baseStorage.getItem(keyname, keyname_cityid) || "";
	}
	//单例实例 
	var instance;
	//返回对象 
	return {
		getInstance: function(args) {
			//if(instance === undefined) {
			//log("一个心得")
			instance = new singlekidstoragelocation(args);
			//}
			return instance;
		}
	};
})();
//用户搜索数据缓存
var kidstoragesearchhistory = (function() {

	var keyname = "searchhistory";

	function singlekidstoragesearchhistory(field) {
		var self = this;
		self.list = function() {
			var jsonstr = baseStorage.getItem(keyname, field) || "{}";
			return JSON.parse(jsonstr);
		};
		self.update = function(val) {
			val = val.trim();
			var jsonstr = baseStorage.getItem(keyname, field) || "{}";
			var _list = JSON.parse(jsonstr);
			if(_list && _list.length > 0) {
				var index = -1;
				var item;
				for(var i = 0; i < _list.length; i++) {
					item = _list[i];
					if(item == val) {
						index = i;
					}
				}
				if(index == -1) { //不存在，加到第一个位置上
					_list.unshift(val);
				} else { //存在，移动到首位
					_list.splice(index, 1);
					_list.unshift(val);
				}
				if(_list.length > 10) { //删除第11个
					_list.pop();
				}
				baseStorage.setItem(keyname, field, JSON.stringify(_list));
			} else {
				_list = [];
				_list.push(val);
				jsonstr = JSON.stringify(_list);
				baseStorage.setItem(keyname, field, jsonstr);
			}
		};
		self.clear = function() {
			baseStorage.removeItem(keyname, field);
		};
	}
	//单例实例 
	var instance;

	//返回对象 
	return {
		getInstance: function(field) {
			instance = new singlekidstoragesearchhistory(field);
			return instance;
		},
		clear:function(){
			baseStorage.removeItem(keyname);
		}
	}
})();
//全部搜索历史对象
var appSearchHistory = {
	//搜索朋友
	searchFriends: kidstoragesearchhistory.getInstance("searchfriendhistory"),
	//搜索赛事
	searchMatch: kidstoragesearchhistory.getInstance("searchmatchhistory"),
	//搜索城市
	searchCity: kidstoragesearchhistory.getInstance("searchcityhistory"),
	//搜索战帖
	searchFight: kidstoragesearchhistory.getInstance("searchFighthistory"),
	//搜索新闻
	searchNews: kidstoragesearchhistory.getInstance("searchnewshistory"),
	//搜索店铺
	searchShop: kidstoragesearchhistory.getInstance("searchShophistory"),
	//搜索附近的人
	searchPeople: kidstoragesearchhistory.getInstance("searchPeoplehistory"),
	//首页搜索
	searchHome: kidstoragesearchhistory.getInstance("searchhomehistory"),
	//搜索论坛
	searchBbs: kidstoragesearchhistory.getInstance("searchbbshistory")
}
//ui设置
var appUI = {
	showWaiting: function() {
		plus.nativeUI.showWaiting();
	},
	closeWaiting: function() {
		plus.nativeUI.closeWaiting()
	},
	setDisabled: function(self) {
		self.setAttribute("disabled", "disabled");
	},
	removeDisabled: function(self) {
		self.removeAttribute("disabled");
	},
	countDown: function(date) {
		if(!date) {
			var obj = {
				day: 0,
				hour: 0,
				minute: 0,
				second: 0
			};
			return obj;
		}

		var arydates = new Array();
		arydates = date.split(' ')[0].split('-');
		var arytimes = new Array();
		arytimes = date.split(' ')[1].split(':');
		var date1 = new Date(arydates[0], parseInt(arydates[1]) - 1, arydates[2], arytimes[0], arytimes[1], arytimes[2]);

		var timediff = Math.floor(date1.getTime() - new Date().getTime()) / 1000;

		if(timediff < 0) {
			var obj = {
				day: 0,
				hour: 0,
				minute: 0,
				second: 0
			};
			return obj;
		}

		var days = Math.floor(timediff / 86400);
		timediff -= days * 86400;
		var hours = Math.floor(timediff / 3600) % 24;
		timediff -= hours * 3600;
		var minutes = Math.floor(timediff / 60) % 60;
		timediff -= minutes * 60;
		var seconds = Math.floor(timediff % 60);

		var obj = {
			day: days,
			hour: hours+days*24,
			minute: minutes,
			second: seconds
		};
		return obj;
	},
	showTopTip: function(msg) { //头部显示提示信息
		if(msg && msg != "") {
			var tip = document.getElementById("toptip");
			var haveTip = tip != undefined;
			if(haveTip) {
				tip.setAttribute("class", "showend");
			} else {
				tip = document.createElement("div");
				tip.id = "toptip";
				var node;
				if(document.body.children[0]) {
					node = document.body.children[0];
					document.body.insertBefore(tip, node); //插入到body第一个元素之前
				} else {
					document.body.appendChild(tip);
				}
			}
			tip.innerText = msg;
			tip.setAttribute("class", "show");
			setTimeout(function() {
				tip.setAttribute("class", "showend");
			}, "3000");
		}
	}

}

//页面对象
var appPage = {
	//获取页面参数
	getParam: function(name) {
		var currPage = plus.webview.currentWebview();
		if(mui.os.plus) {
			//log(currPage.id + "的全部参数=" + JSON.stringify(currPage));
			if(currPage.info)
				return currPage.info[name] || null;
			else
				return null;
		} else {
			return null;
		}
	},
	//关闭当前页
	close: function() {
		var currPage = plus.webview.currentWebview();
		plus.webview.close(currPage);
	},
	//关闭当前页，并跳转到指定页
	closeAndBackUrl: function(url, param) {
		var currPage = plus.webview.currentWebview();
		plus.webview.close(currPage);
		openNew(url, param);
	},
	registerCheckLoginEvent: function() { //需检测登录状态并绑定事件的地方
		this.initCheckLoginEvent(); //初始化检测登录事件	

		//var ckpageid=["my/user.html","","","","",""];

	},
	initCheckLoginEvent: function() { //初始化检测登录事件	
		var self = this;
		mui("body").off("tap", ".ckecklogin"); //清除原来事件
		mui("body").on("tap", ".ckecklogin", function() {
			storageUser = kidstorageuser.getInstance();
			var backid = this.getAttribute("data-loginbackid");
			var loginevent = this.getAttribute("data-loginevent");
			if(!storageUser.IsLogin) { //未登录	
				if(backid) {
					self.openLogin({
						backid: backid
					});
				}

			} else { //已登录
				if(loginevent)
					eval(loginevent);
				//openNew(backid.replace("my/",""))
			}
		});
	},
	closeLogin: function() { //验证登录的页，window initpage事件里要检测关闭登录页
		var _login = plus.webview.getWebviewById("login/login.html");
		var _mobileLogin = plus.webview.getWebviewById("login/mobileLogin.html");
		var _reg = plus.webview.getWebviewById("login/reg.html");
		var _setPwd = plus.webview.getWebviewById("login/setPwd.html");
		var _forgetPwd = plus.webview.getWebviewById("login/forgetPwd.html");
		var needClose = _login || _mobileLogin || _reg || _setPwd || _forgetPwd;

		if(needClose) {
			//setTimeout(function() {
			if(_login) {
				_login.close();
				log("关闭了:_login");
			}
			if(_mobileLogin) {
				_mobileLogin.close();
				log("关闭了:_mobileLogin");
			}
			if(_reg) {
				_reg.close();
				log("关闭了:_reg");
			}
			if(_setPwd) {
				_setPwd.close();
				log("关闭了:_setPwd");
			}
			if(_forgetPwd) {
				_forgetPwd.close();
				log("关闭了:_forgetPwd");
			}

			//}, 1000);
		}

	},
	openLogin: function(param) { //打开登录页
		openNew("../login/login.html", param);
	},
	loginBack: function(backid, backurl) { //登录成功，执行跳转或刷新页面操作

		storageUser = kidstorageuser.getInstance();
		storageUser.log();

		if(storageUser.IsLogin) {

			var backpage = plus.webview.getWebviewById(backid);
			log("backid=" + backid + " backurl" + backurl);
			if(backpage) { //存在，先刷新
				log("存在:" + backurl)
				mui.fire(backpage, 'refreshPage', {
					comepage: "login"
				});
			} else {
				log("不存在" + backurl)
			}
			//页面刷新完，执行跳转或重新打开
			if(backid == "my/user.html" || backid == "bbs/bbsChannel.html") {
				mui.back();
			} else {
				log("不存在打开我:" + backurl)
				openNew(backurl, {
					comepage: "login"
				});
			}
			mui.fire(plus.webview.getWebviewById("pk/pk.html"), 'refreshPage');
			mui.fire(plus.webview.getWebviewById("tool/tool.html"), 'refreshPage');
			mui.fire(plus.webview.getWebviewById("my/user.html"), 'refreshPage');
			mui.fire(plus.webview.getWebviewById("bbs/bbs.html"), 'refreshPage');
			mui.fire(plus.webview.getWebviewById("bbs/bbsIndex.html"), 'refreshPage');
			mui.fire(plus.webview.getWebviewById("bbs/bbsChannel.html"), 'refreshPage');
			//appPage.closeAllPage(backid, true);

			//return false;
		}
	},
	closeAllPage: function(backid, ckprevpage) { //退出登录，关闭所有打开的二级页面，main下打开的二级除外

		var allpage = plus.webview.all(),
			pageid, str, currpage = plus.webview.currentWebview();
		ckprevpage = ckprevpage || false; //是否检测前一页，如果关闭时候是前一页，延迟关闭，否则会导致未打开新页面，就已关闭前一页，打开页面也会失败
		for(var i = 0; i < allpage.length; i++) {
			pageid = allpage[i].id;
			log("webview" + i + ": " + pageid);

			if(pageid == "HBuilder" || pageid == "cn.kayou110.kidapp") {
				//alert(pageid)
			} else if(pageid == "index/home.html" || pageid == "main.html") {

			} else if(pageid == "pk/pk.html" || pageid == "tool/tool.html" || pageid == "my/user.html" || pageid == "bbs/bbs.html" || pageid == "bbs/bbsIndex.html" || pageid == "bbs/bbsChannel.html") {
				log("刷新了：" + pageid);
				mui.fire(plus.webview.getWebviewById(pageid), 'refreshPage');
			} else {
				log("关闭了：" + pageid);
				allpage[i].close();
			}
		}
	},
	imgInit: function() { //图片加载
		var url, wh, arr, w, h, isok, isdefuserimg, cls, whstr, src, model;
		mui(".loadthumb").each(function() {
			cls = this.getAttribute("class") || "";
			isok = cls.replace(/\s/g, '').length != 0 && cls.indexOf("loadok") != -1;
			isdefuserimg = cls.replace(/\s/g, '').length != 0 && cls.indexOf("defuserimg") != -1;
			if(isok)
				return;
			this.setAttribute("onerror", "javascript:this.src='../../images/nopic.jpg';");

			url = this.getAttribute("data-url");
			if(isdefuserimg && url.trim() == "") {
				this.src = "../../images/defuser.jpg";
				return;
			} else if(url.trim() == "") {
				this.src = "../../images/nopic.jpg";
				return;
			}
			wh = this.getAttribute("data-wh");
			model = this.getAttribute("data-model") || "m_mfit";
			arr = wh.split(",");
			w = arr[0];
			h = arr[1];
			whstr = "", src = "";
			if(w != "") {
				whstr += ',w_' + w;
			}
			if(h != "") {
				whstr += ',h_' + h;
			}
			if(whstr == "") {
				src = url;
			} else if(url.indexOf(".aliyuncs.com") != -1) {
				if(w != "" && h != "") {//表示固定尺寸
					model = 'm_pad';
				}
				src = url + '?x-oss-process=image/resize,' + model + whstr;
			} else {
				src = url;
			}
			this.setAttribute("onload", "javascript:appPage.imgLoadCallback(this,'" + cls + "');");
			this.src = src;
			log("," + w + "," + h + " " + this.src)
		});
	},
	imgLoadCallback: function(obj, cls) {
		//alert(cls);
		obj.setAttribute("class", cls.replace("loadthumb", "loadok")); //移除缩略图处理样式，添加处理完成样式
	},
	imgPreviewInit: function() { //图片预览初始化
		mui(".preview").each(function() {

		});
	},
	endPullRefresh: function(stopup, id) { //上拉加载、下拉刷新动画结束
		//stopup 上拉加载
		//stopdown 下拉刷新
		//是否重置插件
		//id 容器id
		if(id == undefined) //容器id
			id = "pullrefresh";

		setTimeout(function() {
			//停止下拉刷新
			mui('#' + id).pullRefresh().endPulldownToRefresh(true);
			//重置
			mui('#' + id).pullRefresh().refresh(true);
			if(stopup != undefined) { //不为空表示，页面包含 上拉加载事件
				//停止上拉加载
				mui('#' + id).pullRefresh().endPullupToRefresh(stopup);
			}

		}, 1000);
	},
	enablePullRefresh: function(enable, id) { //禁用、启用上拉加载、下拉刷新
		if(id == undefined) //容器id
			id = "pullrefresh";
		if(enable) { //禁用
			//mui('#' + id).pullRefresh().endPulldown(true);
			mui('#' + id).pullRefresh().disablePullupToRefresh(); //禁用上拉加载			
		} else { //启用
			mui('#' + id).pullRefresh().enablePullupToRefresh(); //启用上拉加载
			mui('#' + id).pullRefresh().refresh(true);
		}
	}
};

//公共js文件

var PAY_DOMAIN = ''

/**
 * 打印日志
 */

function log(data) {
	if(debug) {
		if(typeof(data) == "object") {
			console.log(JSON.stringify(data)); //console.log(JSON.stringify(data, null, 4));
		} else {
			console.log(data);
		}
	}
}

/**
 * @description 调试用的时间戳
 * @author suwill
 * @param {none} 不需要参数
 * @example mklog()
 */
function mklog() {
	var date = new Date(); //新建一个事件对象
	var seperator1 = "/"; //日期分隔符
	var seperator2 = ":"; //事件分隔符
	var month = date.getMonth() + 1; //获取月份
	var strDate = date.getDate(); //获取日期
	var ss = date.getSeconds(); //获取秒
	if(month >= 1 && month <= 9) { //判断月份
		month = "0" + month;
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	if(ss >= 0 && ss <= 9) {
		ss = "0" + ss;
	}
	var ms = date.getMilliseconds();
	if(ms >= 10 && ms <= 100) {
		ms = '0' + ms;
	} else if(ms >= 0 & ms <= 9) {
		ms = '00' + ms;
	}
	var currentdate = ('2' + date.getYear() - 100) + seperator1 + month + seperator1 + strDate + " " + date.getHours() + seperator2 + date.getMinutes() + ":" + ss + "'" + ms;
	//	var currentdate = date.getHours() + seperator2 + date.getMinutes() + ":" + ss + "'" + ms;

	return currentdate + '|';
}
/**
 * @description 返回所有窗口的艾迪
 * @author suwill
 * @param {none} 不需要参数
 * @example mkwv();
 */
function mkwv() {
	var wvs = plus.webview.all(); //循环显示当前webv
	var t1 = "|debug:当前共有" + wvs.length + "个webview\n";
	var t2 = "";
	for(var i = 0; i < wvs.length; i++) {
		t2 += "|webview" + i + "|id:" + wvs[i].id + "|@url:" + wvs[i].getURL().substr(82) + '\n';
	}
	return t1 + t2;
}

var waitingStyle = {
	style: "black",
	color: "#FF0000",
	background: "rgba(0,0,0,0)",
	loading: {
		icon: "../../images/loading.png",
		display: "inline"
	}
}

/**
 * @description 新开窗口
 * @param {URIString} target  需要打开的页面的地址
 * @param {Object} parm 传递的对象
 * @param {Boolean} autoShow 是否自动显示
 * @example openNew({URIString});
 * */
function openNew(target, parm, autoShow) {
	var currPageId = plus.webview.currentWebview().id;
	var id = "main.html"; //除了一级目录，其它目录id组成结构为：二级文件夹/页面.html
	if(currPageId != undefined) {
		var sp_xg = target.split("/");
		if(sp_xg.length == 3) //target结构为 ../二级文件夹/页面.html,表示跨文件夹打开页面
		{
			id = sp_xg[1] + "/" + sp_xg[2];
		} else if(sp_xg.length == 2) { //target结构为 二级文件夹/页面.html，表示html下一级目录打开页面
			id = target;
		} else { //同级打开页面，需从currpageid中拿取二级文件夹名
			var curr_sp_xg = currPageId.split("/");
			id = curr_sp_xg[0] + "/" + sp_xg[0];
		}
	}
	var isAutoShow = autoShow || true;
	log("currPageId=" + currPageId + " target=" + target + " id=" + id + " parm=" + JSON.stringify(parm) + " isAutoShow=" + isAutoShow);
	mui.openWindow({
		url: target,
		id: id,
		show: {
			autoShow: isAutoShow, //页面loaded事件发生后自动显示，默认为true
			aniShow: 'pop-in',
			duration: 200
		},
		waiting: {
			autoShow: true,
			options: waitingStyle
		},
		extras: {
			info: parm
		}
	})
}
//var b=md5('13644656698+123123');
//var a=md5.hex('13644656698+123123');
//log(a);
//log(b);

function md5sign(parm) {
	var signstr = "";
	for(var p in parm) {
		signstr += "+" + parm[p];
	}
	signstr = signstr.replace("+", "");
	//log(signstr);
	var md5str = md5(signstr);
	return md5str;
}
/**
 * @description 获取数据
 * @param {URIString} method  需要请求数据的接口地址
 * @param {Object} parm 提交的参数
 * */
function request(method, parm, callback, showwait, errcallback, shownetmsg) {
	showwait = showwait == undefined ? false : showwait; //若需要显示等到，传递true
	shownetmsg = shownetmsg == undefined ? true : shownetmsg;
	if(showwait)
		appUI.showWaiting();
	parm.hmac = md5sign(parm);
	mui.ajax(APP_DOMAIN + method, {
		data: parm,
		dataType: 'json', //要求服务器返回json格式数据
		type: 'GET', //HTTP请求类型，要和服务端对应，要么GET,要么POST
		timeout: 60000, //超时时间设置为6秒；
		beforeSend: function() {
			log(mklog() + '【AJAX:-->】【' + method + '】【P=' + JSON.stringify(parm) + '】');
			setRequestMsg("加载中...");
		},
		success: function(data) {
			//alert(method+data)
			log(mklog() + '【AJAX:OK!】' + method + '】【响应：' + JSON.stringify(data) + '】');
			if(data && data.code && data.code != undefined) {
				setRequestMsg("");
				log(mklog() + '【AJAX:OK!】【' + method + '】【合法数据：' + JSON.stringify(data) + '】');
				callback(data);
			} else {
				setRequestMsg("服务器繁忙,请稍后再试");
			}
		},
		error: function(xhr, type, errorThrown) { //失败，打一下失败的类型，主要用于调试和用户体验
			log(mklog() + '【AJAX:ERR!】【' + method + '】错误');
			log(xhr.responseText + " " + xhr.status + " " + xhr.statusText)
			if(showwait)
				appUI.closeWaiting();
			log(xhr.status)
			log(mklog() + '【AJAX:ERR】【' + method + '】错误T:' + type + '|H:' + errorThrown);
			if(type == 'timeout' || type == 'abort') {
				setRequestMsg("请求超时：请检查网络");
				if(shownetmsg)
					mui.toast("请求超时：请检查网络：" + type)
			} else {
				setRequestMsg("服务器累了");
				if(shownetmsg)
					mui.toast("服务器累了：" + type)
			}
			if(errcallback) {
				errcallback();
			}
		},
		complete: function() {
			//setRequestMsg("");
			log(mklog() + '【AJAX:END】【' + method + '】【命令执行完成】');
			if(showwait)
				appUI.closeWaiting();
		}
	}); //ajax end
} //获取数据结束
function setRequestMsg(msg) {
	var arr = mui(".nodata");
	if(arr) {
		for(var i = 0; i < arr.length; i++) {
			arr[i].innerText = msg;
		}
	}
}
/**
 * @description 获取数据
 * @param {String} payType  支付类型微信还是支付宝
 * @param {Object} parm 提交的参数
 * */
function getPayData(payType, parm, callback) {
	//	log(JSON.stringify(parm))
	mui.ajax(PAY_DOMAIN + payType, {
		data: parm,
		dataType: 'json', //要求服务器返回json格式数据
		type: 'GET', //HTTP请求类型，要和服务端对应，要么GET,要么POST
		timeout: 5000, //超时时间设置为3秒；
		beforeSend: function() {
			log(mklog() + '【AJAX:-->】【U=' + PAY_DOMAIN + payType + '】');
			log(mklog() + '【AJAX:-->】【P=' + JSON.stringify(parm) + '】');
		},
		success: function(data) {
			//			log(mklog() + '【AJAX:OK!】【响应：' + JSON.stringify(data) + '】');
			if(data.result == 0) {

				callback(data);
			} else {
				log(mklog() + '【接口提示：】' + data.detail);
				mui.toast('温馨提示：' + data.detail)
			}
			//核心写在这里
		},
		error: function(xhr, type, errorThrown) { //失败，打一下失败的类型，主要用于调试和用户体验
			log(mklog() + '【AJAX:ERR】-|T:' + type + '|H:' + errorThrown);
			if(type == 'timeout' || type == 'abort') {
				mui.toast("请求超时：请检查网络")
			}
		},
		complete: function() {
			log(mklog() + '【AJAX:END】【命令执行完成】');
		}
	}); //ajax end
} //获取数据结束

/**
 * @description 根据模板渲染指定节点
 * @param {NodeSelector} selector 要插入的节点选择器
 * @param {String} tpl 需要渲染模板的名称
 * @param {Object} data 传入的阿贾克斯回来的数据
 * @param {Boolean} type 仅在上拉时为真
 * */
function render(selector, tpl, data, type) {
	type = arguments[3] || false;
	//	log('Render:[D:' + selector + '|M:' + tpl + '|T:' + type + '|D:' + JSON.stringify(data).length)
	var elem = document.querySelector(selector);
	var html = template(tpl, data);
	if(type) {
		elem.innerHTML += html;
	} else {
		elem.innerHTML = html;
	}
}
/**
 * @description 为Array扩展contains方法
 * @param {String} str 需要是否已经在数组中存在的那个值
 * @example if(Arr.contains('str')); //返回true||false
 * */
Array.prototype.contains = function(str) {
	var i = this.length;
	while(i--) {
		if(this[i] === str) {
			return true;
		}
	}
	return false;
}
/*替换空格*/
　
String.prototype.trim = function() {　　
	return this.replace(/(^\s*)|(\s*$)/g, "");　　
}　　
String.prototype.ltrim = function() {　　
	return this.replace(/(^\s*)/g, "");　　
}　　
String.prototype.rtrim = function() {　　
	return this.replace(/(\s*$)/g, "");　　
}

/*是否为手机号*/
function ismobileno(num) {
	var mobile = num;
	var isMobile = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(14[0-9]{1}))+\d{8})$/;
	var isPhone = /^(?:(?:0\d{2,3})-)?(?:\d{7,8})(-(?:\d{3,}))?$/;;

	//如果为1开头则验证手机号码  
	if(mobile.substring(0, 1) == 1) {
		if(!isMobile.exec(mobile) && mobile.length != 11) {
			return false;
		} else {
			return true;
		}
	} else {

		return false;
	}
	return true;
}

/**
 * @description 短信验证倒计时
 * @param {String} o 绑定的对象
 */
var wait = 60;

function time(o) {
	if(wait == 0) {

		o.removeAttribute("disabled");
		//o.classList.remove('mui-disabled');
		o.innerHTML = "获取验证码";
		wait = 60;
	} else {
		o.setAttribute("disabled", true);
		//o.classList.add('mui-disabled');
		o.innerHTML = "重新发送(" + wait + ")";
		wait--;
		setTimeout(function() {
			time(o)
		}, 1000)
	}
}

/**
 * @description 检查支付通道
 * @param {Object} pc 需要被检查的支付通道
 * @example checkPaymentChannels({Object});
 * @example {"channel":{"id":"wxpay","description":"微信","serviceReady":true}
 * */
function checkPaymentChannels(pc) {

	if(!pc.serviceReady && pc.serviceReady != undefined) {
		var txt = null;
		switch(pc.id) {
			case 'alipay':
				txt = '检测到系统未安装“支付宝快捷支付服务”，无法完成支付操作，是否立即安装？';
				break;
			default:
				txt = '系统未安装“' + pc.description + '”服务，无法使用' + pc.description + '支付';
				break;
		}
		log(txt)
		mui.toast(txt)
	}
}
///**
// * @description 加密订单供生成订单号用
// * @param {Array} o 需要加密的商城基本信息pBase数组
// * @example sunHomeOrderTobase({Array});
// * */
function sunHomeOrderTobase64(o) {
	//	log('加密订单获取到的数组：' + JSON.stringify(o))
	var tArr = []
	for(var i = 0; i < o.length; i++) {
		var t = {
			"itemId": parseInt(o[i].itemId),
			"itemName": o[i].itemName.toString(),
			"unitPrice": parseFloat(o[i].unitPrice),
			"itemCount": parseInt(o[i].itemCount)
		}
		tArr.push(t)
	}
	var b = new Base64()
	return b.encode(JSON.stringify(tArr))
}
/**
 * @description 获取格式化之后的当前时间
 * */
function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();
	return currentdate;
}
//保留两位小数
function stringtoDecimal2(x) {
	var f = parseFloat(x);
	if(isNaN(f)) {
		return false;
	}
	var f = Math.round(x * 100) / 100;
	var s = f.toString();
	var rs = s.indexOf('.');
	if(rs < 0) {
		rs = s.length;
		s += '.';
	}
	while(s.length <= rs + 2) {
		s += '0';
	}
	return s;
}

//
///*showAPI配置参数*/
//var appid = "19297"
//var sign = "cf606a68a01f45d196b0061a1046b5b3"
//var baseUrl = "https://route.showapi.com/582-2?"
//
//
//// 获取当前时间 yyyyMMddHHmmss
//function getDataStr(){
//	var date = new Date();
//	var year = date.getFullYear();
//	var mouth = date.getMonth() + 1;
//	var day = date.getDate();
//	var hour = date.getHours();
//	var minute = date.getMinutes();
//	var second = date.getSeconds();
//	if(mouth < 10){ /*月份小于10  就在前面加个0*/
//		mouth = String(String(0) + String(mouth));
//	}
//	if(day < 10){ /*日期小于10  就在前面加个0*/
//		day = String(String(0) + String(day));
//	}
//	if(hour < 10){ /*时小于10  就在前面加个0*/
//		hour = String(String(0) + String(hour));
//	}
//	if(minute < 10){ /*分小于10  就在前面加个0*/
//		minute = String(String(0) + String(minute));
//	}
//	if(second < 10){ /*秒小于10  就在前面加个0*/
//		second = String(String(0) + String(second));
//	}
//	
//	var currentDate = String(year) + String(mouth) + String(day) + String(hour) + String(minute) + String(second);
//	log('currentDate = ' + currentDate);
//	return currentDate;
//}

function plusIsInstalled(id) {
	if(id === 'qihoo' && mui.os.plus) {
		return true;
	}
	if(mui.os.android) {
		var main = plus.android.runtimeMainActivity();
		var packageManager = main.getPackageManager();
		var PackageManager = plus.android.importClass(packageManager)
		var packageName = {
			"qq": "com.tencent.mobileqq",
			"weixin": "com.tencent.mm",
			"sinaweibo": "com.sina.weibo"
		}
		try {
			return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
		} catch(e) {}
	} else {
		switch(id) {
			case "qq":
				var TencentOAuth = plus.ios.import("TencentOAuth");
				return TencentOAuth.iphoneQQInstalled();
			case "weixin":
				var WXApi = plus.ios.import("WXApi");
				return WXApi.isWXAppInstalled()
			case "sinaweibo":
				var SinaAPI = plus.ios.import("WeiboSDK");
				return SinaAPI.isWeiboAppInstalled()
			default:
				break;
		}
	}
}