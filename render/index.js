var phantom = require('phantom');

function render(done) {
    phantom.create(function (ph) {
        ph.createPage(function (page) {
            page.onConsoleMessage = function(msg) {
                console.log(msg);
            };

            page.open("http://www.google.com", function (status) {
                page.evaluate(function () {
                    return document.title;
                });

                page.render('test.png');
                ph.exit();
                done();
            });
        });
    });

    return "test";
}

module.exports = render;
