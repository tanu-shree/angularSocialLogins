"use strict";

! function(window, angular, undefined) {
    var FACEBOOK = {
            MODULE: 'user.fb',
            TEMPLATE_MODULE: 'user.fbtmpl',
            CONTROLLER: 'AUTH.FBCONTROLLER',
            DIRECTIVE: 'userFb',
            TEMPLATE_URL: 'template/fb.html',
            CONTROLLER_AS: 'fb'
        },
        GOOGLE = {
            MODULE: 'user.gmail',
            TEMPLATE_MODULE: 'user.gmailtmpl',
            CONTROLLER: 'AUTH.GOOGLECONTROLLER',
            DIRECTIVE: 'userGmail',
            TEMPLATE_URL: 'template/gmail.html',
            CONTROLLER_AS: 'gmail'
        },
        POPUP = {
            MODULE: 'user.popup',
            TEMPLATE_MODULE: 'user.popuptmpl',
            CONTROLLER: 'AUTH.POPUPCONTROLLER',
            DIRECTIVE: 'userPopup',
            TEMPLATE_URL: 'template/popup.html',
            CONTROLLER_AS: 'popup',
            SETTINGS: {
                isOpen: false
            }
        },
        TEMPLATES = {
            MODULE: 'user.authtmpl',
            DEPENDENCIES: [POPUP.TEMPLATE_MODULE, FACEBOOK.TEMPLATE_MODULE, GOOGLE.TEMPLATE_MODULE]
        },
        MAIN_MODULE = {
            MODULE: 'user.auth',
            DEPENDENCIES: ['ngCookies', POPUP.MODULE, FACEBOOK.MODULE, GOOGLE.MODULE, TEMPLATES.MODULE]
        };

    function preventBubbleFn(e){
        e.stopPropagation();
    }

    
    angular.module(TEMPLATES.MODULE, TEMPLATES.DEPENDENCIES);
    angular.module(MAIN_MODULE.MODULE, MAIN_MODULE.DEPENDENCIES);

    angular.module(MAIN_MODULE.MODULE)
        .provider('userauth', [function() {
            var FBsettings = null,
                FBLoginRtnsettings = null,
                GoogleSettings = null,
                userauth = {
                    setFbSettings: setFbSettingsFn,
                    setFbLoginRtnSettings: setFbLoginRtnSettingsFn,
                    setGoogleSettings: setGoogleSettingsFn,
                    $get: [function() {
                        return {
                            'FBsettings': FBsettings,
                            'FBLoginRtnsettings': FBLoginRtnsettings,
                            'GoogleSettings': GoogleSettings
                        }
                    }]
                };

            function setFbSettingsFn(obj) {
                FBsettings = obj;
            }

            function setFbLoginRtnSettingsFn(obj) {
                FBLoginRtnsettings = obj;
            }

            function setGoogleSettingsFn(obj) {
                GoogleSettings = obj;
            }

            return userauth;
        }]);

    angular.module(POPUP.MODULE, [])
        .controller(POPUP.CONTROLLER, ['$scope', function($scope) {
            $scope.preventBubble = preventBubbleFn;
            this.settings = $scope.settings = $scope.settings || POPUP.SETTINGS;
        }])
        .directive(POPUP.DIRECTIVE, [function() {
            var popup = {
                scope: {
                    settings: '=?'
                },
                replace: true,
                templateUrl: POPUP.TEMPLATE_URL,
                transclude: true,
                controllerAs: POPUP.CONTROLLER_AS,
                controller: POPUP.CONTROLLER
            };

            return popup;
        }]);

    angular.module(FACEBOOK.MODULE, [])
        .constant('FACEBOOK_CONSTANTS', {
            SIGN_IN_LISTENER: 'FB_SIGNED_IN'
            
        })
        
        .controller(FACEBOOK.CONTROLLER, ['$scope', '$rootScope','FACEBOOK_CONSTANTS',
            function($scope, $rootScope,FACEBOOK_CONSTANTS) {
                var that = this;

                function FBLoginFn() {
                   window.tyModule = 'checkout_v2';
                    var win = window.open('/ty2/account/FBLogin/', 'FacebookLogin', 'width=900, height=500');
                }
                window.FBLoginCallback = function(){
                    $rootScope.$broadcast(FACEBOOK_CONSTANTS.SIGN_IN_LISTENER,window.FBCallbackResp);
                    
                };

                $scope.FBLogin = FBLoginFn;
            }
        ])
        .directive(FACEBOOK.DIRECTIVE,
            function() {
                var fb = {
                    
                    replace: true,
                    templateUrl: FACEBOOK.TEMPLATE_URL,
                    transclude: true,
                    link: function($scope, $element, $attrs, popUpController) {
                        
                    },
                    controllerAs: FACEBOOK.CONTROLLER_AS,
                    controller: FACEBOOK.CONTROLLER,
                    require: "^?" + POPUP.DIRECTIVE,
                };

                return fb;
            }
        );

    angular.module(GOOGLE.MODULE, [])
        .constant('GOOGLE_CONSTANTS', {
            
            SIGN_IN_LISTENER: 'GOOGLE_SIGNED_IN'
           
        })
        
        .controller(GOOGLE.CONTROLLER, ['$scope','$rootScope', 'GOOGLE_CONSTANTS',
            function($scope, $rootScope,GOOGLE_CONSTANTS) {
                var that = this;

                function GMLoginFn() {
                    window.tyModule = 'checkout_v2';
                    var state = getRandomId('');
                    var _gplusRedirectUri = 'http://public.beta.travelyaari.com/ty2/account/googlepluscallback';
                    var _gplusClientId  = '504504447613-06so69o5p7dmm8t8nui3mjfs4opfkcrq.apps.googleusercontent.com';
                    window.open('https://accounts.google.com/o/oauth2/auth?scope=' +
                        'email%20profile&' +
                        'cookie_policy=single_host_origin&' +
                        'state=' + state + '&' +
                        'redirect_uri=' + _gplusRedirectUri + '&'+
                        'response_type=code&' +
                        'client_id=' + _gplusClientId + '&',
                        'GoogleLogin', 'width=900, height=500');
                }
                function getRandomId(prefix){
                    return prefix + parseInt(Math.random() * 1000000, 10);
                }
                window.GPLoginCallback = function(){
                    $rootScope.$broadcast(GOOGLE_CONSTANTS.SIGN_IN_LISTENER,window.GPCallbackResp);
                    
                };

                $scope.GMLogin=GMLoginFn;
            }
        ])
        .directive(GOOGLE.DIRECTIVE,
            function( ) {
                var gmail = {
                    scope:true,
                    replace: true,
                    templateUrl: GOOGLE.TEMPLATE_URL,
                    transclude: true,
                    link: function($scope, $element, $attrs, popUpController) {
                        
                    },
                    controllerAs: GOOGLE.CONTROLLER_AS,
                    controller: GOOGLE.CONTROLLER,
                    require: "^?" + POPUP.DIRECTIVE,
                };

                return gmail;
            }
        );

    angular.module(POPUP.TEMPLATE_MODULE, []).run(["$templateCache", function($templateCache) {
        $templateCache.put(POPUP.TEMPLATE_URL, "" +
            "<div class='user-popup' ng-show='settings.isOpen'>" +
            "   <div class='user-popup-wrapper'>" +
            "       <div class='popup-content' ng-click='preventBubble($event)' ng-transclude></span>" +
            "   </div>" +
            "</div>"
        );
    }]);

    angular.module(FACEBOOK.TEMPLATE_MODULE, []).run(["$templateCache", function($templateCache) {
        $templateCache.put(FACEBOOK.TEMPLATE_URL, "" +
            "<p class='user-social fb' ng-click='FBLogin()'>" +
            "   <i class='fa fa-facebook social-icon'></i>" +
            "   <span ng-transclude></span>" +
            "</p>"
        );
    }]);

    angular.module(GOOGLE.TEMPLATE_MODULE, []).run(["$templateCache", function($templateCache) {
        $templateCache.put(GOOGLE.TEMPLATE_URL, "" +
            "<p class='user-social gmail' ng-click='GMLogin()'>" +
            "   <i class='fa fa-google social-icon'></i>" +
            "   <span ng-transclude></span>" +
            "</p>"
        );
    }]);
}(window, angular);
