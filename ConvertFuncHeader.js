function convertSearchArea() {
    convertCommonSearchArea();
    convertSearchButton();
    convertInputSearchArea();
    convertGroupCheckBoxInSearchArea();
}

function convertCommonSearchArea() {
    //Check and add div search
    u('.search-pnl:not(div:has(.search)').prepend('<div class="search">');

    let divSearchMain;
    u('.search-pnl div').each(function (div, iDiv) {
        //Get div search
        divSearchMain = u('.search', div.parentElement);

        if (u(div).hasClass('search')) {
            //Common search area table
            u('table', div).each(function (table, iTable) {
                u('tr', table).each(function (tr, iTr) {

                    u(div).append('<dl>');

                    const thList = u(tr).children('th, td');
                    convertColInTable(thList, div);
                })
                u(table).remove();
            });
        } else { //Div table-pnl sub 
            u('.sub table', div).each(function (table, iTable) {
                u('tr', table).each(function (tr, iTr) {
                    const divPnlId = u(div).attr('id');
                    const tableId = table.id;
                    u(divSearchMain).append('<dl>');
                    u(u('.search-pnl .search dl').last()).addClass(u(div).attr('class'))
                        .removeClass('table-pnl')
                        .attr('id', divPnlId != null ? divPnlId : tableId);

                    const thList = u(tr).children('th, td');
                    convertColInTable(thList, div);
                })
                u(table).remove();
            })
        }
    });
}

function convertColInTable(thList) {
    for (let i = 0; i < thList.nodes.length; i++) {
        if (thList.nodes[i].tagName == 'TH' && (i + 1 < thList.nodes.length) && thList.nodes[i + 1].tagName == 'TD') {
            const th = thList.nodes[i];
            const td = thList.nodes[i + 1];
            //Convert and move th, td to div search-inputbox
            u(u('.search-pnl .search dl').last()).append('<div class="search-inputbox">');
            u(u('dl .search-inputbox').last()).append('<label>' + th.innerHTML + '</label>')
                .append(td.innerHTML);
            u(u('dl .search-inputbox').last()).attr('id', td.id != '' ? td.id : th.id);
            i++;
        } else {
            const td = thList.nodes[i];
            if (td.innerHTML != '') {
                u(u('.search-pnl .search dl').last()).append('<div class="search-inputbox">');
                u(u('dl .search-inputbox').last()).append(td.innerHTML);
                u(u('dl .search-inputbox').last()).attr('id', td.id);
            }

        }
    }
}

function convertSearchButton() {
    u('.search-pnl .search').each(function (search, iSearch) {
        //Add common button 1. Searbox Box Area Expand Button
        u(search).append('<button  type="button"  class="search-showhide-icon"  id="logDetailSearch" hidden></button>');

        //5. Move button
        var searchButtons = u('.buttonset.fr', search);
        u(search).append(searchButtons);
        searchButtons.remove();

        //Add array common buttons (2, 3 4)
        if (u('.buttonset.fr', search) == null) {
            u(search).append('<span class="buttonset fr">');
        }
        
        // 4. Search Filter Reset Button
        u(u('.buttonset.fr', search).last()).prepend('<button type="button" class="dorefresh" id="btnC"></button>');
        // 3. Search Filter Save Button 
        u(u('.buttonset.fr', search).last()).prepend('<button type="button" class="dofilter-save" id="btnSave"></button>');
        // 2. Search Filter Modify Button 
        u(u('.buttonset.fr', search).last()).prepend('<button type="button" class="dofilter-case" id="logFilterCase"></button>');

        //Remove span empty
        u(u('.buttonset.fr', search)).filter(function (node, i) {
            return node.innerHTML == ''
        }).remove();

        //Remove div empty
        u(u('dl .search-inputbox', search)).filter(function (node, i) {
            return node.innerHTML == ''
        }).remove();
    });

    //Remove empty div 
    u('.search-pnl .table-pnl:not(:has(*))').remove();
}

function convertInputSearchArea() {
    //Convert icon-search to search-icon
    const buttons = u('.icon-search').filter('button');
    u(buttons).removeClass('icon-search');
    u(buttons).addClass('search-icon');

    //Add class search for search-inputbox
    const divSearch = u('.search-inputbox:has(button)').filter(function (node, i) { return u(node).find('.search-icon') });
    u(divSearch).addClass('search');
}

function convertGroupCheckBoxInSearchArea() {
    u('.search-inputbox .selection-grp').each(function (nSpan, i) {
        const radioCount = u('input[type=radio]', nSpan).nodes.length;
        if (radioCount > 0) {
            u(nSpan).addClass('radio-wrap');
            if (radioCount >= 2 && radioCount <= 7) {
                u(nSpan).addClass('grid-span' + radioCount);
            }
        }
        u('label:not(:has(i))', nSpan).prepend('<i>');
        u(nSpan.parentNode).addClass('radio');
    })
    u('.search-inputbox label span').each(function (node, i) {
        node.parentNode.innerText = node.innerText;
    })
}

