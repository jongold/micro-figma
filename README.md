# `micro-figma`

A tiny microservice that makes adding authentication with Figma to your application easy.

## Usage

[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/jongold/micro-figma&env=FIGMA_CLIENT_ID&env=FIGMA_CLIENT_SECRET&env=REDIRECT_URL)

Or, if you're old fashioned:

```sh
# Deploy this repository using now.sh
now jongold/micro-figma -e FIGMA_CLIENT_ID=12345 -e FIGMA_CLIENT_SECRET=12345 -e REDIRECT_URL=https://google.com
```

### Environment variables

You'll need to provide three environment variables when running `micro-figma`:

`now-secrets.json`
```json
{
  "figma-client-id": "12345",
  "figma-client-secret": "12345",
  "redirect-url": "https://google.com"
}
```

> Create an application on Figma [here](https://www.figma.com/developers/apps) to get your client id and secret if you haven't done that already.

When authentication was successful, the user will be redirected to the `REDIRECT_URL` with the `access_token`, `refresh_token` and `expires_in` query params to their respective responses from Figma.

You can then use that token to interact with the [Figma API](https://wild.figma.com/developers/docs) (e.g. with [`figma-js`](https://github.com/jongold/figma-js))!

> E.g. setting `REDIRECT_URL=https://google.com` will redirect them to `https://google.com/?access_token=asdf123`. (where `asdf123` is the provided access token)

### Finish setup

To make this work you have to set the authorization callback URL of [your application on Figma](https://github.com/settings/developers) to whatever URL `now` gave you plus the path `/callback` e.g. `http://localhost:3000/callback`:

![Authorization callback URL: 'your-url.now.sh'](https://user-images.githubusercontent.com/591643/40206206-de413c72-59e3-11e8-8141-72c904cee5c3.png)


To log people in provide a link to url `now` gave you plus the path `login` e.g. `http://localhost:3000/login` when they click on the link it will redirect to `https://www.figma.com/oauth`, with the appropriate params from `now-secrets.json`.

This will redirect them to the Figma sign in page for your app, which looks like this:

![Authorize my app to access your data on Figma](https://user-images.githubusercontent.com/591643/40206152-b07045ae-59e3-11e8-998f-c29b87efb881.png)

When authentication is successful, the user will be redirected to the `REDIRECT_URL` with the access token from Figma for you to use! 🎉

### Error handling

In case an error happens (either by the service or on Figma) the user will be redirected to the `REDIRECT_URL` with the `error` query param set to a relevant error message.

## Development

```sh
git clone git@github.com:jongold/micro-figma.git
```

Move `now-secrets.example.json` to `now-secrets.json` and fill in your Figma API details and redirect url.

```sh
npm run dev
```

The server will then be listening at `localhost:3000`, so set the authorization callback URL of your dev application on Figma to `http://localhost:3000/callback`.

## Updating

The `master` branch of this repository is what you will be deploying. To update to a new version with potential bugfixes, all you have to do is run the `now` command again and then set the authorization callback URL on Figma to the new URL that `now` gave you! 👌

## Gratitude

Thank you to [Max Stoiber](https://github.com/mxstbr) for [`micro-github`](https://github.com/mxstbr/micro-github), which this repo is based upon.

## License

Copyright (c) 2018 Jon Gold, licensed under the MIT license. See [LICENSE.md](LICENSE.md) for more information.
