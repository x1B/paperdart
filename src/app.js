/* eslint-env node */

const path = require( 'path' );
const express = require( 'express' );
const compression = require( 'compression' );
const cors = require( 'cors' );
const favicon = require( 'serve-favicon' );
const serveStatic = require( 'serve-static' );


module.exports = configuration => {

   const { paths, corsWhitelist = [] } = configuration;
   const { frontend: frontendPath } = paths;

   const app = express();
   const corsOptions = {
      origin( origin, callback ) {
         const originIsWhitelisted = corsWhitelist.indexOf( origin ) !== -1;
         callback( null, originIsWhitelisted );
      }
   };

   return app.use( compression() )
      .options( '*', cors( corsOptions ) )
      .use( cors( corsOptions ) )
      .use( favicon( path.join( frontendPath, 'favicon.ico' ) ) )
      .use( '/', serveStatic( frontendPath ) )
      .get( '/paste/:paste', ( req, res ) => {
         res.sendFile( path.join( frontendPath, 'index.html' ), {
            root: app.get( 'public' )
         } );
      } );

};
