/**
 * Copyright 2015 Michael Kurze
 * Released under the MIT license.
 */
define( [
   'laxar',
   'laxar_patterns',
   'paperdart'
], function( ax, patterns, paperdart ) {
   'use strict';

   Controller.$inject = [ 'axContext', 'axEventBus' ];

   function Controller( context, eventBus ) {

      var delegate = paperdart.createMasterDelegate( context, eventBus, {
         create: submit,
         read: fetchPaste,
         update: submit
      } );

      var win = window;
      var fetch = win.fetch;
      var esHost = win.location.protocol + '//' + config( 'host', win.location.host );
      var esIndex = config( 'index', 'paperdart' );
      var esType = config( 'type', 'paste' );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function submit( event, paste, maybeId ) {
         eventBus.publish( 'willTakeAction.' + event.action, { action: event.action } );
         return fetch( pasteUrl( maybeId ), {
            method: maybeId ? 'PUT' : 'POST',
            body: JSON.stringify( paste )
         } ).then(
            function( response ) {
               if( response.ok ) {
                  return response.json().then( function ( body ) {
                     // :TODO: move this to the delegate
                     eventBus.publish( 'didTakeAction.' + event.action, {action: event.action} );
                     context.model.dirty = false;
                     updateFlags();

                     if ( context.resources.paste.id !== body._id ) {
                        context.resources.paste.id = body._id;
                        navigateToPaste( body._id );
                     }
                  } );
               }
               handleError( response.statusText );
            },
            handleError
         );

         function handleError( error ) {
            var operation = maybeId ? 'update' : 'create';
            report( 'Could not ' + operation + ' paste', 'index', error );
            eventBus.publish( 'didTakeAction.' + event.action, {
               action: event.action,
               outcome: 'ERROR'
            } );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function fetchPaste( id ) {
         fetch( pasteUrl( id ) ).then(
            function( response ) {
               if( response.ok ) {
                  return response.json().then( function( body ) {
                     context.resources.paste = body._source;
                     context.resources.paste.id = body._id;
                     return propagatePasteResource();
                  } );
               }

               return response.json().then(
                  function( body ) {
                     if( body.error && body.error.indexOf( 'IndexMissingException' ) === 0 ) {
                        ax.log.info( 'No index ' + esIndex + '. Trying to create.' );
                        return tryCreateIndex().then(
                           function() { return fetchPaste( id ); },
                           function( error ) { report( 'Could not create index!', 'index.create', error ); }
                        );
                     }
                     return report(
                        'Could not find paste <em>' + id + '</em>! <a href="#/blank">Create new</a>',
                        'get', response
                     );
                  }
               );
            },
            function( error ) {
               return report( 'Could not fetch paste!', 'get', error );
            }
         );

      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function tryCreateIndex() {
         return fetch( esHost + '/' + esIndex + '/', { method: 'PUT' } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function pasteUrl( id ) {
         return esHost + '/' + esIndex + '/' + esType + '/' + ( id ? id : '' );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function report( message, esOperation, response ) {
         var msg =
            message + ' (Elasticsearch <em>' + esOperation + '</em> failed with ' + response.status +')';
         ax.log.info( msg );
         return eventBus.publish( 'didEncounterError.' + esOperation, { code: esOperation, message: msg } );
      }

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function config( key, fallback ) {
      return ax.configuration.get( 'widgets.paperdart.elasticsearch.' + key, fallback );
   }

   return {
      name: 'pdElasticsearchStoreActivity',
      create: Controller,
      injections: Controller.$inject
   };

} );
