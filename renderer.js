const {ipcRenderer} = require("electron");

const editor = document.getElementById("editor");
const openBtn = document.getElementById("openBtn")
const saveBtn = document.getElementById("saveBtn");
const boldBtn = document.getElementById('bold-btn');
const copyButton = document.getElementById('copy-button');
const pasteButton = document.getElementById('paste-button');

const undoStack = [];
const redoStack = [];

openBtn.addEventListener("click", ()=> {
    ipcRenderer.send("open-file-dialog");
});

saveBtn.addEventListener("click", () => {
    const content = editor.ariaValueMax;
    ipcRenderer.send("save-file-dialog", content);
});

boldBtn.addEventListener('click', () => {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start,end);
    const boldText = `<b>${selectedText}</b>`;
    const newText = editor.value.substring(0, start) + boldText + editor.value.substring(end);
    editor.value = newText;
})

editor.addEventListener('input', () => {
    const code = editor.value;
    const highlightedCode = Prism.highlight(code, Prism.languages.javascript, 'javascript');
    editor.innerHTML = highlightedCode;
    paragraph.innerHTML = highlightedCode;
    undoStack.push(editor.innerHTML);
});

copyButton.addEventListener('click', () => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
});

pasteButton.addEventListener('click', () => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('paste');
    selection.removeAllRanges();
})

const aceEditor = ace.edit('editor');
aceEditor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
});

const langTools = ace.require('ace/ext/language_tools');
const completer = {
    getComputedStyle: function(edtor, session, pos, prefix, callback) {
        const completions = [
            {value: 'foo', score: 1000},
            {value: 'bar', score: 1000},
            {value: 'baz', score: 1000},
        ];
        callback(null, completions);
    }
}

langTools.addCompleter(completer);

ipcRenderer.on("open-file", (event, filePath, fileContent) => {
    editor.value = fileContent;
})

function undo() {
    if(undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        editor.innerHTML = undoStack[undoStack.length - 1];
    }
}

function redo() {
    if(redoStack.length > 0) {
        undoStack.push(redoStack.pop());
        editor.innerHTML = undoStack[undoStack.length - 1];
    }
}

document.addEventListener('keydown', (event) => {
    if(event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undo();
    } else if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        redo();
    }
})