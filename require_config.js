var require = {
   baseUrl: 'bower_components',
   deps: [
      'es6-promise/promise',
      'fetch/fetch'
   ],
   paths: {
      // LaxarJS Core:
      requirejs: 'requirejs/require',
      text: 'requirejs-plugins/lib/text',
      json: 'requirejs-plugins/src/json',
      angular: 'angular/angular',
      'angular-mocks': 'angular-mocks/angular-mocks',
      'angular-route': 'angular-route/angular-route',
      'angular-sanitize': 'angular-sanitize/angular-sanitize',
      jjv: 'jjv/lib/jjv',
      jjve: 'jjve/jjve',

      // LaxarJS Core Testing:
      jasmine: 'jasmine/lib/jasmine-core/jasmine',
      q_mock: 'q_mock/q',

      // LaxarJS Patterns:
      'json-patch': 'fast-json-patch/src/json-patch-duplex',

      // LaxarJS UIKit:
      jquery: 'jquery/dist/jquery',
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
      'laxar-application': '..',
      'laxar-app-dependencies': '../var/static/laxar_application_dependencies',


      // Widgets:
      'angular-bootstrap': 'angular-bootstrap/ui-bootstrap',
      'angular-ui-codemirror': 'angular-ui-codemirror/ui-codemirror',

      'paperdart': '../includes/lib/paperdart/paperdart'
   },
   shim: {
      angular: {
         deps: [ 'jquery' ],
         exports: 'angular'
      },
      'angular-mocks': {
         deps: [ 'angular' ],
         init: function ( angular ) {
            'use strict';
            return angular.mock;
         }
      },
      'angular-route': {
         deps: [ 'angular' ],
         init: function ( angular ) {
            'use strict';
            return angular;
         }
      },
      'angular-sanitize': {
         deps: [ 'angular' ],
         init: function ( angular ) {
            'use strict';
            return angular;
         }
      },
      'angular-bootstrap': {
         deps: [ 'angular' ],
         init: function ( angular ) {
            'use strict';
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
         init: function ( angular, codemirror ) {
            'use strict';
            window.CodeMirror = codemirror;
            return angular.module( 'ui.codemirror' );
         }
      },
      'json-patch': {
         exports: 'jsonpatch'
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
   ]
};
