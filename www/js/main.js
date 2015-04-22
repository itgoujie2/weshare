angular.module('weshare.main', [])

	/*
	*	Routes
	*/
	.config(function($stateProvider){
		$stateProvider
			// .state('main', {
			// 	url: '/main/:categoryId',
			// 	templateUrl: 'templates/main.html',
			// 	controller: 'MainCtrl'
			// })

			.state('app', {
		      url: '/app',
		      abstract: true,
		      templateUrl: 'templates/side-menu.html',
		      controller: 'MainCtrl'
		    })
			.state('app.main', {
				url: '/main/:categoryId',
				views:{
					'menuContent':{
						templateUrl: 'templates/main.html',
						controller: 'MainCtrl'
					}
				}
			})
			.state('app.create', {
				url: '/create/:parentCategoryId',
				views:{
					'menuContent':{
						templateUrl: 'templates/create.html',
						controller: 'CreateCtrl'
					}
				}
				
			})
			.state('app.filter', {
				url: '/filter',
				views:{
					'menuContent':{
						templateUrl: 'templates/filter.html',
						controller: 'FilterCtrl'		
					}
				}
			})
			.state('app.detail', {
				url: '/weshares/:weshareId',
				views:{
					'menuContent':{
						templateUrl: 'templates/detail.html',
						controller: 'DetailCtrl',
						resolve: {
							liked: function($http, $stateParams, $rootScope){
								return $http.get($rootScope.server.url + '/likes' + '?email=' + $rootScope.user.email + '&weshareId=' + $stateParams.weshareId);
							}
						}
					}
				},
				onExit: function(Main, $rootScope, $stateParams){
								console.log('calling onExit');
								Main.updateLiked({
									email: $rootScope.user.email,
									weshareId: $stateParams.weshareId,
									liked: Main.liked
								});
				}
			})
	})

	/*
	*	Controllers
	*/
	.controller('MainCtrl', function($scope, $rootScope, $state, $stateParams, $window, $location, $ionicPopup, $cordovaImagePicker, $ionicLoading, S3Uploader, Main){

		console.log('called MainCtrl');

		/*
		*	Main page
		*/
		$scope.categoryId = $stateParams.categoryId;
		// if (!!$stateParams.categoryId){
		// 	console.log('called first block');
		// 	$scope.categoryId = $stateParams.categoryId;
		// 	$rootScope.categoryId = $stateParams.categoryId;
		// }
		// else if (!!$rootScope.categoryId){
		// 	console.log('called second block');
		// 	$scope.categoryId = $rootScope.categoryId;
		// }
		// else{
		// 	console.log('called third block');
		// 	//there is no category, kick out the user
		// 	$window.localStorage.removeItem('token');
  //           $window.localStorage.removeItem('user');
  //           $location.href = $location.origin;
  //           $location.path('/welcome');
		// }
		// Main.all($scope.categoryId);
		$scope.weshares = Main.weshares;
		$scope.user = $rootScope.user;

		console.log('categoryId: ' + $scope.categoryId);

		$scope.create = function(){
			$state.go('app.create', {"parentCategoryId": $scope.categoryId});
		}

		$scope.filter = function(){
			$state.go('app.filter');
		}
		
		// Main.loadMore(new Date).success(function(weshares){
		// 	$scope.weshares = weshares;
		// 	$scope.last_displayed_stamp = new Date($scope.weshares[$scope.weshares.length-1].createdOn);
		// 	console.log('last_displayed_stamp in init: ' + $scope.last_displayed_stamp);
		// })

		$scope.refresher = true;
		$scope.loadMore = function(){

			var last_displayed_stamp = $scope.last_displayed_stamp ? $scope.last_displayed_stamp : new Date;

			// Main.loadMore(last_displayed_stamp).success(function(weshares){
			// 	console.log('typeof: ' + typeof $scope.weshares);
			// 	if (weshares.length > 0){
			// 		$scope.weshares = $scope.weshares.concat(weshares);
			// 		//console.log('weshares after concat: ' + JSON.stringify($scope.weshares));
			// 		$scope.$broadcast('scroll.infiniteScrollComplete');	
			// 		$scope.refresher = true;
			// 		$scope.last_displayed_stamp = new Date($scope.weshares[$scope.weshares.length-1].createdOn);
			// 	}
			// 	else{
			// 		console.log('making refresher false');
			// 		$scope.refresher = false;
			// 	}
			// });
			Main.loadMore($scope.categoryId, last_displayed_stamp)
				.success(function(data){
						if (data.length > 0){
							$scope.weshares = Main.weshares;
							console.log('weshares after concat: ' + JSON.stringify($scope.weshares, null, 4));
							$scope.$broadcast('scroll.infiniteScrollComplete');	
							$scope.refresher = true;
							$scope.last_displayed_stamp = new Date($scope.weshares[$scope.weshares.length-1].createdOn);
						}
						else{
							console.log('making refresher false');
							$scope.refresher = false;
						}
					});
		}


	})

	.controller('DetailCtrl', function($scope, $rootScope, $state, $stateParams, $ionicModal, $cordovaClipboard, liked, Main){


		$scope.weshare = {};
		$scope.liked = liked.data;

		console.log('liked: ' + JSON.stringify($scope.liked));

		Main.get($stateParams.weshareId).success(function(weshare){
			$scope.weshare = weshare;
			console.log('weshare in detail: ' + JSON.stringify(weshare));
		});

		// $scope.$watch('liked', function(newVal, oldVal){
		// 	Main.updateLiked({
		// 		email: $rootScope.user.email,
		// 		weshareId: $stateParams.weshareId,
		// 		liked: $scope.liked
		// 	});
		// })
		
		$scope.flipLiked = function(){
			$scope.liked = !$scope.liked;
			Main.liked = $scope.liked;
			console.log('flipping liked: ' + JSON.stringify(Main.liked));
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

		$scope.showImages = function(index) {
			$scope.activeSlide = index;
			$scope.showModal('templates/image-popover.html');
		}
	 
		$scope.showModal = function(templateUrl) {
			$ionicModal.fromTemplateUrl(templateUrl, {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show();
			});
		}
	 
		// Close the modal
		$scope.closeModal = function() {
			$scope.modal.hide();
			$scope.modal.remove()
		};
		

	})

	.controller('CreateCtrl', function($scope, $rootScope, $state, $stateParams, $ionicPopup, $cordovaImagePicker, $ionicLoading, $ionicModal, Main, S3Uploader, Category){

		console.log('called CreateCtrl');
		/*
		*	Create page
		*/
		$scope.weshare = {};
		Category.getCategories().then(function(){
			$scope.categories = Category.categories;
		});
		
		$scope.save = function(){

			$ionicLoading.show({
				template: '保存中...'
			});
			setTimeout(function(){
				$scope.weshare.creator = $rootScope.user.id;
				console.log('weshare.creator: ' + JSON.stringify($scope.weshare.creator, null, 4));
				console.log('weshare before save: ' + JSON.stringify($scope.weshare, null, 4));
				Main.save($scope.weshare)
					.success(function(data){
						$ionicLoading.hide();
						$scope.weshare = {};
						//$ionicPopup.alert({title: '创建成功', content:''});
						$state.go('app.main', {"categoryId": $stateParams.parentCategoryId});
					})
					.error(function(err){
						//$ionicPopup.alert({title: 'Oops', content: err});
						$ionicLoading.hide();
						console.log('create error: ' + err);
					});	
			}, 1000);
			

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
				      		.then(function(res){
				      			$scope.weshare.images.push({url: res.headers.Location});
				      		});		
			      	}
			      	$ionicLoading.hide();
			      }, 1000);
			    }, function(error) {
			      // error getting photos
			      console.log();
			    });
		}

		$scope.showImages = function(index) {
			$scope.activeSlide = index;
			$scope.showModal('templates/image-popover.html');
		}
	 
		$scope.showModal = function(templateUrl) {
			$ionicModal.fromTemplateUrl(templateUrl, {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show();
			});
		}
	 
		// Close the modal
		$scope.closeModal = function() {
			$scope.modal.hide();
			$scope.modal.remove()
		};

	})

	.controller('FilterCtrl', function($scope, $rootScope, $state, $window, Main){

		/*
		*	Filter page
		*/


		$scope.logout = function(){
			$rootScope.user = null;
			$window.localStorage.removeItem('user');
			$window.localStorage.removeItem('token');
			//$ionicPopup.alert({title: 'Logged out', content: 'Logged out'});	
			$state.go('welcome');
		}
	})

	/*
	*	Services
	*/
	.factory('Main', function($http, $rootScope){

		var o = {
			weshares: [],
			liked: false
		}

		/*
		*	Create Page
		*/
		o.save = function(weshare){
			return $http.post($rootScope.server.url + '/weshares/create', weshare)
				.success(function(data){
					o.weshares.unshift(data);
				});	
		}

		/*
		*	Main Page
		*/

		o.all = function(categoryId){
			return $http.get($rootScope.server.url + '/weshares?categoryId=' + categoryId)
				.success(function(data){
					o.weshares = o.weshares.concat(data);
				});
		}

		o.loadMore = function(categoryId, last_displayed_stamp){
			return $http.get($rootScope.server.url + '/weshares/loadMore?categoryId=' + categoryId + '&last_displayed_stamp=' + last_displayed_stamp)
				.success(function(data){
					o.weshares = o.weshares.concat(data);
				});
		}

		o.get = function(weshareId){
			return $http.get($rootScope.server.url + '/weshares/' + weshareId);
		}

		o.updateLiked = function(params){
			return $http.put($rootScope.server.url + '/likes/update', params).success(function(data){
				o.liked = data;
			});
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