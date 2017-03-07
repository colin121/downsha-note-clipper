/**
 * @author: chenmin
 * @date: 2011-08-31
 * @desc: constants definition: request type, data limitations
 */
 
Downsha.Constants = Downsha.Constants || {}; 

Downsha.Constants.REQUEST_TYPE = "type";
Downsha.Constants.REQUEST_MESSAGE = "message";
Downsha.Constants.IS_WINDOWS =(navigator.platform.indexOf("Win") != -1);
Downsha.Constants.SLASH = Downsha.Constants.IS_WINDOWS ? "\\":"/";

/**
 * Lists typeof of requests the extension makes. Lower codes (below 100) are
 * strictly for basic functionality of the extension. Higher codes are for
 * particular applications of the extension - such as content clipping,
 * simSearch etc. It is customary for higher codes to utilize odd numbers for
 * error codes and even numbers otherwise.
 */
Downsha.Constants.RequestType = {
  UNKNOWN                           : 0,
  
  LOGOUT                            : 1001, // used to signal logout
  LOGIN                             : 1002, // used to signal login
  LOGIN_ERROR                       : 1003, // used to signal authentication error
  LOGIN_SUCCESS                     : 1004, // used to signal successful authentication

  POPUP_STARTED                     : 2001, // used to signal background process that popup has started
  POPUP_ENDED                       : 2002, // used to signal that popup's existence has ended.
  
  PAGE_CLIP_SUCCESS                 : 3001, // indicates that a clip was made from a page
  PAGE_CLIP_FAILURE                 : 3002, // indicates that a clip failed to be created from a page
  PAGE_CLIP_CONTENT_SUCCESS         : 3003, // indicates that a clip with content was made from a page
  PAGE_CLIP_CONTENT_FAILURE         : 3004, // indicates that a clip with content failed to be created from a page
  PAGE_CLIP_CONTENT_TOO_BIG         : 3005, // indicates that a clip is too big in size
  
  CONTEXT_PAGE_CLIP_SUCCESS         : 3101, // indicates that a clip was made from a page
  CONTEXT_PAGE_CLIP_FAILURE         : 3102, // indicates that a clip failed to be created from a page
  CONTEXT_PAGE_CLIP_CONTENT_SUCCESS : 3103, // indicates that a clip with content was made from a page
  CONTEXT_PAGE_CLIP_CONTENT_FAILURE : 3104, // indicates that a clip with content failed to be created from a page
  CONTEXT_PAGE_CLIP_CONTENT_TOO_BIG : 3105, // indicates that a clip is too big in size
  
  CONTENT_SCRIPT_LOAD_TIMEOUT       : 4001, // used to signal that content script loading timed out
  FETCH_STYLE_SHEET_RULES           : 4002, // used to ask background process to fetch external style sheets and return parsed cssText
  
  CLIP_ACTION_FULL_PAGE             : 5001, // indicates user-preference for clipping full page
  CLIP_ACTION_ARTICLE               : 5002, // indicates user-preference for clipping article portion of the page
  CLIP_ACTION_SELECTION             : 5003, // indicates user-preference for clipping user-selected portion of the page
  CLIP_ACTION_URL                   : 5004, // indicates user-preference for clipping just the URL to the page
  
  PREVIEW_CLIP_ACTION_CLEAR         : 6001, // used to clear clip preview
  PREVIEW_CLIP_ACTION_FULL_PAGE     : 6002, // indicates user-preference for previewing full page
  PREVIEW_CLIP_ACTION_ARTICLE       : 6003, // indicates user-preference for previewing article portion of the page
  PREVIEW_CLIP_ACTION_SELECTION     : 6004, // indicates user-preference for previewing user-selected portion of the page
  PREVIEW_CLIP_ACTION_URL           : 6005, // indicates user-preference for previewing just the URL to the page
  
  PREVIEW_NUDGE                     : 6101, // used to nudge preview in some direction
  PREVIEW_NUDGE_PREVIOUS_SIBLING    : 6102, // used to notify nudge preview to previous sibling
  PREVIEW_NUDGE_NEXT_SIBLING        : 6103, // used to notify nudge preview to next sibling
  PREVIEW_NUDGE_PARENT              : 6104, // used to notify nudge preview to the parent 
  PREVIEW_NUDGE_CHILD               : 6105, // used to notify nudge preview to the child
  
  PAGE_INFO                         : 7001  // used to notify with PageInfo object
};

Downsha.Constants.Limits = {
  DSTP_USER_NAME_LEN_MIN : 6,
  DSTP_USER_NAME_LEN_MAX : 16,
  DSTP_USER_NAME_REGEX : "^[A-Za-z0-9._\\-\\u4e00-\\u9fa5]{6,16}$", 
  
  DSTP_USER_EMAIL_LEN_MIN : 6,
  DSTP_USER_EMAIL_LEN_MAX : 255,
  DSTP_USER_EMAIL_REGEX : "^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$", 

  DSTP_USER_PWD_LEN_MIN : 6,
  DSTP_USER_PWD_LEN_MAX : 16,
  DSTP_USER_PWD_REGEX : "^[A-Za-z0-9.~!@#$%^&*()+=_-]{6,16}$", 

  DSTP_NOTE_TITLE_LEN_MIN : 0,
  DSTP_NOTE_TITLE_LEN_MAX : 127,
  DSTP_NOTE_TITLE_REGEX : "^$|^[^\\s\\r\\n\\t]([^\\n\\r\\t]{0,253}[^\\s\\r\\n\\t])?$",

  DSTP_TAG_NAME_LEN_MIN : 1,
  DSTP_TAG_NAME_LEN_MAX : 100,
  DSTP_TAG_NAME_REGEX : "^[^,\\s\\r\\n\\t]([^,\\n\\r\\t]{0,98}[^,\\s\\r\\n\\t])?$",

  DSTP_NOTE_TAGS_MIN : 0,
  DSTP_NOTE_TAGS_MAX : 100,

  SERVICE_DOMAIN_LEN_MIN : 1,
  SERVICE_DOMAIN_LEN_MAX : 256,

  CLIP_NOTE_CONTENT_LEN_MAX : 5242880 // 5MB
};
