'use strict';

describe('menu', function () {
    var contextMenu = ko.bindingHandlers.contextMenu,
        elements = [];

    // remove that element and clean knockout context
    afterEach(function () {
        elements.forEach(function (item) {
            document.body.removeChild(item);

            // clean knockout context
            ko.cleanNode(item);
        });

        elements = [];
    });

    it('should create a menu on that element', function () {
        // try to apply menu to knockout context
        var source = applyMenu({
            oneItem: function () { }
        });

        // has something, for now no matter what
        expect(!!source.items).toEqual(true);
    });

    it('should have two items created', function () {
        // try to apply menu to knockout context
        var source = applyMenu({
            oneItem: function () { },
            twoItems: ko.observable(false)
        });

        // has something, for now no matter what
        expect(source.items.length).toEqual(2);
    });

    function applyMenu(menu, options, element) {
        if (!element) {
            element = createMenu(options);
        }

        // initialize knockout context
        ko.applyBindings({
            menu: menu
        }, element);

        return contextMenu.getMenuFor(element);
    }

    function createMenu(options) {
        var json = JSON.stringify(options),
            element;

        element = document.createElement('div');
        element.setAttribute('data-bind', 'contextMenu: menu' + (options ? ', ' + json.substring(1, json.length - 1) : ''));
        document.body.appendChild(element);
        elements.push(element);

        return element;
    }
});