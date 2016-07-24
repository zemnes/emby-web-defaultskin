define(['focusManager', 'cardBuilder', 'pluginManager', './../skininfo', 'emby-itemscontainer'], function (focusManager, cardBuilder, pluginManager, skinInfo) {

    function loadLatestRecordings(element) {

        return Emby.Models.liveTvRecordings({

            limit: 6,
            IsInProgress: false

        }).then(function (result) {

            var section = element.querySelector('.latestRecordingsSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                showParentTitle: true,
                coverImage: true
            });
        });
    }

    function loadNowPlaying(element) {

        return Emby.Models.liveTvRecommendedPrograms({

            IsAiring: true,
            limit: 9,
            EnableImageTypes: "Primary"

        }).then(function (result) {

            var section = element.querySelector('.nowPlayingSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                coverImage: true
            });
        });
    }

    function loadUpcomingPrograms(section, options) {

        return Emby.Models.liveTvRecommendedPrograms(options).then(function (result) {

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                coverImage: true
            });
        });
    }

    function gotoTvView(tab, parentId) {

        Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'livetv/livetv.html?tab=' + tab));
    }

    function view(element, apiClient, parentId, autoFocus) {
        var self = this;

        if (autoFocus) {
            focusManager.autoFocus(element);
        }

        self.loadData = function () {

            return Promise.all([
                loadLatestRecordings(element),
                loadNowPlaying(element),

                loadUpcomingPrograms(element.querySelector('.upcomingProgramsSection'), {

                    IsAiring: false,
                    HasAired: false,
                    limit: 9,
                    IsMovie: false,
                    IsSports: false,
                    IsKids: false,
                    IsSeries: true

                }),

                loadUpcomingPrograms(element.querySelector('.upcomingMoviesSection'), {

                    IsAiring: false,
                    HasAired: false,
                    limit: 9,
                    IsMovie: true

                }),

                loadUpcomingPrograms(element.querySelector('.upcomingSportsSection'), {

                    IsAiring: false,
                    HasAired: false,
                    limit: 9,
                    IsSports: true

                }),

                loadUpcomingPrograms(element.querySelector('.upcomingKidsSection'), {

                    IsAiring: false,
                    HasAired: false,
                    limit: 9,
                    IsSports: false,
                    IsKids: true
                })
            ]);
        };

        element.querySelector('.guideCard').addEventListener('click', function () {
            Emby.Page.show(Emby.PluginManager.mapRoute(skinInfo.id, 'livetv/guide.html'));
        });

        element.querySelector('.recordingsCard').addEventListener('click', function () {
            gotoTvView('recordings', parentId);
        });

        element.querySelector('.scheduledLiveTvCard').addEventListener('click', function () {
            gotoTvView('scheduled', parentId);
        });

        self.destroy = function () {

        };
    }

    return view;

});