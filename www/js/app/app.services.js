angular.module('your_app_name.app.services', [])

.service('AuthService', function($rootScope, $auth, $config) {

    this.saveUser = function(user) {
        window.localStorage.your_app_name_user = JSON.stringify(user);
    };

    this.getLoggedUser = function() {
        return (window.localStorage.your_app_name_user) ?
            JSON.parse(window.localStorage.your_app_name_user) : null;
    };

    this.isAuthenticated = function() {
        return $auth.isAuthenticated();
    };

    this.authenticate = function(provider) {
        $auth
            .authenticate(provider)
            .then(this.successAuth)
            .catch(this.failedAuth);
    };

    this.logIn = function(user) {
        $auth
            .login(user, { url: $config.apiUrl + 'api/auth/signin' })
            .then(this.successAuth)
            .catch(this.failedAuth);

    };

    this.logOut = function() {
        $auth.logout({ url:$config.apiUrl + 'api/auth/signout' })
            .then(function() {
                window.localStorage.your_app_name_user = JSON.stringify(null);
                $rootScope.$emit('userLoggedOut');
            });

    };

    this.signUp = function(itm) {
        $auth
            .signup(itm, { url:$config.apiUrl + 'api/auth/signup' })
            .then(this.successAuth)
            .catch(this.failedAuth);
    };


    this.successAuth = function(data) {
        $rootScope.$emit('userLoggedIn', data.data);
    };

    this.failedAuth = function(err) {
        $rootScope.$emit('userFailedLogin', err.data);
    };

})

.service('PostService', function($http, $q) {

    this.getPostComments = function(post) {
        var dfd = $q.defer();

        $http.get('database.json').success(function(database) {
            var comments_users = database.users;

            // Randomize comments users array
            comments_users = window.knuthShuffle(comments_users.slice(0, post.comments));

            var comments_list = [];
            // Append comment text to comments list
            comments_list = _.map(comments_users, function(user) {
                var comment = {
                    user: user,
                    text: database.comments[Math.floor(Math.random() * database.comments.length)].comment
                };
                return comment;
            });

            dfd.resolve(comments_list);
        });

        return dfd.promise;
    };

    this.getUserDetails = function(userId) {
        var dfd = $q.defer();

        $http.get('database.json').success(function(database) {
            //find the user
            var user = _.find(database.users, function(user) {
                return user._id == userId;
            });
            dfd.resolve(user);
        });

        return dfd.promise;
    };

    this.getUserPosts = function(userId) {
        var dfd = $q.defer();

        $http.get('database.json').success(function(database) {

            //get user posts
            var userPosts = _.filter(database.posts, function(post) {
                return post.userId == userId;
            });
            //sort posts by published date
            var sorted_posts = _.sortBy(userPosts, function(post) {
                return new Date(post.date);
            });

            //find the user
            var user = _.find(database.users, function(user) {
                return user._id == userId;
            });

            //add user data to posts
            var posts = _.each(sorted_posts.reverse(), function(post) {
                post.user = user;
                return post;
            });

            dfd.resolve(posts);
        });

        return dfd.promise;
    };

    this.getUserLikes = function(userId) {
        var dfd = $q.defer();

        $http.get('database.json').success(function(database) {
            //get user likes
            //we will get all the posts
            var slicedLikes = database.posts.slice(0, 4);
            // var sortedLikes =  _.sortBy(database.posts, function(post){ return new Date(post.date); });
            var sortedLikes = _.sortBy(slicedLikes, function(post) {
                return new Date(post.date);
            });

            //add user data to posts
            var likes = _.each(sortedLikes.reverse(), function(post) {
                post.user = _.find(database.users, function(user) {
                    return user._id == post.userId;
                });
                return post;
            });

            dfd.resolve(likes);

        });

        return dfd.promise;

    };

    this.getFeed = function(page) {

        var pageSize = 5, // set your page size, which is number of records per page
            skip = pageSize * (page - 1),
            totalPosts = 1,
            totalPages = 1,
            dfd = $q.defer();

        $http.get('database.json').success(function(database) {

            totalPosts = database.posts.length;
            totalPages = totalPosts / pageSize;

            var sortedPosts = _.sortBy(database.posts, function(post) {
                    return new Date(post.date);
                }),
                postsToShow = sortedPosts.slice(skip, skip + pageSize);

            //add user data to posts
            var posts = _.each(postsToShow.reverse(), function(post) {
                post.user = _.find(database.users, function(user) {
                    return user._id == post.userId;
                });
                return post;
            });

            dfd.resolve({
                posts: posts,
                totalPages: totalPages
            });
        });

        return dfd.promise;
    };
})

.service('ShopService', function($http, $q, _) {

    this.getProducts = function() {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.products);
        });
        return dfd.promise;
    };

    this.getProduct = function(productId) {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            var product = _.find(database.products, function(product) {
                return product._id == productId;
            });

            dfd.resolve(product);
        });
        return dfd.promise;
    };

    this.addProductToCart = function(productToAdd) {
        var cart_products = !_.isUndefined(window.localStorage.ionTheme1_cart) ? JSON.parse(window.localStorage.ionTheme1_cart) : [];

        //check if this product is already saved
        var existing_product = _.find(cart_products, function(product) {
            return product._id == productToAdd._id;
        });

        if (!existing_product) {
            cart_products.push(productToAdd);
        }

        window.localStorage.ionTheme1_cart = JSON.stringify(cart_products);
    };

    this.getCartProducts = function() {
        return JSON.parse(window.localStorage.ionTheme1_cart || '[]');
    };

    this.removeProductFromCart = function(productToRemove) {
        var cart_products = JSON.parse(window.localStorage.ionTheme1_cart);

        var new_cart_products = _.reject(cart_products, function(product) {
            return product._id == productToRemove._id;
        });

        window.localStorage.ionTheme1_cart = JSON.stringify(new_cart_products);
    };

})

.service('ExchangesRateService', function($rootScope, $http, $q, $config) {

    this.getExchangesRate = function(base) {
        var dfd = $q.defer();
        $http.get($config.apiUrl + 'api/exchangesrate/' + base).success(function(data) {
            // console.log(data);
            dfd.resolve(data);
        });
        return dfd.promise;
    };



    this.post = function(post) {
        var dfd = $q.defer();
        $http.post($config.apiUrl + 'api/exchanges', post)
            .success(function(res) {
                dfd.resolve(res);
            })
            .error(function(err) {
                dfd.reject(err);
            });
        return dfd.promise;
    };




})

.service('ExchangeService', function($http, $q, $config, AuthService) {
    var user = AuthService.getLoggedUser();
    this.getExchanges = function() {
        var dfd = $q.defer();
        $http.get('https://wecashapp.herokuapp.com/api/exchanges').success(function(data) {
            dfd.resolve(data);
        }).error(function(err) {
            dfd.reject(err);
        })
        return dfd.promise;
    };

    this.getExchange = function(id) {
        var dfd = $q.defer();
        $http.get('https://wecashapp.herokuapp.com/api/exchanges/' + id).success(function(data) {
            dfd.resolve(data);
        }).error(function(err) {
            dfd.reject(err);
        })
        return dfd.promise;
    };

    this.createExchange = function(data) {
        var dfd = $q.defer();
        $http.post($config.apiUrl + 'api/exchanges', data).success(function(data) {
            dfd.resolve(data);
        }).error(function(err) {
            dfd.reject(err);
        })
        return dfd.promise;
    };



})



;
