import React from 'react'
import styles from '../styles/contact.module.css'

const ContactPage = () => (
    <div className={styles.ContactPage}>
        <h1 className={styles.title}>Get in touch</h1>
        <input type="text" placeholder="Your Name" />
        <input type="email" placeholder="Email" />
        <input type="text" placeholder="Phone" />
        <h6>Message</h6>
        <textarea rows={8}></textarea>
        <button>SEND MESSAGE</button>
    </div>
)

export default ContactPage