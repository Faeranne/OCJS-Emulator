function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
window.onload = function(){
  let loader = new MachineLoader();
  window.loader = loader;
  loader.addComponentType('gpu',GPU);
  loader.addComponentType('screen',Screen);
  loader.addComponentType('eeprom',EEPROM);
}
