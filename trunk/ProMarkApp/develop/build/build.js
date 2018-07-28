/**
 * 通过REQUIREJS OPTIMIZER来打包所有的js依赖
 * 先cd到这个目录, 在通过Node来运行打包程序
 * node r.js -o build.js
 * 
 * @see http://requirejs.org/docs/optimization.html
 * @see https://github.com/jrburke/r.js
 */
({
    preserveLicenseComments: false,
    mainConfigFile: '../app_js/main.js',
    name: 'main',
    out: 'main-all.js'
})
