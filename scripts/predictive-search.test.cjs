// Run: node --experimental-vm-modules --test scripts/predictive-search.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

for (const nativeIdle of [false, true]) {
  for (const returningVisitor of [false, true]) {
    test(`search connects: native idle=${nativeIdle}, returning visitor=${returningVisitor}`, async () => {
      const scheduled = [];
      const elements = new Map();
      const window = {
        setTimeout(callback, delay) { scheduled.push({ callback, route: 'timeout', delay }); return 1; },
      };
      if (nativeIdle) window.requestIdleCallback = (callback) => {
        scheduled.push({ callback, route: 'idle' }); return 1;
      };
      class Component {
        refs = { searchInput: { value: '' } };
        connectedCallback() {}
        closest() { return null; }
      }
      const context = vm.createContext({
        window, AbortController, HTMLElement: class {}, ResizeObserver: class {},
        matchMedia: () => ({ matches: false }),
        customElements: { get: (name) => elements.get(name), define: (name, cls) => elements.set(name, cls) },
        localStorage: { getItem: () => returningVisitor ? '[123]' : null },
        ...(nativeIdle ? { requestIdleCallback: window.requestIdleCallback } : {}),
      });
      const modules = new Map();
      function source(file) {
        return new vm.SourceTextModule(readFileSync(path.join(__dirname, '../assets', file), 'utf8'), { context });
      }
      function stub(values) {
        return new vm.SyntheticModule(Object.keys(values), function () {
          for (const [name, value] of Object.entries(values)) this.setExport(name, value);
        }, { context });
      }
      modules.set('@theme/utilities', source('utilities.js'));
      modules.set('@theme/recently-viewed-products', source('recently-viewed-products.js'));
      modules.set('@theme/component', stub({ Component }));
      modules.set('@theme/section-renderer', stub({ sectionRenderer: {} }));
      modules.set('@theme/morph', stub({ morph() {} }));
      modules.set('@theme/dialog', stub({ DialogCloseEvent: {}, DialogOpenEvent: {}, DialogComponent: class {} }));
      modules.set('@shopify/events', stub({ SearchUpdateEvent: {} }));
      const search = source('predictive-search.js');
      await search.link((specifier) => {
        assert.ok(modules.has(specifier), `unexpected dependency: ${specifier}`);
        return modules.get(specifier);
      });
      await search.evaluate();
      const component = new (elements.get('predictive-search-component'))();
      const resets = [];
      // Observe the public boundary reached by the real private empty-state loader.
      component.resetSearch = (keepFocus) => resets.push(keepFocus);
      assert.doesNotThrow(() => component.connectedCallback());
      assert.equal(scheduled.length, returningVisitor ? 1 : 0);
      if (returningVisitor) {
        assert.equal(scheduled[0].route, nativeIdle ? 'idle' : 'timeout');
        if (!nativeIdle) assert.equal(scheduled[0].delay, 0);
        scheduled[0].callback();
        assert.deepEqual(resets, [false]);
        scheduled[0].callback();
        assert.deepEqual(resets, [false], 'empty state loads only once');
      }
    });
  }
}
