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
          <a
            href="https://socketsupply.co"
            target="_blank"
          >
            Socket Supply Co.
          </a>

          {' '}|{' '}

          <Link to={routes.home()}>Weather</Link>

          {' '}|{' '}

          <Link to={routes.about()}>About</Link>
        </footer>
      </div>
    </>
  )
}
