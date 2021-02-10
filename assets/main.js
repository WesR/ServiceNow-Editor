window.onload = function () {
    document.getElementById('btnCopyToClip').addEventListener('click', function (event) {
        renderedText = document.getElementById('renderedText');
        renderedText.value = convertToServiceNowFormat();
        renderedText.focus();
        renderedText.select();
        document.execCommand('copy');
        alert("Copied!");
    });
}
var editor;

require.config({ paths: { 'vs': './assets/monaco' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: [
            '# Random markdown',
            'Hosted at [wesring.com](https://wesring.com)',
            '',
            '## About',
            'This is a **bad** markdown editor that coverts to the *wacky* formatting of service now. \\',
            'Backwacks preform a line break. Bold with double **stars** or __underscores__, *single* for _italic_',
            'Here is an _example_ of a code snipit `{"value":"KKpR1al9JZTFOHXeGrb9yUuhppiunC0O"}` . ',
            '',
            '## Useage',
            '1. Write your markdown',
            '2. Press "Copy rendered to clipboard"',
            '3. Paste in Service Now',
            '',
            '```',
            'fn main()-> String {',
            '\treturn "this is a codeblock";',
            '}',
            '```',
            '',
            '### Things that don\'t work',
            '1. This is a numbered list',
            '2. they broke',
            '+ unordered lists are also broke',
            '+ very sad',
            '',
            '*nested __italic or bold__ might not work because of the extra [code] blocks*',
        ].join('\n'),
        language: 'markdown',
        theme: 'vs-dark',
        lineNumbers: "off",
	    roundedSelection: false
    });
});


//https://community.servicenow.com/community?id=community_blog&sys_id=4d9ceae1dbd0dbc01dcaf3231f9619e1
function convertToServiceNowFormat() {
    raw = editor.getValue();

    //Bold
    raw = raw.replace(/\*\*(.*)\*\*/gi, '[code]<b>$1</b>[/code]');
    raw = raw.replace(/__(.*)__/gi, '[code]<b>$1</b>[/code]');

    //Ital
    raw = raw.replace(/\*(.*)\*/gi, '[code]<em>$1</em>[/code]');
    raw = raw.replace(/_(.*)_/gi, '[code]<em>$1</em>[/code]');

    //strikethorugh
    raw = raw.replace(/~~(.*?)~~/gis, '[code]<strike>$1</strike>[/code]');

    //underline
    raw = raw.replace(/_(.*?)_/gis, '[code]<strike>$1</strike>[/code]');

    //codeblock
    raw = raw.replace(/```\n(.*?)\n```/gis, '[code]<pre><code>\n$1\n</code></pre>[/code]');
    //single line of code
    raw = raw.replace(/`(.*?)`/gi, '[code]<code>$1</code>[/code]');

    //Blockquote
    raw = raw.replace(/^> (.*?)\n/gism, '[code]<blockquote>$1</blockquote>[/code]');

    //h3
    raw = raw.replace(/^### (.*?)\n/gism, '[code]<h3>$1</h3>[/code]\n');

    //h2
    raw = raw.replace(/^## (.*?)\n/gism, '[code]<h2>$1</h2>[/code]\n');

    //h1
    raw = raw.replace(/^# (.*?)\n/gism, '[code]<h1>$1</h1>[/code]\n');

    //newline
    raw = raw.replace(/(\\\n)/gi, '\n');

    //links
    raw = raw.replace(/\[(.*?)\]\((.*?)\)/gi, '[code]<a href="$2">$1</a>[/code]');


    //ul
    //kina broke because you can only have 1 list
    /*
    list = raw.match(/^\+ (.*?)(?:\n|$)/);

    if (list != null) {
        list.array.forEach(e => {
            if (list.length == 1){
                raw = raw.replace("+ " + e, '<ul><li>'+e+'</li></ul>')
            } else if (list[0] === e){
                raw = raw.replace("+ " + e, '<ul><li>'+e+'</li>')
            } else if(list[list.length-1] === e){
                raw = raw.replace("+ " + e, '<li>'+e+'</li></ul>')
            } else {
                raw = raw.replace("+ " + e, '<li>'+e+'</li>')
            }
        });
    }
    */
    return raw
}