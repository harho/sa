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
          //console.log('createSettersGettes for array item.');
          //console.log(jsArray[i]);
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



var CityParamsValidator = (function () {
  'use strict';

  var annotationName = 'cityParamsValidation';

  var doValidation = function (sa, property, obj) {

    var propertyValue = ReflectionUtils.getPropertyValue(obj, property);


    if(propertyValue==='' || propertyValue===null || ! CityParams.findByName(propertyValue)) {

      ValidationErrors.addError({ property: property, errorKey: annotationName, objectKey: obj[ShadowAnnotationsConstants.key] });

    }
    else {

      ValidationErrors.removeError(property, annotationName);
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

var ItemsValidator = (function () {
  'use strict';

  var annotationName = 'itemsValidation';

  var doValidation = function (sa, property, obj) {

    var propertyValue = ReflectionUtils.getPropertyValue(obj, property);

    if(propertyValue.length<2) {
      ValidationErrors.addError({ property: property, errorKey: 'error.'+annotationName, objectKey: obj[ShadowAnnotationsConstants.key] });
    }
    else {
      ValidationErrors.removeError(property, annotationName);
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


ShadowAnnotationsRegister.addValidator(ItemsValidator);


var NoteValidator = (function () {
  'use strict';

  var annotationName = 'noteValidation';

  var doValidation = function (sa, property, obj) {

    var propertyValue = ReflectionUtils.getPropertyValue(obj, property);


    if(propertyValue==='' || propertyValue===null) {

      ValidationWarnings.addWarning({ property: property, warningKey: annotationName, objectKey: obj[ShadowAnnotationsConstants.key] });

    }
    else {

      ValidationWarnings.removeWarning(property, annotationName);
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


ShadowAnnotationsRegister.addValidator(NoteValidator);




var UiUpdater = (function () {
  'use strict';

  function updateUi() {

    var validationErrors = ValidationErrors.getErrors();
    var validationWarnings = ValidationWarnings.getWarnings();

    var bindings = DataBindingContext.getBindings();

    if(validationErrors.length>0) {
      var errorsPerPath = {};
      var warningsPerPath = {};
      //console.log(errorsPerPath);
      //console.log('validationErrors.length: '+validationErrors.length);

      for (var i = 0; i < validationErrors.length; i++) {

        if(errorsPerPath[validationErrors[i].property]) {
          errorsPerPath[validationErrors[i].property].message += ' '+validationErrors[i].property+' '+validationErrors[i].errorKey;
        }
        else {
          errorsPerPath[validationErrors[i].property] = {property: validationErrors[i].property, message: validationErrors[i].property+' '+validationErrors[i].errorKey };
          errorsPerPath[validationErrors[i].property].objectKey = validationErrors[i].objectKey;
        }
      }

      for (var i = 0; i < validationWarnings.length; i++) {

        if(warningsPerPath[validationWarnings[i].property]) {
          warningsPerPath[validationWarnings[i].property].message += ' '+validationWarnings[i].property+' '+validationWarnings[i].errorKey;
        }
        else {
          warningsPerPath[validationWarnings[i].property] = {property: validationWarnings[i].property, message: validationWarnings[i].property+' '+validationWarnings[i].errorKey };
          warningsPerPath[validationWarnings[i].property].objectKey = validationWarnings[i].objectKey;
        }
      }

      removeTooltipAttributes(bindings);

      addTooltipAttributes(bindings, errorsPerPath, warningsPerPath);


      $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });

    }
    else {
      removeTooltipAttributes(bindings);
    }
  }

  function getParentElement(binding) {
      return findParentElement(binding.element, binding.parentElementLevel);

  }
  function findParentElement(element, level) {
    //console.log(level);
    if(level == 1) {
      return element.parentNode;
    }
    else {
      return findParentElement(element.parentNode, level-1);
    }

  }


  function addTooltipAttributes(bindings, errorsPerPath, warningsPerPath) {

    for (var i in errorsPerPath ) {

      var binding  = bindings[errorsPerPath[i].objectKey+'.'+errorsPerPath[i].property];
      //console.log(errorsPerPath[i].objectKey+'.'+errorsPerPath[i].property);
      //console.log(binding);
      //console.log(bindings);

      if(binding) {

        var parentElement = getParentElement(binding);

        parentElement.className = 'form-group has-error';

        parentElement.childNodes[1].setAttribute('data-original-title', errorsPerPath[i].message);
        parentElement.childNodes[1].setAttribute('data-placement', 'top');
        parentElement.childNodes[1].setAttribute('data-toggle', 'tooltip');

        //formControlDiv.childNodes[1].tooltip();

      }
    }

    for (var i in warningsPerPath ) {

      var binding  = bindings[warningsPerPath[i].objectKey+'.'+warningsPerPath[i].property];

      if(binding) {

        var parentElement = getParentElement(binding);

        parentElement.className = errorsPerPath[i] ? 'form-group has-error' : 'from-group has-warning';


        if(parentElement.childNodes[1].getAttribute('data-original-title')) {
          parentElement.childNodes[1].setAttribute('data-original-title', parentElement.childNodes[1].getAttribute('data-original-title')+' '+warningsPerPath[i].message);
        }
        else {
          parentElement.childNodes[1].setAttribute('data-original-title', warningsPerPath[i].message);
        }

        parentElement.childNodes[1].setAttribute('data-original-title', warningsPerPath[i].message);
        parentElement.childNodes[1].setAttribute('data-placement', 'top');
        parentElement.childNodes[1].setAttribute('data-toggle', 'tooltip');

      }
    }

  }

  function removeTooltipAttributes(bindings) {

    for (var i in bindings ) {

      var binding  = bindings[i];

      if(binding) {

        var parentElement = getParentElement(binding);

        parentElement.className = 'form-group';

        parentElement.childNodes[1].removeAttribute('data-original-title');
        parentElement.childNodes[1].removeAttribute('data-placement');
        parentElement.childNodes[1].removeAttribute('data-toggle');

      }
    }
  }

  function updateControlUi (propertyPath) {

    var bindings = DataBindingContext.getBindings();
    var validationErrors = ValidationErrors.getErrors();
    var validationWarnings = ValidationWarnings.getWarnings();
    var errorsAndWarnings = false;

    var errorsPerPath = {};
    var warningsPerPath = {};

    for (var i = 0; i < validationErrors.length; i++) {

        if(propertyPath.endsWith(validationErrors[i].property)) {

          errorsAndWarnings = true;

          if(errorsPerPath[validationErrors[i].property]) {
              errorsPerPath[validationErrors[i].property].message += ' '+validationErrors[i].property+' '+validationErrors[i].errorKey;
          }
          else {
              errorsPerPath[validationErrors[i].property] = {property: validationErrors[i].property, message: validationErrors[i].property+' '+validationErrors[i].errorKey };
              errorsPerPath[validationErrors[i].property].objectKey = validationErrors[i].objectKey;
          }
        }
    }
    for (var i = 0; i < validationWarnings.length; i++) {

        if(propertyPath.endsWith(validationWarnings[i].property)) {

        errorsAndWarnings = true;

        if(warningsPerPath[validationWarnings[i].property]) {
          warningsPerPath[validationWarnings[i].property].message += ' '+validationWarnings[i].property+' '+validationWarnings[i].warningKey;
        }
        else {
          warningsPerPath[validationWarnings[i].property] = {property: validationWarnings[i].property, message: validationWarnings[i].property+' '+validationWarnings[i].warningKey };
          warningsPerPath[validationWarnings[i].property].objectKey = validationWarnings[i].objectKey;
        }
      }
    }


    if(errorsAndWarnings) {
      addTooltipAttributes(bindings, errorsPerPath, warningsPerPath);
     $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });
    }

  }

  return {
    updateUi : function () {
      updateUi();
    },
    updateControlUi: function(propertyPath) {

      updateControlUi(propertyPath);
    }
  };
}());

ShadowAnnotationsRegister.setUiUpdater(UiUpdater);


var AdditionalUiUpdater = (function () {
  'use strict';

  function updateUi() {

    var validationErrors = ValidationErrors.getErrors();
    var validationWarnings = ValidationWarnings.getWarnings();


    var items = document.getElementById('items');

    removeTooltipAttributes([items]);

    if(validationErrors.length>0 || validationWarnings.length>0) {

      var errorsContent = '';

      for (var i = 0; i < validationErrors.length; i++) {
        errorsContent += validationErrors[i].property + ' ' + validationErrors[i].errorKey + '<br/>';

        if(validationErrors[i].property=='items') {
          addTooltipAttributes(items, validationErrors[i].property + ' ' + validationErrors[i].errorKey);

        }

        if(!!~validationErrors[i].property.indexOf('items[')) {
          var el = $('[id^="'+validationErrors[i].property.substring(0,validationErrors[i].property.indexOf(']')+1)+'"]')[0];
          if(el) {
              //addTooltipAttributes(el, validationErrors[i].property + ' ' + validationErrors[i].errorKey);

              el.setAttribute('data-original-title', validationErrors[i].property + ' ' + validationErrors[i].errorKey);
              el.setAttribute('data-placement', 'top');
              el.setAttribute('data-toggle', 'tooltip')
          }

        }
      }

      for (var i = 0; i < validationWarnings.length; i++) {
          errorsContent += validationWarnings[i].property + ' ' + validationWarnings[i].warningKey + '<br/>';
      }

      document.getElementById('all-errors').setAttribute('data-content', errorsContent);

      $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });

    }
    else {
      if (document.getElementById('all-erros')){
      document.getElementById('all-errors').removeAttribute('data-content');
      }
    }
  }

  function addTooltipAttributes(element, errorMessage) {
    element.className = 'form-group has-error';
    element.childNodes[1].setAttribute('data-original-title', errorMessage);
    element.childNodes[1].setAttribute('data-placement', 'top');
    element.childNodes[1].setAttribute('data-toggle', 'tooltip')
  }

  function removeTooltipAttributes(elements) {

    console.log("majo",elements.length)
if (elements){
    for(var i=0; i<elements.length;i++) {
      if (elements[i]){
      elements[i].className = 'form-group';
      elements[i].removeAttribute('data-content');
      }

    }
  }
  }




  return {
    updateUi : function () {
      updateUi();
    },
  };
}());

ShadowAnnotationsRegister.addAdditionalUiUpdater(AdditionalUiUpdater);


var Calculation = (function () {
  'use strict';
  var annotationName = 'calculation';


  var isBig = function (obj) {
    /* jshint validthis:true */
    return (!!obj) && (obj.constructor === Big);
  };

  var process = function (sa, property, obj) {

    //console.log('Calculation call.');
    //console.log(obj);
    obj.total = obj.value1 + obj.value2;

    if(obj.address.note.number1 && obj.address.note.number2 && isBig(obj.address.note.number2)) {
      obj.totalNumber = obj.address.note.number1.plus(obj.address.note.number2);
    }

  };

  return {
    process : function (sa, property, obj) {
      return process(sa, property, obj);
    },
    getAnnotationName: function() {
      return annotationName;
    }

  };
}());

ShadowAnnotationsRegister.addProcessor(Calculation);


var GlobalValidator = (function () {
  'use strict';

  var annotationName = 'globalValidation';

  var doValidation = function (sa, property, obj) {

    var totalValue = obj.value1 + obj.value2;

    if(totalValue > 9007199254740900) {
      ValidationErrors.addError({ property: 'error.validation.maximum.limit', errorKey: 'error.validation.maximum.limit', objectKey: obj[ShadowAnnotationsConstants.key] });
    }
    else {
      ValidationErrors.removeError('error.validation.maximum.limit', 'error.validation.maximum.limit');
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


