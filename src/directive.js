(function () {
    angular.module('validation.directive', ['validation.provider'])
        .directive('validator', ['$injector', function ($injector) {

            var validClass = 'val-valid',
                invalidClass = 'val-invalid';

            var $validationProvider = $injector.get('$validation'),
                $q = $injector.get('$q'),
                $timeout = $injector.get('$timeout');

            /**
             * Do this function iff validation valid
             * @param element
             * @param validMessage
             * @param validation
             * @param callback
             * @param ctrl
             * @returns {}
             */
            var validFunc = function (element, validMessage, validation, callback, ctrl) {
                var el = element.next();

                if (!el.hasClass(validClass)) {
                    el.addClass(validClass);
                }

                if (el.hasClass(invalidClass)) {
                    el.removeClass(invalidClass);
                }


                el.html($validationProvider.getSuccessHTML(validMessage || $validationProvider.getDefaultMsg(validation).success));
                ctrl.$setValidity(ctrl.$name, true);
                if (callback) callback();
            };


            /**
             * Do this function iff validation invalid
             * @param element
             * @param validMessage
             * @param validation
             * @param callback
             * @param ctrl
             * @returns {}
             */
            var invalidFunc = function (element, validMessage, validation, callback, ctrl) {
                var el = element.next();

                if (!el.hasClass(invalidClass)) {
                    el.addClass(invalidClass);
                }

                if (el.hasClass(validClass)) {
                    el.removeClass(validClass);
                }

                el.html($validationProvider.getErrorHTML(validMessage || $validationProvider.getDefaultMsg(validation).error));
                ctrl.$setValidity(ctrl.$name, false);
                if (callback) callback();
            };


            /**
             * Check Validation with Function or RegExp
             * @param scope
             * @param element
             * @param attrs
             * @param ctrl
             * @param validation
             * @param value
             * @returns {}
             */
            var checkValidation = function (scope, element, attrs, ctrl, validation, value) {
                var successMessage = validation + 'SuccessMessage',
                    errorMessage = validation + 'ErrorMessage',
                    expressionType = $validationProvider.getExpression(validation).constructor,
                    valid = {
                        success: function () {
                            validFunc(element, attrs[successMessage], validation, scope.validCallback(), ctrl);
                        },
                        error: function () {
                            invalidFunc(element, attrs[errorMessage], validation, scope.invalidCallback(), ctrl);
                        }
                    };

                // Check with Function
                if (expressionType === Function) {
                    return $q.all([$validationProvider.getExpression(validation)(value)])
                        .then(function (data) {
                            if (data && data.length > 0 && data[0]) {
                                return valid.success();
                            } else {
                                return valid.error();
                            }
                        }, function () {
                            return valid.error();
                        });
                }
                // Check with RegExp
                else if (expressionType === RegExp) {
                    return $validationProvider.getExpression(validation).test(value) ? valid.success() : valid.error();
                } else {
                    return valid.error();
                }
            };


            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    model: '=ngModel',
                    validCallback: '&',
                    invalidCallback: '&'
                },
                link: function (scope, element, attrs, ctrl) {
                    /**
                     * validator
                     * @type {*|Array}
                     *
                     * Convert user input String to Array
                     */
                    var validator = attrs.validator.split(',');


                    /**
                     * Valid/Invalid Message
                     */
                    element.after('<span></span>');


                    /**
                     * Check Every validator
                     */
                    validator.forEach(function (validation) {

                        /**
                         * Set Validity to false when Initial
                         */
                        ctrl.$setValidity(ctrl.$name, false);


                        /**
                         * Click submit form, check the validity when submit
                         */
                        scope.$on(ctrl.$name + 'submit', function () {
                            var value = element[0].value;
                            checkValidation(scope, element, attrs, ctrl, validation, value);
                        });


                        /**
                         * Reset the validation for specific form
                         */
                        scope.$on(ctrl.$name + 'reset', function () {
                            element.next().html('');
                        });


                        /**
                         * Validate blur method
                         */
                        if (attrs.validMethod === 'blur') {
                            element.bind('blur', function () {
                                var value = element[0].value;
                                scope.$apply(function () {
                                    checkValidation(scope, element, attrs, ctrl, validation, value);
                                });
                            });

                            return;
                        }


                        /**
                         * Validate submit method
                         */
                        if (attrs.validMethod === 'submit') {
                            return;
                        }

                        /**
                         * Validate watch method
                         * This is the default method
                         */
                        scope.$watch('model', function (value) {
                            /**
                             * dirty, pristine, viewValue control here
                             */
                            if (ctrl.$pristine && ctrl.$viewValue) {
                                // has value when initial
                                ctrl.$setViewValue(ctrl.$viewValue);
                            } else if (ctrl.$pristine) {
                                // Don't validate form when the input is clean(pristine)
                                element.next().html('');
                                return;
                            }
                            checkValidation(scope, element, attrs, ctrl, validation, value);
                        });
                    });


                    /**
                     * show/hide success Message
                     * show/hide error Message
                     * show/hide validation Message (both success and error)
                     * $on - allow user to show/hide by using $provider `showMsg` `hideMsg`
                     */
                    $timeout(function () {

                        scope.$on('noValidationMessage', function (event, data) {
                            /**
                             * data parameter
                             * - (bool) success
                             * - (bool) error
                             * - (bool) both
                             */
                            if (data.hasOwnProperty('success')) {
                                attrs.$set('noSuccessMessage', data.success);
                            }

                            if (data.hasOwnProperty('error')) {
                                attrs.$set('noErrorMessage', data.error);
                            }

                            if (data.hasOwnProperty('both')) {
                                attrs.$set('noValidationMessage', data.both);
                            }
                        });

                        attrs.$observe('noSuccessMessage', function (value) {
                            var el = element.next();

                            if (attrs.noValidationMessage == "false" || attrs.noValidationMessage == false) {
                                if (ctrl.$valid && !ctrl.$invalid && el.hasClass(validClass)) {
                                    if (value == "true" || value == true) {
                                        el.css('display', 'none');
                                    } else if (value == "false" || value == false) {
                                        el.css('display', 'block');
                                    } else {
                                        attrs.noSuccessMessage = 'false';
                                    }
                                }
                            }
                        });

                        attrs.$observe('noErrorMessage', function (value) {
                            var el = element.next();

                            if (attrs.noValidationMessage == "false" || attrs.noValidationMessage == false) {
                                if (ctrl.$invalid && !ctrl.$valid && el.hasClass(invalidClass)) {
                                    if (value == "true" || value == true) {
                                        el.css('display', 'none');
                                    } else if (value == "false" || value == false) {
                                        el.css('display', 'block');
                                    } else {
                                        attrs.noErrorMessage = 'false';
                                    }
                                }
                            }
                        });

                        attrs.$observe('noValidationMessage', function (value) {
                            var el = element.next();

                            if (value == "true" || value == true) {
                                el.css('display', 'none');
                            } else if (value == "false" || value == false) {
                                el.css('display', 'block');
                            } else {
                                attrs.noValidationMessage = 'false';
                            }
                        });

                    });
                }
            };
        }]);
}).call(this);