const replace = require('replace-in-file');
const argv = require('minimist')(process.argv.slice(2));


if( !('version' in argv)) {
    console.error('No version supplied');
    process.exit(1);
}

const buildVersion = argv['version'];

const time = (new Date()).toDateString();

const options = {
    files:'src/environments/environment.prod.ts',
    from: [/version:\s*'(.*)'/, /buildTime:\s*'(.*)'/],
    to: [`version:'${buildVersion}'`, `buildTime:'${time}'`],
    allowEmptyPaths:false,
}

replace(options).then(results => {
    console.log('[PRE-BUILD] Replacement results:',results);
}).catch(error => {
    console.error('[PRE-BUILD] Error:',error);
    process.exit(1);
});