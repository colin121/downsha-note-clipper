(function(){var a=null;$(document).ready(function(){Downsha.Logger.setGlobalLevel(Downsha.chromeExtension.logger.level);Downsha.Utils.updateBadge(Downsha.getContext());Downsha.chromeExtension.initContextMenu();a=Downsha.Logger.getInstance();window.onerror=function(b,c,d){a.exception("\n"+c+":"+d+": "+b+"\n")};a.info("-------- BACKGROUND STARTING ------------")})})();
