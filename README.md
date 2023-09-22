# WeatheRound: Demo App

**WeatheRound** is a web application built to demo the integration of a few tools. Specifically, the app is built using [RedwoodJS framework](https://redwoodjs.com), which uses the [React library](https://react.dev/) for its front-end. It's built as a "serverless" (aka "jamstack") app, which uses

More importantly, the intent of **WeatheRound** is to show how simple -- **no code changes at all!** -- it is to use [Socket Supply Runtime](https://github.com/socketsupply/socket) to package a serverless web app into a native application **for each and every major consumer computing platform**, including: iOS, Android, ChromeOS, Windows, Mac OSX, and Linux.

To see the app running live, it's [hosted online at WeatheRound.com](https://weatheround.com).

## How It's Built

Here's a quick glimpse at some of the technology used in building this app.

### RedwoodJS

This app is built with latest [RedwoodJS](https://redwoodjs.com) v6 (6.3.1 at time of writing).

Since it's "serverless", the app only uses the "web" *side* (not the GraphQL "api" *side*).

### Frontend (React, etc)

Redwood currently uses [React library] v18 (18.2.0 at time of writing). The approach used for React is functional components with basic hooks for state management.

Other libraries used for the frontend:

* [Chart.js](https://www.chartjs.org/) v4 (4.4.0 at time of writing)

* [react-chartjs-2](https://react-chartjs-2.js.org/) v5 (5.2.0 at time of writing)

* [chartjs-plugin-datalabels](https://chartjs-plugin-datalabels.netlify.app/) v2 (2.2.0 at time of writing)

### Socket Supply Runtime

This web app can be built into native apps (for every platform!) via [Socket Supply Runtime](https://github.com/socketsupply/socket) v0.4 (0.4.0 at time of writing).

## Getting Started

To try this **WeatheRound** app out yourself, clone the repository, then install the dependencies:

```cmd
yarn install
```

### Running The Dev App

To run the app in your local dev environment:

```cmd
yarn rw dev web
```

This will start the dev server instance on `localhost` port `8910`, and open a browser instance for you there (`http://localhost:8910`).

RedwoodJS handles a lot of hot-reloading magic for you, so you shouldn't really need to restart this server much while making basic HTML/JS/CSS changes). You may need to refresh the browser on some types of changes though, or recovering from errors, etc.

### Deploying The Web App

To package the app as bare HTML/CSS/JS that's suitable to deploy on a static file web server host:

```cmd
yarn rw build --side web
```

This will put all the web resources into `./web/dist/`, and you can simply copy/push those files wherever you need to go.

We will need these files for the next step: **building a native app!**

### Building A Native App

First, follow the [installation guide](https://socketsupply.co/guides/#install) to install `ssc` for your development environment computing platform (Windows, Mac, Linux). **Note: some platforms can take quite awhile to install, so be patient!**

Once installed, to verify you have `ssc` running properly:

```cmd
ssc --version
```

You should see at least version `0.4.0` reported.

Next, create a new directory for your Socket app building to occur, such as `./socket-app` in the root of this repo project.

Switch into this directory and run:

```cmd
ssc init
```

This will create the basic scaffolding for a "Hello World"-style Socket app, including a `./socket-app/src/` directory with an `index.html` file in it.

To build and run the native app for your platform:

```cmd
ssc build -r
```

This should build and launch the "Hello World"-style app on your device. If that all works, you're good to go!

**TIP: Leave this app running, no need to close it.**

Finally, copy all the files from the `./web/dist/` directory into the `./socket-app/src/` directory; make sure to delete/replace the `index.html` that's in there to avoid confusion.

If you still have that Socket app instance running, you can just right-click in the webview area and click *Refresh* -- or use ctrl+R/cmd+R hotkey), and the new **WeatheRound** web app should load up!

**NOTE:** If you had previously closed the app, just rebuild/relaunch with `ssc build -r`.

That should be it!

From here forward, once you make changes in the Redwood web app context, don't forget to do `yarn rw build --side web` to push to `./web/dist/`, then copy *those* files over to `./socket-app/src/`.

To see your changes in the app instance, just refresh the webview!

**NOTE:** Live-Reload is coming soon!

#### Mobile Native Apps

To build the app for mobile platforms (iOS, Android, etc), follow [Socket's Mobile Guide](https://socketsupply.co/guides/#mobile-guide).

For example, on Windows, if I already have a USB-attached Android device (in debugging mode), I can run:

```cmd
ssc build -r --platform=android
```

That will build and launch the app on my Android device!

## License

All code and documentation are Public Domain and released under the MIT License. A copy of the MIT License [is also included](LICENSE.txt).
