import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { type MaterialCurrencyMetadata } from '@praxisui/core';
import { MaterialCurrencyComponent } from '@praxisui/dynamic-fields';

describe('Payroll BRL currency control from published rc.34', () => {
  it('preserves semantic cents through hydration, keyboard editing and JSON for operational boundaries', async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialCurrencyComponent, FormsModule, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(MaterialCurrencyComponent);
    const control = fixture.componentInstance;
    control.setInputMetadata({ name: 'valor', label: 'Valor', controlType: 'currency',
      currency: 'BRL', locale: 'pt-BR', decimalPlaces: 2 } as MaterialCurrencyMetadata);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    let transmitted: unknown;
    control.registerOnChange((value: unknown) => { transmitted = value; });
    const cases = [
      { value: 0, lastDigit: '0', display: '0,00' },
      { value: 0.01, lastDigit: '1', display: '0,01' },
      { value: 100, lastDigit: '0', display: '100,00' },
      { value: 999999999999.99, lastDigit: '9', display: '999.999.999.999,99' },
    ];
    for (const testCase of cases) {
      control.writeValue(testCase.value); fixture.detectChanges();
      expect(input.value).withContext('hydrate BRL boundary').toBe(testCase.display);
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: testCase.lastDigit, cancelable: true }));
      fixture.detectChanges();
      expect(input.value).withContext('keyboard round-trip').toBe(testCase.display);
      expect(JSON.parse(JSON.stringify({ valor: transmitted })).valor).toBe(testCase.value);
    }
  });
});
