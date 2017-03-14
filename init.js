/**
 * Copyright 2015-2017 aixigo AG
 * Released under the MIT license
 */
import 'laxar/dist/polyfills';
import vue from 'vue';
vue.config.productionTip = false;

import { bootstrap } from 'laxar';

import * as vueAdapter from 'laxar-vue-adapter';
import artifacts from 'laxar-loader/artifacts?flow=main';

const configuration = {
   name: 'paperdart'
};

bootstrap( document.querySelector( '[data-ax-page]' ), {
   widgetAdapters: [ vueAdapter ],
   configuration,
   artifacts
} );
