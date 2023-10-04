import { Head } from '@redwoodjs/web'


export default AboutPage


// *******************

function AboutPage() {
  return (
    <>
      <Head>
        <title>About WeatheRound</title>
      </Head>

      <p className="justify-full">
        <strong>WeatheRound</strong> gives you nothing but free weather,
        year 'round. That's it, really. No ads, no cost, no tracking...
        nothing but simple, free weather info!
      </p>
      <p className="justify-full">
        The weather data comes from the FREE, NON-COMMERCIAL tier
        of the <a href="https://open-meteo.com/" target="_blank">Open Meteo service</a>,
        which is <a href="https://open-meteo.com/en/license" target="_blank">open licensed</a>
        {' '}under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a>.
      </p>
      <p className="justify-full">
        Some of the weather-related icons are from
        {' '}<a href="https://github.com/erikflowers/weather-icons" target="_blank">Weather Icons</a>,
        under the <a href="http://opensource.org/licenses/mit-license.html" target="_blank">MIT license</a>.
        The rest of the icons are from <a href="https://www.streamlinehq.com/" target="_blank">Streamline HQ</a>.
      </p>
      <hr />
      <p className="justify-full">
        This app demonstrates using <a href="https://redwoodjs.com" target="_blank">RedwoodJS</a>
        {' '}to build a static "serverless" web application.
      </p>
      <p>
        The source code for this app <a href="https://github.com/getify/demo-app-weatheround" target="_blank">can
        be found on Github</a>.
      </p>
    </>
  )
}
