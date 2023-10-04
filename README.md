# WeatheRound: Demo App

**WeatheRound** is a web application built to demo the integration of a few tools. Specifically, the app is built using [RedwoodJS framework](https://redwoodjs.com), which uses the [React library](https://react.dev/) for its front-end. It's built as a "serverless" (aka "jamstack") app, which uses

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

## License

All code and documentation are (c) 2023 Kyle Simpson and released under the MIT License. A copy of the MIT License [is also included](LICENSE.txt).
