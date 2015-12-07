/* global Backbone */
'use strict'

const FeatureView = require('./view')

module.exports = Backbone.Marionette.CollectionView.extend({
  collection: new Backbone.Collection(),
  childView: FeatureView
})
