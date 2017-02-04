requirejs.config({
    baseUrl: "js",
    paths: {
        'move': 'libs/move.min',
    },
});


requirejs([ "src/main"], function(Test) {

    var testOne = new Test({
        domWrapId: "#mainPage",
        hostUrl: "mock_url",
    });

});