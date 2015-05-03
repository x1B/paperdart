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
         host:  config( 'host', 'localhost:9200' ),
         log: config( 'logLevel', 'trace' )
      } );

      context.flags = {};
      context.resources = {};

      context.features.save.onActions.forEach( function( action ) {
         eventBus.subscribe( 'takeActionRequest.' + action, store );
      } );

      var replacePublisher = patterns.resources.replacePublisherForFeature( context, 'paste', {
         deliverToSender: true
      } );
      patterns.resources.handlerFor( context ).registerResourceFromFeature( 'paste', {
         onUpdateReplace: updateFlags
      } );

      eventBus.subscribe( 'didNavigate', initializePaste );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function updateFlags() {
         context.features.flags.forEach( function( flagEntry ) {
            var flag = flagEntry.flag;
            if( !flag in context.flags ) {
               context.flags[ flag ] = false;
            }

            var resource = context.resources.paste;
            var state = ( !flagEntry.mimeType && !resource ) || ( resource.mimeType === flagEntry.mimeType );
            if( state !== context.flags[ flag ] ) {
               context.flags[ flag ] = state;
               eventBus.publish( 'didChangeFlag.' + flag + '.' + state, {
                  flag: flag,
                  state: state
               } );
            }
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function initializePaste( navigateEvent ) {
         if( navigateEvent.data ) {
            var id = navigateEvent.data[ context.features.paste.parameter ];
            if( id ) {
               return fetchPaste( id );
            }
         }

         context.resources.paste = {
            mimeType: "text/x-markdown",
            text: "# Hello",
            title: null,
            id: null
         };
         replacePublisher( context.resources.paste );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function fetchPaste( id ) {
         esClient.get( { index: esIndex, type: esType, id: id } ).then(
            function( response ) {
               response._source.id = response._id;
               replacePublisher( response._source );
            },
            function( error ) {
               if( error.message.indexOf( 'IndexMissingException' ) === 0 ) {
                  return tryCreateIndex().then(
                     function() { return fetchPaste( id ); },
                     function( error ) { reportError( 'Could not create index', 'index.create', error ) }
                  );
               }
               if( error.message.indexOf( 'Not Found' ) === 0 ) {
                  return reportError( 'No paste with ID: ' + id + ' <a href="#/">new paste</a>', 'get', error );
               }
               return reportError( 'Could not fetch paste', 'get', error );
            }
         );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function tryCreateIndex() {
         return esClient.indices.create( { index: esIndex } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function store( event ) {
         eventBus.publish( 'willTakeAction.' + event.action, { action: event.action } );
         var paste = context.resources.paste;
         console.log( 'putting paste: ', paste );
         esClient.index( {
            index: esIndex,
            type: esType,
            body: paste,
            id: paste.id
         } ).then(
            function( response ) {
               eventBus.publish( 'didTakeAction.' + event.action, {
                  action: event.action
               } );

               if( context.resources.paste.id !== response._id ) {
                  eventBus.publish( 'navigateRequest', {
                     target: 'paste',
                     data: {
                        paste: response._id
                     }
                  } );
               }
            },
            function( error ) {
               ax.log.error( 'Elasticsearch `index` failed: ', error );
               eventBus.publish( 'didTakeAction.' + event.action, {
                  action: event.action,
                  outcome: 'ERROR'
               } );
            }
         );
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

   return {
      name: 'pdElasticsearchStoreActivity',
      create: Controller,
      injections: Controller.$inject
   };

} );
