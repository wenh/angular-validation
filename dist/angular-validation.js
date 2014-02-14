(function () {
    angular.module('validation', ['validation.provider', 'validation.directive']);
}).call(this);
(function () {
    angular.module('validation.provider', [])
        .provider('$validation', function () {


            var $injector,
                $scope,
                $http,
                $q,
                _this = this;


            /**
             * Setup the provider
             * @param injector
             */
            var setup = function (injector) {
                $injector = injector;
                $scope = $injector.get('$rootScope');
                $http = $injector.get('$http');
                $q = $injector.get('$q');
            };


            /**
             * Define validation type RegExp
             * @type {{required: RegExp, url: RegExp, email: RegExp}}
             */
            var expression = {
                required: /^.+$/,
                url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
                email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
                number: /^\d+$/
            };


            /**
             * default error, success message
             * @type {{required: {error: string, success: string}, url: {error: string, success: string}, email: {error: string, success: string}, number: {error: string, success: string}}}
             */
            var defaultMsg = {
                required: {
                    error: 'This should be Required!!',
                    success: 'It\'s Required'
                },
                url: {
                    error: 'This should be Url',
                    success: 'It\'s Url'
                },
                email: {
                    error: 'This should be Email',
                    success: 'It\'s Email'
                },
                number: {
                    error: 'This should be Number',
                    success: 'It\'s Number'
                }
            };


            /**
             * Allow user to set a custom Expression, do remember set the default message using setDefaultMsg
             * @param obj
             */
            this.setExpression = function (obj) {
                angular.extend(expression, obj);
            };


            /**
             * Get the Expression
             * @param exprs
             * @returns {*}
             */
            this.getExpression = function (exprs) {
                return expression[exprs];
            };


            /**
             * Allow user to set default message
             * @param obj
             */
            this.setDefaultMsg = function (obj) {
                angular.extend(defaultMsg, obj);
            };


            /**
             * Get the Default Message
             * @param msg
             * @returns {*}
             */
            this.getDefaultMsg = function (msg) {
                return defaultMsg[msg];
            };


            /**
             * Override the errorHTML function
             * @param func
             */
            this.setErrorHTML = function (func) {
                if (func.constructor !== Function) {
                    return;
                }

                _this.getErrorHTML = func;
            };


            /**
             * Invalid message HTML, here's the default
             * @param message
             * @returns {string}
             */
            this.getErrorHTML = function (message) {
                return '<p class="validation-invalid">' + message + '</p>';
            };


            /**
             * Override the successHTML function
             * @param func
             */
            this.setSuccessHTML = function (func) {
                if (func.constructor !== Function) {
                    return;
                }

                _this.getSuccessHTML = func;
            };


            /**
             * Valid message HTML, here's the default
             * @param message
             * @returns {string}
             */
            this.getSuccessHTML = function (message) {
                return '<p class="validation-valid">' + message + '</p>';
            };


            /**
             * Show or Hide Validation message
             * showSuccessMsg / hideSuccessMsg
             * showErrorMsg / hideErrorMsg
             * showMsg / hideMsg (both success and error)
             */
            this.showOrHideMsg = {
                success: {
                    show: function () {
                        $scope.$broadcast('noValidationMessage', { success: false });
                    },
                    hide: function () {
                        $scope.$broadcast('noValidationMessage', { success: true });
                    }
                },
                error: {
                    show: function () {
                        $scope.$broadcast('noValidationMessage', { error: false });
                    },
                    hide: function () {
                        $scope.$broadcast('noValidationMessage', { error: true });
                    }
                },
                both: {
                    show: function () {
                        $scope.$broadcast('noValidationMessage', { both: false });
                    },
                    hide: function () {
                        $scope.$broadcast('noValidationMessage', { both: true });
                    }
                }
            };


            /**
             * Check form valid, return true
             * checkValid(Form): Check the specific form(Form) valid from angular `$valid`
             * @param form
             * @returns {boolean}
             */
            this.checkValid = function (form) {
                if (form.$valid === undefined) {
                    return false;
                }
                return (form && form.$valid === true);
            };


            /**
             * Validate the form when click submit, when `validMethod = submit`
             * @param form
             * @returns {promise|*}
             */
            this.validate = function (form) {

                for (var k in form) {
                    if (form[k].hasOwnProperty('$dirty')) {
                        $scope.$broadcast(k + 'submit');
                    }
                }

                var deferred = $q.defer();
                deferred.promise.success = function (fn) {
                    deferred.promise.then(function (value) {
                        fn(value);
                    });
                    return deferred.promise;
                };

                deferred.promise.error = function (fn) {
                    deferred.promise.then(null, function (value) {
                        fn(value);
                    });
                    return deferred.promise;
                };

                if (_this.checkValid(form)) {
                    deferred.resolve('success');
                }
                else {
                    deferred.reject('error');
                }

                return deferred.promise;
            };


            /**
             * reset the specific form
             * @param form
             */
            this.reset = function (form) {
                for (var k in form) {
                    if (form[k].hasOwnProperty('$dirty')) {
                        form[k].$setViewValue(null);
                        form[k].$setPristine();
                        form[k].$setValidity(form[k].$name, false);
                        form[k].$render();
                        $scope.$broadcast(k + 'reset');
                    }
                }
            };


            /**
             * $get
             * @returns {{setErrorHTML: *, getErrorHTML: Function, setSuccessHTML: *, getSuccessHTML: Function, setExpression: *, getExpression: Function, setDefaultMsg: *, getDefaultMsg: Function, checkValid: Function, validate: Function, reset: Function}}
             */
            this.$get = function ($injector) {
                setup($injector);
                return {
                    setErrorHTML: this.setErrorHTML,
                    getErrorHTML: this.getErrorHTML,
                    setSuccessHTML: this.setSuccessHTML,
                    getSuccessHTML: this.getSuccessHTML,
                    setExpression: this.setExpression,
                    getExpression: this.getExpression,
                    setDefaultMsg: this.setDefaultMsg,
                    getDefaultMsg: this.getDefaultMsg,
                    showMsg: this.showOrHideMsg.both.show,
                    showSuccessMsg: this.showOrHideMsg.success.show,
                    showErrorMsg: this.showOrHideMsg.error.show,
                    hideMsg: this.showOrHideMsg.both.hide,
                    hideSuccessMsg: this.showOrHideMsg.success.hide,
                    hideErrorMsg: this.showOrHideMsg.error.hide,
                    checkValid: this.checkValid,
                    validate: this.validate,
                    reset: this.reset
                };
            };

        });
}).call(this);
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