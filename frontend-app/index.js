/* global Backbone $ _ alert */
'use strict'

/* TODO: Use a server loading approach */
window.accountId = '562a1a83cb11b8bc0f07c5b4'

/* Used for debugging only */
function log () { // eslint-disable-line no-unused-vars
  return console.log.apply(console, arguments)
}

require('./components/router')

const Layout = require('./components/layout')

const DemoPageView = require('./components/demo-page/view')
const DemoPageModel = require('./components/demo-page/model')

const AccountView = require('./components/account/view')
const AccountModel = require('./components/account/model')

const FeaturesView = require('./components/features/collection-view.js')
const FeatureModel = require('./components/features/model.js')

;(function main () {
  const navigationChannel = Backbone.Radio.channel('navigation')
  const layout = new Layout()

  /* Present the currently logged User-Account */
  const accountModel = new AccountModel({id: window.accountId})
  accountModel.fetch()
    .then(function onAccountInSync () {
      const accountView = new AccountView({model: accountModel})
      layout.account.show(accountView)
    })

  /* This function is responsible for the page rendering as reaction of a URL change */
  const onPageView = (function onPageViewWrap () {
    /* Set some easy-to-spot style for the link that loaded the current page */
    function setActiveLink (link) {
      $('li.active').removeClass('active')
      $(`a[href="#${link}"]`)
        .closest('li')
        .addClass('active')
    }

    /* Print a demo content in our 'layout' in respect of the loaded page */
    function renderDemoPage (route) {
      const model = new DemoPageModel({
        title: `Loaded page: ${route.link}`,
        content: `Time at loading the page: ${new Date(route.time).toString()}`
      })

      const view = new DemoPageView({model})

      layout.content.show(view)
    }

    /* Collect latest Account features and Present them in the Page main content region */
    function renderAccountFeatures () {
      /* Always work with latest features info */
      accountModel.fetch()

        /* Use the account features keys to load the rest of the feature info such as Title, description, etc. */
        .then(function refillFeaturesCollection () {
          const unfetchModel = []

          /*
            Load all synced models in 'unfetchModel' so we can lated on
            listen for a global "done" or a single "fail" event
          */
          _.each(accountModel.get('features'), function insertSingleFeature (isSet, id) {
            const model = new FeatureModel({id})

            unfetchModel.push(model.fetch()
              .then(function assignSetValue () {
                model.set({isSet})
                return model
              })
            )
          })

          /* Repeat the same process as above but using the "premium" features only */
          _.each(accountModel.get('premiumFeatures'), function insertSingleFeature (isSet, id) {
            const model = new FeatureModel({id})

            unfetchModel.push(model.fetch()
              .then(function assignSetValue () {
                model.set({isSet})
                return model
              })
            )
          })

          Promise.all(unfetchModel)
            .catch(error => alert(`Unable to get full information about your Addons: ${error.stack}`))
            .then(function allModelsFetched (models) {
              /* Recreate the entire view using the latest one fetched */
              const featuresView = new FeaturesView()
              _.each(models, model => featuresView.collection.add(model))

              /* Render the collected features in the page */
              layout.content.show(featuresView)
            })
        })
    }

    return function onPageView (route) {
      setActiveLink(route.link)
      if (route.link === 'features') {
        renderAccountFeatures()
      } else {
        renderDemoPage(route)
      }
    }
  })()

  /*
    Be sure that there will be a rendered page on every update
    even if the Use clicked on preset link
  */
  navigationChannel.on('change', onPageView)
  onPageView(navigationChannel.request('current-route'))
})()
