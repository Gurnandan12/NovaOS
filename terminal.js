/* ===== TERMINAL APP — ENHANCED ===== */

const TerminalApp = {
    history: [],
    cwd: '/home/nova',
    
    render() {
        return `
            <div class="terminal-app" id="terminal-screen">
                <div class="terminal-line" style="color: var(--accent);">NovaOS Terminal [Version 2.1.0]</div>
                <div class="terminal-line" style="color: var(--text2); margin-bottom: 16px;">(c) 2026 Nova Systems. All rights reserved.</div>
                <div id="terminal-output"></div>
                <div class="terminal-input-wrap">
                    <span class="terminal-prompt" id="terminal-prompt">nova@novos:${this.cwd}$</span>
                    <input type="text" class="terminal-input" id="terminal-input" autofocus autocomplete="off" spellcheck="false">
                </div>
            </div>
        `;
    },

    init() {
        const input = Utils.el('terminal-input');
        const output = Utils.el('terminal-output');
        const prompt = Utils.el('terminal-prompt');

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                if (cmd) {
                    this.execute(cmd, output);
                    this.history.push(cmd);
                }
                input.value = '';
                prompt.textContent = `nova@novos:${this.cwd}$`;
                Utils.el('terminal-screen').scrollTop = Utils.el('terminal-screen').scrollHeight;
            }
        };

        input.focus();
    },

    execute(cmdText, output) {
        const parts = cmdText.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        const print = (text, color = '') => {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            if (color) line.style.color = color;
            line.innerHTML = text;
            output.appendChild(line);
        };

        print(`<span class="terminal-prompt">nova@novos:${this.cwd}$</span> ${cmdText}`);

        switch(command) {
            case 'help':
                print('Available commands:');
                print('  help, clear, date, whoami, pwd, ls, cd, mkdir, touch, rm, neofetch, systeminfo, hack, open');
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            case 'ls':
                const children = FileSystem.getCurrentChildren();
                const list = Object.entries(children).map(([name, data]) => {
                    const color = data.type === 'folder' ? 'var(--accent3)' : 'var(--text)';
                    return `<span style="color: ${color}">${name}</span>`;
                });
                print(list.join('  '));
                break;
            case 'cd':
                if (!args[0] || args[0] === '~') {
                    FileSystem.currentPath = ['home', 'nova'];
                    this.cwd = '/home/nova';
                    break;
                }
                if (args[0] === '..') {
                    if (FileSystem.currentPath.length > 0) {
                        FileSystem.currentPath.pop();
                        this.cwd = '/' + FileSystem.currentPath.join('/');
                    }
                    break;
                }
                if (FileSystem.navigate(args[0])) {
                    this.cwd = '/' + FileSystem.currentPath.join('/');
                } else {
                    print(`cd: ${args[0]}: No such directory`, 'var(--red)');
                }
                break;
            case 'mkdir':
                if (!args[0]) { print('mkdir: missing operand', 'var(--red)'); break; }
                if (FileSystem.mkdir(args[0])) {
                    print(`Directory '${args[0]}' created.`);
                } else {
                    print(`mkdir: cannot create directory '${args[0]}'`, 'var(--red)');
                }
                break;
            case 'touch':
                if (!args[0]) { print('touch: missing file operand', 'var(--red)'); break; }
                FileSystem.addFile(args[0], '');
                print(`File '${args[0]}' created.`);
                break;
            case 'rm':
                if (!args[0]) { print('rm: missing operand', 'var(--red)'); break; }
                if (FileSystem.remove(args[0])) {
                    print(`Removed '${args[0]}'.`);
                } else {
                    print(`rm: cannot remove '${args[0]}': No such file or directory`, 'var(--red)');
                }
                break;
            case 'cat':
                if (!args[0]) { print('cat: missing operand', 'var(--red)'); break; }
                const fileToCat = FileSystem.getCurrentChildren()[args[0]];
                if (fileToCat && fileToCat.type === 'file') {
                    print(fileToCat.content || '(empty file)');
                } else {
                    print(`cat: ${args[0]}: No such file`, 'var(--red)');
                }
                break;
            case 'edit':
                if (!args[0]) { print('edit: missing operand', 'var(--red)'); break; }
                const fileToEdit = FileSystem.getCurrentChildren()[args[0]];
                if (fileToEdit && fileToEdit.type === 'file') {
                    const newContent = prompt(`Editing ${args[0]}:`, fileToEdit.content || '');
                    if (newContent !== null) {
                        fileToEdit.content = newContent;
                        FileSystem.save();
                        print(`File '${args[0]}' updated.`);
                    }
                } else {
                    print(`edit: ${args[0]}: No such file`, 'var(--red)');
                }
                break;
            case 'neofetch':
                print('<pre style="color: var(--accent);">   _  __                ____  _____</pre>');
                print('<pre style="color: var(--accent);">  / |/ /__ _  __ ___ _ / __ \\/ ___/</pre>');
                print('<pre style="color: var(--accent);"> /    / _ \\ |/ // _ `/ / /_/ /\\__ \\ </pre>');
                print('<pre style="color: var(--accent);">/_/|_/\\___/___/ \\_,_/  \\____/____/ </pre>');
                print('----------------------------------');
                print('OS: NovaOS 2.1.0-stable');
                print('Kernel: nova-core-v4');
                print('Shell: nova-sh');
                print('DE: Nova Desktop');
                break;
            case 'hack':
                print('Initializing kernel exploit...', 'var(--green)');
                let i = 0;
                const hacking = setInterval(() => {
                    print(`[${i}%] Bypassing security layer ${Math.floor(i/10)}...`, 'var(--green)');
                    i += 10;
                    if (i > 100) {
                        clearInterval(hacking);
                        print('SYSTEM COMPROMISED. Root access granted.', 'var(--red)');
                    }
                }, 200);
                break;
            case 'open':
                if (!args[0]) { print('open: missing argument'); break; }
                AppLauncher.open(args[0]);
                break;
            default:
                print(`Command not found: ${command}. Type 'help' for assistance.`, 'var(--text2)');
        }
    }
};
