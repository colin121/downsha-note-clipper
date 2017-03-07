echo DownshaAll Start
cd .
del DownshaAll.js
type Downsha.js >> DownshaAll.js
type Platform.js >> DownshaAll.js
type I18N.js >> DownshaAll.js
type Logger\Logger.js >> DownshaAll.js
type Logger\IEExtensionLoggerImpl.js >> DownshaAll.js
type Utils.js >> DownshaAll.js
type Constants.js >> DownshaAll.js
type IEExtension.js >> DownshaAll.js
type Extractors\ExtractContentJS.js >> DownshaAll.js
type SelectionFinder.js >> DownshaAll.js
type ContentVeil.js >> DownshaAll.js
type AbstractStyleScript.js >> DownshaAll.js
type PageInfoScript.js >> DownshaAll.js
type PreviewerScript.js >> DownshaAll.js
type Clip.js >> DownshaAll.js
type ClipStyle.js >> DownshaAll.js
type ClipperScript.js >> DownshaAll.js
type Popup.js >> DownshaAll.js
type Startup.js >> DownshaAll.js
copy DownshaAll.js C:\AppServ\www\
java -jar compiler.jar --js=DownshaAll.js --js_output_file=..\..\..\..\win\Downsha\DownshaIE\DownshaAll.js
echo DownshaAll End
pause