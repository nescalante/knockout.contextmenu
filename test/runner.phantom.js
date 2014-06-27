var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open('runner.html', function(status) {
    var exitCode = 0;

    if (status !== 'success') {
        console.log('Unable to access network');
        
        exitCode = 1;
    }
    else {
        page.evaluate(function () {
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

            var result = ko.bindingHandlers.contextMenu.getMenuFor(document.body.children[0]);

            console.log(result.items[0].action("test"));
        });
    }

    phantom.exit(exitCode);
});