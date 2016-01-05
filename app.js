'use strict';
var http = require('http');
var koa = require('koa');
var router = require('koa-router')();
var cors = require('koa-cors');
var bodyParser = require('koa-bodyparser');
var forward = require('./forward');
var async = require('async');

var app = module.exports = koa();
var corsOptions = {
	origin: '*'
}

forward(app,{});

app
  .use(cors(corsOptions))
  .use(bodyParser())
  .use(function*(next){
    var query = this.request.query||{};
    var data = this.request.body||{};
    var targetURL = null;
    // var targetURL = data['_target_'] ? data['_target_'] : (query['_target_']? query['_target_']:null);
    if(data['_target_']){
      targetURL = data['_target_'];
      // remove this unused property, in case in some server to cause error
      delete data['_target_'];
    }
    if(query['_target_']){
      if(!targetURL){
        targetURL = query['_target_'].toString();
      }
      delete query['_target_'];
    }
    this.state.targetURL = targetURL;
		console.log('this.state.targetURL: ', this.state.targetURL);
    this.assert(this.state.targetURL, 400, "You must pass a targetURL. You can pass it on query or data. For example: http://example.com?_target_=http://google.com");
    yield next;
  })
  .use(router.routes())
  .use(router.allowedMethods());

router.get('*', function* (next){
  try{
		yield* this.forward({baseUrl: this.state.targetURL});
  }catch(error){
    this.status = 400;
    this.message = error.toString();
  }
});

router.post('*', function* (){
  try{
		yield* this.forward({baseUrl: this.state.targetURL});
  }catch(error){
    this.status = 400;
    this.message = error.toString();
  }
});

router.put('*', function*(){
  try{
		yield* this.forward({baseUrl: this.state.targetURL});
  }catch(error){
    this.status = 400;
    this.message = error.toString();
  }
});

router.delete('*', function*(){
  try{
		yield* this.forward({baseUrl: this.state.targetURL});
  }catch(error){
    this.status = 400;
    this.message = error.toString();
  }
});

router.patch('*', function*(){
  try{
		yield* this.forward({baseUrl: this.state.targetURL});
  }catch(error){
    this.status = 400;
    this.message = error.toString();
  }
});

app.on('error', function(err){
  console.error('server error', err);
});

if (!module.parent) {
  http.createServer(app.callback()).listen( process.env.PORT || 3000);
  console.log("[Info]Server was started on http://localhost:3000");
}
