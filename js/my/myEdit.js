var backid, backurl, _field, postData = {}; //提交的参数值;
mui.init({
	beforeback: function() {
		var backpage = plus.webview.getWebviewById(backid);
		log("backid=" + backid + " backurl" + backurl);
		if(backpage) {
			if(_field == "signature" && backid != "my/user.html") {
				var user_page = plus.webview.getWebviewById("my/user.html");
				if(user_page) {
					mui.fire(user_page, 'initPage')
				}
			}
			mui.fire(backpage, 'initPage')
		}
	}
});
mui.plusReady(function() {
	storage.init();
	backid = appPage.getParam("backid");
	backurl = backid.replace("my/", "");

	var self = plus.webview.currentWebview();

	var _title = "编辑信息";
	_field = self.info.field;
	var _fieldname;
	var _typeid = 1;
	var regionPicker, maxlen = 50;

	var data = {};
	data.model = {
		typeid: _typeid,
		field: _field,
		fieldname: _fieldname,
		value: self.info.value,
		maxlen: 50
	}
	log(JSON.stringify(data));
	if(_field == "signature") {
		_title = "个性签名";
		_typeid = 2;
		maxlen = 60;
	} else if(_field == "nickname") {
		_title = "昵称";
		maxlen = 12;
	} else if(_field == "gender") {
		_title = "性别";
		_typeid = 3;
		postData.sex = data.model.value; //初始值
	} else if(_field == "birthday") {
		_title = "生日";
		_typeid = 4;
		postData.birthday = data.model.value; //初始值
	} else if(_field == "realname") {
		_title = "真实姓名";
		maxlen = 20;
		postData.realname = data.model.value; //初始值
	} else if(_field == "address") {
		_title = "邮寄地址";
		_typeid = 5;
		log(data.model.value);
		data.model.values = JSON.parse("{" + data.model.value + "}");
		data.model.value = data.model.values.address;
		postData.provinceid = data.model.values.ProvinceId;
		postData.cityid = data.model.values.CityId;
		postData.districtid = data.model.values.DistrictId;
		postData.address = data.model.values.Address;
		maxlen = 60;
	} else if(_field == "setmark") {
		_title = "备注信息";
		var str = "{" + data.model.value + "}";
		log(str);
		data.model.values = JSON.parse(str);
		log(JSON.stringify(data.model.values))
		postData.friendid = data.model.values.friendid;
		data.model.value = data.model.values.mark;
		maxlen = 12;
	}
	data.model.typeid = _typeid;
	data.model.fieldname = _title;
	data.model.maxlen = maxlen;
	document.getElementById("title").innerText = _title;

	log(JSON.stringify(data));

	render("#edit_warp", "edit_view", data);
	bindEvent(_field, data.model);

	//保存
	document.getElementById("save").addEventListener("tap", function() {

		var refreshField, refreshVal, url = "/Player/editPlayerInfo";
		if(_typeid == 5) {
			var defVals = data.model.values;

			if(!postData.provinceid || !postData.cityid || !postData.districtid) {
				appUI.showTopTip("所在区域不能为空");
				return;
				//postData.provinceid = defVals.ProvinceId;
			}
			//			if(!postData.cityid) {
			//				postData.cityid = defVals.CityId;
			//			}
			//			if(!postData.districtid) {
			//				postData.districtid = defVals.DistrictId;
			//			}
		}
		//
		if(_field == "signature") {
			postData.signature = txt_val.value.trim();
			refreshField = "signature";
			refreshVal = postData.signature;
		} else if(_field == "nickname") {
			postData.nickname = inpt_val.value.trim();
			refreshField = "nickname";
			refreshVal = postData.nickname;
		} else if(_field == "gender") {
			if(!postData || !postData.sex || postData.sex == "") {
				appUI.showTopTip("性别不能为空");
				return;
			}
		} else if(_field == "birthday") {
			if(document.getElementById("birthday").innerText.trim() == "") {
				appUI.showTopTip("生日不能为空");
				return;
			}
			postData.birthday = document.getElementById("birthday").innerText;
		} else if(_field == "realname") {
			if(inpt_val.value.trim() == "") {
				appUI.showTopTip("真实姓名不能为空");
				return;
			}
			postData.realname = inpt_val.value.trim();
			refreshField = "nickname";
			refreshVal = postData.realname;
		} else if(_field == "address") {
			if(inpt_val.value.trim() == "") {
				appUI.showTopTip("详细地址不能为空");
				return;
			}
			postData.address = inpt_val.value.trim();
		} else if(_field == "setmark") {
			postData.remarkname = inpt_val.value.trim();
			if(inpt_val.value.trim() == "") {
				appUI.showTopTip("备注不能为空");
				return;
			}
			url = "/Player/editPlayerFriendRemarkName";
		}
		if(isEmptyObject(postData)) {
			appUI.showTopTip("提交数据不能为空");
			return;
		}
		postData.playerid = storageUser.UId;
		log(JSON.stringify(postData));
		request(url, postData, function(json) {
			if(json.code == 0) {
				if(refreshField) { //刷新缓存
					storageUser.refreshField(refreshField, refreshVal);
				}
				mui.back();
			} else {
				mui.toast(json.msg);
			}
		}, true);
	});

	//appPage.closeLogin();
});

function bindEvent(_field, model) {
	if(_field == "gender") { //性别
		if(model.value == "1") {
			document.getElementById("gender1").querySelector("i").style.display = "block";
		} else if(model.value == "2") {
			document.getElementById("gender2").querySelector("i").style.display = "block";
		}

		var elements = document.getElementsByClassName("genderck");
		for(var i = 0; i < elements.length; i++) {
			elements[i].addEventListener("tap", function() {
				var val = this.getAttribute("id").replace("gender", "");
				postData.sex = val;
				this.querySelector("i").style.display = "block";
				if(val == 1) {
					document.getElementById("gender2").querySelector("i").style.display = "none";
				} else if(val == 2) {
					document.getElementById("gender1").querySelector("i").style.display = "none";
				}
			});
		};

	} else if(_field == "birthday") { //生日
		var year, month, day;
		if(postData && postData.birthday) {
			var arr = postData.birthday.split('-');
			if(arr.length == 3) {
				year = arr[0];
				month = arr[1];
				day = arr[2];
			} else {
				year = new Date().getFullYear();
				month = new Date().getMonth() + 1;
				day = new Date().getDate();
			}
		} else {
			year = new Date().getFullYear();
			month = new Date().getMonth() + 1;
			day = new Date().getDate();
		}

		document.getElementById("birthday").addEventListener("tap", function() {
			//var id = this.getAttribute('id');		
			var picker = new mui.DtPicker({
				"type": "date",
				"value": (year) + '-' + month + '-' + day, //默认时间
				//"endYear": year,
				//"endMonth": month,
				//"endDay": day,
				"beginYear": 1950
			});
			picker.show(function(rs) {
				document.getElementById("birthday").innerText = rs.text;
				postData.birthday = rs.text;
				picker.dispose();
			});
		});

	} else if(_field == "address") { //省市区

		var regionobj = document.getElementById("region");
		var defVals = model.values;
		log(defVals);
		if(defVals.ProvinceId > 0)
			regionobj.innerText = defVals.ProvinceName + " - " + defVals.CityName + " - " + defVals.DistrictName;
		regionPicker = new mui.PopPicker({
			layer: 3
		});
		regionPicker.setData(region);
		regionPicker.pickers[0].setSelectedValue(defVals.ProvinceId);
		regionPicker.pickers[1].setSelectedValue(defVals.CityId);
		regionPicker.pickers[2].setSelectedValue(defVals.DistrictId);

		regionobj.addEventListener("tap", function() {
			regionPicker.show(function(items) {
				var op1 = (items[0] || {});
				var op2 = (items[1] || {});
				var op3 = (items[2] || {});
				postData = {
					provinceid: op1.value,
					cityid: op2.value,
					districtid: op3.value
				};
				regionobj.innerText = (items[0] || {}).text + " - " + (items[1] || {}).text + " - " + (items[2] || {}).text;
				//返回 false 可以阻止选择框的关闭
				//return false;
			});
		});
	}
}

function isEmptyObject(e) {
	var t;
	for(t in e)
		return !1;
	return !0
}