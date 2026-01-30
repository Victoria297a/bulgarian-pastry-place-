// Element SDK - Mock implementation for customization support
(function() {
  'use strict';

  const elementSdk = {
    config: {},
    handlers: {},
    
    init: function(options) {
      console.log('Element SDK initialized');
      
      this.handlers.onConfigChange = options.onConfigChange;
      this.handlers.mapToCapabilities = options.mapToCapabilities;
      this.handlers.mapToEditPanelValues = options.mapToEditPanelValues;
      this.config = options.defaultConfig || {};
      
      // Trigger initial config
      if (this.handlers.onConfigChange) {
        this.handlers.onConfigChange(this.config);
      }
      
      return Promise.resolve({ success: true });
    },
    
    setConfig: function(newConfig) {
      console.log('Element SDK: Config updated', newConfig);
      this.config = { ...this.config, ...newConfig };
      
      if (this.handlers.onConfigChange) {
        this.handlers.onConfigChange(this.config);
      }
    },
    
    getConfig: function() {
      return this.config;
    }
  };
  
  // Expose to window
  window.elementSdk = elementSdk;
  
  console.log('Element SDK loaded successfully');
})();
