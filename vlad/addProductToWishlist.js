"use strict";

exports.addProductToWishlist = function(wishlistID) {
                           var data = fs.read("cookiefile");
                           phantom.cookies = JSON.parse(data);
                           console.log("addProductToWishlist function call");
                           for (var N in parameters.items) {
                                                      console.log(N + ":" + parameters.items[N].ASIN);
                                                      console.log(N + ":" + parameters.items[N].qty);
                                                      console.log("WISHLIST ID :" + wishlistID);
                                                      console.log('http://amazon.com/dp/' + parameters.items[N].ASIN);
                                                      //casper.thenOpen("http://amazon.com/dp/" + parameters.items[N].ASIN);
                                                      casper.thenOpen('http://amazon.com/dp/' + parameters.items[N].ASIN);

                                                      casper.then(function () {
                                                                                 this.wait(20000, function () {
                                                                                                            this.echo("I've waited for 20 second.");
                                                                                                            this.echo("Waiting for page to load..............");
                                                                                                            casper.capture(dataDir + "/prodlist" + N + "+before.png");
                                                                                 });
                                                      });

                                                      casper.waitFor(function check() {

                                                                                 return this.evaluate(function () {

                                                                                                            // __utils__.echo("wishlist count displayed: " + $("#add-to-wishlist-button").length );
                                                                                                            return $("#add-to-wishlist-button").length == 1;
                                                                                 });
                                                      }, function then() {
                                                                                 // step to execute when check() is ok
                                                                                 console.log("The Add to Wishlist button is displayed");
                                                      }, function timeout() {
                                                                                 // step to execute if check has failed
                                                                                 this.echo('JSON:{"error":"The Add to Wishlist button is NOT displayed"}').exit();
                                                      });

                                                      casper.then(function () {
                                                                                 casper.waitForSelector("#add-to-wishlist-button", function () {
                                                                                                            this.echo(this.getCurrentUrl());
                                                                                                            this.echo("I'm sure #add-to-wishlist-button is available in the DOM");
                                                                                 });
                                                                                 casper.evaluate(function (qty) {
                                                                                                            __utils__.echo("Number of quantity to be added: " + qty);
                                                                                                            $("#quantity").val(qty); //add quantity
                                                                                                            $("#add-to-wishlist-button").click();
                                                                                 }, parameters.items[N].qty);
                                                                                 casper.capture(dataDir + "/prodlist" + N + ".png");
                                                                                 this.echo("product page oepened");
                                                      });

                                                      casper.then(function () {
                                                                                 this.wait(20000, function () {
                                                                                                            this.echo("I've waited for 10 second.");
                                                                                 });

                                                                                 var listcount = this.evaluate(function () {
                                                                                                            $("#add-to-wishlist-button").click();
                                                                                                            var names = $("#atwl-list-name-newwl").text();

                                                                                                            return names;
                                                                                 });
                                                                                 this.echo(listcount);
                                                                                 casper.capture(dataDir + "/countlist.png");
                                                                                 this.echo("product page opened");
                                                      });
                                                      /*
                                                      casper.waitFor(function check() {
                                                          return this.evaluate(function(wishlistID, wlName) {
                                                                 return $("#atwl-list-name-"+wishlistID).text().indexOf("wl") == 0;
                                                         });
                                                      }, function then() {    // step to execute when check() is ok
                                                         console.log(wishlistID +"is displayed!" );
                                                      }, function timeout() { // step to execute if check has failed
                                                       // this.echo('JSON:{"error":'+wishlistID+ ' is NOT displayed"}').exit();
                                                           },wishlistID,wlName);
                                                      */
                                                      casper.then(function () {

                                                                                 casper.evaluate(function (wlName) {

                                                                                                            __utils__.echo("select the wishlist name: " + wlName);
                                                                                                            /*
                                                                                                            for (i = 0; i < document.getElementsByClassName("atwl-dd-list-name").length ; i++) {
                                                                                                             __utils__.echo(document.getElementsByClassName("a-link-normal a-dropdown-link")[i].innerHTML.trim().substring(124,150));
                                                                                                             __utils__.echo(wlName);
                                                                                                             if((document.getElementsByClassName("a-link-normal a-dropdown-link")[i].innerHTML.trim().substring(124,150)).indexOf(wlName)==0){
                                                                                                                                      __utils__.echo("inside IF..");
                                                                                                                                      __utils__.echo( document.getElementsByClassName("atwl-dd-list-name")[i].innerHTML.trim() );
                                                                                                                                      document.getElementsByClassName("atwl-dd-list-name")[i].click();
                                                                                                                                      break;
                                                                                                                                  }
                                                                                                            }
                                                                                                            */
                                                                                                            $("#atwl-list-name-" + wlName).click();
                                                                                 }, wishlistID);

                                                                                 casper.capture(dataDir + "/addwishlist.png");
                                                                                 this.echo("product added to wishlist");
                                                      });

                                                      casper.then(function () {
                                                                                 this.echo("Added " + N + " ASINS");
                                                      });
                           }
}