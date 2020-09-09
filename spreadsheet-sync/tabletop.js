(function() {
  'use strict';

  var inNodeJS = typeof process !== 'undefined' && !process.browser;

  var request = function requestNotProvided() {
    throw new Error("Модуль «запрос» доступен только при работе в Node.");
  };
  if(inNodeJS) { // Это будет удалено Uglify, и Webpack не будет включать его
    request = require('request');
  }

  var supportsCORS = false;
  var inLegacyIE = false;
  try {
    var testXHR = new XMLHttpRequest();
    if (typeof testXHR.withCredentials !== 'undefined') {
      supportsCORS = true;
    } else {
      if ('XDomainRequest' in window) {
        supportsCORS = true;
        inLegacyIE = true;
      }
    }
  } catch (e) { }

  // Создайте простую функцию indexOf для поддержки старых браузеров. 
  // Использует собственный indexOf, если доступен. Код похож на подчеркивание.
  // Создав отдельную функцию вместо добавления к прототипу, мы не нарушим циклы в старых браузерах
  var indexOfProto = Array.prototype.indexOf;
  var ttIndexOf = function(array, item) {
    var i = 0, l = array.length;

    if (indexOfProto && array.indexOf === indexOfProto) {
      return array.indexOf(item);
    }

    for (; i < l; i++) {
      if (array[i] === item) {
        return i;
      }
    }
    return -1;
  };

  /*
    Инициализировать с помощью Tabletop.init( { key: '0AjAPaAU9MeLFdHUxTlJiVVRYNGRJQnRmSnQwTlpoUXc' } )
      OR!
    Инициализировать с помощью Tabletop.init( { key: 'https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&key=0AjAPaAU9MeLFdHUxTlJiVVRYNGRJQnRmSnQwTlpoUXc&output=html&widget=true' } )
      OR!
    Инициализировать с помощью Tabletop.init('0AjAPaAU9MeLFdHUxTlJiVVRYNGRJQnRmSnQwTlpoUXc')
  */

  var Tabletop = function(options) {
    // Убедитесь, что Tabletop используется как конструктор, несмотря ни на что.
    if(!this || !(this instanceof Tabletop)) {
      return new Tabletop(options);
    }

    if(typeof(options) === 'string') {
      options = { key : options };
    }

    this.callback = options.callback;
    this.error = options.error;
    this.wanted = options.wanted || [];
    this.key = options.key;
    this.simpleSheet = !!options.simpleSheet;
    this.parseNumbers = !!options.parseNumbers;
    this.wait = !!options.wait;
    this.reverse = !!options.reverse;
    this.postProcess = options.postProcess;
    this.debug = !!options.debug;
    this.query = options.query || '';
    this.orderby = options.orderby;
    this.endpoint = options.endpoint || 'https://spreadsheets.google.com';
    this.singleton = !!options.singleton;
    this.simpleUrl = !!(options.simpleUrl || options.simple_url); //jshint ignore:line
    this.authkey = options.authkey;
    this.sheetPrivacy = this.authkey ? 'private' : 'public'

    this.callbackContext = options.callbackContext;
    // По умолчанию включено, если нет прокси, и в этом случае он отключен по умолчанию.
    this.prettyColumnNames = typeof(options.prettyColumnNames) === 'undefined' ? !options.proxy : options.prettyColumnNames;

    if(typeof(options.proxy) !== 'undefined') {
      // Удалите косую черту в конце, это сломает приложение
      this.endpoint = options.proxy.replace(/\/$/,'');
      this.simpleUrl = true;
      this.singleton = true;
      // Давайте использовать CORS (прямой запрос JSON) только при извлечении напрямую из Google
      supportsCORS = false;
    }

    this.parameterize = options.parameterize || false;

    if (this.singleton) {
      if (typeof(Tabletop.singleton) !== 'undefined') {
        this.log('WARNING! Tabletop singleton already defined');
      }
      Tabletop.singleton = this;
    }

    /* Относитесь дружелюбно к тому, что вы принимаете */
    if (/key=/.test(this.key)) {
      this.log('Вы передали старый URL-адрес Документов Google в качестве ключа! Попытка разобрать.');
      this.key = this.key.match('key=(.*?)(&|#|$)')[1];
    }

    if (/pubhtml/.test(this.key)) {
      this.log('Вы передали новый URL-адрес таблиц Google в качестве ключа! Попытка разобрать.');
      this.key = this.key.match('d\\/(.*?)\\/pubhtml')[1];
    }

    if(/spreadsheets\/d/.test(this.key)) {
      this.log('Вы передали самую последнюю версию URL-адреса таблиц Google в качестве ключа! Попытка разобрать.');
      this.key = this.key.match('d\\/(.*?)\/')[1];
    }

    if (!this.key) {
      this.log('Вам нужно передать Tabletop ключ!');
      return;
    }

    this.log('Инициализация с помощью ключа ' + this.key);

    this.models = {};
    this.modelNames = [];
    this.model_names = this.modelNames; //jshint ignore:line

    this.baseJsonPath = '/feeds/worksheets/' + this.key + '/' + this.sheetPrivacy +'/basic?alt=';

    if (inNodeJS || supportsCORS) {
      this.baseJsonPath += 'json';
    } else {
      this.baseJsonPath += 'json-in-script';
    }

    if (this.authkey) {
      this.baseJsonPath += '&oauth_token=' + this.authkey;
    }
  
    if(!this.wait) {
      return this.fetch();
    }
  };

  // Глобальное хранилище для обратных вызовов.
  Tabletop.callbacks = {};

  // Обратная совместимость.
  Tabletop.init = function(options) {
    return new Tabletop(options);
  };

  Tabletop.sheets = function() {
    this.log('Времена изменились! You\'ll want to use var tabletop = Tabletop.init(...); tabletop.sheets(...); instead of Tabletop.sheets(...)');
  };

  Tabletop.prototype = {

    fetch: function(callback) {
      var self = this;
      return new Promise(function(resolve, reject) {
        if (typeof(callback) !== 'undefined') {
          self.callback = callback;
        }
        if (!self.callback) {
          self.callback = resolve;
        }
        if (!self.error) {
          self.error = reject;
        }
        self.requestData(self.baseJsonPath, self.loadSheets);
      });
    },

    /*
      Это вызовет соответствующий метод запроса среды.

      В браузере он будет использовать JSON-P, в узле - request()
    */
    requestData: function(path, callback) {
      this.log('Requesting', path);
      this.encounteredError = false;
      if (inNodeJS) {
        this.serverSideFetch(path, callback);
      } else {
        // CORS работает только в IE8/9 по тому же протоколу
        // У вас должен быть ваш сервер на HTTPS, чтобы общаться с Google, иначе он вернется к инъекции
        var protocol = this.endpoint.split('//').shift() || 'http';
        if (supportsCORS && (!inLegacyIE || protocol === location.protocol)) {
          this.xhrFetch(path, callback);
        } else {
          this.injectScript(path, callback);
        }
      }
    },

    /*
      Используйте Cross-Origin XMLHttpRequest для получения данных в браузерах, которые его поддерживают.
    */
    xhrFetch: function(path, callback) {
      //поддержка отдельного междоменного объекта IE8
      var xhr = inLegacyIE ? new XDomainRequest() : new XMLHttpRequest();
      xhr.open('GET', this.endpoint + path);
      var self = this;
      xhr.onload = function() {
        var json;
        try {
          json = JSON.parse(xhr.responseText);
        } catch (e) {
          console.error(e);
        }
        callback.call(self, json);
      };
      if(this.error) {
        xhr.addEventListener('error', this.error);
      }
      xhr.send();
    },

    /*
      Вставьте URL-адрес на страницу как тег скрипта. После загрузки данных электронной таблицы запускается обратный вызов. 
      Это поможет избежать междоменных ошибок http://code.google.com/apis/gdata/samples/spreadsheet_sample.html

      Давайте будем простыми и не будем использовать jQuery или что-то еще.
    */
    injectScript: function(path, callback) {
      var script = document.createElement('script');
      var callbackName;

      if (this.singleton) {
        if (callback === this.loadSheets) {
          callbackName = 'Tabletop.singleton.loadSheets';
        } else if (callback === this.loadSheet) {
          callbackName = 'Tabletop.singleton.loadSheet';
        }
      } else {
        var self = this;
        callbackName = 'tt' + (+new Date()) + (Math.floor(Math.random()*100000));
        // Создайте временный обратный вызов, который будет удален после его выполнения, 
        // это позволит сосуществовать нескольким экземплярам Tabletop.
        Tabletop.callbacks[ callbackName ] = function () {
          var args = Array.prototype.slice.call( arguments, 0 );
          callback.apply(self, args);
          script.parentNode.removeChild(script);
          delete Tabletop.callbacks[callbackName];
        };
        callbackName = 'Tabletop.callbacks.' + callbackName;
      }

      var url = path + '&callback=' + callbackName;

      if (this.simpleUrl) {
        // Мы спустились в кроличью нору, передав путь injectScript, поэтому давайте 
        // просто вытащим sheet_id из пути, как наименее эффективные рабочие пчёлы
        if(path.indexOf('/list/') !== -1) {
          script.src = this.endpoint + '/' + this.key + '-' + path.split('/')[4];
        } else {
          script.src = this.endpoint + '/' + this.key;
        }
      } else {
        script.src = this.endpoint + url;
      }

      if (this.parameterize) {
        script.src = this.parameterize + encodeURIComponent(script.src);
      }

      this.log('Injecting', script.src);

      document.getElementsByTagName('script')[0].parentNode.appendChild(script);
    },

    /*
      Это будет работать, только если tabletop запускается в node.js
    */
    serverSideFetch: function(path, callback) {
      var self = this;

      this.log('Fetching', this.endpoint + path);
      request({url: this.endpoint + path, json: true}, function(err, resp, body) {
        if (err) {
          return console.error(err);
        }
        callback.call(self, body);
      });
    },

    /*
      Это лист, который вы хотите потянуть?
      Если был указан {хотел: ["Sheet1"]}, импортируется только Sheet1. 
      Вытягивает все листы, если ни один не указан
    */
    isWanted: function(sheetName) {
      if (this.wanted.length === 0) {
        return true;
      } else {
        return (ttIndexOf(this.wanted, sheetName) !== -1);
      }
    },

    /*
      Что отправляется в обратный вызов, если simpleSheet === true, 
      то не возвращать массив Tabletop.this.models, возвращать только элементы первого
    */
    data: function() {
      // Если экземпляр запрашивается до того, как данные были извлечены, тогда верните undefined.
      if (this.modelNames.length === 0) {
        return undefined;
      }
      if (this.simpleSheet) {
        if (this.modelNames.length > 1 && this.debug) {
          this.log('ВНИМАНИЕ! У вас несколько листов, но вы используете простой режим листов! Не вини меня, когда что-то пойдет не так.');
        }
        return this.models[this.modelNames[0]].all();
      } else {
        return this.models;
      }
    },

    /*
      Добавить еще один лист в список розыска
    */
    addWanted: function(sheet) {
      if(ttIndexOf(this.wanted, sheet) === -1) {
        this.wanted.push(sheet);
      }
    },

    /*
      Загрузите все рабочие листы электронной таблицы, превратив каждый в настольную модель.
      Необходимо использовать injectScript, потому что представление рабочего листа, с которым вы работаете, фактически не включает данные. 
      Тем не менее, канал на основе списка (/feeds/list/key..) делает это.
      Обратный вызов loadSheet для выполнения реальной работы.

      Используется как обратный вызов для JSON на основе рабочего листа
    */
    loadSheets: function(data) {
      var i, ilen;
      var toLoad = [];
      try {
        this.googleSheetName = data.feed.title.$t;
      } catch(err) {
        this.error(err);
        return;
      }
      this.foundSheetNames = [];

      for (i = 0, ilen = data.feed.entry.length; i < ilen ; i++) {
        this.foundSheetNames.push(data.feed.entry[i].title.$t);
        // Only pull in desired sheets to reduce loading
        if (this.isWanted(data.feed.entry[i].content.$t)) {
          var linkIdx = data.feed.entry[i].link.length-1;
          var sheetId = data.feed.entry[i].link[linkIdx].href.split('/').pop();
          var jsonPath = '/feeds/list/' + this.key + '/' + sheetId + '/' + this.sheetPrivacy + '/values?alt=';
          if (inNodeJS || supportsCORS) {
            jsonPath += 'json';
          } else {
            jsonPath += 'json-in-script';
          }
          if (this.query) {
            // Query Language Reference (0.7)
            jsonPath += '&tq=' + this.query;
          }
          if (this.orderby) {
            jsonPath += '&orderby=column:' + this.orderby.toLowerCase();
          }
          if (this.reverse) {
            jsonPath += '&reverse=true';
          }
          if (this.authkey) {
            jsonPath += '&oauth_token=' + this.authkey;
          }
          toLoad.push(jsonPath);
        }
      }

      this.sheetsToLoad = toLoad.length;
      for(i = 0, ilen = toLoad.length; i < ilen; i++) {
        this.requestData(toLoad[i], this.loadSheet);
      }
    },

    /*
      Слой доступа для this.models .sheets() дает вам все листы .sheets('Sheet1') дает вам лист с именем Sheet1
    */
    sheets: function(sheetName) {
      if (typeof sheetName === 'undefined') {
        return this.models;
      } else {
        if (typeof(this.models[sheetName]) === 'undefined') {
          // alert( "Can't find " + sheetName );
          return;
        } else {
          return this.models[sheetName];
        }
      }
    },

    sheetReady: function(model) {
      this.models[model.name] = model;
      if (ttIndexOf(this.modelNames, model.name) === -1) {
        this.modelNames.push(model.name);
      }

      this.sheetsToLoad--;
      if (this.sheetsToLoad === 0) {
        this.doCallback();
      }
    },

    /*
      Анализируйте один лист на основе списка, превращая его в модель стола, используемую в качестве обратного вызова для JSON на основе списка
    */
    loadSheet: function(data) {
      var that = this;
      new Tabletop.Model({
        data: data,
        parseNumbers: this.parseNumbers,
        postProcess: this.postProcess,
        tabletop: this,
        prettyColumnNames: this.prettyColumnNames,
        onReady: function() {
          that.sheetReady(this);
        }
      });
    },

    /*
      Выполнять обратный вызов при загрузке! Положитесь на this.data(), 
      потому что вы можете запросить только определенные части данных (например, режим simpleSheet). 
      Проверяет this.sheetsToLoad на случай, если возникнет состояние гонки.
    */
    doCallback: function() {
      if(this.sheetsToLoad === 0) {
        this.callback.apply(this.callbackContext || this, [this.data(), this]);
      }
    },

    log: function() {
      if(this.debug) {
        if(typeof console !== 'undefined' && typeof console.log !== 'undefined') {
          Function.prototype.apply.apply(console.log, [console, arguments]);
        }
      }
    }

  };

  /*
    Tabletop.Model хранит имена атрибутов и анализирует данные рабочего листа, чтобы превратить их во что-то стоящее.

    Параметры должны быть в формате {data: XXX}, где XXX - лист на основе списка.
  */
  Tabletop.Model = function(options) {
    var i, j, ilen, jlen;
    this.columnNames = [];
    this.column_names = this.columnNames; // jshint ignore:line
    this.name = options.data.feed.title.$t;
    this.tabletop = options.tabletop;
    this.elements = [];
    this.onReady = options.onReady;
    this.raw = options.data; // Копия исходных данных листа для доступа к мелочам

    if (typeof(options.data.feed.entry) === 'undefined') {
      options.tabletop.log('Отсутствуют данные для ' + this.name + ', убедитесь, что вы не забыли заголовки столбцов.');
      this.originalColumns = [];
      this.elements = [];
      this.ready();
      return;
    }

    for (var key in options.data.feed.entry[0]){
      if (/^gsx/.test(key)) {
        this.columnNames.push(key.replace('gsx$',''));
      }
    }

    this.originalColumns = this.columnNames;
    this.original_columns = this.originalColumns; // jshint ignore:line

    for (i = 0, ilen =  options.data.feed.entry.length ; i < ilen; i++) {
      var source = options.data.feed.entry[i];
      var element = {};
      for (j = 0, jlen = this.columnNames.length; j < jlen ; j++) {
        var cell = source['gsx$' + this.columnNames[j]];
        if (typeof(cell) !== 'undefined') {
          if (options.parseNumbers && cell.$t !== '' && !isNaN(cell.$t)) {
            element[this.columnNames[j]] = +cell.$t;
          } else {
            element[this.columnNames[j]] = cell.$t;
          }
        } else {
          element[this.columnNames[j]] = '';
        }
      }
      if (element.rowNumber === undefined) {
        element.rowNumber = i + 1;
      }

      this.elements.push(element);
    }

    if (options.prettyColumnNames) {
      this.fetchPrettyColumns();
    } else {
      this.ready();
    }
  };

  Tabletop.Model.prototype = {
    /*
      Возвращает все элементы (строки) рабочего листа как объекты
    */
    all: function() {
      return this.elements;
    },

    fetchPrettyColumns: function() {
      if (!this.raw.feed.link[3]) {
        return this.ready();
      }

      var cellurl = this.raw.feed.link[3].href.replace('/feeds/list/', '/feeds/cells/').replace('https://spreadsheets.google.com', '');
      var that = this;
      this.tabletop.requestData(cellurl, function(data) {
        that.loadPrettyColumns(data);
      });
    },

    beforeReady: function() {
      if(this.postProcess) {
        for (i = 0, ilen = this.elements.length; i < ilen; i++) {
          this.postProcess(element);
        }
      }
    },

    ready: function() {
      this.beforeReady();
      this.onReady.call(this);
    },

    /*
     * Сохранять имена столбцов как объект 
     * с ключами "columnName" в формате Google 
     * и значениями "Column name" в удобочитаемом формате.
     */
    loadPrettyColumns: function(data) {
      var prettyColumns = {};

      var columnNames = this.columnNames;

      var i = 0;
      var l = columnNames.length;

      for (; i < l; i++) {
        if (typeof data.feed.entry[i].content.$t !== 'undefined') {
          prettyColumns[columnNames[i]] = data.feed.entry[i].content.$t;
        } else {
          prettyColumns[columnNames[i]] = columnNames[i];
        }
      }

      this.prettyColumns = prettyColumns;
      this.pretty_columns = this.prettyColumns; // jshint ignore:line
      this.prettifyElements();
      this.ready();
    },

    /*
     * Просмотрите каждую строку, заменяя 
     * "columnName" в формате Google 
     * на "название столбца", удобочитаемое для человека.
     */
    prettifyElements: function() {
      var prettyElements = [],
          orderedPrettyNames = [],
          i, j, ilen, jlen;

      for (j = 0, jlen = this.columnNames.length; j < jlen ; j++) {
        orderedPrettyNames.push(this.prettyColumns[this.columnNames[j]]);
      }

      for (i = 0, ilen = this.elements.length; i < ilen; i++) {
        var newElement = {};
        for (j = 0, jlen = this.columnNames.length; j < jlen ; j++) {
          var newColumnName = this.prettyColumns[this.columnNames[j]];
          newElement[newColumnName] = this.elements[i][this.columnNames[j]];
        }
        prettyElements.push(newElement);
      }
      this.elements = prettyElements;
      this.columnNames = orderedPrettyNames;
    },

    /*
      Возвращать элементы как массив массивов вместо массива объектов
    */
    toArray: function() {
      var array = [],
          i, j, ilen, jlen;
      for (i = 0, ilen = this.elements.length; i < ilen; i++) {
        var row = [];
        for (j = 0, jlen = this.columnNames.length; j < jlen ; j++) {
          row.push(this.elements[i][ this.columnNames[j]]);
        }
        array.push(row);
      }

      return array;
    }
  };

  if(typeof module !== 'undefined' && module.exports) { // не просто используйте inNodeJS, мы можем быть в Browserify
    module.exports = Tabletop;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return Tabletop;
    });
  } else {
    window.Tabletop = Tabletop;
  }

})();
