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
                                <div>
                                    <button className={styles.accountBtn} onClick={context.toggleLogin}><FontAwesomeIcon color="white"  icon={faUser} /></button>
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
                                        <li><button onClick={context.toggleSignUp}>Sign Up</button></li>
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