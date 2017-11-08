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
