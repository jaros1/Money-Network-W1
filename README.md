# Money-Network-W1
Demo with complementary and alternative money. Implemented in ZeroFrame and AngularJS. Focus on privacy, encryption, max data on client and min data on server.

The Main site is [Money-Network](https://github.com/jaros1/Money-Network).
Money-Network-W1 is a plugin sub-site with a BitCoin wallet using [greenaddress.it](https://greenaddress.it/en/) API for BitCoin operations.

Status: Not working. Problems with using additional web files from GreenAddressWebFiles.
- Many dependencies in bitcoin_util.js script.
- Scripts (minimized) secp256k1.js and secp256k1-alpha.js aborts with error.
- Infinite loop in .subpath_for_login.
- Maybe a problem with bitcoinjs-browserify bundle from GreenAddressWebFiles.
- Maybe a problems with secp256k1-scripts.
- Maybe a problem with BigInteger (bigi). BitCoin interface to greenaddress.it dropped for now.

## Money-Network-W1 demo links
- http://127.0.0.1:43110/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN/ ([ZeroNet](https://zeronet.readthedocs.io/en/latest/using_zeronet/installing/) required)
- https://bit.no.com:43110/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN/ (proxy)
- https://zeronet.korso.win/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN/ (proxy)
- https://proxy1.zn.kindlyfire.me/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN/ (proxy *)
- https://onlyzero.net/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN/ (proxy *)
- https://www.zerogate.tk/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN/ (proxy *)
- https://zeronet.iikb.org/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN/ (proxy *)
- https://zero.btnova.org/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN/ (proxy *)
- https://fuckcf.cf/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN (proxy)
- https://zeronet.maxweiss.io/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN (proxy)
- https://bit.surf:43110/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN/ (proxy)
- https://proxy.th3nd.com/16RMEZXFTLXcWFUA5vCEaw2vGpYVZ6iJtN
- Proxy * = not available at last test 15 april 2017

This demo should be safe to check out on a ZeroNet proxy server.
You can see all ZeroNet sites on proxy servers but do not use your normal ZeroNet cert on a ZeroNet proxy server.
