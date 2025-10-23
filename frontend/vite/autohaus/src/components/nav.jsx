import React from 'react'
import Context from '../provider'
import styles from '../styles/nav.module.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBars, faTimes, faUser, faCarSide, faDollarSign, faCircleInfo, faEnvelope, faQuestionCircle} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { url } from '../constants'


const NavBar = ({toggleSignUp}) => {
    const [mobile, setMobile] = React.useState(false)
    const [mobileMenu, setMobileMenu] = React.useState(false)
    React.useEffect(() => {
        setMobile(window.innerWidth < 575)

    }, [])
    const context = React.useContext(Context)

    return (
        <div className={styles.nav}>
            <div className={styles.navTop}>
                <div className={styles.navContent}>
                <Link to="/"><img className="w-auto h-24" src={`${url}/static/auto_app/img/logo.JPG`} alt="Zim Forward" /></Link>
                <div className={styles.navMenuContainer}>
                    <button className={styles.accountBtn} onClick={context.toggleAccountMenu}><FontAwesomeIcon color="white"  icon={faUser} /></button>
                    {context.accountMenu && <div  className={styles.navMenu}>
                        <ul onClick={() => setTimeout(context.toggleAccountMenu, 200)}>
                            {context.user && <li onClick={context.toggleAccount}><span>My Acoount</span><span>{context.user.username}</span></li>}
                            <li onClick={context.toggleSignUp}>Sign Up</li>
                            {!context.user && <li onClick={context.toggleLogin}>Login</li>}
                            {context.user && <li onClick={context.signOut}>Sign Out</li>}
                        </ul>
                    </div>}
                </div>
                </div>
            </div>
            <div className={styles.navBottom}>
            <div className={styles.navContent}>
                {!mobile && 
                    <ul className={[styles.navLinks, "!ml-48"].join(" ")}>
                        <li><Link to="/buy"><FontAwesomeIcon icon={faCarSide} className="mr-2" /> Buy</Link></li>
                        <li><Link to="/sell"><FontAwesomeIcon icon={faDollarSign} className="mr-2" /> Sell</Link></li>
                        <li><Link to="/about"><FontAwesomeIcon icon={faCircleInfo} className="mr-2" /> About</Link></li>
                        <li><Link to="/contact"><FontAwesomeIcon icon={faEnvelope} className="mr-2" /> Contact</Link></li>
                        <li><Link to="/faq"><FontAwesomeIcon icon={faQuestionCircle} className="mr-2" /> FAQ</Link></li>
                    </ul>
                }
                {mobile && 
                    <div className={styles.mobileMenu}>
                        <button onClick={() => setMobileMenu(!mobileMenu)} className={styles.mobileMenuBtn}><FontAwesomeIcon size="2x" icon={faBars} /></button>
                        {mobileMenu && <div className={styles.mobileMenuContainer} onClick={() => setMobileMenu(false)}>
                                <div><FontAwesomeIcon icon={faTimes} size="2x" /></div>
                                <ul className={styles.mobileMenuLinks}>
                                        <li><Link to="/buy"><FontAwesomeIcon icon={faCarSide} className="mr-2" /> Buy</Link></li>
                                        <li><Link to="/sell"><FontAwesomeIcon icon={faDollarSign} className="mr-2" /> Sell</Link></li>
                                        <li><Link to="/about"><FontAwesomeIcon icon={faCircleInfo} className="mr-2" /> About</Link></li>
                                        <li><Link to="/contact"><FontAwesomeIcon icon={faEnvelope} className="mr-2" /> Contact Us</Link></li>
                                        <li><Link to="/faq"><FontAwesomeIcon icon={faQuestionCircle} className="mr-2" /> FAQ</Link></li>
                                    </ul>
                            </div>}
                    </div>
                }
                </div>
            </div>
        </div>
    )
}

export default NavBar