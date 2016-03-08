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

            skinSettings.enableAntiSpoliers(view.querySelector('.selectEnableEpisodeAntiSpoliers').getValue());
            skinSettings.dimUnselectedPosters(view.querySelector('.selectDimPosters').getValue());

            skinSettings.apply();
        });

        function renderSettings() {

            focusManager.autoFocus(view);

            view.querySelector('.selectEnableEpisodeAntiSpoliers').setValue(skinSettings.enableAntiSpoliers());
            view.querySelector('.selectDimPosters').setValue(skinSettings.dimUnselectedPosters());
        }
    }

});