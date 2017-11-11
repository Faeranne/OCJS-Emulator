function installComponents(loader){
  loader.addComponentType('gpu',require("./gpu.js"));
  loader.addComponentType('screen',require("./screen.js"));
  loader.addComponentType('eeprom',require("./eeprom.js"));
  loader.addComponentType('keyboard',require("./keyboard.js"));
}

module.exports = installComponents
