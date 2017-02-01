'use strict';

var addWishListWhenNoID = require('addWishListWhenNoID').addWishListWhenNoID;
var addShippingAddress = require('addShippingAddress').addShippingAddress;
var addProductToWishlist = require('addProductToWishlist').addProductToWishlist;

var system = require('system'); // Check command-line arguments

var args = system.args;
var fs = require('fs');
var x = require('casper').selectXPath;
var page = require('webpage').create();
var utils = require('utils');
var wlName = "wl" + Math.floor(Math.random() * 1000000 + 1);
var wishlistID_new = void 0;

var dataDir = '/var/data/';
// var dataDir = 'screens';
var parameters = {};

var loggedIn = false;

args.forEach(function (arg, i) {
    if (i > 0 && arg[0] == '{') {
        parameters = JSON.parse(arg);
    }
});

// Read a JSON object from stdin
for (var k in parameters) {
    if (k != 'cookies') {
        console.log(k, ' => ', k == 'password' || k == 'dbc_password' ? '******' : parameters[k]);
    }
}
if (!parameters.account || !parameters.password) {
    console.log('Please pass as an argument a JSON object like: {"account": "amazon@account.com", "password": "password"');
    phantom.exit(1);
}

if (!parameters.billing_address) {
    console.log('Shipping address details are missing');
    phantom.exit(1);
}

// Read cookies
if (parameters.cookies) {
    console.log('cookies => available');
    phantom.cookies = JSON.parse(parameters.cookies);
} else {
    console.log('cookies => UNAVAILABLE');
}

// Casper initialization
var userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36';

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

var casperModule = require('casper');
var casper = casperModule.create({
//    clientScripts: ['../vendor/jquery/dist/jquery.min.js'],

    pageSettings: {
        cookiesEnabled: true,
        javascriptEnabled: true,
        loadImages: false,
        loadPlugins: false,
        userAgent: userAgent
    },

    logLevel: "debug",
    verbose: true
});
casper.options.waitTimeout = 25000;
//var casper1 = require("casper").create();
var mouse = require("mouse").create(casper);
// --------------------
var wishlistURL = "";
casper.renderJSON = function (arg1) {
    return this.echo('JSON:{"url":' + JSON.stringify(arg1) + '}');
};
function echo() {
    var args = [new Date().toISOString().slice(0, 19).replace('T', ' - ')];
    args.push.apply(args, arguments);
    console.log(args.join(' '));
}

// Echoes the result data to be processed by caller process
function echoResult(obj) {
    // Add cookies to result
    if (loggedIn) {
        obj.cookies = JSON.stringify(phantom.cookies);
    }
    console.log('JSON:', JSON.stringify(obj));
}

var pageFN, imageFN;

function UID() {
    var uid = '';
    for (var ii = 0; ii < 32; ii++) {
        uid += (Math.random() * 16 | 0).toString(16);
    }
    return uid;
}

function savePage() {
    // Saves the current page for debugging
    var baseFN = '/var/data/' + UID(),
        imageFN = baseFN + '.jpg',
        pageFN = baseFN + '.html';

    casper.capture(imageFN);
    console.log('SCREENSHOT:', casper.getCurrentUrl(), '=>', imageFN);
    fs.write(pageFN, casper.getHTML(), 'w');
    console.log('PAGE:', casper.getCurrentUrl(), '=>', pageFN);

    return {
        image: imageFN,
        page: pageFN
    };
}

function fatalError(error) {
    // Reports the error and exists the script
    var saved = savePage();
    // Report the errror
    echoResult({ "error": error, "url": casper.getCurrentUrl(), "page": saved.page, "screenshot": saved.image });
    // Exit
    casper.bypass(999999);
    casper.die(error, 10);
}

function base64ArrayBuffer(arrayBuffer) {
    var base64 = '';
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    var bytes = new Uint8Array(arrayBuffer);
    var byteLength = bytes.byteLength;
    var byteRemainder = byteLength % 3;
    var mainLength = byteLength - byteRemainder;

    var a, b, c, d;
    var chunk;

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
        d = chunk & 63; // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength];

        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4; // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder == 2) {
        chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];

        a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2; // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }

    return base64;
}

function parseQuery(qstr) {
    var query = {};
    var a = qstr.substr(1).split('&');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
}

function resolveCaptcha(imageFN, onResolved) {
    var page = require('webpage').create();

    page.open('data:text/html,' + '<form action="http://api.dbcapi.me/api/captcha" method="post" enctype="multipart/form-data"> ' + '<input type="text"     name="username" value="' + parameters.dbc_login + '"> ' + '<input type="password" name="password" value="' + parameters.dbc_password + '"> ' + '<input type="file"     name="captchafile"> ' + '</form>', function () {
        // this.fill('form', {
        //     username: parameters.dbc_login,
        //     password: parameters.dbc_password
        // })
        page.uploadFile('input[name=captchafile]', imageFN);
        page.evaluate(function () {
            document.querySelector('form').submit();
        });
    });
    casper.waitFor(function check() {
        var content = page.content;
        return content.indexOf('<form') == -1;
    }, function then() {
        var url = page.url,
            html = page.content,
            content = page.plainText;
        echo('DeathByCaptcha response: ' + content);
        echo('Text content:', page.plainText);
        if (content.indexOf('is_correct=1') == -1) {
            onResolved('invalid');
            fatalError("Can't resolve the captcha");
        } else {
            echo("Checking the response");

            var checkResponse = function checkResponse() {
                var data = parseQuery(content);
                if (data.text) {
                    echo("Captcha resolved to '" + data.text + "'");
                    onResolved(data.text);
                    return true;
                }
                return false;
            };

            if (!checkResponse()) {
                echo('Polling the captcha resolving service URL', url);

                var checkForCode = function checkForCode() {
                    setTimeout(function () {
                        echo('Requesting the resolved code');
                        page.open(url, function () {
                            content = page.plainText;
                            echo('DeathByCaptcha response: ' + content);

                            if (!checkResponse()) {
                                checkForCode();
                            }
                        });
                    }, 4000);
                };

                checkForCode();
            }
        }
    });
}

// --------------------

var captchaImageSelector = '#ap_captcha_img img';
var startUrl = "https://www.amazon.com/gc/redeem/";
var startUrlWishList = "https://www.amazon.com/gp/registry/wishlist/";

casper.start().thenOpen(startUrl, function () {
    var url = this.getCurrentUrl();
    if (url.indexOf('/signin?') == -1) {
        loggedIn = true;
        echo('Session is valid, skipping the login page.');
        // Check for the number of login steps. Update it here when Captcha handler added.
        this.bypass(3);
    }
});

// Login to Amazon account. 2 steps can be skipped by bypass call above.

casper.then(function(){
    echo('Logging in to Amazon account', parameters.account);
    var attempt = 1;

    function logIn(){
        casper.then(function(){
            casper.sendKeys('#ap_email', parameters.account, {reset: true, keepFocus: true});
            casper.sendKeys('#ap_password', parameters.password, {reset: true, keepFocus: true});
            // Check for captcha
            var captchaCode = '',
                captchaImage = casper.getElementAttribute(captchaImageSelector, 'src');
            if (captchaImage){
                echo('Resolving the captcha');
                // Download the image and resolve the captcha
                var imageFN = dataDir + 'captcha_' + UID() + '.jpg';
                casper.download(captchaImage, imageFN);
                echo('Captcha downloaded to', imageFN);

                resolveCaptcha(imageFN, function(code){captchaCode = code;});
                casper.waitFor(
                    function(){
                        return captchaCode != '';
                    },
                    function(){
                        echo('Captcha resolved, submitting the code:', captchaCode);

                        casper.sendKeys('#ap_captcha_guess', captchaCode);
                    },
                    function(){
                        fatalError("Captcha wasn't resolved in 2 minutes");
                    },
                    120000
                );
            }
        });
        casper.then(function(){
            casper.click('#signInSubmit-input');
            casper.waitFor(
                function(){
                    // Exit on completed redirect
                    var url = casper.getCurrentUrl();
                    if (url == startUrl || url.indexOf("https://www.amazon.com/ap/signin") == 0){
                        return true;
                    }
                    // Check if a new captcha arrived
                    if (casper.exists(captchaImageSelector)){
                        if(casper.getElementAttribute(captchaImageSelector, 'src')){
                            return true;
                        }
                    }
                    return false;
                },
                function(){
                    loggedIn = !casper.exists('#ap_email');
                    if(!loggedIn){
                        attempt++;
                        if(attempt <= 3){
                            logIn();
                        }else{
                            fatalError("Failed to login to Amazon account after " + (attempt -1) + " attempts.");
                        }
                    }
                },
                function(){
                    fatalError("Failed to login to Amazon account. It took too long to submit credentials for " + parameters.account + ".");
                    return false;
                },
                5000
            );
        });
    }

    logIn();
});

casper.then(function(){
    if(!loggedIn){
        fatalError("Failed to login to Amazon account " + parameters.account);
    }
});

casper.then(function () {
    //if wishlist id is not provided as part JSON input then wishlist is created

    if (!parameters.wishlist_id) {

        console.log("WISHLIST is created since the wishlist is not part of JSON input :");
        casper.then(function () {
            console.log('addWishListWhenNoID');
            addWishListWhenNoID(startUrlWishList, wlName); //add wishlist
            this.echo("WISHLIST ID   :" + wishlistID_new);
        });
        casper.then(function () {
            this.echo("Start creating wishlist id");

            addProductToWishlist(wishlistID_new); //add product to wishlist
        });

        casper.then(function () {
            console.log("Change wishlist to public and add shipping address");
            addShippingAddress(wishlistID_new, wishlistURL); //add shipping address and make the wishlist public
            //casper.thenOpen("https://www.amazon.com/gp/registry/wishlist/"+ wishlistID +"/settings.html");
        });
        casper.then(function () {
            this.echo("Added all ASINS");

            casper.renderJSON(wishlistURL);
        });
    } else {
        //wishlist is part of input JSON, add items to this wishlist
        console.log("WISHLIST ID as part of JSON :" + parameters.wishlist_id);
        var data = fs.read(cookieFilename);
        phantom.cookies = JSON.parse(data);
        casper.then(function () {

            addProductToWishlist(parameters.wishlist_id); //add product to wishlist
        });

        casper.then(function () {
            addShippingAddress(parameters.wishlist_id); //add shipping address to wishlist
        });

        casper.then(function () {
            this.echo("Added all ASINS");

            var existingwishlistURL = "https://www.amazon.com/gp/registry/wishlist/" + parameters.wishlist_id + "/ref=cm_wl_rlist_create";
            this.echo(existingwishlistURL);
            casper.renderJSON(existingwishlistURL);
        });
    }
});

//--------------------------
casper.run(function () {
    this.exit();
});