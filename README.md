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

# for development only: allow CORS
elasticsearch --config=./application/elasticsearch/development.yml &

# start the development frontend
npm start

```


### Production Setup

To get around CORS restrictions, it is recommended to install Paperdart as an elasticsearch plugin:

```sh

# assuming that the development setup has been performed successfully
cd path/to/paperdart

npm run-script optimize

# assuming this is matching your elasticsearch home folder:
mkdir -p /usr/local/Cellar/elasticsearch/1.4.4/plugins/paperdart

cp -r ./* /usr/local/Cellar/elasticsearch/1.4.4/plugins/paperdart/

```

