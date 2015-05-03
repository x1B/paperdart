# Paperdart

> A pastebin as an Elasticsearch plugin, built using LaxarJS

## Installation

Here are basic installation instructions for Mac OS X.
Other platforms should work similarly.


### Development Setup

```sh

# install elasticsearch, for example using homebrew
brew install elasticsearch

# get the app
git clone --recursive https://github.com/x1B/paperdart.git
cd paperdart
npm install

# change the entry `widgets.paperdart.elasticsearch.host` to 'localhost:9200'
vi application/application.js

# for development only: allow CORS
elasticsearch --config=./application/elasticsearch/development.yml &

# start the development frontend
npm start

```


### Production Setup

To get around CORS restrictions, it is recommended to install Paperdart as an elasticsearch plugin:

```sh

# make sure to adjust this to your plugins folder
mkdir -p /usr/local/var/lib/elasticsearch/plugins/paperdart/_site

# assuming that the development setup (above) has been performed successfully
cd path/to/paperdart

npm run-script optimize

cp -r ./* /usr/local/var/lib/elasticsearch/plugins/paperdart/_site

```
