var koa = require('koa');
var app = koa();

var less = require('koa-less');
var serve = require('koa-static');
app.use(less('./static'));
app.use(serve('static'));
app.use(serve('bower_components/bootstrap/dist'));
app.use(serve('bower_components/jquery/dist'));

var views = require('koa-views');
app.use(views('static', {
  default: 'jade',
  cache: false
}));

app.use(function* (next) {
  this.locals = {
    title: 'Code Challenge'
  };
  // Render jade.
  yield this.render('index');
});

app.listen(3000);
