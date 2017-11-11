let FileSystem = function(newLoader){
  this.address = "";
  this.methods = {};
  this.UI = document.createElement('div');

  let files = {};
  let label = "Disk";
  let handles = [];


  let parsePath = function(obj, path) {
    var current=obj; 
    path.split('.').forEach(function(p){ current = current[p]; }); 
    return current;
  }
  this.methods.list = function(path){
    let object = path2object(path);
    if(object && typeof object == "Object"){
      return object.keys();
    }else{
      return null;
    }
  }

  this.methods.open = function(path,mode){
    let object = path2object(path);
    if(object && typeof object != "Object"){
      let open = false;
      let handle = 0;
      while(!open){
        if(!handles[handle]){
          open=true;
        }
      }
      newObject = {pointer:0,file:object,path:path}
      handles[handle]=newObject;
      return handle;
    }
  }

  this.methods.read = function(handle,count){
    let file = handles[handle].file;
    let response = null;
    if(file.length < handles[handle].pointer){
      let start = handles[handle].pointer;
      let end = start + count;
      response = file.substring(start,end);
      handles[handle].pointer=end;
    }
    return response;
  }
  
  this.methods.write = function(handle,value){
  }

  this.methods.exists = function(path){

  }

  this.methods.rename = function(from,to){

  }

  this.methods.close = function(handle){
    handles[handle]=null;
  }
  
  this.methods.getLabel = function(){

  }

  this.methods.setLabel = function(newLabel){
  
  return this;
}
