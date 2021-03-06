/**
 * Copyright 2015 Michael Kurze
 * Released under the MIT license.
 */
define( [
   'angular',
   'laxar',
   'laxar-patterns',
   'angular-bootstrap',
   'angular-ui-codemirror'
], function( ng, ax, patterns ) {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Controller.$inject = [ '$scope', 'axEventBus', 'axFlowService', 'axVisibilityService' ];

   function Controller( $scope, eventBus, flowService, visibilityService ) {
      $scope.resources = {};

      $scope.model = {
         source: null,
         titleSuffix: document.title,
         mimeTypes: [
            { mime: 'text/css', label: 'CSS' },
            { mime: 'text/html', mode: 'htmlmixed', label: 'HTML' },
            { mime: 'text/javascript', label: 'JavaScript' },
            { mime: 'application/json', label: 'JSON' },
            { mime: 'text/plain', label: 'Plain Text  ' },
            { mime: 'text/x-markdown', label: 'Markdown' }
         ]
      };

      $scope.view = {
         showMimeTypes: false,
         link: null,
         originLink: null,
         typeLabels: kv( $scope.model.mimeTypes, 'mime', 'label' ),
         codemirrorOptions: {
            lineWrapping : true,
            lineNumbers: true,
            readOnly: false
         },
         codemirrorRefreshCount: 0
      };

      $scope.commands = {
         selectMimeType: selectMimeType,
         save: save
      };

      patterns.resources.handlerFor( $scope ).registerResourceFromFeature( 'source', {
         onUpdateReplace: function() {
            var source = ax.object.deepClone( $scope.resources.source );
            if( source.id ) {
               $scope.view.link = flowService.constructAnchor( '_self', { paste: source.id } );
            }
            $scope.view.originLink = source.originId ?
               flowService.constructAnchor( '_self', { paste: source.originId} ) :
               null;
            $scope.model.source = source;
            $scope.view.codemirrorOptions.mode = source.mimeType;
            ++$scope.view.codemirrorRefreshCount;
         }
      } );

      visibilityService.handlerFor( $scope ).onShow( function() {
         $scope.$apply( function() {
            ++$scope.view.codemirrorRefreshCount;
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      $scope.$watch( 'model.source.text', publishChanges );
      $scope.$watch( 'model.source.title', function( newValue ) {
         publishChanges();
         document.title = (newValue ? newValue + ' - ' : '' ) + $scope.model.titleSuffix;
      } );
      $scope.$watch( 'model.source.mimeType', publishChanges );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      var updatePublisher = patterns.resources.updatePublisherForFeature( $scope, 'source', {
         deliverToSender: true
      } );

      function publishChanges() {
         if( $scope.model.source && $scope.resources.source ) {
            updatePublisher.compareAndPublish( $scope.resources.source, $scope.model.source );
            $scope.resources.source = ax.object.deepClone( $scope.model.source );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function selectMimeType( type ) {
         if( $scope.model.source ) {
            $scope.model.source.mimeType = type.mime;
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function save() {
         if( !$scope.model.source ) {
            return;
         }
         $scope.view.busy = true;
         var saveAction = $scope.features.save.action;
         eventBus.publishAndGatherReplies( 'takeActionRequest.' + saveAction, {
            action: saveAction
         } ).then( function() {
            $scope.view.busy = false;
         } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function kv( records, keyField, valueField ) {
      var result = {};
      records.forEach( function( tuple ) { result[ tuple[ keyField ] ] = tuple[ valueField ]; } );
      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return ng.module( 'pdSourceEditorWidget', [ 'ui.bootstrap', 'ui.codemirror' ] )
      .controller( 'PdSourceEditorWidgetController', Controller );

} );
