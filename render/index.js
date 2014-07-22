var phantom = require('phantom');

function render(done) {
    phantom.create(function (ph) {
        ph.createPage(function (page) {
            page.onConsoleMessage = function(msg) {
                console.log(msg);
            };

            page.open("render/index.html", function (status) {
                page.evaluate(function () {
                    return document.title;
                });

                page.render('example/menu.png');
                ph.exit();
                done();
            });
        });
    });
}

module.exports = render;
