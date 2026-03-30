import { routes } from './app.routes';

describe('routes', () => {
  it('lazy-loads the home and core path pages', () => {
    const corePaths = ['', 'examples/table', 'examples/form', 'examples/crud', 'examples/list'];

    for (const path of corePaths) {
      const route = routes.find((candidate) => candidate.path === path);
      expect(route).withContext(`missing route for ${path}`).toBeDefined();
      expect(route?.loadComponent).withContext(`route ${path} should use loadComponent`).toEqual(jasmine.any(Function));
      expect(route?.component).withContext(`route ${path} should not eagerly bind a component`).toBeUndefined();
    }
  });

  it('keeps advanced routes lazy and preserves the fallback redirect', () => {
    const advancedPaths = ['examples/manual-form', 'examples/tabs', 'examples/stepper', 'examples/expansion'];

    for (const path of advancedPaths) {
      const route = routes.find((candidate) => candidate.path === path);
      expect(route).withContext(`missing advanced route for ${path}`).toBeDefined();
      expect(route?.loadComponent).withContext(`advanced route ${path} should use loadComponent`).toEqual(jasmine.any(Function));
    }

    const fallback = routes.find((candidate) => candidate.path === '**');
    expect(fallback?.redirectTo).toBe('');
  });
});
