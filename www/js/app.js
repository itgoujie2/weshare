// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('weshare', ['ionic', 'weshare.auth', 'weshare.config', 'weshare.main', 'weshare.s3uploader', 'ngCordova'])

.run(function($ionicPlatform, $state, $window, $rootScope, SERVER_URL) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    $cordovaClipboard.copy().then(function(result){
      console.log('copy result: ' + result);
    }, function(err){

    });

    $cordovaImagePicker.getPictures(function(results){

    }, function(err){

    });
  });

  var user = JSON.parse($window.localStorage.getItem('user'));

  $rootScope.user = user;
  $rootScope.server = {url: SERVER_URL || location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')};
  $rootScope.weshares = [];

  //re-route to welcome page if not authenticaed
  $rootScope.$on('$stateChangeStart', function(event, toState){
    if (toState.name !== 'login' && toState.name !== 'signup' && toState.name !== 'logout' && toState.name !== 'welcome' && !$window.localStorage.getItem('token')){
      console.log('toState: ' + JSON.stringify(toState));
      $state.go('welcome');
      event.preventDefault();
    }
  })
  $state.go('main');
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider){

  $stateProvider

    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tab.html'
      //controller: 'TabCtrl'
    })

    .state('welcome', {
      url: "/welcome",
      templateUrl: 'templates/welcome.html'
    })

   //$urlRouterProvider.otherwise('/main');

  $httpProvider.interceptors.push('AuthInterceptor');
})

    // XMLHTTPRequest Interceptor.
    // Outbound: Adds access token to HTTP requests before they are sent to the server.
    // Inbound: Handles 401 (Not Authorized) errors by loading the Login page
    .factory('AuthInterceptor', function ($rootScope, $window, $q, $location) {

        return {
            request: function (config) {
                $rootScope.loading = true;
                config.headers = config.headers || {};
                if ($window.localStorage.getItem('token')) {
                    config.headers.authorization = $window.localStorage.getItem('token');
                }
                return config || $q.when(config);
            },
            requestError: function (request) {
                console.log('request error');
                $rootScope.loading = false;
                return $q.reject(request);
            },
            response: function (response) {
                $rootScope.loading = false;
                return response || $q.when(response);
            },
            responseError: function (response) {
                console.log(JSON.stringify(response));
                $rootScope.loading = false;
                if (response && response.status === 401) {
                    // TODO: broadcast event instead.
                    $location.path('/welcome');
                } else if (response && response.status !== 404) {
                    console.log(response);
                    // alert(response.data);
                }
                return $q.reject(response);
            }
        };
    })

  .factory('DataLoader', function($rootScope, $http){

    var o = {};

    o.weshares = {};

    $http.get($rootScope.server.url + '/weshares').success(function(results){
      o.weshares = results;
    });

    return o;
  })
