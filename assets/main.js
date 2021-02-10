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
            '+ Write your markdown',
            '+ Press "Copy rendered to clipboard"',
            '+ Paste in Service Now',
            '',
            '## Changelog',
            '+ Fixed: Codeblocks, Links, newline',
            '+ Added: unordered lists',
            '+ Added: __bold__ and _italic_ with underscores',
            '',
            '```',
            'fn main()-> String {',
            '\treturn "this is a codeblock";',
            '}',
            '```',
            '',
            '### Things that don\'t work',
            '1. numbered lists don\'t do anything',
            '2. unordered lists only work with "+"',
            '3. *nested __italic or bold__ might not work...yet*'
        ].join('\n'),
        language: 'markdown',
        theme: 'vs-dark',
        lineNumbers: "off",
	    roundedSelection: false
    });
});


//https://community.servicenow.com/community?id=community_blog&sys_id=4d9ceae1dbd0dbc01dcaf3231f9619e1
function convertToServiceNowFormat() {
    var raw = editor.getValue();

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
    //get lists
    rawList = raw.match(/^\+ (.*?)(?:\n|$)/gmi);
    if (rawList != null) {
        //Chop lists
        lists = [];
        if (rawList.length == 1){
            lists[0].push([rawList[0]]);
        } else {
            listIndex = 0;
            lastLocation = raw.indexOf(rawList[0]) + rawList[0].length;
            lists.push([rawList[0]]);
            for(i=1;i < rawList.length; i++){
                if (lastLocation == raw.indexOf(rawList[i])){
                    lists[listIndex].push(rawList[i]);
                    lastLocation = raw.indexOf(rawList[i]) + rawList[i].length
                } else {
                    listIndex++;
                    lastLocation = raw.indexOf(rawList[i]) + rawList[i].length
                    lists.push([rawList[i]]);
                }
            }
        }

        //build final lists
        lists.forEach(list => {
            if (list.length > 1){
                for (i=0; i < list.length; i++){
                    if (i == 0){
                        cleanli = list[i].substring(1, list[i].length-1).replace(/\[code\]/g,'').replace(/\[\/code\]/g,'');
                        raw = raw.replace(list[i], '[code]<ul><li>'+cleanli+'</li>\n');
                    } else if(i+1 == list.length){
                        cleanli = list[i].substring(1, list[i].length-1).replace(/\[code\]/g,'').replace(/\[\/code\]/g,'');
                        raw = raw.replace(list[i], '<li>'+cleanli+'</li></ul>[/code]\n');
                    } else {
                        cleanli = list[i].substring(1, list[i].length-1).replace(/\[code\]/g,'').replace(/\[\/code\]/g,'');
                        raw = raw.replace(list[i], '<li>'+cleanli+'</li>\n');
                    }
                }       
            } else {
                cleanli = list[0].substring(1, list[0].length-1).replace(/\[code\]/g,'').replace(/\[\/code\]/g,'');
                raw = raw.replace(list[0], '[code]<ul><li>'+cleanli+'</li></ul>[/code]\n');
            }
        });
    }
    
    return raw
}