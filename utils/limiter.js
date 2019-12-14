const Bottleneck = require("bottleneck/es5");
const limiter = new Bottleneck({
    minTime: 333
});

module.exports = limiter 