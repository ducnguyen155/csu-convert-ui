var beforContent =""; 
var afterContent =""
var cntTemp = '';
var gridHeader = 'gridHeader:'; 

function convertGrid(){ 
   beforContent = document.getElementById("content").value;
   afterContent = document.getElementById("content").value;   
   var dynamicGrid = beforContent.search('dynamicGrid')
   var numberingTitleText = beforContent.search('numberingTitleText')
   var totalCntString = beforContent.search('totalCntString')
   var toolbarPosition = beforContent.search('toolbarPosition')
   var gridHdr = beforContent.search('gridHeader')
   var grid = beforContent.trim().search('grid:')  
   var gridBody = beforContent.trim().search('gridBody:');
   var gridBottom = beforContent.trim().search('gridBottom:');
   var bodyWidth = beforContent.search('bodyWidth');
   var space =" ";
   var arrLg =[]; 
   var gridSumPercent = GetSumPercent();

    if(gridHdr >0){
    for(var i = gridHdr-2; i > 0; i--) { 
      if(beforContent.charAt(i)== '\n')
      break;
      space = space + " ";
    }
   if(dynamicGrid>=0){  
      for(var i= dynamicGrid + 11; i<beforContent.length; i++) {
       if(beforContent.charAt(i)==',') 
            break;
            cntTemp += beforContent.charAt(i); 
      } 
      afterContent = afterContent.replace('dynamicGrid' + cntTemp,'dynamicGrid:true'); 
      cntTemp = '';
   }else{ 
      afterContent = afterContent.replace(gridHeader,'dynamicGrid:true, \n'+space + gridHeader); 
   }

   if(numberingTitleText>=0){  
      for(var i= numberingTitleText + 18; i<beforContent.length; i++) {
       if(beforContent.charAt(i)==',') 
            break;
            cntTemp += beforContent.charAt(i); 
      } 
      afterContent = afterContent.replace('numberingTitleText' + cntTemp,'numberingTitleText:"%$No.:No.$%"');
      cntTemp = '';
   } 
   if(totalCntString>=0){   
      for(var i= totalCntString + 14; i<beforContent.length; i++) {
       if(beforContent.charAt(i)==',') 
            break;
            cntTemp += beforContent.charAt(i); 
      } 
      afterContent = afterContent.replace('totalCntString' + cntTemp,'totalCntString: "%d rows"'); 
      cntTemp = '';
   }else{ 
      afterContent = afterContent.replace(gridHeader,'totalCntString: "%d rows", \n' +space + gridHeader); 
   }
   var toolbarId = '#';
   var q = 0;
   if(grid !=-1){
      q = grid + 6;
   }
   for(var j = q;j<beforContent.length; j++ ){ 
      if(beforContent.trim().charAt(j) == ':') 
      break;
      toolbarId += beforContent.trim().charAt(j); 
    } 
    toolbarId = toolbarId.replace(/\n|\r/g, "");
    toolbarId = toolbarId.replace(/\s+/g,'').trim() + 'Toolbar';
    toolbarId = toolbarId.replace('widgetG', 'g'); // widgetGrid100Toolbar > grid100Toolbar
   if(toolbarPosition>=0){  
       
      for(var i= toolbarPosition + 15; i<beforContent.length; i++) {
       if(beforContent.charAt(i)==',') 
            break; 
            cntTemp += beforContent.charAt(i); 
      }  
      afterContent = afterContent.replace('toolbarPosition' + cntTemp,'toolbarPosition:'+'"' + toolbarId.trim() + '"');
      cntTemp = '';
   }else{ 
      afterContent = afterContent.replace(gridHeader,'toolbarPosition:' + '"'+ toolbarId.trim() +'"' +', \n'+space + gridHeader); 
   }
   var gridWidth = document.getElementById("gridWidth") ? document.getElementById("gridWidth").value : 0;  
   var maxWidth = 1280; 
   if(gridWidth=='other'){
      if(document.getElementById("otherVl") && document.getElementById("otherVl").value ==''){
         alert("Please enter width for grid-body");
         return true;
      }else{
         maxWidth = Number.parseFloat(document.getElementById("otherVl").value);
        
      }
   }else if(gridWidth=='bodyWidth'){
      if(bodyWidth>=0){    
         for(var i= bodyWidth + 10; i<beforContent.length; i++) {
          if(beforContent.charAt(i)==',') 
               break; 
              cntTemp += beforContent.charAt(i); 
          }
         maxWidth = Number.parseFloat(cntTemp.replace('"', '').trim());
         cntTemp = '';
      }else{
         alert("bodyWidth is not defined yet");
         return true;
      } 
   }
   

   var p ='';
   for(var i=0; i<beforContent.length; i++){
       var w = beforContent.charAt(i);
       var y = beforContent.charAt(i+1);
       var d = beforContent.charAt(i+2);
       var t = beforContent.charAt(i+3);
       var h = beforContent.charAt(i+4);
       var f = beforContent.charAt(i+5); 
      if(w+y+d+t+h+f =='width:'){  
         var k = '';   
         for(var j = i+5; j <beforContent.length; j++){ 
            if(beforContent.charAt(j)=='%')
            break;
            if(Number.isFinite(parseInt(beforContent.charAt(j))) || beforContent.charAt(j)=='.'){  
               p += beforContent.charAt(j)
            } 
         }  
         var k = (parseFloat(p)*maxWidth/gridSumPercent).toString();  
         k= Number(k).toFixed(1);
         if(k==0)continue;  
         afterContent = afterContent.replace(p+'%',k+'px');  
      } 
      p=''; 
      var n = beforContent.charAt(i);
      var a = beforContent.charAt(i+1);
      var m = beforContent.charAt(i+2);
      var e = beforContent.charAt(i+3); 
      var u = beforContent.charAt(i+4); 
      if(n+a+m+e+u =='name:'){   
         var c = ''; 
         for(var w = i; w <beforContent.length; w++){  
            if(beforContent.charAt(w)=='}' && beforContent.charAt(w+1).trim()==',')
            break;
            c += beforContent.charAt(w);  
         } 
         var r='' 
            for(var k = i; k <beforContent.length; k++){ 
               if((beforContent.charAt(k)== ',') || (beforContent.charAt(k)=='}' && beforContent.charAt(k+1).trim()==',')
               || (beforContent.charAt(k)=='}' && beforContent.charAt(k+1).trim()==']' &&  beforContent.charAt(k+2).trim()==','))
               break;
               r += beforContent.charAt(k) 
            } 
            var dtTemp = r.trim().replace('name:',''); 
               if((dtTemp.startsWith('"%$')== false || dtTemp.substring(dtTemp.length-3) !='$%"')&& (dtTemp.replace(/"/g,'').trim()!='')){  
                  var temp = r.replace('name:"'+dtTemp.replace(/"/g,''),'name:"%$'+dtTemp.replace(/"/g,'')+':'+dtTemp.replace(/"/g,'')+'$%')  
                  arrLg.push(dtTemp.replace(/"/g,''));
                  afterContent = afterContent.replace(r,temp); 
               } 
       }  
      document.getElementById("reSult").value = afterContent
   } 
   if(gridBody>0){
      beforContent = afterContent; 
      var girBdIndx = beforContent.indexOf('gridBody:');
      space ='';
      var arrSpace =[];
      for(var i = girBdIndx; i<beforContent.length; i++){
         var b=''; 
         if(beforContent.charAt(i)=='\n'){
            for(var j = i+1; j<beforContent.length; j++){
                    b += beforContent.charAt(j); 
                var c = beforContent.trim().slice(j) 
                    c = c.replace(/\s+/g,'').trim(); 
               if(beforContent.charAt(j+1) == '\n' || c==']' ){  
               break;
               } 
       
            }  
            if(b.search('gridBottom:')!=-1){
               document.getElementById("reSult").value = afterContent;  
               return true;
            } 
            for(var k =0;  k < b.length - b.replace(/\s+/g,'').trim().length; k++){
               space +=' ';
            } 
            arrSpace.push(space); 

            if(b.indexOf('align:')==-1 && b.replace(/\s+/g,'').trim() !='}' && b.replace(/\s+/g,'').trim() !='},' 
            && b.replace(/\s+/g,'').trim() !='}}'&& b.replace(/\s+/g,'').trim() !='}}}' &&  b.replace(/\s+/g,'').trim() !=']' 
            && b.replace(/\s+/g,'').trim().charAt(0) =='{' && b.replace(/\s+/g,'').trim() !=""){
               var temp1 = b.replace(/\s+/g,'').trim();
               var temp2 = b; 
               console.log(temp1.slice(temp1.length-2,temp1.length));
                if(temp1.indexOf('dataNX') !=-1 && temp1.indexOf('type:"num"') != -1){
                  if(temp1.charAt(temp1.length-1)=='}'){
                     temp2= temp1.slice(0,temp1.length-1) +(',align:"right"'+ temp1.slice(temp1.length-1)); 
                  }else if(temp1.slice(temp1.length-2,temp1.length)=='],'){
                     temp2= temp1.slice(0,temp1.length-3) +(',align:"right"'+ temp1.slice(temp1.length-3)); 
                  }
                  else if([",","]","}"].some(el => temp1.charAt(temp1.length-1).includes(el))!=true){
                     temp2 = temp1 + ',align:"right"';
                  }
                  else{
                     temp2= temp1.slice(0,temp1.length-2) +(',align:"right"'+ temp1.slice(temp1.length-2)); 
                  } 
               }else if(temp1.indexOf('type:"button"') != -1 || temp1.indexOf('type:"checkbox"') !=-1 || temp1.indexOf('type:"select"') !=-1){
                  temp2 = temp1;
               }
                else{ 
                  if(temp1.charAt(temp1.length-1)=='}'){
                     temp2= temp1.slice(0,temp1.length-1) +(',align:"left"'+ temp1.slice(temp1.length-1)); 
                  }else if(temp1.slice(temp1.length-2,temp1.length)=='],'){ 
                     temp2= temp1.slice(0,temp1.length-3) +(',align:"left"'+ temp1.slice(temp1.length-3)); 
                  }
                  else if([",","]","}"].some(el => temp1.charAt(temp1.length-1).includes(el))!=true){
                     temp2 = temp1 + ',align:"left"';
                  }
                  else{
                     temp2= temp1.slice(0,temp1.length-2) +(',align:"left"'+ temp1.slice(temp1.length-2)); 
                  } 
               }  
               afterContent = afterContent.replace(b,arrSpace[0]+temp2);  
                b='';
               
             }
             b='';
             space ='';
         }
      }
      afterContent = afterContent.replaceAll('"icon-search"', '"search-icon"');
      afterContent = afterContent.replaceAll('width:"0%"', 'width:"0.0px"');
      afterContent = afterContent.replaceAll('mask:"yyyy-MM-ddhh:mm"', 'mask:"yyyy-MM-dd hh:mm"');
      document.getElementById("reSult").value = afterContent;  
   } 
   arrLg = [];  
}else{
   alert("data is not valid");
} 
}  
function widthBalance(){  
   beforContent = document.getElementById("content").value;
   var gridHdIdx = beforContent.indexOf(gridHeader);
   if(gridHdIdx!=-1){
      var arrTemp =[];
      for(var i=gridHdIdx+11; i < beforContent.length; i++){
         var strTemp1 ="";
         
         if(beforContent.charAt(i)=='\n'){
            for(var j = i+1; j<beforContent.length; j++){
                strTemp1 += beforContent.charAt(j);  
               if(beforContent.charAt(j+1) == '\n'){  
               break;
               }  
            } 
            if(strTemp1.replace(/\s+/g,'').trim().indexOf('width:')!=-1){
               arrTemp.push(strTemp1);
            }
         }
         if(beforContent.charAt(i)==']' && beforContent.charAt(i+1)=='1'){
            break
         }
      }
      var widthSum = 0;
      if(arrTemp.length>0){ 
         arrTemp.forEach(function(currVl,idx){
            for(var k =0 ; k< currVl.replace(/\s+/g,'').trim().length; k++){
               var w = currVl.replace(/\s+/g,'').trim().charAt(k);
               var y = currVl.replace(/\s+/g,'').trim().charAt(k+1);
               var d = currVl.replace(/\s+/g,'').trim().charAt(k+2);
               var t = currVl.replace(/\s+/g,'').trim().charAt(k+3);
               var h = currVl.replace(/\s+/g,'').trim().charAt(k+4);
               var f = currVl.replace(/\s+/g,'').trim().charAt(k+5); 
               if(w+y+d+t+h+f =='width:'){   
                  var numTemp = '';  
                  var chkNum = /^-?\d+$/; 
                  for(var j = k+7; j <currVl.replace(/\s+/g,'').trim().length; j++){  
                     if(currVl.replace(/\s+/g,'').trim().charAt(j)=='%' || currVl.replace(/\s+/g,'').trim().charAt(j)=='"')
                     break; 
                     if(chkNum.test(currVl.replace(/\s+/g,'').trim().charAt(j)) == false && currVl.replace(/\s+/g,'').trim().charAt(j) !='.'){
                        numTemp='0';
                        break
                     }
                     if(Number.isFinite(parseInt(currVl.replace(/\s+/g,'').trim().charAt(j))) || currVl.replace(/\s+/g,'').trim().charAt(j)=='.'){  
                        numTemp += currVl.replace(/\s+/g,'').trim().charAt(j);
                     } 
                  } 
                  widthSum += parseFloat(numTemp);  
                  numTemp='';
               }
            }  
         }); 
         arrTemp.forEach(function(currVl,idx){ 
            for(var k =0 ; k< currVl.replace(/\s+/g,'').trim().length; k++){
               var w = currVl.replace(/\s+/g,'').trim().charAt(k);
               var y = currVl.replace(/\s+/g,'').trim().charAt(k+1);
               var d = currVl.replace(/\s+/g,'').trim().charAt(k+2);
               var t = currVl.replace(/\s+/g,'').trim().charAt(k+3);
               var h = currVl.replace(/\s+/g,'').trim().charAt(k+4);
               var f = currVl.replace(/\s+/g,'').trim().charAt(k+5); 
               if(w+y+d+t+h+f =='width:'){   
                  var numTemp = '';    
                  var textTemp =''; 
                  var chkNum2 = true;
                  for(var j = k+7; j <currVl.replace(/\s+/g,'').trim().length; j++){  
                     var textTemp2 ='';
                     var chkNum = /^-?\d+$/;   
                     if(chkNum.test(currVl.replace(/\s+/g,'').trim().charAt(j))==false && currVl.replace(/\s+/g,'').trim().charAt(j) !='.'  && currVl.replace(/\s+/g,'').trim().charAt(j)!='"' && currVl.replace(/\s+/g,'').trim().charAt(j)!='%'){
                        console.log(currVl.replace(/\s+/g,'').trim().charAt(j))
                        chkNum2=false;
                        break;
                     } 
                     if(currVl.replace(/\s+/g,'').trim().charAt(j)=='"'){
                        var textTemp1 = currVl.replace(/\s+/g,'').trim().slice(j)  
                        var textTemp2 = currVl.replace(textTemp1,'%'+textTemp1);
                        beforContent = beforContent.replace(currVl,textTemp2);
                        break;
                     }
                     if(currVl.replace(/\s+/g,'').trim().charAt(j)=='%' || currVl.replace(/\s+/g,'').trim().charAt(j)=='"' )
                     break;
                     if(Number.isFinite(parseInt(currVl.replace(/\s+/g,'').trim().charAt(j))) || currVl.replace(/\s+/g,'').trim().charAt(j)=='.'){  
                        numTemp += currVl.replace(/\s+/g,'').trim().charAt(j);
                     } 
                  }  
                  if(chkNum2){
                   var num = ((parseFloat(numTemp)*100)/widthSum).toString();  
                   num= Number(num).toFixed(4);
                   console.log(widthSum)
                   console.log(num)
                   textTemp = currVl.replaceAll(numTemp +'%' , num+'%');  
                   numTemp='';
                   beforContent = beforContent.replaceAll(currVl,textTemp);  
                   document.getElementById("content").value = beforContent;
                  }
                   
               }
            } 
         });  
         arrTemp=[];
         widthSum = 0;
      }
   }
}
function logClear(){
   $('#content').val('');
   if(document.querySelector("#otherVl")){
      $("#otherVl").remove();
   }
   $('#gridWidth option').prop('selected', function () { 
      return this.defaultSelected;
  }); 
}
function closeDialog(){
   document.querySelector("dialog").close();
} 
 
function GetSumPercent(){
   beforContent = document.getElementById("content").value;
   var gridHdIdx = beforContent.indexOf(gridHeader);
   if(gridHdIdx!=-1){
      var arrTemp =[];
      for(var i=gridHdIdx+11; i < beforContent.length; i++){
         var strTemp1 ="";
         
         if(beforContent.charAt(i)=='\n'){
            for(var j = i+1; j<beforContent.length; j++){
                strTemp1 += beforContent.charAt(j);  
               if(beforContent.charAt(j+1) == '\n'){  
               break;
               }  
            } 
            if(strTemp1.replace(/\s+/g,'').trim().indexOf('width:')!=-1){
               arrTemp.push(strTemp1);
            }
         }
         if(beforContent.charAt(i)==']' && beforContent.charAt(i+1)=='1'){
            break
         }
      }
      var widthSum = 100;
      if(arrTemp.length>0){ 
         widthSum = 0;
         arrTemp.forEach(function(currVl,idx){
            for(var k =0 ; k< currVl.replace(/\s+/g,'').trim().length; k++){
               var w = currVl.replace(/\s+/g,'').trim().charAt(k);
               var y = currVl.replace(/\s+/g,'').trim().charAt(k+1);
               var d = currVl.replace(/\s+/g,'').trim().charAt(k+2);
               var t = currVl.replace(/\s+/g,'').trim().charAt(k+3);
               var h = currVl.replace(/\s+/g,'').trim().charAt(k+4);
               var f = currVl.replace(/\s+/g,'').trim().charAt(k+5); 
               if(w+y+d+t+h+f =='width:'){   
                  var numTemp = '';  
                  var chkNum = /^-?\d+$/; 
                  for(var j = k+7; j <currVl.replace(/\s+/g,'').trim().length; j++){  
                     if(currVl.replace(/\s+/g,'').trim().charAt(j)=='%' || currVl.replace(/\s+/g,'').trim().charAt(j)=='"')
                     break; 
                     if(chkNum.test(currVl.replace(/\s+/g,'').trim().charAt(j)) == false && currVl.replace(/\s+/g,'').trim().charAt(j) !='.'){
                        numTemp='0';
                        break
                     }
                     if(Number.isFinite(parseInt(currVl.replace(/\s+/g,'').trim().charAt(j))) || currVl.replace(/\s+/g,'').trim().charAt(j)=='.'){  
                        numTemp += currVl.replace(/\s+/g,'').trim().charAt(j);
                     } 
                  } 
                  widthSum += parseFloat(numTemp);  
                  numTemp='';
               }
            }  
         }); 
      }
      return widthSum
   }
}

function convertMainTable(){
   document.querySelector('.reSult2').innerHTML="";
   inputData = document.getElementById('content').value;
   inputData = inputData.replace(/icon-search/g, 'search-icon');
   inputData = inputData.replace(/doaction-point/g, 'doaction on'); 
   $(".reSult2").append(inputData);
   var tr = document.getElementsByTagName("tr");
   if(tr){
       for(var i =0 ; i < tr.length; i++){
           var cells = tr[i].cells;
           if(cells){
               for(var j =0; j < cells.length; j++){
                   var div = document.createElement('div');
                   var span = document.createElement('span');
                   div.setAttribute("class","wide-td");
                   span.setAttribute("class","main-inputbox");
                   if(cells[j].nodeName=="TD"){
                       var isSearchIcon = false;
                       var isDatepicker = false;
                       var isMandatory = false;
                       var isRadio = false;
                       var isCheckBox = false;
                       var isSelect = false;
                       if(cells[j].children){
                           for(var k = 0; k < cells[j].children.length; k++){
                               for(var t = 0; t < cells[j].children[k].attributes.length; t++){ 
                                   if (cells[j].children[k].attributes[t].name == "class" && cells[j].children[k].attributes[t].textContent.includes("selection-grp")) {
                                       if(cells[j].children[k].outerHTML.indexOf('type="radio"')!=-1){
                                           cells[j].children[k].setAttribute("class", cells[j].children[k].attributes[t].textContent + " radio-wrap")
                                           span.setAttribute("class", span.classList + " radio");
                                       }
                                       if(cells[j].children[k].outerHTML.indexOf('type="checkbox"')!=-1){
                                           cells[j].children[k].setAttribute("class", cells[j].children[k].attributes[t].textContent + " check-wrap")
                                           span.setAttribute("class", span.classList + " checkbox");
                                       }
                                      for(var g = 0; g < cells[j].children[k].children.length; g++){
                                       var itg = document.createElement('i');
                                       if(cells[j].children[k].children[g].nodeName=="LABEL"){
                                           cells[j].children[k].children[g].insertBefore(itg, cells[j].children[k].children[g].childNodes[0]);  
                                           }
                                        } 
                                   }  
                                   if(cells[j].children[k].outerHTML.indexOf("<select")!=-1){  
                                       isSelect = true;
                                   }
                                   if (cells[j].children[k].attributes[t].name == "class" && cells[j].children[k].attributes[t].textContent == "search-icon") {
                                       isSearchIcon = true;
                                   }
                                   if (cells[j].children[k].attributes[t].name == "data-nx" && cells[j].children[k].attributes[t].textContent.indexOf("type:'date'") != -1) {
                                       isDatepicker = true;
                                   }
                                   if (cells[j].children[k].attributes[t].name == "data-nx" && cells[j].children[k].attributes[t].textContent.indexOf("required:true") != -1) {
                                       isMandatory = true;
                                   }
                                   if (cells[j].children[k].attributes[t].name == "type" && cells[j].children[k].attributes[t].textContent == "radio") {
                                       isRadio = true;
                                   }
                                   if (cells[j].children[k].attributes[t].name == "type" && cells[j].children[k].attributes[t].textContent == "checkbox") {
                                       isCheckBox = true;
                                   }
                               } 
                           }
                       }
                       if (isSearchIcon) span.setAttribute("class", span.classList + " search");
                       if (isDatepicker) span.setAttribute("class", span.classList + " datepicker");
                       if (isMandatory) span.setAttribute("class", span.classList + " mandatory");
                       if (isRadio) span.setAttribute("class", span.classList + " radio");
                       if (isCheckBox) span.setAttribute("class", span.classList + " checkbox"); 
                       if (isSelect)  span.setAttribute("class", span.classList + " select"); 
                       span.innerHTML=cells[j].innerHTML;
                       div.appendChild(span);
                       cells[j].innerHTML = "";
                       cells[j].append(div);
                   }
               }
           }
       }
   }
   var strResult = document.querySelector('.reSult2').innerHTML;
   strResult = strResult.replace(/checked=""/g, 'checked');
   strResult = strResult.replace(/readonly=""/g, 'readonly');
   strResult = strResult.replace(/disabled=""/g, 'disabled');
   strResult = strResult.replace(/hidden=""/g, 'hidden');
   document.getElementById('reSult').value = strResult; 
}