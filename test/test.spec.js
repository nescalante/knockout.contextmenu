'use strict';

describe('menu', function () {
    var element, source, menu;

    it('should create an element on the document', function () {
        element = document.createElement('div');
        document.body.appendChild(element);

        expect(element.parentNode).toEqual(document.body);
    });

    it('should create a menu on that element', function () {
        element.setAttribute('data-bind', 'contextMenu: menu');

        menu = {
            simpleFunction: function (model) { console.log(model); },
            someBoolean: ko.observable(true),
            separator: { separator: true },
            isNotVisible: { visible: false, action: function(model) { console.log(model, 'never fired'); } },
            isComposed: { text: 'some text', action: function(model) { console.log(model, 'you fired me!'); } },
            isDisabled: { disabled: true, action: function(model) { console.log(model, 'never fired'); } }
        };

        // initialize knockout context
        ko.applyBindings({
            someKey: 'someValue',
            menu: menu
        }, document.body);

        source = ko.bindingHandlers.contextMenu.getMenuFor(element);

        expect(!!source.items).toEqual(true);
    });
});

