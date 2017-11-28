const MemoryFileSystem = require('memory-fs');
let FileSystem = function(newLoader){
  this.address = "";
  this.methods = {};
  this.UI = document.createElement('div');

  let fs = new MemoryFileSystem();
  let label = "Disk";
  let handles = [];
  let openHandles = 0;

  let FileSystem = this;

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

  this.reloadFS = function(newFS){
    fs = new MemoryFileSystem(newFS);
    console.log(fs);
  }

  this.saveFS = function(){
    return fs.data;
  }

  this.getConfig = function(){
    return JSON.stringify(FileSystem.saveFS());
  }
  this.setConfig = function(content){
    let newFS = JSON.parse(content);
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
