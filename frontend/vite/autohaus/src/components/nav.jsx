import React from 'react'
import Context from '../provider'
import styles from '../styles/nav.module.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBars, faTimes, faUser} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'


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
                <Link to="/"><h1>AutoHaus</h1></Link>
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
                    <ul className={styles.navLinks}>
                        <li><Link to="/buy">Buy</Link></li>
                        <li><Link to="/sell">Sell</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                        
                    </ul>
                }
                {mobile && 
                    <div className={styles.mobileMenu}>
                        <button onClick={() => setMobileMenu(!mobileMenu)} className={styles.mobileMenuBtn}><FontAwesomeIcon size="2x" icon={faBars} /></button>
                        {mobileMenu && <div className={styles.mobileMenuContainer} onClick={() => setMobileMenu(false)}>
                                <div><FontAwesomeIcon icon={faTimes} size="2x" /></div>
                                <ul className={styles.mobileMenuLinks}>
                                        <li><Link to="/buy">Buy</Link></li>
                                        <li><Link to="/sell">Sell</Link></li>
                                        <li><Link to="/about">About</Link></li>
                                        <li><Link to="/contact">Contact Us</Link></li>
                                        <li><Link to="/faq">FAQ</Link></li>
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