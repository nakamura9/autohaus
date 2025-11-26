import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import styles from '../styles/login.module.css'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import Context from '../provider'
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import CountrySelect from './country'
import axios from '../utils/http'
import { url } from '../constants'
import useStore from '../store'

const SignUpScreen = () => {
    const [country, setCountry] = React.useState('+27')
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [username, setUsername] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [phone, setPhone] = React.useState('')
    const [city, setCity] = React.useState("")
    const [password, setPassword] = React.useState('')
    const [repeatPassword, setRepeatPassword] = React.useState('')
    const context = React.useContext(Context)
    const { setUser: setStoreUser } = useStore()
    const [errors, setErrors] = React.useState({})

    const submit = () => {
        // Check if passwords match
        if (password !== repeatPassword) {
            setErrors({ password: 'Passwords do not match' });
            return;
        }

        const config = {
            headers: {
              'Content-Type': 'application/json'
            }
          }

        axios.post(`${url}/api/auth/signup/`, {
            username: username,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            password: password
        }, config).then(res => {
            if(!res.data.success) {
                setErrors({ error: res.data.error || 'Sign up failed' })
            } else {
                // Store JWT tokens in Zustand store
                setStoreUser(res.data.user, res.data.access, res.data.refresh);

                // Also keep old token for backward compatibility
                localStorage.setItem('user_token', res.data.access);

                // Update context user for existing components
                context.setUser(res.data.user)
                context.toast("Signed up successfully")
                context.toggleSignUp()
            }

        }).catch(err => {
            console.log(err)
            if(err.response?.data?.error) {
                setErrors({ error: err.response.data.error })
            } else {
                setErrors({ error: 'Error signing up. Please try again.' })
            }
            context.toast("Error signing up")
        })
    }

    return (
        <div  className={styles.overlay} style={{display: context.signUpVisible ? 'block': 'none'}}>
            <div className={styles.card}>
                <div className={styles.close} onClick={context.toggleSignUp}>
                    <FontAwesomeIcon icon={faTimes} size={"2x"} color="white" />
                </div>
                <img className="w-auto h-36" src={`${url}/static/auto_app/img/logo.JPG`} alt="Zim Forward" />
                                
                <form>
                    {Object.keys(errors).length > 0 && <div className={styles.errors}>{Object.keys(errors).map((key, idx) => <p key={idx}><b>{key}</b><br />{errors[key]}</p>)}</div>}
                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                    <div className={styles.name}>
                        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>

                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <div className={styles.row}>
                        <CountrySelect value={country} onChange={e => setCountry(e.target.value)} />
                        <input type="text" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <input type="password" placeholder="Repeat Password" value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} required />
                    <button onClick={submit} type="button">SIGN UP</button>
                    <a className={styles.google}><FontAwesomeIcon icon={faGoogle} /> SIGN UP WITH GOOGLE </a>
                    <a className={styles.facebook}><FontAwesomeIcon icon={faFacebook} /> SIGN UP WITH FACEBOOK </a>
                    <p>Already have an account? <b onClick={context.toggleLogin}>LOGIN</b></p>
                </form>
            </div>
        </div>
    )
}

export default SignUpScreen