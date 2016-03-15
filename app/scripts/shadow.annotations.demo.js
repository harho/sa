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

ShadowAnnotationsRegister.addValidator(CityParamsValidator);

var UiUpdater = (function () {
  'use strict';

  function updateUi() {

    var validationErrors = ValidationErrors.getErrors();

    var bindings = DataBindingContext.getBindings();

    if(validationErrors.length>0) {
      var errorsPerPath = {};
      //console.log(errorsPerPath);
      //console.log('validationErrors.length: '+validationErrors.length);

      for (var i = 0; i < validationErrors.length; i++) {

        if(errorsPerPath[validationErrors[i].property]) {
          errorsPerPath[validationErrors[i].property].errorMessage += ' '+validationErrors[i].property+' '+validationErrors[i].errorKey;
        }
        else {
          errorsPerPath[validationErrors[i].property] = {property: validationErrors[i].property, errorMessage: validationErrors[i].property+' '+validationErrors[i].errorKey };
          errorsPerPath[validationErrors[i].property].objectKey = validationErrors[i].objectKey;
        }
      }

      removeTooltipAttributes(bindings);

      addTooltipAttributes(bindings, errorsPerPath);


      $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });

    }
    else {
      removeTooltipAttributes(bindings);
    }
  }

  function addTooltipAttributes(bindings, errorsPerPath) {

    for (var i in errorsPerPath ) {

      //console.log(errorsPerPath[i].objectKey);

      var uiControl  = bindings[errorsPerPath[i].objectKey+'.'+errorsPerPath[i].property];

      if(uiControl) {

        var formControlDiv = uiControl.parentNode.parentNode;

        formControlDiv.className = 'form-group has-error';

        formControlDiv.childNodes[1].setAttribute('data-original-title', errorsPerPath[i].errorMessage);
        formControlDiv.childNodes[1].setAttribute('data-placement', 'top');
        formControlDiv.childNodes[1].setAttribute('data-toggle', 'tooltip');

      }
    }
  }

  function removeTooltipAttributes(bindings) {

    for (var i in bindings ) {


      var uiControl  = bindings[i];

      if(uiControl) {

        var formControlDiv = uiControl.parentNode.parentNode;

        formControlDiv.className = 'form-group';

        formControlDiv.childNodes[1].removeAttribute('data-original-title');
        formControlDiv.childNodes[1].removeAttribute('data-placement');
        formControlDiv.childNodes[1].removeAttribute('data-toggle');

      }
    }
  }

  return {
    updateUi : function () {
      updateUi();
    },
  };
}());

ShadowAnnotationsRegister.setUiUpdater(UiUpdater);


var AdditionalUiUpdater = (function () {
  'use strict';

  function updateUi() {

    var validationErrors = ValidationErrors.getErrors();

    var bindings = DataBindingContext.getBindings();

    if(validationErrors.length>0) {
      var errorsContent = '';

      for (var i = 0; i < validationErrors.length; i++) {
        errorsContent +=validationErrors[i].property+' '+validationErrors[i].errorKey+'<br/>';
      }

      document.getElementById('all-errors').setAttribute('data-content', errorsContent);

      $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });

    }
    else {

      document.getElementById('all-errors').removeAttribute('data-content');
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

ShadowAnnotationsRegister.setGlobalValidator(GlobalValidator);
