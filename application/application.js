// See https://github.com/LaxarJS/laxar/blob/master/docs/manuals/configuration.md
window.laxar = ( function() {
   'use strict';

   var modeAttribute = 'data-ax-application-mode';
   var mode = document.querySelector( 'script[' + modeAttribute + ']' ).getAttribute( modeAttribute );

   return {
      name: 'paperdart',
      description: 'A pastebin as an Elasticsearch plugin, built using LaxarJS',
      theme: 'default',

      fileListings: {
         'application': 'var/listing/application_resources.json',
         'bower_components': 'var/listing/bower_components_resources.json',
         'includes': 'var/listing/includes_resources.json'
      },
      useEmbeddedFileListings: mode === 'RELEASE',
      useMergedCss: mode === 'RELEASE',
      eventBusTimeoutMs: (mode === 'RELEASE' ? 120 : 10) * 1000
   };

} )();
