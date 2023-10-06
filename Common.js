function convertCommon() {
    convertCssCommon();
    addGridToolbar();
    convertButtonsName();
    convertLabelsName();
    convertButtonAddDelRow();
    convertButtonInFooter();
}

function convertCssCommon() {
    const buttons = u('.doaction-point').filter('button');
    u(buttons).removeClass('doaction-point');
    u(buttons).addClass('doaction on');
}

function addGridToolbar() {
    u('.grid-pnl').each(function (nGrid, iGrid) {
        var captionPnl = u(u(nGrid.parentNode).find('.caption-pnl'));
        if (captionPnl.nodes.length == 1) {
            u(captionPnl).append('<span class="fr" id="' + nGrid.id + 'Toolbar"></span>');
        } else if (captionPnl.nodes.length != 0 && captionPnl.nodes.length > iGrid) {
            u(captionPnl.nodes[iGrid]).append('<span class="fr" id="' + nGrid.id + 'Toolbar"></span>');
        }
    })
}

function convertButtonsName() {
    u('#tempArea button').each(function (button, i) {
        if (button.childNodes.length && !isValidName(button.innerText)) {
            button.innerText = '%$' + button.innerText + ':' + button.innerText + '$%';
        }
    });
}

function convertLabelsName() {
    u('#tempArea label').each(function (label, i) {
        if (label.childNodes.length && !isValidName(label.innerText)) {
            label.innerText = '%$' + label.innerText + ':' + label.innerText + '$%';
        }
    });
}

function isValidName(name) {
    const pattern = /^%\$.+:\s*.+\s*\$%$/;
    const isMatch = pattern.test(name);
    if (isMatch) {
        return true;
    } else {
        false
    }
}

function convertButtonAddDelRow() {
    u('#tempArea button').each(function (button, i) {
        if (button.childNodes.length && u(button).hasClass('doaction')) {
            if (button.innerText == '%$Add Row:Add Row$%') {
                u(button).removeClass('doaction');
                u(button).addClass('doaction-plus');
            } else if (button.innerText == '%$Delete Row:Delete Row$%') {
                u(button).removeClass('doaction');
                u(button).addClass('doaction-minus');
            }
        }
    });
}

function convertButtonInFooter() {
    const buttons = u('footer .buttonset.fr button').filter(function (button, iButton) {
        return u(button).attr('class') == 'doaction';
    });
    if (u('footer .buttonset.fl').nodes.length == 0) {
        u('footer').prepend('<span class="buttonset fl">');
    }
    u('footer .buttonset.fl').append(buttons);
    u(buttons).remove();
}

function formatHTML() {
    const option = {
        "indent_size": "4",
        "indent_char": " ",
        "max_preserve_newlines": "-1",
        "preserve_newlines": false,
        "keep_array_indentation": true,
        "break_chained_methods": false,
        "indent_scripts": "keep",
        "brace_style": "none,preserve-inline",
        "space_before_conditional": true,
        "unescape_strings": false,
        "jslint_happy": true,
        "end_with_newline": true,
        "wrap_line_length": "0",
        "indent_inner_html": true,
        "comma_first": true,
        "e4x": true,
        "indent_empty_lines": true
    };
    const htmlFormat = html_beautify(u('#tempArea').html(), option);
    u('#tempArea').first().innerHTML = htmlFormat;
}

