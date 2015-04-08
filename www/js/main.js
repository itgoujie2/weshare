angular.module('weshare.main', [])

	/*
	*	Routes
	*/
	.config(function($stateProvider){
		$stateProvider
			.state('main', {
				url: '/main',
				templateUrl: 'templates/main.html',
				controller: 'MainCtrl'
			})
			.state('create', {
				url: '/create',
				templateUrl: 'templates/create.html',
				controller: 'CreateCtrl'
			})
			.state('filter', {
				url: '/filter',
				templateUrl: 'templates/filter.html',
				controller: 'FilterCtrl'
			})
			.state('detail', {
				url: '/weshares/:weshareId',
				templateUrl: 'templates/detail.html',
				controller: 'DetailCtrl',
				resolve: {
					liked: function($http, $stateParams, $rootScope){
						return $http.get($rootScope.server.url + '/likes' + '?email=' + $rootScope.user.email + '&weshareId=' + $stateParams.weshareId);
					}
				}
			})
	})

	/*
	*	Controllers
	*/
	.controller('MainCtrl', function($scope, $rootScope, $state, $ionicPopup, Main){

		/*
		*	Main page
		*/
		$scope.weshares = {};

		$scope.create = function(){
			$state.go('create');
		}

		$scope.filter = function(){
			$state.go('filter');
		}

		
		// Main.loadMore(new Date).success(function(weshares){
		// 	$scope.weshares = weshares;
		// 	$scope.last_displayed_stamp = new Date($scope.weshares[$scope.weshares.length-1].createdOn);
		// 	console.log('last_displayed_stamp in init: ' + $scope.last_displayed_stamp);
		// })

		$scope.weshares = [];
		$scope.refresher = true;
		$scope.loadMore = function(){

			var last_displayed_stamp = $scope.last_displayed_stamp ? $scope.last_displayed_stamp : new Date;

			Main.loadMore(last_displayed_stamp).success(function(weshares){
				console.log('typeof: ' + typeof $scope.weshares);
				if (weshares.length > 0){
					$scope.weshares = $scope.weshares.concat(weshares);
					console.log('weshares after concat: ' + $scope.weshares);
					$scope.$broadcast('scroll.infiniteScrollComplete');	
					$scope.refresher = true;
					$scope.last_displayed_stamp = new Date($scope.weshares[$scope.weshares.length-1].createdOn);
				}
				else{
					console.log('making refresher false');
					$scope.refresher = false;
				}
				console.log('weshares in loadMore: ' + weshares);
				console.log('called loadMore refresher: ' + $scope.refresher);
			});
		}
	})

	.controller('DetailCtrl', function($scope, $rootScope, $state, $stateParams, $cordovaClipboard, liked, Main){


		$scope.weshare = {};
		$scope.liked = liked.data;

		console.log('liked: ' + JSON.stringify($scope.liked));

		Main.get($stateParams.weshareId).success(function(weshare){
			$scope.weshare = weshare;
		});

		$scope.$watch('liked', function(newVal, oldVal){
			Main.updateLiked({
				email: $rootScope.user.email,
				weshareId: $stateParams.weshareId,
				liked: $scope.liked
			});
		})
		
		$scope.flipLiked = function(){
			$scope.liked = !$scope.liked;
		}

		$scope.copy = function(){
			$cordovaClipboard
				.copy($scope.weshare.wechatId)
				.then(function(){
					console.log('copy success');
				}, function(){
					console.log('copy fail');
				})
		}
		

	})

	.controller('CreateCtrl', function($scope, $rootScope, $state, $ionicPopup, $cordovaImagePicker, $ionicLoading, Main, S3Uploader){

		/*
		*	Create page
		*/
		$scope.weshare = {};
		$scope.save = function(){


			Main.save($scope.weshare)
				.success(function(data){
					$scope.weshare = {};
				})
				.error(function(err){
					$ionicPopup.alert({title: 'Oops', content: err});
				});

			$state.go('main');
		}

		$scope.addPicture = function(){
			var options = {
			   maximumImagesCount: 8,
			   width: 800,
			   height: 800,
			   quality: 80
			};

			$scope.weshare.images = [];
			$cordovaImagePicker.getPictures(options)
				.then(function (results) {
			      // for (var i = 0; i < results.length; i++) {
			      //   console.log('Image URI: ' + results[i]);
			      // }
			      $ionicLoading.show({
			      	template: '上传中...'
			      });
			      setTimeout(function(){
			      	//fileName = new Date().getTime() + ".jpg";
			      	var tracker = 0;
			      	while (results.length > 0){
			      		var tempImage = results.pop();
			      		fileName = $rootScope.user.id + '_' + new Date().getTime() + '_' + tracker + ".jpg";
			      		tracker++;
				      	S3Uploader.upload(tempImage, fileName)
				      		.then(function(){
				      			$scope.weshare.images.push('https://s3-us-west-2.amazonaws.com/weshare-image/' + fileName);
				      		});		
			      	}
			      	$ionicLoading.hide();
			      }, 30000);
			    }, function(error) {
			      // error getting photos
			    });
		}
	})

	.controller('FilterCtrl', function($scope, Main){

		/*
		*	Filter page
		*/
	})

	/*
	*	Services
	*/
	.factory('Main', function($http, $rootScope){

		var o = {}

		/*
		*	Create Page
		*/
		o.save = function(weshare){
			return $http.post($rootScope.server.url + '/weshares/create', weshare);	
		}

		/*
		*	Main Page
		*/

		o.all = function(){
			return $http.get($rootScope.server.url + '/weshares');
		}

		o.loadMore = function(last_displayed_stamp){
			return $http.get($rootScope.server.url + '/weshares/loadMore/' + last_displayed_stamp);
		}

		o.get = function(weshareId){
			return $http.get($rootScope.server.url + '/weshares/' + weshareId);
		}

		o.updateLiked = function(params){
			return $http.put($rootScope.server.url + '/likes/update', params)
		}
		
		return o;
	})

	.filter('showParts', function(){
		return function(text){
			var result = '';
			if (text) result = text.substring(0, 140) + '...';
			return result;
		}
	})