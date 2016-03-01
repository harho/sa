'use strict';

/**
 * @ngdoc function
 * @name test1App.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the test1App
 */
angular.module('test1App')

  .directive('sgBind', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: 'ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            
            /*if (!ngModel.$options) {
				ngModel.$options = {
                    getterSetter: true,
                    updateOnDefault: true,
				};
			}*/
            
            DataBindingContext.addBinding(attrs.ngModel.replace("sg_",""), element[0]);
            
            /*ngModel.$formatters.push(function(value){
                
                    console.log("==================> '"+value+"'");
                    return 1;
            });*/
            
            /*console.log("==================>");
            console.log(element[0].parentElement);
            
            console.log(attrs.ngModel);
            console.log(element[0].parent);
            console.log("==================>");*/
            
            /*scope.$watch(attrs.ngModel, function (v) {
                if (v) {
                    console.log('value changed, new value is: ' + v + ' ' + v.length);
                    if (v.length > 5) {
                        var newzip = v.replace("-", '');
                        var str = newzip.substring(0, 5) + '-' + newzip.substring(5, newzip.length);
                        element.val(str);

                    } else {
                        element.val(v);
                    }

                }

            });*/

        }
    }
  })

  .controller('AboutCtrl', function ($scope) {
    
    var errors = [];
    
    var bindedElements = {};
    
    $scope.bindedElements = bindedElements;
    
    $scope.validationErrors = ValidationErrors.getErrors();
    
    /*function doCalculation(obj) {
        obj.total = obj.value1 + obj.value2; 
        obj.totalNumber = obj.number1.plus(obj.number2); 
        
    }*/
    
    var user = {
        
        
        //sa$value1 : { notEmptyValidation: {},  calculation: {}  }, 
        value1 : null,
         
        //sa$value2 : [ {notEmpty: {}}, { calculation: {} } ], 
        //sa$value2 : { notEmptyValidation: {},  calculation: {}  }, 
        value2 : 2,
         
        //sa$email : { notEmptyValidation: {}, emailValidation: {} }, 
        email: null,
        
        total: 0,
        totalNumber: 0,
        
        //sa$name : { notEmptyValidation: {} } , 
        name : 'Pablo', 
        
        geek: true,
         
        //sa$number1: { notEmptyValidation: {}, calculation: {}  },
        number1: new Big(0.1),
        //sa$number2: { notEmptyValidation: {}, calculation: {}  },
        number2: new Big(0.2),
         
        //sa$address: { beanValidation: {} },
        address: {
            //sa$street : { notEmptyValidation: {} },
            street: null,
            
            //sa$city : { notEmptyValidation: {} },
            city: 'Košice',
            
            //sa$note: { beanValidation: {} },
            note: {
                sa$value : { notEmptyValidation: {} },
                value: null,
            },
            
        },
         
         
        /*sgName: function(newValue) {
              
            if(newValue) {
                console.log('set call '+newValue);
                  
            }
            else {
                console.log('get call');
            }    
            return arguments.length ? (this.name = newValue) : this.name;
        }*/
     };
    
    //this is very important
    user[ShadowAnnotationConstants.key] = "shadow.object.key.user";
    
    var userShadow = {
        
        sa$value1 : { notEmptyValidation: {},  calculation: {}  }, 
        sa$value2 : { notEmptyValidation: {},  calculation: {}  }, 
        sa$email : { notEmptyValidation: {}, emailValidation: {} }, 
        
        sa$name : { notEmptyValidation: {} } ,  
        sa$number1: { notEmptyValidation: {}, calculation: {}  },
        sa$number2: { notEmptyValidation: {}, calculation: {}  },
        
        sa$address: { beanValidation: {} },
        address: {
            
            sa$street : { notEmptyValidation: {} },
            sa$city : { notEmptyValidation: {} },
            
            sa$note: { beanValidation: {} },
            note: {
                sa$value : { notEmptyValidation: {} },
            },
        },
     };
    
    ShadowAnnotationRegister.addShadowObject(user.sa$sa, userShadow);
    
    
    ReflectionUtils.createSettersGetters(user);
    
    $scope.user = user;
    $scope.errors = errors;
    
    
    //doUpdateUi();
    
    $scope.fireValidation = fireValidation;
    
    var fireValidationCalled = false;
        
    function fireValidation() {
        
        if(!fireValidationCalled) {
            BeanValidator.doValidation(null, null, user);    
            UiUtils.updateUi();
            fireValidationCalled = true;
        }
    }
    
    
    
    
    
  });
