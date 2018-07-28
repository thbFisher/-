<img src="zach.gif">

## Features 功能特性
* 压缩文件生成zip压缩包。
* 删掉zip压缩包中指定的文件。
* 解压zip压缩包
* 列出zip压缩包中的所有文件，包含文件的相关信息

## Installation 安装
	$ npm install zach-zip

[问题反馈](https://github.com/king-king/zach-zip/issues)


## 接口
### add( arg, callback ) 压缩文件
+ arg{Object}
    * output: {String}要生成的文件名，带后缀。
    * input {String|array}要被压缩的文件。字符串可以是一个文件，也可以是一个文件夹，可以使用通配符：*和?。*表示任意数量的字符序列，?表示任意一个字符。
    * r :{Boolean} 表示是否递归，例如当需要将子文件夹中的内容也压缩的时候，就需要设置r为true，默认为false。
    * p:{String} 密码，压缩的时候可以指定密码。

+ callback{Function}
    * err:{Object}
        * code：错误代码
            * 1: Warning
            * 2：Fatal error
            * 7：arg err
            * 8：Not enough memory for operation
            * 255：User stopped the process
    * des:描述

### dele( arg, callback ) 从压缩包中删除文件
 +arg{Object}
    * file{String} 要处理的压缩包名称
    * target {String|array} 要删除的文件，字符串或字符串数组
    * r{Boolean} 是否递归，默认为false

+ callback{Function}
    * err:{Object}
        * code：错误代码
            * 1: Warning
            * 2：Fatal error
            * 7：arg err
            * 8：Not enough memory for operation
            * 255：User stopped the process
    * des:描述

### extracts(arg, callback) 解压文件
 +arg{Object}
    * input{String} 要处理的压缩包路径
    * o{String} 输出路径，默认是当前文件夹
    * filter{String|array} 可以指定解压特定的文件
    * r{Boolean}如果filter设定了过滤条件，设置r为true可以实现递归深度过滤 
    
 + callback{Function}
     * err:{Object}
         * code：错误代码
             * 1: Warning
             * 2：Fatal error
             * 7：arg err
             * 8：Not enough memory for operation
             * 255：User stopped the process
     * des:描述
### list(file, callback) 列出压缩包中的所有文件
+ file{String} 要处理的压缩包路径

+ callback{Function}
       * err:{Object}
           * code：错误代码
               * 1: Warning
               * 2：Fatal error
               * 7：arg err
               * 8：Not enough memory for operation
               * 255：User stopped the process
       * des:描述

+ 返回{Object}
```javascript
{
  path:// 压缩包的路径
  size:// 压缩包的大小,zip能读到这个数据，rar压缩包读不到这个数据（值是NAN）
  foldersNum:// 压缩包中文件夹的数量
  filesNum:// 压缩包中文件的数量
  files:[
     {
        name:
        date:
        time:
        size: // rar文件是0，zip能读出来
        compressed: // rar文件是0，zip能读出来
     }
     ……
  ]
}

```




