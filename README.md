# purse_wishlist_tool

## To run the script
please do make sure node and python are installed
then perform the following command
### $ npm install
### $ bower install
## cd to public/script folder
## to create new wishlist and add itmes and billing address
$ casperjs --web-security=no index.js '{"account": "heer15@yopmail.com", "password": "At123456789", "dbc_login": "user555", "dbc_password": "qWW@8!yB7&", "gc": "1234-1234-1234-1234", "items": [ {"ASIN":"B00SCD17PY", "qty":"2", "url":""},   {"ASIN":"B00KMRGF3M", "qty":"3", "url":""},{"ASIN":"B007B5S52C", "qty":"2", "url":""}],  "billing_address": {"full_name": "Mr Sylvestor", "street1": "Some Mission St", "street2": "",  "city":"Tampa", "state":"FL",  "zip":"33605",  "country":"US", "phone":"1234567890"}}'
## to add items to existing wishlist

$ casperjs --web-security=no index.js '{"account": "heer15@yopmail.com", "password": "At123456789", "dbc_login": "user555", "dbc_password": "qWW@8!yB7&","wishlist_id": "TCFL6UFVDUTJ", "gc": "1234-1234-1234-1234", "items": [ {"ASIN":"B00SCD17PY", "qty":"2", "url":""},   {"ASIN":"B00KMRGF3M", "qty":"3", "url":""},{"ASIN":"B007B5S52C", "qty":"2", "url":""}],  "billing_address": {"full_name": "Mr Sylvestor", "street1": "Some Mission St", "street2": "",  "city":"Tampa", "state":"FL",  "zip":"33605",  "country":"US", "phone":"1234567890"}}'



Modify WLID 10HYBYLA0VXUS just goes here: https://www.amazon.com/gp/registry/wishlist/10HYBYLA0VXUS/settings.html

References:
https://developer.mozilla.org/en/docs/web/javascript/reference/statements/export