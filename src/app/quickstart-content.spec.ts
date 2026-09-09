import {
  INSTALL_COMMAND,
  SETUP_STEPS,
  STEPPER_PROFESSIONAL_FORM_CONFIG,
} from './quickstart-content';

describe('Quickstart installation guidance', () => {
  it('publishes the stable Praxis train with exact Angular peer versions', () => {
    expect(SETUP_STEPS[0].detail).toContain('@praxisui/* 9.0.53 packages');
    expect(SETUP_STEPS[0].detail).not.toContain('-rc.');
    expect(INSTALL_COMMAND).toContain('@angular/animations@21.2.20');
    expect(INSTALL_COMMAND).toContain('@angular/cdk@21.2.14');
    expect(INSTALL_COMMAND).toContain('@angular/material@21.2.14');
    expect(INSTALL_COMMAND).not.toContain('@^');
    const praxisVersions = Array.from(
      INSTALL_COMMAND.matchAll(/@praxisui\/[\w-]+@([^\s\\]+)/g),
      (match) => match[1],
    );
    expect(praxisVersions.length).toBeGreaterThan(0);
    expect(new Set(praxisVersions)).toEqual(new Set(['9.0.53']));
  });
});

describe('Quickstart stepper option sources', () => {
  it('uses canonical option-source metadata so the runtime resolves the options filter route once', () => {
    const fieldByName = new Map(
      (STEPPER_PROFESSIONAL_FORM_CONFIG.fieldMetadata ?? []).map((field) => [
        field.name,
        field,
      ]),
    );

    expect(fieldByName.get('departmentId')).toEqual(jasmine.objectContaining({
      resourcePath: 'human-resources/departamentos',
      optionsEndpoint: 'filter',
      optionValueKey: 'id',
      optionLabelKey: 'label',
    }));
    expect(fieldByName.get('roleId')).toEqual(jasmine.objectContaining({
      resourcePath: 'human-resources/cargos',
      optionsEndpoint: 'filter',
      optionValueKey: 'id',
      optionLabelKey: 'label',
    }));
  });
});
