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
