module.exports = {
	"button": [
	{
		"name": "click_event",
		"type": "click",
		"key": "menu_click"
	}, 
	{
		"name": "show_sub_menu",
		"sub_button": [
		{
			"name": "go_to_url",
			"type": "view",
			"url": "http://www.zhangcui.com.cn/movie"
		}, 
		{
			"name": "scancode_push",
			"type": "scancode_push",
			"key": "scancode_push"
		}, 
		{
			"name": "scancode_waitmsg",
			"type": "scancode_waitmsg",
			"key": "scancode_waitmsg"
		}, 
		{
			"name": "pic_sysphoto",
			"type": "pic_sysphoto",
			"key": "pic_sysphoto"
		}, 
		{
			"name": "pic_photo_or_album",
			"type": "pic_photo_or_album",
			"key": "pic_photo_or_album"
		}]
	}, 
	{
		"name": "show_sub_menu2",
		"sub_button": [
		{
			"name": "pic_weixin",
			"type": "pic_weixin",
			"key": "pic_weixin"
		}, 
		{
			"name": "location_select",
			"type": "location_select",
			"key": "location_select"
		}]
	}]
};