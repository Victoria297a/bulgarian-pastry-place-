// Data SDK - Mock implementation for data persistence
(function() {
  'use strict';

  const STORAGE_KEY = 'pchela_user_profiles';
  
  const dataSdk = {
    data: [],
    handler: null,
    initialized: false,
    
    init: async function(dataHandler) {
      console.log('Data SDK initializing...');
      
      this.handler = dataHandler;
      
      // Load data from localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.data = JSON.parse(stored);
          console.log('Data SDK: Loaded', this.data.length, 'profiles from storage');
        }
      } catch (e) {
        console.error('Data SDK: Failed to load data', e);
        this.data = [];
      }
      
      this.initialized = true;
      
      // Notify handler of initial data
      if (this.handler && this.handler.onDataChanged) {
        this.handler.onDataChanged(this.data);
      }
      
      return { isOk: true };
    },
    
    create: async function(newItem) {
      console.log('Data SDK: Creating new item', newItem);
      
      if (!this.initialized) {
        console.error('Data SDK: Not initialized');
        return { isOk: false, error: 'SDK not initialized' };
      }
      
      // Generate ID
      const id = 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const itemWithId = { id, ...newItem };
      
      // Add to data
      this.data.push(itemWithId);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error('Data SDK: Failed to save data', e);
        return { isOk: false, error: 'Failed to save data' };
      }
      
      // Notify handler
      if (this.handler && this.handler.onDataChanged) {
        this.handler.onDataChanged(this.data);
      }
      
      return { isOk: true, data: itemWithId };
    },
    
    update: async function(updatedItem) {
      console.log('Data SDK: Updating item', updatedItem);
      
      if (!this.initialized) {
        console.error('Data SDK: Not initialized');
        return { isOk: false, error: 'SDK not initialized' };
      }
      
      // Find and update item
      const index = this.data.findIndex(item => item.id === updatedItem.id);
      
      if (index === -1) {
        console.error('Data SDK: Item not found', updatedItem.id);
        return { isOk: false, error: 'Item not found' };
      }
      
      this.data[index] = updatedItem;
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error('Data SDK: Failed to save data', e);
        return { isOk: false, error: 'Failed to save data' };
      }
      
      // Notify handler
      if (this.handler && this.handler.onDataChanged) {
        this.handler.onDataChanged(this.data);
      }
      
      return { isOk: true, data: updatedItem };
    },
    
    delete: async function(id) {
      console.log('Data SDK: Deleting item', id);
      
      if (!this.initialized) {
        console.error('Data SDK: Not initialized');
        return { isOk: false, error: 'SDK not initialized' };
      }
      
      // Remove item
      const index = this.data.findIndex(item => item.id === id);
      
      if (index === -1) {
        console.error('Data SDK: Item not found', id);
        return { isOk: false, error: 'Item not found' };
      }
      
      this.data.splice(index, 1);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error('Data SDK: Failed to save data', e);
        return { isOk: false, error: 'Failed to save data' };
      }
      
      // Notify handler
      if (this.handler && this.handler.onDataChanged) {
        this.handler.onDataChanged(this.data);
      }
      
      return { isOk: true };
    },
    
    getAll: function() {
      return this.data;
    },
    
    clear: function() {
      this.data = [];
      localStorage.removeItem(STORAGE_KEY);
      
      if (this.handler && this.handler.onDataChanged) {
        this.handler.onDataChanged(this.data);
      }
    }
  };
  
  // Expose to window
  window.dataSdk = dataSdk;
  
  console.log('Data SDK loaded successfully');
})();
