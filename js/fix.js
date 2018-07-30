var version='1.0.0';

//动态加载解决app重启时候缓存问题。
function link(cssAr) {
	for(var i = 0; i < cssAr.length; i++) {
		document.write('<link rel="stylesheet" type="text/css" href="' + cssAr[i] + '?version=' + version + '"/>');
	}
}

function script(jsAr) {
	for(var i = 0; i < jsAr.length; i++) {
		document.write('<script src="' + jsAr[i] + '?version=' + version + '" type="text/javascript" charset="utf-8"><\/script>');
	}
}