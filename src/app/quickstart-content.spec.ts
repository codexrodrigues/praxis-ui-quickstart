import { STEPPER_PROFESSIONAL_FORM_CONFIG } from './quickstart-content';

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
