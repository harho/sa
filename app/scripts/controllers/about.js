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
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {

            scope.bindedElements[attrs.ngModel] = element[0];
            
            console.log("==================>");
            console.log(element[0].parentElement);
            
            console.log(attrs.ngModel);
            console.log(element[0].parent);
            console.log("==================>");
            
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
    
    function doCalculation(obj) {
        obj.total = obj.value1 / obj.value2; 
    }
    
    function doValidation(obj, name) {
        console.log("running validation for property "+name);
        
        
        
        if(obj['sa$'+name]) {
            
            var shadowAnnotations = obj['sa$'+name];
            
            //fix it will array or object with properties
            if(shadowAnnotations['notEmpty']) {
                
                console.log("value ==> "+obj[name]);
               
                if(obj[name]==='' || obj[name]==null ) {
                    console.log("notEmpty error");
                    
                    errors.push({path:name,errorKey:"notEmpty"});
                    
                    console.log(bindedElements);
                    bindedElements["user.sg_"+name].className="red";
                    var newElement = document.createElement('span');
                    newElement.innerHTML=" "+name+" is required!";
                    newElement.className = "danger";
                    //console.log(bindedElements["user.sg_"+name].parentElement);
                    //bindedElements["user.sg_"+name].parentNode.insertBefore(p,bindedElements["user.sg_"+name]);
                    
                    
                    var parent = bindedElements["user.sg_"+name].parentNode;
                    var targetElement = bindedElements["user.sg_"+name];

                    //if the parents lastchild is the targetElement...
                    if(parent.lastchild == targetElement) {
                            //add the newElement after the target element.
                            parent.appendChild(newElement);
                     } else {
                            // else the target has siblings, insert the new element between the target and it's next sibling.
                            parent.insertBefore(newElement, targetElement.nextSibling);
                     }
                    
                    
                    
                }
                else {
                    
                    bindedElements["user.sg_"+name].className="none";
                    var targetElement = bindedElements["user.sg_"+name];
                    var parent = bindedElements["user.sg_"+name].parentNode;
                    
                    console.log(targetElement.nextSibling.nodeName);
                    if(targetElement.nextSibling.nodeName=="SPAN") {
                        parent.removeChild(targetElement.nextSibling);
                    }
                    
                    //fix it
                    for (var i = 0; i < errors.length; i++) {
                        if(errors[i].path==name) {
                            errors.splice(i,1);  
                        }
                    }
                    //errors.splice(0,1);
                        
                }
                
                
            }
            
            if(shadowAnnotations['calculation']) {
                doCalculation(obj);
            }
        }
        
    }
    
    
    function addProperty(obj, name, initial) {
        //var field = initial;
        //obj["get_" + name] = function() { return field; }
        //obj["set_" + name] = function(val) { field = val; }
        
        obj["sg_" + name] = function(newValue) {
            
            var oldValue = obj[name];
            
            arguments.length ? (obj[name] = newValue) : obj[name];
            
            if(arguments.length) {
                //console.log('set '+name+' call '+newValue);
                if(oldValue!==newValue) {
                    console.log("fire value change event if needed "+oldValue+' !== '+newValue);
                    
                    if(obj['sa$'+name]) {
                        console.log("we got shadow annotation here: "+JSON.stringify(obj['sa$'+name]));
                        doValidation(obj, name);
                    }
                    
                }
                
            }
            else {
                //console.log('get '+name+' call');
            } 
            
            return obj[name];
        }
    }
    
    
    function create_gets_sets(obj) { // make this a framework/global function
            var proxy = {}
            for ( var i in obj ) {
                if (obj.hasOwnProperty(i)) {
                    /*var k = i;
                    proxy["set_"+i] = function (val) { this[k] = val; };
                    proxy["get_"+i] = function ()    { return this[k]; };*/
                    if( !(i.indexOf('sa$') > -1)) {
                        console.log("adding sg for "+i);
                        addProperty(obj, i, obj[i]);
                    }
                    
                    /*proxy["sg_"+i] = function (newValue)    { 
                        var kk = k;
                        if(newValue) {
                            console.log('set '+kk+ 'call '+newValue);
                        }
                        else {
                            console.log('get '+kk+' call');
                        }    
                        return arguments.length ? (this[k] = newValue) : this[k];
                    };*/
                }
            }
            /*for (var i in proxy) {
                if (proxy.hasOwnProperty(i)) {
                    console.log("="+proxy[i])
                    obj[i] = proxy[i];
                }
            }*/
    }

    
        
    
     var user = {
        
        //sa$value1 : [ {notEmpty: {}}, { calculation: {} } ], 
        sa$value1 : { notEmpty: {},  calculation: {}  }, 
        value1 : 1,
         
        //sa$value2 : [ {notEmpty: {}}, { calculation: {} } ], 
        sa$value2 : { notEmpty: {},  calculation: {}  }, 
        value2 : 2,
        
        total: 0,
        
        //sa$name : [ {notEmpty: {}} ], 
        sa$name : { notEmpty: {} } , 
        name : 'Pablo', 
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
    
    
    create_gets_sets(user);
    
    $scope.user = user;
    $scope.errors = errors;
    
    
  });
