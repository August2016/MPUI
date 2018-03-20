/**
 * MPUI (http://https://github.com/August2016/h5ui)
 * Copyright (C) 2018 MPUI
 * Licensed under the MIT license (https://mit-license.org)
 */
/*===========================
Device/OS Detection
===========================*/
/* global $:true */
;(function ($) {
    "use strict";
    var device = {};
    var ua = navigator.userAgent;

    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
    var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

    device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;
    
    // Android
    if (android) {
        device.os = 'android';
        device.osVersion = android[2];
        device.android = true;
        device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
    }
    if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
    }
    // iOS
    if (iphone && !ipod) {
        device.osVersion = iphone[2].replace(/_/g, '.');
        device.iphone = true;
    }
    if (ipad) {
        device.osVersion = ipad[2].replace(/_/g, '.');
        device.ipad = true;
    }
    if (ipod) {
        device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        device.iphone = true;
    }
    // iOS 8+ changed UA
    if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
        if (device.osVersion.split('.')[0] === '10') {
            device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
        }
    }

    // Webview
    device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);
        
    // Minimal UI
    if (device.os && device.os === 'ios') {
        var osVersionArr = device.osVersion.split('.');
        device.minimalUi = !device.webView &&
                            (ipod || iphone) &&
                            (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7) &&
                            $('meta[name="viewport"]').length > 0 && $('meta[name="viewport"]').attr('content').indexOf('minimal-ui') >= 0;
    }

    // Check for status bar and fullscreen app mode
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    device.statusBar = false;
    if (device.webView && (windowWidth * windowHeight === screen.width * screen.height)) {
        device.statusBar = true;
    }
    else {
        device.statusBar = false;
    }

    // Classes
    var classNames = [];

    // Pixel Ratio
    device.pixelRatio = window.devicePixelRatio || 1;
    classNames.push('pixel-ratio-' + Math.floor(device.pixelRatio));
    if (device.pixelRatio >= 2) {
        classNames.push('retina');
    }

    // OS classes
    if (device.os) {
        classNames.push(device.os, device.os + '-' + device.osVersion.split('.')[0], device.os + '-' + device.osVersion.replace(/\./g, '-'));
        if (device.os === 'ios') {
            var major = parseInt(device.osVersion.split('.')[0], 10);
            for (var i = major - 1; i >= 6; i--) {
                classNames.push('ios-gt-' + i);
            }
        }
        
    }
    // Status bar classes
    if (device.statusBar) {
        classNames.push('with-statusbar-overlay');
    }
    else {
        $('html').removeClass('with-statusbar-overlay');
    }

    // Add html classes
    if (classNames.length > 0) $('html').addClass(classNames.join(' '));

    $.device = device;
})($);

/* global $:true */
/* global WebKitCSSMatrix:true */

(function($) {
  "use strict";

  $.fn.transitionEnd = function(callback) {
    var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
      i, dom = this;

    function fireCallBack(e) {
      /*jshint validthis:true */
      if (e.target !== this) return;
      callback.call(this, e);
      for (i = 0; i < events.length; i++) {
        dom.off(events[i], fireCallBack);
      }
    }
    if (callback) {
      for (i = 0; i < events.length; i++) {
        dom.on(events[i], fireCallBack);
      }
    }
    return this;
  };

  $.support = (function() {
    var support = {
      touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
    };
    return support;
  })();

  $.touchEvents = {
    start: $.support.touch ? 'touchstart' : 'mousedown',
    move: $.support.touch ? 'touchmove' : 'mousemove',
    end: $.support.touch ? 'touchend' : 'mouseup'
  };

  $.getTouchPosition = function(e) {
    e = e.originalEvent || e; //jquery wrap the originevent
    if(e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
      return {
        x: e.targetTouches[0].pageX,
        y: e.targetTouches[0].pageY
      };
    } else {
      return {
        x: e.pageX,
        y: e.pageY
      };
    }
  };

  $.fn.scrollHeight = function() {
    return this[0].scrollHeight;
  };

  $.fn.transform = function(transform) {
    for (var i = 0; i < this.length; i++) {
      var elStyle = this[i].style;
      elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
    }
    return this;
  };
  $.fn.transition = function(duration) {
    if (typeof duration !== 'string') {
      duration = duration + 'ms';
    }
    for (var i = 0; i < this.length; i++) {
      var elStyle = this[i].style;
      elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
    }
    return this;
  };

  $.getTranslate = function (el, axis) {
    var matrix, curTransform, curStyle, transformMatrix;

    // automatic axis detection
    if (typeof axis === 'undefined') {
      axis = 'x';
    }

    curStyle = window.getComputedStyle(el, null);
    if (window.WebKitCSSMatrix) {
      // Some old versions of Webkit choke when 'none' is passed; pass
      // empty string instead in this case
      transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
    }
    else {
      transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
      matrix = transformMatrix.toString().split(',');
    }

    if (axis === 'x') {
      //Latest Chrome and webkits Fix
      if (window.WebKitCSSMatrix)
        curTransform = transformMatrix.m41;
      //Crazy IE10 Matrix
      else if (matrix.length === 16)
        curTransform = parseFloat(matrix[12]);
      //Normal Browsers
      else
        curTransform = parseFloat(matrix[4]);
    }
    if (axis === 'y') {
      //Latest Chrome and webkits Fix
      if (window.WebKitCSSMatrix)
        curTransform = transformMatrix.m42;
      //Crazy IE10 Matrix
      else if (matrix.length === 16)
        curTransform = parseFloat(matrix[13]);
      //Normal Browsers
      else
        curTransform = parseFloat(matrix[5]);
    }

    return curTransform || 0;
  };
  $.requestAnimationFrame = function (callback) {
    if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
    else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
    else if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame(callback);
    else {
      return window.setTimeout(callback, 1000 / 60);
    }
  };

  $.cancelAnimationFrame = function (id) {
    if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
    else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
    else if (window.mozCancelAnimationFrame) return window.mozCancelAnimationFrame(id);
    else {
      return window.clearTimeout(id);
    }  
  };

  $.fn.join = function(arg) {
    return this.toArray().join(arg);
  }
})($);

;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

/*! Lazy Load 1.9.7 - MIT license - Copyright 2010-2015 Mika Tuupola */
!function(a,b,c,d){var e=a(b);a.fn.lazyload=function(f){function g(){var b=0;i.each(function(){var c=a(this);if(!j.skip_invisible||c.is(":visible"))if(a.abovethetop(this,j)||a.leftofbegin(this,j));else if(a.belowthefold(this,j)||a.rightoffold(this,j)){if(++b>j.failure_limit)return!1}else c.trigger("appear"),b=0})}var h,i=this,j={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:b,data_attribute:"original",skip_invisible:!1,appear:null,load:null,placeholder:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"};return f&&(d!==f.failurelimit&&(f.failure_limit=f.failurelimit,delete f.failurelimit),d!==f.effectspeed&&(f.effect_speed=f.effectspeed,delete f.effectspeed),a.extend(j,f)),h=j.container===d||j.container===b?e:a(j.container),0===j.event.indexOf("scroll")&&h.bind(j.event,function(){return g()}),this.each(function(){var b=this,c=a(b);b.loaded=!1,(c.attr("src")===d||c.attr("src")===!1)&&c.is("img")&&c.attr("src",j.placeholder),c.one("appear",function(){if(!this.loaded){if(j.appear){var d=i.length;j.appear.call(b,d,j)}a("<img />").bind("load",function(){var d=c.attr("data-"+j.data_attribute);c.hide(),c.is("img")?c.attr("src",d):c.css("background-image","url('"+d+"')"),c[j.effect](j.effect_speed),b.loaded=!0;var e=a.grep(i,function(a){return!a.loaded});if(i=a(e),j.load){var f=i.length;j.load.call(b,f,j)}}).attr("src",c.attr("data-"+j.data_attribute))}}),0!==j.event.indexOf("scroll")&&c.bind(j.event,function(){b.loaded||c.trigger("appear")})}),e.bind("resize",function(){g()}),/(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion)&&e.bind("pageshow",function(b){b.originalEvent&&b.originalEvent.persisted&&i.each(function(){a(this).trigger("appear")})}),a(c).ready(function(){g()}),this},a.belowthefold=function(c,f){var g;return g=f.container===d||f.container===b?(b.innerHeight?b.innerHeight:e.height())+e.scrollTop():a(f.container).offset().top+a(f.container).height(),g<=a(c).offset().top-f.threshold},a.rightoffold=function(c,f){var g;return g=f.container===d||f.container===b?e.width()+e.scrollLeft():a(f.container).offset().left+a(f.container).width(),g<=a(c).offset().left-f.threshold},a.abovethetop=function(c,f){var g;return g=f.container===d||f.container===b?e.scrollTop():a(f.container).offset().top,g>=a(c).offset().top+f.threshold+a(c).height()},a.leftofbegin=function(c,f){var g;return g=f.container===d||f.container===b?e.scrollLeft():a(f.container).offset().left,g>=a(c).offset().left+f.threshold+a(c).width()},a.inviewport=function(b,c){return!(a.rightoffold(b,c)||a.leftofbegin(b,c)||a.belowthefold(b,c)||a.abovethetop(b,c))},a.extend(a.expr[":"],{"below-the-fold":function(b){return a.belowthefold(b,{threshold:0})},"above-the-top":function(b){return!a.belowthefold(b,{threshold:0})},"right-of-screen":function(b){return a.rightoffold(b,{threshold:0})},"left-of-screen":function(b){return!a.rightoffold(b,{threshold:0})},"in-viewport":function(b){return a.inviewport(b,{threshold:0})},"above-the-fold":function(b){return!a.belowthefold(b,{threshold:0})},"right-of-fold":function(b){return a.rightoffold(b,{threshold:0})},"left-of-fold":function(b){return!a.rightoffold(b,{threshold:0})}})}(jQuery,window,document);
/* ========================================================================
 * Bootstrap: button.js v3.3.6
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.3.6'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state += 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false
        $parent.find('.active').removeClass('active')
        this.$element.addClass('active')
      } else if ($input.prop('type') == 'checkbox') {
        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
        this.$element.toggleClass('active')
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
      this.$element.toggleClass('active')
    }
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      var $btn = $(e.target)
      if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
      Plugin.call($btn, 'toggle')
      if (!($(e.target).is('input[type="radio"]') || $(e.target).is('input[type="checkbox"]'))) e.preventDefault()
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.6
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.6'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.6
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.3.6'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/*! =======================================================
 VERSION  9.5.3
 ========================================================= */
"use strict";

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/*! =========================================================
 * bootstrap-slider.js
 *
 * Maintainers:
 *		Kyle Kemp
 *			- Twitter: @seiyria
 *			- Github:  seiyria
 *		Rohit Kalkur
 *			- Twitter: @Rovolutionary
 *			- Github:  rovolution
 *
 * =========================================================
 *
 * bootstrap-slider is released under the MIT License
 * Copyright (c) 2016 Kyle Kemp, Rohit Kalkur, and contributors
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * ========================================================= */

/**
 * Bridget makes jQuery widgets
 * v1.0.1
 * MIT license
 */
var windowIsDefined = (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object";

(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && module.exports) {
        var jQuery;
        try {
            jQuery = require("jquery");
        } catch (err) {
            jQuery = null;
        }
        module.exports = factory(jQuery);
    } else if (window) {
        window.Slider = factory(window.jQuery);
    }
})(function ($) {
    // Constants
    var NAMESPACE_MAIN = 'slider';
    var NAMESPACE_ALTERNATE = 'bootstrapSlider';

    // Polyfill console methods
    if (windowIsDefined && !window.console) {
        window.console = {};
    }
    if (windowIsDefined && !window.console.log) {
        window.console.log = function () {};
    }
    if (windowIsDefined && !window.console.warn) {
        window.console.warn = function () {};
    }

    // Reference to Slider constructor
    var Slider;

    (function ($) {

        'use strict';

        // -------------------------- utils -------------------------- //

        var slice = Array.prototype.slice;

        function noop() {}

        // -------------------------- definition -------------------------- //

        function defineBridget($) {

            // bail if no jQuery
            if (!$) {
                return;
            }

            // -------------------------- addOptionMethod -------------------------- //

            /**
             * adds option method -> $().plugin('option', {...})
             * @param {Function} PluginClass - constructor class
             */
            function addOptionMethod(PluginClass) {
                // don't overwrite original option method
                if (PluginClass.prototype.option) {
                    return;
                }

                // option setter
                PluginClass.prototype.option = function (opts) {
                    // bail out if not an object
                    if (!$.isPlainObject(opts)) {
                        return;
                    }
                    this.options = $.extend(true, this.options, opts);
                };
            }

            // -------------------------- plugin bridge -------------------------- //

            // helper function for logging errors
            // $.error breaks jQuery chaining
            var logError = typeof console === 'undefined' ? noop : function (message) {
                console.error(message);
            };

            /**
             * jQuery plugin bridge, access methods like $elem.plugin('method')
             * @param {String} namespace - plugin name
             * @param {Function} PluginClass - constructor class
             */
            function bridge(namespace, PluginClass) {
                // add to jQuery fn namespace
                $.fn[namespace] = function (options) {
                    if (typeof options === 'string') {
                        // call plugin method when first argument is a string
                        // get arguments for method
                        var args = slice.call(arguments, 1);

                        for (var i = 0, len = this.length; i < len; i++) {
                            var elem = this[i];
                            var instance = $.data(elem, namespace);
                            if (!instance) {
                                logError("cannot call methods on " + namespace + " prior to initialization; " + "attempted to call '" + options + "'");
                                continue;
                            }
                            if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                                logError("no such method '" + options + "' for " + namespace + " instance");
                                continue;
                            }

                            // trigger method with arguments
                            var returnValue = instance[options].apply(instance, args);

                            // break look and return first value if provided
                            if (returnValue !== undefined && returnValue !== instance) {
                                return returnValue;
                            }
                        }
                        // return this if no return value
                        return this;
                    } else {
                        var objects = this.map(function () {
                            var instance = $.data(this, namespace);
                            if (instance) {
                                // apply options & init
                                instance.option(options);
                                instance._init();
                            } else {
                                // initialize new instance
                                instance = new PluginClass(this, options);
                                $.data(this, namespace, instance);
                            }
                            return $(this);
                        });

                        if (!objects || objects.length > 1) {
                            return objects;
                        } else {
                            return objects[0];
                        }
                    }
                };
            }

            // -------------------------- bridget -------------------------- //

            /**
             * converts a Prototypical class into a proper jQuery plugin
             *   the class must have a ._init method
             * @param {String} namespace - plugin name, used in $().pluginName
             * @param {Function} PluginClass - constructor class
             */
            $.bridget = function (namespace, PluginClass) {
                addOptionMethod(PluginClass);
                bridge(namespace, PluginClass);
            };

            return $.bridget;
        }

        // get jquery from browser global
        defineBridget($);
    })($);

    /*************************************************
     BOOTSTRAP-SLIDER SOURCE CODE
     **************************************************/

    (function ($) {

        var ErrorMsgs = {
            formatInvalidInputErrorMsg: function formatInvalidInputErrorMsg(input) {
                return "Invalid input value '" + input + "' passed in";
            },
            callingContextNotSliderInstance: "Calling context element does not have instance of Slider bound to it. Check your code to make sure the JQuery object returned from the call to the slider() initializer is calling the method"
        };

        var SliderScale = {
            linear: {
                toValue: function toValue(percentage) {
                    var rawValue = percentage / 100 * (this.options.max - this.options.min);
                    var shouldAdjustWithBase = true;
                    if (this.options.ticks_positions.length > 0) {
                        var minv,
                            maxv,
                            minp,
                            maxp = 0;
                        for (var i = 1; i < this.options.ticks_positions.length; i++) {
                            if (percentage <= this.options.ticks_positions[i]) {
                                minv = this.options.ticks[i - 1];
                                minp = this.options.ticks_positions[i - 1];
                                maxv = this.options.ticks[i];
                                maxp = this.options.ticks_positions[i];

                                break;
                            }
                        }
                        var partialPercentage = (percentage - minp) / (maxp - minp);
                        rawValue = minv + partialPercentage * (maxv - minv);
                        shouldAdjustWithBase = false;
                    }

                    var adjustment = shouldAdjustWithBase ? this.options.min : 0;
                    var value = adjustment + Math.round(rawValue / this.options.step) * this.options.step;
                    if (value < this.options.min) {
                        return this.options.min;
                    } else if (value > this.options.max) {
                        return this.options.max;
                    } else {
                        return value;
                    }
                },
                toPercentage: function toPercentage(value) {
                    if (this.options.max === this.options.min) {
                        return 0;
                    }

                    if (this.options.ticks_positions.length > 0) {
                        var minv,
                            maxv,
                            minp,
                            maxp = 0;
                        for (var i = 0; i < this.options.ticks.length; i++) {
                            if (value <= this.options.ticks[i]) {
                                minv = i > 0 ? this.options.ticks[i - 1] : 0;
                                minp = i > 0 ? this.options.ticks_positions[i - 1] : 0;
                                maxv = this.options.ticks[i];
                                maxp = this.options.ticks_positions[i];

                                break;
                            }
                        }
                        if (i > 0) {
                            var partialPercentage = (value - minv) / (maxv - minv);
                            return minp + partialPercentage * (maxp - minp);
                        }
                    }

                    return 100 * (value - this.options.min) / (this.options.max - this.options.min);
                }
            },

            logarithmic: {
                /* Based on http://stackoverflow.com/questions/846221/logarithmic-slider */
                toValue: function toValue(percentage) {
                    var min = this.options.min === 0 ? 0 : Math.log(this.options.min);
                    var max = Math.log(this.options.max);
                    var value = Math.exp(min + (max - min) * percentage / 100);
                    value = this.options.min + Math.round((value - this.options.min) / this.options.step) * this.options.step;
                    /* Rounding to the nearest step could exceed the min or
                     * max, so clip to those values. */
                    if (value < this.options.min) {
                        return this.options.min;
                    } else if (value > this.options.max) {
                        return this.options.max;
                    } else {
                        return value;
                    }
                },
                toPercentage: function toPercentage(value) {
                    if (this.options.max === this.options.min) {
                        return 0;
                    } else {
                        var max = Math.log(this.options.max);
                        var min = this.options.min === 0 ? 0 : Math.log(this.options.min);
                        var v = value === 0 ? 0 : Math.log(value);
                        return 100 * (v - min) / (max - min);
                    }
                }
            }
        };

        /*************************************************
         CONSTRUCTOR
         **************************************************/
        Slider = function (element, options) {
            createNewSlider.call(this, element, options);
            return this;
        };

        function createNewSlider(element, options) {

            /*
             The internal state object is used to store data about the current 'state' of slider.
             This includes values such as the `value`, `enabled`, etc...
             */
            this._state = {
                value: null,
                enabled: null,
                offset: null,
                size: null,
                percentage: null,
                inDrag: false,
                over: false
            };

            // The objects used to store the reference to the tick methods if ticks_tooltip is on
            this.ticksCallbackMap = {};
            this.handleCallbackMap = {};

            if (typeof element === "string") {
                this.element = document.querySelector(element);
            } else if (element instanceof HTMLElement) {
                this.element = element;
            }

            /*************************************************
             Process Options
             **************************************************/
            options = options ? options : {};
            var optionTypes = Object.keys(this.defaultOptions);

            for (var i = 0; i < optionTypes.length; i++) {
                var optName = optionTypes[i];

                // First check if an option was passed in via the constructor
                var val = options[optName];
                // If no data attrib, then check data atrributes
                val = typeof val !== 'undefined' ? val : getDataAttrib(this.element, optName);
                // Finally, if nothing was specified, use the defaults
                val = val !== null ? val : this.defaultOptions[optName];

                // Set all options on the instance of the Slider
                if (!this.options) {
                    this.options = {};
                }
                this.options[optName] = val;
            }

            /*
             Validate `tooltip_position` against 'orientation`
             - if `tooltip_position` is incompatible with orientation, swith it to a default compatible with specified `orientation`
             -- default for "vertical" -> "right"
             -- default for "horizontal" -> "left"
             */
            if (this.options.orientation === "vertical" && (this.options.tooltip_position === "top" || this.options.tooltip_position === "bottom")) {

                this.options.tooltip_position = "right";
            } else if (this.options.orientation === "horizontal" && (this.options.tooltip_position === "left" || this.options.tooltip_position === "right")) {

                this.options.tooltip_position = "top";
            }

            function getDataAttrib(element, optName) {
                var dataName = "data-slider-" + optName.replace(/_/g, '-');
                var dataValString = element.getAttribute(dataName);

                try {
                    return JSON.parse(dataValString);
                } catch (err) {
                    return dataValString;
                }
            }

            /*************************************************
             Create Markup
             **************************************************/

            var origWidth = this.element.style.width;
            var updateSlider = false;
            var parent = this.element.parentNode;
            var sliderTrackSelection;
            var sliderTrackLow, sliderTrackHigh;
            var sliderMinHandle;
            var sliderMaxHandle;

            if (this.sliderElem) {
                updateSlider = true;
            } else {
                /* Create elements needed for slider */
                this.sliderElem = document.createElement("div");
                this.sliderElem.className = "slider";

                /* Create slider track elements */
                var sliderTrack = document.createElement("div");
                sliderTrack.className = "slider-track";

                sliderTrackLow = document.createElement("div");
                sliderTrackLow.className = "slider-track-low";

                sliderTrackSelection = document.createElement("div");
                sliderTrackSelection.className = "slider-selection";

                sliderTrackHigh = document.createElement("div");
                sliderTrackHigh.className = "slider-track-high";

                sliderMinHandle = document.createElement("div");
                sliderMinHandle.className = "slider-handle min-slider-handle";
                sliderMinHandle.setAttribute('role', 'slider');
                sliderMinHandle.setAttribute('aria-valuemin', this.options.min);
                sliderMinHandle.setAttribute('aria-valuemax', this.options.max);

                sliderMaxHandle = document.createElement("div");
                sliderMaxHandle.className = "slider-handle max-slider-handle";
                sliderMaxHandle.setAttribute('role', 'slider');
                sliderMaxHandle.setAttribute('aria-valuemin', this.options.min);
                sliderMaxHandle.setAttribute('aria-valuemax', this.options.max);

                sliderTrack.appendChild(sliderTrackLow);
                sliderTrack.appendChild(sliderTrackSelection);
                sliderTrack.appendChild(sliderTrackHigh);

                /* Create highlight range elements */
                this.rangeHighlightElements = [];
                if (Array.isArray(this.options.rangeHighlights) && this.options.rangeHighlights.length > 0) {
                    for (var j = 0; j < this.options.rangeHighlights.length; j++) {

                        var rangeHighlightElement = document.createElement("div");
                        rangeHighlightElement.className = "slider-rangeHighlight slider-selection";

                        this.rangeHighlightElements.push(rangeHighlightElement);
                        sliderTrack.appendChild(rangeHighlightElement);
                    }
                }

                /* Add aria-labelledby to handle's */
                var isLabelledbyArray = Array.isArray(this.options.labelledby);
                if (isLabelledbyArray && this.options.labelledby[0]) {
                    sliderMinHandle.setAttribute('aria-labelledby', this.options.labelledby[0]);
                }
                if (isLabelledbyArray && this.options.labelledby[1]) {
                    sliderMaxHandle.setAttribute('aria-labelledby', this.options.labelledby[1]);
                }
                if (!isLabelledbyArray && this.options.labelledby) {
                    sliderMinHandle.setAttribute('aria-labelledby', this.options.labelledby);
                    sliderMaxHandle.setAttribute('aria-labelledby', this.options.labelledby);
                }

                /* Create ticks */
                this.ticks = [];
                if (Array.isArray(this.options.ticks) && this.options.ticks.length > 0) {
                    this.ticksContainer = document.createElement('div');
                    this.ticksContainer.className = 'slider-tick-container';

                    for (i = 0; i < this.options.ticks.length; i++) {
                        var tick = document.createElement('div');
                        tick.className = 'slider-tick';
                        if (this.options.ticks_tooltip) {
                            var tickListenerReference = this._addTickListener();
                            var enterCallback = tickListenerReference.addMouseEnter(this, tick, i);
                            var leaveCallback = tickListenerReference.addMouseLeave(this, tick);

                            this.ticksCallbackMap[i] = {
                                mouseEnter: enterCallback,
                                mouseLeave: leaveCallback
                            };
                        }
                        this.ticks.push(tick);
                        this.ticksContainer.appendChild(tick);
                    }

                    sliderTrackSelection.className += " tick-slider-selection";
                }

                this.tickLabels = [];
                if (Array.isArray(this.options.ticks_labels) && this.options.ticks_labels.length > 0) {
                    this.tickLabelContainer = document.createElement('div');
                    this.tickLabelContainer.className = 'slider-tick-label-container';

                    for (i = 0; i < this.options.ticks_labels.length; i++) {
                        var label = document.createElement('div');
                        var noTickPositionsSpecified = this.options.ticks_positions.length === 0;
                        var tickLabelsIndex = this.options.reversed && noTickPositionsSpecified ? this.options.ticks_labels.length - (i + 1) : i;
                        label.className = 'slider-tick-label';
                        label.innerHTML = this.options.ticks_labels[tickLabelsIndex];

                        this.tickLabels.push(label);
                        this.tickLabelContainer.appendChild(label);
                    }
                }

                var createAndAppendTooltipSubElements = function createAndAppendTooltipSubElements(tooltipElem) {
                    var arrow = document.createElement("div");
                    arrow.className = "tooltip-arrow";

                    var inner = document.createElement("div");
                    inner.className = "tooltip-inner";

                    tooltipElem.appendChild(arrow);
                    tooltipElem.appendChild(inner);
                };

                /* Create tooltip elements */
                var sliderTooltip = document.createElement("div");
                sliderTooltip.className = "tooltip tooltip-main";
                sliderTooltip.setAttribute('role', 'presentation');
                createAndAppendTooltipSubElements(sliderTooltip);

                var sliderTooltipMin = document.createElement("div");
                sliderTooltipMin.className = "tooltip tooltip-min";
                sliderTooltipMin.setAttribute('role', 'presentation');
                createAndAppendTooltipSubElements(sliderTooltipMin);

                var sliderTooltipMax = document.createElement("div");
                sliderTooltipMax.className = "tooltip tooltip-max";
                sliderTooltipMax.setAttribute('role', 'presentation');
                createAndAppendTooltipSubElements(sliderTooltipMax);

                /* Append components to sliderElem */
                this.sliderElem.appendChild(sliderTrack);
                this.sliderElem.appendChild(sliderTooltip);
                this.sliderElem.appendChild(sliderTooltipMin);
                this.sliderElem.appendChild(sliderTooltipMax);

                if (this.tickLabelContainer) {
                    this.sliderElem.appendChild(this.tickLabelContainer);
                }
                if (this.ticksContainer) {
                    this.sliderElem.appendChild(this.ticksContainer);
                }

                this.sliderElem.appendChild(sliderMinHandle);
                this.sliderElem.appendChild(sliderMaxHandle);

                /* Append slider element to parent container, right before the original <input> element */
                parent.insertBefore(this.sliderElem, this.element);

                /* Hide original <input> element */
                this.element.style.display = "none";
            }
            /* If JQuery exists, cache JQ references */
            if ($) {
                this.$element = $(this.element);
                this.$sliderElem = $(this.sliderElem);
            }

            /*************************************************
             Setup
             **************************************************/
            this.eventToCallbackMap = {};
            this.sliderElem.id = this.options.id;

            this.touchCapable = 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch;

            this.touchX = 0;
            this.touchY = 0;

            this.tooltip = this.sliderElem.querySelector('.tooltip-main');
            this.tooltipInner = this.tooltip.querySelector('.tooltip-inner');

            this.tooltip_min = this.sliderElem.querySelector('.tooltip-min');
            this.tooltipInner_min = this.tooltip_min.querySelector('.tooltip-inner');

            this.tooltip_max = this.sliderElem.querySelector('.tooltip-max');
            this.tooltipInner_max = this.tooltip_max.querySelector('.tooltip-inner');

            if (SliderScale[this.options.scale]) {
                this.options.scale = SliderScale[this.options.scale];
            }

            if (updateSlider === true) {
                // Reset classes
                this._removeClass(this.sliderElem, 'slider-horizontal');
                this._removeClass(this.sliderElem, 'slider-vertical');
                this._removeClass(this.tooltip, 'hide');
                this._removeClass(this.tooltip_min, 'hide');
                this._removeClass(this.tooltip_max, 'hide');

                // Undo existing inline styles for track
                ["left", "top", "width", "height"].forEach(function (prop) {
                    this._removeProperty(this.trackLow, prop);
                    this._removeProperty(this.trackSelection, prop);
                    this._removeProperty(this.trackHigh, prop);
                }, this);

                // Undo inline styles on handles
                [this.handle1, this.handle2].forEach(function (handle) {
                    this._removeProperty(handle, 'left');
                    this._removeProperty(handle, 'top');
                }, this);

                // Undo inline styles and classes on tooltips
                [this.tooltip, this.tooltip_min, this.tooltip_max].forEach(function (tooltip) {
                    this._removeProperty(tooltip, 'left');
                    this._removeProperty(tooltip, 'top');
                    this._removeProperty(tooltip, 'margin-left');
                    this._removeProperty(tooltip, 'margin-top');

                    this._removeClass(tooltip, 'right');
                    this._removeClass(tooltip, 'top');
                }, this);
            }

            if (this.options.orientation === 'vertical') {
                this._addClass(this.sliderElem, 'slider-vertical');
                this.stylePos = 'top';
                this.mousePos = 'pageY';
                this.sizePos = 'offsetHeight';
            } else {
                this._addClass(this.sliderElem, 'slider-horizontal');
                this.sliderElem.style.width = origWidth;
                this.options.orientation = 'horizontal';
                this.stylePos = 'left';
                this.mousePos = 'pageX';
                this.sizePos = 'offsetWidth';
            }
            this._setTooltipPosition();
            /* In case ticks are specified, overwrite the min and max bounds */
            if (Array.isArray(this.options.ticks) && this.options.ticks.length > 0) {
                this.options.max = Math.max.apply(Math, this.options.ticks);
                this.options.min = Math.min.apply(Math, this.options.ticks);
            }

            if (Array.isArray(this.options.value)) {
                this.options.range = true;
                this._state.value = this.options.value;
            } else if (this.options.range) {
                // User wants a range, but value is not an array
                this._state.value = [this.options.value, this.options.max];
            } else {
                this._state.value = this.options.value;
            }

            this.trackLow = sliderTrackLow || this.trackLow;
            this.trackSelection = sliderTrackSelection || this.trackSelection;
            this.trackHigh = sliderTrackHigh || this.trackHigh;

            if (this.options.selection === 'none') {
                this._addClass(this.trackLow, 'hide');
                this._addClass(this.trackSelection, 'hide');
                this._addClass(this.trackHigh, 'hide');
            } else if (this.options.selection === 'after' || this.options.selection === 'before') {
                this._removeClass(this.trackLow, 'hide');
                this._removeClass(this.trackSelection, 'hide');
                this._removeClass(this.trackHigh, 'hide');
            }

            this.handle1 = sliderMinHandle || this.handle1;
            this.handle2 = sliderMaxHandle || this.handle2;

            if (updateSlider === true) {
                // Reset classes
                this._removeClass(this.handle1, 'round triangle');
                this._removeClass(this.handle2, 'round triangle hide');

                for (i = 0; i < this.ticks.length; i++) {
                    this._removeClass(this.ticks[i], 'round triangle hide');
                }
            }

            var availableHandleModifiers = ['round', 'triangle', 'custom'];
            var isValidHandleType = availableHandleModifiers.indexOf(this.options.handle) !== -1;
            if (isValidHandleType) {
                this._addClass(this.handle1, this.options.handle);
                this._addClass(this.handle2, this.options.handle);

                for (i = 0; i < this.ticks.length; i++) {
                    this._addClass(this.ticks[i], this.options.handle);
                }
            }

            this._state.offset = this._offset(this.sliderElem);
            this._state.size = this.sliderElem[this.sizePos];
            this.setValue(this._state.value);

            /******************************************
             Bind Event Listeners
             ******************************************/

            // Bind keyboard handlers
            this.handle1Keydown = this._keydown.bind(this, 0);
            this.handle1.addEventListener("keydown", this.handle1Keydown, false);

            this.handle2Keydown = this._keydown.bind(this, 1);
            this.handle2.addEventListener("keydown", this.handle2Keydown, false);

            this.mousedown = this._mousedown.bind(this);
            this.touchstart = this._touchstart.bind(this);
            this.touchmove = this._touchmove.bind(this);

            if (this.touchCapable) {
                // Bind touch handlers
                this.sliderElem.addEventListener("touchstart", this.touchstart, false);
                this.sliderElem.addEventListener("touchmove", this.touchmove, false);
            }
            this.sliderElem.addEventListener("mousedown", this.mousedown, false);

            // Bind window handlers
            this.resize = this._resize.bind(this);
            window.addEventListener("resize", this.resize, false);

            // Bind tooltip-related handlers
            if (this.options.tooltip === 'hide') {
                this._addClass(this.tooltip, 'hide');
                this._addClass(this.tooltip_min, 'hide');
                this._addClass(this.tooltip_max, 'hide');
            } else if (this.options.tooltip === 'always') {
                this._showTooltip();
                this._alwaysShowTooltip = true;
            } else {
                this.showTooltip = this._showTooltip.bind(this);
                this.hideTooltip = this._hideTooltip.bind(this);

                if (this.options.ticks_tooltip) {
                    var callbackHandle = this._addTickListener();
                    //create handle1 listeners and store references in map
                    var mouseEnter = callbackHandle.addMouseEnter(this, this.handle1);
                    var mouseLeave = callbackHandle.addMouseLeave(this, this.handle1);
                    this.handleCallbackMap.handle1 = {
                        mouseEnter: mouseEnter,
                        mouseLeave: mouseLeave
                    };
                    //create handle2 listeners and store references in map
                    mouseEnter = callbackHandle.addMouseEnter(this, this.handle2);
                    mouseLeave = callbackHandle.addMouseLeave(this, this.handle2);
                    this.handleCallbackMap.handle2 = {
                        mouseEnter: mouseEnter,
                        mouseLeave: mouseLeave
                    };
                } else {
                    this.sliderElem.addEventListener("mouseenter", this.showTooltip, false);
                    this.sliderElem.addEventListener("mouseleave", this.hideTooltip, false);
                }

                this.handle1.addEventListener("focus", this.showTooltip, false);
                this.handle1.addEventListener("blur", this.hideTooltip, false);

                this.handle2.addEventListener("focus", this.showTooltip, false);
                this.handle2.addEventListener("blur", this.hideTooltip, false);
            }

            if (this.options.enabled) {
                this.enable();
            } else {
                this.disable();
            }
        }

        /*************************************************
         INSTANCE PROPERTIES/METHODS
         - Any methods bound to the prototype are considered
         part of the plugin's `public` interface
         **************************************************/
        Slider.prototype = {
            _init: function _init() {}, // NOTE: Must exist to support bridget

            constructor: Slider,

            defaultOptions: {
                id: "",
                min: 0,
                max: 10,
                step: 1,
                precision: 0,
                orientation: 'horizontal',
                value: 5,
                range: false,
                selection: 'before',
                tooltip: 'show',
                tooltip_split: false,
                handle: 'round',
                reversed: false,
                enabled: true,
                formatter: function formatter(val) {
                    if (Array.isArray(val)) {
                        return val[0] + " : " + val[1];
                    } else {
                        return val;
                    }
                },
                natural_arrow_keys: false,
                ticks: [],
                ticks_positions: [],
                ticks_labels: [],
                ticks_snap_bounds: 0,
                ticks_tooltip: false,
                scale: 'linear',
                focus: false,
                tooltip_position: null,
                labelledby: null,
                rangeHighlights: []
            },

            getElement: function getElement() {
                return this.sliderElem;
            },

            getValue: function getValue() {
                if (this.options.range) {
                    return this._state.value;
                } else {
                    return this._state.value[0];
                }
            },

            setValue: function setValue(val, triggerSlideEvent, triggerChangeEvent) {
                if (!val) {
                    val = 0;
                }
                var oldValue = this.getValue();
                this._state.value = this._validateInputValue(val);
                var applyPrecision = this._applyPrecision.bind(this);

                if (this.options.range) {
                    this._state.value[0] = applyPrecision(this._state.value[0]);
                    this._state.value[1] = applyPrecision(this._state.value[1]);

                    this._state.value[0] = Math.max(this.options.min, Math.min(this.options.max, this._state.value[0]));
                    this._state.value[1] = Math.max(this.options.min, Math.min(this.options.max, this._state.value[1]));
                } else {
                    this._state.value = applyPrecision(this._state.value);
                    this._state.value = [Math.max(this.options.min, Math.min(this.options.max, this._state.value))];
                    this._addClass(this.handle2, 'hide');
                    if (this.options.selection === 'after') {
                        this._state.value[1] = this.options.max;
                    } else {
                        this._state.value[1] = this.options.min;
                    }
                }

                if (this.options.max > this.options.min) {
                    this._state.percentage = [this._toPercentage(this._state.value[0]), this._toPercentage(this._state.value[1]), this.options.step * 100 / (this.options.max - this.options.min)];
                } else {
                    this._state.percentage = [0, 0, 100];
                }

                this._layout();
                var newValue = this.options.range ? this._state.value : this._state.value[0];

                this._setDataVal(newValue);
                if (triggerSlideEvent === true) {
                    this._trigger('slide', newValue);
                }
                if (oldValue !== newValue && triggerChangeEvent === true) {
                    this._trigger('change', {
                        oldValue: oldValue,
                        newValue: newValue
                    });
                }

                return this;
            },

            destroy: function destroy() {
                // Remove event handlers on slider elements
                this._removeSliderEventHandlers();

                // Remove the slider from the DOM
                this.sliderElem.parentNode.removeChild(this.sliderElem);
                /* Show original <input> element */
                this.element.style.display = "";

                // Clear out custom event bindings
                this._cleanUpEventCallbacksMap();

                // Remove data values
                this.element.removeAttribute("data");

                // Remove JQuery handlers/data
                if ($) {
                    this._unbindJQueryEventHandlers();
                    this.$element.removeData('slider');
                }
            },

            disable: function disable() {
                this._state.enabled = false;
                this.handle1.removeAttribute("tabindex");
                this.handle2.removeAttribute("tabindex");
                this._addClass(this.sliderElem, 'slider-disabled');
                this._trigger('slideDisabled');

                return this;
            },

            enable: function enable() {
                this._state.enabled = true;
                this.handle1.setAttribute("tabindex", 0);
                this.handle2.setAttribute("tabindex", 0);
                this._removeClass(this.sliderElem, 'slider-disabled');
                this._trigger('slideEnabled');

                return this;
            },

            toggle: function toggle() {
                if (this._state.enabled) {
                    this.disable();
                } else {
                    this.enable();
                }
                return this;
            },

            isEnabled: function isEnabled() {
                return this._state.enabled;
            },

            on: function on(evt, callback) {
                this._bindNonQueryEventHandler(evt, callback);
                return this;
            },

            off: function off(evt, callback) {
                if ($) {
                    this.$element.off(evt, callback);
                    this.$sliderElem.off(evt, callback);
                } else {
                    this._unbindNonQueryEventHandler(evt, callback);
                }
            },

            getAttribute: function getAttribute(attribute) {
                if (attribute) {
                    return this.options[attribute];
                } else {
                    return this.options;
                }
            },

            setAttribute: function setAttribute(attribute, value) {
                this.options[attribute] = value;
                return this;
            },

            refresh: function refresh() {
                this._removeSliderEventHandlers();
                createNewSlider.call(this, this.element, this.options);
                if ($) {
                    // Bind new instance of slider to the element
                    $.data(this.element, 'slider', this);
                }
                return this;
            },

            relayout: function relayout() {
                this._resize();
                this._layout();
                return this;
            },

            /******************************+
             HELPERS
             - Any method that is not part of the public interface.
             - Place it underneath this comment block and write its signature like so:
             _fnName : function() {...}
             ********************************/
            _removeSliderEventHandlers: function _removeSliderEventHandlers() {
                // Remove keydown event listeners
                this.handle1.removeEventListener("keydown", this.handle1Keydown, false);
                this.handle2.removeEventListener("keydown", this.handle2Keydown, false);

                //remove the listeners from the ticks and handles if they had their own listeners
                if (this.options.ticks_tooltip) {
                    var ticks = this.ticksContainer.getElementsByClassName('slider-tick');
                    for (var i = 0; i < ticks.length; i++) {
                        ticks[i].removeEventListener('mouseenter', this.ticksCallbackMap[i].mouseEnter, false);
                        ticks[i].removeEventListener('mouseleave', this.ticksCallbackMap[i].mouseLeave, false);
                    }
                    this.handle1.removeEventListener('mouseenter', this.handleCallbackMap.handle1.mouseEnter, false);
                    this.handle2.removeEventListener('mouseenter', this.handleCallbackMap.handle2.mouseEnter, false);
                    this.handle1.removeEventListener('mouseleave', this.handleCallbackMap.handle1.mouseLeave, false);
                    this.handle2.removeEventListener('mouseleave', this.handleCallbackMap.handle2.mouseLeave, false);
                }

                this.handleCallbackMap = null;
                this.ticksCallbackMap = null;

                if (this.showTooltip) {
                    this.handle1.removeEventListener("focus", this.showTooltip, false);
                    this.handle2.removeEventListener("focus", this.showTooltip, false);
                }
                if (this.hideTooltip) {
                    this.handle1.removeEventListener("blur", this.hideTooltip, false);
                    this.handle2.removeEventListener("blur", this.hideTooltip, false);
                }

                // Remove event listeners from sliderElem
                if (this.showTooltip) {
                    this.sliderElem.removeEventListener("mouseenter", this.showTooltip, false);
                }
                if (this.hideTooltip) {
                    this.sliderElem.removeEventListener("mouseleave", this.hideTooltip, false);
                }
                this.sliderElem.removeEventListener("touchstart", this.touchstart, false);
                this.sliderElem.removeEventListener("touchmove", this.touchmove, false);
                this.sliderElem.removeEventListener("mousedown", this.mousedown, false);

                // Remove window event listener
                window.removeEventListener("resize", this.resize, false);
            },
            _bindNonQueryEventHandler: function _bindNonQueryEventHandler(evt, callback) {
                if (this.eventToCallbackMap[evt] === undefined) {
                    this.eventToCallbackMap[evt] = [];
                }
                this.eventToCallbackMap[evt].push(callback);
            },
            _unbindNonQueryEventHandler: function _unbindNonQueryEventHandler(evt, callback) {
                var callbacks = this.eventToCallbackMap[evt];
                if (callbacks !== undefined) {
                    for (var i = 0; i < callbacks.length; i++) {
                        if (callbacks[i] === callback) {
                            callbacks.splice(i, 1);
                            break;
                        }
                    }
                }
            },
            _cleanUpEventCallbacksMap: function _cleanUpEventCallbacksMap() {
                var eventNames = Object.keys(this.eventToCallbackMap);
                for (var i = 0; i < eventNames.length; i++) {
                    var eventName = eventNames[i];
                    delete this.eventToCallbackMap[eventName];
                }
            },
            _showTooltip: function _showTooltip() {
                if (this.options.tooltip_split === false) {
                    this._addClass(this.tooltip, 'in');
                    this.tooltip_min.style.display = 'none';
                    this.tooltip_max.style.display = 'none';
                } else {
                    this._addClass(this.tooltip_min, 'in');
                    this._addClass(this.tooltip_max, 'in');
                    this.tooltip.style.display = 'none';
                }
                this._state.over = true;
            },
            _hideTooltip: function _hideTooltip() {
                if (this._state.inDrag === false && this.alwaysShowTooltip !== true) {
                    this._removeClass(this.tooltip, 'in');
                    this._removeClass(this.tooltip_min, 'in');
                    this._removeClass(this.tooltip_max, 'in');
                }
                this._state.over = false;
            },
            _setToolTipOnMouseOver: function _setToolTipOnMouseOver(tempState) {
                var formattedTooltipVal = this.options.formatter(!tempState ? this._state.value[0] : tempState.value[0]);
                var positionPercentages = !tempState ? getPositionPercentages(this._state, this.options.reversed) : getPositionPercentages(tempState, this.options.reversed);
                this._setText(this.tooltipInner, formattedTooltipVal);

                this.tooltip.style[this.stylePos] = positionPercentages[0] + '%';
                if (this.options.orientation === 'vertical') {
                    this._css(this.tooltip, 'margin-top', -this.tooltip.offsetHeight / 2 + 'px');
                } else {
                    this._css(this.tooltip, 'margin-left', -this.tooltip.offsetWidth / 2 + 'px');
                }

                function getPositionPercentages(state, reversed) {
                    if (reversed) {
                        return [100 - state.percentage[0], this.options.range ? 100 - state.percentage[1] : state.percentage[1]];
                    }
                    return [state.percentage[0], state.percentage[1]];
                }
            },
            _addTickListener: function _addTickListener() {
                return {
                    addMouseEnter: function addMouseEnter(reference, tick, index) {
                        var enter = function enter() {
                            var tempState = reference._state;
                            var idString = index >= 0 ? index : this.attributes['aria-valuenow'].value;
                            var hoverIndex = parseInt(idString, 10);
                            tempState.value[0] = hoverIndex;
                            tempState.percentage[0] = reference.options.ticks_positions[hoverIndex];
                            reference._setToolTipOnMouseOver(tempState);
                            reference._showTooltip();
                        };
                        tick.addEventListener("mouseenter", enter, false);
                        return enter;
                    },
                    addMouseLeave: function addMouseLeave(reference, tick) {
                        var leave = function leave() {
                            reference._hideTooltip();
                        };
                        tick.addEventListener("mouseleave", leave, false);
                        return leave;
                    }
                };
            },
            _layout: function _layout() {
                var positionPercentages;

                if (this.options.reversed) {
                    positionPercentages = [100 - this._state.percentage[0], this.options.range ? 100 - this._state.percentage[1] : this._state.percentage[1]];
                } else {
                    positionPercentages = [this._state.percentage[0], this._state.percentage[1]];
                }

                this.handle1.style[this.stylePos] = positionPercentages[0] + '%';
                this.handle1.setAttribute('aria-valuenow', this._state.value[0]);
                if (isNaN(this.options.formatter(this._state.value[0]))) {
                    this.handle1.setAttribute('aria-valuetext', this.options.formatter(this._state.value[0]));
                }

                this.handle2.style[this.stylePos] = positionPercentages[1] + '%';
                this.handle2.setAttribute('aria-valuenow', this._state.value[1]);
                if (isNaN(this.options.formatter(this._state.value[1]))) {
                    this.handle2.setAttribute('aria-valuetext', this.options.formatter(this._state.value[1]));
                }

                /* Position highlight range elements */
                if (this.rangeHighlightElements.length > 0 && Array.isArray(this.options.rangeHighlights) && this.options.rangeHighlights.length > 0) {
                    for (var _i = 0; _i < this.options.rangeHighlights.length; _i++) {
                        var startPercent = this._toPercentage(this.options.rangeHighlights[_i].start);
                        var endPercent = this._toPercentage(this.options.rangeHighlights[_i].end);

                        if (this.options.reversed) {
                            var sp = 100 - endPercent;
                            endPercent = 100 - startPercent;
                            startPercent = sp;
                        }

                        var currentRange = this._createHighlightRange(startPercent, endPercent);

                        if (currentRange) {
                            if (this.options.orientation === 'vertical') {
                                this.rangeHighlightElements[_i].style.top = currentRange.start + "%";
                                this.rangeHighlightElements[_i].style.height = currentRange.size + "%";
                            } else {
                                this.rangeHighlightElements[_i].style.left = currentRange.start + "%";
                                this.rangeHighlightElements[_i].style.width = currentRange.size + "%";
                            }
                        } else {
                            this.rangeHighlightElements[_i].style.display = "none";
                        }
                    }
                }

                /* Position ticks and labels */
                if (Array.isArray(this.options.ticks) && this.options.ticks.length > 0) {

                    var styleSize = this.options.orientation === 'vertical' ? 'height' : 'width';
                    var styleMargin = this.options.orientation === 'vertical' ? 'marginTop' : 'marginLeft';
                    var labelSize = this._state.size / (this.options.ticks.length - 1);

                    if (this.tickLabelContainer) {
                        var extraMargin = 0;
                        if (this.options.ticks_positions.length === 0) {
                            if (this.options.orientation !== 'vertical') {
                                this.tickLabelContainer.style[styleMargin] = -labelSize / 2 + 'px';
                            }

                            extraMargin = this.tickLabelContainer.offsetHeight;
                        } else {
                            /* Chidren are position absolute, calculate height by finding the max offsetHeight of a child */
                            for (i = 0; i < this.tickLabelContainer.childNodes.length; i++) {
                                if (this.tickLabelContainer.childNodes[i].offsetHeight > extraMargin) {
                                    extraMargin = this.tickLabelContainer.childNodes[i].offsetHeight;
                                }
                            }
                        }
                        if (this.options.orientation === 'horizontal') {
                            this.sliderElem.style.marginBottom = extraMargin + 'px';
                        }
                    }
                    for (var i = 0; i < this.options.ticks.length; i++) {

                        var percentage = this.options.ticks_positions[i] || this._toPercentage(this.options.ticks[i]);

                        if (this.options.reversed) {
                            percentage = 100 - percentage;
                        }

                        this.ticks[i].style[this.stylePos] = percentage + '%';

                        /* Set class labels to denote whether ticks are in the selection */
                        this._removeClass(this.ticks[i], 'in-selection');
                        if (!this.options.range) {
                            if (this.options.selection === 'after' && percentage >= positionPercentages[0]) {
                                this._addClass(this.ticks[i], 'in-selection');
                            } else if (this.options.selection === 'before' && percentage <= positionPercentages[0]) {
                                this._addClass(this.ticks[i], 'in-selection');
                            }
                        } else if (percentage >= positionPercentages[0] && percentage <= positionPercentages[1]) {
                            this._addClass(this.ticks[i], 'in-selection');
                        }

                        if (this.tickLabels[i]) {
                            this.tickLabels[i].style[styleSize] = labelSize + 'px';

                            if (this.options.orientation !== 'vertical' && this.options.ticks_positions[i] !== undefined) {
                                this.tickLabels[i].style.position = 'absolute';
                                this.tickLabels[i].style[this.stylePos] = percentage + '%';
                                this.tickLabels[i].style[styleMargin] = -labelSize / 2 + 'px';
                            } else if (this.options.orientation === 'vertical') {
                                this.tickLabels[i].style['marginLeft'] = this.sliderElem.offsetWidth + 'px';
                                this.tickLabelContainer.style['marginTop'] = this.sliderElem.offsetWidth / 2 * -1 + 'px';
                            }
                        }
                    }
                }

                var formattedTooltipVal;

                if (this.options.range) {
                    formattedTooltipVal = this.options.formatter(this._state.value);
                    this._setText(this.tooltipInner, formattedTooltipVal);
                    this.tooltip.style[this.stylePos] = (positionPercentages[1] + positionPercentages[0]) / 2 + '%';

                    if (this.options.orientation === 'vertical') {
                        this._css(this.tooltip, 'margin-top', -this.tooltip.offsetHeight / 2 + 'px');
                    } else {
                        this._css(this.tooltip, 'margin-left', -this.tooltip.offsetWidth / 2 + 'px');
                    }

                    if (this.options.orientation === 'vertical') {
                        this._css(this.tooltip, 'margin-top', -this.tooltip.offsetHeight / 2 + 'px');
                    } else {
                        this._css(this.tooltip, 'margin-left', -this.tooltip.offsetWidth / 2 + 'px');
                    }

                    var innerTooltipMinText = this.options.formatter(this._state.value[0]);
                    this._setText(this.tooltipInner_min, innerTooltipMinText);

                    var innerTooltipMaxText = this.options.formatter(this._state.value[1]);
                    this._setText(this.tooltipInner_max, innerTooltipMaxText);

                    this.tooltip_min.style[this.stylePos] = positionPercentages[0] + '%';

                    if (this.options.orientation === 'vertical') {
                        this._css(this.tooltip_min, 'margin-top', -this.tooltip_min.offsetHeight / 2 + 'px');
                    } else {
                        this._css(this.tooltip_min, 'margin-left', -this.tooltip_min.offsetWidth / 2 + 'px');
                    }

                    this.tooltip_max.style[this.stylePos] = positionPercentages[1] + '%';

                    if (this.options.orientation === 'vertical') {
                        this._css(this.tooltip_max, 'margin-top', -this.tooltip_max.offsetHeight / 2 + 'px');
                    } else {
                        this._css(this.tooltip_max, 'margin-left', -this.tooltip_max.offsetWidth / 2 + 'px');
                    }
                } else {
                    formattedTooltipVal = this.options.formatter(this._state.value[0]);
                    this._setText(this.tooltipInner, formattedTooltipVal);

                    this.tooltip.style[this.stylePos] = positionPercentages[0] + '%';
                    if (this.options.orientation === 'vertical') {
                        this._css(this.tooltip, 'margin-top', -this.tooltip.offsetHeight / 2 + 'px');
                    } else {
                        this._css(this.tooltip, 'margin-left', -this.tooltip.offsetWidth / 2 + 'px');
                    }
                }

                if (this.options.orientation === 'vertical') {
                    this.trackLow.style.top = '0';
                    this.trackLow.style.height = Math.min(positionPercentages[0], positionPercentages[1]) + '%';

                    this.trackSelection.style.top = Math.min(positionPercentages[0], positionPercentages[1]) + '%';
                    this.trackSelection.style.height = Math.abs(positionPercentages[0] - positionPercentages[1]) + '%';

                    this.trackHigh.style.bottom = '0';
                    this.trackHigh.style.height = 100 - Math.min(positionPercentages[0], positionPercentages[1]) - Math.abs(positionPercentages[0] - positionPercentages[1]) + '%';
                } else {
                    this.trackLow.style.left = '0';
                    this.trackLow.style.width = Math.min(positionPercentages[0], positionPercentages[1]) + '%';

                    this.trackSelection.style.left = Math.min(positionPercentages[0], positionPercentages[1]) + '%';
                    this.trackSelection.style.width = Math.abs(positionPercentages[0] - positionPercentages[1]) + '%';

                    this.trackHigh.style.right = '0';
                    this.trackHigh.style.width = 100 - Math.min(positionPercentages[0], positionPercentages[1]) - Math.abs(positionPercentages[0] - positionPercentages[1]) + '%';

                    var offset_min = this.tooltip_min.getBoundingClientRect();
                    var offset_max = this.tooltip_max.getBoundingClientRect();

                    if (this.options.tooltip_position === 'bottom') {
                        if (offset_min.right > offset_max.left) {
                            this._removeClass(this.tooltip_max, 'bottom');
                            this._addClass(this.tooltip_max, 'top');
                            this.tooltip_max.style.top = '';
                            this.tooltip_max.style.bottom = 22 + 'px';
                        } else {
                            this._removeClass(this.tooltip_max, 'top');
                            this._addClass(this.tooltip_max, 'bottom');
                            this.tooltip_max.style.top = this.tooltip_min.style.top;
                            this.tooltip_max.style.bottom = '';
                        }
                    } else {
                        if (offset_min.right > offset_max.left) {
                            this._removeClass(this.tooltip_max, 'top');
                            this._addClass(this.tooltip_max, 'bottom');
                            this.tooltip_max.style.top = 18 + 'px';
                        } else {
                            this._removeClass(this.tooltip_max, 'bottom');
                            this._addClass(this.tooltip_max, 'top');
                            this.tooltip_max.style.top = this.tooltip_min.style.top;
                        }
                    }
                }
            },
            _createHighlightRange: function _createHighlightRange(start, end) {
                if (this._isHighlightRange(start, end)) {
                    if (start > end) {
                        return { 'start': end, 'size': start - end };
                    }
                    return { 'start': start, 'size': end - start };
                }
                return null;
            },
            _isHighlightRange: function _isHighlightRange(start, end) {
                if (0 <= start && start <= 100 && 0 <= end && end <= 100) {
                    return true;
                } else {
                    return false;
                }
            },
            _resize: function _resize(ev) {
                /*jshint unused:false*/
                this._state.offset = this._offset(this.sliderElem);
                this._state.size = this.sliderElem[this.sizePos];
                this._layout();
            },
            _removeProperty: function _removeProperty(element, prop) {
                if (element.style.removeProperty) {
                    element.style.removeProperty(prop);
                } else {
                    element.style.removeAttribute(prop);
                }
            },
            _mousedown: function _mousedown(ev) {
                if (!this._state.enabled) {
                    return false;
                }

                this._state.offset = this._offset(this.sliderElem);
                this._state.size = this.sliderElem[this.sizePos];

                var percentage = this._getPercentage(ev);

                if (this.options.range) {
                    var diff1 = Math.abs(this._state.percentage[0] - percentage);
                    var diff2 = Math.abs(this._state.percentage[1] - percentage);
                    this._state.dragged = diff1 < diff2 ? 0 : 1;
                    this._adjustPercentageForRangeSliders(percentage);
                } else {
                    this._state.dragged = 0;
                }

                this._state.percentage[this._state.dragged] = percentage;
                this._layout();

                if (this.touchCapable) {
                    document.removeEventListener("touchmove", this.mousemove, false);
                    document.removeEventListener("touchend", this.mouseup, false);
                }

                if (this.mousemove) {
                    document.removeEventListener("mousemove", this.mousemove, false);
                }
                if (this.mouseup) {
                    document.removeEventListener("mouseup", this.mouseup, false);
                }

                this.mousemove = this._mousemove.bind(this);
                this.mouseup = this._mouseup.bind(this);

                if (this.touchCapable) {
                    // Touch: Bind touch events:
                    document.addEventListener("touchmove", this.mousemove, false);
                    document.addEventListener("touchend", this.mouseup, false);
                }
                // Bind mouse events:
                document.addEventListener("mousemove", this.mousemove, false);
                document.addEventListener("mouseup", this.mouseup, false);

                this._state.inDrag = true;
                var newValue = this._calculateValue();

                this._trigger('slideStart', newValue);

                this._setDataVal(newValue);
                this.setValue(newValue, false, true);

                this._pauseEvent(ev);

                if (this.options.focus) {
                    this._triggerFocusOnHandle(this._state.dragged);
                }

                return true;
            },
            _touchstart: function _touchstart(ev) {
                if (ev.changedTouches === undefined) {
                    this._mousedown(ev);
                    return;
                }

                var touch = ev.changedTouches[0];
                this.touchX = touch.pageX;
                this.touchY = touch.pageY;
            },
            _triggerFocusOnHandle: function _triggerFocusOnHandle(handleIdx) {
                if (handleIdx === 0) {
                    this.handle1.focus();
                }
                if (handleIdx === 1) {
                    this.handle2.focus();
                }
            },
            _keydown: function _keydown(handleIdx, ev) {
                if (!this._state.enabled) {
                    return false;
                }

                var dir;
                switch (ev.keyCode) {
                    case 37: // left
                    case 40:
                        // down
                        dir = -1;
                        break;
                    case 39: // right
                    case 38:
                        // up
                        dir = 1;
                        break;
                }
                if (!dir) {
                    return;
                }

                // use natural arrow keys instead of from min to max
                if (this.options.natural_arrow_keys) {
                    var ifVerticalAndNotReversed = this.options.orientation === 'vertical' && !this.options.reversed;
                    var ifHorizontalAndReversed = this.options.orientation === 'horizontal' && this.options.reversed;

                    if (ifVerticalAndNotReversed || ifHorizontalAndReversed) {
                        dir = -dir;
                    }
                }

                var val = this._state.value[handleIdx] + dir * this.options.step;
                if (this.options.range) {
                    val = [!handleIdx ? val : this._state.value[0], handleIdx ? val : this._state.value[1]];
                }

                this._trigger('slideStart', val);
                this._setDataVal(val);
                this.setValue(val, true, true);

                this._setDataVal(val);
                this._trigger('slideStop', val);
                this._layout();

                this._pauseEvent(ev);

                return false;
            },
            _pauseEvent: function _pauseEvent(ev) {
                if (ev.stopPropagation) {
                    ev.stopPropagation();
                }
                if (ev.preventDefault) {
                    ev.preventDefault();
                }
                ev.cancelBubble = true;
                ev.returnValue = false;
            },
            _mousemove: function _mousemove(ev) {
                if (!this._state.enabled) {
                    return false;
                }

                var percentage = this._getPercentage(ev);
                this._adjustPercentageForRangeSliders(percentage);
                this._state.percentage[this._state.dragged] = percentage;
                this._layout();

                var val = this._calculateValue(true);
                this.setValue(val, true, true);

                return false;
            },
            _touchmove: function _touchmove(ev) {
                if (ev.changedTouches === undefined) {
                    return;
                }

                var touch = ev.changedTouches[0];

                var xDiff = touch.pageX - this.touchX;
                var yDiff = touch.pageY - this.touchY;

                if (!this._state.inDrag) {
                    // Vertical Slider
                    if (this.options.orientation === 'vertical' && xDiff <= 5 && xDiff >= -5 && (yDiff >= 15 || yDiff <= -15)) {
                        this._mousedown(ev);
                    }
                    // Horizontal slider.
                    else if (yDiff <= 5 && yDiff >= -5 && (xDiff >= 15 || xDiff <= -15)) {
                        this._mousedown(ev);
                    }
                }
            },
            _adjustPercentageForRangeSliders: function _adjustPercentageForRangeSliders(percentage) {
                if (this.options.range) {
                    var precision = this._getNumDigitsAfterDecimalPlace(percentage);
                    precision = precision ? precision - 1 : 0;
                    var percentageWithAdjustedPrecision = this._applyToFixedAndParseFloat(percentage, precision);
                    if (this._state.dragged === 0 && this._applyToFixedAndParseFloat(this._state.percentage[1], precision) < percentageWithAdjustedPrecision) {
                        this._state.percentage[0] = this._state.percentage[1];
                        this._state.dragged = 1;
                    } else if (this._state.dragged === 1 && this._applyToFixedAndParseFloat(this._state.percentage[0], precision) > percentageWithAdjustedPrecision) {
                        this._state.percentage[1] = this._state.percentage[0];
                        this._state.dragged = 0;
                    }
                }
            },
            _mouseup: function _mouseup() {
                if (!this._state.enabled) {
                    return false;
                }
                if (this.touchCapable) {
                    // Touch: Unbind touch event handlers:
                    document.removeEventListener("touchmove", this.mousemove, false);
                    document.removeEventListener("touchend", this.mouseup, false);
                }
                // Unbind mouse event handlers:
                document.removeEventListener("mousemove", this.mousemove, false);
                document.removeEventListener("mouseup", this.mouseup, false);

                this._state.inDrag = false;
                if (this._state.over === false) {
                    this._hideTooltip();
                }
                var val = this._calculateValue(true);

                this._layout();
                this._setDataVal(val);
                this._trigger('slideStop', val);

                return false;
            },
            _calculateValue: function _calculateValue(snapToClosestTick) {
                var val;
                if (this.options.range) {
                    val = [this.options.min, this.options.max];
                    if (this._state.percentage[0] !== 0) {
                        val[0] = this._toValue(this._state.percentage[0]);
                        val[0] = this._applyPrecision(val[0]);
                    }
                    if (this._state.percentage[1] !== 100) {
                        val[1] = this._toValue(this._state.percentage[1]);
                        val[1] = this._applyPrecision(val[1]);
                    }
                } else {
                    val = this._toValue(this._state.percentage[0]);
                    val = parseFloat(val);
                    val = this._applyPrecision(val);
                }

                if (snapToClosestTick) {
                    var min = [val, Infinity];
                    for (var i = 0; i < this.options.ticks.length; i++) {
                        var diff = Math.abs(this.options.ticks[i] - val);
                        if (diff <= min[1]) {
                            min = [this.options.ticks[i], diff];
                        }
                    }
                    if (min[1] <= this.options.ticks_snap_bounds) {
                        return min[0];
                    }
                }

                return val;
            },
            _applyPrecision: function _applyPrecision(val) {
                var precision = this.options.precision || this._getNumDigitsAfterDecimalPlace(this.options.step);
                return this._applyToFixedAndParseFloat(val, precision);
            },
            _getNumDigitsAfterDecimalPlace: function _getNumDigitsAfterDecimalPlace(num) {
                var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
                if (!match) {
                    return 0;
                }
                return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
            },
            _applyToFixedAndParseFloat: function _applyToFixedAndParseFloat(num, toFixedInput) {
                var truncatedNum = num.toFixed(toFixedInput);
                return parseFloat(truncatedNum);
            },
            /*
             Credits to Mike Samuel for the following method!
             Source: http://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
             */
            _getPercentage: function _getPercentage(ev) {
                if (this.touchCapable && (ev.type === 'touchstart' || ev.type === 'touchmove')) {
                    ev = ev.touches[0];
                }

                var eventPosition = ev[this.mousePos];
                var sliderOffset = this._state.offset[this.stylePos];
                var distanceToSlide = eventPosition - sliderOffset;
                // Calculate what percent of the length the slider handle has slid
                var percentage = distanceToSlide / this._state.size * 100;
                percentage = Math.round(percentage / this._state.percentage[2]) * this._state.percentage[2];
                if (this.options.reversed) {
                    percentage = 100 - percentage;
                }

                // Make sure the percent is within the bounds of the slider.
                // 0% corresponds to the 'min' value of the slide
                // 100% corresponds to the 'max' value of the slide
                return Math.max(0, Math.min(100, percentage));
            },
            _validateInputValue: function _validateInputValue(val) {
                if (!isNaN(+val)) {
                    return +val;
                } else if (Array.isArray(val)) {
                    this._validateArray(val);
                    return val;
                } else {
                    throw new Error(ErrorMsgs.formatInvalidInputErrorMsg(val));
                }
            },
            _validateArray: function _validateArray(val) {
                for (var i = 0; i < val.length; i++) {
                    var input = val[i];
                    if (typeof input !== 'number') {
                        throw new Error(ErrorMsgs.formatInvalidInputErrorMsg(input));
                    }
                }
            },
            _setDataVal: function _setDataVal(val) {
                this.element.setAttribute('data-value', val);
                this.element.setAttribute('value', val);
                this.element.value = val;
            },
            _trigger: function _trigger(evt, val) {
                val = val || val === 0 ? val : undefined;

                var callbackFnArray = this.eventToCallbackMap[evt];
                if (callbackFnArray && callbackFnArray.length) {
                    for (var i = 0; i < callbackFnArray.length; i++) {
                        var callbackFn = callbackFnArray[i];
                        callbackFn(val);
                    }
                }

                /* If JQuery exists, trigger JQuery events */
                if ($) {
                    this._triggerJQueryEvent(evt, val);
                }
            },
            _triggerJQueryEvent: function _triggerJQueryEvent(evt, val) {
                var eventData = {
                    type: evt,
                    value: val
                };
                this.$element.trigger(eventData);
                this.$sliderElem.trigger(eventData);
            },
            _unbindJQueryEventHandlers: function _unbindJQueryEventHandlers() {
                this.$element.off();
                this.$sliderElem.off();
            },
            _setText: function _setText(element, text) {
                if (typeof element.textContent !== "undefined") {
                    element.textContent = text;
                } else if (typeof element.innerText !== "undefined") {
                    element.innerText = text;
                }
            },
            _removeClass: function _removeClass(element, classString) {
                var classes = classString.split(" ");
                var newClasses = element.className;

                for (var i = 0; i < classes.length; i++) {
                    var classTag = classes[i];
                    var regex = new RegExp("(?:\\s|^)" + classTag + "(?:\\s|$)");
                    newClasses = newClasses.replace(regex, " ");
                }

                element.className = newClasses.trim();
            },
            _addClass: function _addClass(element, classString) {
                var classes = classString.split(" ");
                var newClasses = element.className;

                for (var i = 0; i < classes.length; i++) {
                    var classTag = classes[i];
                    var regex = new RegExp("(?:\\s|^)" + classTag + "(?:\\s|$)");
                    var ifClassExists = regex.test(newClasses);

                    if (!ifClassExists) {
                        newClasses += " " + classTag;
                    }
                }

                element.className = newClasses.trim();
            },
            _offsetLeft: function _offsetLeft(obj) {
                return obj.getBoundingClientRect().left;
            },
            _offsetTop: function _offsetTop(obj) {
                var offsetTop = obj.offsetTop;
                while ((obj = obj.offsetParent) && !isNaN(obj.offsetTop)) {
                    offsetTop += obj.offsetTop;
                    if (obj.tagName !== 'BODY') {
                        offsetTop -= obj.scrollTop;
                    }
                }
                return offsetTop;
            },
            _offset: function _offset(obj) {
                return {
                    left: this._offsetLeft(obj),
                    top: this._offsetTop(obj)
                };
            },
            _css: function _css(elementRef, styleName, value) {
                if ($) {
                    $.style(elementRef, styleName, value);
                } else {
                    var style = styleName.replace(/^-ms-/, "ms-").replace(/-([\da-z])/gi, function (all, letter) {
                        return letter.toUpperCase();
                    });
                    elementRef.style[style] = value;
                }
            },
            _toValue: function _toValue(percentage) {
                return this.options.scale.toValue.apply(this, [percentage]);
            },
            _toPercentage: function _toPercentage(value) {
                return this.options.scale.toPercentage.apply(this, [value]);
            },
            _setTooltipPosition: function _setTooltipPosition() {
                var tooltips = [this.tooltip, this.tooltip_min, this.tooltip_max];
                if (this.options.orientation === 'vertical') {
                    var tooltipPos = this.options.tooltip_position || 'right';
                    var oppositeSide = tooltipPos === 'left' ? 'right' : 'left';
                    tooltips.forEach((function (tooltip) {
                        this._addClass(tooltip, tooltipPos);
                        tooltip.style[oppositeSide] = '100%';
                    }).bind(this));
                } else if (this.options.tooltip_position === 'bottom') {
                    tooltips.forEach((function (tooltip) {
                        this._addClass(tooltip, 'bottom');
                        tooltip.style.top = 22 + 'px';
                    }).bind(this));
                } else {
                    tooltips.forEach((function (tooltip) {
                        this._addClass(tooltip, 'top');
                        tooltip.style.top = -this.tooltip.outerHeight - 14 + 'px';
                    }).bind(this));
                }
            }
        };

        /*********************************
         Attach to global namespace
         *********************************/
        if ($) {
            (function () {
                var autoRegisterNamespace = undefined;

                if (!$.fn.slider) {
                    $.bridget(NAMESPACE_MAIN, Slider);
                    autoRegisterNamespace = NAMESPACE_MAIN;
                } else {
                    if (windowIsDefined) {
                        window.console.warn("bootstrap-slider.js - WARNING: $.fn.slider namespace is already bound. Use the $.fn.bootstrapSlider namespace instead.");
                    }
                    autoRegisterNamespace = NAMESPACE_ALTERNATE;
                }
                $.bridget(NAMESPACE_ALTERNATE, Slider);

                // Auto-Register data-provide="slider" Elements
                $(function () {
                    $("input[data-provide=slider]")[autoRegisterNamespace]();
                });
            })();
        }
    })($);

    return Slider;
});
;(function($) {
    "use strict";
    var Picker = function (params) {
        var p = this;
        var defaults = {
            updateValuesOnMomentum: false,
            updateValuesOnTouchmove: true,
            rotateEffect: false,
            momentumRatio: 7,
            freeMode: false,
            // Common settings
            scrollToInput: true,
            inputReadOnly: true,
            toolbar: true,
            toolbarCloseText: '完成',
            title: '请选择',
            toolbarTemplate: '<div class="toolbar">\
          <div class="toolbar-inner">\
          <a href="javascript:;" class="picker-button close-picker">{{closeText}}</a>\
          <h1 class="title">{{title}}</h1>\
          </div>\
          </div>',
        };
        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            }
        }
        p.params = params;
        p.cols = [];
        p.initialized = false;

        // Inline flag
        p.inline = p.params.container ? true : false;

        // 3D Transforms origin bug, only on safari
        var originBug = $.device.ios || (navigator.userAgent.toLowerCase().indexOf('safari') >= 0 && navigator.userAgent.toLowerCase().indexOf('chrome') < 0) && !$.device.android;

        // Should be converted to popover
        function isPopover() {
            var toPopover = false;
            if (!p.params.convertToPopover && !p.params.onlyInPopover) return toPopover;
            if (!p.inline && p.params.input) {
                if (p.params.onlyInPopover) toPopover = true;
                else {
                    if ($.device.ios) {
                        toPopover = $.device.ipad ? true : false;
                    }
                    else {
                        if ($(window).width() >= 768) toPopover = true;
                    }
                }
            }
            return toPopover;
        }
        function inPopover() {
            if (p.opened && p.container && p.container.length > 0 && p.container.parents('.popover').length > 0) return true;
            else return false;
        }

        // Value
        p.setValue = function (arrValues, transition) {
            var valueIndex = 0;
            for (var i = 0; i < p.cols.length; i++) {
                if (p.cols[i] && !p.cols[i].divider) {
                    p.cols[i].setValue(arrValues[valueIndex], transition);
                    valueIndex++;
                }
            }
        };
        p.updateValue = function () {
            var newValue = [];
            var newDisplayValue = [];
            for (var i = 0; i < p.cols.length; i++) {
                if (!p.cols[i].divider) {
                    newValue.push(p.cols[i].value);
                    newDisplayValue.push(p.cols[i].displayValue);
                }
            }
            if (newValue.indexOf(undefined) >= 0) {
                return;
            }
            p.value = newValue;
            p.displayValue = newDisplayValue;
            if (p.params.onChange) {
                p.params.onChange(p, p.value, p.displayValue);
            }
            if (p.input && p.input.length > 0) {
                $(p.input).val(p.params.formatValue ? p.params.formatValue(p, p.value, p.displayValue) : p.value.join(' '));
                $(p.input).trigger('change');
            }
        };

        // Columns Handlers
        p.initPickerCol = function (colElement, updateItems) {
            var colContainer = $(colElement);
            var colIndex = colContainer.index();
            var col = p.cols[colIndex];
            if (col.divider) return;
            col.container = colContainer;
            col.wrapper = col.container.find('.picker-items-col-wrapper');
            col.items = col.wrapper.find('.picker-item');

            var i, j;
            var wrapperHeight, itemHeight, itemsHeight, minTranslate, maxTranslate;
            col.replaceValues = function (values, displayValues) {
                col.destroyEvents();
                col.values = values;
                col.displayValues = displayValues;
                var newItemsHTML = p.columnHTML(col, true);
                col.wrapper.html(newItemsHTML);
                col.items = col.wrapper.find('.picker-item');
                col.calcSize();
                col.setValue(col.values[0] || '', 0, true);
                col.initEvents();
            };
            col.calcSize = function () {
                if (!col.values.length) return;
                if (p.params.rotateEffect) {
                    col.container.removeClass('picker-items-col-absolute');
                    if (!col.width) col.container.css({width:''});
                }
                var colWidth, colHeight;
                colWidth = 0;
                colHeight = col.container[0].offsetHeight;
                wrapperHeight = col.wrapper[0].offsetHeight;
                itemHeight = col.items[0].offsetHeight;
                itemsHeight = itemHeight * col.items.length;
                minTranslate = colHeight / 2 - itemsHeight + itemHeight / 2;
                maxTranslate = colHeight / 2 - itemHeight / 2;
                if (col.width) {
                    colWidth = col.width;
                    if (parseInt(colWidth, 10) === colWidth) colWidth = colWidth + 'px';
                    col.container.css({width: colWidth});
                }
                if (p.params.rotateEffect) {
                    if (!col.width) {
                        col.items.each(function () {
                            var item = $(this);
                            item.css({width:'auto'});
                            colWidth = Math.max(colWidth, item[0].offsetWidth);
                            item.css({width:''});
                        });
                        col.container.css({width: (colWidth + 2) + 'px'});
                    }
                    col.container.addClass('picker-items-col-absolute');
                }
            };
            col.calcSize();

            col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)').transition(0);


            var activeIndex = 0;
            var animationFrameId;

            // Set Value Function
            col.setValue = function (newValue, transition, valueCallbacks) {
                if (typeof transition === 'undefined') transition = '';
                var newActiveIndex = col.wrapper.find('.picker-item[data-picker-value="' + newValue + '"]').index();
                if(typeof newActiveIndex === 'undefined' || newActiveIndex === -1) {
                    col.value = col.displayValue = newValue;
                    return;
                }
                var newTranslate = -newActiveIndex * itemHeight + maxTranslate;
                // Update wrapper
                col.wrapper.transition(transition);
                col.wrapper.transform('translate3d(0,' + (newTranslate) + 'px,0)');

                // Watch items
                if (p.params.updateValuesOnMomentum && col.activeIndex && col.activeIndex !== newActiveIndex ) {
                    $.cancelAnimationFrame(animationFrameId);
                    col.wrapper.transitionEnd(function(){
                        $.cancelAnimationFrame(animationFrameId);
                    });
                    updateDuringScroll();
                }

                // Update items
                col.updateItems(newActiveIndex, newTranslate, transition, valueCallbacks);
            };

            col.updateItems = function (activeIndex, translate, transition, valueCallbacks) {
                if (typeof translate === 'undefined') {
                    translate = $.getTranslate(col.wrapper[0], 'y');
                }
                if(typeof activeIndex === 'undefined') activeIndex = -Math.round((translate - maxTranslate)/itemHeight);
                if (activeIndex < 0) activeIndex = 0;
                if (activeIndex >= col.items.length) activeIndex = col.items.length - 1;
                var previousActiveIndex = col.activeIndex;
                col.activeIndex = activeIndex;
                /*
                col.wrapper.find('.picker-selected, .picker-after-selected, .picker-before-selected').removeClass('picker-selected picker-after-selected picker-before-selected');

                col.items.transition(transition);
                var selectedItem = col.items.eq(activeIndex).addClass('picker-selected').transform('');
                var prevItems = selectedItem.prevAll().addClass('picker-before-selected');
                var nextItems = selectedItem.nextAll().addClass('picker-after-selected');
                */
                //去掉 .picker-after-selected, .picker-before-selected 以提高性能
                col.wrapper.find('.picker-selected').removeClass('picker-selected');
                if (p.params.rotateEffect) {
                    col.items.transition(transition);
                }
                var selectedItem = col.items.eq(activeIndex).addClass('picker-selected').transform('');

                if (valueCallbacks || typeof valueCallbacks === 'undefined') {
                    // Update values
                    col.value = selectedItem.attr('data-picker-value');
                    col.displayValue = col.displayValues ? col.displayValues[activeIndex] : col.value;
                    // On change callback
                    if (previousActiveIndex !== activeIndex) {
                        if (col.onChange) {
                            col.onChange(p, col.value, col.displayValue);
                        }
                        p.updateValue();
                    }
                }

                // Set 3D rotate effect
                if (!p.params.rotateEffect) {
                    return;
                }
                var percentage = (translate - (Math.floor((translate - maxTranslate)/itemHeight) * itemHeight + maxTranslate)) / itemHeight;

                col.items.each(function () {
                    var item = $(this);
                    var itemOffsetTop = item.index() * itemHeight;
                    var translateOffset = maxTranslate - translate;
                    var itemOffset = itemOffsetTop - translateOffset;
                    var percentage = itemOffset / itemHeight;

                    var itemsFit = Math.ceil(col.height / itemHeight / 2) + 1;

                    var angle = (-18*percentage);
                    if (angle > 180) angle = 180;
                    if (angle < -180) angle = -180;
                    // Far class
                    if (Math.abs(percentage) > itemsFit) item.addClass('picker-item-far');
                    else item.removeClass('picker-item-far');
                    // Set transform
                    item.transform('translate3d(0, ' + (-translate + maxTranslate) + 'px, ' + (originBug ? -110 : 0) + 'px) rotateX(' + angle + 'deg)');
                });
            };

            function updateDuringScroll() {
                animationFrameId = $.requestAnimationFrame(function () {
                    col.updateItems(undefined, undefined, 0);
                    updateDuringScroll();
                });
            }

            // Update items on init
            if (updateItems) col.updateItems(0, maxTranslate, 0);

            var allowItemClick = true;
            var isTouched, isMoved, touchStartY, touchCurrentY, touchStartTime, touchEndTime, startTranslate, returnTo, currentTranslate, prevTranslate, velocityTranslate, velocityTime;
            function handleTouchStart (e) {
                if (isMoved || isTouched) return;
                e.preventDefault();
                isTouched = true;
                var position = $.getTouchPosition(e);
                touchStartY = touchCurrentY = position.y;
                touchStartTime = (new Date()).getTime();

                allowItemClick = true;
                startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
            }
            function handleTouchMove (e) {
                if (!isTouched) return;
                e.preventDefault();
                allowItemClick = false;
                var position = $.getTouchPosition(e);
                touchCurrentY = position.y;
                if (!isMoved) {
                    // First move
                    $.cancelAnimationFrame(animationFrameId);
                    isMoved = true;
                    startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
                    col.wrapper.transition(0);
                }
                e.preventDefault();

                var diff = touchCurrentY - touchStartY;
                currentTranslate = startTranslate + diff;
                returnTo = undefined;

                // Normalize translate
                if (currentTranslate < minTranslate) {
                    currentTranslate = minTranslate - Math.pow(minTranslate - currentTranslate, 0.8);
                    returnTo = 'min';
                }
                if (currentTranslate > maxTranslate) {
                    currentTranslate = maxTranslate + Math.pow(currentTranslate - maxTranslate, 0.8);
                    returnTo = 'max';
                }
                // Transform wrapper
                col.wrapper.transform('translate3d(0,' + currentTranslate + 'px,0)');

                // Update items
                col.updateItems(undefined, currentTranslate, 0, p.params.updateValuesOnTouchmove);

                // Calc velocity
                velocityTranslate = currentTranslate - prevTranslate || currentTranslate;
                velocityTime = (new Date()).getTime();
                prevTranslate = currentTranslate;
            }
            function handleTouchEnd (e) {
                if (!isTouched || !isMoved) {
                    isTouched = isMoved = false;
                    return;
                }
                isTouched = isMoved = false;
                col.wrapper.transition('');
                if (returnTo) {
                    if (returnTo === 'min') {
                        col.wrapper.transform('translate3d(0,' + minTranslate + 'px,0)');
                    }
                    else col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)');
                }
                touchEndTime = new Date().getTime();
                var velocity, newTranslate;
                if (touchEndTime - touchStartTime > 300) {
                    newTranslate = currentTranslate;
                }
                else {
                    velocity = Math.abs(velocityTranslate / (touchEndTime - velocityTime));
                    newTranslate = currentTranslate + velocityTranslate * p.params.momentumRatio;
                }

                newTranslate = Math.max(Math.min(newTranslate, maxTranslate), minTranslate);

                // Active Index
                var activeIndex = -Math.floor((newTranslate - maxTranslate)/itemHeight);

                // Normalize translate
                if (!p.params.freeMode) newTranslate = -activeIndex * itemHeight + maxTranslate;

                // Transform wrapper
                col.wrapper.transform('translate3d(0,' + (parseInt(newTranslate,10)) + 'px,0)');

                // Update items
                col.updateItems(activeIndex, newTranslate, '', true);

                // Watch items
                if (p.params.updateValuesOnMomentum) {
                    updateDuringScroll();
                    col.wrapper.transitionEnd(function(){
                        $.cancelAnimationFrame(animationFrameId);
                    });
                }

                // Allow click
                setTimeout(function () {
                    allowItemClick = true;
                }, 100);
            }

            function handleClick(e) {
                if (!allowItemClick) return;
                $.cancelAnimationFrame(animationFrameId);
                /*jshint validthis:true */
                var value = $(this).attr('data-picker-value');
                col.setValue(value);
            }

            col.initEvents = function (detach) {
                var method = detach ? 'off' : 'on';
                col.container[method]($.touchEvents.start, handleTouchStart);
                col.container[method]($.touchEvents.move, handleTouchMove);
                col.container[method]($.touchEvents.end, handleTouchEnd);
                col.items[method]('click', handleClick);
            };
            col.destroyEvents = function () {
                col.initEvents(true);
            };

            col.container[0].f7DestroyPickerCol = function () {
                col.destroyEvents();
            };

            col.initEvents();

        };
        p.destroyPickerCol = function (colContainer) {
            colContainer = $(colContainer);
            if ('f7DestroyPickerCol' in colContainer[0]) colContainer[0].f7DestroyPickerCol();
        };
        // Resize cols
        function resizeCols() {
            if (!p.opened) return;
            for (var i = 0; i < p.cols.length; i++) {
                if (!p.cols[i].divider) {
                    p.cols[i].calcSize();
                    p.cols[i].setValue(p.cols[i].value, 0, false);
                }
            }
        }
        $(window).on('resize', resizeCols);

        // HTML Layout
        p.columnHTML = function (col, onlyItems) {
            var columnItemsHTML = '';
            var columnHTML = '';
            if (col.divider) {
                columnHTML += '<div class="picker-items-col picker-items-col-divider ' + (col.textAlign ? 'picker-items-col-' + col.textAlign : '') + ' ' + (col.cssClass || '') + '">' + col.content + '</div>';
            }
            else {
                for (var j = 0; j < col.values.length; j++) {
                    columnItemsHTML += '<div class="picker-item" data-picker-value="' + col.values[j] + '">' + (col.displayValues ? col.displayValues[j] : col.values[j]) + '</div>';
                }
                columnHTML += '<div class="picker-items-col ' + (col.textAlign ? 'picker-items-col-' + col.textAlign : '') + ' ' + (col.cssClass || '') + '"><div class="picker-items-col-wrapper">' + columnItemsHTML + '</div></div>';
            }
            return onlyItems ? columnItemsHTML : columnHTML;
        };
        p.layout = function () {
            var pickerHTML = '';
            var pickerClass = '';
            var i;
            p.cols = [];
            var colsHTML = '';
            for (i = 0; i < p.params.cols.length; i++) {
                var col = p.params.cols[i];
                colsHTML += p.columnHTML(p.params.cols[i]);
                p.cols.push(col);
            }
            pickerClass = 'h5ui-picker-modal picker-columns ' + (p.params.cssClass || '') + (p.params.rotateEffect ? ' picker-3d' : '') + (p.params.cols.length === 1 ? ' picker-columns-single' : '');
            pickerHTML =
                '<div class="' + (pickerClass) + '">' +
                (p.params.toolbar ? p.params.toolbarTemplate.replace(/{{closeText}}/g, p.params.toolbarCloseText).replace(/{{title}}/g, p.params.title) : '') +
                '<div class="picker-modal-inner picker-items">' +
                colsHTML +
                '<div class="picker-center-highlight"></div>' +
                '</div>' +
                '</div>';

            p.pickerHTML = pickerHTML;
        };

        // Input Events
        function openOnInput(e) {
            e.preventDefault();
            if (p.opened) return;
            p.open();
            if (p.params.scrollToInput && !isPopover()) {
                var pageContent = p.input.parents('.content');
                if (pageContent.length === 0) return;

                var paddingTop = parseInt(pageContent.css('padding-top'), 10),
                    paddingBottom = parseInt(pageContent.css('padding-bottom'), 10),
                    pageHeight = pageContent[0].offsetHeight - paddingTop - p.container.height(),
                    pageScrollHeight = pageContent[0].scrollHeight - paddingTop - p.container.height(),
                    newPaddingBottom;
                var inputTop = p.input.offset().top - paddingTop + p.input[0].offsetHeight;
                if (inputTop > pageHeight) {
                    var scrollTop = pageContent.scrollTop() + inputTop - pageHeight;
                    if (scrollTop + pageHeight > pageScrollHeight) {
                        newPaddingBottom = scrollTop + pageHeight - pageScrollHeight + paddingBottom;
                        if (pageHeight === pageScrollHeight) {
                            newPaddingBottom = p.container.height();
                        }
                        pageContent.css({'padding-bottom': (newPaddingBottom) + 'px'});
                    }
                    pageContent.scrollTop(scrollTop, 300);
                }
            }
        }
        function closeOnHTMLClick(e) {
            if (inPopover()) return;
            if (p.input && p.input.length > 0) {
                if (e.target !== p.input[0] && $(e.target).parents('.h5ui-picker-modal').length === 0) p.close();
            }
            else {
                if ($(e.target).parents('.h5ui-picker-modal').length === 0) p.close();
            }
        }

        if (p.params.input) {
            p.input = $(p.params.input);
            if (p.input.length > 0) {
                if (p.params.inputReadOnly) p.input.prop('readOnly', true);
                if (!p.inline) {
                    p.input.on('click', openOnInput);
                }
                if (p.params.inputReadOnly) {
                    p.input.on('focus mousedown', function (e) {
                        e.preventDefault();
                    });
                }
            }

        }

        if (!p.inline) $('html').on('click', closeOnHTMLClick);

        // Open
        function onPickerClose() {
            p.opened = false;
            if (p.input && p.input.length > 0) p.input.parents('.page-content').css({'padding-bottom': ''});
            if (p.params.onClose) p.params.onClose(p);

            // Destroy events
            p.container.find('.picker-items-col').each(function () {
                p.destroyPickerCol(this);
            });
        }

        p.opened = false;
        p.open = function () {
            var toPopover = isPopover();

            if (!p.opened) {

                // Layout
                p.layout();

                // Append
                if (toPopover) {
                    p.pickerHTML = '<div class="popover popover-picker-columns"><div class="popover-inner">' + p.pickerHTML + '</div></div>';
                    p.popover = $.popover(p.pickerHTML, p.params.input, true);
                    p.container = $(p.popover).find('.h5ui-picker-modal');
                    $(p.popover).on('close', function () {
                        onPickerClose();
                    });
                }
                else if (p.inline) {
                    p.container = $(p.pickerHTML);
                    p.container.addClass('picker-modal-inline');
                    $(p.params.container).append(p.container);
                }
                else {
                    p.container = $($.openPicker(p.pickerHTML));
                    $(p.container)
                        .on('close', function () {
                            onPickerClose();
                        });
                }

                // Store picker instance
                p.container[0].f7Picker = p;

                // Init Events
                p.container.find('.picker-items-col').each(function () {
                    var updateItems = true;
                    if ((!p.initialized && p.params.value) || (p.initialized && p.value)) updateItems = false;
                    p.initPickerCol(this, updateItems);
                });

                // Set value
                if (!p.initialized) {
                    if (p.params.value) {
                        p.setValue(p.params.value, 0);
                    }
                }
                else {
                    if (p.value) p.setValue(p.value, 0);
                }
            }

            // Set flag
            p.opened = true;
            p.initialized = true;

            if (p.params.onOpen) p.params.onOpen(p);
        };

        // Close
        p.close = function (force) {
            if (!p.opened || p.inline) return;
            if (inPopover()) {
                $.closePicker(p.popover);
                return;
            }
            else {
                $.closePicker(p.container);
                return;
            }
        };

        // Destroy
        p.destroy = function () {
            p.close();
            if (p.params.input && p.input.length > 0) {
                p.input.off('click focus', openOnInput);
                $(p.input).data('picker', null);
            }
            $('html').off('click', closeOnHTMLClick);
            $(window).off('resize', resizeCols);
        };

        if (p.inline) {
            p.open();
        }

        return p;
    };

    $(document).on("click", ".close-picker", function() {
        var pickerToClose = $('.h5ui-picker-modal.h5ui-picker-modal-visible');
        if (pickerToClose.length > 0) {
            $.closePicker(pickerToClose);
        }
    });

    //修复picker会滚动页面的bug
    $(document).on($.touchEvents.move, ".picker-modal-inner", function(e) {
        e.preventDefault();
    });


    $.openPicker = function(tpl, className, callback) {

        if(typeof className === "function") {
            callback = className;
            className = undefined;
        }

        $.closePicker();

        var container = $("<div class='h5ui-picker-container "+ (className || "") + "'></div>").appendTo(document.body);
        container.show();

        container.addClass("h5ui-picker-container-visible");

        //关于布局的问题，如果直接放在body上，则做动画的时候会撑开body高度而导致滚动条变化。
        var dialog = $(tpl).appendTo(container);

        dialog.width(); //通过取一次CSS值，强制浏览器不能把上下两行代码合并执行，因为合并之后会导致无法出现动画。

        dialog.addClass("h5ui-picker-modal-visible");

        callback && container.on("close", callback);

        return dialog;
    }

    $.updatePicker = function(tpl) {
        var container = $(".h5ui-picker-container-visible");
        if(!container[0]) return false;

        container.html("");

        var dialog = $(tpl).appendTo(container);

        dialog.addClass("h5ui-picker-modal-visible");

        return dialog;
    }

    $.closePicker = function(container, callback) {
        if(typeof container === "function") callback = container;
        $(".h5ui-picker-modal-visible").removeClass("h5ui-picker-modal-visible").transitionEnd(function() {
            $(this).parent().remove();
            callback && callback();
        }).trigger("close");
    };

    $.fn.picker = function(params) {
        var args = arguments;
        return this.each(function() {
            if(!this) return;
            var $this = $(this);

            var picker = $this.data("picker");
            if(!picker) {
                params = $.extend({ input: this }, params || {}) // https://github.com/lihongxun945/jquery-h5ui/issues/432
                var inputValue = $this.val();
                if(params.value === undefined && inputValue !== "") {
                    params.value = (params.cols && params.cols.length > 1) ? inputValue.split(" ") : [inputValue];
                }
                var p = $.extend({input: this}, params);
                picker = new Picker(p);
                $this.data("picker", picker);
            }
            if(typeof params === typeof "a") {
                picker[params].apply(picker, Array.prototype.slice.call(args, 1));
            }
        });
    };
})($);
;(function(e) {
    e.rawCitiesData = [{
        name: "北京",
        code: "110000",
        sub: [{
            name: "北京市",
            code: "110000",
            sub: [{
                name: "东城区",
                code: "110101"
            }, {
                name: "西城区",
                code: "110102"
            }, {
                name: "朝阳区",
                code: "110105"
            }, {
                name: "丰台区",
                code: "110106"
            }, {
                name: "石景山区",
                code: "110107"
            }, {
                name: "海淀区",
                code: "110108"
            }, {
                name: "门头沟区",
                code: "110109"
            }, {
                name: "房山区",
                code: "110111"
            }, {
                name: "通州区",
                code: "110112"
            }, {
                name: "顺义区",
                code: "110113"
            }, {
                name: "昌平区",
                code: "110114"
            }, {
                name: "大兴区",
                code: "110115"
            }, {
                name: "怀柔区",
                code: "110116"
            }, {
                name: "平谷区",
                code: "110117"
            }, {
                name: "密云县",
                code: "110228"
            }, {
                name: "延庆县",
                code: "110229"
            }]
        }]
    }, {
        name: "天津",
        code: "120000",
        sub: [{
            name: "天津市",
            code: "120000",
            sub: [{
                name: "和平区",
                code: "120101"
            }, {
                name: "河东区",
                code: "120102"
            }, {
                name: "河西区",
                code: "120103"
            }, {
                name: "南开区",
                code: "120104"
            }, {
                name: "河北区",
                code: "120105"
            }, {
                name: "红桥区",
                code: "120106"
            }, {
                name: "东丽区",
                code: "120110"
            }, {
                name: "西青区",
                code: "120111"
            }, {
                name: "津南区",
                code: "120112"
            }, {
                name: "北辰区",
                code: "120113"
            }, {
                name: "武清区",
                code: "120114"
            }, {
                name: "宝坻区",
                code: "120115"
            }, {
                name: "滨海新区",
                code: "120116"
            }, {
                name: "宁河县",
                code: "120221"
            }, {
                name: "静海县",
                code: "120223"
            }, {
                name: "蓟县",
                code: "120225"
            }]
        }]
    }, {
        name: "河北省",
        code: "130000",
        sub: [{
            name: "石家庄市",
            code: "130100",
            sub: [{
                name: "市辖区",
                code: "130101"
            }, {
                name: "长安区",
                code: "130102"
            }, {
                name: "桥西区",
                code: "130104"
            }, {
                name: "新华区",
                code: "130105"
            }, {
                name: "井陉矿区",
                code: "130107"
            }, {
                name: "裕华区",
                code: "130108"
            }, {
                name: "藁城区",
                code: "130109"
            }, {
                name: "鹿泉区",
                code: "130110"
            }, {
                name: "栾城区",
                code: "130111"
            }, {
                name: "井陉县",
                code: "130121"
            }, {
                name: "正定县",
                code: "130123"
            }, {
                name: "行唐县",
                code: "130125"
            }, {
                name: "灵寿县",
                code: "130126"
            }, {
                name: "高邑县",
                code: "130127"
            }, {
                name: "深泽县",
                code: "130128"
            }, {
                name: "赞皇县",
                code: "130129"
            }, {
                name: "无极县",
                code: "130130"
            }, {
                name: "平山县",
                code: "130131"
            }, {
                name: "元氏县",
                code: "130132"
            }, {
                name: "赵县",
                code: "130133"
            }, {
                name: "辛集市",
                code: "130181"
            }, {
                name: "晋州市",
                code: "130183"
            }, {
                name: "新乐市",
                code: "130184"
            }]
        }, {
            name: "唐山市",
            code: "130200",
            sub: [{
                name: "市辖区",
                code: "130201"
            }, {
                name: "路南区",
                code: "130202"
            }, {
                name: "路北区",
                code: "130203"
            }, {
                name: "古冶区",
                code: "130204"
            }, {
                name: "开平区",
                code: "130205"
            }, {
                name: "丰南区",
                code: "130207"
            }, {
                name: "丰润区",
                code: "130208"
            }, {
                name: "曹妃甸区",
                code: "130209"
            }, {
                name: "滦县",
                code: "130223"
            }, {
                name: "滦南县",
                code: "130224"
            }, {
                name: "乐亭县",
                code: "130225"
            }, {
                name: "迁西县",
                code: "130227"
            }, {
                name: "玉田县",
                code: "130229"
            }, {
                name: "遵化市",
                code: "130281"
            }, {
                name: "迁安市",
                code: "130283"
            }]
        }, {
            name: "秦皇岛市",
            code: "130300",
            sub: [{
                name: "市辖区",
                code: "130301"
            }, {
                name: "海港区",
                code: "130302"
            }, {
                name: "山海关区",
                code: "130303"
            }, {
                name: "北戴河区",
                code: "130304"
            }, {
                name: "青龙满族自治县",
                code: "130321"
            }, {
                name: "昌黎县",
                code: "130322"
            }, {
                name: "抚宁县",
                code: "130323"
            }, {
                name: "卢龙县",
                code: "130324"
            }]
        }, {
            name: "邯郸市",
            code: "130400",
            sub: [{
                name: "市辖区",
                code: "130401"
            }, {
                name: "邯山区",
                code: "130402"
            }, {
                name: "丛台区",
                code: "130403"
            }, {
                name: "复兴区",
                code: "130404"
            }, {
                name: "峰峰矿区",
                code: "130406"
            }, {
                name: "邯郸县",
                code: "130421"
            }, {
                name: "临漳县",
                code: "130423"
            }, {
                name: "成安县",
                code: "130424"
            }, {
                name: "大名县",
                code: "130425"
            }, {
                name: "涉县",
                code: "130426"
            }, {
                name: "磁县",
                code: "130427"
            }, {
                name: "肥乡县",
                code: "130428"
            }, {
                name: "永年县",
                code: "130429"
            }, {
                name: "邱县",
                code: "130430"
            }, {
                name: "鸡泽县",
                code: "130431"
            }, {
                name: "广平县",
                code: "130432"
            }, {
                name: "馆陶县",
                code: "130433"
            }, {
                name: "魏县",
                code: "130434"
            }, {
                name: "曲周县",
                code: "130435"
            }, {
                name: "武安市",
                code: "130481"
            }]
        }, {
            name: "邢台市",
            code: "130500",
            sub: [{
                name: "市辖区",
                code: "130501"
            }, {
                name: "桥东区",
                code: "130502"
            }, {
                name: "桥西区",
                code: "130503"
            }, {
                name: "邢台县",
                code: "130521"
            }, {
                name: "临城县",
                code: "130522"
            }, {
                name: "内丘县",
                code: "130523"
            }, {
                name: "柏乡县",
                code: "130524"
            }, {
                name: "隆尧县",
                code: "130525"
            }, {
                name: "任县",
                code: "130526"
            }, {
                name: "南和县",
                code: "130527"
            }, {
                name: "宁晋县",
                code: "130528"
            }, {
                name: "巨鹿县",
                code: "130529"
            }, {
                name: "新河县",
                code: "130530"
            }, {
                name: "广宗县",
                code: "130531"
            }, {
                name: "平乡县",
                code: "130532"
            }, {
                name: "威县",
                code: "130533"
            }, {
                name: "清河县",
                code: "130534"
            }, {
                name: "临西县",
                code: "130535"
            }, {
                name: "南宫市",
                code: "130581"
            }, {
                name: "沙河市",
                code: "130582"
            }]
        }, {
            name: "保定市",
            code: "130600",
            sub: [{
                name: "市辖区",
                code: "130601"
            }, {
                name: "新市区",
                code: "130602"
            }, {
                name: "北市区",
                code: "130603"
            }, {
                name: "南市区",
                code: "130604"
            }, {
                name: "满城县",
                code: "130621"
            }, {
                name: "清苑县",
                code: "130622"
            }, {
                name: "涞水县",
                code: "130623"
            }, {
                name: "阜平县",
                code: "130624"
            }, {
                name: "徐水县",
                code: "130625"
            }, {
                name: "定兴县",
                code: "130626"
            }, {
                name: "唐县",
                code: "130627"
            }, {
                name: "高阳县",
                code: "130628"
            }, {
                name: "容城县",
                code: "130629"
            }, {
                name: "涞源县",
                code: "130630"
            }, {
                name: "望都县",
                code: "130631"
            }, {
                name: "安新县",
                code: "130632"
            }, {
                name: "易县",
                code: "130633"
            }, {
                name: "曲阳县",
                code: "130634"
            }, {
                name: "蠡县",
                code: "130635"
            }, {
                name: "顺平县",
                code: "130636"
            }, {
                name: "博野县",
                code: "130637"
            }, {
                name: "雄县",
                code: "130638"
            }, {
                name: "涿州市",
                code: "130681"
            }, {
                name: "定州市",
                code: "130682"
            }, {
                name: "安国市",
                code: "130683"
            }, {
                name: "高碑店市",
                code: "130684"
            }]
        }, {
            name: "张家口市",
            code: "130700",
            sub: [{
                name: "市辖区",
                code: "130701"
            }, {
                name: "桥东区",
                code: "130702"
            }, {
                name: "桥西区",
                code: "130703"
            }, {
                name: "宣化区",
                code: "130705"
            }, {
                name: "下花园区",
                code: "130706"
            }, {
                name: "宣化县",
                code: "130721"
            }, {
                name: "张北县",
                code: "130722"
            }, {
                name: "康保县",
                code: "130723"
            }, {
                name: "沽源县",
                code: "130724"
            }, {
                name: "尚义县",
                code: "130725"
            }, {
                name: "蔚县",
                code: "130726"
            }, {
                name: "阳原县",
                code: "130727"
            }, {
                name: "怀安县",
                code: "130728"
            }, {
                name: "万全县",
                code: "130729"
            }, {
                name: "怀来县",
                code: "130730"
            }, {
                name: "涿鹿县",
                code: "130731"
            }, {
                name: "赤城县",
                code: "130732"
            }, {
                name: "崇礼县",
                code: "130733"
            }]
        }, {
            name: "承德市",
            code: "130800",
            sub: [{
                name: "市辖区",
                code: "130801"
            }, {
                name: "双桥区",
                code: "130802"
            }, {
                name: "双滦区",
                code: "130803"
            }, {
                name: "鹰手营子矿区",
                code: "130804"
            }, {
                name: "承德县",
                code: "130821"
            }, {
                name: "兴隆县",
                code: "130822"
            }, {
                name: "平泉县",
                code: "130823"
            }, {
                name: "滦平县",
                code: "130824"
            }, {
                name: "隆化县",
                code: "130825"
            }, {
                name: "丰宁满族自治县",
                code: "130826"
            }, {
                name: "宽城满族自治县",
                code: "130827"
            }, {
                name: "围场满族蒙古族自治县",
                code: "130828"
            }]
        }, {
            name: "沧州市",
            code: "130900",
            sub: [{
                name: "市辖区",
                code: "130901"
            }, {
                name: "新华区",
                code: "130902"
            }, {
                name: "运河区",
                code: "130903"
            }, {
                name: "沧县",
                code: "130921"
            }, {
                name: "青县",
                code: "130922"
            }, {
                name: "东光县",
                code: "130923"
            }, {
                name: "海兴县",
                code: "130924"
            }, {
                name: "盐山县",
                code: "130925"
            }, {
                name: "肃宁县",
                code: "130926"
            }, {
                name: "南皮县",
                code: "130927"
            }, {
                name: "吴桥县",
                code: "130928"
            }, {
                name: "献县",
                code: "130929"
            }, {
                name: "孟村回族自治县",
                code: "130930"
            }, {
                name: "泊头市",
                code: "130981"
            }, {
                name: "任丘市",
                code: "130982"
            }, {
                name: "黄骅市",
                code: "130983"
            }, {
                name: "河间市",
                code: "130984"
            }]
        }, {
            name: "廊坊市",
            code: "131000",
            sub: [{
                name: "市辖区",
                code: "131001"
            }, {
                name: "安次区",
                code: "131002"
            }, {
                name: "广阳区",
                code: "131003"
            }, {
                name: "固安县",
                code: "131022"
            }, {
                name: "永清县",
                code: "131023"
            }, {
                name: "香河县",
                code: "131024"
            }, {
                name: "大城县",
                code: "131025"
            }, {
                name: "文安县",
                code: "131026"
            }, {
                name: "大厂回族自治县",
                code: "131028"
            }, {
                name: "霸州市",
                code: "131081"
            }, {
                name: "三河市",
                code: "131082"
            }]
        }, {
            name: "衡水市",
            code: "131100",
            sub: [{
                name: "市辖区",
                code: "131101"
            }, {
                name: "桃城区",
                code: "131102"
            }, {
                name: "枣强县",
                code: "131121"
            }, {
                name: "武邑县",
                code: "131122"
            }, {
                name: "武强县",
                code: "131123"
            }, {
                name: "饶阳县",
                code: "131124"
            }, {
                name: "安平县",
                code: "131125"
            }, {
                name: "故城县",
                code: "131126"
            }, {
                name: "景县",
                code: "131127"
            }, {
                name: "阜城县",
                code: "131128"
            }, {
                name: "冀州市",
                code: "131181"
            }, {
                name: "深州市",
                code: "131182"
            }]
        }]
    }, {
        name: "山西省",
        code: "140000",
        sub: [{
            name: "太原市",
            code: "140100",
            sub: [{
                name: "市辖区",
                code: "140101"
            }, {
                name: "小店区",
                code: "140105"
            }, {
                name: "迎泽区",
                code: "140106"
            }, {
                name: "杏花岭区",
                code: "140107"
            }, {
                name: "尖草坪区",
                code: "140108"
            }, {
                name: "万柏林区",
                code: "140109"
            }, {
                name: "晋源区",
                code: "140110"
            }, {
                name: "清徐县",
                code: "140121"
            }, {
                name: "阳曲县",
                code: "140122"
            }, {
                name: "娄烦县",
                code: "140123"
            }, {
                name: "古交市",
                code: "140181"
            }]
        }, {
            name: "大同市",
            code: "140200",
            sub: [{
                name: "市辖区",
                code: "140201"
            }, {
                name: "城区",
                code: "140202"
            }, {
                name: "矿区",
                code: "140203"
            }, {
                name: "南郊区",
                code: "140211"
            }, {
                name: "新荣区",
                code: "140212"
            }, {
                name: "阳高县",
                code: "140221"
            }, {
                name: "天镇县",
                code: "140222"
            }, {
                name: "广灵县",
                code: "140223"
            }, {
                name: "灵丘县",
                code: "140224"
            }, {
                name: "浑源县",
                code: "140225"
            }, {
                name: "左云县",
                code: "140226"
            }, {
                name: "大同县",
                code: "140227"
            }]
        }, {
            name: "阳泉市",
            code: "140300",
            sub: [{
                name: "市辖区",
                code: "140301"
            }, {
                name: "城区",
                code: "140302"
            }, {
                name: "矿区",
                code: "140303"
            }, {
                name: "郊区",
                code: "140311"
            }, {
                name: "平定县",
                code: "140321"
            }, {
                name: "盂县",
                code: "140322"
            }]
        }, {
            name: "长治市",
            code: "140400",
            sub: [{
                name: "市辖区",
                code: "140401"
            }, {
                name: "城区",
                code: "140402"
            }, {
                name: "郊区",
                code: "140411"
            }, {
                name: "长治县",
                code: "140421"
            }, {
                name: "襄垣县",
                code: "140423"
            }, {
                name: "屯留县",
                code: "140424"
            }, {
                name: "平顺县",
                code: "140425"
            }, {
                name: "黎城县",
                code: "140426"
            }, {
                name: "壶关县",
                code: "140427"
            }, {
                name: "长子县",
                code: "140428"
            }, {
                name: "武乡县",
                code: "140429"
            }, {
                name: "沁县",
                code: "140430"
            }, {
                name: "沁源县",
                code: "140431"
            }, {
                name: "潞城市",
                code: "140481"
            }]
        }, {
            name: "晋城市",
            code: "140500",
            sub: [{
                name: "市辖区",
                code: "140501"
            }, {
                name: "城区",
                code: "140502"
            }, {
                name: "沁水县",
                code: "140521"
            }, {
                name: "阳城县",
                code: "140522"
            }, {
                name: "陵川县",
                code: "140524"
            }, {
                name: "泽州县",
                code: "140525"
            }, {
                name: "高平市",
                code: "140581"
            }]
        }, {
            name: "朔州市",
            code: "140600",
            sub: [{
                name: "市辖区",
                code: "140601"
            }, {
                name: "朔城区",
                code: "140602"
            }, {
                name: "平鲁区",
                code: "140603"
            }, {
                name: "山阴县",
                code: "140621"
            }, {
                name: "应县",
                code: "140622"
            }, {
                name: "右玉县",
                code: "140623"
            }, {
                name: "怀仁县",
                code: "140624"
            }]
        }, {
            name: "晋中市",
            code: "140700",
            sub: [{
                name: "市辖区",
                code: "140701"
            }, {
                name: "榆次区",
                code: "140702"
            }, {
                name: "榆社县",
                code: "140721"
            }, {
                name: "左权县",
                code: "140722"
            }, {
                name: "和顺县",
                code: "140723"
            }, {
                name: "昔阳县",
                code: "140724"
            }, {
                name: "寿阳县",
                code: "140725"
            }, {
                name: "太谷县",
                code: "140726"
            }, {
                name: "祁县",
                code: "140727"
            }, {
                name: "平遥县",
                code: "140728"
            }, {
                name: "灵石县",
                code: "140729"
            }, {
                name: "介休市",
                code: "140781"
            }]
        }, {
            name: "运城市",
            code: "140800",
            sub: [{
                name: "市辖区",
                code: "140801"
            }, {
                name: "盐湖区",
                code: "140802"
            }, {
                name: "临猗县",
                code: "140821"
            }, {
                name: "万荣县",
                code: "140822"
            }, {
                name: "闻喜县",
                code: "140823"
            }, {
                name: "稷山县",
                code: "140824"
            }, {
                name: "新绛县",
                code: "140825"
            }, {
                name: "绛县",
                code: "140826"
            }, {
                name: "垣曲县",
                code: "140827"
            }, {
                name: "夏县",
                code: "140828"
            }, {
                name: "平陆县",
                code: "140829"
            }, {
                name: "芮城县",
                code: "140830"
            }, {
                name: "永济市",
                code: "140881"
            }, {
                name: "河津市",
                code: "140882"
            }]
        }, {
            name: "忻州市",
            code: "140900",
            sub: [{
                name: "市辖区",
                code: "140901"
            }, {
                name: "忻府区",
                code: "140902"
            }, {
                name: "定襄县",
                code: "140921"
            }, {
                name: "五台县",
                code: "140922"
            }, {
                name: "代县",
                code: "140923"
            }, {
                name: "繁峙县",
                code: "140924"
            }, {
                name: "宁武县",
                code: "140925"
            }, {
                name: "静乐县",
                code: "140926"
            }, {
                name: "神池县",
                code: "140927"
            }, {
                name: "五寨县",
                code: "140928"
            }, {
                name: "岢岚县",
                code: "140929"
            }, {
                name: "河曲县",
                code: "140930"
            }, {
                name: "保德县",
                code: "140931"
            }, {
                name: "偏关县",
                code: "140932"
            }, {
                name: "原平市",
                code: "140981"
            }]
        }, {
            name: "临汾市",
            code: "141000",
            sub: [{
                name: "市辖区",
                code: "141001"
            }, {
                name: "尧都区",
                code: "141002"
            }, {
                name: "曲沃县",
                code: "141021"
            }, {
                name: "翼城县",
                code: "141022"
            }, {
                name: "襄汾县",
                code: "141023"
            }, {
                name: "洪洞县",
                code: "141024"
            }, {
                name: "古县",
                code: "141025"
            }, {
                name: "安泽县",
                code: "141026"
            }, {
                name: "浮山县",
                code: "141027"
            }, {
                name: "吉县",
                code: "141028"
            }, {
                name: "乡宁县",
                code: "141029"
            }, {
                name: "大宁县",
                code: "141030"
            }, {
                name: "隰县",
                code: "141031"
            }, {
                name: "永和县",
                code: "141032"
            }, {
                name: "蒲县",
                code: "141033"
            }, {
                name: "汾西县",
                code: "141034"
            }, {
                name: "侯马市",
                code: "141081"
            }, {
                name: "霍州市",
                code: "141082"
            }]
        }, {
            name: "吕梁市",
            code: "141100",
            sub: [{
                name: "市辖区",
                code: "141101"
            }, {
                name: "离石区",
                code: "141102"
            }, {
                name: "文水县",
                code: "141121"
            }, {
                name: "交城县",
                code: "141122"
            }, {
                name: "兴县",
                code: "141123"
            }, {
                name: "临县",
                code: "141124"
            }, {
                name: "柳林县",
                code: "141125"
            }, {
                name: "石楼县",
                code: "141126"
            }, {
                name: "岚县",
                code: "141127"
            }, {
                name: "方山县",
                code: "141128"
            }, {
                name: "中阳县",
                code: "141129"
            }, {
                name: "交口县",
                code: "141130"
            }, {
                name: "孝义市",
                code: "141181"
            }, {
                name: "汾阳市",
                code: "141182"
            }]
        }]
    }, {
        name: "内蒙古自治区",
        code: "150000",
        sub: [{
            name: "呼和浩特市",
            code: "150100",
            sub: [{
                name: "市辖区",
                code: "150101"
            }, {
                name: "新城区",
                code: "150102"
            }, {
                name: "回民区",
                code: "150103"
            }, {
                name: "玉泉区",
                code: "150104"
            }, {
                name: "赛罕区",
                code: "150105"
            }, {
                name: "土默特左旗",
                code: "150121"
            }, {
                name: "托克托县",
                code: "150122"
            }, {
                name: "和林格尔县",
                code: "150123"
            }, {
                name: "清水河县",
                code: "150124"
            }, {
                name: "武川县",
                code: "150125"
            }]
        }, {
            name: "包头市",
            code: "150200",
            sub: [{
                name: "市辖区",
                code: "150201"
            }, {
                name: "东河区",
                code: "150202"
            }, {
                name: "昆都仑区",
                code: "150203"
            }, {
                name: "青山区",
                code: "150204"
            }, {
                name: "石拐区",
                code: "150205"
            }, {
                name: "白云鄂博矿区",
                code: "150206"
            }, {
                name: "九原区",
                code: "150207"
            }, {
                name: "土默特右旗",
                code: "150221"
            }, {
                name: "固阳县",
                code: "150222"
            }, {
                name: "达尔罕茂明安联合旗",
                code: "150223"
            }]
        }, {
            name: "乌海市",
            code: "150300",
            sub: [{
                name: "市辖区",
                code: "150301"
            }, {
                name: "海勃湾区",
                code: "150302"
            }, {
                name: "海南区",
                code: "150303"
            }, {
                name: "乌达区",
                code: "150304"
            }]
        }, {
            name: "赤峰市",
            code: "150400",
            sub: [{
                name: "市辖区",
                code: "150401"
            }, {
                name: "红山区",
                code: "150402"
            }, {
                name: "元宝山区",
                code: "150403"
            }, {
                name: "松山区",
                code: "150404"
            }, {
                name: "阿鲁科尔沁旗",
                code: "150421"
            }, {
                name: "巴林左旗",
                code: "150422"
            }, {
                name: "巴林右旗",
                code: "150423"
            }, {
                name: "林西县",
                code: "150424"
            }, {
                name: "克什克腾旗",
                code: "150425"
            }, {
                name: "翁牛特旗",
                code: "150426"
            }, {
                name: "喀喇沁旗",
                code: "150428"
            }, {
                name: "宁城县",
                code: "150429"
            }, {
                name: "敖汉旗",
                code: "150430"
            }]
        }, {
            name: "通辽市",
            code: "150500",
            sub: [{
                name: "市辖区",
                code: "150501"
            }, {
                name: "科尔沁区",
                code: "150502"
            }, {
                name: "科尔沁左翼中旗",
                code: "150521"
            }, {
                name: "科尔沁左翼后旗",
                code: "150522"
            }, {
                name: "开鲁县",
                code: "150523"
            }, {
                name: "库伦旗",
                code: "150524"
            }, {
                name: "奈曼旗",
                code: "150525"
            }, {
                name: "扎鲁特旗",
                code: "150526"
            }, {
                name: "霍林郭勒市",
                code: "150581"
            }]
        }, {
            name: "鄂尔多斯市",
            code: "150600",
            sub: [{
                name: "市辖区",
                code: "150601"
            }, {
                name: "东胜区",
                code: "150602"
            }, {
                name: "达拉特旗",
                code: "150621"
            }, {
                name: "准格尔旗",
                code: "150622"
            }, {
                name: "鄂托克前旗",
                code: "150623"
            }, {
                name: "鄂托克旗",
                code: "150624"
            }, {
                name: "杭锦旗",
                code: "150625"
            }, {
                name: "乌审旗",
                code: "150626"
            }, {
                name: "伊金霍洛旗",
                code: "150627"
            }]
        }, {
            name: "呼伦贝尔市",
            code: "150700",
            sub: [{
                name: "市辖区",
                code: "150701"
            }, {
                name: "海拉尔区",
                code: "150702"
            }, {
                name: "扎赉诺尔区",
                code: "150703"
            }, {
                name: "阿荣旗",
                code: "150721"
            }, {
                name: "莫力达瓦达斡尔族自治旗",
                code: "150722"
            }, {
                name: "鄂伦春自治旗",
                code: "150723"
            }, {
                name: "鄂温克族自治旗",
                code: "150724"
            }, {
                name: "陈巴尔虎旗",
                code: "150725"
            }, {
                name: "新巴尔虎左旗",
                code: "150726"
            }, {
                name: "新巴尔虎右旗",
                code: "150727"
            }, {
                name: "满洲里市",
                code: "150781"
            }, {
                name: "牙克石市",
                code: "150782"
            }, {
                name: "扎兰屯市",
                code: "150783"
            }, {
                name: "额尔古纳市",
                code: "150784"
            }, {
                name: "根河市",
                code: "150785"
            }]
        }, {
            name: "巴彦淖尔市",
            code: "150800",
            sub: [{
                name: "市辖区",
                code: "150801"
            }, {
                name: "临河区",
                code: "150802"
            }, {
                name: "五原县",
                code: "150821"
            }, {
                name: "磴口县",
                code: "150822"
            }, {
                name: "乌拉特前旗",
                code: "150823"
            }, {
                name: "乌拉特中旗",
                code: "150824"
            }, {
                name: "乌拉特后旗",
                code: "150825"
            }, {
                name: "杭锦后旗",
                code: "150826"
            }]
        }, {
            name: "乌兰察布市",
            code: "150900",
            sub: [{
                name: "市辖区",
                code: "150901"
            }, {
                name: "集宁区",
                code: "150902"
            }, {
                name: "卓资县",
                code: "150921"
            }, {
                name: "化德县",
                code: "150922"
            }, {
                name: "商都县",
                code: "150923"
            }, {
                name: "兴和县",
                code: "150924"
            }, {
                name: "凉城县",
                code: "150925"
            }, {
                name: "察哈尔右翼前旗",
                code: "150926"
            }, {
                name: "察哈尔右翼中旗",
                code: "150927"
            }, {
                name: "察哈尔右翼后旗",
                code: "150928"
            }, {
                name: "四子王旗",
                code: "150929"
            }, {
                name: "丰镇市",
                code: "150981"
            }]
        }, {
            name: "兴安盟",
            code: "152200",
            sub: [{
                name: "乌兰浩特市",
                code: "152201"
            }, {
                name: "阿尔山市",
                code: "152202"
            }, {
                name: "科尔沁右翼前旗",
                code: "152221"
            }, {
                name: "科尔沁右翼中旗",
                code: "152222"
            }, {
                name: "扎赉特旗",
                code: "152223"
            }, {
                name: "突泉县",
                code: "152224"
            }]
        }, {
            name: "锡林郭勒盟",
            code: "152500",
            sub: [{
                name: "二连浩特市",
                code: "152501"
            }, {
                name: "锡林浩特市",
                code: "152502"
            }, {
                name: "阿巴嘎旗",
                code: "152522"
            }, {
                name: "苏尼特左旗",
                code: "152523"
            }, {
                name: "苏尼特右旗",
                code: "152524"
            }, {
                name: "东乌珠穆沁旗",
                code: "152525"
            }, {
                name: "西乌珠穆沁旗",
                code: "152526"
            }, {
                name: "太仆寺旗",
                code: "152527"
            }, {
                name: "镶黄旗",
                code: "152528"
            }, {
                name: "正镶白旗",
                code: "152529"
            }, {
                name: "正蓝旗",
                code: "152530"
            }, {
                name: "多伦县",
                code: "152531"
            }]
        }, {
            name: "阿拉善盟",
            code: "152900",
            sub: [{
                name: "阿拉善左旗",
                code: "152921"
            }, {
                name: "阿拉善右旗",
                code: "152922"
            }, {
                name: "额济纳旗",
                code: "152923"
            }]
        }]
    }, {
        name: "辽宁省",
        code: "210000",
        sub: [{
            name: "沈阳市",
            code: "210100",
            sub: [{
                name: "市辖区",
                code: "210101"
            }, {
                name: "和平区",
                code: "210102"
            }, {
                name: "沈河区",
                code: "210103"
            }, {
                name: "大东区",
                code: "210104"
            }, {
                name: "皇姑区",
                code: "210105"
            }, {
                name: "铁西区",
                code: "210106"
            }, {
                name: "苏家屯区",
                code: "210111"
            }, {
                name: "浑南区",
                code: "210112"
            }, {
                name: "沈北新区",
                code: "210113"
            }, {
                name: "于洪区",
                code: "210114"
            }, {
                name: "辽中县",
                code: "210122"
            }, {
                name: "康平县",
                code: "210123"
            }, {
                name: "法库县",
                code: "210124"
            }, {
                name: "新民市",
                code: "210181"
            }]
        }, {
            name: "大连市",
            code: "210200",
            sub: [{
                name: "市辖区",
                code: "210201"
            }, {
                name: "中山区",
                code: "210202"
            }, {
                name: "西岗区",
                code: "210203"
            }, {
                name: "沙河口区",
                code: "210204"
            }, {
                name: "甘井子区",
                code: "210211"
            }, {
                name: "旅顺口区",
                code: "210212"
            }, {
                name: "金州区",
                code: "210213"
            }, {
                name: "长海县",
                code: "210224"
            }, {
                name: "瓦房店市",
                code: "210281"
            }, {
                name: "普兰店市",
                code: "210282"
            }, {
                name: "庄河市",
                code: "210283"
            }]
        }, {
            name: "鞍山市",
            code: "210300",
            sub: [{
                name: "市辖区",
                code: "210301"
            }, {
                name: "铁东区",
                code: "210302"
            }, {
                name: "铁西区",
                code: "210303"
            }, {
                name: "立山区",
                code: "210304"
            }, {
                name: "千山区",
                code: "210311"
            }, {
                name: "台安县",
                code: "210321"
            }, {
                name: "岫岩满族自治县",
                code: "210323"
            }, {
                name: "海城市",
                code: "210381"
            }]
        }, {
            name: "抚顺市",
            code: "210400",
            sub: [{
                name: "市辖区",
                code: "210401"
            }, {
                name: "新抚区",
                code: "210402"
            }, {
                name: "东洲区",
                code: "210403"
            }, {
                name: "望花区",
                code: "210404"
            }, {
                name: "顺城区",
                code: "210411"
            }, {
                name: "抚顺县",
                code: "210421"
            }, {
                name: "新宾满族自治县",
                code: "210422"
            }, {
                name: "清原满族自治县",
                code: "210423"
            }]
        }, {
            name: "本溪市",
            code: "210500",
            sub: [{
                name: "市辖区",
                code: "210501"
            }, {
                name: "平山区",
                code: "210502"
            }, {
                name: "溪湖区",
                code: "210503"
            }, {
                name: "明山区",
                code: "210504"
            }, {
                name: "南芬区",
                code: "210505"
            }, {
                name: "本溪满族自治县",
                code: "210521"
            }, {
                name: "桓仁满族自治县",
                code: "210522"
            }]
        }, {
            name: "丹东市",
            code: "210600",
            sub: [{
                name: "市辖区",
                code: "210601"
            }, {
                name: "元宝区",
                code: "210602"
            }, {
                name: "振兴区",
                code: "210603"
            }, {
                name: "振安区",
                code: "210604"
            }, {
                name: "宽甸满族自治县",
                code: "210624"
            }, {
                name: "东港市",
                code: "210681"
            }, {
                name: "凤城市",
                code: "210682"
            }]
        }, {
            name: "锦州市",
            code: "210700",
            sub: [{
                name: "市辖区",
                code: "210701"
            }, {
                name: "古塔区",
                code: "210702"
            }, {
                name: "凌河区",
                code: "210703"
            }, {
                name: "太和区",
                code: "210711"
            }, {
                name: "黑山县",
                code: "210726"
            }, {
                name: "义县",
                code: "210727"
            }, {
                name: "凌海市",
                code: "210781"
            }, {
                name: "北镇市",
                code: "210782"
            }]
        }, {
            name: "营口市",
            code: "210800",
            sub: [{
                name: "市辖区",
                code: "210801"
            }, {
                name: "站前区",
                code: "210802"
            }, {
                name: "西市区",
                code: "210803"
            }, {
                name: "鲅鱼圈区",
                code: "210804"
            }, {
                name: "老边区",
                code: "210811"
            }, {
                name: "盖州市",
                code: "210881"
            }, {
                name: "大石桥市",
                code: "210882"
            }]
        }, {
            name: "阜新市",
            code: "210900",
            sub: [{
                name: "市辖区",
                code: "210901"
            }, {
                name: "海州区",
                code: "210902"
            }, {
                name: "新邱区",
                code: "210903"
            }, {
                name: "太平区",
                code: "210904"
            }, {
                name: "清河门区",
                code: "210905"
            }, {
                name: "细河区",
                code: "210911"
            }, {
                name: "阜新蒙古族自治县",
                code: "210921"
            }, {
                name: "彰武县",
                code: "210922"
            }]
        }, {
            name: "辽阳市",
            code: "211000",
            sub: [{
                name: "市辖区",
                code: "211001"
            }, {
                name: "白塔区",
                code: "211002"
            }, {
                name: "文圣区",
                code: "211003"
            }, {
                name: "宏伟区",
                code: "211004"
            }, {
                name: "弓长岭区",
                code: "211005"
            }, {
                name: "太子河区",
                code: "211011"
            }, {
                name: "辽阳县",
                code: "211021"
            }, {
                name: "灯塔市",
                code: "211081"
            }]
        }, {
            name: "盘锦市",
            code: "211100",
            sub: [{
                name: "市辖区",
                code: "211101"
            }, {
                name: "双台子区",
                code: "211102"
            }, {
                name: "兴隆台区",
                code: "211103"
            }, {
                name: "大洼县",
                code: "211121"
            }, {
                name: "盘山县",
                code: "211122"
            }]
        }, {
            name: "铁岭市",
            code: "211200",
            sub: [{
                name: "市辖区",
                code: "211201"
            }, {
                name: "银州区",
                code: "211202"
            }, {
                name: "清河区",
                code: "211204"
            }, {
                name: "铁岭县",
                code: "211221"
            }, {
                name: "西丰县",
                code: "211223"
            }, {
                name: "昌图县",
                code: "211224"
            }, {
                name: "调兵山市",
                code: "211281"
            }, {
                name: "开原市",
                code: "211282"
            }]
        }, {
            name: "朝阳市",
            code: "211300",
            sub: [{
                name: "市辖区",
                code: "211301"
            }, {
                name: "双塔区",
                code: "211302"
            }, {
                name: "龙城区",
                code: "211303"
            }, {
                name: "朝阳县",
                code: "211321"
            }, {
                name: "建平县",
                code: "211322"
            }, {
                name: "喀喇沁左翼蒙古族自治县",
                code: "211324"
            }, {
                name: "北票市",
                code: "211381"
            }, {
                name: "凌源市",
                code: "211382"
            }]
        }, {
            name: "葫芦岛市",
            code: "211400",
            sub: [{
                name: "市辖区",
                code: "211401"
            }, {
                name: "连山区",
                code: "211402"
            }, {
                name: "龙港区",
                code: "211403"
            }, {
                name: "南票区",
                code: "211404"
            }, {
                name: "绥中县",
                code: "211421"
            }, {
                name: "建昌县",
                code: "211422"
            }, {
                name: "兴城市",
                code: "211481"
            }]
        }]
    }, {
        name: "吉林省",
        code: "220000",
        sub: [{
            name: "长春市",
            code: "220100",
            sub: [{
                name: "市辖区",
                code: "220101"
            }, {
                name: "南关区",
                code: "220102"
            }, {
                name: "宽城区",
                code: "220103"
            }, {
                name: "朝阳区",
                code: "220104"
            }, {
                name: "二道区",
                code: "220105"
            }, {
                name: "绿园区",
                code: "220106"
            }, {
                name: "双阳区",
                code: "220112"
            }, {
                name: "九台区",
                code: "220113"
            }, {
                name: "农安县",
                code: "220122"
            }, {
                name: "榆树市",
                code: "220182"
            }, {
                name: "德惠市",
                code: "220183"
            }]
        }, {
            name: "吉林市",
            code: "220200",
            sub: [{
                name: "市辖区",
                code: "220201"
            }, {
                name: "昌邑区",
                code: "220202"
            }, {
                name: "龙潭区",
                code: "220203"
            }, {
                name: "船营区",
                code: "220204"
            }, {
                name: "丰满区",
                code: "220211"
            }, {
                name: "永吉县",
                code: "220221"
            }, {
                name: "蛟河市",
                code: "220281"
            }, {
                name: "桦甸市",
                code: "220282"
            }, {
                name: "舒兰市",
                code: "220283"
            }, {
                name: "磐石市",
                code: "220284"
            }]
        }, {
            name: "四平市",
            code: "220300",
            sub: [{
                name: "市辖区",
                code: "220301"
            }, {
                name: "铁西区",
                code: "220302"
            }, {
                name: "铁东区",
                code: "220303"
            }, {
                name: "梨树县",
                code: "220322"
            }, {
                name: "伊通满族自治县",
                code: "220323"
            }, {
                name: "公主岭市",
                code: "220381"
            }, {
                name: "双辽市",
                code: "220382"
            }]
        }, {
            name: "辽源市",
            code: "220400",
            sub: [{
                name: "市辖区",
                code: "220401"
            }, {
                name: "龙山区",
                code: "220402"
            }, {
                name: "西安区",
                code: "220403"
            }, {
                name: "东丰县",
                code: "220421"
            }, {
                name: "东辽县",
                code: "220422"
            }]
        }, {
            name: "通化市",
            code: "220500",
            sub: [{
                name: "市辖区",
                code: "220501"
            }, {
                name: "东昌区",
                code: "220502"
            }, {
                name: "二道江区",
                code: "220503"
            }, {
                name: "通化县",
                code: "220521"
            }, {
                name: "辉南县",
                code: "220523"
            }, {
                name: "柳河县",
                code: "220524"
            }, {
                name: "梅河口市",
                code: "220581"
            }, {
                name: "集安市",
                code: "220582"
            }]
        }, {
            name: "白山市",
            code: "220600",
            sub: [{
                name: "市辖区",
                code: "220601"
            }, {
                name: "浑江区",
                code: "220602"
            }, {
                name: "江源区",
                code: "220605"
            }, {
                name: "抚松县",
                code: "220621"
            }, {
                name: "靖宇县",
                code: "220622"
            }, {
                name: "长白朝鲜族自治县",
                code: "220623"
            }, {
                name: "临江市",
                code: "220681"
            }]
        }, {
            name: "松原市",
            code: "220700",
            sub: [{
                name: "市辖区",
                code: "220701"
            }, {
                name: "宁江区",
                code: "220702"
            }, {
                name: "前郭尔罗斯蒙古族自治县",
                code: "220721"
            }, {
                name: "长岭县",
                code: "220722"
            }, {
                name: "乾安县",
                code: "220723"
            }, {
                name: "扶余市",
                code: "220781"
            }]
        }, {
            name: "白城市",
            code: "220800",
            sub: [{
                name: "市辖区",
                code: "220801"
            }, {
                name: "洮北区",
                code: "220802"
            }, {
                name: "镇赉县",
                code: "220821"
            }, {
                name: "通榆县",
                code: "220822"
            }, {
                name: "洮南市",
                code: "220881"
            }, {
                name: "大安市",
                code: "220882"
            }]
        }, {
            name: "延边朝鲜族自治州",
            code: "222400",
            sub: [{
                name: "延吉市",
                code: "222401"
            }, {
                name: "图们市",
                code: "222402"
            }, {
                name: "敦化市",
                code: "222403"
            }, {
                name: "珲春市",
                code: "222404"
            }, {
                name: "龙井市",
                code: "222405"
            }, {
                name: "和龙市",
                code: "222406"
            }, {
                name: "汪清县",
                code: "222424"
            }, {
                name: "安图县",
                code: "222426"
            }]
        }]
    }, {
        name: "黑龙江省",
        code: "230000",
        sub: [{
            name: "哈尔滨市",
            code: "230100",
            sub: [{
                name: "市辖区",
                code: "230101"
            }, {
                name: "道里区",
                code: "230102"
            }, {
                name: "南岗区",
                code: "230103"
            }, {
                name: "道外区",
                code: "230104"
            }, {
                name: "平房区",
                code: "230108"
            }, {
                name: "松北区",
                code: "230109"
            }, {
                name: "香坊区",
                code: "230110"
            }, {
                name: "呼兰区",
                code: "230111"
            }, {
                name: "阿城区",
                code: "230112"
            }, {
                name: "双城区",
                code: "230113"
            }, {
                name: "依兰县",
                code: "230123"
            }, {
                name: "方正县",
                code: "230124"
            }, {
                name: "宾县",
                code: "230125"
            }, {
                name: "巴彦县",
                code: "230126"
            }, {
                name: "木兰县",
                code: "230127"
            }, {
                name: "通河县",
                code: "230128"
            }, {
                name: "延寿县",
                code: "230129"
            }, {
                name: "尚志市",
                code: "230183"
            }, {
                name: "五常市",
                code: "230184"
            }]
        }, {
            name: "齐齐哈尔市",
            code: "230200",
            sub: [{
                name: "市辖区",
                code: "230201"
            }, {
                name: "龙沙区",
                code: "230202"
            }, {
                name: "建华区",
                code: "230203"
            }, {
                name: "铁锋区",
                code: "230204"
            }, {
                name: "昂昂溪区",
                code: "230205"
            }, {
                name: "富拉尔基区",
                code: "230206"
            }, {
                name: "碾子山区",
                code: "230207"
            }, {
                name: "梅里斯达斡尔族区",
                code: "230208"
            }, {
                name: "龙江县",
                code: "230221"
            }, {
                name: "依安县",
                code: "230223"
            }, {
                name: "泰来县",
                code: "230224"
            }, {
                name: "甘南县",
                code: "230225"
            }, {
                name: "富裕县",
                code: "230227"
            }, {
                name: "克山县",
                code: "230229"
            }, {
                name: "克东县",
                code: "230230"
            }, {
                name: "拜泉县",
                code: "230231"
            }, {
                name: "讷河市",
                code: "230281"
            }]
        }, {
            name: "鸡西市",
            code: "230300",
            sub: [{
                name: "市辖区",
                code: "230301"
            }, {
                name: "鸡冠区",
                code: "230302"
            }, {
                name: "恒山区",
                code: "230303"
            }, {
                name: "滴道区",
                code: "230304"
            }, {
                name: "梨树区",
                code: "230305"
            }, {
                name: "城子河区",
                code: "230306"
            }, {
                name: "麻山区",
                code: "230307"
            }, {
                name: "鸡东县",
                code: "230321"
            }, {
                name: "虎林市",
                code: "230381"
            }, {
                name: "密山市",
                code: "230382"
            }]
        }, {
            name: "鹤岗市",
            code: "230400",
            sub: [{
                name: "市辖区",
                code: "230401"
            }, {
                name: "向阳区",
                code: "230402"
            }, {
                name: "工农区",
                code: "230403"
            }, {
                name: "南山区",
                code: "230404"
            }, {
                name: "兴安区",
                code: "230405"
            }, {
                name: "东山区",
                code: "230406"
            }, {
                name: "兴山区",
                code: "230407"
            }, {
                name: "萝北县",
                code: "230421"
            }, {
                name: "绥滨县",
                code: "230422"
            }]
        }, {
            name: "双鸭山市",
            code: "230500",
            sub: [{
                name: "市辖区",
                code: "230501"
            }, {
                name: "尖山区",
                code: "230502"
            }, {
                name: "岭东区",
                code: "230503"
            }, {
                name: "四方台区",
                code: "230505"
            }, {
                name: "宝山区",
                code: "230506"
            }, {
                name: "集贤县",
                code: "230521"
            }, {
                name: "友谊县",
                code: "230522"
            }, {
                name: "宝清县",
                code: "230523"
            }, {
                name: "饶河县",
                code: "230524"
            }]
        }, {
            name: "大庆市",
            code: "230600",
            sub: [{
                name: "市辖区",
                code: "230601"
            }, {
                name: "萨尔图区",
                code: "230602"
            }, {
                name: "龙凤区",
                code: "230603"
            }, {
                name: "让胡路区",
                code: "230604"
            }, {
                name: "红岗区",
                code: "230605"
            }, {
                name: "大同区",
                code: "230606"
            }, {
                name: "肇州县",
                code: "230621"
            }, {
                name: "肇源县",
                code: "230622"
            }, {
                name: "林甸县",
                code: "230623"
            }, {
                name: "杜尔伯特蒙古族自治县",
                code: "230624"
            }]
        }, {
            name: "伊春市",
            code: "230700",
            sub: [{
                name: "市辖区",
                code: "230701"
            }, {
                name: "伊春区",
                code: "230702"
            }, {
                name: "南岔区",
                code: "230703"
            }, {
                name: "友好区",
                code: "230704"
            }, {
                name: "西林区",
                code: "230705"
            }, {
                name: "翠峦区",
                code: "230706"
            }, {
                name: "新青区",
                code: "230707"
            }, {
                name: "美溪区",
                code: "230708"
            }, {
                name: "金山屯区",
                code: "230709"
            }, {
                name: "五营区",
                code: "230710"
            }, {
                name: "乌马河区",
                code: "230711"
            }, {
                name: "汤旺河区",
                code: "230712"
            }, {
                name: "带岭区",
                code: "230713"
            }, {
                name: "乌伊岭区",
                code: "230714"
            }, {
                name: "红星区",
                code: "230715"
            }, {
                name: "上甘岭区",
                code: "230716"
            }, {
                name: "嘉荫县",
                code: "230722"
            }, {
                name: "铁力市",
                code: "230781"
            }]
        }, {
            name: "佳木斯市",
            code: "230800",
            sub: [{
                name: "市辖区",
                code: "230801"
            }, {
                name: "向阳区",
                code: "230803"
            }, {
                name: "前进区",
                code: "230804"
            }, {
                name: "东风区",
                code: "230805"
            }, {
                name: "郊区",
                code: "230811"
            }, {
                name: "桦南县",
                code: "230822"
            }, {
                name: "桦川县",
                code: "230826"
            }, {
                name: "汤原县",
                code: "230828"
            }, {
                name: "抚远县",
                code: "230833"
            }, {
                name: "同江市",
                code: "230881"
            }, {
                name: "富锦市",
                code: "230882"
            }]
        }, {
            name: "七台河市",
            code: "230900",
            sub: [{
                name: "市辖区",
                code: "230901"
            }, {
                name: "新兴区",
                code: "230902"
            }, {
                name: "桃山区",
                code: "230903"
            }, {
                name: "茄子河区",
                code: "230904"
            }, {
                name: "勃利县",
                code: "230921"
            }]
        }, {
            name: "牡丹江市",
            code: "231000",
            sub: [{
                name: "市辖区",
                code: "231001"
            }, {
                name: "东安区",
                code: "231002"
            }, {
                name: "阳明区",
                code: "231003"
            }, {
                name: "爱民区",
                code: "231004"
            }, {
                name: "西安区",
                code: "231005"
            }, {
                name: "东宁县",
                code: "231024"
            }, {
                name: "林口县",
                code: "231025"
            }, {
                name: "绥芬河市",
                code: "231081"
            }, {
                name: "海林市",
                code: "231083"
            }, {
                name: "宁安市",
                code: "231084"
            }, {
                name: "穆棱市",
                code: "231085"
            }]
        }, {
            name: "黑河市",
            code: "231100",
            sub: [{
                name: "市辖区",
                code: "231101"
            }, {
                name: "爱辉区",
                code: "231102"
            }, {
                name: "嫩江县",
                code: "231121"
            }, {
                name: "逊克县",
                code: "231123"
            }, {
                name: "孙吴县",
                code: "231124"
            }, {
                name: "北安市",
                code: "231181"
            }, {
                name: "五大连池市",
                code: "231182"
            }]
        }, {
            name: "绥化市",
            code: "231200",
            sub: [{
                name: "市辖区",
                code: "231201"
            }, {
                name: "北林区",
                code: "231202"
            }, {
                name: "望奎县",
                code: "231221"
            }, {
                name: "兰西县",
                code: "231222"
            }, {
                name: "青冈县",
                code: "231223"
            }, {
                name: "庆安县",
                code: "231224"
            }, {
                name: "明水县",
                code: "231225"
            }, {
                name: "绥棱县",
                code: "231226"
            }, {
                name: "安达市",
                code: "231281"
            }, {
                name: "肇东市",
                code: "231282"
            }, {
                name: "海伦市",
                code: "231283"
            }]
        }, {
            name: "大兴安岭地区",
            code: "232700",
            sub: [{
                name: "呼玛县",
                code: "232721"
            }, {
                name: "塔河县",
                code: "232722"
            }, {
                name: "漠河县",
                code: "232723"
            }]
        }]
    }, {
        name: "上海",
        code: "310000",
        sub: [{
            name: "上海市",
            code: "310000",
            sub: [{
                name: "黄浦区",
                code: "310101"
            }, {
                name: "徐汇区",
                code: "310104"
            }, {
                name: "长宁区",
                code: "310105"
            }, {
                name: "静安区",
                code: "310106"
            }, {
                name: "普陀区",
                code: "310107"
            }, {
                name: "闸北区",
                code: "310108"
            }, {
                name: "虹口区",
                code: "310109"
            }, {
                name: "杨浦区",
                code: "310110"
            }, {
                name: "闵行区",
                code: "310112"
            }, {
                name: "宝山区",
                code: "310113"
            }, {
                name: "嘉定区",
                code: "310114"
            }, {
                name: "浦东新区",
                code: "310115"
            }, {
                name: "金山区",
                code: "310116"
            }, {
                name: "松江区",
                code: "310117"
            }, {
                name: "青浦区",
                code: "310118"
            }, {
                name: "奉贤区",
                code: "310120"
            }, {
                name: "崇明县",
                code: "310230"
            }]
        }]
    }, {
        name: "江苏省",
        code: "320000",
        sub: [{
            name: "南京市",
            code: "320100",
            sub: [{
                name: "市辖区",
                code: "320101"
            }, {
                name: "玄武区",
                code: "320102"
            }, {
                name: "秦淮区",
                code: "320104"
            }, {
                name: "建邺区",
                code: "320105"
            }, {
                name: "鼓楼区",
                code: "320106"
            }, {
                name: "浦口区",
                code: "320111"
            }, {
                name: "栖霞区",
                code: "320113"
            }, {
                name: "雨花台区",
                code: "320114"
            }, {
                name: "江宁区",
                code: "320115"
            }, {
                name: "六合区",
                code: "320116"
            }, {
                name: "溧水区",
                code: "320117"
            }, {
                name: "高淳区",
                code: "320118"
            }]
        }, {
            name: "无锡市",
            code: "320200",
            sub: [{
                name: "市辖区",
                code: "320201"
            }, {
                name: "崇安区",
                code: "320202"
            }, {
                name: "南长区",
                code: "320203"
            }, {
                name: "北塘区",
                code: "320204"
            }, {
                name: "锡山区",
                code: "320205"
            }, {
                name: "惠山区",
                code: "320206"
            }, {
                name: "滨湖区",
                code: "320211"
            }, {
                name: "江阴市",
                code: "320281"
            }, {
                name: "宜兴市",
                code: "320282"
            }]
        }, {
            name: "徐州市",
            code: "320300",
            sub: [{
                name: "市辖区",
                code: "320301"
            }, {
                name: "鼓楼区",
                code: "320302"
            }, {
                name: "云龙区",
                code: "320303"
            }, {
                name: "贾汪区",
                code: "320305"
            }, {
                name: "泉山区",
                code: "320311"
            }, {
                name: "铜山区",
                code: "320312"
            }, {
                name: "丰县",
                code: "320321"
            }, {
                name: "沛县",
                code: "320322"
            }, {
                name: "睢宁县",
                code: "320324"
            }, {
                name: "新沂市",
                code: "320381"
            }, {
                name: "邳州市",
                code: "320382"
            }]
        }, {
            name: "常州市",
            code: "320400",
            sub: [{
                name: "市辖区",
                code: "320401"
            }, {
                name: "天宁区",
                code: "320402"
            }, {
                name: "钟楼区",
                code: "320404"
            }, {
                name: "戚墅堰区",
                code: "320405"
            }, {
                name: "新北区",
                code: "320411"
            }, {
                name: "武进区",
                code: "320412"
            }, {
                name: "溧阳市",
                code: "320481"
            }, {
                name: "金坛市",
                code: "320482"
            }]
        }, {
            name: "苏州市",
            code: "320500",
            sub: [{
                name: "市辖区",
                code: "320501"
            }, {
                name: "虎丘区",
                code: "320505"
            }, {
                name: "吴中区",
                code: "320506"
            }, {
                name: "相城区",
                code: "320507"
            }, {
                name: "姑苏区",
                code: "320508"
            }, {
                name: "吴江区",
                code: "320509"
            }, {
                name: "常熟市",
                code: "320581"
            }, {
                name: "张家港市",
                code: "320582"
            }, {
                name: "昆山市",
                code: "320583"
            }, {
                name: "太仓市",
                code: "320585"
            }]
        }, {
            name: "南通市",
            code: "320600",
            sub: [{
                name: "市辖区",
                code: "320601"
            }, {
                name: "崇川区",
                code: "320602"
            }, {
                name: "港闸区",
                code: "320611"
            }, {
                name: "通州区",
                code: "320612"
            }, {
                name: "海安县",
                code: "320621"
            }, {
                name: "如东县",
                code: "320623"
            }, {
                name: "启东市",
                code: "320681"
            }, {
                name: "如皋市",
                code: "320682"
            }, {
                name: "海门市",
                code: "320684"
            }]
        }, {
            name: "连云港市",
            code: "320700",
            sub: [{
                name: "市辖区",
                code: "320701"
            }, {
                name: "连云区",
                code: "320703"
            }, {
                name: "海州区",
                code: "320706"
            }, {
                name: "赣榆区",
                code: "320707"
            }, {
                name: "东海县",
                code: "320722"
            }, {
                name: "灌云县",
                code: "320723"
            }, {
                name: "灌南县",
                code: "320724"
            }]
        }, {
            name: "淮安市",
            code: "320800",
            sub: [{
                name: "市辖区",
                code: "320801"
            }, {
                name: "清河区",
                code: "320802"
            }, {
                name: "淮安区",
                code: "320803"
            }, {
                name: "淮阴区",
                code: "320804"
            }, {
                name: "清浦区",
                code: "320811"
            }, {
                name: "涟水县",
                code: "320826"
            }, {
                name: "洪泽县",
                code: "320829"
            }, {
                name: "盱眙县",
                code: "320830"
            }, {
                name: "金湖县",
                code: "320831"
            }]
        }, {
            name: "盐城市",
            code: "320900",
            sub: [{
                name: "市辖区",
                code: "320901"
            }, {
                name: "亭湖区",
                code: "320902"
            }, {
                name: "盐都区",
                code: "320903"
            }, {
                name: "响水县",
                code: "320921"
            }, {
                name: "滨海县",
                code: "320922"
            }, {
                name: "阜宁县",
                code: "320923"
            }, {
                name: "射阳县",
                code: "320924"
            }, {
                name: "建湖县",
                code: "320925"
            }, {
                name: "东台市",
                code: "320981"
            }, {
                name: "大丰市",
                code: "320982"
            }]
        }, {
            name: "扬州市",
            code: "321000",
            sub: [{
                name: "市辖区",
                code: "321001"
            }, {
                name: "广陵区",
                code: "321002"
            }, {
                name: "邗江区",
                code: "321003"
            }, {
                name: "江都区",
                code: "321012"
            }, {
                name: "宝应县",
                code: "321023"
            }, {
                name: "仪征市",
                code: "321081"
            }, {
                name: "高邮市",
                code: "321084"
            }]
        }, {
            name: "镇江市",
            code: "321100",
            sub: [{
                name: "市辖区",
                code: "321101"
            }, {
                name: "京口区",
                code: "321102"
            }, {
                name: "润州区",
                code: "321111"
            }, {
                name: "丹徒区",
                code: "321112"
            }, {
                name: "丹阳市",
                code: "321181"
            }, {
                name: "扬中市",
                code: "321182"
            }, {
                name: "句容市",
                code: "321183"
            }]
        }, {
            name: "泰州市",
            code: "321200",
            sub: [{
                name: "市辖区",
                code: "321201"
            }, {
                name: "海陵区",
                code: "321202"
            }, {
                name: "高港区",
                code: "321203"
            }, {
                name: "姜堰区",
                code: "321204"
            }, {
                name: "兴化市",
                code: "321281"
            }, {
                name: "靖江市",
                code: "321282"
            }, {
                name: "泰兴市",
                code: "321283"
            }]
        }, {
            name: "宿迁市",
            code: "321300",
            sub: [{
                name: "市辖区",
                code: "321301"
            }, {
                name: "宿城区",
                code: "321302"
            }, {
                name: "宿豫区",
                code: "321311"
            }, {
                name: "沭阳县",
                code: "321322"
            }, {
                name: "泗阳县",
                code: "321323"
            }, {
                name: "泗洪县",
                code: "321324"
            }]
        }]
    }, {
        name: "浙江省",
        code: "330000",
        sub: [{
            name: "杭州市",
            code: "330100",
            sub: [{
                name: "市辖区",
                code: "330101"
            }, {
                name: "上城区",
                code: "330102"
            }, {
                name: "下城区",
                code: "330103"
            }, {
                name: "江干区",
                code: "330104"
            }, {
                name: "拱墅区",
                code: "330105"
            }, {
                name: "西湖区",
                code: "330106"
            }, {
                name: "滨江区",
                code: "330108"
            }, {
                name: "萧山区",
                code: "330109"
            }, {
                name: "余杭区",
                code: "330110"
            }, {
                name: "富阳区",
                code: "330111"
            }, {
                name: "桐庐县",
                code: "330122"
            }, {
                name: "淳安县",
                code: "330127"
            }, {
                name: "建德市",
                code: "330182"
            }, {
                name: "临安市",
                code: "330185"
            }]
        }, {
            name: "宁波市",
            code: "330200",
            sub: [{
                name: "市辖区",
                code: "330201"
            }, {
                name: "海曙区",
                code: "330203"
            }, {
                name: "江东区",
                code: "330204"
            }, {
                name: "江北区",
                code: "330205"
            }, {
                name: "北仑区",
                code: "330206"
            }, {
                name: "镇海区",
                code: "330211"
            }, {
                name: "鄞州区",
                code: "330212"
            }, {
                name: "象山县",
                code: "330225"
            }, {
                name: "宁海县",
                code: "330226"
            }, {
                name: "余姚市",
                code: "330281"
            }, {
                name: "慈溪市",
                code: "330282"
            }, {
                name: "奉化市",
                code: "330283"
            }]
        }, {
            name: "温州市",
            code: "330300",
            sub: [{
                name: "市辖区",
                code: "330301"
            }, {
                name: "鹿城区",
                code: "330302"
            }, {
                name: "龙湾区",
                code: "330303"
            }, {
                name: "瓯海区",
                code: "330304"
            }, {
                name: "洞头县",
                code: "330322"
            }, {
                name: "永嘉县",
                code: "330324"
            }, {
                name: "平阳县",
                code: "330326"
            }, {
                name: "苍南县",
                code: "330327"
            }, {
                name: "文成县",
                code: "330328"
            }, {
                name: "泰顺县",
                code: "330329"
            }, {
                name: "瑞安市",
                code: "330381"
            }, {
                name: "乐清市",
                code: "330382"
            }]
        }, {
            name: "嘉兴市",
            code: "330400",
            sub: [{
                name: "市辖区",
                code: "330401"
            }, {
                name: "南湖区",
                code: "330402"
            }, {
                name: "秀洲区",
                code: "330411"
            }, {
                name: "嘉善县",
                code: "330421"
            }, {
                name: "海盐县",
                code: "330424"
            }, {
                name: "海宁市",
                code: "330481"
            }, {
                name: "平湖市",
                code: "330482"
            }, {
                name: "桐乡市",
                code: "330483"
            }]
        }, {
            name: "湖州市",
            code: "330500",
            sub: [{
                name: "市辖区",
                code: "330501"
            }, {
                name: "吴兴区",
                code: "330502"
            }, {
                name: "南浔区",
                code: "330503"
            }, {
                name: "德清县",
                code: "330521"
            }, {
                name: "长兴县",
                code: "330522"
            }, {
                name: "安吉县",
                code: "330523"
            }]
        }, {
            name: "绍兴市",
            code: "330600",
            sub: [{
                name: "市辖区",
                code: "330601"
            }, {
                name: "越城区",
                code: "330602"
            }, {
                name: "柯桥区",
                code: "330603"
            }, {
                name: "上虞区",
                code: "330604"
            }, {
                name: "新昌县",
                code: "330624"
            }, {
                name: "诸暨市",
                code: "330681"
            }, {
                name: "嵊州市",
                code: "330683"
            }]
        }, {
            name: "金华市",
            code: "330700",
            sub: [{
                name: "市辖区",
                code: "330701"
            }, {
                name: "婺城区",
                code: "330702"
            }, {
                name: "金东区",
                code: "330703"
            }, {
                name: "武义县",
                code: "330723"
            }, {
                name: "浦江县",
                code: "330726"
            }, {
                name: "磐安县",
                code: "330727"
            }, {
                name: "兰溪市",
                code: "330781"
            }, {
                name: "义乌市",
                code: "330782"
            }, {
                name: "东阳市",
                code: "330783"
            }, {
                name: "永康市",
                code: "330784"
            }]
        }, {
            name: "衢州市",
            code: "330800",
            sub: [{
                name: "市辖区",
                code: "330801"
            }, {
                name: "柯城区",
                code: "330802"
            }, {
                name: "衢江区",
                code: "330803"
            }, {
                name: "常山县",
                code: "330822"
            }, {
                name: "开化县",
                code: "330824"
            }, {
                name: "龙游县",
                code: "330825"
            }, {
                name: "江山市",
                code: "330881"
            }]
        }, {
            name: "舟山市",
            code: "330900",
            sub: [{
                name: "市辖区",
                code: "330901"
            }, {
                name: "定海区",
                code: "330902"
            }, {
                name: "普陀区",
                code: "330903"
            }, {
                name: "岱山县",
                code: "330921"
            }, {
                name: "嵊泗县",
                code: "330922"
            }]
        }, {
            name: "台州市",
            code: "331000",
            sub: [{
                name: "市辖区",
                code: "331001"
            }, {
                name: "椒江区",
                code: "331002"
            }, {
                name: "黄岩区",
                code: "331003"
            }, {
                name: "路桥区",
                code: "331004"
            }, {
                name: "玉环县",
                code: "331021"
            }, {
                name: "三门县",
                code: "331022"
            }, {
                name: "天台县",
                code: "331023"
            }, {
                name: "仙居县",
                code: "331024"
            }, {
                name: "温岭市",
                code: "331081"
            }, {
                name: "临海市",
                code: "331082"
            }]
        }, {
            name: "丽水市",
            code: "331100",
            sub: [{
                name: "市辖区",
                code: "331101"
            }, {
                name: "莲都区",
                code: "331102"
            }, {
                name: "青田县",
                code: "331121"
            }, {
                name: "缙云县",
                code: "331122"
            }, {
                name: "遂昌县",
                code: "331123"
            }, {
                name: "松阳县",
                code: "331124"
            }, {
                name: "云和县",
                code: "331125"
            }, {
                name: "庆元县",
                code: "331126"
            }, {
                name: "景宁畲族自治县",
                code: "331127"
            }, {
                name: "龙泉市",
                code: "331181"
            }]
        }]
    }, {
        name: "安徽省",
        code: "340000",
        sub: [{
            name: "合肥市",
            code: "340100",
            sub: [{
                name: "市辖区",
                code: "340101"
            }, {
                name: "瑶海区",
                code: "340102"
            }, {
                name: "庐阳区",
                code: "340103"
            }, {
                name: "蜀山区",
                code: "340104"
            }, {
                name: "包河区",
                code: "340111"
            }, {
                name: "长丰县",
                code: "340121"
            }, {
                name: "肥东县",
                code: "340122"
            }, {
                name: "肥西县",
                code: "340123"
            }, {
                name: "庐江县",
                code: "340124"
            }, {
                name: "巢湖市",
                code: "340181"
            }]
        }, {
            name: "芜湖市",
            code: "340200",
            sub: [{
                name: "市辖区",
                code: "340201"
            }, {
                name: "镜湖区",
                code: "340202"
            }, {
                name: "弋江区",
                code: "340203"
            }, {
                name: "鸠江区",
                code: "340207"
            }, {
                name: "三山区",
                code: "340208"
            }, {
                name: "芜湖县",
                code: "340221"
            }, {
                name: "繁昌县",
                code: "340222"
            }, {
                name: "南陵县",
                code: "340223"
            }, {
                name: "无为县",
                code: "340225"
            }]
        }, {
            name: "蚌埠市",
            code: "340300",
            sub: [{
                name: "市辖区",
                code: "340301"
            }, {
                name: "龙子湖区",
                code: "340302"
            }, {
                name: "蚌山区",
                code: "340303"
            }, {
                name: "禹会区",
                code: "340304"
            }, {
                name: "淮上区",
                code: "340311"
            }, {
                name: "怀远县",
                code: "340321"
            }, {
                name: "五河县",
                code: "340322"
            }, {
                name: "固镇县",
                code: "340323"
            }]
        }, {
            name: "淮南市",
            code: "340400",
            sub: [{
                name: "市辖区",
                code: "340401"
            }, {
                name: "大通区",
                code: "340402"
            }, {
                name: "田家庵区",
                code: "340403"
            }, {
                name: "谢家集区",
                code: "340404"
            }, {
                name: "八公山区",
                code: "340405"
            }, {
                name: "潘集区",
                code: "340406"
            }, {
                name: "凤台县",
                code: "340421"
            }]
        }, {
            name: "马鞍山市",
            code: "340500",
            sub: [{
                name: "市辖区",
                code: "340501"
            }, {
                name: "花山区",
                code: "340503"
            }, {
                name: "雨山区",
                code: "340504"
            }, {
                name: "博望区",
                code: "340506"
            }, {
                name: "当涂县",
                code: "340521"
            }, {
                name: "含山县",
                code: "340522"
            }, {
                name: "和县",
                code: "340523"
            }]
        }, {
            name: "淮北市",
            code: "340600",
            sub: [{
                name: "市辖区",
                code: "340601"
            }, {
                name: "杜集区",
                code: "340602"
            }, {
                name: "相山区",
                code: "340603"
            }, {
                name: "烈山区",
                code: "340604"
            }, {
                name: "濉溪县",
                code: "340621"
            }]
        }, {
            name: "铜陵市",
            code: "340700",
            sub: [{
                name: "市辖区",
                code: "340701"
            }, {
                name: "铜官山区",
                code: "340702"
            }, {
                name: "狮子山区",
                code: "340703"
            }, {
                name: "郊区",
                code: "340711"
            }, {
                name: "铜陵县",
                code: "340721"
            }]
        }, {
            name: "安庆市",
            code: "340800",
            sub: [{
                name: "市辖区",
                code: "340801"
            }, {
                name: "迎江区",
                code: "340802"
            }, {
                name: "大观区",
                code: "340803"
            }, {
                name: "宜秀区",
                code: "340811"
            }, {
                name: "怀宁县",
                code: "340822"
            }, {
                name: "枞阳县",
                code: "340823"
            }, {
                name: "潜山县",
                code: "340824"
            }, {
                name: "太湖县",
                code: "340825"
            }, {
                name: "宿松县",
                code: "340826"
            }, {
                name: "望江县",
                code: "340827"
            }, {
                name: "岳西县",
                code: "340828"
            }, {
                name: "桐城市",
                code: "340881"
            }]
        }, {
            name: "黄山市",
            code: "341000",
            sub: [{
                name: "市辖区",
                code: "341001"
            }, {
                name: "屯溪区",
                code: "341002"
            }, {
                name: "黄山区",
                code: "341003"
            }, {
                name: "徽州区",
                code: "341004"
            }, {
                name: "歙县",
                code: "341021"
            }, {
                name: "休宁县",
                code: "341022"
            }, {
                name: "黟县",
                code: "341023"
            }, {
                name: "祁门县",
                code: "341024"
            }]
        }, {
            name: "滁州市",
            code: "341100",
            sub: [{
                name: "市辖区",
                code: "341101"
            }, {
                name: "琅琊区",
                code: "341102"
            }, {
                name: "南谯区",
                code: "341103"
            }, {
                name: "来安县",
                code: "341122"
            }, {
                name: "全椒县",
                code: "341124"
            }, {
                name: "定远县",
                code: "341125"
            }, {
                name: "凤阳县",
                code: "341126"
            }, {
                name: "天长市",
                code: "341181"
            }, {
                name: "明光市",
                code: "341182"
            }]
        }, {
            name: "阜阳市",
            code: "341200",
            sub: [{
                name: "市辖区",
                code: "341201"
            }, {
                name: "颍州区",
                code: "341202"
            }, {
                name: "颍东区",
                code: "341203"
            }, {
                name: "颍泉区",
                code: "341204"
            }, {
                name: "临泉县",
                code: "341221"
            }, {
                name: "太和县",
                code: "341222"
            }, {
                name: "阜南县",
                code: "341225"
            }, {
                name: "颍上县",
                code: "341226"
            }, {
                name: "界首市",
                code: "341282"
            }]
        }, {
            name: "宿州市",
            code: "341300",
            sub: [{
                name: "市辖区",
                code: "341301"
            }, {
                name: "埇桥区",
                code: "341302"
            }, {
                name: "砀山县",
                code: "341321"
            }, {
                name: "萧县",
                code: "341322"
            }, {
                name: "灵璧县",
                code: "341323"
            }, {
                name: "泗县",
                code: "341324"
            }]
        }, {
            name: "六安市",
            code: "341500",
            sub: [{
                name: "市辖区",
                code: "341501"
            }, {
                name: "金安区",
                code: "341502"
            }, {
                name: "裕安区",
                code: "341503"
            }, {
                name: "寿县",
                code: "341521"
            }, {
                name: "霍邱县",
                code: "341522"
            }, {
                name: "舒城县",
                code: "341523"
            }, {
                name: "金寨县",
                code: "341524"
            }, {
                name: "霍山县",
                code: "341525"
            }]
        }, {
            name: "亳州市",
            code: "341600",
            sub: [{
                name: "市辖区",
                code: "341601"
            }, {
                name: "谯城区",
                code: "341602"
            }, {
                name: "涡阳县",
                code: "341621"
            }, {
                name: "蒙城县",
                code: "341622"
            }, {
                name: "利辛县",
                code: "341623"
            }]
        }, {
            name: "池州市",
            code: "341700",
            sub: [{
                name: "市辖区",
                code: "341701"
            }, {
                name: "贵池区",
                code: "341702"
            }, {
                name: "东至县",
                code: "341721"
            }, {
                name: "石台县",
                code: "341722"
            }, {
                name: "青阳县",
                code: "341723"
            }]
        }, {
            name: "宣城市",
            code: "341800",
            sub: [{
                name: "市辖区",
                code: "341801"
            }, {
                name: "宣州区",
                code: "341802"
            }, {
                name: "郎溪县",
                code: "341821"
            }, {
                name: "广德县",
                code: "341822"
            }, {
                name: "泾县",
                code: "341823"
            }, {
                name: "绩溪县",
                code: "341824"
            }, {
                name: "旌德县",
                code: "341825"
            }, {
                name: "宁国市",
                code: "341881"
            }]
        }]
    }, {
        name: "福建省",
        code: "350000",
        sub: [{
            name: "福州市",
            code: "350100",
            sub: [{
                name: "市辖区",
                code: "350101"
            }, {
                name: "鼓楼区",
                code: "350102"
            }, {
                name: "台江区",
                code: "350103"
            }, {
                name: "仓山区",
                code: "350104"
            }, {
                name: "马尾区",
                code: "350105"
            }, {
                name: "晋安区",
                code: "350111"
            }, {
                name: "闽侯县",
                code: "350121"
            }, {
                name: "连江县",
                code: "350122"
            }, {
                name: "罗源县",
                code: "350123"
            }, {
                name: "闽清县",
                code: "350124"
            }, {
                name: "永泰县",
                code: "350125"
            }, {
                name: "平潭县",
                code: "350128"
            }, {
                name: "福清市",
                code: "350181"
            }, {
                name: "长乐市",
                code: "350182"
            }]
        }, {
            name: "厦门市",
            code: "350200",
            sub: [{
                name: "市辖区",
                code: "350201"
            }, {
                name: "思明区",
                code: "350203"
            }, {
                name: "海沧区",
                code: "350205"
            }, {
                name: "湖里区",
                code: "350206"
            }, {
                name: "集美区",
                code: "350211"
            }, {
                name: "同安区",
                code: "350212"
            }, {
                name: "翔安区",
                code: "350213"
            }]
        }, {
            name: "莆田市",
            code: "350300",
            sub: [{
                name: "市辖区",
                code: "350301"
            }, {
                name: "城厢区",
                code: "350302"
            }, {
                name: "涵江区",
                code: "350303"
            }, {
                name: "荔城区",
                code: "350304"
            }, {
                name: "秀屿区",
                code: "350305"
            }, {
                name: "仙游县",
                code: "350322"
            }]
        }, {
            name: "三明市",
            code: "350400",
            sub: [{
                name: "市辖区",
                code: "350401"
            }, {
                name: "梅列区",
                code: "350402"
            }, {
                name: "三元区",
                code: "350403"
            }, {
                name: "明溪县",
                code: "350421"
            }, {
                name: "清流县",
                code: "350423"
            }, {
                name: "宁化县",
                code: "350424"
            }, {
                name: "大田县",
                code: "350425"
            }, {
                name: "尤溪县",
                code: "350426"
            }, {
                name: "沙县",
                code: "350427"
            }, {
                name: "将乐县",
                code: "350428"
            }, {
                name: "泰宁县",
                code: "350429"
            }, {
                name: "建宁县",
                code: "350430"
            }, {
                name: "永安市",
                code: "350481"
            }]
        }, {
            name: "泉州市",
            code: "350500",
            sub: [{
                name: "市辖区",
                code: "350501"
            }, {
                name: "鲤城区",
                code: "350502"
            }, {
                name: "丰泽区",
                code: "350503"
            }, {
                name: "洛江区",
                code: "350504"
            }, {
                name: "泉港区",
                code: "350505"
            }, {
                name: "惠安县",
                code: "350521"
            }, {
                name: "安溪县",
                code: "350524"
            }, {
                name: "永春县",
                code: "350525"
            }, {
                name: "德化县",
                code: "350526"
            }, {
                name: "金门县",
                code: "350527"
            }, {
                name: "石狮市",
                code: "350581"
            }, {
                name: "晋江市",
                code: "350582"
            }, {
                name: "南安市",
                code: "350583"
            }]
        }, {
            name: "漳州市",
            code: "350600",
            sub: [{
                name: "市辖区",
                code: "350601"
            }, {
                name: "芗城区",
                code: "350602"
            }, {
                name: "龙文区",
                code: "350603"
            }, {
                name: "云霄县",
                code: "350622"
            }, {
                name: "漳浦县",
                code: "350623"
            }, {
                name: "诏安县",
                code: "350624"
            }, {
                name: "长泰县",
                code: "350625"
            }, {
                name: "东山县",
                code: "350626"
            }, {
                name: "南靖县",
                code: "350627"
            }, {
                name: "平和县",
                code: "350628"
            }, {
                name: "华安县",
                code: "350629"
            }, {
                name: "龙海市",
                code: "350681"
            }]
        }, {
            name: "南平市",
            code: "350700",
            sub: [{
                name: "市辖区",
                code: "350701"
            }, {
                name: "延平区",
                code: "350702"
            }, {
                name: "建阳区",
                code: "350703"
            }, {
                name: "顺昌县",
                code: "350721"
            }, {
                name: "浦城县",
                code: "350722"
            }, {
                name: "光泽县",
                code: "350723"
            }, {
                name: "松溪县",
                code: "350724"
            }, {
                name: "政和县",
                code: "350725"
            }, {
                name: "邵武市",
                code: "350781"
            }, {
                name: "武夷山市",
                code: "350782"
            }, {
                name: "建瓯市",
                code: "350783"
            }]
        }, {
            name: "龙岩市",
            code: "350800",
            sub: [{
                name: "市辖区",
                code: "350801"
            }, {
                name: "新罗区",
                code: "350802"
            }, {
                name: "永定区",
                code: "350803"
            }, {
                name: "长汀县",
                code: "350821"
            }, {
                name: "上杭县",
                code: "350823"
            }, {
                name: "武平县",
                code: "350824"
            }, {
                name: "连城县",
                code: "350825"
            }, {
                name: "漳平市",
                code: "350881"
            }]
        }, {
            name: "宁德市",
            code: "350900",
            sub: [{
                name: "市辖区",
                code: "350901"
            }, {
                name: "蕉城区",
                code: "350902"
            }, {
                name: "霞浦县",
                code: "350921"
            }, {
                name: "古田县",
                code: "350922"
            }, {
                name: "屏南县",
                code: "350923"
            }, {
                name: "寿宁县",
                code: "350924"
            }, {
                name: "周宁县",
                code: "350925"
            }, {
                name: "柘荣县",
                code: "350926"
            }, {
                name: "福安市",
                code: "350981"
            }, {
                name: "福鼎市",
                code: "350982"
            }]
        }]
    }, {
        name: "江西省",
        code: "360000",
        sub: [{
            name: "南昌市",
            code: "360100",
            sub: [{
                name: "市辖区",
                code: "360101"
            }, {
                name: "东湖区",
                code: "360102"
            }, {
                name: "西湖区",
                code: "360103"
            }, {
                name: "青云谱区",
                code: "360104"
            }, {
                name: "湾里区",
                code: "360105"
            }, {
                name: "青山湖区",
                code: "360111"
            }, {
                name: "南昌县",
                code: "360121"
            }, {
                name: "新建县",
                code: "360122"
            }, {
                name: "安义县",
                code: "360123"
            }, {
                name: "进贤县",
                code: "360124"
            }]
        }, {
            name: "景德镇市",
            code: "360200",
            sub: [{
                name: "市辖区",
                code: "360201"
            }, {
                name: "昌江区",
                code: "360202"
            }, {
                name: "珠山区",
                code: "360203"
            }, {
                name: "浮梁县",
                code: "360222"
            }, {
                name: "乐平市",
                code: "360281"
            }]
        }, {
            name: "萍乡市",
            code: "360300",
            sub: [{
                name: "市辖区",
                code: "360301"
            }, {
                name: "安源区",
                code: "360302"
            }, {
                name: "湘东区",
                code: "360313"
            }, {
                name: "莲花县",
                code: "360321"
            }, {
                name: "上栗县",
                code: "360322"
            }, {
                name: "芦溪县",
                code: "360323"
            }]
        }, {
            name: "九江市",
            code: "360400",
            sub: [{
                name: "市辖区",
                code: "360401"
            }, {
                name: "庐山区",
                code: "360402"
            }, {
                name: "浔阳区",
                code: "360403"
            }, {
                name: "九江县",
                code: "360421"
            }, {
                name: "武宁县",
                code: "360423"
            }, {
                name: "修水县",
                code: "360424"
            }, {
                name: "永修县",
                code: "360425"
            }, {
                name: "德安县",
                code: "360426"
            }, {
                name: "星子县",
                code: "360427"
            }, {
                name: "都昌县",
                code: "360428"
            }, {
                name: "湖口县",
                code: "360429"
            }, {
                name: "彭泽县",
                code: "360430"
            }, {
                name: "瑞昌市",
                code: "360481"
            }, {
                name: "共青城市",
                code: "360482"
            }]
        }, {
            name: "新余市",
            code: "360500",
            sub: [{
                name: "市辖区",
                code: "360501"
            }, {
                name: "渝水区",
                code: "360502"
            }, {
                name: "分宜县",
                code: "360521"
            }]
        }, {
            name: "鹰潭市",
            code: "360600",
            sub: [{
                name: "市辖区",
                code: "360601"
            }, {
                name: "月湖区",
                code: "360602"
            }, {
                name: "余江县",
                code: "360622"
            }, {
                name: "贵溪市",
                code: "360681"
            }]
        }, {
            name: "赣州市",
            code: "360700",
            sub: [{
                name: "市辖区",
                code: "360701"
            }, {
                name: "章贡区",
                code: "360702"
            }, {
                name: "南康区",
                code: "360703"
            }, {
                name: "赣县",
                code: "360721"
            }, {
                name: "信丰县",
                code: "360722"
            }, {
                name: "大余县",
                code: "360723"
            }, {
                name: "上犹县",
                code: "360724"
            }, {
                name: "崇义县",
                code: "360725"
            }, {
                name: "安远县",
                code: "360726"
            }, {
                name: "龙南县",
                code: "360727"
            }, {
                name: "定南县",
                code: "360728"
            }, {
                name: "全南县",
                code: "360729"
            }, {
                name: "宁都县",
                code: "360730"
            }, {
                name: "于都县",
                code: "360731"
            }, {
                name: "兴国县",
                code: "360732"
            }, {
                name: "会昌县",
                code: "360733"
            }, {
                name: "寻乌县",
                code: "360734"
            }, {
                name: "石城县",
                code: "360735"
            }, {
                name: "瑞金市",
                code: "360781"
            }]
        }, {
            name: "吉安市",
            code: "360800",
            sub: [{
                name: "市辖区",
                code: "360801"
            }, {
                name: "吉州区",
                code: "360802"
            }, {
                name: "青原区",
                code: "360803"
            }, {
                name: "吉安县",
                code: "360821"
            }, {
                name: "吉水县",
                code: "360822"
            }, {
                name: "峡江县",
                code: "360823"
            }, {
                name: "新干县",
                code: "360824"
            }, {
                name: "永丰县",
                code: "360825"
            }, {
                name: "泰和县",
                code: "360826"
            }, {
                name: "遂川县",
                code: "360827"
            }, {
                name: "万安县",
                code: "360828"
            }, {
                name: "安福县",
                code: "360829"
            }, {
                name: "永新县",
                code: "360830"
            }, {
                name: "井冈山市",
                code: "360881"
            }]
        }, {
            name: "宜春市",
            code: "360900",
            sub: [{
                name: "市辖区",
                code: "360901"
            }, {
                name: "袁州区",
                code: "360902"
            }, {
                name: "奉新县",
                code: "360921"
            }, {
                name: "万载县",
                code: "360922"
            }, {
                name: "上高县",
                code: "360923"
            }, {
                name: "宜丰县",
                code: "360924"
            }, {
                name: "靖安县",
                code: "360925"
            }, {
                name: "铜鼓县",
                code: "360926"
            }, {
                name: "丰城市",
                code: "360981"
            }, {
                name: "樟树市",
                code: "360982"
            }, {
                name: "高安市",
                code: "360983"
            }]
        }, {
            name: "抚州市",
            code: "361000",
            sub: [{
                name: "市辖区",
                code: "361001"
            }, {
                name: "临川区",
                code: "361002"
            }, {
                name: "南城县",
                code: "361021"
            }, {
                name: "黎川县",
                code: "361022"
            }, {
                name: "南丰县",
                code: "361023"
            }, {
                name: "崇仁县",
                code: "361024"
            }, {
                name: "乐安县",
                code: "361025"
            }, {
                name: "宜黄县",
                code: "361026"
            }, {
                name: "金溪县",
                code: "361027"
            }, {
                name: "资溪县",
                code: "361028"
            }, {
                name: "东乡县",
                code: "361029"
            }, {
                name: "广昌县",
                code: "361030"
            }]
        }, {
            name: "上饶市",
            code: "361100",
            sub: [{
                name: "市辖区",
                code: "361101"
            }, {
                name: "信州区",
                code: "361102"
            }, {
                name: "上饶县",
                code: "361121"
            }, {
                name: "广丰县",
                code: "361122"
            }, {
                name: "玉山县",
                code: "361123"
            }, {
                name: "铅山县",
                code: "361124"
            }, {
                name: "横峰县",
                code: "361125"
            }, {
                name: "弋阳县",
                code: "361126"
            }, {
                name: "余干县",
                code: "361127"
            }, {
                name: "鄱阳县",
                code: "361128"
            }, {
                name: "万年县",
                code: "361129"
            }, {
                name: "婺源县",
                code: "361130"
            }, {
                name: "德兴市",
                code: "361181"
            }]
        }]
    }, {
        name: "山东省",
        code: "370000",
        sub: [{
            name: "济南市",
            code: "370100",
            sub: [{
                name: "市辖区",
                code: "370101"
            }, {
                name: "历下区",
                code: "370102"
            }, {
                name: "市中区",
                code: "370103"
            }, {
                name: "槐荫区",
                code: "370104"
            }, {
                name: "天桥区",
                code: "370105"
            }, {
                name: "历城区",
                code: "370112"
            }, {
                name: "长清区",
                code: "370113"
            }, {
                name: "平阴县",
                code: "370124"
            }, {
                name: "济阳县",
                code: "370125"
            }, {
                name: "商河县",
                code: "370126"
            }, {
                name: "章丘市",
                code: "370181"
            }]
        }, {
            name: "青岛市",
            code: "370200",
            sub: [{
                name: "市辖区",
                code: "370201"
            }, {
                name: "市南区",
                code: "370202"
            }, {
                name: "市北区",
                code: "370203"
            }, {
                name: "黄岛区",
                code: "370211"
            }, {
                name: "崂山区",
                code: "370212"
            }, {
                name: "李沧区",
                code: "370213"
            }, {
                name: "城阳区",
                code: "370214"
            }, {
                name: "胶州市",
                code: "370281"
            }, {
                name: "即墨市",
                code: "370282"
            }, {
                name: "平度市",
                code: "370283"
            }, {
                name: "莱西市",
                code: "370285"
            }]
        }, {
            name: "淄博市",
            code: "370300",
            sub: [{
                name: "市辖区",
                code: "370301"
            }, {
                name: "淄川区",
                code: "370302"
            }, {
                name: "张店区",
                code: "370303"
            }, {
                name: "博山区",
                code: "370304"
            }, {
                name: "临淄区",
                code: "370305"
            }, {
                name: "周村区",
                code: "370306"
            }, {
                name: "桓台县",
                code: "370321"
            }, {
                name: "高青县",
                code: "370322"
            }, {
                name: "沂源县",
                code: "370323"
            }]
        }, {
            name: "枣庄市",
            code: "370400",
            sub: [{
                name: "市辖区",
                code: "370401"
            }, {
                name: "市中区",
                code: "370402"
            }, {
                name: "薛城区",
                code: "370403"
            }, {
                name: "峄城区",
                code: "370404"
            }, {
                name: "台儿庄区",
                code: "370405"
            }, {
                name: "山亭区",
                code: "370406"
            }, {
                name: "滕州市",
                code: "370481"
            }]
        }, {
            name: "东营市",
            code: "370500",
            sub: [{
                name: "市辖区",
                code: "370501"
            }, {
                name: "东营区",
                code: "370502"
            }, {
                name: "河口区",
                code: "370503"
            }, {
                name: "垦利县",
                code: "370521"
            }, {
                name: "利津县",
                code: "370522"
            }, {
                name: "广饶县",
                code: "370523"
            }]
        }, {
            name: "烟台市",
            code: "370600",
            sub: [{
                name: "市辖区",
                code: "370601"
            }, {
                name: "芝罘区",
                code: "370602"
            }, {
                name: "福山区",
                code: "370611"
            }, {
                name: "牟平区",
                code: "370612"
            }, {
                name: "莱山区",
                code: "370613"
            }, {
                name: "长岛县",
                code: "370634"
            }, {
                name: "龙口市",
                code: "370681"
            }, {
                name: "莱阳市",
                code: "370682"
            }, {
                name: "莱州市",
                code: "370683"
            }, {
                name: "蓬莱市",
                code: "370684"
            }, {
                name: "招远市",
                code: "370685"
            }, {
                name: "栖霞市",
                code: "370686"
            }, {
                name: "海阳市",
                code: "370687"
            }]
        }, {
            name: "潍坊市",
            code: "370700",
            sub: [{
                name: "市辖区",
                code: "370701"
            }, {
                name: "潍城区",
                code: "370702"
            }, {
                name: "寒亭区",
                code: "370703"
            }, {
                name: "坊子区",
                code: "370704"
            }, {
                name: "奎文区",
                code: "370705"
            }, {
                name: "临朐县",
                code: "370724"
            }, {
                name: "昌乐县",
                code: "370725"
            }, {
                name: "青州市",
                code: "370781"
            }, {
                name: "诸城市",
                code: "370782"
            }, {
                name: "寿光市",
                code: "370783"
            }, {
                name: "安丘市",
                code: "370784"
            }, {
                name: "高密市",
                code: "370785"
            }, {
                name: "昌邑市",
                code: "370786"
            }]
        }, {
            name: "济宁市",
            code: "370800",
            sub: [{
                name: "市辖区",
                code: "370801"
            }, {
                name: "任城区",
                code: "370811"
            }, {
                name: "兖州区",
                code: "370812"
            }, {
                name: "微山县",
                code: "370826"
            }, {
                name: "鱼台县",
                code: "370827"
            }, {
                name: "金乡县",
                code: "370828"
            }, {
                name: "嘉祥县",
                code: "370829"
            }, {
                name: "汶上县",
                code: "370830"
            }, {
                name: "泗水县",
                code: "370831"
            }, {
                name: "梁山县",
                code: "370832"
            }, {
                name: "曲阜市",
                code: "370881"
            }, {
                name: "邹城市",
                code: "370883"
            }]
        }, {
            name: "泰安市",
            code: "370900",
            sub: [{
                name: "市辖区",
                code: "370901"
            }, {
                name: "泰山区",
                code: "370902"
            }, {
                name: "岱岳区",
                code: "370911"
            }, {
                name: "宁阳县",
                code: "370921"
            }, {
                name: "东平县",
                code: "370923"
            }, {
                name: "新泰市",
                code: "370982"
            }, {
                name: "肥城市",
                code: "370983"
            }]
        }, {
            name: "威海市",
            code: "371000",
            sub: [{
                name: "市辖区",
                code: "371001"
            }, {
                name: "环翠区",
                code: "371002"
            }, {
                name: "文登市",
                code: "371081"
            }, {
                name: "荣成市",
                code: "371082"
            }, {
                name: "乳山市",
                code: "371083"
            }]
        }, {
            name: "日照市",
            code: "371100",
            sub: [{
                name: "市辖区",
                code: "371101"
            }, {
                name: "东港区",
                code: "371102"
            }, {
                name: "岚山区",
                code: "371103"
            }, {
                name: "五莲县",
                code: "371121"
            }, {
                name: "莒县",
                code: "371122"
            }]
        }, {
            name: "莱芜市",
            code: "371200",
            sub: [{
                name: "市辖区",
                code: "371201"
            }, {
                name: "莱城区",
                code: "371202"
            }, {
                name: "钢城区",
                code: "371203"
            }]
        }, {
            name: "临沂市",
            code: "371300",
            sub: [{
                name: "市辖区",
                code: "371301"
            }, {
                name: "兰山区",
                code: "371302"
            }, {
                name: "罗庄区",
                code: "371311"
            }, {
                name: "河东区",
                code: "371312"
            }, {
                name: "沂南县",
                code: "371321"
            }, {
                name: "郯城县",
                code: "371322"
            }, {
                name: "沂水县",
                code: "371323"
            }, {
                name: "兰陵县",
                code: "371324"
            }, {
                name: "费县",
                code: "371325"
            }, {
                name: "平邑县",
                code: "371326"
            }, {
                name: "莒南县",
                code: "371327"
            }, {
                name: "蒙阴县",
                code: "371328"
            }, {
                name: "临沭县",
                code: "371329"
            }]
        }, {
            name: "德州市",
            code: "371400",
            sub: [{
                name: "市辖区",
                code: "371401"
            }, {
                name: "德城区",
                code: "371402"
            }, {
                name: "陵城区",
                code: "371403"
            }, {
                name: "宁津县",
                code: "371422"
            }, {
                name: "庆云县",
                code: "371423"
            }, {
                name: "临邑县",
                code: "371424"
            }, {
                name: "齐河县",
                code: "371425"
            }, {
                name: "平原县",
                code: "371426"
            }, {
                name: "夏津县",
                code: "371427"
            }, {
                name: "武城县",
                code: "371428"
            }, {
                name: "乐陵市",
                code: "371481"
            }, {
                name: "禹城市",
                code: "371482"
            }]
        }, {
            name: "聊城市",
            code: "371500",
            sub: [{
                name: "市辖区",
                code: "371501"
            }, {
                name: "东昌府区",
                code: "371502"
            }, {
                name: "阳谷县",
                code: "371521"
            }, {
                name: "莘县",
                code: "371522"
            }, {
                name: "茌平县",
                code: "371523"
            }, {
                name: "东阿县",
                code: "371524"
            }, {
                name: "冠县",
                code: "371525"
            }, {
                name: "高唐县",
                code: "371526"
            }, {
                name: "临清市",
                code: "371581"
            }]
        }, {
            name: "滨州市",
            code: "371600",
            sub: [{
                name: "市辖区",
                code: "371601"
            }, {
                name: "滨城区",
                code: "371602"
            }, {
                name: "沾化区",
                code: "371603"
            }, {
                name: "惠民县",
                code: "371621"
            }, {
                name: "阳信县",
                code: "371622"
            }, {
                name: "无棣县",
                code: "371623"
            }, {
                name: "博兴县",
                code: "371625"
            }, {
                name: "邹平县",
                code: "371626"
            }]
        }, {
            name: "菏泽市",
            code: "371700",
            sub: [{
                name: "市辖区",
                code: "371701"
            }, {
                name: "牡丹区",
                code: "371702"
            }, {
                name: "曹县",
                code: "371721"
            }, {
                name: "单县",
                code: "371722"
            }, {
                name: "成武县",
                code: "371723"
            }, {
                name: "巨野县",
                code: "371724"
            }, {
                name: "郓城县",
                code: "371725"
            }, {
                name: "鄄城县",
                code: "371726"
            }, {
                name: "定陶县",
                code: "371727"
            }, {
                name: "东明县",
                code: "371728"
            }]
        }]
    }, {
        name: "河南省",
        code: "410000",
        sub: [{
            name: "郑州市",
            code: "410100",
            sub: [{
                name: "市辖区",
                code: "410101"
            }, {
                name: "中原区",
                code: "410102"
            }, {
                name: "二七区",
                code: "410103"
            }, {
                name: "管城回族区",
                code: "410104"
            }, {
                name: "金水区",
                code: "410105"
            }, {
                name: "上街区",
                code: "410106"
            }, {
                name: "惠济区",
                code: "410108"
            }, {
                name: "中牟县",
                code: "410122"
            }, {
                name: "巩义市",
                code: "410181"
            }, {
                name: "荥阳市",
                code: "410182"
            }, {
                name: "新密市",
                code: "410183"
            }, {
                name: "新郑市",
                code: "410184"
            }, {
                name: "登封市",
                code: "410185"
            }]
        }, {
            name: "开封市",
            code: "410200",
            sub: [{
                name: "市辖区",
                code: "410201"
            }, {
                name: "龙亭区",
                code: "410202"
            }, {
                name: "顺河回族区",
                code: "410203"
            }, {
                name: "鼓楼区",
                code: "410204"
            }, {
                name: "禹王台区",
                code: "410205"
            }, {
                name: "祥符区",
                code: "410212"
            }, {
                name: "杞县",
                code: "410221"
            }, {
                name: "通许县",
                code: "410222"
            }, {
                name: "尉氏县",
                code: "410223"
            }, {
                name: "兰考县",
                code: "410225"
            }]
        }, {
            name: "洛阳市",
            code: "410300",
            sub: [{
                name: "市辖区",
                code: "410301"
            }, {
                name: "老城区",
                code: "410302"
            }, {
                name: "西工区",
                code: "410303"
            }, {
                name: "瀍河回族区",
                code: "410304"
            }, {
                name: "涧西区",
                code: "410305"
            }, {
                name: "吉利区",
                code: "410306"
            }, {
                name: "洛龙区",
                code: "410311"
            }, {
                name: "孟津县",
                code: "410322"
            }, {
                name: "新安县",
                code: "410323"
            }, {
                name: "栾川县",
                code: "410324"
            }, {
                name: "嵩县",
                code: "410325"
            }, {
                name: "汝阳县",
                code: "410326"
            }, {
                name: "宜阳县",
                code: "410327"
            }, {
                name: "洛宁县",
                code: "410328"
            }, {
                name: "伊川县",
                code: "410329"
            }, {
                name: "偃师市",
                code: "410381"
            }]
        }, {
            name: "平顶山市",
            code: "410400",
            sub: [{
                name: "市辖区",
                code: "410401"
            }, {
                name: "新华区",
                code: "410402"
            }, {
                name: "卫东区",
                code: "410403"
            }, {
                name: "石龙区",
                code: "410404"
            }, {
                name: "湛河区",
                code: "410411"
            }, {
                name: "宝丰县",
                code: "410421"
            }, {
                name: "叶县",
                code: "410422"
            }, {
                name: "鲁山县",
                code: "410423"
            }, {
                name: "郏县",
                code: "410425"
            }, {
                name: "舞钢市",
                code: "410481"
            }, {
                name: "汝州市",
                code: "410482"
            }]
        }, {
            name: "安阳市",
            code: "410500",
            sub: [{
                name: "市辖区",
                code: "410501"
            }, {
                name: "文峰区",
                code: "410502"
            }, {
                name: "北关区",
                code: "410503"
            }, {
                name: "殷都区",
                code: "410505"
            }, {
                name: "龙安区",
                code: "410506"
            }, {
                name: "安阳县",
                code: "410522"
            }, {
                name: "汤阴县",
                code: "410523"
            }, {
                name: "滑县",
                code: "410526"
            }, {
                name: "内黄县",
                code: "410527"
            }, {
                name: "林州市",
                code: "410581"
            }]
        }, {
            name: "鹤壁市",
            code: "410600",
            sub: [{
                name: "市辖区",
                code: "410601"
            }, {
                name: "鹤山区",
                code: "410602"
            }, {
                name: "山城区",
                code: "410603"
            }, {
                name: "淇滨区",
                code: "410611"
            }, {
                name: "浚县",
                code: "410621"
            }, {
                name: "淇县",
                code: "410622"
            }]
        }, {
            name: "新乡市",
            code: "410700",
            sub: [{
                name: "市辖区",
                code: "410701"
            }, {
                name: "红旗区",
                code: "410702"
            }, {
                name: "卫滨区",
                code: "410703"
            }, {
                name: "凤泉区",
                code: "410704"
            }, {
                name: "牧野区",
                code: "410711"
            }, {
                name: "新乡县",
                code: "410721"
            }, {
                name: "获嘉县",
                code: "410724"
            }, {
                name: "原阳县",
                code: "410725"
            }, {
                name: "延津县",
                code: "410726"
            }, {
                name: "封丘县",
                code: "410727"
            }, {
                name: "长垣县",
                code: "410728"
            }, {
                name: "卫辉市",
                code: "410781"
            }, {
                name: "辉县市",
                code: "410782"
            }]
        }, {
            name: "焦作市",
            code: "410800",
            sub: [{
                name: "市辖区",
                code: "410801"
            }, {
                name: "解放区",
                code: "410802"
            }, {
                name: "中站区",
                code: "410803"
            }, {
                name: "马村区",
                code: "410804"
            }, {
                name: "山阳区",
                code: "410811"
            }, {
                name: "修武县",
                code: "410821"
            }, {
                name: "博爱县",
                code: "410822"
            }, {
                name: "武陟县",
                code: "410823"
            }, {
                name: "温县",
                code: "410825"
            }, {
                name: "沁阳市",
                code: "410882"
            }, {
                name: "孟州市",
                code: "410883"
            }]
        }, {
            name: "濮阳市",
            code: "410900",
            sub: [{
                name: "市辖区",
                code: "410901"
            }, {
                name: "华龙区",
                code: "410902"
            }, {
                name: "清丰县",
                code: "410922"
            }, {
                name: "南乐县",
                code: "410923"
            }, {
                name: "范县",
                code: "410926"
            }, {
                name: "台前县",
                code: "410927"
            }, {
                name: "濮阳县",
                code: "410928"
            }]
        }, {
            name: "许昌市",
            code: "411000",
            sub: [{
                name: "市辖区",
                code: "411001"
            }, {
                name: "魏都区",
                code: "411002"
            }, {
                name: "许昌县",
                code: "411023"
            }, {
                name: "鄢陵县",
                code: "411024"
            }, {
                name: "襄城县",
                code: "411025"
            }, {
                name: "禹州市",
                code: "411081"
            }, {
                name: "长葛市",
                code: "411082"
            }]
        }, {
            name: "漯河市",
            code: "411100",
            sub: [{
                name: "市辖区",
                code: "411101"
            }, {
                name: "源汇区",
                code: "411102"
            }, {
                name: "郾城区",
                code: "411103"
            }, {
                name: "召陵区",
                code: "411104"
            }, {
                name: "舞阳县",
                code: "411121"
            }, {
                name: "临颍县",
                code: "411122"
            }]
        }, {
            name: "三门峡市",
            code: "411200",
            sub: [{
                name: "市辖区",
                code: "411201"
            }, {
                name: "湖滨区",
                code: "411202"
            }, {
                name: "渑池县",
                code: "411221"
            }, {
                name: "陕县",
                code: "411222"
            }, {
                name: "卢氏县",
                code: "411224"
            }, {
                name: "义马市",
                code: "411281"
            }, {
                name: "灵宝市",
                code: "411282"
            }]
        }, {
            name: "南阳市",
            code: "411300",
            sub: [{
                name: "市辖区",
                code: "411301"
            }, {
                name: "宛城区",
                code: "411302"
            }, {
                name: "卧龙区",
                code: "411303"
            }, {
                name: "南召县",
                code: "411321"
            }, {
                name: "方城县",
                code: "411322"
            }, {
                name: "西峡县",
                code: "411323"
            }, {
                name: "镇平县",
                code: "411324"
            }, {
                name: "内乡县",
                code: "411325"
            }, {
                name: "淅川县",
                code: "411326"
            }, {
                name: "社旗县",
                code: "411327"
            }, {
                name: "唐河县",
                code: "411328"
            }, {
                name: "新野县",
                code: "411329"
            }, {
                name: "桐柏县",
                code: "411330"
            }, {
                name: "邓州市",
                code: "411381"
            }]
        }, {
            name: "商丘市",
            code: "411400",
            sub: [{
                name: "市辖区",
                code: "411401"
            }, {
                name: "梁园区",
                code: "411402"
            }, {
                name: "睢阳区",
                code: "411403"
            }, {
                name: "民权县",
                code: "411421"
            }, {
                name: "睢县",
                code: "411422"
            }, {
                name: "宁陵县",
                code: "411423"
            }, {
                name: "柘城县",
                code: "411424"
            }, {
                name: "虞城县",
                code: "411425"
            }, {
                name: "夏邑县",
                code: "411426"
            }, {
                name: "永城市",
                code: "411481"
            }]
        }, {
            name: "信阳市",
            code: "411500",
            sub: [{
                name: "市辖区",
                code: "411501"
            }, {
                name: "浉河区",
                code: "411502"
            }, {
                name: "平桥区",
                code: "411503"
            }, {
                name: "罗山县",
                code: "411521"
            }, {
                name: "光山县",
                code: "411522"
            }, {
                name: "新县",
                code: "411523"
            }, {
                name: "商城县",
                code: "411524"
            }, {
                name: "固始县",
                code: "411525"
            }, {
                name: "潢川县",
                code: "411526"
            }, {
                name: "淮滨县",
                code: "411527"
            }, {
                name: "息县",
                code: "411528"
            }]
        }, {
            name: "周口市",
            code: "411600",
            sub: [{
                name: "市辖区",
                code: "411601"
            }, {
                name: "川汇区",
                code: "411602"
            }, {
                name: "扶沟县",
                code: "411621"
            }, {
                name: "西华县",
                code: "411622"
            }, {
                name: "商水县",
                code: "411623"
            }, {
                name: "沈丘县",
                code: "411624"
            }, {
                name: "郸城县",
                code: "411625"
            }, {
                name: "淮阳县",
                code: "411626"
            }, {
                name: "太康县",
                code: "411627"
            }, {
                name: "鹿邑县",
                code: "411628"
            }, {
                name: "项城市",
                code: "411681"
            }]
        }, {
            name: "驻马店市",
            code: "411700",
            sub: [{
                name: "市辖区",
                code: "411701"
            }, {
                name: "驿城区",
                code: "411702"
            }, {
                name: "西平县",
                code: "411721"
            }, {
                name: "上蔡县",
                code: "411722"
            }, {
                name: "平舆县",
                code: "411723"
            }, {
                name: "正阳县",
                code: "411724"
            }, {
                name: "确山县",
                code: "411725"
            }, {
                name: "泌阳县",
                code: "411726"
            }, {
                name: "汝南县",
                code: "411727"
            }, {
                name: "遂平县",
                code: "411728"
            }, {
                name: "新蔡县",
                code: "411729"
            }]
        }, {
            name: "济源市",
            code: "419001"
        }]
    }, {
        name: "湖北省",
        code: "420000",
        sub: [{
            name: "武汉市",
            code: "420100",
            sub: [{
                name: "市辖区",
                code: "420101"
            }, {
                name: "江岸区",
                code: "420102"
            }, {
                name: "江汉区",
                code: "420103"
            }, {
                name: "硚口区",
                code: "420104"
            }, {
                name: "汉阳区",
                code: "420105"
            }, {
                name: "武昌区",
                code: "420106"
            }, {
                name: "青山区",
                code: "420107"
            }, {
                name: "洪山区",
                code: "420111"
            }, {
                name: "东西湖区",
                code: "420112"
            }, {
                name: "汉南区",
                code: "420113"
            }, {
                name: "蔡甸区",
                code: "420114"
            }, {
                name: "江夏区",
                code: "420115"
            }, {
                name: "黄陂区",
                code: "420116"
            }, {
                name: "新洲区",
                code: "420117"
            }]
        }, {
            name: "黄石市",
            code: "420200",
            sub: [{
                name: "市辖区",
                code: "420201"
            }, {
                name: "黄石港区",
                code: "420202"
            }, {
                name: "西塞山区",
                code: "420203"
            }, {
                name: "下陆区",
                code: "420204"
            }, {
                name: "铁山区",
                code: "420205"
            }, {
                name: "阳新县",
                code: "420222"
            }, {
                name: "大冶市",
                code: "420281"
            }]
        }, {
            name: "十堰市",
            code: "420300",
            sub: [{
                name: "市辖区",
                code: "420301"
            }, {
                name: "茅箭区",
                code: "420302"
            }, {
                name: "张湾区",
                code: "420303"
            }, {
                name: "郧阳区",
                code: "420304"
            }, {
                name: "郧西县",
                code: "420322"
            }, {
                name: "竹山县",
                code: "420323"
            }, {
                name: "竹溪县",
                code: "420324"
            }, {
                name: "房县",
                code: "420325"
            }, {
                name: "丹江口市",
                code: "420381"
            }]
        }, {
            name: "宜昌市",
            code: "420500",
            sub: [{
                name: "市辖区",
                code: "420501"
            }, {
                name: "西陵区",
                code: "420502"
            }, {
                name: "伍家岗区",
                code: "420503"
            }, {
                name: "点军区",
                code: "420504"
            }, {
                name: "猇亭区",
                code: "420505"
            }, {
                name: "夷陵区",
                code: "420506"
            }, {
                name: "远安县",
                code: "420525"
            }, {
                name: "兴山县",
                code: "420526"
            }, {
                name: "秭归县",
                code: "420527"
            }, {
                name: "长阳土家族自治县",
                code: "420528"
            }, {
                name: "五峰土家族自治县",
                code: "420529"
            }, {
                name: "宜都市",
                code: "420581"
            }, {
                name: "当阳市",
                code: "420582"
            }, {
                name: "枝江市",
                code: "420583"
            }]
        }, {
            name: "襄阳市",
            code: "420600",
            sub: [{
                name: "市辖区",
                code: "420601"
            }, {
                name: "襄城区",
                code: "420602"
            }, {
                name: "樊城区",
                code: "420606"
            }, {
                name: "襄州区",
                code: "420607"
            }, {
                name: "南漳县",
                code: "420624"
            }, {
                name: "谷城县",
                code: "420625"
            }, {
                name: "保康县",
                code: "420626"
            }, {
                name: "老河口市",
                code: "420682"
            }, {
                name: "枣阳市",
                code: "420683"
            }, {
                name: "宜城市",
                code: "420684"
            }]
        }, {
            name: "鄂州市",
            code: "420700",
            sub: [{
                name: "市辖区",
                code: "420701"
            }, {
                name: "梁子湖区",
                code: "420702"
            }, {
                name: "华容区",
                code: "420703"
            }, {
                name: "鄂城区",
                code: "420704"
            }]
        }, {
            name: "荆门市",
            code: "420800",
            sub: [{
                name: "市辖区",
                code: "420801"
            }, {
                name: "东宝区",
                code: "420802"
            }, {
                name: "掇刀区",
                code: "420804"
            }, {
                name: "京山县",
                code: "420821"
            }, {
                name: "沙洋县",
                code: "420822"
            }, {
                name: "钟祥市",
                code: "420881"
            }]
        }, {
            name: "孝感市",
            code: "420900",
            sub: [{
                name: "市辖区",
                code: "420901"
            }, {
                name: "孝南区",
                code: "420902"
            }, {
                name: "孝昌县",
                code: "420921"
            }, {
                name: "大悟县",
                code: "420922"
            }, {
                name: "云梦县",
                code: "420923"
            }, {
                name: "应城市",
                code: "420981"
            }, {
                name: "安陆市",
                code: "420982"
            }, {
                name: "汉川市",
                code: "420984"
            }]
        }, {
            name: "荆州市",
            code: "421000",
            sub: [{
                name: "市辖区",
                code: "421001"
            }, {
                name: "沙市区",
                code: "421002"
            }, {
                name: "荆州区",
                code: "421003"
            }, {
                name: "公安县",
                code: "421022"
            }, {
                name: "监利县",
                code: "421023"
            }, {
                name: "江陵县",
                code: "421024"
            }, {
                name: "石首市",
                code: "421081"
            }, {
                name: "洪湖市",
                code: "421083"
            }, {
                name: "松滋市",
                code: "421087"
            }]
        }, {
            name: "黄冈市",
            code: "421100",
            sub: [{
                name: "市辖区",
                code: "421101"
            }, {
                name: "黄州区",
                code: "421102"
            }, {
                name: "团风县",
                code: "421121"
            }, {
                name: "红安县",
                code: "421122"
            }, {
                name: "罗田县",
                code: "421123"
            }, {
                name: "英山县",
                code: "421124"
            }, {
                name: "浠水县",
                code: "421125"
            }, {
                name: "蕲春县",
                code: "421126"
            }, {
                name: "黄梅县",
                code: "421127"
            }, {
                name: "麻城市",
                code: "421181"
            }, {
                name: "武穴市",
                code: "421182"
            }]
        }, {
            name: "咸宁市",
            code: "421200",
            sub: [{
                name: "市辖区",
                code: "421201"
            }, {
                name: "咸安区",
                code: "421202"
            }, {
                name: "嘉鱼县",
                code: "421221"
            }, {
                name: "通城县",
                code: "421222"
            }, {
                name: "崇阳县",
                code: "421223"
            }, {
                name: "通山县",
                code: "421224"
            }, {
                name: "赤壁市",
                code: "421281"
            }]
        }, {
            name: "随州市",
            code: "421300",
            sub: [{
                name: "市辖区",
                code: "421301"
            }, {
                name: "曾都区",
                code: "421303"
            }, {
                name: "随县",
                code: "421321"
            }, {
                name: "广水市",
                code: "421381"
            }]
        }, {
            name: "恩施土家族苗族自治州",
            code: "422800",
            sub: [{
                name: "恩施市",
                code: "422801"
            }, {
                name: "利川市",
                code: "422802"
            }, {
                name: "建始县",
                code: "422822"
            }, {
                name: "巴东县",
                code: "422823"
            }, {
                name: "宣恩县",
                code: "422825"
            }, {
                name: "咸丰县",
                code: "422826"
            }, {
                name: "来凤县",
                code: "422827"
            }, {
                name: "鹤峰县",
                code: "422828"
            }]
        }, {
            name: "仙桃市",
            code: "429004"
        }, {
            name: "潜江市",
            code: "429005"
        }, {
            name: "天门市",
            code: "429006"
        }, {
            name: "神农架林区",
            code: "429021"
        }]
    }, {
        name: "湖南省",
        code: "430000",
        sub: [{
            name: "长沙市",
            code: "430100",
            sub: [{
                name: "市辖区",
                code: "430101"
            }, {
                name: "芙蓉区",
                code: "430102"
            }, {
                name: "天心区",
                code: "430103"
            }, {
                name: "岳麓区",
                code: "430104"
            }, {
                name: "开福区",
                code: "430105"
            }, {
                name: "雨花区",
                code: "430111"
            }, {
                name: "望城区",
                code: "430112"
            }, {
                name: "长沙县",
                code: "430121"
            }, {
                name: "宁乡县",
                code: "430124"
            }, {
                name: "浏阳市",
                code: "430181"
            }]
        }, {
            name: "株洲市",
            code: "430200",
            sub: [{
                name: "市辖区",
                code: "430201"
            }, {
                name: "荷塘区",
                code: "430202"
            }, {
                name: "芦淞区",
                code: "430203"
            }, {
                name: "石峰区",
                code: "430204"
            }, {
                name: "天元区",
                code: "430211"
            }, {
                name: "株洲县",
                code: "430221"
            }, {
                name: "攸县",
                code: "430223"
            }, {
                name: "茶陵县",
                code: "430224"
            }, {
                name: "炎陵县",
                code: "430225"
            }, {
                name: "醴陵市",
                code: "430281"
            }]
        }, {
            name: "湘潭市",
            code: "430300",
            sub: [{
                name: "市辖区",
                code: "430301"
            }, {
                name: "雨湖区",
                code: "430302"
            }, {
                name: "岳塘区",
                code: "430304"
            }, {
                name: "湘潭县",
                code: "430321"
            }, {
                name: "湘乡市",
                code: "430381"
            }, {
                name: "韶山市",
                code: "430382"
            }]
        }, {
            name: "衡阳市",
            code: "430400",
            sub: [{
                name: "市辖区",
                code: "430401"
            }, {
                name: "珠晖区",
                code: "430405"
            }, {
                name: "雁峰区",
                code: "430406"
            }, {
                name: "石鼓区",
                code: "430407"
            }, {
                name: "蒸湘区",
                code: "430408"
            }, {
                name: "南岳区",
                code: "430412"
            }, {
                name: "衡阳县",
                code: "430421"
            }, {
                name: "衡南县",
                code: "430422"
            }, {
                name: "衡山县",
                code: "430423"
            }, {
                name: "衡东县",
                code: "430424"
            }, {
                name: "祁东县",
                code: "430426"
            }, {
                name: "耒阳市",
                code: "430481"
            }, {
                name: "常宁市",
                code: "430482"
            }]
        }, {
            name: "邵阳市",
            code: "430500",
            sub: [{
                name: "市辖区",
                code: "430501"
            }, {
                name: "双清区",
                code: "430502"
            }, {
                name: "大祥区",
                code: "430503"
            }, {
                name: "北塔区",
                code: "430511"
            }, {
                name: "邵东县",
                code: "430521"
            }, {
                name: "新邵县",
                code: "430522"
            }, {
                name: "邵阳县",
                code: "430523"
            }, {
                name: "隆回县",
                code: "430524"
            }, {
                name: "洞口县",
                code: "430525"
            }, {
                name: "绥宁县",
                code: "430527"
            }, {
                name: "新宁县",
                code: "430528"
            }, {
                name: "城步苗族自治县",
                code: "430529"
            }, {
                name: "武冈市",
                code: "430581"
            }]
        }, {
            name: "岳阳市",
            code: "430600",
            sub: [{
                name: "市辖区",
                code: "430601"
            }, {
                name: "岳阳楼区",
                code: "430602"
            }, {
                name: "云溪区",
                code: "430603"
            }, {
                name: "君山区",
                code: "430611"
            }, {
                name: "岳阳县",
                code: "430621"
            }, {
                name: "华容县",
                code: "430623"
            }, {
                name: "湘阴县",
                code: "430624"
            }, {
                name: "平江县",
                code: "430626"
            }, {
                name: "汨罗市",
                code: "430681"
            }, {
                name: "临湘市",
                code: "430682"
            }]
        }, {
            name: "常德市",
            code: "430700",
            sub: [{
                name: "市辖区",
                code: "430701"
            }, {
                name: "武陵区",
                code: "430702"
            }, {
                name: "鼎城区",
                code: "430703"
            }, {
                name: "安乡县",
                code: "430721"
            }, {
                name: "汉寿县",
                code: "430722"
            }, {
                name: "澧县",
                code: "430723"
            }, {
                name: "临澧县",
                code: "430724"
            }, {
                name: "桃源县",
                code: "430725"
            }, {
                name: "石门县",
                code: "430726"
            }, {
                name: "津市市",
                code: "430781"
            }]
        }, {
            name: "张家界市",
            code: "430800",
            sub: [{
                name: "市辖区",
                code: "430801"
            }, {
                name: "永定区",
                code: "430802"
            }, {
                name: "武陵源区",
                code: "430811"
            }, {
                name: "慈利县",
                code: "430821"
            }, {
                name: "桑植县",
                code: "430822"
            }]
        }, {
            name: "益阳市",
            code: "430900",
            sub: [{
                name: "市辖区",
                code: "430901"
            }, {
                name: "资阳区",
                code: "430902"
            }, {
                name: "赫山区",
                code: "430903"
            }, {
                name: "南县",
                code: "430921"
            }, {
                name: "桃江县",
                code: "430922"
            }, {
                name: "安化县",
                code: "430923"
            }, {
                name: "沅江市",
                code: "430981"
            }]
        }, {
            name: "郴州市",
            code: "431000",
            sub: [{
                name: "市辖区",
                code: "431001"
            }, {
                name: "北湖区",
                code: "431002"
            }, {
                name: "苏仙区",
                code: "431003"
            }, {
                name: "桂阳县",
                code: "431021"
            }, {
                name: "宜章县",
                code: "431022"
            }, {
                name: "永兴县",
                code: "431023"
            }, {
                name: "嘉禾县",
                code: "431024"
            }, {
                name: "临武县",
                code: "431025"
            }, {
                name: "汝城县",
                code: "431026"
            }, {
                name: "桂东县",
                code: "431027"
            }, {
                name: "安仁县",
                code: "431028"
            }, {
                name: "资兴市",
                code: "431081"
            }]
        }, {
            name: "永州市",
            code: "431100",
            sub: [{
                name: "市辖区",
                code: "431101"
            }, {
                name: "零陵区",
                code: "431102"
            }, {
                name: "冷水滩区",
                code: "431103"
            }, {
                name: "祁阳县",
                code: "431121"
            }, {
                name: "东安县",
                code: "431122"
            }, {
                name: "双牌县",
                code: "431123"
            }, {
                name: "道县",
                code: "431124"
            }, {
                name: "江永县",
                code: "431125"
            }, {
                name: "宁远县",
                code: "431126"
            }, {
                name: "蓝山县",
                code: "431127"
            }, {
                name: "新田县",
                code: "431128"
            }, {
                name: "江华瑶族自治县",
                code: "431129"
            }]
        }, {
            name: "怀化市",
            code: "431200",
            sub: [{
                name: "市辖区",
                code: "431201"
            }, {
                name: "鹤城区",
                code: "431202"
            }, {
                name: "中方县",
                code: "431221"
            }, {
                name: "沅陵县",
                code: "431222"
            }, {
                name: "辰溪县",
                code: "431223"
            }, {
                name: "溆浦县",
                code: "431224"
            }, {
                name: "会同县",
                code: "431225"
            }, {
                name: "麻阳苗族自治县",
                code: "431226"
            }, {
                name: "新晃侗族自治县",
                code: "431227"
            }, {
                name: "芷江侗族自治县",
                code: "431228"
            }, {
                name: "靖州苗族侗族自治县",
                code: "431229"
            }, {
                name: "通道侗族自治县",
                code: "431230"
            }, {
                name: "洪江市",
                code: "431281"
            }]
        }, {
            name: "娄底市",
            code: "431300",
            sub: [{
                name: "市辖区",
                code: "431301"
            }, {
                name: "娄星区",
                code: "431302"
            }, {
                name: "双峰县",
                code: "431321"
            }, {
                name: "新化县",
                code: "431322"
            }, {
                name: "冷水江市",
                code: "431381"
            }, {
                name: "涟源市",
                code: "431382"
            }]
        }, {
            name: "湘西土家族苗族自治州",
            code: "433100",
            sub: [{
                name: "吉首市",
                code: "433101"
            }, {
                name: "泸溪县",
                code: "433122"
            }, {
                name: "凤凰县",
                code: "433123"
            }, {
                name: "花垣县",
                code: "433124"
            }, {
                name: "保靖县",
                code: "433125"
            }, {
                name: "古丈县",
                code: "433126"
            }, {
                name: "永顺县",
                code: "433127"
            }, {
                name: "龙山县",
                code: "433130"
            }]
        }]
    }, {
        name: "广东省",
        code: "440000",
        sub: [{
            name: "广州市",
            code: "440100",
            sub: [{
                name: "市辖区",
                code: "440101"
            }, {
                name: "荔湾区",
                code: "440103"
            }, {
                name: "越秀区",
                code: "440104"
            }, {
                name: "海珠区",
                code: "440105"
            }, {
                name: "天河区",
                code: "440106"
            }, {
                name: "白云区",
                code: "440111"
            }, {
                name: "黄埔区",
                code: "440112"
            }, {
                name: "番禺区",
                code: "440113"
            }, {
                name: "花都区",
                code: "440114"
            }, {
                name: "南沙区",
                code: "440115"
            }, {
                name: "从化区",
                code: "440117"
            }, {
                name: "增城区",
                code: "440118"
            }]
        }, {
            name: "韶关市",
            code: "440200",
            sub: [{
                name: "市辖区",
                code: "440201"
            }, {
                name: "武江区",
                code: "440203"
            }, {
                name: "浈江区",
                code: "440204"
            }, {
                name: "曲江区",
                code: "440205"
            }, {
                name: "始兴县",
                code: "440222"
            }, {
                name: "仁化县",
                code: "440224"
            }, {
                name: "翁源县",
                code: "440229"
            }, {
                name: "乳源瑶族自治县",
                code: "440232"
            }, {
                name: "新丰县",
                code: "440233"
            }, {
                name: "乐昌市",
                code: "440281"
            }, {
                name: "南雄市",
                code: "440282"
            }]
        }, {
            name: "深圳市",
            code: "440300",
            sub: [{
                name: "市辖区",
                code: "440301"
            }, {
                name: "罗湖区",
                code: "440303"
            }, {
                name: "福田区",
                code: "440304"
            }, {
                name: "南山区",
                code: "440305"
            }, {
                name: "宝安区",
                code: "440306"
            }, {
                name: "龙岗区",
                code: "440307"
            }, {
                name: "盐田区",
                code: "440308"
            }]
        }, {
            name: "珠海市",
            code: "440400",
            sub: [{
                name: "市辖区",
                code: "440401"
            }, {
                name: "香洲区",
                code: "440402"
            }, {
                name: "斗门区",
                code: "440403"
            }, {
                name: "金湾区",
                code: "440404"
            }]
        }, {
            name: "汕头市",
            code: "440500",
            sub: [{
                name: "市辖区",
                code: "440501"
            }, {
                name: "龙湖区",
                code: "440507"
            }, {
                name: "金平区",
                code: "440511"
            }, {
                name: "濠江区",
                code: "440512"
            }, {
                name: "潮阳区",
                code: "440513"
            }, {
                name: "潮南区",
                code: "440514"
            }, {
                name: "澄海区",
                code: "440515"
            }, {
                name: "南澳县",
                code: "440523"
            }]
        }, {
            name: "佛山市",
            code: "440600",
            sub: [{
                name: "市辖区",
                code: "440601"
            }, {
                name: "禅城区",
                code: "440604"
            }, {
                name: "南海区",
                code: "440605"
            }, {
                name: "顺德区",
                code: "440606"
            }, {
                name: "三水区",
                code: "440607"
            }, {
                name: "高明区",
                code: "440608"
            }]
        }, {
            name: "江门市",
            code: "440700",
            sub: [{
                name: "市辖区",
                code: "440701"
            }, {
                name: "蓬江区",
                code: "440703"
            }, {
                name: "江海区",
                code: "440704"
            }, {
                name: "新会区",
                code: "440705"
            }, {
                name: "台山市",
                code: "440781"
            }, {
                name: "开平市",
                code: "440783"
            }, {
                name: "鹤山市",
                code: "440784"
            }, {
                name: "恩平市",
                code: "440785"
            }]
        }, {
            name: "湛江市",
            code: "440800",
            sub: [{
                name: "市辖区",
                code: "440801"
            }, {
                name: "赤坎区",
                code: "440802"
            }, {
                name: "霞山区",
                code: "440803"
            }, {
                name: "坡头区",
                code: "440804"
            }, {
                name: "麻章区",
                code: "440811"
            }, {
                name: "遂溪县",
                code: "440823"
            }, {
                name: "徐闻县",
                code: "440825"
            }, {
                name: "廉江市",
                code: "440881"
            }, {
                name: "雷州市",
                code: "440882"
            }, {
                name: "吴川市",
                code: "440883"
            }]
        }, {
            name: "茂名市",
            code: "440900",
            sub: [{
                name: "市辖区",
                code: "440901"
            }, {
                name: "茂南区",
                code: "440902"
            }, {
                name: "电白区",
                code: "440904"
            }, {
                name: "高州市",
                code: "440981"
            }, {
                name: "化州市",
                code: "440982"
            }, {
                name: "信宜市",
                code: "440983"
            }]
        }, {
            name: "肇庆市",
            code: "441200",
            sub: [{
                name: "市辖区",
                code: "441201"
            }, {
                name: "端州区",
                code: "441202"
            }, {
                name: "鼎湖区",
                code: "441203"
            }, {
                name: "广宁县",
                code: "441223"
            }, {
                name: "怀集县",
                code: "441224"
            }, {
                name: "封开县",
                code: "441225"
            }, {
                name: "德庆县",
                code: "441226"
            }, {
                name: "高要市",
                code: "441283"
            }, {
                name: "四会市",
                code: "441284"
            }]
        }, {
            name: "惠州市",
            code: "441300",
            sub: [{
                name: "市辖区",
                code: "441301"
            }, {
                name: "惠城区",
                code: "441302"
            }, {
                name: "惠阳区",
                code: "441303"
            }, {
                name: "博罗县",
                code: "441322"
            }, {
                name: "惠东县",
                code: "441323"
            }, {
                name: "龙门县",
                code: "441324"
            }]
        }, {
            name: "梅州市",
            code: "441400",
            sub: [{
                name: "市辖区",
                code: "441401"
            }, {
                name: "梅江区",
                code: "441402"
            }, {
                name: "梅县区",
                code: "441403"
            }, {
                name: "大埔县",
                code: "441422"
            }, {
                name: "丰顺县",
                code: "441423"
            }, {
                name: "五华县",
                code: "441424"
            }, {
                name: "平远县",
                code: "441426"
            }, {
                name: "蕉岭县",
                code: "441427"
            }, {
                name: "兴宁市",
                code: "441481"
            }]
        }, {
            name: "汕尾市",
            code: "441500",
            sub: [{
                name: "市辖区",
                code: "441501"
            }, {
                name: "城区",
                code: "441502"
            }, {
                name: "海丰县",
                code: "441521"
            }, {
                name: "陆河县",
                code: "441523"
            }, {
                name: "陆丰市",
                code: "441581"
            }]
        }, {
            name: "河源市",
            code: "441600",
            sub: [{
                name: "市辖区",
                code: "441601"
            }, {
                name: "源城区",
                code: "441602"
            }, {
                name: "紫金县",
                code: "441621"
            }, {
                name: "龙川县",
                code: "441622"
            }, {
                name: "连平县",
                code: "441623"
            }, {
                name: "和平县",
                code: "441624"
            }, {
                name: "东源县",
                code: "441625"
            }]
        }, {
            name: "阳江市",
            code: "441700",
            sub: [{
                name: "市辖区",
                code: "441701"
            }, {
                name: "江城区",
                code: "441702"
            }, {
                name: "阳东区",
                code: "441704"
            }, {
                name: "阳西县",
                code: "441721"
            }, {
                name: "阳春市",
                code: "441781"
            }]
        }, {
            name: "清远市",
            code: "441800",
            sub: [{
                name: "市辖区",
                code: "441801"
            }, {
                name: "清城区",
                code: "441802"
            }, {
                name: "清新区",
                code: "441803"
            }, {
                name: "佛冈县",
                code: "441821"
            }, {
                name: "阳山县",
                code: "441823"
            }, {
                name: "连山壮族瑶族自治县",
                code: "441825"
            }, {
                name: "连南瑶族自治县",
                code: "441826"
            }, {
                name: "英德市",
                code: "441881"
            }, {
                name: "连州市",
                code: "441882"
            }]
        }, {
            name: "东莞市",
            code: "441900",
            sub: []
        }, {
            name: "中山市",
            code: "442000",
            sub: []
        }, {
            name: "潮州市",
            code: "445100",
            sub: [{
                name: "市辖区",
                code: "445101"
            }, {
                name: "湘桥区",
                code: "445102"
            }, {
                name: "潮安区",
                code: "445103"
            }, {
                name: "饶平县",
                code: "445122"
            }]
        }, {
            name: "揭阳市",
            code: "445200",
            sub: [{
                name: "市辖区",
                code: "445201"
            }, {
                name: "榕城区",
                code: "445202"
            }, {
                name: "揭东区",
                code: "445203"
            }, {
                name: "揭西县",
                code: "445222"
            }, {
                name: "惠来县",
                code: "445224"
            }, {
                name: "普宁市",
                code: "445281"
            }]
        }, {
            name: "云浮市",
            code: "445300",
            sub: [{
                name: "市辖区",
                code: "445301"
            }, {
                name: "云城区",
                code: "445302"
            }, {
                name: "云安区",
                code: "445303"
            }, {
                name: "新兴县",
                code: "445321"
            }, {
                name: "郁南县",
                code: "445322"
            }, {
                name: "罗定市",
                code: "445381"
            }]
        }]
    }, {
        name: "广西壮族自治区",
        code: "450000",
        sub: [{
            name: "南宁市",
            code: "450100",
            sub: [{
                name: "市辖区",
                code: "450101"
            }, {
                name: "兴宁区",
                code: "450102"
            }, {
                name: "青秀区",
                code: "450103"
            }, {
                name: "江南区",
                code: "450105"
            }, {
                name: "西乡塘区",
                code: "450107"
            }, {
                name: "良庆区",
                code: "450108"
            }, {
                name: "邕宁区",
                code: "450109"
            }, {
                name: "武鸣县",
                code: "450122"
            }, {
                name: "隆安县",
                code: "450123"
            }, {
                name: "马山县",
                code: "450124"
            }, {
                name: "上林县",
                code: "450125"
            }, {
                name: "宾阳县",
                code: "450126"
            }, {
                name: "横县",
                code: "450127"
            }]
        }, {
            name: "柳州市",
            code: "450200",
            sub: [{
                name: "市辖区",
                code: "450201"
            }, {
                name: "城中区",
                code: "450202"
            }, {
                name: "鱼峰区",
                code: "450203"
            }, {
                name: "柳南区",
                code: "450204"
            }, {
                name: "柳北区",
                code: "450205"
            }, {
                name: "柳江县",
                code: "450221"
            }, {
                name: "柳城县",
                code: "450222"
            }, {
                name: "鹿寨县",
                code: "450223"
            }, {
                name: "融安县",
                code: "450224"
            }, {
                name: "融水苗族自治县",
                code: "450225"
            }, {
                name: "三江侗族自治县",
                code: "450226"
            }]
        }, {
            name: "桂林市",
            code: "450300",
            sub: [{
                name: "市辖区",
                code: "450301"
            }, {
                name: "秀峰区",
                code: "450302"
            }, {
                name: "叠彩区",
                code: "450303"
            }, {
                name: "象山区",
                code: "450304"
            }, {
                name: "七星区",
                code: "450305"
            }, {
                name: "雁山区",
                code: "450311"
            }, {
                name: "临桂区",
                code: "450312"
            }, {
                name: "阳朔县",
                code: "450321"
            }, {
                name: "灵川县",
                code: "450323"
            }, {
                name: "全州县",
                code: "450324"
            }, {
                name: "兴安县",
                code: "450325"
            }, {
                name: "永福县",
                code: "450326"
            }, {
                name: "灌阳县",
                code: "450327"
            }, {
                name: "龙胜各族自治县",
                code: "450328"
            }, {
                name: "资源县",
                code: "450329"
            }, {
                name: "平乐县",
                code: "450330"
            }, {
                name: "荔浦县",
                code: "450331"
            }, {
                name: "恭城瑶族自治县",
                code: "450332"
            }]
        }, {
            name: "梧州市",
            code: "450400",
            sub: [{
                name: "市辖区",
                code: "450401"
            }, {
                name: "万秀区",
                code: "450403"
            }, {
                name: "长洲区",
                code: "450405"
            }, {
                name: "龙圩区",
                code: "450406"
            }, {
                name: "苍梧县",
                code: "450421"
            }, {
                name: "藤县",
                code: "450422"
            }, {
                name: "蒙山县",
                code: "450423"
            }, {
                name: "岑溪市",
                code: "450481"
            }]
        }, {
            name: "北海市",
            code: "450500",
            sub: [{
                name: "市辖区",
                code: "450501"
            }, {
                name: "海城区",
                code: "450502"
            }, {
                name: "银海区",
                code: "450503"
            }, {
                name: "铁山港区",
                code: "450512"
            }, {
                name: "合浦县",
                code: "450521"
            }]
        }, {
            name: "防城港市",
            code: "450600",
            sub: [{
                name: "市辖区",
                code: "450601"
            }, {
                name: "港口区",
                code: "450602"
            }, {
                name: "防城区",
                code: "450603"
            }, {
                name: "上思县",
                code: "450621"
            }, {
                name: "东兴市",
                code: "450681"
            }]
        }, {
            name: "钦州市",
            code: "450700",
            sub: [{
                name: "市辖区",
                code: "450701"
            }, {
                name: "钦南区",
                code: "450702"
            }, {
                name: "钦北区",
                code: "450703"
            }, {
                name: "灵山县",
                code: "450721"
            }, {
                name: "浦北县",
                code: "450722"
            }]
        }, {
            name: "贵港市",
            code: "450800",
            sub: [{
                name: "市辖区",
                code: "450801"
            }, {
                name: "港北区",
                code: "450802"
            }, {
                name: "港南区",
                code: "450803"
            }, {
                name: "覃塘区",
                code: "450804"
            }, {
                name: "平南县",
                code: "450821"
            }, {
                name: "桂平市",
                code: "450881"
            }]
        }, {
            name: "玉林市",
            code: "450900",
            sub: [{
                name: "市辖区",
                code: "450901"
            }, {
                name: "玉州区",
                code: "450902"
            }, {
                name: "福绵区",
                code: "450903"
            }, {
                name: "容县",
                code: "450921"
            }, {
                name: "陆川县",
                code: "450922"
            }, {
                name: "博白县",
                code: "450923"
            }, {
                name: "兴业县",
                code: "450924"
            }, {
                name: "北流市",
                code: "450981"
            }]
        }, {
            name: "百色市",
            code: "451000",
            sub: [{
                name: "市辖区",
                code: "451001"
            }, {
                name: "右江区",
                code: "451002"
            }, {
                name: "田阳县",
                code: "451021"
            }, {
                name: "田东县",
                code: "451022"
            }, {
                name: "平果县",
                code: "451023"
            }, {
                name: "德保县",
                code: "451024"
            }, {
                name: "靖西县",
                code: "451025"
            }, {
                name: "那坡县",
                code: "451026"
            }, {
                name: "凌云县",
                code: "451027"
            }, {
                name: "乐业县",
                code: "451028"
            }, {
                name: "田林县",
                code: "451029"
            }, {
                name: "西林县",
                code: "451030"
            }, {
                name: "隆林各族自治县",
                code: "451031"
            }]
        }, {
            name: "贺州市",
            code: "451100",
            sub: [{
                name: "市辖区",
                code: "451101"
            }, {
                name: "八步区",
                code: "451102"
            }, {
                name: "平桂管理区",
                code: "451119"
            }, {
                name: "昭平县",
                code: "451121"
            }, {
                name: "钟山县",
                code: "451122"
            }, {
                name: "富川瑶族自治县",
                code: "451123"
            }]
        }, {
            name: "河池市",
            code: "451200",
            sub: [{
                name: "市辖区",
                code: "451201"
            }, {
                name: "金城江区",
                code: "451202"
            }, {
                name: "南丹县",
                code: "451221"
            }, {
                name: "天峨县",
                code: "451222"
            }, {
                name: "凤山县",
                code: "451223"
            }, {
                name: "东兰县",
                code: "451224"
            }, {
                name: "罗城仫佬族自治县",
                code: "451225"
            }, {
                name: "环江毛南族自治县",
                code: "451226"
            }, {
                name: "巴马瑶族自治县",
                code: "451227"
            }, {
                name: "都安瑶族自治县",
                code: "451228"
            }, {
                name: "大化瑶族自治县",
                code: "451229"
            }, {
                name: "宜州市",
                code: "451281"
            }]
        }, {
            name: "来宾市",
            code: "451300",
            sub: [{
                name: "市辖区",
                code: "451301"
            }, {
                name: "兴宾区",
                code: "451302"
            }, {
                name: "忻城县",
                code: "451321"
            }, {
                name: "象州县",
                code: "451322"
            }, {
                name: "武宣县",
                code: "451323"
            }, {
                name: "金秀瑶族自治县",
                code: "451324"
            }, {
                name: "合山市",
                code: "451381"
            }]
        }, {
            name: "崇左市",
            code: "451400",
            sub: [{
                name: "市辖区",
                code: "451401"
            }, {
                name: "江州区",
                code: "451402"
            }, {
                name: "扶绥县",
                code: "451421"
            }, {
                name: "宁明县",
                code: "451422"
            }, {
                name: "龙州县",
                code: "451423"
            }, {
                name: "大新县",
                code: "451424"
            }, {
                name: "天等县",
                code: "451425"
            }, {
                name: "凭祥市",
                code: "451481"
            }]
        }]
    }, {
        name: "海南省",
        code: "460000",
        sub: [{
            name: "海口市",
            code: "460100",
            sub: [{
                name: "市辖区",
                code: "460101"
            }, {
                name: "秀英区",
                code: "460105"
            }, {
                name: "龙华区",
                code: "460106"
            }, {
                name: "琼山区",
                code: "460107"
            }, {
                name: "美兰区",
                code: "460108"
            }]
        }, {
            name: "三亚市",
            code: "460200",
            sub: [{
                name: "市辖区",
                code: "460201"
            }, {
                name: "海棠区",
                code: "460202"
            }, {
                name: "吉阳区",
                code: "460203"
            }, {
                name: "天涯区",
                code: "460204"
            }, {
                name: "崖州区",
                code: "460205"
            }]
        }, {
            name: "三沙市",
            code: "460300",
            sub: [{
                name: "西沙群岛",
                code: "460321"
            }, {
                name: "南沙群岛",
                code: "460322"
            }, {
                name: "中沙群岛的岛礁及其海域",
                code: "460323"
            }]
        }, {
            name: "五指山市",
            code: "469001"
        }, {
            name: "琼海市",
            code: "469002"
        }, {
            name: "儋州市",
            code: "469003"
        }, {
            name: "文昌市",
            code: "469005"
        }, {
            name: "万宁市",
            code: "469006"
        }, {
            name: "东方市",
            code: "469007"
        }, {
            name: "定安县",
            code: "469021"
        }, {
            name: "屯昌县",
            code: "469022"
        }, {
            name: "澄迈县",
            code: "469023"
        }, {
            name: "临高县",
            code: "469024"
        }, {
            name: "白沙黎族自治县",
            code: "469025"
        }, {
            name: "昌江黎族自治县",
            code: "469026"
        }, {
            name: "乐东黎族自治县",
            code: "469027"
        }, {
            name: "陵水黎族自治县",
            code: "469028"
        }, {
            name: "保亭黎族苗族自治县",
            code: "469029"
        }, {
            name: "琼中黎族苗族自治县",
            code: "469030"
        }]
    }, {
        name: "重庆",
        code: "500000",
        sub: [{
            name: "重庆市",
            code: "500000",
            sub: [{
                name: "万州区",
                code: "500101"
            }, {
                name: "涪陵区",
                code: "500102"
            }, {
                name: "渝中区",
                code: "500103"
            }, {
                name: "大渡口区",
                code: "500104"
            }, {
                name: "江北区",
                code: "500105"
            }, {
                name: "沙坪坝区",
                code: "500106"
            }, {
                name: "九龙坡区",
                code: "500107"
            }, {
                name: "南岸区",
                code: "500108"
            }, {
                name: "北碚区",
                code: "500109"
            }, {
                name: "綦江区",
                code: "500110"
            }, {
                name: "大足区",
                code: "500111"
            }, {
                name: "渝北区",
                code: "500112"
            }, {
                name: "巴南区",
                code: "500113"
            }, {
                name: "黔江区",
                code: "500114"
            }, {
                name: "长寿区",
                code: "500115"
            }, {
                name: "江津区",
                code: "500116"
            }, {
                name: "合川区",
                code: "500117"
            }, {
                name: "永川区",
                code: "500118"
            }, {
                name: "南川区",
                code: "500119"
            }, {
                name: "璧山区",
                code: "500120"
            }, {
                name: "铜梁区",
                code: "500151"
            }, {
                name: "潼南县",
                code: "500223"
            }, {
                name: "荣昌县",
                code: "500226"
            }, {
                name: "梁平县",
                code: "500228"
            }, {
                name: "城口县",
                code: "500229"
            }, {
                name: "丰都县",
                code: "500230"
            }, {
                name: "垫江县",
                code: "500231"
            }, {
                name: "武隆县",
                code: "500232"
            }, {
                name: "忠县",
                code: "500233"
            }, {
                name: "开县",
                code: "500234"
            }, {
                name: "云阳县",
                code: "500235"
            }, {
                name: "奉节县",
                code: "500236"
            }, {
                name: "巫山县",
                code: "500237"
            }, {
                name: "巫溪县",
                code: "500238"
            }, {
                name: "石柱土家族自治县",
                code: "500240"
            }, {
                name: "秀山土家族苗族自治县",
                code: "500241"
            }, {
                name: "酉阳土家族苗族自治县",
                code: "500242"
            }, {
                name: "彭水苗族土家族自治县",
                code: "500243"
            }]
        }]
    }, {
        name: "四川省",
        code: "510000",
        sub: [{
            name: "成都市",
            code: "510100",
            sub: [{
                name: "市辖区",
                code: "510101"
            }, {
                name: "锦江区",
                code: "510104"
            }, {
                name: "青羊区",
                code: "510105"
            }, {
                name: "金牛区",
                code: "510106"
            }, {
                name: "武侯区",
                code: "510107"
            }, {
                name: "成华区",
                code: "510108"
            }, {
                name: "龙泉驿区",
                code: "510112"
            }, {
                name: "青白江区",
                code: "510113"
            }, {
                name: "新都区",
                code: "510114"
            }, {
                name: "温江区",
                code: "510115"
            }, {
                name: "金堂县",
                code: "510121"
            }, {
                name: "双流县",
                code: "510122"
            }, {
                name: "郫县",
                code: "510124"
            }, {
                name: "大邑县",
                code: "510129"
            }, {
                name: "蒲江县",
                code: "510131"
            }, {
                name: "新津县",
                code: "510132"
            }, {
                name: "都江堰市",
                code: "510181"
            }, {
                name: "彭州市",
                code: "510182"
            }, {
                name: "邛崃市",
                code: "510183"
            }, {
                name: "崇州市",
                code: "510184"
            }]
        }, {
            name: "自贡市",
            code: "510300",
            sub: [{
                name: "市辖区",
                code: "510301"
            }, {
                name: "自流井区",
                code: "510302"
            }, {
                name: "贡井区",
                code: "510303"
            }, {
                name: "大安区",
                code: "510304"
            }, {
                name: "沿滩区",
                code: "510311"
            }, {
                name: "荣县",
                code: "510321"
            }, {
                name: "富顺县",
                code: "510322"
            }]
        }, {
            name: "攀枝花市",
            code: "510400",
            sub: [{
                name: "市辖区",
                code: "510401"
            }, {
                name: "东区",
                code: "510402"
            }, {
                name: "西区",
                code: "510403"
            }, {
                name: "仁和区",
                code: "510411"
            }, {
                name: "米易县",
                code: "510421"
            }, {
                name: "盐边县",
                code: "510422"
            }]
        }, {
            name: "泸州市",
            code: "510500",
            sub: [{
                name: "市辖区",
                code: "510501"
            }, {
                name: "江阳区",
                code: "510502"
            }, {
                name: "纳溪区",
                code: "510503"
            }, {
                name: "龙马潭区",
                code: "510504"
            }, {
                name: "泸县",
                code: "510521"
            }, {
                name: "合江县",
                code: "510522"
            }, {
                name: "叙永县",
                code: "510524"
            }, {
                name: "古蔺县",
                code: "510525"
            }]
        }, {
            name: "德阳市",
            code: "510600",
            sub: [{
                name: "市辖区",
                code: "510601"
            }, {
                name: "旌阳区",
                code: "510603"
            }, {
                name: "中江县",
                code: "510623"
            }, {
                name: "罗江县",
                code: "510626"
            }, {
                name: "广汉市",
                code: "510681"
            }, {
                name: "什邡市",
                code: "510682"
            }, {
                name: "绵竹市",
                code: "510683"
            }]
        }, {
            name: "绵阳市",
            code: "510700",
            sub: [{
                name: "市辖区",
                code: "510701"
            }, {
                name: "涪城区",
                code: "510703"
            }, {
                name: "游仙区",
                code: "510704"
            }, {
                name: "三台县",
                code: "510722"
            }, {
                name: "盐亭县",
                code: "510723"
            }, {
                name: "安县",
                code: "510724"
            }, {
                name: "梓潼县",
                code: "510725"
            }, {
                name: "北川羌族自治县",
                code: "510726"
            }, {
                name: "平武县",
                code: "510727"
            }, {
                name: "江油市",
                code: "510781"
            }]
        }, {
            name: "广元市",
            code: "510800",
            sub: [{
                name: "市辖区",
                code: "510801"
            }, {
                name: "利州区",
                code: "510802"
            }, {
                name: "昭化区",
                code: "510811"
            }, {
                name: "朝天区",
                code: "510812"
            }, {
                name: "旺苍县",
                code: "510821"
            }, {
                name: "青川县",
                code: "510822"
            }, {
                name: "剑阁县",
                code: "510823"
            }, {
                name: "苍溪县",
                code: "510824"
            }]
        }, {
            name: "遂宁市",
            code: "510900",
            sub: [{
                name: "市辖区",
                code: "510901"
            }, {
                name: "船山区",
                code: "510903"
            }, {
                name: "安居区",
                code: "510904"
            }, {
                name: "蓬溪县",
                code: "510921"
            }, {
                name: "射洪县",
                code: "510922"
            }, {
                name: "大英县",
                code: "510923"
            }]
        }, {
            name: "内江市",
            code: "511000",
            sub: [{
                name: "市辖区",
                code: "511001"
            }, {
                name: "市中区",
                code: "511002"
            }, {
                name: "东兴区",
                code: "511011"
            }, {
                name: "威远县",
                code: "511024"
            }, {
                name: "资中县",
                code: "511025"
            }, {
                name: "隆昌县",
                code: "511028"
            }]
        }, {
            name: "乐山市",
            code: "511100",
            sub: [{
                name: "市辖区",
                code: "511101"
            }, {
                name: "市中区",
                code: "511102"
            }, {
                name: "沙湾区",
                code: "511111"
            }, {
                name: "五通桥区",
                code: "511112"
            }, {
                name: "金口河区",
                code: "511113"
            }, {
                name: "犍为县",
                code: "511123"
            }, {
                name: "井研县",
                code: "511124"
            }, {
                name: "夹江县",
                code: "511126"
            }, {
                name: "沐川县",
                code: "511129"
            }, {
                name: "峨边彝族自治县",
                code: "511132"
            }, {
                name: "马边彝族自治县",
                code: "511133"
            }, {
                name: "峨眉山市",
                code: "511181"
            }]
        }, {
            name: "南充市",
            code: "511300",
            sub: [{
                name: "市辖区",
                code: "511301"
            }, {
                name: "顺庆区",
                code: "511302"
            }, {
                name: "高坪区",
                code: "511303"
            }, {
                name: "嘉陵区",
                code: "511304"
            }, {
                name: "南部县",
                code: "511321"
            }, {
                name: "营山县",
                code: "511322"
            }, {
                name: "蓬安县",
                code: "511323"
            }, {
                name: "仪陇县",
                code: "511324"
            }, {
                name: "西充县",
                code: "511325"
            }, {
                name: "阆中市",
                code: "511381"
            }]
        }, {
            name: "眉山市",
            code: "511400",
            sub: [{
                name: "市辖区",
                code: "511401"
            }, {
                name: "东坡区",
                code: "511402"
            }, {
                name: "彭山区",
                code: "511403"
            }, {
                name: "仁寿县",
                code: "511421"
            }, {
                name: "洪雅县",
                code: "511423"
            }, {
                name: "丹棱县",
                code: "511424"
            }, {
                name: "青神县",
                code: "511425"
            }]
        }, {
            name: "宜宾市",
            code: "511500",
            sub: [{
                name: "市辖区",
                code: "511501"
            }, {
                name: "翠屏区",
                code: "511502"
            }, {
                name: "南溪区",
                code: "511503"
            }, {
                name: "宜宾县",
                code: "511521"
            }, {
                name: "江安县",
                code: "511523"
            }, {
                name: "长宁县",
                code: "511524"
            }, {
                name: "高县",
                code: "511525"
            }, {
                name: "珙县",
                code: "511526"
            }, {
                name: "筠连县",
                code: "511527"
            }, {
                name: "兴文县",
                code: "511528"
            }, {
                name: "屏山县",
                code: "511529"
            }]
        }, {
            name: "广安市",
            code: "511600",
            sub: [{
                name: "市辖区",
                code: "511601"
            }, {
                name: "广安区",
                code: "511602"
            }, {
                name: "前锋区",
                code: "511603"
            }, {
                name: "岳池县",
                code: "511621"
            }, {
                name: "武胜县",
                code: "511622"
            }, {
                name: "邻水县",
                code: "511623"
            }, {
                name: "华蓥市",
                code: "511681"
            }]
        }, {
            name: "达州市",
            code: "511700",
            sub: [{
                name: "市辖区",
                code: "511701"
            }, {
                name: "通川区",
                code: "511702"
            }, {
                name: "达川区",
                code: "511703"
            }, {
                name: "宣汉县",
                code: "511722"
            }, {
                name: "开江县",
                code: "511723"
            }, {
                name: "大竹县",
                code: "511724"
            }, {
                name: "渠县",
                code: "511725"
            }, {
                name: "万源市",
                code: "511781"
            }]
        }, {
            name: "雅安市",
            code: "511800",
            sub: [{
                name: "市辖区",
                code: "511801"
            }, {
                name: "雨城区",
                code: "511802"
            }, {
                name: "名山区",
                code: "511803"
            }, {
                name: "荥经县",
                code: "511822"
            }, {
                name: "汉源县",
                code: "511823"
            }, {
                name: "石棉县",
                code: "511824"
            }, {
                name: "天全县",
                code: "511825"
            }, {
                name: "芦山县",
                code: "511826"
            }, {
                name: "宝兴县",
                code: "511827"
            }]
        }, {
            name: "巴中市",
            code: "511900",
            sub: [{
                name: "市辖区",
                code: "511901"
            }, {
                name: "巴州区",
                code: "511902"
            }, {
                name: "恩阳区",
                code: "511903"
            }, {
                name: "通江县",
                code: "511921"
            }, {
                name: "南江县",
                code: "511922"
            }, {
                name: "平昌县",
                code: "511923"
            }]
        }, {
            name: "资阳市",
            code: "512000",
            sub: [{
                name: "市辖区",
                code: "512001"
            }, {
                name: "雁江区",
                code: "512002"
            }, {
                name: "安岳县",
                code: "512021"
            }, {
                name: "乐至县",
                code: "512022"
            }, {
                name: "简阳市",
                code: "512081"
            }]
        }, {
            name: "阿坝藏族羌族自治州",
            code: "513200",
            sub: [{
                name: "汶川县",
                code: "513221"
            }, {
                name: "理县",
                code: "513222"
            }, {
                name: "茂县",
                code: "513223"
            }, {
                name: "松潘县",
                code: "513224"
            }, {
                name: "九寨沟县",
                code: "513225"
            }, {
                name: "金川县",
                code: "513226"
            }, {
                name: "小金县",
                code: "513227"
            }, {
                name: "黑水县",
                code: "513228"
            }, {
                name: "马尔康县",
                code: "513229"
            }, {
                name: "壤塘县",
                code: "513230"
            }, {
                name: "阿坝县",
                code: "513231"
            }, {
                name: "若尔盖县",
                code: "513232"
            }, {
                name: "红原县",
                code: "513233"
            }]
        }, {
            name: "甘孜藏族自治州",
            code: "513300",
            sub: [{
                name: "康定县",
                code: "513321"
            }, {
                name: "泸定县",
                code: "513322"
            }, {
                name: "丹巴县",
                code: "513323"
            }, {
                name: "九龙县",
                code: "513324"
            }, {
                name: "雅江县",
                code: "513325"
            }, {
                name: "道孚县",
                code: "513326"
            }, {
                name: "炉霍县",
                code: "513327"
            }, {
                name: "甘孜县",
                code: "513328"
            }, {
                name: "新龙县",
                code: "513329"
            }, {
                name: "德格县",
                code: "513330"
            }, {
                name: "白玉县",
                code: "513331"
            }, {
                name: "石渠县",
                code: "513332"
            }, {
                name: "色达县",
                code: "513333"
            }, {
                name: "理塘县",
                code: "513334"
            }, {
                name: "巴塘县",
                code: "513335"
            }, {
                name: "乡城县",
                code: "513336"
            }, {
                name: "稻城县",
                code: "513337"
            }, {
                name: "得荣县",
                code: "513338"
            }]
        }, {
            name: "凉山彝族自治州",
            code: "513400",
            sub: [{
                name: "西昌市",
                code: "513401"
            }, {
                name: "木里藏族自治县",
                code: "513422"
            }, {
                name: "盐源县",
                code: "513423"
            }, {
                name: "德昌县",
                code: "513424"
            }, {
                name: "会理县",
                code: "513425"
            }, {
                name: "会东县",
                code: "513426"
            }, {
                name: "宁南县",
                code: "513427"
            }, {
                name: "普格县",
                code: "513428"
            }, {
                name: "布拖县",
                code: "513429"
            }, {
                name: "金阳县",
                code: "513430"
            }, {
                name: "昭觉县",
                code: "513431"
            }, {
                name: "喜德县",
                code: "513432"
            }, {
                name: "冕宁县",
                code: "513433"
            }, {
                name: "越西县",
                code: "513434"
            }, {
                name: "甘洛县",
                code: "513435"
            }, {
                name: "美姑县",
                code: "513436"
            }, {
                name: "雷波县",
                code: "513437"
            }]
        }]
    }, {
        name: "贵州省",
        code: "520000",
        sub: [{
            name: "贵阳市",
            code: "520100",
            sub: [{
                name: "市辖区",
                code: "520101"
            }, {
                name: "南明区",
                code: "520102"
            }, {
                name: "云岩区",
                code: "520103"
            }, {
                name: "花溪区",
                code: "520111"
            }, {
                name: "乌当区",
                code: "520112"
            }, {
                name: "白云区",
                code: "520113"
            }, {
                name: "观山湖区",
                code: "520115"
            }, {
                name: "开阳县",
                code: "520121"
            }, {
                name: "息烽县",
                code: "520122"
            }, {
                name: "修文县",
                code: "520123"
            }, {
                name: "清镇市",
                code: "520181"
            }]
        }, {
            name: "六盘水市",
            code: "520200",
            sub: [{
                name: "钟山区",
                code: "520201"
            }, {
                name: "六枝特区",
                code: "520203"
            }, {
                name: "水城县",
                code: "520221"
            }, {
                name: "盘县",
                code: "520222"
            }]
        }, {
            name: "遵义市",
            code: "520300",
            sub: [{
                name: "市辖区",
                code: "520301"
            }, {
                name: "红花岗区",
                code: "520302"
            }, {
                name: "汇川区",
                code: "520303"
            }, {
                name: "遵义县",
                code: "520321"
            }, {
                name: "桐梓县",
                code: "520322"
            }, {
                name: "绥阳县",
                code: "520323"
            }, {
                name: "正安县",
                code: "520324"
            }, {
                name: "道真仡佬族苗族自治县",
                code: "520325"
            }, {
                name: "务川仡佬族苗族自治县",
                code: "520326"
            }, {
                name: "凤冈县",
                code: "520327"
            }, {
                name: "湄潭县",
                code: "520328"
            }, {
                name: "余庆县",
                code: "520329"
            }, {
                name: "习水县",
                code: "520330"
            }, {
                name: "赤水市",
                code: "520381"
            }, {
                name: "仁怀市",
                code: "520382"
            }]
        }, {
            name: "安顺市",
            code: "520400",
            sub: [{
                name: "市辖区",
                code: "520401"
            }, {
                name: "西秀区",
                code: "520402"
            }, {
                name: "平坝区",
                code: "520403"
            }, {
                name: "普定县",
                code: "520422"
            }, {
                name: "镇宁布依族苗族自治县",
                code: "520423"
            }, {
                name: "关岭布依族苗族自治县",
                code: "520424"
            }, {
                name: "紫云苗族布依族自治县",
                code: "520425"
            }]
        }, {
            name: "毕节市",
            code: "520500",
            sub: [{
                name: "市辖区",
                code: "520501"
            }, {
                name: "七星关区",
                code: "520502"
            }, {
                name: "大方县",
                code: "520521"
            }, {
                name: "黔西县",
                code: "520522"
            }, {
                name: "金沙县",
                code: "520523"
            }, {
                name: "织金县",
                code: "520524"
            }, {
                name: "纳雍县",
                code: "520525"
            }, {
                name: "威宁彝族回族苗族自治县",
                code: "520526"
            }, {
                name: "赫章县",
                code: "520527"
            }]
        }, {
            name: "铜仁市",
            code: "520600",
            sub: [{
                name: "市辖区",
                code: "520601"
            }, {
                name: "碧江区",
                code: "520602"
            }, {
                name: "万山区",
                code: "520603"
            }, {
                name: "江口县",
                code: "520621"
            }, {
                name: "玉屏侗族自治县",
                code: "520622"
            }, {
                name: "石阡县",
                code: "520623"
            }, {
                name: "思南县",
                code: "520624"
            }, {
                name: "印江土家族苗族自治县",
                code: "520625"
            }, {
                name: "德江县",
                code: "520626"
            }, {
                name: "沿河土家族自治县",
                code: "520627"
            }, {
                name: "松桃苗族自治县",
                code: "520628"
            }]
        }, {
            name: "黔西南布依族苗族自治州",
            code: "522300",
            sub: [{
                name: "兴义市",
                code: "522301"
            }, {
                name: "兴仁县",
                code: "522322"
            }, {
                name: "普安县",
                code: "522323"
            }, {
                name: "晴隆县",
                code: "522324"
            }, {
                name: "贞丰县",
                code: "522325"
            }, {
                name: "望谟县",
                code: "522326"
            }, {
                name: "册亨县",
                code: "522327"
            }, {
                name: "安龙县",
                code: "522328"
            }]
        }, {
            name: "黔东南苗族侗族自治州",
            code: "522600",
            sub: [{
                name: "凯里市",
                code: "522601"
            }, {
                name: "黄平县",
                code: "522622"
            }, {
                name: "施秉县",
                code: "522623"
            }, {
                name: "三穗县",
                code: "522624"
            }, {
                name: "镇远县",
                code: "522625"
            }, {
                name: "岑巩县",
                code: "522626"
            }, {
                name: "天柱县",
                code: "522627"
            }, {
                name: "锦屏县",
                code: "522628"
            }, {
                name: "剑河县",
                code: "522629"
            }, {
                name: "台江县",
                code: "522630"
            }, {
                name: "黎平县",
                code: "522631"
            }, {
                name: "榕江县",
                code: "522632"
            }, {
                name: "从江县",
                code: "522633"
            }, {
                name: "雷山县",
                code: "522634"
            }, {
                name: "麻江县",
                code: "522635"
            }, {
                name: "丹寨县",
                code: "522636"
            }]
        }, {
            name: "黔南布依族苗族自治州",
            code: "522700",
            sub: [{
                name: "都匀市",
                code: "522701"
            }, {
                name: "福泉市",
                code: "522702"
            }, {
                name: "荔波县",
                code: "522722"
            }, {
                name: "贵定县",
                code: "522723"
            }, {
                name: "瓮安县",
                code: "522725"
            }, {
                name: "独山县",
                code: "522726"
            }, {
                name: "平塘县",
                code: "522727"
            }, {
                name: "罗甸县",
                code: "522728"
            }, {
                name: "长顺县",
                code: "522729"
            }, {
                name: "龙里县",
                code: "522730"
            }, {
                name: "惠水县",
                code: "522731"
            }, {
                name: "三都水族自治县",
                code: "522732"
            }]
        }]
    }, {
        name: "云南省",
        code: "530000",
        sub: [{
            name: "昆明市",
            code: "530100",
            sub: [{
                name: "市辖区",
                code: "530101"
            }, {
                name: "五华区",
                code: "530102"
            }, {
                name: "盘龙区",
                code: "530103"
            }, {
                name: "官渡区",
                code: "530111"
            }, {
                name: "西山区",
                code: "530112"
            }, {
                name: "东川区",
                code: "530113"
            }, {
                name: "呈贡区",
                code: "530114"
            }, {
                name: "晋宁县",
                code: "530122"
            }, {
                name: "富民县",
                code: "530124"
            }, {
                name: "宜良县",
                code: "530125"
            }, {
                name: "石林彝族自治县",
                code: "530126"
            }, {
                name: "嵩明县",
                code: "530127"
            }, {
                name: "禄劝彝族苗族自治县",
                code: "530128"
            }, {
                name: "寻甸回族彝族自治县",
                code: "530129"
            }, {
                name: "安宁市",
                code: "530181"
            }]
        }, {
            name: "曲靖市",
            code: "530300",
            sub: [{
                name: "市辖区",
                code: "530301"
            }, {
                name: "麒麟区",
                code: "530302"
            }, {
                name: "马龙县",
                code: "530321"
            }, {
                name: "陆良县",
                code: "530322"
            }, {
                name: "师宗县",
                code: "530323"
            }, {
                name: "罗平县",
                code: "530324"
            }, {
                name: "富源县",
                code: "530325"
            }, {
                name: "会泽县",
                code: "530326"
            }, {
                name: "沾益县",
                code: "530328"
            }, {
                name: "宣威市",
                code: "530381"
            }]
        }, {
            name: "玉溪市",
            code: "530400",
            sub: [{
                name: "市辖区",
                code: "530401"
            }, {
                name: "红塔区",
                code: "530402"
            }, {
                name: "江川县",
                code: "530421"
            }, {
                name: "澄江县",
                code: "530422"
            }, {
                name: "通海县",
                code: "530423"
            }, {
                name: "华宁县",
                code: "530424"
            }, {
                name: "易门县",
                code: "530425"
            }, {
                name: "峨山彝族自治县",
                code: "530426"
            }, {
                name: "新平彝族傣族自治县",
                code: "530427"
            }, {
                name: "元江哈尼族彝族傣族自治县",
                code: "530428"
            }]
        }, {
            name: "保山市",
            code: "530500",
            sub: [{
                name: "市辖区",
                code: "530501"
            }, {
                name: "隆阳区",
                code: "530502"
            }, {
                name: "施甸县",
                code: "530521"
            }, {
                name: "腾冲县",
                code: "530522"
            }, {
                name: "龙陵县",
                code: "530523"
            }, {
                name: "昌宁县",
                code: "530524"
            }]
        }, {
            name: "昭通市",
            code: "530600",
            sub: [{
                name: "市辖区",
                code: "530601"
            }, {
                name: "昭阳区",
                code: "530602"
            }, {
                name: "鲁甸县",
                code: "530621"
            }, {
                name: "巧家县",
                code: "530622"
            }, {
                name: "盐津县",
                code: "530623"
            }, {
                name: "大关县",
                code: "530624"
            }, {
                name: "永善县",
                code: "530625"
            }, {
                name: "绥江县",
                code: "530626"
            }, {
                name: "镇雄县",
                code: "530627"
            }, {
                name: "彝良县",
                code: "530628"
            }, {
                name: "威信县",
                code: "530629"
            }, {
                name: "水富县",
                code: "530630"
            }]
        }, {
            name: "丽江市",
            code: "530700",
            sub: [{
                name: "市辖区",
                code: "530701"
            }, {
                name: "古城区",
                code: "530702"
            }, {
                name: "玉龙纳西族自治县",
                code: "530721"
            }, {
                name: "永胜县",
                code: "530722"
            }, {
                name: "华坪县",
                code: "530723"
            }, {
                name: "宁蒗彝族自治县",
                code: "530724"
            }]
        }, {
            name: "普洱市",
            code: "530800",
            sub: [{
                name: "市辖区",
                code: "530801"
            }, {
                name: "思茅区",
                code: "530802"
            }, {
                name: "宁洱哈尼族彝族自治县",
                code: "530821"
            }, {
                name: "墨江哈尼族自治县",
                code: "530822"
            }, {
                name: "景东彝族自治县",
                code: "530823"
            }, {
                name: "景谷傣族彝族自治县",
                code: "530824"
            }, {
                name: "镇沅彝族哈尼族拉祜族自治县",
                code: "530825"
            }, {
                name: "江城哈尼族彝族自治县",
                code: "530826"
            }, {
                name: "孟连傣族拉祜族佤族自治县",
                code: "530827"
            }, {
                name: "澜沧拉祜族自治县",
                code: "530828"
            }, {
                name: "西盟佤族自治县",
                code: "530829"
            }]
        }, {
            name: "临沧市",
            code: "530900",
            sub: [{
                name: "市辖区",
                code: "530901"
            }, {
                name: "临翔区",
                code: "530902"
            }, {
                name: "凤庆县",
                code: "530921"
            }, {
                name: "云县",
                code: "530922"
            }, {
                name: "永德县",
                code: "530923"
            }, {
                name: "镇康县",
                code: "530924"
            }, {
                name: "双江拉祜族佤族布朗族傣族自治县",
                code: "530925"
            }, {
                name: "耿马傣族佤族自治县",
                code: "530926"
            }, {
                name: "沧源佤族自治县",
                code: "530927"
            }]
        }, {
            name: "楚雄彝族自治州",
            code: "532300",
            sub: [{
                name: "楚雄市",
                code: "532301"
            }, {
                name: "双柏县",
                code: "532322"
            }, {
                name: "牟定县",
                code: "532323"
            }, {
                name: "南华县",
                code: "532324"
            }, {
                name: "姚安县",
                code: "532325"
            }, {
                name: "大姚县",
                code: "532326"
            }, {
                name: "永仁县",
                code: "532327"
            }, {
                name: "元谋县",
                code: "532328"
            }, {
                name: "武定县",
                code: "532329"
            }, {
                name: "禄丰县",
                code: "532331"
            }]
        }, {
            name: "红河哈尼族彝族自治州",
            code: "532500",
            sub: [{
                name: "个旧市",
                code: "532501"
            }, {
                name: "开远市",
                code: "532502"
            }, {
                name: "蒙自市",
                code: "532503"
            }, {
                name: "弥勒市",
                code: "532504"
            }, {
                name: "屏边苗族自治县",
                code: "532523"
            }, {
                name: "建水县",
                code: "532524"
            }, {
                name: "石屏县",
                code: "532525"
            }, {
                name: "泸西县",
                code: "532527"
            }, {
                name: "元阳县",
                code: "532528"
            }, {
                name: "红河县",
                code: "532529"
            }, {
                name: "金平苗族瑶族傣族自治县",
                code: "532530"
            }, {
                name: "绿春县",
                code: "532531"
            }, {
                name: "河口瑶族自治县",
                code: "532532"
            }]
        }, {
            name: "文山壮族苗族自治州",
            code: "532600",
            sub: [{
                name: "文山市",
                code: "532601"
            }, {
                name: "砚山县",
                code: "532622"
            }, {
                name: "西畴县",
                code: "532623"
            }, {
                name: "麻栗坡县",
                code: "532624"
            }, {
                name: "马关县",
                code: "532625"
            }, {
                name: "丘北县",
                code: "532626"
            }, {
                name: "广南县",
                code: "532627"
            }, {
                name: "富宁县",
                code: "532628"
            }]
        }, {
            name: "西双版纳傣族自治州",
            code: "532800",
            sub: [{
                name: "景洪市",
                code: "532801"
            }, {
                name: "勐海县",
                code: "532822"
            }, {
                name: "勐腊县",
                code: "532823"
            }]
        }, {
            name: "大理白族自治州",
            code: "532900",
            sub: [{
                name: "大理市",
                code: "532901"
            }, {
                name: "漾濞彝族自治县",
                code: "532922"
            }, {
                name: "祥云县",
                code: "532923"
            }, {
                name: "宾川县",
                code: "532924"
            }, {
                name: "弥渡县",
                code: "532925"
            }, {
                name: "南涧彝族自治县",
                code: "532926"
            }, {
                name: "巍山彝族回族自治县",
                code: "532927"
            }, {
                name: "永平县",
                code: "532928"
            }, {
                name: "云龙县",
                code: "532929"
            }, {
                name: "洱源县",
                code: "532930"
            }, {
                name: "剑川县",
                code: "532931"
            }, {
                name: "鹤庆县",
                code: "532932"
            }]
        }, {
            name: "德宏傣族景颇族自治州",
            code: "533100",
            sub: [{
                name: "瑞丽市",
                code: "533102"
            }, {
                name: "芒市",
                code: "533103"
            }, {
                name: "梁河县",
                code: "533122"
            }, {
                name: "盈江县",
                code: "533123"
            }, {
                name: "陇川县",
                code: "533124"
            }]
        }, {
            name: "怒江傈僳族自治州",
            code: "533300",
            sub: [{
                name: "泸水县",
                code: "533321"
            }, {
                name: "福贡县",
                code: "533323"
            }, {
                name: "贡山独龙族怒族自治县",
                code: "533324"
            }, {
                name: "兰坪白族普米族自治县",
                code: "533325"
            }]
        }, {
            name: "迪庆藏族自治州",
            code: "533400",
            sub: [{
                name: "香格里拉市",
                code: "533401"
            }, {
                name: "德钦县",
                code: "533422"
            }, {
                name: "维西傈僳族自治县",
                code: "533423"
            }]
        }]
    }, {
        name: "西藏自治区",
        code: "540000",
        sub: [{
            name: "拉萨市",
            code: "540100",
            sub: [{
                name: "市辖区",
                code: "540101"
            }, {
                name: "城关区",
                code: "540102"
            }, {
                name: "林周县",
                code: "540121"
            }, {
                name: "当雄县",
                code: "540122"
            }, {
                name: "尼木县",
                code: "540123"
            }, {
                name: "曲水县",
                code: "540124"
            }, {
                name: "堆龙德庆县",
                code: "540125"
            }, {
                name: "达孜县",
                code: "540126"
            }, {
                name: "墨竹工卡县",
                code: "540127"
            }]
        }, {
            name: "日喀则市",
            code: "540200",
            sub: [{
                name: "市辖区",
                code: "540201"
            }, {
                name: "桑珠孜区",
                code: "540202"
            }, {
                name: "南木林县",
                code: "540221"
            }, {
                name: "江孜县",
                code: "540222"
            }, {
                name: "定日县",
                code: "540223"
            }, {
                name: "萨迦县",
                code: "540224"
            }, {
                name: "拉孜县",
                code: "540225"
            }, {
                name: "昂仁县",
                code: "540226"
            }, {
                name: "谢通门县",
                code: "540227"
            }, {
                name: "白朗县",
                code: "540228"
            }, {
                name: "仁布县",
                code: "540229"
            }, {
                name: "康马县",
                code: "540230"
            }, {
                name: "定结县",
                code: "540231"
            }, {
                name: "仲巴县",
                code: "540232"
            }, {
                name: "亚东县",
                code: "540233"
            }, {
                name: "吉隆县",
                code: "540234"
            }, {
                name: "聂拉木县",
                code: "540235"
            }, {
                name: "萨嘎县",
                code: "540236"
            }, {
                name: "岗巴县",
                code: "540237"
            }]
        }, {
            name: "昌都市",
            code: "540300",
            sub: [{
                name: "市辖区",
                code: "540301"
            }, {
                name: "卡若区",
                code: "540302"
            }, {
                name: "江达县",
                code: "540321"
            }, {
                name: "贡觉县",
                code: "540322"
            }, {
                name: "类乌齐县",
                code: "540323"
            }, {
                name: "丁青县",
                code: "540324"
            }, {
                name: "察雅县",
                code: "540325"
            }, {
                name: "八宿县",
                code: "540326"
            }, {
                name: "左贡县",
                code: "540327"
            }, {
                name: "芒康县",
                code: "540328"
            }, {
                name: "洛隆县",
                code: "540329"
            }, {
                name: "边坝县",
                code: "540330"
            }]
        }, {
            name: "山南地区",
            code: "542200",
            sub: [{
                name: "乃东县",
                code: "542221"
            }, {
                name: "扎囊县",
                code: "542222"
            }, {
                name: "贡嘎县",
                code: "542223"
            }, {
                name: "桑日县",
                code: "542224"
            }, {
                name: "琼结县",
                code: "542225"
            }, {
                name: "曲松县",
                code: "542226"
            }, {
                name: "措美县",
                code: "542227"
            }, {
                name: "洛扎县",
                code: "542228"
            }, {
                name: "加查县",
                code: "542229"
            }, {
                name: "隆子县",
                code: "542231"
            }, {
                name: "错那县",
                code: "542232"
            }, {
                name: "浪卡子县",
                code: "542233"
            }]
        }, {
            name: "那曲地区",
            code: "542400",
            sub: [{
                name: "那曲县",
                code: "542421"
            }, {
                name: "嘉黎县",
                code: "542422"
            }, {
                name: "比如县",
                code: "542423"
            }, {
                name: "聂荣县",
                code: "542424"
            }, {
                name: "安多县",
                code: "542425"
            }, {
                name: "申扎县",
                code: "542426"
            }, {
                name: "索县",
                code: "542427"
            }, {
                name: "班戈县",
                code: "542428"
            }, {
                name: "巴青县",
                code: "542429"
            }, {
                name: "尼玛县",
                code: "542430"
            }, {
                name: "双湖县",
                code: "542431"
            }]
        }, {
            name: "阿里地区",
            code: "542500",
            sub: [{
                name: "普兰县",
                code: "542521"
            }, {
                name: "札达县",
                code: "542522"
            }, {
                name: "噶尔县",
                code: "542523"
            }, {
                name: "日土县",
                code: "542524"
            }, {
                name: "革吉县",
                code: "542525"
            }, {
                name: "改则县",
                code: "542526"
            }, {
                name: "措勤县",
                code: "542527"
            }]
        }, {
            name: "林芝地区",
            code: "542600",
            sub: [{
                name: "林芝县",
                code: "542621"
            }, {
                name: "工布江达县",
                code: "542622"
            }, {
                name: "米林县",
                code: "542623"
            }, {
                name: "墨脱县",
                code: "542624"
            }, {
                name: "波密县",
                code: "542625"
            }, {
                name: "察隅县",
                code: "542626"
            }, {
                name: "朗县",
                code: "542627"
            }]
        }]
    }, {
        name: "陕西省",
        code: "610000",
        sub: [{
            name: "西安市",
            code: "610100",
            sub: [{
                name: "市辖区",
                code: "610101"
            }, {
                name: "新城区",
                code: "610102"
            }, {
                name: "碑林区",
                code: "610103"
            }, {
                name: "莲湖区",
                code: "610104"
            }, {
                name: "灞桥区",
                code: "610111"
            }, {
                name: "未央区",
                code: "610112"
            }, {
                name: "雁塔区",
                code: "610113"
            }, {
                name: "阎良区",
                code: "610114"
            }, {
                name: "临潼区",
                code: "610115"
            }, {
                name: "长安区",
                code: "610116"
            }, {
                name: "高陵区",
                code: "610117"
            }, {
                name: "蓝田县",
                code: "610122"
            }, {
                name: "周至县",
                code: "610124"
            }, {
                name: "户县",
                code: "610125"
            }]
        }, {
            name: "铜川市",
            code: "610200",
            sub: [{
                name: "市辖区",
                code: "610201"
            }, {
                name: "王益区",
                code: "610202"
            }, {
                name: "印台区",
                code: "610203"
            }, {
                name: "耀州区",
                code: "610204"
            }, {
                name: "宜君县",
                code: "610222"
            }]
        }, {
            name: "宝鸡市",
            code: "610300",
            sub: [{
                name: "市辖区",
                code: "610301"
            }, {
                name: "渭滨区",
                code: "610302"
            }, {
                name: "金台区",
                code: "610303"
            }, {
                name: "陈仓区",
                code: "610304"
            }, {
                name: "凤翔县",
                code: "610322"
            }, {
                name: "岐山县",
                code: "610323"
            }, {
                name: "扶风县",
                code: "610324"
            }, {
                name: "眉县",
                code: "610326"
            }, {
                name: "陇县",
                code: "610327"
            }, {
                name: "千阳县",
                code: "610328"
            }, {
                name: "麟游县",
                code: "610329"
            }, {
                name: "凤县",
                code: "610330"
            }, {
                name: "太白县",
                code: "610331"
            }]
        }, {
            name: "咸阳市",
            code: "610400",
            sub: [{
                name: "市辖区",
                code: "610401"
            }, {
                name: "秦都区",
                code: "610402"
            }, {
                name: "杨陵区",
                code: "610403"
            }, {
                name: "渭城区",
                code: "610404"
            }, {
                name: "三原县",
                code: "610422"
            }, {
                name: "泾阳县",
                code: "610423"
            }, {
                name: "乾县",
                code: "610424"
            }, {
                name: "礼泉县",
                code: "610425"
            }, {
                name: "永寿县",
                code: "610426"
            }, {
                name: "彬县",
                code: "610427"
            }, {
                name: "长武县",
                code: "610428"
            }, {
                name: "旬邑县",
                code: "610429"
            }, {
                name: "淳化县",
                code: "610430"
            }, {
                name: "武功县",
                code: "610431"
            }, {
                name: "兴平市",
                code: "610481"
            }]
        }, {
            name: "渭南市",
            code: "610500",
            sub: [{
                name: "市辖区",
                code: "610501"
            }, {
                name: "临渭区",
                code: "610502"
            }, {
                name: "华县",
                code: "610521"
            }, {
                name: "潼关县",
                code: "610522"
            }, {
                name: "大荔县",
                code: "610523"
            }, {
                name: "合阳县",
                code: "610524"
            }, {
                name: "澄城县",
                code: "610525"
            }, {
                name: "蒲城县",
                code: "610526"
            }, {
                name: "白水县",
                code: "610527"
            }, {
                name: "富平县",
                code: "610528"
            }, {
                name: "韩城市",
                code: "610581"
            }, {
                name: "华阴市",
                code: "610582"
            }]
        }, {
            name: "延安市",
            code: "610600",
            sub: [{
                name: "市辖区",
                code: "610601"
            }, {
                name: "宝塔区",
                code: "610602"
            }, {
                name: "延长县",
                code: "610621"
            }, {
                name: "延川县",
                code: "610622"
            }, {
                name: "子长县",
                code: "610623"
            }, {
                name: "安塞县",
                code: "610624"
            }, {
                name: "志丹县",
                code: "610625"
            }, {
                name: "吴起县",
                code: "610626"
            }, {
                name: "甘泉县",
                code: "610627"
            }, {
                name: "富县",
                code: "610628"
            }, {
                name: "洛川县",
                code: "610629"
            }, {
                name: "宜川县",
                code: "610630"
            }, {
                name: "黄龙县",
                code: "610631"
            }, {
                name: "黄陵县",
                code: "610632"
            }]
        }, {
            name: "汉中市",
            code: "610700",
            sub: [{
                name: "市辖区",
                code: "610701"
            }, {
                name: "汉台区",
                code: "610702"
            }, {
                name: "南郑县",
                code: "610721"
            }, {
                name: "城固县",
                code: "610722"
            }, {
                name: "洋县",
                code: "610723"
            }, {
                name: "西乡县",
                code: "610724"
            }, {
                name: "勉县",
                code: "610725"
            }, {
                name: "宁强县",
                code: "610726"
            }, {
                name: "略阳县",
                code: "610727"
            }, {
                name: "镇巴县",
                code: "610728"
            }, {
                name: "留坝县",
                code: "610729"
            }, {
                name: "佛坪县",
                code: "610730"
            }]
        }, {
            name: "榆林市",
            code: "610800",
            sub: [{
                name: "市辖区",
                code: "610801"
            }, {
                name: "榆阳区",
                code: "610802"
            }, {
                name: "神木县",
                code: "610821"
            }, {
                name: "府谷县",
                code: "610822"
            }, {
                name: "横山县",
                code: "610823"
            }, {
                name: "靖边县",
                code: "610824"
            }, {
                name: "定边县",
                code: "610825"
            }, {
                name: "绥德县",
                code: "610826"
            }, {
                name: "米脂县",
                code: "610827"
            }, {
                name: "佳县",
                code: "610828"
            }, {
                name: "吴堡县",
                code: "610829"
            }, {
                name: "清涧县",
                code: "610830"
            }, {
                name: "子洲县",
                code: "610831"
            }]
        }, {
            name: "安康市",
            code: "610900",
            sub: [{
                name: "市辖区",
                code: "610901"
            }, {
                name: "汉阴县",
                code: "610921"
            }, {
                name: "石泉县",
                code: "610922"
            }, {
                name: "宁陕县",
                code: "610923"
            }, {
                name: "紫阳县",
                code: "610924"
            }, {
                name: "岚皋县",
                code: "610925"
            }, {
                name: "平利县",
                code: "610926"
            }, {
                name: "镇坪县",
                code: "610927"
            }, {
                name: "旬阳县",
                code: "610928"
            }, {
                name: "白河县",
                code: "610929"
            }]
        }, {
            name: "商洛市",
            code: "611000",
            sub: [{
                name: "市辖区",
                code: "611001"
            }, {
                name: "商州区",
                code: "611002"
            }, {
                name: "洛南县",
                code: "611021"
            }, {
                name: "丹凤县",
                code: "611022"
            }, {
                name: "商南县",
                code: "611023"
            }, {
                name: "山阳县",
                code: "611024"
            }, {
                name: "镇安县",
                code: "611025"
            }, {
                name: "柞水县",
                code: "611026"
            }]
        }]
    }, {
        name: "甘肃省",
        code: "620000",
        sub: [{
            name: "兰州市",
            code: "620100",
            sub: [{
                name: "市辖区",
                code: "620101"
            }, {
                name: "城关区",
                code: "620102"
            }, {
                name: "七里河区",
                code: "620103"
            }, {
                name: "西固区",
                code: "620104"
            }, {
                name: "安宁区",
                code: "620105"
            }, {
                name: "红古区",
                code: "620111"
            }, {
                name: "永登县",
                code: "620121"
            }, {
                name: "皋兰县",
                code: "620122"
            }, {
                name: "榆中县",
                code: "620123"
            }]
        }, {
            name: "嘉峪关市",
            code: "620200",
            sub: [{
                name: "市辖区",
                code: "620201"
            }]
        }, {
            name: "金昌市",
            code: "620300",
            sub: [{
                name: "市辖区",
                code: "620301"
            }, {
                name: "金川区",
                code: "620302"
            }, {
                name: "永昌县",
                code: "620321"
            }]
        }, {
            name: "白银市",
            code: "620400",
            sub: [{
                name: "市辖区",
                code: "620401"
            }, {
                name: "白银区",
                code: "620402"
            }, {
                name: "平川区",
                code: "620403"
            }, {
                name: "靖远县",
                code: "620421"
            }, {
                name: "会宁县",
                code: "620422"
            }, {
                name: "景泰县",
                code: "620423"
            }]
        }, {
            name: "天水市",
            code: "620500",
            sub: [{
                name: "市辖区",
                code: "620501"
            }, {
                name: "秦州区",
                code: "620502"
            }, {
                name: "麦积区",
                code: "620503"
            }, {
                name: "清水县",
                code: "620521"
            }, {
                name: "秦安县",
                code: "620522"
            }, {
                name: "甘谷县",
                code: "620523"
            }, {
                name: "武山县",
                code: "620524"
            }, {
                name: "张家川回族自治县",
                code: "620525"
            }]
        }, {
            name: "武威市",
            code: "620600",
            sub: [{
                name: "市辖区",
                code: "620601"
            }, {
                name: "凉州区",
                code: "620602"
            }, {
                name: "民勤县",
                code: "620621"
            }, {
                name: "古浪县",
                code: "620622"
            }, {
                name: "天祝藏族自治县",
                code: "620623"
            }]
        }, {
            name: "张掖市",
            code: "620700",
            sub: [{
                name: "市辖区",
                code: "620701"
            }, {
                name: "甘州区",
                code: "620702"
            }, {
                name: "肃南裕固族自治县",
                code: "620721"
            }, {
                name: "民乐县",
                code: "620722"
            }, {
                name: "临泽县",
                code: "620723"
            }, {
                name: "高台县",
                code: "620724"
            }, {
                name: "山丹县",
                code: "620725"
            }]
        }, {
            name: "平凉市",
            code: "620800",
            sub: [{
                name: "市辖区",
                code: "620801"
            }, {
                name: "崆峒区",
                code: "620802"
            }, {
                name: "泾川县",
                code: "620821"
            }, {
                name: "灵台县",
                code: "620822"
            }, {
                name: "崇信县",
                code: "620823"
            }, {
                name: "华亭县",
                code: "620824"
            }, {
                name: "庄浪县",
                code: "620825"
            }, {
                name: "静宁县",
                code: "620826"
            }]
        }, {
            name: "酒泉市",
            code: "620900",
            sub: [{
                name: "市辖区",
                code: "620901"
            }, {
                name: "肃州区",
                code: "620902"
            }, {
                name: "金塔县",
                code: "620921"
            }, {
                name: "瓜州县",
                code: "620922"
            }, {
                name: "肃北蒙古族自治县",
                code: "620923"
            }, {
                name: "阿克塞哈萨克族自治县",
                code: "620924"
            }, {
                name: "玉门市",
                code: "620981"
            }, {
                name: "敦煌市",
                code: "620982"
            }]
        }, {
            name: "庆阳市",
            code: "621000",
            sub: [{
                name: "市辖区",
                code: "621001"
            }, {
                name: "西峰区",
                code: "621002"
            }, {
                name: "庆城县",
                code: "621021"
            }, {
                name: "环县",
                code: "621022"
            }, {
                name: "华池县",
                code: "621023"
            }, {
                name: "合水县",
                code: "621024"
            }, {
                name: "正宁县",
                code: "621025"
            }, {
                name: "宁县",
                code: "621026"
            }, {
                name: "镇原县",
                code: "621027"
            }]
        }, {
            name: "定西市",
            code: "621100",
            sub: [{
                name: "市辖区",
                code: "621101"
            }, {
                name: "安定区",
                code: "621102"
            }, {
                name: "通渭县",
                code: "621121"
            }, {
                name: "陇西县",
                code: "621122"
            }, {
                name: "渭源县",
                code: "621123"
            }, {
                name: "临洮县",
                code: "621124"
            }, {
                name: "漳县",
                code: "621125"
            }, {
                name: "岷县",
                code: "621126"
            }]
        }, {
            name: "陇南市",
            code: "621200",
            sub: [{
                name: "市辖区",
                code: "621201"
            }, {
                name: "武都区",
                code: "621202"
            }, {
                name: "成县",
                code: "621221"
            }, {
                name: "文县",
                code: "621222"
            }, {
                name: "宕昌县",
                code: "621223"
            }, {
                name: "康县",
                code: "621224"
            }, {
                name: "西和县",
                code: "621225"
            }, {
                name: "礼县",
                code: "621226"
            }, {
                name: "徽县",
                code: "621227"
            }, {
                name: "两当县",
                code: "621228"
            }]
        }, {
            name: "临夏回族自治州",
            code: "622900",
            sub: [{
                name: "临夏市",
                code: "622901"
            }, {
                name: "临夏县",
                code: "622921"
            }, {
                name: "康乐县",
                code: "622922"
            }, {
                name: "永靖县",
                code: "622923"
            }, {
                name: "广河县",
                code: "622924"
            }, {
                name: "和政县",
                code: "622925"
            }, {
                name: "东乡族自治县",
                code: "622926"
            }, {
                name: "积石山保安族东乡族撒拉族自治县",
                code: "622927"
            }]
        }, {
            name: "甘南藏族自治州",
            code: "623000",
            sub: [{
                name: "合作市",
                code: "623001"
            }, {
                name: "临潭县",
                code: "623021"
            }, {
                name: "卓尼县",
                code: "623022"
            }, {
                name: "舟曲县",
                code: "623023"
            }, {
                name: "迭部县",
                code: "623024"
            }, {
                name: "玛曲县",
                code: "623025"
            }, {
                name: "碌曲县",
                code: "623026"
            }, {
                name: "夏河县",
                code: "623027"
            }]
        }]
    }, {
        name: "青海省",
        code: "630000",
        sub: [{
            name: "西宁市",
            code: "630100",
            sub: [{
                name: "市辖区",
                code: "630101"
            }, {
                name: "城东区",
                code: "630102"
            }, {
                name: "城中区",
                code: "630103"
            }, {
                name: "城西区",
                code: "630104"
            }, {
                name: "城北区",
                code: "630105"
            }, {
                name: "大通回族土族自治县",
                code: "630121"
            }, {
                name: "湟中县",
                code: "630122"
            }, {
                name: "湟源县",
                code: "630123"
            }]
        }, {
            name: "海东市",
            code: "630200",
            sub: [{
                name: "市辖区",
                code: "630201"
            }, {
                name: "乐都区",
                code: "630202"
            }, {
                name: "平安县",
                code: "630221"
            }, {
                name: "民和回族土族自治县",
                code: "630222"
            }, {
                name: "互助土族自治县",
                code: "630223"
            }, {
                name: "化隆回族自治县",
                code: "630224"
            }, {
                name: "循化撒拉族自治县",
                code: "630225"
            }]
        }, {
            name: "海北藏族自治州",
            code: "632200",
            sub: [{
                name: "门源回族自治县",
                code: "632221"
            }, {
                name: "祁连县",
                code: "632222"
            }, {
                name: "海晏县",
                code: "632223"
            }, {
                name: "刚察县",
                code: "632224"
            }]
        }, {
            name: "黄南藏族自治州",
            code: "632300",
            sub: [{
                name: "同仁县",
                code: "632321"
            }, {
                name: "尖扎县",
                code: "632322"
            }, {
                name: "泽库县",
                code: "632323"
            }, {
                name: "河南蒙古族自治县",
                code: "632324"
            }]
        }, {
            name: "海南藏族自治州",
            code: "632500",
            sub: [{
                name: "共和县",
                code: "632521"
            }, {
                name: "同德县",
                code: "632522"
            }, {
                name: "贵德县",
                code: "632523"
            }, {
                name: "兴海县",
                code: "632524"
            }, {
                name: "贵南县",
                code: "632525"
            }]
        }, {
            name: "果洛藏族自治州",
            code: "632600",
            sub: [{
                name: "玛沁县",
                code: "632621"
            }, {
                name: "班玛县",
                code: "632622"
            }, {
                name: "甘德县",
                code: "632623"
            }, {
                name: "达日县",
                code: "632624"
            }, {
                name: "久治县",
                code: "632625"
            }, {
                name: "玛多县",
                code: "632626"
            }]
        }, {
            name: "玉树藏族自治州",
            code: "632700",
            sub: [{
                name: "玉树市",
                code: "632701"
            }, {
                name: "杂多县",
                code: "632722"
            }, {
                name: "称多县",
                code: "632723"
            }, {
                name: "治多县",
                code: "632724"
            }, {
                name: "囊谦县",
                code: "632725"
            }, {
                name: "曲麻莱县",
                code: "632726"
            }]
        }, {
            name: "海西蒙古族藏族自治州",
            code: "632800",
            sub: [{
                name: "格尔木市",
                code: "632801"
            }, {
                name: "德令哈市",
                code: "632802"
            }, {
                name: "乌兰县",
                code: "632821"
            }, {
                name: "都兰县",
                code: "632822"
            }, {
                name: "天峻县",
                code: "632823"
            }]
        }]
    }, {
        name: "宁夏回族自治区",
        code: "640000",
        sub: [{
            name: "银川市",
            code: "640100",
            sub: [{
                name: "市辖区",
                code: "640101"
            }, {
                name: "兴庆区",
                code: "640104"
            }, {
                name: "西夏区",
                code: "640105"
            }, {
                name: "金凤区",
                code: "640106"
            }, {
                name: "永宁县",
                code: "640121"
            }, {
                name: "贺兰县",
                code: "640122"
            }, {
                name: "灵武市",
                code: "640181"
            }]
        }, {
            name: "石嘴山市",
            code: "640200",
            sub: [{
                name: "市辖区",
                code: "640201"
            }, {
                name: "大武口区",
                code: "640202"
            }, {
                name: "惠农区",
                code: "640205"
            }, {
                name: "平罗县",
                code: "640221"
            }]
        }, {
            name: "吴忠市",
            code: "640300",
            sub: [{
                name: "市辖区",
                code: "640301"
            }, {
                name: "利通区",
                code: "640302"
            }, {
                name: "红寺堡区",
                code: "640303"
            }, {
                name: "盐池县",
                code: "640323"
            }, {
                name: "同心县",
                code: "640324"
            }, {
                name: "青铜峡市",
                code: "640381"
            }]
        }, {
            name: "固原市",
            code: "640400",
            sub: [{
                name: "市辖区",
                code: "640401"
            }, {
                name: "原州区",
                code: "640402"
            }, {
                name: "西吉县",
                code: "640422"
            }, {
                name: "隆德县",
                code: "640423"
            }, {
                name: "泾源县",
                code: "640424"
            }, {
                name: "彭阳县",
                code: "640425"
            }]
        }, {
            name: "中卫市",
            code: "640500",
            sub: [{
                name: "市辖区",
                code: "640501"
            }, {
                name: "沙坡头区",
                code: "640502"
            }, {
                name: "中宁县",
                code: "640521"
            }, {
                name: "海原县",
                code: "640522"
            }]
        }]
    }, {
        name: "新疆维吾尔自治区",
        code: "650000",
        sub: [{
            name: "乌鲁木齐市",
            code: "650100",
            sub: [{
                name: "市辖区",
                code: "650101"
            }, {
                name: "天山区",
                code: "650102"
            }, {
                name: "沙依巴克区",
                code: "650103"
            }, {
                name: "新市区",
                code: "650104"
            }, {
                name: "水磨沟区",
                code: "650105"
            }, {
                name: "头屯河区",
                code: "650106"
            }, {
                name: "达坂城区",
                code: "650107"
            }, {
                name: "米东区",
                code: "650109"
            }, {
                name: "乌鲁木齐县",
                code: "650121"
            }]
        }, {
            name: "克拉玛依市",
            code: "650200",
            sub: [{
                name: "市辖区",
                code: "650201"
            }, {
                name: "独山子区",
                code: "650202"
            }, {
                name: "克拉玛依区",
                code: "650203"
            }, {
                name: "白碱滩区",
                code: "650204"
            }, {
                name: "乌尔禾区",
                code: "650205"
            }]
        }, {
            name: "吐鲁番地区",
            code: "652100",
            sub: [{
                name: "吐鲁番市",
                code: "652101"
            }, {
                name: "鄯善县",
                code: "652122"
            }, {
                name: "托克逊县",
                code: "652123"
            }]
        }, {
            name: "哈密地区",
            code: "652200",
            sub: [{
                name: "哈密市",
                code: "652201"
            }, {
                name: "巴里坤哈萨克自治县",
                code: "652222"
            }, {
                name: "伊吾县",
                code: "652223"
            }]
        }, {
            name: "昌吉回族自治州",
            code: "652300",
            sub: [{
                name: "昌吉市",
                code: "652301"
            }, {
                name: "阜康市",
                code: "652302"
            }, {
                name: "呼图壁县",
                code: "652323"
            }, {
                name: "玛纳斯县",
                code: "652324"
            }, {
                name: "奇台县",
                code: "652325"
            }, {
                name: "吉木萨尔县",
                code: "652327"
            }, {
                name: "木垒哈萨克自治县",
                code: "652328"
            }]
        }, {
            name: "博尔塔拉蒙古自治州",
            code: "652700",
            sub: [{
                name: "博乐市",
                code: "652701"
            }, {
                name: "阿拉山口市",
                code: "652702"
            }, {
                name: "精河县",
                code: "652722"
            }, {
                name: "温泉县",
                code: "652723"
            }]
        }, {
            name: "巴音郭楞蒙古自治州",
            code: "652800",
            sub: [{
                name: "库尔勒市",
                code: "652801"
            }, {
                name: "轮台县",
                code: "652822"
            }, {
                name: "尉犁县",
                code: "652823"
            }, {
                name: "若羌县",
                code: "652824"
            }, {
                name: "且末县",
                code: "652825"
            }, {
                name: "焉耆回族自治县",
                code: "652826"
            }, {
                name: "和静县",
                code: "652827"
            }, {
                name: "和硕县",
                code: "652828"
            }, {
                name: "博湖县",
                code: "652829"
            }]
        }, {
            name: "阿克苏地区",
            code: "652900",
            sub: [{
                name: "阿克苏市",
                code: "652901"
            }, {
                name: "温宿县",
                code: "652922"
            }, {
                name: "库车县",
                code: "652923"
            }, {
                name: "沙雅县",
                code: "652924"
            }, {
                name: "新和县",
                code: "652925"
            }, {
                name: "拜城县",
                code: "652926"
            }, {
                name: "乌什县",
                code: "652927"
            }, {
                name: "阿瓦提县",
                code: "652928"
            }, {
                name: "柯坪县",
                code: "652929"
            }]
        }, {
            name: "克孜勒苏柯尔克孜自治州",
            code: "653000",
            sub: [{
                name: "阿图什市",
                code: "653001"
            }, {
                name: "阿克陶县",
                code: "653022"
            }, {
                name: "阿合奇县",
                code: "653023"
            }, {
                name: "乌恰县",
                code: "653024"
            }]
        }, {
            name: "喀什地区",
            code: "653100",
            sub: [{
                name: "喀什市",
                code: "653101"
            }, {
                name: "疏附县",
                code: "653121"
            }, {
                name: "疏勒县",
                code: "653122"
            }, {
                name: "英吉沙县",
                code: "653123"
            }, {
                name: "泽普县",
                code: "653124"
            }, {
                name: "莎车县",
                code: "653125"
            }, {
                name: "叶城县",
                code: "653126"
            }, {
                name: "麦盖提县",
                code: "653127"
            }, {
                name: "岳普湖县",
                code: "653128"
            }, {
                name: "伽师县",
                code: "653129"
            }, {
                name: "巴楚县",
                code: "653130"
            }, {
                name: "塔什库尔干塔吉克自治县",
                code: "653131"
            }]
        }, {
            name: "和田地区",
            code: "653200",
            sub: [{
                name: "和田市",
                code: "653201"
            }, {
                name: "和田县",
                code: "653221"
            }, {
                name: "墨玉县",
                code: "653222"
            }, {
                name: "皮山县",
                code: "653223"
            }, {
                name: "洛浦县",
                code: "653224"
            }, {
                name: "策勒县",
                code: "653225"
            }, {
                name: "于田县",
                code: "653226"
            }, {
                name: "民丰县",
                code: "653227"
            }]
        }, {
            name: "伊犁哈萨克自治州",
            code: "654000",
            sub: [{
                name: "伊宁市",
                code: "654002"
            }, {
                name: "奎屯市",
                code: "654003"
            }, {
                name: "霍尔果斯市",
                code: "654004"
            }, {
                name: "伊宁县",
                code: "654021"
            }, {
                name: "察布查尔锡伯自治县",
                code: "654022"
            }, {
                name: "霍城县",
                code: "654023"
            }, {
                name: "巩留县",
                code: "654024"
            }, {
                name: "新源县",
                code: "654025"
            }, {
                name: "昭苏县",
                code: "654026"
            }, {
                name: "特克斯县",
                code: "654027"
            }, {
                name: "尼勒克县",
                code: "654028"
            }, {
                name: "塔城地区",
                code: "654200"
            }, {
                name: "塔城市",
                code: "654201"
            }, {
                name: "乌苏市",
                code: "654202"
            }, {
                name: "额敏县",
                code: "654221"
            }, {
                name: "沙湾县",
                code: "654223"
            }, {
                name: "托里县",
                code: "654224"
            }, {
                name: "裕民县",
                code: "654225"
            }, {
                name: "和布克赛尔蒙古自治县",
                code: "654226"
            }, {
                name: "阿勒泰地区",
                code: "654300"
            }, {
                name: "阿勒泰市",
                code: "654301"
            }, {
                name: "布尔津县",
                code: "654321"
            }, {
                name: "富蕴县",
                code: "654322"
            }, {
                name: "福海县",
                code: "654323"
            }, {
                name: "哈巴河县",
                code: "654324"
            }, {
                name: "青河县",
                code: "654325"
            }, {
                name: "吉木乃县",
                code: "654326"
            }]
        }, {
            name: "自治区直辖县级行政区划",
            code: "659000",
            sub: [{
                name: "石河子市",
                code: "659001"
            }, {
                name: "阿拉尔市",
                code: "659002"
            }, {
                name: "图木舒克市",
                code: "659003"
            }, {
                name: "五家渠市",
                code: "659004"
            }, {
                name: "北屯市",
                code: "659005"
            }, {
                name: "铁门关市",
                code: "659006"
            }, {
                name: "双河市",
                code: "659007"
            }]
        }]
    }, {
        name: "台湾省",
        code: "710000",
        sub: [{
            name: "台北市",
            code: "710100",
            sub: [{
                name: "松山区",
                code: "710101"
            }, {
                name: "信义区",
                code: "710102"
            }, {
                name: "大安区",
                code: "710103"
            }, {
                name: "中山区",
                code: "710104"
            }, {
                name: "中正区",
                code: "710105"
            }, {
                name: "大同区",
                code: "710106"
            }, {
                name: "万华区",
                code: "710107"
            }, {
                name: "文山区",
                code: "710108"
            }, {
                name: "南港区",
                code: "710109"
            }, {
                name: "内湖区",
                code: "710110"
            }, {
                name: "士林区",
                code: "710111"
            }, {
                name: "北投区",
                code: "710112"
            }]
        }, {
            name: "高雄市",
            code: "710200",
            sub: [{
                name: "盐埕区",
                code: "710201"
            }, {
                name: "鼓山区",
                code: "710202"
            }, {
                name: "左营区",
                code: "710203"
            }, {
                name: "楠梓区",
                code: "710204"
            }, {
                name: "三民区",
                code: "710205"
            }, {
                name: "新兴区",
                code: "710206"
            }, {
                name: "前金区",
                code: "710207"
            }, {
                name: "苓雅区",
                code: "710208"
            }, {
                name: "前镇区",
                code: "710209"
            }, {
                name: "旗津区",
                code: "710210"
            }, {
                name: "小港区",
                code: "710211"
            }, {
                name: "凤山区",
                code: "710212"
            }, {
                name: "林园区",
                code: "710213"
            }, {
                name: "大寮区",
                code: "710214"
            }, {
                name: "大树区",
                code: "710215"
            }, {
                name: "大社区",
                code: "710216"
            }, {
                name: "仁武区",
                code: "710217"
            }, {
                name: "鸟松区",
                code: "710218"
            }, {
                name: "冈山区",
                code: "710219"
            }, {
                name: "桥头区",
                code: "710220"
            }, {
                name: "燕巢区",
                code: "710221"
            }, {
                name: "田寮区",
                code: "710222"
            }, {
                name: "阿莲区",
                code: "710223"
            }, {
                name: "路竹区",
                code: "710224"
            }, {
                name: "湖内区",
                code: "710225"
            }, {
                name: "茄萣区",
                code: "710226"
            }, {
                name: "永安区",
                code: "710227"
            }, {
                name: "弥陀区",
                code: "710228"
            }, {
                name: "梓官区",
                code: "710229"
            }, {
                name: "旗山区",
                code: "710230"
            }, {
                name: "美浓区",
                code: "710231"
            }, {
                name: "六龟区",
                code: "710232"
            }, {
                name: "甲仙区",
                code: "710233"
            }, {
                name: "杉林区",
                code: "710234"
            }, {
                name: "内门区",
                code: "710235"
            }, {
                name: "茂林区",
                code: "710236"
            }, {
                name: "桃源区",
                code: "710237"
            }, {
                name: "那玛夏区",
                code: "710238"
            }]
        }, {
            name: "基隆市",
            code: "710300",
            sub: [{
                name: "中正区",
                code: "710301"
            }, {
                name: "七堵区",
                code: "710302"
            }, {
                name: "暖暖区",
                code: "710303"
            }, {
                name: "仁爱区",
                code: "710304"
            }, {
                name: "中山区",
                code: "710305"
            }, {
                name: "安乐区",
                code: "710306"
            }, {
                name: "信义区",
                code: "710307"
            }]
        }, {
            name: "台中市",
            code: "710400",
            sub: [{
                name: "中区",
                code: "710401"
            }, {
                name: "东区",
                code: "710402"
            }, {
                name: "南区",
                code: "710403"
            }, {
                name: "西区",
                code: "710404"
            }, {
                name: "北区",
                code: "710405"
            }, {
                name: "西屯区",
                code: "710406"
            }, {
                name: "南屯区",
                code: "710407"
            }, {
                name: "北屯区",
                code: "710408"
            }, {
                name: "丰原区",
                code: "710409"
            }, {
                name: "东势区",
                code: "710410"
            }, {
                name: "大甲区",
                code: "710411"
            }, {
                name: "清水区",
                code: "710412"
            }, {
                name: "沙鹿区",
                code: "710413"
            }, {
                name: "梧栖区",
                code: "710414"
            }, {
                name: "后里区",
                code: "710415"
            }, {
                name: "神冈区",
                code: "710416"
            }, {
                name: "潭子区",
                code: "710417"
            }, {
                name: "大雅区",
                code: "710418"
            }, {
                name: "新社区",
                code: "710419"
            }, {
                name: "石冈区",
                code: "710420"
            }, {
                name: "外埔区",
                code: "710421"
            }, {
                name: "大安区",
                code: "710422"
            }, {
                name: "乌日区",
                code: "710423"
            }, {
                name: "大肚区",
                code: "710424"
            }, {
                name: "龙井区",
                code: "710425"
            }, {
                name: "雾峰区",
                code: "710426"
            }, {
                name: "太平区",
                code: "710427"
            }, {
                name: "大里区",
                code: "710428"
            }, {
                name: "和平区",
                code: "710429"
            }]
        }, {
            name: "台南市",
            code: "710500",
            sub: [{
                name: "东区",
                code: "710501"
            }, {
                name: "南区",
                code: "710502"
            }, {
                name: "北区",
                code: "710504"
            }, {
                name: "安南区",
                code: "710506"
            }, {
                name: "安平区",
                code: "710507"
            }, {
                name: "中西区",
                code: "710508"
            }, {
                name: "新营区",
                code: "710509"
            }, {
                name: "盐水区",
                code: "710510"
            }, {
                name: "白河区",
                code: "710511"
            }, {
                name: "柳营区",
                code: "710512"
            }, {
                name: "后壁区",
                code: "710513"
            }, {
                name: "东山区",
                code: "710514"
            }, {
                name: "麻豆区",
                code: "710515"
            }, {
                name: "下营区",
                code: "710516"
            }, {
                name: "六甲区",
                code: "710517"
            }, {
                name: "官田区",
                code: "710518"
            }, {
                name: "大内区",
                code: "710519"
            }, {
                name: "佳里区",
                code: "710520"
            }, {
                name: "学甲区",
                code: "710521"
            }, {
                name: "西港区",
                code: "710522"
            }, {
                name: "七股区",
                code: "710523"
            }, {
                name: "将军区",
                code: "710524"
            }, {
                name: "北门区",
                code: "710525"
            }, {
                name: "新化区",
                code: "710526"
            }, {
                name: "善化区",
                code: "710527"
            }, {
                name: "新市区",
                code: "710528"
            }, {
                name: "安定区",
                code: "710529"
            }, {
                name: "山上区",
                code: "710530"
            }, {
                name: "玉井区",
                code: "710531"
            }, {
                name: "楠西区",
                code: "710532"
            }, {
                name: "南化区",
                code: "710533"
            }, {
                name: "左镇区",
                code: "710534"
            }, {
                name: "仁德区",
                code: "710535"
            }, {
                name: "归仁区",
                code: "710536"
            }, {
                name: "关庙区",
                code: "710537"
            }, {
                name: "龙崎区",
                code: "710538"
            }, {
                name: "永康区",
                code: "710539"
            }]
        }, {
            name: "新竹市",
            code: "710600",
            sub: [{
                name: "东区",
                code: "710601"
            }, {
                name: "北区",
                code: "710602"
            }, {
                name: "香山区",
                code: "710603"
            }]
        }, {
            name: "嘉义市",
            code: "710700",
            sub: [{
                name: "东区",
                code: "710701"
            }, {
                name: "西区",
                code: "710702"
            }]
        }, {
            name: "新北市",
            code: "710800",
            sub: [{
                name: "板桥区",
                code: "710801"
            }, {
                name: "三重区",
                code: "710802"
            }, {
                name: "中和区",
                code: "710803"
            }, {
                name: "永和区",
                code: "710804"
            }, {
                name: "新庄区",
                code: "710805"
            }, {
                name: "新店区",
                code: "710806"
            }, {
                name: "树林区",
                code: "710807"
            }, {
                name: "莺歌区",
                code: "710808"
            }, {
                name: "三峡区",
                code: "710809"
            }, {
                name: "淡水区",
                code: "710810"
            }, {
                name: "汐止区",
                code: "710811"
            }, {
                name: "瑞芳区",
                code: "710812"
            }, {
                name: "土城区",
                code: "710813"
            }, {
                name: "芦洲区",
                code: "710814"
            }, {
                name: "五股区",
                code: "710815"
            }, {
                name: "泰山区",
                code: "710816"
            }, {
                name: "林口区",
                code: "710817"
            }, {
                name: "深坑区",
                code: "710818"
            }, {
                name: "石碇区",
                code: "710819"
            }, {
                name: "坪林区",
                code: "710820"
            }, {
                name: "三芝区",
                code: "710821"
            }, {
                name: "石门区",
                code: "710822"
            }, {
                name: "八里区",
                code: "710823"
            }, {
                name: "平溪区",
                code: "710824"
            }, {
                name: "双溪区",
                code: "710825"
            }, {
                name: "贡寮区",
                code: "710826"
            }, {
                name: "金山区",
                code: "710827"
            }, {
                name: "万里区",
                code: "710828"
            }, {
                name: "乌来区",
                code: "710829"
            }]
        }, {
            name: "宜兰县",
            code: "712200",
            sub: [{
                name: "宜兰市",
                code: "712201"
            }, {
                name: "罗东镇",
                code: "712221"
            }, {
                name: "苏澳镇",
                code: "712222"
            }, {
                name: "头城镇",
                code: "712223"
            }, {
                name: "礁溪乡",
                code: "712224"
            }, {
                name: "壮围乡",
                code: "712225"
            }, {
                name: "员山乡",
                code: "712226"
            }, {
                name: "冬山乡",
                code: "712227"
            }, {
                name: "五结乡",
                code: "712228"
            }, {
                name: "三星乡",
                code: "712229"
            }, {
                name: "大同乡",
                code: "712230"
            }, {
                name: "南澳乡",
                code: "712231"
            }]
        }, {
            name: "桃园县",
            code: "712300",
            sub: [{
                name: "桃园市",
                code: "712301"
            }, {
                name: "中坜市",
                code: "712302"
            }, {
                name: "平镇市",
                code: "712303"
            }, {
                name: "八德市",
                code: "712304"
            }, {
                name: "杨梅市",
                code: "712305"
            }, {
                name: "大溪镇",
                code: "712321"
            }, {
                name: "芦竹乡",
                code: "712323"
            }, {
                name: "大园乡",
                code: "712324"
            }, {
                name: "龟山乡",
                code: "712325"
            }, {
                name: "龙潭乡",
                code: "712327"
            }, {
                name: "新屋乡",
                code: "712329"
            }, {
                name: "观音乡",
                code: "712330"
            }, {
                name: "复兴乡",
                code: "712331"
            }]
        }, {
            name: "新竹县",
            code: "712400",
            sub: [{
                name: "竹北市",
                code: "712401"
            }, {
                name: "竹东镇",
                code: "712421"
            }, {
                name: "新埔镇",
                code: "712422"
            }, {
                name: "关西镇",
                code: "712423"
            }, {
                name: "湖口乡",
                code: "712424"
            }, {
                name: "新丰乡",
                code: "712425"
            }, {
                name: "芎林乡",
                code: "712426"
            }, {
                name: "橫山乡",
                code: "712427"
            }, {
                name: "北埔乡",
                code: "712428"
            }, {
                name: "宝山乡",
                code: "712429"
            }, {
                name: "峨眉乡",
                code: "712430"
            }, {
                name: "尖石乡",
                code: "712431"
            }, {
                name: "五峰乡",
                code: "712432"
            }]
        }, {
            name: "苗栗县",
            code: "712500",
            sub: [{
                name: "苗栗市",
                code: "712501"
            }, {
                name: "苑里镇",
                code: "712521"
            }, {
                name: "通霄镇",
                code: "712522"
            }, {
                name: "竹南镇",
                code: "712523"
            }, {
                name: "头份镇",
                code: "712524"
            }, {
                name: "后龙镇",
                code: "712525"
            }, {
                name: "卓兰镇",
                code: "712526"
            }, {
                name: "大湖乡",
                code: "712527"
            }, {
                name: "公馆乡",
                code: "712528"
            }, {
                name: "铜锣乡",
                code: "712529"
            }, {
                name: "南庄乡",
                code: "712530"
            }, {
                name: "头屋乡",
                code: "712531"
            }, {
                name: "三义乡",
                code: "712532"
            }, {
                name: "西湖乡",
                code: "712533"
            }, {
                name: "造桥乡",
                code: "712534"
            }, {
                name: "三湾乡",
                code: "712535"
            }, {
                name: "狮潭乡",
                code: "712536"
            }, {
                name: "泰安乡",
                code: "712537"
            }]
        }, {
            name: "彰化县",
            code: "712700",
            sub: [{
                name: "彰化市",
                code: "712701"
            }, {
                name: "鹿港镇",
                code: "712721"
            }, {
                name: "和美镇",
                code: "712722"
            }, {
                name: "线西乡",
                code: "712723"
            }, {
                name: "伸港乡",
                code: "712724"
            }, {
                name: "福兴乡",
                code: "712725"
            }, {
                name: "秀水乡",
                code: "712726"
            }, {
                name: "花坛乡",
                code: "712727"
            }, {
                name: "芬园乡",
                code: "712728"
            }, {
                name: "员林镇",
                code: "712729"
            }, {
                name: "溪湖镇",
                code: "712730"
            }, {
                name: "田中镇",
                code: "712731"
            }, {
                name: "大村乡",
                code: "712732"
            }, {
                name: "埔盐乡",
                code: "712733"
            }, {
                name: "埔心乡",
                code: "712734"
            }, {
                name: "永靖乡",
                code: "712735"
            }, {
                name: "社头乡",
                code: "712736"
            }, {
                name: "二水乡",
                code: "712737"
            }, {
                name: "北斗镇",
                code: "712738"
            }, {
                name: "二林镇",
                code: "712739"
            }, {
                name: "田尾乡",
                code: "712740"
            }, {
                name: "埤头乡",
                code: "712741"
            }, {
                name: "芳苑乡",
                code: "712742"
            }, {
                name: "大城乡",
                code: "712743"
            }, {
                name: "竹塘乡",
                code: "712744"
            }, {
                name: "溪州乡",
                code: "712745"
            }]
        }, {
            name: "南投县",
            code: "712800",
            sub: [{
                name: "南投市",
                code: "712801"
            }, {
                name: "埔里镇",
                code: "712821"
            }, {
                name: "草屯镇",
                code: "712822"
            }, {
                name: "竹山镇",
                code: "712823"
            }, {
                name: "集集镇",
                code: "712824"
            }, {
                name: "名间乡",
                code: "712825"
            }, {
                name: "鹿谷乡",
                code: "712826"
            }, {
                name: "中寮乡",
                code: "712827"
            }, {
                name: "鱼池乡",
                code: "712828"
            }, {
                name: "国姓乡",
                code: "712829"
            }, {
                name: "水里乡",
                code: "712830"
            }, {
                name: "信义乡",
                code: "712831"
            }, {
                name: "仁爱乡",
                code: "712832"
            }]
        }, {
            name: "云林县",
            code: "712900",
            sub: [{
                name: "斗六市",
                code: "712901"
            }, {
                name: "斗南镇",
                code: "712921"
            }, {
                name: "虎尾镇",
                code: "712922"
            }, {
                name: "西螺镇",
                code: "712923"
            }, {
                name: "土库镇",
                code: "712924"
            }, {
                name: "北港镇",
                code: "712925"
            }, {
                name: "古坑乡",
                code: "712926"
            }, {
                name: "大埤乡",
                code: "712927"
            }, {
                name: "莿桐乡",
                code: "712928"
            }, {
                name: "林内乡",
                code: "712929"
            }, {
                name: "二仑乡",
                code: "712930"
            }, {
                name: "仑背乡",
                code: "712931"
            }, {
                name: "麦寮乡",
                code: "712932"
            }, {
                name: "东势乡",
                code: "712933"
            }, {
                name: "褒忠乡",
                code: "712934"
            }, {
                name: "台西乡",
                code: "712935"
            }, {
                name: "元长乡",
                code: "712936"
            }, {
                name: "四湖乡",
                code: "712937"
            }, {
                name: "口湖乡",
                code: "712938"
            }, {
                name: "水林乡",
                code: "712939"
            }]
        }, {
            name: "嘉义县",
            code: "713000",
            sub: [{
                name: "太保市",
                code: "713001"
            }, {
                name: "朴子市",
                code: "713002"
            }, {
                name: "布袋镇",
                code: "713023"
            }, {
                name: "大林镇",
                code: "713024"
            }, {
                name: "民雄乡",
                code: "713025"
            }, {
                name: "溪口乡",
                code: "713026"
            }, {
                name: "新港乡",
                code: "713027"
            }, {
                name: "六脚乡",
                code: "713028"
            }, {
                name: "东石乡",
                code: "713029"
            }, {
                name: "义竹乡",
                code: "713030"
            }, {
                name: "鹿草乡",
                code: "713031"
            }, {
                name: "水上乡",
                code: "713032"
            }, {
                name: "中埔乡",
                code: "713033"
            }, {
                name: "竹崎乡",
                code: "713034"
            }, {
                name: "梅山乡",
                code: "713035"
            }, {
                name: "番路乡",
                code: "713036"
            }, {
                name: "大埔乡",
                code: "713037"
            }, {
                name: "阿里山乡",
                code: "713038"
            }]
        }, {
            name: "屏东县",
            code: "713300",
            sub: [{
                name: "屏东市",
                code: "713301"
            }, {
                name: "潮州镇",
                code: "713321"
            }, {
                name: "东港镇",
                code: "713322"
            }, {
                name: "恒春镇",
                code: "713323"
            }, {
                name: "万丹乡",
                code: "713324"
            }, {
                name: "长治乡",
                code: "713325"
            }, {
                name: "麟洛乡",
                code: "713326"
            }, {
                name: "九如乡",
                code: "713327"
            }, {
                name: "里港乡",
                code: "713328"
            }, {
                name: "盐埔乡",
                code: "713329"
            }, {
                name: "高树乡",
                code: "713330"
            }, {
                name: "万峦乡",
                code: "713331"
            }, {
                name: "内埔乡",
                code: "713332"
            }, {
                name: "竹田乡",
                code: "713333"
            }, {
                name: "新埤乡",
                code: "713334"
            }, {
                name: "枋寮乡",
                code: "713335"
            }, {
                name: "新园乡",
                code: "713336"
            }, {
                name: "崁顶乡",
                code: "713337"
            }, {
                name: "林边乡",
                code: "713338"
            }, {
                name: "南州乡",
                code: "713339"
            }, {
                name: "佳冬乡",
                code: "713340"
            }, {
                name: "琉球乡",
                code: "713341"
            }, {
                name: "车城乡",
                code: "713342"
            }, {
                name: "满州乡",
                code: "713343"
            }, {
                name: "枋山乡",
                code: "713344"
            }, {
                name: "三地门乡",
                code: "713345"
            }, {
                name: "雾台乡",
                code: "713346"
            }, {
                name: "玛家乡",
                code: "713347"
            }, {
                name: "泰武乡",
                code: "713348"
            }, {
                name: "来义乡",
                code: "713349"
            }, {
                name: "春日乡",
                code: "713350"
            }, {
                name: "狮子乡",
                code: "713351"
            }, {
                name: "牡丹乡",
                code: "713352"
            }]
        }, {
            name: "台东县",
            code: "713400",
            sub: [{
                name: "台东市",
                code: "713401"
            }, {
                name: "成功镇",
                code: "713421"
            }, {
                name: "关山镇",
                code: "713422"
            }, {
                name: "卑南乡",
                code: "713423"
            }, {
                name: "鹿野乡",
                code: "713424"
            }, {
                name: "池上乡",
                code: "713425"
            }, {
                name: "东河乡",
                code: "713426"
            }, {
                name: "长滨乡",
                code: "713427"
            }, {
                name: "太麻里乡",
                code: "713428"
            }, {
                name: "大武乡",
                code: "713429"
            }, {
                name: "绿岛乡",
                code: "713430"
            }, {
                name: "海端乡",
                code: "713431"
            }, {
                name: "延平乡",
                code: "713432"
            }, {
                name: "金峰乡",
                code: "713433"
            }, {
                name: "达仁乡",
                code: "713434"
            }, {
                name: "兰屿乡",
                code: "713435"
            }]
        }, {
            name: "花莲县",
            code: "713500",
            sub: [{
                name: "花莲市",
                code: "713501"
            }, {
                name: "凤林镇",
                code: "713521"
            }, {
                name: "玉里镇",
                code: "713522"
            }, {
                name: "新城乡",
                code: "713523"
            }, {
                name: "吉安乡",
                code: "713524"
            }, {
                name: "寿丰乡",
                code: "713525"
            }, {
                name: "光复乡",
                code: "713526"
            }, {
                name: "丰滨乡",
                code: "713527"
            }, {
                name: "瑞穗乡",
                code: "713528"
            }, {
                name: "富里乡",
                code: "713529"
            }, {
                name: "秀林乡",
                code: "713530"
            }, {
                name: "万荣乡",
                code: "713531"
            }, {
                name: "卓溪乡",
                code: "713532"
            }]
        }, {
            name: "澎湖县",
            code: "713600",
            sub: [{
                name: "马公市",
                code: "713601"
            }, {
                name: "湖西乡",
                code: "713621"
            }, {
                name: "白沙乡",
                code: "713622"
            }, {
                name: "西屿乡",
                code: "713623"
            }, {
                name: "望安乡",
                code: "713624"
            }, {
                name: "七美乡",
                code: "713625"
            }]
        }]
    }, {
        name: "香港特别行政区",
        code: "810000",
        sub: [{
            name: "香港岛",
            code: "810100",
            sub: [{
                name: "中西区",
                code: "810101"
            }, {
                name: "湾仔区",
                code: "810102"
            }, {
                name: "东区",
                code: "810103"
            }, {
                name: "南区",
                code: "810104"
            }]
        }, {
            name: "九龙",
            code: "810200",
            sub: [{
                name: "油尖旺区",
                code: "810201"
            }, {
                name: "深水埗区",
                code: "810202"
            }, {
                name: "九龙城区",
                code: "810203"
            }, {
                name: "黄大仙区",
                code: "810204"
            }, {
                name: "观塘区",
                code: "810205"
            }]
        }, {
            name: "新界",
            code: "810300",
            sub: [{
                name: "荃湾区",
                code: "810301"
            }, {
                name: "屯门区",
                code: "810302"
            }, {
                name: "元朗区",
                code: "810303"
            }, {
                name: "北区",
                code: "810304"
            }, {
                name: "大埔区",
                code: "810305"
            }, {
                name: "西贡区",
                code: "810306"
            }, {
                name: "沙田区",
                code: "810307"
            }, {
                name: "葵青区",
                code: "810308"
            }, {
                name: "离岛区",
                code: "810309"
            }]
        }]
    }, {
        name: "澳门特别行政区",
        code: "820000",
        sub: [{
            name: "澳门半岛",
            code: "820100",
            sub: [{
                name: "花地玛堂区",
                code: "820101"
            }, {
                name: "圣安多尼堂区",
                code: "820102"
            }, {
                name: "大堂区",
                code: "820103"
            }, {
                name: "望德堂区",
                code: "820104"
            }, {
                name: "风顺堂区",
                code: "820105"
            }]
        }, {
            name: "氹仔岛",
            code: "820200",
            sub: [{
                name: "嘉模堂区",
                code: "820201"
            }]
        }, {
            name: "路环岛",
            code: "820300",
            sub: [{
                name: "圣方济各堂区",
                code: "820301"
            }]
        }]
    }]
})($);
;(function(e) {
    "use strict";
    var n,
        a = e.rawCitiesData,
        c = function(e) {
            for (var n = [], a = 0; a < e.length; a++) {
                var c = e[a];
                /^请选择|市辖区/.test(c.name) || n.push(c)
            }
            return n.length ? n : []
        },
        o = function(e) {
            return e.sub ? c(e.sub) : [{
                name: "",
                code: e.code
            }]
        },
        m = function(e) {
            for (var n = 0; n < a.length; n++)
                if (a[n].code === e || a[n].name === e)
                    return o(a[n]);
            return []
        },
        d = function(e, n) {
            for (var c = 0; c < a.length; c++)
                if (a[c].code === e || a[c].name === e)
                    for (var m = 0; m < a[c].sub.length; m++)
                        if (a[c].sub[m].code === n || a[c].sub[m].name === n)
                            return o(a[c].sub[m])
        },
        u = function(e) {
            var n,
                c,
                o = a[0],
                m = e.split(" ");
            return a.map(function(e) {
                e.name === m[0] && (o = e)
            }), o.sub.map(function(e) {
                e.name === m[1] && (n = e)
            }), m[2] && n.sub.map(function(e) {
                e.name === m[2] && (c = e)
            }), c ? [o.code, n.code, c.code] : [o.code, n.code]
        };
    e.fn.cityPicker = function(c) {
        return c = e.extend({}, n, c), this.each(function() {
            var n = this,
                s = a.map(function(e) {
                    return e.name
                }),
                b = a.map(function(e) {
                    return e.code
                }),
                t = o(a[0]),
                r = t.map(function(e) {
                    return e.name
                }),
                i = t.map(function(e) {
                    return e.code
                }),
                l = o(a[0].sub[0]),
                f = l.map(function(e) {
                    return e.name
                }),
                p = l.map(function(e) {
                    return e.code
                }),
                v = s[0],
                h = r[0],
                V = f[0],
                y = [{
                    displayValues: s,
                    values: b,
                    cssClass: "col-province"
                }, {
                    displayValues: r,
                    values: i,
                    cssClass: "col-city"
                }];
            c.showDistrict && y.push({
                values: p,
                displayValues: f,
                cssClass: "col-district"
            });
            var g = {
                cssClass: "city-picker",
                rotateEffect: !1,
                formatValue: function(e, n, a) {
                    return a.join(" ")
                },
                onChange: function(a, o, u) {
                    var s,
                        b = a.cols[0].displayValue;
                    if (b !== v) {
                        var t = m(b);
                        s = t[0].name;
                        var r = d(b, s);
                        return a.cols[1].replaceValues(t.map(function(e) {
                            return e.code
                        }), t.map(function(e) {
                            return e.name
                        })), c.showDistrict && a.cols[2].replaceValues(r.map(function(e) {
                            return e.code
                        }), r.map(function(e) {
                            return e.name
                        })), v = b, h = s, a.updateValue(), !1
                    }
                    if (c.showDistrict && (s = a.cols[1].displayValue, s !== h)) {
                        var i = d(b, s);
                        return a.cols[2].replaceValues(i.map(function(e) {
                            return e.code
                        }), i.map(function(e) {
                            return e.name
                        })), h = s, a.updateValue(), !1
                    }
                    e(n).attr("data-code", o[o.length - 1]), e(n).attr("data-codes", o.join(",")), c.onChange && c.onChange.call(n, a, o, u)
                },
                cols: y
            };
            if (this) {
                var C = e.extend({}, c, g),
                    w = e(this).val();
                if (w || (w = "北京 北京市 东城区"), v = w.split(" ")[0], h = w.split(" ")[1], V = w.split(" ")[2], w) {
                    if (C.value = u(w), C.value[0]) {
                        var D = m(C.value[0]);
                        C.cols[1].values = D.map(function(e) {
                            return e.code
                        }), C.cols[1].displayValues = D.map(function(e) {
                            return e.name
                        })
                    }
                    if (C.value[1]) {
                        if (c.showDistrict) {
                            var k = d(C.value[0], C.value[1]);
                            C.cols[2].values = k.map(function(e) {
                                return e.code
                            }), C.cols[2].displayValues = k.map(function(e) {
                                return e.name
                            })
                        }
                    } else if (c.showDistrict) {
                        var k = d(C.value[0], C.cols[1].values[0]);
                        C.cols[2].values = k.map(function(e) {
                            return e.code
                        }), C.cols[2].displayValues = k.map(function(e) {
                            return e.name
                        })
                    }
                }
                e(this).picker(C)
            }
        })
    }, n = e.fn.cityPicker.prototype.defaults = {
        showDistrict: !0
    }
})($);
// 解决移动端click 300 毫秒延迟 (http://github.com/ftlabs/fastclick)
$(function() {
    FastClick.attach(document.body);
});

// 图片lazy加载
$('img.lazyload').lazyload();

// tab
$(".tab-item a").click(function (e) {
    e.preventDefault();
    $(this).tab('show');
});

// activate tabs for lazyload
$(".tab-item a").on('shown.bs.tab', function () {
    $(window).trigger('scroll');
});