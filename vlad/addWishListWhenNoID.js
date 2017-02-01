"use strict";

exports.addWishListWhenNoID = function(startUrlWishList, wlName) {
    console.log("addWishListWhenNoID function call");
    console.log("start Wishlist URL :" + startUrlWishList);
    console.log("wishList Name :" + wlName);
    casper.thenOpen(startUrlWishList);

    console.log("Wish List name :" + wlName);
    //start wishlist
    casper.thenClick(x('.//*[@id="a-autoid-0"]/span/input'), function () {
        console.log("Click on Create Wishlist");
    });

    //select the radio button Wish List

    casper.then(function () {
        casper.evaluate(function () {
            __utils__.echo("select wishlist checkbox!");
            document.getElementsByClassName("a-icon-radio")[1].click();
            document.getElementById("WLNEW_privacy_public").click();
            __utils__.echo("public button clicked");
        });
    });

    casper.then(function () {
        var nameCount1 = this.evaluate(function (wl) {

            __utils__.echo("Enter the wishlist with name:" + wl);
            $("#WLNEW_list_name").val(wl);
            var names = $('#WLNEW_list_name').val();
            // $("#a-autoid-1 > span.a-button-inner > input.a-button-input.a-declarative").click();
            return names;
        }, wlName);
        this.echo(nameCount1);
    });

    casper.thenClick(x('.//*[@id="a-autoid-1"]/span/input'), function () {
        console.log("Clicked on Create List Button");
        casper.capture(dataDir + "/createlist.png");
    });

    casper.waitFor(function check() {
        return this.evaluate(function (wl) {
            __utils__.echo(document.getElementById("profile-list-name").innerHTML.trim());
            return document.getElementById("profile-list-name").innerHTML.trim() == wl;
        }, wlName);
    }, function then() {
        // step to execute when check() is ok
        this.echo('then.........');
        this.echo(this.getCurrentUrl());
        wishlistURL = this.getCurrentUrl();
        var wishlistId = wishlistURL.split('/');
        this.echo(wishlistId[6]);
        wishlistID_new = wishlistId[6];
    }, function timeout() {
        // step to execute if check has failed

        this.echo('JSON:{"error":"Could not able to create wishlist"}').exit();
    });
};
