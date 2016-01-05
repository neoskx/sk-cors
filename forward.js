'use strict';

var request = require('co-request');
var _ = require("lodash");
var path = require('path');

/**
 * app: Koa Application object
 * defaultOptions: default options for each forward
 */
module.exports = function forward(app, defaultOptions){
  defaultOptions = defaultOptions || {};

  if(!app||!app.context){
    throw("You must pass correct app object!");
  }

  /**
   * options is same with [request options](https://github.com/request/request#requestoptions-callback)
   *
   * The URL format:
   *   scheme:[//[user:password@]host[:port]][/]path[?query][#fragment]. From wiki [Uniform Resource Locator](https://en.wikipedia.org/wiki/Uniform_Resource_Locator)
   */
  app.context.forward = function* (options){

    // options
    options = _.merge({}, defaultOptions, options);

    // Set HTTP Method. Default same with currently method
    options.method = options.method || this.method;

    // Set HTTP Headers. this.request.headers is set by user, so it has highest priority
    // options.headers = _.merge({}, options.headers, this.request.headers);

    // Set HTTP Query String
    options.qs = _.merge({}, options.qs, this.request.query);

    // Set HTTP URL
    if(!options.url){     // If options.url doesn't exist, then use currently url
      options.url = this.request.path;
    }

    // Set HTTP baseURL(Host)
    if(!options.baseUrl){
      options.baseUrl = this.protocol+"://"+this.host;
    }

    // options.headers.host = options.baseUrl;

    // Set HTTP Body
    switch (this.is('json', 'multipart/form-data', 'urlencoded')) {
      case 'json':
        delete options.headers['content-length'];
        options.body = _.merge({}, options.body,this.request.body);
        options.json = true;
        break;
      case 'multipart/form-data':
        var body = this.request.body;
        var files = body.files || {};
        var fields = body.fields || {};
        if (!options.formData) {
          delete options.headers['content-length'];
          options.formData = {};

          Object.keys(files).forEach(function (filename) {
            options.formData[filename] = {
              value: fs.createReadStream(files[filename].path),
              options: {
                filename: files[filename].name,
                contentType: files[filename].type
              }
            };
          });
          Object.keys(fields).forEach(function (item) {
            options.formData[item] = fields[item];
          });
        }
        break;
      case 'urlencoded':
        options.form = _.merge({}, options.form, this.request.body);
        break;
      default:
        if (!~['HEAD', 'GET', 'DELETE'].indexOf(options.method)) {
          options.body = JSON.stringify(_.merge({}, options.body, this.request.body));
        }
    }


    var res = yield request(options);
    // console.log(res.body);
    this.body = res.body;
  }

};
