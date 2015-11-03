// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('weshare', ['ionic', 'weshare.auth', 'weshare.config', 'weshare.main', 'weshare.s3uploader', 'weshare.category', 'weshare.feedback', 'ionic.rating', 'weshare.directives', 'ngCordova'])

.run(function($ionicPlatform, $state, $window, $ionicLoading, $rootScope, $cordovaStatusbar, $cordovaSplashscreen, SERVER_URL) {
  $ionicPlatform.ready(function() {

    /*
      splash screen
    */
    $cordovaSplashscreen.hide();
    // setTimeout(function() {
    //     navigator.splashscreen.hide();
    // }, 3000);

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    
    /*
      status bar
    */
    $cordovaStatusbar.overlaysWebView(true);
    $cordovaStatusbar.style(0);

    /*
      clipboard
    */
    $cordovaClipboard.copy().then(function(result){
      console.log('copy result: ' + result);
    }, function(err){

    });

    /*
      image picker
    */
    $cordovaImagePicker.getPictures(function(results){

    }, function(err){

    });


  });

  var user = JSON.parse($window.localStorage.getItem('user'));

  $rootScope.user = user;
  $rootScope.server = {url: SERVER_URL || location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')};

  

  // $rootScope.$on('loading:show', function() {
  //   $ionicLoading.show({template: '请稍等'})
  // })

  // $rootScope.$on('loading:hide', function() {
  //   $ionicLoading.hide()
  // })

  //re-route to welcome page if not authenticaed
  $rootScope.$on('$stateChangeStart', function(event, toState){
    if (toState.name !== 'login' && toState.name !== 'signup' && toState.name !== 'logout' && toState.name !== 'welcome' && toState.name != 'legal' && !$window.localStorage.getItem('token')){
      console.log('toState: ' + JSON.stringify(toState));
      $state.go('welcome');
      event.preventDefault();
    }
  })
  $state.go('app.category');
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $cordovaAppRateProvider){

  $stateProvider

    .state('welcome', {
      url: "/welcome",
      templateUrl: 'templates/welcome.html'
    })



    //$urlRouterProvider.otherwise('/main');

    $httpProvider.interceptors.push('AuthInterceptor');

    // /*
    //   app rating
    // */
    // var prefs = {
    //  language: 'en',
    //  appName: '微分',
    //  iosURL: 'com.ionicframework.weshare583914'
    // };
    // $cordovaAppRateProvider.setPreferences(prefs);
})

    // XMLHTTPRequest Interceptor.
    // Outbound: Adds access token to HTTP requests before they are sent to the server.
    // Inbound: Handles 401 (Not Authorized) errors by loading the Login page
    .factory('AuthInterceptor', function ($rootScope, $window, $q, $location) {

        return {
            request: function (config) {
                //$rootScope.loading = true;
                $rootScope.$broadcast('loading:show');
                config.headers = config.headers || {};
                if ($window.localStorage.getItem('token')) {
                    config.headers.authorization = $window.localStorage.getItem('token');
                }
                return config || $q.when(config);
            },
            requestError: function (request) {
                console.log('request error');
                //$rootScope.loading = false;
                $rootScope.$broadcast('loading:hide');
                return $q.reject(request);
            },
            response: function (response) {
                //$rootScope.loading = false;
                $rootScope.$broadcast('loading:hide');
                return response || $q.when(response);
            },
            responseError: function (response) {
                console.log('response error: ' + JSON.stringify(response));
                //$rootScope.loading = false;
                $rootScope.$broadcast('loading:hide');
                if (response ) {
                    // TODO: broadcast event instead.
                    $window.localStorage.removeItem('token');
                    $window.localStorage.removeItem('user');
                    $location.href = $location.origin;
                    $location.path('/welcome');
                } else if (response && response.status !== 404) {
                    console.log(response);
                    // alert(response.data);
                }
                return $q.reject(response);
            }
        };
    })

  

