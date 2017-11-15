const pages = require('gh-pages');
const path = require('path');

pages.publish('build',{
  add:true
}, function(err){
  if(err){
    throw err;
    return;
  }
});
