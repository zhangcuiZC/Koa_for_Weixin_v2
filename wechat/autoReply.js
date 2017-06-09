var createXML = require('./createXML');
var menu = require('./menu');

function autoReply(message, wechat) {
	if (message.MsgType === 'event') {
		if (message.Event === 'subscribe') {
			if (message.EventKey) {
				console.log('扫码进入');
			}
			var now = new Date().getTime();
			return Promise.resolve(createXML({
				ToUserName: message.FromUserName,
				FromUserName: message.ToUserName,
				MsgType: 'text',
				Content: 'Hello!!'
			}));
		}else if (message.Event === 'unsubscribe') {
			console.log('取关');
			return Promise.resolve('');
		}else if (message.Event === 'LOCATION') {
			return Promise.resolve(createXML({
				ToUserName: message.FromUserName,
				FromUserName: message.ToUserName,
				MsgType: 'text',
				Content: `位置：${message.Latitude},${message.Longitude},${message.Precision}`
			}));
		}else if (message.Event === 'CLICK') {
			return Promise.resolve(createXML({
				ToUserName: message.FromUserName,
				FromUserName: message.ToUserName,
				MsgType: 'text',
				Content: `点击事件`
			}));
		}else if (message.Event === 'SCAN') {
			return Promise.resolve(createXML({
				ToUserName: message.FromUserName,
				FromUserName: message.ToUserName,
				MsgType: 'text',
				Content: `关注后扫码`
			}));
		}else if (message.Event === 'VIEW') {
			console.log(`点击链接：${message.EventKey}`);
			return Promise.resolve('');
		}else {
			return Promise.resolve(createXML({
				ToUserName: message.FromUserName,
				FromUserName: message.ToUserName,
				MsgType: 'text',
				Content: `other事件`
			}));
		}
	}else if (message.MsgType === 'location') {
		return Promise.resolve(createXML({
			ToUserName: message.FromUserName,
			FromUserName: message.ToUserName,
			MsgType: 'text',
			Content: `位置：${message.Location_X},${message.Location_Y},${message.Scale},${message.Label}`
		}));
	}else if (message.MsgType === 'text') {
		var content = message.Content;
		if (content === '1') {
			return Promise.resolve(createXML({
				ToUserName: message.FromUserName,
				FromUserName: message.ToUserName,
				MsgType: 'text',
				Content: `ahahahahhah`
			}));
		}else if (content === '2') {
			return Promise.resolve(createXML({
				ToUserName: message.FromUserName,
				FromUserName: message.ToUserName,
				MsgType: 'news',
				Articles: [
					{
						Title: '张璀测试',
						Description: '图文消息描述',
						PicUrl: 'http://f10.baidu.com/it/u=3038573891,4200009349&fm=72',
						Url: 'http://www.baidu.com'
					},
					{
						Title: '张璀测试',
						Description: '图文消息描述',
						PicUrl: 'http://f10.baidu.com/it/u=3038573891,4200009349&fm=72',
						Url: 'http://www.baidu.com'
					}
				]
			}));
		}else if (content === '5') {
			// 上传图片（临时）
			return new Promise(function(resolve, reject) {
				wechat.uploadMaterial('image', __dirname + '/2.png')
				.then(function(data) {
					var xml = createXML({
						ToUserName: message.FromUserName,
						FromUserName: message.ToUserName,
						MsgType: 'image',
						MediaId: data.media_id
					});
					resolve(xml);
				});
			});
		}else if (content === '6') {
			// 上传图片（永久）
			return new Promise(function(resolve, reject) {
				wechat.uploadMaterial('image', __dirname + '/2.png', { type: 'image' })
				.then(function(data) {
					var xml = createXML({
						ToUserName: message.FromUserName,
						FromUserName: message.ToUserName,
						MsgType: 'image',
						MediaId: data.media_id
					});
					resolve(xml);
				});
			});	
		}else if (content === '7') {
			// 上传video
			return new Promise(function(resolve, reject) {
				wechat.uploadMaterial('video', __dirname + '/3.mp4', { type: 'video', description: '{ "title": "ABC", "introduction": "QWERT"}'})
				.then(function(data) {
					var xml = createXML({
						ToUserName: message.FromUserName,
						FromUserName: message.ToUserName,
						MsgType: 'video',
						MediaId: data.media_id,
						Title: '单据金额',
						Description: '永久素材-视频'
					});
					resolve(xml);
				});
			});
		}else if (content === '8') {
			// 上传用显示图文素材
			return new Promise(function(resolve, reject) {
				wechat.uploadMaterial('image', __dirname + '/2.png', {})
				.then(function(data) {
					var articles = {
						"articles" : [{
							"title": "上传图文素材标题",
							"thumb_media_id": data.media_id,
							"author": "zhangcui",
							"digest": "图文消息的摘要，仅有单图文消息才有摘要，多图文此处为空",
							"show_cover_pic": 1,
							"content": "图文消息的具体内容，支持HTML标签，必须少于2万字符，小于1M，且此处会去除JS,涉及图片url必须来源上传图文消息内的图片获取URL接口获取。外部图片url将被过滤。",
							"content_source_url": "https://www.baidu.com"
						}]
					};

					wechat.uploadMaterial('news', articles, {})
					.then(function(data) {
						console.log('start fetch');
						wechat.fetchMaterial(data.media_id, 'news', {})
						.then(function(data) {
							var articles = [];
							for (var i = 0; i < data.news_item.length; i++) {
								var item = {};
								item.Title = data.news_item[i].title;
								item.Description = data.news_item[i].digest;
								item.PicUrl = data.news_item[i].thumb_url;
								item.Url = data.news_item[i].url;
								articles.push(item);
							}
							var xml = createXML({
								ToUserName: message.FromUserName,
								FromUserName: message.ToUserName,
								MsgType: 'news',
								Articles: articles
							});
							resolve(xml);
						});
					});
				});
			});
		}else if (content === '9') {
			// 列出素材数量
			return new Promise(function(resolve, reject) {
				wechat.countMaterial()
				.then(function(data) {
					var xml = createXML({
						ToUserName: message.FromUserName,
						FromUserName: message.ToUserName,
						MsgType: 'text',
						Content: JSON.stringify(data)
					});
					resolve(xml);
				});
			});	
		}else if (content === '10') {
			// 获取所有素材（news）
			return new Promise(function(resolve, reject) {
				wechat.batchMaterial({type: 'news', count: 20})
				.then(function(data) {
					var xml = createXML({
						ToUserName: message.FromUserName,
						FromUserName: message.ToUserName,
						MsgType: 'text',
						Content: JSON.stringify(data)
					});
					resolve(xml);
				});
			});	
		}else if (content === '11') {
			// 添加一个标签
			return new Promise(function(resolve, reject) {
				var name = new Date().getTime() + 'zc';
				wechat.createTag(name)
				.then(function(data) {
					var xml = createXML({
						ToUserName: message.FromUserName,
						FromUserName: message.ToUserName,
						MsgType: 'text',
						Content: JSON.stringify(data)
					});
					resolve(xml);
				});
			});
		}else if (content === '12') {
			// 获取所有标签
			return new Promise(function(resolve, reject) {
				wechat.getTag()
				.then(function(data) {
					var xml = createXML({
						ToUserName: message.FromUserName,
						FromUserName: message.ToUserName,
						MsgType: 'text',
						Content: JSON.stringify(data)
					});
					resolve(xml);
				});
			});
		}else if (content === '13') {
			// 根据openid获取用户信息
			return new Promise(function(resolve, reject) {
				var openIds = [{
					"openid": message.FromUserName,
					"lang": 'zh_CN'
				}];
				wechat.fetchUsers(openIds)
				.then(function(data) {
					resolve("");
				});
			});
		}else if (content === '14') {
			// 给用户改备注名
			return new Promise(function(resolve, reject) {
				wechat.remarkUser(message.FromUserName, 'zhangcuicuicuicui')
				.then(function(data) {
					if (data.errcode === 0) {
						var xml = createXML({
							ToUserName: message.FromUserName,
							FromUserName: message.ToUserName,
							MsgType: 'text',
							Content: 'remark success'
						});
						resolve(xml);
					}else {
						resolve('');
					}
				});
			});
		}else if (content === '15') {
			// 列出所有粉丝
			return new Promise(function(resolve, reject) {
				wechat.listUsers()
				.then(function(data) {
					var xml = createXML({
						ToUserName: message.FromUserName,
						FromUserName: message.ToUserName,
						MsgType: 'text',
						Content: JSON.stringify(data)
					});
					resolve(xml);
				})
			})
		}else if (content === '16') {
			// 将用户标记为100标签下
			return new Promise(function(resolve, reject) {
				var openid_list = [`${message.FromUserName}`];

				wechat.batchTagging(openid_list, 100)
				.then(function(data) {
					resolve('');
				});
			});
		}else if (content === '17') {
			// 获取标签下（标签100）的粉丝
			return new Promise(function(resolve, reject) {
				wechat.getUsersFromTag(100)
				.then(function(data) {
					resolve('');
				});
			});
		}else if (content === '18') {
			// 群发一个消息
			return new Promise(function(resolve, reject) {
				var msgObj = {
					"touser": [
						`${message.FromUserName}`,
						"o2nfAwCdQFrNvzHq_YBtQS8d2muE"
					],
					"mpnews": {
						"media_id": "A_fslBbK7YXIV1MtZ2Wd6uVYFELSANKsFbsCJz_hKbU"
					},
					"msgtype": "mpnews",
					"send_ignore_reprint": 0
				};

				wechat.sendByIds(msgObj)
				.then(function(data) {
					var xml = createXML({
						ToUserName: message.FromUserName,
						FromUserName: message.ToUserName,
						MsgType: 'text',
						Content: JSON.stringify(data)
					});
					resolve(xml);
				});
			});
		}else if (content === 'delmenu') {
			return new Promise(function(resolve, reject) {
				wechat.deleteMenu()
				.then(function(data) {
					var xml = createXML({
						ToUserName: message.FromUserName,
						FromUserName: message.ToUserName,
						MsgType: 'text',
						Content: JSON.stringify(data)
					});
					resolve(xml);
				});
			});
		}else if (content === 'createmenu') {
			return new Promise(function(resolve, reject) {
				wechat.createMenu(menu)
				.then(function(data) {
					var xml = createXML({
						ToUserName: message.FromUserName,
						FromUserName: message.ToUserName,
						MsgType: 'text',
						Content: JSON.stringify(data)
					});
					resolve(xml);
				});
			});
		}else if (content === 'qrcode') {
			return new Promise(function(resolve, reject) {
				var tempQr = {
					"expire_seconds": 604800,
					"action_name": "QR_SCENE",
					"action_info": {
						"scene": {
							"scene_id": 123
						}
					}
				}
				wechat.createQrcode(tempQr)
				.then(function(data) {
					wechat.getQrcode(data)
					.then(function(data) {
						var xml = createXML({
							ToUserName: message.FromUserName,
							FromUserName: message.ToUserName,
							MsgType: 'text',
							Content: JSON.stringify(data)
						});
						resolve(xml);
					});
				});
			});
		}
		else {
			return Promise.resolve(createXML({
				ToUserName: message.FromUserName,
				FromUserName: message.ToUserName,
				MsgType: 'text',
				Content: `( ⊙ o ⊙ )啊？`
			}));
		}
	}
}

module.exports = autoReply;