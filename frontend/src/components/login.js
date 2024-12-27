import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faFacebook, faGoogle} from '@fortawesome/free-brands-svg-icons'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import styles from '../styles/login.module.css'
import Context from '../provider'
import axios from 'axios'
import { url } from '../constants'



const LoginScreen = () => {
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")

    const submit = (context) => {
        const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }

        axios.post(`${url}/api/login/`, {
            email: email,
            password: password
        }, config).then((data) => {
            console.log(data)
            if(data.data.success) {
                context.setUser(data.data.user)
                context.toggleLogin()
            }
        }).catch(err => {
            console.log(err)
            alert("Cannot login")
        })
    }

    return (
        <Context.Consumer>{context => (
            <div className={styles.overlay}  style={{display: context.loginVisible ? 'block': 'none'}}>
            <div className={styles.card}>
                <div className={styles.close} onClick={context.toggleLogin}>
                    <FontAwesomeIcon icon={faTimes} size={"2x"} color="white" />
                </div>
                <h1>AutoHaus</h1>
                <form>
                    <input type="text" placeholder="Username" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    <p><a>Forgotten Password?</a></p>
                    <button onClick={() => submit(context) } type="button">LOGIN</button>
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