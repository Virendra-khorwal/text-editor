const electron = require('electron');
const {dialog, ipcMain} = require("electron");
const path = require("path");
const fs = require("fs");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const createWindow = () => {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.loadFile('index.html');
}

app.on('ready', createWindow);

ipcMain.on("open-file-dialog", (event) => {
    dialog
        .showOpenDialog({
            properties: ["openFile"],

        })
        .then((result) => {
            if(!result.canceled) {
                const filePath = result.filePaths[0];
                const fileContent = fs.readFileSync(filePath, "utf-8");
                electron.ipcRenderer.send("get-file", fileContent);
                event.reply("open-file", filePath, fileContent);
            }
        })
        .catch((err) => {
            console.log(err);
        });
});

ipcMain.on("save-file-dialog", (event, content) => {
    dialog
        .showSaveDialog({
            properties: ["createDirectory"],
        })
        .then((result) => {
            console.log('saved')
            if(!result.canceled) {
                console.log('saved result')
                const filePath = result.filePath;
                fs.writeFileSync(filePath, content, "utf-8");
                event.reply("save-file", filePath);
            }
        })
        .catch((err) => {
            console.log(err);
        })
})