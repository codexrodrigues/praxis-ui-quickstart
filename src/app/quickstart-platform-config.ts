import type { GlobalConfig } from '@praxisui/core';

export const PRAXIS_API_ORIGIN =
  (globalThis as { __PRAXIS_API_ORIGIN__?: string }).__PRAXIS_API_ORIGIN__?.trim() ||
  'https://praxis-api-quickstart.onrender.com';

export const PRAXIS_API_BASE_URL = `${PRAXIS_API_ORIGIN}/api`;

export const GLOBAL_CONFIG_SEED: Partial<GlobalConfig> = {
  crud: {
    defaults: {
      openMode: 'modal',
    },
  },
  dynamicFields: {
    asyncSelect: { loadOn: 'open' },
    cascade: { enable: true, loadOnChange: 'respectLoadOn', debounceMs: 250 },
  },
  table: {
    appearance: {
      density: 'compact',
      spacing: {
        cellPadding: '6px 12px',
        headerPadding: '8px 12px',
      },
      typography: {
        fontSize: '13px',
        headerFontSize: '13px',
      },
    },
    filteringUi: {
      advancedOpenMode: 'drawer',
      overlayVariant: 'card',
      overlayBackdrop: true,
    },
  },
};
