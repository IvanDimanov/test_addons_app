/* global Backbone */
'use strict'

module.exports = Backbone.Model.extend({
  urlRoot: '/features',
  defaults: {
    id: '',
    title: '',
    description: '',
    isSet: false
  }
})
