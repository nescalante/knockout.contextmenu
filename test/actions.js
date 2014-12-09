'use strict';

var contextMenu = ko.bindingHandlers.contextMenu;
var elements = [];

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
        var source = getBasicMenu();
        var element;

        ko.utils.triggerEvent(source.element, 'contextmenu');
        element = ko.utils.contextMenu.getMenuFor(source.element).element;

        // the element is in the body
        expect(element.parentNode).toEqual(document.body);

        ko.utils.triggerEvent(document, 'click');

        // the element was removed
        expect(element.parentNode).toBeNull();
    });

    it('should open menu on "open" event', function () {
        var source = getBasicMenu();
        var menu = ko.utils.contextMenu.openMenuFor(source.element);

        // the element is in the body
        expect(menu.element.parentNode).toEqual(document.body);

        menu.hide();

        // the element was removed
        expect(menu.element.parentNode).toBeNull();
    });

    it('should run action on click', function () {
        var source = applyMenu({
                'do something': function () { applied = true; }
            });
        var applied = false;
        var menu = ko.utils.contextMenu.openMenuFor(source.element);
        var item = menu.element.children[0].children[0];

        // just to ensure
        expect(item.innerHTML).toBe('do something');

        // at this point, item var should be the <li> element that refers to the menu item
        ko.utils.triggerEvent(item, 'click');

        // the menu item was clicked
        expect(applied).toBe(true);

        // the menu was removed
        expect(menu.element.parentNode).toBeNull();
    });

    it('should ensure alternative way action binding', function () {
        var source = applyMenu({
                doSomething: {
                    action: function () { applied = true; },
                    text: 'some title'
                }
            });
        var applied = false;
        var menu = ko.utils.contextMenu.openMenuFor(source.element);
        var item = menu.element.children[0].children[0];

        // just to ensure
        expect(item.innerHTML).toBe('some title');

        // at this point, item var should be the <li> element that refers to the menu item
        ko.utils.triggerEvent(item, 'click');

        // the menu item was clicked
        expect(applied).toBe(true);

        // the menu was removed
        expect(menu.element.parentNode).toBeNull();
    });

    it('should change item text when binding an observable', function () {
        var someObservable = ko.observable('title1');
        var source = applyMenu({
                doSomething: {
                    action: Function.prototype,
                    text: someObservable
                }
            });
        var menu = ko.utils.contextMenu.openMenuFor(source.element);
        var item = menu.element.children[0].children[0];

        // ensure item title, do click just to close it and then change observable value
        expect(item.innerHTML).toBe('title1');
        ko.utils.triggerEvent(item, 'click');
        someObservable('title2');

        // well, reload it
        menu = ko.utils.contextMenu.openMenuFor(source.element);
        item = menu.element.children[0].children[0];

        // the menu item should be changed
        expect(item.innerHTML).toBe('title2');
    });

    it('should support observableArrays', function () {
        var someObservable = ko.observable('title1');
        var items = ko.observableArray([{ text: 'action1', action: Function.prototype }, { text: 'action2', action: Function.prototype }]);
        var source = applyMenu(items);
        var menu = ko.utils.contextMenu.openMenuFor(source.element);
        var itemsCount = menu.element.children[0].children.length;

        // check items length, there should be only 2
        expect(itemsCount).toBe(2);

        // add something else
        items.push({ text: 'action3', action: Function.prototype });

        // reopen menu, and get count
        menu = ko.utils.contextMenu.openMenuFor(source.element);
        itemsCount = menu.element.children[0].children.length;

        // the menu item should be changed
        expect(itemsCount).toBe(3);
    });

    function getBasicMenu() {
        return applyMenu({
            oneItem: Function.prototype
        });
    }
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
    var json = JSON.stringify(options);
    var element;

    element = document.createElement('div');
    element.setAttribute('data-bind', 'contextMenu: menu' + (options ? ', ' + json.substring(1, json.length - 1) : ''));
    document.body.appendChild(element);
    elements.push(element);

    return element;
}
