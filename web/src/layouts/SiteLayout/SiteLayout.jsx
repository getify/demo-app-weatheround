import { Link, routes } from '@redwoodjs/router'

export default SiteLayout


// *******************

function SiteLayout({ children }) {
  return (
    <>
      <div id="page">
        <header>
          <h1>
            <a href="/" aria-label="WeatheRound"><i>W</i>eathe<i>r</i>ound</a>
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

          <a href="/">Weather</a>

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
}
