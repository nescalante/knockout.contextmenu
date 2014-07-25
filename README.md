# knockout.contextmenu [![Build Status](https://travis-ci.org/nescalante/knockout.contextmenu.svg?branch=master)](https://travis-ci.org/nescalante/knockout.contextmenu)

> Contextual menu, anywhere you need it

![Such example](https://raw.github.com/nescalante/knockout.contextmenu/master/example/menu.png)

# Install

```shell
npm install knockout.contextmenu --save

bower install knockout.contextmenu
```

# Usage

To bind a context menu to an element:

```html
<td data-bind="contextMenu: { 'Option 1': $root.rootMethod, 'Option 2': itemMethod, 'Option 3': anotherMethod }">
```

You can also bind a boolean observable to the context menu, that will work as a 'check':

```json
contextMenu: { 
    Boolean: someObservableBoolean, 
    'One method': $root.test 
}
```

You can also set dynamic 'text' and 'visible' values binding an object with the following values instead of a method:

Option     | Description
-----------|-----------------------------------------------
`url`      | Direct access to an URL.
`text`     | Set menu text.
`visible`  | Show/hide item (result must be boolean).
`action`   | Item method, mandatory if not url defined.
`disabled` | Disable menu item.

Example:

```json
contextMenu: { 
    'Complex item': { text: $root.someObservableText(), visible: someMethod() == '1', action: $root.someAction }, 
    'One method': $root.test
}
```

To create a separator between two menus, just create an object with the property `separator` with `true`:

```json
contextMenu: { 
    'Some item': methodOne,
    'Separator': { separator: true, visible: someMethod() },
    'Just another item': methodTwo
}
```
