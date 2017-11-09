let UIManager = function(loader){
  let manager = this;

  let target = $('#main-target').gridstack({disableResize:false,disableDrag:false}).data('gridstack');
  target.enableMove(true,true);
  
  this.componentList = $('<div class=\"grid-stack-item-content\">');
  this.machineUI = $('<div class=\"grid-stack-item-content\">');
  target.addWidget($('<div>').append($(this.componentList)),null,null,1,2)
  target.addWidget($('<div>').append($(this.machineUI)),null,null,1,2);


  function manageComponentUI(type,constructor,loader){
    let createComponent = document.createElement('button');
    createComponent.innerText = "Add "+type;
    createComponent.onclick = function(type){return function(){loader.addComponent(type)}}(type);
    $(createComponent).appendTo(manager.componentList);
  }

  function manageUI(type,component,loader){
    console.log(component);
    let width = component.Width || 1
		console.log('setting width',width);
    let height = component.Height || 1
		console.log('setting height',height);
    target.addWidget($('<div>').append($(component.UI).addClass('grid-stack-item-content')),null,null,width,height);
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

  this.machineUI.append(boot);
  this.machineUI.append(saveConfig);
  this.machineUI.append(loadConfig);

  loader.registerComponentHandler(manageComponentUI);
  loader.registerUIHandler(manageUI);

  return this
}
