/* ===== WINDOWMANAGER.JS ===== */
class WindowManager {
  constructor() {
    this.windows = {};
    this.zCounter = 200;
    this.activeWin = null;
    this.container = null;
    this.taskbarApps = null;
  }
  init() {
    this.container = Utils.el('windows-container');
    this.taskbarApps = Utils.el('taskbar-apps');
    document.addEventListener('mousedown', e => {
      const win = e.target.closest('.window');
      if (win) this.focus(win.dataset.winId);
    });
  }
  create(cfg) {
    const id = Utils.generateId();
    const { title, icon = '', width = 700, height = 480, minWidth = 320, minHeight = 200, content = '', appId = '', noResize = false } = cfg;
    const x = Utils.randomInt(80, Math.max(81, window.innerWidth - width - 80));
    const y = Utils.randomInt(40, Math.max(41, window.innerHeight - height - 90));
    const win = document.createElement('div');
    win.className = 'window window-animate-in';
    win.dataset.winId = id;
    win.dataset.appId = appId;
    win.style.cssText = `left:${x}px;top:${y}px;width:${width}px;height:${height}px;z-index:${++this.zCounter}`;
    win.innerHTML = `
      <div class="titlebar" data-win-id="${id}">
        <div class="titlebar-controls">
          <button class="tb-btn tb-close" title="Close"></button>
          <button class="tb-btn tb-min" title="Minimize"></button>
          <button class="tb-btn tb-max" title="Maximize"></button>
        </div>
        <div class="titlebar-icon">${icon}</div>
        <div class="titlebar-title">${title}</div>
      </div>
      <div class="window-body">${content}</div>
      ${!noResize ? '<div class="window-resize-handle"></div>' : ''}
    `;
    this.container.appendChild(win);
    this.windows[id] = { el: win, title, appId, minimized: false, maximized: false, x, y, width, height, prevState: { x, y, width, height } };
    // Controls
    win.querySelector('.tb-close').onclick = () => this.close(id);
    win.querySelector('.tb-min').onclick = () => this.minimize(id);
    win.querySelector('.tb-max').onclick = () => this.toggleMaximize(id);
    // Drag
    this._makeDraggable(win, id);
    // Resize
    if (!noResize) this._makeResizable(win, id, minWidth, minHeight);
    this.focus(id);
    this._addTaskbarItem(id, title, icon, appId);
    return id;
  }
  _makeDraggable(win, id) {
    const tb = win.querySelector('.titlebar');
    let dragging = false, ox = 0, oy = 0;
    tb.addEventListener('mousedown', e => {
      if (e.target.closest('.tb-btn') || e.target.closest('.titlebar-actions') || e.target.closest('.tb-action')) return;
      const w = this.windows[id];
      if (w.maximized) return;
      dragging = true;
      const rect = win.getBoundingClientRect();
      ox = e.clientX - rect.left; oy = e.clientY - rect.top;
      win.style.transition = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const w = this.windows[id];
      const nx = Utils.clamp(e.clientX - ox, 0, window.innerWidth - w.width);
      const ny = Utils.clamp(e.clientY - oy, 0, window.innerHeight - 52 - 20);
      win.style.left = nx + 'px'; win.style.top = ny + 'px';
      w.x = nx; w.y = ny;
      // snap indicators
      if (e.clientX < 10) win.classList.add('snap-hint-left');
      else win.classList.remove('snap-hint-left');
    });
    document.addEventListener('mouseup', e => {
      if (!dragging) return;
      dragging = false;
      win.style.transition = '';
      if (e.clientX < 10) this._snapLeft(id);
      else if (e.clientX > window.innerWidth - 10) this._snapRight(id);
    });
  }
  _makeResizable(win, id, minW, minH) {
    const handle = win.querySelector('.window-resize-handle');
    if (!handle) return;
    let resizing = false, ox = 0, oy = 0, ow = 0, oh = 0;
    handle.addEventListener('mousedown', e => {
      resizing = true; ox = e.clientX; oy = e.clientY;
      ow = win.offsetWidth; oh = win.offsetHeight;
      win.style.transition = 'none'; e.preventDefault(); e.stopPropagation();
    });
    document.addEventListener('mousemove', e => {
      if (!resizing) return;
      const w = this.windows[id];
      const nw = Math.max(minW, ow + (e.clientX - ox));
      const nh = Math.max(minH, oh + (e.clientY - oy));
      win.style.width = nw + 'px'; win.style.height = nh + 'px';
      w.width = nw; w.height = nh;
    });
    document.addEventListener('mouseup', () => { if (resizing) { resizing = false; win.style.transition = ''; } });
  }
  _snapLeft(id) {
    const w = this.windows[id];
    w.prevState = { x: w.x, y: w.y, width: w.width, height: w.height };
    const h = window.innerHeight - 52;
    w.el.style.cssText += `;left:0;top:0;width:50vw;height:${h}px;border-radius:0`;
    w.width = window.innerWidth / 2; w.height = h;
  }
  _snapRight(id) {
    const w = this.windows[id];
    const hw = window.innerWidth / 2, h = window.innerHeight - 52;
    w.el.style.cssText += `;left:${hw}px;top:0;width:${hw}px;height:${h}px;border-radius:0`;
    w.width = hw; w.height = h;
  }
  focus(id) {
    if (!this.windows[id]) return;
    Object.values(this.windows).forEach(w => w.el.classList.remove('focused'));
    const w = this.windows[id];
    w.el.classList.add('focused');
    w.el.style.zIndex = ++this.zCounter;
    this.activeWin = id;
    this._updateTaskbar();
  }
  minimize(id) {
    const w = this.windows[id];
    if (!w) return;
    w.minimized = !w.minimized;
    w.el.classList.toggle('minimized', w.minimized);
    if (w.minimized) this.activeWin = null;
    else this.focus(id);
    this._updateTaskbar();
  }
  toggleMaximize(id) {
    const w = this.windows[id];
    if (!w) return;
    if (!w.maximized) {
      w.prevState = { x: parseInt(w.el.style.left), y: parseInt(w.el.style.top), width: w.el.offsetWidth, height: w.el.offsetHeight };
      const h = window.innerHeight - 52;
      Object.assign(w.el.style, { left: '0', top: '0', width: '100vw', height: h + 'px', borderRadius: '0', border: 'none' });
      w.maximized = true;
    } else {
      const s = w.prevState;
      Object.assign(w.el.style, { left: s.x + 'px', top: s.y + 'px', width: s.width + 'px', height: s.height + 'px', borderRadius: '', border: '' });
      w.maximized = false;
    }
  }
  close(id) {
    const w = this.windows[id];
    if (!w) return;
    w.el.style.opacity = '0';
    w.el.style.transform = 'scale(0.9)';
    w.el.style.transition = 'all 0.2s ease';
    setTimeout(() => { w.el.remove(); delete this.windows[id]; this._updateTaskbar(); }, 200);
    if (this.activeWin === id) this.activeWin = null;
  }
  closeByApp(appId) {
    Object.entries(this.windows).forEach(([id, w]) => { if (w.appId === appId) this.close(id); });
  }
  isOpen(appId) {
    return Object.values(this.windows).some(w => w.appId === appId);
  }
  _addTaskbarItem(id, title, icon, appId) {
    const item = document.createElement('div');
    item.className = 'taskbar-app';
    item.dataset.winId = id;
    item.dataset.appId = appId;
    item.innerHTML = `<div class="app-icon-small">${icon}</div><span>${title}</span>`;
    item.onclick = () => {
      const w = this.windows[id];
      if (!w) return;
      if (w.minimized) { this.minimize(id); }
      else if (this.activeWin === id) { this.minimize(id); }
      else { this.focus(id); }
    };
    this.taskbarApps.appendChild(item);
  }
  _updateTaskbar() {
    Utils.qsa('.taskbar-app').forEach(item => {
      const id = item.dataset.winId;
      const w = this.windows[id];
      item.classList.toggle('active', id === this.activeWin && w && !w.minimized);
      if (!w) item.remove();
    });
  }
}
const WM = new WindowManager();
