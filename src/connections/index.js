let exp = module.exports = function(conf){
    switch(conf.type){
        default: // or ssh
            return this.ssh(conf); 
    }
};

exp.ssh = function(conf){
    const {NodeSSH} = require('node-ssh')
    const ssh = new NodeSSH()

    ssh.connect({
        host: conf.host,
        username: conf.user,
        password: conf.pass
    })
}