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

    it('should open menu on context menu event and close it on document click', function () {
        var source = applyMenu({
                oneItem: function () { }
            }),
            element;

        ko.utils.triggerEvent(source.element, 'contextmenu');

        element = ko.utils.contextMenu.getMenuFor(source.element).element;

        // the element is in the body
        expect(element.parentNode).toEqual(document.body);

        ko.utils.triggerEvent(document, 'click');

        // the element was removed
        expect(element.parentNode).toBe(null);        
    });

    it('should open menu on "open" event', function () {
        var source = applyMenu({
                oneItem: function () { }
            }),
            element,
            menu;

        menu = ko.utils.contextMenu.openMenuFor(source.element);
        element = menu.element;

        // the element is in the body
        expect(element.parentNode).toEqual(document.body);

        menu.hide();

        // the element was removed
        expect(element.parentNode).toBe(null);
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

    source = ko.utils.contextMenu.getMenuFor(element);

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