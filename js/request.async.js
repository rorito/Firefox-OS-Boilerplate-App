(function () {
  var root = this;
  var encodeURIComponent = root.encodeURIComponent || root.escape || escape;
  var ads_count = 0;
  function extend(destination, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        destination[key] = source[key]
      }
    }
    return destination
  }
  var adRequest2 = function (ad_url, ad_vars) {
    if (!ad_url) {
      throw 'ad_url parameter is required'
    }
    ad_vars = extend({
    }, ad_vars || {
    });
    ads_count++;
    ad_vars.ad_id = 'sync_ad_' + ads_count;
    //ad_vars.callback = 'ad_callback_' + String(Math.random()).replace(/[^\d]/, '');
    var src = adRequest2.prepareUrl(ad_url, ad_vars);
    /*root[ad_vars.callback] = function (ad_data) {
      adRequest2.parseResponse(ad_data, ad_vars, function (html) {
        adRequest2.render(html, ad_vars);
        delete root[ad_vars.callback]
      })
    };*/
    adRequest2.fetch(src, ad_vars)
  };
  adRequest2.parseResponse = function (ad_data, ad_vars, renderer) {
    var html = '';
    if (ad_vars.debug) {
      console && console.log(ad_data)
    }
    if (ad_data[0].error != null && ad_data[0].error == 'No ads available') {
    } else {
      for (var i = 0; i < ad_data.length; ++i) {
        var ad = ad_data[i];
        if (ad.error) {
          continue
        }
        if (ad.type == 'native') {
          if (typeof ad_vars.nativeRender != 'function') {
            throw 'No nativeRender function defined'
          }
          html += ad_vars.nativeRender(ad)
        } else if (ad.content) {
          html += ad.content
        } else if (ad.img) {
          html += '<a href="' + ad.url + '">' + '<img style="border:none;" src="' + ad.img + '"';
          html += '/></a>'
        } else {
          html += '<a href="' + ad.url + '">' + ad.text + '</a>'
        }
        if (ad.track && ad.track != 'null') {
          var track = new Image;
          track.src = ad.track
        }
      }
    }
    if (ad_vars.debug) {
      console && console.log(html)
    }
    renderer(html)
  };
  adRequest2.prepareUrl = function (ad_url, ad_vars) {
    ad_vars = extend({
    }, ad_vars || {
    });
    var url_parts = ad_url.split('?'),
    url_base = url_parts.splice(0, 1) [0],
    url_query = url_parts.join('?');
    if (typeof ad_vars.nativeRender != 'function') {
      url_query.replace(new RegExp('(&|^)type=-1(?=&|#|$)'), '$1type=7')
    }
    url_query = 'key=1&' + url_query.replace(new RegExp('(&|^)(callback|key)(=[^&]*)?(?=&|#|$)'), '');
    return url_base + '?' + url_query
  };
  adRequest2.render = function (html) {
    document.write(html)
  };
  adRequest2.fetch = function (src) {
    document.write('<scr' + 'ipt type="text/javascr' + 'ipt" src="' + src + '"></scr' + 'ipt>')
  };
  root.adRequest2 = adRequest2;
  root.adRequest2AsyncStart && root.adRequest2AsyncStart()
}).call(window);
(function () {
  var supports = function () {
    var supports = {
    };
    var html;
    var work = this.document.createElement('div');
    html = '<P><I></P></I>';
    work.innerHTML = html;
    supports.tagSoup = work.innerHTML !== html;
    work.innerHTML = '<P><i><P></P></i></P>';
    supports.selfClose = work.childNodes.length === 2;
    return supports
  }();
  var startTag = /^<([\-A-Za-z0-9_]+)((?:\s+[\w\-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
  var endTag = /^<\/([\-A-Za-z0-9_]+)[^>]*>/;
  var attr = /([\-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
  var fillAttr = /^(checked|compact|declare|defer|disabled|ismap|multiple|nohref|noresize|noshade|nowrap|readonly|selected)$/i;
  var DEBUG = false;
  function htmlParser(stream, options) {
    stream = stream || '';
    options = options || {
    };
    for (var key in supports) {
      if (supports.hasOwnProperty(key)) {
        if (options.autoFix) {
          options['fix_' + key] = true
        }
        options.fix = options.fix || options['fix_' + key]
      }
    }
    var stack = [
    ];
    var append = function (str) {
      stream += str
    };
    var prepend = function (str) {
      stream = str + stream
    };
    var detect = {
      comment: /^<!--/,
      endTag: /^<\//,
      atomicTag: /^<\s*(script|style|noscript|iframe|textarea)[\s>]/i,
      startTag: /^</,
      chars: /^[^<]/
    };
    var reader = {
      comment: function () {
        var index = stream.indexOf('-->');
        if (index >= 0) {
          return {
            content: stream.substr(4, index),
            length: index + 3
          }
        }
      },
      endTag: function () {
        var match = stream.match(endTag);
        if (match) {
          return {
            tagName: match[1],
            length: match[0].length
          }
        }
      },
      atomicTag: function () {
        var start = reader.startTag();
        if (start) {
          var rest = stream.slice(start.length);
          if (rest.match(new RegExp('</\\s*' + start.tagName + '\\s*>', 'i'))) {
            var match = rest.match(new RegExp('([\\s\\S]*?)</\\s*' + start.tagName + '\\s*>', 'i'));
            if (match) {
              return {
                tagName: start.tagName,
                attrs: start.attrs,
                content: match[1],
                length: match[0].length + start.length
              }
            }
          }
        }
      },
      startTag: function () {
        var match = stream.match(startTag);
        if (match) {
          var attrs = {
          };
          match[2].replace(attr, function (match, name) {
            var value = arguments[2] || arguments[3] || arguments[4] || fillAttr.test(name) && name || null;
            attrs[name] = value
          });
          return {
            tagName: match[1],
            attrs: attrs,
            unary: !!match[3],
            length: match[0].length
          }
        }
      },
      chars: function () {
        var index = stream.indexOf('<');
        return {
          length: index >= 0 ? index : stream.length
        }
      }
    };
    var readToken = function () {
      for (var type in detect) {
        if (detect[type].test(stream)) {
          if (DEBUG) {
            console.log('suspected ' + type)
          }
          var token = reader[type]();
          if (token) {
            if (DEBUG) {
              console.log('parsed ' + type, token)
            }
            token.type = token.type || type;
            token.text = stream.substr(0, token.length);
            stream = stream.slice(token.length);
            return token
          }
          return null
        }
      }
    };
    var readTokens = function (handlers) {
      var tok;
      while (tok = readToken()) {
        if (handlers[tok.type] && handlers[tok.type](tok) === false) {
          return
        }
      }
    };
    var clear = function () {
      var rest = stream;
      stream = '';
      return rest
    };
    var rest = function () {
      return stream
    };
    if (options.fix) {
      (function () {
        var EMPTY = /^(AREA|BASE|BASEFONT|BR|COL|FRAME|HR|IMG|INPUT|ISINDEX|LINK|META|PARAM|EMBED)$/i;
        var CLOSESELF = /^(COLGROUP|DD|DT|LI|OPTIONS|P|TD|TFOOT|TH|THEAD|TR)$/i;
        var stack = [
        ];
        stack.last = function () {
          return this[this.length - 1]
        };
        stack.lastTagNameEq = function (tagName) {
          var last = this.last();
          return last && last.tagName && last.tagName.toUpperCase() === tagName.toUpperCase()
        };
        stack.containsTagName = function (tagName) {
          for (var i = 0, tok; tok = this[i]; i++) {
            if (tok.tagName === tagName) {
              return true
            }
          }
          return false
        };
        var correct = function (tok) {
          if (tok && tok.type === 'startTag') {
            tok.unary = EMPTY.test(tok.tagName) || tok.unary
          }
          return tok
        };
        var readTokenImpl = readToken;
        var peekToken = function () {
          var tmp = stream;
          var tok = correct(readTokenImpl());
          stream = tmp;
          return tok
        };
        var closeLast = function () {
          var tok = stack.pop();
          prepend('</' + tok.tagName + '>')
        };
        var handlers = {
          startTag: function (tok) {
            var tagName = tok.tagName;
            if (tagName.toUpperCase() === 'TR' && stack.lastTagNameEq('TABLE')) {
              prepend('<TBODY>');
              prepareNextToken()
            } else if (options.fix_selfClose && CLOSESELF.test(tagName) && stack.containsTagName(tagName)) {
              if (stack.lastTagNameEq(tagName)) {
                closeLast()
              } else {
                prepend('</' + tok.tagName + '>');
                prepareNextToken()
              }
            } else if (!tok.unary) {
              stack.push(tok)
            }
          },
          endTag: function (tok) {
            var last = stack.last();
            if (last) {
              if (options.fix_tagSoup && !stack.lastTagNameEq(tok.tagName)) {
                closeLast()
              } else {
                stack.pop()
              }
            } else if (options.fix_tagSoup) {
              skipToken()
            }
          }
        };
        var skipToken = function () {
          readTokenImpl();
          prepareNextToken()
        };
        var prepareNextToken = function () {
          var tok = peekToken();
          if (tok && handlers[tok.type]) {
            handlers[tok.type](tok)
          }
        };
        readToken = function () {
          prepareNextToken();
          return correct(readTokenImpl())
        }
      }) ()
    }
    return {
      append: append,
      readToken: readToken,
      readTokens: readTokens,
      clear: clear,
      rest: rest,
      stack: stack
    }
  }
  htmlParser.supports = supports;
  htmlParser.tokenToString = function (tok) {
    var handler = {
      comment: function (tok) {
        return '<--' + tok.content + '-->'
      },
      endTag: function (tok) {
        return '</' + tok.tagName + '>'
      },
      atomicTag: function (tok) {
        console.log(tok);
        return handler.startTag(tok) + tok.content + handler.endTag(tok)
      },
      startTag: function (tok) {
        var str = '<' + tok.tagName;
        for (var key in tok.attrs) {
          var val = tok.attrs[key];
          str += ' ' + key + '="' + (val ? val.replace(/(^|[^\\])"/g, '$1\\"')  : '') + '"'
        }
        return str + (tok.unary ? '/>' : '>')
      },
      chars: function (tok) {
        return tok.text
      }
    };
    return handler[tok.type](tok)
  };
  htmlParser.escapeAttributes = function (attrs) {
    var escapedAttrs = {
    };
    for (var name in attrs) {
      var value = attrs[name];
      escapedAttrs[name] = value && value.replace(/(^|[^\\])"/g, '$1\\"')
    }
    return escapedAttrs
  };
  for (var key in supports) {
    htmlParser.browserHasFlaw = htmlParser.browserHasFlaw || !supports[key] && key
  }
  this.htmlParser = htmlParser
}) ();
(function () {
  var global = this;
  if (global.postscribe) {
    return
  }
  var DEBUG = true;
  var DEBUG_CHUNK = false;
  var slice = Array.prototype.slice;
  function doNothing() {
  }
  function isFunction(x) {
    return 'function' === typeof x
  }
  function each(arr, fn, _this) {
    var i,
    len = arr && arr.length || 0;
    for (i = 0; i < len; i++) {
      fn.call(_this, arr[i], i)
    }
  }
  function eachKey(obj, fn, _this) {
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        fn.call(_this, key, obj[key])
      }
    }
  }
  function set(obj, props) {
    eachKey(props, function (key, value) {
      obj[key] = value
    });
    return obj
  }
  function defaults(options, _defaults) {
    options = options || {
    };
    eachKey(_defaults, function (key, val) {
      if (options[key] == null) {
        options[key] = val
      }
    });
    return options
  }
  function toArray(obj) {
    try {
      return slice.call(obj)
    } catch (e) {
      var ret = [
      ];
      each(obj, function (val) {
        ret.push(val)
      });
      return ret
    }
  }
  function isScript(tok) {
    return /^script$/i.test(tok.tagName)
  }
  var WriteStream = function () {
    var BASEATTR = 'data-ps-';
    function data(el, name, value) {
      var attr = BASEATTR + name;
      if (arguments.length === 2) {
        var val = el.getAttribute(attr);
        return val == null ? val : String(val)
      } else if (value != null && value !== '') {
        el.setAttribute(attr, value)
      } else {
        el.removeAttribute(attr)
      }
    }
    function WriteStream(root, options) {
      var doc = root.ownerDocument;
      set(this, {
        root: root,
        options: options,
        win: doc.defaultView || doc.parentWindow,
        doc: doc,
        parser: global.htmlParser('', {
          autoFix: true
        }),
        actuals: [
          root
        ],
        proxyHistory: '',
        proxyRoot: doc.createElement(root.nodeName),
        scriptStack: [
        ],
        writeQueue: [
        ]
      });
      data(this.proxyRoot, 'proxyof', 0)
    }
    WriteStream.prototype.write = function () {
      [
      ].push.apply(this.writeQueue, arguments);
      var arg;
      while (!this.deferredRemote && this.writeQueue.length) {
        arg = this.writeQueue.shift();
        if (isFunction(arg)) {
          this.callFunction(arg)
        } else {
          this.writeImpl(arg)
        }
      }
    };
    WriteStream.prototype.callFunction = function (fn) {
      var tok = {
        type: 'function',
        value: fn.name || fn.toString()
      };
      this.onScriptStart(tok);
      fn.call(this.win, this.doc);
      this.onScriptDone(tok)
    };
    WriteStream.prototype.writeImpl = function (html) {
      this.parser.append(html);
      var tok,
      tokens = [
      ];
      while ((tok = this.parser.readToken()) && !isScript(tok)) {
        tokens.push(tok)
      }
      this.writeStaticTokens(tokens);
      if (tok) {
        this.handleScriptToken(tok)
      }
    };
    WriteStream.prototype.writeStaticTokens = function (tokens) {
      var chunk = this.buildChunk(tokens);
      if (!chunk.actual) {
        return
      }
      chunk.html = this.proxyHistory + chunk.actual;
      this.proxyHistory += chunk.proxy;
      this.proxyRoot.innerHTML = chunk.html;
      if (DEBUG_CHUNK) {
        chunk.proxyInnerHTML = this.proxyRoot.innerHTML
      }
      this.walkChunk();
      if (DEBUG_CHUNK) {
        chunk.actualInnerHTML = this.root.innerHTML
      }
      return chunk
    };
    WriteStream.prototype.buildChunk = function (tokens) {
      var nextId = this.actuals.length,
      raw = [
      ],
      actual = [
      ],
      proxy = [
      ];
      each(tokens, function (tok) {
        raw.push(tok.text);
        if (tok.attrs) {
          if (!/^noscript$/i.test(tok.tagName)) {
            var id = nextId++;
            actual.push(tok.text.replace(/(\/?>)/, ' ' + BASEATTR + 'id=' + id + ' $1'));
            if (tok.attrs.id !== 'ps-script') {
              proxy.push(tok.type === 'atomicTag' ? '' : '<' + tok.tagName + ' ' + BASEATTR + 'proxyof=' + id + (tok.unary ? '/>' : '>'))
            }
          }
        } else {
          actual.push(tok.text);
          proxy.push(tok.type === 'endTag' ? tok.text : '')
        }
      });
      return {
        tokens: tokens,
        raw: raw.join(''),
        actual: actual.join(''),
        proxy: proxy.join('')
      }
    };
    WriteStream.prototype.walkChunk = function () {
      var node,
      stack = [
        this.proxyRoot
      ];
      while ((node = stack.shift()) != null) {
        var isElement = node.nodeType === 1;
        var isProxy = isElement && data(node, 'proxyof');
        if (!isProxy) {
          if (isElement) {
            this.actuals[data(node, 'id')] = node;
            data(node, 'id', null)
          }
          var parentIsProxyOf = node.parentNode && data(node.parentNode, 'proxyof');
          if (parentIsProxyOf) {
            this.actuals[parentIsProxyOf].appendChild(node)
          }
        }
        stack.unshift.apply(stack, toArray(node.childNodes))
      }
    };
    WriteStream.prototype.handleScriptToken = function (tok) {
      var remainder = this.parser.clear();
      if (remainder) {
        this.writeQueue.unshift(remainder)
      }
      tok.src = tok.attrs.src || tok.attrs.SRC;
      if (tok.src && this.scriptStack.length) {
        this.deferredRemote = tok
      } else {
        this.onScriptStart(tok)
      }
      var _this = this;
      this.writeScriptToken(tok, function () {
        _this.onScriptDone(tok)
      })
    };
    WriteStream.prototype.onScriptStart = function (tok) {
      tok.outerWrites = this.writeQueue;
      this.writeQueue = [
      ];
      this.scriptStack.unshift(tok)
    };
    WriteStream.prototype.onScriptDone = function (tok) {
      if (tok !== this.scriptStack[0]) {
        this.options.error({
          message: 'Bad script nesting or script finished twice'
        });
        return
      }
      this.scriptStack.shift();
      this.write.apply(this, tok.outerWrites);
      if (!this.scriptStack.length && this.deferredRemote) {
        this.onScriptStart(this.deferredRemote);
        this.deferredRemote = null
      }
    };
    WriteStream.prototype.writeScriptToken = function (tok, done) {
      var el = this.buildScript(tok);
      if (tok.src) {
        el.src = tok.src;
        this.scriptLoadHandler(el, done)
      }
      try {
        this.insertScript(el);
        if (!tok.src) {
          done()
        }
      } catch (e) {
        this.options.error(e);
        done()
      }
    };
    WriteStream.prototype.buildScript = function (tok) {
      var el = this.doc.createElement(tok.tagName);
      eachKey(tok.attrs, function (name, value) {
        el.setAttribute(name, value)
      });
      if (tok.content) {
        el.text = tok.content
      }
      return el
    };
    WriteStream.prototype.insertScript = function (el) {
      this.writeImpl('<span id="ps-script"/>');
      var cursor = this.doc.getElementById('ps-script');
      cursor.parentNode.replaceChild(el, cursor)
    };
    WriteStream.prototype.scriptLoadHandler = function (el, done) {
      function cleanup() {
        el = el.onload = el.onreadystatechange = el.onerror = null;
        done()
      }
      var error = this.options.error;
      set(el, {
        onload: function () {
          cleanup()
        },
        onreadystatechange: function () {
          if (/^(loaded|complete)$/.test(el.readyState)) {
            cleanup()
          }
        },
        onerror: function () {
          error({
            message: 'remote script failed ' + el.src
          });
          cleanup()
        }
      })
    };
    return WriteStream
  }();
  var postscribe = function () {
    var nextId = 0;
    var queue = [
    ];
    var active = null;
    function nextStream() {
      var args = queue.shift();
      if (args) {
        args.stream = runStream.apply(null, args)
      }
    }
    function runStream(el, html, options) {
      active = new WriteStream(el, options);
      active.id = nextId++;
      active.name = options.name || active.id;
      postscribe.streams[active.name] = active;
      var doc = el.ownerDocument;
      var stash = {
        write: doc.write,
        writeln: doc.writeln
      };
      function write(str) {
        str = options.beforeWrite(str);
        active.write(str);
        options.afterWrite(str)
      }
      set(doc, {
        write: function () {
          return write(toArray(arguments).join(''))
        },
        writeln: function (str) {
          return write(toArray(arguments).join('') + '\n')
        }
      });
      var oldOnError = active.win.onerror || doNothing;
      active.win.onerror = function (msg, url, line) {
        options.error({
          msg: msg + ' - ' + url + ':' + line
        });
        oldOnError.apply(active.win, arguments)
      };
      active.write(html, function streamDone() {
        set(doc, stash);
        active.win.onerror = oldOnError;
        options.done();
        active = null;
        nextStream()
      });
      return active
    }
    function postscribe(el, html, options) {
      if (isFunction(options)) {
        options = {
          done: options
        }
      }
      options = defaults(options, {
        done: doNothing,
        error: function (e) {
          throw e
        },
        beforeWrite: function (str) {
          return str
        },
        afterWrite: doNothing
      });
      el = /^#/.test(el) ? global.document.getElementById(el.substr(1))  : el.jquery ? el[0] : el;
      var args = [
        el,
        html,
        options
      ];
      el.postscribe = {
        cancel: function () {
          if (args.stream) {
            args.stream.abort()
          } else {
            args[1] = doNothing
          }
        }
      };
      queue.push(args);
      if (!active) {
        nextStream()
      }
      return el.postscribe
    }
    return set(postscribe, {
      streams: {
      },
      queue: queue,
      WriteStream: WriteStream
    })
  }();
  global.postscribe = postscribe
}) ();
(function () {
  var root = this;
  var initialize = function () {
    var syncRender = root.adRequest2.render;
    var syncFetch = root.adRequest2.fetch;
    root.adRequest2.render = function (html, ad_vars) {
      if (!ad_vars.containerId) {
        syncRender(html, ad_vars);
        return
      }
      var el = document.getElementById(ad_vars.containerId);
      if (el) {
        if (!ad_vars.dontClearContainer) {
          el.innerHTML = ''
        }
        postscribe(el, html)
      } else {
        throw 'Can\'t find element'
      }
    };
    root.adRequest2.fetch = function (src, ad_vars) {
      if (!ad_vars.containerId) {
        syncFetch(src, ad_vars);
        return
      }
      var xhr = new XMLHttpRequest();
      xhr.open("GET", src, false);
      xhr.send();
      console.log(xhr.responseText);
      root.adRequest2.render(xhr.responseText, ad_vars); 
    };
    root._ads2 = root._ads2 || [];
    for (var i = 0; i < root._ads2.length; i++) {
      root.adRequest2(root._ads2[i].url, root._ads2[i])
    }
    root._ads2 = [
    ];
    root._ads2.push = function (params) {
      root.adRequest2(params.url, params)
    }
  };
  if (root.adRequest2) {
    initialize()
  } else {
    root.adRequest2AsyncStart = function () {
      delete root.adRequest2AsyncStart;
      initialize()
    }
  }
}).call(window);
