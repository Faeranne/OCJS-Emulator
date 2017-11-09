window.onload = function(){
  let loader = new MachineLoader();
  let uiManager = new UIManager(loader);
  window.loader = loader;
  loader.addPlugin('mock',MOCKPlugin);
  loader.addComponentType('gpu',GPU);
  loader.addComponentType('screen',Screen);
  loader.addComponentType('eeprom',EEPROM);
}
