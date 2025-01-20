import React from 'react'
import styles from '../styles/contact.module.css'
import axios from '../utils/http'
import { url } from '../constants'
import { Navigate } from 'react-router-dom';
import Context from '../provider';


const ContactPage = () => {
    const [name, setName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [phone, setPhone] = React.useState("")
    const [message, setMessage] = React.useState("")
    const context  = React.useContext(Context)

    const submit = () => {
        axios.post(`${url}/api/submit-contact/`, {
            name: name,
            email: email,
            phone: phone,
            message: message,
        }).then(res => {
            if(res.data.id) {
                context.toast("Successfully submitted contact")
                return <Navigate to="/" />
            }
        })
    }

    return (
        <div className={styles.ContactPage}>
            <h1 className={styles.title}>Get in touch</h1>
            <input value={name} onChange={evt => setName(evt.target.value)} type="text" placeholder="Your Name" />
            <input value={email} onChange={evt => setEmail(evt.target.value)} type="email" placeholder="Email" />
            <input value={phone} onChange={evt => setPhone(evt.target.value)} type="text" placeholder="Phone" />
            <h6>Message</h6>
            <textarea value={message} onChange={evt => setMessage(evt.target.value)} rows={8}></textarea>
        <button onClick={submit}>SEND MESSAGE</button>
    </div>
    )
}
export default ContactPage