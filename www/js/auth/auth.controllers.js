angular.module('your_app_name.auth.controllers', [])

.controller('AuthCtrl', function($scope){

})

.controller('WelcomeCtrl', function($rootScope, $scope, $ionicModal, show_hidden_actions, $state, AuthService){
	AuthService.saveUser(null);
	$scope.show_hidden_actions = show_hidden_actions;

	$scope.toggleHiddenActions = function(){
		$scope.show_hidden_actions = !$scope.show_hidden_actions;
	};

	$rootScope.$on('userLoggedIn', function(e, data){
		AuthService.saveUser(data);
		$state.go('app.home.list');
	});

	$rootScope.$on('userFailedLogin', function(e, error){
		alert(error.message);
	});

	$scope.facebookSignIn = function(){
		console.log("doing facebbok sign in");
		AuthService.authenticate('facebook');
		// $state.go('app.feed');
	};

	// $scope.googleSignIn = function(){
	// 	console.log("doing google sign in");
	// 	$state.go('app.feed');
	// };

	// $scope.twitterSignIn = function(){
	// 	console.log("doing twitter sign in");
	// 	$state.go('app.feed');
	// };

	$ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.privacy_policy_modal = modal;
  });

	$ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.terms_of_service_modal = modal;
  });

  $scope.showPrivacyPolicy = function() {
    $scope.privacy_policy_modal.show();
  };

	$scope.showTerms = function() {
    $scope.terms_of_service_modal.show();
  };
})

.controller('LogInCtrl', function($rootScope, $scope, $state, AuthService){
	$scope.user = {};
	$rootScope.$on('userLoggedIn', function(e, data){
		AuthService.saveUser(data);
		$state.go('app.shop.home');
	});

	$rootScope.$on('userFailedLogin', function(e, error){
		alert(error.message);
	});
	$scope.doLogIn = function(){
		console.log("doing log in");
		AuthService.logIn($scope.user);
	};
})

.controller('SignUpCtrl', function($rootScope, $scope, $state, AuthService){
	$scope.user = {};
	$rootScope.$on('userLoggedIn', function(e, data){
		AuthService.saveUser(data);
		$state.go('app.shop.home');
	});

	$rootScope.$on('userFailedLogin', function(e, error){
		alert(error.message);
	});

	$scope.doSignUp = function(){
		console.log("doing sign up");
		AuthService.signUp($scope.user);
	};
})

.controller('ForgotPasswordCtrl', function($scope, $state){
	$scope.requestNewPassword = function() {
    console.log("requesting new password");
		$state.go('app.shop.home');
  };
})

;
