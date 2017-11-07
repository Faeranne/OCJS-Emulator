let EEPROM = function(newloader) {
  this.UI = document.createElement("div");
  this.address = guid();
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
  return this;
};

EEPROM.hasUI = true;
