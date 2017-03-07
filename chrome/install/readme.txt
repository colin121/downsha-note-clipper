
关于Chrome扩展的版本管理以及更新机制介绍：http://code.google.com/chrome/extensions/autoupdate.html

*. 进入SVN中的Chrome扩展源码目录：\downsha\pc\src\chrome\ext，修改manifest.json文件。
   如果为发布到Chrome应用商店，则参考模板manifest_store.json，如果为发布离线版本，则参考模板manifest_local.json。
   其中主要字段说明如下：
   <version>为当前扩展的版本号，比如：1.2.0.21102，表示大版本号为1.2，发行日期为2012年11月2号。
   <manifest_version>为扩展的清单版本，Chrome20+支持版本2，而Chrome19-只支持版本1。
   <background_page>为指定后台的页面地址，不同的扩展清单版本有不同的格式，而且在Chrome19中互不兼容。
   <update_url>为更新地址，发布到Chrome应用商店时应移除。

*. 进入SVN目录：chrome\ext\libs\downsha，运行DownshaAll.bat。运行环境为已安装Java虚拟机的Windows系统。
*. 将SVN中的Chrome扩展源码：\downsha\pc\src\chrome\ext，导出到某个新文件夹中。
*. 将新文件夹下的目录：chrome\content\libs\downsha删除，同时修改：popup.html,background.html。
*. 打开Chrome浏览器，进入扩展管理界面。选择打包扩展程序，证书文件选择yunzhai_chrome_new.pem，生成crx文件。
*. 修改yunzhai_chrome.xml，将最新的版本号以及地址写入其中。同时上传最新crx文件以及yunzhai_chrome.xml文件到网站服务器。
*. 回到源码目录下，更新清单文件，将yunzhai_chrome_new.pem复制到源码根目录下，并且重命名key.pem。打包成ZIP压缩文件。
*. 打开Chrome浏览器，进入扩展上传的Dashboard，上传打包的ZIP压缩文件。