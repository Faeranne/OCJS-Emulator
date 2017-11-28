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
