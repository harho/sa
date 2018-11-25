it('should map routes to controllers', function() {
    module('test1App');
    inject(function($route) {
      expect($route.routes['/about'].controller).toBe('AboutCtrl');
    });
  });