
(function () {
  'use strict';
  if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (suffix) {
      return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
  }
})();


var ShadowAnnotations = (function () {
  'use strict';

  return {

    //
    // UiUpdater
    //
    updateUi : function () {
      ShadowAnnotationsRegister.getUiUpdater().updateUi();

      for(var i=0; i < ShadowAnnotationsRegister.getAdditionalUiUpdaters().length; i++) {
        ShadowAnnotationsRegister.getAdditionalUiUpdaters()[i].updateUi();
      }
    },

    //
    // BeanValidator methods
    //

    doValidation : function (obj) {
      BeanValidator.doValidation(null, null, obj);
      if(ShadowAnnotationsRegister.getGlobalValidator()) {
        ShadowAnnotationsRegister.getGlobalValidator().doValidation(null, null, obj);
      }
    },

    //
    // DataBindingContext
    //
    addBinding : function (property, element) {
      return DataBindingContext.addBinding(property, element);
    },
    getBindings : function () {
      return DataBindingContext.getBindings();
    },
    isEnabled : function () {
      return DataBindingContext.isEnabled();
    },
    enable : function () {
      return DataBindingContext.enable();
    },
    disable : function () {
      return DataBindingContext.disable();
    },
    /* Deside the name of this function bind ? link */
    bind : function (key, obj, shadowObj, createSettersGetters) {
      link(key, obj, shadowObj, createSettersGetters);
    },
    link : function (key, obj, shadowObj, createSettersGetters) {

      DataBindingContext.bind(key, obj, shadowObj);

      if(createSettersGetters) {
        ReflectionUtils.createSettersGetters(obj);
      }
    },
    setDefaultParentElementLevel : function(level) {
      DataBindingContext.setDefaultParentElementLevel(level);
    },
    getDefaultParentElementLevel : function() {
      return DataBindingContext.getDefaultParentElementLevel();
    },
    getBindedProperties: function() {
      return DataBindingContext.getBindedProperties();
    },


    //
    // ShadowAnnotationsRegister methods
    //
    addValidator : function (validator) {
      return ShadowAnnotationsRegister.addValidator(validator);
    },
    setGlobalValidator : function (validator) {
      return ShadowAnnotationsRegister.setGlobalValidator(validator);
    },
    /*getValidator : function (annotationName) {
     return ShadowAnnotationsRegister.getValidator(annotationName);
     },*/
    addShadowObject : function (shadowObjectKey, shadowObject) {
      return ShadowAnnotationsRegister.addShadowObject(shadowObjectKey, shadowObject);
    },
    /*getShadowObject : function (obj) {
     return ShadowAnnotationsRegister.getShadowObject(obj);
     },*/
    addConverter : function (converter) {
      return ShadowAnnotationsRegister.addConverter(converter.getAnnotationName(), converter);
    },
    /*getConverter : function (annotationName) {
     return ShadowAnnotationsRegister.getConverter(annotationName);
     },*/
    /*getAllConverters : function () {
     return ShadowAnnotationsRegister.getAllConverters();
     },*/
    /*getProcessor : function (annotationName) {
     return ShadowAnnotationsRegister.getProcessor(annotationName);
     },*/
    addProcessor : function (processor) {
      return ShadowAnnotationsRegister.addProcessor(processor);
    },
    setUiUpdater : function (updater) {
      ShadowAnnotationsRegister.setUiUpdater(updater);
    },
    addAdditionalUiUpdater : function (updater) {
      ShadowAnnotationsRegister.addAdditionalUiUpdater(updater);
    },
    /*getUiUpdater : function (updater) {
     ShadowAnnotationsRegister.getUiUpdater();
     },*/

    //
    // ValidationError methods
    //
    containsAnyError: function (properties) {
      return ValidationErrors.containsAnyError(properties);
    },
    getErrors: function () {
      return ValidationErrors.getErrors();
    }


  };

}());


var ShadowAnnotationsConstants = (function () {
  'use strict';

  return {
    prefix : 'sa$',
    key : 'sa$sa',
    setGetPrefix : 'sg_',
  };
}());

var DataBindingContext = (function () {
  'use strict';

  var defaultParentElementLevel = 2;

  var bindings = {};
  var enabled = false;

  var addBinding = function (property, element, parentElementLevel) {
    bindings[property] = { element: element, parentElementLevel: parentElementLevel ? parentElementLevel : defaultParentElementLevel } ;

  };

  var getAllBindedProperties = function() {
    var bindedProperties = [];
    for ( var i in bindings ) {
      bindedProperties.push(i);
    }
    return bindedProperties;
  };

  var getBindedProperties = function(obj) {
    var bindedProperties = [];
    for ( var i in bindings ) {

      if(i.indexOf(obj[ShadowAnnotationsConstants.key])===0) {
        bindedProperties.push(i);
      }
    }
    return bindedProperties;
  };



  var bind = function (key, obj, shadowObj) {

    if(obj) {
      obj[ShadowAnnotationsConstants.key] = key;
      ShadowAnnotationsRegister.addShadowObject(key, shadowObj);
    }
  };

  return {
    addBinding : function (property, element, parentElementLevel) {
      return addBinding(property, element, parentElementLevel);
    },
    getBindings : function () {
      return bindings;
    },
    isEnabled : function () {
      return enabled;
    },
    enable : function () {
      enabled = true;
    },
    disable : function () {
      enabled = true;
    },
    bind : function (key, obj, shadowObj) {
      bind(key, obj, shadowObj);
    },
    setDefaultParentElementLevel : function(level) {
      defaultParentElementLevel = level;
    },
    getDefaultParentElementLevel : function() {
      return defaultParentElementLevel;
    },
    removeAllBindigs: function() {
      bindings = {};
    },
    removeBindigs: function(obj) {

      for (var i = 0; i < bindings.length; i++) {
        if(bindings[i].property.indexOf(obj[ShadowAnnotationsConstants.key])===0) {
          bindings.splice(i,1);
        }
      }

    },
    getAllBindedProperties: function() {
      return getAllBindedProperties();
    },
    getBindedProperties: function(obj) {
      return getBindedProperties(obj);
    }


  };
}());

var ValidationErrors = (function () {
  'use strict';
  var errors = [];

  var containsAnyError =  function (properties) {

    for(var i = 0; i< errors.length ; i++) {
      for(var j = 0; j < properties.length; j++) {

        if(errors[i].property === properties[j]) {
          return true;
        }
      }

    }
    return false;

  };

  return {
    addError : function (validationError) {

      for (var i = 0; i < errors.length; i++) {
        if(errors[i].property === validationError.property && errors[i].errorKey === validationError.errorKey) {
          return;
        }
      }

      errors.push(validationError);
    },
    removeError: function(property, errorKey) {
      //console.log('Removing error from: '+property);

      for (var i = 0; i < errors.length; i++) {
        if(errors[i].property === property && errors[i].errorKey === errorKey) {
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
    containsAnyError: function(properties) {
      return containsAnyError(properties)
    }

  };
}());

var ValidationWarnings = (function () {
  'use strict';
  var warnings = [];

  return {
    addWarning : function (validationWarning) {

      for (var i = 0; i < warnings.length; i++) {
        if(warnings[i].property === validationWarning.property && warnings[i].warningKey === validationWarning.warningKey) {
          return;
        }
      }

      warnings.push(validationWarning);
    },
    removeWarning: function(property, warningKey) {

      for (var i = 0; i < warnings.length; i++) {
        if(warnings[i].property === property && warnings[i].warningKey === warningKey) {
          warnings.splice(i,1);
        }
      }
    },
    getWarnings: function() {
      return warnings;
    },
    removeAllWarnings: function() {
      warnings.length = 0;
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

          var validator = ShadowAnnotationsRegister.getValidator(j);

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
          var processor = ShadowAnnotationsRegister.getProcessor(j);
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
    var rootShadowObj = ShadowAnnotationsRegister.getShadowObject(rootObj);
    var shadowObj = getBeforeLast(rootShadowObj, path ? path+'.'+name: name);
    //var propertyValue = ReflectionUtils.getPropertyValue(obj, path ? path+'.'+name: name);


    // processing converters
    var converters = ShadowAnnotationsRegister.getAllConverters();

    var shadowAnnotations = shadowObj ? shadowObj[ShadowAnnotationsConstants.prefix + name]: {};


    for ( var i in converters ) {

      if(shadowAnnotations) {

        //console.log(shadowAnnotations);
        var conversionAnnotation =  shadowAnnotations[i];
        //console.log(conversionAnnotation);
        if(conversionAnnotation) {
          var converter = ShadowAnnotationsRegister.getConverter(i);
          converter.to(conversionAnnotation, path ? path+'.'+name: name, rootObj);
        }
      }
    }

    obj[ShadowAnnotationsConstants.setGetPrefix + name] = function(newValue) {



      var oldValue = obj[name];

      if(arguments.length) {
        obj[name] = newValue;
      }

      if(arguments.length) {
        //console.log('set '+name+' call '+newValue);
        //console.log(shadowObj);
        if(oldValue!==newValue) {
          //console.log('fire value change event if needed '+oldValue+' !== '+newValue);

          if(shadowObj[ShadowAnnotationsConstants.prefix+name]) {
            //console.log('we got shadow annotation here: '+JSON.stringify(obj['sa$'+name]));

            processAnnotations(rootObj, path ? path+'.'+name: name);

            if(ShadowAnnotationsRegister.getGlobalValidator()) {
              ShadowAnnotationsRegister.getGlobalValidator().doValidation(null, null, rootObj);
            }

            ShadowAnnotations.updateUi();

          }
        }
      }
      return obj[name];
    };
  }


  function createSettersGetters(obj, path) {

    //console.log('----------------');
    //console.log(obj);
    //console.log('Create set get for path '+path);
    var rootObj = obj;
    obj = path ? ReflectionUtils.getPropertyValue(obj, path): obj;
    //console.log(obj);
    //console.log('/---------------');

    for ( var i in obj ) {
      if (obj.hasOwnProperty(i)) {

        if( !(i.indexOf('sa$') > -1)) {
          //console.log('Create setter getter for '+i);

          if(isObject(obj[i])) {
            createSettersGetters(rootObj, path ? path+'.'+i: i);
          }

          addSettersGetters(obj, rootObj, i, path);
        }

      }
    }
  }

  function doConversionFrom(obj, rootObj, name, path) {

    //console.log('--> Converting > from > property '+name+' on path '+path);
    var rootShadowObj = ShadowAnnotationsRegister.getShadowObject(rootObj);
    var shadowObj = getBeforeLast(rootShadowObj, path ? path+'.'+name: name);
    //var propertyValue = ReflectionUtils.getPropertyValue(obj, path ? path+'.'+name: name);

    // processing converters
    var converters = ShadowAnnotationsRegister.getAllConverters();
    var shadowAnnotations = shadowObj[ShadowAnnotationsConstants.prefix+name];

    for ( var i in converters ) {

      if(shadowAnnotations) {

        //console.log(shadowAnnotations);
        var conversionAnnotation =  shadowAnnotations[i];
        //console.log(conversionAnnotation);
        if(conversionAnnotation) {
          var converter = ShadowAnnotationsRegister.getConverter(i);
          converter.from(conversionAnnotation, path ? path+'.'+name: name, rootObj);
        }
      }
    }

  }


  function convertFrom(obj, path) {
    //console.log('----> Converting from call --->>>');
    var rootObj = obj;
    obj = path ? ReflectionUtils.getPropertyValue(obj, path): obj;

    for ( var i in obj ) {
      if (obj.hasOwnProperty(i)) {

        if( !(i.indexOf(ShadowAnnotationsConstants.prefix) > -1) && !(i.indexOf(ShadowAnnotationsConstants.setGetPrefix) > -1)) {
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
    //console.log('------------------------------------');
    //console.log('Get shadow annotations for '+property);
    var shadowObj = ShadowAnnotationsRegister.getShadowObject(obj);
    var obj2 = getBeforeLast(shadowObj, property);
    var propertyName = property.substr(property.lastIndexOf('.')+1, property.length);
    //console.log(obj2['sa$'+propertyName]);
    //console.log('/-----------------------------------');
    return obj2[ShadowAnnotationsConstants.prefix+propertyName];


  }


  function getBeforeLast(obj, property) {

    if(obj) {

      /* jshint validthis:true */
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
      return getPropertyValue(obj, property);
    },
    getBeforeLast: function(obj, property) {
      return getBeforeLast(obj, property);
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


var ShadowAnnotationsRegister = (function () {
  'use strict';

  var uiUpdater = null;
  var additionalUiUpdaters = [];


  var converters = {};
  var validators = {};
  var globalValidator = null;
  var processors = {};
  var shadowObjects = {};

  var addProcessor = function (annotationName, processor) {
    //console.log('Adding processor for annotation '+annotationName);
    processors[annotationName] = processor;
  };


  var addConverter = function (annotationName, converter) {

    //console.log('Adding converter for annotation '+annotationName);
    converters[annotationName] = converter;

  };

  var addValidator = function (annotationName, validator) {

    //console.log('Adding validation for annotation '+annotationName);
    validators[annotationName] = validator;

  };
  var addShadowObject = function (shadowObjectKey, shadowObject) {

    //console.log('Adding shadow object  '+shadowObjectKey);
    shadowObjects[shadowObjectKey] = shadowObject;

  };

  var getShadowObject = function (obj) {

    if(obj) {
      return obj[ShadowAnnotationsConstants.key] ? shadowObjects[obj[ShadowAnnotationsConstants.key]] : obj;
    }
    return obj;
  };

  var addAdditionalUiUpdater = function (uiUpdater) {
    additionalUiUpdaters.push(uiUpdater);
  };

  var getShadowObject = function (obj) {

    if(obj) {
      return obj[ShadowAnnotationsConstants.key] ? shadowObjects[obj[ShadowAnnotationsConstants.key]] : obj;
    }
    return obj;
  };


  return {
    addValidator : function (validator) {
      //console.log('Adding validator for annotation '+validator.getAnnotationName());
      return addValidator(validator.getAnnotationName(), validator);
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
    addConverter : function (converter) {

      return addConverter(converter.getAnnotationName(), converter);
    },
    getConverter : function (annotationName) {
      return converters[annotationName];
    },
    getAllConverters : function () {
      return converters;
    },
    addProcessor : function (processor) {
      return addProcessor(processor.getAnnotationName(), processor);
    },
    getProcessor : function (annotationName) {
      return processors[annotationName];
    },
    setUiUpdater : function (updater) {
      uiUpdater = updater;
    },
    getUiUpdater : function () {
      return uiUpdater
    },
    addAdditionalUiUpdater : function (updater) {
      addAdditionalUiUpdater(updater)
    },
    getAdditionalUiUpdaters : function () {
      return additionalUiUpdaters;
    },
    setGlobalValidator : function (validator) {
      globalValidator = validator;
    },
    getGlobalValidator : function () {
      return globalValidator;
    },
  };
}());


var NotEmptyValidator = (function () {
  'use strict';

  var annotationName = 'notEmptyValidation';
  var defaultErrorKey = 'error.validation.not.empty';

  var doValidation = function (sa, property, obj) {

    var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
    //console.log(obj);
    //console.log('Running validation for annotation '+annotationName+' for '+property+':'+propertyValue);

    if(propertyValue==='' || propertyValue===null ) {

      ValidationErrors.addError({ property: property, errorKey: defaultErrorKey, objectKey: obj[ShadowAnnotationsConstants.key] });

    }
    else {

      ValidationErrors.removeError(property, defaultErrorKey);
    }
  };

  return {
    doValidation : function (sa, property, obj) {
      return doValidation(sa, property, obj);
    },
    getAnnotationName: function() {
      return annotationName;
    }

  };
}());

ShadowAnnotationsRegister.addValidator(NotEmptyValidator);


var EmailValidator = (function () {
  'use strict';

  var annotationName = 'emailValidation';

  var doValidation = function (sa, property, obj)  {

    //console.log('Running validation for annotation '+annotationName);

    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    var propertyValue = ReflectionUtils.getPropertyValue(obj, property);

    if(propertyValue==='' || propertyValue===null || !re.test(propertyValue)) {

      ValidationErrors.addError({property:property,errorKey:'emailFormat',objectKey: obj[ShadowAnnotationsConstants.key]});

    }
    else {
      ValidationErrors.removeError(property,'emailFormat');
    }


  };

  return {
    doValidation : function (sa, property, obj) {
      return doValidation(sa, property, obj);
    },
    getAnnotationName: function() {
      return annotationName;
    }

  };
}());

ShadowAnnotationsRegister.addValidator(EmailValidator);

var BeanValidator = (function () {
  'use strict';

  var annotationName = 'beanValidation';

  var doValidation = function (sa, property, obj) {

    var rootObj = obj;
    var rootShadowObj = ShadowAnnotationsRegister.getShadowObject(obj);
    obj = property ? ReflectionUtils.getPropertyValue(obj, property): obj;
    var shadowObj = property ? ReflectionUtils.getPropertyValue(rootShadowObj, property): rootShadowObj;

    //var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
    // console.log('Running validation for annotation '+annotationName+' for '+property+':'+propertyValue);

    for ( var i in shadowObj ) {

      if(i.indexOf(ShadowAnnotationsConstants.prefix) > -1) {

        var shadowAnnotations = shadowObj[i];

        for ( var j in shadowAnnotations ) {

          if(j.endsWith('Validation')) {

            var validator = ShadowAnnotationsRegister.getValidator(j);

            if(validator) {
              validator.doValidation(shadowAnnotations[j], property? property+'.'+i.replace(ShadowAnnotationsConstants.prefix,''): i.replace(ShadowAnnotationsConstants.prefix,'',''), rootObj);
            }
            else {
              console.warn('Validator for annotation '+j+' not found');
            }
          }
          else if(j.endsWith('Conversion')) {

            //do nothing here

            /*var converter = ShadowAnnotationsRegister.getConverter(j);
             if(validator) {
             converter.to(shadowAnnotations[j], property? property+'."+i.replace(ShadowAnnotationsConstants.prefix,''): i.replace(ShadowAnnotationsConstants.prefix,'',''), rootObj);
             }
             else {
             console.warn('Converter for annotation '+j+' not found');
             }*/

          }
          else {
            // after all it must be a processor
            var processor = ShadowAnnotationsRegister.getProcessor(j);
            if(processor) {
              processor.process(shadowAnnotations[j], property? property+'.'+i.replace(ShadowAnnotationsConstants.prefix,''): i.replace(ShadowAnnotationsConstants.prefix,'',''), rootObj);
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
    doValidation : function (sa, property, obj) {
      return doValidation(sa, property, obj);
    },
    getAnnotationName: function() {
      return annotationName;
    }

  };
}());

ShadowAnnotationsRegister.addValidator(BeanValidator);

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
    getAnnotationName: function() {
      return annotationName;
    }

  };
}());

ShadowAnnotationsRegister.addConverter(BigConverter);
