angular.module('weshare.feedback', [])

	.config(function($stateProvider, $urlRouterProvider){

		$stateProvider
			.state('app.feedback', {
				url: '/feedback',
				views: {
					'menuContent': {
						templateUrl: 'templates/feedback.html',
						controller: 'feedbackCtrl'
					}
				}
			})
	})

	.controller('feedbackCtrl', function($scope, $rootScope, $state, $ionicPopup, Feedback){
		console.log('called feedbackCtrl');

		$scope.feedback = {
			'rating': '10'
		};

		$scope.submitFeedback = function(){
			
			$scope.feedback.creator = $rootScope.user.id;
			Feedback.submitFeedback($scope.feedback)
				.success(function(data){
					// $state.go('app.category');
					$ionicPopup.alert({title: '保存成功', content:'谢谢您的建议'});
				})
				.error(function(err){
					console.log('feedback error: ' + err);
				})
		}

		$scope.deleteFeedback = function(feedbackId, index){
			Feedback.deleteFeedback(feedbackId).then(function(data){
				$scope.feedbacks.splice(index, 1);
			})
		}
	})

	.factory('Feedback', function($http, $rootScope){
		var o = {};

		o.submitFeedback = function(feedback){
			return $http.post($rootScope.server.url + '/feedback/create', feedback)
					.success(function(data){

					})
		}

		o.getUserFeedback = function(){
			return $http.get($rootScope.server.url + '/userFeedback?userId=' + $rootScope.user.id)
					.success(function(data){

					})
		}

		o.deleteFeedback = function(feedbackId){
			return $http.delete($rootScope.server.url + '/feedback/delete/' + feedbackId)
					.success(function(data){

					})
		}

		return o;
	})