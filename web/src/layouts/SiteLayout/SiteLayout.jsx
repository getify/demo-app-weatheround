import { Link, routes } from '@redwoodjs/router'

export default SiteLayout


// *******************

function SiteLayout({ children }) {
  return (
    <>
      <div id="page">
        <header>
          <h1>
            <Link to={routes.home()} aria-label="WeatheRound"><i>W</i>eathe<i>r</i>ound</Link>
          </h1>
        </header>
        <main>{children}</main>
        <footer>
          <hr />
          <hr />

          &copy;2023
          {' '}
          Kyle Simpson

          {' '}|{' '}

          <Link to={routes.home()}>Weather</Link>

          {' '}|{' '}

          <Link to={routes.about()}>About</Link>

          {' '}|{' '}

          <a
            href="https://github.com/socketsupply/demo-app-weatheround"
            target="_blank"
          >
            Source (Github)
          </a>
        </footer>
      </div>
    </>
  )
}
