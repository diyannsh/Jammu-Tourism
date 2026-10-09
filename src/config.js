import { Pane } from 'tweakpane';

// 1. Global Configuration Store
export const config = {
  // Toggle debug mode by adding #debug to your URL
  debug: window.location.hash.includes('debug'),
  theme: {
    background: '#050505',
    primary: '#ff4400'
  },
  scroll: {
    multiplier: 1.0,
    lerp: 0.1
  }
};

export let pane = null;

// 2. Tweakpane Initialization
export function initConfig() {
  if (!config.debug) return;

  // Initialize the GUI only in debug mode
  pane = new Pane({ title: 'Inspector' });

  const themeFolder = pane.addFolder({ title: 'Theme' });
  themeFolder.addBinding(config.theme, 'background');
  themeFolder.addBinding(config.theme, 'primary');

  const scrollFolder = pane.addFolder({ title: 'Scroll Controls' });
  scrollFolder.addBinding(config.scroll, 'multiplier', { min: 0.1, max: 5.0 });
  scrollFolder.addBinding(config.scroll, 'lerp', { min: 0.01, max: 0.5 });
}