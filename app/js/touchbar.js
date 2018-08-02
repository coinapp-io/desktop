

function ChangeInitText(text, color) {
    ipcRenderer.send('ChangeInitText', {text: text, color: color});
}

function ChangeSecondText(text, color) {
    ipcRenderer.send('ChangeSecondText', {text: text, color: color});
}