var moongose = require('mongoose');

module.exports = moongose.model('galleries', {
    identifier: {type: String, index: true, default: "-1"},
    accountIdentifier: {type: String, default: ""},
    originalName: {type: String, default: ""},
    localUrl: {type: String, default: ""},
    serverUrl: {type: String, default: ""},
    dateUploaded: {type: String, default: ""},
    url: {type: String, default: ""},
    mainColor: {type: String, default: ""},
    vibrantColor: {type: String, default: ""},
    vibrantDarkColor: {type: String, default: ""},
    vibrantLightColor: {type: String, default: ""}
});