
let exp = module.exports = function(conf){

    ssh.connect({
        host: conf.host,
        username: conf.user,
        password: conf.pass
    })
    /*
    Or
    ssh.connect({
    host: 'localhost',
    username: 'steel',
    privateKey: fs.readFileSync('/home/steel/.ssh/id_rsa', 'utf8')
    })
    if you want to use the raw string as private key
    */
    .then(function() {
        console.log('connected...');

        let timelimit;

        function goGoGo(res){
            clearTimeout(timelimit);

            if(res){
                console.log("let's start the machine ;)");
            }
        }

        function testCmd(){
            ssh.execCommand('ls', {
                cwd: '/',
                onStdout(chunk) {
                    console.log('stdoutChunk', chunk.toString('utf8'));
                    goGoGo(true);
                },
                onStderr(chunk) {
                    console.log('stderrChunk', chunk.toString('utf8'));
                    goGoGo(false);
                },
            });
        }

        timelimit = setTimeout(()=>{
            testCmd();
        }, 2000);

        testCmd();

    })
}