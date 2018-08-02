const electron = require('electron');
var log = require('electron-log');

const ipcMain = electron.ipcMain;

const {app, BrowserWindow, TouchBar} = require('electron');
const {TouchBarLabel, TouchBarButton, TouchBarSpacer} = TouchBar;

const {autoUpdater} = require("electron-updater");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

const defaultMenu = require('electron-default-menu');
const { Menu, shell } = electron;

const path = require('path');
const url = require('url');

var os = require('os');

const Store = require('electron-store');
const store = new Store();


const logo = new TouchBarButton({
    icon: path.join(__dirname, 'app/images/iconsm.png'),
    backgroundColor: '#000000',
    click: () => {

    }
})


const initText = new TouchBarLabel({
    label: "CoinApp.io",
    textColor: "#fdff1b"
});


const versionText = new TouchBarLabel({
    label: 'v'+app.getVersion(),
    textColor: "#c0c0c0"
});


const secondText = new TouchBarLabel({
    label: "",
    textColor: "#51ff19"
});

const touchBar = new TouchBar([
    logo,
    new TouchBarSpacer({size: 'small'}),
    initText,
    secondText
]);


function ChangeInitText(text, color="#fdff1b") {
    initText.label = text;
    initText.textColor = color;
}

function ChangeSecondText(text, color="#3dff1a") {
    secondText.label = text;
    secondText.textColor = color;
}

var alreadySet = store.get('set');
store.set('version', app.getVersion());

if (!alreadySet) {
    store.set('set', true);
    store.set('eth_conn', 'geth');
    store.set('geth', 'https://eth.coinapp.io');
    store.set('btc', 'https://btc.coinapp.io/api');
    store.set('ltc', 'https://ltc.coinapp.io/api');
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
      backgroundColor: '#f7f7f7',
      frame: false,
      titleBarStyle: 'hidden',
      width: 840,
      height: 560,
      show: false,
      webPreferences: {
          // allowRunningInsecureContent: false,
          // experimentalFeatures: false,
          // webSecurity: true,
          // nodeIntegration: false,
          // preload: __dirname+'/app/js/constants.js'
      }
  });

    if (process.env.NODE_ENV=="test") {
        mainWindow.setResizable(true);
    } else {
        mainWindow.setResizable(false);
    }
  mainWindow.setFullScreenable(false);

    mainWindow.setTouchBar(touchBar);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/views/index.html'),
    protocol: 'file:',
    slashes: true
  }));


    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // mainWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

    autoUpdater.checkForUpdates();

}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){

  // const menu = defaultMenu(app, shell);

    if (process.env.NODE_ENV!="test" && os.platform()=="darwin") {
        var template = [{
            label: "Edit",
            submenu: [
                {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
                {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"}
            ]
        }
        ];

        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }

  createWindow();

});


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
    app.quit()
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});


autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('newUpdateAvailable');
})
autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available.');
})
autoUpdater.on('error', (err) => {
    log.info('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    log.info(log_message);
    mainWindow.webContents.send('updateProgressCheck', progressObj.percent);
})

autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded');
    mainWindow.webContents.send('completedDownload');
});


ipcMain.on("quitAndInstall", (event, arg) => {
    autoUpdater.quitAndInstall();
});


ipcMain.on("closeApplication", (event, arg) => {
    app.quit();
});

ipcMain.on("minimizeApp", (event, arg) => {
    mainWindow.minimize();
});

ipcMain.on("ChangeInitText", (event, arg) => {
    ChangeInitText(arg.text, arg.color);
});


ipcMain.on("ChangeSecondText", (event, arg) => {
    ChangeSecondText(arg.text, arg.color);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
