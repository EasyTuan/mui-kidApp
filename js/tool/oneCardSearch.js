mui.init();

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	var BrandId = self.info.BrandId;
	mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});

	var BrandId = self.info.BrandId;

	request("/Card/layoutSearchCardPage", {
		brandid: BrandId,
	}, function(r) {
		if(r.code == -1) {
			appUI.showTopTip(r.msg);
			return;
		}
		//log(r);
		render("#searchList", "searchListTep1", r);
		//下拉菜单
		mui(".group").on("tap", "input", function() {
			mui(this.parentNode.childNodes[5]).popover('toggle');
		})

		//下拉选择
		mui(".mui-popover").on("tap", "li", function() {
			this.setAttribute("class", "active");
			this.parentNode.parentNode.parentNode.childNodes[1].value = this.dataset.text;
			this.parentNode.parentNode.parentNode.childNodes[1].setAttribute("data-id", this.dataset.id);
			mui('.mui-popover').popover('hide');
			var el = this;
			setTimeout(function() {
				el.setAttribute("class", "");
			}, 100)
		})

		//属性多选
		mui(".kind").on("tap", "span", function() {
			var brand = this.parentNode.dataset.brand;
			if(this.getAttribute("class") != "classify active") {
				this.setAttribute("class", "classify active");
			} else {
				this.setAttribute("class", "classify");
			}
		})

	})

	//右上角更多
	mui(".mui-bar").on("tap", ".icon-more", function() {
		openNew("saierhao.html");
	})

	//搜索
	document.getElementById("searchBtn").addEventListener("tap", function() {
		var rs = {};

		var cardname = document.getElementById("cardname").value;

		//多选
		mui(".classify").each(function() {
			if(this.getAttribute("class") == "classify active") {
				var brand = this.dataset.brand;
				var id = this.dataset.id;
				if(rs[brand]) {
					rs[brand] = id + "-" + rs[brand];
				} else {
					rs[brand] = id;
				}
			}
		})

		//输入框
		mui(".inputList").each(function() {
			var value = this.value;
			if(value != '') {
				var id = this.dataset.id;
				rs[id] = value;
			}
		})

		//下拉
		mui(".pulldown").each(function() {
			var brand = this.dataset.brand;
			this.dataset.id ? rs[brand] = this.dataset.id : '';
		})

		rs = JSON.stringify(rs)
		rs = rs.replace(/\"/g, "");
		rs = rs.replace(/^\{/gi, "");
		rs = rs.replace(/\}$/gi, "");
		rs = rs.replace(/\,/g, ";");
		rs = rs.replace(/\-/g, ",");

		log(rs);
		openNew("selectResult.html", {
			cardname: cardname,
			rs: rs,
			BrandId: BrandId
		});
	})

})