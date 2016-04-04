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
