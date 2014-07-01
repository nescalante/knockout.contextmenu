'use strict';

var contextMenu = ko.bindingHandlers.contextMenu,
    elements = [];

describe('menu basics', function () {
    // remove elements and clean knockout context
    afterEach(function () {
        elements.forEach(function (item) {
            document.body.removeChild(item);
            ko.cleanNode(item);
        });

        elements = [];
    });

    it('should open menu on context menu event', function () {
        var source = applyMenu({
                oneItem: function () { }
            }),
            element;

        ko.utils.triggerEvent(source.element, 'contextmenu');

        element = contextMenu.getMenuFor(source.element).element;

        // the element is in the body
        expect(element.parentNode).toEqual(document.body);
    });

    it('should open menu on "open" event', function () {
        var source = applyMenu({
                oneItem: function () { }
            }),
            element;

        contextMenu.openMenuFor(source.element);
        element = contextMenu.getMenuFor(source.element).element;

        // the element is in the body
        expect(element.parentNode).toEqual(document.body);
    });
});

function applyMenu(menu, options, element) {
    var source;

    if (!element) {
        element = createMenu(options);
    }

    // initialize knockout context
    ko.applyBindings({
        menu: menu
    }, element);

    source = contextMenu.getMenuFor(element);

    return {
        menu: source,
        element: element
    };
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