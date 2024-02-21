var exelInfo = [];

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
    while (strQuery.indexOf('  ') > -1) {
        strQuery = strQuery.replaceAll('  ', ' ');
    }
    const lines = strQuery.split('\n');

    var listCol = [];
    var listTbl = [];
    var select = 0,
        from = 0;
    var where = 0;

    lines.forEach(line => {

        //Skip
        if (line.indexOf('<') > -1) return;

        //

        //SELECT flag
        if (line.toUpperCase().indexOf('SELECT') > -1) {
            select++;
            where = 0;
        }

        //FROM flag
        if (line.toUpperCase().indexOf('FROM') > -1) {
            from++;
            where = 0;
        }

        //WHERE flag
        if (line.toUpperCase().indexOf('WHERE ') > -1) {
            where = 1;
        }
        if (where == 1) return;

        if (select > from) { //Read column info
            listCol = listCol.concat(getColumnInfo(line));
        } else { //Read table info
            listTbl = listTbl.concat(getTableInfo(line));
        }

    });

    let result = '';
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
            }
        });
    });

    var tbody = '<tr><th>No.</th><th>Object ID</th><th>Sub Object ID</th><th>Display Name</th><th>Table Info</th><th>Field Info</th></tr>';

    exelInfo.forEach((info, idx) => {
        let tr = '<tr>';
        tr += '<td>' + idx + '</td>';
        tr += '<td>' + info.ObjectId + '</td>';
        tr += '<td>' + info.SubObjectId + '</td>';
        tr += '<td>' + info.DisplayName + '</td>';
        tr += '<td>' + (info.TableName ? info.TableName : '') + '</td>';
        tr += '<td>' + info.ColName + '</td>';
        tr += '</tr>';
        tbody +=  tr;
    });
    reSult.innerHTML = tbody;
}

function getColumnInfo(line) {
    line = line.replaceAll('SELECT ', '');
    line = line.replaceAll('FROM (', '');
    line = line.replaceAll('FROM', '');
    let listCol = [];
    let cols = line.split(',');
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
        if(colArr.length > 1){
            colInfo.ColName = colArr[0];
            colInfo.ColAlias = colArr[1];
        }else{
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
        colTableName = 9,
        colColName = 10;

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
            for (var R = 4; R < variable.e.r; ++R) {

                let info = {};
                info.ObjectId = ws[ec(R, colObjectId)].v;
                info.SubObjectId = ws[ec(R, colSubObjectId)].v;
                info.DisplayName = ws[ec(R, colDisplayName)].v;
                info.TableName = ws[ec(R, colTableName)].v;
                info.ColName = ws[ec(R, colColName)].v;
                if(!info.ColName){
                    info.ColName = info.ObjectId.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
                }
                exelInfo.push(info);
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