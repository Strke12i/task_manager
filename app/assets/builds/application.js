(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __esm = (fn2, res) => function __init() {
    return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // node_modules/@rails/actioncable/src/adapters.js
  var adapters_default;
  var init_adapters = __esm({
    "node_modules/@rails/actioncable/src/adapters.js"() {
      adapters_default = {
        logger: self.console,
        WebSocket: self.WebSocket
      };
    }
  });

  // node_modules/@rails/actioncable/src/logger.js
  var logger_default;
  var init_logger = __esm({
    "node_modules/@rails/actioncable/src/logger.js"() {
      init_adapters();
      logger_default = {
        log(...messages) {
          if (this.enabled) {
            messages.push(Date.now());
            adapters_default.logger.log("[ActionCable]", ...messages);
          }
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/connection_monitor.js
  var now, secondsSince, ConnectionMonitor, connection_monitor_default;
  var init_connection_monitor = __esm({
    "node_modules/@rails/actioncable/src/connection_monitor.js"() {
      init_logger();
      now = () => (/* @__PURE__ */ new Date()).getTime();
      secondsSince = (time) => (now() - time) / 1e3;
      ConnectionMonitor = class {
        constructor(connection) {
          this.visibilityDidChange = this.visibilityDidChange.bind(this);
          this.connection = connection;
          this.reconnectAttempts = 0;
        }
        start() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            addEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
          }
        }
        stop() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            removeEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log("ConnectionMonitor stopped");
          }
        }
        isRunning() {
          return this.startedAt && !this.stoppedAt;
        }
        recordPing() {
          this.pingedAt = now();
        }
        recordConnect() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          logger_default.log("ConnectionMonitor recorded connect");
        }
        recordDisconnect() {
          this.disconnectedAt = now();
          logger_default.log("ConnectionMonitor recorded disconnect");
        }
        // Private
        startPolling() {
          this.stopPolling();
          this.poll();
        }
        stopPolling() {
          clearTimeout(this.pollTimeout);
        }
        poll() {
          this.pollTimeout = setTimeout(
            () => {
              this.reconnectIfStale();
              this.poll();
            },
            this.getPollInterval()
          );
        }
        getPollInterval() {
          const { staleThreshold, reconnectionBackoffRate } = this.constructor;
          const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
          const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
          const jitter = jitterMax * Math.random();
          return staleThreshold * 1e3 * backoff * (1 + jitter);
        }
        reconnectIfStale() {
          if (this.connectionIsStale()) {
            logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
            } else {
              logger_default.log("ConnectionMonitor reopening");
              this.connection.reopen();
            }
          }
        }
        get refreshedAt() {
          return this.pingedAt ? this.pingedAt : this.startedAt;
        }
        connectionIsStale() {
          return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
        }
        disconnectedRecently() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        }
        visibilityDidChange() {
          if (document.visibilityState === "visible") {
            setTimeout(
              () => {
                if (this.connectionIsStale() || !this.connection.isOpen()) {
                  logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                  this.connection.reopen();
                }
              },
              200
            );
          }
        }
      };
      ConnectionMonitor.staleThreshold = 6;
      ConnectionMonitor.reconnectionBackoffRate = 0.15;
      connection_monitor_default = ConnectionMonitor;
    }
  });

  // node_modules/@rails/actioncable/src/internal.js
  var internal_default;
  var init_internal = __esm({
    "node_modules/@rails/actioncable/src/internal.js"() {
      internal_default = {
        "message_types": {
          "welcome": "welcome",
          "disconnect": "disconnect",
          "ping": "ping",
          "confirmation": "confirm_subscription",
          "rejection": "reject_subscription"
        },
        "disconnect_reasons": {
          "unauthorized": "unauthorized",
          "invalid_request": "invalid_request",
          "server_restart": "server_restart"
        },
        "default_mount_path": "/cable",
        "protocols": [
          "actioncable-v1-json",
          "actioncable-unsupported"
        ]
      };
    }
  });

  // node_modules/@rails/actioncable/src/connection.js
  var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
  var init_connection = __esm({
    "node_modules/@rails/actioncable/src/connection.js"() {
      init_adapters();
      init_connection_monitor();
      init_internal();
      init_logger();
      ({ message_types, protocols } = internal_default);
      supportedProtocols = protocols.slice(0, protocols.length - 1);
      indexOf = [].indexOf;
      Connection = class {
        constructor(consumer2) {
          this.open = this.open.bind(this);
          this.consumer = consumer2;
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new connection_monitor_default(this);
          this.disconnected = true;
        }
        send(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        }
        open() {
          if (this.isActive()) {
            logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
            return false;
          } else {
            logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${protocols}`);
            if (this.webSocket) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new adapters_default.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        }
        close({ allowReconnect } = { allowReconnect: true }) {
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isOpen()) {
            return this.webSocket.close();
          }
        }
        reopen() {
          logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error2) {
              logger_default.log("Failed to reopen WebSocket", error2);
            } finally {
              logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        }
        getProtocol() {
          if (this.webSocket) {
            return this.webSocket.protocol;
          }
        }
        isOpen() {
          return this.isState("open");
        }
        isActive() {
          return this.isState("open", "connecting");
        }
        // Private
        isProtocolSupported() {
          return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
        }
        isState(...states) {
          return indexOf.call(states, this.getState()) >= 0;
        }
        getState() {
          if (this.webSocket) {
            for (let state in adapters_default.WebSocket) {
              if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
                return state.toLowerCase();
              }
            }
          }
          return null;
        }
        installEventHandlers() {
          for (let eventName in this.events) {
            const handler = this.events[eventName].bind(this);
            this.webSocket[`on${eventName}`] = handler;
          }
        }
        uninstallEventHandlers() {
          for (let eventName in this.events) {
            this.webSocket[`on${eventName}`] = function() {
            };
          }
        }
      };
      Connection.reopenDelay = 500;
      Connection.prototype.events = {
        message(event) {
          if (!this.isProtocolSupported()) {
            return;
          }
          const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
          switch (type) {
            case message_types.welcome:
              this.monitor.recordConnect();
              return this.subscriptions.reload();
            case message_types.disconnect:
              logger_default.log(`Disconnecting. Reason: ${reason}`);
              return this.close({ allowReconnect: reconnect });
            case message_types.ping:
              return this.monitor.recordPing();
            case message_types.confirmation:
              this.subscriptions.confirmSubscription(identifier);
              return this.subscriptions.notify(identifier, "connected");
            case message_types.rejection:
              return this.subscriptions.reject(identifier);
            default:
              return this.subscriptions.notify(identifier, "received", message);
          }
        },
        open() {
          logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
          this.disconnected = false;
          if (!this.isProtocolSupported()) {
            logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
            return this.close({ allowReconnect: false });
          }
        },
        close(event) {
          logger_default.log("WebSocket onclose event");
          if (this.disconnected) {
            return;
          }
          this.disconnected = true;
          this.monitor.recordDisconnect();
          return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
        },
        error() {
          logger_default.log("WebSocket onerror event");
        }
      };
      connection_default = Connection;
    }
  });

  // node_modules/@rails/actioncable/src/subscription.js
  var extend, Subscription;
  var init_subscription = __esm({
    "node_modules/@rails/actioncable/src/subscription.js"() {
      extend = function(object, properties) {
        if (properties != null) {
          for (let key in properties) {
            const value = properties[key];
            object[key] = value;
          }
        }
        return object;
      };
      Subscription = class {
        constructor(consumer2, params = {}, mixin) {
          this.consumer = consumer2;
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }
        // Perform a channel action with the optional data passed as an attribute
        perform(action, data = {}) {
          data.action = action;
          return this.send(data);
        }
        send(data) {
          return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
        }
        unsubscribe() {
          return this.consumer.subscriptions.remove(this);
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/subscription_guarantor.js
  var SubscriptionGuarantor, subscription_guarantor_default;
  var init_subscription_guarantor = __esm({
    "node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
      init_logger();
      SubscriptionGuarantor = class {
        constructor(subscriptions) {
          this.subscriptions = subscriptions;
          this.pendingSubscriptions = [];
        }
        guarantee(subscription) {
          if (this.pendingSubscriptions.indexOf(subscription) == -1) {
            logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
            this.pendingSubscriptions.push(subscription);
          } else {
            logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
          }
          this.startGuaranteeing();
        }
        forget(subscription) {
          logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
          this.pendingSubscriptions = this.pendingSubscriptions.filter((s2) => s2 !== subscription);
        }
        startGuaranteeing() {
          this.stopGuaranteeing();
          this.retrySubscribing();
        }
        stopGuaranteeing() {
          clearTimeout(this.retryTimeout);
        }
        retrySubscribing() {
          this.retryTimeout = setTimeout(
            () => {
              if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
                this.pendingSubscriptions.map((subscription) => {
                  logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
                  this.subscriptions.subscribe(subscription);
                });
              }
            },
            500
          );
        }
      };
      subscription_guarantor_default = SubscriptionGuarantor;
    }
  });

  // node_modules/@rails/actioncable/src/subscriptions.js
  var Subscriptions;
  var init_subscriptions = __esm({
    "node_modules/@rails/actioncable/src/subscriptions.js"() {
      init_subscription();
      init_subscription_guarantor();
      init_logger();
      Subscriptions = class {
        constructor(consumer2) {
          this.consumer = consumer2;
          this.guarantor = new subscription_guarantor_default(this);
          this.subscriptions = [];
        }
        create(channelName, mixin) {
          const channel = channelName;
          const params = typeof channel === "object" ? channel : { channel };
          const subscription = new Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        }
        // Private
        add(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.subscribe(subscription);
          return subscription;
        }
        remove(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        }
        reject(identifier) {
          return this.findAll(identifier).map((subscription) => {
            this.forget(subscription);
            this.notify(subscription, "rejected");
            return subscription;
          });
        }
        forget(subscription) {
          this.guarantor.forget(subscription);
          this.subscriptions = this.subscriptions.filter((s2) => s2 !== subscription);
          return subscription;
        }
        findAll(identifier) {
          return this.subscriptions.filter((s2) => s2.identifier === identifier);
        }
        reload() {
          return this.subscriptions.map((subscription) => this.subscribe(subscription));
        }
        notifyAll(callbackName, ...args) {
          return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
        }
        notify(subscription, callbackName, ...args) {
          let subscriptions;
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
        }
        subscribe(subscription) {
          if (this.sendCommand(subscription, "subscribe")) {
            this.guarantor.guarantee(subscription);
          }
        }
        confirmSubscription(identifier) {
          logger_default.log(`Subscription confirmed ${identifier}`);
          this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
        }
        sendCommand(subscription, command) {
          const { identifier } = subscription;
          return this.consumer.send({ command, identifier });
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/consumer.js
  function createWebSocketURL(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a2 = document.createElement("a");
      a2.href = url;
      a2.href = a2.href;
      a2.protocol = a2.protocol.replace("http", "ws");
      return a2.href;
    } else {
      return url;
    }
  }
  var Consumer;
  var init_consumer = __esm({
    "node_modules/@rails/actioncable/src/consumer.js"() {
      init_connection();
      init_subscriptions();
      Consumer = class {
        constructor(url) {
          this._url = url;
          this.subscriptions = new Subscriptions(this);
          this.connection = new connection_default(this);
        }
        get url() {
          return createWebSocketURL(this._url);
        }
        send(data) {
          return this.connection.send(data);
        }
        connect() {
          return this.connection.open();
        }
        disconnect() {
          return this.connection.close({ allowReconnect: false });
        }
        ensureActiveConnection() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/index.js
  var src_exports = {};
  __export(src_exports, {
    Connection: () => connection_default,
    ConnectionMonitor: () => connection_monitor_default,
    Consumer: () => Consumer,
    INTERNAL: () => internal_default,
    Subscription: () => Subscription,
    SubscriptionGuarantor: () => subscription_guarantor_default,
    Subscriptions: () => Subscriptions,
    adapters: () => adapters_default,
    createConsumer: () => createConsumer,
    createWebSocketURL: () => createWebSocketURL,
    getConfig: () => getConfig,
    logger: () => logger_default
  });
  function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
    return new Consumer(url);
  }
  function getConfig(name) {
    const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }
  var init_src = __esm({
    "node_modules/@rails/actioncable/src/index.js"() {
      init_connection();
      init_connection_monitor();
      init_consumer();
      init_internal();
      init_subscription();
      init_subscriptions();
      init_subscription_guarantor();
      init_adapters();
      init_logger();
    }
  });

  // ../../../../../var/lib/gems/3.0.0/gems/actionview-7.0.4.2/lib/assets/compiled/rails-ujs.js
  var require_rails_ujs = __commonJS({
    "../../../../../var/lib/gems/3.0.0/gems/actionview-7.0.4.2/lib/assets/compiled/rails-ujs.js"(exports, module) {
      (function() {
        var context = this;
        (function() {
          (function() {
            this.Rails = {
              linkClickSelector: "a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]",
              buttonClickSelector: {
                selector: "button[data-remote]:not([form]), button[data-confirm]:not([form])",
                exclude: "form button"
              },
              inputChangeSelector: "select[data-remote], input[data-remote], textarea[data-remote]",
              formSubmitSelector: "form:not([data-turbo=true])",
              formInputClickSelector: "form:not([data-turbo=true]) input[type=submit], form:not([data-turbo=true]) input[type=image], form:not([data-turbo=true]) button[type=submit], form:not([data-turbo=true]) button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])",
              formDisableSelector: "input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled",
              formEnableSelector: "input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled",
              fileInputSelector: "input[name][type=file]:not([disabled])",
              linkDisableSelector: "a[data-disable-with], a[data-disable]",
              buttonDisableSelector: "button[data-remote][data-disable-with], button[data-remote][data-disable]"
            };
          }).call(this);
        }).call(context);
        var Rails2 = context.Rails;
        (function() {
          (function() {
            var nonce;
            nonce = null;
            Rails2.loadCSPNonce = function() {
              var ref;
              return nonce = (ref = document.querySelector("meta[name=csp-nonce]")) != null ? ref.content : void 0;
            };
            Rails2.cspNonce = function() {
              return nonce != null ? nonce : Rails2.loadCSPNonce();
            };
          }).call(this);
          (function() {
            var expando, m2;
            m2 = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;
            Rails2.matches = function(element, selector) {
              if (selector.exclude != null) {
                return m2.call(element, selector.selector) && !m2.call(element, selector.exclude);
              } else {
                return m2.call(element, selector);
              }
            };
            expando = "_ujsData";
            Rails2.getData = function(element, key) {
              var ref;
              return (ref = element[expando]) != null ? ref[key] : void 0;
            };
            Rails2.setData = function(element, key, value) {
              if (element[expando] == null) {
                element[expando] = {};
              }
              return element[expando][key] = value;
            };
            Rails2.$ = function(selector) {
              return Array.prototype.slice.call(document.querySelectorAll(selector));
            };
          }).call(this);
          (function() {
            var $2, csrfParam, csrfToken;
            $2 = Rails2.$;
            csrfToken = Rails2.csrfToken = function() {
              var meta;
              meta = document.querySelector("meta[name=csrf-token]");
              return meta && meta.content;
            };
            csrfParam = Rails2.csrfParam = function() {
              var meta;
              meta = document.querySelector("meta[name=csrf-param]");
              return meta && meta.content;
            };
            Rails2.CSRFProtection = function(xhr) {
              var token;
              token = csrfToken();
              if (token != null) {
                return xhr.setRequestHeader("X-CSRF-Token", token);
              }
            };
            Rails2.refreshCSRFTokens = function() {
              var param, token;
              token = csrfToken();
              param = csrfParam();
              if (token != null && param != null) {
                return $2('form input[name="' + param + '"]').forEach(function(input) {
                  return input.value = token;
                });
              }
            };
          }).call(this);
          (function() {
            var CustomEvent2, fire, matches, preventDefault;
            matches = Rails2.matches;
            CustomEvent2 = window.CustomEvent;
            if (typeof CustomEvent2 !== "function") {
              CustomEvent2 = function(event, params) {
                var evt;
                evt = document.createEvent("CustomEvent");
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
              };
              CustomEvent2.prototype = window.Event.prototype;
              preventDefault = CustomEvent2.prototype.preventDefault;
              CustomEvent2.prototype.preventDefault = function() {
                var result;
                result = preventDefault.call(this);
                if (this.cancelable && !this.defaultPrevented) {
                  Object.defineProperty(this, "defaultPrevented", {
                    get: function() {
                      return true;
                    }
                  });
                }
                return result;
              };
            }
            fire = Rails2.fire = function(obj, name, data) {
              var event;
              event = new CustomEvent2(name, {
                bubbles: true,
                cancelable: true,
                detail: data
              });
              obj.dispatchEvent(event);
              return !event.defaultPrevented;
            };
            Rails2.stopEverything = function(e2) {
              fire(e2.target, "ujs:everythingStopped");
              e2.preventDefault();
              e2.stopPropagation();
              return e2.stopImmediatePropagation();
            };
            Rails2.delegate = function(element, selector, eventType, handler) {
              return element.addEventListener(eventType, function(e2) {
                var target;
                target = e2.target;
                while (!(!(target instanceof Element) || matches(target, selector))) {
                  target = target.parentNode;
                }
                if (target instanceof Element && handler.call(target, e2) === false) {
                  e2.preventDefault();
                  return e2.stopPropagation();
                }
              });
            };
          }).call(this);
          (function() {
            var AcceptHeaders, CSRFProtection, createXHR, cspNonce, fire, prepareOptions, processResponse;
            cspNonce = Rails2.cspNonce, CSRFProtection = Rails2.CSRFProtection, fire = Rails2.fire;
            AcceptHeaders = {
              "*": "*/*",
              text: "text/plain",
              html: "text/html",
              xml: "application/xml, text/xml",
              json: "application/json, text/javascript",
              script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
            };
            Rails2.ajax = function(options) {
              var xhr;
              options = prepareOptions(options);
              xhr = createXHR(options, function() {
                var ref, response;
                response = processResponse((ref = xhr.response) != null ? ref : xhr.responseText, xhr.getResponseHeader("Content-Type"));
                if (Math.floor(xhr.status / 100) === 2) {
                  if (typeof options.success === "function") {
                    options.success(response, xhr.statusText, xhr);
                  }
                } else {
                  if (typeof options.error === "function") {
                    options.error(response, xhr.statusText, xhr);
                  }
                }
                return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
              });
              if (options.beforeSend != null && !options.beforeSend(xhr, options)) {
                return false;
              }
              if (xhr.readyState === XMLHttpRequest.OPENED) {
                return xhr.send(options.data);
              }
            };
            prepareOptions = function(options) {
              options.url = options.url || location.href;
              options.type = options.type.toUpperCase();
              if (options.type === "GET" && options.data) {
                if (options.url.indexOf("?") < 0) {
                  options.url += "?" + options.data;
                } else {
                  options.url += "&" + options.data;
                }
              }
              if (AcceptHeaders[options.dataType] == null) {
                options.dataType = "*";
              }
              options.accept = AcceptHeaders[options.dataType];
              if (options.dataType !== "*") {
                options.accept += ", */*; q=0.01";
              }
              return options;
            };
            createXHR = function(options, done) {
              var xhr;
              xhr = new XMLHttpRequest();
              xhr.open(options.type, options.url, true);
              xhr.setRequestHeader("Accept", options.accept);
              if (typeof options.data === "string") {
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
              }
              if (!options.crossDomain) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                CSRFProtection(xhr);
              }
              xhr.withCredentials = !!options.withCredentials;
              xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                  return done(xhr);
                }
              };
              return xhr;
            };
            processResponse = function(response, type) {
              var parser, script;
              if (typeof response === "string" && typeof type === "string") {
                if (type.match(/\bjson\b/)) {
                  try {
                    response = JSON.parse(response);
                  } catch (error2) {
                  }
                } else if (type.match(/\b(?:java|ecma)script\b/)) {
                  script = document.createElement("script");
                  script.setAttribute("nonce", cspNonce());
                  script.text = response;
                  document.head.appendChild(script).parentNode.removeChild(script);
                } else if (type.match(/\b(xml|html|svg)\b/)) {
                  parser = new DOMParser();
                  type = type.replace(/;.+/, "");
                  try {
                    response = parser.parseFromString(response, type);
                  } catch (error2) {
                  }
                }
              }
              return response;
            };
            Rails2.href = function(element) {
              return element.href;
            };
            Rails2.isCrossDomain = function(url) {
              var e2, originAnchor, urlAnchor;
              originAnchor = document.createElement("a");
              originAnchor.href = location.href;
              urlAnchor = document.createElement("a");
              try {
                urlAnchor.href = url;
                return !((!urlAnchor.protocol || urlAnchor.protocol === ":") && !urlAnchor.host || originAnchor.protocol + "//" + originAnchor.host === urlAnchor.protocol + "//" + urlAnchor.host);
              } catch (error2) {
                e2 = error2;
                return true;
              }
            };
          }).call(this);
          (function() {
            var matches, toArray;
            matches = Rails2.matches;
            toArray = function(e2) {
              return Array.prototype.slice.call(e2);
            };
            Rails2.serializeElement = function(element, additionalParam) {
              var inputs, params;
              inputs = [element];
              if (matches(element, "form")) {
                inputs = toArray(element.elements);
              }
              params = [];
              inputs.forEach(function(input) {
                if (!input.name || input.disabled) {
                  return;
                }
                if (matches(input, "fieldset[disabled] *")) {
                  return;
                }
                if (matches(input, "select")) {
                  return toArray(input.options).forEach(function(option) {
                    if (option.selected) {
                      return params.push({
                        name: input.name,
                        value: option.value
                      });
                    }
                  });
                } else if (input.checked || ["radio", "checkbox", "submit"].indexOf(input.type) === -1) {
                  return params.push({
                    name: input.name,
                    value: input.value
                  });
                }
              });
              if (additionalParam) {
                params.push(additionalParam);
              }
              return params.map(function(param) {
                if (param.name != null) {
                  return encodeURIComponent(param.name) + "=" + encodeURIComponent(param.value);
                } else {
                  return param;
                }
              }).join("&");
            };
            Rails2.formElements = function(form, selector) {
              if (matches(form, "form")) {
                return toArray(form.elements).filter(function(el) {
                  return matches(el, selector);
                });
              } else {
                return toArray(form.querySelectorAll(selector));
              }
            };
          }).call(this);
          (function() {
            var allowAction, fire, stopEverything;
            fire = Rails2.fire, stopEverything = Rails2.stopEverything;
            Rails2.handleConfirm = function(e2) {
              if (!allowAction(this)) {
                return stopEverything(e2);
              }
            };
            Rails2.confirm = function(message, element) {
              return confirm(message);
            };
            allowAction = function(element) {
              var answer, callback, message;
              message = element.getAttribute("data-confirm");
              if (!message) {
                return true;
              }
              answer = false;
              if (fire(element, "confirm")) {
                try {
                  answer = Rails2.confirm(message, element);
                } catch (error2) {
                }
                callback = fire(element, "confirm:complete", [answer]);
              }
              return answer && callback;
            };
          }).call(this);
          (function() {
            var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, isXhrRedirect, matches, setData, stopEverything;
            matches = Rails2.matches, getData = Rails2.getData, setData = Rails2.setData, stopEverything = Rails2.stopEverything, formElements = Rails2.formElements;
            Rails2.handleDisabledElement = function(e2) {
              var element;
              element = this;
              if (element.disabled) {
                return stopEverything(e2);
              }
            };
            Rails2.enableElement = function(e2) {
              var element;
              if (e2 instanceof Event) {
                if (isXhrRedirect(e2)) {
                  return;
                }
                element = e2.target;
              } else {
                element = e2;
              }
              if (matches(element, Rails2.linkDisableSelector)) {
                return enableLinkElement(element);
              } else if (matches(element, Rails2.buttonDisableSelector) || matches(element, Rails2.formEnableSelector)) {
                return enableFormElement(element);
              } else if (matches(element, Rails2.formSubmitSelector)) {
                return enableFormElements(element);
              }
            };
            Rails2.disableElement = function(e2) {
              var element;
              element = e2 instanceof Event ? e2.target : e2;
              if (matches(element, Rails2.linkDisableSelector)) {
                return disableLinkElement(element);
              } else if (matches(element, Rails2.buttonDisableSelector) || matches(element, Rails2.formDisableSelector)) {
                return disableFormElement(element);
              } else if (matches(element, Rails2.formSubmitSelector)) {
                return disableFormElements(element);
              }
            };
            disableLinkElement = function(element) {
              var replacement;
              if (getData(element, "ujs:disabled")) {
                return;
              }
              replacement = element.getAttribute("data-disable-with");
              if (replacement != null) {
                setData(element, "ujs:enable-with", element.innerHTML);
                element.innerHTML = replacement;
              }
              element.addEventListener("click", stopEverything);
              return setData(element, "ujs:disabled", true);
            };
            enableLinkElement = function(element) {
              var originalText;
              originalText = getData(element, "ujs:enable-with");
              if (originalText != null) {
                element.innerHTML = originalText;
                setData(element, "ujs:enable-with", null);
              }
              element.removeEventListener("click", stopEverything);
              return setData(element, "ujs:disabled", null);
            };
            disableFormElements = function(form) {
              return formElements(form, Rails2.formDisableSelector).forEach(disableFormElement);
            };
            disableFormElement = function(element) {
              var replacement;
              if (getData(element, "ujs:disabled")) {
                return;
              }
              replacement = element.getAttribute("data-disable-with");
              if (replacement != null) {
                if (matches(element, "button")) {
                  setData(element, "ujs:enable-with", element.innerHTML);
                  element.innerHTML = replacement;
                } else {
                  setData(element, "ujs:enable-with", element.value);
                  element.value = replacement;
                }
              }
              element.disabled = true;
              return setData(element, "ujs:disabled", true);
            };
            enableFormElements = function(form) {
              return formElements(form, Rails2.formEnableSelector).forEach(enableFormElement);
            };
            enableFormElement = function(element) {
              var originalText;
              originalText = getData(element, "ujs:enable-with");
              if (originalText != null) {
                if (matches(element, "button")) {
                  element.innerHTML = originalText;
                } else {
                  element.value = originalText;
                }
                setData(element, "ujs:enable-with", null);
              }
              element.disabled = false;
              return setData(element, "ujs:disabled", null);
            };
            isXhrRedirect = function(event) {
              var ref, xhr;
              xhr = (ref = event.detail) != null ? ref[0] : void 0;
              return (xhr != null ? xhr.getResponseHeader("X-Xhr-Redirect") : void 0) != null;
            };
          }).call(this);
          (function() {
            var stopEverything;
            stopEverything = Rails2.stopEverything;
            Rails2.handleMethod = function(e2) {
              var csrfParam, csrfToken, form, formContent, href, link, method;
              link = this;
              method = link.getAttribute("data-method");
              if (!method) {
                return;
              }
              href = Rails2.href(link);
              csrfToken = Rails2.csrfToken();
              csrfParam = Rails2.csrfParam();
              form = document.createElement("form");
              formContent = "<input name='_method' value='" + method + "' type='hidden' />";
              if (csrfParam != null && csrfToken != null && !Rails2.isCrossDomain(href)) {
                formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
              }
              formContent += '<input type="submit" />';
              form.method = "post";
              form.action = href;
              form.target = link.target;
              form.innerHTML = formContent;
              form.style.display = "none";
              document.body.appendChild(form);
              form.querySelector('[type="submit"]').click();
              return stopEverything(e2);
            };
          }).call(this);
          (function() {
            var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything, slice = [].slice;
            matches = Rails2.matches, getData = Rails2.getData, setData = Rails2.setData, fire = Rails2.fire, stopEverything = Rails2.stopEverything, ajax = Rails2.ajax, isCrossDomain = Rails2.isCrossDomain, serializeElement = Rails2.serializeElement;
            isRemote = function(element) {
              var value;
              value = element.getAttribute("data-remote");
              return value != null && value !== "false";
            };
            Rails2.handleRemote = function(e2) {
              var button, data, dataType, element, method, url, withCredentials;
              element = this;
              if (!isRemote(element)) {
                return true;
              }
              if (!fire(element, "ajax:before")) {
                fire(element, "ajax:stopped");
                return false;
              }
              withCredentials = element.getAttribute("data-with-credentials");
              dataType = element.getAttribute("data-type") || "script";
              if (matches(element, Rails2.formSubmitSelector)) {
                button = getData(element, "ujs:submit-button");
                method = getData(element, "ujs:submit-button-formmethod") || element.method;
                url = getData(element, "ujs:submit-button-formaction") || element.getAttribute("action") || location.href;
                if (method.toUpperCase() === "GET") {
                  url = url.replace(/\?.*$/, "");
                }
                if (element.enctype === "multipart/form-data") {
                  data = new FormData(element);
                  if (button != null) {
                    data.append(button.name, button.value);
                  }
                } else {
                  data = serializeElement(element, button);
                }
                setData(element, "ujs:submit-button", null);
                setData(element, "ujs:submit-button-formmethod", null);
                setData(element, "ujs:submit-button-formaction", null);
              } else if (matches(element, Rails2.buttonClickSelector) || matches(element, Rails2.inputChangeSelector)) {
                method = element.getAttribute("data-method");
                url = element.getAttribute("data-url");
                data = serializeElement(element, element.getAttribute("data-params"));
              } else {
                method = element.getAttribute("data-method");
                url = Rails2.href(element);
                data = element.getAttribute("data-params");
              }
              ajax({
                type: method || "GET",
                url,
                data,
                dataType,
                beforeSend: function(xhr, options) {
                  if (fire(element, "ajax:beforeSend", [xhr, options])) {
                    return fire(element, "ajax:send", [xhr]);
                  } else {
                    fire(element, "ajax:stopped");
                    return false;
                  }
                },
                success: function() {
                  var args;
                  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                  return fire(element, "ajax:success", args);
                },
                error: function() {
                  var args;
                  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                  return fire(element, "ajax:error", args);
                },
                complete: function() {
                  var args;
                  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                  return fire(element, "ajax:complete", args);
                },
                crossDomain: isCrossDomain(url),
                withCredentials: withCredentials != null && withCredentials !== "false"
              });
              return stopEverything(e2);
            };
            Rails2.formSubmitButtonClick = function(e2) {
              var button, form;
              button = this;
              form = button.form;
              if (!form) {
                return;
              }
              if (button.name) {
                setData(form, "ujs:submit-button", {
                  name: button.name,
                  value: button.value
                });
              }
              setData(form, "ujs:formnovalidate-button", button.formNoValidate);
              setData(form, "ujs:submit-button-formaction", button.getAttribute("formaction"));
              return setData(form, "ujs:submit-button-formmethod", button.getAttribute("formmethod"));
            };
            Rails2.preventInsignificantClick = function(e2) {
              var data, insignificantMetaClick, link, metaClick, method, nonPrimaryMouseClick;
              link = this;
              method = (link.getAttribute("data-method") || "GET").toUpperCase();
              data = link.getAttribute("data-params");
              metaClick = e2.metaKey || e2.ctrlKey;
              insignificantMetaClick = metaClick && method === "GET" && !data;
              nonPrimaryMouseClick = e2.button != null && e2.button !== 0;
              if (nonPrimaryMouseClick || insignificantMetaClick) {
                return e2.stopImmediatePropagation();
              }
            };
          }).call(this);
          (function() {
            var $2, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMethod, handleRemote, loadCSPNonce, preventInsignificantClick, refreshCSRFTokens;
            fire = Rails2.fire, delegate = Rails2.delegate, getData = Rails2.getData, $2 = Rails2.$, refreshCSRFTokens = Rails2.refreshCSRFTokens, CSRFProtection = Rails2.CSRFProtection, loadCSPNonce = Rails2.loadCSPNonce, enableElement = Rails2.enableElement, disableElement = Rails2.disableElement, handleDisabledElement = Rails2.handleDisabledElement, handleConfirm = Rails2.handleConfirm, preventInsignificantClick = Rails2.preventInsignificantClick, handleRemote = Rails2.handleRemote, formSubmitButtonClick = Rails2.formSubmitButtonClick, handleMethod = Rails2.handleMethod;
            if (typeof jQuery !== "undefined" && jQuery !== null && jQuery.ajax != null) {
              if (jQuery.rails) {
                throw new Error("If you load both jquery_ujs and rails-ujs, use rails-ujs only.");
              }
              jQuery.rails = Rails2;
              jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
                if (!options.crossDomain) {
                  return CSRFProtection(xhr);
                }
              });
            }
            Rails2.start = function() {
              if (window._rails_loaded) {
                throw new Error("rails-ujs has already been loaded!");
              }
              window.addEventListener("pageshow", function() {
                $2(Rails2.formEnableSelector).forEach(function(el) {
                  if (getData(el, "ujs:disabled")) {
                    return enableElement(el);
                  }
                });
                return $2(Rails2.linkDisableSelector).forEach(function(el) {
                  if (getData(el, "ujs:disabled")) {
                    return enableElement(el);
                  }
                });
              });
              delegate(document, Rails2.linkDisableSelector, "ajax:complete", enableElement);
              delegate(document, Rails2.linkDisableSelector, "ajax:stopped", enableElement);
              delegate(document, Rails2.buttonDisableSelector, "ajax:complete", enableElement);
              delegate(document, Rails2.buttonDisableSelector, "ajax:stopped", enableElement);
              delegate(document, Rails2.linkClickSelector, "click", preventInsignificantClick);
              delegate(document, Rails2.linkClickSelector, "click", handleDisabledElement);
              delegate(document, Rails2.linkClickSelector, "click", handleConfirm);
              delegate(document, Rails2.linkClickSelector, "click", disableElement);
              delegate(document, Rails2.linkClickSelector, "click", handleRemote);
              delegate(document, Rails2.linkClickSelector, "click", handleMethod);
              delegate(document, Rails2.buttonClickSelector, "click", preventInsignificantClick);
              delegate(document, Rails2.buttonClickSelector, "click", handleDisabledElement);
              delegate(document, Rails2.buttonClickSelector, "click", handleConfirm);
              delegate(document, Rails2.buttonClickSelector, "click", disableElement);
              delegate(document, Rails2.buttonClickSelector, "click", handleRemote);
              delegate(document, Rails2.inputChangeSelector, "change", handleDisabledElement);
              delegate(document, Rails2.inputChangeSelector, "change", handleConfirm);
              delegate(document, Rails2.inputChangeSelector, "change", handleRemote);
              delegate(document, Rails2.formSubmitSelector, "submit", handleDisabledElement);
              delegate(document, Rails2.formSubmitSelector, "submit", handleConfirm);
              delegate(document, Rails2.formSubmitSelector, "submit", handleRemote);
              delegate(document, Rails2.formSubmitSelector, "submit", function(e2) {
                return setTimeout(function() {
                  return disableElement(e2);
                }, 13);
              });
              delegate(document, Rails2.formSubmitSelector, "ajax:send", disableElement);
              delegate(document, Rails2.formSubmitSelector, "ajax:complete", enableElement);
              delegate(document, Rails2.formInputClickSelector, "click", preventInsignificantClick);
              delegate(document, Rails2.formInputClickSelector, "click", handleDisabledElement);
              delegate(document, Rails2.formInputClickSelector, "click", handleConfirm);
              delegate(document, Rails2.formInputClickSelector, "click", formSubmitButtonClick);
              document.addEventListener("DOMContentLoaded", refreshCSRFTokens);
              document.addEventListener("DOMContentLoaded", loadCSPNonce);
              return window._rails_loaded = true;
            };
            if (window.Rails === Rails2 && fire(document, "rails:attachBindings")) {
              Rails2.start();
            }
          }).call(this);
        }).call(this);
        if (typeof module === "object" && module.exports) {
          module.exports = Rails2;
        } else if (typeof define === "function" && define.amd) {
          define(Rails2);
        }
      }).call(exports);
    }
  });

  // node_modules/slim-select/dist/slimselect.umd.js
  var require_slimselect_umd = __commonJS({
    "node_modules/slim-select/dist/slimselect.umd.js"(exports, module) {
      (function(global2, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, global2.SlimSelect = factory());
      })(exports, function() {
        "use strict";
        function generateID() {
          return Math.random().toString(36).substring(2, 10);
        }
        function hasClassInTree(element, className) {
          function hasClass(e2, c2) {
            if (c2 && e2 && e2.classList && e2.classList.contains(c2)) {
              return e2;
            }
            if (c2 && e2 && e2.dataset && e2.dataset.id && e2.dataset.id === className) {
              return e2;
            }
            return null;
          }
          function parentByClass(e2, c2) {
            if (!e2 || e2 === document) {
              return null;
            } else if (hasClass(e2, c2)) {
              return e2;
            } else {
              return parentByClass(e2.parentNode, c2);
            }
          }
          return hasClass(element, className) || parentByClass(element, className);
        }
        function debounce(func, wait = 50, immediate = false) {
          let timeout;
          return function(...args) {
            const context = self;
            const later = () => {
              timeout = null;
              if (!immediate) {
                func.apply(context, args);
              }
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
              func.apply(context, args);
            }
          };
        }
        function isEqual(a2, b2) {
          return JSON.stringify(a2) === JSON.stringify(b2);
        }
        function kebabCase(str) {
          const result = str.replace(/[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g, (match) => "-" + match.toLowerCase());
          return str[0] === str[0].toUpperCase() ? result.substring(1) : result;
        }
        class Settings {
          constructor(settings) {
            this.id = "";
            this.style = "";
            this.class = [];
            this.isMultiple = false;
            this.isOpen = false;
            this.isWindowFocused = true;
            this.triggerFocus = true;
            this.intervalMove = null;
            if (!settings) {
              settings = {};
            }
            this.id = "ss-" + generateID();
            this.style = settings.style || "";
            this.class = settings.class || [];
            this.disabled = settings.disabled !== void 0 ? settings.disabled : false;
            this.alwaysOpen = settings.alwaysOpen !== void 0 ? settings.alwaysOpen : false;
            this.showSearch = settings.showSearch !== void 0 ? settings.showSearch : true;
            this.searchPlaceholder = settings.searchPlaceholder || "Search";
            this.searchText = settings.searchText || "No Results";
            this.searchingText = settings.searchingText || "Searching...";
            this.searchHighlight = settings.searchHighlight !== void 0 ? settings.searchHighlight : false;
            this.closeOnSelect = settings.closeOnSelect !== void 0 ? settings.closeOnSelect : true;
            this.contentLocation = settings.contentLocation || document.body;
            this.contentPosition = settings.contentPosition || "absolute";
            this.openPosition = settings.openPosition || "auto";
            this.placeholderText = settings.placeholderText !== void 0 ? settings.placeholderText : "Select Value";
            this.allowDeselect = settings.allowDeselect !== void 0 ? settings.allowDeselect : false;
            this.hideSelected = settings.hideSelected !== void 0 ? settings.hideSelected : false;
            this.showOptionTooltips = settings.showOptionTooltips !== void 0 ? settings.showOptionTooltips : false;
            this.minSelected = settings.minSelected || 0;
            this.maxSelected = settings.maxSelected || 1e3;
            this.timeoutDelay = settings.timeoutDelay || 200;
            this.maxValuesShown = settings.maxValuesShown || 20;
            this.maxValuesMessage = settings.maxValuesMessage || "{number} selected";
          }
        }
        class Optgroup {
          constructor(optgroup) {
            this.id = !optgroup.id || optgroup.id === "" ? generateID() : optgroup.id;
            this.label = optgroup.label || "";
            this.selectAll = optgroup.selectAll === void 0 ? false : optgroup.selectAll;
            this.closable = optgroup.closable || "off";
            this.options = [];
            if (optgroup.options) {
              for (const o2 of optgroup.options) {
                this.options.push(new Option(o2));
              }
            }
          }
        }
        class Option {
          constructor(option) {
            this.id = !option.id || option.id === "" ? generateID() : option.id;
            this.value = option.value === void 0 ? option.text : option.value;
            this.text = option.text || "";
            this.html = option.html || "";
            this.selected = option.selected !== void 0 ? option.selected : false;
            this.display = option.display !== void 0 ? option.display : true;
            this.disabled = option.disabled !== void 0 ? option.disabled : false;
            this.mandatory = option.mandatory !== void 0 ? option.mandatory : false;
            this.placeholder = option.placeholder !== void 0 ? option.placeholder : false;
            this.class = option.class || "";
            this.style = option.style || "";
            this.data = option.data || {};
          }
        }
        class Store {
          constructor(type, data) {
            this.selectType = "single";
            this.data = [];
            this.selectType = type;
            this.setData(data);
          }
          validateDataArray(data) {
            if (!Array.isArray(data)) {
              return new Error("Data must be an array");
            }
            for (let dataObj of data) {
              if (dataObj instanceof Optgroup || "label" in dataObj) {
                if (!("label" in dataObj)) {
                  return new Error("Optgroup must have a label");
                }
                if ("options" in dataObj && dataObj.options) {
                  for (let option of dataObj.options) {
                    return this.validateOption(option);
                  }
                }
              } else if (dataObj instanceof Option || "text" in dataObj) {
                return this.validateOption(dataObj);
              } else {
                return new Error("Data object must be a valid optgroup or option");
              }
            }
            return null;
          }
          validateOption(option) {
            if (!("text" in option)) {
              return new Error("Option must have a text");
            }
            return null;
          }
          partialToFullData(data) {
            let dataFinal = [];
            data.forEach((dataObj) => {
              if (dataObj instanceof Optgroup || "label" in dataObj) {
                let optOptions = [];
                if ("options" in dataObj && dataObj.options) {
                  dataObj.options.forEach((option) => {
                    optOptions.push(new Option(option));
                  });
                }
                if (optOptions.length > 0) {
                  dataFinal.push(new Optgroup(dataObj));
                }
              }
              if (dataObj instanceof Option || "text" in dataObj) {
                dataFinal.push(new Option(dataObj));
              }
            });
            return dataFinal;
          }
          setData(data) {
            this.data = this.partialToFullData(data);
            if (this.selectType === "single") {
              this.setSelectedBy("value", this.getSelected());
            }
          }
          getData() {
            return this.filter(null, true);
          }
          getDataOptions() {
            return this.filter(null, false);
          }
          addOption(option) {
            this.setData(this.getData().concat(new Option(option)));
          }
          setSelectedBy(selectedType, selectedValues) {
            let firstOption = null;
            let hasSelected = false;
            for (let dataObj of this.data) {
              if (dataObj instanceof Optgroup) {
                for (let option of dataObj.options) {
                  if (!firstOption) {
                    firstOption = option;
                  }
                  option.selected = hasSelected ? false : selectedValues.includes(option[selectedType]);
                  if (option.selected && this.selectType === "single") {
                    hasSelected = true;
                  }
                }
              }
              if (dataObj instanceof Option) {
                if (!firstOption) {
                  firstOption = dataObj;
                }
                dataObj.selected = hasSelected ? false : selectedValues.includes(dataObj[selectedType]);
                if (dataObj.selected && this.selectType === "single") {
                  hasSelected = true;
                }
              }
            }
            if (this.selectType === "single" && firstOption && !hasSelected) {
              firstOption.selected = true;
            }
          }
          getSelected() {
            let selectedOptions = this.getSelectedOptions();
            let selectedValues = [];
            selectedOptions.forEach((option) => {
              selectedValues.push(option.value);
            });
            return selectedValues;
          }
          getSelectedOptions() {
            return this.filter((opt) => {
              return opt.selected;
            }, false);
          }
          getSelectedIDs() {
            let selectedOptions = this.getSelectedOptions();
            let selectedIDs = [];
            selectedOptions.forEach((op) => {
              selectedIDs.push(op.id);
            });
            return selectedIDs;
          }
          getOptgroupByID(id) {
            for (let dataObj of this.data) {
              if (dataObj instanceof Optgroup && dataObj.id === id) {
                return dataObj;
              }
            }
            return null;
          }
          getOptionByID(id) {
            let options = this.filter((opt) => {
              return opt.id === id;
            }, false);
            return options.length ? options[0] : null;
          }
          search(search, searchFilter) {
            search = search.trim();
            if (search === "") {
              return this.getData();
            }
            return this.filter((opt) => {
              return searchFilter(opt, search);
            }, true);
          }
          filter(filter, includeOptgroup) {
            const dataSearch = [];
            this.data.forEach((dataObj) => {
              if (dataObj instanceof Optgroup) {
                let optOptions = [];
                dataObj.options.forEach((option) => {
                  if (!filter || filter(option)) {
                    if (!includeOptgroup) {
                      dataSearch.push(new Option(option));
                    } else {
                      optOptions.push(new Option(option));
                    }
                  }
                });
                if (optOptions.length > 0) {
                  let optgroup = new Optgroup(dataObj);
                  optgroup.options = optOptions;
                  dataSearch.push(optgroup);
                }
              }
              if (dataObj instanceof Option) {
                if (!filter || filter(dataObj)) {
                  dataSearch.push(new Option(dataObj));
                }
              }
            });
            return dataSearch;
          }
        }
        class Render {
          constructor(settings, store, callbacks) {
            this.classes = {
              main: "ss-main",
              placeholder: "ss-placeholder",
              values: "ss-values",
              single: "ss-single",
              max: "ss-max",
              value: "ss-value",
              valueText: "ss-value-text",
              valueDelete: "ss-value-delete",
              valueOut: "ss-value-out",
              deselect: "ss-deselect",
              deselectPath: "M10,10 L90,90 M10,90 L90,10",
              arrow: "ss-arrow",
              arrowClose: "M10,30 L50,70 L90,30",
              arrowOpen: "M10,70 L50,30 L90,70",
              content: "ss-content",
              openAbove: "ss-open-above",
              openBelow: "ss-open-below",
              search: "ss-search",
              searchHighlighter: "ss-search-highlight",
              searching: "ss-searching",
              addable: "ss-addable",
              addablePath: "M50,10 L50,90 M10,50 L90,50",
              list: "ss-list",
              optgroup: "ss-optgroup",
              optgroupLabel: "ss-optgroup-label",
              optgroupLabelText: "ss-optgroup-label-text",
              optgroupActions: "ss-optgroup-actions",
              optgroupSelectAll: "ss-selectall",
              optgroupSelectAllBox: "M60,10 L10,10 L10,90 L90,90 L90,50",
              optgroupSelectAllCheck: "M30,45 L50,70 L90,10",
              optgroupClosable: "ss-closable",
              option: "ss-option",
              optionDelete: "M10,10 L90,90 M10,90 L90,10",
              highlighted: "ss-highlighted",
              open: "ss-open",
              close: "ss-close",
              selected: "ss-selected",
              error: "ss-error",
              disabled: "ss-disabled",
              hide: "ss-hide"
            };
            this.store = store;
            this.settings = settings;
            this.callbacks = callbacks;
            this.main = this.mainDiv();
            this.content = this.contentDiv();
            this.updateClassStyles();
            this.settings.contentLocation.appendChild(this.content.main);
          }
          enable() {
            this.main.main.classList.remove(this.classes.disabled);
            this.content.search.input.disabled = false;
          }
          disable() {
            this.main.main.classList.add(this.classes.disabled);
            this.content.search.input.disabled = true;
          }
          open() {
            this.main.arrow.path.setAttribute("d", this.classes.arrowOpen);
            this.main.main.classList.add(this.settings.openPosition === "up" ? this.classes.openAbove : this.classes.openBelow);
            this.moveContent();
            const selectedOptions = this.store.getSelectedOptions();
            if (selectedOptions.length) {
              const selectedId = selectedOptions[selectedOptions.length - 1].id;
              const selectedOption = this.content.list.querySelector('[data-id="' + selectedId + '"]');
              if (selectedOption) {
                this.ensureElementInView(this.content.list, selectedOption);
              }
            }
          }
          close() {
            this.main.main.classList.remove(this.classes.openAbove);
            this.main.main.classList.remove(this.classes.openBelow);
            this.content.main.classList.remove(this.classes.openAbove);
            this.content.main.classList.remove(this.classes.openBelow);
            this.main.arrow.path.setAttribute("d", this.classes.arrowClose);
          }
          updateClassStyles() {
            this.main.main.className = "";
            this.main.main.removeAttribute("style");
            this.content.main.className = "";
            this.content.main.removeAttribute("style");
            this.main.main.classList.add(this.classes.main);
            this.content.main.classList.add(this.classes.content);
            if (this.settings.style !== "") {
              this.content.main.style.cssText = this.settings.style;
            }
            if (this.settings.class.length) {
              for (const c2 of this.settings.class) {
                if (c2.trim() !== "") {
                  this.main.main.classList.add(c2.trim());
                  this.content.main.classList.add(c2.trim());
                }
              }
            }
            if (this.settings.contentPosition === "relative") {
              this.content.main.classList.add("ss-" + this.settings.contentPosition);
            }
          }
          mainDiv() {
            const main = document.createElement("div");
            main.dataset.id = this.settings.id;
            main.tabIndex = 0;
            main.onfocus = () => {
              if (this.settings.triggerFocus && this.settings.isWindowFocused) {
                this.callbacks.open();
              }
            };
            main.onkeydown = (e2) => {
              switch (e2.key) {
                case "ArrowUp":
                case "ArrowDown":
                  this.callbacks.open();
                  e2.key === "ArrowDown" ? this.highlight("down") : this.highlight("up");
                  return false;
                case "Tab":
                  this.callbacks.close();
                  return true;
                case "Enter":
                  const highlighted = this.content.list.querySelector("." + this.classes.highlighted);
                  if (highlighted) {
                    highlighted.click();
                  }
                  return false;
                case "Escape":
                  this.callbacks.close();
                  return false;
              }
            };
            main.onclick = (e2) => {
              if (this.settings.disabled) {
                return;
              }
              this.settings.isOpen ? this.callbacks.close() : this.callbacks.open();
            };
            const values = document.createElement("div");
            values.classList.add(this.classes.values);
            main.appendChild(values);
            const deselect = document.createElement("div");
            deselect.classList.add(this.classes.deselect);
            if (!this.settings.allowDeselect || this.settings.isMultiple) {
              deselect.classList.add(this.classes.hide);
            }
            deselect.onclick = (e2) => {
              e2.stopPropagation();
              if (this.settings.disabled) {
                return;
              }
              let shouldDelete = true;
              const before = this.store.getSelectedOptions();
              const after = [];
              if (this.callbacks.beforeChange) {
                shouldDelete = this.callbacks.beforeChange(after, before) === true;
              }
              if (shouldDelete) {
                this.callbacks.setSelected([""], false);
                if (this.settings.closeOnSelect) {
                  this.callbacks.close();
                }
                if (this.callbacks.afterChange) {
                  this.callbacks.afterChange(after);
                }
              }
            };
            const deselectSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            deselectSvg.setAttribute("viewBox", "0 0 100 100");
            const deselectPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            deselectPath.setAttribute("d", this.classes.deselectPath);
            deselectSvg.appendChild(deselectPath);
            deselect.appendChild(deselectSvg);
            main.appendChild(deselect);
            const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            arrow.classList.add(this.classes.arrow);
            arrow.setAttribute("viewBox", "0 0 100 100");
            const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            arrowPath.setAttribute("d", this.classes.arrowClose);
            if (this.settings.alwaysOpen) {
              arrow.classList.add(this.classes.hide);
            }
            arrow.appendChild(arrowPath);
            main.appendChild(arrow);
            return {
              main,
              values,
              deselect: {
                main: deselect,
                svg: deselectSvg,
                path: deselectPath
              },
              arrow: {
                main: arrow,
                path: arrowPath
              }
            };
          }
          mainFocus(trigger) {
            if (!trigger) {
              this.settings.triggerFocus = false;
            }
            this.main.main.focus({ preventScroll: true });
            this.settings.triggerFocus = true;
          }
          placeholder() {
            const placeholderOption = this.store.filter((o2) => o2.placeholder, false);
            let placeholderText = this.settings.placeholderText;
            if (placeholderOption.length) {
              if (placeholderOption[0].html !== "") {
                placeholderText = placeholderOption[0].html;
              } else if (placeholderOption[0].text !== "") {
                placeholderText = placeholderOption[0].text;
              }
            }
            const placeholder = document.createElement("div");
            placeholder.classList.add(this.classes.placeholder);
            placeholder.innerHTML = placeholderText;
            return placeholder;
          }
          renderValues() {
            if (!this.settings.isMultiple) {
              this.renderSingleValue();
              return;
            }
            this.renderMultipleValues();
          }
          renderSingleValue() {
            const selected = this.store.filter((o2) => {
              return o2.selected && !o2.placeholder;
            }, false);
            const selectedSingle = selected.length > 0 ? selected[0] : null;
            if (!selectedSingle) {
              this.main.values.innerHTML = this.placeholder().outerHTML;
            } else {
              const singleValue = document.createElement("div");
              singleValue.classList.add(this.classes.single);
              singleValue.innerHTML = selectedSingle.html ? selectedSingle.html : selectedSingle.text;
              this.main.values.innerHTML = singleValue.outerHTML;
            }
            if (!this.settings.allowDeselect || !selected.length) {
              this.main.deselect.main.classList.add(this.classes.hide);
            } else {
              this.main.deselect.main.classList.remove(this.classes.hide);
            }
          }
          renderMultipleValues() {
            let currentNodes = this.main.values.childNodes;
            let selectedOptions = this.store.filter((opt) => {
              return opt.selected && opt.display;
            }, false);
            if (selectedOptions.length === 0) {
              this.main.values.innerHTML = this.placeholder().outerHTML;
              return;
            } else {
              const placeholder = this.main.values.querySelector("." + this.classes.placeholder);
              if (placeholder) {
                placeholder.remove();
              }
            }
            if (selectedOptions.length > this.settings.maxValuesShown) {
              const singleValue = document.createElement("div");
              singleValue.classList.add(this.classes.max);
              singleValue.textContent = this.settings.maxValuesMessage.replace("{number}", selectedOptions.length.toString());
              this.main.values.innerHTML = singleValue.outerHTML;
              return;
            } else {
              const maxValuesMessage = this.main.values.querySelector("." + this.classes.max);
              if (maxValuesMessage) {
                maxValuesMessage.remove();
              }
            }
            let removeNodes = [];
            for (let i2 = 0; i2 < currentNodes.length; i2++) {
              const node = currentNodes[i2];
              const id = node.getAttribute("data-id");
              if (id) {
                const found = selectedOptions.filter((opt) => {
                  return opt.id === id;
                }, false);
                if (!found.length) {
                  removeNodes.push(node);
                }
              }
            }
            for (const n2 of removeNodes) {
              n2.classList.add(this.classes.valueOut);
              setTimeout(() => {
                this.main.values.removeChild(n2);
              }, 100);
            }
            currentNodes = this.main.values.childNodes;
            for (let d2 = 0; d2 < selectedOptions.length; d2++) {
              let shouldAdd = true;
              for (let i2 = 0; i2 < currentNodes.length; i2++) {
                if (selectedOptions[d2].id === String(currentNodes[i2].dataset.id)) {
                  shouldAdd = false;
                }
              }
              if (shouldAdd) {
                if (currentNodes.length === 0) {
                  this.main.values.appendChild(this.multipleValue(selectedOptions[d2]));
                } else if (d2 === 0) {
                  this.main.values.insertBefore(this.multipleValue(selectedOptions[d2]), currentNodes[d2]);
                } else {
                  currentNodes[d2 - 1].insertAdjacentElement("afterend", this.multipleValue(selectedOptions[d2]));
                }
              }
            }
          }
          multipleValue(option) {
            const value = document.createElement("div");
            value.classList.add(this.classes.value);
            value.dataset.id = option.id;
            const text = document.createElement("div");
            text.classList.add(this.classes.valueText);
            text.innerHTML = option.text;
            value.appendChild(text);
            if (!option.mandatory) {
              const deleteDiv = document.createElement("div");
              deleteDiv.classList.add(this.classes.valueDelete);
              deleteDiv.onclick = (e2) => {
                e2.preventDefault();
                e2.stopPropagation();
                if (this.settings.disabled) {
                  return;
                }
                let shouldDelete = true;
                const before = this.store.getSelectedOptions();
                const after = before.filter((o2) => {
                  return o2.selected && o2.id !== option.id;
                }, true);
                if (this.settings.minSelected && after.length < this.settings.minSelected) {
                  return;
                }
                if (this.callbacks.beforeChange) {
                  shouldDelete = this.callbacks.beforeChange(after, before) === true;
                }
                if (shouldDelete) {
                  let selectedValues = [];
                  for (const o2 of after) {
                    if (o2 instanceof Optgroup) {
                      for (const c2 of o2.options) {
                        selectedValues.push(c2.value);
                      }
                    }
                    if (o2 instanceof Option) {
                      selectedValues.push(o2.value);
                    }
                  }
                  this.callbacks.setSelected(selectedValues, false);
                  if (this.settings.closeOnSelect) {
                    this.callbacks.close();
                  }
                  if (this.callbacks.afterChange) {
                    this.callbacks.afterChange(after);
                  }
                }
              };
              const deleteSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              deleteSvg.setAttribute("viewBox", "0 0 100 100");
              const deletePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
              deletePath.setAttribute("d", this.classes.optionDelete);
              deleteSvg.appendChild(deletePath);
              deleteDiv.appendChild(deleteSvg);
              value.appendChild(deleteDiv);
            }
            return value;
          }
          contentDiv() {
            const main = document.createElement("div");
            main.dataset.id = this.settings.id;
            const search = this.searchDiv();
            main.appendChild(search.main);
            const list = this.listDiv();
            main.appendChild(list);
            return {
              main,
              search,
              list
            };
          }
          moveContent() {
            if (this.settings.contentPosition === "relative") {
              this.moveContentBelow();
              return;
            }
            if (this.settings.openPosition === "down") {
              this.moveContentBelow();
              return;
            } else if (this.settings.openPosition === "up") {
              this.moveContentAbove();
              return;
            }
            if (this.putContent() === "up") {
              this.moveContentAbove();
            } else {
              this.moveContentBelow();
            }
          }
          searchDiv() {
            const main = document.createElement("div");
            const input = document.createElement("input");
            const addable = document.createElement("div");
            main.classList.add(this.classes.search);
            const searchReturn = {
              main,
              input
            };
            if (!this.settings.showSearch) {
              main.classList.add(this.classes.hide);
              input.readOnly = true;
            }
            input.type = "search";
            input.placeholder = this.settings.searchPlaceholder;
            input.tabIndex = -1;
            input.setAttribute("aria-label", this.settings.searchPlaceholder);
            input.setAttribute("autocapitalize", "off");
            input.setAttribute("autocomplete", "off");
            input.setAttribute("autocorrect", "off");
            input.oninput = debounce((e2) => {
              this.callbacks.search(e2.target.value);
            }, 100);
            input.onkeydown = (e2) => {
              switch (e2.key) {
                case "ArrowUp":
                case "ArrowDown":
                  this.callbacks.open();
                  e2.key === "ArrowDown" ? this.highlight("down") : this.highlight("up");
                  return false;
                case "Tab":
                  this.callbacks.close();
                  return true;
                case "Escape":
                  this.callbacks.close();
                  return false;
                case "Enter":
                  if (this.callbacks.addable && e2.ctrlKey) {
                    addable.click();
                  } else {
                    const highlighted = this.content.list.querySelector("." + this.classes.highlighted);
                    if (highlighted) {
                      highlighted.click();
                    }
                  }
                  return false;
              }
            };
            input.onfocus = () => {
              if (this.settings.isOpen) {
                return;
              }
              this.callbacks.open();
            };
            main.appendChild(input);
            if (this.callbacks.addable) {
              addable.classList.add(this.classes.addable);
              const plus = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              plus.setAttribute("viewBox", "0 0 100 100");
              const plusPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
              plusPath.setAttribute("d", this.classes.addablePath);
              plus.appendChild(plusPath);
              addable.appendChild(plus);
              addable.onclick = (e2) => {
                e2.preventDefault();
                e2.stopPropagation();
                if (!this.callbacks.addable) {
                  return;
                }
                const inputValue = this.content.search.input.value.trim();
                if (inputValue === "") {
                  this.content.search.input.focus();
                  return;
                }
                const runFinish = (oo) => {
                  let newOption = new Option(oo);
                  this.callbacks.addOption(newOption);
                  if (this.settings.isMultiple) {
                    let values = this.store.getSelected();
                    values.push(newOption.value);
                    this.callbacks.setSelected(values, true);
                  } else {
                    this.callbacks.setSelected([newOption.value], true);
                  }
                  this.callbacks.search("");
                  if (this.settings.closeOnSelect) {
                    setTimeout(() => {
                      this.callbacks.close();
                    }, 100);
                  }
                };
                const addableValue = this.callbacks.addable(inputValue);
                if (addableValue instanceof Promise) {
                  addableValue.then((value) => {
                    if (typeof value === "string") {
                      runFinish({
                        text: value,
                        value
                      });
                    } else {
                      runFinish(value);
                    }
                  });
                } else if (typeof addableValue === "string") {
                  runFinish({
                    text: addableValue,
                    value: addableValue
                  });
                } else {
                  runFinish(addableValue);
                }
                return;
              };
              main.appendChild(addable);
              searchReturn.addable = {
                main: addable,
                svg: plus,
                path: plusPath
              };
            }
            return searchReturn;
          }
          searchFocus(trigger) {
            if (!trigger) {
              this.settings.triggerFocus = false;
            }
            this.content.search.input.focus();
            this.settings.triggerFocus = true;
          }
          getOptions(notPlaceholder = false, notDisabled = false, notHidden = false) {
            let query = "." + this.classes.option;
            if (notPlaceholder) {
              query += ":not(." + this.classes.placeholder + ")";
            }
            if (notDisabled) {
              query += ":not(." + this.classes.disabled + ")";
            }
            if (notHidden) {
              query += ":not(." + this.classes.hide + ")";
            }
            return Array.from(this.content.list.querySelectorAll(query));
          }
          highlight(dir) {
            const options = this.getOptions(true, true, true);
            if (options.length === 0) {
              return;
            }
            if (options.length === 1) {
              if (!options[0].classList.contains(this.classes.highlighted)) {
                options[0].classList.add(this.classes.highlighted);
                return;
              }
            }
            for (let i2 = 0; i2 < options.length; i2++) {
              if (options[i2].classList.contains(this.classes.highlighted)) {
                const prevOption = options[i2];
                prevOption.classList.remove(this.classes.highlighted);
                const prevParent = prevOption.parentElement;
                if (prevParent && prevParent.classList.contains(this.classes.open)) {
                  const optgroupLabel = prevParent.querySelector("." + this.classes.optgroupLabel);
                  if (optgroupLabel) {
                    optgroupLabel.click();
                  }
                }
                let selectOption = options[dir === "down" ? i2 + 1 < options.length ? i2 + 1 : 0 : i2 - 1 >= 0 ? i2 - 1 : options.length - 1];
                selectOption.classList.add(this.classes.highlighted);
                this.ensureElementInView(this.content.list, selectOption);
                const selectParent = selectOption.parentElement;
                if (selectParent && selectParent.classList.contains(this.classes.close)) {
                  const optgroupLabel = selectParent.querySelector("." + this.classes.optgroupLabel);
                  if (optgroupLabel) {
                    optgroupLabel.click();
                  }
                }
                return;
              }
            }
            options[dir === "down" ? 0 : options.length - 1].classList.add(this.classes.highlighted);
            this.ensureElementInView(this.content.list, options[dir === "down" ? 0 : options.length - 1]);
          }
          listDiv() {
            const options = document.createElement("div");
            options.classList.add(this.classes.list);
            options.setAttribute("role", "listbox");
            return options;
          }
          renderError(error2) {
            this.content.list.innerHTML = "";
            const errorDiv = document.createElement("div");
            errorDiv.classList.add(this.classes.error);
            errorDiv.textContent = error2;
            this.content.list.appendChild(errorDiv);
          }
          renderSearching() {
            this.content.list.innerHTML = "";
            const searchingDiv = document.createElement("div");
            searchingDiv.classList.add(this.classes.searching);
            searchingDiv.textContent = this.settings.searchingText;
            this.content.list.appendChild(searchingDiv);
          }
          renderOptions(data) {
            this.content.list.innerHTML = "";
            if (data.length === 0) {
              const noResults = document.createElement("div");
              noResults.classList.add(this.classes.search);
              noResults.innerHTML = this.settings.searchText;
              this.content.list.appendChild(noResults);
              return;
            }
            for (const d2 of data) {
              if (d2 instanceof Optgroup) {
                const optgroupEl = document.createElement("div");
                optgroupEl.classList.add(this.classes.optgroup);
                const optgroupLabel = document.createElement("div");
                optgroupLabel.classList.add(this.classes.optgroupLabel);
                optgroupEl.appendChild(optgroupLabel);
                const optgroupLabelText = document.createElement("div");
                optgroupLabelText.classList.add(this.classes.optgroupLabelText);
                optgroupLabelText.textContent = d2.label;
                optgroupLabel.appendChild(optgroupLabelText);
                const optgroupActions = document.createElement("div");
                optgroupActions.classList.add(this.classes.optgroupActions);
                optgroupLabel.appendChild(optgroupActions);
                if (this.settings.isMultiple && d2.selectAll) {
                  const selectAll = document.createElement("div");
                  selectAll.classList.add(this.classes.optgroupSelectAll);
                  let allSelected = true;
                  for (const o2 of d2.options) {
                    if (!o2.selected) {
                      allSelected = false;
                      break;
                    }
                  }
                  if (allSelected) {
                    selectAll.classList.add(this.classes.selected);
                  }
                  const selectAllText = document.createElement("span");
                  selectAllText.textContent = "Select All";
                  selectAll.appendChild(selectAllText);
                  const selectAllSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                  selectAllSvg.setAttribute("viewBox", "0 0 100 100");
                  selectAll.appendChild(selectAllSvg);
                  const selectAllBox = document.createElementNS("http://www.w3.org/2000/svg", "path");
                  selectAllBox.setAttribute("d", this.classes.optgroupSelectAllBox);
                  selectAllSvg.appendChild(selectAllBox);
                  const selectAllCheck = document.createElementNS("http://www.w3.org/2000/svg", "path");
                  selectAllCheck.setAttribute("d", this.classes.optgroupSelectAllCheck);
                  selectAllSvg.appendChild(selectAllCheck);
                  selectAll.addEventListener("click", (e2) => {
                    e2.preventDefault();
                    e2.stopPropagation();
                    const currentSelected = this.store.getSelected();
                    if (allSelected) {
                      const newSelected = currentSelected.filter((s2) => {
                        for (const o2 of d2.options) {
                          if (s2 === o2.value) {
                            return false;
                          }
                        }
                        return true;
                      });
                      this.callbacks.setSelected(newSelected, true);
                      return;
                    } else {
                      const newSelected = currentSelected.concat(d2.options.map((o2) => o2.value));
                      this.callbacks.setSelected(newSelected, true);
                    }
                  });
                  optgroupActions.appendChild(selectAll);
                }
                if (d2.closable !== "off") {
                  const optgroupClosable = document.createElement("div");
                  optgroupClosable.classList.add(this.classes.optgroupClosable);
                  const optgroupClosableSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                  optgroupClosableSvg.setAttribute("viewBox", "0 0 100 100");
                  optgroupClosableSvg.classList.add(this.classes.arrow);
                  optgroupClosable.appendChild(optgroupClosableSvg);
                  const optgroupClosableArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
                  optgroupClosableSvg.appendChild(optgroupClosableArrow);
                  if (d2.options.some((o2) => o2.selected) || this.content.search.input.value.trim() !== "") {
                    optgroupClosable.classList.add(this.classes.open);
                    optgroupClosableArrow.setAttribute("d", this.classes.arrowOpen);
                  } else if (d2.closable === "open") {
                    optgroupEl.classList.add(this.classes.open);
                    optgroupClosableArrow.setAttribute("d", this.classes.arrowOpen);
                  } else if (d2.closable === "close") {
                    optgroupEl.classList.add(this.classes.close);
                    optgroupClosableArrow.setAttribute("d", this.classes.arrowClose);
                  }
                  optgroupLabel.addEventListener("click", (e2) => {
                    e2.preventDefault();
                    e2.stopPropagation();
                    if (optgroupEl.classList.contains(this.classes.close)) {
                      optgroupEl.classList.remove(this.classes.close);
                      optgroupEl.classList.add(this.classes.open);
                      optgroupClosableArrow.setAttribute("d", this.classes.arrowOpen);
                    } else {
                      optgroupEl.classList.remove(this.classes.open);
                      optgroupEl.classList.add(this.classes.close);
                      optgroupClosableArrow.setAttribute("d", this.classes.arrowClose);
                    }
                  });
                  optgroupActions.appendChild(optgroupClosable);
                }
                optgroupEl.appendChild(optgroupLabel);
                for (const o2 of d2.options) {
                  optgroupEl.appendChild(this.option(o2));
                }
                this.content.list.appendChild(optgroupEl);
              }
              if (d2 instanceof Option) {
                this.content.list.appendChild(this.option(d2));
              }
            }
          }
          option(option) {
            if (option.placeholder) {
              const placeholder = document.createElement("div");
              placeholder.classList.add(this.classes.option);
              placeholder.classList.add(this.classes.hide);
              return placeholder;
            }
            const optionEl = document.createElement("div");
            optionEl.dataset.id = option.id;
            optionEl.classList.add(this.classes.option);
            optionEl.setAttribute("role", "option");
            if (option.class) {
              option.class.split(" ").forEach((dataClass) => {
                optionEl.classList.add(dataClass);
              });
            }
            if (option.style) {
              optionEl.style.cssText = option.style;
            }
            if (this.settings.searchHighlight && this.content.search.input.value.trim() !== "") {
              optionEl.innerHTML = this.highlightText(option.html !== "" ? option.html : option.text, this.content.search.input.value, this.classes.searchHighlighter);
            } else if (option.html !== "") {
              optionEl.innerHTML = option.html;
            } else {
              optionEl.textContent = option.text;
            }
            if (this.settings.showOptionTooltips && optionEl.textContent) {
              optionEl.setAttribute("title", optionEl.textContent);
            }
            if (!option.display) {
              optionEl.classList.add(this.classes.hide);
            }
            if (option.disabled) {
              optionEl.classList.add(this.classes.disabled);
            }
            if (option.selected && this.settings.hideSelected) {
              optionEl.classList.add(this.classes.hide);
            }
            if (option.selected) {
              optionEl.classList.add(this.classes.selected);
            } else {
              optionEl.classList.remove(this.classes.selected);
            }
            optionEl.addEventListener("click", (e2) => {
              e2.preventDefault();
              e2.stopPropagation();
              const selectedOptions = this.store.getSelected();
              const element = e2.currentTarget;
              const elementID = String(element.dataset.id);
              if (option.disabled || option.selected && !this.settings.allowDeselect) {
                return;
              }
              if (this.settings.isMultiple && this.settings.maxSelected <= selectedOptions.length && !option.selected || this.settings.isMultiple && this.settings.minSelected >= selectedOptions.length && option.selected) {
                return;
              }
              let shouldUpdate = false;
              const before = this.store.getSelectedOptions();
              let after = [];
              if (this.settings.isMultiple) {
                if (option.selected) {
                  after = before.filter((o2) => o2.id !== elementID);
                } else {
                  after = before.concat(option);
                }
              }
              if (!this.settings.isMultiple) {
                if (option.selected) {
                  after = [];
                } else {
                  after = [option];
                }
              }
              if (!this.callbacks.beforeChange) {
                shouldUpdate = true;
              }
              if (this.callbacks.beforeChange) {
                if (this.callbacks.beforeChange(after, before) === false) {
                  shouldUpdate = false;
                } else {
                  shouldUpdate = true;
                }
              }
              if (shouldUpdate) {
                if (!this.store.getOptionByID(elementID)) {
                  this.callbacks.addOption(option);
                }
                this.callbacks.setSelected(after.map((o2) => o2.value), false);
                if (this.settings.closeOnSelect) {
                  this.callbacks.close();
                }
                if (this.callbacks.afterChange) {
                  this.callbacks.afterChange(after);
                }
              }
            });
            return optionEl;
          }
          destroy() {
            this.main.main.remove();
            this.content.main.remove();
          }
          highlightText(str, search, className) {
            let completedString = str;
            const regex = new RegExp("(" + search.trim() + ")(?![^<]*>[^<>]*</)", "i");
            if (!str.match(regex)) {
              return str;
            }
            const matchStartPosition = str.match(regex).index;
            const matchEndPosition = matchStartPosition + str.match(regex)[0].toString().length;
            const originalTextFoundByRegex = str.substring(matchStartPosition, matchEndPosition);
            completedString = completedString.replace(regex, `<mark class="${className}">${originalTextFoundByRegex}</mark>`);
            return completedString;
          }
          moveContentAbove() {
            const mainHeight = this.main.main.offsetHeight;
            const contentHeight = this.content.main.offsetHeight;
            this.main.main.classList.remove(this.classes.openBelow);
            this.main.main.classList.add(this.classes.openAbove);
            this.content.main.classList.remove(this.classes.openBelow);
            this.content.main.classList.add(this.classes.openAbove);
            const containerRect = this.main.main.getBoundingClientRect();
            this.content.main.style.margin = "-" + (mainHeight + contentHeight - 1) + "px 0px 0px 0px";
            this.content.main.style.top = containerRect.top + containerRect.height + window.scrollY + "px";
            this.content.main.style.left = containerRect.left + window.scrollX + "px";
            this.content.main.style.width = containerRect.width + "px";
          }
          moveContentBelow() {
            this.main.main.classList.remove(this.classes.openAbove);
            this.main.main.classList.add(this.classes.openBelow);
            this.content.main.classList.remove(this.classes.openAbove);
            this.content.main.classList.add(this.classes.openBelow);
            const containerRect = this.main.main.getBoundingClientRect();
            this.content.main.style.margin = "-1px 0px 0px 0px";
            if (this.settings.contentPosition !== "relative") {
              this.content.main.style.top = containerRect.top + containerRect.height + window.scrollY + "px";
              this.content.main.style.left = containerRect.left + window.scrollX + "px";
              this.content.main.style.width = containerRect.width + "px";
            }
          }
          ensureElementInView(container, element) {
            const cTop = container.scrollTop + container.offsetTop;
            const cBottom = cTop + container.clientHeight;
            const eTop = element.offsetTop;
            const eBottom = eTop + element.clientHeight;
            if (eTop < cTop) {
              container.scrollTop -= cTop - eTop;
            } else if (eBottom > cBottom) {
              container.scrollTop += eBottom - cBottom;
            }
          }
          putContent() {
            const mainHeight = this.main.main.offsetHeight;
            const mainRect = this.main.main.getBoundingClientRect();
            const contentHeight = this.content.main.offsetHeight;
            const spaceBelow = window.innerHeight - (mainRect.top + mainHeight);
            if (spaceBelow <= contentHeight) {
              if (mainRect.top > contentHeight) {
                return "up";
              } else {
                return "down";
              }
            }
            return "down";
          }
        }
        class Select {
          constructor(select) {
            this.listen = false;
            this.observer = null;
            this.select = select;
            this.select.addEventListener("change", this.valueChange.bind(this), {
              passive: true
            });
            this.observer = new MutationObserver(this.observeCall.bind(this));
            this.changeListen(true);
          }
          enable() {
            this.select.disabled = false;
          }
          disable() {
            this.select.disabled = true;
          }
          hideUI() {
            this.select.tabIndex = -1;
            this.select.style.display = "none";
            this.select.setAttribute("aria-hidden", "true");
          }
          showUI() {
            this.select.removeAttribute("tabindex");
            this.select.style.display = "";
            this.select.removeAttribute("aria-hidden");
          }
          changeListen(listen) {
            this.listen = listen;
            if (listen) {
              if (this.observer) {
                this.observer.observe(this.select, {
                  subtree: true,
                  childList: true,
                  attributes: true
                });
              }
            }
            if (!listen) {
              if (this.observer) {
                this.observer.disconnect();
              }
            }
          }
          valueChange(ev) {
            if (this.listen && this.onValueChange) {
              this.onValueChange(this.getSelectedValues());
            }
            return true;
          }
          observeCall(mutations) {
            if (!this.listen) {
              return;
            }
            let classChanged = false;
            let disabledChanged = false;
            let optgroupOptionChanged = false;
            for (const m2 of mutations) {
              if (m2.target === this.select) {
                if (m2.attributeName === "disabled") {
                  disabledChanged = true;
                }
                if (m2.attributeName === "class") {
                  classChanged = true;
                }
              }
              if (m2.target.nodeName === "OPTGROUP" || m2.target.nodeName === "OPTION") {
                optgroupOptionChanged = true;
              }
            }
            if (classChanged && this.onClassChange) {
              this.onClassChange(this.select.className.split(" "));
            }
            if (disabledChanged && this.onDisabledChange) {
              this.changeListen(false);
              this.onDisabledChange(this.select.disabled);
              this.changeListen(true);
            }
            if (optgroupOptionChanged && this.onOptionsChange) {
              this.changeListen(false);
              this.onOptionsChange(this.getData());
              this.changeListen(true);
            }
          }
          getData() {
            let data = [];
            const nodes = this.select.childNodes;
            for (const n2 of nodes) {
              if (n2.nodeName === "OPTGROUP") {
                data.push(this.getDataFromOptgroup(n2));
              }
              if (n2.nodeName === "OPTION") {
                data.push(this.getDataFromOption(n2));
              }
            }
            return data;
          }
          getDataFromOptgroup(optgroup) {
            let data = {
              id: optgroup.id,
              label: optgroup.label,
              selectAll: optgroup.dataset ? optgroup.dataset.selectall === "true" : false,
              closable: optgroup.dataset ? optgroup.dataset.closable : "off",
              options: []
            };
            const options = optgroup.childNodes;
            for (const o2 of options) {
              if (o2.nodeName === "OPTION") {
                data.options.push(this.getDataFromOption(o2));
              }
            }
            return data;
          }
          getDataFromOption(option) {
            return {
              id: option.id,
              value: option.value,
              text: option.text,
              html: option.dataset && option.dataset.html ? option.dataset.html : "",
              selected: option.selected,
              display: option.style.display === "none" ? false : true,
              disabled: option.disabled,
              mandatory: option.dataset ? option.dataset.mandatory === "true" : false,
              placeholder: option.dataset.placeholder === "true",
              class: option.className,
              style: option.style.cssText,
              data: option.dataset
            };
          }
          getSelectedValues() {
            let values = [];
            const options = this.select.childNodes;
            for (const o2 of options) {
              if (o2.nodeName === "OPTGROUP") {
                const optgroupOptions = o2.childNodes;
                for (const oo of optgroupOptions) {
                  if (oo.nodeName === "OPTION") {
                    const option = oo;
                    if (option.selected) {
                      values.push(option.value);
                    }
                  }
                }
              }
              if (o2.nodeName === "OPTION") {
                const option = o2;
                if (option.selected) {
                  values.push(option.value);
                }
              }
            }
            return values;
          }
          setSelected(value) {
            this.changeListen(false);
            const options = this.select.childNodes;
            for (const o2 of options) {
              if (o2.nodeName === "OPTGROUP") {
                const optgroup = o2;
                const optgroupOptions = optgroup.childNodes;
                for (const oo of optgroupOptions) {
                  if (oo.nodeName === "OPTION") {
                    const option = oo;
                    option.selected = value.includes(option.value);
                  }
                }
              }
              if (o2.nodeName === "OPTION") {
                const option = o2;
                option.selected = value.includes(option.value);
              }
            }
            this.changeListen(true);
          }
          updateSelect(id, style, classes) {
            this.changeListen(false);
            if (id) {
              this.select.dataset.id = id;
            }
            if (style) {
              this.select.style.cssText = style;
            }
            if (classes) {
              this.select.className = "";
              classes.forEach((c2) => {
                if (c2.trim() !== "") {
                  this.select.classList.add(c2.trim());
                }
              });
            }
            this.changeListen(true);
          }
          updateOptions(data) {
            this.changeListen(false);
            this.select.innerHTML = "";
            for (const d2 of data) {
              if (d2 instanceof Optgroup) {
                this.select.appendChild(this.createOptgroup(d2));
              }
              if (d2 instanceof Option) {
                this.select.appendChild(this.createOption(d2));
              }
            }
            this.select.dispatchEvent(new Event("change"));
            this.changeListen(true);
          }
          createOptgroup(optgroup) {
            const optgroupEl = document.createElement("optgroup");
            optgroupEl.id = optgroup.id;
            optgroupEl.label = optgroup.label;
            if (optgroup.selectAll) {
              optgroupEl.dataset.selectAll = "true";
            }
            if (optgroup.closable !== "off") {
              optgroupEl.dataset.closable = optgroup.closable;
            }
            if (optgroup.options) {
              for (const o2 of optgroup.options) {
                optgroupEl.appendChild(this.createOption(o2));
              }
            }
            return optgroupEl;
          }
          createOption(info) {
            const optionEl = document.createElement("option");
            optionEl.id = info.id;
            optionEl.value = info.value;
            optionEl.innerHTML = info.text;
            if (info.html !== "") {
              optionEl.setAttribute("data-html", info.html);
            }
            if (info.selected) {
              optionEl.selected = info.selected;
            }
            if (info.disabled) {
              optionEl.disabled = true;
            }
            if (info.display === false) {
              optionEl.style.display = "none";
            }
            if (info.placeholder) {
              optionEl.setAttribute("data-placeholder", "true");
            }
            if (info.mandatory) {
              optionEl.setAttribute("data-mandatory", "true");
            }
            if (info.class) {
              info.class.split(" ").forEach((optionClass) => {
                optionEl.classList.add(optionClass);
              });
            }
            if (info.data && typeof info.data === "object") {
              Object.keys(info.data).forEach((key) => {
                optionEl.setAttribute("data-" + kebabCase(key), info.data[key]);
              });
            }
            return optionEl;
          }
          destroy() {
            this.changeListen(false);
            this.select.removeEventListener("change", this.valueChange.bind(this));
            if (this.observer) {
              this.observer.disconnect();
              this.observer = null;
            }
            delete this.select.dataset.id;
            this.showUI();
          }
        }
        class SlimSelect2 {
          constructor(config) {
            var _a;
            this.events = {
              search: void 0,
              searchFilter: (opt, search) => {
                return opt.text.toLowerCase().indexOf(search.toLowerCase()) !== -1;
              },
              addable: void 0,
              beforeChange: void 0,
              afterChange: void 0,
              beforeOpen: void 0,
              afterOpen: void 0,
              beforeClose: void 0,
              afterClose: void 0
            };
            this.windowResize = debounce(() => {
              if (!this.settings.isOpen) {
                return;
              }
              this.render.moveContent();
            });
            this.windowScroll = debounce(() => {
              if (!this.settings.isOpen) {
                return;
              }
              this.render.moveContent();
            });
            this.documentClick = (e2) => {
              if (!this.settings.isOpen) {
                return;
              }
              if (e2.target && !hasClassInTree(e2.target, this.settings.id)) {
                this.close();
              }
            };
            this.windowVisibilityChange = () => {
              if (document.hidden) {
                this.settings.isWindowFocused = false;
                this.close();
              } else {
                setTimeout(() => {
                  this.settings.isWindowFocused = true;
                }, 20);
              }
            };
            this.selectEl = typeof config.select === "string" ? document.querySelector(config.select) : config.select;
            if (!this.selectEl) {
              if (config.events && config.events.error) {
                config.events.error(new Error("Could not find select element"));
              }
              return;
            }
            if (this.selectEl.tagName !== "SELECT") {
              if (config.events && config.events.error) {
                config.events.error(new Error("Element isnt of type select"));
              }
              return;
            }
            if (this.selectEl.dataset.ssid) {
              this.destroy();
            }
            this.settings = new Settings(config.settings);
            const debounceEvents = ["afterChange", "beforeOpen", "afterOpen", "beforeClose", "afterClose"];
            for (const key in config.events) {
              if (!config.events.hasOwnProperty(key)) {
                continue;
              }
              if (debounceEvents.indexOf(key) !== -1) {
                this.events[key] = debounce(config.events[key], 100);
              } else {
                this.events[key] = config.events[key];
              }
            }
            this.settings.disabled = ((_a = config.settings) === null || _a === void 0 ? void 0 : _a.disabled) ? config.settings.disabled : this.selectEl.disabled;
            this.settings.isMultiple = this.selectEl.multiple;
            this.settings.style = this.selectEl.style.cssText;
            this.settings.class = this.selectEl.className.split(" ");
            this.select = new Select(this.selectEl);
            this.select.updateSelect(this.settings.id, this.settings.style, this.settings.class);
            this.select.hideUI();
            this.select.onValueChange = (values) => {
              this.setSelected(values);
            };
            this.select.onClassChange = (classes) => {
              this.settings.class = classes;
              this.render.updateClassStyles();
            };
            this.select.onDisabledChange = (disabled) => {
              if (disabled) {
                this.disable();
              } else {
                this.enable();
              }
            };
            this.select.onOptionsChange = (data) => {
              this.setData(data);
            };
            this.store = new Store(this.settings.isMultiple ? "multiple" : "single", config.data ? config.data : this.select.getData());
            if (config.data) {
              this.select.updateOptions(this.store.getData());
            }
            const callbacks = {
              open: this.open.bind(this),
              close: this.close.bind(this),
              addable: this.events.addable ? this.events.addable : void 0,
              setSelected: this.setSelected.bind(this),
              addOption: this.addOption.bind(this),
              search: this.search.bind(this),
              beforeChange: this.events.beforeChange,
              afterChange: this.events.afterChange
            };
            this.render = new Render(this.settings, this.store, callbacks);
            this.render.renderValues();
            this.render.renderOptions(this.store.getData());
            if (this.selectEl.parentNode) {
              this.selectEl.parentNode.insertBefore(this.render.main.main, this.selectEl.nextSibling);
            }
            document.addEventListener("click", this.documentClick);
            window.addEventListener("resize", this.windowResize, false);
            if (this.settings.openPosition === "auto") {
              window.addEventListener("scroll", this.windowScroll, false);
            }
            document.addEventListener("visibilitychange", this.windowVisibilityChange);
            if (this.settings.disabled) {
              this.disable();
            }
            if (this.settings.alwaysOpen) {
              this.open();
            }
            this.selectEl.slim = this;
          }
          enable() {
            this.settings.disabled = false;
            this.select.enable();
            this.render.enable();
          }
          disable() {
            this.settings.disabled = true;
            this.select.disable();
            this.render.disable();
          }
          getData() {
            return this.store.getData();
          }
          setData(data) {
            const selected = this.store.getSelected();
            const err = this.store.validateDataArray(data);
            if (err) {
              if (this.events.error) {
                this.events.error(err);
              }
              return;
            }
            this.store.setData(data);
            const dataClean = this.store.getData();
            this.select.updateOptions(dataClean);
            this.render.renderValues();
            this.render.renderOptions(dataClean);
            if (this.events.afterChange && !isEqual(selected, this.store.getSelected())) {
              this.events.afterChange(this.store.getSelectedOptions());
            }
          }
          getSelected() {
            return this.store.getSelected();
          }
          setSelected(value, runAfterChange = true) {
            const selected = this.store.getSelected();
            this.store.setSelectedBy("value", Array.isArray(value) ? value : [value]);
            const data = this.store.getData();
            this.select.updateOptions(data);
            this.render.renderValues();
            if (this.render.content.search.input.value !== "") {
              this.search(this.render.content.search.input.value);
            } else {
              this.render.renderOptions(data);
            }
            if (runAfterChange && this.events.afterChange && !isEqual(selected, this.store.getSelected())) {
              this.events.afterChange(this.store.getSelectedOptions());
            }
          }
          addOption(option) {
            const selected = this.store.getSelected();
            if (!this.store.getDataOptions().some((o2) => {
              var _a;
              return o2.value === ((_a = option.value) !== null && _a !== void 0 ? _a : option.text);
            })) {
              this.store.addOption(option);
            }
            const data = this.store.getData();
            this.select.updateOptions(data);
            this.render.renderValues();
            this.render.renderOptions(data);
            if (this.events.afterChange && !isEqual(selected, this.store.getSelected())) {
              this.events.afterChange(this.store.getSelectedOptions());
            }
          }
          open() {
            if (this.settings.disabled || this.settings.isOpen) {
              return;
            }
            if (this.events.beforeOpen) {
              this.events.beforeOpen();
            }
            this.render.open();
            if (this.settings.showSearch) {
              this.render.searchFocus(false);
            }
            setTimeout(() => {
              if (this.events.afterOpen) {
                this.events.afterOpen();
              }
              this.settings.isOpen = true;
            }, this.settings.timeoutDelay);
            if (this.settings.contentPosition === "absolute") {
              if (this.settings.intervalMove) {
                clearInterval(this.settings.intervalMove);
              }
              this.settings.intervalMove = setInterval(this.render.moveContent.bind(this.render), 500);
            }
          }
          close() {
            if (!this.settings.isOpen || this.settings.alwaysOpen) {
              return;
            }
            if (this.events.beforeClose) {
              this.events.beforeClose();
            }
            this.render.close();
            if (this.render.content.search.input.value !== "") {
              this.search("");
            }
            this.render.mainFocus(false);
            setTimeout(() => {
              if (this.events.afterClose) {
                this.events.afterClose();
              }
              this.settings.isOpen = false;
            }, this.settings.timeoutDelay);
            if (this.settings.intervalMove) {
              clearInterval(this.settings.intervalMove);
            }
          }
          search(value) {
            if (this.render.content.search.input.value !== value) {
              this.render.content.search.input.value = value;
            }
            if (!this.events.search) {
              this.render.renderOptions(value === "" ? this.store.getData() : this.store.search(value, this.events.searchFilter));
              return;
            }
            this.render.renderSearching();
            const searchResp = this.events.search(value, this.store.getSelectedOptions());
            if (searchResp instanceof Promise) {
              searchResp.then((data) => {
                this.render.renderOptions(this.store.partialToFullData(data));
              }).catch((err) => {
                this.render.renderError(typeof err === "string" ? err : err.message);
              });
              return;
            } else if (Array.isArray(searchResp)) {
              this.render.renderOptions(this.store.partialToFullData(searchResp));
            } else {
              this.render.renderError("Search event must return a promise or an array of data");
            }
          }
          destroy() {
            document.removeEventListener("click", this.documentClick);
            window.removeEventListener("resize", this.windowResize, false);
            if (this.settings.openPosition === "auto") {
              window.removeEventListener("scroll", this.windowScroll, false);
            }
            document.removeEventListener("visibilitychange", this.windowVisibilityChange);
            this.store.setData([]);
            this.render.destroy();
            this.select.destroy();
          }
        }
        return SlimSelect2;
      });
    }
  });

  // node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
  (function() {
    if (window.Reflect === void 0 || window.customElements === void 0 || window.customElements.polyfillWrapFlushCallback) {
      return;
    }
    const BuiltInHTMLElement = HTMLElement;
    const wrapperForTheName = {
      HTMLElement: function HTMLElement2() {
        return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
      }
    };
    window.HTMLElement = wrapperForTheName["HTMLElement"];
    HTMLElement.prototype = BuiltInHTMLElement.prototype;
    HTMLElement.prototype.constructor = HTMLElement;
    Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
  })();
  (function(prototype) {
    if (typeof prototype.requestSubmit == "function")
      return;
    prototype.requestSubmit = function(submitter) {
      if (submitter) {
        validateSubmitter(submitter, this);
        submitter.click();
      } else {
        submitter = document.createElement("input");
        submitter.type = "submit";
        submitter.hidden = true;
        this.appendChild(submitter);
        submitter.click();
        this.removeChild(submitter);
      }
    };
    function validateSubmitter(submitter, form) {
      submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
      submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
      submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
    }
    function raise(errorConstructor, message, name) {
      throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
    }
  })(HTMLFormElement.prototype);
  var submittersByForm = /* @__PURE__ */ new WeakMap();
  function findSubmitterFromClickTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const candidate = element ? element.closest("input, button") : null;
    return (candidate === null || candidate === void 0 ? void 0 : candidate.type) == "submit" ? candidate : null;
  }
  function clickCaptured(event) {
    const submitter = findSubmitterFromClickTarget(event.target);
    if (submitter && submitter.form) {
      submittersByForm.set(submitter.form, submitter);
    }
  }
  (function() {
    if ("submitter" in Event.prototype)
      return;
    let prototype;
    if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor)) {
      prototype = window.SubmitEvent.prototype;
    } else if ("SubmitEvent" in window) {
      return;
    } else {
      prototype = window.Event.prototype;
    }
    addEventListener("click", clickCaptured, true);
    Object.defineProperty(prototype, "submitter", {
      get() {
        if (this.type == "submit" && this.target instanceof HTMLFormElement) {
          return submittersByForm.get(this.target);
        }
      }
    });
  })();
  var FrameLoadingStyle;
  (function(FrameLoadingStyle2) {
    FrameLoadingStyle2["eager"] = "eager";
    FrameLoadingStyle2["lazy"] = "lazy";
  })(FrameLoadingStyle || (FrameLoadingStyle = {}));
  var FrameElement = class extends HTMLElement {
    constructor() {
      super();
      this.loaded = Promise.resolve();
      this.delegate = new FrameElement.delegateConstructor(this);
    }
    static get observedAttributes() {
      return ["disabled", "complete", "loading", "src"];
    }
    connectedCallback() {
      this.delegate.connect();
    }
    disconnectedCallback() {
      this.delegate.disconnect();
    }
    reload() {
      return this.delegate.sourceURLReloaded();
    }
    attributeChangedCallback(name) {
      if (name == "loading") {
        this.delegate.loadingStyleChanged();
      } else if (name == "complete") {
        this.delegate.completeChanged();
      } else if (name == "src") {
        this.delegate.sourceURLChanged();
      } else {
        this.delegate.disabledChanged();
      }
    }
    get src() {
      return this.getAttribute("src");
    }
    set src(value) {
      if (value) {
        this.setAttribute("src", value);
      } else {
        this.removeAttribute("src");
      }
    }
    get loading() {
      return frameLoadingStyleFromString(this.getAttribute("loading") || "");
    }
    set loading(value) {
      if (value) {
        this.setAttribute("loading", value);
      } else {
        this.removeAttribute("loading");
      }
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(value) {
      if (value) {
        this.setAttribute("disabled", "");
      } else {
        this.removeAttribute("disabled");
      }
    }
    get autoscroll() {
      return this.hasAttribute("autoscroll");
    }
    set autoscroll(value) {
      if (value) {
        this.setAttribute("autoscroll", "");
      } else {
        this.removeAttribute("autoscroll");
      }
    }
    get complete() {
      return !this.delegate.isLoading;
    }
    get isActive() {
      return this.ownerDocument === document && !this.isPreview;
    }
    get isPreview() {
      var _a, _b;
      return (_b = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.documentElement) === null || _b === void 0 ? void 0 : _b.hasAttribute("data-turbo-preview");
    }
  };
  function frameLoadingStyleFromString(style) {
    switch (style.toLowerCase()) {
      case "lazy":
        return FrameLoadingStyle.lazy;
      default:
        return FrameLoadingStyle.eager;
    }
  }
  function expandURL(locatable) {
    return new URL(locatable.toString(), document.baseURI);
  }
  function getAnchor(url) {
    let anchorMatch;
    if (url.hash) {
      return url.hash.slice(1);
    } else if (anchorMatch = url.href.match(/#(.*)$/)) {
      return anchorMatch[1];
    }
  }
  function getAction(form, submitter) {
    const action = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formaction")) || form.getAttribute("action") || form.action;
    return expandURL(action);
  }
  function getExtension(url) {
    return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
  }
  function isHTML(url) {
    return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml|php))$/);
  }
  function isPrefixedBy(baseURL, url) {
    const prefix = getPrefix(url);
    return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
  }
  function locationIsVisitable(location2, rootLocation) {
    return isPrefixedBy(location2, rootLocation) && isHTML(location2);
  }
  function getRequestURL(url) {
    const anchor = getAnchor(url);
    return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
  }
  function toCacheKey(url) {
    return getRequestURL(url);
  }
  function urlsAreEqual(left, right) {
    return expandURL(left).href == expandURL(right).href;
  }
  function getPathComponents(url) {
    return url.pathname.split("/").slice(1);
  }
  function getLastPathComponent(url) {
    return getPathComponents(url).slice(-1)[0];
  }
  function getPrefix(url) {
    return addTrailingSlash(url.origin + url.pathname);
  }
  function addTrailingSlash(value) {
    return value.endsWith("/") ? value : value + "/";
  }
  var FetchResponse = class {
    constructor(response) {
      this.response = response;
    }
    get succeeded() {
      return this.response.ok;
    }
    get failed() {
      return !this.succeeded;
    }
    get clientError() {
      return this.statusCode >= 400 && this.statusCode <= 499;
    }
    get serverError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
    get redirected() {
      return this.response.redirected;
    }
    get location() {
      return expandURL(this.response.url);
    }
    get isHTML() {
      return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
    }
    get statusCode() {
      return this.response.status;
    }
    get contentType() {
      return this.header("Content-Type");
    }
    get responseText() {
      return this.response.clone().text();
    }
    get responseHTML() {
      if (this.isHTML) {
        return this.response.clone().text();
      } else {
        return Promise.resolve(void 0);
      }
    }
    header(name) {
      return this.response.headers.get(name);
    }
  };
  function activateScriptElement(element) {
    if (element.getAttribute("data-turbo-eval") == "false") {
      return element;
    } else {
      const createdScriptElement = document.createElement("script");
      const cspNonce = getMetaContent("csp-nonce");
      if (cspNonce) {
        createdScriptElement.nonce = cspNonce;
      }
      createdScriptElement.textContent = element.textContent;
      createdScriptElement.async = false;
      copyElementAttributes(createdScriptElement, element);
      return createdScriptElement;
    }
  }
  function copyElementAttributes(destinationElement, sourceElement) {
    for (const { name, value } of sourceElement.attributes) {
      destinationElement.setAttribute(name, value);
    }
  }
  function createDocumentFragment(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content;
  }
  function dispatch(eventName, { target, cancelable, detail } = {}) {
    const event = new CustomEvent(eventName, {
      cancelable,
      bubbles: true,
      composed: true,
      detail
    });
    if (target && target.isConnected) {
      target.dispatchEvent(event);
    } else {
      document.documentElement.dispatchEvent(event);
    }
    return event;
  }
  function nextAnimationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  function nextEventLoopTick() {
    return new Promise((resolve) => setTimeout(() => resolve(), 0));
  }
  function nextMicrotask() {
    return Promise.resolve();
  }
  function parseHTMLDocument(html = "") {
    return new DOMParser().parseFromString(html, "text/html");
  }
  function unindent(strings, ...values) {
    const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
    const match = lines[0].match(/^\s+/);
    const indent = match ? match[0].length : 0;
    return lines.map((line) => line.slice(indent)).join("\n");
  }
  function interpolate(strings, values) {
    return strings.reduce((result, string, i2) => {
      const value = values[i2] == void 0 ? "" : values[i2];
      return result + string + value;
    }, "");
  }
  function uuid() {
    return Array.from({ length: 36 }).map((_2, i2) => {
      if (i2 == 8 || i2 == 13 || i2 == 18 || i2 == 23) {
        return "-";
      } else if (i2 == 14) {
        return "4";
      } else if (i2 == 19) {
        return (Math.floor(Math.random() * 4) + 8).toString(16);
      } else {
        return Math.floor(Math.random() * 15).toString(16);
      }
    }).join("");
  }
  function getAttribute(attributeName, ...elements) {
    for (const value of elements.map((element) => element === null || element === void 0 ? void 0 : element.getAttribute(attributeName))) {
      if (typeof value == "string")
        return value;
    }
    return null;
  }
  function hasAttribute(attributeName, ...elements) {
    return elements.some((element) => element && element.hasAttribute(attributeName));
  }
  function markAsBusy(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.setAttribute("busy", "");
      }
      element.setAttribute("aria-busy", "true");
    }
  }
  function clearBusyState(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.removeAttribute("busy");
      }
      element.removeAttribute("aria-busy");
    }
  }
  function waitForLoad(element, timeoutInMilliseconds = 2e3) {
    return new Promise((resolve) => {
      const onComplete = () => {
        element.removeEventListener("error", onComplete);
        element.removeEventListener("load", onComplete);
        resolve();
      };
      element.addEventListener("load", onComplete, { once: true });
      element.addEventListener("error", onComplete, { once: true });
      setTimeout(resolve, timeoutInMilliseconds);
    });
  }
  function getHistoryMethodForAction(action) {
    switch (action) {
      case "replace":
        return history.replaceState;
      case "advance":
      case "restore":
        return history.pushState;
    }
  }
  function isAction(action) {
    return action == "advance" || action == "replace" || action == "restore";
  }
  function getVisitAction(...elements) {
    const action = getAttribute("data-turbo-action", ...elements);
    return isAction(action) ? action : null;
  }
  function getMetaElement(name) {
    return document.querySelector(`meta[name="${name}"]`);
  }
  function getMetaContent(name) {
    const element = getMetaElement(name);
    return element && element.content;
  }
  function setMetaContent(name, content) {
    let element = getMetaElement(name);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute("name", name);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
    return element;
  }
  function findClosestRecursively(element, selector) {
    var _a;
    if (element instanceof Element) {
      return element.closest(selector) || findClosestRecursively(element.assignedSlot || ((_a = element.getRootNode()) === null || _a === void 0 ? void 0 : _a.host), selector);
    }
  }
  var FetchMethod;
  (function(FetchMethod2) {
    FetchMethod2[FetchMethod2["get"] = 0] = "get";
    FetchMethod2[FetchMethod2["post"] = 1] = "post";
    FetchMethod2[FetchMethod2["put"] = 2] = "put";
    FetchMethod2[FetchMethod2["patch"] = 3] = "patch";
    FetchMethod2[FetchMethod2["delete"] = 4] = "delete";
  })(FetchMethod || (FetchMethod = {}));
  function fetchMethodFromString(method) {
    switch (method.toLowerCase()) {
      case "get":
        return FetchMethod.get;
      case "post":
        return FetchMethod.post;
      case "put":
        return FetchMethod.put;
      case "patch":
        return FetchMethod.patch;
      case "delete":
        return FetchMethod.delete;
    }
  }
  var FetchRequest = class {
    constructor(delegate, method, location2, body = new URLSearchParams(), target = null) {
      this.abortController = new AbortController();
      this.resolveRequestPromise = (_value) => {
      };
      this.delegate = delegate;
      this.method = method;
      this.headers = this.defaultHeaders;
      this.body = body;
      this.url = location2;
      this.target = target;
    }
    get location() {
      return this.url;
    }
    get params() {
      return this.url.searchParams;
    }
    get entries() {
      return this.body ? Array.from(this.body.entries()) : [];
    }
    cancel() {
      this.abortController.abort();
    }
    async perform() {
      const { fetchOptions } = this;
      this.delegate.prepareRequest(this);
      await this.allowRequestToBeIntercepted(fetchOptions);
      try {
        this.delegate.requestStarted(this);
        const response = await fetch(this.url.href, fetchOptions);
        return await this.receive(response);
      } catch (error2) {
        if (error2.name !== "AbortError") {
          if (this.willDelegateErrorHandling(error2)) {
            this.delegate.requestErrored(this, error2);
          }
          throw error2;
        }
      } finally {
        this.delegate.requestFinished(this);
      }
    }
    async receive(response) {
      const fetchResponse = new FetchResponse(response);
      const event = dispatch("turbo:before-fetch-response", {
        cancelable: true,
        detail: { fetchResponse },
        target: this.target
      });
      if (event.defaultPrevented) {
        this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
      } else if (fetchResponse.succeeded) {
        this.delegate.requestSucceededWithResponse(this, fetchResponse);
      } else {
        this.delegate.requestFailedWithResponse(this, fetchResponse);
      }
      return fetchResponse;
    }
    get fetchOptions() {
      var _a;
      return {
        method: FetchMethod[this.method].toUpperCase(),
        credentials: "same-origin",
        headers: this.headers,
        redirect: "follow",
        body: this.isIdempotent ? null : this.body,
        signal: this.abortSignal,
        referrer: (_a = this.delegate.referrer) === null || _a === void 0 ? void 0 : _a.href
      };
    }
    get defaultHeaders() {
      return {
        Accept: "text/html, application/xhtml+xml"
      };
    }
    get isIdempotent() {
      return this.method == FetchMethod.get;
    }
    get abortSignal() {
      return this.abortController.signal;
    }
    acceptResponseType(mimeType) {
      this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
    }
    async allowRequestToBeIntercepted(fetchOptions) {
      const requestInterception = new Promise((resolve) => this.resolveRequestPromise = resolve);
      const event = dispatch("turbo:before-fetch-request", {
        cancelable: true,
        detail: {
          fetchOptions,
          url: this.url,
          resume: this.resolveRequestPromise
        },
        target: this.target
      });
      if (event.defaultPrevented)
        await requestInterception;
    }
    willDelegateErrorHandling(error2) {
      const event = dispatch("turbo:fetch-request-error", {
        target: this.target,
        cancelable: true,
        detail: { request: this, error: error2 }
      });
      return !event.defaultPrevented;
    }
  };
  var AppearanceObserver = class {
    constructor(delegate, element) {
      this.started = false;
      this.intersect = (entries) => {
        const lastEntry = entries.slice(-1)[0];
        if (lastEntry === null || lastEntry === void 0 ? void 0 : lastEntry.isIntersecting) {
          this.delegate.elementAppearedInViewport(this.element);
        }
      };
      this.delegate = delegate;
      this.element = element;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
      }
    }
  };
  var StreamMessage = class {
    constructor(fragment) {
      this.fragment = importStreamElements(fragment);
    }
    static wrap(message) {
      if (typeof message == "string") {
        return new this(createDocumentFragment(message));
      } else {
        return message;
      }
    }
  };
  StreamMessage.contentType = "text/vnd.turbo-stream.html";
  function importStreamElements(fragment) {
    for (const element of fragment.querySelectorAll("turbo-stream")) {
      const streamElement = document.importNode(element, true);
      for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
        inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
      }
      element.replaceWith(streamElement);
    }
    return fragment;
  }
  var FormSubmissionState;
  (function(FormSubmissionState2) {
    FormSubmissionState2[FormSubmissionState2["initialized"] = 0] = "initialized";
    FormSubmissionState2[FormSubmissionState2["requesting"] = 1] = "requesting";
    FormSubmissionState2[FormSubmissionState2["waiting"] = 2] = "waiting";
    FormSubmissionState2[FormSubmissionState2["receiving"] = 3] = "receiving";
    FormSubmissionState2[FormSubmissionState2["stopping"] = 4] = "stopping";
    FormSubmissionState2[FormSubmissionState2["stopped"] = 5] = "stopped";
  })(FormSubmissionState || (FormSubmissionState = {}));
  var FormEnctype;
  (function(FormEnctype2) {
    FormEnctype2["urlEncoded"] = "application/x-www-form-urlencoded";
    FormEnctype2["multipart"] = "multipart/form-data";
    FormEnctype2["plain"] = "text/plain";
  })(FormEnctype || (FormEnctype = {}));
  function formEnctypeFromString(encoding) {
    switch (encoding.toLowerCase()) {
      case FormEnctype.multipart:
        return FormEnctype.multipart;
      case FormEnctype.plain:
        return FormEnctype.plain;
      default:
        return FormEnctype.urlEncoded;
    }
  }
  var FormSubmission = class {
    constructor(delegate, formElement, submitter, mustRedirect = false) {
      this.state = FormSubmissionState.initialized;
      this.delegate = delegate;
      this.formElement = formElement;
      this.submitter = submitter;
      this.formData = buildFormData(formElement, submitter);
      this.location = expandURL(this.action);
      if (this.method == FetchMethod.get) {
        mergeFormDataEntries(this.location, [...this.body.entries()]);
      }
      this.fetchRequest = new FetchRequest(this, this.method, this.location, this.body, this.formElement);
      this.mustRedirect = mustRedirect;
    }
    static confirmMethod(message, _element, _submitter) {
      return Promise.resolve(confirm(message));
    }
    get method() {
      var _a;
      const method = ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formmethod")) || this.formElement.getAttribute("method") || "";
      return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
    }
    get action() {
      var _a;
      const formElementAction = typeof this.formElement.action === "string" ? this.formElement.action : null;
      if ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.hasAttribute("formaction")) {
        return this.submitter.getAttribute("formaction") || "";
      } else {
        return this.formElement.getAttribute("action") || formElementAction || "";
      }
    }
    get body() {
      if (this.enctype == FormEnctype.urlEncoded || this.method == FetchMethod.get) {
        return new URLSearchParams(this.stringFormData);
      } else {
        return this.formData;
      }
    }
    get enctype() {
      var _a;
      return formEnctypeFromString(((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formenctype")) || this.formElement.enctype);
    }
    get isIdempotent() {
      return this.fetchRequest.isIdempotent;
    }
    get stringFormData() {
      return [...this.formData].reduce((entries, [name, value]) => {
        return entries.concat(typeof value == "string" ? [[name, value]] : []);
      }, []);
    }
    async start() {
      const { initialized, requesting } = FormSubmissionState;
      const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
      if (typeof confirmationMessage === "string") {
        const answer = await FormSubmission.confirmMethod(confirmationMessage, this.formElement, this.submitter);
        if (!answer) {
          return;
        }
      }
      if (this.state == initialized) {
        this.state = requesting;
        return this.fetchRequest.perform();
      }
    }
    stop() {
      const { stopping, stopped } = FormSubmissionState;
      if (this.state != stopping && this.state != stopped) {
        this.state = stopping;
        this.fetchRequest.cancel();
        return true;
      }
    }
    prepareRequest(request) {
      if (!request.isIdempotent) {
        const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
        if (token) {
          request.headers["X-CSRF-Token"] = token;
        }
      }
      if (this.requestAcceptsTurboStreamResponse(request)) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      var _a;
      this.state = FormSubmissionState.waiting;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.setAttribute("disabled", "");
      dispatch("turbo:submit-start", {
        target: this.formElement,
        detail: { formSubmission: this }
      });
      this.delegate.formSubmissionStarted(this);
    }
    requestPreventedHandlingResponse(request, response) {
      this.result = { success: response.succeeded, fetchResponse: response };
    }
    requestSucceededWithResponse(request, response) {
      if (response.clientError || response.serverError) {
        this.delegate.formSubmissionFailedWithResponse(this, response);
      } else if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
        const error2 = new Error("Form responses must redirect to another location");
        this.delegate.formSubmissionErrored(this, error2);
      } else {
        this.state = FormSubmissionState.receiving;
        this.result = { success: true, fetchResponse: response };
        this.delegate.formSubmissionSucceededWithResponse(this, response);
      }
    }
    requestFailedWithResponse(request, response) {
      this.result = { success: false, fetchResponse: response };
      this.delegate.formSubmissionFailedWithResponse(this, response);
    }
    requestErrored(request, error2) {
      this.result = { success: false, error: error2 };
      this.delegate.formSubmissionErrored(this, error2);
    }
    requestFinished(_request) {
      var _a;
      this.state = FormSubmissionState.stopped;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.removeAttribute("disabled");
      dispatch("turbo:submit-end", {
        target: this.formElement,
        detail: Object.assign({ formSubmission: this }, this.result)
      });
      this.delegate.formSubmissionFinished(this);
    }
    requestMustRedirect(request) {
      return !request.isIdempotent && this.mustRedirect;
    }
    requestAcceptsTurboStreamResponse(request) {
      return !request.isIdempotent || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
    }
  };
  function buildFormData(formElement, submitter) {
    const formData = new FormData(formElement);
    const name = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("name");
    const value = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("value");
    if (name) {
      formData.append(name, value || "");
    }
    return formData;
  }
  function getCookieValue(cookieName) {
    if (cookieName != null) {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
      if (cookie) {
        const value = cookie.split("=").slice(1).join("=");
        return value ? decodeURIComponent(value) : void 0;
      }
    }
  }
  function responseSucceededWithoutRedirect(response) {
    return response.statusCode == 200 && !response.redirected;
  }
  function mergeFormDataEntries(url, entries) {
    const searchParams = new URLSearchParams();
    for (const [name, value] of entries) {
      if (value instanceof File)
        continue;
      searchParams.append(name, value);
    }
    url.search = searchParams.toString();
    return url;
  }
  var Snapshot = class {
    constructor(element) {
      this.element = element;
    }
    get activeElement() {
      return this.element.ownerDocument.activeElement;
    }
    get children() {
      return [...this.element.children];
    }
    hasAnchor(anchor) {
      return this.getElementForAnchor(anchor) != null;
    }
    getElementForAnchor(anchor) {
      return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
    }
    get isConnected() {
      return this.element.isConnected;
    }
    get firstAutofocusableElement() {
      const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
      for (const element of this.element.querySelectorAll("[autofocus]")) {
        if (element.closest(inertDisabledOrHidden) == null)
          return element;
        else
          continue;
      }
      return null;
    }
    get permanentElements() {
      return queryPermanentElementsAll(this.element);
    }
    getPermanentElementById(id) {
      return getPermanentElementById(this.element, id);
    }
    getPermanentElementMapForSnapshot(snapshot) {
      const permanentElementMap = {};
      for (const currentPermanentElement of this.permanentElements) {
        const { id } = currentPermanentElement;
        const newPermanentElement = snapshot.getPermanentElementById(id);
        if (newPermanentElement) {
          permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
        }
      }
      return permanentElementMap;
    }
  };
  function getPermanentElementById(node, id) {
    return node.querySelector(`#${id}[data-turbo-permanent]`);
  }
  function queryPermanentElementsAll(node) {
    return node.querySelectorAll("[id][data-turbo-permanent]");
  }
  var FormSubmitObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.submitCaptured = () => {
        this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
        this.eventTarget.addEventListener("submit", this.submitBubbled, false);
      };
      this.submitBubbled = (event) => {
        if (!event.defaultPrevented) {
          const form = event.target instanceof HTMLFormElement ? event.target : void 0;
          const submitter = event.submitter || void 0;
          if (form && submissionDoesNotDismissDialog(form, submitter) && submissionDoesNotTargetIFrame(form, submitter) && this.delegate.willSubmitForm(form, submitter)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.delegate.formSubmitted(form, submitter);
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("submit", this.submitCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
        this.started = false;
      }
    }
  };
  function submissionDoesNotDismissDialog(form, submitter) {
    const method = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) || form.getAttribute("method");
    return method != "dialog";
  }
  function submissionDoesNotTargetIFrame(form, submitter) {
    if ((submitter === null || submitter === void 0 ? void 0 : submitter.hasAttribute("formtarget")) || form.hasAttribute("target")) {
      const target = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formtarget")) || form.target;
      for (const element of document.getElementsByName(target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var View = class {
    constructor(delegate, element) {
      this.resolveRenderPromise = (_value) => {
      };
      this.resolveInterceptionPromise = (_value) => {
      };
      this.delegate = delegate;
      this.element = element;
    }
    scrollToAnchor(anchor) {
      const element = this.snapshot.getElementForAnchor(anchor);
      if (element) {
        this.scrollToElement(element);
        this.focusElement(element);
      } else {
        this.scrollToPosition({ x: 0, y: 0 });
      }
    }
    scrollToAnchorFromLocation(location2) {
      this.scrollToAnchor(getAnchor(location2));
    }
    scrollToElement(element) {
      element.scrollIntoView();
    }
    focusElement(element) {
      if (element instanceof HTMLElement) {
        if (element.hasAttribute("tabindex")) {
          element.focus();
        } else {
          element.setAttribute("tabindex", "-1");
          element.focus();
          element.removeAttribute("tabindex");
        }
      }
    }
    scrollToPosition({ x: x2, y: y2 }) {
      this.scrollRoot.scrollTo(x2, y2);
    }
    scrollToTop() {
      this.scrollToPosition({ x: 0, y: 0 });
    }
    get scrollRoot() {
      return window;
    }
    async render(renderer) {
      const { isPreview, shouldRender, newSnapshot: snapshot } = renderer;
      if (shouldRender) {
        try {
          this.renderPromise = new Promise((resolve) => this.resolveRenderPromise = resolve);
          this.renderer = renderer;
          await this.prepareToRenderSnapshot(renderer);
          const renderInterception = new Promise((resolve) => this.resolveInterceptionPromise = resolve);
          const options = { resume: this.resolveInterceptionPromise, render: this.renderer.renderElement };
          const immediateRender = this.delegate.allowsImmediateRender(snapshot, options);
          if (!immediateRender)
            await renderInterception;
          await this.renderSnapshot(renderer);
          this.delegate.viewRenderedSnapshot(snapshot, isPreview);
          this.delegate.preloadOnLoadLinksForView(this.element);
          this.finishRenderingSnapshot(renderer);
        } finally {
          delete this.renderer;
          this.resolveRenderPromise(void 0);
          delete this.renderPromise;
        }
      } else {
        this.invalidate(renderer.reloadReason);
      }
    }
    invalidate(reason) {
      this.delegate.viewInvalidated(reason);
    }
    async prepareToRenderSnapshot(renderer) {
      this.markAsPreview(renderer.isPreview);
      await renderer.prepareToRender();
    }
    markAsPreview(isPreview) {
      if (isPreview) {
        this.element.setAttribute("data-turbo-preview", "");
      } else {
        this.element.removeAttribute("data-turbo-preview");
      }
    }
    async renderSnapshot(renderer) {
      await renderer.render();
    }
    finishRenderingSnapshot(renderer) {
      renderer.finishRendering();
    }
  };
  var FrameView = class extends View {
    invalidate() {
      this.element.innerHTML = "";
    }
    get snapshot() {
      return new Snapshot(this.element);
    }
  };
  var LinkInterceptor = class {
    constructor(delegate, element) {
      this.clickBubbled = (event) => {
        if (this.respondsToEventTarget(event.target)) {
          this.clickEvent = event;
        } else {
          delete this.clickEvent;
        }
      };
      this.linkClicked = (event) => {
        if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
          if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
            this.clickEvent.preventDefault();
            event.preventDefault();
            this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
          }
        }
        delete this.clickEvent;
      };
      this.willVisit = (_event) => {
        delete this.clickEvent;
      };
      this.delegate = delegate;
      this.element = element;
    }
    start() {
      this.element.addEventListener("click", this.clickBubbled);
      document.addEventListener("turbo:click", this.linkClicked);
      document.addEventListener("turbo:before-visit", this.willVisit);
    }
    stop() {
      this.element.removeEventListener("click", this.clickBubbled);
      document.removeEventListener("turbo:click", this.linkClicked);
      document.removeEventListener("turbo:before-visit", this.willVisit);
    }
    respondsToEventTarget(target) {
      const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
      return element && element.closest("turbo-frame, html") == this.element;
    }
  };
  var LinkClickObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.clickCaptured = () => {
        this.eventTarget.removeEventListener("click", this.clickBubbled, false);
        this.eventTarget.addEventListener("click", this.clickBubbled, false);
      };
      this.clickBubbled = (event) => {
        if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
          const target = event.composedPath && event.composedPath()[0] || event.target;
          const link = this.findLinkFromClickTarget(target);
          if (link && doesNotTargetIFrame(link)) {
            const location2 = this.getLocationForLink(link);
            if (this.delegate.willFollowLinkToLocation(link, location2, event)) {
              event.preventDefault();
              this.delegate.followedLinkToLocation(link, location2);
            }
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("click", this.clickCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("click", this.clickCaptured, true);
        this.started = false;
      }
    }
    clickEventIsSignificant(event) {
      return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
    }
    findLinkFromClickTarget(target) {
      return findClosestRecursively(target, "a[href]:not([target^=_]):not([download])");
    }
    getLocationForLink(link) {
      return expandURL(link.getAttribute("href") || "");
    }
  };
  function doesNotTargetIFrame(anchor) {
    if (anchor.hasAttribute("target")) {
      for (const element of document.getElementsByName(anchor.target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var FormLinkClickObserver = class {
    constructor(delegate, element) {
      this.delegate = delegate;
      this.linkInterceptor = new LinkClickObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
    }
    stop() {
      this.linkInterceptor.stop();
    }
    willFollowLinkToLocation(link, location2, originalEvent) {
      return this.delegate.willSubmitFormLinkToLocation(link, location2, originalEvent) && link.hasAttribute("data-turbo-method");
    }
    followedLinkToLocation(link, location2) {
      const form = document.createElement("form");
      const type = "hidden";
      for (const [name, value] of location2.searchParams) {
        form.append(Object.assign(document.createElement("input"), { type, name, value }));
      }
      const action = Object.assign(location2, { search: "" });
      form.setAttribute("data-turbo", "true");
      form.setAttribute("action", action.href);
      form.setAttribute("hidden", "");
      const method = link.getAttribute("data-turbo-method");
      if (method)
        form.setAttribute("method", method);
      const turboFrame = link.getAttribute("data-turbo-frame");
      if (turboFrame)
        form.setAttribute("data-turbo-frame", turboFrame);
      const turboAction = getVisitAction(link);
      if (turboAction)
        form.setAttribute("data-turbo-action", turboAction);
      const turboConfirm = link.getAttribute("data-turbo-confirm");
      if (turboConfirm)
        form.setAttribute("data-turbo-confirm", turboConfirm);
      const turboStream = link.hasAttribute("data-turbo-stream");
      if (turboStream)
        form.setAttribute("data-turbo-stream", "");
      this.delegate.submittedFormLinkToLocation(link, location2, form);
      document.body.appendChild(form);
      form.addEventListener("turbo:submit-end", () => form.remove(), { once: true });
      requestAnimationFrame(() => form.requestSubmit());
    }
  };
  var Bardo = class {
    constructor(delegate, permanentElementMap) {
      this.delegate = delegate;
      this.permanentElementMap = permanentElementMap;
    }
    static async preservingPermanentElements(delegate, permanentElementMap, callback) {
      const bardo = new this(delegate, permanentElementMap);
      bardo.enter();
      await callback();
      bardo.leave();
    }
    enter() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id];
        this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
        this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
      }
    }
    leave() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement] = this.permanentElementMap[id];
        this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
        this.replacePlaceholderWithPermanentElement(currentPermanentElement);
        this.delegate.leavingBardo(currentPermanentElement);
      }
    }
    replaceNewPermanentElementWithPlaceholder(permanentElement) {
      const placeholder = createPlaceholderForPermanentElement(permanentElement);
      permanentElement.replaceWith(placeholder);
    }
    replaceCurrentPermanentElementWithClone(permanentElement) {
      const clone = permanentElement.cloneNode(true);
      permanentElement.replaceWith(clone);
    }
    replacePlaceholderWithPermanentElement(permanentElement) {
      const placeholder = this.getPlaceholderById(permanentElement.id);
      placeholder === null || placeholder === void 0 ? void 0 : placeholder.replaceWith(permanentElement);
    }
    getPlaceholderById(id) {
      return this.placeholders.find((element) => element.content == id);
    }
    get placeholders() {
      return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
    }
  };
  function createPlaceholderForPermanentElement(permanentElement) {
    const element = document.createElement("meta");
    element.setAttribute("name", "turbo-permanent-placeholder");
    element.setAttribute("content", permanentElement.id);
    return element;
  }
  var Renderer = class {
    constructor(currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      this.activeElement = null;
      this.currentSnapshot = currentSnapshot;
      this.newSnapshot = newSnapshot;
      this.isPreview = isPreview;
      this.willRender = willRender;
      this.renderElement = renderElement;
      this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
    }
    get shouldRender() {
      return true;
    }
    get reloadReason() {
      return;
    }
    prepareToRender() {
      return;
    }
    finishRendering() {
      if (this.resolvingFunctions) {
        this.resolvingFunctions.resolve();
        delete this.resolvingFunctions;
      }
    }
    async preservingPermanentElements(callback) {
      await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
    }
    focusFirstAutofocusableElement() {
      const element = this.connectedSnapshot.firstAutofocusableElement;
      if (elementIsFocusable(element)) {
        element.focus();
      }
    }
    enteringBardo(currentPermanentElement) {
      if (this.activeElement)
        return;
      if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
        this.activeElement = this.currentSnapshot.activeElement;
      }
    }
    leavingBardo(currentPermanentElement) {
      if (currentPermanentElement.contains(this.activeElement) && this.activeElement instanceof HTMLElement) {
        this.activeElement.focus();
        this.activeElement = null;
      }
    }
    get connectedSnapshot() {
      return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
    }
    get currentElement() {
      return this.currentSnapshot.element;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    get permanentElementMap() {
      return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
    }
  };
  function elementIsFocusable(element) {
    return element && typeof element.focus == "function";
  }
  var FrameRenderer = class extends Renderer {
    constructor(delegate, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
      this.delegate = delegate;
    }
    static renderElement(currentElement, newElement) {
      var _a;
      const destinationRange = document.createRange();
      destinationRange.selectNodeContents(currentElement);
      destinationRange.deleteContents();
      const frameElement = newElement;
      const sourceRange = (_a = frameElement.ownerDocument) === null || _a === void 0 ? void 0 : _a.createRange();
      if (sourceRange) {
        sourceRange.selectNodeContents(frameElement);
        currentElement.appendChild(sourceRange.extractContents());
      }
    }
    get shouldRender() {
      return true;
    }
    async render() {
      await nextAnimationFrame();
      this.preservingPermanentElements(() => {
        this.loadFrameElement();
      });
      this.scrollFrameIntoView();
      await nextAnimationFrame();
      this.focusFirstAutofocusableElement();
      await nextAnimationFrame();
      this.activateScriptElements();
    }
    loadFrameElement() {
      this.delegate.willRenderFrame(this.currentElement, this.newElement);
      this.renderElement(this.currentElement, this.newElement);
    }
    scrollFrameIntoView() {
      if (this.currentElement.autoscroll || this.newElement.autoscroll) {
        const element = this.currentElement.firstElementChild;
        const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
        const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
        if (element) {
          element.scrollIntoView({ block, behavior });
          return true;
        }
      }
      return false;
    }
    activateScriptElements() {
      for (const inertScriptElement of this.newScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    get newScriptElements() {
      return this.currentElement.querySelectorAll("script");
    }
  };
  function readScrollLogicalPosition(value, defaultValue) {
    if (value == "end" || value == "start" || value == "center" || value == "nearest") {
      return value;
    } else {
      return defaultValue;
    }
  }
  function readScrollBehavior(value, defaultValue) {
    if (value == "auto" || value == "smooth") {
      return value;
    } else {
      return defaultValue;
    }
  }
  var ProgressBar = class {
    constructor() {
      this.hiding = false;
      this.value = 0;
      this.visible = false;
      this.trickle = () => {
        this.setValue(this.value + Math.random() / 100);
      };
      this.stylesheetElement = this.createStylesheetElement();
      this.progressElement = this.createProgressElement();
      this.installStylesheetElement();
      this.setValue(0);
    }
    static get defaultCSS() {
      return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${ProgressBar.animationDuration}ms ease-out,
          opacity ${ProgressBar.animationDuration / 2}ms ${ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
    }
    show() {
      if (!this.visible) {
        this.visible = true;
        this.installProgressElement();
        this.startTrickling();
      }
    }
    hide() {
      if (this.visible && !this.hiding) {
        this.hiding = true;
        this.fadeProgressElement(() => {
          this.uninstallProgressElement();
          this.stopTrickling();
          this.visible = false;
          this.hiding = false;
        });
      }
    }
    setValue(value) {
      this.value = value;
      this.refresh();
    }
    installStylesheetElement() {
      document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
    }
    installProgressElement() {
      this.progressElement.style.width = "0";
      this.progressElement.style.opacity = "1";
      document.documentElement.insertBefore(this.progressElement, document.body);
      this.refresh();
    }
    fadeProgressElement(callback) {
      this.progressElement.style.opacity = "0";
      setTimeout(callback, ProgressBar.animationDuration * 1.5);
    }
    uninstallProgressElement() {
      if (this.progressElement.parentNode) {
        document.documentElement.removeChild(this.progressElement);
      }
    }
    startTrickling() {
      if (!this.trickleInterval) {
        this.trickleInterval = window.setInterval(this.trickle, ProgressBar.animationDuration);
      }
    }
    stopTrickling() {
      window.clearInterval(this.trickleInterval);
      delete this.trickleInterval;
    }
    refresh() {
      requestAnimationFrame(() => {
        this.progressElement.style.width = `${10 + this.value * 90}%`;
      });
    }
    createStylesheetElement() {
      const element = document.createElement("style");
      element.type = "text/css";
      element.textContent = ProgressBar.defaultCSS;
      if (this.cspNonce) {
        element.nonce = this.cspNonce;
      }
      return element;
    }
    createProgressElement() {
      const element = document.createElement("div");
      element.className = "turbo-progress-bar";
      return element;
    }
    get cspNonce() {
      return getMetaContent("csp-nonce");
    }
  };
  ProgressBar.animationDuration = 300;
  var HeadSnapshot = class extends Snapshot {
    constructor() {
      super(...arguments);
      this.detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
        const { outerHTML } = element;
        const details = outerHTML in result ? result[outerHTML] : {
          type: elementType(element),
          tracked: elementIsTracked(element),
          elements: []
        };
        return Object.assign(Object.assign({}, result), { [outerHTML]: Object.assign(Object.assign({}, details), { elements: [...details.elements, element] }) });
      }, {});
    }
    get trackedElementSignature() {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
    }
    getScriptElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
    }
    getStylesheetElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
    }
    getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
    }
    get provisionalElements() {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
        if (type == null && !tracked) {
          return [...result, ...elements];
        } else if (elements.length > 1) {
          return [...result, ...elements.slice(1)];
        } else {
          return result;
        }
      }, []);
    }
    getMetaValue(name) {
      const element = this.findMetaElementByName(name);
      return element ? element.getAttribute("content") : null;
    }
    findMetaElementByName(name) {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { elements: [element] } = this.detailsByOuterHTML[outerHTML];
        return elementIsMetaElementWithName(element, name) ? element : result;
      }, void 0);
    }
  };
  function elementType(element) {
    if (elementIsScript(element)) {
      return "script";
    } else if (elementIsStylesheet(element)) {
      return "stylesheet";
    }
  }
  function elementIsTracked(element) {
    return element.getAttribute("data-turbo-track") == "reload";
  }
  function elementIsScript(element) {
    const tagName = element.localName;
    return tagName == "script";
  }
  function elementIsNoscript(element) {
    const tagName = element.localName;
    return tagName == "noscript";
  }
  function elementIsStylesheet(element) {
    const tagName = element.localName;
    return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
  }
  function elementIsMetaElementWithName(element, name) {
    const tagName = element.localName;
    return tagName == "meta" && element.getAttribute("name") == name;
  }
  function elementWithoutNonce(element) {
    if (element.hasAttribute("nonce")) {
      element.setAttribute("nonce", "");
    }
    return element;
  }
  var PageSnapshot = class extends Snapshot {
    constructor(element, headSnapshot) {
      super(element);
      this.headSnapshot = headSnapshot;
    }
    static fromHTMLString(html = "") {
      return this.fromDocument(parseHTMLDocument(html));
    }
    static fromElement(element) {
      return this.fromDocument(element.ownerDocument);
    }
    static fromDocument({ head, body }) {
      return new this(body, new HeadSnapshot(head));
    }
    clone() {
      const clonedElement = this.element.cloneNode(true);
      const selectElements = this.element.querySelectorAll("select");
      const clonedSelectElements = clonedElement.querySelectorAll("select");
      for (const [index, source] of selectElements.entries()) {
        const clone = clonedSelectElements[index];
        for (const option of clone.selectedOptions)
          option.selected = false;
        for (const option of source.selectedOptions)
          clone.options[option.index].selected = true;
      }
      for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
        clonedPasswordInput.value = "";
      }
      return new PageSnapshot(clonedElement, this.headSnapshot);
    }
    get headElement() {
      return this.headSnapshot.element;
    }
    get rootLocation() {
      var _a;
      const root = (_a = this.getSetting("root")) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    get cacheControlValue() {
      return this.getSetting("cache-control");
    }
    get isPreviewable() {
      return this.cacheControlValue != "no-preview";
    }
    get isCacheable() {
      return this.cacheControlValue != "no-cache";
    }
    get isVisitable() {
      return this.getSetting("visit-control") != "reload";
    }
    getSetting(name) {
      return this.headSnapshot.getMetaValue(`turbo-${name}`);
    }
  };
  var TimingMetric;
  (function(TimingMetric2) {
    TimingMetric2["visitStart"] = "visitStart";
    TimingMetric2["requestStart"] = "requestStart";
    TimingMetric2["requestEnd"] = "requestEnd";
    TimingMetric2["visitEnd"] = "visitEnd";
  })(TimingMetric || (TimingMetric = {}));
  var VisitState;
  (function(VisitState2) {
    VisitState2["initialized"] = "initialized";
    VisitState2["started"] = "started";
    VisitState2["canceled"] = "canceled";
    VisitState2["failed"] = "failed";
    VisitState2["completed"] = "completed";
  })(VisitState || (VisitState = {}));
  var defaultOptions = {
    action: "advance",
    historyChanged: false,
    visitCachedSnapshot: () => {
    },
    willRender: true,
    updateHistory: true,
    shouldCacheSnapshot: true,
    acceptsStreamResponse: false
  };
  var SystemStatusCode;
  (function(SystemStatusCode2) {
    SystemStatusCode2[SystemStatusCode2["networkFailure"] = 0] = "networkFailure";
    SystemStatusCode2[SystemStatusCode2["timeoutFailure"] = -1] = "timeoutFailure";
    SystemStatusCode2[SystemStatusCode2["contentTypeMismatch"] = -2] = "contentTypeMismatch";
  })(SystemStatusCode || (SystemStatusCode = {}));
  var Visit = class {
    constructor(delegate, location2, restorationIdentifier, options = {}) {
      this.identifier = uuid();
      this.timingMetrics = {};
      this.followedRedirect = false;
      this.historyChanged = false;
      this.scrolled = false;
      this.shouldCacheSnapshot = true;
      this.acceptsStreamResponse = false;
      this.snapshotCached = false;
      this.state = VisitState.initialized;
      this.delegate = delegate;
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier || uuid();
      const { action, historyChanged, referrer, snapshot, snapshotHTML, response, visitCachedSnapshot, willRender, updateHistory, shouldCacheSnapshot, acceptsStreamResponse } = Object.assign(Object.assign({}, defaultOptions), options);
      this.action = action;
      this.historyChanged = historyChanged;
      this.referrer = referrer;
      this.snapshot = snapshot;
      this.snapshotHTML = snapshotHTML;
      this.response = response;
      this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
      this.visitCachedSnapshot = visitCachedSnapshot;
      this.willRender = willRender;
      this.updateHistory = updateHistory;
      this.scrolled = !willRender;
      this.shouldCacheSnapshot = shouldCacheSnapshot;
      this.acceptsStreamResponse = acceptsStreamResponse;
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    get restorationData() {
      return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
    }
    get silent() {
      return this.isSamePage;
    }
    start() {
      if (this.state == VisitState.initialized) {
        this.recordTimingMetric(TimingMetric.visitStart);
        this.state = VisitState.started;
        this.adapter.visitStarted(this);
        this.delegate.visitStarted(this);
      }
    }
    cancel() {
      if (this.state == VisitState.started) {
        if (this.request) {
          this.request.cancel();
        }
        this.cancelRender();
        this.state = VisitState.canceled;
      }
    }
    complete() {
      if (this.state == VisitState.started) {
        this.recordTimingMetric(TimingMetric.visitEnd);
        this.state = VisitState.completed;
        this.followRedirect();
        if (!this.followedRedirect) {
          this.adapter.visitCompleted(this);
          this.delegate.visitCompleted(this);
        }
      }
    }
    fail() {
      if (this.state == VisitState.started) {
        this.state = VisitState.failed;
        this.adapter.visitFailed(this);
      }
    }
    changeHistory() {
      var _a;
      if (!this.historyChanged && this.updateHistory) {
        const actionForHistory = this.location.href === ((_a = this.referrer) === null || _a === void 0 ? void 0 : _a.href) ? "replace" : this.action;
        const method = getHistoryMethodForAction(actionForHistory);
        this.history.update(method, this.location, this.restorationIdentifier);
        this.historyChanged = true;
      }
    }
    issueRequest() {
      if (this.hasPreloadedResponse()) {
        this.simulateRequest();
      } else if (this.shouldIssueRequest() && !this.request) {
        this.request = new FetchRequest(this, FetchMethod.get, this.location);
        this.request.perform();
      }
    }
    simulateRequest() {
      if (this.response) {
        this.startRequest();
        this.recordResponse();
        this.finishRequest();
      }
    }
    startRequest() {
      this.recordTimingMetric(TimingMetric.requestStart);
      this.adapter.visitRequestStarted(this);
    }
    recordResponse(response = this.response) {
      this.response = response;
      if (response) {
        const { statusCode } = response;
        if (isSuccessful(statusCode)) {
          this.adapter.visitRequestCompleted(this);
        } else {
          this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
        }
      }
    }
    finishRequest() {
      this.recordTimingMetric(TimingMetric.requestEnd);
      this.adapter.visitRequestFinished(this);
    }
    loadResponse() {
      if (this.response) {
        const { statusCode, responseHTML } = this.response;
        this.render(async () => {
          if (this.shouldCacheSnapshot)
            this.cacheSnapshot();
          if (this.view.renderPromise)
            await this.view.renderPromise;
          if (isSuccessful(statusCode) && responseHTML != null) {
            await this.view.renderPage(PageSnapshot.fromHTMLString(responseHTML), false, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            this.complete();
          } else {
            await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
            this.adapter.visitRendered(this);
            this.fail();
          }
        });
      }
    }
    getCachedSnapshot() {
      const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
      if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
        if (this.action == "restore" || snapshot.isPreviewable) {
          return snapshot;
        }
      }
    }
    getPreloadedSnapshot() {
      if (this.snapshotHTML) {
        return PageSnapshot.fromHTMLString(this.snapshotHTML);
      }
    }
    hasCachedSnapshot() {
      return this.getCachedSnapshot() != null;
    }
    loadCachedSnapshot() {
      const snapshot = this.getCachedSnapshot();
      if (snapshot) {
        const isPreview = this.shouldIssueRequest();
        this.render(async () => {
          this.cacheSnapshot();
          if (this.isSamePage) {
            this.adapter.visitRendered(this);
          } else {
            if (this.view.renderPromise)
              await this.view.renderPromise;
            await this.view.renderPage(snapshot, isPreview, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            if (!isPreview) {
              this.complete();
            }
          }
        });
      }
    }
    followRedirect() {
      var _a;
      if (this.redirectedToLocation && !this.followedRedirect && ((_a = this.response) === null || _a === void 0 ? void 0 : _a.redirected)) {
        this.adapter.visitProposedToLocation(this.redirectedToLocation, {
          action: "replace",
          response: this.response,
          shouldCacheSnapshot: false,
          willRender: false
        });
        this.followedRedirect = true;
      }
    }
    goToSamePageAnchor() {
      if (this.isSamePage) {
        this.render(async () => {
          this.cacheSnapshot();
          this.performScroll();
          this.changeHistory();
          this.adapter.visitRendered(this);
        });
      }
    }
    prepareRequest(request) {
      if (this.acceptsStreamResponse) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted() {
      this.startRequest();
    }
    requestPreventedHandlingResponse(_request, _response) {
    }
    async requestSucceededWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.redirectedToLocation = response.redirected ? response.location : void 0;
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    async requestFailedWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    requestErrored(_request, _error) {
      this.recordResponse({
        statusCode: SystemStatusCode.networkFailure,
        redirected: false
      });
    }
    requestFinished() {
      this.finishRequest();
    }
    performScroll() {
      if (!this.scrolled && !this.view.forceReloaded) {
        if (this.action == "restore") {
          this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
        } else {
          this.scrollToAnchor() || this.view.scrollToTop();
        }
        if (this.isSamePage) {
          this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
        }
        this.scrolled = true;
      }
    }
    scrollToRestoredPosition() {
      const { scrollPosition } = this.restorationData;
      if (scrollPosition) {
        this.view.scrollToPosition(scrollPosition);
        return true;
      }
    }
    scrollToAnchor() {
      const anchor = getAnchor(this.location);
      if (anchor != null) {
        this.view.scrollToAnchor(anchor);
        return true;
      }
    }
    recordTimingMetric(metric) {
      this.timingMetrics[metric] = (/* @__PURE__ */ new Date()).getTime();
    }
    getTimingMetrics() {
      return Object.assign({}, this.timingMetrics);
    }
    getHistoryMethodForAction(action) {
      switch (action) {
        case "replace":
          return history.replaceState;
        case "advance":
        case "restore":
          return history.pushState;
      }
    }
    hasPreloadedResponse() {
      return typeof this.response == "object";
    }
    shouldIssueRequest() {
      if (this.isSamePage) {
        return false;
      } else if (this.action == "restore") {
        return !this.hasCachedSnapshot();
      } else {
        return this.willRender;
      }
    }
    cacheSnapshot() {
      if (!this.snapshotCached) {
        this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
        this.snapshotCached = true;
      }
    }
    async render(callback) {
      this.cancelRender();
      await new Promise((resolve) => {
        this.frame = requestAnimationFrame(() => resolve());
      });
      await callback();
      delete this.frame;
    }
    cancelRender() {
      if (this.frame) {
        cancelAnimationFrame(this.frame);
        delete this.frame;
      }
    }
  };
  function isSuccessful(statusCode) {
    return statusCode >= 200 && statusCode < 300;
  }
  var BrowserAdapter = class {
    constructor(session2) {
      this.progressBar = new ProgressBar();
      this.showProgressBar = () => {
        this.progressBar.show();
      };
      this.session = session2;
    }
    visitProposedToLocation(location2, options) {
      this.navigator.startVisit(location2, (options === null || options === void 0 ? void 0 : options.restorationIdentifier) || uuid(), options);
    }
    visitStarted(visit2) {
      this.location = visit2.location;
      visit2.loadCachedSnapshot();
      visit2.issueRequest();
      visit2.goToSamePageAnchor();
    }
    visitRequestStarted(visit2) {
      this.progressBar.setValue(0);
      if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
        this.showVisitProgressBarAfterDelay();
      } else {
        this.showProgressBar();
      }
    }
    visitRequestCompleted(visit2) {
      visit2.loadResponse();
    }
    visitRequestFailedWithStatusCode(visit2, statusCode) {
      switch (statusCode) {
        case SystemStatusCode.networkFailure:
        case SystemStatusCode.timeoutFailure:
        case SystemStatusCode.contentTypeMismatch:
          return this.reload({
            reason: "request_failed",
            context: {
              statusCode
            }
          });
        default:
          return visit2.loadResponse();
      }
    }
    visitRequestFinished(_visit) {
      this.progressBar.setValue(1);
      this.hideVisitProgressBar();
    }
    visitCompleted(_visit) {
    }
    pageInvalidated(reason) {
      this.reload(reason);
    }
    visitFailed(_visit) {
    }
    visitRendered(_visit) {
    }
    formSubmissionStarted(_formSubmission) {
      this.progressBar.setValue(0);
      this.showFormProgressBarAfterDelay();
    }
    formSubmissionFinished(_formSubmission) {
      this.progressBar.setValue(1);
      this.hideFormProgressBar();
    }
    showVisitProgressBarAfterDelay() {
      this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
    hideVisitProgressBar() {
      this.progressBar.hide();
      if (this.visitProgressBarTimeout != null) {
        window.clearTimeout(this.visitProgressBarTimeout);
        delete this.visitProgressBarTimeout;
      }
    }
    showFormProgressBarAfterDelay() {
      if (this.formProgressBarTimeout == null) {
        this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
      }
    }
    hideFormProgressBar() {
      this.progressBar.hide();
      if (this.formProgressBarTimeout != null) {
        window.clearTimeout(this.formProgressBarTimeout);
        delete this.formProgressBarTimeout;
      }
    }
    reload(reason) {
      var _a;
      dispatch("turbo:reload", { detail: reason });
      window.location.href = ((_a = this.location) === null || _a === void 0 ? void 0 : _a.toString()) || window.location.href;
    }
    get navigator() {
      return this.session.navigator;
    }
  };
  var CacheObserver = class {
    constructor() {
      this.started = false;
      this.removeStaleElements = (_event) => {
        const staleElements = [...document.querySelectorAll('[data-turbo-cache="false"]')];
        for (const element of staleElements) {
          element.remove();
        }
      };
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-cache", this.removeStaleElements, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-cache", this.removeStaleElements, false);
      }
    }
  };
  var FrameRedirector = class {
    constructor(session2, element) {
      this.session = session2;
      this.element = element;
      this.linkInterceptor = new LinkInterceptor(this, element);
      this.formSubmitObserver = new FormSubmitObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
    stop() {
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldRedirect(element);
    }
    linkClickIntercepted(element, url, event) {
      const frame = this.findFrameElement(element);
      if (frame) {
        frame.delegate.linkClickIntercepted(element, url, event);
      }
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == null && this.shouldSubmit(element, submitter) && this.shouldRedirect(element, submitter);
    }
    formSubmitted(element, submitter) {
      const frame = this.findFrameElement(element, submitter);
      if (frame) {
        frame.delegate.formSubmitted(element, submitter);
      }
    }
    shouldSubmit(form, submitter) {
      var _a;
      const action = getAction(form, submitter);
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const rootLocation = expandURL((_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/");
      return this.shouldRedirect(form, submitter) && locationIsVisitable(action, rootLocation);
    }
    shouldRedirect(element, submitter) {
      const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter) : this.session.elementIsNavigatable(element);
      if (isNavigatable) {
        const frame = this.findFrameElement(element, submitter);
        return frame ? frame != element.closest("turbo-frame") : false;
      } else {
        return false;
      }
    }
    findFrameElement(element, submitter) {
      const id = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-frame")) || element.getAttribute("data-turbo-frame");
      if (id && id != "_top") {
        const frame = this.element.querySelector(`#${id}:not([disabled])`);
        if (frame instanceof FrameElement) {
          return frame;
        }
      }
    }
  };
  var History = class {
    constructor(delegate) {
      this.restorationIdentifier = uuid();
      this.restorationData = {};
      this.started = false;
      this.pageLoaded = false;
      this.onPopState = (event) => {
        if (this.shouldHandlePopState()) {
          const { turbo } = event.state || {};
          if (turbo) {
            this.location = new URL(window.location.href);
            const { restorationIdentifier } = turbo;
            this.restorationIdentifier = restorationIdentifier;
            this.delegate.historyPoppedToLocationWithRestorationIdentifier(this.location, restorationIdentifier);
          }
        }
      };
      this.onPageLoad = async (_event) => {
        await nextMicrotask();
        this.pageLoaded = true;
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("popstate", this.onPopState, false);
        addEventListener("load", this.onPageLoad, false);
        this.started = true;
        this.replace(new URL(window.location.href));
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("popstate", this.onPopState, false);
        removeEventListener("load", this.onPageLoad, false);
        this.started = false;
      }
    }
    push(location2, restorationIdentifier) {
      this.update(history.pushState, location2, restorationIdentifier);
    }
    replace(location2, restorationIdentifier) {
      this.update(history.replaceState, location2, restorationIdentifier);
    }
    update(method, location2, restorationIdentifier = uuid()) {
      const state = { turbo: { restorationIdentifier } };
      method.call(history, state, "", location2.href);
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier;
    }
    getRestorationDataForIdentifier(restorationIdentifier) {
      return this.restorationData[restorationIdentifier] || {};
    }
    updateRestorationData(additionalData) {
      const { restorationIdentifier } = this;
      const restorationData = this.restorationData[restorationIdentifier];
      this.restorationData[restorationIdentifier] = Object.assign(Object.assign({}, restorationData), additionalData);
    }
    assumeControlOfScrollRestoration() {
      var _a;
      if (!this.previousScrollRestoration) {
        this.previousScrollRestoration = (_a = history.scrollRestoration) !== null && _a !== void 0 ? _a : "auto";
        history.scrollRestoration = "manual";
      }
    }
    relinquishControlOfScrollRestoration() {
      if (this.previousScrollRestoration) {
        history.scrollRestoration = this.previousScrollRestoration;
        delete this.previousScrollRestoration;
      }
    }
    shouldHandlePopState() {
      return this.pageIsLoaded();
    }
    pageIsLoaded() {
      return this.pageLoaded || document.readyState == "complete";
    }
  };
  var Navigator = class {
    constructor(delegate) {
      this.delegate = delegate;
    }
    proposeVisit(location2, options = {}) {
      if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
        if (locationIsVisitable(location2, this.view.snapshot.rootLocation)) {
          this.delegate.visitProposedToLocation(location2, options);
        } else {
          window.location.href = location2.toString();
        }
      }
    }
    startVisit(locatable, restorationIdentifier, options = {}) {
      this.stop();
      this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, Object.assign({ referrer: this.location }, options));
      this.currentVisit.start();
    }
    submitForm(form, submitter) {
      this.stop();
      this.formSubmission = new FormSubmission(this, form, submitter, true);
      this.formSubmission.start();
    }
    stop() {
      if (this.formSubmission) {
        this.formSubmission.stop();
        delete this.formSubmission;
      }
      if (this.currentVisit) {
        this.currentVisit.cancel();
        delete this.currentVisit;
      }
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    formSubmissionStarted(formSubmission) {
      if (typeof this.adapter.formSubmissionStarted === "function") {
        this.adapter.formSubmissionStarted(formSubmission);
      }
    }
    async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
      if (formSubmission == this.formSubmission) {
        const responseHTML = await fetchResponse.responseHTML;
        if (responseHTML) {
          const shouldCacheSnapshot = formSubmission.method == FetchMethod.get;
          if (!shouldCacheSnapshot) {
            this.view.clearSnapshotCache();
          }
          const { statusCode, redirected } = fetchResponse;
          const action = this.getActionForFormSubmission(formSubmission);
          const visitOptions = {
            action,
            shouldCacheSnapshot,
            response: { statusCode, responseHTML, redirected }
          };
          this.proposeVisit(fetchResponse.location, visitOptions);
        }
      }
    }
    async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const snapshot = PageSnapshot.fromHTMLString(responseHTML);
        if (fetchResponse.serverError) {
          await this.view.renderError(snapshot, this.currentVisit);
        } else {
          await this.view.renderPage(snapshot, false, true, this.currentVisit);
        }
        this.view.scrollToTop();
        this.view.clearSnapshotCache();
      }
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished(formSubmission) {
      if (typeof this.adapter.formSubmissionFinished === "function") {
        this.adapter.formSubmissionFinished(formSubmission);
      }
    }
    visitStarted(visit2) {
      this.delegate.visitStarted(visit2);
    }
    visitCompleted(visit2) {
      this.delegate.visitCompleted(visit2);
    }
    locationWithActionIsSamePage(location2, action) {
      const anchor = getAnchor(location2);
      const currentAnchor = getAnchor(this.view.lastRenderedLocation);
      const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
      return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    getActionForFormSubmission({ submitter, formElement }) {
      return getVisitAction(submitter, formElement) || "advance";
    }
  };
  var PageStage;
  (function(PageStage2) {
    PageStage2[PageStage2["initial"] = 0] = "initial";
    PageStage2[PageStage2["loading"] = 1] = "loading";
    PageStage2[PageStage2["interactive"] = 2] = "interactive";
    PageStage2[PageStage2["complete"] = 3] = "complete";
  })(PageStage || (PageStage = {}));
  var PageObserver = class {
    constructor(delegate) {
      this.stage = PageStage.initial;
      this.started = false;
      this.interpretReadyState = () => {
        const { readyState } = this;
        if (readyState == "interactive") {
          this.pageIsInteractive();
        } else if (readyState == "complete") {
          this.pageIsComplete();
        }
      };
      this.pageWillUnload = () => {
        this.delegate.pageWillUnload();
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        if (this.stage == PageStage.initial) {
          this.stage = PageStage.loading;
        }
        document.addEventListener("readystatechange", this.interpretReadyState, false);
        addEventListener("pagehide", this.pageWillUnload, false);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        document.removeEventListener("readystatechange", this.interpretReadyState, false);
        removeEventListener("pagehide", this.pageWillUnload, false);
        this.started = false;
      }
    }
    pageIsInteractive() {
      if (this.stage == PageStage.loading) {
        this.stage = PageStage.interactive;
        this.delegate.pageBecameInteractive();
      }
    }
    pageIsComplete() {
      this.pageIsInteractive();
      if (this.stage == PageStage.interactive) {
        this.stage = PageStage.complete;
        this.delegate.pageLoaded();
      }
    }
    get readyState() {
      return document.readyState;
    }
  };
  var ScrollObserver = class {
    constructor(delegate) {
      this.started = false;
      this.onScroll = () => {
        this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("scroll", this.onScroll, false);
        this.onScroll();
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("scroll", this.onScroll, false);
        this.started = false;
      }
    }
    updatePosition(position) {
      this.delegate.scrollPositionChanged(position);
    }
  };
  var StreamMessageRenderer = class {
    render({ fragment }) {
      Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => document.documentElement.appendChild(fragment));
    }
    enteringBardo(currentPermanentElement, newPermanentElement) {
      newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
    }
    leavingBardo() {
    }
  };
  function getPermanentElementMapForFragment(fragment) {
    const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
    const permanentElementMap = {};
    for (const permanentElementInDocument of permanentElementsInDocument) {
      const { id } = permanentElementInDocument;
      for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
        const elementInStream = getPermanentElementById(streamElement.templateElement.content, id);
        if (elementInStream) {
          permanentElementMap[id] = [permanentElementInDocument, elementInStream];
        }
      }
    }
    return permanentElementMap;
  }
  var StreamObserver = class {
    constructor(delegate) {
      this.sources = /* @__PURE__ */ new Set();
      this.started = false;
      this.inspectFetchResponse = (event) => {
        const response = fetchResponseFromEvent(event);
        if (response && fetchResponseIsStream(response)) {
          event.preventDefault();
          this.receiveMessageResponse(response);
        }
      };
      this.receiveMessageEvent = (event) => {
        if (this.started && typeof event.data == "string") {
          this.receiveMessageHTML(event.data);
        }
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    connectStreamSource(source) {
      if (!this.streamSourceIsConnected(source)) {
        this.sources.add(source);
        source.addEventListener("message", this.receiveMessageEvent, false);
      }
    }
    disconnectStreamSource(source) {
      if (this.streamSourceIsConnected(source)) {
        this.sources.delete(source);
        source.removeEventListener("message", this.receiveMessageEvent, false);
      }
    }
    streamSourceIsConnected(source) {
      return this.sources.has(source);
    }
    async receiveMessageResponse(response) {
      const html = await response.responseHTML;
      if (html) {
        this.receiveMessageHTML(html);
      }
    }
    receiveMessageHTML(html) {
      this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
    }
  };
  function fetchResponseFromEvent(event) {
    var _a;
    const fetchResponse = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.fetchResponse;
    if (fetchResponse instanceof FetchResponse) {
      return fetchResponse;
    }
  }
  function fetchResponseIsStream(response) {
    var _a;
    const contentType = (_a = response.contentType) !== null && _a !== void 0 ? _a : "";
    return contentType.startsWith(StreamMessage.contentType);
  }
  var ErrorRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      const { documentElement, body } = document;
      documentElement.replaceChild(newElement, body);
    }
    async render() {
      this.replaceHeadAndBody();
      this.activateScriptElements();
    }
    replaceHeadAndBody() {
      const { documentElement, head } = document;
      documentElement.replaceChild(this.newHead, head);
      this.renderElement(this.currentElement, this.newElement);
    }
    activateScriptElements() {
      for (const replaceableElement of this.scriptElements) {
        const parentNode = replaceableElement.parentNode;
        if (parentNode) {
          const element = activateScriptElement(replaceableElement);
          parentNode.replaceChild(element, replaceableElement);
        }
      }
    }
    get newHead() {
      return this.newSnapshot.headSnapshot.element;
    }
    get scriptElements() {
      return document.documentElement.querySelectorAll("script");
    }
  };
  var PageRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      if (document.body && newElement instanceof HTMLBodyElement) {
        document.body.replaceWith(newElement);
      } else {
        document.documentElement.appendChild(newElement);
      }
    }
    get shouldRender() {
      return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
    }
    get reloadReason() {
      if (!this.newSnapshot.isVisitable) {
        return {
          reason: "turbo_visit_control_is_reload"
        };
      }
      if (!this.trackedElementsAreIdentical) {
        return {
          reason: "tracked_element_mismatch"
        };
      }
    }
    async prepareToRender() {
      await this.mergeHead();
    }
    async render() {
      if (this.willRender) {
        await this.replaceBody();
      }
    }
    finishRendering() {
      super.finishRendering();
      if (!this.isPreview) {
        this.focusFirstAutofocusableElement();
      }
    }
    get currentHeadSnapshot() {
      return this.currentSnapshot.headSnapshot;
    }
    get newHeadSnapshot() {
      return this.newSnapshot.headSnapshot;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    async mergeHead() {
      const mergedHeadElements = this.mergeProvisionalElements();
      const newStylesheetElements = this.copyNewHeadStylesheetElements();
      this.copyNewHeadScriptElements();
      await mergedHeadElements;
      await newStylesheetElements;
    }
    async replaceBody() {
      await this.preservingPermanentElements(async () => {
        this.activateNewBody();
        await this.assignNewBody();
      });
    }
    get trackedElementsAreIdentical() {
      return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
    }
    async copyNewHeadStylesheetElements() {
      const loadingElements = [];
      for (const element of this.newHeadStylesheetElements) {
        loadingElements.push(waitForLoad(element));
        document.head.appendChild(element);
      }
      await Promise.all(loadingElements);
    }
    copyNewHeadScriptElements() {
      for (const element of this.newHeadScriptElements) {
        document.head.appendChild(activateScriptElement(element));
      }
    }
    async mergeProvisionalElements() {
      const newHeadElements = [...this.newHeadProvisionalElements];
      for (const element of this.currentHeadProvisionalElements) {
        if (!this.isCurrentElementInElementList(element, newHeadElements)) {
          document.head.removeChild(element);
        }
      }
      for (const element of newHeadElements) {
        document.head.appendChild(element);
      }
    }
    isCurrentElementInElementList(element, elementList) {
      for (const [index, newElement] of elementList.entries()) {
        if (element.tagName == "TITLE") {
          if (newElement.tagName != "TITLE") {
            continue;
          }
          if (element.innerHTML == newElement.innerHTML) {
            elementList.splice(index, 1);
            return true;
          }
        }
        if (newElement.isEqualNode(element)) {
          elementList.splice(index, 1);
          return true;
        }
      }
      return false;
    }
    removeCurrentHeadProvisionalElements() {
      for (const element of this.currentHeadProvisionalElements) {
        document.head.removeChild(element);
      }
    }
    copyNewHeadProvisionalElements() {
      for (const element of this.newHeadProvisionalElements) {
        document.head.appendChild(element);
      }
    }
    activateNewBody() {
      document.adoptNode(this.newElement);
      this.activateNewBodyScriptElements();
    }
    activateNewBodyScriptElements() {
      for (const inertScriptElement of this.newBodyScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    async assignNewBody() {
      await this.renderElement(this.currentElement, this.newElement);
    }
    get newHeadStylesheetElements() {
      return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get newHeadScriptElements() {
      return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get currentHeadProvisionalElements() {
      return this.currentHeadSnapshot.provisionalElements;
    }
    get newHeadProvisionalElements() {
      return this.newHeadSnapshot.provisionalElements;
    }
    get newBodyScriptElements() {
      return this.newElement.querySelectorAll("script");
    }
  };
  var SnapshotCache = class {
    constructor(size) {
      this.keys = [];
      this.snapshots = {};
      this.size = size;
    }
    has(location2) {
      return toCacheKey(location2) in this.snapshots;
    }
    get(location2) {
      if (this.has(location2)) {
        const snapshot = this.read(location2);
        this.touch(location2);
        return snapshot;
      }
    }
    put(location2, snapshot) {
      this.write(location2, snapshot);
      this.touch(location2);
      return snapshot;
    }
    clear() {
      this.snapshots = {};
    }
    read(location2) {
      return this.snapshots[toCacheKey(location2)];
    }
    write(location2, snapshot) {
      this.snapshots[toCacheKey(location2)] = snapshot;
    }
    touch(location2) {
      const key = toCacheKey(location2);
      const index = this.keys.indexOf(key);
      if (index > -1)
        this.keys.splice(index, 1);
      this.keys.unshift(key);
      this.trim();
    }
    trim() {
      for (const key of this.keys.splice(this.size)) {
        delete this.snapshots[key];
      }
    }
  };
  var PageView = class extends View {
    constructor() {
      super(...arguments);
      this.snapshotCache = new SnapshotCache(10);
      this.lastRenderedLocation = new URL(location.href);
      this.forceReloaded = false;
    }
    renderPage(snapshot, isPreview = false, willRender = true, visit2) {
      const renderer = new PageRenderer(this.snapshot, snapshot, PageRenderer.renderElement, isPreview, willRender);
      if (!renderer.shouldRender) {
        this.forceReloaded = true;
      } else {
        visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      }
      return this.render(renderer);
    }
    renderError(snapshot, visit2) {
      visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      const renderer = new ErrorRenderer(this.snapshot, snapshot, ErrorRenderer.renderElement, false);
      return this.render(renderer);
    }
    clearSnapshotCache() {
      this.snapshotCache.clear();
    }
    async cacheSnapshot(snapshot = this.snapshot) {
      if (snapshot.isCacheable) {
        this.delegate.viewWillCacheSnapshot();
        const { lastRenderedLocation: location2 } = this;
        await nextEventLoopTick();
        const cachedSnapshot = snapshot.clone();
        this.snapshotCache.put(location2, cachedSnapshot);
        return cachedSnapshot;
      }
    }
    getCachedSnapshotForLocation(location2) {
      return this.snapshotCache.get(location2);
    }
    get snapshot() {
      return PageSnapshot.fromElement(this.element);
    }
  };
  var Preloader = class {
    constructor(delegate) {
      this.selector = "a[data-turbo-preload]";
      this.delegate = delegate;
    }
    get snapshotCache() {
      return this.delegate.navigator.view.snapshotCache;
    }
    start() {
      if (document.readyState === "loading") {
        return document.addEventListener("DOMContentLoaded", () => {
          this.preloadOnLoadLinksForView(document.body);
        });
      } else {
        this.preloadOnLoadLinksForView(document.body);
      }
    }
    preloadOnLoadLinksForView(element) {
      for (const link of element.querySelectorAll(this.selector)) {
        this.preloadURL(link);
      }
    }
    async preloadURL(link) {
      const location2 = new URL(link.href);
      if (this.snapshotCache.has(location2)) {
        return;
      }
      try {
        const response = await fetch(location2.toString(), { headers: { "VND.PREFETCH": "true", Accept: "text/html" } });
        const responseText = await response.text();
        const snapshot = PageSnapshot.fromHTMLString(responseText);
        this.snapshotCache.put(location2, snapshot);
      } catch (_2) {
      }
    }
  };
  var Session = class {
    constructor() {
      this.navigator = new Navigator(this);
      this.history = new History(this);
      this.preloader = new Preloader(this);
      this.view = new PageView(this, document.documentElement);
      this.adapter = new BrowserAdapter(this);
      this.pageObserver = new PageObserver(this);
      this.cacheObserver = new CacheObserver();
      this.linkClickObserver = new LinkClickObserver(this, window);
      this.formSubmitObserver = new FormSubmitObserver(this, document);
      this.scrollObserver = new ScrollObserver(this);
      this.streamObserver = new StreamObserver(this);
      this.formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
      this.frameRedirector = new FrameRedirector(this, document.documentElement);
      this.streamMessageRenderer = new StreamMessageRenderer();
      this.drive = true;
      this.enabled = true;
      this.progressBarDelay = 500;
      this.started = false;
      this.formMode = "on";
    }
    start() {
      if (!this.started) {
        this.pageObserver.start();
        this.cacheObserver.start();
        this.formLinkClickObserver.start();
        this.linkClickObserver.start();
        this.formSubmitObserver.start();
        this.scrollObserver.start();
        this.streamObserver.start();
        this.frameRedirector.start();
        this.history.start();
        this.preloader.start();
        this.started = true;
        this.enabled = true;
      }
    }
    disable() {
      this.enabled = false;
    }
    stop() {
      if (this.started) {
        this.pageObserver.stop();
        this.cacheObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkClickObserver.stop();
        this.formSubmitObserver.stop();
        this.scrollObserver.stop();
        this.streamObserver.stop();
        this.frameRedirector.stop();
        this.history.stop();
        this.started = false;
      }
    }
    registerAdapter(adapter) {
      this.adapter = adapter;
    }
    visit(location2, options = {}) {
      const frameElement = options.frame ? document.getElementById(options.frame) : null;
      if (frameElement instanceof FrameElement) {
        frameElement.src = location2.toString();
        frameElement.loaded;
      } else {
        this.navigator.proposeVisit(expandURL(location2), options);
      }
    }
    connectStreamSource(source) {
      this.streamObserver.connectStreamSource(source);
    }
    disconnectStreamSource(source) {
      this.streamObserver.disconnectStreamSource(source);
    }
    renderStreamMessage(message) {
      this.streamMessageRenderer.render(StreamMessage.wrap(message));
    }
    clearCache() {
      this.view.clearSnapshotCache();
    }
    setProgressBarDelay(delay) {
      this.progressBarDelay = delay;
    }
    setFormMode(mode) {
      this.formMode = mode;
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    historyPoppedToLocationWithRestorationIdentifier(location2, restorationIdentifier) {
      if (this.enabled) {
        this.navigator.startVisit(location2, restorationIdentifier, {
          action: "restore",
          historyChanged: true
        });
      } else {
        this.adapter.pageInvalidated({
          reason: "turbo_disabled"
        });
      }
    }
    scrollPositionChanged(position) {
      this.history.updateRestorationData({ scrollPosition: position });
    }
    willSubmitFormLinkToLocation(link, location2) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
    submittedFormLinkToLocation() {
    }
    willFollowLinkToLocation(link, location2, event) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2, event);
    }
    followedLinkToLocation(link, location2) {
      const action = this.getActionForLink(link);
      const acceptsStreamResponse = link.hasAttribute("data-turbo-stream");
      this.visit(location2.href, { action, acceptsStreamResponse });
    }
    allowsVisitingLocationWithAction(location2, action) {
      return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
    }
    visitProposedToLocation(location2, options) {
      extendURLWithDeprecatedProperties(location2);
      this.adapter.visitProposedToLocation(location2, options);
    }
    visitStarted(visit2) {
      if (!visit2.acceptsStreamResponse) {
        markAsBusy(document.documentElement);
      }
      extendURLWithDeprecatedProperties(visit2.location);
      if (!visit2.silent) {
        this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
      }
    }
    visitCompleted(visit2) {
      clearBusyState(document.documentElement);
      this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
    }
    locationWithActionIsSamePage(location2, action) {
      return this.navigator.locationWithActionIsSamePage(location2, action);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
    }
    willSubmitForm(form, submitter) {
      const action = getAction(form, submitter);
      return this.submissionIsNavigatable(form, submitter) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
    }
    formSubmitted(form, submitter) {
      this.navigator.submitForm(form, submitter);
    }
    pageBecameInteractive() {
      this.view.lastRenderedLocation = this.location;
      this.notifyApplicationAfterPageLoad();
    }
    pageLoaded() {
      this.history.assumeControlOfScrollRestoration();
    }
    pageWillUnload() {
      this.history.relinquishControlOfScrollRestoration();
    }
    receivedMessageFromStream(message) {
      this.renderStreamMessage(message);
    }
    viewWillCacheSnapshot() {
      var _a;
      if (!((_a = this.navigator.currentVisit) === null || _a === void 0 ? void 0 : _a.silent)) {
        this.notifyApplicationBeforeCachingSnapshot();
      }
    }
    allowsImmediateRender({ element }, options) {
      const event = this.notifyApplicationBeforeRender(element, options);
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
      this.view.lastRenderedLocation = this.history.location;
      this.notifyApplicationAfterRender();
    }
    preloadOnLoadLinksForView(element) {
      this.preloader.preloadOnLoadLinksForView(element);
    }
    viewInvalidated(reason) {
      this.adapter.pageInvalidated(reason);
    }
    frameLoaded(frame) {
      this.notifyApplicationAfterFrameLoad(frame);
    }
    frameRendered(fetchResponse, frame) {
      this.notifyApplicationAfterFrameRender(fetchResponse, frame);
    }
    applicationAllowsFollowingLinkToLocation(link, location2, ev) {
      const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2, ev);
      return !event.defaultPrevented;
    }
    applicationAllowsVisitingLocation(location2) {
      const event = this.notifyApplicationBeforeVisitingLocation(location2);
      return !event.defaultPrevented;
    }
    notifyApplicationAfterClickingLinkToLocation(link, location2, event) {
      return dispatch("turbo:click", {
        target: link,
        detail: { url: location2.href, originalEvent: event },
        cancelable: true
      });
    }
    notifyApplicationBeforeVisitingLocation(location2) {
      return dispatch("turbo:before-visit", {
        detail: { url: location2.href },
        cancelable: true
      });
    }
    notifyApplicationAfterVisitingLocation(location2, action) {
      return dispatch("turbo:visit", { detail: { url: location2.href, action } });
    }
    notifyApplicationBeforeCachingSnapshot() {
      return dispatch("turbo:before-cache");
    }
    notifyApplicationBeforeRender(newBody, options) {
      return dispatch("turbo:before-render", {
        detail: Object.assign({ newBody }, options),
        cancelable: true
      });
    }
    notifyApplicationAfterRender() {
      return dispatch("turbo:render");
    }
    notifyApplicationAfterPageLoad(timing = {}) {
      return dispatch("turbo:load", {
        detail: { url: this.location.href, timing }
      });
    }
    notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
      dispatchEvent(new HashChangeEvent("hashchange", {
        oldURL: oldURL.toString(),
        newURL: newURL.toString()
      }));
    }
    notifyApplicationAfterFrameLoad(frame) {
      return dispatch("turbo:frame-load", { target: frame });
    }
    notifyApplicationAfterFrameRender(fetchResponse, frame) {
      return dispatch("turbo:frame-render", {
        detail: { fetchResponse },
        target: frame,
        cancelable: true
      });
    }
    submissionIsNavigatable(form, submitter) {
      if (this.formMode == "off") {
        return false;
      } else {
        const submitterIsNavigatable = submitter ? this.elementIsNavigatable(submitter) : true;
        if (this.formMode == "optin") {
          return submitterIsNavigatable && form.closest('[data-turbo="true"]') != null;
        } else {
          return submitterIsNavigatable && this.elementIsNavigatable(form);
        }
      }
    }
    elementIsNavigatable(element) {
      const container = findClosestRecursively(element, "[data-turbo]");
      const withinFrame = findClosestRecursively(element, "turbo-frame");
      if (this.drive || withinFrame) {
        if (container) {
          return container.getAttribute("data-turbo") != "false";
        } else {
          return true;
        }
      } else {
        if (container) {
          return container.getAttribute("data-turbo") == "true";
        } else {
          return false;
        }
      }
    }
    getActionForLink(link) {
      return getVisitAction(link) || "advance";
    }
    get snapshot() {
      return this.view.snapshot;
    }
  };
  function extendURLWithDeprecatedProperties(url) {
    Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
  }
  var deprecatedLocationPropertyDescriptors = {
    absoluteURL: {
      get() {
        return this.toString();
      }
    }
  };
  var Cache = class {
    constructor(session2) {
      this.session = session2;
    }
    clear() {
      this.session.clearCache();
    }
    resetCacheControl() {
      this.setCacheControl("");
    }
    exemptPageFromCache() {
      this.setCacheControl("no-cache");
    }
    exemptPageFromPreview() {
      this.setCacheControl("no-preview");
    }
    setCacheControl(value) {
      setMetaContent("turbo-cache-control", value);
    }
  };
  var StreamActions = {
    after() {
      this.targetElements.forEach((e2) => {
        var _a;
        return (_a = e2.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e2.nextSibling);
      });
    },
    append() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e2) => e2.append(this.templateContent));
    },
    before() {
      this.targetElements.forEach((e2) => {
        var _a;
        return (_a = e2.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e2);
      });
    },
    prepend() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e2) => e2.prepend(this.templateContent));
    },
    remove() {
      this.targetElements.forEach((e2) => e2.remove());
    },
    replace() {
      this.targetElements.forEach((e2) => e2.replaceWith(this.templateContent));
    },
    update() {
      this.targetElements.forEach((targetElement) => {
        targetElement.innerHTML = "";
        targetElement.append(this.templateContent);
      });
    }
  };
  var session = new Session();
  var cache = new Cache(session);
  var { navigator: navigator$1 } = session;
  function start() {
    session.start();
  }
  function registerAdapter(adapter) {
    session.registerAdapter(adapter);
  }
  function visit(location2, options) {
    session.visit(location2, options);
  }
  function connectStreamSource(source) {
    session.connectStreamSource(source);
  }
  function disconnectStreamSource(source) {
    session.disconnectStreamSource(source);
  }
  function renderStreamMessage(message) {
    session.renderStreamMessage(message);
  }
  function clearCache() {
    console.warn("Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`");
    session.clearCache();
  }
  function setProgressBarDelay(delay) {
    session.setProgressBarDelay(delay);
  }
  function setConfirmMethod(confirmMethod) {
    FormSubmission.confirmMethod = confirmMethod;
  }
  function setFormMode(mode) {
    session.setFormMode(mode);
  }
  var Turbo = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    navigator: navigator$1,
    session,
    cache,
    PageRenderer,
    PageSnapshot,
    FrameRenderer,
    start,
    registerAdapter,
    visit,
    connectStreamSource,
    disconnectStreamSource,
    renderStreamMessage,
    clearCache,
    setProgressBarDelay,
    setConfirmMethod,
    setFormMode,
    StreamActions
  });
  var FrameController = class {
    constructor(element) {
      this.fetchResponseLoaded = (_fetchResponse) => {
      };
      this.currentFetchRequest = null;
      this.resolveVisitPromise = () => {
      };
      this.connected = false;
      this.hasBeenLoaded = false;
      this.ignoredAttributes = /* @__PURE__ */ new Set();
      this.action = null;
      this.visitCachedSnapshot = ({ element: element2 }) => {
        const frame = element2.querySelector("#" + this.element.id);
        if (frame && this.previousFrameElement) {
          frame.replaceChildren(...this.previousFrameElement.children);
        }
        delete this.previousFrameElement;
      };
      this.element = element;
      this.view = new FrameView(this, this.element);
      this.appearanceObserver = new AppearanceObserver(this, this.element);
      this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
      this.linkInterceptor = new LinkInterceptor(this, this.element);
      this.restorationIdentifier = uuid();
      this.formSubmitObserver = new FormSubmitObserver(this, this.element);
    }
    connect() {
      if (!this.connected) {
        this.connected = true;
        if (this.loadingStyle == FrameLoadingStyle.lazy) {
          this.appearanceObserver.start();
        } else {
          this.loadSourceURL();
        }
        this.formLinkClickObserver.start();
        this.linkInterceptor.start();
        this.formSubmitObserver.start();
      }
    }
    disconnect() {
      if (this.connected) {
        this.connected = false;
        this.appearanceObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkInterceptor.stop();
        this.formSubmitObserver.stop();
      }
    }
    disabledChanged() {
      if (this.loadingStyle == FrameLoadingStyle.eager) {
        this.loadSourceURL();
      }
    }
    sourceURLChanged() {
      if (this.isIgnoringChangesTo("src"))
        return;
      if (this.element.isConnected) {
        this.complete = false;
      }
      if (this.loadingStyle == FrameLoadingStyle.eager || this.hasBeenLoaded) {
        this.loadSourceURL();
      }
    }
    sourceURLReloaded() {
      const { src } = this.element;
      this.ignoringChangesToAttribute("complete", () => {
        this.element.removeAttribute("complete");
      });
      this.element.src = null;
      this.element.src = src;
      return this.element.loaded;
    }
    completeChanged() {
      if (this.isIgnoringChangesTo("complete"))
        return;
      this.loadSourceURL();
    }
    loadingStyleChanged() {
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.appearanceObserver.stop();
        this.loadSourceURL();
      }
    }
    async loadSourceURL() {
      if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
        this.element.loaded = this.visit(expandURL(this.sourceURL));
        this.appearanceObserver.stop();
        await this.element.loaded;
        this.hasBeenLoaded = true;
      }
    }
    async loadResponse(fetchResponse) {
      if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
        this.sourceURL = fetchResponse.response.url;
      }
      try {
        const html = await fetchResponse.responseHTML;
        if (html) {
          const { body } = parseHTMLDocument(html);
          const newFrameElement = await this.extractForeignFrameElement(body);
          if (newFrameElement) {
            const snapshot = new Snapshot(newFrameElement);
            const renderer = new FrameRenderer(this, this.view.snapshot, snapshot, FrameRenderer.renderElement, false, false);
            if (this.view.renderPromise)
              await this.view.renderPromise;
            this.changeHistory();
            await this.view.render(renderer);
            this.complete = true;
            session.frameRendered(fetchResponse, this.element);
            session.frameLoaded(this.element);
            this.fetchResponseLoaded(fetchResponse);
          } else if (this.willHandleFrameMissingFromResponse(fetchResponse)) {
            console.warn(`A matching frame for #${this.element.id} was missing from the response, transforming into full-page Visit.`);
            this.visitResponse(fetchResponse.response);
          }
        }
      } catch (error2) {
        console.error(error2);
        this.view.invalidate();
      } finally {
        this.fetchResponseLoaded = () => {
        };
      }
    }
    elementAppearedInViewport(element) {
      this.proposeVisitIfNavigatedWithAction(element, element);
      this.loadSourceURL();
    }
    willSubmitFormLinkToLocation(link) {
      return this.shouldInterceptNavigation(link);
    }
    submittedFormLinkToLocation(link, _location, form) {
      const frame = this.findFrameElement(link);
      if (frame)
        form.setAttribute("data-turbo-frame", frame.id);
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldInterceptNavigation(element);
    }
    linkClickIntercepted(element, location2) {
      this.navigateFrame(element, location2);
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == this.element && this.shouldInterceptNavigation(element, submitter);
    }
    formSubmitted(element, submitter) {
      if (this.formSubmission) {
        this.formSubmission.stop();
      }
      this.formSubmission = new FormSubmission(this, element, submitter);
      const { fetchRequest } = this.formSubmission;
      this.prepareRequest(fetchRequest);
      this.formSubmission.start();
    }
    prepareRequest(request) {
      var _a;
      request.headers["Turbo-Frame"] = this.id;
      if ((_a = this.currentNavigationElement) === null || _a === void 0 ? void 0 : _a.hasAttribute("data-turbo-stream")) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      markAsBusy(this.element);
    }
    requestPreventedHandlingResponse(_request, _response) {
      this.resolveVisitPromise();
    }
    async requestSucceededWithResponse(request, response) {
      await this.loadResponse(response);
      this.resolveVisitPromise();
    }
    async requestFailedWithResponse(request, response) {
      console.error(response);
      await this.loadResponse(response);
      this.resolveVisitPromise();
    }
    requestErrored(request, error2) {
      console.error(error2);
      this.resolveVisitPromise();
    }
    requestFinished(_request) {
      clearBusyState(this.element);
    }
    formSubmissionStarted({ formElement }) {
      markAsBusy(formElement, this.findFrameElement(formElement));
    }
    formSubmissionSucceededWithResponse(formSubmission, response) {
      const frame = this.findFrameElement(formSubmission.formElement, formSubmission.submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, formSubmission.formElement, formSubmission.submitter);
      frame.delegate.loadResponse(response);
    }
    formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      this.element.delegate.loadResponse(fetchResponse);
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished({ formElement }) {
      clearBusyState(formElement, this.findFrameElement(formElement));
    }
    allowsImmediateRender({ element: newFrame }, options) {
      const event = dispatch("turbo:before-frame-render", {
        target: this.element,
        detail: Object.assign({ newFrame }, options),
        cancelable: true
      });
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
    }
    preloadOnLoadLinksForView(element) {
      session.preloadOnLoadLinksForView(element);
    }
    viewInvalidated() {
    }
    willRenderFrame(currentElement, _newElement) {
      this.previousFrameElement = currentElement.cloneNode(true);
    }
    async visit(url) {
      var _a;
      const request = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
      (_a = this.currentFetchRequest) === null || _a === void 0 ? void 0 : _a.cancel();
      this.currentFetchRequest = request;
      return new Promise((resolve) => {
        this.resolveVisitPromise = () => {
          this.resolveVisitPromise = () => {
          };
          this.currentFetchRequest = null;
          resolve();
        };
        request.perform();
      });
    }
    navigateFrame(element, url, submitter) {
      const frame = this.findFrameElement(element, submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, element, submitter);
      this.withCurrentNavigationElement(element, () => {
        frame.src = url;
      });
    }
    proposeVisitIfNavigatedWithAction(frame, element, submitter) {
      this.action = getVisitAction(submitter, element, frame);
      if (this.action) {
        const pageSnapshot = PageSnapshot.fromElement(frame).clone();
        const { visitCachedSnapshot } = frame.delegate;
        frame.delegate.fetchResponseLoaded = (fetchResponse) => {
          if (frame.src) {
            const { statusCode, redirected } = fetchResponse;
            const responseHTML = frame.ownerDocument.documentElement.outerHTML;
            const response = { statusCode, redirected, responseHTML };
            const options = {
              response,
              visitCachedSnapshot,
              willRender: false,
              updateHistory: false,
              restorationIdentifier: this.restorationIdentifier,
              snapshot: pageSnapshot
            };
            if (this.action)
              options.action = this.action;
            session.visit(frame.src, options);
          }
        };
      }
    }
    changeHistory() {
      if (this.action) {
        const method = getHistoryMethodForAction(this.action);
        session.history.update(method, expandURL(this.element.src || ""), this.restorationIdentifier);
      }
    }
    willHandleFrameMissingFromResponse(fetchResponse) {
      this.element.setAttribute("complete", "");
      const response = fetchResponse.response;
      const visit2 = async (url, options = {}) => {
        if (url instanceof Response) {
          this.visitResponse(url);
        } else {
          session.visit(url, options);
        }
      };
      const event = dispatch("turbo:frame-missing", {
        target: this.element,
        detail: { response, visit: visit2 },
        cancelable: true
      });
      return !event.defaultPrevented;
    }
    async visitResponse(response) {
      const wrapped = new FetchResponse(response);
      const responseHTML = await wrapped.responseHTML;
      const { location: location2, redirected, statusCode } = wrapped;
      return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
    }
    findFrameElement(element, submitter) {
      var _a;
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      return (_a = getFrameElementById(id)) !== null && _a !== void 0 ? _a : this.element;
    }
    async extractForeignFrameElement(container) {
      let element;
      const id = CSS.escape(this.id);
      try {
        element = activateElement(container.querySelector(`turbo-frame#${id}`), this.sourceURL);
        if (element) {
          return element;
        }
        element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.sourceURL);
        if (element) {
          await element.loaded;
          return await this.extractForeignFrameElement(element);
        }
      } catch (error2) {
        console.error(error2);
        return new FrameElement();
      }
      return null;
    }
    formActionIsVisitable(form, submitter) {
      const action = getAction(form, submitter);
      return locationIsVisitable(expandURL(action), this.rootLocation);
    }
    shouldInterceptNavigation(element, submitter) {
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      if (element instanceof HTMLFormElement && !this.formActionIsVisitable(element, submitter)) {
        return false;
      }
      if (!this.enabled || id == "_top") {
        return false;
      }
      if (id) {
        const frameElement = getFrameElementById(id);
        if (frameElement) {
          return !frameElement.disabled;
        }
      }
      if (!session.elementIsNavigatable(element)) {
        return false;
      }
      if (submitter && !session.elementIsNavigatable(submitter)) {
        return false;
      }
      return true;
    }
    get id() {
      return this.element.id;
    }
    get enabled() {
      return !this.element.disabled;
    }
    get sourceURL() {
      if (this.element.src) {
        return this.element.src;
      }
    }
    set sourceURL(sourceURL) {
      this.ignoringChangesToAttribute("src", () => {
        this.element.src = sourceURL !== null && sourceURL !== void 0 ? sourceURL : null;
      });
    }
    get loadingStyle() {
      return this.element.loading;
    }
    get isLoading() {
      return this.formSubmission !== void 0 || this.resolveVisitPromise() !== void 0;
    }
    get complete() {
      return this.element.hasAttribute("complete");
    }
    set complete(value) {
      this.ignoringChangesToAttribute("complete", () => {
        if (value) {
          this.element.setAttribute("complete", "");
        } else {
          this.element.removeAttribute("complete");
        }
      });
    }
    get isActive() {
      return this.element.isActive && this.connected;
    }
    get rootLocation() {
      var _a;
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const root = (_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    isIgnoringChangesTo(attributeName) {
      return this.ignoredAttributes.has(attributeName);
    }
    ignoringChangesToAttribute(attributeName, callback) {
      this.ignoredAttributes.add(attributeName);
      callback();
      this.ignoredAttributes.delete(attributeName);
    }
    withCurrentNavigationElement(element, callback) {
      this.currentNavigationElement = element;
      callback();
      delete this.currentNavigationElement;
    }
  };
  function getFrameElementById(id) {
    if (id != null) {
      const element = document.getElementById(id);
      if (element instanceof FrameElement) {
        return element;
      }
    }
  }
  function activateElement(element, currentURL) {
    if (element) {
      const src = element.getAttribute("src");
      if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
        throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
      }
      if (element.ownerDocument !== document) {
        element = document.importNode(element, true);
      }
      if (element instanceof FrameElement) {
        element.connectedCallback();
        element.disconnectedCallback();
        return element;
      }
    }
  }
  var StreamElement = class extends HTMLElement {
    static async renderElement(newElement) {
      await newElement.performAction();
    }
    async connectedCallback() {
      try {
        await this.render();
      } catch (error2) {
        console.error(error2);
      } finally {
        this.disconnect();
      }
    }
    async render() {
      var _a;
      return (_a = this.renderPromise) !== null && _a !== void 0 ? _a : this.renderPromise = (async () => {
        const event = this.beforeRenderEvent;
        if (this.dispatchEvent(event)) {
          await nextAnimationFrame();
          await event.detail.render(this);
        }
      })();
    }
    disconnect() {
      try {
        this.remove();
      } catch (_a) {
      }
    }
    removeDuplicateTargetChildren() {
      this.duplicateChildren.forEach((c2) => c2.remove());
    }
    get duplicateChildren() {
      var _a;
      const existingChildren = this.targetElements.flatMap((e2) => [...e2.children]).filter((c2) => !!c2.id);
      const newChildrenIds = [...((_a = this.templateContent) === null || _a === void 0 ? void 0 : _a.children) || []].filter((c2) => !!c2.id).map((c2) => c2.id);
      return existingChildren.filter((c2) => newChildrenIds.includes(c2.id));
    }
    get performAction() {
      if (this.action) {
        const actionFunction = StreamActions[this.action];
        if (actionFunction) {
          return actionFunction;
        }
        this.raise("unknown action");
      }
      this.raise("action attribute is missing");
    }
    get targetElements() {
      if (this.target) {
        return this.targetElementsById;
      } else if (this.targets) {
        return this.targetElementsByQuery;
      } else {
        this.raise("target or targets attribute is missing");
      }
    }
    get templateContent() {
      return this.templateElement.content.cloneNode(true);
    }
    get templateElement() {
      if (this.firstElementChild === null) {
        const template = this.ownerDocument.createElement("template");
        this.appendChild(template);
        return template;
      } else if (this.firstElementChild instanceof HTMLTemplateElement) {
        return this.firstElementChild;
      }
      this.raise("first child element must be a <template> element");
    }
    get action() {
      return this.getAttribute("action");
    }
    get target() {
      return this.getAttribute("target");
    }
    get targets() {
      return this.getAttribute("targets");
    }
    raise(message) {
      throw new Error(`${this.description}: ${message}`);
    }
    get description() {
      var _a, _b;
      return (_b = ((_a = this.outerHTML.match(/<[^>]+>/)) !== null && _a !== void 0 ? _a : [])[0]) !== null && _b !== void 0 ? _b : "<turbo-stream>";
    }
    get beforeRenderEvent() {
      return new CustomEvent("turbo:before-stream-render", {
        bubbles: true,
        cancelable: true,
        detail: { newStream: this, render: StreamElement.renderElement }
      });
    }
    get targetElementsById() {
      var _a;
      const element = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.getElementById(this.target);
      if (element !== null) {
        return [element];
      } else {
        return [];
      }
    }
    get targetElementsByQuery() {
      var _a;
      const elements = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll(this.targets);
      if (elements.length !== 0) {
        return Array.prototype.slice.call(elements);
      } else {
        return [];
      }
    }
  };
  var StreamSourceElement = class extends HTMLElement {
    constructor() {
      super(...arguments);
      this.streamSource = null;
    }
    connectedCallback() {
      this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
      connectStreamSource(this.streamSource);
    }
    disconnectedCallback() {
      if (this.streamSource) {
        disconnectStreamSource(this.streamSource);
      }
    }
    get src() {
      return this.getAttribute("src") || "";
    }
  };
  FrameElement.delegateConstructor = FrameController;
  if (customElements.get("turbo-frame") === void 0) {
    customElements.define("turbo-frame", FrameElement);
  }
  if (customElements.get("turbo-stream") === void 0) {
    customElements.define("turbo-stream", StreamElement);
  }
  if (customElements.get("turbo-stream-source") === void 0) {
    customElements.define("turbo-stream-source", StreamSourceElement);
  }
  (() => {
    let element = document.currentScript;
    if (!element)
      return;
    if (element.hasAttribute("data-turbo-suppress-warning"))
      return;
    element = element.parentElement;
    while (element) {
      if (element == document.body) {
        return console.warn(unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `, element.outerHTML);
      }
      element = element.parentElement;
    }
  })();
  window.Turbo = Turbo;
  start();

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
  var consumer;
  async function getConsumer() {
    return consumer || setConsumer(createConsumer2().then(setConsumer));
  }
  function setConsumer(newConsumer) {
    return consumer = newConsumer;
  }
  async function createConsumer2() {
    const { createConsumer: createConsumer3 } = await Promise.resolve().then(() => (init_src(), src_exports));
    return createConsumer3();
  }
  async function subscribeTo(channel, mixin) {
    const { subscriptions } = await getConsumer();
    return subscriptions.create(channel, mixin);
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/snakeize.js
  function walk(obj) {
    if (!obj || typeof obj !== "object")
      return obj;
    if (obj instanceof Date || obj instanceof RegExp)
      return obj;
    if (Array.isArray(obj))
      return obj.map(walk);
    return Object.keys(obj).reduce(function(acc, key) {
      var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m2, x2) {
        return "_" + x2.toLowerCase();
      });
      acc[camel] = walk(obj[key]);
      return acc;
    }, {});
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
  var TurboCableStreamSourceElement = class extends HTMLElement {
    async connectedCallback() {
      connectStreamSource(this);
      this.subscription = await subscribeTo(this.channel, { received: this.dispatchMessageEvent.bind(this) });
    }
    disconnectedCallback() {
      disconnectStreamSource(this);
      if (this.subscription)
        this.subscription.unsubscribe();
    }
    dispatchMessageEvent(data) {
      const event = new MessageEvent("message", { data });
      return this.dispatchEvent(event);
    }
    get channel() {
      const channel = this.getAttribute("channel");
      const signed_stream_name = this.getAttribute("signed-stream-name");
      return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
    }
  };
  if (customElements.get("turbo-cable-stream-source") === void 0) {
    customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/fetch_requests.js
  function encodeMethodIntoRequestBody(event) {
    if (event.target instanceof HTMLFormElement) {
      const { target: form, detail: { fetchOptions } } = event;
      form.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter } } }) => {
        const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams();
        const method = determineFetchMethod(submitter, body, form);
        if (!/get/i.test(method)) {
          if (/post/i.test(method)) {
            body.delete("_method");
          } else {
            body.set("_method", method);
          }
          fetchOptions.method = "post";
        }
      }, { once: true });
    }
  }
  function determineFetchMethod(submitter, body, form) {
    const formMethod = determineFormMethod(submitter);
    const overrideMethod = body.get("_method");
    const method = form.getAttribute("method") || "get";
    if (typeof formMethod == "string") {
      return formMethod;
    } else if (typeof overrideMethod == "string") {
      return overrideMethod;
    } else {
      return method;
    }
  }
  function determineFormMethod(submitter) {
    if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
      if (submitter.hasAttribute("formmethod")) {
        return submitter.formMethod;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  function isBodyInit(body) {
    return body instanceof FormData || body instanceof URLSearchParams;
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/index.js
  addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

  // node_modules/@hotwired/stimulus/dist/stimulus.js
  var EventListener = class {
    constructor(eventTarget, eventName, eventOptions) {
      this.eventTarget = eventTarget;
      this.eventName = eventName;
      this.eventOptions = eventOptions;
      this.unorderedBindings = /* @__PURE__ */ new Set();
    }
    connect() {
      this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
    }
    disconnect() {
      this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
    }
    bindingConnected(binding) {
      this.unorderedBindings.add(binding);
    }
    bindingDisconnected(binding) {
      this.unorderedBindings.delete(binding);
    }
    handleEvent(event) {
      const extendedEvent = extendEvent(event);
      for (const binding of this.bindings) {
        if (extendedEvent.immediatePropagationStopped) {
          break;
        } else {
          binding.handleEvent(extendedEvent);
        }
      }
    }
    hasBindings() {
      return this.unorderedBindings.size > 0;
    }
    get bindings() {
      return Array.from(this.unorderedBindings).sort((left, right) => {
        const leftIndex = left.index, rightIndex = right.index;
        return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
      });
    }
  };
  function extendEvent(event) {
    if ("immediatePropagationStopped" in event) {
      return event;
    } else {
      const { stopImmediatePropagation } = event;
      return Object.assign(event, {
        immediatePropagationStopped: false,
        stopImmediatePropagation() {
          this.immediatePropagationStopped = true;
          stopImmediatePropagation.call(this);
        }
      });
    }
  }
  var Dispatcher = class {
    constructor(application2) {
      this.application = application2;
      this.eventListenerMaps = /* @__PURE__ */ new Map();
      this.started = false;
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.eventListeners.forEach((eventListener) => eventListener.connect());
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.eventListeners.forEach((eventListener) => eventListener.disconnect());
      }
    }
    get eventListeners() {
      return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
    }
    bindingConnected(binding) {
      this.fetchEventListenerForBinding(binding).bindingConnected(binding);
    }
    bindingDisconnected(binding, clearEventListeners = false) {
      this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
      if (clearEventListeners)
        this.clearEventListenersForBinding(binding);
    }
    handleError(error2, message, detail = {}) {
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    clearEventListenersForBinding(binding) {
      const eventListener = this.fetchEventListenerForBinding(binding);
      if (!eventListener.hasBindings()) {
        eventListener.disconnect();
        this.removeMappedEventListenerFor(binding);
      }
    }
    removeMappedEventListenerFor(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      eventListenerMap.delete(cacheKey);
      if (eventListenerMap.size == 0)
        this.eventListenerMaps.delete(eventTarget);
    }
    fetchEventListenerForBinding(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      return this.fetchEventListener(eventTarget, eventName, eventOptions);
    }
    fetchEventListener(eventTarget, eventName, eventOptions) {
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      let eventListener = eventListenerMap.get(cacheKey);
      if (!eventListener) {
        eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
        eventListenerMap.set(cacheKey, eventListener);
      }
      return eventListener;
    }
    createEventListener(eventTarget, eventName, eventOptions) {
      const eventListener = new EventListener(eventTarget, eventName, eventOptions);
      if (this.started) {
        eventListener.connect();
      }
      return eventListener;
    }
    fetchEventListenerMapForEventTarget(eventTarget) {
      let eventListenerMap = this.eventListenerMaps.get(eventTarget);
      if (!eventListenerMap) {
        eventListenerMap = /* @__PURE__ */ new Map();
        this.eventListenerMaps.set(eventTarget, eventListenerMap);
      }
      return eventListenerMap;
    }
    cacheKey(eventName, eventOptions) {
      const parts = [eventName];
      Object.keys(eventOptions).sort().forEach((key) => {
        parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
      });
      return parts.join(":");
    }
  };
  var defaultActionDescriptorFilters = {
    stop({ event, value }) {
      if (value)
        event.stopPropagation();
      return true;
    },
    prevent({ event, value }) {
      if (value)
        event.preventDefault();
      return true;
    },
    self({ event, value, element }) {
      if (value) {
        return element === event.target;
      } else {
        return true;
      }
    }
  };
  var descriptorPattern = /^(?:(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
  function parseActionDescriptorString(descriptorString) {
    const source = descriptorString.trim();
    const matches = source.match(descriptorPattern) || [];
    let eventName = matches[1];
    let keyFilter = matches[2];
    if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
      eventName += `.${keyFilter}`;
      keyFilter = "";
    }
    return {
      eventTarget: parseEventTarget(matches[3]),
      eventName,
      eventOptions: matches[6] ? parseEventOptions(matches[6]) : {},
      identifier: matches[4],
      methodName: matches[5],
      keyFilter
    };
  }
  function parseEventTarget(eventTargetName) {
    if (eventTargetName == "window") {
      return window;
    } else if (eventTargetName == "document") {
      return document;
    }
  }
  function parseEventOptions(eventOptions) {
    return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
  }
  function stringifyEventTarget(eventTarget) {
    if (eventTarget == window) {
      return "window";
    } else if (eventTarget == document) {
      return "document";
    }
  }
  function camelize(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_2, char) => char.toUpperCase());
  }
  function namespaceCamelize(value) {
    return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
  }
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function dasherize(value) {
    return value.replace(/([A-Z])/g, (_2, char) => `-${char.toLowerCase()}`);
  }
  function tokenize(value) {
    return value.match(/[^\s]+/g) || [];
  }
  var Action = class {
    constructor(element, index, descriptor, schema) {
      this.element = element;
      this.index = index;
      this.eventTarget = descriptor.eventTarget || element;
      this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
      this.eventOptions = descriptor.eventOptions || {};
      this.identifier = descriptor.identifier || error("missing identifier");
      this.methodName = descriptor.methodName || error("missing method name");
      this.keyFilter = descriptor.keyFilter || "";
      this.schema = schema;
    }
    static forToken(token, schema) {
      return new this(token.element, token.index, parseActionDescriptorString(token.content), schema);
    }
    toString() {
      const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
      const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
      return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
    }
    isFilterTarget(event) {
      if (!this.keyFilter) {
        return false;
      }
      const filteres = this.keyFilter.split("+");
      const modifiers = ["meta", "ctrl", "alt", "shift"];
      const [meta, ctrl, alt, shift] = modifiers.map((modifier) => filteres.includes(modifier));
      if (event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift) {
        return true;
      }
      const standardFilter = filteres.filter((key) => !modifiers.includes(key))[0];
      if (!standardFilter) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(this.keyMappings, standardFilter)) {
        error(`contains unknown key filter: ${this.keyFilter}`);
      }
      return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
    }
    get params() {
      const params = {};
      const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
      for (const { name, value } of Array.from(this.element.attributes)) {
        const match = name.match(pattern);
        const key = match && match[1];
        if (key) {
          params[camelize(key)] = typecast(value);
        }
      }
      return params;
    }
    get eventTargetName() {
      return stringifyEventTarget(this.eventTarget);
    }
    get keyMappings() {
      return this.schema.keyMappings;
    }
  };
  var defaultEventNames = {
    a: () => "click",
    button: () => "click",
    form: () => "submit",
    details: () => "toggle",
    input: (e2) => e2.getAttribute("type") == "submit" ? "click" : "input",
    select: () => "change",
    textarea: () => "input"
  };
  function getDefaultEventNameForElement(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName in defaultEventNames) {
      return defaultEventNames[tagName](element);
    }
  }
  function error(message) {
    throw new Error(message);
  }
  function typecast(value) {
    try {
      return JSON.parse(value);
    } catch (o_O) {
      return value;
    }
  }
  var Binding = class {
    constructor(context, action) {
      this.context = context;
      this.action = action;
    }
    get index() {
      return this.action.index;
    }
    get eventTarget() {
      return this.action.eventTarget;
    }
    get eventOptions() {
      return this.action.eventOptions;
    }
    get identifier() {
      return this.context.identifier;
    }
    handleEvent(event) {
      if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(event)) {
        this.invokeWithEvent(event);
      }
    }
    get eventName() {
      return this.action.eventName;
    }
    get method() {
      const method = this.controller[this.methodName];
      if (typeof method == "function") {
        return method;
      }
      throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
    }
    applyEventModifiers(event) {
      const { element } = this.action;
      const { actionDescriptorFilters } = this.context.application;
      let passes = true;
      for (const [name, value] of Object.entries(this.eventOptions)) {
        if (name in actionDescriptorFilters) {
          const filter = actionDescriptorFilters[name];
          passes = passes && filter({ name, value, event, element });
        } else {
          continue;
        }
      }
      return passes;
    }
    invokeWithEvent(event) {
      const { target, currentTarget } = event;
      try {
        const { params } = this.action;
        const actionEvent = Object.assign(event, { params });
        this.method.call(this.controller, actionEvent);
        this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
      } catch (error2) {
        const { identifier, controller, element, index } = this;
        const detail = { identifier, controller, element, index, event };
        this.context.handleError(error2, `invoking action "${this.action}"`, detail);
      }
    }
    willBeInvokedByEvent(event) {
      const eventTarget = event.target;
      if (event instanceof KeyboardEvent && this.action.isFilterTarget(event)) {
        return false;
      }
      if (this.element === eventTarget) {
        return true;
      } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
        return this.scope.containsElement(eventTarget);
      } else {
        return this.scope.containsElement(this.action.element);
      }
    }
    get controller() {
      return this.context.controller;
    }
    get methodName() {
      return this.action.methodName;
    }
    get element() {
      return this.scope.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  var ElementObserver = class {
    constructor(element, delegate) {
      this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
      this.element = element;
      this.started = false;
      this.delegate = delegate;
      this.elements = /* @__PURE__ */ new Set();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.refresh();
      }
    }
    pause(callback) {
      if (this.started) {
        this.mutationObserver.disconnect();
        this.started = false;
      }
      callback();
      if (!this.started) {
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        const matches = new Set(this.matchElementsInTree());
        for (const element of Array.from(this.elements)) {
          if (!matches.has(element)) {
            this.removeElement(element);
          }
        }
        for (const element of Array.from(matches)) {
          this.addElement(element);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      if (mutation.type == "attributes") {
        this.processAttributeChange(mutation.target, mutation.attributeName);
      } else if (mutation.type == "childList") {
        this.processRemovedNodes(mutation.removedNodes);
        this.processAddedNodes(mutation.addedNodes);
      }
    }
    processAttributeChange(node, attributeName) {
      const element = node;
      if (this.elements.has(element)) {
        if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
          this.delegate.elementAttributeChanged(element, attributeName);
        } else {
          this.removeElement(element);
        }
      } else if (this.matchElement(element)) {
        this.addElement(element);
      }
    }
    processRemovedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element) {
          this.processTree(element, this.removeElement);
        }
      }
    }
    processAddedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element && this.elementIsActive(element)) {
          this.processTree(element, this.addElement);
        }
      }
    }
    matchElement(element) {
      return this.delegate.matchElement(element);
    }
    matchElementsInTree(tree = this.element) {
      return this.delegate.matchElementsInTree(tree);
    }
    processTree(tree, processor) {
      for (const element of this.matchElementsInTree(tree)) {
        processor.call(this, element);
      }
    }
    elementFromNode(node) {
      if (node.nodeType == Node.ELEMENT_NODE) {
        return node;
      }
    }
    elementIsActive(element) {
      if (element.isConnected != this.element.isConnected) {
        return false;
      } else {
        return this.element.contains(element);
      }
    }
    addElement(element) {
      if (!this.elements.has(element)) {
        if (this.elementIsActive(element)) {
          this.elements.add(element);
          if (this.delegate.elementMatched) {
            this.delegate.elementMatched(element);
          }
        }
      }
    }
    removeElement(element) {
      if (this.elements.has(element)) {
        this.elements.delete(element);
        if (this.delegate.elementUnmatched) {
          this.delegate.elementUnmatched(element);
        }
      }
    }
  };
  var AttributeObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeName = attributeName;
      this.delegate = delegate;
      this.elementObserver = new ElementObserver(element, this);
    }
    get element() {
      return this.elementObserver.element;
    }
    get selector() {
      return `[${this.attributeName}]`;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get started() {
      return this.elementObserver.started;
    }
    matchElement(element) {
      return element.hasAttribute(this.attributeName);
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector));
      return match.concat(matches);
    }
    elementMatched(element) {
      if (this.delegate.elementMatchedAttribute) {
        this.delegate.elementMatchedAttribute(element, this.attributeName);
      }
    }
    elementUnmatched(element) {
      if (this.delegate.elementUnmatchedAttribute) {
        this.delegate.elementUnmatchedAttribute(element, this.attributeName);
      }
    }
    elementAttributeChanged(element, attributeName) {
      if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
        this.delegate.elementAttributeValueChanged(element, attributeName);
      }
    }
  };
  function add(map, key, value) {
    fetch2(map, key).add(value);
  }
  function del(map, key, value) {
    fetch2(map, key).delete(value);
    prune(map, key);
  }
  function fetch2(map, key) {
    let values = map.get(key);
    if (!values) {
      values = /* @__PURE__ */ new Set();
      map.set(key, values);
    }
    return values;
  }
  function prune(map, key) {
    const values = map.get(key);
    if (values != null && values.size == 0) {
      map.delete(key);
    }
  }
  var Multimap = class {
    constructor() {
      this.valuesByKey = /* @__PURE__ */ new Map();
    }
    get keys() {
      return Array.from(this.valuesByKey.keys());
    }
    get values() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((values, set) => values.concat(Array.from(set)), []);
    }
    get size() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((size, set) => size + set.size, 0);
    }
    add(key, value) {
      add(this.valuesByKey, key, value);
    }
    delete(key, value) {
      del(this.valuesByKey, key, value);
    }
    has(key, value) {
      const values = this.valuesByKey.get(key);
      return values != null && values.has(value);
    }
    hasKey(key) {
      return this.valuesByKey.has(key);
    }
    hasValue(value) {
      const sets = Array.from(this.valuesByKey.values());
      return sets.some((set) => set.has(value));
    }
    getValuesForKey(key) {
      const values = this.valuesByKey.get(key);
      return values ? Array.from(values) : [];
    }
    getKeysForValue(value) {
      return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key, _values]) => key);
    }
  };
  var SelectorObserver = class {
    constructor(element, selector, delegate, details = {}) {
      this.selector = selector;
      this.details = details;
      this.elementObserver = new ElementObserver(element, this);
      this.delegate = delegate;
      this.matchesByElement = new Multimap();
    }
    get started() {
      return this.elementObserver.started;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get element() {
      return this.elementObserver.element;
    }
    matchElement(element) {
      const matches = element.matches(this.selector);
      if (this.delegate.selectorMatchElement) {
        return matches && this.delegate.selectorMatchElement(element, this.details);
      }
      return matches;
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector)).filter((match2) => this.matchElement(match2));
      return match.concat(matches);
    }
    elementMatched(element) {
      this.selectorMatched(element);
    }
    elementUnmatched(element) {
      this.selectorUnmatched(element);
    }
    elementAttributeChanged(element, _attributeName) {
      const matches = this.matchElement(element);
      const matchedBefore = this.matchesByElement.has(this.selector, element);
      if (!matches && matchedBefore) {
        this.selectorUnmatched(element);
      }
    }
    selectorMatched(element) {
      if (this.delegate.selectorMatched) {
        this.delegate.selectorMatched(element, this.selector, this.details);
        this.matchesByElement.add(this.selector, element);
      }
    }
    selectorUnmatched(element) {
      this.delegate.selectorUnmatched(element, this.selector, this.details);
      this.matchesByElement.delete(this.selector, element);
    }
  };
  var StringMapObserver = class {
    constructor(element, delegate) {
      this.element = element;
      this.delegate = delegate;
      this.started = false;
      this.stringMap = /* @__PURE__ */ new Map();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
        this.refresh();
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        for (const attributeName of this.knownAttributeNames) {
          this.refreshAttribute(attributeName, null);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      const attributeName = mutation.attributeName;
      if (attributeName) {
        this.refreshAttribute(attributeName, mutation.oldValue);
      }
    }
    refreshAttribute(attributeName, oldValue) {
      const key = this.delegate.getStringMapKeyForAttribute(attributeName);
      if (key != null) {
        if (!this.stringMap.has(attributeName)) {
          this.stringMapKeyAdded(key, attributeName);
        }
        const value = this.element.getAttribute(attributeName);
        if (this.stringMap.get(attributeName) != value) {
          this.stringMapValueChanged(value, key, oldValue);
        }
        if (value == null) {
          const oldValue2 = this.stringMap.get(attributeName);
          this.stringMap.delete(attributeName);
          if (oldValue2)
            this.stringMapKeyRemoved(key, attributeName, oldValue2);
        } else {
          this.stringMap.set(attributeName, value);
        }
      }
    }
    stringMapKeyAdded(key, attributeName) {
      if (this.delegate.stringMapKeyAdded) {
        this.delegate.stringMapKeyAdded(key, attributeName);
      }
    }
    stringMapValueChanged(value, key, oldValue) {
      if (this.delegate.stringMapValueChanged) {
        this.delegate.stringMapValueChanged(value, key, oldValue);
      }
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      if (this.delegate.stringMapKeyRemoved) {
        this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
      }
    }
    get knownAttributeNames() {
      return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
    }
    get currentAttributeNames() {
      return Array.from(this.element.attributes).map((attribute) => attribute.name);
    }
    get recordedAttributeNames() {
      return Array.from(this.stringMap.keys());
    }
  };
  var TokenListObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeObserver = new AttributeObserver(element, attributeName, this);
      this.delegate = delegate;
      this.tokensByElement = new Multimap();
    }
    get started() {
      return this.attributeObserver.started;
    }
    start() {
      this.attributeObserver.start();
    }
    pause(callback) {
      this.attributeObserver.pause(callback);
    }
    stop() {
      this.attributeObserver.stop();
    }
    refresh() {
      this.attributeObserver.refresh();
    }
    get element() {
      return this.attributeObserver.element;
    }
    get attributeName() {
      return this.attributeObserver.attributeName;
    }
    elementMatchedAttribute(element) {
      this.tokensMatched(this.readTokensForElement(element));
    }
    elementAttributeValueChanged(element) {
      const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
      this.tokensUnmatched(unmatchedTokens);
      this.tokensMatched(matchedTokens);
    }
    elementUnmatchedAttribute(element) {
      this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
    }
    tokensMatched(tokens) {
      tokens.forEach((token) => this.tokenMatched(token));
    }
    tokensUnmatched(tokens) {
      tokens.forEach((token) => this.tokenUnmatched(token));
    }
    tokenMatched(token) {
      this.delegate.tokenMatched(token);
      this.tokensByElement.add(token.element, token);
    }
    tokenUnmatched(token) {
      this.delegate.tokenUnmatched(token);
      this.tokensByElement.delete(token.element, token);
    }
    refreshTokensForElement(element) {
      const previousTokens = this.tokensByElement.getValuesForKey(element);
      const currentTokens = this.readTokensForElement(element);
      const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
      if (firstDifferingIndex == -1) {
        return [[], []];
      } else {
        return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
      }
    }
    readTokensForElement(element) {
      const attributeName = this.attributeName;
      const tokenString = element.getAttribute(attributeName) || "";
      return parseTokenString(tokenString, element, attributeName);
    }
  };
  function parseTokenString(tokenString, element, attributeName) {
    return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
  }
  function zip(left, right) {
    const length = Math.max(left.length, right.length);
    return Array.from({ length }, (_2, index) => [left[index], right[index]]);
  }
  function tokensAreEqual(left, right) {
    return left && right && left.index == right.index && left.content == right.content;
  }
  var ValueListObserver = class {
    constructor(element, attributeName, delegate) {
      this.tokenListObserver = new TokenListObserver(element, attributeName, this);
      this.delegate = delegate;
      this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
      this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
    }
    get started() {
      return this.tokenListObserver.started;
    }
    start() {
      this.tokenListObserver.start();
    }
    stop() {
      this.tokenListObserver.stop();
    }
    refresh() {
      this.tokenListObserver.refresh();
    }
    get element() {
      return this.tokenListObserver.element;
    }
    get attributeName() {
      return this.tokenListObserver.attributeName;
    }
    tokenMatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).set(token, value);
        this.delegate.elementMatchedValue(element, value);
      }
    }
    tokenUnmatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).delete(token);
        this.delegate.elementUnmatchedValue(element, value);
      }
    }
    fetchParseResultForToken(token) {
      let parseResult = this.parseResultsByToken.get(token);
      if (!parseResult) {
        parseResult = this.parseToken(token);
        this.parseResultsByToken.set(token, parseResult);
      }
      return parseResult;
    }
    fetchValuesByTokenForElement(element) {
      let valuesByToken = this.valuesByTokenByElement.get(element);
      if (!valuesByToken) {
        valuesByToken = /* @__PURE__ */ new Map();
        this.valuesByTokenByElement.set(element, valuesByToken);
      }
      return valuesByToken;
    }
    parseToken(token) {
      try {
        const value = this.delegate.parseValueForToken(token);
        return { value };
      } catch (error2) {
        return { error: error2 };
      }
    }
  };
  var BindingObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.bindingsByAction = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.valueListObserver) {
        this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
        this.valueListObserver.start();
      }
    }
    stop() {
      if (this.valueListObserver) {
        this.valueListObserver.stop();
        delete this.valueListObserver;
        this.disconnectAllActions();
      }
    }
    get element() {
      return this.context.element;
    }
    get identifier() {
      return this.context.identifier;
    }
    get actionAttribute() {
      return this.schema.actionAttribute;
    }
    get schema() {
      return this.context.schema;
    }
    get bindings() {
      return Array.from(this.bindingsByAction.values());
    }
    connectAction(action) {
      const binding = new Binding(this.context, action);
      this.bindingsByAction.set(action, binding);
      this.delegate.bindingConnected(binding);
    }
    disconnectAction(action) {
      const binding = this.bindingsByAction.get(action);
      if (binding) {
        this.bindingsByAction.delete(action);
        this.delegate.bindingDisconnected(binding);
      }
    }
    disconnectAllActions() {
      this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
      this.bindingsByAction.clear();
    }
    parseValueForToken(token) {
      const action = Action.forToken(token, this.schema);
      if (action.identifier == this.identifier) {
        return action;
      }
    }
    elementMatchedValue(element, action) {
      this.connectAction(action);
    }
    elementUnmatchedValue(element, action) {
      this.disconnectAction(action);
    }
  };
  var ValueObserver = class {
    constructor(context, receiver) {
      this.context = context;
      this.receiver = receiver;
      this.stringMapObserver = new StringMapObserver(this.element, this);
      this.valueDescriptorMap = this.controller.valueDescriptorMap;
    }
    start() {
      this.stringMapObserver.start();
      this.invokeChangedCallbacksForDefaultValues();
    }
    stop() {
      this.stringMapObserver.stop();
    }
    get element() {
      return this.context.element;
    }
    get controller() {
      return this.context.controller;
    }
    getStringMapKeyForAttribute(attributeName) {
      if (attributeName in this.valueDescriptorMap) {
        return this.valueDescriptorMap[attributeName].name;
      }
    }
    stringMapKeyAdded(key, attributeName) {
      const descriptor = this.valueDescriptorMap[attributeName];
      if (!this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
      }
    }
    stringMapValueChanged(value, name, oldValue) {
      const descriptor = this.valueDescriptorNameMap[name];
      if (value === null)
        return;
      if (oldValue === null) {
        oldValue = descriptor.writer(descriptor.defaultValue);
      }
      this.invokeChangedCallback(name, value, oldValue);
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      const descriptor = this.valueDescriptorNameMap[key];
      if (this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
      } else {
        this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
      }
    }
    invokeChangedCallbacksForDefaultValues() {
      for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
        if (defaultValue != void 0 && !this.controller.data.has(key)) {
          this.invokeChangedCallback(name, writer(defaultValue), void 0);
        }
      }
    }
    invokeChangedCallback(name, rawValue, rawOldValue) {
      const changedMethodName = `${name}Changed`;
      const changedMethod = this.receiver[changedMethodName];
      if (typeof changedMethod == "function") {
        const descriptor = this.valueDescriptorNameMap[name];
        try {
          const value = descriptor.reader(rawValue);
          let oldValue = rawOldValue;
          if (rawOldValue) {
            oldValue = descriptor.reader(rawOldValue);
          }
          changedMethod.call(this.receiver, value, oldValue);
        } catch (error2) {
          if (error2 instanceof TypeError) {
            error2.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error2.message}`;
          }
          throw error2;
        }
      }
    }
    get valueDescriptors() {
      const { valueDescriptorMap } = this;
      return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
    }
    get valueDescriptorNameMap() {
      const descriptors = {};
      Object.keys(this.valueDescriptorMap).forEach((key) => {
        const descriptor = this.valueDescriptorMap[key];
        descriptors[descriptor.name] = descriptor;
      });
      return descriptors;
    }
    hasValue(attributeName) {
      const descriptor = this.valueDescriptorNameMap[attributeName];
      const hasMethodName = `has${capitalize(descriptor.name)}`;
      return this.receiver[hasMethodName];
    }
  };
  var TargetObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.targetsByName = new Multimap();
    }
    start() {
      if (!this.tokenListObserver) {
        this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
        this.tokenListObserver.start();
      }
    }
    stop() {
      if (this.tokenListObserver) {
        this.disconnectAllTargets();
        this.tokenListObserver.stop();
        delete this.tokenListObserver;
      }
    }
    tokenMatched({ element, content: name }) {
      if (this.scope.containsElement(element)) {
        this.connectTarget(element, name);
      }
    }
    tokenUnmatched({ element, content: name }) {
      this.disconnectTarget(element, name);
    }
    connectTarget(element, name) {
      var _a;
      if (!this.targetsByName.has(name, element)) {
        this.targetsByName.add(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
      }
    }
    disconnectTarget(element, name) {
      var _a;
      if (this.targetsByName.has(name, element)) {
        this.targetsByName.delete(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
      }
    }
    disconnectAllTargets() {
      for (const name of this.targetsByName.keys) {
        for (const element of this.targetsByName.getValuesForKey(name)) {
          this.disconnectTarget(element, name);
        }
      }
    }
    get attributeName() {
      return `data-${this.context.identifier}-target`;
    }
    get element() {
      return this.context.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  function readInheritableStaticArrayValues(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return Array.from(ancestors.reduce((values, constructor2) => {
      getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
      return values;
    }, /* @__PURE__ */ new Set()));
  }
  function readInheritableStaticObjectPairs(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return ancestors.reduce((pairs, constructor2) => {
      pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
      return pairs;
    }, []);
  }
  function getAncestorsForConstructor(constructor) {
    const ancestors = [];
    while (constructor) {
      ancestors.push(constructor);
      constructor = Object.getPrototypeOf(constructor);
    }
    return ancestors.reverse();
  }
  function getOwnStaticArrayValues(constructor, propertyName) {
    const definition = constructor[propertyName];
    return Array.isArray(definition) ? definition : [];
  }
  function getOwnStaticObjectPairs(constructor, propertyName) {
    const definition = constructor[propertyName];
    return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
  }
  var OutletObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.outletsByName = new Multimap();
      this.outletElementsByName = new Multimap();
      this.selectorObserverMap = /* @__PURE__ */ new Map();
    }
    start() {
      if (this.selectorObserverMap.size === 0) {
        this.outletDefinitions.forEach((outletName) => {
          const selector = this.selector(outletName);
          const details = { outletName };
          if (selector) {
            this.selectorObserverMap.set(outletName, new SelectorObserver(document.body, selector, this, details));
          }
        });
        this.selectorObserverMap.forEach((observer) => observer.start());
      }
      this.dependentContexts.forEach((context) => context.refresh());
    }
    stop() {
      if (this.selectorObserverMap.size > 0) {
        this.disconnectAllOutlets();
        this.selectorObserverMap.forEach((observer) => observer.stop());
        this.selectorObserverMap.clear();
      }
    }
    refresh() {
      this.selectorObserverMap.forEach((observer) => observer.refresh());
    }
    selectorMatched(element, _selector, { outletName }) {
      const outlet = this.getOutlet(element, outletName);
      if (outlet) {
        this.connectOutlet(outlet, element, outletName);
      }
    }
    selectorUnmatched(element, _selector, { outletName }) {
      const outlet = this.getOutletFromMap(element, outletName);
      if (outlet) {
        this.disconnectOutlet(outlet, element, outletName);
      }
    }
    selectorMatchElement(element, { outletName }) {
      return this.hasOutlet(element, outletName) && element.matches(`[${this.context.application.schema.controllerAttribute}~=${outletName}]`);
    }
    connectOutlet(outlet, element, outletName) {
      var _a;
      if (!this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.add(outletName, outlet);
        this.outletElementsByName.add(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
      }
    }
    disconnectOutlet(outlet, element, outletName) {
      var _a;
      if (this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.delete(outletName, outlet);
        this.outletElementsByName.delete(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
      }
    }
    disconnectAllOutlets() {
      for (const outletName of this.outletElementsByName.keys) {
        for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
          for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
            this.disconnectOutlet(outlet, element, outletName);
          }
        }
      }
    }
    selector(outletName) {
      return this.scope.outlets.getSelectorForOutletName(outletName);
    }
    get outletDependencies() {
      const dependencies = new Multimap();
      this.router.modules.forEach((module) => {
        const constructor = module.definition.controllerConstructor;
        const outlets = readInheritableStaticArrayValues(constructor, "outlets");
        outlets.forEach((outlet) => dependencies.add(outlet, module.identifier));
      });
      return dependencies;
    }
    get outletDefinitions() {
      return this.outletDependencies.getKeysForValue(this.identifier);
    }
    get dependentControllerIdentifiers() {
      return this.outletDependencies.getValuesForKey(this.identifier);
    }
    get dependentContexts() {
      const identifiers = this.dependentControllerIdentifiers;
      return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
    }
    hasOutlet(element, outletName) {
      return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
    }
    getOutlet(element, outletName) {
      return this.application.getControllerForElementAndIdentifier(element, outletName);
    }
    getOutletFromMap(element, outletName) {
      return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
    }
    get scope() {
      return this.context.scope;
    }
    get identifier() {
      return this.context.identifier;
    }
    get application() {
      return this.context.application;
    }
    get router() {
      return this.application.router;
    }
  };
  var Context = class {
    constructor(module, scope) {
      this.logDebugActivity = (functionName, detail = {}) => {
        const { identifier, controller, element } = this;
        detail = Object.assign({ identifier, controller, element }, detail);
        this.application.logDebugActivity(this.identifier, functionName, detail);
      };
      this.module = module;
      this.scope = scope;
      this.controller = new module.controllerConstructor(this);
      this.bindingObserver = new BindingObserver(this, this.dispatcher);
      this.valueObserver = new ValueObserver(this, this.controller);
      this.targetObserver = new TargetObserver(this, this);
      this.outletObserver = new OutletObserver(this, this);
      try {
        this.controller.initialize();
        this.logDebugActivity("initialize");
      } catch (error2) {
        this.handleError(error2, "initializing controller");
      }
    }
    connect() {
      this.bindingObserver.start();
      this.valueObserver.start();
      this.targetObserver.start();
      this.outletObserver.start();
      try {
        this.controller.connect();
        this.logDebugActivity("connect");
      } catch (error2) {
        this.handleError(error2, "connecting controller");
      }
    }
    refresh() {
      this.outletObserver.refresh();
    }
    disconnect() {
      try {
        this.controller.disconnect();
        this.logDebugActivity("disconnect");
      } catch (error2) {
        this.handleError(error2, "disconnecting controller");
      }
      this.outletObserver.stop();
      this.targetObserver.stop();
      this.valueObserver.stop();
      this.bindingObserver.stop();
    }
    get application() {
      return this.module.application;
    }
    get identifier() {
      return this.module.identifier;
    }
    get schema() {
      return this.application.schema;
    }
    get dispatcher() {
      return this.application.dispatcher;
    }
    get element() {
      return this.scope.element;
    }
    get parentElement() {
      return this.element.parentElement;
    }
    handleError(error2, message, detail = {}) {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    targetConnected(element, name) {
      this.invokeControllerMethod(`${name}TargetConnected`, element);
    }
    targetDisconnected(element, name) {
      this.invokeControllerMethod(`${name}TargetDisconnected`, element);
    }
    outletConnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletConnected`, outlet, element);
    }
    outletDisconnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletDisconnected`, outlet, element);
    }
    invokeControllerMethod(methodName, ...args) {
      const controller = this.controller;
      if (typeof controller[methodName] == "function") {
        controller[methodName](...args);
      }
    }
  };
  function bless(constructor) {
    return shadow(constructor, getBlessedProperties(constructor));
  }
  function shadow(constructor, properties) {
    const shadowConstructor = extend2(constructor);
    const shadowProperties = getShadowProperties(constructor.prototype, properties);
    Object.defineProperties(shadowConstructor.prototype, shadowProperties);
    return shadowConstructor;
  }
  function getBlessedProperties(constructor) {
    const blessings = readInheritableStaticArrayValues(constructor, "blessings");
    return blessings.reduce((blessedProperties, blessing) => {
      const properties = blessing(constructor);
      for (const key in properties) {
        const descriptor = blessedProperties[key] || {};
        blessedProperties[key] = Object.assign(descriptor, properties[key]);
      }
      return blessedProperties;
    }, {});
  }
  function getShadowProperties(prototype, properties) {
    return getOwnKeys(properties).reduce((shadowProperties, key) => {
      const descriptor = getShadowedDescriptor(prototype, properties, key);
      if (descriptor) {
        Object.assign(shadowProperties, { [key]: descriptor });
      }
      return shadowProperties;
    }, {});
  }
  function getShadowedDescriptor(prototype, properties, key) {
    const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
    const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
    if (!shadowedByValue) {
      const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
      if (shadowingDescriptor) {
        descriptor.get = shadowingDescriptor.get || descriptor.get;
        descriptor.set = shadowingDescriptor.set || descriptor.set;
      }
      return descriptor;
    }
  }
  var getOwnKeys = (() => {
    if (typeof Object.getOwnPropertySymbols == "function") {
      return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
    } else {
      return Object.getOwnPropertyNames;
    }
  })();
  var extend2 = (() => {
    function extendWithReflect(constructor) {
      function extended() {
        return Reflect.construct(constructor, arguments, new.target);
      }
      extended.prototype = Object.create(constructor.prototype, {
        constructor: { value: extended }
      });
      Reflect.setPrototypeOf(extended, constructor);
      return extended;
    }
    function testReflectExtension() {
      const a2 = function() {
        this.a.call(this);
      };
      const b2 = extendWithReflect(a2);
      b2.prototype.a = function() {
      };
      return new b2();
    }
    try {
      testReflectExtension();
      return extendWithReflect;
    } catch (error2) {
      return (constructor) => class extended extends constructor {
      };
    }
  })();
  function blessDefinition(definition) {
    return {
      identifier: definition.identifier,
      controllerConstructor: bless(definition.controllerConstructor)
    };
  }
  var Module = class {
    constructor(application2, definition) {
      this.application = application2;
      this.definition = blessDefinition(definition);
      this.contextsByScope = /* @__PURE__ */ new WeakMap();
      this.connectedContexts = /* @__PURE__ */ new Set();
    }
    get identifier() {
      return this.definition.identifier;
    }
    get controllerConstructor() {
      return this.definition.controllerConstructor;
    }
    get contexts() {
      return Array.from(this.connectedContexts);
    }
    connectContextForScope(scope) {
      const context = this.fetchContextForScope(scope);
      this.connectedContexts.add(context);
      context.connect();
    }
    disconnectContextForScope(scope) {
      const context = this.contextsByScope.get(scope);
      if (context) {
        this.connectedContexts.delete(context);
        context.disconnect();
      }
    }
    fetchContextForScope(scope) {
      let context = this.contextsByScope.get(scope);
      if (!context) {
        context = new Context(this, scope);
        this.contextsByScope.set(scope, context);
      }
      return context;
    }
  };
  var ClassMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    has(name) {
      return this.data.has(this.getDataKey(name));
    }
    get(name) {
      return this.getAll(name)[0];
    }
    getAll(name) {
      const tokenString = this.data.get(this.getDataKey(name)) || "";
      return tokenize(tokenString);
    }
    getAttributeName(name) {
      return this.data.getAttributeNameForKey(this.getDataKey(name));
    }
    getDataKey(name) {
      return `${name}-class`;
    }
    get data() {
      return this.scope.data;
    }
  };
  var DataMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.getAttribute(name);
    }
    set(key, value) {
      const name = this.getAttributeNameForKey(key);
      this.element.setAttribute(name, value);
      return this.get(key);
    }
    has(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.hasAttribute(name);
    }
    delete(key) {
      if (this.has(key)) {
        const name = this.getAttributeNameForKey(key);
        this.element.removeAttribute(name);
        return true;
      } else {
        return false;
      }
    }
    getAttributeNameForKey(key) {
      return `data-${this.identifier}-${dasherize(key)}`;
    }
  };
  var Guide = class {
    constructor(logger) {
      this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
      this.logger = logger;
    }
    warn(object, key, message) {
      let warnedKeys = this.warnedKeysByObject.get(object);
      if (!warnedKeys) {
        warnedKeys = /* @__PURE__ */ new Set();
        this.warnedKeysByObject.set(object, warnedKeys);
      }
      if (!warnedKeys.has(key)) {
        warnedKeys.add(key);
        this.logger.warn(message, object);
      }
    }
  };
  function attributeValueContainsToken(attributeName, token) {
    return `[${attributeName}~="${token}"]`;
  }
  var TargetSet = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(targetName) {
      return this.find(targetName) != null;
    }
    find(...targetNames) {
      return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
    }
    findAll(...targetNames) {
      return targetNames.reduce((targets, targetName) => [
        ...targets,
        ...this.findAllTargets(targetName),
        ...this.findAllLegacyTargets(targetName)
      ], []);
    }
    findTarget(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findElement(selector);
    }
    findAllTargets(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findAllElements(selector);
    }
    getSelectorForTargetName(targetName) {
      const attributeName = this.schema.targetAttributeForScope(this.identifier);
      return attributeValueContainsToken(attributeName, targetName);
    }
    findLegacyTarget(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.deprecate(this.scope.findElement(selector), targetName);
    }
    findAllLegacyTargets(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
    }
    getLegacySelectorForTargetName(targetName) {
      const targetDescriptor = `${this.identifier}.${targetName}`;
      return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
    }
    deprecate(element, targetName) {
      if (element) {
        const { identifier } = this;
        const attributeName = this.schema.targetAttribute;
        const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
        this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
      }
      return element;
    }
    get guide() {
      return this.scope.guide;
    }
  };
  var OutletSet = class {
    constructor(scope, controllerElement) {
      this.scope = scope;
      this.controllerElement = controllerElement;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(outletName) {
      return this.find(outletName) != null;
    }
    find(...outletNames) {
      return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), void 0);
    }
    findAll(...outletNames) {
      return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
    }
    getSelectorForOutletName(outletName) {
      const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
      return this.controllerElement.getAttribute(attributeName);
    }
    findOutlet(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      if (selector)
        return this.findElement(selector, outletName);
    }
    findAllOutlets(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      return selector ? this.findAllElements(selector, outletName) : [];
    }
    findElement(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
    }
    findAllElements(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName));
    }
    matchesElement(element, selector, outletName) {
      const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
      return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
    }
  };
  var Scope = class {
    constructor(schema, element, identifier, logger) {
      this.targets = new TargetSet(this);
      this.classes = new ClassMap(this);
      this.data = new DataMap(this);
      this.containsElement = (element2) => {
        return element2.closest(this.controllerSelector) === this.element;
      };
      this.schema = schema;
      this.element = element;
      this.identifier = identifier;
      this.guide = new Guide(logger);
      this.outlets = new OutletSet(this.documentScope, element);
    }
    findElement(selector) {
      return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
    }
    findAllElements(selector) {
      return [
        ...this.element.matches(selector) ? [this.element] : [],
        ...this.queryElements(selector).filter(this.containsElement)
      ];
    }
    queryElements(selector) {
      return Array.from(this.element.querySelectorAll(selector));
    }
    get controllerSelector() {
      return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
    }
    get isDocumentScope() {
      return this.element === document.documentElement;
    }
    get documentScope() {
      return this.isDocumentScope ? this : new Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
    }
  };
  var ScopeObserver = class {
    constructor(element, schema, delegate) {
      this.element = element;
      this.schema = schema;
      this.delegate = delegate;
      this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
      this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
      this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
    }
    start() {
      this.valueListObserver.start();
    }
    stop() {
      this.valueListObserver.stop();
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    parseValueForToken(token) {
      const { element, content: identifier } = token;
      const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
      let scope = scopesByIdentifier.get(identifier);
      if (!scope) {
        scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
        scopesByIdentifier.set(identifier, scope);
      }
      return scope;
    }
    elementMatchedValue(element, value) {
      const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
      this.scopeReferenceCounts.set(value, referenceCount);
      if (referenceCount == 1) {
        this.delegate.scopeConnected(value);
      }
    }
    elementUnmatchedValue(element, value) {
      const referenceCount = this.scopeReferenceCounts.get(value);
      if (referenceCount) {
        this.scopeReferenceCounts.set(value, referenceCount - 1);
        if (referenceCount == 1) {
          this.delegate.scopeDisconnected(value);
        }
      }
    }
    fetchScopesByIdentifierForElement(element) {
      let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
      if (!scopesByIdentifier) {
        scopesByIdentifier = /* @__PURE__ */ new Map();
        this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
      }
      return scopesByIdentifier;
    }
  };
  var Router = class {
    constructor(application2) {
      this.application = application2;
      this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
      this.scopesByIdentifier = new Multimap();
      this.modulesByIdentifier = /* @__PURE__ */ new Map();
    }
    get element() {
      return this.application.element;
    }
    get schema() {
      return this.application.schema;
    }
    get logger() {
      return this.application.logger;
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    get modules() {
      return Array.from(this.modulesByIdentifier.values());
    }
    get contexts() {
      return this.modules.reduce((contexts, module) => contexts.concat(module.contexts), []);
    }
    start() {
      this.scopeObserver.start();
    }
    stop() {
      this.scopeObserver.stop();
    }
    loadDefinition(definition) {
      this.unloadIdentifier(definition.identifier);
      const module = new Module(this.application, definition);
      this.connectModule(module);
      const afterLoad = definition.controllerConstructor.afterLoad;
      if (afterLoad) {
        afterLoad(definition.identifier, this.application);
      }
    }
    unloadIdentifier(identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        this.disconnectModule(module);
      }
    }
    getContextForElementAndIdentifier(element, identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        return module.contexts.find((context) => context.element == element);
      }
    }
    handleError(error2, message, detail) {
      this.application.handleError(error2, message, detail);
    }
    createScopeForElementAndIdentifier(element, identifier) {
      return new Scope(this.schema, element, identifier, this.logger);
    }
    scopeConnected(scope) {
      this.scopesByIdentifier.add(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.connectContextForScope(scope);
      }
    }
    scopeDisconnected(scope) {
      this.scopesByIdentifier.delete(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.disconnectContextForScope(scope);
      }
    }
    connectModule(module) {
      this.modulesByIdentifier.set(module.identifier, module);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.connectContextForScope(scope));
    }
    disconnectModule(module) {
      this.modulesByIdentifier.delete(module.identifier);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.disconnectContextForScope(scope));
    }
  };
  var defaultSchema = {
    controllerAttribute: "data-controller",
    actionAttribute: "data-action",
    targetAttribute: "data-target",
    targetAttributeForScope: (identifier) => `data-${identifier}-target`,
    outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
    keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c2) => [c2, c2]))), objectFromEntries("0123456789".split("").map((n2) => [n2, n2])))
  };
  function objectFromEntries(array) {
    return array.reduce((memo, [k2, v2]) => Object.assign(Object.assign({}, memo), { [k2]: v2 }), {});
  }
  var Application = class {
    constructor(element = document.documentElement, schema = defaultSchema) {
      this.logger = console;
      this.debug = false;
      this.logDebugActivity = (identifier, functionName, detail = {}) => {
        if (this.debug) {
          this.logFormattedMessage(identifier, functionName, detail);
        }
      };
      this.element = element;
      this.schema = schema;
      this.dispatcher = new Dispatcher(this);
      this.router = new Router(this);
      this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
    }
    static start(element, schema) {
      const application2 = new this(element, schema);
      application2.start();
      return application2;
    }
    async start() {
      await domReady();
      this.logDebugActivity("application", "starting");
      this.dispatcher.start();
      this.router.start();
      this.logDebugActivity("application", "start");
    }
    stop() {
      this.logDebugActivity("application", "stopping");
      this.dispatcher.stop();
      this.router.stop();
      this.logDebugActivity("application", "stop");
    }
    register(identifier, controllerConstructor) {
      this.load({ identifier, controllerConstructor });
    }
    registerActionOption(name, filter) {
      this.actionDescriptorFilters[name] = filter;
    }
    load(head, ...rest) {
      const definitions = Array.isArray(head) ? head : [head, ...rest];
      definitions.forEach((definition) => {
        if (definition.controllerConstructor.shouldLoad) {
          this.router.loadDefinition(definition);
        }
      });
    }
    unload(head, ...rest) {
      const identifiers = Array.isArray(head) ? head : [head, ...rest];
      identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
    }
    get controllers() {
      return this.router.contexts.map((context) => context.controller);
    }
    getControllerForElementAndIdentifier(element, identifier) {
      const context = this.router.getContextForElementAndIdentifier(element, identifier);
      return context ? context.controller : null;
    }
    handleError(error2, message, detail) {
      var _a;
      this.logger.error(`%s

%o

%o`, message, error2, detail);
      (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
    }
    logFormattedMessage(identifier, functionName, detail = {}) {
      detail = Object.assign({ application: this }, detail);
      this.logger.groupCollapsed(`${identifier} #${functionName}`);
      this.logger.log("details:", Object.assign({}, detail));
      this.logger.groupEnd();
    }
  };
  function domReady() {
    return new Promise((resolve) => {
      if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", () => resolve());
      } else {
        resolve();
      }
    });
  }
  function ClassPropertiesBlessing(constructor) {
    const classes = readInheritableStaticArrayValues(constructor, "classes");
    return classes.reduce((properties, classDefinition) => {
      return Object.assign(properties, propertiesForClassDefinition(classDefinition));
    }, {});
  }
  function propertiesForClassDefinition(key) {
    return {
      [`${key}Class`]: {
        get() {
          const { classes } = this;
          if (classes.has(key)) {
            return classes.get(key);
          } else {
            const attribute = classes.getAttributeName(key);
            throw new Error(`Missing attribute "${attribute}"`);
          }
        }
      },
      [`${key}Classes`]: {
        get() {
          return this.classes.getAll(key);
        }
      },
      [`has${capitalize(key)}Class`]: {
        get() {
          return this.classes.has(key);
        }
      }
    };
  }
  function OutletPropertiesBlessing(constructor) {
    const outlets = readInheritableStaticArrayValues(constructor, "outlets");
    return outlets.reduce((properties, outletDefinition) => {
      return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
    }, {});
  }
  function propertiesForOutletDefinition(name) {
    const camelizedName = namespaceCamelize(name);
    return {
      [`${camelizedName}Outlet`]: {
        get() {
          const outlet = this.outlets.find(name);
          if (outlet) {
            const outletController = this.application.getControllerForElementAndIdentifier(outlet, name);
            if (outletController) {
              return outletController;
            } else {
              throw new Error(`Missing "data-controller=${name}" attribute on outlet element for "${this.identifier}" controller`);
            }
          }
          throw new Error(`Missing outlet element "${name}" for "${this.identifier}" controller`);
        }
      },
      [`${camelizedName}Outlets`]: {
        get() {
          const outlets = this.outlets.findAll(name);
          if (outlets.length > 0) {
            return outlets.map((outlet) => {
              const controller = this.application.getControllerForElementAndIdentifier(outlet, name);
              if (controller) {
                return controller;
              } else {
                console.warn(`The provided outlet element is missing the outlet controller "${name}" for "${this.identifier}"`, outlet);
              }
            }).filter((controller) => controller);
          }
          return [];
        }
      },
      [`${camelizedName}OutletElement`]: {
        get() {
          const outlet = this.outlets.find(name);
          if (outlet) {
            return outlet;
          } else {
            throw new Error(`Missing outlet element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${camelizedName}OutletElements`]: {
        get() {
          return this.outlets.findAll(name);
        }
      },
      [`has${capitalize(camelizedName)}Outlet`]: {
        get() {
          return this.outlets.has(name);
        }
      }
    };
  }
  function TargetPropertiesBlessing(constructor) {
    const targets = readInheritableStaticArrayValues(constructor, "targets");
    return targets.reduce((properties, targetDefinition) => {
      return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
    }, {});
  }
  function propertiesForTargetDefinition(name) {
    return {
      [`${name}Target`]: {
        get() {
          const target = this.targets.find(name);
          if (target) {
            return target;
          } else {
            throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${name}Targets`]: {
        get() {
          return this.targets.findAll(name);
        }
      },
      [`has${capitalize(name)}Target`]: {
        get() {
          return this.targets.has(name);
        }
      }
    };
  }
  function ValuePropertiesBlessing(constructor) {
    const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
    const propertyDescriptorMap = {
      valueDescriptorMap: {
        get() {
          return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
            const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
            const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
            return Object.assign(result, { [attributeName]: valueDescriptor });
          }, {});
        }
      }
    };
    return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
      return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
    }, propertyDescriptorMap);
  }
  function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
    const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
    const { key, name, reader: read, writer: write } = definition;
    return {
      [name]: {
        get() {
          const value = this.data.get(key);
          if (value !== null) {
            return read(value);
          } else {
            return definition.defaultValue;
          }
        },
        set(value) {
          if (value === void 0) {
            this.data.delete(key);
          } else {
            this.data.set(key, write(value));
          }
        }
      },
      [`has${capitalize(name)}`]: {
        get() {
          return this.data.has(key) || definition.hasCustomDefaultValue;
        }
      }
    };
  }
  function parseValueDefinitionPair([token, typeDefinition], controller) {
    return valueDescriptorForTokenAndTypeDefinition({
      controller,
      token,
      typeDefinition
    });
  }
  function parseValueTypeConstant(constant) {
    switch (constant) {
      case Array:
        return "array";
      case Boolean:
        return "boolean";
      case Number:
        return "number";
      case Object:
        return "object";
      case String:
        return "string";
    }
  }
  function parseValueTypeDefault(defaultValue) {
    switch (typeof defaultValue) {
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
    }
    if (Array.isArray(defaultValue))
      return "array";
    if (Object.prototype.toString.call(defaultValue) === "[object Object]")
      return "object";
  }
  function parseValueTypeObject(payload) {
    const typeFromObject = parseValueTypeConstant(payload.typeObject.type);
    if (!typeFromObject)
      return;
    const defaultValueType = parseValueTypeDefault(payload.typeObject.default);
    if (typeFromObject !== defaultValueType) {
      const propertyPath = payload.controller ? `${payload.controller}.${payload.token}` : payload.token;
      throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${payload.typeObject.default}" is of type "${defaultValueType}".`);
    }
    return typeFromObject;
  }
  function parseValueTypeDefinition(payload) {
    const typeFromObject = parseValueTypeObject({
      controller: payload.controller,
      token: payload.token,
      typeObject: payload.typeDefinition
    });
    const typeFromDefaultValue = parseValueTypeDefault(payload.typeDefinition);
    const typeFromConstant = parseValueTypeConstant(payload.typeDefinition);
    const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
    if (type)
      return type;
    const propertyPath = payload.controller ? `${payload.controller}.${payload.typeDefinition}` : payload.token;
    throw new Error(`Unknown value type "${propertyPath}" for "${payload.token}" value`);
  }
  function defaultValueForDefinition(typeDefinition) {
    const constant = parseValueTypeConstant(typeDefinition);
    if (constant)
      return defaultValuesByType[constant];
    const defaultValue = typeDefinition.default;
    if (defaultValue !== void 0)
      return defaultValue;
    return typeDefinition;
  }
  function valueDescriptorForTokenAndTypeDefinition(payload) {
    const key = `${dasherize(payload.token)}-value`;
    const type = parseValueTypeDefinition(payload);
    return {
      type,
      key,
      name: camelize(key),
      get defaultValue() {
        return defaultValueForDefinition(payload.typeDefinition);
      },
      get hasCustomDefaultValue() {
        return parseValueTypeDefault(payload.typeDefinition) !== void 0;
      },
      reader: readers[type],
      writer: writers[type] || writers.default
    };
  }
  var defaultValuesByType = {
    get array() {
      return [];
    },
    boolean: false,
    number: 0,
    get object() {
      return {};
    },
    string: ""
  };
  var readers = {
    array(value) {
      const array = JSON.parse(value);
      if (!Array.isArray(array)) {
        throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
      }
      return array;
    },
    boolean(value) {
      return !(value == "0" || String(value).toLowerCase() == "false");
    },
    number(value) {
      return Number(value);
    },
    object(value) {
      const object = JSON.parse(value);
      if (object === null || typeof object != "object" || Array.isArray(object)) {
        throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
      }
      return object;
    },
    string(value) {
      return value;
    }
  };
  var writers = {
    default: writeString,
    array: writeJSON,
    object: writeJSON
  };
  function writeJSON(value) {
    return JSON.stringify(value);
  }
  function writeString(value) {
    return `${value}`;
  }
  var Controller = class {
    constructor(context) {
      this.context = context;
    }
    static get shouldLoad() {
      return true;
    }
    static afterLoad(_identifier, _application) {
      return;
    }
    get application() {
      return this.context.application;
    }
    get scope() {
      return this.context.scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get targets() {
      return this.scope.targets;
    }
    get outlets() {
      return this.scope.outlets;
    }
    get classes() {
      return this.scope.classes;
    }
    get data() {
      return this.scope.data;
    }
    initialize() {
    }
    connect() {
    }
    disconnect() {
    }
    dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
      const type = prefix ? `${prefix}:${eventName}` : eventName;
      const event = new CustomEvent(type, { detail, bubbles, cancelable });
      target.dispatchEvent(event);
      return event;
    }
  };
  Controller.blessings = [
    ClassPropertiesBlessing,
    TargetPropertiesBlessing,
    ValuePropertiesBlessing,
    OutletPropertiesBlessing
  ];
  Controller.targets = [];
  Controller.outlets = [];
  Controller.values = {};

  // app/javascript/controllers/application.js
  var application = Application.start();
  application.debug = false;
  window.Stimulus = application;

  // app/javascript/controllers/attachment_controller.js
  var import_rails_ujs = __toESM(require_rails_ujs());
  var attachment_controller_default = class extends Controller {
    delete(event) {
      console.log("clicou");
    }
  };
  __publicField(attachment_controller_default, "targets", ["attachment"]);

  // app/javascript/controllers/hello_controller.js
  var hello_controller_default = class extends Controller {
    connect() {
      this.element.textContent = "Hello World!";
    }
  };

  // app/javascript/controllers/slim_controller.js
  var import_slim_select = __toESM(require_slimselect_umd());
  var slim_controller_default = class extends Controller {
    connect() {
      new import_slim_select.default(
        {
          select: this.element
        }
      );
    }
  };

  // app/javascript/controllers/toggle_controller.js
  var toggle_controller_default = class extends Controller {
    connect() {
      console.log(this.element);
    }
    toggle() {
      console.log(this.element.value);
      this.element.value = !this.element.value;
      console.log(this.element.value);
    }
  };

  // app/javascript/controllers/index.js
  application.register("attachment", attachment_controller_default);
  application.register("hello", hello_controller_default);
  application.register("slim", slim_controller_default);
  application.register("toggle", toggle_controller_default);

  // node_modules/trix/dist/trix.esm.min.js
  var t = { preview: { presentation: "gallery", caption: { name: true, size: true } }, file: { caption: { size: true } } };
  var e = { default: { tagName: "div", parse: false }, quote: { tagName: "blockquote", nestable: true }, heading1: { tagName: "h1", terminal: true, breakOnReturn: true, group: false }, code: { tagName: "pre", terminal: true, text: { plaintext: true } }, bulletList: { tagName: "ul", parse: false }, bullet: { tagName: "li", listAttribute: "bulletList", group: false, nestable: true, test(t2) {
    return i(t2.parentNode) === e[this.listAttribute].tagName;
  } }, numberList: { tagName: "ol", parse: false }, number: { tagName: "li", listAttribute: "numberList", group: false, nestable: true, test(t2) {
    return i(t2.parentNode) === e[this.listAttribute].tagName;
  } }, attachmentGallery: { tagName: "div", exclusive: true, terminal: true, parse: false, group: false } };
  var i = (t2) => {
    var e2;
    return null == t2 || null === (e2 = t2.tagName) || void 0 === e2 ? void 0 : e2.toLowerCase();
  };
  var n = navigator.userAgent.match(/android\s([0-9]+.*Chrome)/i);
  var r = n && parseInt(n[1]);
  var o = { composesExistingText: /Android.*Chrome/.test(navigator.userAgent), recentAndroid: r && r > 12, samsungAndroid: r && navigator.userAgent.match(/Android.*SM-/), forcesObjectResizing: /Trident.*rv:11/.test(navigator.userAgent), supportsInputEvents: "undefined" != typeof InputEvent && ["data", "getTargetRanges", "inputType"].every((t2) => t2 in InputEvent.prototype) };
  var s = { attachFiles: "Attach Files", bold: "Bold", bullets: "Bullets", byte: "Byte", bytes: "Bytes", captionPlaceholder: "Add a caption\u2026", code: "Code", heading1: "Heading", indent: "Increase Level", italic: "Italic", link: "Link", numbers: "Numbers", outdent: "Decrease Level", quote: "Quote", redo: "Redo", remove: "Remove", strike: "Strikethrough", undo: "Undo", unlink: "Unlink", url: "URL", urlPlaceholder: "Enter a URL\u2026", GB: "GB", KB: "KB", MB: "MB", PB: "PB", TB: "TB" };
  var a = [s.bytes, s.KB, s.MB, s.GB, s.TB, s.PB];
  var l = { prefix: "IEC", precision: 2, formatter(t2) {
    switch (t2) {
      case 0:
        return "0 ".concat(s.bytes);
      case 1:
        return "1 ".concat(s.byte);
      default:
        let e2;
        "SI" === this.prefix ? e2 = 1e3 : "IEC" === this.prefix && (e2 = 1024);
        const i2 = Math.floor(Math.log(t2) / Math.log(e2)), n2 = (t2 / Math.pow(e2, i2)).toFixed(this.precision).replace(/0*$/, "").replace(/\.$/, "");
        return "".concat(n2, " ").concat(a[i2]);
    }
  } };
  var c = function(t2) {
    for (const e2 in t2) {
      const i2 = t2[e2];
      this[e2] = i2;
    }
    return this;
  };
  var h = document.documentElement;
  var u = h.matches;
  var d = function(t2) {
    let { onElement: e2, matchingSelector: i2, withCallback: n2, inPhase: r2, preventDefault: o2, times: s2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const a2 = e2 || h, l2 = i2, c2 = "capturing" === r2, u2 = function(t3) {
      null != s2 && 0 == --s2 && u2.destroy();
      const e3 = p(t3.target, { matchingSelector: l2 });
      null != e3 && (null == n2 || n2.call(e3, t3, e3), o2 && t3.preventDefault());
    };
    return u2.destroy = () => a2.removeEventListener(t2, u2, c2), a2.addEventListener(t2, u2, c2), u2;
  };
  var g = function(t2) {
    let { onElement: e2, bubbles: i2, cancelable: n2, attributes: r2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const o2 = null != e2 ? e2 : h;
    i2 = false !== i2, n2 = false !== n2;
    const s2 = document.createEvent("Events");
    return s2.initEvent(t2, i2, n2), null != r2 && c.call(s2, r2), o2.dispatchEvent(s2);
  };
  var m = function(t2, e2) {
    if (1 === (null == t2 ? void 0 : t2.nodeType))
      return u.call(t2, e2);
  };
  var p = function(t2) {
    let { matchingSelector: e2, untilNode: i2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    for (; t2 && t2.nodeType !== Node.ELEMENT_NODE; )
      t2 = t2.parentNode;
    if (null != t2) {
      if (null == e2)
        return t2;
      if (t2.closest && null == i2)
        return t2.closest(e2);
      for (; t2 && t2 !== i2; ) {
        if (m(t2, e2))
          return t2;
        t2 = t2.parentNode;
      }
    }
  };
  var f = (t2) => document.activeElement !== t2 && b(t2, document.activeElement);
  var b = function(t2, e2) {
    if (t2 && e2)
      for (; e2; ) {
        if (e2 === t2)
          return true;
        e2 = e2.parentNode;
      }
  };
  var v = function(t2) {
    var e2;
    if (null === (e2 = t2) || void 0 === e2 || !e2.parentNode)
      return;
    let i2 = 0;
    for (t2 = t2.previousSibling; t2; )
      i2++, t2 = t2.previousSibling;
    return i2;
  };
  var A = (t2) => {
    var e2;
    return null == t2 || null === (e2 = t2.parentNode) || void 0 === e2 ? void 0 : e2.removeChild(t2);
  };
  var x = function(t2) {
    let { onlyNodesOfType: e2, usingFilter: i2, expandEntityReferences: n2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const r2 = (() => {
      switch (e2) {
        case "element":
          return NodeFilter.SHOW_ELEMENT;
        case "text":
          return NodeFilter.SHOW_TEXT;
        case "comment":
          return NodeFilter.SHOW_COMMENT;
        default:
          return NodeFilter.SHOW_ALL;
      }
    })();
    return document.createTreeWalker(t2, r2, null != i2 ? i2 : null, true === n2);
  };
  var y = (t2) => {
    var e2;
    return null == t2 || null === (e2 = t2.tagName) || void 0 === e2 ? void 0 : e2.toLowerCase();
  };
  var C = function(t2) {
    let e2, i2, n2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    "object" == typeof t2 ? (n2 = t2, t2 = n2.tagName) : n2 = { attributes: n2 };
    const r2 = document.createElement(t2);
    if (null != n2.editable && (null == n2.attributes && (n2.attributes = {}), n2.attributes.contenteditable = n2.editable), n2.attributes)
      for (e2 in n2.attributes)
        i2 = n2.attributes[e2], r2.setAttribute(e2, i2);
    if (n2.style)
      for (e2 in n2.style)
        i2 = n2.style[e2], r2.style[e2] = i2;
    if (n2.data)
      for (e2 in n2.data)
        i2 = n2.data[e2], r2.dataset[e2] = i2;
    return n2.className && n2.className.split(" ").forEach((t3) => {
      r2.classList.add(t3);
    }), n2.textContent && (r2.textContent = n2.textContent), n2.childNodes && [].concat(n2.childNodes).forEach((t3) => {
      r2.appendChild(t3);
    }), r2;
  };
  var R;
  var E = function() {
    if (null != R)
      return R;
    R = [];
    for (const t2 in e) {
      const i2 = e[t2];
      i2.tagName && R.push(i2.tagName);
    }
    return R;
  };
  var S = (t2) => D(null == t2 ? void 0 : t2.firstChild);
  var k = function(t2) {
    return E().includes(y(t2)) && !E().includes(y(t2.firstChild));
  };
  var L = function(t2) {
    let { strict: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { strict: true };
    return e2 ? D(t2) : D(t2) || !D(t2.firstChild) && k(t2);
  };
  var D = (t2) => w(t2) && "block" === (null == t2 ? void 0 : t2.data);
  var w = (t2) => (null == t2 ? void 0 : t2.nodeType) === Node.COMMENT_NODE;
  var T = function(t2) {
    let { name: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    if (t2)
      return I(t2) ? "\uFEFF" === t2.data ? !e2 || t2.parentNode.dataset.trixCursorTarget === e2 : void 0 : T(t2.firstChild);
  };
  var F = (t2) => m(t2, "[data-trix-attachment]");
  var B = (t2) => I(t2) && "" === (null == t2 ? void 0 : t2.data);
  var I = (t2) => (null == t2 ? void 0 : t2.nodeType) === Node.TEXT_NODE;
  var P = { level2Enabled: true, getLevel() {
    return this.level2Enabled && o.supportsInputEvents ? 2 : 0;
  }, pickFiles(t2) {
    const e2 = C("input", { type: "file", multiple: true, hidden: true, id: this.fileInputId });
    e2.addEventListener("change", () => {
      t2(e2.files), A(e2);
    }), A(document.getElementById(this.fileInputId)), document.body.appendChild(e2), e2.click();
  } };
  var N = { removeBlankTableCells: false, tableCellSeparator: " | ", tableRowSeparator: "\n" };
  var O = { bold: { tagName: "strong", inheritable: true, parser(t2) {
    const e2 = window.getComputedStyle(t2);
    return "bold" === e2.fontWeight || e2.fontWeight >= 600;
  } }, italic: { tagName: "em", inheritable: true, parser: (t2) => "italic" === window.getComputedStyle(t2).fontStyle }, href: { groupTagName: "a", parser(t2) {
    const e2 = "a:not(".concat("[data-trix-attachment]", ")"), i2 = t2.closest(e2);
    if (i2)
      return i2.getAttribute("href");
  } }, strike: { tagName: "del", inheritable: true }, frozen: { style: { backgroundColor: "highlight" } } };
  var M = { getDefaultHTML: () => '<div class="trix-button-row">\n      <span class="trix-button-group trix-button-group--text-tools" data-trix-button-group="text-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-bold" data-trix-attribute="bold" data-trix-key="b" title="'.concat(s.bold, '" tabindex="-1">').concat(s.bold, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-italic" data-trix-attribute="italic" data-trix-key="i" title="').concat(s.italic, '" tabindex="-1">').concat(s.italic, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-strike" data-trix-attribute="strike" title="').concat(s.strike, '" tabindex="-1">').concat(s.strike, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-link" data-trix-attribute="href" data-trix-action="link" data-trix-key="k" title="').concat(s.link, '" tabindex="-1">').concat(s.link, '</button>\n      </span>\n\n      <span class="trix-button-group trix-button-group--block-tools" data-trix-button-group="block-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-heading-1" data-trix-attribute="heading1" title="').concat(s.heading1, '" tabindex="-1">').concat(s.heading1, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-quote" data-trix-attribute="quote" title="').concat(s.quote, '" tabindex="-1">').concat(s.quote, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-code" data-trix-attribute="code" title="').concat(s.code, '" tabindex="-1">').concat(s.code, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-bullet-list" data-trix-attribute="bullet" title="').concat(s.bullets, '" tabindex="-1">').concat(s.bullets, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-number-list" data-trix-attribute="number" title="').concat(s.numbers, '" tabindex="-1">').concat(s.numbers, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-decrease-nesting-level" data-trix-action="decreaseNestingLevel" title="').concat(s.outdent, '" tabindex="-1">').concat(s.outdent, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-increase-nesting-level" data-trix-action="increaseNestingLevel" title="').concat(s.indent, '" tabindex="-1">').concat(s.indent, '</button>\n      </span>\n\n      <span class="trix-button-group trix-button-group--file-tools" data-trix-button-group="file-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-attach" data-trix-action="attachFiles" title="').concat(s.attachFiles, '" tabindex="-1">').concat(s.attachFiles, '</button>\n      </span>\n\n      <span class="trix-button-group-spacer"></span>\n\n      <span class="trix-button-group trix-button-group--history-tools" data-trix-button-group="history-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-undo" data-trix-action="undo" data-trix-key="z" title="').concat(s.undo, '" tabindex="-1">').concat(s.undo, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-redo" data-trix-action="redo" data-trix-key="shift+z" title="').concat(s.redo, '" tabindex="-1">').concat(s.redo, '</button>\n      </span>\n    </div>\n\n    <div class="trix-dialogs" data-trix-dialogs>\n      <div class="trix-dialog trix-dialog--link" data-trix-dialog="href" data-trix-dialog-attribute="href">\n        <div class="trix-dialog__link-fields">\n          <input type="url" name="href" class="trix-input trix-input--dialog" placeholder="').concat(s.urlPlaceholder, '" aria-label="').concat(s.url, '" required data-trix-input>\n          <div class="trix-button-group">\n            <input type="button" class="trix-button trix-button--dialog" value="').concat(s.link, '" data-trix-method="setAttribute">\n            <input type="button" class="trix-button trix-button--dialog" value="').concat(s.unlink, '" data-trix-method="removeAttribute">\n          </div>\n        </div>\n      </div>\n    </div>') };
  var j = { interval: 5e3 };
  var W = Object.freeze({ __proto__: null, attachments: t, blockAttributes: e, browser: o, css: { attachment: "attachment", attachmentCaption: "attachment__caption", attachmentCaptionEditor: "attachment__caption-editor", attachmentMetadata: "attachment__metadata", attachmentMetadataContainer: "attachment__metadata-container", attachmentName: "attachment__name", attachmentProgress: "attachment__progress", attachmentSize: "attachment__size", attachmentToolbar: "attachment__toolbar", attachmentGallery: "attachment-gallery" }, fileSize: l, input: P, keyNames: { 8: "backspace", 9: "tab", 13: "return", 27: "escape", 37: "left", 39: "right", 46: "delete", 68: "d", 72: "h", 79: "o" }, lang: s, parser: N, textAttributes: O, toolbar: M, undo: j });
  var U = class {
    static proxyMethod(t2) {
      const { name: e2, toMethod: i2, toProperty: n2, optional: r2 } = q(t2);
      this.prototype[e2] = function() {
        let t3, o2;
        var s2, a2;
        i2 ? o2 = r2 ? null === (s2 = this[i2]) || void 0 === s2 ? void 0 : s2.call(this) : this[i2]() : n2 && (o2 = this[n2]);
        return r2 ? (t3 = null === (a2 = o2) || void 0 === a2 ? void 0 : a2[e2], t3 ? V.call(t3, o2, arguments) : void 0) : (t3 = o2[e2], V.call(t3, o2, arguments));
      };
    }
  };
  var q = function(t2) {
    const e2 = t2.match(z);
    if (!e2)
      throw new Error("can't parse @proxyMethod expression: ".concat(t2));
    const i2 = { name: e2[4] };
    return null != e2[2] ? i2.toMethod = e2[1] : i2.toProperty = e2[1], null != e2[3] && (i2.optional = true), i2;
  };
  var { apply: V } = Function.prototype;
  var z = new RegExp("^(.+?)(\\(\\))?(\\?)?\\.(.+?)$");
  var _;
  var H;
  var J;
  var K = class extends U {
    static box() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
      return t2 instanceof this ? t2 : this.fromUCS2String(null == t2 ? void 0 : t2.toString());
    }
    static fromUCS2String(t2) {
      return new this(t2, Y(t2));
    }
    static fromCodepoints(t2) {
      return new this(Q(t2), t2);
    }
    constructor(t2, e2) {
      super(...arguments), this.ucs2String = t2, this.codepoints = e2, this.length = this.codepoints.length, this.ucs2Length = this.ucs2String.length;
    }
    offsetToUCS2Offset(t2) {
      return Q(this.codepoints.slice(0, Math.max(0, t2))).length;
    }
    offsetFromUCS2Offset(t2) {
      return Y(this.ucs2String.slice(0, Math.max(0, t2))).length;
    }
    slice() {
      return this.constructor.fromCodepoints(this.codepoints.slice(...arguments));
    }
    charAt(t2) {
      return this.slice(t2, t2 + 1);
    }
    isEqualTo(t2) {
      return this.constructor.box(t2).ucs2String === this.ucs2String;
    }
    toJSON() {
      return this.ucs2String;
    }
    getCacheKey() {
      return this.ucs2String;
    }
    toString() {
      return this.ucs2String;
    }
  };
  var G = 1 === (null === (_ = Array.from) || void 0 === _ ? void 0 : _.call(Array, "\u{1F47C}").length);
  var $ = null != (null === (H = " ".codePointAt) || void 0 === H ? void 0 : H.call(" ", 0));
  var X = " \u{1F47C}" === (null === (J = String.fromCodePoint) || void 0 === J ? void 0 : J.call(String, 32, 128124));
  var Y;
  var Q;
  Y = G && $ ? (t2) => Array.from(t2).map((t3) => t3.codePointAt(0)) : function(t2) {
    const e2 = [];
    let i2 = 0;
    const { length: n2 } = t2;
    for (; i2 < n2; ) {
      let r2 = t2.charCodeAt(i2++);
      if (55296 <= r2 && r2 <= 56319 && i2 < n2) {
        const e3 = t2.charCodeAt(i2++);
        56320 == (64512 & e3) ? r2 = ((1023 & r2) << 10) + (1023 & e3) + 65536 : i2--;
      }
      e2.push(r2);
    }
    return e2;
  }, Q = X ? (t2) => String.fromCodePoint(...Array.from(t2 || [])) : function(t2) {
    return (() => {
      const e2 = [];
      return Array.from(t2).forEach((t3) => {
        let i2 = "";
        t3 > 65535 && (t3 -= 65536, i2 += String.fromCharCode(t3 >>> 10 & 1023 | 55296), t3 = 56320 | 1023 & t3), e2.push(i2 + String.fromCharCode(t3));
      }), e2;
    })().join("");
  };
  var Z = 0;
  var tt = class extends U {
    static fromJSONString(t2) {
      return this.fromJSON(JSON.parse(t2));
    }
    constructor() {
      super(...arguments), this.id = ++Z;
    }
    hasSameConstructorAs(t2) {
      return this.constructor === (null == t2 ? void 0 : t2.constructor);
    }
    isEqualTo(t2) {
      return this === t2;
    }
    inspect() {
      const t2 = [], e2 = this.contentsForInspection() || {};
      for (const i2 in e2) {
        const n2 = e2[i2];
        t2.push("".concat(i2, "=").concat(n2));
      }
      return "#<".concat(this.constructor.name, ":").concat(this.id).concat(t2.length ? " ".concat(t2.join(", ")) : "", ">");
    }
    contentsForInspection() {
    }
    toJSONString() {
      return JSON.stringify(this);
    }
    toUTF16String() {
      return K.box(this);
    }
    getCacheKey() {
      return this.id.toString();
    }
  };
  var et = function() {
    let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
    if (t2.length !== e2.length)
      return false;
    for (let i2 = 0; i2 < t2.length; i2++) {
      if (t2[i2] !== e2[i2])
        return false;
    }
    return true;
  };
  var it = function(t2) {
    const e2 = t2.slice(0);
    for (var i2 = arguments.length, n2 = new Array(i2 > 1 ? i2 - 1 : 0), r2 = 1; r2 < i2; r2++)
      n2[r2 - 1] = arguments[r2];
    return e2.splice(...n2), e2;
  };
  var nt = /[\u05BE\u05C0\u05C3\u05D0-\u05EA\u05F0-\u05F4\u061B\u061F\u0621-\u063A\u0640-\u064A\u066D\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D5\u06E5\u06E6\u200F\u202B\u202E\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE72\uFE74\uFE76-\uFEFC]/;
  var rt = function() {
    const t2 = C("input", { dir: "auto", name: "x", dirName: "x.dir" }), e2 = C("form");
    e2.appendChild(t2);
    const i2 = function() {
      try {
        return new FormData(e2).has(t2.dirName);
      } catch (t3) {
        return false;
      }
    }(), n2 = function() {
      try {
        return t2.matches(":dir(ltr),:dir(rtl)");
      } catch (t3) {
        return false;
      }
    }();
    return i2 ? function(i3) {
      return t2.value = i3, new FormData(e2).get(t2.dirName);
    } : n2 ? function(e3) {
      return t2.value = e3, t2.matches(":dir(rtl)") ? "rtl" : "ltr";
    } : function(t3) {
      const e3 = t3.trim().charAt(0);
      return nt.test(e3) ? "rtl" : "ltr";
    };
  }();
  var ot = null;
  var st = null;
  var at = null;
  var lt = null;
  var ct = () => (ot || (ot = gt().concat(ut())), ot);
  var ht = (t2) => e[t2];
  var ut = () => (st || (st = Object.keys(e)), st);
  var dt = (t2) => O[t2];
  var gt = () => (at || (at = Object.keys(O)), at);
  var mt = function(t2, e2) {
    pt(t2).textContent = e2.replace(/%t/g, t2);
  };
  var pt = function(t2) {
    const e2 = document.createElement("style");
    e2.setAttribute("type", "text/css"), e2.setAttribute("data-tag-name", t2.toLowerCase());
    const i2 = ft();
    return i2 && e2.setAttribute("nonce", i2), document.head.insertBefore(e2, document.head.firstChild), e2;
  };
  var ft = function() {
    const t2 = bt("trix-csp-nonce") || bt("csp-nonce");
    if (t2)
      return t2.getAttribute("content");
  };
  var bt = (t2) => document.head.querySelector("meta[name=".concat(t2, "]"));
  var vt = { "application/x-trix-feature-detection": "test" };
  var At = function(t2) {
    const e2 = t2.getData("text/plain"), i2 = t2.getData("text/html");
    if (!e2 || !i2)
      return null == e2 ? void 0 : e2.length;
    {
      const { body: t3 } = new DOMParser().parseFromString(i2, "text/html");
      if (t3.textContent === e2)
        return !t3.querySelector("*");
    }
  };
  var xt = /Mac|^iP/.test(navigator.platform) ? (t2) => t2.metaKey : (t2) => t2.ctrlKey;
  var yt = (t2) => setTimeout(t2, 1);
  var Ct = function() {
    let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    const e2 = {};
    for (const i2 in t2) {
      const n2 = t2[i2];
      e2[i2] = n2;
    }
    return e2;
  };
  var Rt = function() {
    let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    if (Object.keys(t2).length !== Object.keys(e2).length)
      return false;
    for (const i2 in t2) {
      if (t2[i2] !== e2[i2])
        return false;
    }
    return true;
  };
  var Et = function(t2) {
    if (null != t2)
      return Array.isArray(t2) || (t2 = [t2, t2]), [Lt(t2[0]), Lt(null != t2[1] ? t2[1] : t2[0])];
  };
  var St = function(t2) {
    if (null == t2)
      return;
    const [e2, i2] = Et(t2);
    return Dt(e2, i2);
  };
  var kt = function(t2, e2) {
    if (null == t2 || null == e2)
      return;
    const [i2, n2] = Et(t2), [r2, o2] = Et(e2);
    return Dt(i2, r2) && Dt(n2, o2);
  };
  var Lt = function(t2) {
    return "number" == typeof t2 ? t2 : Ct(t2);
  };
  var Dt = function(t2, e2) {
    return "number" == typeof t2 ? t2 === e2 : Rt(t2, e2);
  };
  var wt = class extends U {
    constructor() {
      super(...arguments), this.update = this.update.bind(this), this.run = this.run.bind(this), this.selectionManagers = [];
    }
    start() {
      if (!this.started)
        return this.started = true, "onselectionchange" in document ? document.addEventListener("selectionchange", this.update, true) : this.run();
    }
    stop() {
      if (this.started)
        return this.started = false, document.removeEventListener("selectionchange", this.update, true);
    }
    registerSelectionManager(t2) {
      if (!this.selectionManagers.includes(t2))
        return this.selectionManagers.push(t2), this.start();
    }
    unregisterSelectionManager(t2) {
      if (this.selectionManagers = this.selectionManagers.filter((e2) => e2 !== t2), 0 === this.selectionManagers.length)
        return this.stop();
    }
    notifySelectionManagersOfSelectionChange() {
      return this.selectionManagers.map((t2) => t2.selectionDidChange());
    }
    update() {
      const t2 = It();
      if (!Tt(t2, this.domRange))
        return this.domRange = t2, this.notifySelectionManagersOfSelectionChange();
    }
    reset() {
      return this.domRange = null, this.update();
    }
    run() {
      if (this.started)
        return this.update(), requestAnimationFrame(this.run);
    }
  };
  var Tt = (t2, e2) => (null == t2 ? void 0 : t2.startContainer) === (null == e2 ? void 0 : e2.startContainer) && (null == t2 ? void 0 : t2.startOffset) === (null == e2 ? void 0 : e2.startOffset) && (null == t2 ? void 0 : t2.endContainer) === (null == e2 ? void 0 : e2.endContainer) && (null == t2 ? void 0 : t2.endOffset) === (null == e2 ? void 0 : e2.endOffset);
  var Ft = new wt();
  var Bt = function() {
    const t2 = window.getSelection();
    if (t2.rangeCount > 0)
      return t2;
  };
  var It = function() {
    var t2;
    const e2 = null === (t2 = Bt()) || void 0 === t2 ? void 0 : t2.getRangeAt(0);
    if (e2 && !Nt(e2))
      return e2;
  };
  var Pt = function(t2) {
    const e2 = window.getSelection();
    return e2.removeAllRanges(), e2.addRange(t2), Ft.update();
  };
  var Nt = (t2) => Ot(t2.startContainer) || Ot(t2.endContainer);
  var Ot = (t2) => !Object.getPrototypeOf(t2);
  var Mt = (t2) => t2.replace(new RegExp("".concat("\uFEFF"), "g"), "").replace(new RegExp("".concat("\xA0"), "g"), " ");
  var jt = new RegExp("[^\\S".concat("\xA0", "]"));
  var Wt = (t2) => t2.replace(new RegExp("".concat(jt.source), "g"), " ").replace(/\ {2,}/g, " ");
  var Ut = function(t2, e2) {
    if (t2.isEqualTo(e2))
      return ["", ""];
    const i2 = qt(t2, e2), { length: n2 } = i2.utf16String;
    let r2;
    if (n2) {
      const { offset: o2 } = i2, s2 = t2.codepoints.slice(0, o2).concat(t2.codepoints.slice(o2 + n2));
      r2 = qt(e2, K.fromCodepoints(s2));
    } else
      r2 = qt(e2, t2);
    return [i2.utf16String.toString(), r2.utf16String.toString()];
  };
  var qt = function(t2, e2) {
    let i2 = 0, n2 = t2.length, r2 = e2.length;
    for (; i2 < n2 && t2.charAt(i2).isEqualTo(e2.charAt(i2)); )
      i2++;
    for (; n2 > i2 + 1 && t2.charAt(n2 - 1).isEqualTo(e2.charAt(r2 - 1)); )
      n2--, r2--;
    return { utf16String: t2.slice(i2, n2), offset: i2 };
  };
  var Vt = class extends tt {
    static fromCommonAttributesOfObjects() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
      if (!t2.length)
        return new this();
      let e2 = Jt(t2[0]), i2 = e2.getKeys();
      return t2.slice(1).forEach((t3) => {
        i2 = e2.getKeysCommonToHash(Jt(t3)), e2 = e2.slice(i2);
      }), e2;
    }
    static box(t2) {
      return Jt(t2);
    }
    constructor() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      super(...arguments), this.values = Ht(t2);
    }
    add(t2, e2) {
      return this.merge(zt(t2, e2));
    }
    remove(t2) {
      return new Vt(Ht(this.values, t2));
    }
    get(t2) {
      return this.values[t2];
    }
    has(t2) {
      return t2 in this.values;
    }
    merge(t2) {
      return new Vt(_t(this.values, Kt(t2)));
    }
    slice(t2) {
      const e2 = {};
      return Array.from(t2).forEach((t3) => {
        this.has(t3) && (e2[t3] = this.values[t3]);
      }), new Vt(e2);
    }
    getKeys() {
      return Object.keys(this.values);
    }
    getKeysCommonToHash(t2) {
      return t2 = Jt(t2), this.getKeys().filter((e2) => this.values[e2] === t2.values[e2]);
    }
    isEqualTo(t2) {
      return et(this.toArray(), Jt(t2).toArray());
    }
    isEmpty() {
      return 0 === this.getKeys().length;
    }
    toArray() {
      if (!this.array) {
        const t2 = [];
        for (const e2 in this.values) {
          const i2 = this.values[e2];
          t2.push(t2.push(e2, i2));
        }
        this.array = t2.slice(0);
      }
      return this.array;
    }
    toObject() {
      return Ht(this.values);
    }
    toJSON() {
      return this.toObject();
    }
    contentsForInspection() {
      return { values: JSON.stringify(this.values) };
    }
  };
  var zt = function(t2, e2) {
    const i2 = {};
    return i2[t2] = e2, i2;
  };
  var _t = function(t2, e2) {
    const i2 = Ht(t2);
    for (const t3 in e2) {
      const n2 = e2[t3];
      i2[t3] = n2;
    }
    return i2;
  };
  var Ht = function(t2, e2) {
    const i2 = {};
    return Object.keys(t2).sort().forEach((n2) => {
      n2 !== e2 && (i2[n2] = t2[n2]);
    }), i2;
  };
  var Jt = function(t2) {
    return t2 instanceof Vt ? t2 : new Vt(t2);
  };
  var Kt = function(t2) {
    return t2 instanceof Vt ? t2.values : t2;
  };
  var Gt = class {
    static groupObjects() {
      let t2, e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], { depth: i2, asTree: n2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      n2 && null == i2 && (i2 = 0);
      const r2 = [];
      return Array.from(e2).forEach((e3) => {
        var o2;
        if (t2) {
          var s2, a2, l2;
          if (null !== (s2 = e3.canBeGrouped) && void 0 !== s2 && s2.call(e3, i2) && null !== (a2 = (l2 = t2[t2.length - 1]).canBeGroupedWith) && void 0 !== a2 && a2.call(l2, e3, i2))
            return void t2.push(e3);
          r2.push(new this(t2, { depth: i2, asTree: n2 })), t2 = null;
        }
        null !== (o2 = e3.canBeGrouped) && void 0 !== o2 && o2.call(e3, i2) ? t2 = [e3] : r2.push(e3);
      }), t2 && r2.push(new this(t2, { depth: i2, asTree: n2 })), r2;
    }
    constructor() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], { depth: e2, asTree: i2 } = arguments.length > 1 ? arguments[1] : void 0;
      this.objects = t2, i2 && (this.depth = e2, this.objects = this.constructor.groupObjects(this.objects, { asTree: i2, depth: this.depth + 1 }));
    }
    getObjects() {
      return this.objects;
    }
    getDepth() {
      return this.depth;
    }
    getCacheKey() {
      const t2 = ["objectGroup"];
      return Array.from(this.getObjects()).forEach((e2) => {
        t2.push(e2.getCacheKey());
      }), t2.join("/");
    }
  };
  var $t = class extends U {
    constructor() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
      super(...arguments), this.objects = {}, Array.from(t2).forEach((t3) => {
        const e2 = JSON.stringify(t3);
        null == this.objects[e2] && (this.objects[e2] = t3);
      });
    }
    find(t2) {
      const e2 = JSON.stringify(t2);
      return this.objects[e2];
    }
  };
  var Xt = class {
    constructor(t2) {
      this.reset(t2);
    }
    add(t2) {
      const e2 = Yt(t2);
      this.elements[e2] = t2;
    }
    remove(t2) {
      const e2 = Yt(t2), i2 = this.elements[e2];
      if (i2)
        return delete this.elements[e2], i2;
    }
    reset() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
      return this.elements = {}, Array.from(t2).forEach((t3) => {
        this.add(t3);
      }), t2;
    }
  };
  var Yt = (t2) => t2.dataset.trixStoreKey;
  var Qt = class extends U {
    isPerforming() {
      return true === this.performing;
    }
    hasPerformed() {
      return true === this.performed;
    }
    hasSucceeded() {
      return this.performed && this.succeeded;
    }
    hasFailed() {
      return this.performed && !this.succeeded;
    }
    getPromise() {
      return this.promise || (this.promise = new Promise((t2, e2) => (this.performing = true, this.perform((i2, n2) => {
        this.succeeded = i2, this.performing = false, this.performed = true, this.succeeded ? t2(n2) : e2(n2);
      })))), this.promise;
    }
    perform(t2) {
      return t2(false);
    }
    release() {
      var t2, e2;
      null === (t2 = this.promise) || void 0 === t2 || null === (e2 = t2.cancel) || void 0 === e2 || e2.call(t2), this.promise = null, this.performing = null, this.performed = null, this.succeeded = null;
    }
  };
  Qt.proxyMethod("getPromise().then"), Qt.proxyMethod("getPromise().catch");
  var Zt = class extends U {
    constructor(t2) {
      let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      super(...arguments), this.object = t2, this.options = e2, this.childViews = [], this.rootView = this;
    }
    getNodes() {
      return this.nodes || (this.nodes = this.createNodes()), this.nodes.map((t2) => t2.cloneNode(true));
    }
    invalidate() {
      var t2;
      return this.nodes = null, this.childViews = [], null === (t2 = this.parentView) || void 0 === t2 ? void 0 : t2.invalidate();
    }
    invalidateViewForObject(t2) {
      var e2;
      return null === (e2 = this.findViewForObject(t2)) || void 0 === e2 ? void 0 : e2.invalidate();
    }
    findOrCreateCachedChildView(t2, e2, i2) {
      let n2 = this.getCachedViewForObject(e2);
      return n2 ? this.recordChildView(n2) : (n2 = this.createChildView(...arguments), this.cacheViewForObject(n2, e2)), n2;
    }
    createChildView(t2, e2) {
      let i2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
      e2 instanceof Gt && (i2.viewClass = t2, t2 = te);
      const n2 = new t2(e2, i2);
      return this.recordChildView(n2);
    }
    recordChildView(t2) {
      return t2.parentView = this, t2.rootView = this.rootView, this.childViews.push(t2), t2;
    }
    getAllChildViews() {
      let t2 = [];
      return this.childViews.forEach((e2) => {
        t2.push(e2), t2 = t2.concat(e2.getAllChildViews());
      }), t2;
    }
    findElement() {
      return this.findElementForObject(this.object);
    }
    findElementForObject(t2) {
      const e2 = null == t2 ? void 0 : t2.id;
      if (e2)
        return this.rootView.element.querySelector("[data-trix-id='".concat(e2, "']"));
    }
    findViewForObject(t2) {
      for (const e2 of this.getAllChildViews())
        if (e2.object === t2)
          return e2;
    }
    getViewCache() {
      return this.rootView !== this ? this.rootView.getViewCache() : this.isViewCachingEnabled() ? (this.viewCache || (this.viewCache = {}), this.viewCache) : void 0;
    }
    isViewCachingEnabled() {
      return false !== this.shouldCacheViews;
    }
    enableViewCaching() {
      this.shouldCacheViews = true;
    }
    disableViewCaching() {
      this.shouldCacheViews = false;
    }
    getCachedViewForObject(t2) {
      var e2;
      return null === (e2 = this.getViewCache()) || void 0 === e2 ? void 0 : e2[t2.getCacheKey()];
    }
    cacheViewForObject(t2, e2) {
      const i2 = this.getViewCache();
      i2 && (i2[e2.getCacheKey()] = t2);
    }
    garbageCollectCachedViews() {
      const t2 = this.getViewCache();
      if (t2) {
        const e2 = this.getAllChildViews().concat(this).map((t3) => t3.object.getCacheKey());
        for (const i2 in t2)
          e2.includes(i2) || delete t2[i2];
      }
    }
  };
  var te = class extends Zt {
    constructor() {
      super(...arguments), this.objectGroup = this.object, this.viewClass = this.options.viewClass, delete this.options.viewClass;
    }
    getChildViews() {
      return this.childViews.length || Array.from(this.objectGroup.getObjects()).forEach((t2) => {
        this.findOrCreateCachedChildView(this.viewClass, t2, this.options);
      }), this.childViews;
    }
    createNodes() {
      const t2 = this.createContainerElement();
      return this.getChildViews().forEach((e2) => {
        Array.from(e2.getNodes()).forEach((e3) => {
          t2.appendChild(e3);
        });
      }), [t2];
    }
    createContainerElement() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.objectGroup.getDepth();
      return this.getChildViews()[0].createContainerElement(t2);
    }
  };
  var { css: ee } = W;
  var ie = class extends Zt {
    constructor() {
      super(...arguments), this.attachment = this.object, this.attachment.uploadProgressDelegate = this, this.attachmentPiece = this.options.piece;
    }
    createContentNodes() {
      return [];
    }
    createNodes() {
      let t2;
      const e2 = t2 = C({ tagName: "figure", className: this.getClassName(), data: this.getData(), editable: false }), i2 = this.getHref();
      return i2 && (t2 = C({ tagName: "a", editable: false, attributes: { href: i2, tabindex: -1 } }), e2.appendChild(t2)), this.attachment.hasContent() ? t2.innerHTML = this.attachment.getContent() : this.createContentNodes().forEach((e3) => {
        t2.appendChild(e3);
      }), t2.appendChild(this.createCaptionElement()), this.attachment.isPending() && (this.progressElement = C({ tagName: "progress", attributes: { class: ee.attachmentProgress, value: this.attachment.getUploadProgress(), max: 100 }, data: { trixMutable: true, trixStoreKey: ["progressElement", this.attachment.id].join("/") } }), e2.appendChild(this.progressElement)), [ne("left"), e2, ne("right")];
    }
    createCaptionElement() {
      const t2 = C({ tagName: "figcaption", className: ee.attachmentCaption }), e2 = this.attachmentPiece.getCaption();
      if (e2)
        t2.classList.add("".concat(ee.attachmentCaption, "--edited")), t2.textContent = e2;
      else {
        let e3, i2;
        const n2 = this.getCaptionConfig();
        if (n2.name && (e3 = this.attachment.getFilename()), n2.size && (i2 = this.attachment.getFormattedFilesize()), e3) {
          const i3 = C({ tagName: "span", className: ee.attachmentName, textContent: e3 });
          t2.appendChild(i3);
        }
        if (i2) {
          e3 && t2.appendChild(document.createTextNode(" "));
          const n3 = C({ tagName: "span", className: ee.attachmentSize, textContent: i2 });
          t2.appendChild(n3);
        }
      }
      return t2;
    }
    getClassName() {
      const t2 = [ee.attachment, "".concat(ee.attachment, "--").concat(this.attachment.getType())], e2 = this.attachment.getExtension();
      return e2 && t2.push("".concat(ee.attachment, "--").concat(e2)), t2.join(" ");
    }
    getData() {
      const t2 = { trixAttachment: JSON.stringify(this.attachment), trixContentType: this.attachment.getContentType(), trixId: this.attachment.id }, { attributes: e2 } = this.attachmentPiece;
      return e2.isEmpty() || (t2.trixAttributes = JSON.stringify(e2)), this.attachment.isPending() && (t2.trixSerialize = false), t2;
    }
    getHref() {
      if (!re(this.attachment.getContent(), "a"))
        return this.attachment.getHref();
    }
    getCaptionConfig() {
      var e2;
      const i2 = this.attachment.getType(), n2 = Ct(null === (e2 = t[i2]) || void 0 === e2 ? void 0 : e2.caption);
      return "file" === i2 && (n2.name = true), n2;
    }
    findProgressElement() {
      var t2;
      return null === (t2 = this.findElement()) || void 0 === t2 ? void 0 : t2.querySelector("progress");
    }
    attachmentDidChangeUploadProgress() {
      const t2 = this.attachment.getUploadProgress(), e2 = this.findProgressElement();
      e2 && (e2.value = t2);
    }
  };
  var ne = (t2) => C({ tagName: "span", textContent: "\uFEFF", data: { trixCursorTarget: t2, trixSerialize: false } });
  var re = function(t2, e2) {
    const i2 = C("div");
    return i2.innerHTML = t2 || "", i2.querySelector(e2);
  };
  var oe = class extends ie {
    constructor() {
      super(...arguments), this.attachment.previewDelegate = this;
    }
    createContentNodes() {
      return this.image = C({ tagName: "img", attributes: { src: "" }, data: { trixMutable: true } }), this.refresh(this.image), [this.image];
    }
    createCaptionElement() {
      const t2 = super.createCaptionElement(...arguments);
      return t2.textContent || t2.setAttribute("data-trix-placeholder", s.captionPlaceholder), t2;
    }
    refresh(t2) {
      var e2;
      t2 || (t2 = null === (e2 = this.findElement()) || void 0 === e2 ? void 0 : e2.querySelector("img"));
      if (t2)
        return this.updateAttributesForImage(t2);
    }
    updateAttributesForImage(t2) {
      const e2 = this.attachment.getURL(), i2 = this.attachment.getPreviewURL();
      if (t2.src = i2 || e2, i2 === e2)
        t2.removeAttribute("data-trix-serialized-attributes");
      else {
        const i3 = JSON.stringify({ src: e2 });
        t2.setAttribute("data-trix-serialized-attributes", i3);
      }
      const n2 = this.attachment.getWidth(), r2 = this.attachment.getHeight();
      null != n2 && (t2.width = n2), null != r2 && (t2.height = r2);
      const o2 = ["imageElement", this.attachment.id, t2.src, t2.width, t2.height].join("/");
      t2.dataset.trixStoreKey = o2;
    }
    attachmentDidChangeAttributes() {
      return this.refresh(this.image), this.refresh();
    }
  };
  var se = class extends Zt {
    constructor() {
      super(...arguments), this.piece = this.object, this.attributes = this.piece.getAttributes(), this.textConfig = this.options.textConfig, this.context = this.options.context, this.piece.attachment ? this.attachment = this.piece.attachment : this.string = this.piece.toString();
    }
    createNodes() {
      let t2 = this.attachment ? this.createAttachmentNodes() : this.createStringNodes();
      const e2 = this.createElement();
      if (e2) {
        const i2 = function(t3) {
          for (; null !== (e3 = t3) && void 0 !== e3 && e3.firstElementChild; ) {
            var e3;
            t3 = t3.firstElementChild;
          }
          return t3;
        }(e2);
        Array.from(t2).forEach((t3) => {
          i2.appendChild(t3);
        }), t2 = [e2];
      }
      return t2;
    }
    createAttachmentNodes() {
      const t2 = this.attachment.isPreviewable() ? oe : ie;
      return this.createChildView(t2, this.piece.attachment, { piece: this.piece }).getNodes();
    }
    createStringNodes() {
      var t2;
      if (null !== (t2 = this.textConfig) && void 0 !== t2 && t2.plaintext)
        return [document.createTextNode(this.string)];
      {
        const t3 = [], e2 = this.string.split("\n");
        for (let i2 = 0; i2 < e2.length; i2++) {
          const n2 = e2[i2];
          if (i2 > 0) {
            const e3 = C("br");
            t3.push(e3);
          }
          if (n2.length) {
            const e3 = document.createTextNode(this.preserveSpaces(n2));
            t3.push(e3);
          }
        }
        return t3;
      }
    }
    createElement() {
      let t2, e2, i2;
      const n2 = {};
      for (e2 in this.attributes) {
        i2 = this.attributes[e2];
        const o2 = dt(e2);
        if (o2) {
          if (o2.tagName) {
            var r2;
            const e3 = C(o2.tagName);
            r2 ? (r2.appendChild(e3), r2 = e3) : t2 = r2 = e3;
          }
          if (o2.styleProperty && (n2[o2.styleProperty] = i2), o2.style)
            for (e2 in o2.style)
              i2 = o2.style[e2], n2[e2] = i2;
        }
      }
      if (Object.keys(n2).length)
        for (e2 in t2 || (t2 = C("span")), n2)
          i2 = n2[e2], t2.style[e2] = i2;
      return t2;
    }
    createContainerElement() {
      for (const t2 in this.attributes) {
        const e2 = this.attributes[t2], i2 = dt(t2);
        if (i2 && i2.groupTagName) {
          const n2 = {};
          return n2[t2] = e2, C(i2.groupTagName, n2);
        }
      }
    }
    preserveSpaces(t2) {
      return this.context.isLast && (t2 = t2.replace(/\ $/, "\xA0")), t2 = t2.replace(/(\S)\ {3}(\S)/g, "$1 ".concat("\xA0", " $2")).replace(/\ {2}/g, "".concat("\xA0", " ")).replace(/\ {2}/g, " ".concat("\xA0")), (this.context.isFirst || this.context.followsWhitespace) && (t2 = t2.replace(/^\ /, "\xA0")), t2;
    }
  };
  var ae = class extends Zt {
    constructor() {
      super(...arguments), this.text = this.object, this.textConfig = this.options.textConfig;
    }
    createNodes() {
      const t2 = [], e2 = Gt.groupObjects(this.getPieces()), i2 = e2.length - 1;
      for (let r2 = 0; r2 < e2.length; r2++) {
        const o2 = e2[r2], s2 = {};
        0 === r2 && (s2.isFirst = true), r2 === i2 && (s2.isLast = true), le(n2) && (s2.followsWhitespace = true);
        const a2 = this.findOrCreateCachedChildView(se, o2, { textConfig: this.textConfig, context: s2 });
        t2.push(...Array.from(a2.getNodes() || []));
        var n2 = o2;
      }
      return t2;
    }
    getPieces() {
      return Array.from(this.text.getPieces()).filter((t2) => !t2.hasAttribute("blockBreak"));
    }
  };
  var le = (t2) => /\s$/.test(null == t2 ? void 0 : t2.toString());
  var { css: ce } = W;
  var he = class extends Zt {
    constructor() {
      super(...arguments), this.block = this.object, this.attributes = this.block.getAttributes();
    }
    createNodes() {
      const t2 = [document.createComment("block")];
      if (this.block.isEmpty())
        t2.push(C("br"));
      else {
        var i2;
        const e2 = null === (i2 = ht(this.block.getLastAttribute())) || void 0 === i2 ? void 0 : i2.text, n2 = this.findOrCreateCachedChildView(ae, this.block.text, { textConfig: e2 });
        t2.push(...Array.from(n2.getNodes() || [])), this.shouldAddExtraNewlineElement() && t2.push(C("br"));
      }
      if (this.attributes.length)
        return t2;
      {
        let i3;
        const { tagName: n2 } = e.default;
        this.block.isRTL() && (i3 = { dir: "rtl" });
        const r2 = C({ tagName: n2, attributes: i3 });
        return t2.forEach((t3) => r2.appendChild(t3)), [r2];
      }
    }
    createContainerElement(t2) {
      let e2, i2;
      const n2 = this.attributes[t2], { tagName: r2 } = ht(n2);
      if (0 === t2 && this.block.isRTL() && (e2 = { dir: "rtl" }), "attachmentGallery" === n2) {
        const t3 = this.block.getBlockBreakPosition();
        i2 = "".concat(ce.attachmentGallery, " ").concat(ce.attachmentGallery, "--").concat(t3);
      }
      return C({ tagName: r2, className: i2, attributes: e2 });
    }
    shouldAddExtraNewlineElement() {
      return /\n\n$/.test(this.block.toString());
    }
  };
  var ue = class extends Zt {
    static render(t2) {
      const e2 = C("div"), i2 = new this(t2, { element: e2 });
      return i2.render(), i2.sync(), e2;
    }
    constructor() {
      super(...arguments), this.element = this.options.element, this.elementStore = new Xt(), this.setDocument(this.object);
    }
    setDocument(t2) {
      t2.isEqualTo(this.document) || (this.document = this.object = t2);
    }
    render() {
      if (this.childViews = [], this.shadowElement = C("div"), !this.document.isEmpty()) {
        const t2 = Gt.groupObjects(this.document.getBlocks(), { asTree: true });
        Array.from(t2).forEach((t3) => {
          const e2 = this.findOrCreateCachedChildView(he, t3);
          Array.from(e2.getNodes()).map((t4) => this.shadowElement.appendChild(t4));
        });
      }
    }
    isSynced() {
      return ge(this.shadowElement, this.element);
    }
    sync() {
      const t2 = this.createDocumentFragmentForSync();
      for (; this.element.lastChild; )
        this.element.removeChild(this.element.lastChild);
      return this.element.appendChild(t2), this.didSync();
    }
    didSync() {
      return this.elementStore.reset(de(this.element)), yt(() => this.garbageCollectCachedViews());
    }
    createDocumentFragmentForSync() {
      const t2 = document.createDocumentFragment();
      return Array.from(this.shadowElement.childNodes).forEach((e2) => {
        t2.appendChild(e2.cloneNode(true));
      }), Array.from(de(t2)).forEach((t3) => {
        const e2 = this.elementStore.remove(t3);
        e2 && t3.parentNode.replaceChild(e2, t3);
      }), t2;
    }
  };
  var de = (t2) => t2.querySelectorAll("[data-trix-store-key]");
  var ge = (t2, e2) => me(t2.innerHTML) === me(e2.innerHTML);
  var me = (t2) => t2.replace(/&nbsp;/g, " ");
  function pe(t2) {
    this.wrapped = t2;
  }
  function fe(t2) {
    var e2, i2;
    function n2(e3, i3) {
      try {
        var o2 = t2[e3](i3), s2 = o2.value, a2 = s2 instanceof pe;
        Promise.resolve(a2 ? s2.wrapped : s2).then(function(t3) {
          a2 ? n2("return" === e3 ? "return" : "next", t3) : r2(o2.done ? "return" : "normal", t3);
        }, function(t3) {
          n2("throw", t3);
        });
      } catch (t3) {
        r2("throw", t3);
      }
    }
    function r2(t3, r3) {
      switch (t3) {
        case "return":
          e2.resolve({ value: r3, done: true });
          break;
        case "throw":
          e2.reject(r3);
          break;
        default:
          e2.resolve({ value: r3, done: false });
      }
      (e2 = e2.next) ? n2(e2.key, e2.arg) : i2 = null;
    }
    this._invoke = function(t3, r3) {
      return new Promise(function(o2, s2) {
        var a2 = { key: t3, arg: r3, resolve: o2, reject: s2, next: null };
        i2 ? i2 = i2.next = a2 : (e2 = i2 = a2, n2(t3, r3));
      });
    }, "function" != typeof t2.return && (this.return = void 0);
  }
  function be(t2, e2, i2) {
    return e2 in t2 ? Object.defineProperty(t2, e2, { value: i2, enumerable: true, configurable: true, writable: true }) : t2[e2] = i2, t2;
  }
  fe.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function() {
    return this;
  }, fe.prototype.next = function(t2) {
    return this._invoke("next", t2);
  }, fe.prototype.throw = function(t2) {
    return this._invoke("throw", t2);
  }, fe.prototype.return = function(t2) {
    return this._invoke("return", t2);
  };
  var ve = class extends tt {
    static registerType(t2, e2) {
      e2.type = t2, this.types[t2] = e2;
    }
    static fromJSON(t2) {
      const e2 = this.types[t2.type];
      if (e2)
        return e2.fromJSON(t2);
    }
    constructor(t2) {
      let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      super(...arguments), this.attributes = Vt.box(e2);
    }
    copyWithAttributes(t2) {
      return new this.constructor(this.getValue(), t2);
    }
    copyWithAdditionalAttributes(t2) {
      return this.copyWithAttributes(this.attributes.merge(t2));
    }
    copyWithoutAttribute(t2) {
      return this.copyWithAttributes(this.attributes.remove(t2));
    }
    copy() {
      return this.copyWithAttributes(this.attributes);
    }
    getAttribute(t2) {
      return this.attributes.get(t2);
    }
    getAttributesHash() {
      return this.attributes;
    }
    getAttributes() {
      return this.attributes.toObject();
    }
    hasAttribute(t2) {
      return this.attributes.has(t2);
    }
    hasSameStringValueAsPiece(t2) {
      return t2 && this.toString() === t2.toString();
    }
    hasSameAttributesAsPiece(t2) {
      return t2 && (this.attributes === t2.attributes || this.attributes.isEqualTo(t2.attributes));
    }
    isBlockBreak() {
      return false;
    }
    isEqualTo(t2) {
      return super.isEqualTo(...arguments) || this.hasSameConstructorAs(t2) && this.hasSameStringValueAsPiece(t2) && this.hasSameAttributesAsPiece(t2);
    }
    isEmpty() {
      return 0 === this.length;
    }
    isSerializable() {
      return true;
    }
    toJSON() {
      return { type: this.constructor.type, attributes: this.getAttributes() };
    }
    contentsForInspection() {
      return { type: this.constructor.type, attributes: this.attributes.inspect() };
    }
    canBeGrouped() {
      return this.hasAttribute("href");
    }
    canBeGroupedWith(t2) {
      return this.getAttribute("href") === t2.getAttribute("href");
    }
    getLength() {
      return this.length;
    }
    canBeConsolidatedWith(t2) {
      return false;
    }
  };
  be(ve, "types", {});
  var Ae = class extends Qt {
    constructor(t2) {
      super(...arguments), this.url = t2;
    }
    perform(t2) {
      const e2 = new Image();
      e2.onload = () => (e2.width = this.width = e2.naturalWidth, e2.height = this.height = e2.naturalHeight, t2(true, e2)), e2.onerror = () => t2(false), e2.src = this.url;
    }
  };
  var xe = class extends tt {
    static attachmentForFile(t2) {
      const e2 = new this(this.attributesForFile(t2));
      return e2.setFile(t2), e2;
    }
    static attributesForFile(t2) {
      return new Vt({ filename: t2.name, filesize: t2.size, contentType: t2.type });
    }
    static fromJSON(t2) {
      return new this(t2);
    }
    constructor() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      super(t2), this.releaseFile = this.releaseFile.bind(this), this.attributes = Vt.box(t2), this.didChangeAttributes();
    }
    getAttribute(t2) {
      return this.attributes.get(t2);
    }
    hasAttribute(t2) {
      return this.attributes.has(t2);
    }
    getAttributes() {
      return this.attributes.toObject();
    }
    setAttributes() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      const e2 = this.attributes.merge(t2);
      var i2, n2, r2, o2;
      if (!this.attributes.isEqualTo(e2))
        return this.attributes = e2, this.didChangeAttributes(), null === (i2 = this.previewDelegate) || void 0 === i2 || null === (n2 = i2.attachmentDidChangeAttributes) || void 0 === n2 || n2.call(i2, this), null === (r2 = this.delegate) || void 0 === r2 || null === (o2 = r2.attachmentDidChangeAttributes) || void 0 === o2 ? void 0 : o2.call(r2, this);
    }
    didChangeAttributes() {
      if (this.isPreviewable())
        return this.preloadURL();
    }
    isPending() {
      return null != this.file && !(this.getURL() || this.getHref());
    }
    isPreviewable() {
      return this.attributes.has("previewable") ? this.attributes.get("previewable") : xe.previewablePattern.test(this.getContentType());
    }
    getType() {
      return this.hasContent() ? "content" : this.isPreviewable() ? "preview" : "file";
    }
    getURL() {
      return this.attributes.get("url");
    }
    getHref() {
      return this.attributes.get("href");
    }
    getFilename() {
      return this.attributes.get("filename") || "";
    }
    getFilesize() {
      return this.attributes.get("filesize");
    }
    getFormattedFilesize() {
      const t2 = this.attributes.get("filesize");
      return "number" == typeof t2 ? l.formatter(t2) : "";
    }
    getExtension() {
      var t2;
      return null === (t2 = this.getFilename().match(/\.(\w+)$/)) || void 0 === t2 ? void 0 : t2[1].toLowerCase();
    }
    getContentType() {
      return this.attributes.get("contentType");
    }
    hasContent() {
      return this.attributes.has("content");
    }
    getContent() {
      return this.attributes.get("content");
    }
    getWidth() {
      return this.attributes.get("width");
    }
    getHeight() {
      return this.attributes.get("height");
    }
    getFile() {
      return this.file;
    }
    setFile(t2) {
      if (this.file = t2, this.isPreviewable())
        return this.preloadFile();
    }
    releaseFile() {
      this.releasePreloadedFile(), this.file = null;
    }
    getUploadProgress() {
      return null != this.uploadProgress ? this.uploadProgress : 0;
    }
    setUploadProgress(t2) {
      var e2, i2;
      if (this.uploadProgress !== t2)
        return this.uploadProgress = t2, null === (e2 = this.uploadProgressDelegate) || void 0 === e2 || null === (i2 = e2.attachmentDidChangeUploadProgress) || void 0 === i2 ? void 0 : i2.call(e2, this);
    }
    toJSON() {
      return this.getAttributes();
    }
    getCacheKey() {
      return [super.getCacheKey(...arguments), this.attributes.getCacheKey(), this.getPreviewURL()].join("/");
    }
    getPreviewURL() {
      return this.previewURL || this.preloadingURL;
    }
    setPreviewURL(t2) {
      var e2, i2, n2, r2;
      if (t2 !== this.getPreviewURL())
        return this.previewURL = t2, null === (e2 = this.previewDelegate) || void 0 === e2 || null === (i2 = e2.attachmentDidChangeAttributes) || void 0 === i2 || i2.call(e2, this), null === (n2 = this.delegate) || void 0 === n2 || null === (r2 = n2.attachmentDidChangePreviewURL) || void 0 === r2 ? void 0 : r2.call(n2, this);
    }
    preloadURL() {
      return this.preload(this.getURL(), this.releaseFile);
    }
    preloadFile() {
      if (this.file)
        return this.fileObjectURL = URL.createObjectURL(this.file), this.preload(this.fileObjectURL);
    }
    releasePreloadedFile() {
      this.fileObjectURL && (URL.revokeObjectURL(this.fileObjectURL), this.fileObjectURL = null);
    }
    preload(t2, e2) {
      if (t2 && t2 !== this.getPreviewURL()) {
        this.preloadingURL = t2;
        return new Ae(t2).then((i2) => {
          let { width: n2, height: r2 } = i2;
          return this.getWidth() && this.getHeight() || this.setAttributes({ width: n2, height: r2 }), this.preloadingURL = null, this.setPreviewURL(t2), null == e2 ? void 0 : e2();
        }).catch(() => (this.preloadingURL = null, null == e2 ? void 0 : e2()));
      }
    }
  };
  be(xe, "previewablePattern", /^image(\/(gif|png|jpe?g)|$)/);
  var ye = class extends ve {
    static fromJSON(t2) {
      return new this(xe.fromJSON(t2.attachment), t2.attributes);
    }
    constructor(t2) {
      super(...arguments), this.attachment = t2, this.length = 1, this.ensureAttachmentExclusivelyHasAttribute("href"), this.attachment.hasContent() || this.removeProhibitedAttributes();
    }
    ensureAttachmentExclusivelyHasAttribute(t2) {
      this.hasAttribute(t2) && (this.attachment.hasAttribute(t2) || this.attachment.setAttributes(this.attributes.slice([t2])), this.attributes = this.attributes.remove(t2));
    }
    removeProhibitedAttributes() {
      const t2 = this.attributes.slice(ye.permittedAttributes);
      t2.isEqualTo(this.attributes) || (this.attributes = t2);
    }
    getValue() {
      return this.attachment;
    }
    isSerializable() {
      return !this.attachment.isPending();
    }
    getCaption() {
      return this.attributes.get("caption") || "";
    }
    isEqualTo(t2) {
      var e2;
      return super.isEqualTo(t2) && this.attachment.id === (null == t2 || null === (e2 = t2.attachment) || void 0 === e2 ? void 0 : e2.id);
    }
    toString() {
      return "\uFFFC";
    }
    toJSON() {
      const t2 = super.toJSON(...arguments);
      return t2.attachment = this.attachment, t2;
    }
    getCacheKey() {
      return [super.getCacheKey(...arguments), this.attachment.getCacheKey()].join("/");
    }
    toConsole() {
      return JSON.stringify(this.toString());
    }
  };
  be(ye, "permittedAttributes", ["caption", "presentation"]), ve.registerType("attachment", ye);
  var Ce = class extends ve {
    static fromJSON(t2) {
      return new this(t2.string, t2.attributes);
    }
    constructor(t2) {
      super(...arguments), this.string = ((t3) => t3.replace(/\r\n/g, "\n"))(t2), this.length = this.string.length;
    }
    getValue() {
      return this.string;
    }
    toString() {
      return this.string.toString();
    }
    isBlockBreak() {
      return "\n" === this.toString() && true === this.getAttribute("blockBreak");
    }
    toJSON() {
      const t2 = super.toJSON(...arguments);
      return t2.string = this.string, t2;
    }
    canBeConsolidatedWith(t2) {
      return t2 && this.hasSameConstructorAs(t2) && this.hasSameAttributesAsPiece(t2);
    }
    consolidateWith(t2) {
      return new this.constructor(this.toString() + t2.toString(), this.attributes);
    }
    splitAtOffset(t2) {
      let e2, i2;
      return 0 === t2 ? (e2 = null, i2 = this) : t2 === this.length ? (e2 = this, i2 = null) : (e2 = new this.constructor(this.string.slice(0, t2), this.attributes), i2 = new this.constructor(this.string.slice(t2), this.attributes)), [e2, i2];
    }
    toConsole() {
      let { string: t2 } = this;
      return t2.length > 15 && (t2 = t2.slice(0, 14) + "\u2026"), JSON.stringify(t2.toString());
    }
  };
  ve.registerType("string", Ce);
  var Re = class extends tt {
    static box(t2) {
      return t2 instanceof this ? t2 : new this(t2);
    }
    constructor() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
      super(...arguments), this.objects = t2.slice(0), this.length = this.objects.length;
    }
    indexOf(t2) {
      return this.objects.indexOf(t2);
    }
    splice() {
      for (var t2 = arguments.length, e2 = new Array(t2), i2 = 0; i2 < t2; i2++)
        e2[i2] = arguments[i2];
      return new this.constructor(it(this.objects, ...e2));
    }
    eachObject(t2) {
      return this.objects.map((e2, i2) => t2(e2, i2));
    }
    insertObjectAtIndex(t2, e2) {
      return this.splice(e2, 0, t2);
    }
    insertSplittableListAtIndex(t2, e2) {
      return this.splice(e2, 0, ...t2.objects);
    }
    insertSplittableListAtPosition(t2, e2) {
      const [i2, n2] = this.splitObjectAtPosition(e2);
      return new this.constructor(i2).insertSplittableListAtIndex(t2, n2);
    }
    editObjectAtIndex(t2, e2) {
      return this.replaceObjectAtIndex(e2(this.objects[t2]), t2);
    }
    replaceObjectAtIndex(t2, e2) {
      return this.splice(e2, 1, t2);
    }
    removeObjectAtIndex(t2) {
      return this.splice(t2, 1);
    }
    getObjectAtIndex(t2) {
      return this.objects[t2];
    }
    getSplittableListInRange(t2) {
      const [e2, i2, n2] = this.splitObjectsAtRange(t2);
      return new this.constructor(e2.slice(i2, n2 + 1));
    }
    selectSplittableList(t2) {
      const e2 = this.objects.filter((e3) => t2(e3));
      return new this.constructor(e2);
    }
    removeObjectsInRange(t2) {
      const [e2, i2, n2] = this.splitObjectsAtRange(t2);
      return new this.constructor(e2).splice(i2, n2 - i2 + 1);
    }
    transformObjectsInRange(t2, e2) {
      const [i2, n2, r2] = this.splitObjectsAtRange(t2), o2 = i2.map((t3, i3) => n2 <= i3 && i3 <= r2 ? e2(t3) : t3);
      return new this.constructor(o2);
    }
    splitObjectsAtRange(t2) {
      let e2, [i2, n2, r2] = this.splitObjectAtPosition(Se(t2));
      return [i2, e2] = new this.constructor(i2).splitObjectAtPosition(ke(t2) + r2), [i2, n2, e2 - 1];
    }
    getObjectAtPosition(t2) {
      const { index: e2 } = this.findIndexAndOffsetAtPosition(t2);
      return this.objects[e2];
    }
    splitObjectAtPosition(t2) {
      let e2, i2;
      const { index: n2, offset: r2 } = this.findIndexAndOffsetAtPosition(t2), o2 = this.objects.slice(0);
      if (null != n2)
        if (0 === r2)
          e2 = n2, i2 = 0;
        else {
          const t3 = this.getObjectAtIndex(n2), [s2, a2] = t3.splitAtOffset(r2);
          o2.splice(n2, 1, s2, a2), e2 = n2 + 1, i2 = s2.getLength() - r2;
        }
      else
        e2 = o2.length, i2 = 0;
      return [o2, e2, i2];
    }
    consolidate() {
      const t2 = [];
      let e2 = this.objects[0];
      return this.objects.slice(1).forEach((i2) => {
        var n2, r2;
        null !== (n2 = (r2 = e2).canBeConsolidatedWith) && void 0 !== n2 && n2.call(r2, i2) ? e2 = e2.consolidateWith(i2) : (t2.push(e2), e2 = i2);
      }), e2 && t2.push(e2), new this.constructor(t2);
    }
    consolidateFromIndexToIndex(t2, e2) {
      const i2 = this.objects.slice(0).slice(t2, e2 + 1), n2 = new this.constructor(i2).consolidate().toArray();
      return this.splice(t2, i2.length, ...n2);
    }
    findIndexAndOffsetAtPosition(t2) {
      let e2, i2 = 0;
      for (e2 = 0; e2 < this.objects.length; e2++) {
        const n2 = i2 + this.objects[e2].getLength();
        if (i2 <= t2 && t2 < n2)
          return { index: e2, offset: t2 - i2 };
        i2 = n2;
      }
      return { index: null, offset: null };
    }
    findPositionAtIndexAndOffset(t2, e2) {
      let i2 = 0;
      for (let n2 = 0; n2 < this.objects.length; n2++) {
        const r2 = this.objects[n2];
        if (n2 < t2)
          i2 += r2.getLength();
        else if (n2 === t2) {
          i2 += e2;
          break;
        }
      }
      return i2;
    }
    getEndPosition() {
      return null == this.endPosition && (this.endPosition = 0, this.objects.forEach((t2) => this.endPosition += t2.getLength())), this.endPosition;
    }
    toString() {
      return this.objects.join("");
    }
    toArray() {
      return this.objects.slice(0);
    }
    toJSON() {
      return this.toArray();
    }
    isEqualTo(t2) {
      return super.isEqualTo(...arguments) || Ee(this.objects, null == t2 ? void 0 : t2.objects);
    }
    contentsForInspection() {
      return { objects: "[".concat(this.objects.map((t2) => t2.inspect()).join(", "), "]") };
    }
  };
  var Ee = function(t2) {
    let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
    if (t2.length !== e2.length)
      return false;
    let i2 = true;
    for (let n2 = 0; n2 < t2.length; n2++) {
      const r2 = t2[n2];
      i2 && !r2.isEqualTo(e2[n2]) && (i2 = false);
    }
    return i2;
  };
  var Se = (t2) => t2[0];
  var ke = (t2) => t2[1];
  var Le = class extends tt {
    static textForAttachmentWithAttributes(t2, e2) {
      return new this([new ye(t2, e2)]);
    }
    static textForStringWithAttributes(t2, e2) {
      return new this([new Ce(t2, e2)]);
    }
    static fromJSON(t2) {
      return new this(Array.from(t2).map((t3) => ve.fromJSON(t3)));
    }
    constructor() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
      super(...arguments);
      const e2 = t2.filter((t3) => !t3.isEmpty());
      this.pieceList = new Re(e2);
    }
    copy() {
      return this.copyWithPieceList(this.pieceList);
    }
    copyWithPieceList(t2) {
      return new this.constructor(t2.consolidate().toArray());
    }
    copyUsingObjectMap(t2) {
      const e2 = this.getPieces().map((e3) => t2.find(e3) || e3);
      return new this.constructor(e2);
    }
    appendText(t2) {
      return this.insertTextAtPosition(t2, this.getLength());
    }
    insertTextAtPosition(t2, e2) {
      return this.copyWithPieceList(this.pieceList.insertSplittableListAtPosition(t2.pieceList, e2));
    }
    removeTextAtRange(t2) {
      return this.copyWithPieceList(this.pieceList.removeObjectsInRange(t2));
    }
    replaceTextAtRange(t2, e2) {
      return this.removeTextAtRange(e2).insertTextAtPosition(t2, e2[0]);
    }
    moveTextFromRangeToPosition(t2, e2) {
      if (t2[0] <= e2 && e2 <= t2[1])
        return;
      const i2 = this.getTextAtRange(t2), n2 = i2.getLength();
      return t2[0] < e2 && (e2 -= n2), this.removeTextAtRange(t2).insertTextAtPosition(i2, e2);
    }
    addAttributeAtRange(t2, e2, i2) {
      const n2 = {};
      return n2[t2] = e2, this.addAttributesAtRange(n2, i2);
    }
    addAttributesAtRange(t2, e2) {
      return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, (e3) => e3.copyWithAdditionalAttributes(t2)));
    }
    removeAttributeAtRange(t2, e2) {
      return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, (e3) => e3.copyWithoutAttribute(t2)));
    }
    setAttributesAtRange(t2, e2) {
      return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, (e3) => e3.copyWithAttributes(t2)));
    }
    getAttributesAtPosition(t2) {
      var e2;
      return (null === (e2 = this.pieceList.getObjectAtPosition(t2)) || void 0 === e2 ? void 0 : e2.getAttributes()) || {};
    }
    getCommonAttributes() {
      const t2 = Array.from(this.pieceList.toArray()).map((t3) => t3.getAttributes());
      return Vt.fromCommonAttributesOfObjects(t2).toObject();
    }
    getCommonAttributesAtRange(t2) {
      return this.getTextAtRange(t2).getCommonAttributes() || {};
    }
    getExpandedRangeForAttributeAtOffset(t2, e2) {
      let i2, n2 = i2 = e2;
      const r2 = this.getLength();
      for (; n2 > 0 && this.getCommonAttributesAtRange([n2 - 1, i2])[t2]; )
        n2--;
      for (; i2 < r2 && this.getCommonAttributesAtRange([e2, i2 + 1])[t2]; )
        i2++;
      return [n2, i2];
    }
    getTextAtRange(t2) {
      return this.copyWithPieceList(this.pieceList.getSplittableListInRange(t2));
    }
    getStringAtRange(t2) {
      return this.pieceList.getSplittableListInRange(t2).toString();
    }
    getStringAtPosition(t2) {
      return this.getStringAtRange([t2, t2 + 1]);
    }
    startsWithString(t2) {
      return this.getStringAtRange([0, t2.length]) === t2;
    }
    endsWithString(t2) {
      const e2 = this.getLength();
      return this.getStringAtRange([e2 - t2.length, e2]) === t2;
    }
    getAttachmentPieces() {
      return this.pieceList.toArray().filter((t2) => !!t2.attachment);
    }
    getAttachments() {
      return this.getAttachmentPieces().map((t2) => t2.attachment);
    }
    getAttachmentAndPositionById(t2) {
      let e2 = 0;
      for (const n2 of this.pieceList.toArray()) {
        var i2;
        if ((null === (i2 = n2.attachment) || void 0 === i2 ? void 0 : i2.id) === t2)
          return { attachment: n2.attachment, position: e2 };
        e2 += n2.length;
      }
      return { attachment: null, position: null };
    }
    getAttachmentById(t2) {
      const { attachment: e2 } = this.getAttachmentAndPositionById(t2);
      return e2;
    }
    getRangeOfAttachment(t2) {
      const e2 = this.getAttachmentAndPositionById(t2.id), i2 = e2.position;
      if (t2 = e2.attachment)
        return [i2, i2 + 1];
    }
    updateAttributesForAttachment(t2, e2) {
      const i2 = this.getRangeOfAttachment(e2);
      return i2 ? this.addAttributesAtRange(t2, i2) : this;
    }
    getLength() {
      return this.pieceList.getEndPosition();
    }
    isEmpty() {
      return 0 === this.getLength();
    }
    isEqualTo(t2) {
      var e2;
      return super.isEqualTo(t2) || (null == t2 || null === (e2 = t2.pieceList) || void 0 === e2 ? void 0 : e2.isEqualTo(this.pieceList));
    }
    isBlockBreak() {
      return 1 === this.getLength() && this.pieceList.getObjectAtIndex(0).isBlockBreak();
    }
    eachPiece(t2) {
      return this.pieceList.eachObject(t2);
    }
    getPieces() {
      return this.pieceList.toArray();
    }
    getPieceAtPosition(t2) {
      return this.pieceList.getObjectAtPosition(t2);
    }
    contentsForInspection() {
      return { pieceList: this.pieceList.inspect() };
    }
    toSerializableText() {
      const t2 = this.pieceList.selectSplittableList((t3) => t3.isSerializable());
      return this.copyWithPieceList(t2);
    }
    toString() {
      return this.pieceList.toString();
    }
    toJSON() {
      return this.pieceList.toJSON();
    }
    toConsole() {
      return JSON.stringify(this.pieceList.toArray().map((t2) => JSON.parse(t2.toConsole())));
    }
    getDirection() {
      return rt(this.toString());
    }
    isRTL() {
      return "rtl" === this.getDirection();
    }
  };
  var De = class extends tt {
    static fromJSON(t2) {
      return new this(Le.fromJSON(t2.text), t2.attributes);
    }
    constructor(t2, e2) {
      super(...arguments), this.text = we(t2 || new Le()), this.attributes = e2 || [];
    }
    isEmpty() {
      return this.text.isBlockBreak();
    }
    isEqualTo(t2) {
      return !!super.isEqualTo(t2) || this.text.isEqualTo(null == t2 ? void 0 : t2.text) && et(this.attributes, null == t2 ? void 0 : t2.attributes);
    }
    copyWithText(t2) {
      return new De(t2, this.attributes);
    }
    copyWithoutText() {
      return this.copyWithText(null);
    }
    copyWithAttributes(t2) {
      return new De(this.text, t2);
    }
    copyWithoutAttributes() {
      return this.copyWithAttributes(null);
    }
    copyUsingObjectMap(t2) {
      const e2 = t2.find(this.text);
      return e2 ? this.copyWithText(e2) : this.copyWithText(this.text.copyUsingObjectMap(t2));
    }
    addAttribute(t2) {
      const e2 = this.attributes.concat(Ne(t2));
      return this.copyWithAttributes(e2);
    }
    removeAttribute(t2) {
      const { listAttribute: e2 } = ht(t2), i2 = Me(Me(this.attributes, t2), e2);
      return this.copyWithAttributes(i2);
    }
    removeLastAttribute() {
      return this.removeAttribute(this.getLastAttribute());
    }
    getLastAttribute() {
      return Oe(this.attributes);
    }
    getAttributes() {
      return this.attributes.slice(0);
    }
    getAttributeLevel() {
      return this.attributes.length;
    }
    getAttributeAtLevel(t2) {
      return this.attributes[t2 - 1];
    }
    hasAttribute(t2) {
      return this.attributes.includes(t2);
    }
    hasAttributes() {
      return this.getAttributeLevel() > 0;
    }
    getLastNestableAttribute() {
      return Oe(this.getNestableAttributes());
    }
    getNestableAttributes() {
      return this.attributes.filter((t2) => ht(t2).nestable);
    }
    getNestingLevel() {
      return this.getNestableAttributes().length;
    }
    decreaseNestingLevel() {
      const t2 = this.getLastNestableAttribute();
      return t2 ? this.removeAttribute(t2) : this;
    }
    increaseNestingLevel() {
      const t2 = this.getLastNestableAttribute();
      if (t2) {
        const e2 = this.attributes.lastIndexOf(t2), i2 = it(this.attributes, e2 + 1, 0, ...Ne(t2));
        return this.copyWithAttributes(i2);
      }
      return this;
    }
    getListItemAttributes() {
      return this.attributes.filter((t2) => ht(t2).listAttribute);
    }
    isListItem() {
      var t2;
      return null === (t2 = ht(this.getLastAttribute())) || void 0 === t2 ? void 0 : t2.listAttribute;
    }
    isTerminalBlock() {
      var t2;
      return null === (t2 = ht(this.getLastAttribute())) || void 0 === t2 ? void 0 : t2.terminal;
    }
    breaksOnReturn() {
      var t2;
      return null === (t2 = ht(this.getLastAttribute())) || void 0 === t2 ? void 0 : t2.breakOnReturn;
    }
    findLineBreakInDirectionFromPosition(t2, e2) {
      const i2 = this.toString();
      let n2;
      switch (t2) {
        case "forward":
          n2 = i2.indexOf("\n", e2);
          break;
        case "backward":
          n2 = i2.slice(0, e2).lastIndexOf("\n");
      }
      if (-1 !== n2)
        return n2;
    }
    contentsForInspection() {
      return { text: this.text.inspect(), attributes: this.attributes };
    }
    toString() {
      return this.text.toString();
    }
    toJSON() {
      return { text: this.text, attributes: this.attributes };
    }
    getDirection() {
      return this.text.getDirection();
    }
    isRTL() {
      return this.text.isRTL();
    }
    getLength() {
      return this.text.getLength();
    }
    canBeConsolidatedWith(t2) {
      return !this.hasAttributes() && !t2.hasAttributes() && this.getDirection() === t2.getDirection();
    }
    consolidateWith(t2) {
      const e2 = Le.textForStringWithAttributes("\n"), i2 = this.getTextWithoutBlockBreak().appendText(e2);
      return this.copyWithText(i2.appendText(t2.text));
    }
    splitAtOffset(t2) {
      let e2, i2;
      return 0 === t2 ? (e2 = null, i2 = this) : t2 === this.getLength() ? (e2 = this, i2 = null) : (e2 = this.copyWithText(this.text.getTextAtRange([0, t2])), i2 = this.copyWithText(this.text.getTextAtRange([t2, this.getLength()]))), [e2, i2];
    }
    getBlockBreakPosition() {
      return this.text.getLength() - 1;
    }
    getTextWithoutBlockBreak() {
      return Ie(this.text) ? this.text.getTextAtRange([0, this.getBlockBreakPosition()]) : this.text.copy();
    }
    canBeGrouped(t2) {
      return this.attributes[t2];
    }
    canBeGroupedWith(t2, i2) {
      const n2 = t2.getAttributes(), r2 = n2[i2], o2 = this.attributes[i2];
      return o2 === r2 && !(false === ht(o2).group && !(() => {
        if (!lt) {
          lt = [];
          for (const t3 in e) {
            const { listAttribute: i3 } = e[t3];
            null != i3 && lt.push(i3);
          }
        }
        return lt;
      })().includes(n2[i2 + 1])) && (this.getDirection() === t2.getDirection() || t2.isEmpty());
    }
  };
  var we = function(t2) {
    return t2 = Te(t2), t2 = Be(t2);
  };
  var Te = function(t2) {
    let e2 = false;
    const i2 = t2.getPieces();
    let n2 = i2.slice(0, i2.length - 1);
    const r2 = i2[i2.length - 1];
    return r2 ? (n2 = n2.map((t3) => t3.isBlockBreak() ? (e2 = true, Pe(t3)) : t3), e2 ? new Le([...n2, r2]) : t2) : t2;
  };
  var Fe = Le.textForStringWithAttributes("\n", { blockBreak: true });
  var Be = function(t2) {
    return Ie(t2) ? t2 : t2.appendText(Fe);
  };
  var Ie = function(t2) {
    const e2 = t2.getLength();
    if (0 === e2)
      return false;
    return t2.getTextAtRange([e2 - 1, e2]).isBlockBreak();
  };
  var Pe = (t2) => t2.copyWithoutAttribute("blockBreak");
  var Ne = function(t2) {
    const { listAttribute: e2 } = ht(t2);
    return e2 ? [e2, t2] : [t2];
  };
  var Oe = (t2) => t2.slice(-1)[0];
  var Me = function(t2, e2) {
    const i2 = t2.lastIndexOf(e2);
    return -1 === i2 ? t2 : it(t2, i2, 1);
  };
  var je = class extends tt {
    static fromJSON(t2) {
      return new this(Array.from(t2).map((t3) => De.fromJSON(t3)));
    }
    static fromString(t2, e2) {
      const i2 = Le.textForStringWithAttributes(t2, e2);
      return new this([new De(i2)]);
    }
    constructor() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
      super(...arguments), 0 === t2.length && (t2 = [new De()]), this.blockList = Re.box(t2);
    }
    isEmpty() {
      const t2 = this.getBlockAtIndex(0);
      return 1 === this.blockList.length && t2.isEmpty() && !t2.hasAttributes();
    }
    copy() {
      const t2 = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}).consolidateBlocks ? this.blockList.consolidate().toArray() : this.blockList.toArray();
      return new this.constructor(t2);
    }
    copyUsingObjectsFromDocument(t2) {
      const e2 = new $t(t2.getObjects());
      return this.copyUsingObjectMap(e2);
    }
    copyUsingObjectMap(t2) {
      const e2 = this.getBlocks().map((e3) => t2.find(e3) || e3.copyUsingObjectMap(t2));
      return new this.constructor(e2);
    }
    copyWithBaseBlockAttributes() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
      const e2 = this.getBlocks().map((e3) => {
        const i2 = t2.concat(e3.getAttributes());
        return e3.copyWithAttributes(i2);
      });
      return new this.constructor(e2);
    }
    replaceBlock(t2, e2) {
      const i2 = this.blockList.indexOf(t2);
      return -1 === i2 ? this : new this.constructor(this.blockList.replaceObjectAtIndex(e2, i2));
    }
    insertDocumentAtRange(t2, e2) {
      const { blockList: i2 } = t2;
      e2 = Et(e2);
      let [n2] = e2;
      const { index: r2, offset: o2 } = this.locationFromPosition(n2);
      let s2 = this;
      const a2 = this.getBlockAtPosition(n2);
      return St(e2) && a2.isEmpty() && !a2.hasAttributes() ? s2 = new this.constructor(s2.blockList.removeObjectAtIndex(r2)) : a2.getBlockBreakPosition() === o2 && n2++, s2 = s2.removeTextAtRange(e2), new this.constructor(s2.blockList.insertSplittableListAtPosition(i2, n2));
    }
    mergeDocumentAtRange(t2, e2) {
      let i2, n2;
      e2 = Et(e2);
      const [r2] = e2, o2 = this.locationFromPosition(r2), s2 = this.getBlockAtIndex(o2.index).getAttributes(), a2 = t2.getBaseBlockAttributes(), l2 = s2.slice(-a2.length);
      if (et(a2, l2)) {
        const e3 = s2.slice(0, -a2.length);
        i2 = t2.copyWithBaseBlockAttributes(e3);
      } else
        i2 = t2.copy({ consolidateBlocks: true }).copyWithBaseBlockAttributes(s2);
      const c2 = i2.getBlockCount(), h2 = i2.getBlockAtIndex(0);
      if (et(s2, h2.getAttributes())) {
        const t3 = h2.getTextWithoutBlockBreak();
        if (n2 = this.insertTextAtRange(t3, e2), c2 > 1) {
          i2 = new this.constructor(i2.getBlocks().slice(1));
          const e3 = r2 + t3.getLength();
          n2 = n2.insertDocumentAtRange(i2, e3);
        }
      } else
        n2 = this.insertDocumentAtRange(i2, e2);
      return n2;
    }
    insertTextAtRange(t2, e2) {
      e2 = Et(e2);
      const [i2] = e2, { index: n2, offset: r2 } = this.locationFromPosition(i2), o2 = this.removeTextAtRange(e2);
      return new this.constructor(o2.blockList.editObjectAtIndex(n2, (e3) => e3.copyWithText(e3.text.insertTextAtPosition(t2, r2))));
    }
    removeTextAtRange(t2) {
      let e2;
      t2 = Et(t2);
      const [i2, n2] = t2;
      if (St(t2))
        return this;
      const [r2, o2] = Array.from(this.locationRangeFromRange(t2)), s2 = r2.index, a2 = r2.offset, l2 = this.getBlockAtIndex(s2), c2 = o2.index, h2 = o2.offset, u2 = this.getBlockAtIndex(c2);
      if (n2 - i2 == 1 && l2.getBlockBreakPosition() === a2 && u2.getBlockBreakPosition() !== h2 && "\n" === u2.text.getStringAtPosition(h2))
        e2 = this.blockList.editObjectAtIndex(c2, (t3) => t3.copyWithText(t3.text.removeTextAtRange([h2, h2 + 1])));
      else {
        let t3;
        const i3 = l2.text.getTextAtRange([0, a2]), n3 = u2.text.getTextAtRange([h2, u2.getLength()]), r3 = i3.appendText(n3);
        t3 = s2 !== c2 && 0 === a2 && l2.getAttributeLevel() >= u2.getAttributeLevel() ? u2.copyWithText(r3) : l2.copyWithText(r3);
        const o3 = c2 + 1 - s2;
        e2 = this.blockList.splice(s2, o3, t3);
      }
      return new this.constructor(e2);
    }
    moveTextFromRangeToPosition(t2, e2) {
      let i2;
      t2 = Et(t2);
      const [n2, r2] = t2;
      if (n2 <= e2 && e2 <= r2)
        return this;
      let o2 = this.getDocumentAtRange(t2), s2 = this.removeTextAtRange(t2);
      const a2 = n2 < e2;
      a2 && (e2 -= o2.getLength());
      const [l2, ...c2] = o2.getBlocks();
      return 0 === c2.length ? (i2 = l2.getTextWithoutBlockBreak(), a2 && (e2 += 1)) : i2 = l2.text, s2 = s2.insertTextAtRange(i2, e2), 0 === c2.length ? s2 : (o2 = new this.constructor(c2), e2 += i2.getLength(), s2.insertDocumentAtRange(o2, e2));
    }
    addAttributeAtRange(t2, e2, i2) {
      let { blockList: n2 } = this;
      return this.eachBlockAtRange(i2, (i3, r2, o2) => n2 = n2.editObjectAtIndex(o2, function() {
        return ht(t2) ? i3.addAttribute(t2, e2) : r2[0] === r2[1] ? i3 : i3.copyWithText(i3.text.addAttributeAtRange(t2, e2, r2));
      })), new this.constructor(n2);
    }
    addAttribute(t2, e2) {
      let { blockList: i2 } = this;
      return this.eachBlock((n2, r2) => i2 = i2.editObjectAtIndex(r2, () => n2.addAttribute(t2, e2))), new this.constructor(i2);
    }
    removeAttributeAtRange(t2, e2) {
      let { blockList: i2 } = this;
      return this.eachBlockAtRange(e2, function(e3, n2, r2) {
        ht(t2) ? i2 = i2.editObjectAtIndex(r2, () => e3.removeAttribute(t2)) : n2[0] !== n2[1] && (i2 = i2.editObjectAtIndex(r2, () => e3.copyWithText(e3.text.removeAttributeAtRange(t2, n2))));
      }), new this.constructor(i2);
    }
    updateAttributesForAttachment(t2, e2) {
      const i2 = this.getRangeOfAttachment(e2), [n2] = Array.from(i2), { index: r2 } = this.locationFromPosition(n2), o2 = this.getTextAtIndex(r2);
      return new this.constructor(this.blockList.editObjectAtIndex(r2, (i3) => i3.copyWithText(o2.updateAttributesForAttachment(t2, e2))));
    }
    removeAttributeForAttachment(t2, e2) {
      const i2 = this.getRangeOfAttachment(e2);
      return this.removeAttributeAtRange(t2, i2);
    }
    insertBlockBreakAtRange(t2) {
      let e2;
      t2 = Et(t2);
      const [i2] = t2, { offset: n2 } = this.locationFromPosition(i2), r2 = this.removeTextAtRange(t2);
      return 0 === n2 && (e2 = [new De()]), new this.constructor(r2.blockList.insertSplittableListAtPosition(new Re(e2), i2));
    }
    applyBlockAttributeAtRange(t2, e2, i2) {
      const n2 = this.expandRangeToLineBreaksAndSplitBlocks(i2);
      let r2 = n2.document;
      i2 = n2.range;
      const o2 = ht(t2);
      if (o2.listAttribute) {
        r2 = r2.removeLastListAttributeAtRange(i2, { exceptAttributeName: t2 });
        const e3 = r2.convertLineBreaksToBlockBreaksInRange(i2);
        r2 = e3.document, i2 = e3.range;
      } else
        r2 = o2.exclusive ? r2.removeBlockAttributesAtRange(i2) : o2.terminal ? r2.removeLastTerminalAttributeAtRange(i2) : r2.consolidateBlocksAtRange(i2);
      return r2.addAttributeAtRange(t2, e2, i2);
    }
    removeLastListAttributeAtRange(t2) {
      let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, { blockList: i2 } = this;
      return this.eachBlockAtRange(t2, function(t3, n2, r2) {
        const o2 = t3.getLastAttribute();
        o2 && ht(o2).listAttribute && o2 !== e2.exceptAttributeName && (i2 = i2.editObjectAtIndex(r2, () => t3.removeAttribute(o2)));
      }), new this.constructor(i2);
    }
    removeLastTerminalAttributeAtRange(t2) {
      let { blockList: e2 } = this;
      return this.eachBlockAtRange(t2, function(t3, i2, n2) {
        const r2 = t3.getLastAttribute();
        r2 && ht(r2).terminal && (e2 = e2.editObjectAtIndex(n2, () => t3.removeAttribute(r2)));
      }), new this.constructor(e2);
    }
    removeBlockAttributesAtRange(t2) {
      let { blockList: e2 } = this;
      return this.eachBlockAtRange(t2, function(t3, i2, n2) {
        t3.hasAttributes() && (e2 = e2.editObjectAtIndex(n2, () => t3.copyWithoutAttributes()));
      }), new this.constructor(e2);
    }
    expandRangeToLineBreaksAndSplitBlocks(t2) {
      let e2;
      t2 = Et(t2);
      let [i2, n2] = t2;
      const r2 = this.locationFromPosition(i2), o2 = this.locationFromPosition(n2);
      let s2 = this;
      const a2 = s2.getBlockAtIndex(r2.index);
      if (r2.offset = a2.findLineBreakInDirectionFromPosition("backward", r2.offset), null != r2.offset && (e2 = s2.positionFromLocation(r2), s2 = s2.insertBlockBreakAtRange([e2, e2 + 1]), o2.index += 1, o2.offset -= s2.getBlockAtIndex(r2.index).getLength(), r2.index += 1), r2.offset = 0, 0 === o2.offset && o2.index > r2.index)
        o2.index -= 1, o2.offset = s2.getBlockAtIndex(o2.index).getBlockBreakPosition();
      else {
        const t3 = s2.getBlockAtIndex(o2.index);
        "\n" === t3.text.getStringAtRange([o2.offset - 1, o2.offset]) ? o2.offset -= 1 : o2.offset = t3.findLineBreakInDirectionFromPosition("forward", o2.offset), o2.offset !== t3.getBlockBreakPosition() && (e2 = s2.positionFromLocation(o2), s2 = s2.insertBlockBreakAtRange([e2, e2 + 1]));
      }
      return i2 = s2.positionFromLocation(r2), n2 = s2.positionFromLocation(o2), { document: s2, range: t2 = Et([i2, n2]) };
    }
    convertLineBreaksToBlockBreaksInRange(t2) {
      t2 = Et(t2);
      let [e2] = t2;
      const i2 = this.getStringAtRange(t2).slice(0, -1);
      let n2 = this;
      return i2.replace(/.*?\n/g, function(t3) {
        e2 += t3.length, n2 = n2.insertBlockBreakAtRange([e2 - 1, e2]);
      }), { document: n2, range: t2 };
    }
    consolidateBlocksAtRange(t2) {
      t2 = Et(t2);
      const [e2, i2] = t2, n2 = this.locationFromPosition(e2).index, r2 = this.locationFromPosition(i2).index;
      return new this.constructor(this.blockList.consolidateFromIndexToIndex(n2, r2));
    }
    getDocumentAtRange(t2) {
      t2 = Et(t2);
      const e2 = this.blockList.getSplittableListInRange(t2).toArray();
      return new this.constructor(e2);
    }
    getStringAtRange(t2) {
      let e2;
      const i2 = t2 = Et(t2);
      return i2[i2.length - 1] !== this.getLength() && (e2 = -1), this.getDocumentAtRange(t2).toString().slice(0, e2);
    }
    getBlockAtIndex(t2) {
      return this.blockList.getObjectAtIndex(t2);
    }
    getBlockAtPosition(t2) {
      const { index: e2 } = this.locationFromPosition(t2);
      return this.getBlockAtIndex(e2);
    }
    getTextAtIndex(t2) {
      var e2;
      return null === (e2 = this.getBlockAtIndex(t2)) || void 0 === e2 ? void 0 : e2.text;
    }
    getTextAtPosition(t2) {
      const { index: e2 } = this.locationFromPosition(t2);
      return this.getTextAtIndex(e2);
    }
    getPieceAtPosition(t2) {
      const { index: e2, offset: i2 } = this.locationFromPosition(t2);
      return this.getTextAtIndex(e2).getPieceAtPosition(i2);
    }
    getCharacterAtPosition(t2) {
      const { index: e2, offset: i2 } = this.locationFromPosition(t2);
      return this.getTextAtIndex(e2).getStringAtRange([i2, i2 + 1]);
    }
    getLength() {
      return this.blockList.getEndPosition();
    }
    getBlocks() {
      return this.blockList.toArray();
    }
    getBlockCount() {
      return this.blockList.length;
    }
    getEditCount() {
      return this.editCount;
    }
    eachBlock(t2) {
      return this.blockList.eachObject(t2);
    }
    eachBlockAtRange(t2, e2) {
      let i2, n2;
      t2 = Et(t2);
      const [r2, o2] = t2, s2 = this.locationFromPosition(r2), a2 = this.locationFromPosition(o2);
      if (s2.index === a2.index)
        return i2 = this.getBlockAtIndex(s2.index), n2 = [s2.offset, a2.offset], e2(i2, n2, s2.index);
      for (let t3 = s2.index; t3 <= a2.index; t3++)
        if (i2 = this.getBlockAtIndex(t3), i2) {
          switch (t3) {
            case s2.index:
              n2 = [s2.offset, i2.text.getLength()];
              break;
            case a2.index:
              n2 = [0, a2.offset];
              break;
            default:
              n2 = [0, i2.text.getLength()];
          }
          e2(i2, n2, t3);
        }
    }
    getCommonAttributesAtRange(t2) {
      t2 = Et(t2);
      const [e2] = t2;
      if (St(t2))
        return this.getCommonAttributesAtPosition(e2);
      {
        const e3 = [], i2 = [];
        return this.eachBlockAtRange(t2, function(t3, n2) {
          if (n2[0] !== n2[1])
            return e3.push(t3.text.getCommonAttributesAtRange(n2)), i2.push(We(t3));
        }), Vt.fromCommonAttributesOfObjects(e3).merge(Vt.fromCommonAttributesOfObjects(i2)).toObject();
      }
    }
    getCommonAttributesAtPosition(t2) {
      let e2, i2;
      const { index: n2, offset: r2 } = this.locationFromPosition(t2), o2 = this.getBlockAtIndex(n2);
      if (!o2)
        return {};
      const s2 = We(o2), a2 = o2.text.getAttributesAtPosition(r2), l2 = o2.text.getAttributesAtPosition(r2 - 1), c2 = Object.keys(O).filter((t3) => O[t3].inheritable);
      for (e2 in l2)
        i2 = l2[e2], (i2 === a2[e2] || c2.includes(e2)) && (s2[e2] = i2);
      return s2;
    }
    getRangeOfCommonAttributeAtPosition(t2, e2) {
      const { index: i2, offset: n2 } = this.locationFromPosition(e2), r2 = this.getTextAtIndex(i2), [o2, s2] = Array.from(r2.getExpandedRangeForAttributeAtOffset(t2, n2)), a2 = this.positionFromLocation({ index: i2, offset: o2 }), l2 = this.positionFromLocation({ index: i2, offset: s2 });
      return Et([a2, l2]);
    }
    getBaseBlockAttributes() {
      let t2 = this.getBlockAtIndex(0).getAttributes();
      for (let e2 = 1; e2 < this.getBlockCount(); e2++) {
        const i2 = this.getBlockAtIndex(e2).getAttributes(), n2 = Math.min(t2.length, i2.length);
        t2 = (() => {
          const e3 = [];
          for (let r2 = 0; r2 < n2 && i2[r2] === t2[r2]; r2++)
            e3.push(i2[r2]);
          return e3;
        })();
      }
      return t2;
    }
    getAttachmentById(t2) {
      for (const e2 of this.getAttachments())
        if (e2.id === t2)
          return e2;
    }
    getAttachmentPieces() {
      let t2 = [];
      return this.blockList.eachObject((e2) => {
        let { text: i2 } = e2;
        return t2 = t2.concat(i2.getAttachmentPieces());
      }), t2;
    }
    getAttachments() {
      return this.getAttachmentPieces().map((t2) => t2.attachment);
    }
    getRangeOfAttachment(t2) {
      let e2 = 0;
      const i2 = this.blockList.toArray();
      for (let n2 = 0; n2 < i2.length; n2++) {
        const { text: r2 } = i2[n2], o2 = r2.getRangeOfAttachment(t2);
        if (o2)
          return Et([e2 + o2[0], e2 + o2[1]]);
        e2 += r2.getLength();
      }
    }
    getLocationRangeOfAttachment(t2) {
      const e2 = this.getRangeOfAttachment(t2);
      return this.locationRangeFromRange(e2);
    }
    getAttachmentPieceForAttachment(t2) {
      for (const e2 of this.getAttachmentPieces())
        if (e2.attachment === t2)
          return e2;
    }
    findRangesForBlockAttribute(t2) {
      let e2 = 0;
      const i2 = [];
      return this.getBlocks().forEach((n2) => {
        const r2 = n2.getLength();
        n2.hasAttribute(t2) && i2.push([e2, e2 + r2]), e2 += r2;
      }), i2;
    }
    findRangesForTextAttribute(t2) {
      let { withValue: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, i2 = 0, n2 = [];
      const r2 = [];
      return this.getPieces().forEach((o2) => {
        const s2 = o2.getLength();
        (function(i3) {
          return e2 ? i3.getAttribute(t2) === e2 : i3.hasAttribute(t2);
        })(o2) && (n2[1] === i2 ? n2[1] = i2 + s2 : r2.push(n2 = [i2, i2 + s2])), i2 += s2;
      }), r2;
    }
    locationFromPosition(t2) {
      const e2 = this.blockList.findIndexAndOffsetAtPosition(Math.max(0, t2));
      if (null != e2.index)
        return e2;
      {
        const t3 = this.getBlocks();
        return { index: t3.length - 1, offset: t3[t3.length - 1].getLength() };
      }
    }
    positionFromLocation(t2) {
      return this.blockList.findPositionAtIndexAndOffset(t2.index, t2.offset);
    }
    locationRangeFromPosition(t2) {
      return Et(this.locationFromPosition(t2));
    }
    locationRangeFromRange(t2) {
      if (!(t2 = Et(t2)))
        return;
      const [e2, i2] = Array.from(t2), n2 = this.locationFromPosition(e2), r2 = this.locationFromPosition(i2);
      return Et([n2, r2]);
    }
    rangeFromLocationRange(t2) {
      let e2;
      t2 = Et(t2);
      const i2 = this.positionFromLocation(t2[0]);
      return St(t2) || (e2 = this.positionFromLocation(t2[1])), Et([i2, e2]);
    }
    isEqualTo(t2) {
      return this.blockList.isEqualTo(null == t2 ? void 0 : t2.blockList);
    }
    getTexts() {
      return this.getBlocks().map((t2) => t2.text);
    }
    getPieces() {
      const t2 = [];
      return Array.from(this.getTexts()).forEach((e2) => {
        t2.push(...Array.from(e2.getPieces() || []));
      }), t2;
    }
    getObjects() {
      return this.getBlocks().concat(this.getTexts()).concat(this.getPieces());
    }
    toSerializableDocument() {
      const t2 = [];
      return this.blockList.eachObject((e2) => t2.push(e2.copyWithText(e2.text.toSerializableText()))), new this.constructor(t2);
    }
    toString() {
      return this.blockList.toString();
    }
    toJSON() {
      return this.blockList.toJSON();
    }
    toConsole() {
      return JSON.stringify(this.blockList.toArray()).map((t2) => JSON.parse(t2.text.toConsole()));
    }
  };
  var We = function(t2) {
    const e2 = {}, i2 = t2.getLastAttribute();
    return i2 && (e2[i2] = true), e2;
  };
  var Ue = "style href src width height class".split(" ");
  var qe = "javascript:".split(" ");
  var Ve = "script iframe".split(" ");
  var ze = class extends U {
    static sanitize(t2, e2) {
      const i2 = new this(t2, e2);
      return i2.sanitize(), i2;
    }
    constructor(t2) {
      let { allowedAttributes: e2, forbiddenProtocols: i2, forbiddenElements: n2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      super(...arguments), this.allowedAttributes = e2 || Ue, this.forbiddenProtocols = i2 || qe, this.forbiddenElements = n2 || Ve, this.body = _e(t2);
    }
    sanitize() {
      return this.sanitizeElements(), this.normalizeListElementNesting();
    }
    getHTML() {
      return this.body.innerHTML;
    }
    getBody() {
      return this.body;
    }
    sanitizeElements() {
      const t2 = x(this.body), e2 = [];
      for (; t2.nextNode(); ) {
        const i2 = t2.currentNode;
        switch (i2.nodeType) {
          case Node.ELEMENT_NODE:
            this.elementIsRemovable(i2) ? e2.push(i2) : this.sanitizeElement(i2);
            break;
          case Node.COMMENT_NODE:
            e2.push(i2);
        }
      }
      return e2.forEach((t3) => A(t3)), this.body;
    }
    sanitizeElement(t2) {
      return t2.hasAttribute("href") && this.forbiddenProtocols.includes(t2.protocol) && t2.removeAttribute("href"), Array.from(t2.attributes).forEach((e2) => {
        let { name: i2 } = e2;
        this.allowedAttributes.includes(i2) || 0 === i2.indexOf("data-trix") || t2.removeAttribute(i2);
      }), t2;
    }
    normalizeListElementNesting() {
      return Array.from(this.body.querySelectorAll("ul,ol")).forEach((t2) => {
        const e2 = t2.previousElementSibling;
        e2 && "li" === y(e2) && e2.appendChild(t2);
      }), this.body;
    }
    elementIsRemovable(t2) {
      if ((null == t2 ? void 0 : t2.nodeType) === Node.ELEMENT_NODE)
        return this.elementIsForbidden(t2) || this.elementIsntSerializable(t2);
    }
    elementIsForbidden(t2) {
      return this.forbiddenElements.includes(y(t2));
    }
    elementIsntSerializable(t2) {
      return "false" === t2.getAttribute("data-trix-serialize") && !F(t2);
    }
  };
  var _e = function() {
    let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
    t2 = t2.replace(/<\/html[^>]*>[^]*$/i, "</html>");
    const e2 = document.implementation.createHTMLDocument("");
    return e2.documentElement.innerHTML = t2, Array.from(e2.head.querySelectorAll("style")).forEach((t3) => {
      e2.body.appendChild(t3);
    }), e2.body;
  };
  var He = function(t2) {
    let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const i2 = "string";
    return { string: t2 = Mt(t2), attributes: e2, type: i2 };
  };
  var Je = (t2, e2) => {
    try {
      return JSON.parse(t2.getAttribute("data-trix-".concat(e2)));
    } catch (t3) {
      return {};
    }
  };
  var Ke = class extends U {
    static parse(t2, e2) {
      const i2 = new this(t2, e2);
      return i2.parse(), i2;
    }
    constructor(t2) {
      let { referenceElement: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      super(...arguments), this.html = t2, this.referenceElement = e2, this.blocks = [], this.blockElements = [], this.processedElements = [];
    }
    getDocument() {
      return je.fromJSON(this.blocks);
    }
    parse() {
      try {
        this.createHiddenContainer();
        const t2 = ze.sanitize(this.html).getHTML();
        this.containerElement.innerHTML = t2;
        const e2 = x(this.containerElement, { usingFilter: Ye });
        for (; e2.nextNode(); )
          this.processNode(e2.currentNode);
        return this.translateBlockElementMarginsToNewlines();
      } finally {
        this.removeHiddenContainer();
      }
    }
    createHiddenContainer() {
      return this.referenceElement ? (this.containerElement = this.referenceElement.cloneNode(false), this.containerElement.removeAttribute("id"), this.containerElement.setAttribute("data-trix-internal", ""), this.containerElement.style.display = "none", this.referenceElement.parentNode.insertBefore(this.containerElement, this.referenceElement.nextSibling)) : (this.containerElement = C({ tagName: "div", style: { display: "none" } }), document.body.appendChild(this.containerElement));
    }
    removeHiddenContainer() {
      return A(this.containerElement);
    }
    processNode(t2) {
      switch (t2.nodeType) {
        case Node.TEXT_NODE:
          if (!this.isInsignificantTextNode(t2))
            return this.appendBlockForTextNode(t2), this.processTextNode(t2);
          break;
        case Node.ELEMENT_NODE:
          return this.appendBlockForElement(t2), this.processElement(t2);
      }
    }
    appendBlockForTextNode(t2) {
      const e2 = t2.parentNode;
      if (e2 === this.currentBlockElement && this.isBlockElement(t2.previousSibling))
        return this.appendStringWithAttributes("\n");
      if (e2 === this.containerElement || this.isBlockElement(e2)) {
        var i2;
        const t3 = this.getBlockAttributes(e2);
        et(t3, null === (i2 = this.currentBlock) || void 0 === i2 ? void 0 : i2.attributes) || (this.currentBlock = this.appendBlockForAttributesWithElement(t3, e2), this.currentBlockElement = e2);
      }
    }
    appendBlockForElement(t2) {
      const e2 = this.isBlockElement(t2), i2 = b(this.currentBlockElement, t2);
      if (e2 && !this.isBlockElement(t2.firstChild)) {
        if (!this.isInsignificantTextNode(t2.firstChild) || !this.isBlockElement(t2.firstElementChild)) {
          const e3 = this.getBlockAttributes(t2);
          if (t2.firstChild) {
            if (i2 && et(e3, this.currentBlock.attributes))
              return this.appendStringWithAttributes("\n");
            this.currentBlock = this.appendBlockForAttributesWithElement(e3, t2), this.currentBlockElement = t2;
          }
        }
      } else if (this.currentBlockElement && !i2 && !e2) {
        const e3 = this.findParentBlockElement(t2);
        if (e3)
          return this.appendBlockForElement(e3);
        this.currentBlock = this.appendEmptyBlock(), this.currentBlockElement = null;
      }
    }
    findParentBlockElement(t2) {
      let { parentElement: e2 } = t2;
      for (; e2 && e2 !== this.containerElement; ) {
        if (this.isBlockElement(e2) && this.blockElements.includes(e2))
          return e2;
        e2 = e2.parentElement;
      }
      return null;
    }
    processTextNode(t2) {
      let e2 = t2.data;
      var i2;
      Ge(t2.parentNode) || (e2 = Wt(e2), ti(null === (i2 = t2.previousSibling) || void 0 === i2 ? void 0 : i2.textContent) && (e2 = Qe(e2)));
      return this.appendStringWithAttributes(e2, this.getTextAttributes(t2.parentNode));
    }
    processElement(t2) {
      let e2;
      if (F(t2)) {
        if (e2 = Je(t2, "attachment"), Object.keys(e2).length) {
          const i2 = this.getTextAttributes(t2);
          this.appendAttachmentWithAttributes(e2, i2), t2.innerHTML = "";
        }
        return this.processedElements.push(t2);
      }
      switch (y(t2)) {
        case "br":
          return this.isExtraBR(t2) || this.isBlockElement(t2.nextSibling) || this.appendStringWithAttributes("\n", this.getTextAttributes(t2)), this.processedElements.push(t2);
        case "img":
          e2 = { url: t2.getAttribute("src"), contentType: "image" };
          const i2 = ((t3) => {
            const e3 = t3.getAttribute("width"), i3 = t3.getAttribute("height"), n2 = {};
            return e3 && (n2.width = parseInt(e3, 10)), i3 && (n2.height = parseInt(i3, 10)), n2;
          })(t2);
          for (const t3 in i2) {
            const n2 = i2[t3];
            e2[t3] = n2;
          }
          return this.appendAttachmentWithAttributes(e2, this.getTextAttributes(t2)), this.processedElements.push(t2);
        case "tr":
          if (this.needsTableSeparator(t2))
            return this.appendStringWithAttributes(N.tableRowSeparator);
          break;
        case "td":
          if (this.needsTableSeparator(t2))
            return this.appendStringWithAttributes(N.tableCellSeparator);
      }
    }
    appendBlockForAttributesWithElement(t2, e2) {
      this.blockElements.push(e2);
      const i2 = function() {
        return { text: [], attributes: arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {} };
      }(t2);
      return this.blocks.push(i2), i2;
    }
    appendEmptyBlock() {
      return this.appendBlockForAttributesWithElement([], null);
    }
    appendStringWithAttributes(t2, e2) {
      return this.appendPiece(He(t2, e2));
    }
    appendAttachmentWithAttributes(t2, e2) {
      return this.appendPiece(function(t3) {
        return { attachment: t3, attributes: arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, type: "attachment" };
      }(t2, e2));
    }
    appendPiece(t2) {
      return 0 === this.blocks.length && this.appendEmptyBlock(), this.blocks[this.blocks.length - 1].text.push(t2);
    }
    appendStringToTextAtIndex(t2, e2) {
      const { text: i2 } = this.blocks[e2], n2 = i2[i2.length - 1];
      if ("string" !== (null == n2 ? void 0 : n2.type))
        return i2.push(He(t2));
      n2.string += t2;
    }
    prependStringToTextAtIndex(t2, e2) {
      const { text: i2 } = this.blocks[e2], n2 = i2[0];
      if ("string" !== (null == n2 ? void 0 : n2.type))
        return i2.unshift(He(t2));
      n2.string = t2 + n2.string;
    }
    getTextAttributes(t2) {
      let e2;
      const i2 = {};
      for (const n2 in O) {
        const r2 = O[n2];
        if (r2.tagName && p(t2, { matchingSelector: r2.tagName, untilNode: this.containerElement }))
          i2[n2] = true;
        else if (r2.parser) {
          if (e2 = r2.parser(t2), e2) {
            let o2 = false;
            for (const i3 of this.findBlockElementAncestors(t2))
              if (r2.parser(i3) === e2) {
                o2 = true;
                break;
              }
            o2 || (i2[n2] = e2);
          }
        } else
          r2.styleProperty && (e2 = t2.style[r2.styleProperty], e2 && (i2[n2] = e2));
      }
      if (F(t2)) {
        const n2 = Je(t2, "attributes");
        for (const t3 in n2)
          e2 = n2[t3], i2[t3] = e2;
      }
      return i2;
    }
    getBlockAttributes(t2) {
      const i2 = [];
      for (; t2 && t2 !== this.containerElement; ) {
        for (const r2 in e) {
          const o2 = e[r2];
          var n2;
          if (false !== o2.parse) {
            if (y(t2) === o2.tagName)
              (null !== (n2 = o2.test) && void 0 !== n2 && n2.call(o2, t2) || !o2.test) && (i2.push(r2), o2.listAttribute && i2.push(o2.listAttribute));
          }
        }
        t2 = t2.parentNode;
      }
      return i2.reverse();
    }
    findBlockElementAncestors(t2) {
      const e2 = [];
      for (; t2 && t2 !== this.containerElement; ) {
        const i2 = y(t2);
        E().includes(i2) && e2.push(t2), t2 = t2.parentNode;
      }
      return e2;
    }
    isBlockElement(t2) {
      if ((null == t2 ? void 0 : t2.nodeType) === Node.ELEMENT_NODE && !F(t2) && !p(t2, { matchingSelector: "td", untilNode: this.containerElement }))
        return E().includes(y(t2)) || "block" === window.getComputedStyle(t2).display;
    }
    isInsignificantTextNode(t2) {
      if ((null == t2 ? void 0 : t2.nodeType) !== Node.TEXT_NODE)
        return;
      if (!Ze(t2.data))
        return;
      const { parentNode: e2, previousSibling: i2, nextSibling: n2 } = t2;
      return $e(e2.previousSibling) && !this.isBlockElement(e2.previousSibling) || Ge(e2) ? void 0 : !i2 || this.isBlockElement(i2) || !n2 || this.isBlockElement(n2);
    }
    isExtraBR(t2) {
      return "br" === y(t2) && this.isBlockElement(t2.parentNode) && t2.parentNode.lastChild === t2;
    }
    needsTableSeparator(t2) {
      if (N.removeBlankTableCells) {
        var e2;
        const i2 = null === (e2 = t2.previousSibling) || void 0 === e2 ? void 0 : e2.textContent;
        return i2 && /\S/.test(i2);
      }
      return t2.previousSibling;
    }
    translateBlockElementMarginsToNewlines() {
      const t2 = this.getMarginOfDefaultBlockElement();
      for (let e2 = 0; e2 < this.blocks.length; e2++) {
        const i2 = this.getMarginOfBlockElementAtIndex(e2);
        i2 && (i2.top > 2 * t2.top && this.prependStringToTextAtIndex("\n", e2), i2.bottom > 2 * t2.bottom && this.appendStringToTextAtIndex("\n", e2));
      }
    }
    getMarginOfBlockElementAtIndex(t2) {
      const e2 = this.blockElements[t2];
      if (e2 && e2.textContent && !E().includes(y(e2)) && !this.processedElements.includes(e2))
        return Xe(e2);
    }
    getMarginOfDefaultBlockElement() {
      const t2 = C(e.default.tagName);
      return this.containerElement.appendChild(t2), Xe(t2);
    }
  };
  var Ge = function(t2) {
    const { whiteSpace: e2 } = window.getComputedStyle(t2);
    return ["pre", "pre-wrap", "pre-line"].includes(e2);
  };
  var $e = (t2) => t2 && !ti(t2.textContent);
  var Xe = function(t2) {
    const e2 = window.getComputedStyle(t2);
    if ("block" === e2.display)
      return { top: parseInt(e2.marginTop), bottom: parseInt(e2.marginBottom) };
  };
  var Ye = function(t2) {
    return "style" === y(t2) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
  };
  var Qe = (t2) => t2.replace(new RegExp("^".concat(jt.source, "+")), "");
  var Ze = (t2) => new RegExp("^".concat(jt.source, "*$")).test(t2);
  var ti = (t2) => /\s$/.test(t2);
  var ei = ["contenteditable", "data-trix-id", "data-trix-store-key", "data-trix-mutable", "data-trix-placeholder", "tabindex"];
  var ii = "[".concat("data-trix-serialized-attributes", "]");
  var ni = new RegExp("<!--block-->", "g");
  var ri = { "application/json": function(t2) {
    let e2;
    if (t2 instanceof je)
      e2 = t2;
    else {
      if (!(t2 instanceof HTMLElement))
        throw new Error("unserializable object");
      e2 = Ke.parse(t2.innerHTML).getDocument();
    }
    return e2.toSerializableDocument().toJSONString();
  }, "text/html": function(t2) {
    let e2;
    if (t2 instanceof je)
      e2 = ue.render(t2);
    else {
      if (!(t2 instanceof HTMLElement))
        throw new Error("unserializable object");
      e2 = t2.cloneNode(true);
    }
    return Array.from(e2.querySelectorAll("[data-trix-serialize=false]")).forEach((t3) => {
      A(t3);
    }), ei.forEach((t3) => {
      Array.from(e2.querySelectorAll("[".concat(t3, "]"))).forEach((e3) => {
        e3.removeAttribute(t3);
      });
    }), Array.from(e2.querySelectorAll(ii)).forEach((t3) => {
      try {
        const e3 = JSON.parse(t3.getAttribute("data-trix-serialized-attributes"));
        t3.removeAttribute("data-trix-serialized-attributes");
        for (const i2 in e3) {
          const n2 = e3[i2];
          t3.setAttribute(i2, n2);
        }
      } catch (t4) {
      }
    }), e2.innerHTML.replace(ni, "");
  } };
  var oi = Object.freeze({ __proto__: null });
  var si = class extends U {
    constructor(t2, e2) {
      super(...arguments), this.attachmentManager = t2, this.attachment = e2, this.id = this.attachment.id, this.file = this.attachment.file;
    }
    remove() {
      return this.attachmentManager.requestRemovalOfAttachment(this.attachment);
    }
  };
  si.proxyMethod("attachment.getAttribute"), si.proxyMethod("attachment.hasAttribute"), si.proxyMethod("attachment.setAttribute"), si.proxyMethod("attachment.getAttributes"), si.proxyMethod("attachment.setAttributes"), si.proxyMethod("attachment.isPending"), si.proxyMethod("attachment.isPreviewable"), si.proxyMethod("attachment.getURL"), si.proxyMethod("attachment.getHref"), si.proxyMethod("attachment.getFilename"), si.proxyMethod("attachment.getFilesize"), si.proxyMethod("attachment.getFormattedFilesize"), si.proxyMethod("attachment.getExtension"), si.proxyMethod("attachment.getContentType"), si.proxyMethod("attachment.getFile"), si.proxyMethod("attachment.setFile"), si.proxyMethod("attachment.releaseFile"), si.proxyMethod("attachment.getUploadProgress"), si.proxyMethod("attachment.setUploadProgress");
  var ai = class extends U {
    constructor() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
      super(...arguments), this.managedAttachments = {}, Array.from(t2).forEach((t3) => {
        this.manageAttachment(t3);
      });
    }
    getAttachments() {
      const t2 = [];
      for (const e2 in this.managedAttachments) {
        const i2 = this.managedAttachments[e2];
        t2.push(i2);
      }
      return t2;
    }
    manageAttachment(t2) {
      return this.managedAttachments[t2.id] || (this.managedAttachments[t2.id] = new si(this, t2)), this.managedAttachments[t2.id];
    }
    attachmentIsManaged(t2) {
      return t2.id in this.managedAttachments;
    }
    requestRemovalOfAttachment(t2) {
      var e2, i2;
      if (this.attachmentIsManaged(t2))
        return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.attachmentManagerDidRequestRemovalOfAttachment) || void 0 === i2 ? void 0 : i2.call(e2, t2);
    }
    unmanageAttachment(t2) {
      const e2 = this.managedAttachments[t2.id];
      return delete this.managedAttachments[t2.id], e2;
    }
  };
  var li = class {
    constructor(t2) {
      this.composition = t2, this.document = this.composition.document;
      const e2 = this.composition.getSelectedRange();
      this.startPosition = e2[0], this.endPosition = e2[1], this.startLocation = this.document.locationFromPosition(this.startPosition), this.endLocation = this.document.locationFromPosition(this.endPosition), this.block = this.document.getBlockAtIndex(this.endLocation.index), this.breaksOnReturn = this.block.breaksOnReturn(), this.previousCharacter = this.block.text.getStringAtPosition(this.endLocation.offset - 1), this.nextCharacter = this.block.text.getStringAtPosition(this.endLocation.offset);
    }
    shouldInsertBlockBreak() {
      return this.block.hasAttributes() && this.block.isListItem() && !this.block.isEmpty() ? 0 !== this.startLocation.offset : this.breaksOnReturn && "\n" !== this.nextCharacter;
    }
    shouldBreakFormattedBlock() {
      return this.block.hasAttributes() && !this.block.isListItem() && (this.breaksOnReturn && "\n" === this.nextCharacter || "\n" === this.previousCharacter);
    }
    shouldDecreaseListLevel() {
      return this.block.hasAttributes() && this.block.isListItem() && this.block.isEmpty();
    }
    shouldPrependListItem() {
      return this.block.isListItem() && 0 === this.startLocation.offset && !this.block.isEmpty();
    }
    shouldRemoveLastBlockAttribute() {
      return this.block.hasAttributes() && !this.block.isListItem() && this.block.isEmpty();
    }
  };
  var ci = class extends U {
    constructor() {
      super(...arguments), this.document = new je(), this.attachments = [], this.currentAttributes = {}, this.revision = 0;
    }
    setDocument(t2) {
      var e2, i2;
      if (!t2.isEqualTo(this.document))
        return this.document = t2, this.refreshAttachments(), this.revision++, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionDidChangeDocument) || void 0 === i2 ? void 0 : i2.call(e2, t2);
    }
    getSnapshot() {
      return { document: this.document, selectedRange: this.getSelectedRange() };
    }
    loadSnapshot(t2) {
      var e2, i2, n2, r2;
      let { document: o2, selectedRange: s2 } = t2;
      return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionWillLoadSnapshot) || void 0 === i2 || i2.call(e2), this.setDocument(null != o2 ? o2 : new je()), this.setSelection(null != s2 ? s2 : [0, 0]), null === (n2 = this.delegate) || void 0 === n2 || null === (r2 = n2.compositionDidLoadSnapshot) || void 0 === r2 ? void 0 : r2.call(n2);
    }
    insertText(t2) {
      let { updatePosition: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { updatePosition: true };
      const i2 = this.getSelectedRange();
      this.setDocument(this.document.insertTextAtRange(t2, i2));
      const n2 = i2[0], r2 = n2 + t2.getLength();
      return e2 && this.setSelection(r2), this.notifyDelegateOfInsertionAtRange([n2, r2]);
    }
    insertBlock() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : new De();
      const e2 = new je([t2]);
      return this.insertDocument(e2);
    }
    insertDocument() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : new je();
      const e2 = this.getSelectedRange();
      this.setDocument(this.document.insertDocumentAtRange(t2, e2));
      const i2 = e2[0], n2 = i2 + t2.getLength();
      return this.setSelection(n2), this.notifyDelegateOfInsertionAtRange([i2, n2]);
    }
    insertString(t2, e2) {
      const i2 = this.getCurrentTextAttributes(), n2 = Le.textForStringWithAttributes(t2, i2);
      return this.insertText(n2, e2);
    }
    insertBlockBreak() {
      const t2 = this.getSelectedRange();
      this.setDocument(this.document.insertBlockBreakAtRange(t2));
      const e2 = t2[0], i2 = e2 + 1;
      return this.setSelection(i2), this.notifyDelegateOfInsertionAtRange([e2, i2]);
    }
    insertLineBreak() {
      const t2 = new li(this);
      if (t2.shouldDecreaseListLevel())
        return this.decreaseListLevel(), this.setSelection(t2.startPosition);
      if (t2.shouldPrependListItem()) {
        const e2 = new je([t2.block.copyWithoutText()]);
        return this.insertDocument(e2);
      }
      return t2.shouldInsertBlockBreak() ? this.insertBlockBreak() : t2.shouldRemoveLastBlockAttribute() ? this.removeLastBlockAttribute() : t2.shouldBreakFormattedBlock() ? this.breakFormattedBlock(t2) : this.insertString("\n");
    }
    insertHTML(t2) {
      const e2 = Ke.parse(t2).getDocument(), i2 = this.getSelectedRange();
      this.setDocument(this.document.mergeDocumentAtRange(e2, i2));
      const n2 = i2[0], r2 = n2 + e2.getLength() - 1;
      return this.setSelection(r2), this.notifyDelegateOfInsertionAtRange([n2, r2]);
    }
    replaceHTML(t2) {
      const e2 = Ke.parse(t2).getDocument().copyUsingObjectsFromDocument(this.document), i2 = this.getLocationRange({ strict: false }), n2 = this.document.rangeFromLocationRange(i2);
      return this.setDocument(e2), this.setSelection(n2);
    }
    insertFile(t2) {
      return this.insertFiles([t2]);
    }
    insertFiles(t2) {
      const e2 = [];
      return Array.from(t2).forEach((t3) => {
        var i2;
        if (null !== (i2 = this.delegate) && void 0 !== i2 && i2.compositionShouldAcceptFile(t3)) {
          const i3 = xe.attachmentForFile(t3);
          e2.push(i3);
        }
      }), this.insertAttachments(e2);
    }
    insertAttachment(t2) {
      return this.insertAttachments([t2]);
    }
    insertAttachments(e2) {
      let i2 = new Le();
      return Array.from(e2).forEach((e3) => {
        var n2;
        const r2 = e3.getType(), o2 = null === (n2 = t[r2]) || void 0 === n2 ? void 0 : n2.presentation, s2 = this.getCurrentTextAttributes();
        o2 && (s2.presentation = o2);
        const a2 = Le.textForAttachmentWithAttributes(e3, s2);
        i2 = i2.appendText(a2);
      }), this.insertText(i2);
    }
    shouldManageDeletingInDirection(t2) {
      const e2 = this.getLocationRange();
      if (St(e2)) {
        if ("backward" === t2 && 0 === e2[0].offset)
          return true;
        if (this.shouldManageMovingCursorInDirection(t2))
          return true;
      } else if (e2[0].index !== e2[1].index)
        return true;
      return false;
    }
    deleteInDirection(t2) {
      let e2, i2, n2, { length: r2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      const o2 = this.getLocationRange();
      let s2 = this.getSelectedRange();
      const a2 = St(s2);
      if (a2 ? i2 = "backward" === t2 && 0 === o2[0].offset : n2 = o2[0].index !== o2[1].index, i2 && this.canDecreaseBlockAttributeLevel()) {
        const t3 = this.getBlock();
        if (t3.isListItem() ? this.decreaseListLevel() : this.decreaseBlockAttributeLevel(), this.setSelection(s2[0]), t3.isEmpty())
          return false;
      }
      return a2 && (s2 = this.getExpandedRangeInDirection(t2, { length: r2 }), "backward" === t2 && (e2 = this.getAttachmentAtRange(s2))), e2 ? (this.editAttachment(e2), false) : (this.setDocument(this.document.removeTextAtRange(s2)), this.setSelection(s2[0]), !i2 && !n2 && void 0);
    }
    moveTextFromRange(t2) {
      const [e2] = Array.from(this.getSelectedRange());
      return this.setDocument(this.document.moveTextFromRangeToPosition(t2, e2)), this.setSelection(e2);
    }
    removeAttachment(t2) {
      const e2 = this.document.getRangeOfAttachment(t2);
      if (e2)
        return this.stopEditingAttachment(), this.setDocument(this.document.removeTextAtRange(e2)), this.setSelection(e2[0]);
    }
    removeLastBlockAttribute() {
      const [t2, e2] = Array.from(this.getSelectedRange()), i2 = this.document.getBlockAtPosition(e2);
      return this.removeCurrentAttribute(i2.getLastAttribute()), this.setSelection(t2);
    }
    insertPlaceholder() {
      return this.placeholderPosition = this.getPosition(), this.insertString(" ");
    }
    selectPlaceholder() {
      if (null != this.placeholderPosition)
        return this.setSelectedRange([this.placeholderPosition, this.placeholderPosition + " ".length]), this.getSelectedRange();
    }
    forgetPlaceholder() {
      this.placeholderPosition = null;
    }
    hasCurrentAttribute(t2) {
      const e2 = this.currentAttributes[t2];
      return null != e2 && false !== e2;
    }
    toggleCurrentAttribute(t2) {
      const e2 = !this.currentAttributes[t2];
      return e2 ? this.setCurrentAttribute(t2, e2) : this.removeCurrentAttribute(t2);
    }
    canSetCurrentAttribute(t2) {
      return ht(t2) ? this.canSetCurrentBlockAttribute(t2) : this.canSetCurrentTextAttribute(t2);
    }
    canSetCurrentTextAttribute(t2) {
      const e2 = this.getSelectedDocument();
      if (e2) {
        for (const t3 of Array.from(e2.getAttachments()))
          if (!t3.hasContent())
            return false;
        return true;
      }
    }
    canSetCurrentBlockAttribute(t2) {
      const e2 = this.getBlock();
      if (e2)
        return !e2.isTerminalBlock();
    }
    setCurrentAttribute(t2, e2) {
      return ht(t2) ? this.setBlockAttribute(t2, e2) : (this.setTextAttribute(t2, e2), this.currentAttributes[t2] = e2, this.notifyDelegateOfCurrentAttributesChange());
    }
    setTextAttribute(t2, e2) {
      const i2 = this.getSelectedRange();
      if (!i2)
        return;
      const [n2, r2] = Array.from(i2);
      if (n2 !== r2)
        return this.setDocument(this.document.addAttributeAtRange(t2, e2, i2));
      if ("href" === t2) {
        const t3 = Le.textForStringWithAttributes(e2, { href: e2 });
        return this.insertText(t3);
      }
    }
    setBlockAttribute(t2, e2) {
      const i2 = this.getSelectedRange();
      if (this.canSetCurrentAttribute(t2))
        return this.setDocument(this.document.applyBlockAttributeAtRange(t2, e2, i2)), this.setSelection(i2);
    }
    removeCurrentAttribute(t2) {
      return ht(t2) ? (this.removeBlockAttribute(t2), this.updateCurrentAttributes()) : (this.removeTextAttribute(t2), delete this.currentAttributes[t2], this.notifyDelegateOfCurrentAttributesChange());
    }
    removeTextAttribute(t2) {
      const e2 = this.getSelectedRange();
      if (e2)
        return this.setDocument(this.document.removeAttributeAtRange(t2, e2));
    }
    removeBlockAttribute(t2) {
      const e2 = this.getSelectedRange();
      if (e2)
        return this.setDocument(this.document.removeAttributeAtRange(t2, e2));
    }
    canDecreaseNestingLevel() {
      var t2;
      return (null === (t2 = this.getBlock()) || void 0 === t2 ? void 0 : t2.getNestingLevel()) > 0;
    }
    canIncreaseNestingLevel() {
      var t2;
      const e2 = this.getBlock();
      if (e2) {
        if (null === (t2 = ht(e2.getLastNestableAttribute())) || void 0 === t2 || !t2.listAttribute)
          return e2.getNestingLevel() > 0;
        {
          const t3 = this.getPreviousBlock();
          if (t3)
            return function() {
              let t4 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
              return et((arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : []).slice(0, t4.length), t4);
            }(t3.getListItemAttributes(), e2.getListItemAttributes());
        }
      }
    }
    decreaseNestingLevel() {
      const t2 = this.getBlock();
      if (t2)
        return this.setDocument(this.document.replaceBlock(t2, t2.decreaseNestingLevel()));
    }
    increaseNestingLevel() {
      const t2 = this.getBlock();
      if (t2)
        return this.setDocument(this.document.replaceBlock(t2, t2.increaseNestingLevel()));
    }
    canDecreaseBlockAttributeLevel() {
      var t2;
      return (null === (t2 = this.getBlock()) || void 0 === t2 ? void 0 : t2.getAttributeLevel()) > 0;
    }
    decreaseBlockAttributeLevel() {
      var t2;
      const e2 = null === (t2 = this.getBlock()) || void 0 === t2 ? void 0 : t2.getLastAttribute();
      if (e2)
        return this.removeCurrentAttribute(e2);
    }
    decreaseListLevel() {
      let [t2] = Array.from(this.getSelectedRange());
      const { index: e2 } = this.document.locationFromPosition(t2);
      let i2 = e2;
      const n2 = this.getBlock().getAttributeLevel();
      let r2 = this.document.getBlockAtIndex(i2 + 1);
      for (; r2 && r2.isListItem() && !(r2.getAttributeLevel() <= n2); )
        i2++, r2 = this.document.getBlockAtIndex(i2 + 1);
      t2 = this.document.positionFromLocation({ index: e2, offset: 0 });
      const o2 = this.document.positionFromLocation({ index: i2, offset: 0 });
      return this.setDocument(this.document.removeLastListAttributeAtRange([t2, o2]));
    }
    updateCurrentAttributes() {
      const t2 = this.getSelectedRange({ ignoreLock: true });
      if (t2) {
        const e2 = this.document.getCommonAttributesAtRange(t2);
        if (Array.from(ct()).forEach((t3) => {
          e2[t3] || this.canSetCurrentAttribute(t3) || (e2[t3] = false);
        }), !Rt(e2, this.currentAttributes))
          return this.currentAttributes = e2, this.notifyDelegateOfCurrentAttributesChange();
      }
    }
    getCurrentAttributes() {
      return c.call({}, this.currentAttributes);
    }
    getCurrentTextAttributes() {
      const t2 = {};
      for (const e2 in this.currentAttributes) {
        const i2 = this.currentAttributes[e2];
        false !== i2 && dt(e2) && (t2[e2] = i2);
      }
      return t2;
    }
    freezeSelection() {
      return this.setCurrentAttribute("frozen", true);
    }
    thawSelection() {
      return this.removeCurrentAttribute("frozen");
    }
    hasFrozenSelection() {
      return this.hasCurrentAttribute("frozen");
    }
    setSelection(t2) {
      var e2;
      const i2 = this.document.locationRangeFromRange(t2);
      return null === (e2 = this.delegate) || void 0 === e2 ? void 0 : e2.compositionDidRequestChangingSelectionToLocationRange(i2);
    }
    getSelectedRange() {
      const t2 = this.getLocationRange();
      if (t2)
        return this.document.rangeFromLocationRange(t2);
    }
    setSelectedRange(t2) {
      const e2 = this.document.locationRangeFromRange(t2);
      return this.getSelectionManager().setLocationRange(e2);
    }
    getPosition() {
      const t2 = this.getLocationRange();
      if (t2)
        return this.document.positionFromLocation(t2[0]);
    }
    getLocationRange(t2) {
      return this.targetLocationRange ? this.targetLocationRange : this.getSelectionManager().getLocationRange(t2) || Et({ index: 0, offset: 0 });
    }
    withTargetLocationRange(t2, e2) {
      let i2;
      this.targetLocationRange = t2;
      try {
        i2 = e2();
      } finally {
        this.targetLocationRange = null;
      }
      return i2;
    }
    withTargetRange(t2, e2) {
      const i2 = this.document.locationRangeFromRange(t2);
      return this.withTargetLocationRange(i2, e2);
    }
    withTargetDOMRange(t2, e2) {
      const i2 = this.createLocationRangeFromDOMRange(t2, { strict: false });
      return this.withTargetLocationRange(i2, e2);
    }
    getExpandedRangeInDirection(t2) {
      let { length: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, [i2, n2] = Array.from(this.getSelectedRange());
      return "backward" === t2 ? e2 ? i2 -= e2 : i2 = this.translateUTF16PositionFromOffset(i2, -1) : e2 ? n2 += e2 : n2 = this.translateUTF16PositionFromOffset(n2, 1), Et([i2, n2]);
    }
    shouldManageMovingCursorInDirection(t2) {
      if (this.editingAttachment)
        return true;
      const e2 = this.getExpandedRangeInDirection(t2);
      return null != this.getAttachmentAtRange(e2);
    }
    moveCursorInDirection(t2) {
      let e2, i2;
      if (this.editingAttachment)
        i2 = this.document.getRangeOfAttachment(this.editingAttachment);
      else {
        const n2 = this.getSelectedRange();
        i2 = this.getExpandedRangeInDirection(t2), e2 = !kt(n2, i2);
      }
      if ("backward" === t2 ? this.setSelectedRange(i2[0]) : this.setSelectedRange(i2[1]), e2) {
        const t3 = this.getAttachmentAtRange(i2);
        if (t3)
          return this.editAttachment(t3);
      }
    }
    expandSelectionInDirection(t2) {
      let { length: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      const i2 = this.getExpandedRangeInDirection(t2, { length: e2 });
      return this.setSelectedRange(i2);
    }
    expandSelectionForEditing() {
      if (this.hasCurrentAttribute("href"))
        return this.expandSelectionAroundCommonAttribute("href");
    }
    expandSelectionAroundCommonAttribute(t2) {
      const e2 = this.getPosition(), i2 = this.document.getRangeOfCommonAttributeAtPosition(t2, e2);
      return this.setSelectedRange(i2);
    }
    selectionContainsAttachments() {
      var t2;
      return (null === (t2 = this.getSelectedAttachments()) || void 0 === t2 ? void 0 : t2.length) > 0;
    }
    selectionIsInCursorTarget() {
      return this.editingAttachment || this.positionIsCursorTarget(this.getPosition());
    }
    positionIsCursorTarget(t2) {
      const e2 = this.document.locationFromPosition(t2);
      if (e2)
        return this.locationIsCursorTarget(e2);
    }
    positionIsBlockBreak(t2) {
      var e2;
      return null === (e2 = this.document.getPieceAtPosition(t2)) || void 0 === e2 ? void 0 : e2.isBlockBreak();
    }
    getSelectedDocument() {
      const t2 = this.getSelectedRange();
      if (t2)
        return this.document.getDocumentAtRange(t2);
    }
    getSelectedAttachments() {
      var t2;
      return null === (t2 = this.getSelectedDocument()) || void 0 === t2 ? void 0 : t2.getAttachments();
    }
    getAttachments() {
      return this.attachments.slice(0);
    }
    refreshAttachments() {
      const t2 = this.document.getAttachments(), { added: e2, removed: i2 } = function() {
        let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
        const i3 = [], n2 = [], r2 = /* @__PURE__ */ new Set();
        t3.forEach((t4) => {
          r2.add(t4);
        });
        const o2 = /* @__PURE__ */ new Set();
        return e3.forEach((t4) => {
          o2.add(t4), r2.has(t4) || i3.push(t4);
        }), t3.forEach((t4) => {
          o2.has(t4) || n2.push(t4);
        }), { added: i3, removed: n2 };
      }(this.attachments, t2);
      return this.attachments = t2, Array.from(i2).forEach((t3) => {
        var e3, i3;
        t3.delegate = null, null === (e3 = this.delegate) || void 0 === e3 || null === (i3 = e3.compositionDidRemoveAttachment) || void 0 === i3 || i3.call(e3, t3);
      }), (() => {
        const t3 = [];
        return Array.from(e2).forEach((e3) => {
          var i3, n2;
          e3.delegate = this, t3.push(null === (i3 = this.delegate) || void 0 === i3 || null === (n2 = i3.compositionDidAddAttachment) || void 0 === n2 ? void 0 : n2.call(i3, e3));
        }), t3;
      })();
    }
    attachmentDidChangeAttributes(t2) {
      var e2, i2;
      return this.revision++, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionDidEditAttachment) || void 0 === i2 ? void 0 : i2.call(e2, t2);
    }
    attachmentDidChangePreviewURL(t2) {
      var e2, i2;
      return this.revision++, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionDidChangeAttachmentPreviewURL) || void 0 === i2 ? void 0 : i2.call(e2, t2);
    }
    editAttachment(t2, e2) {
      var i2, n2;
      if (t2 !== this.editingAttachment)
        return this.stopEditingAttachment(), this.editingAttachment = t2, null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.compositionDidStartEditingAttachment) || void 0 === n2 ? void 0 : n2.call(i2, this.editingAttachment, e2);
    }
    stopEditingAttachment() {
      var t2, e2;
      this.editingAttachment && (null === (t2 = this.delegate) || void 0 === t2 || null === (e2 = t2.compositionDidStopEditingAttachment) || void 0 === e2 || e2.call(t2, this.editingAttachment), this.editingAttachment = null);
    }
    updateAttributesForAttachment(t2, e2) {
      return this.setDocument(this.document.updateAttributesForAttachment(t2, e2));
    }
    removeAttributeForAttachment(t2, e2) {
      return this.setDocument(this.document.removeAttributeForAttachment(t2, e2));
    }
    breakFormattedBlock(t2) {
      let { document: e2 } = t2;
      const { block: i2 } = t2;
      let n2 = t2.startPosition, r2 = [n2 - 1, n2];
      i2.getBlockBreakPosition() === t2.startLocation.offset ? (i2.breaksOnReturn() && "\n" === t2.nextCharacter ? n2 += 1 : e2 = e2.removeTextAtRange(r2), r2 = [n2, n2]) : "\n" === t2.nextCharacter ? "\n" === t2.previousCharacter ? r2 = [n2 - 1, n2 + 1] : (r2 = [n2, n2 + 1], n2 += 1) : t2.startLocation.offset - 1 != 0 && (n2 += 1);
      const o2 = new je([i2.removeLastAttribute().copyWithoutText()]);
      return this.setDocument(e2.insertDocumentAtRange(o2, r2)), this.setSelection(n2);
    }
    getPreviousBlock() {
      const t2 = this.getLocationRange();
      if (t2) {
        const { index: e2 } = t2[0];
        if (e2 > 0)
          return this.document.getBlockAtIndex(e2 - 1);
      }
    }
    getBlock() {
      const t2 = this.getLocationRange();
      if (t2)
        return this.document.getBlockAtIndex(t2[0].index);
    }
    getAttachmentAtRange(t2) {
      const e2 = this.document.getDocumentAtRange(t2);
      if (e2.toString() === "".concat("\uFFFC", "\n"))
        return e2.getAttachments()[0];
    }
    notifyDelegateOfCurrentAttributesChange() {
      var t2, e2;
      return null === (t2 = this.delegate) || void 0 === t2 || null === (e2 = t2.compositionDidChangeCurrentAttributes) || void 0 === e2 ? void 0 : e2.call(t2, this.currentAttributes);
    }
    notifyDelegateOfInsertionAtRange(t2) {
      var e2, i2;
      return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionDidPerformInsertionAtRange) || void 0 === i2 ? void 0 : i2.call(e2, t2);
    }
    translateUTF16PositionFromOffset(t2, e2) {
      const i2 = this.document.toUTF16String(), n2 = i2.offsetFromUCS2Offset(t2);
      return i2.offsetToUCS2Offset(n2 + e2);
    }
  };
  ci.proxyMethod("getSelectionManager().getPointRange"), ci.proxyMethod("getSelectionManager().setLocationRangeFromPointRange"), ci.proxyMethod("getSelectionManager().createLocationRangeFromDOMRange"), ci.proxyMethod("getSelectionManager().locationIsCursorTarget"), ci.proxyMethod("getSelectionManager().selectionIsExpanded"), ci.proxyMethod("delegate?.getSelectionManager");
  var hi = class extends U {
    constructor(t2) {
      super(...arguments), this.composition = t2, this.undoEntries = [], this.redoEntries = [];
    }
    recordUndoEntry(t2) {
      let { context: e2, consolidatable: i2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      const n2 = this.undoEntries.slice(-1)[0];
      if (!i2 || !ui(n2, t2, e2)) {
        const i3 = this.createEntry({ description: t2, context: e2 });
        this.undoEntries.push(i3), this.redoEntries = [];
      }
    }
    undo() {
      const t2 = this.undoEntries.pop();
      if (t2) {
        const e2 = this.createEntry(t2);
        return this.redoEntries.push(e2), this.composition.loadSnapshot(t2.snapshot);
      }
    }
    redo() {
      const t2 = this.redoEntries.pop();
      if (t2) {
        const e2 = this.createEntry(t2);
        return this.undoEntries.push(e2), this.composition.loadSnapshot(t2.snapshot);
      }
    }
    canUndo() {
      return this.undoEntries.length > 0;
    }
    canRedo() {
      return this.redoEntries.length > 0;
    }
    createEntry() {
      let { description: t2, context: e2 } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      return { description: null == t2 ? void 0 : t2.toString(), context: JSON.stringify(e2), snapshot: this.composition.getSnapshot() };
    }
  };
  var ui = (t2, e2, i2) => (null == t2 ? void 0 : t2.description) === (null == e2 ? void 0 : e2.toString()) && (null == t2 ? void 0 : t2.context) === JSON.stringify(i2);
  var di = class {
    constructor(t2) {
      this.document = t2.document, this.selectedRange = t2.selectedRange;
    }
    perform() {
      return this.removeBlockAttribute(), this.applyBlockAttribute();
    }
    getSnapshot() {
      return { document: this.document, selectedRange: this.selectedRange };
    }
    removeBlockAttribute() {
      return this.findRangesOfBlocks().map((t2) => this.document = this.document.removeAttributeAtRange("attachmentGallery", t2));
    }
    applyBlockAttribute() {
      let t2 = 0;
      this.findRangesOfPieces().forEach((e2) => {
        e2[1] - e2[0] > 1 && (e2[0] += t2, e2[1] += t2, "\n" !== this.document.getCharacterAtPosition(e2[1]) && (this.document = this.document.insertBlockBreakAtRange(e2[1]), e2[1] < this.selectedRange[1] && this.moveSelectedRangeForward(), e2[1]++, t2++), 0 !== e2[0] && "\n" !== this.document.getCharacterAtPosition(e2[0] - 1) && (this.document = this.document.insertBlockBreakAtRange(e2[0]), e2[0] < this.selectedRange[0] && this.moveSelectedRangeForward(), e2[0]++, t2++), this.document = this.document.applyBlockAttributeAtRange("attachmentGallery", true, e2));
      });
    }
    findRangesOfBlocks() {
      return this.document.findRangesForBlockAttribute("attachmentGallery");
    }
    findRangesOfPieces() {
      return this.document.findRangesForTextAttribute("presentation", { withValue: "gallery" });
    }
    moveSelectedRangeForward() {
      this.selectedRange[0] += 1, this.selectedRange[1] += 1;
    }
  };
  var gi = function(t2) {
    const e2 = new di(t2);
    return e2.perform(), e2.getSnapshot();
  };
  var mi = [gi];
  var pi = class {
    constructor(t2, e2, i2) {
      this.insertFiles = this.insertFiles.bind(this), this.composition = t2, this.selectionManager = e2, this.element = i2, this.undoManager = new hi(this.composition), this.filters = mi.slice(0);
    }
    loadDocument(t2) {
      return this.loadSnapshot({ document: t2, selectedRange: [0, 0] });
    }
    loadHTML() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
      const e2 = Ke.parse(t2, { referenceElement: this.element }).getDocument();
      return this.loadDocument(e2);
    }
    loadJSON(t2) {
      let { document: e2, selectedRange: i2 } = t2;
      return e2 = je.fromJSON(e2), this.loadSnapshot({ document: e2, selectedRange: i2 });
    }
    loadSnapshot(t2) {
      return this.undoManager = new hi(this.composition), this.composition.loadSnapshot(t2);
    }
    getDocument() {
      return this.composition.document;
    }
    getSelectedDocument() {
      return this.composition.getSelectedDocument();
    }
    getSnapshot() {
      return this.composition.getSnapshot();
    }
    toJSON() {
      return this.getSnapshot();
    }
    deleteInDirection(t2) {
      return this.composition.deleteInDirection(t2);
    }
    insertAttachment(t2) {
      return this.composition.insertAttachment(t2);
    }
    insertAttachments(t2) {
      return this.composition.insertAttachments(t2);
    }
    insertDocument(t2) {
      return this.composition.insertDocument(t2);
    }
    insertFile(t2) {
      return this.composition.insertFile(t2);
    }
    insertFiles(t2) {
      return this.composition.insertFiles(t2);
    }
    insertHTML(t2) {
      return this.composition.insertHTML(t2);
    }
    insertString(t2) {
      return this.composition.insertString(t2);
    }
    insertText(t2) {
      return this.composition.insertText(t2);
    }
    insertLineBreak() {
      return this.composition.insertLineBreak();
    }
    getSelectedRange() {
      return this.composition.getSelectedRange();
    }
    getPosition() {
      return this.composition.getPosition();
    }
    getClientRectAtPosition(t2) {
      const e2 = this.getDocument().locationRangeFromRange([t2, t2 + 1]);
      return this.selectionManager.getClientRectAtLocationRange(e2);
    }
    expandSelectionInDirection(t2) {
      return this.composition.expandSelectionInDirection(t2);
    }
    moveCursorInDirection(t2) {
      return this.composition.moveCursorInDirection(t2);
    }
    setSelectedRange(t2) {
      return this.composition.setSelectedRange(t2);
    }
    activateAttribute(t2) {
      let e2 = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
      return this.composition.setCurrentAttribute(t2, e2);
    }
    attributeIsActive(t2) {
      return this.composition.hasCurrentAttribute(t2);
    }
    canActivateAttribute(t2) {
      return this.composition.canSetCurrentAttribute(t2);
    }
    deactivateAttribute(t2) {
      return this.composition.removeCurrentAttribute(t2);
    }
    canDecreaseNestingLevel() {
      return this.composition.canDecreaseNestingLevel();
    }
    canIncreaseNestingLevel() {
      return this.composition.canIncreaseNestingLevel();
    }
    decreaseNestingLevel() {
      if (this.canDecreaseNestingLevel())
        return this.composition.decreaseNestingLevel();
    }
    increaseNestingLevel() {
      if (this.canIncreaseNestingLevel())
        return this.composition.increaseNestingLevel();
    }
    canRedo() {
      return this.undoManager.canRedo();
    }
    canUndo() {
      return this.undoManager.canUndo();
    }
    recordUndoEntry(t2) {
      let { context: e2, consolidatable: i2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      return this.undoManager.recordUndoEntry(t2, { context: e2, consolidatable: i2 });
    }
    redo() {
      if (this.canRedo())
        return this.undoManager.redo();
    }
    undo() {
      if (this.canUndo())
        return this.undoManager.undo();
    }
  };
  var fi = class {
    constructor(t2) {
      this.element = t2;
    }
    findLocationFromContainerAndOffset(t2, e2) {
      let { strict: i2 } = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : { strict: true }, n2 = 0, r2 = false;
      const o2 = { index: 0, offset: 0 }, s2 = this.findAttachmentElementParentForNode(t2);
      s2 && (t2 = s2.parentNode, e2 = v(s2));
      const a2 = x(this.element, { usingFilter: xi });
      for (; a2.nextNode(); ) {
        const s3 = a2.currentNode;
        if (s3 === t2 && I(t2)) {
          T(s3) || (o2.offset += e2);
          break;
        }
        if (s3.parentNode === t2) {
          if (n2++ === e2)
            break;
        } else if (!b(t2, s3) && n2 > 0)
          break;
        L(s3, { strict: i2 }) ? (r2 && o2.index++, o2.offset = 0, r2 = true) : o2.offset += bi(s3);
      }
      return o2;
    }
    findContainerAndOffsetFromLocation(t2) {
      let e2, i2;
      if (0 === t2.index && 0 === t2.offset) {
        for (e2 = this.element, i2 = 0; e2.firstChild; )
          if (e2 = e2.firstChild, S(e2)) {
            i2 = 1;
            break;
          }
        return [e2, i2];
      }
      let [n2, r2] = this.findNodeAndOffsetFromLocation(t2);
      if (n2) {
        if (I(n2))
          0 === bi(n2) ? (e2 = n2.parentNode.parentNode, i2 = v(n2.parentNode), T(n2, { name: "right" }) && i2++) : (e2 = n2, i2 = t2.offset - r2);
        else {
          if (e2 = n2.parentNode, !L(n2.previousSibling) && !S(e2))
            for (; n2 === e2.lastChild && (n2 = e2, e2 = e2.parentNode, !S(e2)); )
              ;
          i2 = v(n2), 0 !== t2.offset && i2++;
        }
        return [e2, i2];
      }
    }
    findNodeAndOffsetFromLocation(t2) {
      let e2, i2, n2 = 0;
      for (const r2 of this.getSignificantNodesForIndex(t2.index)) {
        const o2 = bi(r2);
        if (t2.offset <= n2 + o2)
          if (I(r2)) {
            if (e2 = r2, i2 = n2, t2.offset === i2 && T(e2))
              break;
          } else
            e2 || (e2 = r2, i2 = n2);
        if (n2 += o2, n2 > t2.offset)
          break;
      }
      return [e2, i2];
    }
    findAttachmentElementParentForNode(t2) {
      for (; t2 && t2 !== this.element; ) {
        if (F(t2))
          return t2;
        t2 = t2.parentNode;
      }
    }
    getSignificantNodesForIndex(t2) {
      const e2 = [], i2 = x(this.element, { usingFilter: vi });
      let n2 = false;
      for (; i2.nextNode(); ) {
        const o2 = i2.currentNode;
        var r2;
        if (D(o2)) {
          if (null != r2 ? r2++ : r2 = 0, r2 === t2)
            n2 = true;
          else if (n2)
            break;
        } else
          n2 && e2.push(o2);
      }
      return e2;
    }
  };
  var bi = function(t2) {
    if (t2.nodeType === Node.TEXT_NODE) {
      if (T(t2))
        return 0;
      return t2.textContent.length;
    }
    return "br" === y(t2) || F(t2) ? 1 : 0;
  };
  var vi = function(t2) {
    return Ai(t2) === NodeFilter.FILTER_ACCEPT ? xi(t2) : NodeFilter.FILTER_REJECT;
  };
  var Ai = function(t2) {
    return B(t2) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
  };
  var xi = function(t2) {
    return F(t2.parentNode) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
  };
  var yi = class {
    createDOMRangeFromPoint(t2) {
      let e2, { x: i2, y: n2 } = t2;
      if (document.caretPositionFromPoint) {
        const { offsetNode: t3, offset: r2 } = document.caretPositionFromPoint(i2, n2);
        return e2 = document.createRange(), e2.setStart(t3, r2), e2;
      }
      if (document.caretRangeFromPoint)
        return document.caretRangeFromPoint(i2, n2);
      if (document.body.createTextRange) {
        const t3 = It();
        try {
          const t4 = document.body.createTextRange();
          t4.moveToPoint(i2, n2), t4.select();
        } catch (t4) {
        }
        return e2 = It(), Pt(t3), e2;
      }
    }
    getClientRectsForDOMRange(t2) {
      const e2 = Array.from(t2.getClientRects());
      return [e2[0], e2[e2.length - 1]];
    }
  };
  var Ci = class extends U {
    constructor(t2) {
      super(...arguments), this.didMouseDown = this.didMouseDown.bind(this), this.selectionDidChange = this.selectionDidChange.bind(this), this.element = t2, this.locationMapper = new fi(this.element), this.pointMapper = new yi(), this.lockCount = 0, d("mousedown", { onElement: this.element, withCallback: this.didMouseDown });
    }
    getLocationRange() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      return false === t2.strict ? this.createLocationRangeFromDOMRange(It()) : t2.ignoreLock ? this.currentLocationRange : this.lockedLocationRange ? this.lockedLocationRange : this.currentLocationRange;
    }
    setLocationRange(t2) {
      if (this.lockedLocationRange)
        return;
      t2 = Et(t2);
      const e2 = this.createDOMRangeFromLocationRange(t2);
      e2 && (Pt(e2), this.updateCurrentLocationRange(t2));
    }
    setLocationRangeFromPointRange(t2) {
      t2 = Et(t2);
      const e2 = this.getLocationAtPoint(t2[0]), i2 = this.getLocationAtPoint(t2[1]);
      this.setLocationRange([e2, i2]);
    }
    getClientRectAtLocationRange(t2) {
      const e2 = this.createDOMRangeFromLocationRange(t2);
      if (e2)
        return this.getClientRectsForDOMRange(e2)[1];
    }
    locationIsCursorTarget(t2) {
      const e2 = Array.from(this.findNodeAndOffsetFromLocation(t2))[0];
      return T(e2);
    }
    lock() {
      0 == this.lockCount++ && (this.updateCurrentLocationRange(), this.lockedLocationRange = this.getLocationRange());
    }
    unlock() {
      if (0 == --this.lockCount) {
        const { lockedLocationRange: t2 } = this;
        if (this.lockedLocationRange = null, null != t2)
          return this.setLocationRange(t2);
      }
    }
    clearSelection() {
      var t2;
      return null === (t2 = Bt()) || void 0 === t2 ? void 0 : t2.removeAllRanges();
    }
    selectionIsCollapsed() {
      var t2;
      return true === (null === (t2 = It()) || void 0 === t2 ? void 0 : t2.collapsed);
    }
    selectionIsExpanded() {
      return !this.selectionIsCollapsed();
    }
    createLocationRangeFromDOMRange(t2, e2) {
      if (null == t2 || !this.domRangeWithinElement(t2))
        return;
      const i2 = this.findLocationFromContainerAndOffset(t2.startContainer, t2.startOffset, e2);
      if (!i2)
        return;
      const n2 = t2.collapsed ? void 0 : this.findLocationFromContainerAndOffset(t2.endContainer, t2.endOffset, e2);
      return Et([i2, n2]);
    }
    didMouseDown() {
      return this.pauseTemporarily();
    }
    pauseTemporarily() {
      let t2;
      this.paused = true;
      const e2 = () => {
        if (this.paused = false, clearTimeout(i2), Array.from(t2).forEach((t3) => {
          t3.destroy();
        }), b(document, this.element))
          return this.selectionDidChange();
      }, i2 = setTimeout(e2, 200);
      t2 = ["mousemove", "keydown"].map((t3) => d(t3, { onElement: document, withCallback: e2 }));
    }
    selectionDidChange() {
      if (!this.paused && !f(this.element))
        return this.updateCurrentLocationRange();
    }
    updateCurrentLocationRange(t2) {
      var e2, i2;
      if ((null != t2 ? t2 : t2 = this.createLocationRangeFromDOMRange(It())) && !kt(t2, this.currentLocationRange))
        return this.currentLocationRange = t2, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.locationRangeDidChange) || void 0 === i2 ? void 0 : i2.call(e2, this.currentLocationRange.slice(0));
    }
    createDOMRangeFromLocationRange(t2) {
      const e2 = this.findContainerAndOffsetFromLocation(t2[0]), i2 = St(t2) ? e2 : this.findContainerAndOffsetFromLocation(t2[1]) || e2;
      if (null != e2 && null != i2) {
        const t3 = document.createRange();
        return t3.setStart(...Array.from(e2 || [])), t3.setEnd(...Array.from(i2 || [])), t3;
      }
    }
    getLocationAtPoint(t2) {
      const e2 = this.createDOMRangeFromPoint(t2);
      var i2;
      if (e2)
        return null === (i2 = this.createLocationRangeFromDOMRange(e2)) || void 0 === i2 ? void 0 : i2[0];
    }
    domRangeWithinElement(t2) {
      return t2.collapsed ? b(this.element, t2.startContainer) : b(this.element, t2.startContainer) && b(this.element, t2.endContainer);
    }
  };
  Ci.proxyMethod("locationMapper.findLocationFromContainerAndOffset"), Ci.proxyMethod("locationMapper.findContainerAndOffsetFromLocation"), Ci.proxyMethod("locationMapper.findNodeAndOffsetFromLocation"), Ci.proxyMethod("pointMapper.createDOMRangeFromPoint"), Ci.proxyMethod("pointMapper.getClientRectsForDOMRange");
  var Ri = Object.freeze({ __proto__: null, Attachment: xe, AttachmentManager: ai, AttachmentPiece: ye, Block: De, Composition: ci, Document: je, Editor: pi, HTMLParser: Ke, HTMLSanitizer: ze, LineBreakInsertion: li, LocationMapper: fi, ManagedAttachment: si, Piece: ve, PointMapper: yi, SelectionManager: Ci, SplittableList: Re, StringPiece: Ce, Text: Le, UndoManager: hi });
  var Ei = Object.freeze({ __proto__: null });
  var { lang: Si, css: ki, keyNames: Li } = W;
  var Di = function(t2) {
    return function() {
      const e2 = t2.apply(this, arguments);
      e2.do(), this.undos || (this.undos = []), this.undos.push(e2.undo);
    };
  };
  var wi = class extends U {
    constructor(t2, e2, i2) {
      let n2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
      super(...arguments), be(this, "makeElementMutable", Di(() => ({ do: () => {
        this.element.dataset.trixMutable = true;
      }, undo: () => delete this.element.dataset.trixMutable }))), be(this, "addToolbar", Di(() => {
        const t3 = C({ tagName: "div", className: ki.attachmentToolbar, data: { trixMutable: true }, childNodes: C({ tagName: "div", className: "trix-button-row", childNodes: C({ tagName: "span", className: "trix-button-group trix-button-group--actions", childNodes: C({ tagName: "button", className: "trix-button trix-button--remove", textContent: Si.remove, attributes: { title: Si.remove }, data: { trixAction: "remove" } }) }) }) });
        return this.attachment.isPreviewable() && t3.appendChild(C({ tagName: "div", className: ki.attachmentMetadataContainer, childNodes: C({ tagName: "span", className: ki.attachmentMetadata, childNodes: [C({ tagName: "span", className: ki.attachmentName, textContent: this.attachment.getFilename(), attributes: { title: this.attachment.getFilename() } }), C({ tagName: "span", className: ki.attachmentSize, textContent: this.attachment.getFormattedFilesize() })] }) })), d("click", { onElement: t3, withCallback: this.didClickToolbar }), d("click", { onElement: t3, matchingSelector: "[data-trix-action]", withCallback: this.didClickActionButton }), g("trix-attachment-before-toolbar", { onElement: this.element, attributes: { toolbar: t3, attachment: this.attachment } }), { do: () => this.element.appendChild(t3), undo: () => A(t3) };
      })), be(this, "installCaptionEditor", Di(() => {
        const t3 = C({ tagName: "textarea", className: ki.attachmentCaptionEditor, attributes: { placeholder: Si.captionPlaceholder }, data: { trixMutable: true } });
        t3.value = this.attachmentPiece.getCaption();
        const e3 = t3.cloneNode();
        e3.classList.add("trix-autoresize-clone"), e3.tabIndex = -1;
        const i3 = function() {
          e3.value = t3.value, t3.style.height = e3.scrollHeight + "px";
        };
        d("input", { onElement: t3, withCallback: i3 }), d("input", { onElement: t3, withCallback: this.didInputCaption }), d("keydown", { onElement: t3, withCallback: this.didKeyDownCaption }), d("change", { onElement: t3, withCallback: this.didChangeCaption }), d("blur", { onElement: t3, withCallback: this.didBlurCaption });
        const n3 = this.element.querySelector("figcaption"), r2 = n3.cloneNode();
        return { do: () => {
          if (n3.style.display = "none", r2.appendChild(t3), r2.appendChild(e3), r2.classList.add("".concat(ki.attachmentCaption, "--editing")), n3.parentElement.insertBefore(r2, n3), i3(), this.options.editCaption)
            return yt(() => t3.focus());
        }, undo() {
          A(r2), n3.style.display = null;
        } };
      })), this.didClickToolbar = this.didClickToolbar.bind(this), this.didClickActionButton = this.didClickActionButton.bind(this), this.didKeyDownCaption = this.didKeyDownCaption.bind(this), this.didInputCaption = this.didInputCaption.bind(this), this.didChangeCaption = this.didChangeCaption.bind(this), this.didBlurCaption = this.didBlurCaption.bind(this), this.attachmentPiece = t2, this.element = e2, this.container = i2, this.options = n2, this.attachment = this.attachmentPiece.attachment, "a" === y(this.element) && (this.element = this.element.firstChild), this.install();
    }
    install() {
      this.makeElementMutable(), this.addToolbar(), this.attachment.isPreviewable() && this.installCaptionEditor();
    }
    uninstall() {
      var t2;
      let e2 = this.undos.pop();
      for (this.savePendingCaption(); e2; )
        e2(), e2 = this.undos.pop();
      null === (t2 = this.delegate) || void 0 === t2 || t2.didUninstallAttachmentEditor(this);
    }
    savePendingCaption() {
      if (this.pendingCaption) {
        const r2 = this.pendingCaption;
        var t2, e2, i2, n2;
        if (this.pendingCaption = null, r2)
          null === (t2 = this.delegate) || void 0 === t2 || null === (e2 = t2.attachmentEditorDidRequestUpdatingAttributesForAttachment) || void 0 === e2 || e2.call(t2, { caption: r2 }, this.attachment);
        else
          null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.attachmentEditorDidRequestRemovingAttributeForAttachment) || void 0 === n2 || n2.call(i2, "caption", this.attachment);
      }
    }
    didClickToolbar(t2) {
      return t2.preventDefault(), t2.stopPropagation();
    }
    didClickActionButton(t2) {
      var e2;
      if ("remove" === t2.target.getAttribute("data-trix-action"))
        return null === (e2 = this.delegate) || void 0 === e2 ? void 0 : e2.attachmentEditorDidRequestRemovalOfAttachment(this.attachment);
    }
    didKeyDownCaption(t2) {
      var e2, i2;
      if ("return" === Li[t2.keyCode])
        return t2.preventDefault(), this.savePendingCaption(), null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.attachmentEditorDidRequestDeselectingAttachment) || void 0 === i2 ? void 0 : i2.call(e2, this.attachment);
    }
    didInputCaption(t2) {
      this.pendingCaption = t2.target.value.replace(/\s/g, " ").trim();
    }
    didChangeCaption(t2) {
      return this.savePendingCaption();
    }
    didBlurCaption(t2) {
      return this.savePendingCaption();
    }
  };
  var Ti = class extends U {
    constructor(t2, e2) {
      super(...arguments), this.didFocus = this.didFocus.bind(this), this.didBlur = this.didBlur.bind(this), this.didClickAttachment = this.didClickAttachment.bind(this), this.element = t2, this.composition = e2, this.documentView = new ue(this.composition.document, { element: this.element }), d("focus", { onElement: this.element, withCallback: this.didFocus }), d("blur", { onElement: this.element, withCallback: this.didBlur }), d("click", { onElement: this.element, matchingSelector: "a[contenteditable=false]", preventDefault: true }), d("mousedown", { onElement: this.element, matchingSelector: "[data-trix-attachment]", withCallback: this.didClickAttachment }), d("click", { onElement: this.element, matchingSelector: "a".concat("[data-trix-attachment]"), preventDefault: true });
    }
    didFocus(t2) {
      var e2;
      const i2 = () => {
        var t3, e3;
        if (!this.focused)
          return this.focused = true, null === (t3 = this.delegate) || void 0 === t3 || null === (e3 = t3.compositionControllerDidFocus) || void 0 === e3 ? void 0 : e3.call(t3);
      };
      return (null === (e2 = this.blurPromise) || void 0 === e2 ? void 0 : e2.then(i2)) || i2();
    }
    didBlur(t2) {
      this.blurPromise = new Promise((t3) => yt(() => {
        var e2, i2;
        f(this.element) || (this.focused = null, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionControllerDidBlur) || void 0 === i2 || i2.call(e2));
        return this.blurPromise = null, t3();
      }));
    }
    didClickAttachment(t2, e2) {
      var i2, n2;
      const r2 = this.findAttachmentForElement(e2), o2 = !!p(t2.target, { matchingSelector: "figcaption" });
      return null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.compositionControllerDidSelectAttachment) || void 0 === n2 ? void 0 : n2.call(i2, r2, { editCaption: o2 });
    }
    getSerializableElement() {
      return this.isEditingAttachment() ? this.documentView.shadowElement : this.element;
    }
    render() {
      var t2, e2, i2, n2, r2, o2;
      (this.revision !== this.composition.revision && (this.documentView.setDocument(this.composition.document), this.documentView.render(), this.revision = this.composition.revision), this.canSyncDocumentView() && !this.documentView.isSynced()) && (null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.compositionControllerWillSyncDocumentView) || void 0 === n2 || n2.call(i2), this.documentView.sync(), null === (r2 = this.delegate) || void 0 === r2 || null === (o2 = r2.compositionControllerDidSyncDocumentView) || void 0 === o2 || o2.call(r2));
      return null === (t2 = this.delegate) || void 0 === t2 || null === (e2 = t2.compositionControllerDidRender) || void 0 === e2 ? void 0 : e2.call(t2);
    }
    rerenderViewForObject(t2) {
      return this.invalidateViewForObject(t2), this.render();
    }
    invalidateViewForObject(t2) {
      return this.documentView.invalidateViewForObject(t2);
    }
    isViewCachingEnabled() {
      return this.documentView.isViewCachingEnabled();
    }
    enableViewCaching() {
      return this.documentView.enableViewCaching();
    }
    disableViewCaching() {
      return this.documentView.disableViewCaching();
    }
    refreshViewCache() {
      return this.documentView.garbageCollectCachedViews();
    }
    isEditingAttachment() {
      return !!this.attachmentEditor;
    }
    installAttachmentEditorForAttachment(t2, e2) {
      var i2;
      if ((null === (i2 = this.attachmentEditor) || void 0 === i2 ? void 0 : i2.attachment) === t2)
        return;
      const n2 = this.documentView.findElementForObject(t2);
      if (!n2)
        return;
      this.uninstallAttachmentEditor();
      const r2 = this.composition.document.getAttachmentPieceForAttachment(t2);
      this.attachmentEditor = new wi(r2, n2, this.element, e2), this.attachmentEditor.delegate = this;
    }
    uninstallAttachmentEditor() {
      var t2;
      return null === (t2 = this.attachmentEditor) || void 0 === t2 ? void 0 : t2.uninstall();
    }
    didUninstallAttachmentEditor() {
      return this.attachmentEditor = null, this.render();
    }
    attachmentEditorDidRequestUpdatingAttributesForAttachment(t2, e2) {
      var i2, n2;
      return null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.compositionControllerWillUpdateAttachment) || void 0 === n2 || n2.call(i2, e2), this.composition.updateAttributesForAttachment(t2, e2);
    }
    attachmentEditorDidRequestRemovingAttributeForAttachment(t2, e2) {
      var i2, n2;
      return null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.compositionControllerWillUpdateAttachment) || void 0 === n2 || n2.call(i2, e2), this.composition.removeAttributeForAttachment(t2, e2);
    }
    attachmentEditorDidRequestRemovalOfAttachment(t2) {
      var e2, i2;
      return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionControllerDidRequestRemovalOfAttachment) || void 0 === i2 ? void 0 : i2.call(e2, t2);
    }
    attachmentEditorDidRequestDeselectingAttachment(t2) {
      var e2, i2;
      return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionControllerDidRequestDeselectingAttachment) || void 0 === i2 ? void 0 : i2.call(e2, t2);
    }
    canSyncDocumentView() {
      return !this.isEditingAttachment();
    }
    findAttachmentForElement(t2) {
      return this.composition.document.getAttachmentById(parseInt(t2.dataset.trixId, 10));
    }
  };
  var Fi = class extends U {
  };
  var Bi = "[".concat("data-trix-mutable", "]");
  var Ii = { attributes: true, childList: true, characterData: true, characterDataOldValue: true, subtree: true };
  var Pi = class extends U {
    constructor(t2) {
      super(t2), this.didMutate = this.didMutate.bind(this), this.element = t2, this.observer = new window.MutationObserver(this.didMutate), this.start();
    }
    start() {
      return this.reset(), this.observer.observe(this.element, Ii);
    }
    stop() {
      return this.observer.disconnect();
    }
    didMutate(t2) {
      var e2, i2;
      if (this.mutations.push(...Array.from(this.findSignificantMutations(t2) || [])), this.mutations.length)
        return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.elementDidMutate) || void 0 === i2 || i2.call(e2, this.getMutationSummary()), this.reset();
    }
    reset() {
      this.mutations = [];
    }
    findSignificantMutations(t2) {
      return t2.filter((t3) => this.mutationIsSignificant(t3));
    }
    mutationIsSignificant(t2) {
      if (this.nodeIsMutable(t2.target))
        return false;
      for (const e2 of Array.from(this.nodesModifiedByMutation(t2)))
        if (this.nodeIsSignificant(e2))
          return true;
      return false;
    }
    nodeIsSignificant(t2) {
      return t2 !== this.element && !this.nodeIsMutable(t2) && !B(t2);
    }
    nodeIsMutable(t2) {
      return p(t2, { matchingSelector: Bi });
    }
    nodesModifiedByMutation(t2) {
      const e2 = [];
      switch (t2.type) {
        case "attributes":
          "data-trix-mutable" !== t2.attributeName && e2.push(t2.target);
          break;
        case "characterData":
          e2.push(t2.target.parentNode), e2.push(t2.target);
          break;
        case "childList":
          e2.push(...Array.from(t2.addedNodes || [])), e2.push(...Array.from(t2.removedNodes || []));
      }
      return e2;
    }
    getMutationSummary() {
      return this.getTextMutationSummary();
    }
    getTextMutationSummary() {
      const { additions: t2, deletions: e2 } = this.getTextChangesFromCharacterData(), i2 = this.getTextChangesFromChildList();
      Array.from(i2.additions).forEach((e3) => {
        Array.from(t2).includes(e3) || t2.push(e3);
      }), e2.push(...Array.from(i2.deletions || []));
      const n2 = {}, r2 = t2.join("");
      r2 && (n2.textAdded = r2);
      const o2 = e2.join("");
      return o2 && (n2.textDeleted = o2), n2;
    }
    getMutationsByType(t2) {
      return Array.from(this.mutations).filter((e2) => e2.type === t2);
    }
    getTextChangesFromChildList() {
      let t2, e2;
      const i2 = [], n2 = [];
      Array.from(this.getMutationsByType("childList")).forEach((t3) => {
        i2.push(...Array.from(t3.addedNodes || [])), n2.push(...Array.from(t3.removedNodes || []));
      });
      0 === i2.length && 1 === n2.length && D(n2[0]) ? (t2 = [], e2 = ["\n"]) : (t2 = Ni(i2), e2 = Ni(n2));
      return { additions: t2.filter((t3, i3) => t3 !== e2[i3]).map(Mt), deletions: e2.filter((e3, i3) => e3 !== t2[i3]).map(Mt) };
    }
    getTextChangesFromCharacterData() {
      let t2, e2;
      const i2 = this.getMutationsByType("characterData");
      if (i2.length) {
        const n2 = i2[0], r2 = i2[i2.length - 1], o2 = function(t3, e3) {
          let i3, n3;
          return t3 = K.box(t3), (e3 = K.box(e3)).length < t3.length ? [n3, i3] = Ut(t3, e3) : [i3, n3] = Ut(e3, t3), { added: i3, removed: n3 };
        }(Mt(n2.oldValue), Mt(r2.target.data));
        t2 = o2.added, e2 = o2.removed;
      }
      return { additions: t2 ? [t2] : [], deletions: e2 ? [e2] : [] };
    }
  };
  var Ni = function() {
    let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    const e2 = [];
    for (const i2 of Array.from(t2))
      switch (i2.nodeType) {
        case Node.TEXT_NODE:
          e2.push(i2.data);
          break;
        case Node.ELEMENT_NODE:
          "br" === y(i2) ? e2.push("\n") : e2.push(...Array.from(Ni(i2.childNodes) || []));
      }
    return e2;
  };
  var Oi = class extends Qt {
    constructor(t2) {
      super(...arguments), this.file = t2;
    }
    perform(t2) {
      const e2 = new FileReader();
      return e2.onerror = () => t2(false), e2.onload = () => {
        e2.onerror = null;
        try {
          e2.abort();
        } catch (t3) {
        }
        return t2(true, this.file);
      }, e2.readAsArrayBuffer(this.file);
    }
  };
  var Mi = class {
    constructor(t2) {
      this.element = t2;
    }
    shouldIgnore(t2) {
      return !!o.samsungAndroid && (this.previousEvent = this.event, this.event = t2, this.checkSamsungKeyboardBuggyModeStart(), this.checkSamsungKeyboardBuggyModeEnd(), this.buggyMode);
    }
    checkSamsungKeyboardBuggyModeStart() {
      this.insertingLongTextAfterUnidentifiedChar() && ji(this.element.innerText, this.event.data) && (this.buggyMode = true, this.event.preventDefault());
    }
    checkSamsungKeyboardBuggyModeEnd() {
      this.buggyMode && "insertText" !== this.event.inputType && (this.buggyMode = false);
    }
    insertingLongTextAfterUnidentifiedChar() {
      var t2;
      return this.isBeforeInputInsertText() && this.previousEventWasUnidentifiedKeydown() && (null === (t2 = this.event.data) || void 0 === t2 ? void 0 : t2.length) > 50;
    }
    isBeforeInputInsertText() {
      return "beforeinput" === this.event.type && "insertText" === this.event.inputType;
    }
    previousEventWasUnidentifiedKeydown() {
      var t2, e2;
      return "keydown" === (null === (t2 = this.previousEvent) || void 0 === t2 ? void 0 : t2.type) && "Unidentified" === (null === (e2 = this.previousEvent) || void 0 === e2 ? void 0 : e2.key);
    }
  };
  var ji = (t2, e2) => Ui(t2) === Ui(e2);
  var Wi = new RegExp("(".concat("\uFFFC", "|").concat("\uFEFF", "|").concat("\xA0", "|\\s)+"), "g");
  var Ui = (t2) => t2.replace(Wi, " ").trim();
  var qi = class extends U {
    constructor(t2) {
      super(...arguments), this.element = t2, this.mutationObserver = new Pi(this.element), this.mutationObserver.delegate = this, this.flakyKeyboardDetector = new Mi(this.element);
      for (const t3 in this.constructor.events)
        d(t3, { onElement: this.element, withCallback: this.handlerFor(t3) });
    }
    elementDidMutate(t2) {
    }
    editorWillSyncDocumentView() {
      return this.mutationObserver.stop();
    }
    editorDidSyncDocumentView() {
      return this.mutationObserver.start();
    }
    requestRender() {
      var t2, e2;
      return null === (t2 = this.delegate) || void 0 === t2 || null === (e2 = t2.inputControllerDidRequestRender) || void 0 === e2 ? void 0 : e2.call(t2);
    }
    requestReparse() {
      var t2, e2;
      return null === (t2 = this.delegate) || void 0 === t2 || null === (e2 = t2.inputControllerDidRequestReparse) || void 0 === e2 || e2.call(t2), this.requestRender();
    }
    attachFiles(t2) {
      const e2 = Array.from(t2).map((t3) => new Oi(t3));
      return Promise.all(e2).then((t3) => {
        this.handleInput(function() {
          var e3, i2;
          return null === (e3 = this.delegate) || void 0 === e3 || e3.inputControllerWillAttachFiles(), null === (i2 = this.responder) || void 0 === i2 || i2.insertFiles(t3), this.requestRender();
        });
      });
    }
    handlerFor(t2) {
      return (e2) => {
        e2.defaultPrevented || this.handleInput(() => {
          if (!f(this.element)) {
            if (this.flakyKeyboardDetector.shouldIgnore(e2))
              return;
            this.eventName = t2, this.constructor.events[t2].call(this, e2);
          }
        });
      };
    }
    handleInput(t2) {
      try {
        var e2;
        null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillHandleInput(), t2.call(this);
      } finally {
        var i2;
        null === (i2 = this.delegate) || void 0 === i2 || i2.inputControllerDidHandleInput();
      }
    }
    createLinkHTML(t2, e2) {
      const i2 = document.createElement("a");
      return i2.href = t2, i2.textContent = e2 || t2, i2.outerHTML;
    }
  };
  var Vi;
  be(qi, "events", {});
  var { browser: zi, keyNames: _i } = W;
  var Hi = 0;
  var Ji = class extends qi {
    constructor() {
      super(...arguments), this.resetInputSummary();
    }
    setInputSummary() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      this.inputSummary.eventName = this.eventName;
      for (const e2 in t2) {
        const i2 = t2[e2];
        this.inputSummary[e2] = i2;
      }
      return this.inputSummary;
    }
    resetInputSummary() {
      this.inputSummary = {};
    }
    reset() {
      return this.resetInputSummary(), Ft.reset();
    }
    elementDidMutate(t2) {
      var e2, i2;
      return this.isComposing() ? null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.inputControllerDidAllowUnhandledInput) || void 0 === i2 ? void 0 : i2.call(e2) : this.handleInput(function() {
        return this.mutationIsSignificant(t2) && (this.mutationIsExpected(t2) ? this.requestRender() : this.requestReparse()), this.reset();
      });
    }
    mutationIsExpected(t2) {
      let { textAdded: e2, textDeleted: i2 } = t2;
      if (this.inputSummary.preferDocument)
        return true;
      const n2 = null != e2 ? e2 === this.inputSummary.textAdded : !this.inputSummary.textAdded, r2 = null != i2 ? this.inputSummary.didDelete : !this.inputSummary.didDelete, o2 = ["\n", " \n"].includes(e2) && !n2, s2 = "\n" === i2 && !r2;
      if (o2 && !s2 || s2 && !o2) {
        const t3 = this.getSelectedRange();
        if (t3) {
          var a2;
          const i3 = o2 ? e2.replace(/\n$/, "").length || -1 : (null == e2 ? void 0 : e2.length) || 1;
          if (null !== (a2 = this.responder) && void 0 !== a2 && a2.positionIsBlockBreak(t3[1] + i3))
            return true;
        }
      }
      return n2 && r2;
    }
    mutationIsSignificant(t2) {
      var e2;
      const i2 = Object.keys(t2).length > 0, n2 = "" === (null === (e2 = this.compositionInput) || void 0 === e2 ? void 0 : e2.getEndData());
      return i2 || !n2;
    }
    getCompositionInput() {
      if (this.isComposing())
        return this.compositionInput;
      this.compositionInput = new Yi(this);
    }
    isComposing() {
      return this.compositionInput && !this.compositionInput.isEnded();
    }
    deleteInDirection(t2, e2) {
      var i2;
      return false !== (null === (i2 = this.responder) || void 0 === i2 ? void 0 : i2.deleteInDirection(t2)) ? this.setInputSummary({ didDelete: true }) : e2 ? (e2.preventDefault(), this.requestRender()) : void 0;
    }
    serializeSelectionToDataTransfer(t2) {
      var e2;
      if (!function(t3) {
        if (null == t3 || !t3.setData)
          return false;
        for (const e3 in vt) {
          const i3 = vt[e3];
          try {
            if (t3.setData(e3, i3), !t3.getData(e3) === i3)
              return false;
          } catch (t4) {
            return false;
          }
        }
        return true;
      }(t2))
        return;
      const i2 = null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.getSelectedDocument().toSerializableDocument();
      return t2.setData("application/x-trix-document", JSON.stringify(i2)), t2.setData("text/html", ue.render(i2).innerHTML), t2.setData("text/plain", i2.toString().replace(/\n$/, "")), true;
    }
    canAcceptDataTransfer(t2) {
      const e2 = {};
      return Array.from((null == t2 ? void 0 : t2.types) || []).forEach((t3) => {
        e2[t3] = true;
      }), e2.Files || e2["application/x-trix-document"] || e2["text/html"] || e2["text/plain"];
    }
    getPastedHTMLUsingHiddenElement(t2) {
      const e2 = this.getSelectedRange(), i2 = { position: "absolute", left: "".concat(window.pageXOffset, "px"), top: "".concat(window.pageYOffset, "px"), opacity: 0 }, n2 = C({ style: i2, tagName: "div", editable: true });
      return document.body.appendChild(n2), n2.focus(), requestAnimationFrame(() => {
        const i3 = n2.innerHTML;
        return A(n2), this.setSelectedRange(e2), t2(i3);
      });
    }
  };
  be(Ji, "events", { keydown(t2) {
    this.isComposing() || this.resetInputSummary(), this.inputSummary.didInput = true;
    const e2 = _i[t2.keyCode];
    if (e2) {
      var i2;
      let n3 = this.keys;
      ["ctrl", "alt", "shift", "meta"].forEach((e3) => {
        var i3;
        t2["".concat(e3, "Key")] && ("ctrl" === e3 && (e3 = "control"), n3 = null === (i3 = n3) || void 0 === i3 ? void 0 : i3[e3]);
      }), null != (null === (i2 = n3) || void 0 === i2 ? void 0 : i2[e2]) && (this.setInputSummary({ keyName: e2 }), Ft.reset(), n3[e2].call(this, t2));
    }
    if (xt(t2)) {
      const e3 = String.fromCharCode(t2.keyCode).toLowerCase();
      if (e3) {
        var n2;
        const i3 = ["alt", "shift"].map((e4) => {
          if (t2["".concat(e4, "Key")])
            return e4;
        }).filter((t3) => t3);
        i3.push(e3), null !== (n2 = this.delegate) && void 0 !== n2 && n2.inputControllerDidReceiveKeyboardCommand(i3) && t2.preventDefault();
      }
    }
  }, keypress(t2) {
    if (null != this.inputSummary.eventName)
      return;
    if (t2.metaKey)
      return;
    if (t2.ctrlKey && !t2.altKey)
      return;
    const e2 = $i(t2);
    var i2, n2;
    return e2 ? (null === (i2 = this.delegate) || void 0 === i2 || i2.inputControllerWillPerformTyping(), null === (n2 = this.responder) || void 0 === n2 || n2.insertString(e2), this.setInputSummary({ textAdded: e2, didDelete: this.selectionIsExpanded() })) : void 0;
  }, textInput(t2) {
    const { data: e2 } = t2, { textAdded: i2 } = this.inputSummary;
    if (i2 && i2 !== e2 && i2.toUpperCase() === e2) {
      var n2;
      const t3 = this.getSelectedRange();
      return this.setSelectedRange([t3[0], t3[1] + i2.length]), null === (n2 = this.responder) || void 0 === n2 || n2.insertString(e2), this.setInputSummary({ textAdded: e2 }), this.setSelectedRange(t3);
    }
  }, dragenter(t2) {
    t2.preventDefault();
  }, dragstart(t2) {
    var e2, i2;
    return this.serializeSelectionToDataTransfer(t2.dataTransfer), this.draggedRange = this.getSelectedRange(), null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.inputControllerDidStartDrag) || void 0 === i2 ? void 0 : i2.call(e2);
  }, dragover(t2) {
    if (this.draggedRange || this.canAcceptDataTransfer(t2.dataTransfer)) {
      t2.preventDefault();
      const n2 = { x: t2.clientX, y: t2.clientY };
      var e2, i2;
      if (!Rt(n2, this.draggingPoint))
        return this.draggingPoint = n2, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.inputControllerDidReceiveDragOverPoint) || void 0 === i2 ? void 0 : i2.call(e2, this.draggingPoint);
    }
  }, dragend(t2) {
    var e2, i2;
    null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.inputControllerDidCancelDrag) || void 0 === i2 || i2.call(e2), this.draggedRange = null, this.draggingPoint = null;
  }, drop(t2) {
    var e2, i2;
    t2.preventDefault();
    const n2 = null === (e2 = t2.dataTransfer) || void 0 === e2 ? void 0 : e2.files, r2 = t2.dataTransfer.getData("application/x-trix-document"), o2 = { x: t2.clientX, y: t2.clientY };
    if (null === (i2 = this.responder) || void 0 === i2 || i2.setLocationRangeFromPointRange(o2), null != n2 && n2.length)
      this.attachFiles(n2);
    else if (this.draggedRange) {
      var s2, a2;
      null === (s2 = this.delegate) || void 0 === s2 || s2.inputControllerWillMoveText(), null === (a2 = this.responder) || void 0 === a2 || a2.moveTextFromRange(this.draggedRange), this.draggedRange = null, this.requestRender();
    } else if (r2) {
      var l2;
      const t3 = je.fromJSONString(r2);
      null === (l2 = this.responder) || void 0 === l2 || l2.insertDocument(t3), this.requestRender();
    }
    this.draggedRange = null, this.draggingPoint = null;
  }, cut(t2) {
    var e2, i2;
    if (null !== (e2 = this.responder) && void 0 !== e2 && e2.selectionIsExpanded() && (this.serializeSelectionToDataTransfer(t2.clipboardData) && t2.preventDefault(), null === (i2 = this.delegate) || void 0 === i2 || i2.inputControllerWillCutText(), this.deleteInDirection("backward"), t2.defaultPrevented))
      return this.requestRender();
  }, copy(t2) {
    var e2;
    null !== (e2 = this.responder) && void 0 !== e2 && e2.selectionIsExpanded() && this.serializeSelectionToDataTransfer(t2.clipboardData) && t2.preventDefault();
  }, paste(t2) {
    const e2 = t2.clipboardData || t2.testClipboardData, i2 = { clipboard: e2 };
    if (!e2 || Xi(t2))
      return void this.getPastedHTMLUsingHiddenElement((t3) => {
        var e3, n3, r3;
        return i2.type = "text/html", i2.html = t3, null === (e3 = this.delegate) || void 0 === e3 || e3.inputControllerWillPaste(i2), null === (n3 = this.responder) || void 0 === n3 || n3.insertHTML(i2.html), this.requestRender(), null === (r3 = this.delegate) || void 0 === r3 ? void 0 : r3.inputControllerDidPaste(i2);
      });
    const n2 = e2.getData("URL"), r2 = e2.getData("text/html"), o2 = e2.getData("public.url-name");
    if (n2) {
      var s2, a2, l2;
      let t3;
      i2.type = "text/html", t3 = o2 ? Wt(o2).trim() : n2, i2.html = this.createLinkHTML(n2, t3), null === (s2 = this.delegate) || void 0 === s2 || s2.inputControllerWillPaste(i2), this.setInputSummary({ textAdded: t3, didDelete: this.selectionIsExpanded() }), null === (a2 = this.responder) || void 0 === a2 || a2.insertHTML(i2.html), this.requestRender(), null === (l2 = this.delegate) || void 0 === l2 || l2.inputControllerDidPaste(i2);
    } else if (At(e2)) {
      var c2, h2, u2;
      i2.type = "text/plain", i2.string = e2.getData("text/plain"), null === (c2 = this.delegate) || void 0 === c2 || c2.inputControllerWillPaste(i2), this.setInputSummary({ textAdded: i2.string, didDelete: this.selectionIsExpanded() }), null === (h2 = this.responder) || void 0 === h2 || h2.insertString(i2.string), this.requestRender(), null === (u2 = this.delegate) || void 0 === u2 || u2.inputControllerDidPaste(i2);
    } else if (r2) {
      var d2, g2, m2;
      i2.type = "text/html", i2.html = r2, null === (d2 = this.delegate) || void 0 === d2 || d2.inputControllerWillPaste(i2), null === (g2 = this.responder) || void 0 === g2 || g2.insertHTML(i2.html), this.requestRender(), null === (m2 = this.delegate) || void 0 === m2 || m2.inputControllerDidPaste(i2);
    } else if (Array.from(e2.types).includes("Files")) {
      var p2, f2, b2;
      const t3 = null === (p2 = e2.items) || void 0 === p2 || null === (f2 = p2[0]) || void 0 === f2 || null === (b2 = f2.getAsFile) || void 0 === b2 ? void 0 : b2.call(f2);
      if (t3) {
        var v2, A2, x2;
        const e3 = Ki(t3);
        !t3.name && e3 && (t3.name = "pasted-file-".concat(++Hi, ".").concat(e3)), i2.type = "File", i2.file = t3, null === (v2 = this.delegate) || void 0 === v2 || v2.inputControllerWillAttachFiles(), null === (A2 = this.responder) || void 0 === A2 || A2.insertFile(i2.file), this.requestRender(), null === (x2 = this.delegate) || void 0 === x2 || x2.inputControllerDidPaste(i2);
      }
    }
    t2.preventDefault();
  }, compositionstart(t2) {
    return this.getCompositionInput().start(t2.data);
  }, compositionupdate(t2) {
    return this.getCompositionInput().update(t2.data);
  }, compositionend(t2) {
    return this.getCompositionInput().end(t2.data);
  }, beforeinput(t2) {
    this.inputSummary.didInput = true;
  }, input(t2) {
    return this.inputSummary.didInput = true, t2.stopPropagation();
  } }), be(Ji, "keys", { backspace(t2) {
    var e2;
    return null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), this.deleteInDirection("backward", t2);
  }, delete(t2) {
    var e2;
    return null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), this.deleteInDirection("forward", t2);
  }, return(t2) {
    var e2, i2;
    return this.setInputSummary({ preferDocument: true }), null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), null === (i2 = this.responder) || void 0 === i2 ? void 0 : i2.insertLineBreak();
  }, tab(t2) {
    var e2, i2;
    null !== (e2 = this.responder) && void 0 !== e2 && e2.canIncreaseNestingLevel() && (null === (i2 = this.responder) || void 0 === i2 || i2.increaseNestingLevel(), this.requestRender(), t2.preventDefault());
  }, left(t2) {
    var e2;
    if (this.selectionIsInCursorTarget())
      return t2.preventDefault(), null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.moveCursorInDirection("backward");
  }, right(t2) {
    var e2;
    if (this.selectionIsInCursorTarget())
      return t2.preventDefault(), null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.moveCursorInDirection("forward");
  }, control: { d(t2) {
    var e2;
    return null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), this.deleteInDirection("forward", t2);
  }, h(t2) {
    var e2;
    return null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), this.deleteInDirection("backward", t2);
  }, o(t2) {
    var e2, i2;
    return t2.preventDefault(), null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), null === (i2 = this.responder) || void 0 === i2 || i2.insertString("\n", { updatePosition: false }), this.requestRender();
  } }, shift: { return(t2) {
    var e2, i2;
    null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), null === (i2 = this.responder) || void 0 === i2 || i2.insertString("\n"), this.requestRender(), t2.preventDefault();
  }, tab(t2) {
    var e2, i2;
    null !== (e2 = this.responder) && void 0 !== e2 && e2.canDecreaseNestingLevel() && (null === (i2 = this.responder) || void 0 === i2 || i2.decreaseNestingLevel(), this.requestRender(), t2.preventDefault());
  }, left(t2) {
    if (this.selectionIsInCursorTarget())
      return t2.preventDefault(), this.expandSelectionInDirection("backward");
  }, right(t2) {
    if (this.selectionIsInCursorTarget())
      return t2.preventDefault(), this.expandSelectionInDirection("forward");
  } }, alt: { backspace(t2) {
    var e2;
    return this.setInputSummary({ preferDocument: false }), null === (e2 = this.delegate) || void 0 === e2 ? void 0 : e2.inputControllerWillPerformTyping();
  } }, meta: { backspace(t2) {
    var e2;
    return this.setInputSummary({ preferDocument: false }), null === (e2 = this.delegate) || void 0 === e2 ? void 0 : e2.inputControllerWillPerformTyping();
  } } }), Ji.proxyMethod("responder?.getSelectedRange"), Ji.proxyMethod("responder?.setSelectedRange"), Ji.proxyMethod("responder?.expandSelectionInDirection"), Ji.proxyMethod("responder?.selectionIsInCursorTarget"), Ji.proxyMethod("responder?.selectionIsExpanded");
  var Ki = (t2) => {
    var e2, i2;
    return null === (e2 = t2.type) || void 0 === e2 || null === (i2 = e2.match(/\/(\w+)$/)) || void 0 === i2 ? void 0 : i2[1];
  };
  var Gi = !(null === (Vi = " ".codePointAt) || void 0 === Vi || !Vi.call(" ", 0));
  var $i = function(t2) {
    if (t2.key && Gi && t2.key.codePointAt(0) === t2.keyCode)
      return t2.key;
    {
      let e2;
      if (null === t2.which ? e2 = t2.keyCode : 0 !== t2.which && 0 !== t2.charCode && (e2 = t2.charCode), null != e2 && "escape" !== _i[e2])
        return K.fromCodepoints([e2]).toString();
    }
  };
  var Xi = function(t2) {
    const e2 = t2.clipboardData;
    if (e2) {
      if (e2.types.includes("text/html")) {
        for (const t3 of e2.types) {
          const i2 = /^CorePasteboardFlavorType/.test(t3), n2 = /^dyn\./.test(t3) && e2.getData(t3);
          if (i2 || n2)
            return true;
        }
        return false;
      }
      {
        const t3 = e2.types.includes("com.apple.webarchive"), i2 = e2.types.includes("com.apple.flat-rtfd");
        return t3 || i2;
      }
    }
  };
  var Yi = class extends U {
    constructor(t2) {
      super(...arguments), this.inputController = t2, this.responder = this.inputController.responder, this.delegate = this.inputController.delegate, this.inputSummary = this.inputController.inputSummary, this.data = {};
    }
    start(t2) {
      if (this.data.start = t2, this.isSignificant()) {
        var e2, i2;
        if ("keypress" === this.inputSummary.eventName && this.inputSummary.textAdded)
          null === (i2 = this.responder) || void 0 === i2 || i2.deleteInDirection("left");
        this.selectionIsExpanded() || (this.insertPlaceholder(), this.requestRender()), this.range = null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.getSelectedRange();
      }
    }
    update(t2) {
      if (this.data.update = t2, this.isSignificant()) {
        const t3 = this.selectPlaceholder();
        t3 && (this.forgetPlaceholder(), this.range = t3);
      }
    }
    end(t2) {
      return this.data.end = t2, this.isSignificant() ? (this.forgetPlaceholder(), this.canApplyToDocument() ? (this.setInputSummary({ preferDocument: true, didInput: false }), null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), null === (i2 = this.responder) || void 0 === i2 || i2.setSelectedRange(this.range), null === (n2 = this.responder) || void 0 === n2 || n2.insertString(this.data.end), null === (r2 = this.responder) || void 0 === r2 ? void 0 : r2.setSelectedRange(this.range[0] + this.data.end.length)) : null != this.data.start || null != this.data.update ? (this.requestReparse(), this.inputController.reset()) : void 0) : this.inputController.reset();
      var e2, i2, n2, r2;
    }
    getEndData() {
      return this.data.end;
    }
    isEnded() {
      return null != this.getEndData();
    }
    isSignificant() {
      return !zi.composesExistingText || this.inputSummary.didInput;
    }
    canApplyToDocument() {
      var t2, e2;
      return 0 === (null === (t2 = this.data.start) || void 0 === t2 ? void 0 : t2.length) && (null === (e2 = this.data.end) || void 0 === e2 ? void 0 : e2.length) > 0 && this.range;
    }
  };
  Yi.proxyMethod("inputController.setInputSummary"), Yi.proxyMethod("inputController.requestRender"), Yi.proxyMethod("inputController.requestReparse"), Yi.proxyMethod("responder?.selectionIsExpanded"), Yi.proxyMethod("responder?.insertPlaceholder"), Yi.proxyMethod("responder?.selectPlaceholder"), Yi.proxyMethod("responder?.forgetPlaceholder");
  var Qi = class extends qi {
    constructor() {
      super(...arguments), this.render = this.render.bind(this);
    }
    elementDidMutate() {
      return this.scheduledRender ? this.composing ? null === (t2 = this.delegate) || void 0 === t2 || null === (e2 = t2.inputControllerDidAllowUnhandledInput) || void 0 === e2 ? void 0 : e2.call(t2) : void 0 : this.reparse();
      var t2, e2;
    }
    scheduleRender() {
      return this.scheduledRender ? this.scheduledRender : this.scheduledRender = requestAnimationFrame(this.render);
    }
    render() {
      var t2, e2;
      (cancelAnimationFrame(this.scheduledRender), this.scheduledRender = null, this.composing) || (null === (e2 = this.delegate) || void 0 === e2 || e2.render());
      null === (t2 = this.afterRender) || void 0 === t2 || t2.call(this), this.afterRender = null;
    }
    reparse() {
      var t2;
      return null === (t2 = this.delegate) || void 0 === t2 ? void 0 : t2.reparse();
    }
    insertString() {
      var t2;
      let e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", i2 = arguments.length > 1 ? arguments[1] : void 0;
      return null === (t2 = this.delegate) || void 0 === t2 || t2.inputControllerWillPerformTyping(), this.withTargetDOMRange(function() {
        var t3;
        return null === (t3 = this.responder) || void 0 === t3 ? void 0 : t3.insertString(e2, i2);
      });
    }
    toggleAttributeIfSupported(t2) {
      var e2;
      if (ct().includes(t2))
        return null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformFormatting(t2), this.withTargetDOMRange(function() {
          var e3;
          return null === (e3 = this.responder) || void 0 === e3 ? void 0 : e3.toggleCurrentAttribute(t2);
        });
    }
    activateAttributeIfSupported(t2, e2) {
      var i2;
      if (ct().includes(t2))
        return null === (i2 = this.delegate) || void 0 === i2 || i2.inputControllerWillPerformFormatting(t2), this.withTargetDOMRange(function() {
          var i3;
          return null === (i3 = this.responder) || void 0 === i3 ? void 0 : i3.setCurrentAttribute(t2, e2);
        });
    }
    deleteInDirection(t2) {
      let { recordUndoEntry: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { recordUndoEntry: true };
      var i2;
      e2 && (null === (i2 = this.delegate) || void 0 === i2 || i2.inputControllerWillPerformTyping());
      const n2 = () => {
        var e3;
        return null === (e3 = this.responder) || void 0 === e3 ? void 0 : e3.deleteInDirection(t2);
      }, r2 = this.getTargetDOMRange({ minLength: 2 });
      return r2 ? this.withTargetDOMRange(r2, n2) : n2();
    }
    withTargetDOMRange(t2, e2) {
      var i2;
      return "function" == typeof t2 && (e2 = t2, t2 = this.getTargetDOMRange()), t2 ? null === (i2 = this.responder) || void 0 === i2 ? void 0 : i2.withTargetDOMRange(t2, e2.bind(this)) : (Ft.reset(), e2.call(this));
    }
    getTargetDOMRange() {
      var t2, e2;
      let { minLength: i2 } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : { minLength: 0 };
      const n2 = null === (t2 = (e2 = this.event).getTargetRanges) || void 0 === t2 ? void 0 : t2.call(e2);
      if (n2 && n2.length) {
        const t3 = Zi(n2[0]);
        if (0 === i2 || t3.toString().length >= i2)
          return t3;
      }
    }
    withEvent(t2, e2) {
      let i2;
      this.event = t2;
      try {
        i2 = e2.call(this);
      } finally {
        this.event = null;
      }
      return i2;
    }
  };
  be(Qi, "events", { keydown(t2) {
    if (xt(t2)) {
      var e2;
      const i2 = rn(t2);
      null !== (e2 = this.delegate) && void 0 !== e2 && e2.inputControllerDidReceiveKeyboardCommand(i2) && t2.preventDefault();
    } else {
      let e3 = t2.key;
      t2.altKey && (e3 += "+Alt"), t2.shiftKey && (e3 += "+Shift");
      const i2 = this.constructor.keys[e3];
      if (i2)
        return this.withEvent(t2, i2);
    }
  }, paste(t2) {
    var e2;
    let i2;
    const n2 = null === (e2 = t2.clipboardData) || void 0 === e2 ? void 0 : e2.getData("URL");
    return en(t2) ? (t2.preventDefault(), this.attachFiles(t2.clipboardData.files)) : nn(t2) ? (t2.preventDefault(), i2 = { type: "text/plain", string: t2.clipboardData.getData("text/plain") }, null === (r2 = this.delegate) || void 0 === r2 || r2.inputControllerWillPaste(i2), null === (o2 = this.responder) || void 0 === o2 || o2.insertString(i2.string), this.render(), null === (s2 = this.delegate) || void 0 === s2 ? void 0 : s2.inputControllerDidPaste(i2)) : n2 ? (t2.preventDefault(), i2 = { type: "text/html", html: this.createLinkHTML(n2) }, null === (a2 = this.delegate) || void 0 === a2 || a2.inputControllerWillPaste(i2), null === (l2 = this.responder) || void 0 === l2 || l2.insertHTML(i2.html), this.render(), null === (c2 = this.delegate) || void 0 === c2 ? void 0 : c2.inputControllerDidPaste(i2)) : void 0;
    var r2, o2, s2, a2, l2, c2;
  }, beforeinput(t2) {
    const e2 = this.constructor.inputTypes[t2.inputType];
    e2 && (this.withEvent(t2, e2), this.scheduleRender());
  }, input(t2) {
    Ft.reset();
  }, dragstart(t2) {
    var e2, i2;
    null !== (e2 = this.responder) && void 0 !== e2 && e2.selectionContainsAttachments() && (t2.dataTransfer.setData("application/x-trix-dragging", true), this.dragging = { range: null === (i2 = this.responder) || void 0 === i2 ? void 0 : i2.getSelectedRange(), point: on(t2) });
  }, dragenter(t2) {
    tn(t2) && t2.preventDefault();
  }, dragover(t2) {
    if (this.dragging) {
      t2.preventDefault();
      const i2 = on(t2);
      var e2;
      if (!Rt(i2, this.dragging.point))
        return this.dragging.point = i2, null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.setLocationRangeFromPointRange(i2);
    } else
      tn(t2) && t2.preventDefault();
  }, drop(t2) {
    var e2, i2;
    if (this.dragging)
      return t2.preventDefault(), null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillMoveText(), null === (i2 = this.responder) || void 0 === i2 || i2.moveTextFromRange(this.dragging.range), this.dragging = null, this.scheduleRender();
    if (tn(t2)) {
      var n2;
      t2.preventDefault();
      const e3 = on(t2);
      return null === (n2 = this.responder) || void 0 === n2 || n2.setLocationRangeFromPointRange(e3), this.attachFiles(t2.dataTransfer.files);
    }
  }, dragend() {
    var t2;
    this.dragging && (null === (t2 = this.responder) || void 0 === t2 || t2.setSelectedRange(this.dragging.range), this.dragging = null);
  }, compositionend(t2) {
    this.composing && (this.composing = false, o.recentAndroid || this.scheduleRender());
  } }), be(Qi, "keys", { ArrowLeft() {
    var t2, e2;
    if (null !== (t2 = this.responder) && void 0 !== t2 && t2.shouldManageMovingCursorInDirection("backward"))
      return this.event.preventDefault(), null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.moveCursorInDirection("backward");
  }, ArrowRight() {
    var t2, e2;
    if (null !== (t2 = this.responder) && void 0 !== t2 && t2.shouldManageMovingCursorInDirection("forward"))
      return this.event.preventDefault(), null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.moveCursorInDirection("forward");
  }, Backspace() {
    var t2, e2, i2;
    if (null !== (t2 = this.responder) && void 0 !== t2 && t2.shouldManageDeletingInDirection("backward"))
      return this.event.preventDefault(), null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), null === (i2 = this.responder) || void 0 === i2 || i2.deleteInDirection("backward"), this.render();
  }, Tab() {
    var t2, e2;
    if (null !== (t2 = this.responder) && void 0 !== t2 && t2.canIncreaseNestingLevel())
      return this.event.preventDefault(), null === (e2 = this.responder) || void 0 === e2 || e2.increaseNestingLevel(), this.render();
  }, "Tab+Shift"() {
    var t2, e2;
    if (null !== (t2 = this.responder) && void 0 !== t2 && t2.canDecreaseNestingLevel())
      return this.event.preventDefault(), null === (e2 = this.responder) || void 0 === e2 || e2.decreaseNestingLevel(), this.render();
  } }), be(Qi, "inputTypes", { deleteByComposition() {
    return this.deleteInDirection("backward", { recordUndoEntry: false });
  }, deleteByCut() {
    return this.deleteInDirection("backward");
  }, deleteByDrag() {
    return this.event.preventDefault(), this.withTargetDOMRange(function() {
      var t2;
      this.deleteByDragRange = null === (t2 = this.responder) || void 0 === t2 ? void 0 : t2.getSelectedRange();
    });
  }, deleteCompositionText() {
    return this.deleteInDirection("backward", { recordUndoEntry: false });
  }, deleteContent() {
    return this.deleteInDirection("backward");
  }, deleteContentBackward() {
    return this.deleteInDirection("backward");
  }, deleteContentForward() {
    return this.deleteInDirection("forward");
  }, deleteEntireSoftLine() {
    return this.deleteInDirection("forward");
  }, deleteHardLineBackward() {
    return this.deleteInDirection("backward");
  }, deleteHardLineForward() {
    return this.deleteInDirection("forward");
  }, deleteSoftLineBackward() {
    return this.deleteInDirection("backward");
  }, deleteSoftLineForward() {
    return this.deleteInDirection("forward");
  }, deleteWordBackward() {
    return this.deleteInDirection("backward");
  }, deleteWordForward() {
    return this.deleteInDirection("forward");
  }, formatBackColor() {
    return this.activateAttributeIfSupported("backgroundColor", this.event.data);
  }, formatBold() {
    return this.toggleAttributeIfSupported("bold");
  }, formatFontColor() {
    return this.activateAttributeIfSupported("color", this.event.data);
  }, formatFontName() {
    return this.activateAttributeIfSupported("font", this.event.data);
  }, formatIndent() {
    var t2;
    if (null !== (t2 = this.responder) && void 0 !== t2 && t2.canIncreaseNestingLevel())
      return this.withTargetDOMRange(function() {
        var t3;
        return null === (t3 = this.responder) || void 0 === t3 ? void 0 : t3.increaseNestingLevel();
      });
  }, formatItalic() {
    return this.toggleAttributeIfSupported("italic");
  }, formatJustifyCenter() {
    return this.toggleAttributeIfSupported("justifyCenter");
  }, formatJustifyFull() {
    return this.toggleAttributeIfSupported("justifyFull");
  }, formatJustifyLeft() {
    return this.toggleAttributeIfSupported("justifyLeft");
  }, formatJustifyRight() {
    return this.toggleAttributeIfSupported("justifyRight");
  }, formatOutdent() {
    var t2;
    if (null !== (t2 = this.responder) && void 0 !== t2 && t2.canDecreaseNestingLevel())
      return this.withTargetDOMRange(function() {
        var t3;
        return null === (t3 = this.responder) || void 0 === t3 ? void 0 : t3.decreaseNestingLevel();
      });
  }, formatRemove() {
    this.withTargetDOMRange(function() {
      for (const i2 in null === (t2 = this.responder) || void 0 === t2 ? void 0 : t2.getCurrentAttributes()) {
        var t2, e2;
        null === (e2 = this.responder) || void 0 === e2 || e2.removeCurrentAttribute(i2);
      }
    });
  }, formatSetBlockTextDirection() {
    return this.activateAttributeIfSupported("blockDir", this.event.data);
  }, formatSetInlineTextDirection() {
    return this.activateAttributeIfSupported("textDir", this.event.data);
  }, formatStrikeThrough() {
    return this.toggleAttributeIfSupported("strike");
  }, formatSubscript() {
    return this.toggleAttributeIfSupported("sub");
  }, formatSuperscript() {
    return this.toggleAttributeIfSupported("sup");
  }, formatUnderline() {
    return this.toggleAttributeIfSupported("underline");
  }, historyRedo() {
    var t2;
    return null === (t2 = this.delegate) || void 0 === t2 ? void 0 : t2.inputControllerWillPerformRedo();
  }, historyUndo() {
    var t2;
    return null === (t2 = this.delegate) || void 0 === t2 ? void 0 : t2.inputControllerWillPerformUndo();
  }, insertCompositionText() {
    return this.composing = true, this.insertString(this.event.data);
  }, insertFromComposition() {
    return this.composing = false, this.insertString(this.event.data);
  }, insertFromDrop() {
    const t2 = this.deleteByDragRange;
    var e2;
    if (t2)
      return this.deleteByDragRange = null, null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillMoveText(), this.withTargetDOMRange(function() {
        var e3;
        return null === (e3 = this.responder) || void 0 === e3 ? void 0 : e3.moveTextFromRange(t2);
      });
  }, insertFromPaste() {
    var t2;
    const { dataTransfer: e2 } = this.event, i2 = { dataTransfer: e2 }, n2 = e2.getData("URL"), r2 = e2.getData("text/html");
    if (n2) {
      var o2;
      let t3;
      this.event.preventDefault(), i2.type = "text/html";
      const r3 = e2.getData("public.url-name");
      t3 = r3 ? Wt(r3).trim() : n2, i2.html = this.createLinkHTML(n2, t3), null === (o2 = this.delegate) || void 0 === o2 || o2.inputControllerWillPaste(i2), this.withTargetDOMRange(function() {
        var t4;
        return null === (t4 = this.responder) || void 0 === t4 ? void 0 : t4.insertHTML(i2.html);
      }), this.afterRender = () => {
        var t4;
        return null === (t4 = this.delegate) || void 0 === t4 ? void 0 : t4.inputControllerDidPaste(i2);
      };
    } else if (At(e2)) {
      var s2;
      i2.type = "text/plain", i2.string = e2.getData("text/plain"), null === (s2 = this.delegate) || void 0 === s2 || s2.inputControllerWillPaste(i2), this.withTargetDOMRange(function() {
        var t3;
        return null === (t3 = this.responder) || void 0 === t3 ? void 0 : t3.insertString(i2.string);
      }), this.afterRender = () => {
        var t3;
        return null === (t3 = this.delegate) || void 0 === t3 ? void 0 : t3.inputControllerDidPaste(i2);
      };
    } else if (r2) {
      var a2;
      this.event.preventDefault(), i2.type = "text/html", i2.html = r2, null === (a2 = this.delegate) || void 0 === a2 || a2.inputControllerWillPaste(i2), this.withTargetDOMRange(function() {
        var t3;
        return null === (t3 = this.responder) || void 0 === t3 ? void 0 : t3.insertHTML(i2.html);
      }), this.afterRender = () => {
        var t3;
        return null === (t3 = this.delegate) || void 0 === t3 ? void 0 : t3.inputControllerDidPaste(i2);
      };
    } else if (null !== (t2 = e2.files) && void 0 !== t2 && t2.length) {
      var l2;
      i2.type = "File", i2.file = e2.files[0], null === (l2 = this.delegate) || void 0 === l2 || l2.inputControllerWillPaste(i2), this.withTargetDOMRange(function() {
        var t3;
        return null === (t3 = this.responder) || void 0 === t3 ? void 0 : t3.insertFile(i2.file);
      }), this.afterRender = () => {
        var t3;
        return null === (t3 = this.delegate) || void 0 === t3 ? void 0 : t3.inputControllerDidPaste(i2);
      };
    }
  }, insertFromYank() {
    return this.insertString(this.event.data);
  }, insertLineBreak() {
    return this.insertString("\n");
  }, insertLink() {
    return this.activateAttributeIfSupported("href", this.event.data);
  }, insertOrderedList() {
    return this.toggleAttributeIfSupported("number");
  }, insertParagraph() {
    var t2;
    return null === (t2 = this.delegate) || void 0 === t2 || t2.inputControllerWillPerformTyping(), this.withTargetDOMRange(function() {
      var t3;
      return null === (t3 = this.responder) || void 0 === t3 ? void 0 : t3.insertLineBreak();
    });
  }, insertReplacementText() {
    return this.insertString(this.event.dataTransfer.getData("text/plain"), { updatePosition: false });
  }, insertText() {
    var t2;
    return this.insertString(this.event.data || (null === (t2 = this.event.dataTransfer) || void 0 === t2 ? void 0 : t2.getData("text/plain")));
  }, insertTranspose() {
    return this.insertString(this.event.data);
  }, insertUnorderedList() {
    return this.toggleAttributeIfSupported("bullet");
  } });
  var Zi = function(t2) {
    const e2 = document.createRange();
    return e2.setStart(t2.startContainer, t2.startOffset), e2.setEnd(t2.endContainer, t2.endOffset), e2;
  };
  var tn = (t2) => {
    var e2;
    return Array.from((null === (e2 = t2.dataTransfer) || void 0 === e2 ? void 0 : e2.types) || []).includes("Files");
  };
  var en = function(t2) {
    const e2 = t2.clipboardData;
    if (e2)
      return e2.types.includes("Files") && 1 === e2.types.length && e2.files.length >= 1;
  };
  var nn = function(t2) {
    const e2 = t2.clipboardData;
    if (e2)
      return e2.types.includes("text/plain") && 1 === e2.types.length;
  };
  var rn = function(t2) {
    const e2 = [];
    return t2.altKey && e2.push("alt"), t2.shiftKey && e2.push("shift"), e2.push(t2.key), e2;
  };
  var on = (t2) => ({ x: t2.clientX, y: t2.clientY });
  var sn = "".concat("[data-trix-attribute]", ", ").concat("[data-trix-action]");
  var an = "".concat("[data-trix-dialog]", "[data-trix-active]");
  var ln = "".concat("[data-trix-dialog]", " [data-trix-method]");
  var cn = "".concat("[data-trix-dialog]", " [data-trix-input]");
  var hn = (t2, e2) => (e2 || (e2 = dn(t2)), t2.querySelector("[data-trix-input][name='".concat(e2, "']")));
  var un = (t2) => t2.getAttribute("data-trix-action");
  var dn = (t2) => t2.getAttribute("data-trix-attribute") || t2.getAttribute("data-trix-dialog-attribute");
  var gn = class extends U {
    constructor(t2) {
      super(t2), this.didClickActionButton = this.didClickActionButton.bind(this), this.didClickAttributeButton = this.didClickAttributeButton.bind(this), this.didClickDialogButton = this.didClickDialogButton.bind(this), this.didKeyDownDialogInput = this.didKeyDownDialogInput.bind(this), this.element = t2, this.attributes = {}, this.actions = {}, this.resetDialogInputs(), d("mousedown", { onElement: this.element, matchingSelector: "[data-trix-action]", withCallback: this.didClickActionButton }), d("mousedown", { onElement: this.element, matchingSelector: "[data-trix-attribute]", withCallback: this.didClickAttributeButton }), d("click", { onElement: this.element, matchingSelector: sn, preventDefault: true }), d("click", { onElement: this.element, matchingSelector: ln, withCallback: this.didClickDialogButton }), d("keydown", { onElement: this.element, matchingSelector: cn, withCallback: this.didKeyDownDialogInput });
    }
    didClickActionButton(t2, e2) {
      var i2;
      null === (i2 = this.delegate) || void 0 === i2 || i2.toolbarDidClickButton(), t2.preventDefault();
      const n2 = un(e2);
      return this.getDialog(n2) ? this.toggleDialog(n2) : null === (r2 = this.delegate) || void 0 === r2 ? void 0 : r2.toolbarDidInvokeAction(n2);
      var r2;
    }
    didClickAttributeButton(t2, e2) {
      var i2;
      null === (i2 = this.delegate) || void 0 === i2 || i2.toolbarDidClickButton(), t2.preventDefault();
      const n2 = dn(e2);
      var r2;
      this.getDialog(n2) ? this.toggleDialog(n2) : null === (r2 = this.delegate) || void 0 === r2 || r2.toolbarDidToggleAttribute(n2);
      return this.refreshAttributeButtons();
    }
    didClickDialogButton(t2, e2) {
      const i2 = p(e2, { matchingSelector: "[data-trix-dialog]" });
      return this[e2.getAttribute("data-trix-method")].call(this, i2);
    }
    didKeyDownDialogInput(t2, e2) {
      if (13 === t2.keyCode) {
        t2.preventDefault();
        const i2 = e2.getAttribute("name"), n2 = this.getDialog(i2);
        this.setAttribute(n2);
      }
      if (27 === t2.keyCode)
        return t2.preventDefault(), this.hideDialog();
    }
    updateActions(t2) {
      return this.actions = t2, this.refreshActionButtons();
    }
    refreshActionButtons() {
      return this.eachActionButton((t2, e2) => {
        t2.disabled = false === this.actions[e2];
      });
    }
    eachActionButton(t2) {
      return Array.from(this.element.querySelectorAll("[data-trix-action]")).map((e2) => t2(e2, un(e2)));
    }
    updateAttributes(t2) {
      return this.attributes = t2, this.refreshAttributeButtons();
    }
    refreshAttributeButtons() {
      return this.eachAttributeButton((t2, e2) => (t2.disabled = false === this.attributes[e2], this.attributes[e2] || this.dialogIsVisible(e2) ? (t2.setAttribute("data-trix-active", ""), t2.classList.add("trix-active")) : (t2.removeAttribute("data-trix-active"), t2.classList.remove("trix-active"))));
    }
    eachAttributeButton(t2) {
      return Array.from(this.element.querySelectorAll("[data-trix-attribute]")).map((e2) => t2(e2, dn(e2)));
    }
    applyKeyboardCommand(t2) {
      const e2 = JSON.stringify(t2.sort());
      for (const t3 of Array.from(this.element.querySelectorAll("[data-trix-key]"))) {
        const i2 = t3.getAttribute("data-trix-key").split("+");
        if (JSON.stringify(i2.sort()) === e2)
          return g("mousedown", { onElement: t3 }), true;
      }
      return false;
    }
    dialogIsVisible(t2) {
      const e2 = this.getDialog(t2);
      if (e2)
        return e2.hasAttribute("data-trix-active");
    }
    toggleDialog(t2) {
      return this.dialogIsVisible(t2) ? this.hideDialog() : this.showDialog(t2);
    }
    showDialog(t2) {
      var e2, i2;
      this.hideDialog(), null === (e2 = this.delegate) || void 0 === e2 || e2.toolbarWillShowDialog();
      const n2 = this.getDialog(t2);
      n2.setAttribute("data-trix-active", ""), n2.classList.add("trix-active"), Array.from(n2.querySelectorAll("input[disabled]")).forEach((t3) => {
        t3.removeAttribute("disabled");
      });
      const r2 = dn(n2);
      if (r2) {
        const e3 = hn(n2, t2);
        e3 && (e3.value = this.attributes[r2] || "", e3.select());
      }
      return null === (i2 = this.delegate) || void 0 === i2 ? void 0 : i2.toolbarDidShowDialog(t2);
    }
    setAttribute(t2) {
      const e2 = dn(t2), i2 = hn(t2, e2);
      return i2.willValidate && !i2.checkValidity() ? (i2.setAttribute("data-trix-validate", ""), i2.classList.add("trix-validate"), i2.focus()) : (null === (n2 = this.delegate) || void 0 === n2 || n2.toolbarDidUpdateAttribute(e2, i2.value), this.hideDialog());
      var n2;
    }
    removeAttribute(t2) {
      var e2;
      const i2 = dn(t2);
      return null === (e2 = this.delegate) || void 0 === e2 || e2.toolbarDidRemoveAttribute(i2), this.hideDialog();
    }
    hideDialog() {
      const t2 = this.element.querySelector(an);
      var e2;
      if (t2)
        return t2.removeAttribute("data-trix-active"), t2.classList.remove("trix-active"), this.resetDialogInputs(), null === (e2 = this.delegate) || void 0 === e2 ? void 0 : e2.toolbarDidHideDialog(((t3) => t3.getAttribute("data-trix-dialog"))(t2));
    }
    resetDialogInputs() {
      Array.from(this.element.querySelectorAll(cn)).forEach((t2) => {
        t2.setAttribute("disabled", "disabled"), t2.removeAttribute("data-trix-validate"), t2.classList.remove("trix-validate");
      });
    }
    getDialog(t2) {
      return this.element.querySelector("[data-trix-dialog=".concat(t2, "]"));
    }
  };
  var mn = class extends Fi {
    constructor(t2) {
      let { editorElement: e2, document: i2, html: n2 } = t2;
      super(...arguments), this.editorElement = e2, this.selectionManager = new Ci(this.editorElement), this.selectionManager.delegate = this, this.composition = new ci(), this.composition.delegate = this, this.attachmentManager = new ai(this.composition.getAttachments()), this.attachmentManager.delegate = this, this.inputController = 2 === P.getLevel() ? new Qi(this.editorElement) : new Ji(this.editorElement), this.inputController.delegate = this, this.inputController.responder = this.composition, this.compositionController = new Ti(this.editorElement, this.composition), this.compositionController.delegate = this, this.toolbarController = new gn(this.editorElement.toolbarElement), this.toolbarController.delegate = this, this.editor = new pi(this.composition, this.selectionManager, this.editorElement), i2 ? this.editor.loadDocument(i2) : this.editor.loadHTML(n2);
    }
    registerSelectionManager() {
      return Ft.registerSelectionManager(this.selectionManager);
    }
    unregisterSelectionManager() {
      return Ft.unregisterSelectionManager(this.selectionManager);
    }
    render() {
      return this.compositionController.render();
    }
    reparse() {
      return this.composition.replaceHTML(this.editorElement.innerHTML);
    }
    compositionDidChangeDocument(t2) {
      if (this.notifyEditorElement("document-change"), !this.handlingInput)
        return this.render();
    }
    compositionDidChangeCurrentAttributes(t2) {
      return this.currentAttributes = t2, this.toolbarController.updateAttributes(this.currentAttributes), this.updateCurrentActions(), this.notifyEditorElement("attributes-change", { attributes: this.currentAttributes });
    }
    compositionDidPerformInsertionAtRange(t2) {
      this.pasting && (this.pastedRange = t2);
    }
    compositionShouldAcceptFile(t2) {
      return this.notifyEditorElement("file-accept", { file: t2 });
    }
    compositionDidAddAttachment(t2) {
      const e2 = this.attachmentManager.manageAttachment(t2);
      return this.notifyEditorElement("attachment-add", { attachment: e2 });
    }
    compositionDidEditAttachment(t2) {
      this.compositionController.rerenderViewForObject(t2);
      const e2 = this.attachmentManager.manageAttachment(t2);
      return this.notifyEditorElement("attachment-edit", { attachment: e2 }), this.notifyEditorElement("change");
    }
    compositionDidChangeAttachmentPreviewURL(t2) {
      return this.compositionController.invalidateViewForObject(t2), this.notifyEditorElement("change");
    }
    compositionDidRemoveAttachment(t2) {
      const e2 = this.attachmentManager.unmanageAttachment(t2);
      return this.notifyEditorElement("attachment-remove", { attachment: e2 });
    }
    compositionDidStartEditingAttachment(t2, e2) {
      return this.attachmentLocationRange = this.composition.document.getLocationRangeOfAttachment(t2), this.compositionController.installAttachmentEditorForAttachment(t2, e2), this.selectionManager.setLocationRange(this.attachmentLocationRange);
    }
    compositionDidStopEditingAttachment(t2) {
      this.compositionController.uninstallAttachmentEditor(), this.attachmentLocationRange = null;
    }
    compositionDidRequestChangingSelectionToLocationRange(t2) {
      if (!this.loadingSnapshot || this.isFocused())
        return this.requestedLocationRange = t2, this.compositionRevisionWhenLocationRangeRequested = this.composition.revision, this.handlingInput ? void 0 : this.render();
    }
    compositionWillLoadSnapshot() {
      this.loadingSnapshot = true;
    }
    compositionDidLoadSnapshot() {
      this.compositionController.refreshViewCache(), this.render(), this.loadingSnapshot = false;
    }
    getSelectionManager() {
      return this.selectionManager;
    }
    attachmentManagerDidRequestRemovalOfAttachment(t2) {
      return this.removeAttachment(t2);
    }
    compositionControllerWillSyncDocumentView() {
      return this.inputController.editorWillSyncDocumentView(), this.selectionManager.lock(), this.selectionManager.clearSelection();
    }
    compositionControllerDidSyncDocumentView() {
      return this.inputController.editorDidSyncDocumentView(), this.selectionManager.unlock(), this.updateCurrentActions(), this.notifyEditorElement("sync");
    }
    compositionControllerDidRender() {
      this.requestedLocationRange && (this.compositionRevisionWhenLocationRangeRequested === this.composition.revision && this.selectionManager.setLocationRange(this.requestedLocationRange), this.requestedLocationRange = null, this.compositionRevisionWhenLocationRangeRequested = null), this.renderedCompositionRevision !== this.composition.revision && (this.runEditorFilters(), this.composition.updateCurrentAttributes(), this.notifyEditorElement("render")), this.renderedCompositionRevision = this.composition.revision;
    }
    compositionControllerDidFocus() {
      return this.isFocusedInvisibly() && this.setLocationRange({ index: 0, offset: 0 }), this.toolbarController.hideDialog(), this.notifyEditorElement("focus");
    }
    compositionControllerDidBlur() {
      return this.notifyEditorElement("blur");
    }
    compositionControllerDidSelectAttachment(t2, e2) {
      return this.toolbarController.hideDialog(), this.composition.editAttachment(t2, e2);
    }
    compositionControllerDidRequestDeselectingAttachment(t2) {
      const e2 = this.attachmentLocationRange || this.composition.document.getLocationRangeOfAttachment(t2);
      return this.selectionManager.setLocationRange(e2[1]);
    }
    compositionControllerWillUpdateAttachment(t2) {
      return this.editor.recordUndoEntry("Edit Attachment", { context: t2.id, consolidatable: true });
    }
    compositionControllerDidRequestRemovalOfAttachment(t2) {
      return this.removeAttachment(t2);
    }
    inputControllerWillHandleInput() {
      this.handlingInput = true, this.requestedRender = false;
    }
    inputControllerDidRequestRender() {
      this.requestedRender = true;
    }
    inputControllerDidHandleInput() {
      if (this.handlingInput = false, this.requestedRender)
        return this.requestedRender = false, this.render();
    }
    inputControllerDidAllowUnhandledInput() {
      return this.notifyEditorElement("change");
    }
    inputControllerDidRequestReparse() {
      return this.reparse();
    }
    inputControllerWillPerformTyping() {
      return this.recordTypingUndoEntry();
    }
    inputControllerWillPerformFormatting(t2) {
      return this.recordFormattingUndoEntry(t2);
    }
    inputControllerWillCutText() {
      return this.editor.recordUndoEntry("Cut");
    }
    inputControllerWillPaste(t2) {
      return this.editor.recordUndoEntry("Paste"), this.pasting = true, this.notifyEditorElement("before-paste", { paste: t2 });
    }
    inputControllerDidPaste(t2) {
      return t2.range = this.pastedRange, this.pastedRange = null, this.pasting = null, this.notifyEditorElement("paste", { paste: t2 });
    }
    inputControllerWillMoveText() {
      return this.editor.recordUndoEntry("Move");
    }
    inputControllerWillAttachFiles() {
      return this.editor.recordUndoEntry("Drop Files");
    }
    inputControllerWillPerformUndo() {
      return this.editor.undo();
    }
    inputControllerWillPerformRedo() {
      return this.editor.redo();
    }
    inputControllerDidReceiveKeyboardCommand(t2) {
      return this.toolbarController.applyKeyboardCommand(t2);
    }
    inputControllerDidStartDrag() {
      this.locationRangeBeforeDrag = this.selectionManager.getLocationRange();
    }
    inputControllerDidReceiveDragOverPoint(t2) {
      return this.selectionManager.setLocationRangeFromPointRange(t2);
    }
    inputControllerDidCancelDrag() {
      this.selectionManager.setLocationRange(this.locationRangeBeforeDrag), this.locationRangeBeforeDrag = null;
    }
    locationRangeDidChange(t2) {
      return this.composition.updateCurrentAttributes(), this.updateCurrentActions(), this.attachmentLocationRange && !kt(this.attachmentLocationRange, t2) && this.composition.stopEditingAttachment(), this.notifyEditorElement("selection-change");
    }
    toolbarDidClickButton() {
      if (!this.getLocationRange())
        return this.setLocationRange({ index: 0, offset: 0 });
    }
    toolbarDidInvokeAction(t2) {
      return this.invokeAction(t2);
    }
    toolbarDidToggleAttribute(t2) {
      if (this.recordFormattingUndoEntry(t2), this.composition.toggleCurrentAttribute(t2), this.render(), !this.selectionFrozen)
        return this.editorElement.focus();
    }
    toolbarDidUpdateAttribute(t2, e2) {
      if (this.recordFormattingUndoEntry(t2), this.composition.setCurrentAttribute(t2, e2), this.render(), !this.selectionFrozen)
        return this.editorElement.focus();
    }
    toolbarDidRemoveAttribute(t2) {
      if (this.recordFormattingUndoEntry(t2), this.composition.removeCurrentAttribute(t2), this.render(), !this.selectionFrozen)
        return this.editorElement.focus();
    }
    toolbarWillShowDialog(t2) {
      return this.composition.expandSelectionForEditing(), this.freezeSelection();
    }
    toolbarDidShowDialog(t2) {
      return this.notifyEditorElement("toolbar-dialog-show", { dialogName: t2 });
    }
    toolbarDidHideDialog(t2) {
      return this.thawSelection(), this.editorElement.focus(), this.notifyEditorElement("toolbar-dialog-hide", { dialogName: t2 });
    }
    freezeSelection() {
      if (!this.selectionFrozen)
        return this.selectionManager.lock(), this.composition.freezeSelection(), this.selectionFrozen = true, this.render();
    }
    thawSelection() {
      if (this.selectionFrozen)
        return this.composition.thawSelection(), this.selectionManager.unlock(), this.selectionFrozen = false, this.render();
    }
    canInvokeAction(t2) {
      return !!this.actionIsExternal(t2) || !(null === (e2 = this.actions[t2]) || void 0 === e2 || null === (i2 = e2.test) || void 0 === i2 || !i2.call(this));
      var e2, i2;
    }
    invokeAction(t2) {
      return this.actionIsExternal(t2) ? this.notifyEditorElement("action-invoke", { actionName: t2 }) : null === (e2 = this.actions[t2]) || void 0 === e2 || null === (i2 = e2.perform) || void 0 === i2 ? void 0 : i2.call(this);
      var e2, i2;
    }
    actionIsExternal(t2) {
      return /^x-./.test(t2);
    }
    getCurrentActions() {
      const t2 = {};
      for (const e2 in this.actions)
        t2[e2] = this.canInvokeAction(e2);
      return t2;
    }
    updateCurrentActions() {
      const t2 = this.getCurrentActions();
      if (!Rt(t2, this.currentActions))
        return this.currentActions = t2, this.toolbarController.updateActions(this.currentActions), this.notifyEditorElement("actions-change", { actions: this.currentActions });
    }
    runEditorFilters() {
      let t2 = this.composition.getSnapshot();
      if (Array.from(this.editor.filters).forEach((e3) => {
        const { document: i3, selectedRange: n2 } = t2;
        t2 = e3.call(this.editor, t2) || {}, t2.document || (t2.document = i3), t2.selectedRange || (t2.selectedRange = n2);
      }), e2 = t2, i2 = this.composition.getSnapshot(), !kt(e2.selectedRange, i2.selectedRange) || !e2.document.isEqualTo(i2.document))
        return this.composition.loadSnapshot(t2);
      var e2, i2;
    }
    updateInputElement() {
      const t2 = function(t3, e2) {
        const i2 = ri[e2];
        if (i2)
          return i2(t3);
        throw new Error("unknown content type: ".concat(e2));
      }(this.compositionController.getSerializableElement(), "text/html");
      return this.editorElement.setInputElementValue(t2);
    }
    notifyEditorElement(t2, e2) {
      switch (t2) {
        case "document-change":
          this.documentChangedSinceLastRender = true;
          break;
        case "render":
          this.documentChangedSinceLastRender && (this.documentChangedSinceLastRender = false, this.notifyEditorElement("change"));
          break;
        case "change":
        case "attachment-add":
        case "attachment-edit":
        case "attachment-remove":
          this.updateInputElement();
      }
      return this.editorElement.notify(t2, e2);
    }
    removeAttachment(t2) {
      return this.editor.recordUndoEntry("Delete Attachment"), this.composition.removeAttachment(t2), this.render();
    }
    recordFormattingUndoEntry(t2) {
      const e2 = ht(t2), i2 = this.selectionManager.getLocationRange();
      if (e2 || !St(i2))
        return this.editor.recordUndoEntry("Formatting", { context: this.getUndoContext(), consolidatable: true });
    }
    recordTypingUndoEntry() {
      return this.editor.recordUndoEntry("Typing", { context: this.getUndoContext(this.currentAttributes), consolidatable: true });
    }
    getUndoContext() {
      for (var t2 = arguments.length, e2 = new Array(t2), i2 = 0; i2 < t2; i2++)
        e2[i2] = arguments[i2];
      return [this.getLocationContext(), this.getTimeContext(), ...Array.from(e2)];
    }
    getLocationContext() {
      const t2 = this.selectionManager.getLocationRange();
      return St(t2) ? t2[0].index : t2;
    }
    getTimeContext() {
      return j.interval > 0 ? Math.floor((/* @__PURE__ */ new Date()).getTime() / j.interval) : 0;
    }
    isFocused() {
      var t2;
      return this.editorElement === (null === (t2 = this.editorElement.ownerDocument) || void 0 === t2 ? void 0 : t2.activeElement);
    }
    isFocusedInvisibly() {
      return this.isFocused() && !this.getLocationRange();
    }
    get actions() {
      return this.constructor.actions;
    }
  };
  be(mn, "actions", { undo: { test() {
    return this.editor.canUndo();
  }, perform() {
    return this.editor.undo();
  } }, redo: { test() {
    return this.editor.canRedo();
  }, perform() {
    return this.editor.redo();
  } }, link: { test() {
    return this.editor.canActivateAttribute("href");
  } }, increaseNestingLevel: { test() {
    return this.editor.canIncreaseNestingLevel();
  }, perform() {
    return this.editor.increaseNestingLevel() && this.render();
  } }, decreaseNestingLevel: { test() {
    return this.editor.canDecreaseNestingLevel();
  }, perform() {
    return this.editor.decreaseNestingLevel() && this.render();
  } }, attachFiles: { test: () => true, perform() {
    return P.pickFiles(this.editor.insertFiles);
  } } }), mn.proxyMethod("getSelectionManager().setLocationRange"), mn.proxyMethod("getSelectionManager().getLocationRange");
  var pn = Object.freeze({ __proto__: null, AttachmentEditorController: wi, CompositionController: Ti, Controller: Fi, EditorController: mn, InputController: qi, Level0InputController: Ji, Level2InputController: Qi, ToolbarController: gn });
  var fn = Object.freeze({ __proto__: null, MutationObserver: Pi, SelectionChangeObserver: wt });
  var bn = Object.freeze({ __proto__: null, FileVerificationOperation: Oi, ImagePreloadOperation: Ae });
  mt("trix-toolbar", "%t {\n  display: block;\n}\n\n%t {\n  white-space: nowrap;\n}\n\n%t [data-trix-dialog] {\n  display: none;\n}\n\n%t [data-trix-dialog][data-trix-active] {\n  display: block;\n}\n\n%t [data-trix-dialog] [data-trix-validate]:invalid {\n  background-color: #ffdddd;\n}");
  var vn = class extends HTMLElement {
    connectedCallback() {
      "" === this.innerHTML && (this.innerHTML = M.getDefaultHTML());
    }
  };
  var An = 0;
  var xn = function(t2) {
    if (!t2.hasAttribute("contenteditable"))
      return t2.setAttribute("contenteditable", ""), function(t3) {
        let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
        return e2.times = 1, d(t3, e2);
      }("focus", { onElement: t2, withCallback: () => yn(t2) });
  };
  var yn = function(t2) {
    return Cn(t2), Rn(t2);
  };
  var Cn = function(t2) {
    var e2, i2;
    if (null !== (e2 = (i2 = document).queryCommandSupported) && void 0 !== e2 && e2.call(i2, "enableObjectResizing"))
      return document.execCommand("enableObjectResizing", false, false), d("mscontrolselect", { onElement: t2, preventDefault: true });
  };
  var Rn = function(t2) {
    var i2, n2;
    if (null !== (i2 = (n2 = document).queryCommandSupported) && void 0 !== i2 && i2.call(n2, "DefaultParagraphSeparator")) {
      const { tagName: t3 } = e.default;
      if (["div", "p"].includes(t3))
        return document.execCommand("DefaultParagraphSeparator", false, t3);
    }
  };
  var En = o.forcesObjectResizing ? { display: "inline", width: "auto" } : { display: "inline-block", width: "1px" };
  mt("trix-editor", "%t {\n    display: block;\n}\n\n%t:empty:not(:focus)::before {\n    content: attr(placeholder);\n    color: graytext;\n    cursor: text;\n    pointer-events: none;\n    white-space: pre-line;\n}\n\n%t a[contenteditable=false] {\n    cursor: text;\n}\n\n%t img {\n    max-width: 100%;\n    height: auto;\n}\n\n%t ".concat("[data-trix-attachment]", " figcaption textarea {\n    resize: none;\n}\n\n%t ").concat("[data-trix-attachment]", " figcaption textarea.trix-autoresize-clone {\n    position: absolute;\n    left: -9999px;\n    max-height: 0px;\n}\n\n%t ").concat("[data-trix-attachment]", " figcaption[data-trix-placeholder]:empty::before {\n    content: attr(data-trix-placeholder);\n    color: graytext;\n}\n\n%t [data-trix-cursor-target] {\n    display: ").concat(En.display, " !important;\n    width: ").concat(En.width, " !important;\n    padding: 0 !important;\n    margin: 0 !important;\n    border: none !important;\n}\n\n%t [data-trix-cursor-target=left] {\n    vertical-align: top !important;\n    margin-left: -1px !important;\n}\n\n%t [data-trix-cursor-target=right] {\n    vertical-align: bottom !important;\n    margin-right: -1px !important;\n}"));
  var Sn = class extends HTMLElement {
    get trixId() {
      return this.hasAttribute("trix-id") ? this.getAttribute("trix-id") : (this.setAttribute("trix-id", ++An), this.trixId);
    }
    get labels() {
      const t2 = [];
      this.id && this.ownerDocument && t2.push(...Array.from(this.ownerDocument.querySelectorAll("label[for='".concat(this.id, "']")) || []));
      const e2 = p(this, { matchingSelector: "label" });
      return e2 && [this, null].includes(e2.control) && t2.push(e2), t2;
    }
    get toolbarElement() {
      var t2;
      if (this.hasAttribute("toolbar"))
        return null === (t2 = this.ownerDocument) || void 0 === t2 ? void 0 : t2.getElementById(this.getAttribute("toolbar"));
      if (this.parentNode) {
        const t3 = "trix-toolbar-".concat(this.trixId);
        this.setAttribute("toolbar", t3);
        const e2 = C("trix-toolbar", { id: t3 });
        return this.parentNode.insertBefore(e2, this), e2;
      }
    }
    get form() {
      var t2;
      return null === (t2 = this.inputElement) || void 0 === t2 ? void 0 : t2.form;
    }
    get inputElement() {
      var t2;
      if (this.hasAttribute("input"))
        return null === (t2 = this.ownerDocument) || void 0 === t2 ? void 0 : t2.getElementById(this.getAttribute("input"));
      if (this.parentNode) {
        const t3 = "trix-input-".concat(this.trixId);
        this.setAttribute("input", t3);
        const e2 = C("input", { type: "hidden", id: t3 });
        return this.parentNode.insertBefore(e2, this.nextElementSibling), e2;
      }
    }
    get editor() {
      var t2;
      return null === (t2 = this.editorController) || void 0 === t2 ? void 0 : t2.editor;
    }
    get name() {
      var t2;
      return null === (t2 = this.inputElement) || void 0 === t2 ? void 0 : t2.name;
    }
    get value() {
      var t2;
      return null === (t2 = this.inputElement) || void 0 === t2 ? void 0 : t2.value;
    }
    set value(t2) {
      var e2;
      this.defaultValue = t2, null === (e2 = this.editor) || void 0 === e2 || e2.loadHTML(this.defaultValue);
    }
    notify(t2, e2) {
      if (this.editorController)
        return g("trix-".concat(t2), { onElement: this, attributes: e2 });
    }
    setInputElementValue(t2) {
      this.inputElement && (this.inputElement.value = t2);
    }
    connectedCallback() {
      this.hasAttribute("data-trix-internal") || (xn(this), function(t2) {
        if (!t2.hasAttribute("role"))
          t2.setAttribute("role", "textbox");
      }(this), function(t2) {
        if (t2.hasAttribute("aria-label") || t2.hasAttribute("aria-labelledby"))
          return;
        const e2 = function() {
          const e3 = Array.from(t2.labels).map((e4) => {
            if (!e4.contains(t2))
              return e4.textContent;
          }).filter((t3) => t3), i2 = e3.join(" ");
          return i2 ? t2.setAttribute("aria-label", i2) : t2.removeAttribute("aria-label");
        };
        e2(), d("focus", { onElement: t2, withCallback: e2 });
      }(this), this.editorController || (g("trix-before-initialize", { onElement: this }), this.editorController = new mn({ editorElement: this, html: this.defaultValue = this.value }), requestAnimationFrame(() => g("trix-initialize", { onElement: this }))), this.editorController.registerSelectionManager(), this.registerResetListener(), this.registerClickListener(), function(t2) {
        if (!document.querySelector(":focus") && t2.hasAttribute("autofocus") && document.querySelector("[autofocus]") === t2)
          t2.focus();
      }(this));
    }
    disconnectedCallback() {
      var t2;
      return null === (t2 = this.editorController) || void 0 === t2 || t2.unregisterSelectionManager(), this.unregisterResetListener(), this.unregisterClickListener();
    }
    registerResetListener() {
      return this.resetListener = this.resetBubbled.bind(this), window.addEventListener("reset", this.resetListener, false);
    }
    unregisterResetListener() {
      return window.removeEventListener("reset", this.resetListener, false);
    }
    registerClickListener() {
      return this.clickListener = this.clickBubbled.bind(this), window.addEventListener("click", this.clickListener, false);
    }
    unregisterClickListener() {
      return window.removeEventListener("click", this.clickListener, false);
    }
    resetBubbled(t2) {
      if (!t2.defaultPrevented && t2.target === this.form)
        return this.reset();
    }
    clickBubbled(t2) {
      if (t2.defaultPrevented)
        return;
      if (this.contains(t2.target))
        return;
      const e2 = p(t2.target, { matchingSelector: "label" });
      return e2 && Array.from(this.labels).includes(e2) ? this.focus() : void 0;
    }
    reset() {
      this.value = this.defaultValue;
    }
  };
  var kn = { VERSION: "2.0.4", config: W, core: oi, models: Ri, views: Ei, controllers: pn, observers: fn, operations: bn, elements: Object.freeze({ __proto__: null, TrixEditorElement: Sn, TrixToolbarElement: vn }), filters: Object.freeze({ __proto__: null, Filter: di, attachmentGalleryFilter: gi }) };
  Object.assign(kn, Ri), window.Trix = kn, setTimeout(function() {
    customElements.get("trix-toolbar") || customElements.define("trix-toolbar", vn), customElements.get("trix-editor") || customElements.define("trix-editor", Sn);
  }, 0);

  // node_modules/@rails/actiontext/app/assets/javascripts/actiontext.js
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  var activestorage = { exports: {} };
  (function(module, exports) {
    (function(global2, factory) {
      factory(exports);
    })(commonjsGlobal, function(exports2) {
      var sparkMd5 = {
        exports: {}
      };
      (function(module2, exports3) {
        (function(factory) {
          {
            module2.exports = factory();
          }
        })(function(undefined$1) {
          var hex_chr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
          function md5cycle(x2, k2) {
            var a2 = x2[0], b2 = x2[1], c2 = x2[2], d2 = x2[3];
            a2 += (b2 & c2 | ~b2 & d2) + k2[0] - 680876936 | 0;
            a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
            d2 += (a2 & b2 | ~a2 & c2) + k2[1] - 389564586 | 0;
            d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
            c2 += (d2 & a2 | ~d2 & b2) + k2[2] + 606105819 | 0;
            c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
            b2 += (c2 & d2 | ~c2 & a2) + k2[3] - 1044525330 | 0;
            b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
            a2 += (b2 & c2 | ~b2 & d2) + k2[4] - 176418897 | 0;
            a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
            d2 += (a2 & b2 | ~a2 & c2) + k2[5] + 1200080426 | 0;
            d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
            c2 += (d2 & a2 | ~d2 & b2) + k2[6] - 1473231341 | 0;
            c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
            b2 += (c2 & d2 | ~c2 & a2) + k2[7] - 45705983 | 0;
            b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
            a2 += (b2 & c2 | ~b2 & d2) + k2[8] + 1770035416 | 0;
            a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
            d2 += (a2 & b2 | ~a2 & c2) + k2[9] - 1958414417 | 0;
            d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
            c2 += (d2 & a2 | ~d2 & b2) + k2[10] - 42063 | 0;
            c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
            b2 += (c2 & d2 | ~c2 & a2) + k2[11] - 1990404162 | 0;
            b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
            a2 += (b2 & c2 | ~b2 & d2) + k2[12] + 1804603682 | 0;
            a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
            d2 += (a2 & b2 | ~a2 & c2) + k2[13] - 40341101 | 0;
            d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
            c2 += (d2 & a2 | ~d2 & b2) + k2[14] - 1502002290 | 0;
            c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
            b2 += (c2 & d2 | ~c2 & a2) + k2[15] + 1236535329 | 0;
            b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
            a2 += (b2 & d2 | c2 & ~d2) + k2[1] - 165796510 | 0;
            a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
            d2 += (a2 & c2 | b2 & ~c2) + k2[6] - 1069501632 | 0;
            d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
            c2 += (d2 & b2 | a2 & ~b2) + k2[11] + 643717713 | 0;
            c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
            b2 += (c2 & a2 | d2 & ~a2) + k2[0] - 373897302 | 0;
            b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
            a2 += (b2 & d2 | c2 & ~d2) + k2[5] - 701558691 | 0;
            a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
            d2 += (a2 & c2 | b2 & ~c2) + k2[10] + 38016083 | 0;
            d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
            c2 += (d2 & b2 | a2 & ~b2) + k2[15] - 660478335 | 0;
            c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
            b2 += (c2 & a2 | d2 & ~a2) + k2[4] - 405537848 | 0;
            b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
            a2 += (b2 & d2 | c2 & ~d2) + k2[9] + 568446438 | 0;
            a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
            d2 += (a2 & c2 | b2 & ~c2) + k2[14] - 1019803690 | 0;
            d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
            c2 += (d2 & b2 | a2 & ~b2) + k2[3] - 187363961 | 0;
            c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
            b2 += (c2 & a2 | d2 & ~a2) + k2[8] + 1163531501 | 0;
            b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
            a2 += (b2 & d2 | c2 & ~d2) + k2[13] - 1444681467 | 0;
            a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
            d2 += (a2 & c2 | b2 & ~c2) + k2[2] - 51403784 | 0;
            d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
            c2 += (d2 & b2 | a2 & ~b2) + k2[7] + 1735328473 | 0;
            c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
            b2 += (c2 & a2 | d2 & ~a2) + k2[12] - 1926607734 | 0;
            b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
            a2 += (b2 ^ c2 ^ d2) + k2[5] - 378558 | 0;
            a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
            d2 += (a2 ^ b2 ^ c2) + k2[8] - 2022574463 | 0;
            d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
            c2 += (d2 ^ a2 ^ b2) + k2[11] + 1839030562 | 0;
            c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
            b2 += (c2 ^ d2 ^ a2) + k2[14] - 35309556 | 0;
            b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
            a2 += (b2 ^ c2 ^ d2) + k2[1] - 1530992060 | 0;
            a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
            d2 += (a2 ^ b2 ^ c2) + k2[4] + 1272893353 | 0;
            d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
            c2 += (d2 ^ a2 ^ b2) + k2[7] - 155497632 | 0;
            c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
            b2 += (c2 ^ d2 ^ a2) + k2[10] - 1094730640 | 0;
            b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
            a2 += (b2 ^ c2 ^ d2) + k2[13] + 681279174 | 0;
            a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
            d2 += (a2 ^ b2 ^ c2) + k2[0] - 358537222 | 0;
            d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
            c2 += (d2 ^ a2 ^ b2) + k2[3] - 722521979 | 0;
            c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
            b2 += (c2 ^ d2 ^ a2) + k2[6] + 76029189 | 0;
            b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
            a2 += (b2 ^ c2 ^ d2) + k2[9] - 640364487 | 0;
            a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
            d2 += (a2 ^ b2 ^ c2) + k2[12] - 421815835 | 0;
            d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
            c2 += (d2 ^ a2 ^ b2) + k2[15] + 530742520 | 0;
            c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
            b2 += (c2 ^ d2 ^ a2) + k2[2] - 995338651 | 0;
            b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
            a2 += (c2 ^ (b2 | ~d2)) + k2[0] - 198630844 | 0;
            a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
            d2 += (b2 ^ (a2 | ~c2)) + k2[7] + 1126891415 | 0;
            d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
            c2 += (a2 ^ (d2 | ~b2)) + k2[14] - 1416354905 | 0;
            c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
            b2 += (d2 ^ (c2 | ~a2)) + k2[5] - 57434055 | 0;
            b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
            a2 += (c2 ^ (b2 | ~d2)) + k2[12] + 1700485571 | 0;
            a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
            d2 += (b2 ^ (a2 | ~c2)) + k2[3] - 1894986606 | 0;
            d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
            c2 += (a2 ^ (d2 | ~b2)) + k2[10] - 1051523 | 0;
            c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
            b2 += (d2 ^ (c2 | ~a2)) + k2[1] - 2054922799 | 0;
            b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
            a2 += (c2 ^ (b2 | ~d2)) + k2[8] + 1873313359 | 0;
            a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
            d2 += (b2 ^ (a2 | ~c2)) + k2[15] - 30611744 | 0;
            d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
            c2 += (a2 ^ (d2 | ~b2)) + k2[6] - 1560198380 | 0;
            c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
            b2 += (d2 ^ (c2 | ~a2)) + k2[13] + 1309151649 | 0;
            b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
            a2 += (c2 ^ (b2 | ~d2)) + k2[4] - 145523070 | 0;
            a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
            d2 += (b2 ^ (a2 | ~c2)) + k2[11] - 1120210379 | 0;
            d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
            c2 += (a2 ^ (d2 | ~b2)) + k2[2] + 718787259 | 0;
            c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
            b2 += (d2 ^ (c2 | ~a2)) + k2[9] - 343485551 | 0;
            b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
            x2[0] = a2 + x2[0] | 0;
            x2[1] = b2 + x2[1] | 0;
            x2[2] = c2 + x2[2] | 0;
            x2[3] = d2 + x2[3] | 0;
          }
          function md5blk(s2) {
            var md5blks = [], i2;
            for (i2 = 0; i2 < 64; i2 += 4) {
              md5blks[i2 >> 2] = s2.charCodeAt(i2) + (s2.charCodeAt(i2 + 1) << 8) + (s2.charCodeAt(i2 + 2) << 16) + (s2.charCodeAt(i2 + 3) << 24);
            }
            return md5blks;
          }
          function md5blk_array(a2) {
            var md5blks = [], i2;
            for (i2 = 0; i2 < 64; i2 += 4) {
              md5blks[i2 >> 2] = a2[i2] + (a2[i2 + 1] << 8) + (a2[i2 + 2] << 16) + (a2[i2 + 3] << 24);
            }
            return md5blks;
          }
          function md51(s2) {
            var n2 = s2.length, state = [1732584193, -271733879, -1732584194, 271733878], i2, length, tail, tmp, lo, hi2;
            for (i2 = 64; i2 <= n2; i2 += 64) {
              md5cycle(state, md5blk(s2.substring(i2 - 64, i2)));
            }
            s2 = s2.substring(i2 - 64);
            length = s2.length;
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (i2 = 0; i2 < length; i2 += 1) {
              tail[i2 >> 2] |= s2.charCodeAt(i2) << (i2 % 4 << 3);
            }
            tail[i2 >> 2] |= 128 << (i2 % 4 << 3);
            if (i2 > 55) {
              md5cycle(state, tail);
              for (i2 = 0; i2 < 16; i2 += 1) {
                tail[i2] = 0;
              }
            }
            tmp = n2 * 8;
            tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
            lo = parseInt(tmp[2], 16);
            hi2 = parseInt(tmp[1], 16) || 0;
            tail[14] = lo;
            tail[15] = hi2;
            md5cycle(state, tail);
            return state;
          }
          function md51_array(a2) {
            var n2 = a2.length, state = [1732584193, -271733879, -1732584194, 271733878], i2, length, tail, tmp, lo, hi2;
            for (i2 = 64; i2 <= n2; i2 += 64) {
              md5cycle(state, md5blk_array(a2.subarray(i2 - 64, i2)));
            }
            a2 = i2 - 64 < n2 ? a2.subarray(i2 - 64) : new Uint8Array(0);
            length = a2.length;
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (i2 = 0; i2 < length; i2 += 1) {
              tail[i2 >> 2] |= a2[i2] << (i2 % 4 << 3);
            }
            tail[i2 >> 2] |= 128 << (i2 % 4 << 3);
            if (i2 > 55) {
              md5cycle(state, tail);
              for (i2 = 0; i2 < 16; i2 += 1) {
                tail[i2] = 0;
              }
            }
            tmp = n2 * 8;
            tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
            lo = parseInt(tmp[2], 16);
            hi2 = parseInt(tmp[1], 16) || 0;
            tail[14] = lo;
            tail[15] = hi2;
            md5cycle(state, tail);
            return state;
          }
          function rhex(n2) {
            var s2 = "", j2;
            for (j2 = 0; j2 < 4; j2 += 1) {
              s2 += hex_chr[n2 >> j2 * 8 + 4 & 15] + hex_chr[n2 >> j2 * 8 & 15];
            }
            return s2;
          }
          function hex(x2) {
            var i2;
            for (i2 = 0; i2 < x2.length; i2 += 1) {
              x2[i2] = rhex(x2[i2]);
            }
            return x2.join("");
          }
          if (hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592")
            ;
          if (typeof ArrayBuffer !== "undefined" && !ArrayBuffer.prototype.slice) {
            (function() {
              function clamp(val, length) {
                val = val | 0 || 0;
                if (val < 0) {
                  return Math.max(val + length, 0);
                }
                return Math.min(val, length);
              }
              ArrayBuffer.prototype.slice = function(from, to) {
                var length = this.byteLength, begin = clamp(from, length), end = length, num, target, targetArray, sourceArray;
                if (to !== undefined$1) {
                  end = clamp(to, length);
                }
                if (begin > end) {
                  return new ArrayBuffer(0);
                }
                num = end - begin;
                target = new ArrayBuffer(num);
                targetArray = new Uint8Array(target);
                sourceArray = new Uint8Array(this, begin, num);
                targetArray.set(sourceArray);
                return target;
              };
            })();
          }
          function toUtf8(str) {
            if (/[\u0080-\uFFFF]/.test(str)) {
              str = unescape(encodeURIComponent(str));
            }
            return str;
          }
          function utf8Str2ArrayBuffer(str, returnUInt8Array) {
            var length = str.length, buff = new ArrayBuffer(length), arr = new Uint8Array(buff), i2;
            for (i2 = 0; i2 < length; i2 += 1) {
              arr[i2] = str.charCodeAt(i2);
            }
            return returnUInt8Array ? arr : buff;
          }
          function arrayBuffer2Utf8Str(buff) {
            return String.fromCharCode.apply(null, new Uint8Array(buff));
          }
          function concatenateArrayBuffers(first, second, returnUInt8Array) {
            var result = new Uint8Array(first.byteLength + second.byteLength);
            result.set(new Uint8Array(first));
            result.set(new Uint8Array(second), first.byteLength);
            return returnUInt8Array ? result : result.buffer;
          }
          function hexToBinaryString(hex2) {
            var bytes = [], length = hex2.length, x2;
            for (x2 = 0; x2 < length - 1; x2 += 2) {
              bytes.push(parseInt(hex2.substr(x2, 2), 16));
            }
            return String.fromCharCode.apply(String, bytes);
          }
          function SparkMD52() {
            this.reset();
          }
          SparkMD52.prototype.append = function(str) {
            this.appendBinary(toUtf8(str));
            return this;
          };
          SparkMD52.prototype.appendBinary = function(contents) {
            this._buff += contents;
            this._length += contents.length;
            var length = this._buff.length, i2;
            for (i2 = 64; i2 <= length; i2 += 64) {
              md5cycle(this._hash, md5blk(this._buff.substring(i2 - 64, i2)));
            }
            this._buff = this._buff.substring(i2 - 64);
            return this;
          };
          SparkMD52.prototype.end = function(raw) {
            var buff = this._buff, length = buff.length, i2, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ret;
            for (i2 = 0; i2 < length; i2 += 1) {
              tail[i2 >> 2] |= buff.charCodeAt(i2) << (i2 % 4 << 3);
            }
            this._finish(tail, length);
            ret = hex(this._hash);
            if (raw) {
              ret = hexToBinaryString(ret);
            }
            this.reset();
            return ret;
          };
          SparkMD52.prototype.reset = function() {
            this._buff = "";
            this._length = 0;
            this._hash = [1732584193, -271733879, -1732584194, 271733878];
            return this;
          };
          SparkMD52.prototype.getState = function() {
            return {
              buff: this._buff,
              length: this._length,
              hash: this._hash.slice()
            };
          };
          SparkMD52.prototype.setState = function(state) {
            this._buff = state.buff;
            this._length = state.length;
            this._hash = state.hash;
            return this;
          };
          SparkMD52.prototype.destroy = function() {
            delete this._hash;
            delete this._buff;
            delete this._length;
          };
          SparkMD52.prototype._finish = function(tail, length) {
            var i2 = length, tmp, lo, hi2;
            tail[i2 >> 2] |= 128 << (i2 % 4 << 3);
            if (i2 > 55) {
              md5cycle(this._hash, tail);
              for (i2 = 0; i2 < 16; i2 += 1) {
                tail[i2] = 0;
              }
            }
            tmp = this._length * 8;
            tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
            lo = parseInt(tmp[2], 16);
            hi2 = parseInt(tmp[1], 16) || 0;
            tail[14] = lo;
            tail[15] = hi2;
            md5cycle(this._hash, tail);
          };
          SparkMD52.hash = function(str, raw) {
            return SparkMD52.hashBinary(toUtf8(str), raw);
          };
          SparkMD52.hashBinary = function(content, raw) {
            var hash = md51(content), ret = hex(hash);
            return raw ? hexToBinaryString(ret) : ret;
          };
          SparkMD52.ArrayBuffer = function() {
            this.reset();
          };
          SparkMD52.ArrayBuffer.prototype.append = function(arr) {
            var buff = concatenateArrayBuffers(this._buff.buffer, arr, true), length = buff.length, i2;
            this._length += arr.byteLength;
            for (i2 = 64; i2 <= length; i2 += 64) {
              md5cycle(this._hash, md5blk_array(buff.subarray(i2 - 64, i2)));
            }
            this._buff = i2 - 64 < length ? new Uint8Array(buff.buffer.slice(i2 - 64)) : new Uint8Array(0);
            return this;
          };
          SparkMD52.ArrayBuffer.prototype.end = function(raw) {
            var buff = this._buff, length = buff.length, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], i2, ret;
            for (i2 = 0; i2 < length; i2 += 1) {
              tail[i2 >> 2] |= buff[i2] << (i2 % 4 << 3);
            }
            this._finish(tail, length);
            ret = hex(this._hash);
            if (raw) {
              ret = hexToBinaryString(ret);
            }
            this.reset();
            return ret;
          };
          SparkMD52.ArrayBuffer.prototype.reset = function() {
            this._buff = new Uint8Array(0);
            this._length = 0;
            this._hash = [1732584193, -271733879, -1732584194, 271733878];
            return this;
          };
          SparkMD52.ArrayBuffer.prototype.getState = function() {
            var state = SparkMD52.prototype.getState.call(this);
            state.buff = arrayBuffer2Utf8Str(state.buff);
            return state;
          };
          SparkMD52.ArrayBuffer.prototype.setState = function(state) {
            state.buff = utf8Str2ArrayBuffer(state.buff, true);
            return SparkMD52.prototype.setState.call(this, state);
          };
          SparkMD52.ArrayBuffer.prototype.destroy = SparkMD52.prototype.destroy;
          SparkMD52.ArrayBuffer.prototype._finish = SparkMD52.prototype._finish;
          SparkMD52.ArrayBuffer.hash = function(arr, raw) {
            var hash = md51_array(new Uint8Array(arr)), ret = hex(hash);
            return raw ? hexToBinaryString(ret) : ret;
          };
          return SparkMD52;
        });
      })(sparkMd5);
      var SparkMD5 = sparkMd5.exports;
      const fileSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
      class FileChecksum {
        static create(file, callback) {
          const instance = new FileChecksum(file);
          instance.create(callback);
        }
        constructor(file) {
          this.file = file;
          this.chunkSize = 2097152;
          this.chunkCount = Math.ceil(this.file.size / this.chunkSize);
          this.chunkIndex = 0;
        }
        create(callback) {
          this.callback = callback;
          this.md5Buffer = new SparkMD5.ArrayBuffer();
          this.fileReader = new FileReader();
          this.fileReader.addEventListener("load", (event) => this.fileReaderDidLoad(event));
          this.fileReader.addEventListener("error", (event) => this.fileReaderDidError(event));
          this.readNextChunk();
        }
        fileReaderDidLoad(event) {
          this.md5Buffer.append(event.target.result);
          if (!this.readNextChunk()) {
            const binaryDigest = this.md5Buffer.end(true);
            const base64digest = btoa(binaryDigest);
            this.callback(null, base64digest);
          }
        }
        fileReaderDidError(event) {
          this.callback(`Error reading ${this.file.name}`);
        }
        readNextChunk() {
          if (this.chunkIndex < this.chunkCount || this.chunkIndex == 0 && this.chunkCount == 0) {
            const start3 = this.chunkIndex * this.chunkSize;
            const end = Math.min(start3 + this.chunkSize, this.file.size);
            const bytes = fileSlice.call(this.file, start3, end);
            this.fileReader.readAsArrayBuffer(bytes);
            this.chunkIndex++;
            return true;
          } else {
            return false;
          }
        }
      }
      function getMetaValue(name) {
        const element = findElement(document.head, `meta[name="${name}"]`);
        if (element) {
          return element.getAttribute("content");
        }
      }
      function findElements(root, selector) {
        if (typeof root == "string") {
          selector = root;
          root = document;
        }
        const elements = root.querySelectorAll(selector);
        return toArray(elements);
      }
      function findElement(root, selector) {
        if (typeof root == "string") {
          selector = root;
          root = document;
        }
        return root.querySelector(selector);
      }
      function dispatchEvent2(element, type, eventInit = {}) {
        const { disabled } = element;
        const { bubbles, cancelable, detail } = eventInit;
        const event = document.createEvent("Event");
        event.initEvent(type, bubbles || true, cancelable || true);
        event.detail = detail || {};
        try {
          element.disabled = false;
          element.dispatchEvent(event);
        } finally {
          element.disabled = disabled;
        }
        return event;
      }
      function toArray(value) {
        if (Array.isArray(value)) {
          return value;
        } else if (Array.from) {
          return Array.from(value);
        } else {
          return [].slice.call(value);
        }
      }
      class BlobRecord {
        constructor(file, checksum, url) {
          this.file = file;
          this.attributes = {
            filename: file.name,
            content_type: file.type || "application/octet-stream",
            byte_size: file.size,
            checksum
          };
          this.xhr = new XMLHttpRequest();
          this.xhr.open("POST", url, true);
          this.xhr.responseType = "json";
          this.xhr.setRequestHeader("Content-Type", "application/json");
          this.xhr.setRequestHeader("Accept", "application/json");
          this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          const csrfToken = getMetaValue("csrf-token");
          if (csrfToken != void 0) {
            this.xhr.setRequestHeader("X-CSRF-Token", csrfToken);
          }
          this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
          this.xhr.addEventListener("error", (event) => this.requestDidError(event));
        }
        get status() {
          return this.xhr.status;
        }
        get response() {
          const { responseType, response } = this.xhr;
          if (responseType == "json") {
            return response;
          } else {
            return JSON.parse(response);
          }
        }
        create(callback) {
          this.callback = callback;
          this.xhr.send(JSON.stringify({
            blob: this.attributes
          }));
        }
        requestDidLoad(event) {
          if (this.status >= 200 && this.status < 300) {
            const { response } = this;
            const { direct_upload } = response;
            delete response.direct_upload;
            this.attributes = response;
            this.directUploadData = direct_upload;
            this.callback(null, this.toJSON());
          } else {
            this.requestDidError(event);
          }
        }
        requestDidError(event) {
          this.callback(`Error creating Blob for "${this.file.name}". Status: ${this.status}`);
        }
        toJSON() {
          const result = {};
          for (const key in this.attributes) {
            result[key] = this.attributes[key];
          }
          return result;
        }
      }
      class BlobUpload {
        constructor(blob) {
          this.blob = blob;
          this.file = blob.file;
          const { url, headers } = blob.directUploadData;
          this.xhr = new XMLHttpRequest();
          this.xhr.open("PUT", url, true);
          this.xhr.responseType = "text";
          for (const key in headers) {
            this.xhr.setRequestHeader(key, headers[key]);
          }
          this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
          this.xhr.addEventListener("error", (event) => this.requestDidError(event));
        }
        create(callback) {
          this.callback = callback;
          this.xhr.send(this.file.slice());
        }
        requestDidLoad(event) {
          const { status, response } = this.xhr;
          if (status >= 200 && status < 300) {
            this.callback(null, response);
          } else {
            this.requestDidError(event);
          }
        }
        requestDidError(event) {
          this.callback(`Error storing "${this.file.name}". Status: ${this.xhr.status}`);
        }
      }
      let id = 0;
      class DirectUpload {
        constructor(file, url, delegate) {
          this.id = ++id;
          this.file = file;
          this.url = url;
          this.delegate = delegate;
        }
        create(callback) {
          FileChecksum.create(this.file, (error2, checksum) => {
            if (error2) {
              callback(error2);
              return;
            }
            const blob = new BlobRecord(this.file, checksum, this.url);
            notify(this.delegate, "directUploadWillCreateBlobWithXHR", blob.xhr);
            blob.create((error3) => {
              if (error3) {
                callback(error3);
              } else {
                const upload = new BlobUpload(blob);
                notify(this.delegate, "directUploadWillStoreFileWithXHR", upload.xhr);
                upload.create((error4) => {
                  if (error4) {
                    callback(error4);
                  } else {
                    callback(null, blob.toJSON());
                  }
                });
              }
            });
          });
        }
      }
      function notify(object, methodName, ...messages) {
        if (object && typeof object[methodName] == "function") {
          return object[methodName](...messages);
        }
      }
      class DirectUploadController {
        constructor(input, file) {
          this.input = input;
          this.file = file;
          this.directUpload = new DirectUpload(this.file, this.url, this);
          this.dispatch("initialize");
        }
        start(callback) {
          const hiddenInput = document.createElement("input");
          hiddenInput.type = "hidden";
          hiddenInput.name = this.input.name;
          this.input.insertAdjacentElement("beforebegin", hiddenInput);
          this.dispatch("start");
          this.directUpload.create((error2, attributes) => {
            if (error2) {
              hiddenInput.parentNode.removeChild(hiddenInput);
              this.dispatchError(error2);
            } else {
              hiddenInput.value = attributes.signed_id;
            }
            this.dispatch("end");
            callback(error2);
          });
        }
        uploadRequestDidProgress(event) {
          const progress = event.loaded / event.total * 100;
          if (progress) {
            this.dispatch("progress", {
              progress
            });
          }
        }
        get url() {
          return this.input.getAttribute("data-direct-upload-url");
        }
        dispatch(name, detail = {}) {
          detail.file = this.file;
          detail.id = this.directUpload.id;
          return dispatchEvent2(this.input, `direct-upload:${name}`, {
            detail
          });
        }
        dispatchError(error2) {
          const event = this.dispatch("error", {
            error: error2
          });
          if (!event.defaultPrevented) {
            alert(error2);
          }
        }
        directUploadWillCreateBlobWithXHR(xhr) {
          this.dispatch("before-blob-request", {
            xhr
          });
        }
        directUploadWillStoreFileWithXHR(xhr) {
          this.dispatch("before-storage-request", {
            xhr
          });
          xhr.upload.addEventListener("progress", (event) => this.uploadRequestDidProgress(event));
        }
      }
      const inputSelector = "input[type=file][data-direct-upload-url]:not([disabled])";
      class DirectUploadsController {
        constructor(form) {
          this.form = form;
          this.inputs = findElements(form, inputSelector).filter((input) => input.files.length);
        }
        start(callback) {
          const controllers = this.createDirectUploadControllers();
          const startNextController = () => {
            const controller = controllers.shift();
            if (controller) {
              controller.start((error2) => {
                if (error2) {
                  callback(error2);
                  this.dispatch("end");
                } else {
                  startNextController();
                }
              });
            } else {
              callback();
              this.dispatch("end");
            }
          };
          this.dispatch("start");
          startNextController();
        }
        createDirectUploadControllers() {
          const controllers = [];
          this.inputs.forEach((input) => {
            toArray(input.files).forEach((file) => {
              const controller = new DirectUploadController(input, file);
              controllers.push(controller);
            });
          });
          return controllers;
        }
        dispatch(name, detail = {}) {
          return dispatchEvent2(this.form, `direct-uploads:${name}`, {
            detail
          });
        }
      }
      const processingAttribute = "data-direct-uploads-processing";
      const submitButtonsByForm = /* @__PURE__ */ new WeakMap();
      let started = false;
      function start2() {
        if (!started) {
          started = true;
          document.addEventListener("click", didClick, true);
          document.addEventListener("submit", didSubmitForm, true);
          document.addEventListener("ajax:before", didSubmitRemoteElement);
        }
      }
      function didClick(event) {
        const { target } = event;
        if ((target.tagName == "INPUT" || target.tagName == "BUTTON") && target.type == "submit" && target.form) {
          submitButtonsByForm.set(target.form, target);
        }
      }
      function didSubmitForm(event) {
        handleFormSubmissionEvent(event);
      }
      function didSubmitRemoteElement(event) {
        if (event.target.tagName == "FORM") {
          handleFormSubmissionEvent(event);
        }
      }
      function handleFormSubmissionEvent(event) {
        const form = event.target;
        if (form.hasAttribute(processingAttribute)) {
          event.preventDefault();
          return;
        }
        const controller = new DirectUploadsController(form);
        const { inputs } = controller;
        if (inputs.length) {
          event.preventDefault();
          form.setAttribute(processingAttribute, "");
          inputs.forEach(disable);
          controller.start((error2) => {
            form.removeAttribute(processingAttribute);
            if (error2) {
              inputs.forEach(enable);
            } else {
              submitForm(form);
            }
          });
        }
      }
      function submitForm(form) {
        let button = submitButtonsByForm.get(form) || findElement(form, "input[type=submit], button[type=submit]");
        if (button) {
          const { disabled } = button;
          button.disabled = false;
          button.focus();
          button.click();
          button.disabled = disabled;
        } else {
          button = document.createElement("input");
          button.type = "submit";
          button.style.display = "none";
          form.appendChild(button);
          button.click();
          form.removeChild(button);
        }
        submitButtonsByForm.delete(form);
      }
      function disable(input) {
        input.disabled = true;
      }
      function enable(input) {
        input.disabled = false;
      }
      function autostart() {
        if (window.ActiveStorage) {
          start2();
        }
      }
      setTimeout(autostart, 1);
      exports2.DirectUpload = DirectUpload;
      exports2.start = start2;
      Object.defineProperty(exports2, "__esModule", {
        value: true
      });
    });
  })(activestorage, activestorage.exports);
  var AttachmentUpload = class {
    constructor(attachment, element) {
      this.attachment = attachment;
      this.element = element;
      this.directUpload = new activestorage.exports.DirectUpload(attachment.file, this.directUploadUrl, this);
    }
    start() {
      this.directUpload.create(this.directUploadDidComplete.bind(this));
    }
    directUploadWillStoreFileWithXHR(xhr) {
      xhr.upload.addEventListener("progress", (event) => {
        const progress = event.loaded / event.total * 100;
        this.attachment.setUploadProgress(progress);
      });
    }
    directUploadDidComplete(error2, attributes) {
      if (error2) {
        throw new Error(`Direct upload failed: ${error2}`);
      }
      this.attachment.setAttributes({
        sgid: attributes.attachable_sgid,
        url: this.createBlobUrl(attributes.signed_id, attributes.filename)
      });
    }
    createBlobUrl(signedId, filename) {
      return this.blobUrlTemplate.replace(":signed_id", signedId).replace(":filename", encodeURIComponent(filename));
    }
    get directUploadUrl() {
      return this.element.dataset.directUploadUrl;
    }
    get blobUrlTemplate() {
      return this.element.dataset.blobUrlTemplate;
    }
  };
  addEventListener("trix-attachment-add", (event) => {
    const { attachment, target } = event;
    if (attachment.file) {
      const upload = new AttachmentUpload(attachment, target);
      upload.start();
    }
  });
})();
//# sourceMappingURL=assets/application.js.map