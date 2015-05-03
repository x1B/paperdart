/**
 * Copyright 2015 Michael Kurze
 * Released under the MIT license.
 */
define( [
   '../pd-source-editor-widget',
   'laxar/laxar_testing'
], function( widgetModule, ax ) {
   'use strict';

   describe( 'A PdSourceEditorWidget', function() {

      var testBed_;

      beforeEach( function setup() {
         testBed_ = ax.testing.portalMocksAngular.createControllerTestBed( 'paperdart/pd-source-editor-widget' );
         testBed_.featuresMock = {};

         testBed_.useWidgetJson();
         testBed_.setup();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         testBed_.tearDown();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'still needs some tests.' );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

   } );
} );
