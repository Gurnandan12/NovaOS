/* ===== NOVAOS CORE SCRIPT ===== */

const System = {
    isLocked: true,
    isMuted: false,
    theme: Utils.loadLS('theme', 'dark'),
    wallpaper: Utils.loadLS('wallpaper', 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop'),
    bootTime: Date.now(),

    init() {
        this.applyTheme(this.theme);
        this.applyWallpaper(this.wallpaper);
        this.initClock();
        this.initLogin();
        this.initSystray();
        this.initSystemStats();
        this.initSearch();
        this.initDesktopEvents();
        
        // Modules init
        WM.init();
        AppLauncher.init();
    },

    initLogin() {
        const passInput = Utils.el('login-password');
        const loginBtn = Utils.el('login-btn');

        const attemptLogin = () => {
            if (passInput.value.toLowerCase() === 'nova') {
                this.unlock();
            } else {
                passInput.parentElement.classList.add('shake');
                setTimeout(() => passInput.parentElement.classList.remove('shake'), 400);
                passInput.value = '';
                passInput.placeholder = "Try 'nova'";
            }
        };

        loginBtn.onclick = attemptLogin;
        passInput.onkeydown = (e) => { if (e.key === 'Enter') attemptLogin(); };
    },

    unlock() {
        this.isLocked = false;
        Utils.el('lock-screen').classList.add('hidden');
        Utils.playSound('sfx-startup');
        this.renderDesktopIcons();
    },

    shutdown() {
        document.body.style.opacity = '0';
        setTimeout(() => location.reload(), 1000);
    },

    restart() {
        location.reload();
    },

    applyTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        Utils.saveLS('theme', theme);
    },

    applyWallpaper(url) {
        this.wallpaper = url;
        Utils.el('desktop').style.backgroundImage = `url('${url}')`;
        Utils.el('lock-screen').style.backgroundImage = `url('${url}')`;
        Utils.saveLS('wallpaper', url);
    },

    initSystemStats() {
        // Battery Monitoring
        if ('getBattery' in navigator) {
            navigator.getBattery().then(batt => {
                const updateBatt = () => {
                    const level = Math.round(batt.level * 100);
                    const isCharging = batt.charging;
                    Utils.el('tray-batt-val').textContent = `${level}%`;
                    Utils.el('pop-batt-status').textContent = `${level}% ${isCharging ? '(Charging)' : ''}`;
                    Utils.el('tray-battery').style.color = level < 20 ? '#ff5f56' : 'inherit';
                };
                batt.onlevelchange = updateBatt;
                batt.onchargingchange = updateBatt;
                updateBatt();
            });
        } else {
            // Safari / No API Fallback
            Utils.el('tray-batt-val').textContent = ''; 
            Utils.el('pop-batt-status').textContent = 'System Powered (AC)';
        }

        // WiFi Monitoring
        const updateNet = () => {
            const isOnline = navigator.onLine;
            const wifiIcon = Utils.el('tray-wifi');
            const popStatus = Utils.el('pop-wifi-status');
            
            wifiIcon.style.color = isOnline ? 'inherit' : '#ff5f56';
            popStatus.textContent = isOnline ? 'Connected' : 'Offline';
            popStatus.style.color = isOnline ? 'var(--accent)' : '#ff5f56';
        };
        window.addEventListener('online', updateNet);
        window.addEventListener('offline', updateNet);
        updateNet();
    },

    initSearch() {
        const overlay = Utils.el('search-overlay');
        const input = Utils.el('global-search-input');
        const results = Utils.el('search-results');
        const searchBtn = Utils.el('taskbar-search-btn');

        const closeSearch = () => {
            overlay.classList.remove('active');
            input.value = '';
            results.innerHTML = '';
        };

        const openSearch = () => {
            overlay.classList.add('active');
            input.focus();
        };

        searchBtn.onclick = openSearch;

        // Toggle with Meta+K or Ctrl+K
        window.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            if (e.key === 'Escape') closeSearch();
        });

        overlay.onclick = (e) => { if (e.target === overlay) closeSearch(); };

        input.oninput = () => {
            const query = input.value.toLowerCase().trim();
            if (!query) {
                results.innerHTML = '';
                return;
            }

            const matches = [];

            // Search Apps
            const apps = [
                { id: 'browser', title: 'Browser', icon: '🌐', type: 'System App' },
                { id: 'terminal', title: 'Terminal', icon: '🐚', type: 'System App' },
                { id: 'notes', title: 'Notes', icon: '📝', type: 'System App' },
                { id: 'settings', title: 'Settings', icon: '⚙️', type: 'System App' },
                { id: 'files', title: 'Files', icon: '📂', type: 'System App' },
                { id: 'wallpapers', title: 'Wallpapers', icon: '🖼️', type: 'Settings' }
            ];

            // Add Command Option
            const terminalCommands = ['ls', 'cd', 'mkdir', 'touch', 'rm', 'cat', 'edit', 'neofetch', 'hack', 'clear'];
            const firstWord = query.split(' ')[0];
            if (terminalCommands.includes(firstWord)) {
                matches.push({
                    title: `Run "${query}"`,
                    icon: '🐚',
                    type: 'Terminal Command',
                    action: () => {
                        AppLauncher.open('terminal');
                        setTimeout(() => {
                            const termInput = Utils.el('terminal-input');
                            if (termInput) {
                                termInput.value = query;
                                const event = new KeyboardEvent('keydown', { key: 'Enter' });
                                termInput.dispatchEvent(event);
                                // Triggering the actual onkeydown logic
                                termInput.onkeydown({ key: 'Enter' });
                            }
                        }, 500);
                    }
                });
            }

            apps.forEach(app => {
                if (app.title.toLowerCase().includes(query)) {
                    matches.push({ ...app, action: () => AppLauncher.open(app.id) });
                }
            });

            // Search Files (Recursive)
            const searchFiles = (node, path = '') => {
                Object.entries(node).forEach(([name, data]) => {
                    if (name.toLowerCase().includes(query)) {
                        matches.push({
                            title: name,
                            icon: data.icon || (data.type === 'folder' ? '📁' : '📄'),
                            type: data.type === 'folder' ? 'Folder' : 'File',
                            action: () => {
                                if (data.type === 'folder') {
                                    FileSystem.currentPath = [...path.split('/').filter(Boolean), name];
                                    AppLauncher.open('files');
                                } else {
                                    AppLauncher.open(`fileviewer-${name.replace(/\s+/g, '-')}`, { name, ...data });
                                }
                            }
                        });
                    }
                    if (data.type === 'folder' && data.children) {
                        searchFiles(data.children, path + '/' + name);
                    }
                });
            };
            searchFiles(FileSystem.tree);

            results.innerHTML = matches.length ? matches.map(m => `
                <div class="search-item">
                    <div class="search-item-icon">${m.icon}</div>
                    <div class="search-item-info">
                        <div class="search-item-name">${m.title}</div>
                        <div class="search-item-type">${m.type}</div>
                    </div>
                </div>
            `).join('') : '<div class="no-results">No apps or files found matching your search.</div>';

            Utils.qsa('.search-item', results).forEach((el, i) => {
                el.onclick = () => {
                    matches[i].action();
                    closeSearch();
                };
            });
        };
    },

    initClock() {
        const update = () => {
            const now = new Date();
            Utils.el('clock-time').textContent = Utils.formatTime(now);
            Utils.el('clock-date').textContent = Utils.formatDate(now);
            
            const uptime = Math.floor((Date.now() - this.bootTime) / 60000);
            Utils.el('uptime-val').textContent = `${uptime}m`;
        };
        setInterval(update, 1000);
        update();
    },

    initSystray() {
        const tray = Utils.el('systray');
        const popup = Utils.el('systray-popup');
        
        tray.onmouseenter = () => popup.classList.add('active');
        tray.onmouseleave = () => popup.classList.remove('active');
    },

    initDesktopEvents() {
        const main = Utils.el('desktop-main');
        const ctxMenu = Utils.el('context-menu');
        
        // Right click menu
        main.oncontextmenu = (e) => {
            e.preventDefault();
            ctxMenu.style.left = e.clientX + 'px';
            ctxMenu.style.top = e.clientY + 'px';
            ctxMenu.classList.add('active');
        };

        window.onclick = () => ctxMenu.classList.remove('active');

        Utils.qsa('.ctx-item').forEach(item => {
            item.onclick = () => {
                const action = item.dataset.action;
                if (action === 'refresh') location.reload();
                if (action === 'wallpaper') AppLauncher.open('settings', { tab: 'wallpapers' });
                if (action === 'openTerminal') AppLauncher.open('terminal');
                if (action === 'settings') AppLauncher.open('settings');
                ctxMenu.classList.remove('active');
            };
        });

        // Selection Box
        let startX, startY;
        const box = Utils.el('selection-box');

        main.onmousedown = (e) => {
            if (e.target !== main) return;
            startX = e.clientX;
            startY = e.clientY;
            box.style.left = startX + 'px';
            box.style.top = startY + 'px';
            box.classList.remove('hidden');

            const onMove = (me) => {
                const w = me.clientX - startX;
                const h = me.clientY - startY;
                box.style.width = Math.abs(w) + 'px';
                box.style.height = Math.abs(h) + 'px';
                box.style.left = (w < 0 ? me.clientX : startX) + 'px';
                box.style.top = (h < 0 ? me.clientY : startY) + 'px';
            };

            const onUp = () => {
                box.classList.add('hidden');
                box.style.width = '0';
                box.style.height = '0';
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            };

            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        };
    },

    renderDesktopIcons() {
        const container = Utils.el('desktop-icons');
        const apps = [
            { id: 'browser', title: 'Browser', icon: '🌐' },
            { id: 'terminal', title: 'Terminal', icon: '🐚' },
            { id: 'notes', title: 'Notes', icon: '📝' },
            { id: 'settings', title: 'Settings', icon: '⚙️' },
            { id: 'wallpapers', title: 'Wallpapers', icon: '🖼️' },
            { id: 'files', title: 'Files', icon: '📂' }
        ];

        container.innerHTML = apps.map(app => `
            <div class="desktop-icon" data-app="${app.id}" draggable="true">
                <div class="icon-img">${app.icon}</div>
                <span>${app.title}</span>
            </div>
        `).join('');

        Utils.qsa('.desktop-icon').forEach(icon => {
            icon.ondblclick = () => AppLauncher.open(icon.dataset.app);
            icon.onclick = (e) => {
                e.stopPropagation();
                Utils.qsa('.desktop-icon').forEach(i => i.classList.remove('selected'));
                icon.classList.add('selected');
            };
        });
    }
};

window.onload = () => System.init();
