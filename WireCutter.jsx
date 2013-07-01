#target Illustrator
#targetengine main

var myDocument = app.activeDocument;
var symbolCount = myDocument.symbols.length;
var tempDoc;
var exportArr;
var rootDir;
var exportCount = 0;
var selectionArr;

var deep = true;
var pad = false;
var omit = true;

mainMenu();

function mainMenu(){
  exportCount = 0;
  selectionArr = myDocument.selection.slice(0);

  var mainWindow = new Window('dialog', 'WireCutter 2.1');

  mainWindow.add('statictext', undefined, 'Hover over any control for details.');

  mainWindow.toolPanel = mainWindow.add('panel', undefined, 'Tools:'); 

  var batchBtn = mainWindow.toolPanel.add('button', undefined, 'Export all Library Symbols'); 
  batchBtn.onClick = function () { 
    setOpts(deepCheck.value, balanceCheck.value, omitCheck.value);
    mainWindow.close(1); 
    libraryExport();
    postExport();
  };
  batchBtn.helpTip = 'Exports all Symbols in the Library at their default size.';

  var selectionBtn = mainWindow.toolPanel.add('button', undefined, 'Export Selected Items');
  selectionBtn.onClick = function () { 
    setOpts(deepCheck.value, balanceCheck.value, omitCheck.value);
    mainWindow.close(3); 
    exportSelected();
    postExport();
  };
  selectionBtn.helpTip = 'Exports all selected Items. Must have 1 or more items selected to use.';
  selectionBtn.enabled = (myDocument.selection.length > 0);

  var optPanel = mainWindow.add('panel', undefined, 'Options:');
  optPanel.alignChildren = ['left', 'top'];

  var deepCheck = optPanel.add('checkbox', undefined, 'Create Subdirectories from Underscores');
  deepCheck.value = deep;
  deepCheck.helpTip = 'If checked, exported items will create subirectories from any underscores in their name. (Example: ui_button_green becomes ui\/button\/green.png)';

  var omitCheck = optPanel.add('checkbox', undefined, 'Omit Items starting with \"!\"');
  omitCheck.value = omit;
  omitCheck.helpTip = 'If checked, no items whose name starts with \"!\" will be exported.';

  var balanceCheck = optPanel.add('checkbox', undefined, 'Export with Balanced Padding');
  balanceCheck.value = pad;
  balanceCheck.helpTip = 'If checked, assets will be exported with alpha padding so their geometric bounds are centred.';

  var quitBtn = mainWindow.add('button', undefined, 'QUIT')
  quitBtn.onClick = function () { 
    mainWindow.close(0); 
  };

  var choice = mainWindow.show();
};

function setOpts(_deep, _pad, _omit){
  deep = _deep;
  pad = _pad;
  omit = _omit;
}

function postExport(){
  myDocument.selection = selectionArr.slice(0);
  redraw();

  app.beep();
  alert('Export Complete \nExported '+exportCount+' assets to '+rootDir+'. \nEnjoy.');

  mainMenu();
};

function libraryExport(){
  rootDir = selectFolder();

  for(var i=0; i < myDocument.symbols.length; i++){

    var symbol = myDocument.symbols[i];

    myDocument.activate();
    myDocument.selection = null;
    var item = myDocument.symbolItems.add(symbol);

    item.selected = true;
    app.cut();

    exportCopied();
  }

}

function exportSelected(){
  rootDir = selectFolder();
  exportArr = myDocument.selection.slice(0);
  for(var i=0; i < exportArr.length; i++){
    var item = exportArr[i];

    myDocument.activate();
    myDocument.selection = null;
    item.selected = true;
    app.copy();

    exportCopied();
  }
};

function exportCopied(){
  createTempDoc();
  tempDoc.activate();
  app.paste();
  var pastedObj =  tempDoc.selection[0];

  //determine name
  var fileName = pastedObj.typename;
  if(pastedObj.typename=='SymbolItem'){
    fileName = pastedObj.symbol.name;
    if(pastedObj.sliced){
      alert('this is a sliced item');
    }
  }else if(pastedObj.name){
    fileName = pastedObj.name;
  }else{
    redraw();
    fileName = prompt('Enter a name for this unnamed '+pastedObj.typename+': \n(This will rename the origional for future exports)', fileName);
    //rename origional
    myDocument.activate();
    var orig = myDocument.selection[0];
    orig.name = fileName;
    tempDoc.activate();
  }

  //check for omit character
  if(omit && fileName.slice(0,1) == "!"){
    //skip this one
  }else{

    //determine bounds
    var exportRect = pastedObj.visibleBounds;
    if(pad){
      exportRect = getCentrePadRect(pastedObj);
    }

    //determine file path
    var exportPath = new File( rootDir + '/' + fileName + '.png' );
    if(deep){
      exportPath = parseFilename(rootDir, fileName);
    }
    
    //export image
    if(pad){
      tempDoc.imageCapture(exportPath, exportRect, captureSettings());
    }else{
      tempDoc.exportFile(exportPath, ExportType.PNG24);
    }
    exportCount++;

  }

  tempDoc.close(SaveOptions.DONOTSAVECHANGES);  
};

function getCentrePadRect(_item){
  var visRect = _item.visibleBounds;
  var geoRect = _item.geometricBounds;

  var mt = visRect[1] - geoRect[1];
  var mb = visRect[3] - geoRect[3];
  var ml = visRect[0] - geoRect[0];
  var mr = visRect[2] - geoRect[2];

  var marginVert = magnitude(mt, mb);
  var marginHorz = magnitude(ml, mr);

  var padRect = [geoRect[0]-marginHorz, geoRect[1]+marginVert, geoRect[2]+marginHorz, geoRect[3]-marginVert];

  return padRect;
}

function parseFilename(_dir, _name){
  //PARSE NAME
  while(_name.indexOf("_") > -1){
    var breakIndex = _name.indexOf("_");
    var prefix = _name.slice(0, breakIndex);
    _name = _name.slice(breakIndex+1);
    
    //alert(breakIndex + " - " + prefix);
    var subFolder = new Folder(_dir + '/' + prefix);
    subFolder.create();
    _dir = subFolder;

  }
  var destFile = new File( _dir + '/' + _name + '.png' ); 
  return destFile;
}

function magnitude(value1, value2){
  if(Math.abs(value1) > Math.abs(value2)){
    return Math.abs(value1);
  }else{
   return Math.abs(value2);
  }
}

function createTempDoc(){
  tempDoc = app.documents.add(DocumentColorSpace.RGB);
};

function selectFolder(){
  var directory = Folder(myDocument.filePath).selectDlg("Select the root directory to export images to: \n(Subdirectories will be created automatically)");
  return directory;
}

function captureSettings(){
  var capSet = new ImageCaptureOptions;
  capSet.antiAliasing=true;
  capSet.resolution=72;
  capSet.transparency=true;
  return capSet;
}
