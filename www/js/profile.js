angular.module('weshare.profile', [])

	.config(function($stateProvider){

		$stateProvider
			.state('app.profile', {
				url: '/profile',
				views: {
					'menuContent': {
						templateUrl: 'templates/profile.html',
						controller: 'ProfileCtrl'	
					}
				}
			})
	})

	.controller('ProfileCtrl', function($scope, $rootScope, Profile){

	})

	.factory('Profile', function($http){

	})

