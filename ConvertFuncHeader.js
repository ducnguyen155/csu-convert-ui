function convertSearchArea() {
    convertCommonSearchArea();
    convertSubSearchArea();
    convertSearchButton();
    convertCssClass();
}

function convertCommonSearchArea() {
    //Common search area table
    u('header .search-pnl .search table').each(function (table, iTable) {

        u('tr', table).each(function (tr, iTr) {
            u('header .search-pnl .search').append('<dl>');

            const thList = u(tr).children('th, td');
            for (let i = 0; i < thList.nodes.length; i++) {
                if (thList.nodes[i].tagName == 'TH' && thList.nodes[i + 1].tagName == 'TD') {
                    const th = thList.nodes[i];
                    const td = thList.nodes[i + 1];
                    //Convert and move th, td to div search-inputbox
                    u(u('header .search-pnl .search dl').last()).append('<div class="search-inputbox">');
                    u(u('header dl .search-inputbox').last()).append('<lable>' + th.innerHTML + '</lable>')
                        .append(td.innerHTML);
                    i++;
                } else {
                    const td = thList.nodes[i];
                    if (td.innerHTML != '') {
                        u(u('header .search-pnl .search dl').last()).append('<div class="search-inputbox">');
                        u(u('header dl .search-inputbox').last()).append(td.innerHTML);
                    }

                }
            }
        })
    });
}

function convertSubSearchArea() {
    //Sub search area table
    u('header .search-pnl .sub table').each(function (table, iTable) {
        u('tr', table).each(function (tr, iTr) {
            u('header .search-pnl .search').append('<dl class="sub">');

            const thList = u(tr).children('th, td');
            for (let i = 0; i < thList.nodes.length; i++) {
                if (thList.nodes[i].tagName == 'TH' && thList.nodes[i + 1].tagName == 'TD') {
                    const th = thList.nodes[i];
                    const td = thList.nodes[i + 1];
                    //Convert and move th, td to div search-inputbox
                    u(u('header .search-pnl .search dl').last()).append('<div class="search-inputbox">');
                    u(u('header dl .search-inputbox').last()).append('<lable>' + th.innerHTML + '</lable>')
                        .append(td.innerHTML);
                    i++;
                } else {
                    const td = thList.nodes[i];
                    if (td.innerHTML != '') {
                        u(u('header .search-pnl .search dl').last()).append('<div class="search-inputbox">');
                        u(u('header dl .search-inputbox').last()).append(td.innerHTML);
                    }

                }
            }
        })
    })
}

function convertSearchButton() {
    //Add common button 1. Searbox Box Area Expand Button
    u('header .search-pnl .search').append('<button  type="button"  class="search-showhide-icon"  id="logDetailSearch"></button>');

    //4. Move button
    var searchButtons = u('header .search-pnl .search .buttonset.fr');
    u('header .search-pnl .search').append(searchButtons);
    searchButtons.remove();

    //Add array common buttons (2, 3 4)
    if (u('header .search-pnl .search .buttonset.fr') == null) {
        u('header .search-pnl .search').append('<span class="buttonset fr">');
    }

    //3. Search Filter Reset Button
    u('header .search-pnl .search .buttonset.fr').prepend('<button type="button" class="dorefresh" id="btnC"></button>');
    // 2. Search Filter Save Button 
    u('header .search-pnl .search .buttonset.fr').prepend('<button type="button" class="dofilter-save" id="btnSave"></button>');


    //Remove tables
    u('header .search-pnl .search table').remove();
    u('header .search-pnl div.sub').remove();
}

function convertCssClass(){
    //Convert icon-search to search-icon
    const buttons = u('button .icon-search');
    u(buttons).removeClass('icon-search');
    u(buttons).addClass('search-icon');
    

}

