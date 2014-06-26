var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open('test/runner.html', function(status) {
    var exitCode = 0:

    if (status !== 'success') {
        console.log('Unable to access network');
        
        exitCode = 1;
    }
    else {
        page.evaluate(function () {
            
        });
    }

    phantom.exit(exitCode);
});