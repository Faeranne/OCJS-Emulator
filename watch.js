const watch = require('watch');
const path = require('path');
const build = require('./build.js');
const express = require('express');
const static = require('express-static');
const app = express();

let port = process.env.PORT || 8000;
app
  .get('/', function(req,res){
    res.redirect(301, 'master/')
  })
  .use(static('build'))
  .listen(port);

watch.createMonitor(path.join(__dirname,'docs'),function(monitor){
  monitor.on("created",build.runDocs);
  monitor.on("changed",build.runDocs);
  monitor.on("removed",build.runDocs);
});
