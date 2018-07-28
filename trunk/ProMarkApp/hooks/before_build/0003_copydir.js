#!/usr/bin/env node
var path = require( "path" ),
    fs = require( "fs" ),
	shell = require('shelljs'),
	rootdir = process.argv[2],
    wwwroot = rootdir + "/www",
	developdir = rootdir + "/develop",
	img_dir = developdir +"/app_img",
	target_img_dir = wwwroot+"/app_img",
	css_dir = developdir +"/app_css",
	target_css_dir = wwwroot+"/app_css",
	iconfont_dir = css_dir + "/iconfont",
	target_iconfont_dir = target_css_dir + "/iconfont",
	data_dir = developdir+"/app_data",
	target_data_dir= wwwroot+'/app_data',

    resroot = wwwroot + "/res";

	require('shelljs/global');

	console.log('正在准备复制目录');
	console.log('(1/2) 复制图片');
	cp('-Rf', img_dir+"/**", target_img_dir);
	
	// console.log('(2/3 复制css样式文件)');
	// cp('-Rf', css_dir+"#<{(|.*", target_css_dir);

	console.log('(2/2) 复制字体');
	cp('-Rf', iconfont_dir+"/**", target_iconfont_dir);
	
	// console.log('(3/3) 复制data数据');
	//	cp('-Rf',data_dir+"/*.*" , target_data_dir);

	process.exit(0);


