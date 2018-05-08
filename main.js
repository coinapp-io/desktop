const electron = require('electron');
var log = require('electron-log');

const ipcMain = electron.ipcMain;

const {autoUpdater} = require("electron-updater");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const defaultMenu = require('electron-default-menu');
const { Menu, shell } = electron;

const path = require('path');
const url = require('url');

var os = require('os');

const Store = require('electron-store');
const store = new Store();


//
// import Transport from "@ledgerhq/hw-transport-node-hid";
// import AppBtc from "@ledgerhq/hw-app-btc";
// import AppEth from "@ledgerhq/hw-app-eth";
//
//
//
// ipcMain.on("checkForLedger", (event, arg) => {
//
//
// });
//
//
// ipcMain.on("signEthLedger", (event, path, rawtx) => {
//     const signedTx = async () => {
//     const transport = await Transport.create();
//     const eth = new AppEth(transport);
//     const result = await eth.signTransaction(path, rawtx);
//     return result.s;
//     };
//     signedTx().then(a =>
//         mainWindow.webContents.send('ledgerEthAddress', a)
//     );
// });
//
//
// ipcMain.on("openBtcLedger", (event, arg) => {
//     const getBtcAddress = async () => {
//     const transport = await Transport.create();
//     const btc = new AppBtc(transport);
//     const result = await btc.getWalletPublicKey(arg);
//     return result.bitcoinAddress;
//     };
//     getBtcAddress().then(a =>
//         mainWindow.webContents.send('ledgerBtcAddress', a)
//     );
// });
//
//
//
// ipcMain.on("openEthLedger", (event, arg) => {
//     const getEthAddress = async () => {
//     const transport = await Transport.create();
//     const eth = new AppEth(transport);
//     const result = await eth.getAddress(arg);
//     return result.address;
//     };
//     getEthAddress().then(a =>
//     mainWindow.webContents.send('ledgerEthAddress', a)
//     );
// });
//


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
      webPreferences: {
          // allowRunningInsecureContent: false,
          // experimentalFeatures: false,
          // webSecurity: true,
          // nodeIntegration: false,
          preload: __dirname+'/src/constants.js'
      }
  });

    if (process.env.NODE_ENV=="test") {
        mainWindow.setResizable(true);
    } else {
        mainWindow.setResizable(false);
    }
  mainWindow.setFullScreenable(false);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'views/index.html'),
    protocol: 'file:',
    slashes: true
  }));

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
