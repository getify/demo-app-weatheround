import { Link, routes } from '@redwoodjs/router'


export default SiteLayout


// *******************

function SiteLayout({ children }) {
  return (
    <>
      <div id="page">
        <header>
          <h1 aria-label="WeatheRound">
            <Link
              to={routes.home()}
              onClick={clearHomeState}
            >
              <i>W</i>eathe<i>r</i>ound
            </Link>
          </h1>
        </header>
        <main>{children}</main>
        <footer>
          <hr />
          <hr />

          &copy;2023 Kyle Simpson

          {' '}|{' '}

          <Link
            to={routes.home()}
            onClick={clearHomeState}
          >
            Weather
          </Link>

          {' '}|{' '}

          <Link to={routes.about()}>About</Link>

          {' '}|{' '}

          <a
            href="https://github.com/getify/demo-app-weatheround"
            target="_blank"
          >
            Source (Github)
          </a>
        </footer>
      </div>
    </>
  )

  // *******************

  function clearHomeState() {
    document.dispatchEvent(
      new Event('clear-home-state')
    )
  }
}
