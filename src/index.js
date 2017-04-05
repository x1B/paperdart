/* eslint-env node */


const configuration = {
   port: 3030,
   host: 'localhost',
   paths: {
      frontend: 'frontend'
   }
};

const app = require( './app' );
const server = app( configuration ).listen( configuration.port );

server.on( 'listening', () => {
   console.log( `Pastebin application started on ${configuration.host}:${configuration.port}` );
} );
