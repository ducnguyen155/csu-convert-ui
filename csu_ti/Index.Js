var exelInfo = [];
var listFunction1P = ['REPLACE', 'TO_CHAR', 'SUM', 'MAX', 'MIN', 'COUNT', 'NVL', 'ROUND', 'TO_DATE', 'SUBSTR', 'COALESCE'];
var listFunction3P = ['DECODE'];
var listTempTable = [];

function getMapping() {
    // Get the value from Input 1   
    const file = document.getElementById('fileMapping');
    resetField();
    parseExcel(file.files[0], parseQueryObj);
}

function parseQueryObj() {
    const content = document.getElementById('content');
    let strQuery = content.value.toUpperCase();
    while (strQuery.indexOf('  ') > -1) {
        strQuery = strQuery.replaceAll('  ', ' ');
    }
    strQuery = strQuery.replaceAll('||', '\+');
    strQuery = strQuery.replaceAll('(+)', '');
    strQuery = strQuery.replaceAll('NULLS LAST', '');
    strQuery = strQuery.replaceAll('&LT;', '<'); // Change &LT; to <
    strQuery = strQuery.replaceAll('&GT;', '>'); // Change &GT; to >
    strQuery = strQuery.replaceAll('<>', '!='); // Change &GT; to > 
    strQuery = strQuery.replaceAll('FULL OUTER', ''); // Change &GT; to > 

    strQuery = strQuery.replace(/(?:\+|\-)\s*?(?:\d+\.\d+|\.\d+)/g, ""); //Remove + .99999 and .0
    strQuery = strQuery.replace(/<FOREACH[^>]*>/g, '('); // <foreach> to (
    strQuery = strQuery.replace(/<\/FOREACH[^>]*>/g, ')'); // </foreach> to )
    strQuery = strQuery.replace(/<[^>][^\n]*>/g, ''); // Remove tag xml
    strQuery = strQuery.replace(/#(\{[^}]+\})/g, "'$1'"); // Change params #{p} to '{p}'
    strQuery = strQuery.replace(/--.*/g, ''); // Remove comment 

    try {
        if (strQuery.trim().length > 0) {
            strQuery = parseTempQuery(strQuery);
            var sqlParser = window.sqlParser;
            var ast = sqlParser.parse(strQuery);
            //var sql = sqlParser.stringify(ast);
            //console.log(ast);
            // Mapping for Excel Info
            exelInfo.forEach(excel => {
                findColInfo(ast, excel);
            });
            //findColInfo(ast, exelInfo[22]);    

            for (let i = listTempTable.length - 1; i >= 0; i--) {
                let tempTable = listTempTable[i];
                exelInfo.forEach(excel => {
                    if (excel.TableName == tempTable.key) {
                        excel.FoundFlag = 0;
                        findColInfo(tempTable.ast, excel);
                    }
                });
            }

        }
    } catch (error) {
        console.log(error);
        u('#warningZone').first().innerText = error;
        parseQueryString();
    }
    showExcelInfo();
}

function parseTempQuery(strQuery) {
    listTempTable = [];
    strQuery = strQuery.trim();
    
    let strTempQuery;
    if (strQuery.startsWith('WITH ')) {
        strQuery = strQuery.substring('WITH '.length, strQuery.length);
        const regexPattern = /\s*([^\s(]+)\s*\n*AS\s*\(/g;

        const match = strQuery.match(regexPattern);
        let endIdx = 1;

        match.forEach(m => {
            let strIdx = strQuery.indexOf(m);
            let stop = 1;
            for (let i = strIdx + m.length; strQuery.length; i++) {
                if (strQuery[i] == '(') {
                    stop++;
                } else if (strQuery[i] == ')') {
                    stop--;
                }

                if (stop == 0) {
                    endIdx = i;
                    break;
                }
            }
            strTempQuery = strQuery.substring(strIdx + m.length, endIdx);
            strQuery = strQuery.substring(endIdx + 1, strQuery.length);
            let sqlParser = window.sqlParser;
            let ast = sqlParser.parse(strTempQuery);
            let queryObj = {
                key: m.replace(' AS (', '').trim(),
                ast: ast
            };
            listTempTable.push(queryObj);

        });
    }
    return strQuery;
}


function showExcelInfo() {
    const reSult = document.getElementById('mappingInfo');
    var tbody = '';

    exelInfo.forEach((excel, idx) => {
        let tr = (idx % 2 == 0 ? '<tr>' : '<tr>');
        if (excel.FoundFlag == 2) {
            tr += '<td class="text-center"><button class="btn btn-success btn-sm" onclick="copyFn(' + idx + ')">' + (idx + 1) + '</button></td>';
        } else {
            tr += '<td class="text-center"><button class="btn btn-warning btn-sm" onclick="copyFn(' + idx + ')">' + (idx + 1) + '</button></td>';
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
    var copyText = excel.TableName + '\t' + excel.ColName;
    navigator.clipboard.writeText(copyText);
}

function getFunctionCallValue(val, excel) {
    let value;
    for (let pIdx = 2; pIdx < val.params.length; pIdx += 2) {
        if (val.params[pIdx].type == 'Identifier' || val.params[pIdx].type == 'SubQuery') {
            value = val.params[pIdx];
            break;
        }
    }
    if (!value) {
        if (val.params[val.params.length - 1].type == 'Identifier') {
            value = val.params[val.params.length - 1];
        } else {
            value = val.params[0];
        }
    }
    return value;
}

function findColInfo(ast, excel, subQueryName) {
    if (excel.FoundFlag == 2) return;

    let query = ast.value || ast;

    if (!query) return;

    if (query.type == "Union") {
        findColInfo(query.left, excel);
        findColInfo(query.right, excel);
        return;
    }

    //Check select list
    for (let i = 0; i < query.selectItems.value.length; i++) {
        if (excel.FoundFlag == 2) return;
        let val = query.selectItems.value[i];
        //console.log(val);
        let colObj;
        // if (val.alias == 'NVL' && excel.ObjectId.toUpperCase() == "NVL")
        //     console.log(val);

        let tempVal = val;
        while (tempVal) {
            if (tempVal.type == 'Identifier') {
                colObj = parseColumn(tempVal.value);
            } else if (tempVal.type == 'FunctionCall') {
                let value;
                if (listFunction1P.indexOf(tempVal.name) >= 0) {
                    value = tempVal.params[0];
                } else if (listFunction3P.indexOf(tempVal.name) >= 0) {
                    value = getFunctionCallValue(tempVal, excel);
                }

                if (value) {
                    if (value.type == 'Identifier') {
                        colObj = parseColumn(value.value);
                    } else if (value.type == 'SubQuery') {
                        findColInfo(value, excel, tempVal.alias);
                    } else if (value.type == 'FunctionCallParam') {
                        colObj = parseColumn(value.value.value);
                    } else if (value.type == 'FunctionCall') {
                        tempVal = value;
                        continue;
                    }
                }

            } else if (tempVal.type == 'SubQuery') {
                if (compareColumn(tempVal.alias, excel)) {
                    findColInfo(tempVal, excel, tempVal.alias);
                }

            } else if (tempVal.type == 'CaseWhen') {

                if (compareColumn(tempVal.alias, excel)) {
                    let identifier = tempVal.whenThenList.value.find((e) => { return e.then.type == 'Identifier' });
                    let subQuery = tempVal.whenThenList.value.find((e) => { return e.then.type == 'SubQuery' });

                    if (identifier) {
                        colObj = parseColumn(identifier.then.value);
                    } else if (subQuery) {
                        findColInfo(subQuery.then, excel, tempVal.alias);
                    }

                }
            } else if (tempVal.type == 'BitExpression' && tempVal.operator == '+') {
                tempVal = tempVal.left;
                continue;
            }
            tempVal = '';
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
    for (let i = 0; i < query.from.value.length; i++) {
        let val = query.from.value[i];
        if (val.value.type == "InnerCrossJoinTable") {
            if (excel.FoundFlag != 1 || (val.value.left.alias && val.value.left.alias.value == excel.TableName)) {
                if (val.value.left.value.type == 'Identifier') {
                    if (val.value.left.alias && val.value.left.alias.value == excel.TableName) {
                        excel.TableName = val.value.left.value.value;
                        excel.FoundFlag = 2;
                        return;
                    }
                } else {
                    findColInfo(val.value.left.value, excel);
                }
            }

            if (excel.FoundFlag != 1 || (val.value.right.alias && val.value.right.alias.value == excel.TableName)) {
                if (val.value.right.value.type == 'Identifier') {
                    if (val.value.right.alias && val.value.right.alias.value == excel.TableName) {
                        excel.TableName = val.value.right.value.value;
                        excel.FoundFlag = 2;
                        return;
                    }
                } else {
                    findColInfo(val.value.right.value, excel);
                }
            }
        } else {
            if(excel.FoundFlag != 1 || (val.value.alias && val.value.alias.value == excel.TableName)){
                if (val.value.value.type == 'Identifier') {
                    if (val.value.alias && val.value.alias.value == excel.TableName) {
                        excel.TableName = val.value.value.value;
                        excel.FoundFlag = 2;
                        return;
                    }
                } else if (val.value.value.type == 'SubQuery') {
                    if (val.value.alias && val.value.alias.value == excel.TableName) {
                        excel.SubColAlias = excel.ColName;
                    }
                    findColInfo(val.value.value, excel);
                }
            }
            
        }
    }

    // Only select from 1 table and no table alias
    if (excel.FoundFlag == 1 && excel.TableName == '' && query.from.value.length == 1) {
        if(query.from.value[0].value.value.type != 'SubQuery'){
            excel.TableName = query.from.value[0].value.value.value;
        }else{
            excel.TableName = query.from.value[0].value.alias.value;
            findColInfo(query.from.value[0].value.value.value, excel);
        }
        
        excel.FoundFlag = 2;
    }
}

function compareColumn(aliasNm, excel) {
    if (excel.SubColAlias && aliasNm == excel.SubColAlias) {
        return 1;
    } else if (aliasNm == excel.ColAlias || aliasNm == excel.ObjectId.toUpperCase()) {
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