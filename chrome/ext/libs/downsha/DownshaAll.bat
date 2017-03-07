echo DownshaAll Start
cd .
del DownshaBase.js
type Downsha.js >> DownshaBase.js
type DownshaError.js >> DownshaBase.js
type Logger\Logger.js >> DownshaBase.js
type Logger\ChromeExtensionLoggerImpl.js >> DownshaBase.js
type CacheManager\CacheManager.js >> DownshaBase.js
type CacheManager\ChromeCacheManagerImpl.js >> DownshaBase.js
type Platform.js >> DownshaBase.js
type LocalStore.js >> DownshaBase.js
type Utils.js >> DownshaBase.js
type DownshaContext.js >> DownshaBase.js
type DownshaRemote.js >> DownshaBase.js
type ClipSender.js >> DownshaBase.js
type ClipConverter.js >> DownshaBase.js
type DownshaModel.js >> DownshaBase.js
type Options.js >> DownshaBase.js
type Constants.js >> DownshaBase.js
type EventHandler.js >> DownshaBase.js
type RequestMessage.js >> DownshaBase.js
type ChromeExtension.js >> DownshaBase.js
type ChromeExtensionRemote.js >> DownshaBase.js
type ContentScripting\AbstractContentScripting.js >> DownshaBase.js
type ContentScripting\ClipperContentScripting.js >> DownshaBase.js
type ContentScripting\PreviewerContentScripting.js >> DownshaBase.js
type ContentScripting\PageInfoContentScripting.js >> DownshaBase.js
java -jar compiler.jar --js=DownshaBase.js --js_output_file=..\DownshaBase.js
del DownshaBase.js

del DownshaPopup.js
type ViewManager.js >> DownshaPopup.js
type NoteForm.js >> DownshaPopup.js
type ChromePopup.js >> DownshaPopup.js
java -jar compiler.jar --js=DownshaPopup.js --js_output_file=..\DownshaPopup.js
del DownshaPopup.js

del DownshaBackground.js
type ChromeBackground.js >> DownshaBackground.js
java -jar compiler.jar --js=DownshaBackground.js --js_output_file=..\DownshaBackground.js
del DownshaBackground.js

del DownshaClip.js
type Downsha.js >> DownshaClip.js
type Logger\Logger.js >> DownshaClip.js
type Logger\ChromeExtensionLoggerImpl.js >> DownshaClip.js
type Utils.js >> DownshaClip.js
type Constants.js >> DownshaClip.js
type Extractors\ExtractContentJS.js >> DownshaClip.js
type RequestMessage.js >> DownshaClip.js
type ContentScripting\SelectionFinder.js >> DownshaClip.js
type ContentScripting\ClipStyle.js >> DownshaClip.js
type ContentScripting\Clip.js >> DownshaClip.js
type ContentScripting\AbstractStyleScript.js >> DownshaClip.js
type ContentScripting\ClipperScript.js >> DownshaClip.js
java -jar compiler.jar --js=DownshaClip.js --js_output_file=..\DownshaClip.js
del DownshaClip.js

del DownshaPreview.js
type Downsha.js >> DownshaPreview.js
type Logger\Logger.js >> DownshaPreview.js
type Logger\ChromeExtensionLoggerImpl.js >> DownshaPreview.js
type Utils.js >> DownshaPreview.js
type Constants.js >> DownshaPreview.js
type Extractors\ExtractContentJS.js >> DownshaPreview.js
type RequestMessage.js >> DownshaPreview.js
type ContentScripting\SelectionFinder.js >> DownshaPreview.js
type ContentScripting\Scroller.js >> DownshaPreview.js
type ContentScripting\NodeRect.js >> DownshaPreview.js
type ContentScripting\ClipStyle.js >> DownshaPreview.js
type ContentScripting\ContentVeil.js >> DownshaPreview.js
type ContentScripting\AbstractStyleScript.js >> DownshaPreview.js
type ContentScripting\PreviewerScript.js >> DownshaPreview.js
java -jar compiler.jar --js=DownshaPreview.js --js_output_file=..\DownshaPreview.js
del DownshaPreview.js

del DownshaPage.js
type Downsha.js >> DownshaPage.js
type Logger\Logger.js >> DownshaPage.js
type Logger\ChromeExtensionLoggerImpl.js >> DownshaPage.js
type Utils.js >> DownshaPage.js
type Constants.js >> DownshaPage.js
type Extractors\ExtractContentJS.js >> DownshaPage.js
type RequestMessage.js >> DownshaPage.js
type ContentScripting\SelectionFinder.js >> DownshaPage.js
type ContentScripting\AbstractStyleScript.js >> DownshaPage.js
type ContentScripting\PageInfoScript.js >> DownshaPage.js
java -jar compiler.jar --js=DownshaPage.js --js_output_file=..\DownshaPage.js
del DownshaPage.js

echo DownshaAll End
pause
