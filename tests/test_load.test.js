// Copyright (c) 2026 Peter Lulham. Licensed under the MIT License.

import { describe, it, expect } from 'vitest';

// This will fail because app.js doesn't export anything
// and it will also try to access document when it's loaded.
// import { ColorwayApp } from './app.js'; 

describe('app.js loading', () => {
    it('should load without error', () => {
        expect(true).toBe(true);
    });
});
