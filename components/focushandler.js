define(['imageLoader', 'itemHelper', 'backdrop', 'mediaInfo', 'focusManager', 'scrollHelper', 'browser', 'layoutManager', 'dom'],
    function (imageLoader, itemHelper, backdrop, mediaInfo, focusManager, scrollHelper, browser, layoutManager, dom) {
        'use strict';

        var enableAnimations = browser.animate || browser.edge;

        function fadeIn(elem) {

            var keyframes = [
              { opacity: '0', offset: 0 },
              { opacity: '1', offset: 1 }];
            var timing = { duration: 140, iterations: 1, easing: 'ease-out' };
            return elem.animate(keyframes, timing);
        }

        function focusHandler(options) {

            var self = this;

            var parent = options.parent;
            var focusedElement;
            var isHorizontal = options.scroller ? options.scroller.options.horizontal : options.horizontal;
            var lastFocus = 0;

            if (layoutManager.tv) {
                dom.addEventListener(parent, 'focus', onFocusIn, {
                    capture: true,
                    passive: true
                });
                dom.addEventListener(parent, 'blur', onFocusOut, {
                    capture: true,
                    passive: true
                });
            }

            var selectedItemInfoElement = options.selectedItemInfoElement;
            var selectedIndexElement = options.selectedIndexElement;
            var selectedItemPanel;

            function onFocusIn(e) {

                var focused = e.target;
                focusedElement = focused;

                if (focused) {

                    if (selectedIndexElement) {
                        var index = focused.getAttribute('data-index');
                        if (index) {
                            selectedIndexElement.innerHTML = 1 + parseInt(index);
                        }
                    }

                    if (layoutManager.tv) {
                        if (options.scroller) {
                            var now = new Date().getTime();

                            var animate = (now - lastFocus) > 50;
                            options.scroller.toCenter(focused, !animate);
                            lastFocus = now;
                        } else if (options.scrollElement) {
                            scrollHelper.toCenter(options.scrollElement, focused, isHorizontal);
                        }
                    }
                    startSelectedInfoTimer();
                }
            }

            function onFocusOut(e) {

                clearSelectedInfoTimer();

                if (selectedItemInfoElement && selectedItemInfoElementHasContent) {
                    requestAnimationFrame(clearSelectedItemInfo);
                }

                var focused = focusedElement;
                focusedElement = null;
            }

            var selectedItemInfoTimeout;
            function clearSelectedInfoTimer() {
                if (selectedItemInfoTimeout) {
                    clearTimeout(selectedItemInfoTimeout);
                }
            }
            function startSelectedInfoTimer() {

                if (selectedItemInfoElement) {
                    clearSelectedInfoTimer();
                    selectedItemInfoTimeout = setTimeout(onSelectedInfoTimeout, 500);
                }
            }

            function onSelectedInfoTimeout() {
                var focused = focusedElement;
                if (focused) {
                    setSelectedItemInfo(focused);
                }
            }

            function setSelectedItemInfo(card) {

                if (options.enableBackdrops !== false || selectedItemInfoElement) {

                    var id = card.getAttribute('data-id');

                    if (!id) {
                        return;
                    }

                    Emby.Models.item(id).then(function (item) {

                        if (options.enableBackdrops) {
                            // The focus backdrops are too slow on xbox
                            if (!browser.slow && !browser.edge) {
                                //backdrop.setBackdrop(item);
                            }
                        }
                        setSelectedInfo(card, item);
                    });
                }
            }

            var selectedItemInfoElementHasContent;
            function setSelectedInfo(card, item) {

                if (!selectedItemInfoElement) {
                    return;
                }

                var html = '';

                var logoImageUrl = Emby.Models.logoImageUrl(item, {
                });

                if (logoImageUrl) {

                    html += '<div class="selectedItemInfoLogo" style="background-image:url(\'' + logoImageUrl + '\');"></div>';
                }

                var mediaInfoHtml = item.Type === 'Program' ?
                    mediaInfo.getSecondaryMediaInfoHtml(item) :
                    mediaInfo.getPrimaryMediaInfoHtml(item);

                html += '<div class="selectedItemInfoDetails">';
                html += '<div class="selectedItemName">';

                if (item.AlbumArtist) {
                    html += item.AlbumArtist + " - ";
                }

                if (item.IsSeries) {
                    html += item.Name;
                } else {
                    html += itemHelper.getDisplayName(item);
                }
                html += '</div>';
                if (mediaInfoHtml) {
                    html += '<div class="selectedItemMediaInfo">';
                    html += mediaInfoHtml;
                    html += '</div>';
                }
                html += '</div>';

                //if (item.Overview && item.Type != 'MusicAlbum' && item.Type != 'MusicArtist') {
                //    html += '<div class="overview">';
                //    html += item.Overview;
                //    html += '</div>';
                //}

                selectedItemInfoElement.innerHTML = html;
                selectedItemInfoElementHasContent = true;

                var rect = card.getBoundingClientRect();
                var left = Math.min(rect.left, dom.getWindowSize().innerWidth * 0.8);
                selectedItemInfoElement.style.left = (Math.max(left, 70)) + 'px';

                if (html && selectedItemInfoElement.animate) {
                    fadeIn(selectedItemInfoElement, 1);
                }
            }

            function clearSelectedItemInfo() {

                selectedItemInfoElement.innerHTML = '';
                selectedItemInfoElementHasContent = false;
            }

            self.destroy = function () {

                dom.removeEventListener(parent, 'focus', onFocusIn, {
                    capture: true,
                    passive: true
                });
                dom.removeEventListener(parent, 'blur', onFocusOut, {
                    capture: true,
                    passive: true
                });

                if (selectedItemInfoElement) {
                    selectedItemInfoElement.innerHTML = '';
                }
            };
        }

        return focusHandler;
    });