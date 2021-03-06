// dependencies
define(['utils/utils'], function(Utils) {

/**
 *  This class creates/wraps a default html select field as backbone class.
 */
var View = Backbone.View.extend({
    // options
    optionsDefault : {
        id          : '',
        cls         : 'ui-select',
        error_text  : 'No data available',
        empty_text  : 'No selection',
        visible     : true,
        wait        : false,
        multiple    : false,
        searchable  : true,
        optional    : false
    },

    // initialize
    initialize : function(options) {
        // configure options
        this.options = Utils.merge(options, this.optionsDefault);

        // create new element
        this.setElement(this._template(this.options));

        // link elements
        this.$select = this.$el.find('.select');
        this.$icon = this.$el.find('.icon');
        this.$button = this.$el.find('.button');

        // configure multiple
        if (this.options.multiple) {
            this.$el.addClass('ui-select-multiple');
            this.$select.prop('multiple', true);
            this.$button.remove();
        }

        // refresh
        this.update(this.options.data);

        // set initial value
        if (this.options.value !== undefined) {
            this.value(this.options.value);
        }

        // show/hide
        if (!this.options.visible) {
            this.hide();
        }

        // wait
        if (this.options.wait) {
            this.wait();
        } else {
            this.show();
        }

        // add change event. fires only on user activity
        var self = this;
        this.$select.on('change', function() {
            self._change();
        });

        // add change event. fires on trigger
        this.on('change', function() {
            self._change();
        });
    },

    /** Return/Set current selection
    */
    value : function (new_value) {
        // set new value
        if (new_value !== undefined) {
            if (new_value === null) {
                new_value = '__null__';
            }
            if (this.exists(new_value) || this.options.multiple) {
                this.$select.val(new_value);
                if (this.$select.select2) {
                    this.$select.select2('val', new_value);
                }
            }
        }

        // validate and return value
        return this._getValue();
    },

    /** Return the first select option
    */
    first: function() {
        var options = this.$select.find('option').first();
        if (options.length > 0) {
            return options.val();
        } else {
            return null;
        }
    },

    /** Return the label/text of the current selection
    */
    text : function () {
        return this.$select.find('option:selected').text();
    },

    /** Show the select field
    */
    show: function() {
        this.unwait();
        this.$select.show();
        this.$el.show();
    },

    /** Hide the select field
    */
    hide: function() {
        this.$el.hide();
    },

    /** Show a spinner indicating that the select options are currently loaded
    */
    wait: function() {
        this.$icon.removeClass();
        this.$icon.addClass('fa fa-spinner fa-spin');
    },

    /** Hide spinner indicating that the request has been completed
    */
    unwait: function() {
        this.$icon.removeClass();
        this.$icon.addClass('fa fa-caret-down');
    },

    /** Returns true if the field is disabled
    */
    disabled: function() {
        return this.$select.is(':disabled');
    },

    /** Enable the select field
    */
    enable: function() {
        this.$select.prop('disabled', false);
    },

    /** Disable the select field
    */
    disable: function() {
        this.$select.prop('disabled', true);
    },

    /** Add a select option
    */
    add: function(options) {
        // add options
        this.$select.append(this._templateOption(options));
        
        // refresh
        this._refresh();
    },

    /** Delete a select option
    */
    del: function(value) {
        // remove option
        this.$select.find('option[value=' + value + ']').remove();
        this.$select.trigger('change');

        // refresh
        this._refresh();
    },

    /** Update select options
    */
    update: function(options) {
        // backup current value
        var current = this._getValue();

        // remove all options
        this.$select.find('option').remove();

        // add optional field
        if (!this.options.multiple && this.options.optional) {
            this.$select.append(this._templateOption({value : '__null__', label : this.options.empty_text}));
        }

        // add new options
        for (var key in options) {
            this.$select.append(this._templateOption(options[key]));
        }

        // refresh
        this._refresh();

        // update to searchable field (in this case select2)
        if (this.options.searchable) {
            this.$select.select2('destroy');
            this.$select.select2();
        }

        // set previous value
        this.value(current);

        // check if any value was set
        if (this._getValue() === null) {
            this.value(this.first());
        }
    },

    /** Set the custom onchange callback function
    */
    setOnChange: function(callback) {
        this.options.onchange = callback;
    },

    /** Check if a value is an existing option
    */
    exists: function(value) {
        return this.$select.find('option[value="' + value + '"]').length > 0;
    },

    /** Trigger custom onchange callback
    */
    _change: function() {
        if (this.options.onchange) {
            this.options.onchange(this._getValue());
        }
    },

    /** Validate */
    _getValue: function() {
        var val = this.$select.val();
        if (!Utils.validate(val)) {
            return null;
        }
        return val;
    },

    /** Refresh the select view
    */
    _refresh: function() {
        // count remaining entries
        var remaining = this.$select.find('option').length;
        if (remaining == 0) {
            // disable select field
            this.disable();

            // create placeholder
            this.$select.empty();
            this.$select.append(this._templateOption({value : '__null__', label : this.options.error_text}));
        } else {
            // enable select field
            this.enable();
        }
    },

    /** Template for select options
    */
    _templateOption: function(options) {
        return '<option value="' + options.value + '">' + options.label + '</option>';
    },

    /** Template for select view
    */
    _template: function(options) {
        return  '<div id="' + options.id + '" class="' + options.cls + '">' +
                    '<select id="' + options.id + '_select" class="select"/>' +
                    '<div class="button">' +
                        '<i class="icon"/>' +
                    '</div>' +
                '</div>';
    }
});

return {
    View: View
}

});
