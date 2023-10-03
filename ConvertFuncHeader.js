function convertSearchArea() {
    convertCommonSearchArea();
    convertSearchButton();
    convertInputSearchArea();
    convertGroupCheckBoxInSearchArea();
}

function convertCommonSearchArea() {
    let divSearchMain;
    u('.search-pnl div').each(function (search, iSearch) {
        if (u(search).hasClass('search')) {
            //Common search area table
            divSearchMain = search;
            u('table', search).each(function (table, iTable) {
                u('tr', table).each(function (tr, iTr) {

                    u(search).append('<dl>');

                    const thList = u(tr).children('th, td');
                    convertColInTable(thList, search);
                })
                u(table).remove();
            });
        } else { //Div table-pnl sub 
            u('.sub table', search).each(function (table, iTable) {
                u('tr', table).each(function (tr, iTr) {

                    u(divSearchMain).append('<dl>');
                    u(u('.search-pnl .search dl').last()).addClass(u(search).attr('class'))
                        .removeClass('table-pnl')
                        .attr('id', u(search).attr('id'));

                    const thList = u(tr).children('th, td');
                    convertColInTable(thList, search);
                })
                u(table).remove();
            })
        }
    });
}

function convertColInTable(thList) {
    for (let i = 0; i < thList.nodes.length; i++) {
        if (thList.nodes[i].tagName == 'TH' && thList.nodes[i + 1].tagName == 'TD') {
            const th = thList.nodes[i];
            const td = thList.nodes[i + 1];
            //Convert and move th, td to div search-inputbox
            u(u('.search-pnl .search dl').last()).append('<div class="search-inputbox">');
            u(u('dl .search-inputbox').last()).append('<label>' + th.innerHTML + '</label>')
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
        u(search).append('<button  type="button"  class="search-showhide-icon"  id="logDetailSearch" hidden></button>');

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
    // u('.search-pnl .search table').remove();
    // u('.search-pnl div.sub').remove();
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
        u('label', nSpan).prepend('<i>');
        u(nSpan.parentNode).addClass('radio');
    })
    u('.search-inputbox label span').each(function (node, i) {
        node.parentNode.innerText = node.innerText;
    })
}

