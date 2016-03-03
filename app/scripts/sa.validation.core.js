//
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

var ShadowAnnotationConstants = (function () {
    'use strict';

    return {
        prefix : 'sa$',
        key : 'sa$sa',
    };
}());

var DataBindingContext = (function () {
    'use strict';

    var bindings = {};
    var enabled = false;

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
        isEnabled : function () {  
            return enabled;
        },
        enable : function () {  
            return enabled = true;
        },
        disable : function () {  
            return enabled = true;
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
            //console.log(errorsPerPath);
            //console.log('validationErrors.length: '+validationErrors.length);
            
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
            
            //console.log(errorsPerPath);
            
            for (var i in errorsPerPath ) {
                
                //console.log(errorsPerPath[i].property);
                
                var formControlDiv = bindings['user.'+errorsPerPath[i].property].parentNode.parentNode;
                formControlDiv.className='form-group has-error';
                    
                formControlDiv.childNodes[1].setAttribute('data-original-title', errorsPerPath[i].errorMessage);
                formControlDiv.childNodes[1].setAttribute('data-placement', 'top');
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
    
    
    function processAnnotations(obj, property) {
        
        if(!DataBindingContext.isEnabled) {
            return;
        }
        
        //console.log('Proccessing annotations for property '+property);
        
        var shadowAnnotations = getShadowAnnotations(obj, property);
        //console.log(shadowAnnotations);
        if(shadowAnnotations) {
            
            for ( var j in shadowAnnotations ) {
                    
                    if(j.endsWith('Validation')) {
                    
                        var validator = ShadowAnnotationRegister.getValidator(j);    

                        if(validator) {
                            validator.doValidation(shadowAnnotations[j], property, obj);
                        }
                        else {
                            console.error('Validator for annotation '+j+' not found?');
                        }
                    }
                    else if(j.endsWith('Conversion')) {
                        //do nothing here
                    }
                    else {
                        // after all it must be a processor 
                        var processor = ShadowAnnotationRegister.getProcessor(j);    
                        if(processor) {
                            processor.process(shadowAnnotations[j], property, obj);
                        }
                        else {
                            console.warn('Processor for annotation '+j+' not found');
                        }
                    }
                
            }
            
        
        }
        
    }
    
    function addSettersGetters(obj, rootObj, name, path) {
        
        ///console.log('Adding setter getter for '+name+' on path '+path);
        var rootShadowObj = ShadowAnnotationRegister.getShadowObject(rootObj);
        var shadowObj = getBeforeLast(rootShadowObj, path ? path+"."+name: name);
        var propertyValue = ReflectionUtils.getPropertyValue(obj, path ? path+"."+name: name);
        
        
        // processing converters 
        var converters = ShadowAnnotationRegister.getAllConverters();
        var shadowAnnotations = shadowObj[ShadowAnnotationConstants.prefix+name];
        
        for ( var i in converters ) {
            
            if(shadowAnnotations) {
                
                //console.log(shadowAnnotations);
                var conversionAnnotation =  shadowAnnotations[i];   
                //console.log(conversionAnnotation);
                if(conversionAnnotation) {
                    var converter = ShadowAnnotationRegister.getConverter(i);
                    converter.to(conversionAnnotation, path ? path+'.'+name: name, rootObj);
                }
            }
        }
        
        
        shadowObj[ShadowAnnotationConstants.prefix+name]
        
        
        obj['sg_' + name] = function(newValue) {
            
            var oldValue = obj[name];
            
            if(arguments.length) {
                    obj[name] = newValue;
            }
            
            if(arguments.length) {
                //console.log('set '+name+' call '+newValue);
                //console.log(shadowObj);
                if(oldValue!==newValue) {
                    //console.log('fire value change event if needed '+oldValue+' !== '+newValue);
                    
                    if(shadowObj[ShadowAnnotationConstants.prefix+name]) {
                        //console.log("we got shadow annotation here: "+JSON.stringify(obj['sa$'+name]));
                        
                        processAnnotations(rootObj, path ? path+'.'+name: name);
                        
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
                        
                        if(isObject(obj[i])) {
                            createSettersGetters(rootObj, path ? path+"."+i: i);
                        }
                        
                        addSettersGetters(obj, rootObj, i, path);
                    }
                    
                }
            }
    }
    
    function doConversionFrom(obj, rootObj, name, path) {
        
        //console.log('--> Converting > from > property '+name+' on path '+path);
        var rootShadowObj = ShadowAnnotationRegister.getShadowObject(rootObj);
        var shadowObj = getBeforeLast(rootShadowObj, path ? path+"."+name: name);
        var propertyValue = ReflectionUtils.getPropertyValue(obj, path ? path+"."+name: name);
        
        // processing converters 
        var converters = ShadowAnnotationRegister.getAllConverters();
        var shadowAnnotations = shadowObj[ShadowAnnotationConstants.prefix+name];
        
        for ( var i in converters ) {
            
            if(shadowAnnotations) {
                
                //console.log(shadowAnnotations);
                var conversionAnnotation =  shadowAnnotations[i];   
                //console.log(conversionAnnotation);
                if(conversionAnnotation) {
                    var converter = ShadowAnnotationRegister.getConverter(i);
                    converter.from(conversionAnnotation, path ? path+'.'+name: name, rootObj);
                }
            }
        }
        
    }
    
    
    function convertFrom(obj, path) {
        //console.log('----> Converting from call --->>>');
        var rootObj = obj;
        var obj = path ? ReflectionUtils.getPropertyValue(obj, path): obj;
            
        for ( var i in obj ) {
           if (obj.hasOwnProperty(i)) {
                    
               if( !(i.indexOf('sa$') > -1) && !(i.indexOf('sg_') > -1)) {
                    //console.log('----> Converting property: '+i);
                        
                    if(isObject(obj[i])) {
                        convertFrom(rootObj, path ? path+'.'+i: i);
                    }
                        
                    doConversionFrom(obj, rootObj, i, path);
                }
                
            }
        }
        return obj;
        
    }
    
    
    function isObject(obj) {
      return (!!obj) && (obj.constructor === Object);  
    }
    
    
    function getShadowAnnotations(obj, property) {
        //console.log("------------------------------------");
        //console.log("Get shadow annotations for "+property);
        var shadowObj = ShadowAnnotationRegister.getShadowObject(obj);
        var obj2 = getBeforeLast(shadowObj, property);
        var propertyName = property.substr(property.lastIndexOf(".")+1, property.length);
        //console.log(obj2['sa$'+propertyName]);
        //console.log("/-----------------------------------");
        return obj2['sa$'+propertyName];
        
        
    }
    
    
    function getBeforeLast(obj, property) {
        
        if(obj) {
        
            if(!!~property.indexOf('.')) {
                
                
                var part1 = property.substr(0,property.indexOf('.'));
                var part2 = property.substr(property.indexOf('.')+1, property.length);
                
                if(!(!!~part2.indexOf('.'))) {
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
        
            if(!!~property.indexOf('.')) {
                var part1 = property.substr(0,property.indexOf('.'));
                var part2 = property.substr(property.indexOf('.')+1, property.length);
                
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
        cloneObject: function(obj) {        
            return JSON.parse(JSON.stringify(obj));
        },
        convertFrom: function(obj) {
            return convertFrom(obj);
        }
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
        removeAllErrors: function() {
            errors.length = 0;
        },
        
    };
}());

var ShadowAnnotationRegister = (function () {
    'use strict';

    var converters = {};
    var validators = {};
    var processors = {};
    var shadowObjects = {};
    
    var addProcessor = function (annotationName, processor) {  
        //console.log("Adding processor for annotation "+annotationName);
        processors[annotationName] = processor;
    };
    
    
    var addConverter = function (annotationName, converter) {
        
        //console.log("Adding converter for annotation "+annotationName);
        converters[annotationName] = converter;
        
    };
    
    var addValidator = function (annotationName, validator) {
        
        //console.log("Adding validation for annotation "+annotationName);
        validators[annotationName] = validator;
        
    };
    var addShadowObject = function (shadowObjectKey, shadowObject) {
        
        //console.log("Adding shadow object  "+shadowObjectKey);
        shadowObjects[shadowObjectKey] = shadowObject;
        
    };
    
    var getShadowObject = function (obj) {
        
        return obj.sa$sa ? shadowObjects[obj.sa$sa] : obj;
    };

    return {
        addValidator : function (annotationName, validator) {
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
        addConverter : function (annotationName, converter) {
            
            return addConverter(annotationName, converter);
        },
        getConverter : function (annotationName) {
            return converters[annotationName];
        },
        getAllConverters : function () {
            return converters;
        },
        addProcessor : function (annotationName, processor) {
            return addProcessor(annotationName, processor);
        },
        getProcessor : function (annotationName) {
            return processors[annotationName];
        },
    };
}());


var NotEmptyValidator = (function () {
    'use strict';

    var annotationName = 'notEmptyValidation';

    var doValidation = function (sa, property, obj) {
        
        var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
        //console.log(obj);
        //console.log('Running validation for annotation '+annotationName+' for '+property+':'+propertyValue);
        
        
        
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
        
        //console.log('Running validation for annotation '+annotationName);
        
        var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        
        var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
        
        if(propertyValue==='' || propertyValue==null || !re.test(propertyValue)) {
            
            ValidationErrors.addError({property:property,errorKey:'emailFormat'});
            
        }
        else {
            ValidationErrors.removeError(property,'emailFormat');
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

    var annotationName = 'beanValidation';

    var doValidation = function (sa, property, obj, profile) {
        
        var rootObj = obj;
        var rootShadowObj = ShadowAnnotationRegister.getShadowObject(obj);
        var obj = property ? ReflectionUtils.getPropertyValue(obj, property): obj;
        var shadowObj = property ? ReflectionUtils.getPropertyValue(rootShadowObj, property): rootShadowObj;
        
        var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
        
       // console.log('Running validation for annotation '+annotationName+' for '+property+':'+propertyValue);
        
        
        
        for ( var i in shadowObj ) {
            
            if(i.indexOf(ShadowAnnotationConstants.prefix) > -1) {
            
                var shadowAnnotations = shadowObj[i];

                for ( var j in shadowAnnotations ) {
                    
                    if(j.endsWith('Validation')) {
                    
                        var validator = ShadowAnnotationRegister.getValidator(j);    

                        if(validator) {
                            validator.doValidation(shadowAnnotations[j], property? property+'.'+i.replace(ShadowAnnotationConstants.prefix,''): i.replace(ShadowAnnotationConstants.prefix,'',''), rootObj);
                        }
                        else {
                            console.warn('Validator for annotation '+j+' not found');
                        }
                    }
                    else if(j.endsWith('Conversion')) {
                        
                        //do nothing here

                        /*var converter = ShadowAnnotationRegister.getConverter(j);    
                        if(validator) {
                            converter.to(shadowAnnotations[j], property? property+"."+i.replace(ShadowAnnotationConstants.prefix,''): i.replace(ShadowAnnotationConstants.prefix,'',''), rootObj);
                        }
                        else {
                            console.warn('Converter for annotation '+j+' not found');
                        }*/

                    }
                    else {
                        // after all it must be a processor 
                        var processor = ShadowAnnotationRegister.getProcessor(j);    
                        if(processor) {
                            processor.process(shadowAnnotations[j], property? property+'.'+i.replace(ShadowAnnotationConstants.prefix,''): i.replace(ShadowAnnotationConstants.prefix,'',''), rootObj);
                        }
                        else {
                            console.warn('Processor for annotation '+j+' not found');
                        }
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

var BigConverter = (function () {
    'use strict';

    var annotationName = 'bigConversion';

    var to = function (sa, property, obj) {
        
        var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
        //console.log('Running conversion > to > for annotation '+annotationName+' for '+property+': '+propertyValue);
        
        if(propertyValue) {
            
            var ownerObj = ReflectionUtils.getBeforeLast(obj, property);
            
            //console.log(ownerObj);
            var propertyName = property.substr(property.lastIndexOf('.')+1, property.length);
            ownerObj[propertyName] = new Big(propertyValue);
        }
    };
    
    var from = function (sa, property, obj) {
        
        var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
        //console.log('Running conversion > from > for annotation '+annotationName+' for '+property+': '+propertyValue);
        
        if(propertyValue) {    
            var ownerObj = ReflectionUtils.getBeforeLast(obj, property);
        
            var propertyName = property.substr(property.lastIndexOf('.')+1, property.length);
            
            ownerObj[propertyName] = parseFloat(propertyValue);
            //console.log(ownerObj[propertyName]);
        }
    };  


    

    return {
        to : function (sa, property, obj) {
            return to(sa, property, obj);
        },
        from : function (sa, property, obj) {
            return from(sa, property, obj);
        },

    };
}());

ShadowAnnotationRegister.addConverter('bigConversion', BigConverter);

var Calculation = (function () {
    'use strict';
    var annotationName = 'calculation';
    
    
    var isBig = function (obj) {
        return (!!obj) && (obj.constructor === Big)
    }
    
    var process = function (sa, property, obj, profile) {
        
        //console.log('Calculation call.');
        //console.log(obj);
        obj.total = obj.value1 + obj.value2; 

        if(obj.address.note.number1 && obj.address.note.number2 && isBig(obj.address.note.number2)) {
                obj.totalNumber = obj.address.note.number1.plus(obj.address.note.number2); 
        }
        
    };
    
    return {
        process : function (sa, property, obj, profile) {
            return process(sa, property, obj, profile);
        },

    };
}());

ShadowAnnotationRegister.addProcessor('calculation', Calculation);




