define(['loading', './../skinsettings', 'focusManager'], function (loading, skinSettings, focusManager) {

    return function (view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(Globalize.translate('SkinName'));

            loading.hide();

            if (!isRestored) {

                renderSettings();
            }
        });

        view.addEventListener('viewbeforehide', function (e) {

            skinSettings.enableAntiSpoliers(view.querySelector('.selectEnableEpisodeAntiSpoliers').value);
            skinSettings.dimUnselectedPosters(view.querySelector('.selectDimPosters').value);
            skinSettings.enableMovieDetailScenes(view.querySelector('.chkMovieScenes').checked);
            skinSettings.enableEpisodeDetailScenes(view.querySelector('.chkEpisodeScenes').checked);
            skinSettings.enableOtherDetailScenes(view.querySelector('.chkOtherScenes').checked);

            skinSettings.apply();
        });

        function renderSettings() {

            focusManager.autoFocus(view);

            view.querySelector('.selectEnableEpisodeAntiSpoliers').value = skinSettings.enableAntiSpoliers();
            view.querySelector('.selectDimPosters').value = skinSettings.dimUnselectedPosters();
            view.querySelector('.chkMovieScenes').checked = skinSettings.enableMovieDetailScenes();
            view.querySelector('.chkEpisodeScenes').checked = skinSettings.enableEpisodeDetailScenes();
            view.querySelector('.chkOtherScenes').checked = skinSettings.enableOtherDetailScenes();
        }
    }

});