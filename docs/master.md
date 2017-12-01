# OCJS - Emulator


[OCJS](https://github.com/mrmakeit/OCJS/) is a Javascript based architecture mod for the Minecraft mod [OpenComputer](https://github.com/MightyPirates/OpenComputers).

## Usage

The latest version of the emulator can be accessed online [here](../app/index.html);

## UI

While the UI is still under construction, it hosts everything needed to actually use the emulator.

## Computer Mangement

The first three buttons hand computer management.  These affect the state of the computer, as well as handling loading and saving of states.

### Power

Fairly straight forward, this acts like the in-game power button, turning the computer on when off, and off when on.

### Save Config

This saves the current state of the computer, including the components installed and their addresses, plugins installed, and saveable config for all of them.  By default, this saves to a generic config, but should support multiple configs soon.  The config is saved locally in the browser.

### Load Config

This loads a prevously saved state, restoring components with their addresses and configs, and plugins.  This does not remove already exsisting components, and does not check if exsisting components already have the same address.

## Component Managment

The second row of buttons handle adding new components to the computer.  Clicking any of them add a new instance of the component with a random id.  If the component has a GUI element, that will be added as well.  Components can not be deleted at this time.

## Plugins

While components are added to, and work with, the computer, plugins work with the VM itself.  The can modify most aspects of the VM, including adding new components on-the-fly, like the mock plugin

### Mock Plugin

This plugin adds modifyable, static, components.  Enter a compatable component name and click create, and a new component type will show up in the component bar.  While mock components can't currently accept parameters, the can execute javascript and return values.  Function names can be added and edited with the first text box, while the associated function is created with the second box.
