'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('pastes service', function() {
  it('registered the pastes service', () => {
    assert.ok(app.service('pastes'));
  });
});
