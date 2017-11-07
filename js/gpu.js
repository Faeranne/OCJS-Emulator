let GPU = function(newloader){
  let screen = null;
  let textArray = [];
  let textHeight = 40;
  let textWidth = 80;
  let loader = newloader;
  
  this.address = guid();
  
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

  this.set = function(x, y, text, vertical) {
    for (i = 0; i < text.length; i++) {
      textArray[y][x + i] = text[i];
    }
    draw();
  }
  this.fill = function(x,y,w,h,character){
    let char = character[0];
    for(i=y;i<h+y;i++){
      for(j=x;j<w+x;j++){
        textArray[i][j]=char;
      }
    }
    draw();
  }
  this.copy = function(x1,y1,w,h,x2,y2){
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
  this.bind = function(address){
    screen = address;
    clear();
  }
  clear();
  return this;
}