#!/usr/bin/env node
var path = require( "path" ),
    fs = require( "fs" ),
	shell = require('shelljs'),
	rootdir = process.argv[2],
    wwwroot = rootdir + "/www",
	developdir = rootdir + "/develop",
	r_js = developdir+'/build/r.js',
	build_js = developdir+'/build/build.js',
	build_css = developdir +'/build/build-css.js',
	build_all_js = developdir+'/build/main-all.js',
	build_all_css = developdir+'/build/main.css',
	target_build_all_js_dir = rootdir + '/www/app_js',
	target_build_all_css_dir = rootdir +'/www/app_css',
    resroot = wwwroot + "/res";
	require('shelljs/global');

	console.log('正在准备压缩合并js文件,waiting ...['+"node "+r_js+ " -o " + build_js+']');
	shell.exec( "node "+r_js+ " -o " + build_js, {silent:false} );
	console.log('压缩完成');
	console.log('正在准备压缩合并css文件,waiting ...');
	shell.exec( "node "+r_js+ " -o " + build_css, {silent:false} );

	cp('-Rf', build_all_js, target_build_all_js_dir);
	cp('-Rf', build_all_css, target_build_all_css_dir);
	process.exit(0);






