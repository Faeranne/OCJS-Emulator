(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.onload = function(){
  MachineLoader = require("./machine.js");
  let loader = new MachineLoader();
  let uiManager = new UIManager(loader);
  require('./plugins.js')(loader);
  require('./components.js')(loader);
}

},{"./components.js":2,"./machine.js":6,"./plugins.js":8}],2:[function(require,module,exports){
function installComponents(loader){
  loader.addComponentType('gpu',require("./gpu.js"));
  loader.addComponentType('screen',require("./screen.js"));
  loader.addComponentType('eeprom',require("./eeprom.js"));
  loader.addComponentType('keyboard',require("./keyboard.js"));
}

module.exports = installComponents

},{"./eeprom.js":3,"./gpu.js":4,"./keyboard.js":5,"./screen.js":9}],3:[function(require,module,exports){
function string2dec(string){
  let arr = [];
	for(var x=0;x<string.length;x++){
    arr[x] = string.charCodeAt(x);
  }
  return arr;
}

var dec2string = function(arr){
	string = ""
	for(var x in arr){
    computer.print(arr[x]);
		string = string + String.fromCharCode(arr[x])
	}
	return string
}

let EEPROM = function(newloader) {
  this.UI = document.createElement("div");
  this.address = '';
  this.loader = newloader;
  this.Width = 4;
  this.Height = 6;
  let content = "";
  let maxSize = 4196;
  let readOnly = false;

  let textBox = document.createElement("textarea");
  textBox.onchange = function() {
    content = textBox.value;
  };
  this.UI.appendChild(textBox);
  function updateText() {
    textBox.value = content;
  }

  this.methods = {}

  this.methods.get = function(){
    let arr = string2dec(content);
    return [arr];
  }
  this.methods.set = function(string){
    if(typeof string == "array"){
			string = dec2string(string);
		}
		content = string;
		updateText();
	}

  this.getConfig = function(){
    return content;
  }

  this.setConfig = function(newContent){
    content = newContent;
    updateText();
  }

  return this;
};

EEPROM.hasUI = true;
EEPROM.maxCount = 1;

module.exports = EEPROM;

},{}],4:[function(require,module,exports){
let GPU = function(newloader){
  let screen = null;
  let textArray = [];
  let textHeight = 40;
  let textWidth = 80;
  let loader = newloader;
  
  this.address = '';
  
  function draw() {
    if(screen){
      loader.machine.invoke(screen,'draw',[textArray]);
    }
  }
  function clear() {
    for (x = 0; x < textHeight; x++) {
      textArray[x]=[];
      for(y = 0; y < textWidth; y++){
        textArray[x][y]=" ";
      }
    }
    if(screen){
      loader.machine.invoke(screen,'clear',[]);
    }
  }

  this.methods = {}

  this.methods.set = function(x, y, text, vertical) {
    text = text.toString();
    for (i = 0; i < text.length; i++) {
      textArray[y][x + i] = text[i];
    }
    draw();
  }
  this.methods.fill = function(x,y,w,h,character){
    let char = character[0];
    for(i=y;i<h+y;i++){
      for(j=x;j<w+x;j++){
        textArray[i][j]=char;
      }
    }
    draw();
  }
  this.methods.copy = function(x1,y1,w,h,x2,y2){
    let copyArray = [];
    for(i=0;i<h;i++){
      copyArray[i]=[];
      for(j=0;j<w;j++){
        let letter = textArray[i+x1][j+y1];
        copyArray[i][j]=letter;
      }
    }
    for(i=0;i<h;i++){
      for(j=0;j<w;j++){
        textArray[i+x1+x2][j+y1+y2]=copyArray[i][j]
      }
    }
    draw();
  }
  this.methods.bind = function(address){
    screen = address;
    clear();
  }
  clear();
  return this;
}
module.exports = GPU;

},{}],5:[function(require,module,exports){
let Keyboard = function(newLoader){
  let loader = newLoader;
  let keyboard = this;

  this.address = "";
  
  function keyDown(e){
    let code = e.keyCode;
    console.log("Recording key down:",code)
    loader.pushSignal("key_down",[keyboard.address,code,code,loader.playerName]);
  } 

  function keyUp(e){
    let code = e.keyCode;
    console.log("Recording key up:",code)
    loader.pushSignal("key_up",[keyboard.address,code,code,loader.playerName]);
  } 

  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);

  return this;
}
module.exports = Keyboard;

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
module.exports = function(newLoader){
  this.loader = newLoader;
  this.UI = document.createElement('div');
  this.Width = 3;
  this.Height = 1;


  let emptyMock = function(newLoader){
    this.loader = newLoader;
    this.address = ""
    this.UI = document.createElement('div');
    this.methods = {};
		this.Width = 2;
		this.Height = 4;

    mock = this;

    let methods = {};

    let addMethodButton = function(){
      let name = methodName.value;
      let code = methodCode.value;
      addMethod(name,code);
    }
    let addMethod = function(name,code){
      let method = new Function(code);
      methods[name]=code;
      mock.methods[name] = method;
      renderTable();
    }

    let renderTable = function(){
      while (methodTable.firstChild) {
        methodTable.removeChild(methodTable.firstChild);
      }
      for(name in methods){
        code = methods[name];
        let row = document.createElement('tr');
        let nameCell =document.createElement('td');
        nameCell.innerText = name;
        let codeCell = document.createElement('td');
        codeCell.innerText = code;
        row.appendChild(nameCell);
        row.appendChild(codeCell);
        methodTable.appendChild(row);
      }
    }

    this.getConfig = function(){
      return JSON.stringify(methods);
    }

    this.setConfig = function(contents){
      let methods = JSON.parse(contents);
      for(name in methods){
        addMethod(name,methods[name]);
      }
      console.log("Methods Loaded: ",mock.methods);
    }

    let methodName = document.createElement('input');
    let methodCode = document.createElement('textarea');
    let createButton = document.createElement('button');
    createButton.innerText = "Add/Edit Mock Function";
    createButton.onclick = addMethodButton;
    let methodTable = document.createElement('table');
    this.UI.appendChild(methodName);
    this.UI.appendChild(methodCode);
    this.UI.appendChild(createButton);
    this.UI.appendChild(methodTable);
    return this;
  }

  let createMockButton = function(){
    let name = mockType.value;
    createMock(name);
  }
  let createMock = function(name){
    if(existingMocks.indexOf(name)<0){
      existingMocks.push(name);
      loader.addComponentType(name,emptyMock);
    }
  }
  
  let existingMocks = [];

  this.getConfig = function(){
    return JSON.stringify(existingMocks);
  }
  this.setConfig = function(content){
    let mocks = JSON.parse(content);
    console.log("Loading Mocks: ",mocks);
    for(var x in mocks){
      name = mocks[x];
      createMock(name);
    }
  }


  let mockType = document.createElement('input');
  let createButton = document.createElement('button');
  createButton.innerText = "Create Mock Component";
  createButton.onclick = createMockButton;
  this.UI.appendChild(mockType);
  this.UI.appendChild(createButton);

  return this;
}

},{}],8:[function(require,module,exports){
function installPlugins(loader){
  loader.addPlugin('mock',require("./mock.js"));
}

module.exports = installPlugins

},{"./mock.js":7}],9:[function(require,module,exports){
let Screen = function(newloader) {
  this.UI = element = document.createElement("pre");
  this.UI.className = "screen"
  let textHeight = 30;
  let textWidth = 80;
  this.Width = 5;
  this.Height = 6;
  this.address = '';
  this.loader = newloader;

  this.methods = {}

  this.methods.clear = clear = function() {
    let text = "";
    for (x = 0; x < textHeight; x++) {
      for (y = 0; y < textWidth; y++) {
        text = text + " ";
      }
      text = text + "\n";
    }
    element.innerText = text;
  };

  this.methods.draw = function(textArray) {
    let text = "";
    for (x = 0; x < textHeight; x++) {
      for (y = 0; y < textWidth; y++) {
        text = text + textArray[x][y][0];
      }
      text = text + "\n";
    }
    element.innerText = text;
  };
  clear();
  return this;
};

Screen.hasUI = true;

module.exports = Screen;

},{}]},{},[1]);
