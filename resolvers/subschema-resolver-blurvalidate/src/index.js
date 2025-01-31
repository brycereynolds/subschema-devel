import PropTypes from "subschema-prop-types";

/**
 * Blur validate follows the behaviour
 *
 * if a field has not changed and blurred no validation.
 * if a field has changed and blurred validate.
 * if a validate listener is called validate.
 *
 * @param Clazz
 * @param key
 */
export default {
    resolver: {
        blurValidate: function(Clazz, key) {

            Clazz.contextTypes.valueManager = PropTypes.valueManager;
            Clazz.contextTypes.noValidate = PropTypes.bool;

            Clazz::this.property(key, function blurValidate$prop(validate, key, {validators, path}, {valueManager, noValidate}) {
                validate = typeof validate === 'function' ? validate : validators;
                if (validate == null) {
                    return null;
                }
                let hasChanged = false, hasBlurred = false;

                this._validateListener = valueManager.addValidateListener(path, () => {
                    //after validation it don't matter
                    hasBlurred = true;
                    valueManager.updateErrors(path, validate())
                    }
                ).remove;


                this._validateChangeListeners = valueManager.addListener(path, (val)=> {
                    if (noValidate) {
                        return;
                    }
                    
                    //fires onChange so its true.
                    hasChanged = true;
                    //at some point it has blurred
                    if (hasBlurred) {
                        valueManager.updateErrors(path, validate(val, valueManager));
                    }
                }, this, false).remove;

                //blur event if its changed we will validate.
                return this::function handleBlur(e) {
                    hasBlurred = true;
                    if (hasChanged) {
                        valueManager.updateErrors(path, validate());
                    }
                }

            });

            Clazz::this.unmount(function () {
                this._validateChangeListeners && this._validateChangeListeners();
                this._validateListener && this._validateListener();
            });
        }
    }
};
