/* ===== UTILS.JS — ENHANCED ===== */
const Utils = {
    generateId: () => '_' + Math.random().toString(36).substr(2, 9),
    
    randomInt: (min, max) => Math.floor(Math.random() * (max - min)) + min,
    
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    
    saveLS: (key, val) => {
        try { localStorage.setItem('nova_' + key, JSON.stringify(val)); } catch (e) { console.error(e); }
    },
    
    loadLS: (key, def = null) => {
        try {
            const d = localStorage.getItem('nova_' + key);
            return d ? JSON.parse(d) : def;
        } catch (e) { return def; }
    },
    
    el: (id) => document.getElementById(id),
    
    qs: (sel, ctx = document) => ctx.querySelector(sel),
    
    qsa: (sel, ctx = document) => [...ctx.querySelectorAll(sel)],
    
    debounce: (fn, ms) => {
        let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
    },

    playSound: (id) => {
        const audio = document.getElementById(id);
        if (audio && !System.isMuted) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    },

    formatTime: (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    },

    formatDate: (date) => {
        return date.toLocaleDateString([], { month: 'short', day: '2-digit' });
    }
};

const Toast = {
    show: (title, body = '', type = 'info') => {
        console.log(`Toast: ${title} - ${body}`);
        // Simple console log for now, can be expanded to UI if needed
        Utils.playSound('sfx-notif');
    }
};
