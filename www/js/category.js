angular.module('weshare.category', [])
	
	/*
	*	Routes
	*/
	.config(function($stateProvider, $urlRouterProvider){

		$stateProvider
			.state('app.category', {
				url: '/category',
				views:{
					'menuContent': {
						templateUrl: 'templates/category.html',
						controller: 'CategoryCtrl'
					}
				}
				
			})
	})

	/*
	*	Controllers
	*/
	.controller('CategoryCtrl', function($scope, $ionicLoading, Category){

		console.log('called CategoryCtrl');

		$ionicLoading.show({
			template: '请稍等...'
		});

		Category.getCategories().then(function(){
			$scope.categories = Category.categories;
			console.log('categories in CategoryCtrl: ' + JSON.stringify($scope.categories));
			$ionicLoading.hide();
		});

	})

	/*
	*	Services
	*/
	.factory('Category', function($http, $rootScope){

		var o = {
			categories: []
		}

		o.getCategories = function(){
			return $http.get($rootScope.server.url + '/categories').success(function(results){
				o.categories = results;
			});
		}

		return o;
	})