'use strict';

/**
 * @ngdoc overview
 * @name test1App
 * @description
 * # test1App
 *
 * Main module of the application.
 */
angular
  .module('test1App', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider, $provide) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
       .when('/demo', {
        templateUrl: 'views/demo.html',
        controller: 'DemoCtrl',
        controllerAs: 'demo'
      })
      .otherwise({
        redirectTo: '/'
      });
    
    /*$provide.decorator('ngModelDirective', function($delegate) {
        var directive = $delegate[0],
            link = directive.link,
            shouldSetBlurUpdateEvent = function (nodeName, inputType) {
              // The blur event is only really applicable to input controls so
              // we want to stick with the default events for selects, checkboxes & radio buttons
              return nodeName.toLowerCase() === 'textarea' ||
                    (nodeName.toLowerCase() === 'input' && 
                     inputType.toLowerCase() !== 'checkbox' && 
                     inputType.toLowerCase() !== 'radio');
                };

        // save a reference to the original compile function
        var compileFn = directive.compile;

        directive.compile = function () {   

            var link = compileFn.apply(this, arguments);

            return {
                pre: function ngModelPostLink(scope, element, attr, ctrls) {

                    if(!ctrls[2]) {
                        ctrls[2] = {};
                    }

                    var ngModelOptions = ctrls[2];

                    if (ngModelOptions.$options === undefined && shouldSetBlurUpdateEvent(element[0].nodeName, element[0].type)) {
                        ngModelOptions.$options = {
                            updateOnDefault: true
                        };
                    }

                    link.pre.apply(this, arguments);
                },
                post: link.post
            };
        };

        return $delegate;
    });*/
    
    
  });
