const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');

function createWindow() {
   let bWindow = new BrowserWindow({
     width: 1200,
     height: 800,
     titleBarStyle: 'hidden'
   });
   bWindow.setResizable(false);
   bWindow.setMenu(null);
   bWindow.loadURL(url.format ({
      pathname: path.join(__dirname, '/app/index.html'),
      protocol: 'file:',
      slashes: true
   }));
}

app.on('ready', createWindow);
