var beforContent =""; 
var afterContent =""
var cntTemp = '';
function convertGrid(){ 
   beforContent = document.getElementById("content").value;
   afterContent = document.getElementById("content").value;  
    var dynamicGrid = beforContent.search('dynamicGrid')
    var numberingTitleText = beforContent.search('numberingTitleText')
    var totalCntString = beforContent.search('totalCntString')
    var toolbarPosition = beforContent.search('toolbarPosition')
    var gridHdr = beforContent.search('gridHeader')
    var grid = beforContent.trim().search('grid:') 
    var gridHeader = 'gridHeader:'; 
    var gridBody = beforContent.trim().search('gridBody:');
    var space =" ";
    var arrLg =[];
    if(gridHdr >0){
    for(var i = gridHdr-2; i > 0; i--) {
      // debugger 
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
      afterContent = afterContent.replace('totalCntString' + cntTemp,'totalCntString: "Total %d result(s)"'); 
      cntTemp = '';
   }else{ 
      afterContent = afterContent.replace(gridHeader,'totalCntString: "Total %d result(s)", \n' +space + gridHeader); 
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
    toolbarId = toolbarId.replace(/\s+/g,'').trim();
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
         k = (parseInt(p)*1280/100).toString(); 
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
            c += beforContent.charAt(w) 
            
         } 
         var r='' 
            for(var k = i; k <beforContent.length; k++){ 
               if((beforContent.charAt(k)== ',') || (beforContent.charAt(k)=='}' && beforContent.charAt(k+1).trim()==','))
               break;
               r += beforContent.charAt(k) 
            } 
            var dtTmp = r.trim().replace('name:','');
            
            // if(c.indexOf('align:')==-1){  
            //    if((dtTmp.startsWith('"%$')== false || dtTmp.substring(dtTmp.length-3) !='$%"')&& (dtTmp.replace(/"/g,'').trim()!='')){  
            //       var tmp = r.replace(dtTmp.replace(/"/g,''),'%$'+dtTmp.replace(/"/g,'')+':nokey$%')
            //       arrLg.push(dtTmp.replace(/"/g,''));
            //       afterContent = afterContent.replace(r,tmp+',align:"left"');    
            //    }else{
            //       if(dtTmp.replace(/"/g,'').trim()!='')
            //       afterContent = afterContent.replace(r, r+',align:"left"');  
            //    }
            //    r = '';
            // }else{
               if((dtTmp.startsWith('"%$')== false || dtTmp.substring(dtTmp.length-3) !='$%"')&& (dtTmp.replace(/"/g,'').trim()!='')){ 
                  var tmp = r.replace(dtTmp.replace(/"/g,''),'%$'+dtTmp.replace(/"/g,'')+':nokey$%')  
                  arrLg.push(dtTmp.replace(/"/g,''));
                  afterContent = afterContent.replace(r,tmp); 
               }
            // } 
       } 
      
      // afterContent = afterContent.replace(c,c+',align: left'); 
      document.getElementById("reSult").value = afterContent
   } 
   if(gridBody>0){
      beforContent = afterContent; 
      var girBdIndx = beforContent.indexOf('gridBody:');
      for(var i = girBdIndx; i<beforContent.length; i++){
         var b=''; 
         if(beforContent.charAt(i)=='\n'){
            for(var j = i+1; j<beforContent.length; j++){
               b += beforContent.charAt(j);
                var c = beforContent.trim().slice(j)
                  //  c = c.replace(/\n|\r/g, "");
                   c = c.replace(/\s+/g,'').trim();
               if(beforContent.charAt(j+1) == '\n' && (c.charAt(0)==','|| c.charAt(0)==']') ){  
               break;
               }
               
            }
            if(b.charAt(b.length-1)==']'){ 
               return true;
            }
            if(b.indexOf('align:')==-1 && b.replace(/\s+/g,'').trim() !='}'){
               var tmp1 = b.replace(/\s+/g,'').trim();
               var tmp2 = b;
               if(tmp1.indexOf('dataNX') !=-1 && tmp1.indexOf('type:"num"') != -1){
                  tmp2 = b.replace(b.slice(b.length-2),',align:"right"'+ b.slice(b.length-2));
               } else{
                  tmp2 = b.replace(b.slice(b.length-2),',align:"left"'+ b.slice(b.length-2));
               } 
               afterContent = afterContent.replace(b,tmp2); 
               // console.log('tmp',tmp);
             }
         }
      }
      document.getElementById("reSult").value = afterContent  
   } 
   arrLg = [];  
}else{
   alert("data is not valid");
}

}

function closeDialog(){
   document.querySelector("dialog").close();
}
// function clickToCopy(e) {
//    let input = document.createElement('input')  
//    document.body.appendChild(input)  
//    input.value = document.getElementById("test").value // gán giá trị vào input
//    input.select()  // focus vào input
//    document.execCommand('copy')  
//    input.remove()  
// }
 


