angular.module('weshare.main', ['weshare.feedback'])

	/*
	*	Routes
	*/
	.config(function($stateProvider){
		$stateProvider

			.state('app', {
		      url: '/app',
		      abstract: true,
		      templateUrl: 'templates/side-menu.html',
		      controller: 'MainCtrl'
		    })
		    .state('app.legal', {
		    	url: '/legal',
		    	views:{
		    		'menuContent':{
		    			templateUrl: 'templates/side-legal.html'
		    		}
		    	}
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
			.state('app.setting', {
				url: '/setting',
				views:{
					'menuContent':{
						templateUrl: 'templates/setting.html',
						controller: 'SettingCtrl'		
					}
				}
			})
			.state('app.filter', {
				url: '/filter/:parentCategoryId',
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
				}
			})
			.state('app.profile', {
				url: '/profile',
				views: {
					'menuContent': {
						templateUrl: 'templates/profile.html',
						controller: 'ProfileCtrl'
					}
				}
			})
			.state('app.profileDetail', {
				url: '/profileDetail/:weshareId',
				views: {
					'menuContent': {
						templateUrl: 'templates/profile-detail.html',
						controller: 'ProfileDetailCtrl'
					}
				}
			})
			.state('app.createCountry', {
				url: '/createCountry',
				views: {
					'menuContent': {
						templateUrl: 'templates/create-country.html',
						controller: 'CreateCtrl'
					}
				}
			})
			.state('app.createState', {
				url: '/createState',
				views: {
					'menuContent': {
						templateUrl: 'templates/create-state.html',
						controller: 'CreateCtrl'
					}
				}
			})
			.state('app.createCategory', {
				url: '/createCategory',
				views: {
					'menuContent': {
						templateUrl: 'templates/create-category.html',
						controller: 'CreateCtrl'
					}
				}
			})
			.state('app.filterCountry', {
				url: '/filterCountry',
				views: {
					'menuContent': {
						templateUrl: 'templates/filter-country.html',
						controller: 'FilterCtrl'
					}
				}
			})
			.state('app.filterState', {
				url: '/filterState',
				views: {
					'menuContent': {
						templateUrl: 'templates/filter-state.html',
						controller: 'FilterCtrl'
					}
				}
			})
	})

	/*
	*	Controllers
	*/
	.controller('MainCtrl', function($scope, $rootScope, $state, $stateParams, $window, $location, $ionicPopup, $cordovaImagePicker, $ionicLoading, $cordovaAppRate, S3Uploader, Main){

		console.log('called MainCtrl');

		/*
		*	Main page
		*/
		
		
		$scope.$on('$ionicView.beforeEnter', function() {
			$scope.categoryId = $stateParams.categoryId != undefined ? $stateParams.categoryId : 'rrrrrrrrrrrrrrrrrrrrrrrr';
		
			Main.weshares = [];
			Main.getTop($scope.categoryId)
				.then(function(data){
					$scope.topItem = Main.topItem;
					Main.all($scope.categoryId, $rootScope.state).then(function(data){
						$scope.weshares = Main.weshares;
						if ($scope.weshares.length > 0){
							$scope.last_displayed_stamp = new Date($scope.weshares[$scope.weshares.length-1].createdOn).toISOString();	
						}	
					});
				})  

			$scope.user = $rootScope.user;	  
		});
		
		
		$scope.create = function(){
			$state.go('app.create', {"parentCategoryId": $scope.categoryId});
		}

		$scope.filter = function(){
			$state.go('app.filter', {"parentCategoryId": $scope.categoryId});
		}
		

		$scope.refresher = true;
		$scope.loadMore = function(){

			var t = new Date();
			t.setSeconds(t.getSeconds() + 3);
			t = t.toISOString();

			var last_displayed_stamp = ($scope.last_displayed_stamp!=undefined) ? $scope.last_displayed_stamp : t;

			Main.loadMore($scope.categoryId, $scope.last_displayed_stamp, $rootScope.state)
				.success(function(data){
						if (data.length > 0){
							$scope.weshares = Main.weshares;
							$scope.$broadcast('scroll.infiniteScrollComplete');	
							$scope.refresher = true;
							$scope.last_displayed_stamp = new Date($scope.weshares[$scope.weshares.length-1].createdOn).toISOString();
						}
						else{
							$scope.refresher = false;
						}
					});
		}

		$scope.doRefresh = function(){
			console.log('calling pull to refresh');

			Main.all($scope.categoryId, $rootScope.state)
				.success(function(data){
					if (data.length > 0){
						$scope.weshares = Main.weshares;
						$scope.$broadcast('scroll.refreshComplete');
						$scope.last_displayed_stamp = new Date($scope.weshares[$scope.weshares.length-1].createdOn);
					}
					else{
						$scope.refresher = false;
						$scope.$broadcast('scroll.refreshComplete');
					}
				})
		}	

		$scope.rate = function(){
			console.log('rate');

			$cordovaAppRate.navigateToAppStore().then(function (result) {
		        // success
		    });
		}

	})

	.controller('FilterCtrl', function($scope, $rootScope, $ionicLoading, $state, $stateParams, Main){
		/*
		*	Filter page
		*/
		console.log('calling filter controller');

		$scope.categoryId = $stateParams.parentCategoryId;
		

		$scope.$watch('filter.country', function(){
				if ($scope.filter.country != undefined){
					$scope.states = $scope.filter.country.states;	
				}

		})
		
		Main.getLocation().then(function(data){
			$scope.countries = Main.locations;

		})

		$scope.addLocationFilter = function(){

			$rootScope.state = $scope.filter.state.value;
			$rootScope.country = $scope.filter.country.value;

			$ionicLoading.show({
				template: '添加成功'
			});
			setTimeout(function(){
				$ionicLoading.hide();
				$state.go('app.main', {"categoryId": $stateParams.parentCategoryId});
			}, 200);
		}

		$scope.resetFilter = function(){
			$rootScope.state = '';
			$rootScope.country = '';
			$scope.filter.country = '';
			$scope.filter.state = '';
			$ionicLoading.show({
				template: '重置成功'
			});
			setTimeout(function(){
				$ionicLoading.hide();
				$state.go('app.main', {"categoryId": $stateParams.parentCategoryId});
			}, 200);
		}
	})

	.controller('DetailCtrl', function($scope, $rootScope, $state, $stateParams, $ionicLoading, $ionicModal, $cordovaClipboard, $ionicActionSheet, liked, Main){

		console.log('called DetailCtrl');

		$scope.weshare = {};
		$scope.liked = liked.data;

		Main.get($stateParams.weshareId).success(function(weshare){
			$scope.weshare = weshare;
		});

		$scope.flipLiked = function(){
			$scope.liked = !$scope.liked;
			Main.liked = $scope.liked;
			Main.updateLiked({
				email: $rootScope.user.email,
				weshareId: $stateParams.weshareId,
				liked: Main.liked
			});
		}

		$scope.copy = function(){
			$cordovaClipboard
				.copy($scope.weshare.wechatId)
				.then(function(){
					
				}, function(){
					
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
		
		$scope.showAction = function(imgUrl){

			var actionSheet = $ionicActionSheet.show({
				buttons:[
					{text: '保存'}
				],
				cancelText: '取消',
				cancel: function(){

				},
				buttonClicked: function(index){
					if (index == 0){
						var fileName = new Date().getTime() + '.png';
						$scope.downloadImg(imgUrl, fileName);
					}
					return true;
				}
			});
		}

		$scope.downloadImg = function(imgUrl, fileName) {
		    $ionicLoading.show({
		      template: 'Loading...'
		    });
		    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
		        fs.root.getDirectory(
		            "weshare",
		            {
		                create: true
		            },
		            function(dirEntry) {
		                dirEntry.getFile(
		                    fileName, 
		                    {
		                        create: true, 
		                        exclusive: false
		                    }, 
		                    function gotFileEntry(fe) {
		                        //var p = fe.toURL();
		                        var p = fs.root.toURL();
		                        fe.remove();
		                        ft = new FileTransfer();
		                        ft.download(
		                            encodeURI(imgUrl),
		                            p,
		                            function(entry) {
		                                $ionicLoading.hide();
		                                $scope.imgFile = entry.toURL();
		                                console.log('imgFile: ' + $scope.imgFile);
		                            },
		                            function(error) {
		                                $ionicLoading.hide();
		                                alert("Download Error Source -> " + JSON.stringify(error));
		                            },
		                            false,
		                            null
		                        );
		                    }, 
		                    function() {
		                        $ionicLoading.hide();
		                        console.log("Get file failed");
		                    }
		                );
		            }
		        );
		    },
		    function() {
		        $ionicLoading.hide();
		        console.log("Request for filesystem failed");
		    });
		}

		$scope.report = function(){

			$ionicActionSheet.show({

				buttons: [
					{text: '举报'}
				],

				cancelText: '取消',

				cancel: function(){

				},

				buttonClicked: function(index){

					if (index == 0){
						Main.report($scope.weshare._id)
							.success(function(data){

							})
							.error(function(err){
								console.log('report error: ' + err);
							})
					}

					return true;
				}

			});
		}

	})

	.controller('CreateCtrl', function($scope, $rootScope, $state, $stateParams, $ionicPopup, $cordovaImagePicker, $ionicLoading, $ionicModal, Main, S3Uploader, Category){

		console.log('called CreateCtrl');
		/*
		*	Create page
		*/
		$scope.weshare = {};
		$scope.searchText = '';
		console.log('parentCategoryId in create: ' + $stateParams.parentCategoryId);

		Category.getCategories().then(function(){
			$scope.categories = Category.categories;
		});

		$scope.$watch('create.country', function(){
				if ($scope.create.country != undefined){
					$scope.states = $scope.create.country.states;	
				}
		})

		Main.getLocation().then(function(data){
			$scope.countries = Main.locations;
		})
		
		$scope.save = function(){

			$ionicLoading.show({
				template: '保存中...'
			});
			setTimeout(function(){
				$scope.weshare.creator = $rootScope.user.id;
				$scope.weshare.category = $scope.create.category;
				$scope.weshare.country = $scope.create.country;
				$scope.weshare.state = $scope.create.state;
				Main.save($scope.weshare)
					.success(function(data){
						$ionicLoading.hide();
						$scope.weshare = {};
						$scope.create = {};
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
			      $ionicLoading.show({
			      	template: '上传中...'
			      });
			      setTimeout(function(){
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
			      console.log('upload image error: ' + error);
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

	.controller('SettingCtrl', function($scope, $rootScope, $state, $window, Main){

		/*
		*	Filter page
		*/


		$scope.logout = function(){
			$rootScope.user = null;
			$window.localStorage.removeItem('user');
			$window.localStorage.removeItem('token');
			Main.weshares = [];
			$state.go('welcome');
		}
	})

	.controller('ProfileCtrl', function($scope, $rootScope, Main, Feedback){

		Main.getUserWeshares().success(function(data){
			$scope.weshares = data;	

			Feedback.getUserFeedback().success(function(data1){
				$scope.feedbacks = data1;
			})
		});

		$scope.showDelete = true;

		$scope.delete = function(weshareId, index){
			console.log('weshareId in delete: ' + weshareId);
			Main.delete(weshareId).then(function(data){
				$scope.weshares.splice(index, 1);
			})
		}
		
		$scope.delete1 = function(feedbackId, index){
			Feedback.deleteFeedback(feedbackId).then(function(data){
				$scope.feedbacks.splice(index, 1);
			})
		}
	})

	.controller('ProfileDetailCtrl', function($scope, $rootScope, $state, $stateParams, $ionicPopup, $cordovaImagePicker, $ionicLoading, $ionicModal, Main, S3Uploader, Category){

		$scope.weshare = {};
		Main.get($stateParams.weshareId).success(function(weshare){

			$scope.weshare = weshare;
			Category.getCategories().then(function(){
				$scope.categories = Category.categories;
			});
		});

		$scope.$watch('weshare.country', function(){

				if ($scope.weshare.country != undefined){
					$scope.states = $scope.weshare.country.states;	
				}

		})

		$scope.update = function(){

			$ionicLoading.show({
				template: '保存中...'
			});
			setTimeout(function(){
				$scope.weshare.country = $scope.weshare.country;
				$scope.weshare.state = $scope.weshare.state;
				Main.update($scope.weshare)
					.success(function(data){
						$ionicLoading.hide();
						$scope.weshare = {};
						$scope.create = {};
						//$ionicPopup.alert({title: '创建成功', content:''});
						$state.go('app.profileDetail');
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
			      $ionicLoading.show({
			      	template: '上传中...'
			      });
			      setTimeout(function(){
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

	/*
	*	Services
	*/
	.factory('Main', function($http, $rootScope){

		var o = {
			weshares: [],
			topItem: [],
			locations: [],
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

		o.all = function(categoryId, stateFilter){
			return $http.get($rootScope.server.url + '/weshares?categoryId=' + categoryId + '&stateFilter=' + stateFilter)
				.success(function(data){
					o.weshares = [];
					o.weshares = o.weshares.concat(data);
				});
		}

		o.loadMore = function(categoryId, last_displayed_stamp, stateFilter){
			return $http.get($rootScope.server.url + '/weshares/loadMore?categoryId=' + categoryId + '&last_displayed_stamp=' + last_displayed_stamp + '&stateFilter=' + stateFilter)
				.success(function(data){
					o.weshares = o.weshares.concat(data);
				});
		}

		o.getTop = function(categoryId){
			return $http.get($rootScope.server.url + '/weshares/getTop?categoryId=' + categoryId)
				.success(function(data){
					o.topItem = [];
					o.topItem = o.topItem.concat(data);
				});
		}

		o.get = function(weshareId){
			return $http.get($rootScope.server.url + '/weshares/' + weshareId);
		}

		o.updateLiked = function(params){
			return $http.put($rootScope.server.url + '/likes/update', params).success(function(data){

			});
		}

		o.getUserWeshares = function(){
			return $http.get($rootScope.server.url + '/userWeshare?userId=' + $rootScope.user.id);
		}

		/*
		*	Detail Page
		*/
		o.report = function(weshareId){
			return $http.put($rootScope.server.url + '/weshares/report/' + weshareId);
		}

		/*
		*	Filter Page
		*/
		o.getCountries = function(){
			return $http.get($rootScope.server.url + '/countries');
		}

		o.getStates = function(){
			return $http.get($rootScope.server.url + '/states');
		}

		o.getLocation = function(){
	        return $http.get($rootScope.server.url + '/location').success(function(data){
	        	o.locations = data;
	        });
	    }

	    /*
	    *	Profile page
	    */
	    o.delete = function(weshareId){
	    	return $http.delete($rootScope.server.url + '/delete/' + weshareId);
	    }
	    o.update = function(weshare){
	    	return $http.put($rootScope.server.url + '/update/', weshare);
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
	.filter('customFilter', function () {

	    return function (p, query) {
	        var obj = {};

	        for (var key in p) {
	            if (p.hasOwnProperty(key)) {

	                if (~p[key].value.toUpperCase().indexOf(query.toUpperCase())){

	                    obj[key] = p[key];
	                }
	            }
	        }
	        return obj;
	    }
	});
