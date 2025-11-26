import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faFacebook, faGoogle} from '@fortawesome/free-brands-svg-icons'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import styles from '../styles/login.module.css'
import Context from '../provider'
import axios from '../utils/http'
import { url } from '../constants'
import useStore from '../store'



const LoginScreen = () => {
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [errors, setErrors] = React.useState([])
    const context = React.useContext(Context)
    const { setUser: setStoreUser } = useStore()

    const submit = (context) => {
        const config = {
            headers: {
              'Content-Type': 'application/json'
            }
          }

        axios.post(`${url}/api/auth/login/`, {
            username: username,
            password: password
        }, config).then((data) => {
            if(data.data.success) {
                // Store JWT tokens in Zustand store
                setStoreUser(data.data.user, data.data.access, data.data.refresh);

                // Also keep old token for backward compatibility with existing code
                localStorage.setItem('user_token', data.data.access);

                // Update context user for existing components
                context.setUser(data.data.user)
                context.toggleLogin()
                context.toast("Logged in successfully")
                setErrors([])
            } else if(data.data.error) {
                setErrors([data.data.error])
            }
        }).catch(err => {
            console.log(err)
            if(err.response?.data?.error) {
                setErrors([err.response.data.error])
            } else {
                setErrors(["Cannot login. Please check your credentials."])
            }
            context.toast("Cannot login")
        })
    }

    React.useEffect(() => {
        setErrors([])
    }, [username, password])

    return (
        
            <div className={styles.overlay}  style={{display: context.loginVisible ? 'block': 'none'}}>
            <div className={styles.card}>
                <div className={styles.close} onClick={context.toggleLogin}>
                    <FontAwesomeIcon icon={faTimes} size={"2x"} color="white" />
                </div>
                <img className="w-auto h-36" src={`${url}/static/auto_app/img/logo.JPG`} alt="Zim Forward" />
                <form>
                    {errors.length > 0 && <div className={styles.errors}>{errors.map((e, idx) => <p key={idx}>{e}</p>)}</div>}
                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    <p><a>Forgotten Password?</a></p>
                    <button onClick={() => submit(context) } type="button">LOGIN</button>
                    <a className={styles.google}><FontAwesomeIcon icon={faGoogle} /> SIGN IN WITH GOOGLE </a>
                    <a className={styles.facebook}><FontAwesomeIcon icon={faFacebook} /> SIGN IN WITH FACEBOOK </a>
                    <p>Don't have an account? <b onClick={context.toggleSignUp}>SIGN UP</b></p>
                </form>
            </div>
        </div>    
        
    )
}

export default LoginScreen