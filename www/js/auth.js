angular.module('weshare.auth', [])
	
	/*
	*	Routes
	*/
	.config(function($stateProvider, $urlRouterProvider){

		$stateProvider
			.state('login', {
				url: '/login',
				templateUrl: 'templates/login.html',
				controller: 'LoginCtrl'
			})

			.state('signup', {
				url: '/signup',
				templateUrl: 'templates/signup.html',
				controller: 'SignupCtrl'
			})

			.state('logout', {
				url: '/logout',
				templateUrl: 'templates/logout.html',
				controller: 'LogoutCtrl'
			})
	})


	/*
	*	Controllers
	*/
	.controller('SignupCtrl', function($scope, $ionicPopup, $state, Auth){

		$scope.user = {};

		$scope.signup = function(){
			if ($scope.user.password != $scope.user.password2){
				$ionicPopup.alert({title: 'Oops', content: 'Passwords do not match'});
				return;
			}
			Auth.signup($scope.user)
				.success(function(data){
					$scope.user = {};
					$state.go('app.category');
				})
				.error(function(err){
					$ionicPopup.alert({title: 'Oops', content: err});
					$state.go('welcome');
				});
		}
	})

	.controller('LoginCtrl', function($scope, $window, $ionicPopup, $state, Auth){

		$window.localStorage.removeItem('user');
		$window.localStorage.removeItem('token');

		$scope.user = {};

		$scope.login = function(){

			Auth.login($scope.user)
				.success(function(data){
					$scope.user = {};
					$state.go('app.category');
				})
				.error(function(err){
					$ionicPopup.alert({title: 'Oops', content: 'Login failed'});
					$state.go('welcome');
				})
		}
	})

	.controller('LogoutCtrl', function($scope, $rootScope, $window, $ionicPopup, $state){
		$scope.logout = function(){
			$rootScope.user = null;
			$window.localStorage.removeItem('user');
			$window.localStorage.removeItem('token');
			$ionicPopup.alert({title: 'Logged out', content: 'Logged out'});	
			$state.go('welcome');
		}
	})

	/*
	*	Services
	*/
	.factory('Auth', function($http, $rootScope, $window){
		var o = {};

		o.signup = function(user){

			return $http.post($rootScope.server.url + '/signup', user)
				.success(function(data){
					$rootScope.user = data.user;
					$window.localStorage.user = JSON.stringify(data.user);
					$window.localStorage.token = data.token;
				});

		}

		o.login = function(user){

			return $http.post($rootScope.server.url + '/login', user)
				.success(function(data){
					$rootScope.user = data.user;
					$window.localStorage.user = JSON.stringify(data.user);
					$window.localStorage.token = data.token;
				})
		}

		return o;
	})
