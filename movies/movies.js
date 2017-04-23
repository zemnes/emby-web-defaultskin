define(['loading', 'backdrop', 'connectionManager', 'scroller', 'globalize', 'alphaPicker', 'userSettings', 'require', './../components/focushandler', 'emby-itemscontainer', 'emby-tabs', 'emby-button', 'emby-scroller'], function (loading, backdrop, connectionManager, scroller, globalize, alphaPicker, userSettings, require, focusHandler) {
    'use strict';

    function trySelectValue(instance, view, value) {

        var card;

        // If it's the symbol just pick the first card
        if (value === '#') {

            card = view.querySelector('.card');

            if (card) {
                instance.scroller.toStart(card, false);
                return;
            }
        }

        card = view.querySelector('.card[data-prefix^=\'' + value + '\']');

        if (card) {
            instance.scroller.toStart(card, false);
            return;
        }

        // go to the previous letter
        var values = instance.alphaPicker.values();
        var index = values.indexOf(value);

        if (index < values.length - 2) {
            trySelectValue(instance, view, values[index + 1]);
        } else {
            var all = view.querySelectorAll('.card');
            card = all.length ? all[all.length - 1] : null;

            if (card) {
                instance.scroller.toStart(card, false);
            }
        }
    }

    function initAlphaPicker(instance, view) {

        var itemsContainer = view.querySelector('.movieItems');

        instance.alphaPicker = new alphaPicker({
            element: view.querySelector('.alphaPicker'),
            itemsContainer: itemsContainer,
            itemClass: 'card'
        });

        instance.alphaPicker.on('alphavaluechanged', function () {
            var value = instance.alphaPicker.value();
            trySelectValue(instance, itemsContainer, value);
        });
    }

    function getDefaultTabIndex(folderId) {

        switch (userSettings.get('landing-' + folderId)) {

            case 'movies':
                return 1;
            case 'favorites':
                return 3;
            case 'collections':
                return 4;
            case 'genres':
                return 5;
            default:
                return 0;
        }
    }

    return function (view, params) {

        var self = this;

        var tabControllers = [];
        var currentTabController;

        function getTabController(index, callback) {

            if (index == null) {
                throw new Error('index cannot be null');
            }

            var depends = [];

            switch (index) {

                case 0:
                    depends.push('./suggestions');
                    break;
                case 1:
                    depends.push('./moviestab');
                    break;
                case 2:
                    depends.push('./moviestab');
                    break;
                case 3:
                    depends.push('./moviestab');
                    break;
                case 4:
                    depends.push('./collections');
                    break;
                case 5:
                    depends.push('./genres');
                    break;
                case 6:
                    depends.push('./years');
                    break;
                default:
                    break;
            }

            require(depends, function (controllerFactory) {

                var controller = tabControllers[index];
                if (!controller) {

                    var tabContent = view.querySelector('.tabContent[data-index=\'' + index + '\']');
                    controller = new controllerFactory(tabContent, params, view);
                    if (index === 2) {
                        controller.mode = 'unwatched';
                    }
                    else if (index === 3) {
                        controller.mode = 'favorites';
                    }
                    tabControllers[index] = controller;
                }

                callback(controller);
            });
        }

        self.scroller = view.querySelector('.scrollFrameY');

        var alphaPickerContainer = view.querySelector('.alphaPickerContainer');
        var viewTabs = view.querySelector('.viewTabs');
        var initialTabIndex = parseInt(params.tab || getDefaultTabIndex(params.parentId));

        var isViewRestored;

        function preLoadTab(index) {

            if (index === 1) {
                alphaPickerContainer.classList.remove('hide');
            } else {
                alphaPickerContainer.classList.add('hide');
            }

            getTabController(index, function (controller) {
                if (controller.onBeforeShow) {

                    var refresh = isViewRestored !== true || !controller.refreshed;

                    controller.onBeforeShow({
                        refresh: refresh
                    });

                    controller.refreshed = true;
                }
            });
        }

        function loadTab(index) {

            getTabController(index, function (controller) {

                controller.onShow({
                    autoFocus: initialTabIndex != null
                });
                initialTabIndex = null;
                currentTabController = controller;
            });
        }

        initAlphaPicker(this, view);

        viewTabs.addEventListener('beforetabchange', function (e) {
            preLoadTab(parseInt(e.detail.selectedTabIndex));
        });

        viewTabs.addEventListener('tabchange', function (e) {

            var newIndex = parseInt(e.detail.selectedTabIndex);
            var previousTabController = tabControllers[newIndex];
            if (previousTabController && previousTabController.onHide) {
                previousTabController.onHide();
            }

            loadTab(newIndex);
        });

        view.addEventListener('viewbeforehide', function (e) {

            if (currentTabController && currentTabController.onHide) {
                currentTabController.onHide();
            }
        });

        view.addEventListener('viewbeforeshow', function (e) {
            isViewRestored = e.detail.isRestored;

            if (initialTabIndex == null) {
                viewTabs.triggerBeforeTabChange();
            }
        });

        view.addEventListener('viewshow', function (e) {

            isViewRestored = e.detail.isRestored;

            Emby.Page.setTitle('');
            backdrop.clear();

            if (initialTabIndex != null) {
                viewTabs.selectedIndex(initialTabIndex);
            } else {
                viewTabs.triggerTabChange();
            }
        });

        view.addEventListener('viewdestroy', function (e) {

            tabControllers.forEach(function (t) {
                if (t.destroy) {
                    t.destroy();
                }
            });

            self.scroller = null;

            if (self.focusHandler) {
                self.focusHandler.destroy();
                self.focusHandler = null;
            }

            if (self.alphaPicker) {
                self.alphaPicker.destroy();
                self.alphaPicker = null;
            }
        });
    };

});