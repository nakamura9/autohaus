import React from 'react'
import Context from '../provider'
import styles from '../styles/nav.module.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUser} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'


const NavBar = ({toggleSignUp}) => {
    return (
        <Context.Consumer>
            {
                (context) => {
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
                                    <ul className={styles.navLinks}>
                                        <li><Link to="/buy">Buy</Link></li>
                                        <li><Link to="/sell">Sell</Link></li>
                                        <li><Link to="/about">About</Link></li>
                                        <li><Link to="/contact">Contact Us</Link></li>
                                        <li><Link to="/faq">FAQ</Link></li>
                                        
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }
            }
        </Context.Consumer>
    )
}

export default NavBar