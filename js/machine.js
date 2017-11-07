let MachineLoader = function(){
  
  let components = {};
  let componentList = {};
  let types = {};
  let nextFunction = null;
  let sleep = 0;
  let sleepDefault = 0;
  let uiComponents = {};
  
  this.machine = {};
  
  let componentAdd = document.createElement('div');
  componentAdd.id = "addComponentList";
  document.body.appendChild(componentAdd);
  
  
  
  this.addComponentType = function(name, constructor){
    types[name]=constructor;
    let loader = this;
    
    let buttonElement = document.createElement('button');
    buttonElement.innerText = "Add new "+name;
    buttonElement.onclick = function(){loader.addComponent(name)}
    componentAdd.appendChild(buttonElement);
    
    if(constructor.hasUI){
      let uiElement = document.createElement('div');
      uiElement.id=name;
      document.body.appendChild(uiElement);
      uiComponents[name]=uiElement;
    }
  }
  
  this.addComponent = function(type,args){
    if(!args){
      args = [];
    }
    args.unshift(this);
    let newComponent = new types[type](...args);
    components[newComponent.address]=newComponent;
    componentList[newComponent.address]=type;
    console.log("New "+type+" added with address "+newComponent.address);
    if(newComponent.UI){
      if(uiComponents[type]){
        newComponent.UI.id=type+'-'+newComponent.address;
        newComponent.UI.className=type;
        uiComponents[type].appendChild(newComponent.UI);
      }
    }
    return newComponent.address;
  }
  this.machine.list = function(){
    return componentList;
  }
  this.machine.invoke = function(address,method,params,cb){
    if(components[address] && components[address][method]){
      let results = components[address][method](...params)
      if(typeof cb == "function"){
        cb(results);
      }
    }
  }
  this.machine.sleepDefault = function(time){
    sleepDefault = time;
  }
  this.machine.sleep = function(time){
    if(time>sleepTime){
      sleepTime = time;
    }
  }
  this.machine.next = function(cb){
    nextFunction = (typeof cb == "function")? cb : null;
  }
  this.loop = function(){
    if(nextFunction){
      nextFunction();
      setTimeout(this.loop,sleep*1000);
    }
  }
  
  return this;
}