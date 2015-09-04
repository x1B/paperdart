/**
 * Copyright 2015 Michael Kurze
 * Released under the MIT license.
 */
/*global module,__dirname,__filename */
module.exports = function( grunt ) {
   'use strict';

   var path = require( 'path' );

   var portIncrement = 1;
   var serverPort = 8000 + portIncrement;
   var testPort = 9000 + portIncrement;
   var liveReloadPort = 35000 + portIncrement;

   grunt.initConfig( {
      'laxar-configure': {
         options: {
            ports: {
               develop: serverPort,
               test: testPort,
               livereload: liveReloadPort
            },
            flows: [
               { target: 'main', src: 'application/flow/flow.json' }
            ]
         }
      }
   } );

   grunt.loadNpmTasks( 'grunt-laxar' );

   // basic aliases
   grunt.registerTask( 'test', [ 'laxar-test' ] );
   grunt.registerTask( 'build', [ 'laxar-build' ] );
   grunt.registerTask( 'dist', [ 'laxar-dist', 'compress' ] );
   grunt.registerTask( 'develop', [ 'laxar-develop' ] );
   grunt.registerTask( 'info', [ 'laxar-info' ] );

   // additional (possibly) more intuitive aliases
   grunt.registerTask( 'optimize', [ 'laxar-dist' ] );
   grunt.registerTask( 'start', [ 'laxar-develop' ] );
   grunt.registerTask( 'start-no-watch', [ 'laxar-develop-no-watch' ] );

   grunt.registerTask( 'default', [ 'build', 'test' ] );
};
