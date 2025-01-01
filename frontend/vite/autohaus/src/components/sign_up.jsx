import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import styles from '../styles/login.module.css'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import Context from '../provider'
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import CountrySelect from './country'
import axios from '../utils/http'
import { url } from '../constants'

const SignUpScreen = () => {
    const [country, setCountry] = React.useState('+27')
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [phone, setPhone] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [repeatPassword, setRepeatPassword] = React.useState('')

    const submit = () => {
        const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }

        axios.post(`${url}/api/sign-up/`, {
            first_name:firstName,
            last_name:lastName,
            email:email,
            phone: phone,
            country: country,
            password: password,
            repeat_password: repeatPassword
        }, config).then(res => {
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    }

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
                        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                    
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    <div className={styles.row}>
                        <CountrySelect value={country} onChange={e => setCountry(e.target.value)} />
                        <input type="text" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    <input type="password" placeholder="Repeat Password" value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} />
                    <button onClick={submit} type="button">SIGN UP</button>
                    <a className={styles.google}><FontAwesomeIcon icon={faGoogle} /> SIGN UP WITH GOOGLE </a>
                    <a className={styles.facebook}><FontAwesomeIcon icon={faFacebook} /> SIGN UP WITH FACEBOOK </a>
                    <p>Already have an account? <b onClick={context.toggleLogin}>LOGIN</b></p>
                </form>
            </div>
        </div>
        )}</Context.Consumer>
        
    )
}

export default SignUpScreen