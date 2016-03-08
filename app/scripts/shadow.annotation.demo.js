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
      var errorsContent = '';
      var errorsPerPath = {};
      //console.log(errorsPerPath);
      //console.log('validationErrors.length: '+validationErrors.length);

      for (var i = 0; i < validationErrors.length; i++) {

        errorsContent +=validationErrors[i].property+' '+validationErrors[i].errorKey+'<br/>';

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

      document.getElementById('all-errors').setAttribute('data-content', errorsContent);

      $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });

    }
    else {

      removeTooltipAttributes(bindings);

      document.getElementById('all-errors').removeAttribute('data-content');
    }
  }

  function addTooltipAttributes(bindings, errorsPerPath) {

    for (var i in errorsPerPath ) {

      //console.log(errorsPerPath[i].objectKey);

      var formControlDiv = bindings[errorsPerPath[i].objectKey+'.'+errorsPerPath[i].property].parentNode.parentNode;
      formControlDiv.className='form-group has-error';

      formControlDiv.childNodes[1].setAttribute('data-original-title', errorsPerPath[i].errorMessage);
      formControlDiv.childNodes[1].setAttribute('data-placement', 'top');
      formControlDiv.childNodes[1].setAttribute('data-toggle', 'tooltip');

    }
  }

  function removeTooltipAttributes(bindings) {
    for (var i in bindings ) {

      var formControlDiv = bindings[i].parentNode.parentNode;

      formControlDiv.className='form-group';

      formControlDiv.childNodes[1].removeAttribute('data-original-title');
      formControlDiv.childNodes[1].removeAttribute('data-placement');
      formControlDiv.childNodes[1].removeAttribute('data-toggle');
    }
  }

  return {
    updateUi : function () {
      updateUi();
    },
  };
}());

ShadowAnnotationsRegister.setUiUpdater(UiUpdater);
