'use strict';


const pastes = require('./pastes');


module.exports = function() {
  const app = this;


  app.configure(pastes);
};
