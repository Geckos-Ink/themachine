const theMachine = require('./src/');

const utils = require('./src/utils');
const conf = utils.readConf();

theMachine(conf);