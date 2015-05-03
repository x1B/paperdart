/**
 * Copyright 2015 Michael Kurze
 * Released under the MIT license.
 */
define( [
   'angular',
   'laxar',
   'laxar_patterns',
   'angular-bootstrap'
], function( ng, ax, patterns ) {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Controller.$inject = [ '$scope' ];

   function Controller( $scope ) {
      $scope.resources = {};

      $scope.model = {
         mimeTypes: [
            { mime: 'text/x-markdown', label: 'Markdown' },
            { mime: 'text/html', label: 'HTML' },
            { mime: 'text/css', label: 'CSS' },
            { mime: 'text/javascript', label: 'JavaScript' }
         ],
         source: {
            text: '',
            mimeType: 'text/plain'
         }
      };

      $scope.view = {
         showMimeTypes: false,
         typeLabels: kv( $scope.model.mimeTypes, 'mime', 'label' )
      };

      $scope.commands = {
         selectMimeType: function( type ) {
            if( $scope.model.source ) {
               $scope.model.source.mimeType = type.mime;
            }
         }
      };

      patterns.resources.handlerFor( $scope ).registerResourceFromFeature( 'source', {
         onUpdateReplace: function() {
            $scope.model.source = ax.object.deepClone( $scope.resources.source );
         }
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      var updatePublisher = patterns.resources.updatePublisherForFeature( $scope, 'source', {
         deliverToSender: false
      } );
      var updateSourceWithDebounce = ax.fn.debounce( updateSourceResource, 100 );
      $scope.$watch( 'model.source.text', updateSourceWithDebounce );
      $scope.$watch( 'model.source.mimeType', updateSourceWithDebounce );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function updateSourceResource() {
         if( $scope.model.source || $scope.resources.source ) {
            updatePublisher.compareAndPublish( $scope.resources.source, $scope.model.source );
            $scope.resources.source = ax.object.deepClone( $scope.model.source );
         }
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function kv( records, keyField, valueField ) {
      var result = {};
      records.forEach( function( tuple ) { result[ tuple[ keyField ] ] = tuple[ valueField ]; } );
      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return ng.module( 'pdSourceEditorWidget', [ 'ui.bootstrap' ] )
      .controller( 'PdSourceEditorWidgetController', Controller );

} );
