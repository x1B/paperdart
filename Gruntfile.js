/**
 * Copyright 2015 Michael Kurze
 * Released under the MIT license.
 */
/*global module,__dirname,__filename */
module.exports = function( grunt ) {
   'use strict';

   var path = require( 'path' );

   var serverPort = 8000;
   var liveReloadPort = 30000 + serverPort;

   grunt.initConfig( {
      pkg: grunt.file.readJSON( 'package.json' ),
      connect: {
         options: {
            port: serverPort
         },
         default: {}
      },
      jshint: {
         options: {
            jshintrc: __dirname + '/.jshintrc'
         }
      },
      laxar_application_dependencies: {
         default: {
            options: {},
            dest: 'var/static/laxar_application_dependencies.js',
            src: [ 'application/flow/*.json' ]
         }
      },
      css_merger: {
         default: {
            src: [ 'application/flow/*.json' ]
         }
      },
      cssmin: {
         default: {
            options: {
               keepSpecialComments: 0
            },
            files: [ {
               expand: true,
               src: 'var/static/css/*.theme.css',
               ext: '.theme.css'
            } ]
         }
      },
      directory_tree: {
         application: {
            dest: 'var/listing/application_resources.json',
            src: [
               'application/flow/**/*.json',
               'application/layouts/**/*.css',
               'application/layouts/**/*.html',
               'application/pages/**/*.json'
            ],
            options: {
               embedContents: [
                  'application/flow/**/*.json',
                  'application/layouts/**/*.html',
                  'application/pages/**/*.json'
               ]
            }
         },
         bower_components: {
            dest: 'var/listing/bower_components_resources.json',
            src: [
               'bower_components/laxar_uikit/themes/**/*.css',
               'bower_components/laxar_uikit/controls/**/*.+(css|html)'
            ],
            embedContents: [ 'bower_components/laxar_uikit/controls/**/*.html' ]
         },
         includes: {
            dest: 'var/listing/includes_resources.json',
            src: [
               'includes/themes/**/*.+(css|html)',
               'includes/widgets/*/*/*.+(css|html|json)',
               '!includes/widgets/*/*/+(package|bower).json',
               'includes/widgets/*/*/!(bower_components|node_modules|spec)/**/*.+(css|html|json)'
            ],
            options: {
               embedContents: [
                  'includes/themes/**/controls/**/*.html',
                  'includes/widgets/*/*/widget.json',
                  'includes/widgets/*/*/*.theme/*.html',
                  'includes/widgets/*/*/*.theme/css/*.css'
               ]
            }
         }
      },
      concat: {
         build: {
            src: [
               'require_config.js',
               'bower_components/requirejs/require.js'
            ],
            dest: 'var/build/require_configured.js'
         }
      },
      requirejs: {
         default: {
            options: {
               mainConfigFile: 'require_config.js',
               deps: [ '../var/build/require_configured' ],
               name: '../init',
               out: 'var/build/bundle.js',
               optimize: 'uglify2'
            }
         }
      },
      watch: {
         options: {
            livereload: liveReloadPort,
            reload: false
         }
      }
   } );

   // Find all widget.json files,
   // take their directory names,
   // create or update the configuration
   grunt.file.expand( 'includes/widgets/*/*/widget.json' )
      .map( path.dirname )
      .forEach( function( widget ) {
         var config = grunt.config( 'widget.' + widget );
         grunt.config( 'widget.' + widget, grunt.util._.defaults( {}, config ) );
      } );

   grunt.loadNpmTasks( 'grunt-laxar' );
   grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
   grunt.loadNpmTasks( 'grunt-contrib-concat' );
   grunt.loadNpmTasks( 'grunt-contrib-watch' );

   grunt.registerTask( 'server', [ 'connect' ] );
   grunt.registerTask( 'build', [ 'directory_tree', 'laxar_application_dependencies' ] );
   grunt.registerTask( 'optimize', [ 'build', 'css_merger', 'concat', 'requirejs' ] );
   grunt.registerTask( 'test', [ 'server', 'widgets' ] );
   grunt.registerTask( 'default', [ 'build', 'test' ] );
   grunt.registerTask( 'dist', [ 'optimize' ] );
   grunt.registerTask( 'start', [ 'build', 'server', 'watch' ] );

};
