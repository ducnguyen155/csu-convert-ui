function convertCommon(){
    convertCssCommon();
}

function convertCssCommon(){
    const buttons = u('.doaction-point').filter('button');
    u(buttons).removeClass('doaction-point');
    u(buttons).addClass('doaction on');
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

