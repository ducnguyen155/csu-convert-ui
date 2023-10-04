
function wrapBody() {
    if (u('#wrap').nodes.length == 0) {
        $('#tempArea').wrapInner("<div id='wrap'>");
    }
}

function  convertTableArea() {
    removeEmtyTdAndAddColSpan();
    convertTextAreaInTable();
    convertDatePickerInTable();
    convertSelectInTable();
    convertInputInTable();
    convertInputSearchInTable();
    convertGroupCheckBoxInTable();
    addWideTdTableArea();
    addMandatoryForInputInTable();
}

function removeEmtyTdAndAddColSpan() {
    // Find the specific <div> with the class "table-pnl"
    var tablePnl = $(".table-pnl");

    // Find all empty <td> elements within the specific <div>
    var emptyTdElements = tablePnl.find("td:empty");

    // Initialize an array to store the previous non-empty <td> elements
    var previousNonEmptyTdElements = [];

    // Iterate through each empty <td> element
    emptyTdElements.each(function() {
        // Find all non-empty <td> elements before the current empty one
        var nonEmptyElements = $(this).prev("td:not(:empty)");

        // Add the non-empty elements to the array
        previousNonEmptyTdElements = previousNonEmptyTdElements.concat(nonEmptyElements.toArray());
    });

    // Do something with the previous non-empty <td> elements
    if (previousNonEmptyTdElements.length > 0) {
        // For example, you can add a class to them
        // $(previousNonEmptyTdElements).addClass("previous-non-empty-td");

        // Or you can loop through them and perform some action
        $(previousNonEmptyTdElements).each(function() {
            // Initialize a counter for consecutive empty <td> elements
            var consecutiveEmptyTdCount = 0;
            // Loop through the <td> elements that come after the specific one
            $(this).nextAll("td").each(function() {
                // Check if the current <td> element is empty
                if ($(this).is(":empty")) {
                    // Increment the consecutive empty <td> count
                    consecutiveEmptyTdCount++;
                } else {
                    // If a non-empty <td> is encountered, stop counting
                    return false;
                }
            });
            if (consecutiveEmptyTdCount > 0) {
                // Get the current colspan attribute value
                var currentColspan = $(this).attr("colspan");

                if (currentColspan !== undefined) {
                    // If the colspan attribute exists, increment its value by 2
                    var newColspan = parseInt(currentColspan) + consecutiveEmptyTdCount;
                    $(this).attr("colspan", newColspan);
                } else {
                    // If the colspan attribute doesn't exist, add it with a value of 2
                    $(this).attr("colspan", consecutiveEmptyTdCount);
                }
            }
        });
    }

    emptyTdElements.remove();
}

function convertGroupCheckBoxInTable() {
    var tdHasGroupCheckBox = u("td:has(.selection-grp)");
    tdHasGroupCheckBox.map(function(node, i){
        var checkGroup = u(node).find(".selection-grp");
        checkGroup.addClass('check-wrap');
    });
}

function addWideTdTableArea() {
    var tableList = u('.table-pnl');
    var tdList = tableList.find('td');
    tdList.map(function(node, i){
        $(node).wrapInner('<div class="wide-td">');
    });
}

function convertInputInTable() {
    var tableList = u('.table-pnl');
    var inputList = tableList.find('input');
    inputList.map(function(node, i){
        if (node.type != 'checkbox') {
            $(node).wrap('<span class="main-inputbox">');
        }
    });
}

function convertInputSearchInTable() {
    // must be call convertInputInTable before
    var tdHasButton = u("td:has(button)");
    tdHasButton.map(function(node, i){
        var button = u(node).find("button");
        var main = u(node).find(".main-inputbox");
        main.append(u(button));
        button.remove();
    });
}
function convertTextAreaInTable() {
    var tableList = u('.table-pnl');
    var textAreaList = tableList.find('textarea');
    textAreaList.map(function(node, i){
        $(node).wrap('<span class="main-inputbox">');
    });
}

function convertSelectInTable() {
    var tableList = u('.table-pnl');
    var selectList = tableList.find('select');
    selectList.map(function(node, i){
        $(node).wrap('<span class="main-inputbox selectbox">');
    });
}

function convertDatePickerInTable() {
    var tableList = u('.table-pnl');
    var textAreaList = tableList.find('input');
    textAreaList.map(function(node, i){
        if (node.dataset.hasOwnProperty("nx") && node.dataset.nx.includes('calendar:true')) {
            $(node).wrap('<span class="main-inputbox datepicker">');
        }

    });
}

function addMandatoryForInputInTable() {
    // Find the specific <div> with the class "table-pnl"
    var tablePnl = $(".table-pnl");

    var mainInputboxesWithRequiredInput = tablePnl.find(".main-inputbox:has(input.state-required)");

    // Do something with the filtered <main-inputbox> elements
    if (mainInputboxesWithRequiredInput.length > 0) {
        // For example, you can add a class to them
        mainInputboxesWithRequiredInput.addClass("mandatory");
    }

    var mainInputboxesWithRequiredSelect = tablePnl.find(".main-inputbox:has(select.state-required)");

    // Do something with the filtered <main-inputbox> elements
    if (mainInputboxesWithRequiredSelect.length > 0) {
        // For example, you can add a class to them
        mainInputboxesWithRequiredSelect.addClass("mandatory");
    }
}