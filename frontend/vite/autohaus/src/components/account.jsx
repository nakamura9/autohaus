import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faFacebook, faGoogle} from '@fortawesome/free-brands-svg-icons'
import {faImagePortrait, faTimes} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import styles from '../styles/account.module.css'
import Context from '../provider'
import axios from '../utils/http'
import { url } from '../constants'
import CountrySelect from './country'
import ImageUploadWidget from './upload'


const AccountScreen = () => {
    const [email, setEmail] = React.useState("")
    const [recoveryEmail, setRecoveryEmail] = React.useState("")
    const [phone, setPhone] = React.useState("")
    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [photo, setPhoto] = React.useState("")
    const [city, setCity] = React.useState("")
    const [country, setCountry] = React.useState("")
    const [whatsapp, setWhatsapp] = React.useState(false)
    const [myListings, setMyListings] = React.useState("")
    const [savedListings, setSavedListings] = React.useState("")
    const [activeTab, setActiveTab] = React.useState("my-details")
    
    const context = React.useContext(Context)
    const navigate = useNavigate()
    React.useEffect(() => {
        if(!context.user)
            return;

        setRecoveryEmail(context.user.recovery_email)
        setEmail(context.user.email)
        setPhone(context.user.phone)
        setFirstName(context.user.first_name)
        setLastName(context.user.last_name)
        setPhone(context.user.phone)
        setCity(context.user.city)
        setPhoto(context.user.photo)
        setWhatsapp(context.user.whatsapp)
        setCountry(context.user.country)
    }, [context])

    React.useEffect(() => {
        if(activeTab == "my-listings"){
            axios.get(`${url}/api/account-listings/`).then((data) => {
                console.log(data)
                setMyListings(data.data)
            }).catch(err => {
                alert("Cannot get Account Listings")
            })
        }else if(activeTab == "saved-listings"){
            axios.get(`${url}/api/saved-listings/`).then((data) => {
                console.log(data)
                setSavedListings(data.data)
            }).catch(err => {
                alert("Cannot get saved listings")
            })
        }
    }, [activeTab])

    const updateAccount = () => {
        axios.post(`${url}/api/update-account/`, {
            recovery_email: recoveryEmail,
            email: email,
            phone: phone,
            first_name: firstName,
            last_name: lastName,
            city: city,
            country: country,
            photo: photo,
            whatsapp: whatsapp,
        }).then((data) => {
            console.log(data)
            if(data.data.success){
                context.setUser(data.data.user)
                context.toggleAccount()
            }
        }).catch(err => {
            alert("Cannot update account")
        })
    }
  
    return (
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

                <div className={styles.tabContainer}>
                    <div style={{display: activeTab == "my-details" ? "block" : "none"}}>
                        <h2>My Account</h2>
                        {context.user && (
                            <>
                                <label className={styles.label}>Email</label>
                                <output>
                                    {email}
                                </output>
                                <div className={styles.row}>
                                    <div>
                                        <label  className={styles.label}>First Name</label>
                                        <div className={styles.inputContainer}><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
                                    </div>
                                    <div>
                                        <label  className={styles.label}>Last Name</label>
                                        <div className={styles.inputContainer}><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
                                    </div>
                                </div>
                                
                                <label  className={styles.label}>Phone</label>
                                <div className={styles.inputContainer}>
                                    <CountrySelect value={country} onChange={(e) => setCountry(e.target.value)} />
                                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} />
                                </div>
                                
                                <label  className={styles.label}>City</label>
                                <div className={styles.inputContainer}><input type="text" value={city} onChange={e => setCity(e.target.value)} /></div>
                                
                                <label  className={styles.label}>Recovery Email</label>
                                <div className={styles.inputContainer}><input type="text" value={recoveryEmail}  onChange={e => setRecoveryEmail(e.target.value)} /></div>
                                <div className={styles.inputContainer}>
                                    <label  className={styles.label}>Phone # on Whatsapp?</label>
                                    <input type="checkbox" value={whatsapp}  onChange={e => setWhatsapp(e.target.value)} />
                                </div>
                                
                                <div className={styles.photoContainer}>
                                    {photo && <img src={photo} alt="profile" />}
                                    <ImageUploadWidget onUploadSuccess={setPhoto} />
                                </div>
                                <button onClick={updateAccount} type="button">Update Account Details</button>
                                <button  type="button">Reset Password</button>
                                <button  type="button">Delete Account</button>
                            </>
                        )}
                    </div>
                    <div style={{display: activeTab == "my-listings" ? "block" : "none"}}>
                        <h2>My Listings</h2>
                        <button  onClick={() => {
                            context.toggleAccount()
                            navigate("/sell")
                        }} >Create Listing</button>
                        {myListings && myListings.map((listing, index) => (
                            <div key={index} className={styles.listing}>
                                <div className={styles.imageContainer}>
                                    <img src={listing.photo} alt="listing" />
                                </div>
                                <div className={styles.details}>
                                    <h3>{listing.title}</h3>
                                    <p>{listing.description}</p>
                                    <p>{listing.price}</p>
                                </div>
                            </div>
                        ))}

                    </div>
                    <div style={{display: activeTab == "saved-listings" ? "block" : "none"}}>
                        <h2>Saved Listings</h2>
                        {savedListings && savedListings.map((listing, index) => (
                            <div key={index} className={styles.listing}>
                                <div className={styles.imageContainer}>
                                    <img src={listing.photo} alt="listing" />
                                </div>
                                <div className={styles.details}>
                                    <h3>{listing.model.name}</h3>
                                    <h4>{listing.make.name}</h4>
                                    <p>{listing.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                </div>
            </div>
        </div>    
    )
}

export default AccountScreen