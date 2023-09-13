import { render } from '@redwoodjs/testing/web'

import SiteLayout from './SiteLayout'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('SiteLayout', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<SiteLayout />)
    }).not.toThrow()
  })
})
