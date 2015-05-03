/**
 * Copyright 2015 Michael Kurze
 * Released under the MIT license.
 */
define( [
   'angular'
], function( ng ) {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Controller.$inject = [ 'axContext', 'axEventBus' ];

   function Controller( context, eventBus ) {

      context.features.save.onActions.forEach( function( action ) {
         eventBus.subscribe( 'takeActionRequest.' + action, function ( event ) {
            eventBus.publish( 'willTakeAction.' + event.action );
            // :TODO: create/update resource, then:
            eventBus.publish( 'didTakeAction.' + event.action );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      eventBus.subscribe( 'didNavigate', function() {
         // :TODO: fetch resource, based on place parameters
         fetchInitialResource();
      } );

      function fetchInitialResource() {
         eventBus.publish( 'didReplace.' + context.features.paste.resource, {
            resource: context.features.paste.resource,
            data: {
               mimeType: "text/x-markdown",
               text: "# Hello"
            }
         } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return ng.module( 'pdElasticsearchStoreActivity', [] )
      .controller( 'PdElasticsearchStoreActivityController', Controller );

} );
