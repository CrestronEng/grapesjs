# [GrapesJS](http://grapesjs.com)

<p align="center"><img src="http://grapesjs.com/img/grapesjs-front-page-m.jpg" alt="GrapesJS" width="500" align="center"/></p>


GrapesJS is a free and open source Web Builder Framework which helps building HTML templates, faster and easily, to be delivered in sites, newsletters or mobile apps. Mainly, GrapesJS was designed to be used inside a [CMS] to speed up the creation of dynamic templates. To better understand this concept check the image below

## Table of contents

* [Features](#features)
* [Download](#download)
* [Usage](#usage)
* [Development](#development)
* [Documentation](#documentation)
* [API](#api)
* [Testing](#testing)
## Features

| Blocks | Style Manager | Layer Manager |
|--|--|--|
|<img  src="http://grapesjs.com/img/sc-grapesjs-blocks-prp.jpg"  alt="GrapesJS - Block Manager"  height="400"  align="center"/>|<img  src="http://grapesjs.com/img/sc-grapesjs-style-2.jpg"  alt="GrapesJS - Style Manager"  height="400"  align="center"/>|<img  src="http://grapesjs.com/img/sc-grapesjs-layers-2.jpg"  alt="GrapesJS - Layer Manager"  height="400"  align="center"/>|

| Code Viewer | Asset Manager |
|--|--|
|<img  src="http://grapesjs.com/img/sc-grapesjs-code.jpg"  alt="GrapesJS - Code Viewer"  height="300"  align="center"/>|<img  src="http://grapesjs.com/img/sc-grapesjs-assets-1.jpg"  alt="GrapesJS - Asset Manager"  height="250"  align="center"/>|

* Local and remote storage

* Default built-in commands (basically for creating and managing different components)

For the development purpose you should follow instructions below.

## Development

GrapesJS uses [Webpack](https://github.com/webpack/webpack) as a module bundler and [Babel](https://github.com/babel/babel) as a compiler.

Clone the repository and install all the necessary dependencies

```sh
$ git clone https://nj-github.crestron.crestron.com/CrestronEngineering/grapesjs
$ cd grapesjs
$ npm i
```

Start the dev server

```sh
$ npm start
```

Once the development server is started you should be able to reach the demo page (eg. `http://localhost:8080`)

# Updating from origin 

This repository is a fork of the original [grapesjs](https://github.com/artf/grapesjs)
to update with the upstream repository the following needs to be done in order to setup the origin
```sh
git remote add upstream https://github.com/artf/grapesjs.git
git fetch upstream
git checkout dev
git merge upstream/dev

```
to fetch all upstream tags you can run the following:
```sh
git fetch upstream --tags
```

## Documentation

Check the getting started guide here: [Documentation]
## API

API References could be found here: [API-Reference]
## Testing

```sh
$ npm test
```
## Plugins

Find out more about plugins here: [Creating plugins](https://grapesjs.com/docs/modules/Plugins.html)
## License

BSD 3-clause


[Documentation]: <https://grapesjs.com/docs/>
[API-Reference]: <https://grapesjs.com/docs/api/>
[CMS]: <https://it.wikipedia.org/wiki/Content_management_system>
