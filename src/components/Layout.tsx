import { Link, NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-icon">🎣</span>
            <span>
              <strong>AB-STrout</strong>
              <small>Alberta Trout Waters</small>
            </span>
          </Link>
          <nav className="site-nav">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/map">Map</NavLink>
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          Created by <strong>Hayden Davac</strong>
          <span className="site-footer-sep"> · </span>
          <Link to="/disclaimer">Disclaimer &amp; Terms of Use</Link>
        </p>
      </footer>
    </div>
  )
}
