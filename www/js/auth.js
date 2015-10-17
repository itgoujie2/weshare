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

			.state('legal', {
				url: '/legal',
				templateUrl: 'templates/legal.html'
			})
	})


	/*
	*	Controllers
	*/
	.controller('SignupCtrl', function($scope, $ionicPopup, $state, Auth){

		$scope.user = {};

		$scope.signup = function(){

			Auth.signup($scope.user)
				.success(function(data){
					$scope.user = {};
					console.log('user registered: ' + data.user.email);
					$state.go('app.category');
				})
				.error(function(err){
					var customErr;

					if (err.indexOf('email duplicate error')>-1){
						customErr = '邮箱已被注册';
					}
					else if (err.indexOf('nickname duplicate error')>-1){
						customErr = '昵称已被使用';
					}
					else if (err.indexOf('invalid email error')>-1){
						customErr = '邮箱格式错误';
					}
					else if (err.indexOf('password length error')>-1){
						customErr = '密码需要大于6位'
					}

					$ionicPopup.show({
						title: '注册失败', 
						content: customErr,
						buttons: [{
							text: '<b>确定</b>',
							type: 'button-dark'
						}]
					});

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
					console.log('user logged in: ' + data.user.email);
					$state.go('app.category');
				})
				.error(function(err){
					$ionicPopup.alert({title: '登录失败', content: '请重新登录'});
					$state.go('welcome');
				})
		}
	})

	.controller('LogoutCtrl', function($scope, $rootScope, $window, $ionicPopup, $state){
		$scope.logout = function(){
			console.log('user logged out: ' + $rootScope.user.email);
			$rootScope.user = null;
			$window.localStorage.removeItem('user');
			$window.localStorage.removeItem('token');
			$ionicPopup.alert({title: 'Logged out', content: 'Logged out'});	
			$state.go('welcome');
		}
	})

	.controller('LegalCtrl', function(){

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
