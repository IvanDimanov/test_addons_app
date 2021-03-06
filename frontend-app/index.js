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
  const featureChannel = Backbone.Radio.channel('feature')
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

    /*
      We need to re-render the Feature page
      if we've just had a notification that a new feature
      is available for the currently loaded Account
    */
    featureChannel.on('new', function onNewFeature (feature) {
      const currentRoute = navigationChannel.request('current-route')
      if (currentRoute.link === 'features') {
        renderAccountFeatures()
      }
    })

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

  /*
    The code below will create a regular pulls of features.
    It till emit in the 'featureChannel' in case of newly added features
  */
  ;(function () {
    let previousFeatureTitles = []

    function checkForNewFeatures () {
      $.get('/features')
        .done(function done (features) {
          const currentTitles = features
            .map(feature => feature.title)
            .sort()

          /* Set initial titles */
          if (!previousFeatureTitles.length) {
            previousFeatureTitles = currentTitles
          }

          /* Detect an update since the last time we checked */
          if (previousFeatureTitles.join(', ') !== currentTitles.join(', ')) {
            currentTitles.forEach(function findNew (title) {
              if (!~previousFeatureTitles.indexOf(title)) {
                featureChannel.trigger('new', {title})
              }
            })

            previousFeatureTitles = currentTitles
          }
        })
    }

    /* Keep constant track of all newly added features */
    checkForNewFeatures()
    setInterval(checkForNewFeatures, 10000)
  })()

  /* Present a UI alert notification to the User for every newly added feature */
  featureChannel.on('new', function onNewFeature ({title}) {
    const alertHtml = `
      <div class="alert alert-success">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        New feaure <strong>${title}</strong> have just been available for you at you <b><a href="#features">Addons</a></b> section.
      </div>
    `
    const $alert = $(alertHtml).alert()

    /* Present the note to the User */
    $(document.body).append($alert)

    /* Do not let the notification hang infinitely */
    setTimeout(function closeAlert () {
      $alert.fadeOut(500, () => $alert.alert('close'))
    }, 5000)
  })
})()
