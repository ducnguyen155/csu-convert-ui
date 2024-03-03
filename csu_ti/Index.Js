var exelInfo = [];
var listFunction1P = ['REPLACE', 'TO_CHAR', 'SUM', 'MAX', 'MIN', 'COUNT', 'NVL'];
var listFunction2P = ['DECODE'];

function getMapping() {
    // Get the value from Input 1   
    const file = document.getElementById('fileMapping');
    resetField();
    parseExcel(file.files[0], parseQueryObj);
}

function parseQueryObj() {
    const content = document.getElementById('content');
    let strQuery = content.value.toUpperCase();

    strQuery = strQuery.replaceAll('||', '\+');
    strQuery = strQuery.replaceAll('(+)', '');
    strQuery = strQuery.replaceAll('NULLS LAST', '');
    strQuery = strQuery.replaceAll('&LT;', '<'); // Change &LT; to <
    strQuery = strQuery.replaceAll('&GT;', '>'); // Change &GT; to >
    strQuery = strQuery.replaceAll('<>', '!='); // Change &GT; to > 

    strQuery = strQuery.replace(/(?:\+|\-)\s*?(?:\d+\.\d+|\.\d+)/g, ""); //Remove + .99999 and .0
    strQuery = strQuery.replace(/<FOREACH[^>]*>/g, '('); // <foreach> to (
    strQuery = strQuery.replace(/<\/FOREACH[^>]*>/g, ')'); // </foreach> to )
    strQuery = strQuery.replace(/<[^>][^\n]*>/g, ''); // Remove tag xml
    strQuery = strQuery.replace(/#(\{[^}]+\})/g, "'$1'"); // Change params #{p} to '{p}'
    strQuery = strQuery.replace(/--.*/g, ''); // Remove comment --


    try {
        if (strQuery.trim().length > 0) {
            var sqlParser = window.sqlParser;
            var ast = sqlParser.parse(strQuery);
            //var sql = sqlParser.stringify(ast);
            //console.log(ast);
            // Mapping for Excel Info
            exelInfo.forEach(excel => {
                if (excel.SubObjectId) {
                    excel = findColInfo(ast, excel);
                }
            });
            //findColInfo(ast, exelInfo[22]);    
        }
    } catch (error) {
        console.log(error);
        u('#warningZone').first().innerText = error;
        parseQueryString();
    }
    showExcelInfo();
}


function showExcelInfo() {
    const reSult = document.getElementById('mappingInfo');
    var tbody = '';

    exelInfo.forEach((excel, idx) => {
        let tr = (idx % 2 == 0 ? '<tr>' : '<tr>');
        if(excel.FoundFlag == 2){
            tr += '<td class="text-center"><button class="btn btn-success btn-sm" onclick="copyFn(' + idx + ')">'+ (idx + 1) +'</button></td>';
        }else{
            tr += '<td class="text-center"><button class="btn btn-warning btn-sm" onclick="copyFn(' + idx + ')">'+ (idx + 1) +'</button></td>';
        }
        tr += '<td>' + excel.ObjectId + '</td>';
        tr += '<td>' + excel.SubObjectId + '</td>';
        tr += '<td>' + excel.DisplayName + '</td>';
        tr += '<td>' + (excel.TableName ? excel.TableName : '') + '</td>';
        tr += (excel.ColName != excel.ColAlias ? '<td class="warning">' : '<td>') + excel.ColName + '</td>';
        tr += '<td>' + excel.ColAlias + '</td>';
        tr += '</tr>';
        tbody += tr;
    });
    reSult.innerHTML = tbody;
}

function copyFn(idx) {
    let excel = exelInfo[idx];
    var copyText = excel.TableName + '\t' + excel.ColAlias;
    navigator.clipboard.writeText(copyText);
}

function findColInfo(ast, excel, subQueryName) {

    if (!ast.value || excel.FoundFlag == 2) return;


    //Check select list
    for(let i= 0; i< ast.value.selectItems.value.length; i++){
        if(excel.FoundFlag == 2) return;
        let val = ast.value.selectItems.value[i];
         //console.log(val);
         let colObj;
         // if (val.alias == 'NVL' && excel.ObjectId.toUpperCase() == "NVL")
         //     console.log(val);
 
         if (val.type == 'Identifier') {
             colObj = parseColumn(val.value);
         } else if (val.type == 'FunctionCall') {
             let value;
             if (listFunction1P.indexOf(val.name) >= 0) {
                 value = val.params[0];
             } else if (listFunction2P.indexOf(val.name) >= 0) {
                 value = val.params[2];
             }
 
             if (value) {
                 if (value.type == 'Identifier') {
                     colObj = parseColumn(value.value);
                 } else if (value.type == 'SubQuery') {
                     findColInfo(value, excel, val.alias);
                 } else if (value.type == 'FunctionCallParam') {
                     colObj = parseColumn(value.value.value);
                 }
             }
 
         } else if (val.type == 'SubQuery') {
             if (compareColumn(val.alias, excel)) {
                 findColInfo(val, excel, val.alias);
             }
 
         } else if (val.type == 'CaseWhen') {
 
             if (compareColumn(val.alias, excel)) {
                 let identifier =  val.whenThenList.value.find((e)=>{ return e.then.type == 'Identifier' });
                 let subQuery =  val.whenThenList.value.find((e)=>{ return e.then.type == 'SubQuery' });
     
                 if(identifier){
                     colObj = parseColumn(identifier.then.value);
                 }else if(subQuery){
                     findColInfo(subQuery.then, excel, subQuery.then.type == 'SubQuery' ? val.alias : '');
                 }
                 
             }
         }
 
         if (!colObj) continue;
 
         if (compareColumn(subQueryName, excel)) { //Select Sub query
             excel.ColName = colObj.colNm;
             excel.TableName = colObj.tbNm;
             excel.FoundFlag = 1;
             break;
         } else if (compareColumn(val.alias, excel) || colObj.colNm == excel.ColAlias) {
             excel.ColName = colObj.colNm;
             excel.TableName = colObj.tbNm;
             excel.FoundFlag = 1;
             break;
         }
    }


    if (excel.FoundFlag == 2) return;
    // Check from list

    for(let i= 0; i< ast.value.from.value.length; i++){
        let val = ast.value.from.value[i];
        if (val.value.value.type == 'Identifier') {
            if (val.value.alias && val.value.alias.value == excel.TableName) {
                excel.TableName = val.value.value.value;
                 excel.FoundFlag = 2;
                 return;
            }
        } else if (val.value.value.type == 'SubQuery') {
            if(val.value.alias && val.value.alias.value == excel.TableName){
                excel.SubColAlias = excel.ColName;
            }
            findColInfo(val.value.value, excel);
        }
    }  

    // Only select from 1 table and no table alias
    if (excel.FoundFlag == 1 && excel.TableName == '' && ast.value.from.value.length == 1) {
        excel.TableName = ast.value.from.value[0].value.value.value;
        excel.FoundFlag = 2;
    }
}

function compareColumn(aliasNm, excel) { 
    if(excel.SubColAlias && aliasNm == excel.SubColAlias){
        return 1;
    }else if (aliasNm == excel.ColAlias || aliasNm == excel.ObjectId.toUpperCase()) {
        if (aliasNm == excel.ObjectId.toUpperCase()) {
            excel.ColAlias = excel.ObjectId;
        }
        return 1;
    } else {
        return 0;
    }

}


function parseColumn(val) {
    let colArr = val.split('.');
    let colNm, tbNm;

    if (colArr.length == 2) {
        tbNm = colArr[0]
        colNm = colArr[1];
    } else {
        tbNm = ''
        colNm = colArr[0];
    }

    return { colNm, tbNm }
}

function resetField() {
    u('#mappingInfo').first().innerText = '';
    u('#warningZone').first().innerText = '';
}

async function parseExcel(file, fParseQuery) {
    var reader = new FileReader();
    var colObjectId = 2,
        colSubObjectId = 3,
        colDisplayName = 4,
        colTableName = 5,
        colColName = 6;

    exelInfo = [];


    reader.onload = function (e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {
            type: 'binary'
        });

        workbook.SheetNames.forEach(function (sheetName) {
            // Here is your object
            var ws = workbook.Sheets[sheetName];

            var variable = XLSX.utils.decode_range(ws["!ref"]);
            for (var R = 4; R <= variable.e.r; R++) {

                let excel = {};
                excel.ObjectId = ws[ec(R, colObjectId)].v;
                excel.SubObjectId = ws[ec(R, colSubObjectId)].v;
                excel.DisplayName = ws[ec(R, colDisplayName)].v;
                excel.TableName = ws[ec(R, colTableName)] ? ws[ec(R, colTableName)].v : '';
                excel.ColName = ws[ec(R, colColName)] ? ws[ec(R, colColName)].v : '';
                if (!excel.ColName) {
                    excel.ColName = excel.ObjectId.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
                }
                excel.ColAlias = excel.ColName;
                exelInfo.push(excel);
            }
            fParseQuery();
        })

    };

    reader.onerror = function (ex) {
        console.log(ex);
    };

    reader.readAsBinaryString(file);
}

function ec(r, c) {
    return XLSX.utils.encode_cell({ r: r, c: c });
}

function parseQueryString() {
    const content = document.getElementById('content');
    let strQuery = content.value.toUpperCase();
    while (strQuery.indexOf('  ') > -1) {
        strQuery = strQuery.replaceAll('  ', ' ');
    }
    const lines = strQuery.split('\n');

    var listCol = [];
    var listTbl = [];
    var canSelect = 0,
        whereFlag = 0;

    lines.forEach(line => {

        //Skip
        if (line.indexOf('<') > -1) return;

        //SELECT flag
        if (line.toUpperCase().indexOf('SELECT') > -1) {
            canSelect++;
        }

        //FROM flag
        if (line.toUpperCase().indexOf('FROM') > -1) {
            canSelect--;
        }

        //WHERE flag
        if (line.toUpperCase().indexOf('WHERE ') > -1) {
            whereFlag = 1;
        }

        if (canSelect > 0) {
            //Get column
            listCol = listCol.concat(getColumnInfo(line));
            whereFlag = 0;
        } else if (whereFlag == 0) {
            //Get Table
            listTbl = listTbl.concat(getTableInfo(line));
        }


    });

    listTbl.forEach(tb => {
        listCol.forEach(col => {
            if (col.TableName == tb.Alias) {
                col.TableName = tb.TableName;
            }
        });
    });

    //Mapping for Excel Info
    exelInfo.forEach(excel => {
        listCol.forEach(col => {
            if (excel.TableName == '' && col.ColAlias == excel.ColName) {
                excel.TableName = col.TableName;
                excel.ColName = col.ColName;
            }
        });
    });
}

function getColumnInfo(line) {
    line = line.replaceAll('SELECT ', '');
    line = line.replaceAll('FROM (', '');
    line = line.replaceAll('FROM', '');

    if (line.indexOf('TO_CHAR') > -1) {
        line = line.replaceAll('TO_CHAR(', '');
        line = line.replaceAll(", 'YYYYMMDD')", '');
    }


    line = line.trim();
    let cols = line.split(',');

    let listCol = [];
    let colTemp = '';
    cols.forEach(col => {
        if (col == ' ') return;
        let temp = col.trim().split('.');
        let colInfo = {};
        //Has alias table name
        if (temp.length > 1) {
            colInfo.TableName = temp[0];
            colTemp = temp[1];
        } else {
            colInfo.TableName = '';
            colTemp = temp[0];
        }

        let colArr = colTemp.split(' AS ');
        if (colArr.length > 1) {
            colInfo.ColName = colArr[0];
            colInfo.ColAlias = colArr[1];
        } else {
            colInfo.ColName = colArr[0];
            colInfo.ColAlias = colArr[0];
        }


        listCol.push(colInfo);
    });
    return listCol;
}

function getTableInfo(line) {
    line = line.replaceAll('FROM ', '');
    let listTable = [];
    let tables = line.split(',');
    tables.forEach(table => {
        if (table.trim() == '') return;
        let temp = table.trim().split(' ');
        let tableInfo = {};
        if (temp.length > 1) {
            tableInfo.TableName = temp[0];
            tableInfo.Alias = temp[1];
        } else {
            tableInfo.TableName = temp[0];
            tableInfo.Alias = '';
        }
        listTable.push(tableInfo);
    });
    return listTable;
}