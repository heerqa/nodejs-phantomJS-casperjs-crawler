"use strict";

exports.addShippingAddress = function(wishlistID, wishlistURL) {
    var data = fs.read("cookiefile");
    phantom.cookies = JSON.parse(data);
    casper.then(function () {
        if (!parameters.wishlist_id) {

            console.log("WISHLIST is created since the wishlist is not part of JSON input :" + wishlistID);
            casper.thenOpen("https://www.amazon.com/gp/registry/wishlist/" + wishlistID + "/settings.html");
        } else {
            console.log("WISHLIST ID as part of JSON :" + parameters.wishlist_id);
            casper.thenOpen("https://www.amazon.com/gp/registry/wishlist/" + parameters.wishlist_id + "/settings.html");
        }
    });

    casper.waitFor(function check() {
        return this.evaluate(function () {
            $(".a-button-text.a-declarative")[4].innerHTML;
            $(".a-button-text.a-declarative")[4].click();
            __utils__.echo("The drop down is dispplayed:" + $("#dropdown1_0").html().trim());
            __utils__.echo("The drop down is dispplayed:" + $(".a-dropdown-link").length);

            return $(".a-dropdown-link").length >= 3;
        });
    }, function then() {
        // step to execute when check() is ok
        this.echo('then.........');
        casper.evaluate(function () {
            //$(".a-dropdown-link").length;
            __utils__.echo("Change to Public : " + $(".a-dropdown-link").length);
            $(".a-dropdown-link")[0].click();
            // $("#submitForm").click();
        });
    }, function timeout() {
        // step to execute if check has failed
        this.echo('JSON:{"error":"Could not able to select public"}').exit();
    });

    casper.then(function () {
        this.echo("CHANGED TO PUBLIC");
    });

    casper.waitFor(function check() {
        return this.evaluate(function () {
            //__utils__.echo("The radio button count is :" + $(".a-icon.a-accordion-radio.a-icon-radio-inactive").length );

            return $(".a-icon.a-accordion-radio.a-icon-radio-inactive").length >= 2;
        });
    }, function then(radiocount) {
        // step to execute when check() is ok
        this.echo('click on create new address checkbox.........');

        casper.thenClick(x("//div[@id='list-address-container']/div/div/div/div[3]/div/a/i"), function () {

            console.log("Clicked on Create address checbox");
        });
    }, function timeout() {
        // step to execute if check has failed
        casper.thenClick(x("//div[@id='list-address-container']/div/div/div/div[2]/div/a/i"), function () {

            console.log("Clicked on Create address checbox");
        });
        this.echo("Created Shipping address ------------------.");
    });

    casper.then(function () {
        casper.capture(dataDir + "/createaddress.png");
        casper.evaluate(function (name, street1, street2, city, state, zip, country, phone) {
            __utils__.echo("ADD shipping address");

            // $(".a-icon.a-accordion-radio.a-icon-radio-inactive").click();
            __utils__.echo(name);
            __utils__.echo(street1);
            __utils__.echo(street2);
            __utils__.echo(city);
            __utils__.echo(state);
            __utils__.echo(zip);
            __utils__.echo(country);
            __utils__.echo(phone);
            $("#enterAddressFullName").val(name);
            $("#enterAddressAddressLine1").val(street1);
            $("#enterAddressAddressLine2").val(street2);
            $("#enterAddressCity").val(city);
            $("#enterAddressStateOrRegion").val(state);

            $("#enterAddressPostalCode").val(zip);

            $("#enterAddressCountryCode").val(country);

            $("#enterAddressPhoneNumber").val(phone);

            $("#submitForm").click();
        }, parameters.billing_address.full_name, parameters.billing_address.street1, parameters.billing_address.street2, parameters.billing_address.city, parameters.billing_address.state, parameters.billing_address.zip, parameters.billing_address.country, parameters.billing_address.phone);
    });

    casper.then(function () {
        this.wait(10000, function () {
            this.echo("I've waited for 10 second.");
        });
    });

    casper.waitFor(function check() {
        casper.capture(dataDir + "/shippinAddress.png");
        return this.evaluate(function () {
            //__utils__.echo("The radio button count is :" + $(".a-icon.a-accordion-radio.a-icon-radio-inactive").length );
            __utils__.echo($(".enterAddressFieldError")[0].innerHTML);
            return $(".enterAddressFieldError")[0].innerHTML.trim().indexOf("The state and ZIP Code you provided do not match.") == 0;
        });
    }, function then() {
        // step to execute when check() is ok
        this.echo('JSON:{"error":"The state and ZIP Code you provided do not match"}').exit();
    }, function timeout() {
        // step to execute if check has failed

        this.echo("Added Shipping address");
    });
}