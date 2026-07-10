// Copyright (c) 2026 Peter Lulham. Licensed under the MIT License.

import { expect, test, describe } from 'vitest';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from '../app.js';

describe('Color Conversion Utilities', () => {
    test('hexToRgb handles 6-digit hex', () => {
        expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
        expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
        expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('hexToRgb handles 3-digit hex', () => {
        expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
        expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
        expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('rgbToHex handles valid RGB', () => {
        expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
        expect(rgbToHex(0, 0, 0)).toBe('#000000');
        expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    });

    test('rgbToHex clamps out-of-bounds values', () => {
        expect(rgbToHex(300, -10, 128)).toBe('#ff0080');
    });

    test('rgbToHsl conversion accuracy', () => {
        // Pure Red
        expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
        // Pure White
        expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
        // Pure Black
        expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
        // Middle Gray
        expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 });
    });

    test('hslToRgb round-trip accuracy', () => {
        const originalHsl = { h: 210, s: 50, l: 50 };
        const rgb = hslToRgb(originalHsl.h, originalHsl.s, originalHsl.l);
        const resultHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        expect(resultHsl.h).toBe(originalHsl.h);
        expect(resultHsl.s).toBe(originalHsl.s);
        expect(resultHsl.l).toBe(originalHsl.l);
    });

    test('invalid hex inputs', () => {
        expect(hexToRgb('garbage')).toEqual({ r: 0, g: 0, b: 0 });
    });
});
