// Copyright (c) 2026 Peter Lulham. Licensed under the MIT License.

/**
 * Colorway App Logic
 */

// --- Data Structures ---

export class LeafNode {
    constructor(id, color) {
        this.id = id;
        this.color = color;
        this.type = 'leaf';
    }
}

export class SplitNode {
    constructor(direction, child1, child2) {
        this.direction = direction; // 'horizontal' or 'vertical'
        this.child1 = child1;
        this.child2 = child2;
        this.type = 'split';
    }
}

// --- Utility Functions (Pure Logic) ---

export function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    const isShort = hex.length === 4 && /^#([0-9A-F]{3})$/i.test(hex);
    const isLong = hex.length === 7 && /^#([0-9A-F]{6})$/i.test(hex);

    if (isShort) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (isLong) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
}

export function rgbToHex(r, g, b) {
    const toHex = (n) => {
        const hex = Math.max(0, Math.min(255, n)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; 
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

export function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l; 
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

export function getRandomColor() {
    return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

// --- Main Application Class ---

export class ColorwayApp {
    constructor() {
        const initialColor = getRandomColor();
        this.panels = [{ id: 1, color: initialColor }];
        this.layoutTree = new LeafNode(1, initialColor);
        this.nextId = 2;
        this.editingPanelId = null;

        this.container = document.querySelector('.layout-container');
        this.addBtn = document.getElementById('add-btn');
        this.removeBtn = document.getElementById('remove-btn');
        this.modalOverlay = document.querySelector('.modal-overlay');
        this.closeModalBtn = document.getElementById('close-modal');

        this.hexInput = document.getElementById('hex-input');
        this.rgbR = document.getElementById('rgb-r');
        this.rgbG = document.getElementById('rgb-g');
        this.rgbB = document.getElementById('rgb-b');
        this.hslH = document.getElementById('hsl-h');
        this.hslS = document.getElementById('hsl-s');
        this.hslL = document.getElementById('hsl-l');
        this.colorPreview = document.getElementById('color-preview');

        this.init();
    }

    init() {
        this.addBtn.addEventListener('click', () => this.addPanel());
        this.removeBtn.addEventListener('click', () => this.removePanel());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) this.closeModal();
        });

        this.container.addEventListener('click', (e) => {
            const panel = e.target.closest('.panel');
            if (panel) {
                this.openModal(parseInt(panel.dataset.id));
            }
        });

        this.setupColorInputs();
        this.render();
    }

    addPanel() {
        if (this.panels.length >= 5) return;

        const id = this.nextId++;
        const color = getRandomColor();
        const newLeaf = new LeafNode(id, color);

        this.panels.push({ id, color });
        this.layoutTree = this.splitLastLeaf(this.layoutTree, newLeaf);
        this.render();
    }

    splitLastLeaf(node, newLeaf) {
        if (node.type === 'leaf') {
            const direction = this.panels.length % 2 === 0 ? 'vertical' : 'horizontal';
            return new SplitNode(direction, node, newLeaf);
        }
        if (node.type === 'split') {
            node.child2 = this.splitLastLeaf(node.child2, newLeaf);
            return node;
        }
        return node;
    }

    removePanel() {
        if (this.panels.length <= 1) return;
        const lastPanel = this.panels.pop();
        this.panels = this.panels.filter(p => p.id !== lastPanel.id);
        this.layoutTree = this.removeLeaf(this.layoutTree, lastPanel.id);
        this.render();
    }

    removeLeaf(node, idToRemove) {
        if (node.type === 'leaf') {
            if (node.id === idToRemove) return null;
            return node;
        }
        if (node.type === 'split') {
            const c1 = this.removeLeaf(node.child1, idToRemove);
            const c2 = this.removeLeaf(node.child2, idToRemove);
            if (c1 === null) return c2;
            if (c2 === null) return c1;
            node.child1 = c1;
            node.child2 = c2;
            return node;
        }
        return node;
    }

    render() {
        this.container.innerHTML = '';
        if (this.layoutTree) {
            this.container.appendChild(this.createDomNode(this.layoutTree));
        }
    }

    createDomNode(node) {
        if (node.type === 'leaf') {
            const div = document.createElement('div');
            div.className = 'panel';
            div.style.backgroundColor = node.color;
            div.dataset.id = node.id;
            return div;
        } else {
            const container = document.createElement('div');
            container.className = `split-container split-${node.direction}`;
            container.appendChild(this.createDomNode(node.child1));
            container.appendChild(this.createDomNode(node.child2));
            return container;
        }
    }

    openModal(panelId) {
        this.editingPanelId = panelId;
        const panel = this.panels.find(p => p.id === panelId);
        if (panel) {
            this.updateModalInputs(panel.color);
            this.modalOverlay.classList.remove('hidden');
        }
    }

    closeModal() {
        this.modalOverlay.classList.add('hidden');
        this.editingPanelId = null;
    }

    updateModalInputs(color) {
        this.hexInput.value = color.toUpperCase();
        const rgb = hexToRgb(color);
        this.rgbR.value = rgb.r;
        this.rgbG.value = rgb.g;
        this.rgbB.value = rgb.b;

        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        this.hslH.value = hsl.h;
        this.hslS.value = hsl.s;
        this.hslL.value = hsl.l;

        this.colorPreview.style.backgroundColor = color;
    }

    setupColorInputs() {
        this.hexInput.addEventListener('input', (e) => {
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-F]{3,6}$/i.test(val)) {
                this.applyColor(val);
            }
        });

        const updateRgb = () => {
            const r = parseInt(this.rgbR.value) || 0;
            const g = parseInt(this.rgbG.value) || 0;
            const b = parseInt(this.rgbB.value) || 0;
            const hex = rgbToHex(r, g, b);
            this.applyColor(hex, 'rgb');
        };
        this.rgbR.addEventListener('input', updateRgb);
        this.rgbG.addEventListener('input', updateRgb);
        this.rgbB.addEventListener('input', updateRgb);

        const updateHsl = () => {
            const h = parseInt(this.hslH.value);
            const s = parseInt(this.hslS.value);
            const l = parseInt(this.hslL.value);
            const rgb = hslToRgb(h, s, l);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            this.applyColor(hex, 'hsl');
        };
        this.hslH.addEventListener('input', updateHsl);
        this.hslS.addEventListener('input', updateHsl);
        this.hslL.addEventListener('input', updateHsl);
    }

    updateNodeColorById(node, id, newColor) {
        if (node.type === 'leaf') {
            if (node.id === id) {
                node.color = newColor;
                return true;
            }
            return false;
        }
        if (node.type === 'split') {
            return this.updateNodeColorById(node.child1, id, newColor) ||
                   this.updateNodeColorById(node.child2, id, newColor);
        }
        return false;
    }

    applyColor(hex, source = '') {
        const panel = this.panels.find(p => p.id === this.editingPanelId);
        if (panel) {
            panel.color = hex;
            this.updateNodeColorById(this.layoutTree, this.editingPanelId, hex);
            if (source !== 'hex') this.hexInput.value = hex.toUpperCase();
            if (source !== 'rgb') {
                const rgb = hexToRgb(hex);
                this.rgbR.value = rgb.r;
                this.rgbG.value = rgb.g;
                this.rgbB.value = rgb.b;
            }
            if (source !== 'hsl') {
                const rgb = hexToRgb(hex);
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                this.hslH.value = hsl.h;
                this.hslS.value = hsl.s;
                this.hslL.value = hsl.l;
            }
            this.colorPreview.style.backgroundColor = hex;
            this.render();
        }
    }
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new ColorwayApp();
    });
}
