function convertCommon() {
    convertCssCommon();
    addGridToolbar();
    convertFielddName();
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
        const captionPnlList = u(u(nGrid.parentNode).find('.caption-pnl'));
        let captionPnl = null;
        if (captionPnlList.nodes.length == 1) {
            captionPnl = captionPnlList.nodes[0];
        } else if (captionPnlList.nodes.length != 0 && captionPnlList.nodes.length > iGrid) {
            captionPnl = captionPnlList.nodes[iGrid];
        }

        if (captionPnl != null) {
            if (u('h2', captionPnl).nodes.length > 0) {
                u(u('h2', captionPnl).first()).after('<span class="fr" id="' + nGrid.id + 'Toolbar"></span>');
            } else {
                u(captionPnlList).prepend('<span class="fr" id="' + nGrid.id + 'Toolbar"></span>');
            }
        }
    })
}

function convertFielddName() {
    //Convert buttons Name
    u('#tempArea button').each(function (button, i) {
        if (button.childNodes.length && !isValidName(button.innerText)) {
            button.innerText = '%$' + button.innerText + ':' + button.innerText + '$%';
        }
    });

    //Convert Label
    u('#tempArea label').each(function (label, i) {
        if (label.childNodes.length && !isValidName(label.innerText)) {
            label.innerText = '%$' + label.innerText + ':' + label.innerText + '$%';
        }
    });

    //Convert span x-label
    u('.x-label').each(function (span, i) {
        if (span.childNodes.length && !isValidName(span.innerText)) {
            span.innerText = '%$' + span.innerText + ':' + span.innerText + '$%';
        }
    });
}

function isValidName(name) {

    const skipList = [':']
    if (skipList.indexOf(name) >= 0) {
        return true;
    }

    const pattern = /^%\$.+:\s*.+\s*\$%$/;
    const isMatch = pattern.test(name);
    if (isMatch) {
        return true;
    } else {
        return false
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

function getHtmlWithFormat() {
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

    const html = u('#tempArea').html();
    let htmlFormat = '';
   
    htmlFormat = htmlFormatLv1(html);
    htmlFormat = html_beautify(htmlFormat, option);
    htmlFormat = htmlFormat.replaceAll('hidden=""', 'hidden');
    htmlFormat = htmlFormat.replaceAll('checked=""', 'checked');
    htmlFormat = htmlFormat.replaceAll('readonly=""', 'readonly');
    htmlFormat = htmlFormat.replaceAll('disabled=""', 'disabled');
    htmlFormat = htmlFormat.replaceAll('selected=""', 'selected');
    return htmlFormat;
}

function verifyHTML() {
    let msg = '';
    const reSult = u('#reSult').first().value;
    if (reSult.indexOf('=""') > -1) {
        msg += '- HTML attributes have empty value (="")\n';
    }

    if(u('.search-inputbox.search:not(:has(.search-icon))').nodes.length > 0){
        msg += '- Class [search] does not follow the rule\n';
    }
    if(msg){
        u('#reSult').addClass('warning');
    }
    u('#warningZone').first().innerText = msg;
}


function htmlFormatLv1(html) {
    html = html.trim();
    var result = '',
        tokens = html.split(/</);
    for (var i = 0, l = tokens.length; i < l; i++) {
        var parts = tokens[i].split(/>/);
        var tag = '';
        nextTag = '';

        //Get current tag
        if (parts[0].indexOf(' ') >= 0) {
            tag = parts[0].trim().substr(0, parts[0].indexOf(' '));
        } else {
            tag = parts[0].trim();
        }

        //Get next tag
        if (i + 1 < l) {
            var nextParts = tokens[i + 1].split(/>/);
            if (nextParts[0].indexOf(' ') >= 0) {
                nextTag = nextParts[0].trim().substr(0, nextParts[0].indexOf(' '));
            } else {
                nextTag = nextParts[0].trim();
            }
        }

        if (parts.length === 2) {
            if (i > 0) {
                result += '<';
            }
            result += parts[0].trim() + ">";
            if ('/' + tag != nextTag) {
                result += "\n";
            }

            if (parts[1].trim() !== '') {
                result += parts[1].trim();
            }
        } else {
            result += parts[0].trim() + "\n";
        }
    }
    return result;
}