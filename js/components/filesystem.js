const MemoryFileSystem = require('memory-fs');
let FileSystem = function(newLoader){
  this.address = "";
  this.methods = {};
  this.UI = document.createElement('div');

	this.UIList = document.createElement('select');
	this.UIContent = document.createElement('textarea')
	this.UIReload = document.createElement('button');
	this.UIName = document.createElement('input');
	this.UICreate = document.createElement('button');

	this.UIList.setAttribute('size',20);
	this.UIList.setAttribute('style','font-family: monospace;') 
	this.UIList.onchange = function(e){
		console.log(this.value)
		FileSystem.UIContent.value=fs.readFileSync(this.value).toString();
		FileSystem.UIName.value = this.value
	}

	this.UIReload.innerText="Reload"
	this.UIReload.onclick = function(){
		FileSystem.reloadUI();
	}

	this.UICreate.innerText = "Create"
	this.UICreate.onclick = function(){
		saveFileCreateFolder();
	}

	this.UI.appendChild(this.UIList);
	this.UI.appendChild(this.UIReload);
	this.UI.appendChild(this.UIName);
	this.UI.appendChild(this.UICreate);
	this.UI.appendChild(this.UIContent)

  let fs = new MemoryFileSystem();
  let label = "Disk";
  let handles = [];
  let openHandles = 0;

	console.log(this);
  let FileSystem = this;

	let saveFileCreateFolder = function(){
		let name = FileSystem.UIName.value;
		if(name.substring(name.length-1,name.length)=="/"){
			fs.mkdirpSync(name);
			FileSystem.reloadUI();
		}else{
			try{
			fs.writeFileSync(name,FileSystem.UIContent.value);
			FileSystem.reloadUI();
			}catch(e){
			}
		}
	}

  let getNewHandle = function(newHandle){
    if(openHandles >= 30){
      return false;
    }
    if(!newHandle){
      newHandle = 0;
    }
    newHandle++;
    if(handles[newHandle]){
      newHandle = getNewHandle(newHandle);
    }
    openHandles++;
    return newHandle
  }

  let closeHandle = function(handle){
    handles[handle]=false;
    openHandles--;
  }

	let parseFileSystem = function(path){
		let results = {};
		let dir = fs.readdirSync(path);
		console.log(dir);
		for(x in dir){
			entry = dir[x]
			if(fs.statSync(path+'/'+entry).isDirectory()){
				results[entry]=parseFileSystem(path+'/'+entry);
			}else{
				results[entry]="file";
			}
		}
		return results;
	}

  this.reloadUI = function(){
		let fs = parseFileSystem('/');
    let list = FileSystem.UIList
		let wrapOutputAsOption=function(text,value){
		return "<option value='"+value+"'>"+text+"</option>\n";
		}
		let layer = 0;
		let walkObjectTree = function(tree,name,layers,last,oldLayers){
			if(typeof tree == 'string'){
				return wrapOutputAsOption(layers+"-"+name,oldLayers+'/'+name);
			}
			let keys = Object.keys(tree);
			let output = ""
			if(name==""){
				output = wrapOutputAsOption(layers+'-/',oldLayers+'/');
			}else{
				output = wrapOutputAsOption(layers+'-'+name+'/',oldLayers+'/'+name+'/');
			}
			let nextLast = false;
			if(name!=''){
				newLayers = oldLayers + '/'+name;
			}else{
				newLayers = ""
			}
			for(var x = 0; x<keys.length; x++){
				let layer = layers
				if(last){
					layer=layer.substring(0,layer.length-1)+"=";
				}
				if(x<=keys.length-2){
					layer = layer+'|';
				}else{
					layer = layer+'\\';
					nextLast = true;
				}
				output = output + walkObjectTree(tree[keys[x]],keys[x],layer,nextLast,newLayers);
			}
			return output;
		}
		walkedObjects=walkObjectTree(fs,'','',false,'')
		console.log(walkedObjects);
		list.innerHTML=walkedObjects;
	}
  this.reloadFS = function(newFS){
    fs = new MemoryFileSystem(newFS);
		FileSystem.reloadUI();
    console.log(fs);
  }

  this.saveFS = function(){
    return fs.data;
  }

  this.getConfig = function(){
    return JSON.stringify(FileSystem.saveFS());
  }
  this.setConfig = function(content){
    let newFS = JSON.parse(content, (k, v) => {
			if ( v !== null &&
				typeof v === 'object' &&
				'type' in v &&
        v.type === 'Buffer' &&
        'data' in v &&
        Array.isArray(v.data)) {
        console.log(v);
        return new Buffer(v.data);
      }
      return v;
    });
    FileSystem.reloadFS(newFS);
  }

  this.methods.list = function(path){
    return fs.readdirSync(path);
  }

  this.methods.open = function(path,mode){
    let i = getNewHandle();
    let content = [];
    if(fs.existsSync(path)||mode.indexOf('w')>=0||mode.indexOf('a')>=0){
      if(fs.existsSync(path)){
        content = fs.readFileSync(path);
      }
      handles[i] = new Handle(content,path,mode)
    }
    return i;
  }

  this.methods.read = function(handle,count){
    console.log(handle);
    if(handles[handle]){
      let results = handles[handle].read(count);
      console.log("Got Results", results);
      return results;
    }
  }
  
  this.methods.write = function(handle,value){
    if(handles[handle]){
      return handles[handle].write(value);
    }
  }

  this.methods.exists = function(path){
    return fs.existsSync(path);
  }

  this.methods.rename = function(from,to){
    fs.writeFileSync(to,fs.readFileSync(from));
    fs.unlinkSync(from);
  }

  this.methods.close = function(handle){
    if(handles[handle]){
      let contents = handles[handle].getBuffer();
      console.log(handles[handle].path)
      fs.writeFileSync(handles[handle].path,contents);
      closeHandle(handle);
      return;
    }
  }
  
  this.methods.getLabel = function(){
    return label;
  }

  this.methods.setLabel = function(newLabel){
    label = newLabel;
    return label;
  }

	this.reloadUI();

  return this;
}

let Handle = function(buffer,path,mode){
  this.pointer = 0;
  this.mode = 0;
  this.path = path;

  if(typeof mode == "string"){
    console.log(mode);
    if(mode.indexOf('r')>=0){
      this.mode=0;
    }
    if(mode.indexOf('w')>=0){
      this.mode=1;
    }
    if(mode.indexOf('a')>=0){
      this.mode=2;
    }
  }


  this.content = []

  let handle = this;

  if(this.mode!=1){
    for(var x = 0; x<buffer.length; x++){
      this.content[x]=buffer[x];
    }
  }

  if(this.mode==2){
    this.pointer = this.content.length;
  }

  this.read = function(count){
    if(this.mode!=0){
      throw Error("File Not Opened READ");
      return;
    }
    let buff = [];
    if(handle.pointer+count>handle.content.length){
      count = handle.content.length-handle.pointer;
    }
    console.log(count);
    if(count){
      for(var x = 0;x<count;x++){
        buff[x] = handle.content[x+handle.pointer]
      }
      handle.pointer = handle.pointer+count;
      return buff;
    }else{
      return null;
    }
  }

  this.seek = function(location){
    if(handle.mode!=0){
      throw Error("File Not Opened READ");
      return;
    }
    handle.pointer=location;
    return handle.pointer;
  }

  this.write = function(data){
    if(handle.mode==0){
      throw Error("File Opened READ");
      return;
    }
    for(var x = 0; x < data.length;x++){
      handle.content[x+handle.pointer]=data[x];
    }
    handle.pointer = handle.pointer+data.length;
    return;
  }

  this.getBuffer = function(){
    return Buffer.from(this.content);
  }
  return this;
}

module.exports = FileSystem;
