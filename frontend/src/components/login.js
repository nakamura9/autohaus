import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faFacebook, faGoogle} from '@fortawesome/free-brands-svg-icons'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import styles from '../styles/login.module.css'
import Context from '../provider'


const LoginScreen = () => {
    return (
        <Context.Consumer>{context => (
            <div className={styles.overlay}  style={{display: context.loginVisible ? 'block': 'none'}}>
            <div className={styles.card}>
                <div className={styles.close} onClick={context.toggleLogin}>
                    <FontAwesomeIcon icon={faTimes} size={"2x"} color="white" />
                </div>
                <h1>AutoHaus</h1>
                <form>
                    <input type="text" placeholder="Username" />
                    <input type="password" placeholder="Password" />
                    <p><a>Forgotten Password?</a></p>
                    <button type="submit">LOGIN</button>
                    <a className={styles.google}><FontAwesomeIcon icon={faGoogle} /> SIGN IN WITH GOOGLE </a>
                    <a className={styles.facebook}><FontAwesomeIcon icon={faFacebook} /> SIGN IN WITH FACEBOOK </a>
                    <p>Don't have an account? <b onClick={context.toggleSignUp}>SIGN UP</b></p>
                </form>
            </div>
        </div>    
        )}</Context.Consumer>
        
    )
}

export default LoginScreen