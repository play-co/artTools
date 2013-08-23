#target Illustrator
#targetengine main

//===[ REF ]============================
var ver = '2.0'
var doc = app.activeDocument;

//===[ MAIN MENU ]============================

var toolboxWindow = new Window('palette', 'GC ToolBox');
var screwdriverWindow = new Window('palette', 'ScrewDriver');
var wirecutterWindow = new Window('palette', 'WireCutter');

launchToolBox();

var logText;
var currentTool;
var autoSave = false;

function launchToolBox(){
	var toolPanel = toolboxWindow.add('panel', undefined, 'Tools:');

	var wireBtn = toolPanel.add('button', undefined, 'WireCutter');
	wireBtn.onClick = function(){
		bridgeMessage(launchWireCutter);
	};

	var screwBtn = toolPanel.add('button', undefined, 'ScrewDriver');
	screwBtn.onClick = function(){
		bridgeMessage(launchScrewDriver);
	};

	var saveCheck = toolboxWindow.add('checkbox', undefined, 'AutoSave after each Tool');
	saveCheck.onClick = function(){
		autoSave = saveCheck.value;
	};

	logText = toolboxWindow.add('statictext', undefined, 'Starting up ToolBox v'+ver+'...', {multiline: true, scrolling: true});
	logText.size = [200, 200];

	var quitBtn = toolboxWindow.add('button', undefined, 'QUIT');
	quitBtn.onClick = function(){
		bridgeMessage(shutDown);
	};

	toolboxWindow.show();
}

function shutDown(){
	toolboxWindow.close();
	screwdriverWindow.close();
	wirecutterWindow.close();
}

function log(_str){
	logText.text = logText.text + '\n' + _str;
}

function logObj(obj){
	log(' -'+obj+'{');
	for (k in obj){
		log('   '+k+': '+obj[k].toFixed(2));
	}
	log('  }');
}

function getItemName(_item){
	if(_item.name){
		return '['+_item.name+']';
	}else if(_item.typename == 'SymbolItem'){
    	return '['+_item.symbol.name+']';
	}else{
		return '[Unnamed '+_item.typename+']';
	}
}

function selectionError(_amount, _typename){
	alert('Incompatible Selection\nYou must have '+_amount+' ['+_typename+'](s) selected for this tool.');
}

function autoSaveNow(){
	if(autoSave){
		log('AUTOSAVING...');
		//save current doc to a recover file
		var currentDoc = app.activeDocument;
		//var file = currentDoc.path;
		//log(' -'+currentDoc.path.fullName);
		//log(' -'+currentDoc.name);
		//var file = new File(currentDoc.path.fullName+'/RECOVER_'+currentDoc.name);
		//currentDoc.saveAs(file);
		currentDoc.save();
		//log(' -Recovery file saved: '+file);
	}
}


















//===[ SCREWDRIVER ]============================

function launchScrewDriver(){
	var selctPanel = screwdriverWindow.add('panel', undefined, 'Selection Tools:');

	var balanceBtn = selctPanel.add('button', undefined, 'Add Geometry Balance');
	balanceBtn.onClick = function(){
		bridgeMessage(balanceSelected);
	};

	/*
	var sliceBtn = selctPanel.add('button', undefined, 'Add 9-Slice Margins');
	sliceBtn.onClick = function(){
		bridgeMessage(sliceSelected);
	};
	*/

	var quitBtn = screwdriverWindow.add('button', undefined, 'CLOSE');
	quitBtn.onClick = function(){
		screwdriverWindow.close();
		toolboxWindow.show();
	};

	screwdriverWindow.show();
}

var selection = [];
var postSelection = [];

function balanceSelected(){
	log('');
	log('EXECUTING: Add Geometry Balance');
	selection = doc.selection.slice(0);
	postSelection = [];

	if(selection.length > 0){
		
		for(var i=0; i<selection.length; i++){
			var item = selection[i];

			//get balanced bounds
			var balRect = getBalancedBounds(item);

			if(compareBounds(item.visibleBounds, balRect)){
				//this item doesn't need padding, skip
				log(' -Skipping: '+getItemName(item));
				postSelection.push(item);
			}else{
				//group item
				var grp = doc.groupItems.add();
				grp.name = item.name + ' <Wrapping Group>';

				item.move(grp, ElementPlacement.INSIDE);

				//create invisible path
				var balPath = doc.pathItems.rectangle(balRect[1], balRect[0], balRect[2]-balRect[0], balRect[1]-balRect[3]);
				balPath.stroked = false;
				balPath.opacity = 0;
				balPath.name = '<Generated Path>';

				//add path to group; put behind everything
				balPath.move(grp, ElementPlacement.PLACEATEND);

				//flag for selection
				postSelection.push(grp);
			}
		}

		doc.selection = postSelection;
		log('COMPLETED');
		autoSaveNow();
	}else{
		selectionError('at least 1', 'PageItem');
	}
}

function getBalancedBounds(_item){
  var visRect = _item.visibleBounds;
  var geoRect = _item.geometricBounds;

  var mt = visRect[1] - geoRect[1];
  var mb = visRect[3] - geoRect[3];
  var ml = visRect[0] - geoRect[0];
  var mr = visRect[2] - geoRect[2];

  var marginVert = chooseBigger(mt, mb);
  var marginHorz = chooseBigger(ml, mr);

  var padRect = [geoRect[0]-marginHorz, geoRect[1]+marginVert, geoRect[2]+marginHorz, geoRect[3]-marginVert];

  return padRect;
}

function chooseBigger(value1, value2){
  if(Math.abs(value1) > Math.abs(value2)){
    return Math.abs(value1);
  }else{
   return Math.abs(value2);
  }
}

function compareBounds(_b1, _b2){
	var same = true;
	for(i in _b1){
		if(_b1[i] != _b2[i]){
			same = false;
			break;
		}
	}
	return same;
}

function sliceSelected(){
	if(selection.length > 0){
		log('');
		log('EXECUTING: Add 9-Slice Info');
		selection = doc.selection.slice(0);

		for(var i=0; i<selection.length; i++){
			var item = selection[i];

			var w = new Window('dialog', 'Adjust 9-Slices');
			var topSlide = w.add('scrollbar', undefined, 33, 0, 100); 
			var botSlide = w.add('slider', undefined, 66, 0, 100); 
			var leftSlide = w.add('slider', undefined, 33, 0, 100); 
			var rightSlide = w.add('slider', undefined, 66, 0, 100); 

			var g = w.add('group');
			var okBtn = g.add('button', undefined, 'OK');
			var cancelBtn = g.add('button', undefined, 'Cancel');

			w.show();


		}
	}else{
		selectionError('at least 1', 'PageItem');
	}
}















//===[ WIRECUTTER ]============================

var tempDoc;
var exportArr = [];
var rootDir;
var selectionArr = [];
var exportBounds;
var exportList = [];

var options = {
	subDir: true,
	omitBangs: true,
	shareDim: false
};

function launchWireCutter(){

	var toolPanel = wirecutterWindow.add('panel', undefined, 'Tools:');
	var libPanel = toolPanel.add('panel', undefined, 'Symbol Library:');
	var selPanel = toolPanel.add('panel', undefined, 'Selection');

	var batchLibBtn = libPanel.add('button', undefined, 'Library Batch Export');
	batchLibBtn.onClick = function(){
		bridgeMessage(libraryExport);
	};
	var batchSelBtn = selPanel.add('button', undefined, 'Selection Batch Export');
	batchSelBtn.onClick = function(){
		bridgeMessage(exportSelected);
	}
	var textSwapBtn = selPanel.add('button', undefined, 'Text-Swap Batch Export');
	textSwapBtn.onClick = function(){
		bridgeMessage(textExport);
	}
	var iconizerBtn = selPanel.add('button', undefined, 'App Icon Export');
	iconizerBtn.onClick = function(){
		bridgeMessage(iconExport);
	}

	var subDirCheck = toolPanel.add('checkbox', undefined, 'Create subdirectories from underscores');
	subDirCheck.value = options.subDir;
	subDirCheck.onClick = function(){
		options.subDir = subDirCheck.value;
	};
	var omitCheck = toolPanel.add('checkbox', undefined, 'Omit names beginning with !');
	omitCheck.value = options.omitBangs;
	omitCheck.onClick = function(){
		options.omitBangs = omitCheck.value;
	};
	var shareDimCheck = selPanel.add('checkbox', undefined, 'Export with shared dimensions');
	shareDimCheck.value = options.shareDim;
	shareDimCheck.onClick = function(){
		options.shareDim = shareDimCheck.value;
	};


	var quitBtn = wirecutterWindow.add('button', undefined, 'CLOSE');
	quitBtn.onClick = function(){
		wirecutterWindow.close();
		toolboxWindow.show();
	};

	wirecutterWindow.show();
}

function createTempDoc(){
  tempDoc = app.documents.add(DocumentColorSpace.RGB);
};

function removeTempDoc(){
	tempDoc.close(SaveOptions.DONOTSAVECHANGES);
}

function postExport(){
  doc.selection = selectionArr.slice(0);
  redraw();

  log('COMPLETED');
  log('Exported '+exportList.length+' assets to '+rootDir);

  app.beep();

  autoSaveNow();

  exportList = [];
};

function selectFolder(){
  var directory = Folder(doc.filePath).selectDlg("Select the root directory to export images to: \n(Subdirectories will be created automatically)");
  return directory;
}

var hiddenItems;

function hideAll(targDoc){
	hiddenItems = [];
	for (var i=0; i < targDoc.pageItems.length; i++){
		var item = targDoc.pageItems[i];
		log(' -hiding: '+item);
		if(item.isIsolated){
			alert(item + 'is isolated');
			item.isIsolated = false;
		}
		if(!item.hidden){
			try{
				item.hidden = true;
				hiddenItems.push(item);
			}catch(e){
				log(e);
			}
		}
	}
	redraw();
}

function unhideAll(){
  for(var i=0; i < hiddenItems.length; i++){
    item = hiddenItems[i];
    unhideThis(item);
  }
  hiddenItems = [];
}

function unhideThis(_item){
	//unhide children
	for(var i=0; i < _item.pageItems.length; i++){
		var child = _item.pageItems[i];
		//this might be dumb:
		//if(hiddenItems.indexOf(child) >= 0){
			child.hidden = false;
			log(' -unhiding child: '+child);
		//}
	}
	//unhide parents
	do{
		try{
			_item.hidden = false;
		}catch(e){
			//log(e);
		}
		try{
			_item = _item.parent;
		}catch(e){
			//log(e);
		}
	}while(_item);
}



function libraryExport(){
  log('');
  log('EXECUTING: Library Batch Export');
  doc = app.activeDocument;
  rootDir = selectFolder();
  if(rootDir){
  	selectionArr = doc.selection.slice(0);
	//hideAll();
	createTempDoc();
	for(var i=0; i < doc.symbols.length; i++){
		
		doc.activate();
		var symbol = doc.symbols[i];
		var item = doc.symbolItems.add(symbol);
		doc.selection = [item];
		app.copy();
		
		tempDoc.activate();
		app.paste();
		exportItem(item, '');
		app.cut();

		doc.activate();
		item.remove();
	}
	removeTempDoc();
	postExport();
  }
}

///klsdjghdksfhgovygnlusyhcnsvlgkn.jdhclnvdcfunvdcfuhvrilnh sdrligunrso;ifjdlzjgl;arijv.


function exportSelected(){
	log('');
	log('EXECUTING: Selection Batch Export');
	doc = app.activeDocument;
	exportArr = doc.selection.slice(0);
	if(exportArr.length == 0){
		//nothing selected
		selectionError('at least 1', 'PageItem');
	}else{
		rootDir = selectFolder();
		if(rootDir){
			//save selection bounds
			if(options.shareDim){
				exportBounds = exportArr[0].visibleBounds;
				for(var i=1; i<exportArr.length; i++){
					exportBounds = combineBounds(exportBounds, exportArr[i].visibleBounds);
				}
			}
			renderFromTempDoc(exportArr);

			postExport();
		}
	}
}

function renderFromTempDoc(itemArr){
	createTempDoc();
	for(var i=0; i < itemArr.length; i++){
		var item = itemArr[i];

		doc.activate();
		doc.selection = [item];
		app.copy();
		tempDoc.activate();
		app.paste();

		exportItem(item, '');

		app.cut();
	}
	removeTempDoc();
}

function copyToTemp(item){
	doc.activate();
	doc.selection = [item];
	app.copy();
	pasteToTemp();
}

function pasteToTemp(){
	if(!tempDoc){
		createTempDoc();
	}
	tempDoc.activate();
	app.paste();
}



var copySource = '0 1 2 3 4 5 6 7 8 9 ! ? , . : + - x % MAX';

function textExport(){
	log('');
	log('EXECUTING: Text-Swap Batch Export');
	doc = app.activeDocument;
	if(doc.selection.length != 1){
		selectionError('exaclty 1', 'PageItem');
		//needs 1 thing selected
	}else{
		var item = doc.selection[0];
		
		//group object if not a group
		if(item.typename != 'GroupItem'){
			var itemGrp = doc.groupItems.add();
			item.move(itemGrp,  ElementPlacement.INSIDE);
			item = itemGrp;
		}

		var fileName = determineFilename(item);
		var w = new Window('dialog', 'Enter Copy');
		w.add('statictext', undefined, 'Enter the text you wish to export with, delimited by whitespace.');
		var editText = w.add('edittext', undefined, copySource);
		editText.preferredSize = [300, 25];
		var okBtn = w.add('button', undefined, 'OK');
		okBtn.onClick = function(){
			copySource = editText.text;
			w.close(1);
		};
		//show
		if(w.show() == 1){
			rootDir = selectFolder();
			if(rootDir){
				var copyArr = copySource.split(' ');
				


				createTempDoc();
				copyToTemp(item);
				var masterClone = tempDoc.selection[0];

				var maxBounds = masterClone.visibleBounds;

				//make clones
				var cloneArr = [];
				for(var i=0; i<copyArr.length; i++){
					try{
						var clone = masterClone.duplicate();
						cloneArr.push(clone);
						var textArr = clone.textFrames;

						//alter text
						for(var j=0; j<textArr.length; j++){
						  var textFrame = textArr[j];
						  textFrame.contents = copyArr[i];
						}
						maxBounds = combineBounds(maxBounds, clone.visibleBounds);
					}catch(e){
						log(e);
					}
				}
				masterClone.remove();

				hideAll(tempDoc);

				exportBounds = maxBounds;

				//export each & delete clone
				for(i=0; i<cloneArr.length; i++){
					clone = cloneArr[i];
					unhideThis(clone);
					exportItem(clone, '_'+copyArr[i]);
					clone.remove();
				}
				//unhideAll();
				removeTempDoc();
				postExport();
			}
		}
	}
}

var customIconStr = '1024';

function iconExport(){
	log('');
	log('EXECUTING: App Icon Export');
	doc = app.activeDocument;
	if(doc.selection.length != 1){
		selectionError('exaclty 1', 'PageItem');
		//needs 1 thing selected
	}else{
		var item = doc.selection[0];
		var fileName = determineFilename(item);
		var w = new Window('dialog', 'Choose Sizes');
		var grp = w.add('group');
		var andPanel = grp.add('panel', undefined, 'Standard Sizes:');
		//var iosPanel = grp.add('panel', undefined, 'iOS:');
		
		var sizeArr = [36, 48, 57, 72, 96, 114, 144, 512];
		var checkArr = createCheckbox(andPanel, sizeArr);

		w.add('statictext', undefined, 'Additional sizes, delimited by whitespace:');
		var editText = w.add('edittext', undefined, customIconStr);
		editText.preferredSize = [150, 25];

		var okBtn = w.add('button', undefined, 'OK');
		okBtn.onClick = function(){
			w.close(1);
		};
		//show
		if(w.show() == 1){
			rootDir = selectFolder();
			if(rootDir){
				createTempDoc();

				copyToTemp(item);
				item = tempDoc.selection[0];
				//hideAll();
				//unhideThis(item);
				var origRect = arrayToRect(item.visibleBounds);
				//checklist sizes
				for(var i=0; i<checkArr.length; i++){
					var check = checkArr[i];
					if(check.value){
						//var size = sizeArr[i];
						resizeIcon(item, sizeArr[i]);
					}
				}
				//custom sizes
				customIconStr = editText.text;
				var custArr = customIconStr.split(' ');
				for(i in custArr){
					resizeIcon(item, custArr[i]);
				}

				//restore origional size
				var currRect = arrayToRect(item.visibleBounds);
				scaleX = origRect.width/currRect.width * 100;
				scaleY = origRect.height/currRect.height * 100;
				item.resize(scaleX, scaleY);

				//unhideAll();
				removeTempDoc();
				postExport();
			}
		}
	}
}

function resizeIcon(item, size){
	log(' -Creating '+size+' x '+size+' icon');
	//resize
	var currWidth = Math.abs(item.visibleBounds[2] - item.visibleBounds[0]);
	var currHieght = Math.abs(item.visibleBounds[3] - item.visibleBounds[1]);
	var scaleX = size/currWidth * 100;
	var scaleY = size/currHieght * 100;
	item.resize(scaleX, scaleY);
	//logObj(arrayToRect(item.visibleBounds));
	//align to pixel grid
	pixelAlign(item);
	//logObj(arrayToRect(item.visibleBounds));
	//save
	exportItem(item, '_'+size);
}

function arrayToRect(rectArr){
	var rectObj = {
		x: rectArr[0],
		y: 0 - rectArr[1],
		width: rectArr[2] - rectArr[0],
		height: rectArr[1] - rectArr[3]
	};
	return rectObj;
}

function pixelAlign(item){
	var offsetX = ~~(item.visibleBounds[0]) - (item.visibleBounds[0]);
	var offsetY = ~~(item.visibleBounds[1]) - (item.visibleBounds[1]);
	item.translate(offsetX, offsetY);
	//log(' -offset '+offsetX+' '+offsetY);
}

function createCheckbox(parent, numArr){
	var checkArr = [];
	for(var i=0; i<numArr.length; i++){
		var num = numArr[i];
		var check = parent.add('checkbox', undefined, num + " x "+ num, {alignment:'left', value:true, name:num});
		check.value = true;
		checkArr.push(check);
	}
	return checkArr;
}

function determineFilename(_item){
	//determine name
	var fileName = _item.typename;
	if(_item.typename=='SymbolItem'){
		fileName = _item.symbol.name;
	}else if(_item.name){
		fileName = _item.name;
	}else{
		redraw();
		fileName = prompt('Enter a name for this unnamed '+_item.typename+': \n(This will rename the origional for future exports)', fileName);
		//rename origional
		_item.name = fileName;
	}
	return fileName;
}

function exportItem(_item, _suffix){
  //unhide groupItems
  
  /*if(_item.typename == 'GroupItem'){
    //make all children visible; hiding the group earlier causes all children to become hidden for some reason
    for(var i=0; i<_item.pageItems.length; i++){
      _item.pageItems[i].hidden = false;
    }
  }*/

  //determine name
  var fileName = determineFilename(_item);

  fileName = fileName + _suffix;

  //fix special characters
  fileName = fileName.replace(/\./g, 'period');
  fileName = fileName.replace(/\:/g, 'colon');
  fileName = fileName.replace(/\%/g, 'percent');
  fileName = fileName.replace(/\?/g, 'query');
  fileName = fileName.replace(/\//g, '_');

  //check for omit character
  if(options.omitBangs && fileName.slice(0,1) == "!"){
    //skip this one
  }else{

    //determine bounds
    var exportRect = _item.visibleBounds;
    if(options.shareDim && currentTool != 'iconExport'){
      exportRect = exportBounds;
    }

    //determine file path
    var exportPath = new File( rootDir + '/' + fileName + '.png' );
    if(options.subDir){
      exportPath = parseFilename(rootDir, fileName);
    }
    
    //export image
    log( ' -Exporting: '+fileName);
    if(options.shareDim){
      tempDoc.imageCapture(exportPath, exportRect, captureSettings());
    }else{
      tempDoc.exportFile(exportPath, ExportType.PNG24);
    }
    exportList.push(fileName);
  }
}

function captureSettings(){
  var capSet = new ImageCaptureOptions;
  capSet.antiAliasing=true;
  capSet.resolution=72;
  capSet.transparency=true;
  return capSet;
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
  var destFile = new File( _dir + '/' + _name  + '.png' ); 
  return destFile;
}

function combineBounds(_rect1, _rect2){
  var rect3 = _rect1;
  if(_rect2[0] < rect3[0]){
    rect3[0] = _rect2[0];
  }
  if(_rect2[1] > rect3[1]){
    rect3[1] = _rect2[1];
  }
  if(_rect2[2] > rect3[2]){
    rect3[2] = _rect2[2];
  }
  if(_rect2[3] < rect3[3]){
    rect3[3] = _rect2[3];
  }
  return rect3;
}



















//===[ BRIDGETALK MESSAGING ]============================
//     (for palette windows)

function bridgeMessage(_func) {
	var b = new BridgeTalk;
	b.target = "illustrator";
	b.body = _func.toString() + '\n' + _func.name + '();';
	b.onError = bridgeErrorHandler;
	b.send();

	currentTool = _func.name;
}

function bridgeMessageArgs(_func, _args) {
	var b = new BridgeTalk;
	b.target = "illustrator";
	b.body = _func.toString() + '\n' + _func.name + '('+_args.toSource()+');';
	b.onError = bridgeErrorHandler;
	b.send();
}

function bridgeErrorHandler(a) {
    alert(a.body + "(" + a.headers["Error-Code"] + ")");
}
