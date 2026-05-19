/* ===== FILESYSTEM.JS — ENHANCED ===== */
const FileSystem = {
  tree: Utils.loadLS('fs_tree', {
    'home': {
      type: 'folder', icon: '🏠',
      children: {
        'nova': {
          type: 'folder', icon: '👤',
          children: {
            'Documents': {
              type: 'folder', icon: '📁',
              children: {
                'Secret.txt': { type: 'file', icon: '📄', content: 'The password is nova.' }
              }
            },
            'Pictures': { type: 'folder', icon: '🖼️', children: {} },
            'Music': { type: 'folder', icon: '🎵', children: {} }
          }
        }
      }
    },
    'bin': { type: 'folder', icon: '📁', children: {} },
    'etc': { type: 'folder', icon: '📁', children: {} }
  }),
  
  currentPath: Utils.loadLS('fs_path', ['home', 'nova']),

  save() {
    Utils.saveLS('fs_tree', this.tree);
    Utils.saveLS('fs_path', this.currentPath);
  },

  getCurrentChildren() {
    let node = this.tree;
    for (const part of this.currentPath) {
      if (!node[part]) return {};
      node = node[part].children;
    }
    return node || {};
  },

  navigate(name) {
    const children = this.getCurrentChildren();
    if (children[name] && children[name].type === 'folder') {
      this.currentPath.push(name);
      this.save();
      return true;
    }
    return false;
  },

  addFile(name, content, type = 'file', icon = '📄') {
    const children = this.getCurrentChildren();
    children[name] = { type, icon, content };
    if (type === 'folder') children[name].children = {};
    this.save();
    return true;
  },

  mkdir(name) {
    return this.addFile(name, null, 'folder', '📁');
  },

  remove(name) {
    const children = this.getCurrentChildren();
    if (children[name]) {
      delete children[name];
      this.save();
      return true;
    }
    return false;
  }
};
