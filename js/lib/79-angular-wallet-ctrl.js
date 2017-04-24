angular.module('MoneyNetworkW1')

    .controller('WalletCtrl', ['$window', 'MoneyNetworkW1Service', '$wamp', '$scope', function ($window, moneyNetworkService, $wamp, $scope) {
        var self = this;
        var controller = 'WalletCtrl';
        console.log(controller + ' loaded');

        // set caller_desclose_me
        $scope.$on("$wamp.open", function (event, info) {
            console.log('We are connected to the WAMP Router!');
            // https://github.com/voryx/angular-wamp/issues/41
            info.session.caller_disclose_me = true;
        });

        // helpers
        // get mnemonic
        function get_mnemonic (cb) {
            ZeroFrame.cmd("wrapperPrompt", ["Enter mnemonic", "mnemonic"], function (mnemonic) {
                cb (mnemonic) ;
            }) ;
        }

        //
        function mnemonicToSeed (mnemonic, password) {
            var mnemonicBuffer = new Buffer(unorm.nfkd(mnemonic), 'utf8');
            var saltBuffer = new Buffer(salt(unorm.nfkd(password)), 'utf8');

            return pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512');
        }
        function mnemonicToSeedHex (mnemonic, password) {
            return mnemonicToSeed(mnemonic, password).toString('hex');
        }


        // callback 1 - get mnemonic
        get_mnemonic(function (mnemonic) {
            console.log('mnemonic = ' + mnemonic) ;
        }) ;


        // login
        // 1) get_challenge
        // console.log(controller + ': connection = ' + JSON.stringify($wamp.connection)) ;
        //connection = {
        //    "_options": {
        //        "url": "wss://prodwss.greenaddress.it/v2/ws/",
        //        "realm": "realm1",
        //        "transports": [{
        //            "type": "websocket",
        //            "url": "wss://prodwss.greenaddress.it/v2/ws/",
        //            "serializers": [{"SERIALIZER_ID": "json", "BINARY": false}, {
        //                "SERIALIZER_ID": "msgpack",
        //                "BINARY": true,
        //                "codec": {}
        //            }],
        //            "protocols": ["wamp.2.json", "wamp.2.msgpack"]
        //        }]
        //    },
        //    "_transport_factories": [{
        //        "_options": {
        //            "type": "websocket",
        //            "url": "wss://prodwss.greenaddress.it/v2/ws/",
        //            "serializers": [{"SERIALIZER_ID": "json", "BINARY": false}, {
        //                "SERIALIZER_ID": "msgpack",
        //                "BINARY": true,
        //                "codec": {}
        //            }],
        //            "protocols": ["wamp.2.json", "wamp.2.msgpack"]
        //        }
        //    }],
        //    "_session": null,
        //    "_session_close_reason": null,
        //    "_session_close_message": null,
        //    "_retry_if_unreachable": true,
        //    "_max_retries": 15,
        //    "_initial_retry_delay": 1.5,
        //    "_max_retry_delay": 300,
        //    "_retry_delay_growth": 1.5,
        //    "_retry_delay_jitter": 0.1,
        //    "_connect_successes": 0,
        //    "_retry": false,
        //    "_retry_count": 0,
        //    "_retry_delay": 1.5,
        //    "_is_retrying": false,
        //    "_retry_timer": null
        //};




        console.log(controller + ': session = ' + JSON.stringify($wamp.session)) ;
        console.log(controller + 'calling com.greenaddress.login.get_challenge') ;
        $wamp.call('com.greenaddress.login.get_challenge', ['1PJj9Sf4KDu4rwTvwQA6rkhz4ojbwWHBoE'])
            .then(function (challenge) {
                console.log('challenge = ' + JSON.stringify(challenge));
            });

        // end WalletCtrl
    }])

;