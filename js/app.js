window.onload = function(){
  MachineLoader = require("./machine.js");
  let loader = new MachineLoader();
  let uiManager = new UIManager(loader);
  require('./plugins/')(loader);
  require('./components/')(loader);
}
