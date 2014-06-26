(function () {
    var menu = {
        simpleFunction: function (model) { console.log(model); },
        someBoolean: ko.observable(true),
        separator: { separator: true },
        isNotVisible: { visible: false, action: function(model) { console.log(model, 'never fired'); } },
        isComposed: { text: 'some text', action: function(model) { console.log(model, 'you fired me!'); } },
        isDisabled: { disabled: true, action: function(model) { console.log(model, 'never fired'); } }
    };

    ko.applyBindings({
        someKey: 'someValue',
        menu: menu
    });
})();