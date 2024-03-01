var exelInfo = [];
var listCol = [];
var listTbl = [];

function showInput(e) {
    if (e.value == 'other') {
        $(".other").prepend('<input id ="otherVl" type ="number" required placeholder="0000">');
    } else {
        if (document.querySelector("#otherVl")) {
            $("#otherVl").remove();
        }
    }
}

function getMapping() {
    // Get the value from Input 1   
    const file = document.getElementById('fileMapping');
    resetField();
    parseExcel(file.files[0]);
}

function parseQuery() {
    const content = document.getElementById('content');
    const reSult = document.getElementById('mappingInfo');
    let strQuery = content.value.toUpperCase();

    strQuery = strQuery.replaceAll('||', '\+');
    strQuery = strQuery.replaceAll('(+)', '');
    strQuery = strQuery.replaceAll('NULLS LAST', '');
    strQuery = strQuery.replaceAll(' +.99999 ', ' ');
    strQuery = strQuery.replaceAll(' +.0 ', ' '); 
    

    while (strQuery.indexOf('  ') > -1) {
        strQuery = strQuery.replaceAll('  ', ' ');
    }

    listCol = [];
    listTbl = [];


    var sqlParser = window.sqlParser;
    var ast = sqlParser.parse(strQuery);
    var sql = sqlParser.stringify(ast);
    console.log(ast);


    let result = '';
    listTbl.forEach(tb => {
        listCol.forEach(col => {
            if (col.TableName == tb.Alias) {
                col.TableName = tb.TableName;
            }
        });
    });

    // Mapping for Excel Info
    exelInfo.forEach(excel => {
        if (excel.SubObjectId) {
            excel = findColInfo(ast, excel);
        }
    });

    //findColInfo(ast, exelInfo[24]);

    var tbody = '<tr><th>No.</th><th>Object ID</th><th>Sub Object ID</th><th>Display Name</th><th>Table Info</th><th>Field Info</th><th>Field Alias</th></tr>';

    exelInfo.forEach((excel, idx) => {
        let tr = '<tr>';
        tr += '<td>' + (idx + 1) + '</td>';
        tr += '<td>' + excel.ObjectId + '</td>';
        tr += '<td>' + excel.SubObjectId + '</td>';
        tr += '<td>' + excel.DisplayName + '</td>';
        tr += '<td>' + (excel.TableName ? excel.TableName : '') + '</td>';
        tr += '<td>' + excel.ColName + '</td>';
        tr += '<td>' + excel.ColAlias + '</td>';
        tr += '</tr>';
        tbody += tr;
    });
    reSult.innerHTML = tbody;

}

function findColInfo(ast, excel, isSubSelect) {

    //Check select list
    ast.value.selectItems.value.forEach((val) => {
        let colObj;
        if (val.alias == 'CARRIER' && excel.ObjectId.toUpperCase() == "CARRIER")
            console.log(val);

        if (val.type == 'Identifier') {
            colObj = parseColumn(val.value);
        } else if (val.type == 'FunctionCall') {
            if (val.name == 'TO_CHAR') {
                if (val.params[0].type == 'Identifier') {
                    colObj = parseColumn(val.params[0].value);
                } else if (val.params[0].type == 'SubQuery') {
                    findColInfo(val.params[0], excel, val.alias);
                }
            } else if(val.name == 'DECODE'){
                if (val.params[2].type == 'Identifier') {
                    colObj = parseColumn(val.params[2].value);
                } else if (val.params[2].type == 'SubQuery') {
                    findColInfo(val.params[2], excel, val.alias);
                }
            }
        } else if (val.type == 'SubQuery') {
            if (val.alias == excel.ColAlias || val.alias == excel.ObjectId.toUpperCase()) {
                findColInfo(val, excel, val.alias);
            }

        } else if (val.type == 'CaseWhen') {
            
            if (val.alias == excel.ColAlias || val.alias == excel.ObjectId.toUpperCase()) {
                val.whenThenList.value.forEach((t) => {
                    if (t.then.type != 'String') {
                        findColInfo(t.then, excel, t.then.type == 'SubQuery' ? val.alias : ''); 
                        return;
                    }
                });
            }
        }

        if(!colObj) return;

            if(isSubSelect == excel.ColAlias || isSubSelect == excel.ObjectId.toUpperCase()){
                excel.ColName = colObj.colNm;
                excel.TableName = colObj.tbNm;
                return;
            }else 
                if(val.alias == excel.ColAlias || val.alias == excel.ObjectId.toUpperCase() || colObj.colNm == excel.ColAlias){
                excel.ColName = colObj.colNm;
                excel.TableName = colObj.tbNm;
            }

    });

    //Check from list
    ast.value.from.value.forEach((val) => {
        if (val.value.value.type == 'Identifier') {
            if (val.value.alias.value == excel.TableName) {
                excel.TableName = val.value.value.value;
            }
        } else if (val.value.value.type == 'SubQuery') {
            findColInfo(val.value.value, excel);
        }
    });
   

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
    u('#reSult').first().value = '';
    u('#reSult').removeClass('warning');
    u('#warningZone').first().innerText = '';
}

async function parseExcel(file) {
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
                    excel.ColName = excel.ObjectId.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
                }
                excel.ColAlias = excel.ColName;
                exelInfo.push(excel);
            }
            parseQuery();
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