ko.bindingHandlers.contextmenu = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var eventsToHandle = valueAccessor() || {},
            contextmenu = $('<div class="contextmenu"><ul></ul></div>'),
            allBindings = allBindingsAccessor();

        // close context menu on body click
        $("body").click(function () { contextmenu.hide(); });

        for (var eventNameOutsideClosure in eventsToHandle) {
            $("<li>")
                .html(eventsToHandle[eventNameOutsideClosure].separator == true ? "" : eventNameOutsideClosure)
                .addClass(eventsToHandle[eventNameOutsideClosure].separator == true ? "separator" : "")
                .click(function () {
                    var insideEvent = valueAccessor()[$(this).data("name")];

                    // check if option is a boolean
                    if (ko.isObservable(insideEvent) && typeof insideEvent() == "boolean") {
                        insideEvent(!insideEvent());
                    }
                    else if (typeof insideEvent == 'object') {
                        // check if has an action or if its a separator
                        if (insideEvent.action === undefined && insideEvent.separator != true) {
                            throw $(this).data("name") + ' option must have an action.'
                        }
                        // evaluate action
                        else if (insideEvent.action) {
                            if (ko.isObservable(insideEvent.action) && typeof insideEvent.action() == "boolean") {
                                insideEvent.action(!insideEvent.action());
                            }
                            else {
                                insideEvent.action(viewModel, contextmenu.data("event"));
                            }
                        }
                    }
                    else {
                        insideEvent(viewModel, contextmenu.data("event"));
                    }
                })
                .data("name", eventNameOutsideClosure) // store event name into "li" element
                .appendTo(contextmenu.find("ul"));
        }

        // append menu to html
        if (element.tagName.toLowerCase() == 'tr') {
            contextmenu.appendTo($("body"));
            contextmenu.data("appendedToBody", true);
        }
        else if (element.tagName.toLowerCase() == 'input') {
            contextmenu.appendTo(element.parentNode);
            contextmenu.data("appendedToBody", true);
        }
        else {
            contextmenu.appendTo(element);
            contextmenu.data("appendedToBody", false);
        }

        element.contextmenu = contextmenu;

        var openMenu = function (event) {
            // hide other context menu opened
            $(".contextmenu").hide();

            var hasChecks = false;

            // set checked booleans
            $("li", contextmenu).each(function () {
                var insideEvent = valueAccessor()[$(this).data("name")];
                if (ko.isObservable(insideEvent) && typeof insideEvent() == "boolean") {
                    hasChecks = true;

                    if (insideEvent()) {
                        $(this).addClass("checked");
                    }
                    else {
                        $(this).removeClass("checked");
                    }
                }
                else if (ko.isObservable(insideEvent.action) && typeof insideEvent.action() == "boolean") {
                    hasChecks = true;

                    if (insideEvent.action()) {
                        $(this).addClass("checked");
                    }
                    else {
                        $(this).removeClass("checked");
                    }
                }
            });

            // add padding to menus that have checks
            if (hasChecks) {
                contextmenu.addClass("hasChecks");
            }

            contextmenu
                .data("event", event)
                .show();

            // if menu floats into body, set location
            if (contextmenu.data("appendedToBody")) {
                contextmenu
                    .css({ top: event.pageY, left: event.pageX })
            }

            return false;
        };

        ko.utils.registerEventHandler(element, "contextmenu", openMenu);
        if (allBindings.bindMenuOnClick === true) {
            ko.utils.registerEventHandler(element, "click", openMenu);
        }

    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        // set checked booleans
        $("li", element.contextmenu).each(function () {
            var insideElement = valueAccessor()[$(this).data("name")],
                type = typeof insideElement;

            if (type == 'object') {
                // change text
                if (insideElement.text !== undefined) {
                    $(this).html(insideElement.text);
                }

                // make it visible
                if (insideElement.visible !== undefined) {
                    if (insideElement.visible) {
                        $(this).show();
                    }
                    else {
                        $(this).hide();
                    }
                }
            }
        });
    }
};
