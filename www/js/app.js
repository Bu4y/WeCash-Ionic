angular.module('underscore', [])
    .factory('_', function() {
        return window._; // assumes underscore has already been loaded on the page
    });

angular.module('your_app_name', [
    'ionic',
    'satellizer',
    'ngCordova',
    'your_app_name.common.directives',
    'your_app_name.app.controllers',
    'your_app_name.auth.controllers',
    'your_app_name.app.services',
    // 'your_app_name.views',//disable templateCache view
    'underscore',
    'angularMoment',
    'ngIOS9UIWebViewPatch',
    'ion-floating-menu',
    'currencyFormat'
])

.constant('$config', {
        apiUrl: 'https://wecashapp.herokuapp.com/', // your restful API example http://localhost:3000/ 'https://wecashapp.herokuapp.com/'
        redirectUri: 'http://localhost:8100/', // oauth callback url of ionic app example http://localhost:8100/
        facebook: {
            clientId: '207825049726149' // your client id from facebook console example 
        }
    })
    // Enable native scrolls for Android platform only,
    // as you see, we're disabling jsScrolling to achieve this.
    .config(function($ionicConfigProvider) {
        if (ionic.Platform.isAndroid()) {
            $ionicConfigProvider.scrolling.jsScrolling(false);
            $ionicConfigProvider.platform.android.tabs.position('bottom');
        }
    })


.run(function($ionicPlatform, $rootScope, $ionicHistory, $timeout, $ionicConfig) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });

    // This fixes transitions for transparent background views
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if (toState.name.indexOf('auth.welcome') > -1) {
            // set transitions to android to avoid weird visual effect in the walkthrough transitions
            $timeout(function() {
                $ionicConfig.views.transition('android');
                $ionicConfig.views.swipeBackEnabled(false);
                console.log("setting transition to android and disabling swipe back");
            }, 0);
        }
    });
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        if (toState.name.indexOf('app.feed') > -1) {
            // Restore platform default transition. We are just hardcoding android transitions to auth views.
            $ionicConfig.views.transition('platform');
            // If it's ios, then enable swipe back again
            if (ionic.Platform.isIOS()) {
                $ionicConfig.views.swipeBackEnabled(true);
            }
            console.log("enabling swipe back and restoring transition to platform default", $ionicConfig.views.transition());
        }
    });
})

.config(function($stateProvider, $urlRouterProvider, $config, $authProvider) {
    var commonConfig = {
        popupOptions: {
            location: 'no',
            toolbar: 'yes',
            width: window.screen.width,
            height: window.screen.height
        }
    };

    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
        commonConfig.redirectUri = $config.redirectUri;
    }
    $authProvider.facebook(angular.extend({}, commonConfig, {
        clientId: $config.facebook.clientId,
        url: $config.apiUrl + 'api/auth/facebook'
    }));


    $stateProvider

    //SIDE MENU ROUTES
        .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "views/app/side-menu.html",
        controller: 'AppCtrl'
    })

    .state('app.home', {
        url: "/home",
        abstract: true,
        views: {
            'menuContent': {
                templateUrl: "views/app/home.html",
                controller: 'HomeCtrl'
            }
        }
    })

    .state('app.home.list', {
        url: "/",
        views: {
            'home-list': {
                templateUrl: "views/app/shop/shop-exchange.html",
                controller: 'ExchangeCtrl'
            }
        }
    })

    .state('app.home.post', {
        url: "/post",
        views: {
            'home-post': {
                templateUrl: "views/app/home/home-post.html",
                controller: 'HomeCtrl'
            }
        }
    })

    .state('app.home.rate', {
        url: "/rate",
        views: {
            'home-rate': {
                templateUrl: "views/app/home/home-rate.html",
                controller: 'HomeCtrl'
            }
        }
    })

    // .state('home-post', {
    //     url: "/home-post",
    //     views: {
    //         'menuContent': {
    //             templateUrl: "views/app/home/home-post.html",
    //             controller: 'HomeCtrl'
    //         }
    //     }
    // })

    .state('home-post-location', {
        url: "/home-post-location",
        views: {
            'menuContent': {
                templateUrl: "views/app/home/home-post-location.html",
                controller: 'HomeCtrl'
            }
        }
    })

    .state('app.all', {
        url: "/all",
        views: {
            'menuContent': {
                templateUrl: "views/app/home/all.html",
                controller: 'HomeCtrl'
            }
        }
    })

    // .state('app.home.exchange', {
    //     url: "/exchange",
    //     views: {
    //         'shop-exchange': {
    //             templateUrl: "views/app/shop/shop-exchange.html",
    //             controller: 'ExchangeCtrl'
    //         }
    //     }
    // })

    .state('app.exchange-more', {
        url: "/exchange-more/:cate",
        views: {
            'menuContent': {
                templateUrl: "views/app/shop/more-exchange.html",
                controller: 'ExchangeCtrl'
            }
        }
    })

    .state('app.exchange-detail', {
        url: "/exchange-detail/:exchangeId",
        views: {
            'menuContent': {
                templateUrl: "views/app/shop/detail-exchange.html",
                controller: 'ExchangeCtrl'
            }
        }
    })



    // .state('app.shop', {
    //   url: "/shop",
    //   abstract: true,
    //   views: {
    //     'menuContent': {
    //       templateUrl: "views/app/shop/shop.html"
    //     }
    //   }
    // })

    // .state('app.feed', {
    //   url: "/feed",
    //   views: {
    //     'menuContent': {
    //       templateUrl: "views/app/feed.html",
    //       controller: "FeedCtrl"
    //     }
    //   }
    // })

    .state('app.profile', {
        abstract: true,
        url: '/profile/:userId',
        views: {
            'menuContent': {
                templateUrl: "views/app/profile/profile.html",
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('app.profile.posts', {
        url: '/posts',
        views: {
            'profileContent': {
                templateUrl: 'views/app/profile/profile.posts.html'
            }
        }
    })

    .state('app.profile.likes', {
        url: '/likes',
        views: {
            'profileContent': {
                templateUrl: 'views/app/profile/profile.likes.html'
            }
        }
    })

    .state('app.settings', {
        url: "/settings",
        views: {
            'menuContent': {
                templateUrl: "views/app/profile/settings.html",
                controller: 'SettingsCtrl'
            }
        }
    })

    // .state('app.shop', {
    //   url: "/shop",
    //   abstract: true,
    //   views: {
    //     'menuContent': {
    //       templateUrl: "views/app/shop/shop.html"
    //     }
    //   }
    // })

    // .state('app.home.home', {
    //   url: "/",
    //   views: {
    //     'home-home': {
    //       templateUrl: "views/app/shop/shop-home.html",
    //       controller: 'ShopCtrl'
    //     }
    //   }
    // })

    // .state('app.shop.popular', {
    //   url: "/popular",
    //   views: {
    //     'shop-popular': {
    //       templateUrl: "views/app/shop/shop-popular.html",
    //       controller: 'ShopCtrl'
    //     }
    //   }
    // })

    // .state('app.shop.sale', {
    //   url: "/sale",
    //   views: {
    //     'shop-sale': {
    //       templateUrl: "views/app/shop/shop-sale.html",
    //       controller: 'ShopCtrl'
    //     }
    //   }
    // })

    // .state('app.cart', {
    //   url: "/cart",
    //   views: {
    //     'menuContent': {
    //       templateUrl: "views/app/shop/cart.html",
    //       controller: 'ShoppingCartCtrl'
    //     }
    //   }
    // })

    // .state('app.shipping-address', {
    //   url: "/shipping-address",
    //   views: {
    //     'menuContent': {
    //       templateUrl: "views/app/shop/shipping-address.html",
    //       controller: "CheckoutCtrl"
    //     }
    //   }
    // })

    // .state('app.checkout', {
    //   url: "/checkout",
    //   views: {
    //     'menuContent': {
    //       templateUrl: "views/app/shop/checkout.html",
    //       controller: "CheckoutCtrl"
    //     }
    //   }
    // })

    // .state('app.product-detail', {
    //   url: "/product/:productId",
    //   views: {
    //     'menuContent': {
    //       templateUrl: "views/app/shop/product-detail.html",
    //       controller: 'ProductCtrl'
    //     }
    //   }
    // })


    //AUTH ROUTES
    .state('auth', {
        url: "/auth",
        templateUrl: "views/auth/auth.html",
        controller: "AuthCtrl",
        abstract: true
    })

    .state('auth.welcome', {
        url: '/welcome',
        templateUrl: "views/auth/welcome.html",
        controller: 'WelcomeCtrl',
        resolve: {
            show_hidden_actions: function() {
                return false;
            }
        }
    })

    .state('auth.login', {
        url: '/login',
        templateUrl: "views/auth/login.html",
        controller: 'LogInCtrl'
    })

    .state('auth.signup', {
        url: '/signup',
        templateUrl: "views/auth/signup.html",
        controller: 'SignUpCtrl'
    })

    .state('auth.forgot-password', {
        url: '/forgot-password',
        templateUrl: "views/auth/forgot-password.html",
        controller: 'ForgotPasswordCtrl'
    })

    // .state('facebook-sign-in', {
    //   url: "/facebook-sign-in",
    //   templateUrl: "views/auth/facebook-sign-in.html",
    //   controller: 'WelcomeCtrl'
    // })
    //
    // .state('dont-have-facebook', {
    //   url: "/dont-have-facebook",
    //   templateUrl: "views/auth/dont-have-facebook.html",
    //   controller: 'WelcomeCtrl'
    // })
    //
    // .state('create-account', {
    //   url: "/create-account",
    //   templateUrl: "views/auth/create-account.html",
    //   controller: 'CreateAccountCtrl'
    // })
    //
    // .state('welcome-back', {
    //   url: "/welcome-back",
    //   templateUrl: "views/auth/welcome-back.html",
    //   controller: 'WelcomeBackCtrl'
    // })
    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/auth/welcome');
    // $urlRouterProvider.otherwise('/app/feed');
})

;
