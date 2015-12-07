/* global Backbone Marionette $ */
'use strict'

require('./style.scss')

const featureChannel = Backbone.Radio.channel('feature')

module.exports = Marionette.ItemView.extend({
  template: '#feature-template',
  events: {
    'change .feature-checkbox': 'setChange'
  },
  setChange (event) {
    const id = $(event.target).closest('.feature').data('id')
    featureChannel.trigger('change', id)
  }
})
