// Cardolini.js version beta 0.81


//============= Init canvas fabric ====================//
		var fntB = false; // Font Style Bold
		var fntI = false; // Font Style Italic
		var shapeS = false;	
		var imgBgrnd = false; // Set Background Inage 
		var bgFill = false; // Set Background Fill color
		var nmUploadF = ''; // Name upload file name
		var copiedObjects = new Array(); // Array objects in group copied object
		var copiedObject = null; // Copied object
		var on_off_panel = false; // Switch side panel with background images
		var on_off_panel2 = false; // Switch side panel with design object
		var currcol = "#00f"; // Set defaul color
		var wPaper = 210;
		var hPaper = 297;
		var flipCanvas = false;
		var wCmm = 0;
		var hCmm = 0;
		var editormode = true;
		
		
		
		// ================= Create NEW canvas object ========================== //
        var canvas = new fabric.Canvas('canvas');
		fabric.Object.prototype.transparentCorners = false;
		canvas.controlsAboveOverlay = true;

		// ==================  Set size Background Rectangle in pixel ======================== //
		var bgRect = new fabric.Rect({
            top : 0,
            left : 0,
            width : widthCanvas,
            height : heightCanvas,
			selectable: false,
            fill : 'rgb(250,250,250)'
        });		
		
		// ==================  Set clipping Background Rectangle ======================== //
			var bgRectClip = new fabric.Rect({
            top : 13,
            left : 13,
            width : widthCanvas-26,
            height : heightCanvas-26,
            fill : 'rgb(255,255,255)'
        });	

		// ============= Load Settings fropm JSON ======================================= //
		var loadJSON = null;
		console.log( "name product ====> "+  getNameproduct);
		var jqxhr = $.getJSON( "../setting.json", function(ldt) {
			loadJSON = ldt;
			$.each( ldt.Nameproduct,  function( key, val ) {				
				if (key  == getNameproduct) {
				loadJSON = val;
				console.log( "KEY = "+ key + "  |  VAL = " + loadJSON.BG[0].chapter);
				Reset();
				}
				
				//items.push( "<li id='" + key + "'>" + val + "</li>" );
			});
			//console.log( "success and = "+ loadJSON);
		})
		.done(function(data) {
			
			//console.log( "second success" );
			//console.log('loaded data= ' + data.bcard.BG[1].path);
		})
		.fail(function() {
			console.log( "error" );
		})
		.always(function() {
			//console.log( "complete" );
		});
 
		// Perform other work here ...
 
		// Set another completion function for the request above
		//console.log('loaded data INNER= ' + loadJSON.bcard.BG[0].chapter);


		// ================== Set Backround Image from "urlImg" ========================= //
		function setBgImg (urlImg)		{
			//console.log('set bg image! bg  fill = '+bgFill);
			canvas.remove(bgRect);
			$("#colorbgrnd").css({display: 'none'});		
			var imgbg = new Image()
			imgbg.src = urlImg;
			var bgImg = canvas.setBackgroundImage(imgbg.src, canvas.renderAll.bind(canvas), {
				width: widthCanvas,
				height: heightCanvas,
				originX: 'left',
				originY: 'top',
				left: 0,
				top: 0
			});		


		}

		//============= Set background without image ========================= //

		function setWOBgImg (){
			$("#colorbgrnd").css({display: 'block'});
			//canvas.add(bgRect).sendToBack(bgRect);	
			canvas.setBackgroundImage(null);
			//console.log('clear bg image! bg  fill = '+newRectBg.fill);	
			canvas.renderAll();
	
		}

	
		function ajax_download(url, data) {
			var $iframe,
				iframe_doc,
				iframe_html;

			if (($iframe = $('#download_iframe')).length === 0) {
				$iframe = $("<iframe id='download_iframe'" +
                    " style='display: none' src='about:blank'></iframe>"
                   ).appendTo("body");
			}

			iframe_doc = $iframe[0].contentWindow || $iframe[0].contentDocument;
			
			if (iframe_doc.document) {
				iframe_doc = iframe_doc.document;
			}

			iframe_html = "<html><head></head><body><form method='POST' action='" +
                  url +"'>" 


			iframe_html += "<input type='hidden' name='data' value='"+data+"'>";

			iframe_html +="</form></body></html>";

			iframe_doc.open();
			iframe_doc.write(iframe_html);
			$(iframe_doc).find('form').submit();
		}  



		// ============== Save As SVG =========================== //
		function saveSVG(){
			var blob = new Blob([canvas.toSVG()], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "download.svg");

		}	

		// ============ Add New Rectangle to canvas =================== //
		function addRect(){
			var newRect = new fabric.Rect({
            top : 70,
            left : 100,
            width : 200,
            height : 200,
            fill : 'rgb(200,200,200)'
			});
			canvas.add(newRect).setActiveObject(newRect);
			selectObjParam();
			canvas.renderAll();
	
		}	

		//==================== Add new Circle to canvas ==========================//	
	
		function addCircle(){
			var newCirc = new fabric.Circle({
			top: 100, 
			left: 100, 
			radius: 75,			
            fill : 'rgb(200,200,200)'
			});	
			canvas.add(newCirc).setActiveObject(newCirc);
			selectObjParam();
			canvas.renderAll();		

		}

		//=========================Add new Text to bcard =======================//
	
		function addText(){
			var newTextadd = new fabric.Text('Текст можно редактировать двойным кликом', { fontFamily: 'Ubuntu', left: 100, top: 150, fontSize: 24, fontStyle: "normal", fontWeight: "normal", lineHeight: "1"});	
			canvas.add(newTextadd).setActiveObject(newTextadd);
			selectObjParam();
			canvas.renderAll();
		}


		//====================== Deleted selected Object (group Objects) ========================//
	
		function deleteObj() {

			if (canvas.getActiveObject()) {
				var selectOb = canvas.getActiveObject();	
				canvas.remove(selectOb);	
			}
	
	
			if (canvas.getActiveGroup()) {
				canvas.getActiveGroup().forEachObject(function(a) {
				canvas.remove(a);
				});
				canvas.discardActiveGroup();
			}

			canvas.deactivateAll();			
			hideTools();	
			canvas.renderAll();		

	
		}


		//======================= Copy selected objects ========================//			

		function copyObj2() {

			var obj = canvas.getActiveObject();
			if (!obj) return;
			if (fabric.util.getKlass(obj.type).async) {
				obj.clone(function (clone) {
				clone.set({left: 100, top: 100});
				canvas.add(clone);
			});
			}
			else {
				canvas.add(obj.clone().set({left: 100, top: 100}));
				}
			canvas.discardActiveObject();
			canvas.renderAll();	

		}



		/*Function put down layer select Object*/

		//======================= Copy display ON  Tools button ========================//	

		function onBtn (nameBtn) {
			$('#' + nameBtn).css('display','block');
		}
		
		//======================= Copy display OFF  Tools button ========================//	
		function offBtn (nameBtn) {
			$('#' + nameBtn).css('display','none');
		}

		//======================= Drop down selected object (to ground layer) ========================//	
		function dnObj() {
				var selectOb = canvas.getActiveObject();
				canvas.sendBackwards(selectOb).renderAll();

		}
		
		//======================= Bring down selected object 1 layer ========================//	
		function bringdnObj() {
			var selectOb = canvas.getActiveObject();
			canvas.sendToBack(selectOb).renderAll();

		}	
	
		//======================= Bring up selected object (to front layer) ========================//	

		function upObj() {
			var selectOb = canvas.getActiveObject();
			canvas.bringForward(selectOb).renderAll();	
		}

		//======================= Bring up selected object 1 layer ========================//	

		function bringupObj() {
			var selectOb = canvas.getActiveObject();
			canvas.bringToFront(selectOb).renderAll();	
		}
	
	
		//======================= Set selected text to BOLD ========================//	

		function setFontB () {
			var selectOb = canvas.getActiveObject();
			if (!selectOb) return;
			if (!fntB) {
				selectOb.setFontWeight('bold');	
				$(".btnFntB").css("background-image", "url(../img/buttons/btn-bold-on.png)");
				fntB = true;	
			}
			else {
				selectOb.setFontWeight('normal');
				$(".btnFntB").css("background-image", "url(../img/buttons/btn-bold.png)");
				fntB = false;		
			}
			canvas.renderAll();	
		}	



		//=================== Function set select Text font in Italic==========================//
		function setFontI () {
			var selectOb = canvas.getActiveObject();		
			if (!selectOb) return;
			if (!fntI) {	
				selectOb.setFontStyle('italic');
				$(".btnFntI").css("background-image", "url(../img/buttons/btn-italic-on.png)");
				fntI=true;	
			}
			else {
				selectOb.setFontStyle('normal');		
				$(".btnFntI").css("background-image", "url(../img/buttons/btn-italic.png)");	
				fntI=false;	
			}
				canvas.renderAll();	
		}	


		// ===================== Function clear canvas and put blank b-card ===================== //	
		function Reset(){
			console.log ('select btn = ' + loadJSON.Settings.printJPEG);
			if (loadJSON.Settings.printJPEG) {
				$('#btnSvJPG').css("display","block");			
			}
			else $('#btnSvJPG').css("display","none");			
			
			if (loadJSON.Settings.webJPEG) {
				$('#btnSvWWW').css("display","block");			
			}
			else $('#btnSvWWW').css("display","none");			
			
			if (loadJSON.Settings.printPDF) {
				$('#btnSvPDF').css("display","block");			
			}
			else $('#btnSvPDF').css("display","none");			
			
			
		
			$("#soflow-color-obj > option").removeAttr("selected");		
			$('#soflow-color-obj option[value="'+loadJSON.Object[0].chapter+'"]').attr("selected", true);		
			$('#soflow-color-obj').val(loadJSON.Object[0].chapter); //// ===============!!!!!!!!!!!!!! Worked in FF IE etc. !!!!!!!!!!!!!!!!=====================//
			
			setObjSelect($('#soflow-color-obj'));
		
			$("#soflow-color > option").removeAttr("selected");		
			$('#soflow-color option[value="'+loadJSON.BG[0].chapter+'"]').attr("selected", true);		
			$('#soflow-color').val(loadJSON.BG[0].chapter); //// ===============!!!!!!!!!!!!!! Worked in FF IE etc. !!!!!!!!!!!!!!!!=====================//		
			setTmplSelect ($('#soflow-color')); 
			canvas.clear();	
		
			
			 $.ajax({
				url: loadJSON.shablon,
				success: function (data){  
				canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
				//console.log( "success DATA : " + data);
				
				}
			});
			
				/*canvas.setOverlayImage('../images/bg/base/calendar.png', canvas.renderAll.bind(canvas),{
				width: widthCanvas,
				height: heightCanvas,
				originX: 'left',
				originY: 'top',
				left: 0,
				top: 0
				});*/
				
			hideTools();
	
			canvas.clipTo = function(ctx) {
            bgRectClip.render(ctx);
			};
			getfillGrp('#111');
			canvas.renderAll();	
		}	

	
		// ====================== Function generate PDF page with created b-card ======================== //
		function openPDF() {
			$(".loadfile").css({visibility: 'visible', height: '100px'});
    		$(".savepdf").css({visibility: 'hidden', height: '0px'});		 

			var dataURL = canvas.toDataURL({
				format: 'jpg',
				quality: 1, 
				//multiplier: 1.494
				multiplier: loadJSON.Dimension.zoomkprint
			});

			$.ajax({
				url: "../tcpdf/examples/pdf-gen-jpg.php",
				data: {imageurl:dataURL,widthObj:wCmm,heightObj:hCmm, wPaper: wPaper, hPaper: hPaper, fObj: flipCanvas},
				cache: false,
				dataType: 'json',
				type : 'POST',
				success: function(data) {		
				//console.log('return from PHP = ' +data.result+' file name = '+data.filename);		
			if (data.result) {			
				$(".loadfile").css({visibility: 'hidden', height: '0px'});
				$(".savepdf").css({visibility: 'visible', height: '100px'});
				$("#savepdfbtn").attr({ href: data.filename});
			}
				}
			});

		}
		

		// ====================== Function start save PDF page with created b-card ======================== //
		function saveAsPDF(){
			$('.savepdf').css('visibility','hidden');
			create_jpg_web();	// create JPG file from canvas
			if (widthCanvas < heightCanvas) {			
			flipCanvas = true;
			var wC = heightCanvas;
			var hC = widthCanvas;
			wCmm = height_in_mm;
			hCmm = width_in_mm;
			
			}
			else {
			flipCanvas = false;
			var wC = widthCanvas;
			var hC = heightCanvas;
			wCmm = width_in_mm;
			hCmm = height_in_mm;
			
			}	
			
			openPDF();

		}


		// ====================== ?????????????????????????? ======================== //
		function observeNumeric(property) {
			document.getElementById(property).onchange = function() {
			canvas.getActiveObject()[property] = this.value;
			canvas.renderAll();
			};
		}
		
		// ====================== Function align selected object to left ======================== //
		function alignLeft (){
			var selectedGr = canvas.getActiveGroup();
			if (!selectedGr) return;
			var pointC = new fabric.Point(0,0);
			var deltaX = 0;
			var coordY1 = 0;
			var coordY2 = 0;
			
			i=0;
			selectedGr.forEachObject(function(obj) {
			i++;
			obj.setOriginX('left');
			obj.setOriginY('top');
		
			//console.log( i + ' Point Left = ' + obj.left );
			
			var boundObj = obj.getBoundingRect();
	
			if (i > 1 ){
					pointC.x = obj.left;
					deltaX =  boundObj.left - coordY1;
					//console.log(i + '  DELTA= ' + deltaX);
					pointC.x -= deltaX;	
					pointC.y = obj.top;
					obj.setLeft(pointC.x); 
 
			}
			else {
					coordY1 = boundObj.left;

			}
					//console.log(' LEFT N '+i + ' = ' + boundObj.left + ' LEFT1 = ' + coordY1 );
			});
					canvas.discardActiveGroup();
					selectGrpParam();
					canvas.renderAll();
			}  
			
		// ====================== Function align selected object to right ======================== //
		function alignRight (){
			var selectedGr = canvas.getActiveGroup();
			if (!selectedGr) return;
			var pointC = new fabric.Point(0,0);
			var deltaX = 0;
			var firstObjW = 0;
			var coordY1 = 0;
			var coordY2 = 0;
			i=0;
			selectedGr.forEachObject(function(obj) {
				i++;
				obj.setOriginX('left');
				obj.setOriginY('top');		
				//console.log( i + ' Point Left = ' + obj.left );
				var boundObj = obj.getBoundingRect();
	
				if (i > 1 ){
					pointC.x = obj.left;
					deltaX =  boundObj.left - coordY1;
					//console.log(i + '  DELTA= ' + deltaX);
					pointC.x -= deltaX+boundObj.width-firstObjW;	
					pointC.y = obj.top;
					obj.setLeft(pointC.x); 
 
				}
				else {
					coordY1 = boundObj.left;
					firstObjW = boundObj.width;

				}
					//console.log(' LEFT N '+i + ' = ' + boundObj.left + ' LEFT1 = ' + coordY1 );
			});
				canvas.discardActiveGroup();
				selectGrpParam();
				canvas.renderAll();
		}  

		// ====================== Function align selected object to center of horizontal ======================== //
		function alignHCenter (){
			var selectedGr = canvas.getActiveGroup();
			if (!selectedGr) return;
			var pointC = new fabric.Point(0,0);
			var deltaX = 0;
			var firstObjW = 0;
			var coordY1 = 0;
			var coordY2 = 0;
			i=0;
			
			selectedGr.forEachObject(function(obj) {
				var boundObj = obj.getBoundingRect();
				
				i++;
				obj.setOriginX('left');
				obj.setOriginY('top');		
				console.log( i + ' Point Left = ' + obj.left );
				if (i > 1 ){
					pointC.x = obj.left;
					deltaX =  boundObj.left - coordY1;
					//console.log(i + '  DELTA= ' + deltaX);
					pointC.x -= deltaX+boundObj.width/2-firstObjW/2;	
					pointC.y = obj.top;
					obj.setLeft(pointC.x); 
 
				}
				else {
					coordY1 = boundObj.left;
					firstObjW = boundObj.width;

				}
				//console.log(' LEFT N '+i + ' = ' + boundObj.left + ' LEFT1 = ' + coordY1 );
			});
			canvas.discardActiveGroup();
			selectGrpParam();
			canvas.renderAll();
		}  

		// ====================== Function align selected object to center of vartical ======================== //
		function alignVCenter (){
			var selectedGr = canvas.getActiveGroup();
			if (!selectedGr) return;
			var pointC = new fabric.Point(0,0);
			var deltaY = 0;
			var firstObjH = 0;
			var coordY1 = 0;
			var coordY2 = 0;
			i=0;
			selectedGr.forEachObject(function(obj) {
				i++;
				obj.setOriginX('left');
				obj.setOriginY('top');		
				//console.log( i + ' Point Left = ' + obj.left );
				var boundObj = obj.getBoundingRect();
	
				if (i > 1 ){
					pointC.y = obj.top;
					deltaY =  boundObj.top - coordY1;
					//console.log(i + '  DELTA= ' + deltaY);
					pointC.x = obj.left
					pointC.y -= deltaY+boundObj.height/2-firstObjH/2;	
					obj.setTop(pointC.y); 
 
				}
				else {
					coordY1 = boundObj.top;
					firstObjH = boundObj.height;

				}
				//console.log(' LEFT N '+i + ' = ' + boundObj.left + ' LEFT1 = ' + coordY1 );
			});
			canvas.discardActiveGroup();
			selectGrpParam();
			canvas.renderAll();
		}    
  
		// ====================== Function align selected object to top ======================== //
		function alignTop (){
			var selectedGr = canvas.getActiveGroup();
			if (!selectedGr) return;
			var pointC = new fabric.Point(0,0);
			var deltaY = 0;
			var firstObjH = 0;
			var coordY1 = 0;
			var coordY2 = 0;
			i=0;
			selectedGr.forEachObject(function(obj) {
				i++;
				obj.setOriginX('left');
				obj.setOriginY('top');		
				//console.log( i + ' Point Left = ' + obj.left );
				var boundObj = obj.getBoundingRect();
	
				if (i > 1 ){
					pointC.y = obj.top;
					deltaY =  boundObj.top - coordY1;
					console.log(i + '  DELTA= ' + deltaY);
					pointC.x = obj.left
					pointC.y -= deltaY;	
					obj.setTop(pointC.y); 
 
				}
				else {
					coordY1 = boundObj.top;
					firstObjH = boundObj.height;

				}
				//console.log(' LEFT N '+i + ' = ' + boundObj.left + ' LEFT1 = ' + coordY1 );
			});
			canvas.discardActiveGroup();
			selectGrpParam();
			canvas.renderAll();
		} 
		
		// ====================== Function align selected object to bottom ======================== //
		function alignBottom (){
			var selectedGr = canvas.getSelectionElement();
			if (!selectedGr) return;
			var selectedGr = canvas.getActiveGroup();
			var pointC = new fabric.Point(0,0);
			var deltaY = 0;
			var firstObjH = 0;
			var coordY1 = 0;
			var coordY2 = 0;
			i=0;			
			selectedGr.forEachObject(function(obj) {
				i++;
				obj.setOriginX('left');
				obj.setOriginY('top');		
				//console.log( i + ' Point Left = ' + obj.left );
				var boundObj = obj.getBoundingRect();
	
				if (i > 1 ){
					pointC.y = obj.top;
					deltaY =  boundObj.top - coordY1;
					console.log(i + '  DELTA= ' + deltaY);
					pointC.x = obj.left
					pointC.y -= deltaY+boundObj.height-firstObjH;	
					obj.setTop(pointC.y); 
 
				}
				else {
					coordY1 = boundObj.top;
					firstObjH = boundObj.height;

				}				
			});
		
			canvas.deactivateAllWithDispatch();
			selectGrpParam();
			canvas.renderAll();
		} 


		// ====================== Function GET parameters from selected objects (group)======================== //
		function selectGrpParam(options)  {
			var fillColGrp = '';
			if (!canvas.getActiveGroup()){	
				console.log('None select= ');
				console.log('Bground img = ' + canvas.backgroundImage);
				if (canvas.backgroundImage == null){
					hideTools();
					canvas.renderAll();
				}
			else hideTools();
			}
			else {
				console.log('Selected = ' + canvas.selection);	
				showAllBtn(false);	
				offBtn ('btnUp');
				offBtn ('btnDn');
				offBtn ('btnFlipH');
				offBtn ('btnFlipV');
				i = 0;
				compare = true;
				var selectOb = canvas.getActiveGroup().forEachObject(function(obj){
				i++;
					if (i > 1) {
						if (fillColGrp != obj.getFill()) compare = false;
					}
					else {
						fillColGrp = obj.getFill();
					}		
			
				});	
		
			var selectObj=canvas.getActiveGroup();
			var currcol = fillColGrp;
				if (compare) getfillGrp(fillColGrp);
				else getfillGrp('#111');
		
			}	
	
		}
		// ====================== Function GET parameters from selected object ======================== //
		function selectObjParam(options)  {	
			if (!canvas.getActiveObject()){	
				if (canvas.getActiveGroup()){
					// ========= ???????????????
				}

				console.log('None select= ');
				console.log('Bground img = ' + canvas.backgroundImage);
				if (canvas.backgroundImage == null){
					hideTools();
					canvas.renderAll();
				}
				else {
					hideTools();
				}
		
			}
			else {
				console.log('Selected = ' + canvas.selection);
				var selectObj=canvas.getActiveObject();
				var currcol = selectObj.getFill();
		
				switch(selectObj.type) {
				case 'path-group'  :
					currcol = selectObj.paths[0].getFill();
				break;
				case 'text':
					currcol = selectObj.getFill();
				break;	
				case 'circle':
					currcol = selectObj.getFill();
				break;	
				case 'rect':
					currcol = selectObj.getFill();
				break;				
				}
		
			console.log('color select obj = ' + currcol);		
			showAllBtn (selectObj.isType('text'));		
			getfillObj(currcol);
				if (selectObj.isType('text')) {				
					$('#colorelement').css('display','block');			
					$("#fontFamily > option").removeAttr("selected");					
					$('#fontFamily option[value="'+selectObj.getFontFamily()+'"]').attr("selected", true);
					$('#fontFamily').val(selectObj.getFontFamily()); //// ===============!!!!!!!!!!!!!! Worked in FF IE etc. !!!!!!!!!!!!!!!!=====================//
					canvas.renderAll();					
					console.log( 'Font Family sss= '+selectObj.getFontFamily());
					// ===========  switch button "bold" & "italic" =============== //
					switch(selectObj.getFontStyle()) {
						case 'normal' :
							$(".btnFntI").css("background-image", "url(../img/buttons/btn-italic.png)");
							fntI = false;
						break;
						case 'italic' :
							$(".btnFntI").css("background-image", "url(../img/buttons/btn-italic-on.png)");	
							fntI = true;			
						break;			
					}
					
					switch(selectObj.getFontWeight()) {
						case 'normal' :
							$(".btnFntB").css("background-image", "url(../img/buttons/btn-bold.png)");
							fntB = false;
						break;
						case 'bold' :
							$(".btnFntB").css("background-image", "url(../img/buttons/btn-bold-on.png)");	
							fntB = true;
						break;			
					}		
					
					canvas.renderAll();
				}
				else {
					/*==========*/		
				}
			}	
	
		}
	


		// ============ Load Basic Template images ================  //	
		$( "#soflow-color" ).change(function () {
			setTmplSelect ($(this));
			
		});	
		
		function setTmplSelect(ch) {
		
			for (n=0; n < loadJSON.BG.length; n++) {
				//console.log( 'name part = ' + loadJSON.BG[n].chapter);
				if  (ch.val() == loadJSON.BG[n].chapter)					
					$('.thmbimg'+(n+1)).css('display','block');
				else $('.thmbimg'+(n+1)).css('display','none');			
			}			

		
		
		}



		// ============ Load Objects  ================  //	
		$( "#soflow-color-obj" ).change(function () {
		
			setObjSelect($(this));
		
		});	
		
		function setObjSelect(ch) {
		for (n=0; n < loadJSON.Object.length; n++) {
				//console.log( 'name part = ' + loadJSON.bcard.Object[n].chapter);
				if  (ch.val() == loadJSON.Object[n].chapter)					
					$('.thmbobj'+(n+1)).css('display','block');
				else $('.thmbobj'+(n+1)).css('display','none');
			
			}

		
		
		}


		// ============= Click Select Size Product ======================  //
		$("#selectSize").click(function()	{
			console.log( 'Click SIZE');
			$('.fluid.size-menu').animate({"height": "toggle", "opacity": "toggle"}, "slow");	
		});
	
		// ============ Click button ON/OFF Panel images ================  //	
		$("#btnBg2").bind( "click", function()	{
			console.log( 'Click TAB');
			switch(on_off_panel) {
			case false :
				$('.panel-bg-thempl').animate({"right": "-10px"}, "slow");	
				$('.panel-bg-themp2').animate({"right": "-405px"}, "slow");	
				on_off_panel = true;
			break;
			case true :
				$('.panel-bg-thempl').animate({"right": "-350px"}, "slow");	
				$('.panel-bg-themp2').animate({"right": "-350px"}, "slow");
				on_off_panel = false;
			break;			
			}
		});		


		// ============ Click button ON/OFF Panel Objects ================  //	
		$("#btnObj2").bind( "click", function()	{
			switch(on_off_panel2) {
			case false :
				$('.panel-bg-thempl').animate({"right": "-405px"}, "slow");	
				$('.panel-bg-themp2').animate({"right": "-10px"}, "slow");	
				on_off_panel2 = true;
			break;
			case true :
				$('.panel-bg-thempl').animate({"right": "-350px"}, "slow");	
				$('.panel-bg-themp2').animate({"right": "-350px"}, "slow");
				on_off_panel2 = false;
			break;			
			}
		});	


		// ========= Click button Upload Image =============== //
		$('#btnUpload').click(function() { 
		$.fancybox.open([
					{   href : '#modal-upload',                
						title : 'Загрузить картинку'
					}
				], {
						maxWidth	: 800,
						maxHeight	: 600,
						fitToView	: false,
						width		: '70%',
						height		: '70%',
						autoSize	: false,
						closeClick	: false,
						openEffect	: 'fade',
						closeEffect	: 'fade'
				});				
		});

	
	
		// ========= Click button Edit Text =============== //
		
		
		$('#btnEditT').click(function() { 
			   
			var activeObject = canvas.getActiveObject();			
			if (activeObject) {
				if (activeObject.isType('text')){
				console.log("type selected = " + activeObject);
				editText(activeObject);
				$.fancybox.open([
					{   href : '#inline1',                
						title : 'Редактирование текста'
					}
				], {
						maxWidth	: 800,
						maxHeight	: 400,
						fitToView	: false,
						width		: '70%',
						height		: '70%',
						autoSize	: false,
						closeClick	: false,
						openEffect	: 'fade',
						closeEffect	: 'fade'
				});				
				
				} 
				
			}
		});

		function editText(activeTextObject) {
			var textGet = activeTextObject.getText();
			console.log('12'+textGet);
			$('#cnvEdit').attr( "value", textGet );			
			$('#cnvEdit').val( textGet );			
		};

		// ========= Event double click to Text object and edit Text =============== //
		canvas.dblclick(function(e) { 
		
			var activeObject = canvas.getActiveObject();
			if (activeObject && activeObject.isType('text')) {
				
				editText(activeObject);
				$.fancybox.open([
					{   href : '#inline1',                
						title : 'Редактирование текста'
					}
				], {
						maxWidth	: 800,
						maxHeight	: 400,
						fitToView	: false,
						width		: '70%',
						height		: '70%',
						autoSize	: false,
						closeClick	: false,
						openEffect	: 'fade',
						closeEffect	: 'fade'
				});	

			}
	 
		}); 

		// ================ POP-UP SAVE JPEG ====================  //	
		function dawnloadJPEG () {
				$.fancybox.open([
					{   href : '#saveBcardJPG',                
						title : 'Записать JPG'
					}
				], {
						maxWidth	: 800,
						maxHeight	: 600,
						fitToView	: false,
						width		: '70%',
						height		: '70%',
						autoSize	: false,
						closeClick	: false,
						openEffect	: 'fade',
						closeEffect	: 'fade'
				});			
			
		}
		
		// ================ Close POP-UP SAVE JPEG ====================  //	
		$('#okTheme').click(function() { 
			$.fancybox.close( true );                      
        });
		// ============================================================ //
		
		// ================ Event click mouse to canvas ====================  //	
		canvas.on('mouse:up', 
			function(options){	
				if (canvas.getActiveGroup()){
				//console.log('Select GROUP');
				selectGrpParam(options);
				}
				else {
					if (canvas.getActiveObject()){
						selectObjParam(options);
					}
					else hideAllBtn();	
				}	
			}	
		);	


		// ============= Function keycapture ====================  //

		document.onkeydown = function(e) {
			if (46 === e.keyCode) {
				console.log('delete press');
				// 46 is Delete key
				var activeObject = canvas.getActiveObject();
				if (!activeObject) {
				}
				else {
				//deleteObj();
				}
				// do stuff to delete selected elements
			}
		};




		// ================ Click btn SAVE PDF ====================  //
		$("#btnSvPDF").bind( "click", function(){
			popupPDF ();
		});	
		
		// ================ Close POP-UP SAVE PDF ====================  //
		$('#pdfcancel').click(function() { 
			$.fancybox.close( true );
           
        });
		// ================ Close POP-UP SAVE PDF ====================  //
		$('#savepdfbtn').click(function() { 
			$.fancybox.close( true );
        
        });		
		// ================ POP-UP SAVE PDF ====================  //
		function popupPDF () {
			console.log('in gen pdf preview png!!!!');
			//create_jpg_web ();
			$.fancybox.open([
					{   href : '#modal-save-pdf',                
						title : 'Сохранить в PDF'
					}
				], {
						maxWidth	: 800,
						maxHeight	: 600,
						fitToView	: false,
						width		: '70%',
						height		: '70%',
						autoSize	: false,
						closeClick	: false,
						openEffect	: 'fade',
						closeEffect	: 'fade'
				});				
		}	
	


		// ================ Click Cancel upload image ====================== //
		$('#uploadcancelbtn').click(function() { 
			$.fancybox.close( true );             
        });		
		
		// ================ Function POP-UP Upload images ====================== //
		function popupUploadImg () {
			console.log('upload img modal win!!!!');
			create_jpg_web ();
			$.fancybox.open([
					{   href : '#modal-save-pdf',                
						title : 'Сохранить в PDF'
					}
				], {
						maxWidth	: 800,
						maxHeight	: 600,
						fitToView	: false,
						width		: '70%',
						height		: '70%',
						autoSize	: false,
						closeClick	: false,
						openEffect	: 'fade',
						closeEffect	: 'fade'
				});				
		}	
		
		// ================ END POP-UP Upload Image ====================  //	
		
		// ================ Function Show All instrument button ====================== //
		function showAllBtn (fntOn) {
			onBtn ('btnCopy');
			onBtn ('btnDel');
			onBtn ('btnUp');
			onBtn ('btnDn');
			onBtn ('btnFlipH');
			onBtn ('btnFlipV');
			onBtn ('btnLock');
			onBtn ('sectEdit');
			onBtn ('colorelement');	
			//Show Font Button
			//if (fntOn) {
				onBtn ('btnBold');
				onBtn ('btnItalic');
				onBtn ('fntLeft');
				onBtn ('fntCenter');
				onBtn ('fntRight');
				onBtn ('fontFamily');
				onBtn ('btnEditT');
			//}

		}

		// ================ Function Hide All instrument button ====================== //
		function hideAllBtn () {
			offBtn ('btnCopy');
			offBtn ('btnDel');
			offBtn ('btnUp');
			offBtn ('btnDn');
			offBtn ('btnFlipH');
			offBtn ('btnFlipV');
			offBtn ('btnLock');
			offBtn ('sectEdit');
			offBtn ('colorelement');
			//Hide Font Button
			/*offBtn ('btnBold');
			offBtn ('btnItalic');
			offBtn ('fntLeft');
			offBtn ('fntCenter');
			offBtn ('fntRight');
			offBtn ('fontFamily');
			offBtn ('btnEditT');
			*/
		}

	
		
		// ================ Function Hide All button and colors ====================== //
		function hideTools() {
			hideAllBtn();
			$('#colorelement').css('display','none');
			$('#fntEdit').css('display','none');
		}
	

		// ================ Function Colour panel Object ====================== //
		function getfillObj(curc) {
			$(".basic").spectrum({
			chooseText: "Ok",
			color: curc,	
			showInput: true,
			showAlpha: false,
			showPalette: true,
			showAlpha: true,
			palette: [
				['black', 'white', '#E30613','#FFED00', '#009640', '#009FE3'],
				['#312783', '#E6007E', '#BE1622','#E6332A', '#E94E1B', '#F39200'],
				['#575756', '#878787', '#B2B2B2','#DADADA', '#DEDC00', '#95C11F'],
				['#008D36', '#006633', '#2FAC66','#00A19A', '#1D71B8', '#2D2E83'],
				['#29235C', '#662483', '#951B81','#A3195B', '#D60B52', '#E71D73'],
				['#CBBBA0', '#A48A7B', '#7B6A58','#634E42', '#CA9E67', '#B17F4A'],
				['#936037', '#7D4E24', '#683C11','#432918', '#80676C', '#92A8B4']
		
			],	
			change: function(color) {		
			var selectOb = canvas.getActiveObject();
				//console.log('type obj = '+selectOb.type);
				//console.log('set color = '+color);
		
			switch(selectOb.type) {
			case 'path-group'  :
				if (selectOb.paths) {
					for (var i = 0; i < selectOb.paths.length; i++) {
						selectOb.paths[i].setFill(color.toString());
					}
				}		
			break;
			case 'text':
				selectOb.setFill(color.toString());
			break;	
			case 'circle':
				selectOb.setFill(color.toString());
			break;	
			case 'rect':
				selectOb.setFill(color.toString());
			break;				
			}

			//canvas.add(selectOb);
			canvas.renderAll();
			}
	
			});
  
		}

		// ================ Function Colour panel Group Object ====================== //
		function getfillGrp(curc) {
			$(".basic").spectrum({
			chooseText: "Ok",
			color: curc,
			showInput: true,
			showAlpha: false,
			showPalette: true,
			showAlpha: true,	
			palette: [
				['black', 'white', '#E30613','#FFED00', '#009640', '#009FE3'],
				['#312783', '#E6007E', '#BE1622','#E6332A', '#E94E1B', '#F39200'],
				['#575756', '#878787', '#B2B2B2','#DADADA', '#DEDC00', '#95C11F'],
				['#008D36', '#006633', '#2FAC66','#00A19A', '#1D71B8', '#2D2E83'],
				['#29235C', '#662483', '#951B81','#A3195B', '#D60B52', '#E71D73'],
				['#CBBBA0', '#A48A7B', '#7B6A58','#634E42', '#CA9E67', '#B17F4A'],
				['#936037', '#7D4E24', '#683C11','#432918', '#80676C', '#92A8B4']
		
			],	
			change: function(color) {
			var selectOb = canvas.getActiveGroup().forEachObject(function(obj){
					//obj['fill'] = color.toString();
					//console.log('type obj = '+obj.type);
					//console.log('set color Grp = '+color);
			
			switch(obj.type) {
			case 'path-group'  :
				if (obj.paths) {
					for (var i = 0; i < obj.paths.length; i++) {
				obj.paths[i].setFill(color.toString());
					}
				}		
			break;
			case 'text':
				obj.setFill(color.toString());
			break;	
			case 'circle':
				obj.setFill(color.toString());
			break;	
			case 'rect':
				obj.setFill(color.toString());
			break;				
			}
			
			
			});	
			canvas.renderAll();
			}	
			});
		}

		// ================ Function Colour panel Background ====================== //
		$(".basicbg").spectrum({
			chooseText: "Ok",
			color: bgRect.fill,
			showInput: true,
			showAlpha: false,
			showPalette: true,
			palette: [
				['black', 'white', '#E30613'],
				['#FFED00', '#009640', '#009FE3'],
				['#312783', '#E6007E', '#BE1622'],
				['#E6332A', '#E94E1B', '#F39200'],
				['#575756', '#878787', '#B2B2B2'],
				['#DADADA', '#DEDC00', '#95C11F'],
				['#008D36', '#006633', '#2FAC66']
			],	
			change: function(color) {
				canvas.setBackgroundColor(color.toString(), canvas.renderAll.bind(canvas));
				//bgRect.fill = color.toString();	
				canvas.renderAll();
			}	
		});


		
		// ================ Function Add SVG Object ====================== //
		function addSVGFile(shapeName){
			console.log('adding shape', shapeName);  
			fabric.loadSVGFromURL( shapeName, function(objects, options) {
				var loadedObject = fabric.util.groupSVGElements(objects, options);
				loadedObject.set({
					left: 100,
					top: 100
				})
				.setCoords();
				canvas.add(loadedObject).setActiveObject(loadedObject);
				selectObjParam();
				canvas.renderAll();	  
			});		
		}
	
	
		// ================ Function Add PNG Object ====================== //
		function addPNGFile(imgName){
			console.log('adding PNG', imgName);  		
			var imgPNGName = new Image()
			imgPNGName.src = imgName;
			fabric.Image.fromURL(imgName, function(img) {
				canvas.add(img.set({ left: 5, top: 5, }).scale(0.5)).setActiveObject(img);
				selectObjParam();
				canvas.renderAll();	 
	
			});
		}	

		// ================ Function Add uploaded Object ====================== //
		function uploadImg(urlimg){
			fabric.Image.fromURL(urlimg, function(img) {
				canvas.add(img.set({ left: 5, top: 5, }).scale(0.5)).setActiveObject(img);
				selectObjParam();
			});
			canvas.renderAll();	  	
		}

	
		// ================= Function round to discret number ================== //	
		function roundTo(value, base){
			return Math.floor((value + base / 2) / base) * base;
		}	
		
		// ================ Event rotating object and discret to 5 degree ====================== //
		canvas.on("object:rotating", function(rotEvtData) {
			var targetObj = rotEvtData.target;
			var snapAngle = roundTo(targetObj.angle, 5);
			targetObj.setAngle(snapAngle).setCoords();
			canvas.renderAll();	
    
		});


		// ================ Function Flip Horizontal ====================== //
		function flipHorizontal(selectOb) {
			if (selectOb.getFlipX()) selectOb.setFlipX(false);
			else selectOb.setFlipX(true);
				canvas.renderAll();	
		}
		
		// ================ Function Flip Horizontal ====================== //
		function flipVertical(selectOb) {
			if (selectOb.getFlipY()) selectOb.setFlipY(false);
			else selectOb.setFlipY(true);
			canvas.renderAll();	
		}


		
		// ============ Click Insert object to canvas  ================  //
		$(".dataobj").bind( "click", function(){
			var re = /(?:\.([^.]+))?$/;
			var ext = re.exec($(this).attr("src"))[1]; 	
			//console.log('CLICK='+ext);	
			
			switch(ext) {
			case 'svg' :
				addSVGFile($(this).attr("src"));		
			break;
			case 'png' :
				addPNGFile($(this).attr("src"));
			break;			
			}

		});

		// ============ END Insert object to canvas  ================  //



		// ============= SET Click BG Image ==============================//
		$(".databgimg").bind( "click", function(){
			//console.log('CLICK');
			var srcPathThmb = $(this).attr("src");
			console.log('full path= '+ srcPathThmb);
			var re = new RegExp("/thmb/", "g");
			var regtempl = new RegExp("/templ/", "g");
			var srcPathImg = srcPathThmb.replace(re, '/');
			var urlThisTempl = srcPathThmb.replace('.jpg', '.cardln');
			urlThisTempl = urlThisTempl.replace(re, '/templ/');
			//urlThisTempl.replace('.jpg', '.cardln');
			canvas.setBackgroundColor(null, canvas.renderAll.bind(canvas));
			console.log('image path= '+ urlThisTempl + 'editor mode -> ' +editormode );			
			if (editormode) setBgImg(srcPathImg);
			else loadTempl(urlThisTempl);
		});
		//========================================================= //


		// ================ Click button Reset to default canvas ====================== //
		$("#btnReset").click(function(){
			Reset();
		});
		//========================================================= //

		// ================ Click button Save PDF ====================== //
		$("#btnSvPDF").click(function(){
			saveAsPDF();
			canvas.clipTo = function(ctx) {
            bgRectClip.render(ctx);	
			};	
			canvas.renderAll();			
	
		});
		//========================================================= //

		// ================ Click button Save JPG ====================== //
		$("#btnSvJPG").click(function(){
			create_jpg_print();
			console.log('end JPG ');
			canvas.clipTo = function(ctx) {
            bgRectClip.render(ctx);	
			}; 
		});
		
		//========================================================= //
		// ================ Click button Save JPG ====================== //
		$("#btnSvWWW").click(function(){
			create_jpg_toweb();
			console.log('end JPG WEB');
			canvas.clipTo = function(ctx) {
            bgRectClip.render(ctx);	
			}; 
		});
		
		//========================================================= //		

		// ================ Click button Add Rectangle ====================== //
		$("#btnRec").click(function(){
			addRect();
		});
		
		// ================ Click button Add Circle ====================== //
		$("#btnCircle").click(function(){
			addCircle();
		});

		// ================ Click button Add text ====================== //
		$("#btnText").click(function(){
			addText();
		});
		
		// ================ Click button Copy Object ====================== //
		$("#btnCopy").click(function(){
			copyObj2();
		});
		
		// ================ Click button Delete Object ====================== //
		$("#btnDel").click(function(){
			deleteObj();
		});

		// ================ Click button Up Layer ====================== //
		$("#btnUp").click(function(){
			upObj();
		});

		// ================ Double Click button Up Layer ====================== //
		$("#btnUp").dblclick(function(){
			bringupObj();
		});

		// ================ Click button Dawn Layer ====================== //
		$("#btnDn").click(function(){
			dnObj();
		});

		// ================ Double Click button Dawn Layer ====================== //
		$("#btnDn").dblclick(function(){
			bringdnObj();
		});

		// ================ Click button Bold Text ====================== //
		$("#btnBold").click(function(){
			setFontB();
		});

		// ================ Click button Italic Text ====================== //
		$("#btnItalic").click(function(){
			setFontI();
		});

		// ================ Click button Clear Background Image ====================== //
		$("#btnClearBG").click(function(){
			setWOBgImg();
		});
		

		// ================ Click button Align Left ====================== //
		$("#btnAlLeft").click(function(){
			alignLeft();
		});

		// ================ Click button Align Right ====================== //
		$("#btnAlRight").click(function(){
			alignRight();
		});

		// ================ Click button Align Horizontal Center ====================== //
		$("#btnAlHCenter").click(function(){
			alignHCenter();
		});

		// ================ Click button Align Vertical Center ====================== //
		$("#btnAlVCenter").click(function(){
			alignVCenter();
		});

		// ================ Click button Align Top ====================== //
		$("#btnAlTop").click(function(){
			alignTop();
		});

		// ================ Click button Align Bottom ====================== //
		$("#btnAlBottom").click(function(){
			
			alignBottom();
		});

		// ================ Click button Align Text Left ====================== //
		$("#fntLeft").click(function(){
			satAlignText('left');
		});

		// ================ Click button Align Text Center ====================== //
		$("#fntCenter").click(function(){
			satAlignText('center');
		});

		// ================ Click button Align Text Right ====================== //
		$("#fntRight").click(function(){
			satAlignText('right');
		});


		// ================ Click button Save Canvas to File ====================== //

		$("#btnSaveCanvas").click(function(){
			canvas.namecard = getNameproduct;
			canvas.version = "b0.8";
			//var dataCanv2 = JSON.stringify(canvas.toJSON(['namecard']));
			var dataCanv = JSON.stringify(canvas.toJSON(['namecard','version']));
			//console.log(JSON.stringify(canvas));
			$.fancybox.open([
					{   href : '#saveBcardTmpl',                
						title : 'Записать в шаблон'
					}
				], {
						maxWidth	: 800,
						maxHeight	: 200,
						fitToView	: false,
						width		: '70%',
						height		: '70%',
						autoSize	: false,
						closeClick	: false,
						openEffect	: 'fade',
						closeEffect	: 'fade'
				});	
						
			$.ajax({
				url: "save-canvas.php",
				data: {dataJSON:dataCanv},
				cache: false,
				dataType: 'text',
				type : 'POST',
				success: function(data) {	
					var dataJ = JSON.parse(data);
						if (dataJ.result) {			
							console.log('Save data Canvas infile  = ' + dataJ.result);							
							$("#dwldCanv").css( "display", "block");
							$("#dwldCanv").attr({ href: dataJ.pathfilecnv});		
						}
				}
			});		
		});


		// ================ Click button Cancel Save Canvas to File ====================== //
		$('#savecancelbtn').click(function() { 
			$("#dwldCanv").css( "display", "none" );
			$.fancybox.close( true );
                       
        });	
		

		// ================ Click button in POP-UP Save Canvas to File ====================== //
		$('#btnSaveCanvasTmpl').click(function() { 
			$("#dwldCanv").css( "display", "none" );
			$.fancybox.close( true );
                        
        });			
		// ============= END Save Canvas to file ===================== //

		


		// ============= Click button Load Canvas Template  ===================== //

		$("#btnLoadCanvas").click(function(){
			$.fancybox.open([
					{   href : '#modal-load-thmp',                
						title : 'Открыть в шаблон'
					}
				], {
						maxWidth	: 800,
						maxHeight	: 150,
						fitToView	: false,
						width		: '70%',
						height		: '70%',
						autoSize	: false,
						closeClick	: false,
						openEffect	: 'fade',
						closeEffect	: 'fade'
				});	
			
			//console.log('Load data Canvas!!!' );			
		});


		// ================ Click button Cancel Load Canvas File ====================== //
		$('#loadcancelbtn').click(function() { 
			$.fancybox.close( true );
                        
        });	

		// =============== Function Read Canvas Template from file ================== // 
		function loadTempl(urlcanv) {
			//console.log ('load template');
			
			$.ajax({
				url: "loadtmpl.php",
				data: {urltmpl:urlcanv},
				cache: false,
				dataType: 'json',
				type : 'POST',
				success: function(data) {
					if (data.result) {			
						//console.log('Get Text = ' + data.tmplcanv);
						var  obj = JSON.parse(data.tmplcanv);
						canvas.loadFromJSON(obj, canvas.renderAll.bind(canvas));
						
					}
				}
			});
		
		}
		
		// =============== Function Read Canvas Template from Dialog Box ================== // 
		function readSingleFile(evt) {
		console.log('READ File  -> ' + evt.target.files[0]);	
		//Retrieve the first (and only!) File from the FileList object
			var f = evt.target.files[0]; 
			if (f) {
				var r = new FileReader();
				r.onload = function(e) { 
				var contents = e.target.result;
				var  obj = JSON.parse(contents);

				//console.log('LOAD data Canvas  = ' + JSON.parse(obj).namecard);		
				console.log('LOAD data Canvas  = ' + obj.namecard);		
				//location.href="bcard.php?product="+obj.namecard+",";
				if (obj.namecard == getNameproduct)
					canvas.loadFromJSON(obj, canvas.renderAll.bind(canvas));
				else location.href="bcard.php?product="+obj.namecard + '&reloadpage=true';
				//canvas.loadFromJSON(contents, canvas.renderAll.bind(canvas));
				
				}
				r.readAsText(f);
				$.fancybox.close( true );
				$("#fileloadtempl").val('');
				
				 
			} 
			else { 
				alert("Failed to load file");
			}
	
		}

		document.getElementById('fileloadtempl').addEventListener('change', readSingleFile, false);


		// ============= END Load Canvas to file ===================== //


		//============== Dawnload JPEG file   ==================== //

		function create_jpg_print() {
				$("#dwldJPEG").css("display", "none");
				$.fancybox.open([
					{   href : '#saveBcardJPG',                
						title : 'Записать JPG'
					}
				], {
						maxWidth	: 800,
						maxHeight	: 600,
						fitToView	: false,
						width		: '70%',
						height		: '70%',
						autoSize	: false,
						closeClick	: false,
						openEffect	: 'fade',
						closeEffect	: 'fade'
				});	
		
			
			canvas.deactivateAll();	
			canvas.clipTo = null;
			var dataURL = canvas.toDataURL({
				format: 'jpg',
				quality: 1,
				/*  left: 13,
				top: 13,
				width: 594,
				height: 330,*/
				multiplier: loadJSON.Dimension.zoomkprint
			});

			$.ajax({
				url: "save-png.php",
				data: {imageurl:dataURL, resolution:300},
				cache: false,
				dataType: 'json',
				type : 'POST',
				success: function(data) {
					if (data.result) {			
						console.log('Url JPG = ' +data.imgURL+' file result = '+data.imgpng);
						$("#img-jpg-save").attr({ src: data.imgpng});
						$("#dwldJPEG").attr({ href: data.imgURL});
						$("#dwldJPEG").css("display", "block");
					}
				}
			});
		}
		//==============SAVE JPEG file==================== //
		function create_jpg_web () {
			canvas.deactivateAll();	
			canvas.clipTo = null;
			var dataURL = canvas.toDataURL({
			format: 'jpg',
			quality: 0.7, 
			/*  left: 13,
			top: 13,
			width: 594,
			height: 330,*/
			multiplier: 1
			});		
			$.ajax({
				url: "save-png.php",
				data: {imageurl:dataURL, resolution:72},
				cache: false,
				dataType: 'json',
				type : 'POST',
				success: function(data) {		
					console.log('return from PHP png preview = ' +data.result+' file result = '+data.imgpng);		
					if (data.result) {						
						$("#img-png").attr({ src: data.imgpng});
					}
				}
			});
		}

		//==============SAVE JPEG file for print ==================== //
		function create_jpg_print2 () {
			canvas.deactivateAll();	
			canvas.clipTo = null;
			var dataURL = canvas.toDataURL({
			format: 'jpg',
			quality: 1, 
			/*  left: 13,
			top: 13,
			width: 594,
			height: 330,*/
			multiplier: 1.5
			});		
			$.ajax({
				url: "save-png.php",
				data: {imageurl:dataURL, resolution:300},
				cache: false,
				dataType: 'json',
				type : 'POST',
				success: function(data) {		
					console.log('return from PHP png preview = ' +data.result+' file result = '+data.imgpng);		
					if (data.result) {						
						$("#img-png").attr({ src: data.imgpng});
					}
				}
			});
		}
		
		
		//==============SAVE JPEG file for WEB pop-up ==================== //
		function create_jpg_toweb() {
				$("#dwldJPEG").css("display", "none");
				$.fancybox.open([
					{   href : '#saveBcardJPG',                
						title : 'Записать JPG'
					}
				], {
						maxWidth	: 800,
						maxHeight	: 600,
						fitToView	: false,
						width		: '70%',
						height		: '70%',
						autoSize	: false,
						closeClick	: false,
						openEffect	: 'fade',
						closeEffect	: 'fade'
				});	
				
		
		
			canvas.deactivateAll();	
			canvas.clipTo = null;
			var dataURL = canvas.toDataURL({
			format: 'jpg',
			quality: 0.8, 
			/*  left: 13,
			top: 13,
			width: 594,
			height: 330,*/
			multiplier: 1
			});		
			$.ajax({
				url: "save-png.php",
				data: {imageurl:dataURL, resolution:72},
				cache: false,
				dataType: 'json',
				type : 'POST',
				success: function(data) {		
					console.log('return from PHP png preview = ' +data.result+' file result = '+data.imgpng);		
					if (data.result) {						
						console.log('Url JPG = ' +data.imgURL+' file result = '+data.imgpng);
						$("#img-jpg-save").attr({ src: data.imgpng});
						$("#dwldJPEG").attr({ href: data.imgURL});
						$("#dwldJPEG").css("display", "block");
					}
				}
			});
		}

		// =================== Function set Font Family ======================= \\

		function setFont(nameF) {
			var selectOb = canvas.getActiveObject();
			selectOb.setFontFamily(nameF);
			canvas.renderAll();	
			canvas.deactivateAllWithDispatch();
			canvas.renderAll();	
		}
		// =================== END Function set Font Family======================= //


		// =================== Function set Align Text ======================= //
		function satAlignText(alignF) {
			var selectOb = canvas.getActiveObject();
			if (!selectOb) return;
			selectOb.textAlign = alignF;
			canvas.renderAll();	
		}
		// =================== END Function set Align Text ======================= //


		// ============= Click button Lock selected object  ===================== //
		$("#btnLock").click(function(){
			var selectGrp = canvas.getActiveGroup();
				if (selectGrp) {
					selectGrp.forEachObject(function(obj){
					obj.set('active', false); 
					obj.selectable = false;
					});		
				}
	
				else {
					var selectOb = canvas.getActiveObject();
					selectOb.set('active', false); 
					selectOb.selectable = false;	
				}
				canvas.deactivateAll();
				hideTools();	
				canvas.renderAll();	
		});

		// ============= Click button UNLock all locked objects  ===================== //
		$("#btnUnlockAll").click(function(){
			var selectOb = canvas.forEachObject(function(obj){
				obj.selectable = true;
			});	
			selectObjParam();
			canvas.renderAll();	
		});


		// ============= Click button Flip Horizontal  ===================== //
		$("#btnFlipH").click(function(){
			flipHorizontal(canvas.getActiveObject());
		});

		// ============= Click button flip Vertical  ===================== //
		$("#btnFlipV").click(function(){
			flipVertical(canvas.getActiveObject());
		});

		// ============= Click button Upload image  ===================== //
		$('#fileupload').fileupload({
			url: 'public_html/uploadimg/',
			dataType: 'json',
			disableImageResize: /Android(?!.*Chrome)|Opera/
            .test(window.navigator.userAgent),
			imageMaxWidth: 1600,
			imageMaxHeight: 800,			
			previewMaxWidth: 100,
			previewMaxHeight: 100,
			acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
			previewCrop: true,		
			imagePreviewName: 'pre-11',
			done: function (e, data) {
				console.log('data ret error = '+ data.files.push(data.files[data.index]));
				$.each(data.result.files, function (index, file) {
					nmUploadF = file.name;
					console.log('File Path = '+file.url);
					var pathupload = 'server/php/files/'+nmUploadF;
					uploadImg(file.url);
				});

			},
			progressall: function (e, data) {
				var progress = parseInt(data.loaded / data.total * 100, 10);
				$('#progress .bar').css('width', progress + '%');
				if(progress>=100) {
					$.fancybox.close( true );					
					$('#progress .bar').css('width','0%');
				}
			}		
		});

		
		// ============= Click button TAB Groupe Tool 0 ===================== //
		$("#tool0").click(function(){
			$('#tool0').addClass('active');
			$('#tool1').removeClass('active');
			$('#tool2').removeClass('active');
			$('#tool3').removeClass('active');
			$('#tool4').removeClass('active');
			
			$('.file').css('display','block');
			$('.base').css('display','none');
			$('.alighn').css('display','none');	
			$('.text').css('display','none');
			$('.element').css('display','none');
		});		

		// ============= Click button TAB Groupe Tool 1 ===================== //
		$("#tool1").click(function(){
			$('#tool0').removeClass('active');
			$('#tool1').addClass('active');
			$('#tool2').removeClass('active');
			$('#tool3').removeClass('active');
			$('#tool4').removeClass('active');
			$('.file').css('display','none');
			$('.base').css('display','block');
			$('.alighn').css('display','none');	
			$('.text').css('display','none');
			$('.element').css('display','none');
		});
	

	// ============= Click button TAB Groupe Tool 2 ===================== //
	$("#tool2").click(function(){
			$('#tool0').removeClass('active');
			$('#tool1').removeClass('active');
			$('#tool2').addClass('active');
			$('#tool3').removeClass('active');
			$('#tool4').removeClass('active');
		$('.file').css('display','none');
		$('.alighn').css('display','block');
		$('.base').css('display','none');
		$('.text').css('display','none');
		$('.element').css('display','none');		
	});
	

	// ============= Click button TAB Groupe Tool 3 ===================== //
	$("#tool3").click(function(){
			$('#tool0').removeClass('active');
			$('#tool1').removeClass('active');
			$('#tool2').removeClass('active');
			$('#tool3').addClass('active');
			$('#tool4').removeClass('active');
		$('.file').css('display','none');
		$('.text').css('display','block');
		$('.base').css('display','none');
		$('.alighn').css('display','none');
		$('.element').css('display','none');		
	});

	// ============= Click button TAB Groupe Tool 4 ===================== //
	$("#tool4").click(function(){
			$('#tool0').removeClass('active');
			$('#tool1').removeClass('active');
			$('#tool2').removeClass('active');
			$('#tool3').removeClass('active');
			$('#tool4').addClass('active');
		$('.file').css('display','none');
		$('.element').css('display','block');	
		$('.alighn').css('display','none');
		$('.base').css('display','none');	
		$('.text').css('display','none');	
	});


		// ============= Events upload files  ===================== //
	$('#fileupload')
		.bind('fileuploadadd', function (e, data) {console.log('fileuploadadd');})
		.bind('fileuploadsubmit', function (e, data) {console.log('fileuploadsubmit');})
		.bind('fileuploadsend', function (e, data) {console.log('fileuploadsend');})
		.bind('fileuploadprocess', function (e, data) {''})
		.bind('fileuploaddone', function (e, data) {''})
		.bind('fileuploadfail', function (e, data) {console.log('fileuploadfail');})
		.bind('fileuploadalways', function (e, data) {console.log('fileuploadalways');})
		.bind('fileuploadprogress', function (e, data) {console.log('fileuploadprogress');})
		.bind('fileuploadprogressall', function (e, data) {console.log('fileuploadprogressall');})
		.bind('fileuploadstart', function (e) {console.log('fileuploadstart');})
		.bind('fileuploadstop', function (e) {console.log('fileuploadstop');
											selectObjParam();
											canvas.renderAll();	
											})
		.bind('fileuploadchange', function (e, data) {console.log('fileuploadchange');})
		.bind('fileuploadpaste', function (e, data) {console.log('fileuploadpaste');})
		.bind('fileuploaddrop', function (e, data) {console.log('fileuploaddrop');})
		.bind('fileuploaddragover', function (e) {console.log('fileuploaddragover');})
		.bind('fileuploadchunksend', function (e, data) {console.log('fileuploadchunksend');})
		.bind('fileuploadchunkdone', function (e, data) {console.log('fileuploadchunkdone');})
		.bind('fileuploadchunkfail', function (e, data) {console.log('fileuploadchunkfail');})
		.bind('fileuploadchunkalways', function (e, data) {console.log('fileuploadchunkalways');});	




		// ============= Change FontFamily in Select ===================== //
		$( "#fontFamily" ).change(function () {
			var nameFontF = $( "#fontFamily" ).val();
			setFont(nameFontF);

		});

		// ============= Click button Edit Text ===================== //
	$('#okEdit').click(function() { 
		var value = $( "#cnvEdit" ).val();
		console.log('edit text = '+ value);
		canvas.getActiveObject().setText(value);
		canvas.renderAll();	
		$.fancybox.close( true );
                   
    }); 
	
	// ============= Click button Close ===================== //
	$('#closeBtn').click(function() { 
			$.fancybox.close( true );
                     
    });
	
	// ============= Click button Cancel Edit Text ===================== //
	$('#cancelEdit').click(function() { 
			$.fancybox.close( true );
         
    });
	
	// ============= Click button Cancel Alert Load Canvas ===================== //
	$('#OkOpenFile').click(function() { 
			$.fancybox.close( true );
         
    });
		
	

	// ============= Click button Cancel Save JPEG File ===================== //
	$('#cancelSaveJPG').click(function() { 
		canvas.clipTo = function(ctx) {
            bgRectClip.render(ctx);
        };
		$("#img-jpg-save").attr({ src: 'img/1px.gif'});
		$.fancybox.close( true );       
		canvas.renderAll();	           
    });


	// ============= Click button Download as JPEG ===================== //
	$('#dwldJPEG').click(function() { 
		canvas.clipTo = function(ctx) {
			bgRectClip.render(ctx);
        };
		$("#img-jpg-save").attr({ src: 'img/1px.gif'});
		$.fancybox.close( true );       			
		canvas.renderAll();	          
    });	


	
	
	// ============= Reset if Load All Page ===================== //
	$( function() {
		console.log('All page load? BUT...');
		
		//$('#canvas').css({"border": "0px"});
		$('.upper-canvas').css({"border": "0px"});
		$('.fluid.size-menu').animate({"height": "toggle", "opacity": "toggle"}, "fast");
		//$('#soflow-color-obj').val() = loadJSON.Object[0].chapter;
		
	
	// ============= ALERT Load Canvas Template  ===================== //
		console.log('RELOAD == ' + reloadP);
		if (reloadP) {
			$.fancybox.open([
					{   href : '#alertOpenCanvas',                
						title : 'ВНИМАНИЕ'
					}
				], {
						maxWidth	: 800,
						maxHeight	: 250,
						fitToView	: false,
						width		: '70%',
						height		: '70%',
						autoSize	: false,
						closeClick	: false,
						openEffect	: 'fade',
						closeEffect	: 'fade'
				});	

		}
		//Reset();
	});

