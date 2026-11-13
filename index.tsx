/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';

function mount() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element #root not found during mount');
    return;
  }
  hydrateRoot(rootElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
