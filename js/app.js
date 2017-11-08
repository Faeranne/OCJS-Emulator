function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
let componentList = document.createElement('div');
let machineUI = document.createElement('div');
window.onload = function(){
  let loader = new MachineLoader();
  window.loader = loader;
  let boot = document.createElement('button');
  boot.innerText = "Power"
  boot.onclick = loader.boot
  let saveConfig = document.createElement('button');
  saveConfig.innerText = "Save Config"
  saveConfig.onclick = loader.saveConfig
  let loadConfig = document.createElement('button');
  loadConfig.innerText = "load Config"
  loadConfig.onclick = loader.loadConfig
  machineUI.appendChild(boot);
  machineUI.appendChild(saveConfig);
  machineUI.appendChild(loadConfig);
  loader.registerComponentHandler(manageComponentUI);
  loader.registerUIHandler(manageUI);
  document.body.appendChild(machineUI);
  document.body.appendChild(componentList);
  loader.addPlugin('mock',MOCKPlugin);
  loader.addComponentType('gpu',GPU);
  loader.addComponentType('screen',Screen);
  loader.addComponentType('eeprom',EEPROM);
}

function manageComponentUI(type,constructor,loader){
  let createComponent = document.createElement('button');
  createComponent.innerText = "Add "+type;
  createComponent.onclick = function(type){return function(){loader.addComponent(type)}}(type);
  componentList.appendChild(createComponent);
}

function manageUI(type,component,loader){
  document.body.appendChild(component.UI);
}
