import React from 'react'
import Context from '../provider'
import styles from '../styles/nav.module.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUser} from '@fortawesome/free-solid-svg-icons'


const NavBar = ({toggleSignUp}) => {
    return (
        <Context.Consumer>
            {
                (context) => {
                    return (
                        <div className={styles.nav}>
                            <div className={styles.navTop}>
                                <div className={styles.navContent}>
                                <a href="/"><h1>AutoHaus</h1></a>
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
                                        <li><a href="/buy">Buy</a></li>
                                        <li><a href="/sell">Sell</a></li>
                                        <li><a href="/about">About</a></li>
                                        <li><a href="/contact">Contact Us</a></li>
                                        <li><a href="/faq">FAQ</a></li>
                                        
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