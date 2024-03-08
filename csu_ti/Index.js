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
        if (val.params[pIdx].type == 'Identifier') {
            value = val.params[pIdx];
            break;
        }
    }
    if (!value) {
        for (let pIdx = 2; pIdx < val.params.length; pIdx += 2) {
            if (val.params[pIdx].type != 'String' && val.params[pIdx].type != 'Number' && val.params[pIdx].type != 'Null') {
                value = val.params[pIdx];
                break;
            }
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

function findColInfo(ast, excel, alias, from) {
    if (excel.FoundFlag == 2) return;

    let query = ast;

    if (!query) return;

    let colObj;

    if (query.nodeType == 'Main') {
        findColInfo(ast.value, excel);
    } else if (query.type == 'Identifier') {
        colObj = parseColumn(query.value);

        if (!colObj) return;

        if (compareColumn(alias, excel)) { //Select Sub query
            excel.ColName = colObj.colNm;
            excel.TableName = colObj.tbNm;
            excel.SubColAlias = colObj.colNm;
            excel.FoundFlag = 1;
            excel.From = from;
        } else if (compareColumn((query.alias || colObj.colNm), excel) || colObj.colNm == excel.ColAlias) {
            excel.ColName = colObj.colNm;
            excel.TableName = colObj.tbNm;
            excel.FoundFlag = 1;
            excel.From = from;
        }
    } else if (query.type == 'FunctionCall') {
        let value;
        if (listFunction1P.indexOf(query.name) >= 0) {
            value = query.params[0];
        } else if (listFunction3P.indexOf(query.name) >= 0) {
            value = getFunctionCallValue(query, excel);
        }
        findColInfo(value, excel, (alias || query.alias), from);
    } else if (query.type == 'FunctionCallParam') {
        query = query.value;
        findColInfo(query, excel, alias);

    } else if (query.type == "ComparisonBooleanPrimary") {
        if (compareColumn((alias || query.alias), excel)) {
            findColInfo(query.left, excel, (alias || query.alias));
        }
    } else if (query.type == "Union") {
        findColInfo(query.left, excel, alias);
        findColInfo(query.right, excel, alias);
        return;
    } else if (query.type == 'SubQuery') {
        if (excel.FoundFlag != 2 && query.alias == excel.ColName) {
            findColInfo(query.value, excel, excel.ColName);
            // Only select from 1 table and no table alias
            if (excel.FoundFlag == 1 && excel.TableName == '' && query.value.from.value.length == 1) {
                excel.TableName = query.value.from.value[0].value.value.value;
                excel.FoundFlag = 2;
            }
        } else {
            findColInfo(query.value, excel, alias);
        }
    } else if (query.type == 'CaseWhen') {
        if (compareColumn((alias || query.alias), excel)) {
            let identifier = query.whenThenList.value.find((e) => { return (e.then.type != 'String' && e.then.type != 'Number') });

            if (identifier) {
                findColInfo(identifier.then, excel, alias || query.alias);
            } else {
                findColInfo(query.whenThenList.value[0].when, excel, alias || query.alias);
            }
        }
    } else if (query.type == 'BitExpression') {
        if (compareColumn(alias, excel)) {
            if (query.left.type == 'Identifier') {
                colObj = parseColumn(query.left.value);
                excel.SubColAlias = colObj.colNm;
                findColInfo(query.left, excel, alias, from);
            } else {
                findColInfo(query.left, excel, alias, from);
            }
        }
    } else if (query.type == 'InnerCrossJoinTable') {
        findColInfo(query.left.value, excel);
        findColInfo(query.right.value, excel);
    } else if (query.type == 'TableFactor') {
        if (excel.FoundFlag != 2 && query.alias && query.alias.value == excel.TableName) {
            if (query.value.type == 'Identifier') {
                excel.TableName = query.value.value;
                excel.FoundFlag = 2;
            } else {
                excel.SubColAlias = excel.ColName;
                excel.FoundFlag = 0;
                excel.TableName = '';
                findColInfo(query.value, excel, alias);
            }
        } else if (!excel.FoundFlag) {
            if (query.value.type == 'Identifier') {

            } else {
                findColInfo(query.value, excel, alias);
            }
        }
    } else if (query.type == 'Select') {
        //Check select list
        for (let i = 0; i < query.selectItems.value.length; i++) {

            if (excel.FoundFlag == 1) break;
            let val = query.selectItems.value[i];
            let onlyOneTable = query.from.value.length == 1 ? query.from.value[0] : '';
            findColInfo(val, excel, (alias || val.alias), onlyOneTable);
        }

        // Check from list   
        if (excel.From && excel.FoundFlag == 1 && excel.TableName == '' && excel.From.value.alias) {
            excel.TableName = excel.From.value.alias.value;
        } else if (excel.From && excel.FoundFlag == 1 && excel.TableName == '' && excel.From.value.value) {
            excel.TableName = excel.From.value.value.value;
            excel.FoundFlag = 2;
        }

        for (let i = 0; i < query.from.value.length; i++) {
            if (excel.FoundFlag == 2) break;

            let val = query.from.value[i];

            findColInfo(val.value, excel, alias);
        }
    } else if (query.type == 'SimpleExprParentheses') {
        findColInfo(query.value, excel, alias);
    } else if (query.type == 'ExpressionList') {
        findColInfo(query.value[0], excel, alias);
    }
}

function compareColumn(aliasNm, excel) {
    if (excel.SubColAlias && aliasNm == excel.SubColAlias) {
        return 1;
    } else if (aliasNm == excel.ColAlias || aliasNm == excel.ObjectId.toUpperCase()) {
        if (aliasNm == excel.ObjectId.toUpperCase() && aliasNm != excel.ColAlias) {
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