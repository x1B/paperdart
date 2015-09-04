// See https://github.com/LaxarJS/laxar/blob/master/docs/manuals/configuration.md
window.laxar = ( function() {
   'use strict';

   var modeAttribute = 'data-ax-application-mode';
   var mode = document.querySelector( 'script[' + modeAttribute + ']' ).getAttribute( modeAttribute );

   return {
      name: 'paperdart',
      description: 'A pastebin as an Elasticsearch plugin, built using LaxarJS',
      theme: 'default',

      useMergedCss: mode === 'PRODUCTION',
      useEmbeddedFileListings: mode === 'PRODUCTION',
      eventBusTimeoutMs: (mode === 'PRODUCTION' ? 120 : 10) * 1000,

      widgets: {
         paperdart: {
            elasticsearch: {
               host: 'localhost:9200',
               index: 'paperdart'
            }
         }
      }
   };

} )();
