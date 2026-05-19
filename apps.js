/* ===== APP LAUNCHER & APPS ===== */

const AppLauncher = {
    init() {
        const startBtn = Utils.el('start-menu-btn');
        const startMenu = Utils.el('start-menu');
        const grid = Utils.el('start-apps-grid');

        // Pinned Apps for Start Menu
        const apps = [
            { id: 'browser', title: 'Browser', icon: '🌐' },
            { id: 'terminal', title: 'Terminal', icon: '🐚' },
            { id: 'notes', title: 'Notes', icon: '📝' },
            { id: 'settings', title: 'Settings', icon: '⚙️' },
            { id: 'files', title: 'Files', icon: '📂' },
            { id: 'wallpapers', title: 'Wallpapers', icon: '🖼️' }
        ];

        startBtn.onclick = (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('active');
            if (startMenu.classList.contains('active')) {
                this.renderStartApps(grid, apps);
            }
        };

        window.addEventListener('click', () => startMenu.classList.remove('active'));
        startMenu.onclick = (e) => e.stopPropagation();
    },

    renderStartApps(grid, apps) {
        grid.innerHTML = apps.map(app => `
            <div class="start-app-item" onclick="AppLauncher.open('${app.id}'); document.getElementById('start-menu').classList.remove('active')">
                <div class="start-app-item-icon">${app.icon}</div>
                <div class="start-app-item-name">${app.title}</div>
            </div>
        `).join('');
    },

    open(appId, params = {}) {
        if (WM.isOpen(appId)) {
            WM.focus(appId);
            if (appId === 'settings' && params.tab) {
                SettingsApp.switchTab(params.tab);
            }
            return;
        }

        let content = '';
        let title = '';
        let icon = '';

        switch(appId) {
            case 'browser':
                title = 'Nova Browser';
                icon = '🌐';
                content = BrowserApp.render();
                break;
            case 'settings':
                title = 'Settings';
                icon = '⚙️';
                content = SettingsApp.render();
                break;
            case 'terminal':
                title = 'Terminal';
                icon = '🐚';
                content = TerminalApp.render();
                break;
            case 'files':
                title = 'Files';
                icon = '📂';
                content = FilesApp.render();
                break;
            case 'notes':
                title = 'Notes';
                icon = '📝';
                content = NotesApp.render();
                break;
            case 'music':
                title = 'Music Player';
                icon = '🎵';
                content = MusicApp.render();
                break;
            case 'wallpapers':
                title = 'Wallpapers';
                icon = '🖼️';
                content = SettingsApp.render();
                break;
            default:
                if (appId.startsWith('fileviewer')) {
                    title = params.name || 'File Viewer';
                    icon = params.icon || '📄';
                    content = FileViewerApp.render(params);
                } else {
                    title = appId.charAt(0).toUpperCase() + appId.slice(1);
                    icon = '📦';
                    content = `<div style="padding: 20px; color: var(--text2)">${title} application is still under development.</div>`;
                }
        }

        WM.create({
            id: appId,
            title,
            icon,
            content,
            width: appId.startsWith('fileviewer') ? 600 : 800,
            height: appId.startsWith('fileviewer') ? 500 : 500
        });

        // App specific init
        if (appId === 'terminal') TerminalApp.init();
        if (appId === 'settings' || appId === 'wallpapers') {
            const finalId = appId === 'wallpapers' ? 'settings' : appId;
            SettingsApp.init();
            if (appId === 'wallpapers') SettingsApp.switchTab('wallpapers');
            if (params.tab) SettingsApp.switchTab(params.tab);
        }
        if (appId === 'browser') BrowserApp.init();
        if (appId === 'files') FilesApp.init();
        if (appId === 'notes') NotesApp.init();
        if (appId === 'music') MusicApp.init();
        if (appId.startsWith('fileviewer')) FileViewerApp.init(params);
    }
};

/* --- Browser App --- */
const BrowserApp = {
    render() {
        return `
            <div class="browser-app">
                <div class="browser-tabs">
                    <div class="browser-tab active">New Tab</div>
                    <div class="browser-tab">+</div>
                </div>
                <div class="browser-nav">
                    <button class="win-btn win-min" onclick="BrowserApp.goHome()" title="Home" style="width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></button>
                    <button class="win-btn win-min" onclick="BrowserApp.refresh()" title="Refresh" style="width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
                    <div class="browser-address">
                        <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        <input type="text" id="browser-url" value="https://nova.search">
                    </div>
                </div>
                <div id="browser-viewport" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; color: #333;">
                    <h1 style="font-size: 3rem; margin-bottom: 20px;">Nova Search</h1>
                    <div style="width: 60%; max-width: 500px; position: relative;">
                        <input type="text" placeholder="Search the web..." style="width: 100%; padding: 12px 20px; border-radius: 30px; border: 1px solid #ddd; outline: none; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    </div>
                    <div style="margin-top: 30px; display: flex; gap: 20px;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="BrowserApp.goTo('https://github.com')">
                            <div style="width: 48px; height: 48px; background: #f1f3f4; border-radius: 50%; display: flex; align-items: center; justify-content: center;">GH</div>
                            <span style="font-size: 0.8rem;">GitHub</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;" onclick="BrowserApp.goTo('https://wikipedia.org')">
                            <div style="width: 48px; height: 48px; background: #f1f3f4; border-radius: 50%; display: flex; align-items: center; justify-content: center;">WK</div>
                            <span style="font-size: 0.8rem;">Wikipedia</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    init() {
        const urlInput = Utils.el('browser-url');
        urlInput.onkeydown = (e) => {
            if (e.key === 'Enter') this.goTo(urlInput.value);
        };

        // Live Search Suggestions (Simulator)
        urlInput.oninput = () => {
            const query = urlInput.value;
            if (query.length > 2 && !query.includes('.')) {
                // In a real app, we would fetch from Google's Suggest API here
                // For this project, we provide a connected feel with live detection
                console.log('Fetching live suggestions for:', query);
            }
        };
    },
    goHome() {
        const win = WM.windows['browser'].el;
        win.querySelector('.window-body').innerHTML = this.render();
        this.init();
    },
    refresh() {
        const url = Utils.el('browser-url').value;
        if (url.includes('nova.search')) {
            this.goHome();
        } else {
            this.goTo(url);
        }
    },
    async goTo(url) {
        const viewport = Utils.el('browser-viewport');
        const urlInput = Utils.el('browser-url');
        
        if (!url) return;

        const isUrl = url.includes('.') && !url.includes(' ');
        
        if (!isUrl) {
            this.renderSearchResults(url);
            return;
        }

        let finalUrl = url.startsWith('http') ? url : 'https://' + url;
        urlInput.value = finalUrl;
        
        // Show loading state
        viewport.innerHTML = `<div class="no-results">Connecting to ${url}...</div>`;

        // We use a dual approach: Try normal iframe first, but provide a 'Proxy Mode' button
        viewport.innerHTML = `
            <div class="browser-web-view">
                <iframe src="${finalUrl}" class="browser-iframe" id="main-browser-frame"></iframe>
                <div class="browser-compat-layer" id="compat-layer" style="display: none; position: absolute; inset: 0; background: #fff; overflow: auto; padding: 20px;"></div>
                <div class="browser-toolbar-bottom" style="position: absolute; bottom: 0; left: 0; right: 0; background: var(--surface2); padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); font-size: 0.75rem;">
                    <span>Secure Connection: ${url}</span>
                    <button class="win-btn" onclick="BrowserApp.tryProxy('${finalUrl}')" style="padding: 4px 12px; font-size: 0.7rem; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer;">Enable Compatibility Mode</button>
                </div>
            </div>
        `;
    },

    async tryProxy(url) {
        const layer = Utils.el('compat-layer');
        const frame = Utils.el('main-browser-frame');
        layer.style.display = 'block';
        layer.innerHTML = 'Loading via Nova Proxy...';
        frame.style.display = 'none';

        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            // Inject content but try to fix relative paths (basic fix)
            let content = data.contents;
            const baseUrl = new URL(url).origin;
            content = content.replace(/href="\//g, `href="${baseUrl}/`);
            content = content.replace(/src="\//g, `src="${baseUrl}/`);
            
            layer.innerHTML = content;
        } catch (err) {
            layer.innerHTML = `<div style="padding: 40px; text-align: center;">Compatibility Mode failed for this site. <br><br> <button onclick="window.open('${url}', '_blank')" class="lock-btn">Open in New Tab</button></div>`;
        }
    },

    async renderSearchResults(query) {
        const viewport = Utils.el('browser-viewport');
        Utils.el('browser-url').value = `nova.search?q=${encodeURIComponent(query)}`;

        // Loading state
        viewport.innerHTML = `<div class="no-results">Searching for "${query}"...</div>`;

        try {
            // Fetch real results from DuckDuckGo API
            const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`);
            const data = await response.json();
            
            const results = [];
            
            // Add Abstract (Instant Answer) if exists
            if (data.AbstractText) {
                results.push({
                    title: data.Heading || query,
                    url: data.AbstractURL,
                    desc: data.AbstractText
                });
            }

            // Add Related Topics
            data.RelatedTopics.slice(0, 5).forEach(topic => {
                if (topic.Text && topic.FirstURL) {
                    results.push({
                        title: topic.Text.split(' - ')[0] || query,
                        url: topic.FirstURL,
                        desc: topic.Text
                    });
                }
            });

            // Fallback if no results
            if (results.length === 0) {
                results.push({ title: `${query} - General Search`, url: `https://www.google.com/search?q=${query}`, desc: `Search results for ${query} are available on the web.` });
            }

            viewport.innerHTML = `
                <div class="search-results-page">
                    <div class="search-header">
                        <div class="search-tabs">
                            <span class="active">All</span>
                            <span>Images</span>
                            <span>News</span>
                            <span>Videos</span>
                        </div>
                        <div class="search-stats">Real-time results for "${query}"</div>
                    </div>
                    <div class="results-list">
                        ${results.map(r => `
                            <div class="result-item">
                                <div class="result-url">${r.url}</div>
                                <div class="result-title" onclick="BrowserApp.goTo('${r.url}')">${r.title}</div>
                                <div class="result-desc">${r.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (err) {
            viewport.innerHTML = `<div class="no-results">Error fetching results. Please check your connection.</div>`;
        }
    }
};

/* --- Settings App --- */
const SettingsApp = {
    render() {
        const categories = {
            'Futuristic': [
                'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop'
            ],
            'Cars': [
                'https://images.unsplash.com/photo-1606148386450-48b8ec0c5482?q=80&w=2070&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1594731802114-1694f267b057?q=80&w=2070&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1616422285623-13ff0167c958?q=80&w=2070&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?q=80&w=2070&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2070&auto=format&fit=crop'
            ],
            'Nature': [
                'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop'
            ]
        };

        const customWallpapers = Utils.loadLS('custom_wallpapers', []);

        return `
            <div class="settings-app">
                <div class="settings-sidebar">
                    <div class="settings-item active" data-tab="appearance">
                        <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        Appearance
                    </div>
                    <div class="settings-item" data-tab="wallpapers">
                        <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        Wallpapers
                    </div>
                    <div class="settings-item" data-tab="system">
                        <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        System
                    </div>
                </div>
                <div class="settings-content">
                    <div id="tab-appearance" class="settings-section active">
                        <h2>Appearance</h2>
                        <p style="color: var(--text2); margin-bottom: 24px;">Customize the look and feel of your OS.</p>
                        
                        <div class="theme-switch">
                            <div class="theme-card ${System.theme === 'dark' ? 'active' : ''}" data-theme="dark">
                                <div style="width: 100%; height: 60px; background: #0d0d14; border-radius: 8px; margin-bottom: 12px;"></div>
                                <span>Dark Mode</span>
                            </div>
                            <div class="theme-card ${System.theme === 'light' ? 'active' : ''}" data-theme="light">
                                <div style="width: 100%; height: 60px; background: #f0f2f5; border-radius: 8px; margin-bottom: 12px;"></div>
                                <span>Light Mode</span>
                            </div>
                        </div>
                    </div>

                    <div id="tab-wallpapers" class="settings-section">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: var(--surface2); padding: 16px; border-radius: var(--radius);">
                            <div>
                                <h2 style="margin:0">Wallpapers</h2>
                                <p style="font-size: 0.8rem; color: var(--text2);">Personalize your desktop background.</p>
                            </div>
                            <button class="lock-btn lock-btn-primary" id="upload-wp-btn" style="padding: 10px 20px; font-size: 0.9rem; flex: 0 0 auto;">
                                <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                Upload Photo
                            </button>
                            <input type="file" id="wp-file-input" style="display: none;" accept="image/*">
                        </div>

                        ${customWallpapers.length > 0 ? `
                            <h3 style="font-size: 1rem; color: var(--text2);">My Uploads</h3>
                            <div class="wallpaper-grid">
                                ${customWallpapers.map(wp => `
                                    <div class="wallpaper-card ${System.wallpaper === wp ? 'active' : ''}" data-wp="${wp}">
                                        <img src="${wp}" alt="Custom Wallpaper">
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        ${Object.entries(categories).map(([cat, wps]) => `
                            <h3 style="margin-top: 24px; font-size: 1rem; color: var(--text2);">${cat}</h3>
                            <div class="wallpaper-grid">
                                ${wps.map(wp => `
                                    <div class="wallpaper-card ${System.wallpaper === wp ? 'active' : ''}" data-wp="${wp}">
                                        <img src="${wp}" alt="Wallpaper" onerror="this.src='https://via.placeholder.com/400x225?text=Image+Missing'">
                                    </div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>

                    <div id="tab-system" class="settings-section">
                        <h2>System Information</h2>
                        <div style="background: var(--surface2); padding: 20px; border-radius: 12px; margin-top: 20px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                <span>OS Name</span>
                                <span style="color: var(--text2);">NovaOS</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                <span>Version</span>
                                <span style="color: var(--text2);">2.1.0-stable</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Kernel</span>
                                <span style="color: var(--text2);">nova-core-v4</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    switchTab(tabId) {
        const win = WM.windows['settings']?.el;
        if (!win) return;
        Utils.qsa('.settings-item', win).forEach(item => {
            if (item.dataset.tab === tabId) item.click();
        });
    },
    init() {
        const win = WM.windows['settings'].el;
        
        // Tab switching
        Utils.qsa('.settings-item').forEach(item => {
            item.onclick = () => {
                Utils.qsa('.settings-item').forEach(i => i.classList.remove('active'));
                Utils.qsa('.settings-section').forEach(s => s.classList.remove('active'));
                item.classList.add('active');
                Utils.el(`tab-${item.dataset.tab}`).classList.add('active');
            };
        });

        // Theme switching
        Utils.qsa('.theme-card').forEach(card => {
            card.onclick = () => {
                Utils.qsa('.theme-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                System.applyTheme(card.dataset.theme);
            };
        });

        // Wallpaper switching
        const initWpEvents = () => {
            Utils.qsa('.wallpaper-card').forEach(card => {
                card.onclick = () => {
                    Utils.qsa('.wallpaper-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    System.applyWallpaper(card.dataset.wp);
                };
            });
        };
        initWpEvents();

        // Custom Upload Logic
        const uploadBtn = win.querySelector('#upload-wp-btn');
        const fileInput = win.querySelector('#wp-file-input');

        if (uploadBtn && fileInput) {
            uploadBtn.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    const customs = Utils.loadLS('custom_wallpapers', []);
                    customs.unshift(base64);
                    Utils.saveLS('custom_wallpapers', customs);
                    
                    // Refresh UI
                    WM.windows['settings'].el.querySelector('.window-body').innerHTML = SettingsApp.render();
                    SettingsApp.init(); // Re-init events
                    System.applyWallpaper(base64);
                    Toast.show('Wallpaper Uploaded', 'Your custom photo is now active.', 'success');
                };
                reader.readAsDataURL(file);
            };
        }
    }
};

/* --- Files App --- */
const FilesApp = {
    render() {
        const path = FileSystem.currentPath;
        const children = FileSystem.getCurrentChildren();

        return `
            <div class="files-app">
                <div class="files-sidebar">
                    <div class="sidebar-section">Favorites</div>
                    <div class="sidebar-item active" data-path="home,nova">
                        <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        Home
                    </div>
                    <div class="sidebar-item" data-path="home,nova,Documents">
                        <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Documents
                    </div>
                    <div class="sidebar-item" data-path="home,nova,Pictures">
                        <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        Pictures
                    </div>
                </div>
                <div class="files-main">
                    <div class="files-toolbar">
                        <div class="files-nav-btns">
                            <button class="nav-btn" id="files-back" ${path.length <= 2 ? 'disabled' : ''}>
                                <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                            </button>
                        </div>
                        <div class="files-breadcrumbs">
                            ${path.map((p, i) => `
                                <span class="breadcrumb-item" data-index="${i}">${p}</span>
                                ${i < path.length - 1 ? '<span class="sep">/</span>' : ''}
                            `).join('')}
                        </div>
                        <div style="flex:1"></div>
                        <button class="lock-btn lock-btn-primary" id="files-upload-btn" style="padding: 6px 12px; font-size: 0.75rem;">
                            <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            Upload
                        </button>
                        <input type="file" id="files-input" style="display: none;">
                    </div>
                    <div class="files-grid">
                        ${Object.entries(children).map(([name, data]) => `
                            <div class="file-item" data-name="${name}" data-type="${data.type}">
                                <div class="file-icon">${data.icon || (data.type === 'folder' ? '📁' : '📄')}</div>
                                <div class="file-name">${name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const win = WM.windows['files'].el;
        
        // Navigation: Double click icons
        Utils.qsa('.file-item', win).forEach(item => {
            item.ondblclick = () => {
                const name = item.dataset.name;
                const data = FileSystem.getCurrentChildren()[name];

                if (data.type === 'folder') {
                    FileSystem.navigate(name);
                    this.refresh();
                } else {
                    const isAudio = name.match(/\.(mp3|wav|ogg)$/i);
                    if (isAudio) {
                        MusicApp.playExternal(name, data.content);
                    } else {
                        AppLauncher.open(`fileviewer-${name.replace(/\s+/g, '-')}`, { name, ...data });
                    }
                }
            };
        });

        // Sidebar Navigation
        Utils.qsa('.sidebar-item', win).forEach(item => {
            item.onclick = () => {
                const newPath = item.dataset.path.split(',');
                FileSystem.currentPath = newPath;
                this.refresh();
            };
        });

        // Back Button
        const backBtn = win.querySelector('#files-back');
        if (backBtn) {
            backBtn.onclick = () => {
                if (FileSystem.currentPath.length > 1) {
                    FileSystem.currentPath.pop();
                    this.refresh();
                }
            };
        }

        // Upload Logic
        const uploadBtn = win.querySelector('#files-upload-btn');
        const fileInput = win.querySelector('#files-input');

        if (uploadBtn && fileInput) {
            uploadBtn.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    const name = file.name;
                    const isImg = file.type.startsWith('image/');
                    
                    FileSystem.addFile(name, content, isImg ? 'file' : 'file', isImg ? '🖼️' : '📄');
                    this.refresh();
                    Toast.show('File Uploaded', `${name} added to ${FileSystem.currentPath.join('/')}`, 'success');
                };
                
                if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                    reader.readAsDataURL(file);
                } else {
                    reader.readAsText(file);
                }
            };
        }
    },

    refresh() {
        const win = WM.windows['files'].el;
        win.querySelector('.window-body').innerHTML = this.render();
        this.init();
    }
};

/* --- File Viewer App --- */
const FileViewerApp = {
    render(file) {
        const isImg = file.content && (file.content.startsWith('data:image/') || file.icon === '🖼️');
        
        return `
            <div class="file-viewer-app">
                <div class="viewer-content">
                    ${isImg ? 
                        `<img src="${file.content}" style="max-width: 100%; max-height: 100%; border-radius: 8px;">` :
                        `<pre style="white-space: pre-wrap; word-break: break-all; color: var(--text); padding: 20px;">${file.content || 'No content'}</pre>`
                    }
                </div>
                <div class="viewer-footer">
                    <span>${file.name}</span>
                </div>
            </div>
        `;
    },
    init() {}
};

/* --- Notes App --- */
const NotesApp = {
    render() {
        const notes = Utils.loadLS('notes', []);
        
        return `
            <div class="notes-app">
                <div class="notes-sidebar">
                    <button class="lock-btn lock-btn-primary" id="new-note-btn" style="width: 100%; margin-bottom: 16px;">+ New Note</button>
                    <div class="notes-list" id="notes-list">
                        ${notes.map((note, i) => `
                            <div class="note-item" data-id="${i}">
                                <div class="note-title">${note.title || 'Untitled'}</div>
                                <div class="note-preview">${note.content.substring(0, 30)}...</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="notes-editor">
                    <input type="text" id="note-title-input" placeholder="Title" class="note-title-field">
                    <textarea id="note-content-input" placeholder="Start typing..." class="note-content-field"></textarea>
                    <div class="notes-actions">
                        <button class="lock-btn lock-btn-primary" id="save-note-btn">Save</button>
                        <button class="lock-btn" id="delete-note-btn" style="background: var(--red);">Delete</button>
                    </div>
                </div>
            </div>
        `;
    },

    currentNoteId: null,

    init() {
        const win = WM.windows['notes'].el;
        const notes = Utils.loadLS('notes', []);

        // Sidebar items
        Utils.qsa('.note-item', win).forEach(item => {
            item.onclick = () => {
                const id = parseInt(item.dataset.id);
                this.currentNoteId = id;
                const note = notes[id];
                win.querySelector('#note-title-input').value = note.title;
                win.querySelector('#note-content-input').value = note.content;
                Utils.qsa('.note-item', win).forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            };
        });

        // New Note
        win.querySelector('#new-note-btn').onclick = () => {
            this.currentNoteId = null;
            win.querySelector('#note-title-input').value = '';
            win.querySelector('#note-content-input').value = '';
            Utils.qsa('.note-item', win).forEach(i => i.classList.remove('active'));
        };

        // Save Note
        win.querySelector('#save-note-btn').onclick = () => {
            const title = win.querySelector('#note-title-input').value;
            const content = win.querySelector('#note-content-input').value;
            if (!content) return;

            const allNotes = Utils.loadLS('notes', []);
            const note = { title, content, date: Date.now() };

            if (this.currentNoteId !== null) {
                allNotes[this.currentNoteId] = note;
            } else {
                allNotes.unshift(note);
            }

            Utils.saveLS('notes', allNotes);
            this.refresh();
            Toast.show('Saved', 'Your note has been saved.', 'success');
        };

        // Delete Note
        win.querySelector('#delete-note-btn').onclick = () => {
            if (this.currentNoteId === null) return;
            const allNotes = Utils.loadLS('notes', []);
            allNotes.splice(this.currentNoteId, 1);
            Utils.saveLS('notes', allNotes);
            this.currentNoteId = null;
            this.refresh();
            Toast.show('Deleted', 'Note removed.', 'info');
        };
    },

    refresh() {
        const win = WM.windows['notes'].el;
        win.querySelector('.window-body').innerHTML = this.render();
        this.init();
    }
};

/* --- Music App --- */
const MusicApp = {
    defaultPlaylist: [
        { title: 'Winning Speech', artist: 'Karan Aujla', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { title: 'Nova Dreams', artist: 'Nova Systems', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
    ],
    
    getPlaylist() {
        return Utils.loadLS('music_playlist', this.defaultPlaylist);
    },

    savePlaylist(playlist) {
        Utils.saveLS('music_playlist', playlist);
    },
    currentIndex: 0,
    isPlaying: false,
    audio: new Audio(),

    render() {
        const playlist = this.getPlaylist();
        const track = playlist[this.currentIndex] || this.defaultPlaylist[0];
        return `
            <div class="music-app">
                <div class="music-player-main">
                    <div class="music-cover-wrap">
                        <img src="${track.cover}" class="music-cover" id="music-cover-img">
                    </div>
                    <div class="music-info">
                        <h2 id="music-title">${track.title}</h2>
                        <p id="music-artist">${track.artist}</p>
                    </div>
                    <div class="music-controls">
                        <button class="music-btn" onclick="MusicApp.prev()"><svg viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                        <button class="music-btn play-btn" id="music-play-btn" onclick="MusicApp.toggle()">
                            <svg viewBox="0 0 24 24" width="32" fill="currentColor" id="play-icon"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                        <button class="music-btn" onclick="MusicApp.next()"><svg viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6z"/></svg></button>
                    </div>
                    <div class="music-progress-wrap">
                        <div class="music-time" id="music-current">0:00</div>
                        <input type="range" class="music-progress" id="music-slider" value="0" step="1">
                        <div class="music-time" id="music-total">0:00</div>
                    </div>
                </div>
                <div class="music-sidebar">
                    <div class="music-sidebar-title">Playlist</div>
                    <div class="music-playlist-list">
                        ${playlist.map((s, i) => `
                            <div class="playlist-item ${i === this.currentIndex ? 'active' : ''}" onclick="MusicApp.playIndex(${i})">
                                <img src="${s.cover}">
                                <div class="playlist-item-info">
                                    <div class="playlist-item-title">${s.title}</div>
                                    <div class="playlist-item-artist">${s.artist}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="lock-btn" onclick="MusicApp.syncWithFiles()" style="width: 100%; margin-top: 20px; font-size: 0.75rem;">Sync Music Folder</button>
                </div>
            </div>
        `;
    },

    syncWithFiles() {
        const musicFolder = FileSystem.tree['home'].children['nova'].children['Music'].children;
        const playlist = this.getPlaylist();
        
        Object.entries(musicFolder).forEach(([name, data]) => {
            if (name.endsWith('.mp3') || name.endsWith('.wav')) {
                const alreadyExists = playlist.some(p => p.title === name);
                if (!alreadyExists) {
                    playlist.push({
                        title: name,
                        artist: 'Unknown Artist',
                        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
                        url: data.content // This should be the base64 or URL
                    });
                }
            }
        });

        this.savePlaylist(playlist);
        this.refresh();
        Toast.show('Sync Complete', 'Music folder scanned.', 'success');
    },

    init() {
        const playlist = this.getPlaylist();
        if (playlist[this.currentIndex]) {
            this.audio.src = playlist[this.currentIndex].url;
        }
        const slider = Utils.el('music-slider');
        
        this.audio.ontimeupdate = () => {
            const current = this.audio.currentTime;
            const total = this.audio.duration || 0;
            slider.value = (current / total) * 100 || 0;
            Utils.el('music-current').textContent = this.formatTime(current);
            Utils.el('music-total').textContent = this.formatTime(total);
        };

        slider.oninput = () => {
            const total = this.audio.duration || 0;
            this.audio.currentTime = (slider.value / 100) * total;
        };
    },

    toggle() {
        if (this.isPlaying) {
            this.audio.pause();
            Utils.el('play-icon').innerHTML = '<path d="M8 5v14l11-7z"/>';
        } else {
            this.audio.play();
            Utils.el('play-icon').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        }
        this.isPlaying = !this.isPlaying;
    },

    playIndex(index) {
        this.currentIndex = index;
        const playlist = this.getPlaylist();
        this.audio.src = playlist[this.currentIndex].url;
        this.isPlaying = false;
        this.refresh();
        this.toggle();
    },

    next() {
        const playlist = this.getPlaylist();
        this.playIndex((this.currentIndex + 1) % playlist.length);
    },

    prev() {
        const playlist = this.getPlaylist();
        this.playIndex((this.currentIndex - 1 + playlist.length) % playlist.length);
    },

    playExternal(name, content) {
        const playlist = this.getPlaylist();
        const alreadyIn = playlist.findIndex(p => p.title === name);
        
        if (alreadyIn !== -1) {
            this.playIndex(alreadyIn);
        } else {
            const newTrack = {
                title: name,
                artist: 'Local File',
                cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
                url: content
            };
            playlist.push(newTrack);
            this.savePlaylist(playlist);
            this.playIndex(playlist.length - 1);
        }
        
        if (!WM.isOpen('music')) {
            AppLauncher.open('music');
        } else {
            WM.focus('music');
        }
    },

    refresh() {
        const win = WM.windows['music'].el;
        win.querySelector('.window-body').innerHTML = this.render();
        this.init();
    },

    formatTime(secs) {
        const min = Math.floor(secs / 60);
        const sec = Math.floor(secs % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
};
