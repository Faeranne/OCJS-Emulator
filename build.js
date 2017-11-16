const file = require('fs');
const path = require('path');
const cassini = require('@mrmakeit/cassini');
const browserify = require('browserify');

let build = {}

let dirCheck = false;
let buildDir = path.join(__dirname,'build');
let docsDir = path.join(__dirname,'docs');
let appDir = path.join(buildDir,'app');

build.runDocs = function(){
  console.log('building docs');
  checkForBuildDirectory();
  cassini.generate({
    inputDir: docsDir,
    outputDir: buildDir
  });
}

build.runApp = function(){
  console.log('building app');
  checkForBuildDirectory();
  let b = browserify();
  b.add(path.join(__dirname,'js','app.js'));
  b.bundle().pipe(file.createWriteStream(path.join(appDir,'js','app.js')));
  file.copyFileSync(path.join(__dirname,'js','ui.js'),path.join(appDir,'js','ui.js'));
  file.copyFileSync(path.join(__dirname,'css','screen.css'),path.join(appDir,'css','screen.css'));
  file.copyFileSync(path.join(__dirname,'index.html'),path.join(appDir,'index.html'));
}


function checkForBuildDirectory(){
  if(dirCheck){
    return true;
  }
  let pathsToCheck = ['build','build/app','build/app/js','build/app/css'];
  for(let x = 0; x < pathsToCheck.length;x++){
    let thePath = path.join(__dirname,pathsToCheck[x]);
    if(!file.existsSync(thePath)){
      file.mkdirSync(thePath);
    }
  }
  dirCheck = true;
}

module.exports = build

build.runApp();
build.runDocs();
