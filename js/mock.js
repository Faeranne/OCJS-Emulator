let MOCKPlugin = function(newLoader){
  this.loader = newLoader;
  this.UI = document.createElement('div');
  this.Width = 3;
  this.Height = 1;


  let emptyMock = function(newLoader){
    this.loader = newLoader;
    this.address = ""
    this.UI = document.createElement('div');
    this.methods = {};
		this.Width = 2;
		this.Height = 4;

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

  let createMockButton = function(){
    let name = mockType.value;
    createMock(name);
  }
  let createMock = function(name){
    if(existingMocks.indexOf(name)<0){
      existingMocks.push(name);
      loader.addComponentType(name,emptyMock);
    }
  }
  
  let existingMocks = [];

  this.getConfig = function(){
    return JSON.stringify(existingMocks);
  }
  this.setConfig = function(content){
    let mocks = JSON.parse(content);
    console.log("Loading Mocks: ",mocks);
    for(var x in mocks){
      name = mocks[x];
      createMock(name);
    }
  }


  let mockType = document.createElement('input');
  let createButton = document.createElement('button');
  createButton.innerText = "Create Mock Component";
  createButton.onclick = createMockButton;
  this.UI.appendChild(mockType);
  this.UI.appendChild(createButton);

  return this;
}
