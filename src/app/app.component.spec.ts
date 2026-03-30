import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App shell', () => {
  afterEach(() => {
    document.body.removeAttribute('data-theme');
  });

  it('renders the core navigation and host theme switcher', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();

    expect(text).toContain('Praxis UI Quickstart');
    expect(text).toContain('Home');
    expect(text).toContain('Table');
    expect(text).toContain('Form');
    expect(text).toContain('CRUD');
    expect(text).toContain('List');
    expect(text).not.toContain('Manual Form');
    expect(text).not.toContain('Stepper');
    expect(text).toContain('Default');
    expect(text).toContain('Corporate');
    expect(text).toContain('High contrast');
    expect(document.body.getAttribute('data-theme')).toBe('default');
  });
});
