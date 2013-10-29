ko.bindingHandlers.contextmenu = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var eventsToHandle = valueAccessor() || {},
            allBindings = allBindingsAccessor();

        var openMenu = function (event) {
            var removeAndUnbind = function () {
                $(".contextmenu").remove();
                $(document.body).unbind("click.contextmenu");
            };

            // hide other context menu opened
            removeAndUnbind();

            // close context menu on body click
            $(document.body).bind("click.contextmenu", removeAndUnbind);

            var contextmenu = $('<div class="contextmenu"><ul></ul></div>'),
                hasChecks = false;

            for (var eventNameOutsideClosure in eventsToHandle) {
                var insideEvent = valueAccessor()[eventNameOutsideClosure] || {},
                    html = eventsToHandle[eventNameOutsideClosure].separator == true ? "" :
                        ko.isObservable(insideEvent.text) ? insideEvent.text() :
                        insideEvent.text ? insideEvent.text :
                        eventNameOutsideClosure,
                    url = eventsToHandle[eventNameOutsideClosure].url,
                    isChecked = false,
                    visible = insideEvent.visible == null ||
                        (ko.isObservable(insideEvent.visible) && insideEvent.visible()) ||
                        insideEvent.visible == true,
                    enabled = insideEvent.disabled == null ||
                        (ko.isObservable(insideEvent.disabled) && !insideEvent.disabled()) ||
                        insideEvent.disabled == false;

                if (visible) {
                    if (eventsToHandle[eventNameOutsideClosure].url) {
                        html = "<a href=\"" + (ko.isObservable(url) ? url() : url) + "\">" + html + "</a>";
                    }

                    if ((ko.isObservable(insideEvent) && typeof insideEvent() == "boolean") ||
                        (ko.isObservable(insideEvent.action) && typeof insideEvent.action() == "boolean")) {
                        hasChecks = true;

                        if ((insideEvent.action && insideEvent.action()) ||
                            (typeof insideEvent == "function" && insideEvent())) {
                            isChecked = true;
                        }
                    }

                    $("<li>")
                        .html(html)
                        .addClass(eventsToHandle[eventNameOutsideClosure].separator == true ? "separator" : "")
                        .addClass(url ? "with-url" : "")
                        .addClass(isChecked ? "checked" : "")
                        .addClass(!enabled ? "disabled" : "")
                        .data("event", insideEvent)
                        .click(function () {
                            var insideEvent = $(this).data("event"),
                                enabled = insideEvent.disabled == null ||
                                    (ko.isObservable(insideEvent.disabled) && !insideEvent.disabled()) ||
                                    insideEvent.disabled == false;

                            if (enabled) {
                                // check if option is a boolean
                                if (ko.isObservable(insideEvent) && typeof insideEvent() == "boolean") {
                                    insideEvent(!insideEvent());
                                }
                                else if (typeof insideEvent == 'object') {
                                    // check if has an action or if its a separator
                                    if (insideEvent.action === undefined && insideEvent.url === undefined && insideEvent.separator != true) {
                                        throw eventNameOutsideClosure + ' option must have an action or an url.';
                                    }
                                        // evaluate action
                                    else if (insideEvent.action) {
                                        if (ko.isObservable(insideEvent.action) && typeof insideEvent.action() == "boolean") {
                                            insideEvent.action(!insideEvent.action());
                                        }
                                        else {
                                            var result = insideEvent.action(viewModel, event);

                                            if (url) {
                                                return result;
                                            }
                                        }
                                    }
                                }
                                else if (typeof insideEvent == 'function') {
                                    insideEvent(viewModel, event);
                                }
                                else {
                                    throw eventNameOutsideClosure + ' option must have an action or an url.'
                                }
                            }
                            else {
                                return false;
                            }
                        })
                        .appendTo(contextmenu.find("ul"));
                }
            }

            // add padding to menus that have checks
            if (hasChecks) {
                contextmenu.addClass("hasChecks");
            }

            // set location
            if (contextmenu.find("li").length > 0) {
                contextmenu
                    .css({ top: event.pageY, left: event.pageX })
                    .appendTo(document.body)
                    .show();

                return false;
            }
        };

        if (allBindings.bindMenuOnClick === true) {
            ko.utils.registerEventHandler(element, "click", openMenu);
        } else {
            ko.utils.registerEventHandler(element, "contextmenu", openMenu);
        }
    }
};
