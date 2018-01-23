'use strict';

module.exports = function (options) {
  
  // Create a string that can be parsed by `run`.
  try {
    
    if (options.path) {
      return options.path;
    } else {
      return '7za';
    }
    
  } catch (e) {
    throw new Error('Path to the 7-Zip bin not found');
  }
  
};