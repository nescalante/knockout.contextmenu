(function () {
'use strict';

var currentMenu;

if (typeof ko !== 'undefined' && typeof document !== 'undefined') {
    bindContextMenu(ko, document);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = bindContextMenu;
}

function bindContextMenu(ko, document) {
    ko.bindingHandlers.contextMenu = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var eventsToHandle = valueAccessor() || {},
                allBindings = allBindingsAccessor(),
                currentOnClick = document.onclick,
                defaultClass = allBindings.contextMenuClass || 'context-menu';

            // bind on click? bind on context click?
            if (allBindings.bindMenuOnClick) {
                ko.utils.registerEventHandler(element, 'click', openMenu);
            } else {
                ko.utils.registerEventHandler(element, 'contextmenu', openMenu);
            }

            document.onclick = function (event) { 
                currentOnClick && currentOnClick(event);
                hideCurrentMenu();
            };

            function hideCurrentMenu() {
                if (currentMenu && currentMenu.parentNode) {
                    currentMenu.parentNode.removeChild(currentMenu);
                }

                currentMenu = null;
            }

            function openMenu(event) {
                var menu = getMenu(event);

                if (event) {
                    // set location
                    menu.style.top = event.pageY;
                    menu.style.left = event.pageX;
                }

                // if not body, put it somewhere
                (document.body || document).appendChild(menu);

                // prevent default
                event.preventDefault();
            }
                
            function getMenu(event) {
                var menu,
                    hasChecks = false,
                    items = [],
                    actions = [];

                for (var eventNameOutsideClosure in eventsToHandle) {
                    (function (eventName) {
                        var item = getMenuProperties(eventName),
                            classes = [];

                        if (item.isVisible) {
                            hasChecks = hasChecks || item.isBoolean;

                            // set css classes
                            item.isChecked && classes.push('checked');
                            item.isDisabled && classes.push('disabled');
                            item.isSeparator && classes.push('separator');
                            item.url && classes.push('with-url');

                            items.push('<li class="' + classes.join(' ') + '">' + item.text + '</li>');
                            actions.push(item.action);
                        }
                    })(eventNameOutsideClosure);
                }

                if (items.length) {
                    menu = document.createElement('div');
                    menu.className = defaultClass;

                    // you may need padding to menus that has checks
                    menu.innerHTML = '<ul class="' + (hasChecks ? 'has-checks' : '') + '">' + items.join('') + '</ul>';

                    // map items to actions
                    items.forEach(function (item, index) {
                        ko.utils.registerEventHandler(menu.children[0].children[index], 'click', function (event) {
                            actions[index](viewModel, event);
                        });
                    });
                }

                currentMenu = menu;

                return menu;
            }

            function getMenuProperties(eventName) {
                var text = '',
                    item = eventsToHandle[eventName] || {},
                    url = (ko.isObservable(item.url) ? item.url() : item.url),
                    isVisible = item.visible == null ||
                        (ko.isObservable(item.visible) && item.visible()) ||
                        !!item.visible,
                    isChecked = false,
                    isEnabled = item.disabled == null ||
                        (ko.isObservable(item.disabled) && !item.disabled()) ||
                        item.disabled == false ||
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
                        text = '<a href="' + url + '">' + text + '</a>';
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

                        return item();
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

                                return item.action();
                            }
                            else {
                                return item.action(viewModel, event);
                            }
                        }
                    }

                    // its not an observable, should be a function
                    else if (typeof item == 'function') {
                        return item(viewModel, event);
                    }

                    // nothing to do with this
                    else {
                        throw error;
                    }
                }
            }
        }
    };
}
})();