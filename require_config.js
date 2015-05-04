var require = {
   baseUrl: 'bower_components',
   deps: [
   ],
   shim: {
      angular: {
         deps: [
            'jquery'
         ],
         exports: 'angular'
      },
      'angular-mocks': {
         deps: [
            'angular'
         ],
         init: function ( angular ) {
            'use strict';
            return angular.mock;
         }
      },
      'angular-route': {
         deps: [
            'angular'
         ],
         init: function ( angular ) {
            'use strict';
            return angular;
         }
      },
      'angular-sanitize': {
         deps: [
            'angular'
         ],
         init: function ( angular ) {
            'use strict';
            return angular;
         }
      },
      'angular-bootstrap': {
         deps: [ 'angular' ],
         init: function( angular ) {
            return angular.module( 'ui.bootstrap' );
         }
      },
      'angular-ui-codemirror': {
         deps: [
            'angular',
            'codemirror/lib/codemirror',
            'codemirror/mode/javascript/javascript',
            'codemirror/mode/markdown/markdown',
            'codemirror/mode/htmlmixed/htmlmixed',
            'codemirror/mode/css/css'
         ],
         init: function( angular, codemirror ) {
            window.CodeMirror = codemirror;
            return angular.module( 'ui.codemirror' );
         }
      },
      'toastr': [ 'jquery' ],
      'bootstrap-affix': {
         deps: [ 'jquery' ]
      },
      'bootstrap-tooltip': {
         deps: [ 'jquery' ]
      },
      'json-patch': {
         exports: 'jsonpatch'
      },
      'trunk8': {
         deps: [ 'jquery' ]
      }
   },
   packages: [
      {
         name: 'laxar',
         location: 'laxar',
         main: 'laxar'
      },
      {
         name: 'laxar_patterns',
         location: 'laxar_patterns',
         main: 'laxar_patterns'
      },
      {
         name: 'laxar_uikit',
         location: 'laxar_uikit',
         main: 'laxar_uikit'
      },
      {
         name: 'moment',
         location: 'moment',
         main: 'moment'
      }
   ],
   paths: {
      // LaxarJS Core:
      requirejs: 'requirejs/require',
      jquery: 'jquery/dist/jquery',
      underscore: 'underscore/underscore',
      angular: 'angular/angular',
      'angular-mocks': 'angular-mocks/angular-mocks',
      'angular-route': 'angular-route/angular-route',
      'angular-sanitize': 'angular-sanitize/angular-sanitize',
      jjv: 'jjv/lib/jjv',
      jjve: 'jjve/jjve',

      // LaxarJS Core Testing:
      jasmine: 'jasmine/lib/jasmine-core/jasmine',
      q_mock: 'q_mock/q',

      // LaxarJS Core Legacy:
      text: 'requirejs-plugins/lib/text',
      json: 'requirejs-plugins/src/json',

      // LaxarJS Patterns:
      'json-patch': 'fast-json-patch/src/json-patch-duplex',

      // LaxarJS UIKit:
      jquery_ui: 'jquery_ui/ui',
      'bootstrap-tooltip': 'bootstrap-sass-official/assets/javascripts/bootstrap/tooltip',
      'bootstrap-affix': 'bootstrap-sass-official/assets/javascripts/bootstrap/affix',
      trunk8: 'trunk8/trunk8',

      // App Parts:
      'laxar-path-root': '..',
      'laxar-path-layouts': '../application/layouts',
      'laxar-path-pages': '../application/pages',
      'laxar-path-widgets': '../includes/widgets',
      'laxar-path-themes': '../includes/themes',
      'laxar-path-flow': '../application/flow/flow.json',

      // App-specific, LaxarJS-related paths
      'laxar-app-dependencies': '../var/static/laxar_application_dependencies',


      // Widgets:
      'angular-bootstrap': 'angular-bootstrap/ui-bootstrap',
      'angular-ui-codemirror': 'angular-ui-codemirror/ui-codemirror',
      'toastr': 'toastr/toastr'
   }
};
