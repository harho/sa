'use strict';

/**
 * @ngdoc function
 * @name test1App.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the test1App
 */
angular.module('test1App')
    
    .directive('toBig', function(){
        return{
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attr, ngModel){

                ngModel.$formatters.push(function(value){
                    //console.log('formatter');
                    //from modtel to UI
                    //when code change model
                    if(value){
                        return new Big(value);
                    }
                    //return value.toUpperCase();

                });

                ngModel.$parsers.push(function(value){
                   //form UI to model
                    //console.log('Parser');
                    //return value.toUpperCase();
                    //value for model
                    if(value){
                      return new Big(value);  
                    }
                    return null;             
              });

            }
        };
    })


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
    
    
    $scope.validationErrors = ValidationErrors.getErrors();
    
    var data = {
        
    }
    $scope.data = data;
    
    
    
    
    var user = {
        
        
        //sa$value1 : { notEmptyValidation: {},  calculation: {}  }, 
        value1 : 9007199254740994,
         
        //sa$value2 : [ {notEmpty: {}}, { calculation: {} } ], 
        //sa$value2 : { notEmptyValidation: {},  calculation: {}  }, 
        value2 : 0.9999,
         
        //sa$email : { notEmptyValidation: {}, emailValidation: {} }, 
        email: null,
        
        
        total: 0,
        totalNumber: 0,
        
        //sa$name : { notEmptyValidation: {} } , 
        name : 'Pablo', 
        
        geek: true,
        
         
        //sa$address: { beanValidation: {} },
        address: {
            //sa$street : { notEmptyValidation: {} },
            street: null,
            
            //sa$city : { notEmptyValidation: {} },
            city: 'Košice',
            
            //sa$note: { beanValidation: {} },
            note: {
                value: null,
                number1: 9007199254740994,
                number2: 0.9999,
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
    user[ShadowAnnotationConstants.key] = 'shadow.object.key.user';
    
    var userShadow = {
        
        sa$value1 : { notEmptyValidation: {},  calculation: {}  }, 
        sa$value2 : { notEmptyValidation: {},  calculation: {}  }, 
        sa$email : { notEmptyValidation: {}, emailValidation: {} }, 
        sa$totalNumber: { bigConversion : {}  },
        
        sa$name : { notEmptyValidation: {} } , 
        
        sa$address: { beanValidation: {} },
        address: {
            
            sa$street : { notEmptyValidation: {} },
            sa$city : { notEmptyValidation: {} },
            
            sa$note: { beanValidation: {} },
            note: {
                sa$value : { notEmptyValidation: {} },
                sa$number1: { notEmptyValidation: {}, calculation: {}, bigConversion : {}  },
                sa$number2: { notEmptyValidation: {}, calculation: {}, bigConversion : {}  },
            },
        },
     };
    
    ShadowAnnotationRegister.addShadowObject(user.sa$sa, userShadow);
    
    
    ReflectionUtils.createSettersGetters(user);
    
    $scope.user = user;
    
    var userClone = ReflectionUtils.cloneObject(user);
    
    ReflectionUtils.convertFrom(userClone);
    
    $scope.data.userClone = userClone;
    
    
    
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
    
    $scope.enableEdit = enableEdit;
    
    var editMode = false;
    
    function enableEdit() {
        var bindings = DataBindingContext.getBindings();
        
        for(var i in bindings) {
            
            if(!editMode) {
            
                
                
                if(bindings[i].getAttribute('type')=='checkbox') {
                    bindings[i].removeAttribute('disabled');    
                }
                else {
                    bindings[i].removeAttribute('readonly');
                }
                
            }
            else {
                console.log(bindings[i].getAttribute('type'));
                if(bindings[i].getAttribute('type')=='checkbox') {
                    bindings[i].setAttribute('disabled',true);    
                }
                else {
                    bindings[i].setAttribute('readonly',true);
                }
                
                
            }
            
        }
        
        if(!editMode) {
            
            DataBindingContext.enable();
            BeanValidator.doValidation(null, null, user);    
            UiUtils.updateUi();
            fireValidationCalled = true;
        }
        else {
            DataBindingContext.disable();
            ValidationErrors.removeAllErrors();
            UiUtils.updateUi();
        }
        
        
        editMode = !editMode;
    }
    
    $scope.convertFrom = convertFrom;
    
    function convertFrom() {
        
         console.log("Converting from call");
         console.log(ReflectionUtils.cloneObject(user));
         console.log(ReflectionUtils.convertFrom(ReflectionUtils.cloneObject(user)));
         
         $scope.data.userClone = ReflectionUtils.convertFrom(ReflectionUtils.cloneObject(user));
        
    }
    
    
    
    
    
  });
