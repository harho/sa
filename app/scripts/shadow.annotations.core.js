/**
 The MIT License

 Copyright (c) 2016 Pavol Harhovský

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * Shadow annottations core. Core features, validators, converters.
 */
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

      //console.log('Updating UI errors and warnings count: '+(ValidationErrors.getErrors().length+ValidationWarnings.getWarnings().length));
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
      var globalValidator = ShadowAnnotationsRegister.getGlobalValidator(obj[ShadowAnnotationsConstants.key]);
      if(globalValidator) {
        globalValidator.doValidation(null, null, obj);
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
    getBindedProperties: function(key) {
      return DataBindingContext.getBindedProperties(key);
    },
    getBindedPropertiesWithoutKey: function(key) {
      return DataBindingContext.getBindedPropertiesWithoutKey(key);
    },
    removeAllBindigs: function() {
      DataBindingContext.removeAllBindigs();
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
    containsAnyError: function (properties, key) {
      return ValidationErrors.containsAnyError(properties, key);
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

  var getBindedProperties = function(key) {
    var bindedProperties = [];
    for ( var i in bindings ) {

      if(i.indexOf(key)===0) {
        bindedProperties.push(i);
      }
    }
    return bindedProperties;
  };

  var getBindedPropertiesWithoutKey = function(key) {
    var bindedProperties = [];

    for ( var i in bindings ) {

      if(i.indexOf(key)===0) {
        bindedProperties.push(i.substring(key.length+1));
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
    removeBindigs: function(key) {

      for (var i = 0; i < bindings.length; i++) {
        if(bindings[i].property.indexOf(key)===0) {
          bindings.splice(i,1);
        }
      }

    },
    getAllBindedProperties: function() {
      return getAllBindedProperties();
    },
    getBindedProperties: function(key) {
      return getBindedProperties(key);
    },
    getBindedPropertiesWithoutKey: function(key) {
      return getBindedPropertiesWithoutKey(key);
    }
  };
}());

var ValidationErrors = (function () {
  'use strict';
  var errors = [];

  var containsAnyError =  function (properties, key) {

    for(var i = 0; i< errors.length ; i++) {
      for(var j = 0; j < properties.length; j++) {

        if(errors[i].property === properties[j] && errors[i].objectKey === key) {
          //console.log('Contains error for property: '+properties[j]+' error key: '+errors[i].errorKey);
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
    removeError: function(property, errorKey, key) {
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
    containsAnyError: function(properties, key) {
      return containsAnyError(properties, key)
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

var ValidationDependencies = (function () {
  'use strict';
  var validationDependencies = {};

  return {
    addDependency : function (property, dependency, key) {


      var dependencies = validationDependencies[key];

      if(!dependencies) {
        dependencies = {};
        validationDependencies[key] = dependencies;
      }

      var propertyDependencies = dependencies[property];

      if(!propertyDependencies) {
        propertyDependencies = {};
        dependencies[property] = propertyDependencies;
      }

      propertyDependencies[dependency] = null;

      //console.log(validationDependencies);

    },
    getDependencies : function (property, key) {
      //console.log(property+'??'+key);
      var dependencies = validationDependencies[key];

      if(dependencies) {
        return dependencies[property];
      }
      return null;
    }


  };
}());



var ReflectionUtils = (function () {
  'use strict';


  var fixPropertyForShadowObject = function(property) {

    var part1 = property.substring(0,property.indexOf('['));
    var part2 = property.substring(property.indexOf(']')+1);
    var result = part1+part2;

    if(!!~result.indexOf('[')) {
      return fixPropertyForShadowObject(result);
    }
    return result;
  }


  function processAnnotations(obj, property, processorEnabled) {

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
            //console.error('Validator for annotation '+j+' not found?');
          }
        }
        else if(j.endsWith('Conversion')) {
          //do nothing here
        }
        else {
          // after all it must be a processor
          //console.log('------------------>'+processorEnabled +" " +j+" "+ShadowAnnotationsRegister.getProcessor(j));
          var processor = ShadowAnnotationsRegister.getProcessor(j);
          if(processor && processorEnabled) {
            processor.process(shadowAnnotations[j], property, obj);
          }
          else {
            //console.warn('Processor for annotation '+j+' not found');
          }
        }

      }
    }

  }

  function addSettersGetters(obj, rootObj, name, path) {

    if(name.indexOf('sg')>=0) {
      return;
    }
    //console.log('Adding setter getter for '+name+' on path '+path);
    var rootShadowObj = ShadowAnnotationsRegister.getShadowObject(rootObj);
    var shadowPropertyPath = path ? path+'.'+name: name;
    shadowPropertyPath = ~!!shadowPropertyPath.indexOf('[')? fixPropertyForShadowObject(shadowPropertyPath): shadowPropertyPath;

    var shadowObj = getBeforeLast(rootShadowObj, shadowPropertyPath);
    //console.log(shadowObj);
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

          /*BeanValidator.doValidation(null, null, rootObj);

           if(ShadowAnnotationsRegister.getGlobalValidator()) {
           ShadowAnnotationsRegister.getGlobalValidator().doValidation(null, null, rootObj);
           }

           ShadowAnnotations.updateUi();

           return;*/

          //console.log('fire value change event if needed '+oldValue+' !== '+newValue);

          if(shadowObj[ShadowAnnotationsConstants.prefix+name]) {

            //console.log('We got shadow annotation here: --> '+JSON.stringify(shadowObj['sa$'+name]));

            processAnnotations(rootObj, path ? path+'.'+name: name, true);

            var propertyDependencies = ValidationDependencies.getDependencies(path ? path+'.'+name: name, rootObj[ShadowAnnotationsConstants.key]);

            for ( var i in propertyDependencies ) {
              processAnnotations(rootObj, i);
            }

            var globalValidator = ShadowAnnotationsRegister.getGlobalValidator(rootObj[ShadowAnnotationsConstants.key]);
            if(globalValidator) {
              globalValidator.doValidation(null, null, rootObj);
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

  function copyProperties(fromObj, toObj, path) {

    var fromRootObj = fromObj;
    var toRootObj = toObj;
    fromObj = path ? ReflectionUtils.getPropertyValue(fromObj, path): fromObj;
    toObj = path ? ReflectionUtils.getPropertyValue(toObj, path): toObj;



    for ( var i in fromObj ) {

      if (fromObj.hasOwnProperty(i) && typeof fromObj[i] !== "function" ) {
        //console.log('Copy property '+(path ? path+'.'+i: i));

        if(isObject(fromObj[i])) {
          var needToCreateSettersGetters = false;
          //check if object exist in toObj instance
          if(!toObj[i]) {
            toObj[i] = {};
            needToCreateSettersGetters = true;
          }

          copyProperties(fromRootObj, toRootObj, path ? path+'.'+i: i);

          if(needToCreateSettersGetters) {
            createSettersGetters(toRootObj, path ? path+'.'+i: i);
          }
        }
        else {



          if(Array.isArray(fromObj[i])) {

            for(var j=0; j < fromObj[i].length; j++) {

              if(isObject(fromObj[i][j])) {
                ReflectionUtils.createSettersGetters(fromObj[i][j], '');
              }

              if(!toObj[i]) {
                toObj[i] = [];
              }
              // if object exists then ...
              if(toObj[i][j] && isObject(toObj[i][j])) {
                copyProperties(fromObj[i][j], toObj[i][j]);
              }
              else {
                toObj[i][j] = fromObj[i][j];
              }
            }

          }
          else {

            var oldValue = toObj[i];
            toObj[i] = fromObj[i]

            if (oldValue !== toObj[i]) {
              console.log('Property ' + (path ? path + '.' + i : i) + ' changed from:"' + oldValue + '" to value:"' + toObj[i] + '"');
            }
          }
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

  function doConversionTo(obj, rootObj, name, path) {

    //console.log('--> Converting > to > property ' + name + ' on path ' + path);
    var rootShadowObj = ShadowAnnotationsRegister.getShadowObject(rootObj);
    var shadowObj = getBeforeLast(rootShadowObj, path ? path + '.' + name : name);
    //var propertyValue = ReflectionUtils.getPropertyValue(obj, path ? path+'.'+name: name);

    if (shadowObj) {
      // processing converters
      var converters = ShadowAnnotationsRegister.getAllConverters();

      var shadowAnnotations = shadowObj[ShadowAnnotationsConstants.prefix + name];

      for (var i in converters) {

        if (shadowAnnotations) {

          //console.log(shadowAnnotations);
          var conversionAnnotation = shadowAnnotations[i];
          //console.log(conversionAnnotation);
          if (conversionAnnotation) {
            var converter = ShadowAnnotationsRegister.getConverter(i);
            converter.to(conversionAnnotation, path ? path + '.' + name : name, rootObj);
          }
        }
      }
    }

  }


  function convertTo(obj, path) {
    //console.log('----> Converting to call --->>>');
    var rootObj = obj;
    obj = path ? ReflectionUtils.getPropertyValue(obj, path): obj;

    for ( var i in obj ) {
      if (obj.hasOwnProperty(i)) {

        if( !(i.indexOf(ShadowAnnotationsConstants.prefix) > -1) && !(i.indexOf(ShadowAnnotationsConstants.setGetPrefix) > -1)) {
          //console.log('----> Converting property: '+i);

          if(isObject(obj[i])) {
            convertTo(rootObj, path ? path+'.'+i: i);
          }

          doConversionTo(obj, rootObj, i, path);
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
    //console.log(obj2)
    var propertyName = property.substr(property.lastIndexOf('.')+1, property.length);
    //console.log(obj2['sa$'+propertyName]);
    //console.log('/-----------------------------------');
    return obj2[ShadowAnnotationsConstants.prefix+propertyName];


  }


  function getBeforeLast(obj, property) {

    //console.log('-------------->>>');
    //console.log('property: '+property);

    if(obj) {
      /* jshint validthis:true */
      if(!!~property.indexOf('.')) {

        //console.log('??????????????')
        var part1 = property.substr(0,property.indexOf('.'));
        var part2 = property.substr(property.indexOf('.')+1, property.length);

        if(!!~part1.indexOf('[')) {
          //console.log(part1);
          //console.log(obj);
          //console.log('aaa');
          //console.log(part1.substr(0, property.indexOf('[')));
          //console.log(obj[part1.substr(0, property.indexOf('['))]);
          return getBeforeLast(obj[part1.substr(0, property.indexOf('['))], part2);
        }
        else if(!(!!~part2.indexOf('.'))) {
          return obj[part1];
        }

        return getBeforeLast(obj[part1], part2);
      }
      return obj;
    }
    return obj;

  }

  function getArrayIndex(value) {
    //console.log('getArrayIndex: '+value);
    var index = value.substr(value.indexOf('[')+1, value.indexOf(']'));
    //console.log('Index: '+index);
    return parseFloat(index);
  }

  function getPropertyValue(obj, property) {

    if(obj && property) {

      if(!!~property.indexOf('.')) {

        var part1 = property.substr(0,property.indexOf('.'));
        var part2 = property.substr(property.indexOf('.')+1, property.length);

        if(!!~part1.indexOf('[')) {
          //console.log(part1.substr(0, property.indexOf('[')));
          return getPropertyValue(obj[part1.substr(0, property.indexOf('['))][getArrayIndex(part1)], part2);
        }
        else {
          return getPropertyValue(obj[part1], part2);
        }

      }

      if(!!~property.indexOf('[')) {
        //console.log('--'+property.substr(0, property.indexOf('[')));
        //console.log('--'+property);
        //console.log(obj);
        //console.log(obj[property.substr(0, property.indexOf('['))]);
        //console.log(getArrayIndex(property));
        return obj[property.substr(0, property.indexOf('['))][getArrayIndex(property)];
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
    },
    convertTo: function(obj) {
      return convertTo(obj);
    },
    copyProperties: function(fromObj, toObj, path) {
      copyProperties(fromObj, toObj, path);
    }
  };

}());


var ShadowAnnotationsRegister = (function () {
  'use strict';

  var uiUpdater = null;
  var additionalUiUpdaters = [];


  var converters = {};
  var validators = {};
  var globalValidators = {};
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

  var addGlobalValidator = function (key, validator) {

    //console.log('Adding validation for annotation '+annotationName);
    globalValidators[key] = validator;

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
    addGlobalValidator : function (key, validator) {
      addGlobalValidator(key, validator)
    },
    getGlobalValidator : function (key) {
      return globalValidators[key];
    },
  };
}());


/*var NotEmptyValidator = (function () {
 'use strict';

 var annotationName = 'notEmptyValidation';
 var defaultErrorKey = 'error.validation.not.empty';

 var doValidation = function (sa, property, obj) {

 var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
 console.log(obj);
 console.log('Running validation for annotation '+annotationName+' for '+property+':'+propertyValue);

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

 ShadowAnnotationsRegister.addValidator(NotEmptyValidator);*/


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
/**
 * BeanValidator, validates js objects (js objects lol).
 */
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

//ShadowAnnotationsRegister.addValidator(BeanValidator);

/**
 * ArrayValidator, validates js arrays.
 */
var ArrayValidator = (function () {
  'use strict';

  var annotationName = 'arrayValidation';

  var fixPropertyForShadowObject = function(property) {
    var part1 = property.substring(0,property.indexOf('['));
    var part2 = property.substring(property.indexOf(']')+1);
    var result = part1+part2;

    if(!!~result.indexOf('[')) {
      return fixPropertyForShadowObject(result);
    }
    return result;
  }

  var doValidation = function (sa, property, obj) {

    //console.log('ArrayValidator call.');
    //console.log('property:'+property);

    var rootObj = obj;
    var rootShadowObj = ShadowAnnotationsRegister.getShadowObject(obj);
    obj = property ? ReflectionUtils.getPropertyValue(obj, property): obj;
    var shadowObj = property ? ReflectionUtils.getPropertyValue(rootShadowObj, fixPropertyForShadowObject(property)): rootShadowObj;

    var propertyValue = ReflectionUtils.getPropertyValue(obj, property);
    //console.log('Running validation for annotation '+annotationName+' for '+property+':'+propertyValue);
    //console.log(obj);
    //console.log(shadowObj);
    if(!obj) {
      return;
    }
    for ( var k = 0; k < obj.length; k++ ) {

      for ( var i in shadowObj ) {

        //console.log(i);

        if(i.indexOf(ShadowAnnotationsConstants.prefix) > -1) {

          var shadowAnnotations = shadowObj[i];

          for ( var j in shadowAnnotations ) {

            if(j.endsWith('Validation') && j!=='startValidation') {

              var validator = ShadowAnnotationsRegister.getValidator(j);

              if(validator) {


                validator.doValidation(shadowAnnotations[j], property? property+'['+k+'].'+i.replace(ShadowAnnotationsConstants.prefix,''): i.replace(ShadowAnnotationsConstants.prefix,'',''), rootObj);
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
              /*// after all it must be a processor
               var processor = ShadowAnnotationsRegister.getProcessor(j);
               if(processor) {
               processor.process(shadowAnnotations[j], property? property+'.'+i.replace(ShadowAnnotationsConstants.prefix,''): i.replace(ShadowAnnotationsConstants.prefix,'',''), rootObj);
               }
               else {
               console.warn('Processor for annotation '+j+' not found');
               }*/
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

ShadowAnnotationsRegister.addValidator(ArrayValidator);

/**
 * ArrayConverter, converts js arrays to the form, that fits shadow annotations needs.
 */
var ArrayConverter = (function () {
  'use strict';

  var annotationName = 'arrayConversion';

  var to = function (sa, property, obj) {

    var jsArray = ReflectionUtils.getPropertyValue(obj, property);
    //console.log('This property '+property+' should be an array.');
    //console.log(jsArray);

    if(jsArray) {

      var fns = ['push', 'pop', 'splice'];

      for (var i in fns) { (function() {
        var name = fns[i]
        var fn = jsArray[name];

        jsArray[name] = function() {

          var result = fn.apply(jsArray, arguments);

          if(name==='push') {
            ReflectionUtils.createSettersGetters(obj, property+'['+(jsArray.length-1)+']');
            ArrayValidator.doValidation(null, property, obj)
          }
          else if(name==='splice') {

            ValidationErrors.removeAllErrors();
            var bindings = DataBindingContext.getBindings();
            var objectKey = obj[ShadowAnnotationsConstants.key];

            for(var j=arguments[0]; j<=jsArray.length;j++) {

              var bindingPath = objectKey+'.'+property+'['+j+']';
              var nextBindingPath = objectKey+'.'+property+'['+(j+1)+']';
              for(var i in bindings) {

                if(i.indexOf(bindingPath)>=0) {

                  if(j===jsArray.length) {
                    delete bindings[i];
                  }
                  else {
                    var iPlusOne = i.replace(bindingPath, nextBindingPath);
                    bindings[i] = bindings[iPlusOne];
                  }
                }
              }
            }
            for(var i=0; i<jsArray.length;i++) {
              ReflectionUtils.createSettersGetters(obj, property+'['+i+']');
            }
            ShadowAnnotations.doValidation(obj);

          }
          else {
            //if it is pop or splice, we need to do full validation
            //there is no way, how to remove errors that was removed, yet
            ValidationErrors.removeAllErrors();
            ShadowAnnotations.doValidation(obj);
          }
          //ArrayValidator.doValidation(null, property, obj)
          ShadowAnnotations.updateUi();
        }
      })()}

      for(var i=0; i<jsArray.length;i++) {
        console.log('createSettersGettes for array item.');
        console.log(jsArray[i]);
        ReflectionUtils.createSettersGetters(obj, property+'['+i+']');
      }

    }
  };

  var from = function (sa, property, obj) {
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

ShadowAnnotationsRegister.addConverter(ArrayConverter);
