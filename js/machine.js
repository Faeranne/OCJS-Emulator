let MachineLoader = function(){
  
	let loader = this;
  let components = {};
  let componentList = {};
  let types = {};
  let nextFunction = null;
  let sleep = 0;
  let sleepDefault = 0;
  let uiComponents = {};
  let ComponentHandlers = []
  let UIHandlers = []
  let BootHandlers = []
  let Plugins = {};
  let Signals = [];
  let running = false;

  this.machine = {};
  this.playerName = 'Player'+(Math.floor(Math.random()*8999)+1000);

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  this.saveConfig = function(){
    let pluginsToStore = [];
    for(var x in Plugins){
      let plugin = {}
      let y = Plugins[x];
      plugin.type = x;
      if(y.getConfig){
        plugin.content = y.getConfig();
        pluginsToStore.push(plugin);
      }
    }
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
    console.log(pluginsToStore);
    console.log(componentsToStore);
    localStorage.setItem("defaultPlugins",JSON.stringify(pluginsToStore));
    localStorage.setItem("defaultConfig",JSON.stringify(componentsToStore));
  }

  this.loadConfig = function(){
    let pluginsToRestore = JSON.parse(localStorage.getItem("defaultPlugins"));
    for(var x in pluginsToRestore){
      let plugin = pluginsToRestore[x];
      console.log("Loading Plugin Config:",plugin);
      if(Plugins[plugin.type]){
        Plugins[plugin.type].setConfig(plugin.content);
      }
    }
    let componentsToRestore = JSON.parse(localStorage.getItem("defaultConfig"));
    console.log(componentsToRestore);
    for(var x in componentsToRestore){
      console.log(x);
      let component = componentsToRestore[x];
      if(!component.address || !components[component.address]){
        let newAddress = loader.addComponent(component.type,component.address);
        if(!component.address){
          component.address = newAddress;
        }
      }
      if(component.content){
        components[component.address].setConfig(component.content);
      }
    }
  }

  this.boot = function(){
    Signals = [];
    var dec2string = function(arr){
      string = ""
      for(var x in arr){
        string = string + String.fromCharCode(arr[x])
      }
      return string
    } 

    var getComponentList = function(type){
      var allComp = loader.machine.list();
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
    if(running){
      for(var x in BootHandlers){
        let cb = BootHadlers[x];
        cb(false);
      }
      console.log('Shutting Down Computer');
      running = false;
      return;
    }
    for(var x in BootHandlers){
      let cb = BootHadlers[x];
      cb(true);
    }
    console.log("Booting Computer");
    running = true;
    eeprom = getComponentList('eeprom')[0];
    if(eeprom){
      loader.machine.invoke(eeprom,'get',[],function(contents){
        contents = dec2string(contents[0])

        let mask = {};
        for (p in window)
          mask[p] = undefined;

          try{
            (new Function("computer", "with(this) { " + contents + "}")).call(mask,loader.machine);
          }catch (e){
            console.error("Error Executing code in EEPROM:");
            console.error(e);
          }
      });
      loader.loop();
    }else{ 	
      console.error("No EEPROM found. Shutting Down.");
      running = false;
    }
  }

  this.registerComponentHandler = function(cb){
    ComponentHandlers.push(cb);
    for(type in types){
      cb(type,types[type]);
    }
  }

  this.registerUIHandler = function(cb){
    UIHandlers.push(cb);
    for(address in components){
      if(components[address].UI){
        cb(components[address].type,components[address],loader);
      }
    }
  }

  this.registerBootHandler = function(cb){
    BootHandlers.push(cb);
  }

  this.addPlugin = function(name,constructor){
    let newPlugin = new constructor(loader);
    Plugins[name]=newPlugin;
    if(newPlugin.UI){
      for(var x in UIHandlers){
        let cb = UIHandlers[x];
        cb(name,newPlugin,loader);
      }
    }
  }

  this.addComponentType = function(name, constructor){
    types[name]=constructor;
    for(var x in ComponentHandlers){
      let cb = ComponentHandlers[x];
      cb(name,constructor,loader);
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
      for(var x in UIHandlers){
        let cb = UIHandlers[x];
        cb(type,newComponent,loader);
      }
    }
    return newComponent.address;
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

  this.pushSignal = function(name,args){
    Signals.push({name:name,args:args});
  }

  this.machine.list = function(){
    return componentList;
  }

  this.machine.pullSignal = function(){
    let signal = Signals.shift();
    return signal;
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
  this.machine.invokeSync = function(address,method,params){
    if(components[address] && components[address].methods[method]){
      let results = components[address].methods[method](...params)
      return results
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
  
  return this;
}

module.exports = MachineLoader
