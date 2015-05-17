angular.module('weshare.directives', [])

.directive('resetField', ['$compile', '$timeout', function($compile, $timeout) {
    return {
    require: 'ngModel',
    link: function(scope, el, attrs, ctrl) {

        // limit to input element of specific types
        var inputTypes = /text|search|tel|url|email|password/i;
        if (el[0].nodeName === "INPUT") {
            if (!inputTypes.test(attrs.type)) {
                throw new Error("Invalid input type for resetField: " + attrs.type);
            }
        } else if (el[0].nodeName !== "TEXTAREA") {
            throw new Error("resetField is limited to input and textarea elements");
        }

        // compiled reset icon template
        var template = $compile('<i ng-show="enabled" ng-click="reset()" class="icon ion-android-close reset-field-icon"></i>')(scope);
        el.addClass("reset-field");
        el.after(template);

        scope.reset = function() {
            console.log('ye');
            ctrl.$setViewValue(null);
            ctrl.$render();
            $timeout(function() {
                el[0].focus();
            }, 0, false);
            scope.enabled = false;
        };

        el.bind('input', function() {
            scope.enabled = !ctrl.$isEmpty(el.val());
        })
        .bind('focus', function() {
            $timeout(function() { //Timeout just in case someone else is listening to focus and alters model
                scope.enabled = !ctrl.$isEmpty(el.val());
                scope.$apply();
            }, 0, false);
        })
       .bind('blur', function() {
            $timeout(function() {
                scope.enabled = false;
                scope.$apply();
            }, 0, false);
        });
    }
    };
}]);
