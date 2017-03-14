/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );

const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );

const nodeEnv = process.env.NODE_ENV;
const isProduction = nodeEnv === 'production';
const isBrowserSpec = nodeEnv === 'browser-spec';
const processPlugins = {
   'production': productionPlugins,
   'browser-spec': browserSpecPlugins
}[ nodeEnv ] || ( _ => _ );

const publicPath = isProduction ? '/var/dist/' : '/var/build/';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const config = {
   entry: {
      'app': './init.js',
      'vendor': [
         'laxar/dist/polyfills', 'laxar', 'laxar-vue-adapter', 'vue'
      ]
   },

   output: {
      path: path.resolve( `./${publicPath}` ),
      publicPath,
      filename: isProduction ? '[name].bundle.min.js' : '[name].bundle.js'
   },

   plugins: processPlugins( basePlugins() ),

   resolve: {
      descriptionFiles: [ 'package.json', 'bower.json' ],
      modules: [
         path.resolve( './node_modules' )
      ],
      extensions: [ '.js', '.vue' ],
      alias: {
         'default.theme': path.resolve( 'laxar-uikit/themes/default.theme' )
      }
   },

   module: {
      noParse: [
         /bower_components[/\\]page[/\\]page.js/,
         /bower_components[/\\]angular*[/\\]*.js/
      ],
      rules: [
         {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
         },
         {
            test: /\.vue$/,
            exclude: /node_modules/,
            loader: 'vue-loader'
         },
         {
            test: /.spec.js$/,
            exclude: /node_modules/,
            loader: 'laxar-mocks/spec-loader'
         },

         {  // load styles, images and fonts with the file-loader
            // (out-of-bundle in var/build/assets/)
            test: /\.(gif|jpe?g|png|ttf|woff2?|svg|eot|otf)(\?.*)?$/,
            loader: 'file-loader',
            options: {
               name: isProduction ? 'assets/[name]-[sha1:hash:8].[ext]' : 'assets/[name].[ext]'
            }
         },
         {  // ... after optimizing graphics with the image-loader ...
            test: /\.(gif|jpe?g|png|svg)$/,
            loader: 'img-loader?progressive=true'
         },
         {  // ... and resolving CSS url()s with the css loader
            // (extract-loader extracts the CSS string from the JS module returned by the css-loader)
            test: /\.(css|s[ac]ss)$/,
            loader: isProduction ?
               ExtractTextPlugin.extract( { fallbackLoader: 'style-loader', loader: 'css-loader' } ) :
               'style-loader!css-loader'
         },
         {  // load scss files by precompiling with the sass-loader
            test: /\/default.theme\/.*\.s[ac]ss$/,
            loader: 'sass-loader',
            options: {
               includePaths: [
                  'bootstrap-sass/assets/stylesheets',
                  'laxar-uikit/themes/default.theme/scss',
                  'laxar-uikit/scss'
               ].map( p => path.resolve( __dirname, 'node_modules', p ) )
            }
         }
      ]
   }
};

if( isBrowserSpec ) {
   const WebpackJasmineHtmlRunnerPlugin = require( 'webpack-jasmine-html-runner-plugin' );
   let widgetsRoot;
   try {
      widgetsRoot = require( './laxar.config.js' ).paths.widgets || 'widgets';
   }
   catch( e ) {
      widgetsRoot = 'widgets';
   }
   const widgetsPattern = process.env.WIDGET ?
      path.join( widgetsRoot, process.env.WIDGET, 'spec', '*.spec.js' ) :
      path.join( widgetsRoot, 'shop-demo/*/spec/*.spec.js' );
   config.entry = WebpackJasmineHtmlRunnerPlugin.entry( `./${widgetsPattern}` );
   config.output = {
      path: path.resolve( path.join( process.cwd(), 'spec-output' ) ),
      publicPath: '/spec-output/',
      filename: '[name].bundle.js'
   };
}

module.exports = config;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function productionPlugins( plugins ) {
   return plugins.concat( [
      new webpack.SourceMapDevToolPlugin( { filename: '[name].bundle.min.js.map' } ),
      new webpack.optimize.UglifyJsPlugin( {
         compress: { warnings: false },
         sourceMap: true
      } ),
      new ExtractTextPlugin( { filename: '[name].bundle.css' } )
   ] );
}

function basePlugins() {
   return [
      new webpack.optimize.CommonsChunkPlugin( { name: 'vendor' } ),
      new webpack.SourceMapDevToolPlugin( { filename: '[name].bundle.js.map' } )
   ];
}

function browserSpecPlugins() {
   const WebpackJasmineHtmlRunnerPlugin = require( 'webpack-jasmine-html-runner-plugin' );
   return [
      new webpack.SourceMapDevToolPlugin( { filename: '[name].bundle.js.map' } ),
      new WebpackJasmineHtmlRunnerPlugin()
   ];
}
