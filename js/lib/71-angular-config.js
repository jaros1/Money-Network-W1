// angularJS app
angular.module('MoneyNetworkW1', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'ngDialog', 'vxWamp']);

angular.module('MoneyNetworkW1')

    .config(['$routeProvider', function ($routeProvider) {

        var pgm = 'routeProvider: ';

        var set_z_path = ['$location', function ($location) {
            var pgm = 'routeProvider.set_z_path: ';
            var a_path, a_search, z_path, key;
            a_path = $location.path();
            a_search = $location.search();
            z_path = "?path=" + a_path;
            for (key in a_search) z_path += '&' + key + '=' + a_search[key];
            console.log(pgm + 'z_path = ' + z_path) ;
            ZeroFrame.cmd("wrapperReplaceState", [{"scrollY": 100}, "Money Network", z_path]);
            return z_path;
        }];

        // setup routes. For now only one page wallet
        $routeProvider
            .when('/wallet', {
                templateUrl: 'wallet.html',
                controller: 'WalletCtrl as w',
                resolve: {check_auth: set_z_path}
            })
            .otherwise({
                redirectTo: function () {
                    // error or startup. redirect to wallet page
                    var pgm = 'routeProvider.otherwise: ';
                    var a_path, z_path ;
                    a_path = '/wallet';
                    z_path = "?path=" + a_path;
                    console.log(pgm + 'a_path = ' + a_path + ', z_path = ' + z_path) ;
                    ZeroFrame.cmd("wrapperReplaceState", [{"scrollY": 100}, "Money Network", z_path]);
                    return a_path;
                }
            });

        // end config (ng-routes)

    }])

    .config(['$wampProvider', function ($wampProvider) {
        var pgm = 'wampProvider: ';
        console.log(pgm + 'creation session on greenaddress.it');
        $wampProvider.init({
            url: 'wss://prodwss.greenaddress.it/v2/ws/',
            realm: 'realm1'
            //Any other AutobahnJS options
        });
    }])
    .run(function($wamp){
        $wamp.open();
    })

;


