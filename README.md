knockout.contextmenu
====================

To bind a context menu to an element:

    <td data-bind="contextmenu: { 'Option 1': $root.rootMethod, 'Option 2': itemMethod, 'Option 3': anotherMethod }">

You can also bind a boolean observable to the context menu, that will work as a 'check':

    contextmenu: { 
        Boolean: someObservableBoolean, 
        'One method': $root.test 
    }

You can also set dynamic 'text' and 'visible' values binding an object with the following values instead of a method:

*url* (optional): Direct access to an URL.

*text* (optional): Set menu text.

*visible* (optional): Show/hide item (result must be boolean).

*action* (mandatory if not url defined): Item method.

*disabled* (optional): Disable menu item.

Example:

    contextmenu: { 
        'Complex item': { text: $root.someObservableText(), visible: someMethod() == '1', action: $root.someAction }, 
        'One method': $root.test
    }

To create a separator between two menus, just create an object with the property `separator` with `true`:

    contextmenu: { 
        'Some item': methodOne,
        'Separator': { separator: true, visible: someMethod() },
        'Just another item': methodTwo
    }
