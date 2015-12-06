/* global Backbone */
'use strict'

module.exports = Backbone.Model.extend({
  urlRoot: '/accounts',
  defaults: {
    name: ''
  }
})
