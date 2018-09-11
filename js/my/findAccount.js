mui.init();
mui.plusReady(function() {
	var elements = document.getElementsByClassName("findbythree");
	for(var i = 0; i < elements.length; i++) {
		elements[i].addEventListener("tap", function() {
			var typeid = this.getAttribute("data-typeid");
			var param = {
				typeid: typeid
			};
			log(typeid)
			openNew("findAccountByThree.html", param);
		})
	};

});