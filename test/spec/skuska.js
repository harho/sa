describe('Test Set Value to active fields', function () {
		
	beforeEach(angular.mock.module('test1App'));

	var $controller;

	beforeEach(angular.mock.inject(function(_$controller_){
	  $controller = _$controller_;
	}));

	describe('NG model', function () {
		it('I can set value to active field ', function () {
			var $scope = {};
			var controller = $controller('AboutCtrl', { $scope: $scope });
			$scope.name = 'ahoj'
			
			expect($scope.name).toBe('ahoj');
		});	
	});

	describe('NG model 2', function () {
		it('I can set value to active field ', function () {
			
				 var data = {
					name: ''
				};
			

			var saModel = {
				sa$name: {
					notEmptyValidation:{}
				}
			}

			ShadowAnnotations.link('data', data, saModel, true);
			ShadowAnnotations.doValidation(data);

			console.log(ValidationErrors.getErrors());

			expect(ValidationErrors.getErrors().length).toBe(1);
		});	
	});

	describe('NG model 3', function () {
		it('I can set value to active field ', function () {
			
				 var data = {
					email: ''
				};
			

			var saModel = {
				sa$email: {
					notEmptyValidation:{},
					emailValidation: {}
				}
			}
			// ShadowAnnotationsRegister.setUiUpdater(null);

			ValidationErrors.removeAllErrors();
			ShadowAnnotations.link('data', data, saModel, true);
			ShadowAnnotations.doValidation(data);
			console.log(data);
			// console.log(ValidationErrors.getErrors());

			expect(ValidationErrors.getErrors().length).toBe(2);
			 data.sg_email("stevo.simko@gmail.com")
			 expect(ValidationErrors.getErrors().length).toBe(0);

			expect()
		});	
	});

});