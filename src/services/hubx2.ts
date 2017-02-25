/**
 * Dependencies
 */
var hubx = require("@startx/hubx-core");
var config = require("config");

/**
 * Logic
 */
const configuration = config.get("Core");

module.exports = hubx(configuration);