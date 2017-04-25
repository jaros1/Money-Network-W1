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
        // get BitCoin HD node
        function get_hd_node (mnemonic) {
            var pgm = controller + '.get_hd_node: ' ;
            var cur_net = bitcoin.networks.bitcoin;  // 'testnet' for testnet
            console.log(pgm + 'mybip39 = ', mybip39) ;
            var seed = mybip39.mnemonicToSeedHex(mnemonic);  // this is slow, perhaps move to a webworker
            return bitcoin.HDNode.fromSeedHex(seed, cur_net);
            // NOTE: master priv key shouldn't be used for signing because repeated signing using the
            // same key is dangerous, so in production a random BIP32 subpath should be used.
            // See https://github.com/greenaddress/GreenAddressWebFiles/blob/c675736a0839d109df65c3555a9c22829b9ef4cd/static/js/greenwallet/services.js#L2173
            // for example implementation
        }

        // callback 1 - get mnemonic
        get_mnemonic(function (mnemonic) {
            var pgm = controller + '.get_mnemonic: ' ;
            // console.log('mnemonic = ' + mnemonic) ;
            // get BitCoin HD node
            var derive_hd = get_hd_node (mnemonic) ;
            console.log(pgm + 'derive_hd = ' + JSON.stringify(derive_hd)) ;
            //derive_hd = {
            //    "keyPair": {
            //        "d": {
            //            "0": 17545736,
            //            "1": 61487776,
            //            "2": 5814537,
            //            "3": 32903604,
            //            "4": 66031989,
            //            "5": 10809679,
            //            "6": 37159912,
            //            "7": 15218081,
            //            "8": 6474121,
            //            "9": 66727,
            //            "t": 10,
            //            "s": 0
            //        },
            //        "compressed": true,
            //        "network": {
            //            "messagePrefix": "\u0018Bitcoin Signed Message:\n",
            //            "bip32": {"public": 76067358, "private": 76066276},
            //            "pubKeyHash": 0,
            //            "scriptHash": 5,
            //            "wif": 128,
            //            "dustThreshold": 546
            //        }
            //    },
            //    "chainCode": {
            //        "type": "Buffer",
            //        "data": [33, 80, 19, 188, 82, 91, 160, 29, 101, 199, 210, 157, 125, 164, 224, 163, 218, 240, 13, 150, 88, 240, 208, 119, 185, 128, 62, 77, 201, 191, 36, 2]
            //    },
            //    "depth": 0,
            //    "index": 0,
            //    "parentFingerprint": 0
            //};
            // start login sequence - get challenge
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

        }) ;


        // end WalletCtrl
    }])

;