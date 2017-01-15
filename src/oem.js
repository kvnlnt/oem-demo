if (!Function.prototype.bind) {
  Function.prototype.bind = function () {
    var fn = this,
      args = Array.prototype.slice.call(arguments),
      object = args.shift();
    return function () {
      return fn.apply(object,
        args.concat(Array.prototype.slice.call(arguments)));
    };
  };
}
/*
 * Xccessors Standard: Cross-browser ECMAScript 5 accessors
 * http://purl.eligrey.com/github/Xccessors
 * 
 * 2010-06-21
 * 
 * By Eli Grey, http://eligrey.com
 * 
 * A shim that partially implements Object.defineProperty,
 * Object.getOwnPropertyDescriptor, and Object.defineProperties in browsers that have
 * legacy __(define|lookup)[GS]etter__ support.
 * 
 * Licensed under the X11/MIT License
 *   See LICENSE.md
*/

// Removed a few JSLint options as Notepad++ JSLint validator complaining and 
//   made comply with JSLint; also moved 'use strict' inside function
/*jslint white: true, undef: true, plusplus: true,
  bitwise: true, regexp: true, newcap: true, maxlen: 90 */

/*! @source http://purl.eligrey.com/github/Xccessors/blob/master/xccessors-standard.js*/

(function () {
    'use strict';
    var ObjectProto = Object.prototype,
    defineGetter = ObjectProto.__defineGetter__,
    defineSetter = ObjectProto.__defineSetter__,
    lookupGetter = ObjectProto.__lookupGetter__,
    lookupSetter = ObjectProto.__lookupSetter__,
    hasOwnProp = ObjectProto.hasOwnProperty;
    
    if (defineGetter && defineSetter && lookupGetter && lookupSetter) {

        if (!Object.defineProperty) {
            Object.defineProperty = function (obj, prop, descriptor) {
                if (arguments.length < 3) { // all arguments required
                    throw new TypeError("Arguments not optional");
                }
                
                prop += ""; // convert prop to string

                if (hasOwnProp.call(descriptor, "value")) {
                    if (!lookupGetter.call(obj, prop) && !lookupSetter.call(obj, prop)) {
                        // data property defined and no pre-existing accessors
                        obj[prop] = descriptor.value;
                    }

                    if ((hasOwnProp.call(descriptor, "get") ||
                         hasOwnProp.call(descriptor, "set"))) 
                    {
                        // descriptor has a value prop but accessor already exists
                        throw new TypeError("Cannot specify an accessor and a value");
                    }
                }

                // can't switch off these features in ECMAScript 3
                // so throw a TypeError if any are false
                if (!(descriptor.writable && descriptor.enumerable && 
                    descriptor.configurable))
                {
                    throw new TypeError(
                        "This implementation of Object.defineProperty does not support" +
                        " false for configurable, enumerable, or writable."
                    );
                }
                
                if (descriptor.get) {
                    defineGetter.call(obj, prop, descriptor.get);
                }
                if (descriptor.set) {
                    defineSetter.call(obj, prop, descriptor.set);
                }
            
                return obj;
            };
        }

        if (!Object.getOwnPropertyDescriptor) {
            Object.getOwnPropertyDescriptor = function (obj, prop) {
                if (arguments.length < 2) { // all arguments required
                    throw new TypeError("Arguments not optional.");
                }
                
                prop += ""; // convert prop to string

                var descriptor = {
                    configurable: true,
                    enumerable  : true,
                    writable    : true
                },
                getter = lookupGetter.call(obj, prop),
                setter = lookupSetter.call(obj, prop);

                if (!hasOwnProp.call(obj, prop)) {
                    // property doesn't exist or is inherited
                    return descriptor;
                }
                if (!getter && !setter) { // not an accessor so return prop
                    descriptor.value = obj[prop];
                    return descriptor;
                }

                // there is an accessor, remove descriptor.writable;
                // populate descriptor.get and descriptor.set (IE's behavior)
                delete descriptor.writable;
                descriptor.get = descriptor.set = undefined;
                
                if (getter) {
                    descriptor.get = getter;
                }
                if (setter) {
                    descriptor.set = setter;
                }
                
                return descriptor;
            };
        }

        if (!Object.defineProperties) {
            Object.defineProperties = function (obj, props) {
                var prop;
                for (prop in props) {
                    if (hasOwnProp.call(props, prop)) {
                        Object.defineProperty(obj, prop, props[prop]);
                    }
                }
            };
        }
    }
}());

// Begin dataset code

if (!document.documentElement.dataset && 
         // FF is empty while IE gives empty object
        (!Object.getOwnPropertyDescriptor(Element.prototype, 'dataset')  ||
        !Object.getOwnPropertyDescriptor(Element.prototype, 'dataset').get)
    ) {
    var propDescriptor = {
        enumerable: true,
        get: function () {
            'use strict';
            var i, 
                that = this,
                HTML5_DOMStringMap, 
                attrVal, attrName, propName,
                attribute,
                attributes = this.attributes,
                attsLength = attributes.length,
                toUpperCase = function (n0) {
                    return n0.charAt(1).toUpperCase();
                },
                getter = function () {
                    return this;
                },
                setter = function (attrName, value) {
                    return (typeof value !== 'undefined') ? 
                        this.setAttribute(attrName, value) : 
                        this.removeAttribute(attrName);
                };
            try { // Simulate DOMStringMap w/accessor support
                // Test setting accessor on normal object
                ({}).__defineGetter__('test', function () {});
                HTML5_DOMStringMap = {};
            }
            catch (e1) { // Use a DOM object for IE8
                HTML5_DOMStringMap = document.createElement('div');
            }
            for (i = 0; i < attsLength; i++) {
                attribute = attributes[i];
                // Fix: This test really should allow any XML Name without 
                //         colons (and non-uppercase for XHTML)
                if (attribute && attribute.name && 
                    (/^data-\w[\w\-]*$/).test(attribute.name)) {
                    attrVal = attribute.value;
                    attrName = attribute.name;
                    // Change to CamelCase
                    propName = attrName.substr(5).replace(/-./g, toUpperCase);
                    try {
                        Object.defineProperty(HTML5_DOMStringMap, propName, {
                            enumerable: this.enumerable,
                            get: getter.bind(attrVal || ''),
                            set: setter.bind(that, attrName)
                        });
                    }
                    catch (e2) { // if accessors are not working
                        HTML5_DOMStringMap[propName] = attrVal;
                    }
                }
            }
            return HTML5_DOMStringMap;
        }
    };
    try {
        // FF enumerates over element's dataset, but not 
        //   Element.prototype.dataset; IE9 iterates over both
        Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
    } catch (e) {
        propDescriptor.enumerable = false; // IE8 does not allow setting to true
        Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
    }
}
if (!document.querySelectorAll) {
  document.querySelectorAll = function (selectors) {
    var style = document.createElement('style'), elements = [], element;
    document.documentElement.firstChild.appendChild(style);
    document._qsa = [];

    style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
    window.scrollBy(0, 0);
    style.parentNode.removeChild(style);

    while (document._qsa.length) {
      element = document._qsa.shift();
      element.style.removeAttribute('x-qsa');
      elements.push(element);
    }
    document._qsa = null;
    return elements;
  };
}

if (!document.querySelector) {
  document.querySelector = function (selectors) {
    var elements = document.querySelectorAll(selectors);
    return (elements.length) ? elements[0] : null;
  };
}
/*!
Copyright (C) 2013-2015 by WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
(function(window){
  /*! (C) WebReflection Mit Style License */
  if (document.createEvent) return;
  var
    DUNNOABOUTDOMLOADED = true,
    READYEVENTDISPATCHED = false,
    ONREADYSTATECHANGE = 'onreadystatechange',
    DOMCONTENTLOADED = 'DOMContentLoaded',
    SECRET = '__IE8__' + Math.random(),
    // Object = window.Object,
    defineProperty = Object.defineProperty ||
    // just in case ...
    function (object, property, descriptor) {
      object[property] = descriptor.value;
    },
    defineProperties = Object.defineProperties ||
    // IE8 implemented defineProperty but not the plural...
    function (object, descriptors) {
      for(var key in descriptors) {
        if (hasOwnProperty.call(descriptors, key)) {
          try {
            defineProperty(object, key, descriptors[key]);
          } catch(o_O) {
            if (window.console) {
              console.log(key + ' failed on object:', object, o_O.message);
            }
          }
        }
      }
    },
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    // here IE7 will break like a charm
    ElementPrototype = window.Element.prototype,
    TextPrototype = window.Text.prototype,
    // none of above native constructors exist/are exposed
    possiblyNativeEvent = /^[a-z]+$/,
    // ^ actually could probably be just /^[a-z]+$/
    readyStateOK = /loaded|complete/,
    types = {},
    div = document.createElement('div'),
    html = document.documentElement,
    removeAttribute = html.removeAttribute,
    setAttribute = html.setAttribute,
    valueDesc = function (value) {
      return {
        enumerable: true,
        writable: true,
        configurable: true,
        value: value
      };
    }
  ;

  function commonEventLoop(currentTarget, e, $handlers, synthetic) {
    for(var
      handler,
      continuePropagation,
      handlers = $handlers.slice(),
      evt = enrich(e, currentTarget),
      i = 0, length = handlers.length; i < length; i++
    ) {
      handler = handlers[i];
      if (typeof handler === 'object') {
        if (typeof handler.handleEvent === 'function') {
          handler.handleEvent(evt);
        }
      } else {
        handler.call(currentTarget, evt);
      }
      if (evt.stoppedImmediatePropagation) break;
    }
    continuePropagation = !evt.stoppedPropagation;
    /*
    if (continuePropagation && !synthetic && !live(currentTarget)) {
      evt.cancelBubble = true;
    }
    */
    return (
      synthetic &&
      continuePropagation &&
      currentTarget.parentNode
    ) ?
      currentTarget.parentNode.dispatchEvent(evt) :
      !evt.defaultPrevented
    ;
  }

  function commonDescriptor(get, set) {
    return {
      // if you try with enumerable: true
      // IE8 will miserably fail
      configurable: true,
      get: get,
      set: set
    };
  }

  function commonTextContent(protoDest, protoSource, property) {
    var descriptor = getOwnPropertyDescriptor(
      protoSource || protoDest, property
    );
    defineProperty(
      protoDest,
      'textContent',
      commonDescriptor(
        function () {
          return descriptor.get.call(this);
        },
        function (textContent) {
          descriptor.set.call(this, textContent);
        }
      )
    );
  }

  function enrich(e, currentTarget) {
    e.currentTarget = currentTarget;
    e.eventPhase = (
      // AT_TARGET : BUBBLING_PHASE
      e.target === e.currentTarget ? 2 : 3
    );
    return e;
  }

  function find(array, value) {
    var i = array.length;
    while(i-- && array[i] !== value);
    return i;
  }

  function getTextContent() {
    if (this.tagName === 'BR') return '\n';
    var
      textNode = this.firstChild,
      arrayContent = []
    ;
    while(textNode) {
      if (textNode.nodeType !== 8 && textNode.nodeType !== 7) {
        arrayContent.push(textNode.textContent);
      }
      textNode = textNode.nextSibling;
    }
    return arrayContent.join('');
  }

  function live(self) {
    return self.nodeType !== 9 && html.contains(self);
  }

  function onkeyup(e) {
    var evt = document.createEvent('Event');
    evt.initEvent('input', true, true);
    (e.srcElement || e.fromElement || document).dispatchEvent(evt);
  }

  function onReadyState(e) {
    if (!READYEVENTDISPATCHED && readyStateOK.test(
      document.readyState
    )) {
      READYEVENTDISPATCHED = !READYEVENTDISPATCHED;
      document.detachEvent(ONREADYSTATECHANGE, onReadyState);
      e = document.createEvent('Event');
      e.initEvent(DOMCONTENTLOADED, true, true);
      document.dispatchEvent(e);
    }
  }

  function pageGetter(coord) {
    var
      Dir = (coord === 'X' ? 'Left' : 'Top'),
      clientXY = 'client' + coord,
      clientLR = 'client' + Dir,
      scrollLR = 'scroll' + Dir,
      secretXY = '_@' + clientXY
    ;
    return function get() {
      /* jshint validthis:true */
      return  this[secretXY] || (
        this[secretXY] = (
          this[clientXY] + (
            html[scrollLR] || (document.body && document.body[scrollLR]) || 0
          ) -
          html[clientLR]
        )
      );
    };
  }

  function setTextContent(textContent) {
    var node;
    while ((node = this.lastChild)) {
      this.removeChild(node);
    }
    /*jshint eqnull:true */
    if (textContent != null) {
      this.appendChild(document.createTextNode(textContent));
    }
  }

  function verify(self, e) {
    if (!e) {
      e = window.event;
    }
    if (!e.target) {
      e.target = e.srcElement || e.fromElement || document;
    }
    if (!e.timeStamp) {
      e.timeStamp = (new Date()).getTime();
    }
    return e;
  }

  // normalized textContent for:
  //  comment, script, style, text, title
  commonTextContent(
    window.HTMLCommentElement.prototype,
    ElementPrototype,
    'nodeValue'
  );

  commonTextContent(
    window.HTMLScriptElement.prototype,
    null,
    'text'
  );

  commonTextContent(
    TextPrototype,
    null,
    'nodeValue'
  );

  commonTextContent(
    window.HTMLTitleElement.prototype,
    null,
    'text'
  );

  defineProperty(
    window.HTMLStyleElement.prototype,
    'textContent',
    (function(descriptor){
      return commonDescriptor(
        function () {
          return descriptor.get.call(this.styleSheet);
        },
        function (textContent) {
          descriptor.set.call(this.styleSheet, textContent);
        }
      );
    }(getOwnPropertyDescriptor(window.CSSStyleSheet.prototype, 'cssText')))
  );

  defineProperties(
    ElementPrototype,
    {
      // bonus
      textContent: {
        get: getTextContent,
        set: setTextContent
      },
      // http://www.w3.org/TR/ElementTraversal/#interface-elementTraversal
      firstElementChild: {
        get: function () {
          for(var
            childNodes = this.childNodes || [],
            i = 0, length = childNodes.length;
            i < length; i++
          ) {
            if (childNodes[i].nodeType == 1) return childNodes[i];
          }
        }
      },
      lastElementChild: {
        get: function () {
          for(var
            childNodes = this.childNodes || [],
            i = childNodes.length;
            i--;
          ) {
            if (childNodes[i].nodeType == 1) return childNodes[i];
          }
        }
      },
      oninput: {
        get: function () {
          return this._oninput || null;
        },
        set: function (oninput) {
          if (this._oninput) {
            this.removeEventListener('input', this._oninput);
            this._oninput = oninput;
            if (oninput) {
              this.addEventListener('input', oninput);
            }
          }
        }
      },
      previousElementSibling: {
        get: function () {
          var previousElementSibling = this.previousSibling;
          while (previousElementSibling && previousElementSibling.nodeType != 1) {
            previousElementSibling = previousElementSibling.previousSibling;
          }
          return previousElementSibling;
        }
      },
      nextElementSibling: {
        get: function () {
          var nextElementSibling = this.nextSibling;
          while (nextElementSibling && nextElementSibling.nodeType != 1) {
            nextElementSibling = nextElementSibling.nextSibling;
          }
          return nextElementSibling;
        }
      },
      childElementCount: {
        get: function () {
          for(var
            count = 0,
            childNodes = this.childNodes || [],
            i = childNodes.length; i--; count += childNodes[i].nodeType == 1
          );
          return count;
        }
      },
      /*
      // children would be an override
      // IE8 already supports them but with comments too
      // not just nodeType 1
      children: {
        get: function () {
          for(var
            children = [],
            childNodes = this.childNodes || [],
            i = 0, length = childNodes.length;
            i < length; i++
          ) {
            if (childNodes[i].nodeType == 1) {
              children.push(childNodes[i]);
            }
          }
          return children;
        }
      },
      */
      // DOM Level 2 EventTarget methods and events
      addEventListener: valueDesc(function (type, handler, capture) {
        if (typeof handler !== 'function' && typeof handler !== 'object') return;
        var
          self = this,
          ontype = 'on' + type,
          temple =  self[SECRET] ||
                      defineProperty(
                        self, SECRET, {value: {}}
                      )[SECRET],
          currentType = temple[ontype] || (temple[ontype] = {}),
          handlers  = currentType.h || (currentType.h = []),
          e, attr
        ;
        if (!hasOwnProperty.call(currentType, 'w')) {
          currentType.w = function (e) {
            // e[SECRET] is a silent notification needed to avoid
            // fired events during live test
            return e[SECRET] || commonEventLoop(self, verify(self, e), handlers, false);
          };
          // if not detected yet
          if (!hasOwnProperty.call(types, ontype)) {
            // and potentially a native event
            if(possiblyNativeEvent.test(type)) {
              // do this heavy thing
              try {
                // TODO:  should I consider tagName too so that
                //        INPUT[ontype] could be different ?
                e = document.createEventObject();
                // do not clone ever a node
                // specially a document one ...
                // use the secret to ignore them all
                e[SECRET] = true;
                // document a part if a node has never been
                // added to any other node, fireEvent might
                // behave very weirdly (read: trigger unspecified errors)
                if (self.nodeType != 9) {
                  /*jshint eqnull:true */
                  if (self.parentNode == null) {
                    div.appendChild(self);
                  }
                  if ((attr = self.getAttribute(ontype))) {
                    removeAttribute.call(self, ontype);
                  }
                }
                self.fireEvent(ontype, e);
                types[ontype] = true;
              } catch(meh) {
                types[ontype] = false;
                while (div.hasChildNodes()) {
                  div.removeChild(div.firstChild);
                }
              }
              if (attr != null) {
                setAttribute.call(self, ontype, attr);
              }
            } else {
              // no need to bother since
              // 'x-event' ain't native for sure
              types[ontype] = false;
            }
          }
          if ((currentType.n = types[ontype])) {
            self.attachEvent(ontype, currentType.w);
          }
        }
        if (find(handlers, handler) < 0) {
          handlers[capture ? 'unshift' : 'push'](handler);
        }
        if (type === 'input') {
          self.attachEvent('onkeyup', onkeyup);
        }
      }),
      dispatchEvent: valueDesc(function (e) {
        var
          self = this,
          ontype = 'on' + e.type,
          temple =  self[SECRET],
          currentType = temple && temple[ontype],
          valid = !!currentType,
          parentNode
        ;
        if (!e.target) e.target = self;
        return (valid ? (
          currentType.n /* && live(self) */ ?
            self.fireEvent(ontype, e) :
            commonEventLoop(
              self,
              e,
              currentType.h,
              true
            )
        ) : (
          (parentNode = self.parentNode) /* && live(self) */ ?
            parentNode.dispatchEvent(e) :
            true
        )), !e.defaultPrevented;
      }),
      removeEventListener: valueDesc(function (type, handler, capture) {
        if (typeof handler !== 'function' && typeof handler !== 'object') return;
        var
          self = this,
          ontype = 'on' + type,
          temple =  self[SECRET],
          currentType = temple && temple[ontype],
          handlers = currentType && currentType.h,
          i = handlers ? find(handlers, handler) : -1
        ;
        if (-1 < i) handlers.splice(i, 1);
      })
    }
  );

  /* this is not needed in IE8
  defineProperties(window.HTMLSelectElement.prototype, {
    value: {
      get: function () {
        return this.options[this.selectedIndex].value;
      }
    }
  });
  //*/

  // EventTarget methods for Text nodes too
  defineProperties(TextPrototype, {
    addEventListener: valueDesc(ElementPrototype.addEventListener),
    dispatchEvent: valueDesc(ElementPrototype.dispatchEvent),
    removeEventListener: valueDesc(ElementPrototype.removeEventListener)
  });

  defineProperties(
    window.XMLHttpRequest.prototype,
    {
      addEventListener: valueDesc(function (type, handler, capture) {
        var
          self = this,
          ontype = 'on' + type,
          temple =  self[SECRET] ||
                      defineProperty(
                        self, SECRET, {value: {}}
                      )[SECRET],
          currentType = temple[ontype] || (temple[ontype] = {}),
          handlers  = currentType.h || (currentType.h = [])
        ;
        if (find(handlers, handler) < 0) {
          if (!self[ontype]) {
            self[ontype] = function () {
              var e = document.createEvent('Event');
              e.initEvent(type, true, true);
              self.dispatchEvent(e);
            };
          }
          handlers[capture ? 'unshift' : 'push'](handler);
        }
      }),
      dispatchEvent: valueDesc(function (e) {
        var
          self = this,
          ontype = 'on' + e.type,
          temple =  self[SECRET],
          currentType = temple && temple[ontype],
          valid = !!currentType
        ;
        return valid && (
          currentType.n /* && live(self) */ ?
            self.fireEvent(ontype, e) :
            commonEventLoop(
              self,
              e,
              currentType.h,
              true
            )
        );
      }),
      removeEventListener: valueDesc(ElementPrototype.removeEventListener)
    }
  );

  defineProperties(
    window.Event.prototype,
    {
      bubbles: valueDesc(true),
      cancelable: valueDesc(true),
      preventDefault: valueDesc(function () {
        if (this.cancelable) {
          this.defaultPrevented = true;
          this.returnValue = false;
        }
      }),
      stopPropagation: valueDesc(function () {
        this.stoppedPropagation = true;
        this.cancelBubble = true;
      }),
      stopImmediatePropagation: valueDesc(function () {
        this.stoppedImmediatePropagation = true;
        this.stopPropagation();
      }),
      initEvent: valueDesc(function(type, bubbles, cancelable){
        this.type = type;
        this.bubbles = !!bubbles;
        this.cancelable = !!cancelable;
        if (!this.bubbles) {
          this.stopPropagation();
        }
      }),
      pageX: {get: pageGetter('X')},
      pageY: {get: pageGetter('Y')}
    }
  );

  defineProperties(
    window.HTMLDocument.prototype,
    {
      defaultView: {
        get: function () {
          return this.parentWindow;
        }
      },
      textContent: {
        get: function () {
          return this.nodeType === 11 ? getTextContent.call(this) : null;
        },
        set: function (textContent) {
          if (this.nodeType === 11) {
            setTextContent.call(this, textContent);
          }
        }
      },
      addEventListener: valueDesc(function(type, handler, capture) {
        var self = this;
        ElementPrototype.addEventListener.call(self, type, handler, capture);
        // NOTE:  it won't fire if already loaded, this is NOT a $.ready() shim!
        //        this behaves just like standard browsers
        if (
          DUNNOABOUTDOMLOADED &&
          type === DOMCONTENTLOADED &&
          !readyStateOK.test(
            self.readyState
          )
        ) {
          DUNNOABOUTDOMLOADED = false;
          self.attachEvent(ONREADYSTATECHANGE, onReadyState);
          /* global top */
          if (window == top) {
            (function gonna(e){try{
              self.documentElement.doScroll('left');
              onReadyState();
              }catch(o_O){
              setTimeout(gonna, 50);
            }}());
          }
        }
      }),
      dispatchEvent: valueDesc(ElementPrototype.dispatchEvent),
      removeEventListener: valueDesc(ElementPrototype.removeEventListener),
      createEvent: valueDesc(function(Class){
        var e;
        if (Class !== 'Event') throw new Error('unsupported ' + Class);
        e = document.createEventObject();
        e.timeStamp = (new Date()).getTime();
        return e;
      })
    }
  );

  defineProperties(
    window.Window.prototype,
    {
      getComputedStyle: valueDesc(function(){

        var // partially grabbed from jQuery and Dean's hack
          notpixel = /^(?:[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/,
          position = /^(top|right|bottom|left)$/,
          re = /\-([a-z])/g,
          place = function (match, $1) {
            return $1.toUpperCase();
          }
        ;

        function ComputedStyle(_) {
          this._ = _;
        }

        ComputedStyle.prototype.getPropertyValue = function (name) {
          var
            el = this._,
            style = el.style,
            currentStyle = el.currentStyle,
            runtimeStyle = el.runtimeStyle,
            result,
            left,
            rtLeft
          ;
          name = (name === 'float' ? 'style-float' : name).replace(re, place);
          result = currentStyle ? currentStyle[name] : style[name];
          if (notpixel.test(result) && !position.test(name)) {
            left = style.left;
            rtLeft = runtimeStyle && runtimeStyle.left;
            if (rtLeft) {
              runtimeStyle.left = currentStyle.left;
            }
            style.left = name === 'fontSize' ? '1em' : result;
            result = style.pixelLeft + 'px';
            style.left = left;
            if (rtLeft) {
              runtimeStyle.left = rtLeft;
            }
          }
          /*jshint eqnull:true */
          return result == null ?
            result : ((result + '') || 'auto');
        };

        // unsupported
        function PseudoComputedStyle() {}
        PseudoComputedStyle.prototype.getPropertyValue = function () {
          return null;
        };

        return function (el, pseudo) {
          return pseudo ?
            new PseudoComputedStyle(el) :
            new ComputedStyle(el);
        };

      }()),

      addEventListener: valueDesc(function (type, handler, capture) {
        var
          self = window,
          ontype = 'on' + type,
          handlers
        ;
        if (!self[ontype]) {
          self[ontype] = function(e) {
            return commonEventLoop(self, verify(self, e), handlers, false);
          };
        }
        handlers = self[ontype][SECRET] || (
          self[ontype][SECRET] = []
        );
        if (find(handlers, handler) < 0) {
          handlers[capture ? 'unshift' : 'push'](handler);
        }
      }),
      dispatchEvent: valueDesc(function (e) {
        var method = window['on' + e.type];
        return method ? method.call(window, e) !== false && !e.defaultPrevented : true;
      }),
      removeEventListener: valueDesc(function (type, handler, capture) {
        var
          ontype = 'on' + type,
          handlers = (window[ontype] || Object)[SECRET],
          i = handlers ? find(handlers, handler) : -1
         ;
        if (-1 < i) handlers.splice(i, 1);
      })
    }
  );

  (function (styleSheets, HTML5Element, i) {
    for (i = 0; i < HTML5Element.length; i++) document.createElement(HTML5Element[i]);
    if (!styleSheets.length) document.createStyleSheet('');
    styleSheets[0].addRule(HTML5Element.join(','), 'display:block;');
  }(document.styleSheets, ['header', 'nav', 'section', 'article', 'aside', 'footer']));
}(this.window || global));
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20150312
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

// Full polyfill for browsers with no classList support
// Including IE < Edge missing SVGElement.classList
if (!("classList" in document.createElement("_")) 
    || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
      classListProp = "classList"
    , protoProp = "prototype"
    , elemCtrProto = view.Element[protoProp]
    , objCtr = Object
    , strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
    }
    , arrIndexOf = Array[protoProp].indexOf || function (item) {
        var
              i = 0
            , len = this.length
        ;
        for (; i < len; i++) {
            if (i in this && this[i] === item) {
                return i;
            }
        }
        return -1;
    }
    // Vendors: please allow content code to instantiate DOMExceptions
    , DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
    }
    , checkTokenAndGetIndex = function (classList, token) {
        if (token === "") {
            throw new DOMEx(
                  "SYNTAX_ERR"
                , "An invalid or illegal string was specified"
            );
        }
        if (/\s/.test(token)) {
            throw new DOMEx(
                  "INVALID_CHARACTER_ERR"
                , "String contains an invalid character"
            );
        }
        return arrIndexOf.call(classList, token);
    }
    , ClassList = function (elem) {
        var
              trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
            , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
            , i = 0
            , len = classes.length
        ;
        for (; i < len; i++) {
            this.push(classes[i]);
        }
        this._updateClassName = function () {
            elem.setAttribute("class", this.toString());
        };
    }
    , classListProto = ClassList[protoProp] = []
    , classListGetter = function () {
        return new ClassList(this);
    }
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
    return this[i] || null;
};
classListProto.contains = function (token) {
    token += "";
    return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
    var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
    ;
    do {
        token = tokens[i] + "";
        if (checkTokenAndGetIndex(this, token) === -1) {
            this.push(token);
            updated = true;
        }
    }
    while (++i < l);

    if (updated) {
        this._updateClassName();
    }
};
classListProto.remove = function () {
    var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        , index
    ;
    do {
        token = tokens[i] + "";
        index = checkTokenAndGetIndex(this, token);
        while (index !== -1) {
            this.splice(index, 1);
            updated = true;
            index = checkTokenAndGetIndex(this, token);
        }
    }
    while (++i < l);

    if (updated) {
        this._updateClassName();
    }
};
classListProto.toggle = function (token, force) {
    token += "";

    var
          result = this.contains(token)
        , method = result ?
            force !== true && "remove"
        :
            force !== false && "add"
    ;

    if (method) {
        this[method](token);
    }

    if (force === true || force === false) {
        return force;
    } else {
        return !result;
    }
};
classListProto.toString = function () {
    return this.join(" ");
};

if (objCtr.defineProperty) {
    var classListPropDesc = {
          get: classListGetter
        , enumerable: true
        , configurable: true
    };
    try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
    } catch (ex) { // IE 8 doesn't support enumerable:true
        if (ex.number === -0x7FF5EC54) {
            classListPropDesc.enumerable = false;
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
    }
} else if (objCtr[protoProp].__defineGetter__) {
    elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

} else {
// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
    "use strict";

    var testElement = document.createElement("_");

    testElement.classList.add("c1", "c2");

    // Polyfill for IE 10/11 and Firefox <26, where classList.add and
    // classList.remove exist but support only one argument at a time.
    if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
            var original = DOMTokenList.prototype[method];

            DOMTokenList.prototype[method] = function(token) {
                var i, len = arguments.length;

                for (i = 0; i < len; i++) {
                    token = arguments[i];
                    original.call(this, token);
                }
            };
        };
        createMethod('add');
        createMethod('remove');
    }

    testElement.classList.toggle("c3", false);

    // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
    // support the second argument.
    if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
            if (1 in arguments && !this.contains(token) === !force) {
                return force;
            } else {
                return _toggle.call(this, token);
            }
        };

    }

    testElement = null;
}());

}

}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal 
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) 
    //    where Array is the standard built-in constructor with that name and 
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal 
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal 
        //     method of callback with T as the this value and argument 
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception. 
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}
// POLYFILLS IE8

// Object.create Partial Polyfill
// Support for second parameter is non-standard
if (typeof Object.create !== 'function') {
    Object.create = function(o, props) {
        // Create new object whose prototype is o
        function F() {}
        F.prototype = o;
        result = new F();
        // Copy properties of second parameter into new object
        if (typeof(props) === "object") {
            for (prop in props) {
                if (props.hasOwnProperty((prop))) {
                    // Even though we don't support all of the functionality that the second
                    // parameter would normally have, we respect the format for the object
                    // passed as that second parameter its specification.
                    result[prop] = props[prop].value;
                }
            }
        }
        // Return new object
        return result;
    };
}

/**
 * Polyfill for Object.keys
 *
 * @see: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys
 */
if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;
 
    return function (obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');
 
      var result = [];
 
      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop);
      }
 
      if (hasDontEnumBug) {
        for (var i=0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
        }
      }
      return result;
    }
  })()
};
if (typeof Object.getPrototypeOf !== "function") {
    if (typeof "test".__proto__ === "object") {
        Object.getPrototypeOf = function(object) {
            return object.__proto__;
        };
    } else {
        Object.getPrototypeOf = function(object) {
            // May break if the constructor has been tampered with
            return object.constructor.prototype;
        };
    }
}
window.oem = {};
window.oem.Core = {};
window.oem.Components = {};
(function(CORE) { 

    function Prototype(proto, settings) {

        // default settins
        var settings = settings || {};

        // init properties object
        var propertiesObject = {};

        // apply overwrites
        for (var setting in settings) {
            propertiesObject[setting] = {
                value: settings[setting]
            };
        }

        // create Object of component and apply overwrite object (propertiesObject)
        var componentObject = Object.create(proto, propertiesObject);

        // create a super object for super calling yo
        componentObject.super = Object.getPrototypeOf(proto);

        // attach instance to element
        return componentObject;

    };

    CORE.Prototype = Prototype;
    return CORE;

})(oem.Core);
/**
 *
 * @class   El
 * @desc    Simple DOM element tool
 * example
 * var grandchild = el("div", {class:"subchild"}, "grandchild");
 * var child1 = el("div", { class:"child"}, ["child1", grandchild]);
 * var child2 = el("div", { class:"child"}, "child2");
 * var parent = el("div", { class: "parent" }, ["parents just don't understand", child1, child2]);
 * 
 * // result
 * <div class="parent">
 *     parents just don't understand
 *    <div class="child">
 *        child1
 *        <div class="subchild">
 *            grandchild
 *        </div>
 *    </div>
 *   <div class="child">
 *       child2
 *   </div>
 * </div>
 */



(function(CORE) { 

    function El(tag, attrs, content) {

        // convert content to an array
        var content = content || "";
        content = content instanceof Array ? content : [content];

        var attrs = attrs || {};

        // create tag
        var el = el || document.createElement(tag);

        // add attributes
        Object.keys(attrs).forEach(function addAttr(attr){
            el.setAttribute(attr, attrs[attr]);
        });

        function addContent(content){
            if(typeof content === "string" || content instanceof String){
                var content = document.createTextNode(content);
            }
            el.appendChild(content);
        }
      
        content.forEach(addContent);

        return el;
 
    }

    CORE.El = El;
    return CORE;

})(oem.Core);
(function(CORE){

    function Log() {
        // logging enabled by the presence of the "logging" url parameter
        if(!CORE.Util.getUrlVars().logging) return false;
        try {
            console.log.apply(console, arguments);
        } catch(err){
            // alert(err);
            // noop
        }
    };

    CORE.Log = Log;
    return CORE;

})(oem.Core);
(function(CORE) {

    // Module
    var Util = {};

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing.
     *
     * @method     debounce
     * @param      {<type>}  func       { description }
     * @param      {<type>}  wait       { description }
     * @param      {<type>}  immediate  { description }
     * @return     {<type>}  { description_of_the_return_value }
     */
    Util.debounce = function Debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    /**
     * Implements "soft" mixin pattern by grafting an object onto another object
     * @param  {object} destination - object to graft onto
     * @param  {object} source      - object to graft from
     * @return {object}             - grafted destination
     */
    Util.mixin = function Extend(destination, source) {
        for (var k in source) {
            // append attr value if already exists in destination
            if (destination.hasOwnProperty(k)) {
                destination[k] = destination[k] + source[k];
            } else {
                destination[k] = source[k];
            }
        }
        return destination;
    };

    /**
     * Parses a json-esque string to an object
     * @param  {[type]} str turns this => "len:6, val:'test'" to this => {len: 6, val:"test"}
     * @return {[type]}     [description]
     */
    Util.parseStringToObject = function(str){
        var keyVals = {};
        if(str){
            str.split(",").forEach(function(keyVal){
                var keyVal = keyVal.split(":");
                keyVals[keyVal[0]] = Util.typeCast(keyVal[1]);
            });
        } 
        return keyVals;
    };

    /**
     * Generates a GUID string.
     * @returns {String} The generated GUID.
     * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
     * @author Slavik Meltser (slavik@meltser.info).
     * @link http://slavik.meltser.info/?p=142
     */
    Util.guid = function() {
        function _p8(s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    };

    /**
     * Convert array like object to array
     * @param  {object} arrayLikeObject 
     * @return {array}
     */
    Util.arrayFrom = function(arrayLikeObject) {
        var ary = [];
        for (var i = 0; i < arrayLikeObject.length; i++) {
            ary.push(arrayLikeObject[i]);
        }
        return ary;
    };

    /**
     * Get URL variables
     */
    Util.getUrlVars = function(urlVars) {
        var urlVars = urlVars || window.location.href;
        var vars = {};
        var search = function(m, key, value) { vars[key] = Util.typeCast(value); };
        var parts = urlVars.replace(/[?&]+([^=&]+)=([^&]*)/gi, search);
        return vars;
    };

    /**
     * Automatically cast string to proper javascript data type
     * // TODO add other type checking, for now we only translate strings, numbers and floats
     * @return {[type]} [description]
     */
    Util.typeCast = function(str){

        // is it an integer?
        if(parseInt(str) == str) return parseInt(str);

        // is it a float?
        if(parseFloat(str) == str) return parseFloat(str);

        // guess it's just a string
        return str;
    };

    CORE.Util = Util;
    return CORE;

})(oem.Core);
// USAGE
// adds event listener
// @type - string
// @callback - function
// @scope - the scope where the @callback is defined
// EventBus.addEventListener(type, callback, scope)

// removes event listener
// @type - string
// @callback - function
// @scope - the scope where the @callback is defined
// EventBus.removeEventListener(type, callback, scope)

// checks for listener
// @type - string
// @callback - function
// @scope - the scope where the @callback is defined
// EventBus.hasEventListener(type, callback, scope)

// dispatch an event
// @type - string
// @target - the caller
// @args - pass as many arguments as you want
// EventBus.dispatch(type, target, args ...)

// for debugging purpose, it just prints out the added listeners
(function(CORE) {

    function EventBus() {
        this.listeners = {};
    };

    EventBus.prototype = {
        addEventListener: function(type, callback, scope) {
            var args = [];
            var numOfArgs = arguments.length;
            for (var i = 0; i < numOfArgs; i++) {
                args.push(arguments[i]);
            }
            args = args.length > 3 ? args.splice(3, args.length - 1) : [];
            if (typeof this.listeners[type] != "undefined") {
                this.listeners[type].push({
                    scope: scope,
                    callback: callback,
                    args: args
                });
            } else {
                this.listeners[type] = [{
                    scope: scope,
                    callback: callback,
                    args: args
                }];
            }
        },
        removeEventListener: function(type, callback, scope) {
            if (typeof this.listeners[type] != "undefined") {
                var numOfCallbacks = this.listeners[type].length;
                var newArray = [];
                for (var i = 0; i < numOfCallbacks; i++) {
                    var listener = this.listeners[type][i];
                    if (listener.scope == scope && listener.callback == callback) {

                    } else {
                        newArray.push(listener);
                    }
                }
                this.listeners[type] = newArray;
            }
        },
        hasEventListener: function(type, callback, scope) {
            if (typeof this.listeners[type] != "undefined") {
                var numOfCallbacks = this.listeners[type].length;
                if (callback === undefined && scope === undefined) {
                    return numOfCallbacks > 0;
                }
                for (var i = 0; i < numOfCallbacks; i++) {
                    var listener = this.listeners[type][i];
                    if ((scope ? listener.scope == scope : true) && listener.callback == callback) {
                        return true;
                    }
                }
            }
            return false;
        },
        dispatch: function(type, target, data) {
            var numOfListeners = 0;
            var event = {
                type: type,
                target: target,
                data: data
            };
            var args = [];
            var numOfArgs = arguments.length;
            for (var i = 0; i < numOfArgs; i++) {
                args.push(arguments[i]);
            };
            args = args.length > 2 ? args.splice(2, args.length - 1) : [];
            args = [event].concat(args);
            if (typeof this.listeners[type] != "undefined") {
                var numOfCallbacks = this.listeners[type].length;
                for (var i = 0; i < numOfCallbacks; i++) {
                    var listener = this.listeners[type][i];
                    if (listener && listener.callback) {
                        var concatArgs = args.concat(listener.args);
                        listener.callback.apply(listener.scope, concatArgs);
                        numOfListeners += 1;
                    }
                }
            }
        },
        getListeners: function() {
            return this.listeners;
        }
    };

    CORE.EventBus = EventBus;
    return CORE;

})(oem.Core);

(function(CORE) {

    var EVENTS = {
        DOCUMENT_READY: "DOCUMENT_READY",
        WINDOW_RESIZED: "WINDOW_RESIZED",
        WINDOW_SCROLLED: "WINDOW_SCROLLED",
        COMPONENTS_INITIALIZED: "COMPONENTS_INITIALIZED"
    };

    var Events = new CORE.EventBus();

    // when all dom content is loaded
    document.addEventListener("DOMContentLoaded", function(event) {
        Events.dispatch(EVENTS.DOCUMENT_READY, this);
        CORE.Log(EVENTS.DOCUMENT_READY);
    });

    // when the window is resized
    window.addEventListener("resize", CORE.Util.debounce(function() {
        Events.dispatch(EVENTS.WINDOW_RESIZED, this);
        CORE.Log(EVENTS.WINDOW_RESIZED);
    }, 250), true);
    
    // when the window is scrolled
    window.addEventListener("scroll", CORE.Util.debounce(function() {
        Events.dispatch(EVENTS.WINDOW_SCROLLED, this);
        CORE.Log(EVENTS.WINDOW_SCROLLED);
    }, 250), true);

    CORE.EVENTS = EVENTS;
    CORE.Events = Events;
    return CORE;

})(oem.Core);
/**
 *
 * @class   Component
 * @desc    Core prototype that all components should be prototyped from
 */

(function(CORE) {

    var Component = {};
    Component.el = null;
    Component.id = null;
    Component.type = "Component";
    Component.events = {};

    Component.init = function(){
        // overwrite in component prototype
    };

    // GETTERS

    Component.getId = function(){
        return this.id;
    };

    Component.getEl = function(){
        return this.el;
    };

    Component.getType = function(){
        return this.type;
    };

    Component.getEvents = function(){
        return this.events;
    };

    // SETTERS

    Component.setId = function(id){
        this.id = id || CORE.Modules.UTIL.guid();
        if(this.getEl()) this.getEl().dataset.oemId = id;            
        return this;
    };

    Component.setType = function(type){
        this.type = type;
        return this;
    };

    Component.setEl = function(el){
        this.el = el;
        return this;
    };

    Component.setEvents = function(events){
        this.events = events;
        return this;
    };

    CORE.Component = Component;
    return CORE;
    

})(oem.Core);


// Core oem object
(function (OEM, CORE, UTIL, PROTOTYPE, AUTO_INITIALIZER) {

    OEM.version = 1;

    /**
     * List all components
     */
    OEM.list = {
        all:{},
        byType: function (componentType) {
            var components = {};
            var component;
            for(var i in OEM.list.all){
                component = OEM.list.all[i];
                if(component.type === componentType){
                    components[i] = component;
                }
            }
            if (Object.keys(components).length === 0) return null; // return null if none found
            return components;
        }
    };

    /**
     * Create component
     * this is a creational mediator pattern which calls the root prototype
     * and creates' an instance
     */
    OEM.create = function (component, options) {

        // create a new original prototype off the provided component with supplied options
        var createdComponent = PROTOTYPE(component, options);
        createdComponent.setId(options.el.dataset.oemId || UTIL.guid());

        // add component to collection
        oem.list.all[createdComponent.getId()] = createdComponent;

        return createdComponent;
    };

    /**
     * Read and find components
     *
     * @param      {<type>}  component  The component
     */
    OEM.read = function (componentId) {
        return oem.list.all[componentId];
    };

    /**
     * Delete component instance and element from DOM
     */
    OEM.destroy = function (componentId) {
        var component = OEM.read(componentId);
        // call the component's own destroy method
        if(typeof component.destroy === "function") component.destroy();
        // remove any DOM elements
        var node = component.getEl();
        if (node.parentNode) node.parentNode.removeChild(node);
        // remove reference to component object
        delete oem.list.all[componentId];
        // remove component object
        delete component;
        return component;
    };

    /**
     * Mediator to internal initializer
     * @return {[type]} [description]
     */
    OEM.init = function(components){
        var components = components || oem.Components;
        AUTO_INITIALIZER.initializeAll(components);
        return components;
    };

    /**
     * Proxy to internal event bus and enum
     */
    OEM.events = CORE.Events;
    OEM.EVENTS = CORE.EVENTS;

    /**
     * Return components
     */
    return OEM;

})(
    oem,
    oem.Core,
    oem.Core.Util,
    oem.Core.Prototype,
    oem.Core.AutoInitializer
);
/**
 *
 * @module     AutoInitializer
 * @desc       Onload searches the DOM for any instances of components present in oem.Components
 *
 */

(function(CORE) {

    // Card component
    var AutoInitializer = {};

    /**
     * Collect all instances of this component type
     *
     * @method     collect
     * @param      {string}     selector   - base selector text
     * @param      {Component}  component  - Object of compoent
     */
    AutoInitializer.collect = function(component) {

        // we only initialize components with a Prototype object
        if(!component.Prototype) return false;

        // init vars
        var selector = '[data-oem="'+component.Prototype.type+'"]';
        var el;

        // find all components
        // create and store instances of each
        _components = document.querySelectorAll(selector);
        for (var i = 0; i < _components.length; i++) {
            el = _components[i];
            oem.create(component.Prototype, {el:el});
        }

    };

    /**
     * Collect all registered component types
     *
     * @method     collectAll
     */
    AutoInitializer.collectAll = function(components) {

        for (var component in components) {
            component = components[component];
            AutoInitializer.collect(component);
        }

        return this;
    };

    AutoInitializer.initializeAll = function(){
        for(var component in oem.list.all){
            oem.read(component).init();
        }

        // go tell it on the mountain
        oem.events.dispatch(CORE.EVENTS.COMPONENTS_INITIALIZED, this);
    };

    // collect on document ready
    CORE.Events.addEventListener(CORE.EVENTS.DOCUMENT_READY, function(){
        AutoInitializer.collectAll(oem.Components).initializeAll();
    });

    // exports
    CORE.AutoInitializer = AutoInitializer;
    return CORE;

})(oem.Core);
(function(COMPONENTS) {

    var Accordion = {};
    
    // exports
    COMPONENTS.Accordion = Accordion;
    return COMPONENTS;

})(oem.Components);
(function (COMPONENTS, PROTOTYPE, COMPONENT) {

    var Prototype = PROTOTYPE(COMPONENT, {
        type: "Accordion"
    });

    Prototype.init = function () {

        var that = this;
        this.items = [];
        this.dts = this.getEl().querySelectorAll('dt');
        this.dds = this.getEl().querySelectorAll('dd');

        // add items (use for loop to accomodate array like object collection)
        for(var i = 0; i < this.dts.length; i = i + 1 ){
            var item = new this.Item({
                term: this.getDts()[i].innerHTML,
                definition: this.getDts()[i].innerHTML,
                dt: this.getDts()[i],
                dd: this.getDds()[i],
                expanded: this.getDds()[i].classList.contains("expanded"),
                list: this
            });
            this.addItem(item);
        }

        return this;
    };

    Prototype.Item = function (options) {
        this.list = options.list;
        this.term = options.term;
        this.definition = options.definition;
        this.dt = options.dt;
        this.dd = options.dd;
        this.expanded = options.expanded;
        this.init();
        return this;
    };

    Prototype.Item.prototype = {
        init: function () {
            this.getDt().addEventListener('click', this.toggle.bind(this));
        },
        getTerm: function () {
            return this.term;
        },
        getDefinition: function () {
            return this.definition;
        },
        getDt: function () {
            return this.dt;
        },
        getDd: function () {
            return this.dd;
        },
        getList: function () {
            return this.list;
        },
        isExpanded: function () {
            return this.expanded;
        },
        setExpanded: function (expanded) {
            this.expanded = expanded;
        },
        toggle: function () {
            this.getList().collapseAll(this);
            if (this.isExpanded()) {
                this.collapse();
            } else {
                this.expand();
            }
            return this;
        },
        expand: function () {
            this.getDd().classList.add("expanded");
            this.getDt().classList.add("expanded");
            this.setExpanded(true);
            return this;
        },
        collapse: function () {
            this.getDd().classList.remove("expanded");
            this.getDt().classList.remove("expanded");
            this.setExpanded(false);
            return this;
        }
    };

    Prototype.getDds = function () {
        return this.dds;
    };

    Prototype.getDts = function () {
        return this.dts;
    };

    Prototype.getItems = function () {
        return this.items;
    };

    Prototype.getItem = function (i) {
        return this.getItems()[i];
    };

    Prototype.addItem = function (item) {
        this.getItems().push(item);
        return this;
    };

    Prototype.collapseAll = function (item) {
        this.getItems().forEach(function (currItem) {
            if (item.getTerm() != currItem.getTerm()) currItem.collapse();
        });
        return this;
    };

    COMPONENTS.Accordion.Prototype = Prototype;
    return COMPONENTS;

})(oem.Components, oem.Core.Prototype, oem.Core.Component);
(function(Components, Core) {

    var Button = {};
    
    // exports
    Components.Button = Button;
    return Components;

})(oem.Components, oem.Core);
(function(CORE, COMPONENTS) {

    var Prototype = CORE.Prototype(CORE.Component, {
        type: "Button"
    });
    
    // exports
    COMPONENTS.Button.Prototype = Prototype;
    return COMPONENTS;

})(oem.Core, oem.Components);
(function(COMPONENTS) {

    // Main component namespace
    var Progress = {};
    
    // exports
    COMPONENTS.Progress = Progress;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, COMPONENT, PROTOTYPE) {

    var Prototype = PROTOTYPE(COMPONENT, {
        type: "Progress"
    });

    Prototype.init = function(){
        this.progress = this.getEl().dataset.oemProgress || 0;
        this.barEl = this.getEl().querySelectorAll('.__bar')[0];
        this.updateProgress();
    };

    Prototype.getProgress = function(){
        return this.progress;
    };

    Prototype.getBarEl = function(){
        return this.barEl;
    };

    Prototype.setProgress = function(progress){
        if(progress > 100) this.progress = 100;
        if(progress < 0) this.progress = 0;
        if(progress < 100 && progress > 0) this.progress = progress;
        this.updateProgress();
        return this;
    };

    Prototype.updateProgress = function(){
        this.getBarEl().style.width = this.getProgress() + "%";
    };

    COMPONENTS.Progress.Prototype = Prototype;
    return COMPONENTS;

})(oem.Components, oem.Core.Component, oem.Core.Prototype);
(function(COMPONENTS) {

    // Main component namespace
    var DataTable = {};
    
    // exports
    COMPONENTS.DataTable = DataTable;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, COMPONENT, EL, PROTOTYPE, UTIL) {

    var Prototype = PROTOTYPE(COMPONENT, {
        type: "DataTable"
    });

    Prototype.DIRECTION = {};
    Prototype.DIRECTION.DESC = "DESC";
    Prototype.DIRECTION.ASC = "ASC";
    Prototype.SORT_BY = {};
    Prototype.SORT_BY.INTEGER = "INTEGER";
    Prototype.SORT_BY.ALPHA = "ALPHA";
    Prototype.SORT_BY.DATE = "DATE";

    Prototype.init = function(){
        var that = this;
        this.columns = this.getColumnsFromDOM();
        this.records = this.getRecordsFromDOM();

        // events
        UTIL.arrayFrom(this.getEl().querySelectorAll('thead th')).forEach(function(th, i){
            th.addEventListener('click', function(){
                that.handleClick(i);
            });
        });
    };

    Prototype.getColumns = function(){
        return this.columns;
    };

    Prototype.getColumnsFromDOM = function(){
        var that = this;
        return UTIL
        .arrayFrom(this.getEl().querySelectorAll('thead th'))
        .map(function(th){
            var direction;
            return {
                name: th.innerText,
                sortBy: th.dataset.oemSortBy || null,
                direction: that.DIRECTION.ASC
            }
        });
    };

    Prototype.getRecords = function(){
        return this.records;
    };

    Prototype.getRecordsFromDOM = function(){
        var that = this;
        var record, isRecord;
        var records = [];
        var trs = UTIL.arrayFrom(this.getEl().querySelectorAll('tbody tr'));
        for(var i = 0; i < trs.length; i++){
            record = {};
            UTIL.arrayFrom(trs[i].querySelectorAll('td')).forEach(function(td, col){
                record[that.columns[col].name] = UTIL.typeCast(td.innerHTML);
            });
            records.push(record);
        }
        return records;
    };

    Prototype.handleClick = function(col){

        var that = this;
        var column = this.columns[col];
        var headers = UTIL.arrayFrom(this.getEl().querySelectorAll('thead th'));
        var columnTh = headers[col];
        var isActive = columnTh.classList.contains('--sorted');

        // remove sort classes
        headers
        .forEach(function(th, i){
            th.classList.remove('--sorted');
        });

        // if this column is currently sorted, flip the direction
        if(isActive) {
            column.direction = column.direction === Prototype.DIRECTION.ASC ? Prototype.DIRECTION.DESC : Prototype.DIRECTION.ASC;
        }
        
        // add the right classes
        columnTh.classList.add('--sorted');

        // if asc, set classes
        if(column.direction === Prototype.DIRECTION.ASC) {
            columnTh.classList.add('--asc');
            columnTh.classList.remove('--desc');
        }

        // if desc, set classes
        if(column.direction === Prototype.DIRECTION.DESC) {
            columnTh.classList.add('--desc');
            columnTh.classList.remove('--asc');
        }

        // sort the records
        var sortedRecords = this.sortRecordsByColumn(column);

        // redraw the records
        this.redrawDOM(sortedRecords);
    };

    Prototype.redrawDOM = function(records){
        var that = this;
        var tr, td;
        var tbody = this.getEl().querySelectorAll('tbody')[0];

        // remove record rows from DOM
        UTIL.arrayFrom(tbody.querySelectorAll('tr')).forEach(function(tr, i){
            tr.parentNode.removeChild(tr);
        });
        
        // create DOM els and attach 
        records
        .map(function(record, recordIndex){
            return EL("tr", {}, that.columns.map(function(column, columnIndex){
                return EL("td", {}, record[column.name].toString());
            }));
        })
        .forEach(function(recordEl, recordElIndex){
            tbody.appendChild(recordEl);
        });
    };

    Prototype.sortRecordsByColumn = function(column){
        switch(column.sortBy){
            case Prototype.SORT_BY.INTEGER:
                return this.records.sort(function(a, b){
                    if(column.direction === Prototype.DIRECTION.ASC){
                        return a[column.name] - b[column.name];                        
                    } else {
                        return b[column.name] - a[column.name];
                    }
                });
            break;
            case Prototype.SORT_BY.ALPHA:
                return this.records.sort(function(a, b){
                    if(column.direction === Prototype.DIRECTION.ASC){
                        if(a[column.name] < b[column.name]) return -1;
                        if(a[column.name] > b[column.name]) return 1;
                        return 0;
                    } else {
                        if(a[column.name] < b[column.name]) return 1;
                        if(a[column.name] > b[column.name]) return -1;
                        return 0;
                    }
                });
            break;
            case Prototype.SORT_BY.DATE:
                return this.records.sort(function(a, b){
                    if(column.direction === Prototype.DIRECTION.ASC){
                        if(new Date(a[column.name]) > new Date(b[column.name])) return 1;
                        if(new Date(a[column.name]) < new Date(b[column.name])) return -1; 
                        return 0;                       
                    } else {
                        if(new Date(a[column.name]) > new Date(b[column.name])) return -1;
                        if(new Date(a[column.name]) < new Date(b[column.name])) return 1; 
                        return 0;
                    }
                });
            break;
        }
    };

    COMPONENTS.DataTable.Prototype = Prototype;
    return COMPONENTS;

})(
    oem.Components,
    oem.Core.Component,
    oem.Core.El,
    oem.Core.Prototype,
    oem.Core.Util
);
(function(COMPONENTS) {

    // Main component namespace
    var Dialog = {};
    
    // exports
    COMPONENTS.Dialog = Dialog;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, COMPONENT, PROTOTYPE) {

    var Prototype = PROTOTYPE(COMPONENT, {
        type: "Dialog"
    });

    Prototype.init = function(){
        this.width = this.getEl().dataset.oemWidth || 500;
        this.height = this.getEl().dataset.oemHeight || 360;
        this.fullScreenAt = parseInt(this.getEl().dataset.oemFullscreenAt) || 800;
        this.overflowY = this.getEl().dataset.oemOverflowY || "auto";
        this.contentEl = this.getEl().querySelectorAll('.__content')[0];
        this.backdropEl = this.getEl().querySelectorAll('.__backdrop')[0];

        // set overflowY
        this.setOverflowY();

        // events
        this.backdropEl.addEventListener('click', this.handleBackdropClick.bind(this));
        oem.events.addEventListener(oem.EVENTS.WINDOW_RESIZED, this.positionContentWindow.bind(this));
    };

    Prototype.close = function(){
        this.getEl().classList.remove('--showing');
        return this;
    };

    Prototype.getBackdropEl = function(){
        return this.backdropEl;
    };

    Prototype.getContentEl = function(){
        return this.contentEl;
    };

    Prototype.getFullscreenAt = function(){
        return this.fullScreenAt;
    };

    Prototype.getHeight = function(){
        return this.height;
    };

    Prototype.getOverflowY = function(){
        return this.overflowY;
    };

    Prototype.getWidth = function(){
        return this.width;
    };

    Prototype.handleBackdropClick = function(e){
        e.preventDefault();
        this.close();
    };

    Prototype.open = function(){
        this.positionContentWindow();
        this.getEl().classList.add('--showing');
        return this;
    };

    Prototype.positionContentWindow = function(){
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        var shouldBeFullScreen = this.getFullscreenAt() >= winWidth;
        var left = shouldBeFullScreen ? 0 : (winWidth - this.getWidth())/2 + "px";
        var top = shouldBeFullScreen ? 0 : (winHeight - this.getHeight())/2 + "px";
        var width = shouldBeFullScreen ? "100%" : this.getWidth() + "px";
        var height = shouldBeFullScreen ? "100%" : this.getHeight() + "px";
        this.getContentEl().style.left = left;
        this.getContentEl().style.top = top;
        this.getContentEl().style.width = width;
        this.getContentEl().style.height = height;
        return this;
    };

    Prototype.setFullscreenAt = function(fullScreenAt) {
        this.fullScreenAt = fullScreenAt;
        return this;
    }

    Prototype.setOverflowY = function(){
        this.getContentEl().style.overflowY = this.getOverflowY();
        return this;
    };

    COMPONENTS.Dialog.Prototype = Prototype;
    return COMPONENTS;

})(oem.Components, oem.Core.Component, oem.Core.Prototype);
(function(COMPONENTS) {

    // Main component namespace
    var Drawer = {};
    
    // exports
    COMPONENTS.Drawer = Drawer;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, COMPONENT, PROTOTYPE) {


    // PROTOTYPE
    // ========================================================
    // This is the main prototype class for this component. It is meant to:
    // 1) contain any/all functional behavior for this component.
    // 2) be prototyped into a new instance for each component
    var Prototype = PROTOTYPE(COMPONENT, {
        type: "Drawer"
    });

    Prototype.init = function(){
        this._isOpen = false;
        this.fullScreenAt = parseInt(this.getEl().dataset.oemFullScreenAt) || 0;

        var events = {};
        events.opened = this.getId() + ":opened";
        events.closed = this.getId() + ":closed";
        this.setEvents(events);

        oem.events.addEventListener(oem.EVENTS.WINDOW_RESIZED, this.manageFullScreen.bind(this));

        return this;
    };

    Prototype.close = function(){
        this.getEl().classList.remove('--open');
        oem.events.dispatch(this.getEvents().closed, this);
        this.setIsOpen(false);
        return this;
    };

    Prototype.getFullScreenAt = function(){
        return this.fullScreenAt;
    };

    Prototype.manageFullScreen = function(){
        var isFullScreen = window.innerWidth <= this.getFullScreenAt();
        if(isFullScreen) {
             this.getEl().classList.add('--fullscreen')
        } else {
             this.getEl().classList.remove('--fullscreen')
        }
        return this;
    };

    Prototype.isOpen = function(){
        return this._isOpen;
    };

    Prototype.open = function(){
        this.manageFullScreen();
        this.getEl().classList.add('--open');
        oem.events.dispatch(this.getEvents().opened, this);
        this.setIsOpen(true);
        return this;
    };

    Prototype.setFullScreenAt = function(fullscreenAt){
        this.fullScreenAt = fullScreenAt;
        return this;
    };

    Prototype.setIsOpen = function(isOpen){
        this._isOpen = isOpen;
        return this;
    };

    Prototype.toggle = function(){
        this.isOpen() ? this.close() : this.open();
        return this;
    };

    COMPONENTS.Drawer.Prototype = Prototype;
    return COMPONENTS;

})(oem.Components, oem.Core.Component, oem.Core.Prototype);
(function(COMPONENTS) {

    // Main component namespace
    var Validator = {

        // validation methods

        /**
         * Validate field exists
         * @method     required
         */
        required: function(val) {
            var isValid = val !== null && val !== void 0 && val.length != 0 && val != false;
            return isValid;
        },

        /**
         * Validate string is an email and return Validator
         * @method     email
         */
        email: function(val) {
            var re = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
            var isValid = re.test(val);
            return isValid;
        },

        /**
         * Validate string is a password and return Validator
         * @method     password
         */
        password: function(val) {
            var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{3,}$/;
            var isValid = re.test(val);
            return isValid;
        },

        /**
         * Validate that two strings match and return Validator
         * @method     match
         */
        match: function(val1, val2) {
            var isValid = val1 === val2;
            return isValid;
        },

        /**
         * Validate a string is mixed case and return Validator
         * @method     mixedCase
         */
        mixedCase: function(val) {
            var re = /(?:[a-z].+[A-Z])|(?:[A-Z].+[a-z])/g;
            var isValid = re.test(val);
            return isValid;
        },

        /**
         * Validate stirng contains a number and return Validator
         * @method     containsNumber
         */
        containsNumber: function(val) {
            var re = /[0-9]/g;
            var isValid = re.test(val);
            return isValid;
        },

        /**
         * Validate string has minimum length and return validator
         * @method     minLength
         */
        minLength: function(args) {
            var val = args.val;
            var len = args.len;
            var val = val === null ? '' : val;
            var isValid = val.length >= len;
            return isValid;
        },

        /**
         * Validate string has maxiumum length and return validator
         * @method     maxLength
         */
        maxLength: function(args) {
            var val = args.val;
            var len = args.len;
            var val = val === null ? '' : val;
            var isValid = val.length < len;
            return isValid;
        },

        /**
         * Validate value exists in options list and return Validator
         * @method     option
         */
        optionInList: function(args) {
            var val = args.val;
            var list = args.list;
            var isValid = list.indexOf(val) > -1;
            return isValid;
        },

        /**
         * Validate against regex value
         * @method     option
         */
        regex: function(args) {
            var val = args.val;
            var regex = new RegExp(args.pattern);
            var isValid = regex.test(val);
            return isValid;
        }

    };
    
    // exports
    COMPONENTS.Validator = Validator;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, COMPONENT, PROTOTYPE, UTIL) {


    // PROTOTYPE

    var Prototype = PROTOTYPE(COMPONENT, {
        type: "Validator"
    });

    // INIT

    Prototype.init = function(){
        var that = this;
        this.isShowing = false;
        this.field = this.getEl().dataset.oemField;
        this.validation = this.getEl().dataset.oemValidation;
        this.args = UTIL.parseStringToObject(this.getEl().dataset.oemArgs);
        this.message = this.getEl().innerText;
        // add after field initialization
        oem.events.addEventListener(oem.EVENTS.COMPONENTS_INITIALIZED, this.setup.bind(this));
    };
    
    // GETTERS
 
    Prototype.getField = function(){
        return this.field;
    };

    Prototype.getValidation = function(){
        return this.validation;
    };

    Prototype.getArgs = function(kwargs){
        return UTIL.mixin(kwargs, this.args);
    };

    Prototype.getMessage = function(){
        return this.message;
    };

    // SETTERS

    Prototype.setField = function(field){
        this.field = field;
        return this;
    };

    // METHODS
    
    Prototype.setup = function(){
        oem.read(this.getField()).addValidator(this);
    };
    
    Prototype.show = function(){
        this.getEl().style.display = 'block';
        this.isShowing = true;
        return this;
    };

    Prototype.hide = function(){
        this.getEl().style.display = 'none';
        this.isShowing = false;
    };

    // EXPORTS

    COMPONENTS.Validator.Prototype = Prototype;
    return COMPONENTS;

})(
    oem.Components,
    oem.Core.Component,
    oem.Core.Prototype,
    oem.Core.Util);
(function(COMPONENTS) {

    // Main component namespace
    var Field = {};
    
    // exports
    COMPONENTS.Field = Field;
    return COMPONENTS;

})(oem.Components);
/**
 * Field Prototype
 *
 * @class      Components (name)
 * @param      {<type>}   Core    The core
 * @return     {boolean}  { description_of_the_return_value }
 *
 * Implementation details:
 * Components looking to prototype this must: 
 * 1) Call the setupField method
 * 2) implement a "getField" method
 * 3) explicitly manage the field's value using setValue
 */

(function(COMPONENTS, PROTOTYPE, COMPONENT) {

    var Prototype = PROTOTYPE(COMPONENT, {
        type: "Field"
    });

    // DEFAULTS

    Prototype.init = function() {
        var that = this;
        this.validators = [];
        this.form = this.getEl().dataset.oemForm;
        this.mask = this.getEl().dataset.oemMask;
        this.pattern = this.getEl().dataset.oemPattern;
        this.setValue(this.getField().value);
        // register events
        var events = {};
        events.changed = this.getId() + ":changed";
        events.initialized = this.getId() + ":initialized";
        this.setEvents(events);
        // if defined, register to form
        oem.events.addEventListener(oem.EVENTS.COMPONENTS_INITIALIZED, this.setup.bind(this));
        // tell the world this has been initialized
        oem.events.dispatch(events.initialized, this);
    };

    // GETTERS

    Prototype.getForm = function() {
        return this.form;
    };

    Prototype.getLabel = function() {
        return this.getEl().querySelector("label");
    };

    Prototype.getField = function() {
        var input = this.getEl().querySelector('input');
        return input;
    };

    Prototype.getName = function() {
        return this.getField().name;
    };

    Prototype.getMask = function(){
        return this.mask;
    };

    Prototype.getPattern = function(){
        return this.pattern;
    };

    Prototype.getValue = function() {
        return this.value;
    };

    Prototype.getValidators = function() {
        return this.validators;
    };

    // SETTERS

    Prototype.setForm = function(form) {
        this.form = form;
        return this;
    };

    Prototype.setValue = function(value) {
        this.value = value;
        return this;
    };

    Prototype.setup = function() {
        if (oem.read(this.form)) oem.read(this.form).addField(this);
        return this;
    };

    // METHODS

    Prototype.addValidator = function(validator) {
        this.validators.push(validator);
        return this;
    };

    Prototype.maskValue = function(value, mask, maskPattern) {
        try {

            var maskLiteralPattern = /[X\*]/;
            var maskPattern = new RegExp(maskPattern || /[0-9]/);
            var newValue = "";

            for (var vId = 0, mId = 0; mId < mask.length;) {
                if (mId >= value.length) break;

                // Pattern character expected but got a different value, store only the valid portion
                var isMaskChar = mask[mId] == 'X';
                var isNotValidChar = value[vId].match(maskPattern) == null;
                if (isMaskChar && isNotValidChar) break;

                // Found a literal characteer, store that too
                while (mask[mId].match(maskLiteralPattern) == null) {
                    if (value[vId] == mask[mId]) break;
                    newValue += mask[mId++];
                }

                newValue += value[vId++];
                mId++;
            }

            return newValue;
        } catch (e) {
            return '';
        }
    };

    Prototype.validate = function() {
        var that = this;
        var isValid = true;
        this.getValidators().forEach(function(validator) {
            var args = validator.getArgs({ val: that.getValue() });
            if (!oem.Components.Validator[validator.getValidation()](args)) {
                validator.show();
                isValid = false;
            }
        });
        return isValid;
    };

    // TODO
    Prototype.reset = function() {
        this.getValidators().forEach(function(validator) {
            validator.hide();
        });
    };

    COMPONENTS.Field.Prototype = Prototype;
    return COMPONENTS;

})(
    oem.Components,
    oem.Core.Prototype,
    oem.Core.Component
);
(function(COMPONENTS) {

    // Main component namespace
    var Hamburger = {};
    
    // exports
    COMPONENTS.Hamburger = Hamburger;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, COMPONENT, PROTOTYPE) {

    var Prototype = PROTOTYPE(COMPONENT, {
        type: "Hamburger"
    });

    Prototype.init = function(){
        this.getEl().addEventListener('click', this.toggle.bind(this));
    };

    Prototype.toggle = function(){
        if(this.getEl().classList.contains('--active')){
            this.getEl().classList.remove('--active');
        } else {
            this.getEl().classList.add('--active');
        }
    };

    COMPONENTS.Hamburger.Prototype = Prototype;
    return COMPONENTS;

})(oem.Components, oem.Core.Component, oem.Core.Prototype);
(function(COMPONENTS) {

    // Main component namespace
    var Checkbox = {};
    
    // exports
    COMPONENTS.Checkbox = Checkbox;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, FIELD, PROTOTYPE) {


    // PROTOTYPE

    var Prototype = PROTOTYPE(FIELD, {
        type: "Checkbox"
    });

    Prototype.init = function(){
        this.super.init.call(this);
        this.setValue(this.getField().checked);
        this.getField().addEventListener('change', this.handleInputChange.bind(this)); // get the input field
        this.getField().addEventListener('focus', this.getField().select);
    };

    Prototype.getField = function(){
        var field = this.getEl().querySelector('input');
        return field;
    };

    Prototype.handleInputChange = function(){
        var currValue = this.getField().checked;
        this.setValue(currValue);
        oem.events.dispatch(this.getEvents().changed, this, currValue);
    };

   
    COMPONENTS.Checkbox.Prototype = Prototype;
    return COMPONENTS;

})(
    oem.Components,
    oem.Components.Field.Prototype,
    oem.Core.Prototype
);
(function(COMPONENTS) {

    var Form = {};
    
    // exports
    COMPONENTS.Form = Form;
    return COMPONENTS;

})(oem.Components);
// USAGE
// - add an event listener on an event formatted like so "[THE FORM'S ID]:submitted". The "detail" property will contain all the cleaned data
(function(COMPONENTS, PROTOTYPE, COMPONENT, UTIL, LOG) {

    var Prototype = PROTOTYPE(COMPONENT, {
        type: "Form"
    });

    // INIT

    Prototype.init = function(){

        this.fields = {};
        this.submitButton = null;
        this.validated = false;
        this.valid = false;
        this.clean = {};
        this.errors = {};

        // register events
        var events = {};
        events.submitted = this.getId() + ":submitted";
        events.initialized = this.getId() + ":initialized";
        this.setEvents(events);

        // config reset button
        this
        .getEl()
        .querySelector('[type="reset"]')
        .addEventListener('click', this.reset.bind(this));

        // tell the world
        oem.events.dispatch(events.initialized, this);
    };

    // GETTERS

    Prototype.getClean = function(){
        return this.clean;
    };

    Prototype.getErrors = function(){
        return this.errors;
    };

    Prototype.getFields = function(){
        return this.fields;
    };

    Prototype.getValidators = function(){
        return this.validators;
    };

    Prototype.hasBeenValidated = function(){
        return this.validated;
    };

    Prototype.isValid = function(){
        return this.valid;
    };

    // SETTERS
    
    Prototype.setClean = function(clean){
        this.clean = clean;
        return this;
    };

    Prototype.setErrors = function(errors){
        this.errors = errors;
        return this;
    };

    Prototype.setFields = function(fields){
        this.fields = fields;
        return this;
    };

    Prototype.setHasBeenValidated = function(validated) {

        // if this has already been validated and validated is true
        // short circuit, we don't want to keep adding listeners to fields
        if(this.hasBeenValidated() && validated) return this;

        this.validated = validated;

        // if true, start listening for change events on all fields
        if(validated){
            for(var field in this.getFields()){
                // if the field has a changed event, we'll listen for it
                field = oem.read(field);
                if(field.getEvents().changed){
                    oem.events.addEventListener(field.getEvents().changed, this.validate.bind(this));                                    
                }
            }
        } 
        return this;
    };

    Prototype.setIsValid = function(valid){
        this.valid = valid;
        return this;
    };

    // METHODS
    
    Prototype.addField = function(field){
        this.fields[field.getId()] = field;
        return this;
    };

    Prototype.validate = function(field){
        this.reset();

        var that = this;
        var fields = this.getFields();
        var isValid = true;
        var clean = {};
        var validators;

        for(var field in fields){
            if(fields[field].validators.length){
                if(fields[field].validate()){
                    clean[field] = fields[field].getValue();
                } else {
                    isValid = false;
                }
            } else {
                // it's not a validated param, store it
                clean[field] = fields[field].getValue();
            }
        }

        // if this form hasn't been validated yet, it has now
        if(!this.hasBeenValidated()) this.setHasBeenValidated(true);

        // set the form to it's new validation state
        // update the clean and error vars
        this
        .setIsValid(isValid)
        .setClean(clean);

        return this;
    };

    Prototype.reset = function(){
        var that = this;
        var fields = this.getFields();
        Object.keys(this.getFields()).forEach(function(key){
            that.getFields()[key].reset();
        });
    };

    Prototype.submit = function(){
        var validation = this.validate();
        var that = this;

        // if valid, broadcast
        if(this.isValid()){
            // trigger event with data
            oem.events.dispatch(this.getEvents().submitted, this, this.getClean());
            LOG(this.getClean());
        }
    };
    
    // exports
    COMPONENTS.Form.Prototype = Prototype;
    return COMPONENTS;

})(
    oem.Components,
    oem.Core.Prototype, 
    oem.Core.Component, 
    oem.Core.Util,
    oem.Core.Log
);
(function(COMPONENTS) {

    // Main component namespace
    var Responsifier = {};
    
    // exports
    COMPONENTS.Responsifier = Responsifier;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, COMPONENT, PROTOTYPE) {


    // PROTOTYPE

    var Prototype = PROTOTYPE(COMPONENT, {
        type: "Responsifier"
    });

    Prototype.DIMENSIONS = {
        width: "width",
        height: "height"

    };

    // INIT
    // ========================================================
    Prototype.init = function(){
        this.component = this.getEl().dataset.oemComponent;
        this.container = this.getEl().dataset.oemContainer || this.component;
        this.responsiveClass = this.getEl().dataset.oemResponsiveClass;
        this.dimension = this.getEl().dataset.oemDimension;
        this.min = this.getEl().dataset.oemMin;
        this.max = this.getEl().dataset.oemMax;
        oem.events.addEventListener(oem.EVENTS.COMPONENTS_INITIALIZED, this.responsifier, this);
        oem.events.addEventListener(oem.EVENTS.WINDOW_RESIZED, this.responsifier, this);
    };

    // GETTERS
    // ========================================================
    Prototype.getComponent = function(){
         return oem.read(this.component);
    };

    Prototype.getResponsiveClass = function(){
         return this.responsiveClass;
    };

    Prototype.getDimension = function(){
        return this.dimension;
    };

    Prototype.getMin = function(){
        return this.min;
    };

    Prototype.getMax = function(){
        return this.max;
    };

    Prototype.getContainer = function(){
        return this.container;
    };

    Prototype.getContainerEl = function(){
        var isOemComponent = oem.read(this.getContainer());
        if(isOemComponent){
            return isOemComponent.getEl();
        } else {
            // if we didn't find it, it should at least be a valid DOM id
            return document.getElementById(this.getContainer());
        }
        return this.watch;
    };

    // SETTERS
    // ========================================================
    Prototype.setComponent = function(component){
        this.component = component;
        return this;
    };

    Prototype.setResponsiveClass = function(responsiveClass){
        this.responsiveClass = responsiveClass;
        return this;
    };

    Prototype.setDimension = function(dimension){
        this.dimension = dimension;
        return this;
    };

    Prototype.setMin = function(min){
        this.min = min;
        return this;
    };

    Prototype.setMax = function(max){
        this.max = max;
        return this;
    };

    Prototype.setWatch = function(watch){
        this.watch = watch;
        return this;
    };

    // METHODS
    // ========================================================
    Prototype.responsifier = function(){
        var el = this.getComponent().getEl();
        var container = this.getContainerEl();
        var width = container.offsetWidth;
        var height = container.offsetHeight;
        el.classList.remove(this.getResponsiveClass());

        // apply width ranges
        var isWidthCalc = this.getDimension() === this.DIMENSIONS.width;
        var isOverMin = width >= this.getMin();
        var isUnderMax = (width <= this.getMax() || this.getMax() === '*');
        if (isWidthCalc && isOverMin && isUnderMax) el.classList.add(this.getResponsiveClass());

        // apply height ranges
        var isHeightCalc = this.getDimension() === this.DIMENSIONS.height;
        var isOverMin = height >= this.getMin();
        var isUnderMax = (height <= this.getMax() || this.getMax() === '*');
        if (isHeightCalc && isOverMin && isUnderMax) el.classList.add(this.getResponsiveClass());
    };

    Prototype.destroy = function(){
        oem.events.removeEventListener(oem.EVENTS.COMPONENTS_INITIALIZED, this.responsifier, this);
        oem.events.removeEventListener(oem.EVENTS.WINDOW_RESIZED, this.responsifier, this);
    };
    
    // EXPORTS
    // ========================================================
    // Probably only want to export the prototype
    COMPONENTS.Responsifier.Prototype = Prototype;
    return COMPONENTS;

})(oem.Components, oem.Core.Component, oem.Core.Prototype);
(function(COMPONENTS) {

    // Main component namespace
    var Select = {};
    
    // exports
    COMPONENTS.Select = Select;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, FIELD, PROTOTYPE) {


    // PROTOTYPE

    var Prototype = PROTOTYPE(FIELD, {
        type: "Select"
    });

    Prototype.init = function(){
        this.super.init.call(this);
        this.setValue(this.getField().value);
        this.getField().addEventListener('input', this.handleInputChange.bind(this)); // get the input field
        this.getField().addEventListener('focus', this.getField().select);
    };

    Prototype.getField = function(){
        var field = this.getEl().querySelector('select');
        return field;
    };

    Prototype.handleInputChange = function(){
        var currValue = this.getField().value;
        this.setValue(currValue);
        oem.events.dispatch(this.getEvents().changed, this, currValue);
    };

   
    COMPONENTS.Select.Prototype = Prototype;
    return COMPONENTS;

})(
    oem.Components,
    oem.Components.Field.Prototype,
    oem.Core.Prototype
);
(function(COMPONENTS) {

    // Main component namespace
    var SubmitButton = {};
    
    // exports
    COMPONENTS.SubmitButton = SubmitButton;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, COMPONENT, PROTOTYPE) {


    // PROTOTYPE

    var Prototype = PROTOTYPE(COMPONENT, {
        type: "SubmitButton"
    });

    // INIT

    Prototype.init = function(){
         this.form = this.getEl().dataset.oemForm;
         this.getEl().addEventListener('click', this.handleClick.bind(this));
    };

    // GETTERS
 
    Prototype.getForm = function(){
         return this.form;
    };

    // SETTERS

    Prototype.setForm = function(form){
        return this.form;
    };

    // METHODS
    
    Prototype.handleClick = function(e){
        e.preventDefault();
        if(oem.read(this.form)) oem.read(this.form).submit();
    };
    
    // EXPORTS
    // 
    COMPONENTS.SubmitButton.Prototype = Prototype;
    return COMPONENTS;

})(
    oem.Components, 
    oem.Core.Component, 
    oem.Core.Prototype);
(function(COMPONENTS) {

    // Main component namespace
    var Toggle = {};
    
    // exports
    COMPONENTS.Toggle = Toggle;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, FIELD, PROTOTYPE) {


    // PROTOTYPE

    var Prototype = PROTOTYPE(FIELD, {
        type: "Toggle"
    });

    Prototype.init = function(){
        this.super.init.call(this);
        this.setValue(this.getField().checked);
        this.getField().addEventListener('change', this.handleInputChange.bind(this)); // get the input field
        this.getField().addEventListener('focus', this.getField().select);
    };

    Prototype.getField = function(){
        var field = this.getEl().querySelector('input');
        return field;
    };

    Prototype.handleInputChange = function(){
        var currValue = this.getField().checked;
        this.setValue(currValue);
        oem.events.dispatch(this.getEvents().changed, this, currValue);
    };

   
    COMPONENTS.Toggle.Prototype = Prototype;
    return COMPONENTS;

})(
    oem.Components,
    oem.Components.Field.Prototype,
    oem.Core.Prototype
);
(function(COMPONENTS) {

    // Card component
    var TextInput = {};
    
    // exports
    COMPONENTS.TextInput = TextInput;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, PROTOTYPE, FIELD) {

    var Prototype = PROTOTYPE(FIELD, {
        type: "TextInput"
    });

    // INIT

    Prototype.init = function(){
        this.super.init.call(this);
        this.setValue(this.getField().value);
        this.getField().addEventListener('input', this.handleInputChange.bind(this)); // get the input field
        this.getField().addEventListener('focus', this.getField().select);
    };

    Prototype.getField = function(){
        var field = this.getEl().querySelector('input');
        return field;
    };

    Prototype.handleInputChange = function(){
        var fieldValue = this.getField().value;
        var currValue = this.mask ? this.maskValue(fieldValue, this.getMask(), this.getPattern()) : fieldValue;
        this.setValue(currValue);
        if(this.mask) this.getField().value = currValue;
        oem.events.dispatch(this.getEvents().changed, this, currValue);
    };

    COMPONENTS.TextInput.Prototype = Prototype;
    return COMPONENTS;

})(
    oem.Components,
    oem.Core.Prototype,
    oem.Components.Field.Prototype
);
(function(COMPONENTS) {

    // Main component namespace
    var Textarea = {};
    
    // exports
    COMPONENTS.Textarea = Textarea;
    return COMPONENTS;

})(oem.Components);
(function(COMPONENTS, FIELD, PROTOTYPE) {

    var Prototype = PROTOTYPE(FIELD, {
        type: "Textarea"
    });

    Prototype.init = function(){
        this.super.init.call(this);
        this.setValue(this.getField().value);
        this.getField().addEventListener('input', this.handleInputChange.bind(this)); // get the input field
        this.getField().addEventListener('focus', this.getField().select);
    };

    Prototype.getField = function(){
        var field = this.getEl().querySelector('textarea');
        return field;
    };

    Prototype.handleInputChange = function(){
        var currValue = this.getField().value;
        this.setValue(currValue);
        oem.events.dispatch(this.getEvents().changed, this, currValue);
    };


    COMPONENTS.Textarea.Prototype = Prototype;
    return COMPONENTS;

})(oem.Components,
    oem.Components.Field.Prototype,
    oem.Core.Prototype
);
(function(COMPONENTS) {

    // Main component namespace
    var Theme = {};

    COMPONENTS.Theme = Theme;
    return COMPONENTS;

})(oem.Components);