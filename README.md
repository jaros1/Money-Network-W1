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
- none
