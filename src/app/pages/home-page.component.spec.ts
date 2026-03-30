import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  it('presents onboarding, theme ownership, and core versus advanced sections', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();

    expect(text).toContain('First 10 minutes');
    expect(text).toContain('Theme ownership');
    expect(text).toContain('The host keeps the visual identity');
    expect(text).toContain('Start here');
    expect(text).toContain('Expand after the host is proven');
    expect(text).toContain('Praxis Table');
    expect(text).toContain('Praxis Dynamic Form');
    expect(text).toContain('Praxis CRUD');
    expect(text).toContain('Praxis List');
    expect(text).toContain('Praxis Tabs');
    expect(text).toContain('Praxis Expansion');
  });
});
