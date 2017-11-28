function installPlugins(loader){
  loader.addPlugin('mock',require("./mock.js"));
}

module.exports = installPlugins
