
关于火狐扩展的版本管理以及更新机制介绍：https://developer.mozilla.org/en-US/docs/Extension_Versioning,_Update_and_Compatibility

*. 进入SVN中的Firefox扩展源码目录：\downsha\pc\src\firefox\ext，修改install.rdf文件。
   其中<em:version>为当前扩展的版本号，<em:updateURL>以及<em:updateKey>为版本更新所需，若需打包进入AMO，则需删除updateURL和updateKey。
*. 将SVN中的Firefox扩展源码：\downsha\pc\src\firefox\ext，导出到某个新文件夹中。
*. 将新文件夹下的目录：chrome\content\libs\downsha删除，同时修改overlay.xul,popup.html,notification.html
*. 使用ZIP压缩工具，将上述新文件夹下的内容打包，并修改后缀为XPI。

*. 进入SVN中的Firefox扩展安装目录：downsha\pc\src\firefox\install。确保已经安装mccopy以及HashTab工具。
*. 修改yunzhai_firefox_unsigned.rdf文件，增加一个<RDF:li>项，其中<em:version>为当前扩展的版本号，<em:updateLink>以及<em:updateHash>分别为上述打包的XPI文件下载地址以及XPI文件的SHA1值。

*. SHA1值获取方法：首先安装HashTab工具。右键点击扩展安装包XPI文件，选择“属性”菜单项，进入“HashTab”选项卡。复制界面中显示的SHA-1值。HashTab下载地址：http://www.implbits.com/hashtab.aspx

*. 数字签名方法：首先安装mccopy工具。生成一对RSA KEY。生成的私钥文件会保存在计算机的当前用户目录下。
C:\Users\***\AppData\Roaming\Mozilla\McCoy，应对此目录及时备份。打开mccoy.exe，选择当前的RSA KEY，点击sign按钮，选择yunzhai_firefox_unsigned.rdf，点击确定将会对此文件签名。将签名后的文件重命名为yunzhai_firefox.rdf。

*. 将XPI文件以及签名后的yunzhai_firefox.rdf文件上传到网站服务器中。
   