import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="gradient-line" />

      <nav className="navbar navbar-expand-lg">
        <div id="nav-container" className="d-flex align-items-center">
          <Link href="/" data-test="brand" className="d-flex align-items-center">
            <div className="logo-container">
              <Image
                src="https://www.portaldocartao.com.br/static/assets/white-label-configs/portaldocartao/logo_portal_cartao.svg"
                alt="Portal do Cartão"
                width={120}
                height={32}
                className="logo"
                unoptimized
              />
              <small>V.5.02.1</small>
            </div>

            {/* Divisor vertical */}
            <div className="nav-divider" />

            <div className="logo-container credsystem-logo">
              <Image
                src="https://www.portaldocartao.com.br/static/assets/white-label-configs/portaldocartao/logo_nav.svg"
                alt="Credsystem"
                width={140}
                height={28}
                className="logo-nav"
                unoptimized
              />
            </div>
          </Link>
        </div>
      </nav>
    </div>
  )
}
