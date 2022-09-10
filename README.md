# Lord of the Rings SDK

[![npm version](https://badge.fury.io/js/@pipe01%2Fthe-one-sdk.svg)](https://badge.fury.io/js/@pipe01%2Fthe-one-sdk)

This SDK wraps the public [The One API](https://the-one-api.dev) and provides an easy way to query all of the available data.

By Felipe Martínez Tabaco.

## Installing

```shell
$ npm i @pipe01/the-one-sdk
```

## Usage

You will first need to create an account on the [The One API](https://the-one-api.dev/) website and get your API key, with this you can use all of the SDK's methods:

```js
import { createApi } from "@pipe01/the-one-sdk"

const api = createApi("MY-TOKEN");

const books = await api.books().get();

const gandalf = await api.characters().with("name", "==", "Gandalf").get();
```

## Tests

To run the tests you must clone this repository, then run `pnpm i` or `npm i` to install all required dependencies.

You can now run `pnpm test` or `npm run test` to run all tests. Note that you must provide an API key through the "TOKEN" environment variable.
