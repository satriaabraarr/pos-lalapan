/**
 * Pembungkus desktop (Electron) untuk POS Lalapan.
 * Aplikasi web yang sama dijalankan di dalam jendela desktop,
 * sehingga bisa dipakai offline-LAN di komputer kasir.
 *
 * Jalankan: npm run desktop
 */
const { app, BrowserWindow, Menu } = require("electron");

const URL_APP = process.env.APP_URL || "http://localhost:3000";

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: "POS Lalapan",
    backgroundColor: "#F5F6F8",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });

  win.loadURL(URL_APP);
  win.once("ready-to-show", () => win.show());
}

Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
