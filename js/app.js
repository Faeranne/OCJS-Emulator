window.onload = function(){
  MachineLoader = require("./machine.js");
  let loader = new MachineLoader();
  let uiManager = new UIManager(loader);
  require('./plugins.js')(loader);
  require('./components.js')(loader);
}
