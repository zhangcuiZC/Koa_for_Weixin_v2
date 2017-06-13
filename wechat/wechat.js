var request = require('request-promise');
var fs = require('fs');

var prefix = 'https://api.weixin.qq.com/cgi-bin';
var api = {
	accessToken: prefix + '/token?grant_type=client_credential',
	temporary: {
		upload: prefix + '/media/upload',
		fetch: prefix + '/media/get'
	},
	permanent:{
		upload: prefix + '/material/add_material',
		uploadNews: prefix + '/material/add_news',
		uploadNewsPic: prefix + '/media/uploadimg',
		fetch: prefix + '/material/get_material',
		del: prefix + '/material/del_material',
		update: prefix + '/material/update_news',
		count: prefix + '/material/get_materialcount',
		batch: prefix + '/material/batchget_material'
	},
	tags: {
		create: prefix + '/tags/create',
		get: prefix + '/tags/get',
		update: prefix + '/tags/update',//
		del: prefix + '/tags/delete',//
		getusersfromtag: prefix + '/user/tag/get',
		batchtag: prefix + '/tags/members/batchtagging'
	},
	user: {
		remark: prefix + '/user/info/updateremark',
		fetch: prefix + '/user/info',
		batch: prefix + '/user/info/batchget',
		list: prefix + '/user/get'
	},
	mass: {
		send: prefix + '/message/mass/send'
	},
	menu: {
		create: prefix + '/menu/create',
		get: prefix + '/menu/get',
		del: prefix + '/menu/delete'
	},
	qrcode: {
		create: prefix + '/qrcode/create',
		get: 'https://mp.weixin.qq.com/cgi-bin/showqrcode'
	},
	ticket: {
		get: prefix + '/ticket/getticket'
	}
};

function Wechat(opts) {
	var that = this;
	this.appID = opts.appID;
	this.appSecret = opts.appSecret;
	this.getAccessToken = opts.getAccessToken;
	this.saveAccessToken = opts.saveAccessToken;
	this.getTicket = opts.getTicket;
	this.saveTicket = opts.saveTicket;

	// this.fetchAccessToken();
}

Wechat.prototype.fetchAccessToken = function() {
	var that = this;

	if (this.access_token && this.expires_in) {
		if (this.isValidAccessToken(this)) {
			return Promise.resolve(this);
		}
	}

	return this.getAccessToken()
		.then(function(data) {
			try {
				var data = JSON.parse(data);
			} catch(e) {
				return that.updateAccessToken();
			}
			if (that.isValidAccessToken(data)) {
				return Promise.resolve(data);
			}else {
				return that.updateAccessToken();
			}
		})
		.then(function(data) {
			that.access_token = data.access_token;
			that.expires_in = data.expires_in;
			that.saveAccessToken(data);
			console.log('access_token----------', that.access_token);
			return Promise.resolve(data);
		});
}

Wechat.prototype.isValidAccessToken = function(data) {
	if (!data || !data.access_token || !data.expires_in) {
		return false;
	}

	var access_token = data.access_token;
	var expires_in = data.expires_in;
	var now = (new Date().getTime());
	if (now < expires_in) {
		return true;
	}else {
		return false;
	}
};
Wechat.prototype.updateAccessToken = function() {
	var appID = this.appID;
	var appSecret = this.appSecret;
	var url = api.accessToken + `&appid=${appID}&secret=${appSecret}`;

	return new Promise(function(resolve, reject) {
		request({url: url, json: true}).then(function(response) {
			var data = response;
			var now = new Date().getTime();
			var expires_in = now + data.expires_in*1000 - 20*1000;
			data.expires_in = expires_in;
			resolve(data);
		});
	});
	
};

Wechat.prototype.fetchTicket = function() {
	var that = this;

	return new Promise((resolve, reject) => {
		that
		.fetchAccessToken()
		.then(at_data => {
			if (that.ticket && that.ticket_expires_in) {
				if (that.isValidTicket(that)) {
					resolve(that);
					return;
				}
			}

			that.getTicket()
				.then(function(ticket_data) {
					try {
						ticket_data = JSON.parse(ticket_data);
					} catch(e) {
						return that.updateTicket(at_data.access_token);
					}
					if (that.isValidTicket(ticket_data)) {
						return Promise.resolve(ticket_data);
					}else {
						return that.updateTicket(at_data.access_token);
					}
				})
				.then(function(data) {
					that.ticket = data.ticket;
					that.ticket_expires_in = data.expires_in;
					that.saveTicket(data);
					console.log('ticket----------', that.ticket);
					resolve(data);
				});
		});
	});
}

Wechat.prototype.isValidTicket = function(data) {
	if (!data || !data.ticket || !data.expires_in) {
		return false;
	}

	var ticket = data.ticket;
	var ticket_expires_in = data.expires_in;
	var now = (new Date().getTime());
	if (now < ticket_expires_in) {
		return true;
	}else {
		return false;
	}
};
Wechat.prototype.updateTicket = function(access_token) {
	var url = api.ticket.get + `?access_token=${access_token}&type=jsapi`;

	return new Promise(function(resolve, reject) {
		request({url: url, json: true}).then(function(response) {
			var data = response;
			var now = new Date().getTime();
			var expires_in = now + data.expires_in*1000 - 20*1000;
			data.expires_in = expires_in;
			resolve(data);
		});
	});
};

Wechat.prototype.uploadMaterial = function(type, material, permanent) {
	var that = this;
	var form = {};
	var uploadUrl = api.temporary.upload;

	if (permanent) {
		uploadUrl = api.permanent.upload;
		Object.assign(form, permanent);
	}

	if (type === 'pic') {
		uploadUrl = api.permanent.uploadNewsPic;
	}

	if (type === 'news') {
		uploadUrl = api.permanent.uploadNews;
		form = material;
	}else {
		form.media = fs.createReadStream(material);
	}

	var appID = this.appID;
	var appSecret = this.appSecret;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = uploadUrl + `?access_token=${data.access_token}`;
				if (!permanent) {
					url += `&type=${type}`;
				}else {
					form.access_token = data.access_token;
				}
				var options = {
					method: 'POST',
					url: url,
					json: true
				}

				if (type === 'news') {
					options.body = form;
				}else {
					options.formData = form;
				}
				request(options).then(function(response) {
					console.log('upload', response);
					var _data = response;

					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Upload failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.fetchMaterial = function(mediaId, type, permanent) {
	var that = this;
	var form = {};
	var fetchUrl = api.temporary.fetch;

	if (permanent) {
		fetchUrl = api.permanent.fetch;
	}

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = fetchUrl + `?access_token=${data.access_token}`;

				if (permanent) {
					var options = {
						method: 'POST',
						url: url,
						json: true
					};
					form.media_id = mediaId;
					form.access_token = data.access_token;
					options.body = form;
				}else {
					if (type === 'video') {
						url = url.replace('https://', 'http://');
					}
					url += `&media_id=${mediaId}`;
				}

				if (type === 'news' || type === 'video') {
					request(options).then(function(response) {
						console.log('fetch successs', response);
						var _data = response;
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('fetch failed');
						}
					});
				}else {
					resolve(url);
				}
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.deleteMaterial = function(mediaId) {
	var that = this;
	var form = {
		media_id: mediaId
	};

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.permanent.del + `?access_token=${data.access_token}&media_id=${mediaId}`;
				
				request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
					console.log('del', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Delete failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.updateMaterial = function(mediaId, news) {
	var that = this;
	var form = {
		media_id: mediaId
	};

	// _.extend(form, news);
	Object.assign(form, news);

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.permanent.update + `?access_token=${data.access_token}&media_id=${mediaId}`;
				
				request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
					console.log('update', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Update failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.countMaterial = function() {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.permanent.count + `?access_token=${data.access_token}`;
				
				request({url: url, json: true}).then(function(response) {
					console.log('count', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Count failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.batchMaterial = function(options) {
	var that = this;
	options.offset = options.offset || 0;
	options.count = options.count || 5;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.permanent.batch + `?access_token=${data.access_token}`;
				
				request({method: 'POST', url: url, body: options, json: true}).then(function(response) {
					console.log('batch', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Batch failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.createTag = function(name) {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.tags.create + `?access_token=${data.access_token}`;
				var form = {
					"tag": {
						"name": name
					}
				};

				request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
					console.log('create tag successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Create Tag failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.getTag = function() {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.tags.get + `?access_token=${data.access_token}`;

				request({url: url, json: true}).then(function(response) {
					console.log('get tag successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Get Tag failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.getUsersFromTag = function(tagId, next_openid) {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.tags.getusersfromtag + `?access_token=${data.access_token}`;

				var form = {
					"tagid": tagId
				}
				if (next_openid) {
					form.next_openid = next_openid;
				}

				request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
					console.log('get users from tag successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Get Users From Tag failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.batchTagging = function(openid_list, tagid) {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.tags.batchtag + `?access_token=${data.access_token}`;

				var form = {
					"tagid": tagid,
					"openid_list": openid_list
				}

				request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
					console.log('BatchTagging successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('BatchTagging failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.remarkUser = function(openId, remark) {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.user.remark + `?access_token=${data.access_token}`;
				var form = {
					"openid": openId,
					"remark": remark
				};

				request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
					console.log('remark user successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Remark User failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.fetchUsers = function(openIds, lang="zh_CN") {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = '';
				if (Array.isArray(openIds)) {
					url = api.user.batch + `?access_token=${data.access_token}`;
					var options = {
						method: 'POST',
						url: url,
						json: true
					};
					options.body = {
						"user_list": openIds,
					};
				}else {
					url = api.user.fetch + `?access_token=${data.access_token}&openid=${openIds}&lang=${lang}`;
					var options = {
						url: url,
						json: true
					}
				}

				request(options).then(function(response) {
					console.log('fetch user successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Fetch User failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.listUsers = function(openId) {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.user.list + `?access_token=${data.access_token}`;
				if (openId) {
					url += `&next_openid=${openId}`;
				}
				request({url: url, json: true}).then(function(response) {
					console.log('list users successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('List Users failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.sendByIds = function(obj) {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.mass.send + `?access_token=${data.access_token}`;
				// var form = {
				// 	"filter": {
				// 		"is_to_all": true
				// 	},
				// 	"mpnews": mpnews,
				// 	"msgtype": msgtype,
				// 	"send_ignore_reprint": 0
				// }

				// if (tag_id) {
				// 	form.filter = {
				// 		"is_to_all": false,
				// 		"tag_id": tag_id
				// 	}
				// }

				request({method: 'POST', url: url, body: obj, json: true}).then(function(response) {
					console.log('mass send msg successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Mass Send Msg failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.createMenu = function(menu) {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.menu.create + `?access_token=${data.access_token}`;

				request({method: 'POST', url: url, body: menu, json: true}).then(function(response) {
					console.log('create menu successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Create Menu failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.getMenu = function() {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.menu.get + `?access_token=${data.access_token}`;

				request({url: url, json: true}).then(function(response) {
					console.log('get menu successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Get Menu failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.deleteMenu = function() {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.menu.del + `?access_token=${data.access_token}`;

				request({url: url, json: true}).then(function(response) {
					console.log('delete menu successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Delete Menu failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.createQrcode = function(qrcode) {
	var that = this;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.qrcode.create + `?access_token=${data.access_token}`;

				request({method: 'POST', url: url, body: qrcode, json: true}).then(function(response) {
					console.log('create qrcode ticket successs', response);
					var _data = response;
					
					if (_data) {
						resolve(_data);
					}else {
						throw new Error('Create Qrcode Ticket failed');
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
};

Wechat.prototype.getQrcode = function(ticket) {
	return Promise.resolve(`${api.qrcode.get}?ticket=${encodeURI(ticket.ticket)}`);
} 

module.exports = Wechat;