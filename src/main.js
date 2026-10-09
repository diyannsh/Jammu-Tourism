import './style.css';
import { initConfig, config } from './config.js';
import { raf } from './core/RAF.js';
import { cursor } from './core/Cursor.js';
import { interaction } from './core/Interaction.js';
import WebGL from './webgl/WebGL.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    initConfig();
    
    // Start global timeline
    raf.start();

    // WebGL pipeline
    this.webgl = new WebGL();
  }
}

new App();