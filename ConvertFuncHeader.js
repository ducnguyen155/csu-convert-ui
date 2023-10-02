function convertSearchArea() {
    convertCommonSearchArea();
    convertSearchButton();
    convertInputSearchArea();
    convertGroupCheckBoxInSearchArea();
}

function convertCommonSearchArea() {
    u('.search-pnl .search').each(function (search, iSearch) {

        //Common search area table
        u('table', search).each(function (table, iTable) {
            u('tr', table).each(function (tr, iTr) {
                u(search).append('<dl>');
                const thList = u(tr).children('th, td');
                convertColInTable(thList);
            })
        });

        //Sub search area table
        u('.sub table', search).each(function (table, iTable) {
            u('tr', table).each(function (tr, iTr) {
                u(search).append('<dl class="sub">');
                const thList = u(tr).children('th, td');
                convertColInTable(thList);
            })
        })
    });
}

function convertColInTable(thList) {
    for (let i = 0; i < thList.nodes.length; i++) {
        if (thList.nodes[i].tagName == 'TH' && thList.nodes[i + 1].tagName == 'TD') {
            const th = thList.nodes[i];
            const td = thList.nodes[i + 1];
            //Convert and move th, td to div search-inputbox
            u(u('.search-pnl .search dl').last()).append('<div class="search-inputbox">');
            u(u('dl .search-inputbox').last()).append('<lable>' + th.innerHTML + '</lable>')
                .append(td.innerHTML);
            i++;
        } else {
            const td = thList.nodes[i];
            if (td.innerHTML != '') {
                u(u('.search-pnl .search dl').last()).append('<div class="search-inputbox">');
                u(u('dl .search-inputbox').last()).append(td.innerHTML);
            }

        }
    }
}

function convertSearchButton() {
    u('.search-pnl .search').each(function (search, iSearch) {
        //Add common button 1. Searbox Box Area Expand Button
        u(search).append('<button  type="button"  class="search-showhide-icon"  id="logDetailSearch"></button>');

        //4. Move button
        var searchButtons = u('.buttonset.fr', search);
        u(search).append(searchButtons);
        searchButtons.remove();

        //Add array common buttons (2, 3 4)
        if (u('.buttonset.fr', search) == null) {
            u(search).append('<span class="buttonset fr">');
        }

        //3. Search Filter Reset Button
        u('.buttonset.fr', search).prepend('<button type="button" class="dorefresh" id="btnC"></button>');
        // 2. Search Filter Save Button 
        u('.buttonset.fr', search).prepend('<button type="button" class="dofilter-save" id="btnSave"></button>');
    });

    //Remove tables
    u('.search-pnl .search table').remove();
    u('.search-pnl div.sub').remove();
}

function convertInputSearchArea() {
    //Convert icon-search to search-icon
    const buttons = u('button .icon-search');
    u(buttons).removeClass('icon-search');
    u(buttons).addClass('search-icon');

    //Add class search for search-inputbox
    u('.search-inputbox button has(button .search-icon)').each(function(node, i){
        node.addClass('search');
    })
}

function convertGroupCheckBoxInSearchArea() {
    u('.search-inputbox .selection-grp').each(function(node, i){
        const radioCount = u('input[type=radio]', node).nodes.length;
        if(radioCount > 0){
            u(node).addClass('radio-wrap');
            if(radioCount >= 2 && radioCount <=7){
                u(node).addClass('grid-span' + radioCount);
            }
        }
        u('label', node).prepend('<i>');
    })
    u('.search-inputbox lable span').each(function(node, i){
        node.parentNode.innerText = node.innerText;
    })
}

