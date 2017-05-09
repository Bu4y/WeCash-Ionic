angular.module('your_app_name.app.controllers', [])


.controller('AppCtrl', function($rootScope, $scope, AuthService) {

    //this will represent our logged user
    var user = AuthService.getLoggedUser();
    $scope.loggedUser = user;

    $rootScope.$on('userLoggedIn', function(e, data) {
        user = AuthService.getLoggedUser();
        $scope.loggedUser = user;
    });

})


.controller('ProfileCtrl', function($scope, $stateParams, PostService, $ionicHistory, $state, $ionicScrollDelegate) {

    $scope.$on('$ionicView.afterEnter', function() {
        $ionicScrollDelegate.$getByHandle('profile-scroll').resize();
    });

    var userId = $stateParams.userId;

    $scope.myProfile = $scope.loggedUser._id == userId;
    $scope.posts = [];
    $scope.likes = [];
    $scope.user = {};

    PostService.getUserPosts(userId).then(function(data) {
        $scope.posts = data;
    });

    PostService.getUserDetails(userId).then(function(data) {
        $scope.user = data;
    });

    PostService.getUserLikes(userId).then(function(data) {
        $scope.likes = data;
    });

    $scope.getUserLikes = function(userId) {
        //we need to do this in order to prevent the back to change
        $ionicHistory.currentView($ionicHistory.backView());
        $ionicHistory.nextViewOptions({ disableAnimate: true });

        $state.go('app.profile.likes', { userId: userId });
    };

    $scope.getUserPosts = function(userId) {
        //we need to do this in order to prevent the back to change
        $ionicHistory.currentView($ionicHistory.backView());
        $ionicHistory.nextViewOptions({ disableAnimate: true });

        $state.go('app.profile.posts', { userId: userId });
    };

})

.controller('HomeCtrl', function($scope, $rootScope, ExchangesRateService, $ionicModal, currencyFormatService, $timeout, AuthService) {
    $scope.exchangesRate = [];
    $scope.dataExchange = {};
    $scope.currencys = currencyFormatService.getCurrencies();
    console.log($scope.currencys);
    // $scope.ex = [{
    //     currency: 'THB'
    // }, {
    //     currency: 'USD'
    // }];
    $scope.modalNewPost = function() {
        alert('');
    };
    ExchangesRateService.getExchangesRate('THB').then(function(data) {
        $scope.exchangesRate = data.rates;
        $scope.exchangesRate.forEach(function(rate) {
            rate.desc = currencyFormatService.getByCode(rate.currency);
        })
    });

    $scope.doRefresh = function() {
        ExchangesRateService.getExchangesRate('THB').then(function(data) {
            $scope.exchangesRate = data.rates;
            $scope.exchangesRate.forEach(function(rate) {
                rate.desc = currencyFormatService.getByCode(rate.currency);
            })
        });
        $scope.$broadcast('scroll.refreshComplete');
    };

    $ionicModal.fromTemplateUrl('views/app/home/home-post.html', {
        scope: $scope,
    }).then(function(homelist) {
        $scope.homelist = homelist;
    });

    $scope.showList = function() {
        $scope.homelist.show();
    };

    $scope.closeList = function() {
        $scope.homelist.hide();
    };

    $scope.getLate = function() {
        ExchangesRateService.getExchangesRate($scope.dataExchange.currency_from)
            .then(function(success) {
                $scope.exchangeto = success.rates;
            })
    }
    $scope.getamount = function(ex) {
        if (ex) $scope.dataExchange.rate = ex.value;

        $scope.dataExchange.amount_to = $scope.dataExchange.amount_from / $scope.dataExchange.rate;
        if (ex) {
            $scope.dataExchange.currency_to = ex.currency;
        }

    }


    $scope.gotoMap = function() {

        if (!$scope.location) {

            $ionicModal.fromTemplateUrl('views/app/home/home-post-location.html', {
                scope: $scope,
            }).then(function(location) {
                $scope.location = location;
                $scope.location.show();
                $scope.initialize();
            });
        } else {
            $scope.location.show();
        }


    };

    $scope.closeMap = function() {
        $scope.location.hide();
    };

    $scope.post = function() {
        $scope.dataExchange.location = {};
        if ($rootScope.place) {
            $scope.dataExchange.location.name = $rootScope.place.name;
            $scope.dataExchange.location.address = $rootScope.place.formatted_address;
            $scope.dataExchange.location.lat = $rootScope.place.geometry.location.lat();
            $scope.dataExchange.location.lng = $rootScope.place.geometry.location.lng();
        }
        $scope.dataExchange.user = AuthService.getLoggedUser();

        console.log($scope.dataExchange);
        ExchangesRateService.post($scope.dataExchange)
            .then(function(success) {
                alert("success");
                $scope.homelist.hide();
            }, function(err) {
                alert(err.message);
            })
    }


    $scope.initialize = function() {

        $timeout(function(argument) {
            var mapOptions = {};
            if (!$rootScope.place) {
                mapOptions = {
                    center: { lat: 13.9351306, lng: 100.7381782 },
                    zoom: 13,
                    disableDefaultUI: true, // To remove default UI from the map view
                    scrollwheel: false
                };
            } else {
                mapOptions = {
                    center: { lat: $rootScope.place.geometry.location.lat(), lng: $rootScope.place.geometry.location.lng() },
                    zoom: 17,
                    disableDefaultUI: true, // To remove default UI from the map view
                    scrollwheel: false
                };
            }

            $scope.disableTap = function() {
                // var container = document.getElementsByClassName('pac-container');
                // angular.element(container).attr('data-tap-disabled', 'true');
                // var backdrop = document.getElementsByClassName('backdrop');
                // angular.element(backdrop).attr('data-tap-disabled', 'true');
                // angular.element(container).on("click", function() {
                //     document.getElementById('pac-input').blur();
                // });

                var input = event.target;
                // Get the predictions element
                var container = document.getElementsByClassName('pac-container');
                container = angular.element(container);
                // Apply css to ensure the container overlays the other elements, and
                // events occur on the element not behind it
                container.css('z-index', '5000');
                container.css('pointer-events', 'auto');
                // Disable ionic data tap
                container.attr('data-tap-disabled', 'true');
                // Leave the input field if a prediction is chosen
                container.on('click', function() {
                    input.blur();
                });
            };

            var map = new google.maps.Map(document.getElementById('map'),
                mapOptions);

            // =========== bind map ============
            if ($rootScope.place) {
                // var marker = new google.maps.Marker({
                //     position: { lat: $rootScope.place.geometry.location.lat(), lng: $rootScope.place.geometry.location.lng() },
                //     map: map
                // });
                var infoWindow = new google.maps.InfoWindow();

                infoWindow.setOptions({
                    content: '<div><strong>' + $rootScope.place.name + '</strong><br>' + $rootScope.place.formatted_address + '</div>',
                    position: $rootScope.place.geometry.location,
                });
                infoWindow.open(map);
                // google.maps.event.addListener(marker, 'click', function() {
                //     infoWindow.open(map, this);
                // });
            }
            // =========== bind map ============

            var input = /** @type {HTMLInputElement} */ (
                document.getElementById('pac-input'));

            // Create the autocomplete helper, and associate it with
            // an HTML text input box.
            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map);

            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            var infowindow = new google.maps.InfoWindow();
            var marker = new google.maps.Marker({
                map: map
            });

            // Get the full place details when the user selects a place from the
            // list of suggestions.

            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                infowindow.close();
                var place = autocomplete.getPlace();
                var lati = place.geometry.location.lat();
                var lngi = place.geometry.location.lng();
                if (!place.geometry) {
                    return;
                }

                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);
                }

                // Set the position of the marker using the place ID and location.
                marker.setPlace( /** @type {!google.maps.Place} */ ({
                    placeId: place.place_id,
                    location: place.geometry.location
                }));
                marker.setVisible(true);
                // + '<br>' + lati + ',' + lngi 
                infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                    place.formatted_address + '</div>');
                infowindow.open(map, marker);
                $timeout(function(argument) {
                    $scope.location.hide();
                }, 2000);

                // ==== set data ====
                console.log(place);
                $rootScope.place = place;
            });
        }, 500);
    }
})

.controller('ProductCtrl', function($scope, $stateParams, ShopService, $ionicPopup, $ionicLoading) {
    var productId = $stateParams.productId;

    ShopService.getProduct(productId).then(function(product) {
        $scope.product = product;
    });

    // show add to cart popup on button click
    $scope.showAddToCartPopup = function(product) {
        $scope.data = {};
        $scope.data.product = product;
        $scope.data.productOption = 1;
        $scope.data.productQuantity = 1;

        var myPopup = $ionicPopup.show({
            cssClass: 'add-to-cart-popup',
            templateUrl: 'views/app/shop/partials/add-to-cart-popup.html',
            title: 'Add to Cart',
            scope: $scope,
            buttons: [
                { text: '', type: 'close-popup ion-ios-close-outline' }, {
                    text: 'Add to cart',
                    onTap: function(e) {
                        return $scope.data;
                    }
                }
            ]
        });
        myPopup.then(function(res) {
            if (res) {
                $ionicLoading.show({ template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Adding to cart</p>', duration: 1000 });
                ShopService.addProductToCart(res.product);
                console.log('Item added to cart!', res);
            } else {
                console.log('Popup closed');
            }
        });
    };
})


.controller('PostCardCtrl', function($scope, PostService, $ionicPopup, $state) {
    var commentsPopup = {};

    $scope.navigateToUserProfile = function(user) {
        commentsPopup.close();
        $state.go('app.profile.posts', { userId: user._id });
    };

    $scope.showComments = function(post) {
        PostService.getPostComments(post)
            .then(function(data) {
                post.comments_list = data;
                commentsPopup = $ionicPopup.show({
                    cssClass: 'popup-outer comments-view',
                    templateUrl: 'views/app/partials/comments.html',
                    scope: angular.extend($scope, { current_post: post }),
                    title: post.comments + ' Comments',
                    buttons: [
                        { text: '', type: 'close-popup ion-ios-close-outline' }
                    ]
                });
            });
    };
})

.controller('FeedCtrl', function($scope, PostService, $ionicPopup, $state) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.totalPages = 1;

    $scope.doRefresh = function() {
        PostService.getFeed(1)
            .then(function(data) {
                $scope.totalPages = data.totalPages;
                $scope.posts = data.posts;

                $scope.$broadcast('scroll.refreshComplete');
            });
    };

    $scope.getNewData = function() {
        //do something to load your new data here
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadMoreData = function() {
        $scope.page += 1;

        PostService.getFeed($scope.page)
            .then(function(data) {
                //We will update this value in every request because new posts can be created
                $scope.totalPages = data.totalPages;
                $scope.posts = $scope.posts.concat(data.posts);

                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
    };

    $scope.moreDataCanBeLoaded = function() {
        return $scope.totalPages > $scope.page;
    };

    $scope.doRefresh();

})


.controller('ShopCtrl', function($scope, ShopService) {
    $scope.products = [];
    $scope.popular_products = [];

    ShopService.getProducts().then(function(products) {
        $scope.products = products;
    });



    ShopService.getProducts().then(function(products) {
        $scope.popular_products = products.slice(0, 2);
    });
})


.controller('ShoppingCartCtrl', function($scope, ShopService, $ionicActionSheet, _) {
    $scope.products = ShopService.getCartProducts();

    $scope.removeProductFromCart = function(product) {
        $ionicActionSheet.show({
            destructiveText: 'Remove from cart',
            cancelText: 'Cancel',
            cancel: function() {
                return true;
            },
            destructiveButtonClicked: function() {
                ShopService.removeProductFromCart(product);
                $scope.products = ShopService.getCartProducts();
                return true;
            }
        });
    };

    $scope.getSubtotal = function() {
        return _.reduce($scope.products, function(memo, product) {
            return memo + product.price;
        }, 0);
    };

})


.controller('CheckoutCtrl', function($scope) {
    //$scope.paymentDetails;
})

.controller('SettingsCtrl', function($rootScope, $scope, $state, $ionicModal, AuthService) {

    $ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.terms_of_service_modal = modal;
    });

    $ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.privacy_policy_modal = modal;
    });

    $scope.showTerms = function() {
        $scope.terms_of_service_modal.show();
    };

    $scope.showPrivacyPolicy = function() {
        $scope.privacy_policy_modal.show();
    };

    $rootScope.$on('userLoggedOut', function(e) {

        $state.go('auth.welcome');
    });

    $scope.logOut = function() {
        AuthService.logOut();
    };

})

.controller('ExchangeCtrl', function($rootScope, $scope, ExchangeService, AuthService, $state, $stateParams) {

    $scope.user = AuthService.getLoggedUser();

    $scope.getExchanges = function() {
        $scope.cates = [];
        ExchangeService.getExchanges().then(function(res) {
            res.forEach(function(data) {
                var chk = true;
                $scope.cates.forEach(function(cate) {
                    if (cate.name === data.exchangeform.base) {
                        chk = false
                    }
                });

                if (chk) {
                    $scope.cates.push({ name: data.exchangeform.base });
                }
                // if (arrayObjectIndexOf($scope.cates, data.exchangeform, 'base') === -1) {
                //   if (quiz.answers) {
                //     quiz.answers.push({
                //       user: $scope.user,
                //       answer: ''
                //     });
                //   } else {
                //     quiz.answers = [];
                //     quiz.answers.push({
                //       user: $scope.user,
                //       answer: ''
                //     });
                //   }
                // }
            });
            $scope.listExchanges = res;
        }, function(err) {
            alert('err : ' + JSON.stringify(err));
        });
    };

    $scope.getExchanges();

    $scope.exchanges = [
        { type: 'USD', value: 0.35 },
        { type: 'THB', value: 1 }
    ];

    $scope.locations = [
        { name: 'bangkok', lat: '1234', lng: '4321', des: 'mock1 bangkok' },
        { name: 'bangkok2', lat: '1234', lng: '4321', des: 'mock2 bangkok' }
    ];

    if ($stateParams.cate) {
        $scope.filterCate = $stateParams.cate;
    }

    if ($stateParams.exchangeId) {
        ExchangeService.getExchange($stateParams.exchangeId).then(function(res) {
            $scope.exchangeById = res;
        }, function(err) {
            alert('Error : ' + err.message);
        });
    }

    $scope.data = $scope.data ? $scope.data : {};
    $scope.data.from = $scope.data.from ? $scope.data.from : {};
    $scope.data.to = $scope.data.to ? $scope.data.to : {};
    $scope.create = function() {
        ExchangeService.createExchange($scope.data).then(function(res) {
            $state.go('app.shop.exchange');
            alert('success');
        }, function(err) {
            alert('err : ' + JSON.stringify(err));
        });
    };

    $scope.cancel = function() {
        $scope.data = {};
        $state.go('app.shop.home');
    };

    //this will represent our logged user
    var user = AuthService.getLoggedUser();
    $scope.loggedUser = user;

    $rootScope.$on('userLoggedIn', function(e, data) {
        user = AuthService.getLoggedUser();
        $scope.loggedUser = user;
    });

})



;
