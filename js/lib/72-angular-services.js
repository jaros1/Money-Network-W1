angular.module('MoneyNetworkW1')

    .factory('MoneyNetworkW1Service', ['$timeout', '$rootScope', '$window', '$location',
        function ($timeout, $rootScope, $window, $location) {
            var service = 'MoneyNetworkW1Service';
            console.log(service + ' loaded');

            // export MoneyNetworkW1Service
            return {};

            // end MoneyNetworkW1Service
        }])

    .factory('user_agent', [function() {
        var is_chrome_app = window.chrome && chrome.storage,
            is_cordova_app = window.cordova;
        return function(wallet) {
            if (is_cordova_app) {
                return 'Cordova ' + cordova.platformId +
                    ' (version=' + wallet.version + ')';
            } else if (is_chrome_app) {
                return 'Chrome ' + '(version=' + wallet.version + ')';
            } else {
                return 'Browser';
            }
        };
    }])

    // tx_sender: copy/paste relevant code from greenWalletServices.js
    // https://github.com/greenaddress/GreenAddressWebFiles/blob/c675736a0839d109df65c3555a9c22829b9ef4cd/static/js/greenwallet/services.js
    .factory('tx_sender', ['$q', '$wamp',
        function ($q, $wamp) {
            var txSenderService = this;
            var service = 'tx_sender';
            console.log(service + ' loaded');

            var attempt_login = false;

            // L1925
            var session_for_login = $wamp;

            // L2074
            var disconnected = false, connecting = false, nconn = 0;

            // L2157
            txSenderService.logged_in = false;
            var waiting_for_device = false;
            txSenderService.login = function (logout, force_relogin, user_agent) {
                var pgm = service + '.login: ' ;
                var d_main = $q.defer();
                if (txSenderService.logged_in && !force_relogin) {
                    d_main.resolve(txSenderService.logged_in);
                } else {
                    var hdwallet = txSenderService.hdwallet;
                    attempt_login = true;
                    if (hdwallet.keyPair.d) {
                        if (session_for_login) {
                            session_for_login.call('com.greenaddress.login.get_challenge',
                                [hdwallet.getAddress().toString()]).then(function(challenge) {
                                    console.log(pgm + 'challenge = ' + challenge) ;

                                    var challenge_bytes = new Bitcoin.BigInteger(challenge).toBuffer();

                                    // generate random path to derive key from - avoids signing using the same key twice
                                    var random_path_hex = new Bitcoin.BigInteger.fromBuffer(
                                        Bitcoin.randombytes(8)
                                    ).toString(16);
                                    while (random_path_hex.length < 16) random_path_hex = '0' + random_path_hex;
                                    console.log('random_path_hex = ' + random_path_hex) ;

                                    console.log('$q = ', $q) ;

                                    $q.when(hdwallet.subpath_for_login(random_path_hex)).then(function(subhd) {
                                        console.log('subhd = ', subhd) ;
                                        $q.when(subhd.keyPair.sign(challenge_bytes)).then(function(signature) {
                                            console.log('signature = ', signature) ;
                                            d_main.resolve(device_id().then(function(devid) {
                                                if (session_for_login && session_for_login.nc == nconn) {
                                                    if (!cur_net.isAlpha) {
                                                        signature = [signature.r.toString(), signature.s.toString()];
                                                    }
                                                    return session_for_login.call('com.greenaddress.login.authenticate',
                                                        [signature, logout||false,
                                                            random_path_hex, devid, user_agent]).then(function(data) {
                                                            if (data) {
                                                                txSenderService.logged_in = data;
                                                                onLogin(data);
                                                                return data;
                                                            } else { return $q.reject(gettext('Login failed')); }
                                                        });
                                                } else if (!connecting) {
                                                    disconnected = false;
                                                    d = $q.defer();
                                                    connect(d);
                                                    d_main.resolve(d.promise);
                                                }
                                            }));
                                        });
                                    });
                                });
                        } else if (!connecting) {
                            disconnected = false;
                            d = $q.defer();
                            connect(d);
                            d_main.resolve(d.promise);
                        }
                    } else {  // trezor_dev || btchip
                        if (waiting_for_device) return;
                        var trezor_dev = txSenderService.trezor_dev,
                            btchip_dev = txSenderService.btchip;
                        var get_pubkey = function() {
                            if (trezor_dev) {
                                return $q.when(txSenderService.trezor_address);
                            } else {
                                return $q.when(txSenderService.btchip_address);
                            }
                        }
                        get_pubkey().then(function (addr) {
                            if (session_for_login) {
                                if (trezor_dev) {
                                    dev_d = $q.when(trezor_dev);
                                } else {
                                    dev_d = btchip.getDevice(false, true,
                                        // FIXME not sure why it doesn't work with Cordova
                                        // ("suspend app, disconnect dongle, resume app, reconnect dongle" case fails)
                                        window.cordova ? null : btchip_dev).then(function(btchip_dev_) {
                                            txSenderService.btchip = btchip_dev = btchip_dev_;
                                        });
                                }
                                waiting_for_device = true;
                                var challenge_arg_resolves_main = false;
                                dev_d = dev_d.then(function() {
                                    if (session_for_login) {
                                        return session_for_login.call('com.greenaddress.login.get_trezor_challenge', [addr]);
                                    } else if (!connecting) {
                                        waiting_for_device = false;
                                        disconnected = false;
                                        d = $q.defer();
                                        connect(d);
                                        challenge_arg_resolves_main = true;
                                        return d.promise;
                                    } else waiting_for_device = false;
                                });
                                d_main.resolve(dev_d.then(function(challenge) {
                                    if (challenge_arg_resolves_main) return challenge;
                                    if (!challenge) return $q.defer().promise;  // never resolve

                                    var msg_plain = 'greenaddress.it      login ' + challenge;
                                    var msg = (new Bitcoin.Buffer.Buffer(
                                        msg_plain, 'utf8'
                                    )).toString('hex');
                                    // btchip requires 0xB11E to skip HID authentication
                                    // 0x4741 = 18241 = 256*G + A in ASCII
                                    var path = [0x4741b11e];

                                    if (trezor_dev) {
                                        trezor_dev.signing = true;
                                        return trezor_dev._typedCommonCall('SignMessage', 'MessageSignature',
                                            {'message': msg, address_n: path}).then(function(res) {
                                                var sig = res.message.signature;
                                                sig = sig.toHex ? sig.toHex() : sig;
                                                var signature = Bitcoin.bitcoin.ECSignature.parseCompact(
                                                    new Bitcoin.Buffer.Buffer(sig, 'hex')
                                                );
                                                trezor_dev.signing = false;
                                                return device_id().then(function(devid) {
                                                    return session_for_login.call('com.greenaddress.login.authenticate',
                                                        [[signature.signature.r.toString(), signature.signature.s.toString(), signature.i.toString()], logout||false,
                                                            'GA', devid]).then(function(data) {
                                                            if (data) {
                                                                txSenderService.logged_in = data;
                                                                onLogin(data);
                                                                return data;
                                                            } else { return $q.reject(gettext('Login failed')); }
                                                        });
                                                });
                                            }, function(err) {
                                                trezor_dev.signing = false;
                                                return $q.reject(err.message);
                                            });
                                    } else {
                                        var t0 = new Date();
                                        return $q.when(hdwallet.derive(path[0])).then(function(result_pk) {
                                            return btchip_dev.signMessagePrepare_async(path.join('/'), new ByteString(msg, HEX)).then(function(result) {
                                                return btchip_dev.app.signMessageSign_async(new ByteString("00", HEX)).then(function(result) {
                                                    waiting_for_device = false;
                                                    var signature = Bitcoin.bitcoin.ECSignature.fromDER(
                                                        new Bitcoin.Buffer.Buffer("30" + result.bytes(1).toString(HEX), 'hex')
                                                    );
                                                    if (btchip_dev.features.signMessageRecoveryParam) {
                                                        var i = result.byteAt(0) & 0x01;
                                                    } else {
                                                        var i = Bitcoin.ecdsa.calcPubKeyRecoveryParam(
                                                            Bitcoin.BigInteger.fromBuffer(Bitcoin.message.magicHash(msg_plain)),
                                                            {r: signature.r, s: signature.s},
                                                            result_pk.keyPair.Q
                                                        )
                                                    }
                                                    return device_id().then(function(devid) {
                                                        if (session_for_login && session_for_login.nc == nconn) {
                                                            return session_for_login.call('com.greenaddress.login.authenticate',
                                                                [[signature.r.toString(), signature.s.toString(), i.toString()], logout||false,
                                                                    'GA', devid]).then(function(data) {
                                                                    if (data) {
                                                                        txSenderService.logged_in = data;
                                                                        onLogin(data);
                                                                        return data;
                                                                    } else { return $q.reject(gettext('Login failed')); }
                                                                });
                                                        } else if (!connecting) {
                                                            disconnected = false;
                                                            d = $q.defer();
                                                            connect(d);
                                                            return d.promise;
                                                        }
                                                    });
                                                });
                                            });
                                        });
                                    }
                                }).finally(function() { waiting_for_device = false; }));
                            } else if (!connecting) {
                                disconnected = false;
                                d = $q.defer();
                                connect(d);
                                d_main.resolve(d.promise);
                            }
                        });
                    }
                }
                return d_main.promise;
            };

            // export tx_server
            return txSenderService;

            // end tx_sender
        }])

    // WalletsService: copy/paste relevant code from greenWalletServices.js
    // https://github.com/greenaddress/GreenAddressWebFiles/blob/c675736a0839d109df65c3555a9c22829b9ef4cd/static/js/greenwallet/services.js
    .factory('WalletsService', ['tx_sender', '$q', 'user_agent',
        function (tx_sender, $q, user_agent) {
            var walletsService = this ;
            var service = 'WalletsService';
            console.log(service + ' loaded');

            // L299
            walletsService._login = function($scope, hdwallet, mnemonic, signup, logout, path_seed, path, double_login_callback) {
                var d = $q.defer(), that = this;
                tx_sender.login(logout, false, user_agent($scope.wallet)).then(function (data) {
                    console.log('data = ' + JSON.stringify(data)) ;
                });
            };

            // L392
            walletsService.login = function($scope, hdwallet, mnemonic, signup, logout, path_seed) {
                tx_sender.hdwallet = hdwallet;
                return this._login($scope, hdwallet, mnemonic, signup, logout, path_seed);
            };

            // export WalletsService
            return walletsService ;

            // end WalletsService
        }]);
