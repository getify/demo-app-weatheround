import { Router, Route, Set } from '@redwoodjs/router'
import SiteLayout from 'src/layouts/SiteLayout'

export default Routes


// *******************

function Routes() {
  return (
    <Router>
      <Set wrap={SiteLayout}>
        <Route path="/" page={HomePage} name="home" />
        <Route path="/about" page={AboutPage} name="about" prerender />
      </Set>
      <Route notfound page={NotFoundPage} prerender />
    </Router>
  )
}
