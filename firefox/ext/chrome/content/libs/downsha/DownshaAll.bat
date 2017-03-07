echo DownshaAll Start
cd .

del DownshaBase.js
type Downsha.js >> DownshaBase.js
type DownshaError.js >> DownshaBase.js
type Constants.js >> DownshaBase.js
type Logger\Logger.js >> DownshaBase.js
type Logger\FirefoxExtensionLoggerImpl.js >> DownshaBase.js
type Platform.js >> DownshaBase.js
type LocalStore.js >> DownshaBase.js
type Utils.js >> DownshaBase.js
type Chrome.js >> DownshaBase.js
type DownshaModel.js >> DownshaBase.js
type Options.js >> DownshaBase.js
type DownshaContext.js >> DownshaBase.js
type ViewManager.js >> DownshaBase.js
java -jar compiler.jar --js=DownshaBase.js --js_output_file=..\DownshaBase.js

del DownshaExtend.js
type DownshaRemote.js >> DownshaExtend.js
type DownshaRemoteEx.js >> DownshaExtend.js
type Extractors\ExtractContentJS.js >> DownshaExtend.js
type ContentScripting\SelectionFinder.js >> DownshaExtend.js
type ContentScripting\ClipStyle.js >> DownshaExtend.js
type ContentScripting\Clip.js >> DownshaExtend.js
type ContentScripting\ClipPreview.js >> DownshaExtend.js
type ContentScripting\PageInfo.js >> DownshaExtend.js
java -jar compiler.jar --js=DownshaExtend.js --js_output_file=..\DownshaExtend.js

del DownshaOverlay.js
type ToolbarInit.js >> DownshaOverlay.js
type Overlay.js >> DownshaOverlay.js
type CacheManager\CacheManager.js >> DownshaOverlay.js
type CacheManager\FirefoxCacheManagerImpl.js >> DownshaOverlay.js
type ClipConverter.js >> DownshaOverlay.js
type ClipSender.js >> DownshaOverlay.js
type ClipHandler.js >> DownshaOverlay.js
type ClipStorer.js >> DownshaOverlay.js
type QueueProcessor.js >> DownshaOverlay.js
type NotificationManager.js >> DownshaOverlay.js
type ToolbarManager.js >> DownshaOverlay.js
type TabObserver.js >> DownshaOverlay.js
type JQueryLoader.js >> DownshaOverlay.js
java -jar compiler.jar --js=DownshaOverlay.js --js_output_file=..\DownshaOverlay.js

del DownshaPopup.js
type NoteForm.js >> DownshaPopup.js
type ChromePopup.js >> DownshaPopup.js
java -jar compiler.jar --js=DownshaPopup.js --js_output_file=..\DownshaPopup.js

del DownshaNotification.js
type ChromeNotification.js >> DownshaNotification.js
java -jar compiler.jar --js=DownshaNotification.js --js_output_file=..\DownshaNotification.js

echo DownshaAll End
pause
