define(['cardBuilder', 'imageLoader', 'loading', 'connectionManager', 'apphost', 'layoutManager', 'scrollHelper', 'emby-itemscontainer'], function (cardBuilder, imageLoader, loading, connectionManager, appHost, layoutManager, scrollHelper) {
    'use strict';

    function enableScrollX() {
        return !layoutManager.desktop;
    }

    function LiveTvSuggestionsTab(view, params) {
        this.view = view;
        this.params = params;
        this.apiClient = connectionManager.getApiClient(params.serverId);

        initLayout(view);
    }

    function initLayout(view) {

        var containers = view.querySelectorAll('.verticalSection');

        for (var i = 0, length = containers.length; i < length; i++) {

            var section = containers[i];

            if (enableScrollX()) {
                var elem = section.querySelector('.itemsContainer');
                elem.classList.add('hiddenScrollX');
                elem.classList.add('padded-left');
                elem.classList.remove('vertical-wrap');

                section.querySelector('h2').classList.add('padded-left');

                if (layoutManager.tv) {
                    scrollHelper.centerFocus.on(elem, true);
                }
            }
        }

        if (!enableScrollX()) {
            view.classList.add('padded-left');
            view.classList.add('padded-right');
        }
    }

    function getPortraitShape() {
        return enableScrollX() ? 'overflowPortrait' : 'portrait';
    }

    function renderItems(view, items, sectionClass, overlayButton, cardOptions) {

        var supportsImageAnalysis = appHost.supports('imageanalysis');
        var cardLayout = supportsImageAnalysis;

        cardOptions = cardOptions || {};

        var html = cardBuilder.getCardsHtml(Object.assign({
            items: items,
            preferThumb: true,
            inheritThumb: false,
            shape: (enableScrollX() ? 'overflowBackdrop' : 'backdrop'),
            showParentTitleOrTitle: true,
            showTitle: false,
            centerText: !cardLayout,
            coverImage: true,
            overlayText: false,
            lazy: true,
            overlayMoreButton: overlayButton != 'play' && !cardLayout && !layoutManager.tv,
            overlayPlayButton: overlayButton == 'play' && !layoutManager.tv,
            allowBottomPadding: !enableScrollX(),
            showAirTime: true,
            showAirDateTime: true,
            showChannelName: true,
            vibrant: true,
            cardLayout: cardLayout

        }, cardOptions));

        var section = view.querySelector('.' + sectionClass);

        if (items.length) {
            section.classList.remove('hide');
        } else {
            section.classList.add('hide');
        }

        var elem = section.querySelector('.itemsContainer');

        elem.innerHTML = html;
        imageLoader.lazyChildren(elem);
    }

    LiveTvSuggestionsTab.prototype.onBeforeShow = function () {

        var apiClient = this.apiClient;
        var promises = [];

        var limit = enableScrollX() ? 18 : 12;

        // on now
        promises.push(apiClient.getLiveTvRecommendedPrograms({

            UserId: apiClient.getCurrentUserId(),
            IsAiring: true,
            Limit: limit,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Thumb,Backdrop",
            EnableTotalRecordCount: false,
            Fields: "ChannelInfo,PrimaryImageAspectRatio"

        }));

        // upcoming programs
        promises.push(apiClient.getLiveTvRecommendedPrograms({

            UserId: apiClient.getCurrentUserId(),
            IsAiring: false,
            HasAired: false,
            Limit: limit,
            IsMovie: false,
            IsSports: false,
            IsKids: false,
            IsSeries: true,
            EnableTotalRecordCount: false,
            Fields: "ChannelInfo,PrimaryImageAspectRatio",
            EnableImageTypes: "Primary,Thumb"
        }));

        promises.push(apiClient.getLiveTvRecommendedPrograms({

            userId: apiClient.getCurrentUserId(),
            IsAiring: false,
            HasAired: false,
            Limit: limit,
            IsMovie: true,
            EnableTotalRecordCount: false,
            Fields: "ChannelInfo",
            EnableImageTypes: "Primary,Thumb"

        }));

        promises.push(apiClient.getLiveTvRecommendedPrograms({

            userId: apiClient.getCurrentUserId(),
            IsAiring: false,
            HasAired: false,
            Limit: limit,
            IsSports: true,
            EnableTotalRecordCount: false,
            Fields: "ChannelInfo",
            EnableImageTypes: "Primary,Thumb"

        }));

        promises.push(apiClient.getLiveTvRecommendedPrograms({

            userId: apiClient.getCurrentUserId(),
            IsAiring: false,
            HasAired: false,
            Limit: limit,
            IsKids: true,
            EnableTotalRecordCount: false,
            Fields: "ChannelInfo",
            EnableImageTypes: "Primary,Thumb"

        }));

        this.promises = promises;
    };

    LiveTvSuggestionsTab.prototype.onShow = function () {

        var promises = this.promises;
        if (!promises) {
            return;
        }

        var view = this.view;

        promises[0].then(function (result) {
            renderItems(view, result.Items, 'activePrograms');
        });

        promises[1].then(function (result) {
            renderItems(view, result.Items, 'upcomingPrograms');
        });

        promises[2].then(function (result) {
            renderItems(view, result.Items, 'upcomingTvMovies', null, {
                shape: getPortraitShape(),
                preferThumb: null
            });
        });

        promises[3].then(function (result) {
            renderItems(view, result.Items, 'upcomingSports');
        });

        promises[4].then(function (result) {
            renderItems(view, result.Items, 'upcomingKids');
        });

    };

    LiveTvSuggestionsTab.prototype.onHide = function () {

    };

    LiveTvSuggestionsTab.prototype.destroy = function () {

        this.view = null;
        this.params = null;
        this.apiClient = null;
        this.promises = null;
    };

    return LiveTvSuggestionsTab;
});