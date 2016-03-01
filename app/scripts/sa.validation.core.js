var ShadowAnnotationConstants = (function () {
    'use strict';

    return {
        prefix : "sa$",
        key : "sa$sa",
    };
}());

var DataBindingContext = (function () {
    'use strict';

    var bindings = {};

    var addBinding = function (property, element) {
        bindings[property] = element;
        
    };

    return {
        addBinding : function (property, element) {  
            return addBinding(property, element);
        },
        getBindings : function () {  
            return bindings;
        },
        
    };
}());


var UiUtils = (function () {
    'use strict';

    function updateUi() {
        
        var validationErrors = ValidationErrors.getErrors();
        
        var bindings = DataBindingContext.getBindings();
        
        if(validationErrors.length>0) {
            var errorsContent = '';
            var errorsPerPath = {};
            console.log(errorsPerPath);
            console.log('validationErrors.length: '+validationErrors.length);
            
            for (var i = 0; i < validationErrors.length; i++) {
                
                errorsContent +=validationErrors[i].property+' '+validationErrors[i].errorKey+"<br/>";
                
                if(errorsPerPath[validationErrors[i].property]) {
                    errorsPerPath[validationErrors[i].property].errorMessage += ' '+validationErrors[i].property+' '+validationErrors[i].errorKey;
                }
                else {
                    errorsPerPath[validationErrors[i].property] = {property: validationErrors[i].property, errorMessage: validationErrors[i].property+" "+validationErrors[i].errorKey };
                }
                
            }
            
            for (var i in bindings ) {
                
                var formControlDiv = bindings[i].parentNode.parentNode;
                
                formControlDiv.className='form-group';
                    
                formControlDiv.childNodes[1].removeAttribute('data-original-title');
                formControlDiv.childNodes[1].removeAttribute('data-placement');
                formControlDiv.childNodes[1].removeAttribute('data-toggle');
            }
            
            console.log(errorsPerPath);
            
            for (var i in errorsPerPath ) {
                
                console.log(errorsPerPath[i].property);
                
                var formControlDiv = bindings['user.'+errorsPerPath[i].property].parentNode.parentNode;
                formControlDiv.className='form-group has-error';
                    
                formControlDiv.childNodes[1].setAttribute('data-original-title', errorsPerPath[i].errorMessage);
                formControlDiv.childNodes[1].setAttribute('data-placement", 'top');
                formControlDiv.childNodes[1].setAttribute('data-toggle', 'tooltip');
                
            }
            
            document.getElementById("all-errors").setAttribute("data-content", errorsContent);
            
            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            });
            
        }
        else {
            
            for (var i in bindings) {
                
                var formControlDiv = bindings[i].parentNode.parentNode;
                
                formControlDiv.className="form-group";
                    
                formControlDiv.childNodes[1].removeAttribute("data-original-title");
                formControlDiv.childNodes[1].removeAttribute("data-placement");
                formControlDiv.childNodes[1].removeAttribute("data-toggle");
            }
            
            document.getElementById("all-errors").removeAttribute("data-content");
        }
    }

    return {
        updateUi : function () {
            updateUi();
        },
    };
}());

var ReflectionUtils = (function () {
    'use strict';
    
    function doValidation(obj, property) {
        console.log('Running validation for property '+property);
        
        var shadowAnnotations = getShadowAnnotations(obj, property);
        console.log(shadowAnnotations);
        if(shadowAnnotations) {
            
            for ( var j in shadowAnnotations ) {
                    
                    
                    var validator = ShadowAnnotationRegister.getValidator(j);    
                    
                    if(validator) {
                        validator.doValidation(shadowAnnotations[j], property, obj);
                    }
                    else {
                        console.error('Validator for annotation '+j+' not found');
                    }
            }
        }
        
    }
    
    function addSettersGetters(obj, rootObj, name, path) {
        console.log(obj);
        console.log('Adding setter getter for '+name+' on path '+path);
        
        var rootShadowObj = ShadowAnnotationRegister.getShadowObject(rootObj);
        console.log(rootShadowObj);
        var shadowObj = getBeforeLast(rootShadowObj, path ? path+"."+name: name);
        console.log(shadowObj);

        obj['sg_' + name] = function(newValue) {
            
            
            var oldValue = obj[name];
            
            if(arguments.length) {
                    obj[name] = newValue;
            }
            
            if(arguments.length) {
                console.log('set '+name+' call '+newValue);
                console.log(shadowObj);
                if(oldValue!==newValue) {
                    console.log('fire value change event if needed '+oldValue+' !== '+newValue);
                    
                    if(shadowObj[ShadowAnnotationConstants.prefix+name]) {
                        //console.log("we got shadow annotation here: "+JSON.stringify(obj['sa$'+name]));
                        
                        doValidation(rootObj, path ? path+"."+name: name);
                        
                        UiUtils.updateUi();
                    }
                }   
            }
            return obj[name];
        }
    }
    
    
    function createSettersGetters(obj, path) {
            
            //console.log("----------------");
            //console.log(obj);
            //console.log("Create set get for path "+path);
            var rootObj = obj;
            var obj = path ? ReflectionUtils.getPropertyValue(obj, path): obj;
            //console.log(obj);
            //console.log("/---------------");
        
            for ( var i in obj ) {
                if (obj.hasOwnProperty(i)) {
                    
                    if( !(i.indexOf('sa$') > -1)) {
                        //console.log("Create setter getter for "+i);
                        
                        if(  (!!obj[i]) && (obj[i].constructor === Object)) {
                            createSettersGetters(rootObj, path ? path+"."+i: i);
                        }
                        
                        addSettersGetters(obj, rootObj, i, path);
                    }
                    
                }
            }
    }
    
    
    function getShadowAnnotations(obj, property) {
        //console.log("------------------------------------");
        //console.log("Get shadow annotations for "+property);
        var shadowObj = ShadowAnnotationRegister.getShadowObject(obj);
        var obj2 = getBeforeLast(shadowObj, property);
        var propertyName = property.substr(property.lastIndexOf(".")+1, property.length);
        console.log(obj2["sa$"+propertyName]);
        //console.log("/-----------------------------------");
        return obj2["sa$"+propertyName];
        
        
    }
    
    
    function getBeforeLast(obj, property) {
        
        if(obj) {
        
            if(!!~property.indexOf(".")) {
                
                
                var part1 = property.substr(0,property.indexOf("."));
                var part2 = property.substr(property.indexOf(".")+1, property.length);
                
                if(!(!!~part2.indexOf("."))) {
                    return obj[part1];
                }
                
                return getBeforeLast(obj[part1], part2);


            }
            return obj;
        }
        return obj;
        
    }
    
    function getPropertyValue(obj, property) {
        
        if(obj && property) {
        
            if(!!~property.indexOf(".")) {
                var part1 = property.substr(0,property.indexOf("."));
                var part2 = property.substr(property.indexOf(".")+1, property.length);
                
                return getPropertyValue(obj[part1], part2);


            }
            return obj[property];
        }
        return obj;
        
    }

    return {       
        getPropertyValue: function(obj, property) {
            return getPropertyValue(obj, property)    
        },
        getBeforeLast: function(obj, property) {
            return getBeforeLast(obj, property)    
        },
        getShadowAnnotations : function(obj, property) {
            return getShadowAnnotations(obj, property);
        },
        createSettersGetters: function(obj, path) {
            return createSettersGetters(obj, path);
        },
    };
    
}());


var ValidationErrors = (function () {
    'use strict';
    var errors = [];

    return {
        addError : function (validationError) {
            
            for (var i = 0; i < errors.length; i++) {
                if(errors[i].property==validationError.property && errors[i].errorKey==validationError.errorKey) {
                    return;
                }
            }
            
            errors.push(validationError);
        },
        removeError: function(property, errorKey) {
            //console.log("Removing error from: "+property);
            
            for (var i = 0; i < errors.length; i++) {
                if(errors[i].property==property && errors[i].errorKey==errorKey) {
                    errors.splice(i,1);  
                }
            }
        },
        getErrors: function() {
            return errors;
        },
        
    };
}());

var ShadowAnnotationRegister = (function () {
    'use strict';

    var validators = {};
    var shadowObjects = {};
    
    var addValidator = function (annotationName, validator) {
        
        console.log("Adding validation function for annotation "+annotationName);
        validators[annotationName] = validator;
        
    };
    var addShadowObject = function (shadowObjectKey, shadowObject) {
        
        console.log("Adding shadow object  "+shadowObjectKey);
        shadowObjects[shadowObjectKey] = shadowObject;
        
    };
    
    var getShadowObject = function (obj) {
        
        return obj.sa$sa ? shadowObjects[obj.sa$sa] : obj;
    };

    return {
        addValidator : function (annotationName, validator) {
            //return addValidator(annotationName, validator);
            return addValidator(annotationName, validator);
        },
        getValidator : function (annotationName) {
            return validators[annotationName];
        },
        
        addShadowObject : function (shadowObjectKey, shadowObject) {
            return addShadowObject(shadowObjectKey, shadowObject);
        },
        getShadowObject : function (obj) {
            return getShadowObject(obj);  
        },
    };
}());


var NotEmptyValidator = (function () {
    'use strict';

    var annotationName = "notEmptyValidation";

    var doValidation = function (sa, property, obj) {
        
        var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
        //console.log(obj);
        console.log("Running validation for annotation "+annotationName+" for "+property+":"+propertyValue);
        
        
        
        if(propertyValue==='' || propertyValue==null ) {
            
            ValidationErrors.addError({ property: property, errorKey: annotationName });
            
        }
        else {
            
            ValidationErrors.removeError(property, annotationName);
        }
    };

    return {
        doValidation : function (sa, property, obj, profile) {
            return doValidation(sa, property, obj);
        },

    };
}());

ShadowAnnotationRegister.addValidator("notEmptyValidation", NotEmptyValidator);


var EmailValidator = (function () {
    'use strict';

    var annotationName = "emailValidation";

    var doValidation = function (sa, property, obj, profile)  {
        
        console.log('Running validation for annotation '+annotationName);
        
        var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        
        var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
        
        if(propertyValue==='' || propertyValue==null || !re.test(propertyValue)) {
            
            ValidationErrors.addError({property:property,errorKey:"emailFormat"});
            
        }
        else {
            ValidationErrors.removeError(property,"emailFormat");
        }
        
        
    };

    return {
        doValidation : function (sa, property, obj, profile) {
            return doValidation(sa, property, obj);
        },

    };
}());

ShadowAnnotationRegister.addValidator('emailValidation', EmailValidator);

var BeanValidator = (function () {
    'use strict';

    var annotationName = "beanValidation";

    var doValidation = function (sa, property, obj, profile) {
        
        var rootObj = obj;
        var rootShadowObj = ShadowAnnotationRegister.getShadowObject(obj);
        var obj = property ? ReflectionUtils.getPropertyValue(obj, property): obj;
        var shadowObj = property ? ReflectionUtils.getPropertyValue(rootShadowObj, property): rootShadowObj;
        
        var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
        
        console.log('Running validation for annotation '+annotationName+' for '+property+':'+propertyValue);
        
        for ( var i in shadowObj ) {
            
            if(i.indexOf(ShadowAnnotationConstants.prefix) > -1) {
            
                var shadowAnnotations = shadowObj[i];

                for ( var j in shadowAnnotations ) {
                    
                    
                    var validator = ShadowAnnotationRegister.getValidator(j);    

                    if(validator) {
                        validator.doValidation(shadowAnnotations[j], property? property+"."+i.replace(ShadowAnnotationConstants.prefix,''): i.replace(ShadowAnnotationConstants.prefix,'',''), rootObj);
                    }
                    else {
                        console.warn('Validator for annotation '+j+' not found');
                    }
                    
                }
            }
        }
        
    };

    return {
        doValidation : function (sa, property, obj, profile) {
            return doValidation(sa, property, obj, profile);
        },

    };
}());

ShadowAnnotationRegister.addValidator('beanValidation', BeanValidator);



