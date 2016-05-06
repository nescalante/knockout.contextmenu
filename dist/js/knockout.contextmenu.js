/* knockout.contextmenu v0.4.4
   Nicolás Escalante - nlante@gmail.com
   Issues: https://github.com/nescalante/knockout.contextmenu/issues
   License: MIT */

(function (undefined) {
'use strict';

if (typeof ko !== undefined + '' && typeof document !== undefined + '') {
  bindContextMenu(ko, document);
}

if (typeof module !== undefined + '' && module.exports) {
  module.exports = bindContextMenu;
}

function bindContextMenu(ko, document) {
  var currentMenu;
  var elementMapping = [];
  var utils = ko.utils;
  var registerEvent = utils.registerEventHandler;
  var isObservable = ko.isObservable;

  registerEvent(document, 'click', function (event) {
    var button = event.which || event.button;
    if (!event.defaultPrevented && button < 2) {
      hideCurrentMenu();
    }
  });

  utils.contextMenu = {
    getMenuFor: function (element, event) {
      var result = getMapping(element);

      if (result) {
        return result.get(event);
      }
    },

    openMenuFor: function (element, event) {
      var result = getMapping(element);

      if (result) {
        return result.open(event);
      }
    },

  };

  ko.bindingHandlers.contextMenu = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
      var eventsToHandle = valueAccessor() || {};
      var allBindings = allBindingsAccessor();
      var defaultClass = allBindings.contextMenuClass || 'context-menu';
      var activeElement;

      // bind on click? bind on context click?
      if (allBindings.bindMenuOnClick) {
        registerEvent(element, 'click', openMenu);
      }

      if (allBindings.bindMenuOnContextMenu === undefined || allBindings.bindMenuOnContextMenu) {
        registerEvent(element, 'contextmenu', openMenu);
      }

      elementMapping.push({
        element: element,
        get: function () {
          return activeElement;
        },

        open: openMenu,
        hide: function () {
          if (activeElement) {
            activeElement.hide();
          }
        },
      });

      function mouseX(evt) {
        if (evt.pageX) {
          return evt.pageX;
        } else if (evt.clientX) {
          return evt.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
        } else {
          return null;
        }
      }

      function mouseY(evt) {
        if (evt.pageY) {
          return evt.pageY;
        } else if (evt.clientY) {
          return evt.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
        } else {
          return null;
        }
      }

      function openMenu(event) {
        var menuElement;

        activeElement = getMenu(event);
        menuElement = activeElement.element;

        hideCurrentMenu();

        if (menuElement) {
          // make visibility hidden, then add to DOM so that we can get the height/width of the menu
          menuElement.style.visibility = 'hidden';
          (document.body || document).appendChild(menuElement);

          // set location
          if (event) {
            var bottomOfViewport = window.innerHeight + window.pageYOffset;
            var rightOfViewport = window.innerWidth + window.pageXOffset;

            if (mouseY(event) + menuElement.offsetHeight > bottomOfViewport) {
              menuElement.style.top = 1 * (bottomOfViewport - menuElement.offsetHeight - 10) + 'px';
            } else {
              menuElement.style.top = mouseY(event) + 'px';
            }

            if (mouseX(event) + menuElement.offsetWidth > rightOfViewport) {
              menuElement.style.left = 1 * (rightOfViewport - menuElement.offsetWidth - 10) + 'px';
            } else {
              menuElement.style.left = mouseX(event) + 'px';
            }

            event.preventDefault();
            event.stopPropagation();
          } else {
            menuElement.style.top = (element.offsetTop + element.offsetHeight) + 'px';
            menuElement.style.left = (element.offsetLeft + element.offsetWidth) + 'px';
          }

          // now set to visible
          menuElement.style.visibility = '';
        }

        // replace current menu with the recently created
        currentMenu = menuElement;

        return activeElement;
      }

      function getMenu(event) {
        var menu;
        var hasChecks = false;
        var elements = [];
        var actions = [];
        var items = [];
        var props = Object.keys(
          ko.isObservable(eventsToHandle) ?
          eventsToHandle() :
          eventsToHandle
        );

        props.forEach(function (eventNameOutsideClosure) {
          pushItem(eventNameOutsideClosure);
        });

        if (elements.length) {
          menu = document.createElement('div');
          menu.className = defaultClass;

          // you may need padding to menus that has checks
          menu.innerHTML = '<ul class="' + (hasChecks ? 'has-checks' : '') + '">' +
            elements.join('') +
            '</ul>';

          // map items to actions
          elements.forEach(function (item, index) {
            registerEvent(menu.children[0].children[index], 'click', function (event) {
              var result = actions[index](viewModel, event);

              if (!result && event) {
                event.preventDefault();
              }
            });
          });
        }

        return {
          element: menu,
          items: items,
          open: openMenu,
          hide: function () {
            if (menu && menu.parentNode) {
              menu.parentNode.removeChild(menu);
            }

            currentMenu = null;
          },
        };

        function pushItem(eventName) {
          var item = getMenuProperties(eventName);
          var classes = [];
          var id = '';
          var liHtml;

          if (item.isVisible) {
            hasChecks = hasChecks || item.isBoolean;

            if (item.id) {
              id = item.id;
            }

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

            liHtml = '<li ' + (id ? ('id="' + id + '" ') : '') +
              ' class="' + classes.join(' ') + '">' +
              item.html +
              '</li>';

            elements.push(liHtml);
            actions.push(item.action);
          }

          items.push(item);
        }
      }

      function getMenuProperties(eventName) {
        var text = '';
        var html = '';
        var currentEvent = ko.isObservable(eventsToHandle) ?
          eventsToHandle()[eventName] :
          eventsToHandle[eventName];
        var item = currentEvent || {};
        var id = item.id;
        var url = (isObservable(item.url) ? item.url() : item.url);
        var isVisible = item.visible === undefined || item.visible === null ||
            (isObservable(item.visible) && item.visible()) ||
            (!isObservable(item.visible) && !!item.visible);
        var isChecked = false;
        var isEnabled = !item.disabled ||
            (isObservable(item.disabled) && !item.disabled()) ||
            (isObservable(item.enabled) && item.enabled()) ||
            (!isObservable(item.enabled) && !!item.enabled);
        var isBoolean = false;
        var isDisabled = !isEnabled;
        var isSeparator = !!currentEvent.separator;

        if (!isSeparator) {
          text = isObservable(item.text) ? item.text() : item.text;

          if (!text) {
            text = eventName;
          }

          if (url) {
            html = '<a href="' + url + '">' + text + '</a>';
          } else {
            html = text;
          }
        }

        if ((isObservable(item) && typeof item() === 'boolean') ||
          (isObservable(item.action) && typeof item.action() === 'boolean')) {
          isBoolean = true;

          if ((item.action && item.action()) ||
            (typeof item === 'function' && item())) {
            isChecked = true;
          }
        }

        return {
          html: html,
          text: text,
          url: url,
          id: id,
          isVisible: isVisible,
          isChecked: isChecked,
          isEnabled: isEnabled,
          isDisabled: isDisabled,
          isBoolean: isBoolean,
          isSeparator: isSeparator,
          action: action,
        };

        function action(viewModel, event) {
          var error = eventName + ' option must have an action or an url.';

          if (isDisabled) {
            return false;
          }

          // check if option is a boolean
          if (isObservable(item) && typeof item() === 'boolean') {
            item(!item());
          }

          // is an object? well, lets check it properties
          else if (typeof item === 'object') {
            // check if has an action or if its a separator
            if (!item.action && !url && !isSeparator) {
              throw error;
            }

            // evaluate action
            else if (item.action) {
              if (isObservable(item.action) && typeof item.action() === 'boolean') {
                item.action(!item.action());
              } else {
                item.action(viewModel, event);
              }
            }
          }

          // its not an observable, should be a function
          else if (typeof item === 'function') {
            item(viewModel, event);
          }

          // nothing to do with this
          else {
            throw error;
          }

          return true;
        }
      }
    },
  };

  function hideCurrentMenu() {
    if (currentMenu && currentMenu.parentNode) {
      currentMenu.parentNode.removeChild(currentMenu);
    }

    currentMenu = null;
  }

  function getMapping(element) {
    var i = 0;

    for (; i < elementMapping.length; i++) {
      if (elementMapping[i].element === element) {
        return elementMapping[i];
      }
    }
  }
}
})();
