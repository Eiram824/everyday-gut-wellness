module.exports = { content: ['./index.html', './index.tsx', './App.tsx', './components/**/*.{ts,tsx}', './constants.ts'], ...({
        theme: {
          extend: {
            fontFamily: {
              serif: ['Playfair Display', 'Georgia', 'serif'],
              sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
            },
            colors: {
              ivory: {
                DEFAULT: '#FBF9F5',
                dark: '#F3EFE6',
                surface: '#FFFFFF',
              },
              forest: {
                DEFAULT: '#14382B',
                dark: '#0E281E',
                light: '#245240',
                soft: '#EAF1ED',
              },
              terracotta: {
                DEFAULT: '#B85D36',
                dark: '#9A4622',
                light: '#EAD3C7',
                soft: '#F8EFEA',
              },
              earth: {
                DEFAULT: '#2C2A26',
                muted: '#635F57',
                subtle: '#8C877D',
                border: '#E5DFD5',
              }
            }
          }
        }
      }) };
