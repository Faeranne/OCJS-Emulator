let FileSystem = function(newLoader){
  this.address = "";
  this.methods = {};
  this.UI = document.createElement('div');

  let files = {};
  let label = "Disk";

  this.methods.list = function(path){

  }

  this.methods.open = function(path,mode){

  }

  this.methods.read = function(handle,count){

  }
  
  this.methods.write = function(handle,value){

  }

  this.methods.exists = function(path){

  }

  this.methods.rename = function(from,to){

  }

  this.methods.close = function(handle){

  }
  
  this.methods.getLabel = function(){

  }

  this.methods.setLabel = function(newLabel){
  
  return this;
}
