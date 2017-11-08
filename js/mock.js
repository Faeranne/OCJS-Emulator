let MOCKPlugin = function(newLoader){
  this.loader = newLoader;
  this.UI = document.createElement('div');


  let emptyMock = function(newLoader){
    this.loader = newLoader;
    this.address = ""
    this.UI = document.createElement('div');
    this.methods = {};

    mock = this;

    let methods = {};

    let addMethodButton = function(){
      let name = methodName.value;
      let code = methodCode.value;
      addMethod(name,code);
    }
    let addMethod = function(name,code){
      let method = new Function(code);
      methods[name]=code;
      mock.methods[name] = method;
      renderTable();
    }

    let renderTable = function(){
      while (methodTable.firstChild) {
        methodTable.removeChild(methodTable.firstChild);
      }
      for(name in methods){
        code = methods[name];
        let row = document.createElement('tr');
        let nameCell =document.createElement('td');
        nameCell.innerText = name;
        let codeCell = document.createElement('td');
        codeCell.innerText = code;
        row.appendChild(nameCell);
        row.appendChild(codeCell);
        methodTable.appendChild(row);
      }
    }

    this.getConfig = function(){
      return JSON.stringify(methods);
    }

    this.setConfig = function(contents){
      let methods = JSON.parse(contents);
      for(name in methods){
        addMethod(name,methods[name]);
      }
      console.log("Methods Loaded: ",mock.methods);
    }

    let methodName = document.createElement('input');
    let methodCode = document.createElement('textarea');
    let createButton = document.createElement('button');
    createButton.innerText = "Add/Edit Mock Function";
    createButton.onclick = addMethodButton;
    let methodTable = document.createElement('table');
    this.UI.appendChild(methodName);
    this.UI.appendChild(methodCode);
    this.UI.appendChild(createButton);
    this.UI.appendChild(methodTable);
    return this;
  }

  let createMock = function(){
    existingMocks.push(mockType.value);
    loader.addComponentType(mockType.value,emptyMock);
  }
  
  let existingMocks = [];

  this.getConfig = function(){
    return JSON.stringify(existingMocks);
  }
  this.setConfig = function(content){
    let mocks = JSON.parse(content);
    existingMocks = mocks;
    console.log("Loading Mocks: ",mocks);
    for(var x in mocks){
      mock = mocks[x];
      loader.addComponentType(mock,emptyMock);
    }
  }


  let mockType = document.createElement('input');
  let createButton = document.createElement('button');
  createButton.innerText = "Create Mock Component";
  createButton.onclick = createMock
  this.UI.appendChild(mockType);
  this.UI.appendChild(createButton);

  return this;
}
