mui.init();

mui.plusReady(function() {
	log('popshare mplusready');

	//分享模块
	//kidInitShareSerivces();

	//关闭窗口
	mui('.mui-content').on('tap', '.m_close', function() {
		mui.back()
	})
	//点击分享图标
	mui('#popshare').on('tap', 'li', function() {
		mui.toast("分享功能敬请期待！");
		return;

		var shid = this.getAttribute('data-id'),
			shex = this.getAttribute('data-ex');
		kidShareAction(shid, shex);
	})
})

// 更新分享服务
var shares = null;

function kidInitShareSerivces() {
	plus.share.getServices(function(s) {
		shares = {};
		for(var i in s) {
			var t = s[i];
			shares[t.id] = t;
		}
		log(mklog() + "获取分享服务列表成功" + JSON.stringify(shares))
	}, function(e) {
		mui.toast("获取分享服务列表失败：" + e.message)
	})
}
// 发送分享消息
function kidSendShareMessage(s, ex) {
	var msg = {
		href: "http://www.baidu.com",
		title: "标题",
		content: "这是分享的内容",
		thumbs: ['http://jhbadminupload.oss-cn-hangzhou.aliyuncs.com/Upload/20170418/20170418095933254pejcu.jpg'], //缩略图
		pictures: 'http://jhbadminupload.oss-cn-hangzhou.aliyuncs.com/Upload/20170418/20170418095933254pejcu.jpg', //大图
		extra: {
			scene: ex
		}
	};
	s.send(msg, function() {
		mui.toast("分享成功!")
		plus.webview.currentWebview().close();
	}, function(e) {
		log(JSON.stringify(e))
		switch(e.code.toString()) {
			case '-100':
				mui.toast('您中途取消了分享');
				break;
			default:
				mui.toast('分享失败:' + e.message)
				break;
		}
	})

}
//分享动作
function kidShareAction(id, ex) {
	var s = null;
	if(!id || !(s = shares[id])) {
		mui.toast("无效的分享服务！")
		return;
	}
	if(s.authenticated) {
		log(mklog() + "【分享】---已授权---")
		kidSendShareMessage(s, ex);
	} else {
		log(mklog() + "【分享】---未授权---")
		mui.toast(mklog() + "【分享】---未授权---");
		s.authorize(function() {
			kidSendShareMessage(s, ex);
		}, function(e) {
			log(mklog() + "【分享】---认证授权失败---")
		})
	}
}