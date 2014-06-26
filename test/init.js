(function () {
    var menu = {
        simpleFunction: function (model) { alert(model.someKey); },
        someBoolean: ko.observable(false),
        separator: { separator: true },
        isNotVisible: { visible: false, action: function(model) { alert('never fired'); } }
    };

    ko.applyBindings({
        someKey: 'someValue',
        menu: menu
    });
})();