/**
 * Copyright 2015 Michael Kurze
 * Released under the MIT license.
 */
define( [
   'laxar',
   'laxar_patterns',
   'elasticsearch/elasticsearch'
], function( ax, patterns, es ) {
   'use strict';

   Controller.$inject = [ 'axContext', 'axEventBus' ];

   function Controller( context, eventBus ) {
      var esIndex = config( 'index', 'paperdart' );
      var esType = config( 'type', 'paste' );
      var esClient = new es.Client( {
         host: config( 'host', window.location.host ),
         log: config( 'logLevel', 'trace' )
      } );

      context.resources = {};
      context.flags = {};
      context.model = {
         dirty: false
      };

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
         onUpdateReplace: function() {
            context.model.dirty = !!context.resources.paste.id;
            updateFlags();
         }
      } );

      eventBus.subscribe( 'didNavigate', initializePaste );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function initializePaste( navigateEvent ) {
         var initial = {
            mimeType: "text/x-markdown",
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
            if( !flag in context.flags ) {
               context.flags[ flag ] = false;
            }

            var value = ( flagEntry.condition === "AVAILABLE" && !!resource )
               || ( flagEntry.condition === "DIRTY" && context.model.dirty )
               || ( flagEntry.condition === "EMPTY" && ( !resource.text && !resource.title ) )
               || ( resource.mimeType === flagEntry.mimeType );

            if( value !== context.flags[ flag ] ) {
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
         return esClient.index( {
            index: esIndex,
            type: esType,
            body: paste,
            id: id
         } ).then(
            function( response ) {
               eventBus.publish( 'didTakeAction.' + event.action, { action: event.action } );
               context.model.dirty = false;
               updateFlags();

               if( context.resources.paste.id !== response._id ) {
                  context.resources.paste.id = response._id;
                  navigateToPaste( response._id );
               }
            },
            function( error ) {
               var operation = id ? 'update' : 'create';
               reportError( 'Could not ' + operation + ' paste', 'index', error );
               eventBus.publish( 'didTakeAction.' + event.action, {
                  action: event.action,
                  outcome: 'ERROR'
               } );
            }
         );
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
         esClient.get( { index: esIndex, type: esType, id: id } ).then(
            function( response ) {
               context.resources.paste = response._source;
               context.resources.paste.id = response._id;
               return propagatePasteResource();
            },
            function( error ) {
               if( error.message.indexOf( 'IndexMissingException' ) === 0 ) {
                  return tryCreateIndex().then(
                     function() { return fetchPaste( id ); },
                     function( error ) { reportError( 'Could not create index!', 'index.create', error ); }
                  );
               }
               if( error.message.indexOf( 'Not Found' ) === 0 ) {
                  return reportError( 'Could not find paste ' + id + '! <a href="#/create">Create new</a>', 'get', error );
               }
               return reportError( 'Could not fetch paste!', 'get', error );
            }
         );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function tryCreateIndex() {
         return esClient.indices.create( { index: esIndex } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      var replacePublisher = patterns.resources.replacePublisherForFeature( context, 'paste' );
      function propagatePasteResource() {
         updateFlags();
         return replacePublisher( context.resources.paste );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function reportError( message, esOperation, esError, code ) {
         code = code || 'HTTP_GET';
         ax.log.error( message, esError );
         return eventBus.publish( 'didEncounterError.' + code, {
            code: code,
            message: message + ' (elasticsearch <em>' + esOperation + '</em> failed: ' + esError.message +')'
         } );
      }

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function config( key, fallback ) {
      return ax.configuration.get( 'widgets.paperdart.elasticsearch.' + key, fallback );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var INTRO_TEXT =
      "# This is a Pastebin!\n\n" +
      "> Paste content, create a link to share it!\n\n" +
      "Replace this text with something you would like to share. " +
      "Hit the _Save_ button to generate a unique URL for your paste, or to update an existing paste.\n\n" +
      "Select your content type above to change syntax highlighting. " +
      "There is an automatic preview for _Markdown_ and _HTML_ content.\n";

   return {
      name: 'pdElasticsearchStoreActivity',
      create: Controller,
      injections: Controller.$inject
   };

} );
