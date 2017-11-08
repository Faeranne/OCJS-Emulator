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
  let saveButton = document.createElement("button");
  saveButton.id="saveButton";
  saveButton.innerText = "Save Current Config";
  componentAdd.appendChild(saveButton);
  let loadButton = document.createElement("button");
  loadButton.id="saveButton";
  loadButton.innerText = "Load Existing Config";
  componentAdd.appendChild(loadButton);

  this.saveConfig = function(){
    let componentsToStore = [];
    for(var x in components){
      let component = {};
      let y = components[x]; 
      component.address = y.address;
      component.type = componentList[x];
      if(y.getConfig){
        component.content = y.getConfig();
      }
      componentsToStore.push(component);
    }
    console.log(componentsToStore);
    localStorage.setItem("defaultConfig",JSON.stringify(componentsToStore));
  }

  saveButton.onclick = this.saveConfig;

  this.loadConfig = function(){
    let componentsToRestore = JSON.parse(localStorage.getItem("defaultConfig"));
    console.log(componentsToRestore);
    for(var x in componentsToRestore){
      console.log(x);
      let component = componentsToRestore[x];
      let generatedComponent = loader.addComponent(component.type,component.address);
      console.log(components[generatedComponent])
      console.log(component);
      if(component.content){
        components[generatedComponent].setConfig(component.content);
      }
    }
  }

  loadButton.onclick = this.loadConfig;

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
    if(allComp.length == 0){
      return [];
    }
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
	  eeprom = getComponentList('eeprom')[0];
		if(eeprom){
			computer.invoke(eeprom,'get',[],function(contents){
				contents = dec2string(contents[0])
				eval(contents);
			});
      loader.loop();
		}else{ 	
      console.error("No EEPROM found. Shutting Down.");
      running = false;
    }
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
  
  this.addComponent = function(type,address,args){
    if(!address){
      address = guid();
    }
    if(!args){
      args = [];
    }
    args.unshift(this);
    let newComponent = new types[type](...args);
    newComponent.address = address;
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
    if(components[address] && components[address].methods[method]){
      let results = components[address].methods[method](...params)
      if(typeof cb == "function"){
        cb(results);
      }
    }else{
      console.log('Error invoking',address,method,params);
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
    }else{
      console.log("No Loop Function. Shutting Down");
      running = false;
    }
  }
  
  return this;
}
