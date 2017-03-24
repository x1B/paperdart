/**
 * Copyright 2015-2017 aixigo AG
 * Released under the MIT license
 */
import vue from 'vue';
vue.config.productionTip = false;

import { create } from 'laxar';
import * as vueAdapter from 'laxar-vue-adapter';
import artifacts from 'laxar-loader/artifacts?flow=main&theme=mdlite';

const configuration = {
   name: 'paperdart',
   logging: { threshold: 'TRACE' },
   theme: 'mdlite',
   router: {
      navigo: { useHash: true }
   }
};

create( [ vueAdapter ], artifacts, configuration )
   .flow( 'main', document.querySelector( '[data-ax-page]' ) )
   .bootstrap();
