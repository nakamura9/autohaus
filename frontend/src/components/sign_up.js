import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import styles from '../styles/login.module.css'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import Context from '../provider'


const SignUpScreen = () => {
    return (
        <Context.Consumer>{context => (
            <div  className={styles.overlay} style={{display: context.signUpVisible ? 'block': 'none'}}>
            <div className={styles.card}>
                <div className={styles.close} onClick={context.toggleSignUp}>
                    <FontAwesomeIcon icon={faTimes} size={"2x"} color="white" />
                </div>
                <h1>AutoHaus</h1>
                <form>
                    <div className={styles.name}>
                        <input type="text" placeholder="First Name" />
                        <input type="text" placeholder="Last Name" />
                    </div>
                    
                    <input type="email" placeholder="Email" />
                    <input type="text" placeholder="Phone Number" />
                    <input type="password" placeholder="Password" />
                    <input type="password" placeholder="Repeat Password" />
                    <button type="submit">SIGN UP</button>
                    <p>Already have an account? <b onClick={context.toggleLogin}>LOGIN</b></p>
                </form>
            </div>
        </div>
        )}</Context.Consumer>
        
    )
}

export default SignUpScreen