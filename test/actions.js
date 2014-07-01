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

    it('should create a menu on that element', function () {
        // try to apply menu to knockout context
        var source = applyMenu({
            oneItem: function () { }
        });

        // has something, for now no matter what
        expect(!!source.items).toEqual(true);
    });

    it('should open menu on context menu event', function () {
        var source = applyMenu({
            itemOne: function () { },
            itemTwo: ko.observable(false)
        });

        ko.utils.triggerEvent(source.element, 'contextmenu');

        // has two items
        expect(source.items.length).toEqual(2);

        // the element is in the body
        expect(source.element.parentNode).toEqual(document.body);
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
    source.element = element;

    return source;
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