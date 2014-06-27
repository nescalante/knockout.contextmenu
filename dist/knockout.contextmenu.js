(function () {
'use strict';

if (typeof ko !== 'undefined' && typeof document !== 'undefined') {
    bindContextMenu(ko, document);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = bindContextMenu;
}

function bindContextMenu(ko, document) {
    var currentMenu,
        currentOnClick = document.onclick,
        elementMapping = [];
    
    document.onclick = function (event) { 
        if (!event.defaultPrevented) {
            if (currentOnClick) {
                currentOnClick(event);
            } 

            hideCurrentMenu();
        }
    };

    ko.bindingHandlers.contextMenu = {
        getMenuFor: function (element, event) {
            var i = 0;

            for (; i < elementMapping.length; i++) {
                if (elementMapping[i].element === element) {
                    return elementMapping[i].get(event);
                }
            }
        },
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var eventsToHandle = valueAccessor() || {},
                allBindings = allBindingsAccessor(),
                defaultClass = allBindings.contextMenuClass || 'context-menu';

            // bind on click? bind on context click?
            if (allBindings.bindMenuOnClick) {
                ko.utils.registerEventHandler(element, 'click', openMenu);
            }
            if (allBindings.bindMenuOnContextMenu === undefined || allBindings.bindMenuOnContextMenu) {
                ko.utils.registerEventHandler(element, 'contextmenu', openMenu);
            }

            elementMapping.push({
                element: element,
                get: getMenu
            });

            function openMenu(event) {
                var menu = getMenu(event).element;

                hideCurrentMenu();

                if (event) {
                    // set location
                    menu.style.top = event.pageY;
                    menu.style.left = event.pageX;

                    event.preventDefault();
                }

                // if not body, put it somewhere
                (document.body || document).appendChild(menu);

                // replace current menu with the recently created
                currentMenu = menu;

                return menu;
            }

            function getMenu(event) {
                var menu,
                    hasChecks = false,
                    items = [],
                    actions = [],
                    result = [];

                for (var eventNameOutsideClosure in eventsToHandle) {
                    pushItem(eventNameOutsideClosure);
                }

                if (items.length) {
                    menu = document.createElement('div');
                    menu.className = defaultClass;

                    // you may need padding to menus that has checks
                    menu.innerHTML = '<ul class="' + (hasChecks ? 'has-checks' : '') + '">' + items.join('') + '</ul>';

                    // map items to actions
                    items.forEach(function (item, index) {
                        ko.utils.registerEventHandler(menu.children[0].children[index], 'click', function (event) {
                            var result = actions[index](viewModel, event);

                            if (!result && event) {
                                event.preventDefault();
                            }
                        });
                    });
                }

                return {
                    element: menu,
                    items: result
                };

                function pushItem(eventName) {
                    var item = getMenuProperties(eventName),
                        classes = [];

                    if (item.isVisible) {
                        hasChecks = hasChecks || item.isBoolean;

                        // set css classes
                        if (item.isChecked) {
                            classes.push('checked');
                        }

                        if (item.isDisabled) {
                            classes.push('disabled');
                        }

                        if (item.isSeparator) {
                            classes.push('separator');
                        }

                        if (item.url) {
                            classes.push('with-url');
                        }

                        items.push('<li class="' + classes.join(' ') + '">' + item.html + '</li>');
                        actions.push(item.action);
                    }

                    result.push(item);
                }
            }

            function getMenuProperties(eventName) {
                var text = '',
                    html = '',
                    item = eventsToHandle[eventName] || {},
                    url = (ko.isObservable(item.url) ? item.url() : item.url),
                    isVisible = item.visible === undefined || item.visible === null ||
                        (ko.isObservable(item.visible) && item.visible()) ||
                        !!item.visible,
                    isChecked = false,
                    isEnabled = !item.disabled
                        (ko.isObservable(item.disabled) && !item.disabled()) ||
                        (ko.isObservable(item.enabled) && item.enabled()) ||
                        !!item.enabled,
                    isBoolean = false,
                    isDisabled = !isEnabled,
                    isSeparator = !!eventsToHandle[eventName].separator;

                if (!isSeparator) {
                    text = ko.isObservable(item.text) ? item.text() : item.text;

                    if (!text) {
                        text = eventName;
                    }

                    if (url) {
                        html = '<a href="' + url + '">' + text + '</a>';
                    }
                    else {
                        html = text;
                    }
                }

                if ((ko.isObservable(item) && typeof item() == "boolean") ||
                    (ko.isObservable(item.action) && typeof item.action() == "boolean")) {
                    isBoolean = true;

                    if ((item.action && item.action()) ||
                        (typeof item == "function" && item())) {
                        isChecked = true;
                    }
                }

                return {
                    html: html,
                    text: text,
                    url: url,
                    isVisible: isVisible,
                    isChecked: isChecked,
                    isEnabled: isEnabled,
                    isDisabled: isDisabled,
                    isBoolean: isBoolean,
                    isSeparator: isSeparator,
                    action: action
                };

                function action(viewModel, event) {
                    var error = eventName + ' option must have an action or an url.';

                    if (isDisabled) {
                        return false;
                    }

                    // check if option is a boolean
                    if (ko.isObservable(item) && typeof item() == "boolean") {
                        item(!item());
                    }

                    // is an object? well, lets check it properties
                    else if (typeof item == 'object') {
                        // check if has an action or if its a separator
                        if (!item.action && !url && !isSeparator) {
                            throw error;
                        }
                        
                        // evaluate action
                        else if (item.action) {
                            if (ko.isObservable(item.action) && typeof item.action() == "boolean") {
                                item.action(!item.action());
                            }
                            else {
                                item.action(viewModel, event);
                            }
                        }
                    }

                    // its not an observable, should be a function
                    else if (typeof item == 'function') {
                        item(viewModel, event);
                    }

                    // nothing to do with this
                    else {
                        throw error;
                    }

                    return true;
                }
            }
        }
    };

    function hideCurrentMenu() {
        if (currentMenu && currentMenu.parentNode) {
            currentMenu.parentNode.removeChild(currentMenu);
        }

        currentMenu = null;
    }
}
})();