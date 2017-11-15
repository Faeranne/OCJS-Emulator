let UIManager = function(loader){
  let manager = this;
  this.componentList = document.createElement('div');
  this.machineUI = document.createElement('div');
  function manageComponentUI(type,constructor,loader){
    let createComponent = document.createElement('button');
    createComponent.innerText = "Add "+type;
    createComponent.onclick = function(type){return function(){loader.addComponent(type)}}(type);
    manager.componentList.appendChild(createComponent);
  }

  function manageUI(type,component,loader){
    document.body.appendChild(component.UI);
  }
  let boot = document.createElement('button');
  boot.innerText = "Power"
  boot.onclick = loader.boot
  let saveConfig = document.createElement('button');
  saveConfig.innerText = "Save Config"
  saveConfig.onclick = loader.saveConfig
  let loadConfig = document.createElement('button');
  loadConfig.innerText = "load Config"
  loadConfig.onclick = loader.loadConfig
  this.machineUI.appendChild(boot);
  this.machineUI.appendChild(saveConfig);
  this.machineUI.appendChild(loadConfig);
  loader.registerComponentHandler(manageComponentUI);
  loader.registerUIHandler(manageUI);
  document.body.appendChild(this.machineUI);
  document.body.appendChild(this.componentList);

  return this
}
