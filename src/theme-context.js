import React from 'react';

export const themes = {
  light: {
    name: 'light',
    foreground: '#000000',
    background: '#eeeeee',
  },
  dark: {
    name: 'dark',
    foreground: '#ffffff',
    background: '#222222',
  },
};

export const ThemeContext = React.createContext(
  themes.light // default value
);