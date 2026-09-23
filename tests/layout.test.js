// Copyright (c) 2026 Peter Lulham. Licensed under the MIT License.

import { expect, test, describe, beforeEach } from 'vitest';
import { ColourwayApp, LeafNode, SplitNode } from '../app.js';
import { JSDOM } from 'jsdom';

describe('Tiling Layout Engine', () => {
    let app;

    beforeEach(() => {
        const dom = new JSDOM(`
            <!DOCTYPE html>
            <html lang="en">
            <body style="width: 1000px; height: 1000px;">
                <div id="app">
                    <main class="layout-container"></main>
                    <section class="controls" aria-label="Layout Controls">
                        <button id="add-btn" aria-label="Add Panel">+</button>
                        <button id="remove-btn" aria-label="Remove Panel">−</button>
                    </section>
                    <div class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                        <div class="colour-modal">
                            <button id="close-modal" aria-label="Close modal">&times;</button>
                            <h2 id="modal-title">Edit Colour</h2>
                            <div class="input-group">
                                <label for="hex-input">Hex</label>
                                <input type="text" id="hex-input">
                            </div>
                            <fieldset class="input-group">
                                <legend>RGB</legend>
                                <div class="rgb-inputs">
                                    <label for="rgb-r" class="visually-hidden">Red</label>
                                    <input type="number" id="rgb-r" min="0" max="255">
                                    <label for="rgb-g" class="visually-hidden">Green</label>
                                    <input type="number" id="rgb-g" min="0" max="255">
                                    <label for="rgb-b" class="visually-hidden">Blue</label>
                                    <input type="number" id="rgb-b" min="0" max="255">
                                </div>
                            </fieldset>
                            <fieldset class="input-group">
                                <legend>HSL</legend>
                                <div class="hsl-sliders">
                                    <div class="slider-row"><label for="hsl-h">H</label><input type="range" id="hsl-h" min="0" max="360"></div>
                                    <div class="slider-row"><label for="hsl-s">S</label><input type="range" id="hsl-s" min="0" max="100"></div>
                                    <div class="slider-row"><label for="hsl-l">L</label><input type="range" id="hsl-l" min="0" max="100"></div>
                                </div>
                            </fieldset>
                            <div id="colour-preview" class="colour-preview"></div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
        Object.defineProperty(global, 'document', { value: dom.window.document, writable: true });
        Object.defineProperty(global, 'window', { value: dom.window, writable: true });
        Object.defineProperty(global, 'HTMLElement', { value: dom.window.HTMLElement, writable: true });
        Object.defineProperty(global, 'Node', { value: dom.window.Node, writable: true });
        Object.defineProperty(global, 'Element', { value: dom.window.Element, writable: true });

        app = new ColourwayApp();
    });

    test('initial state has one panel', () => {
        expect(app.panels.length).toBe(1);
        expect(app.layoutTree.type).toBe('leaf');
        expect(app.layoutTree.id).toBe(1);
        
        const panel = document.querySelector('.panel');
        expect(panel).not.toBeNull();
        expect(panel.dataset.id).toBe("1");
    });

    test('adding panels grows the tree and respects limits', () => {
        app.addPanel(); // 2
        expect(app.panels.length).toBe(2);
        expect(app.layoutTree.type).toBe('split');

        app.addPanel(); // 3
        app.addPanel(); // 4
        app.addPanel(); // 5
        expect(app.panels.length).toBe(5);

        app.addPanel(); // Should not add 6th
        expect(app.panels.length).toBe(5);
        
        const panels = document.querySelectorAll('.panel');
        expect(panels.length).toBe(5);
    });

    test('dwindling pattern verification', () => {
        app.addPanel(); // 2
        app.addPanel(); // 3
        
        expect(app.layoutTree.type).toBe('split');
        expect(app.layoutTree.child1.type).toBe('leaf');
        expect(app.layoutTree.child2.type).toBe('split');
        expect(app.layoutTree.child2.child1.type).toBe('leaf');
        expect(app.layoutTree.child2.child2.type).toBe('leaf');
    });

    test('removing panels shrinks the tree and respects limits', () => {
        app.addPanel(); // 2
        app.addPanel(); // 3
        expect(app.panels.length).toBe(3);

        app.removePanel(); // 2
        expect(app.panels.length).toBe(2);
        expect(app.layoutTree.type).toBe('split');

        app.removePanel(); // 1
        expect(app.panels.length).toBe(1);
        expect(app.layoutTree.type).toBe('leaf');

        app.removePanel(); // Should not remove last
        expect(app.panels.length).toBe(1);
        expect(app.layoutTree.type).toBe('leaf');
    });

    test('tree structure integrity after removals', () => {
        app.addPanel(); // 2
        app.addPanel(); // 3
        app.addPanel(); // 4
        
        const lastId = app.panels[app.panels.length - 1].id;
        app.removePanel();
        
        expect(app.panels.length).toBe(3);
        
        const checkNulls = (node) => {
            if (node.type === 'split') {
                expect(node.child1).not.toBeNull();
                expect(node.child2).not.toBeNull();
                checkNulls(node.child1);
                checkNulls(node.child2);
            }
        };
        checkNulls(app.layoutTree);
    });
});
