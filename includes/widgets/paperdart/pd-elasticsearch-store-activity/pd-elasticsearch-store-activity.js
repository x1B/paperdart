/**
 * Copyright 2015 Michael Kurze
 * Released under the MIT license.
 */
define( [
   'laxar',
   'laxar_patterns'
], function( ax, patterns ) {
   'use strict';

   Controller.$inject = [ 'axContext', 'axEventBus' ];

   function Controller( context, eventBus ) {

      var win = window;
      var fetch = win.fetch;

      var esHost = win.location.protocol + '//' + config( 'host', win.location.host );
      var esIndex = config( 'index', 'paperdart' );
      var esType = config( 'type', 'paste' );

      context.resources = {};
      context.flags = {};
      context.model = { dirty: false };

      context.features.create.onActions.forEach( function( action ) {
         eventBus.subscribe( 'takeActionRequest.' + action, performCreateAction );
      } );

      context.features.update.onActions.forEach( function( action ) {
         eventBus.subscribe( 'takeActionRequest.' + action, performUpdateAction );
      } );

      context.features.reset.onActions.forEach( function( action ) {
         eventBus.subscribe( 'takeActionRequest.' + action, performResetAction );
      } );

      patterns.resources.handlerFor( context ).registerResourceFromFeature( 'paste', {
         onUpdate: function() {
            context.model.dirty = !!context.resources.paste.id;
            updateFlags();
         },
         onReplace: function() {
            context.model.dirty = false;
            updateFlags();
         }
      } );

      eventBus.subscribe( 'didNavigate', initializePaste );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function initializePaste( navigateEvent ) {
         var initial = {
            mimeType: 'text/x-markdown',
            text: '',
            title: null,
            id: null
         };

         if( navigateEvent.data ) {
            var id = navigateEvent.data[ context.features.paste.parameter ];
            if( id === 'intro' ) {
               initial.text = INTRO_TEXT;
            }
            else if( id ) {
               return fetchPaste( id );
            }
         }

         context.resources.paste = initial;
         return propagatePasteResource();
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function updateFlags() {
         var resource = context.resources.paste;
         context.features.flags.forEach( function( flagEntry ) {
            var flag = flagEntry.flag;
            var value = ( flagEntry.condition === 'AVAILABLE' && !!resource ) ||
               ( flagEntry.condition === 'DIRTY' && context.model.dirty ) ||
               ( flagEntry.condition === 'EMPTY' && ( !resource.text && !resource.title ) ) ||
               ( resource.mimeType === flagEntry.mimeType );

            if( !( flag in context.flags ) || value !== context.flags[ flag ] ) {
               context.flags[ flag ] = value;
               eventBus.publish( 'didChangeFlag.' + flag + '.' + value, {
                  flag: flag,
                  state: value
               } );
            }
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function performCreateAction( event ) {
         var paste = context.resources.paste;
         if( paste.id ) {
            paste.originId = paste.id;
         }
         return submit( event, paste, null );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function performUpdateAction( event ) {
         var paste = context.resources.paste;
         return submit( event, paste, context.resources.paste.id );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function performResetAction( event ) {
         eventBus.publish( 'willTakeAction.' + event.action, { action: event.action } );
         return navigateToPaste( '' ).then( function() {
            eventBus.publish( 'didTakeAction.' + event.action, { action: event.action } );
         } );
      }

      ///////////////////////////////////////// ///////////////////////////////////////////////////////////////

      function submit( event, paste, id ) {
         eventBus.publish( 'willTakeAction.' + event.action, { action: event.action } );
         return fetch( pasteUrl( id ), {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify( paste )
         } ).then(
            function( response ) {
               if( response.ok ) {
                  return response.json().then( function ( body ) {
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
            var operation = id ? 'update' : 'create';
            report( 'Could not ' + operation + ' paste', 'index', error );
            eventBus.publish( 'didTakeAction.' + event.action, {
               action: event.action,
               outcome: 'ERROR'
            } );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function navigateToPaste( id ) {
         return eventBus.publish( 'navigateRequest', {
            target: context.features.paste.target,
            data: {
               paste: id
            }
         } );
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

      var replacePublisher = patterns.resources.replacePublisherForFeature( context, 'paste' );
      function propagatePasteResource() {
         context.model.dirty = false;
         updateFlags();
         return replacePublisher( context.resources.paste );
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

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var INTRO_TEXT =
      '# This is a Pastebin!\n\n' +
      '> Paste content, create a link to share it!\n\n' +
      'Replace this text with something you would like to share. ' +
      'Hit the _Save_ button to generate a unique URL for your paste, or to update an existing paste.\n\n' +
      'Select your content type above to change syntax highlighting. ' +
      'There is an automatic preview for _Markdown_ and _HTML_ content.\n';

   return {
      name: 'pdElasticsearchStoreActivity',
      create: Controller,
      injections: Controller.$inject
   };

} );
