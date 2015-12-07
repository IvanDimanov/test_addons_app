/* global Backbone $ */
'use strict'

/* Used for debugging only */
function log () { // eslint-disable-line no-unused-vars
  return console.log.apply(console, arguments)
}

const FeatureView = require('./view')

const featureChannel = Backbone.Radio.channel('feature')

module.exports = Backbone.Marionette.CollectionView.extend({
  collection: new Backbone.Collection(),
  childView: FeatureView,
  initialize () {
    /* Update the internal model and Backend data in case of feature "set" change */
    featureChannel.on('change', id => {
      const model = this.collection.models.find(function (model) {
        return model.id === id
      })

      const isSet = !model.get('isSet')
      model.set({isSet})

      $.ajax({
        url: `/accounts/${window.accountId}/features`,
        method: 'PUT',
        data: model.toJSON(),
        dataType: 'json'
      })
      .done(function (dbModel) {
        /* Keep the internal object in sync with any (possible) additional updates from the Backend */
        model.set(dbModel)

        /* Let the UI in sync with the current "set" property */
        $(`.feature[data-id="${id}"]`)
          .removeClass('panel-default')
          .removeClass('panel-success')
          .addClass(isSet ? 'panel-success' : 'panel-default')
      })
    })
  }
})
