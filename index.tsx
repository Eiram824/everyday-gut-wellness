/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './index.css';

function mount() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element #root not found during mount');
    return;
  }
  const app = (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // The production homepage is prerendered at build time (scripts/prerender-home.tsx)
  // so search engines see the full page; React then attaches to that markup.
  if (rootElement.hasAttribute('data-prerendered')) {
    hydrateRoot(rootElement, app);
  } else {
    createRoot(rootElement).render(app);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}