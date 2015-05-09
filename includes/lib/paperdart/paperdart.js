/**
 * Copyright 2015 Michael Kurze
 * Released under the MIT license.
 *
 * Paperdart backend activities can create a delegate using this module, for handling their event bus traffic.
 */
define( [
   'laxar',
   'laxar_patterns'
], function( ax, patterns ) {
   'use strict';

   return {
      createMasterDelegate: createMasterDelegate
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createMasterDelegate( context, eventBus, operations ) {

      var api = { };

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

      var replacePublisher = patterns.resources.replacePublisherForFeature( context, 'paste' );
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

      var INTRO_TEXT =
             '# This is a Pastebin!\n\n' +
             '> Paste content, create a link to share it!\n\n' +
             'Replace this text with something you would like to share. ' +
             'Hit the _Save_ button to generate a unique URL for your paste, or to update an existing paste.\n\n' +
             'Select your content type above to change syntax highlighting. ' +
             'There is an automatic preview for _Markdown_ and _HTML_ content.\n';


      return api;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function updateFlags() {
         var resource = context.resources.paste;
         context.features.flags.forEach( function ( flagEntry ) {
            var flag = flagEntry.flag;
            var value = ( flagEntry.condition === 'AVAILABLE' && !!resource ) ||
               ( flagEntry.condition === 'DIRTY' && context.model.dirty ) ||
               ( flagEntry.condition === 'EMPTY' && ( !resource.text && !resource.title ) ) ||
               ( resource.mimeType === flagEntry.mimeType );

            if ( !( flag in context.flags ) || value !== context.flags[flag] ) {
               context.flags[flag] = value;
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
         if ( paste.id ) {
            paste.originId = paste.id;
         }
         return operations.create( event, paste, null );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function performUpdateAction( event ) {
         var paste = context.resources.paste;
         return operations.create( event, paste, context.resources.paste.id );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function performResetAction( event ) {
         eventBus.publish( 'willTakeAction.' + event.action, {action: event.action} );
         return navigateToPaste( '' ).then( function () {
            eventBus.publish( 'didTakeAction.' + event.action, {action: event.action} );
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function propagatePasteResource() {
         context.model.dirty = false;
         updateFlags();
         return replacePublisher( context.resources.paste );
      }

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

      function navigateToPaste( id ) {
         return eventBus.publish( 'navigateRequest', {
            target: context.features.paste.target,
            data: {
               paste: id
            }
         } );
      }

   }

} );