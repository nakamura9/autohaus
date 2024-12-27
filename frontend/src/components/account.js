import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faFacebook, faGoogle} from '@fortawesome/free-brands-svg-icons'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import styles from '../styles/account.module.css'
import Context from '../provider'
import axios from 'axios'
import { url } from '../constants'


const AccountScreen = () => {
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [activeTab, setActiveTab] = React.useState("my-details")

  
    return (
        <Context.Consumer>{context => (
            <div className={styles.overlay}  style={{display: context.accountVisible ? 'block': 'none'}}>
            <div className={styles.card}>
                <ul className={styles.tabs}>
                    <li 
                        onClick={() => setActiveTab("my-details")} 
                        className={activeTab == "my-details" ? styles.active : ""}
                    >My Details</li>
                    <li 
                        onClick={() => setActiveTab("my-listings")} 
                        className={activeTab == "my-listings" ? styles.active : ""}
                    >My Listings</li>
                    <li 
                        onClick={() => setActiveTab("saved-listings")} 
                        className={activeTab == "saved-listings" ? styles.active : ""}
                    >Saved Listings</li>
                </ul>
                <div className={styles.close} onClick={context.toggleAccount}>
                    <FontAwesomeIcon icon={faTimes} size={"2x"} color="white" />
                </div>
                
                 
                
                <div>
                    <div style={{display: activeTab == "my-details" ? "block" : "none"}}>
                        <h2>My Account</h2>
                        {context.user && (
                            <>
                                <label className={styles.label}>Email</label>
                                <output>
                                    {context.user.email}
                                </output>
                                <label  className={styles.label}>Phone</label>
                                <output>
                                    {context.user.phone}
                                </output>
                                <label  className={styles.label}>Phone</label>

                                <output>
                                    {context.user.phone}
                                </output>
                                <button  type="button">Reset Password</button>
                                <button  type="button">Delete Account</button>
                                <button  type="button">Update Account Details</button>
                            </>
                        )}
                    </div>
                    <div style={{display: activeTab == "my-listings" ? "block" : "none"}}>
                        <h2>My Listings</h2>

                    </div>
                    <div style={{display: activeTab == "saved-listings" ? "block" : "none"}}>
                        <h2>Saved Listings</h2>
                    </div>
                    
                </div>
            </div>
        </div>    
        )}</Context.Consumer>
        
    )
}

export default AccountScreen