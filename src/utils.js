const fs = require('fs');

exports.readConf = function(ref){
    if(!ref) ref = './login.json';

    let rawdata = fs.readFileSync(ref);
    let conf = JSON.parse(rawdata);
    return conf;
}