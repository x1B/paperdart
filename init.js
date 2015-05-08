/**
 * Copyright 2015 Michael Kurze
 * Released under the MIT license.
 */
require( [
   'laxar-app-dependencies',
   'laxar',
   'json!laxar-application/var/listing/application_resources.json',
   'json!laxar-application/var/listing/bower_components_resources.json',
   'json!laxar-application/var/listing/includes_resources.json'
], function( widgetModules, ax, appResources, bowerResources, includeResources ) {
   'use strict';
   window.laxar.fileListings = {
      application: appResources,
      bower_components: bowerResources,
      includes: includeResources
   };
   ax.bootstrap( widgetModules );
} );
