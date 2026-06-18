import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import brandLogo from '../assets/logo2.png'
import { useHomeListState } from '../context/HomeListStateContext'
import DataUpdateLabel from './DataUpdateLabel'
import StockingMarquee from './StockingMarquee'

function goHomeWithRefresh(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
  if (window.location.pathname === '/') {
    window.location.reload()
  } else {
    window.location.href = '/'
  }
}

export default function Layout() {
  const { pathname } = useLocation()
  const { resetHomeListState } = useHomeListState()
  const showStockingMarquee = pathname === '/'

  return (
    <div className="app">
      <div className="site-sticky-top">
        <header className="site-header">
          <div className="header-inner">
            <a href="/" className="brand" onClick={goHomeWithRefresh}>
              <img
                src={brandLogo}
                alt="AB-STrout — Alberta Trout Waters"
                className="brand-logo"
              />
            </a>
            <nav className="site-nav">
              <NavLink to="/" end onClick={resetHomeListState}>
                Home
              </NavLink>
              <NavLink to="/map" onClick={resetHomeListState}>
                Map
              </NavLink>
            </nav>
          </div>
        </header>
        {showStockingMarquee && <StockingMarquee />}
      </div>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p className="site-footer__data">
          <DataUpdateLabel />
        </p>
        <p>
          Created by <strong>Haedyn06</strong>
          <span className="site-footer-sep"> · </span>
          <Link to="/disclaimer">Disclaimer &amp; Terms of Use</Link>
        </p>
      </footer>
    </div>
  )
}
