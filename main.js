const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');

function createWindow() {
   let bWindow = new BrowserWindow({
     width: 1200,
     height: 800
   });
   bWindow.setResizable(false);
   bWindow.loadURL(url.format ({
      pathname: path.join(__dirname, '/app/index.html'),
      protocol: 'file:',
      slashes: true
   }));
}

app.on('ready', createWindow);
