let MachineLoader = function(){
  
	let loader = this;
  let components = {};
  let componentList = {};
  let types = {};
  let nextFunction = null;
  let sleep = 0;
  let sleepDefault = 0;
  let uiComponents = {};
  let running = false;
  
  this.machine = {};
	window.computer = this.machine;
  
  let componentAdd = document.createElement('div');
  componentAdd.id = "addComponentList";
  document.body.appendChild(componentAdd);
  let bootButton = document.createElement("button");
  bootButton.id="bootButton";
	bootButton.innerText = "Power";
  componentAdd.appendChild(bootButton);

  var dec2string = function(arr){
    string = ""
    for(var x in arr){
      string = string + String.fromCharCode(arr[x])
    }
    return string
  } 

	var getComponentList = function(type){
		var allComp = computer.list();
		var results = []
		for(comp in allComp){
			if(allComp[comp] == type){
				results.push(comp);
			}
		}
		return results;
	}
   
  function boot(){
		if(running){
			console.log('Shutting Down Computer');
			running = false;
			return;
		}
		console.log("Booting Computer");
		running = true;
	  eeprom = getComponentList('eeprom');
		if(eeprom){
			computer.invoke(eeprom,'get',[],function(contents){
				contents = dec2string(contents[0])
				eval(contents);
			});
		} 	
		loader.loop();
  }  

	bootButton.onclick = boot;

  this.addComponentType = function(name, constructor){
    types[name]=constructor;
    
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
    if(time>sleep){
      sleep = time;
    }
  }
  this.machine.next = function(cb){
    nextFunction = (typeof cb == "function")? cb : null;
  }

	this.machine.print = function(){
		console.log(...arguments);
	}
  this.loop = function(){
    if(nextFunction){
			if(!running){
				return;
			}
      nextFunction();
      setTimeout(loader.loop,sleep*1000);
    }
  }
  
  return this;
}
