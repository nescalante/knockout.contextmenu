'use strict';

describe('menu', function () {
    var element, source, menu;

    // create a new menu on each test
    beforeEach(function () {
        // create a new element
        element = document.createElement('div');
        element.setAttribute('data-bind', 'contextMenu: menu');

        document.body.appendChild(element);

        expect(element.parentNode).toEqual(document.body);
    });

    // remove that element and clean knockout context
    afterEach(function () {
        // clean knockout context
        ko.cleanNode(document.body);
        document.body.removeChild(element);
    });

    it('should create a menu on that element', function () {
        menu = {
            oneItem: function () { },
        };

        // try to apply menu to knockout context
        applyMenu(menu);

        // has something, for now no matter what
        expect(!!source.items).toEqual(true);
    });

    function applyMenu(menu) {
        // initialize knockout context
        ko.applyBindings({
            someKey: 'someValue',
            menu: menu
        }, document.body);

        source = ko.bindingHandlers.contextMenu.getMenuFor(element);
    }
});