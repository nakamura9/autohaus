import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faFacebook, faGoogle} from '@fortawesome/free-brands-svg-icons'
import {faImage, faImagePortrait, faTimes} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import styles from '../styles/account.module.css'
import Context from '../provider'
import axios from '../utils/http'
import { url } from '../constants'
import CountrySelect from './country'
import ImageUploadWidget from './upload'
import Search from './search'


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
    const [errors, setErrors] = React.useState([])

    
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
        setPhoto(`${url}${context.user.photo}`)
        setWhatsapp(context.user.whatsapp)
        setCountry(context.user.country)
    }, [context])

    

    React.useEffect(() => {
        if(activeTab == "my-listings"){
            getAccountListings()
        }else if(activeTab == "saved-listings"){
            getSavedListings()
        }
    }, [activeTab])

    const getSavedListings = () => {
        axios.get(`${url}/api/saved-listings/`).then((data) => {
            setSavedListings(data.data)
        }).catch(err => {
            context.toast("Cannot get saved listings")
        })
    }

    const getAccountListings = () => {
        axios.get(`${url}/api/account-listings/`).then((data) => {
            console.log(data.data)
            setMyListings(data.data)
        }).catch(err => {
            context.toast("Cannot get Account Listings")
        })
    }

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
            if(data.data.success){
                context.setUser(data.data.user)
                context.toggleAccount()
                context.toast("Account details updated successfully")
            }
            context.toast("Error updating account")
        }).catch(err => {
            context.toast("Cannot update account")
        })
    }
  
    const removeSavedListing = (id) => {
        axios.post(`${url}/api/saved-listings/delete/${id}/`).then((data) => {
            if(data.data.status != "success") {
                context.toast("Cannot get remove saved listing")
            } else {
                context.toast("Removed Saved Listing")
            }
            getSavedListings()
        }).catch(err => {
            context.toast("Cannot get remove saved listing")
        })
    }

    const deleteListing = (id) => {
        axios.post(`${url}/api/listings/delete/${id}/`).then((data) => {
            if(!data.data.status == "success") {
                context.toast("Cannot get remove  listing")
            } else {
                context.toast("Removed Listing")
            }
            getAccountListings()
        }).catch(err => {
            context.toast("Cannot get remove saved listing")
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
                                <Search muted model="city"  onChange={setCity} propId={city} />
                                <br />
                                
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
                                {listing.photos.length > 0 && <img src={`${url}${listing.photos[0].photo}`} alt="listing" />}
                                {!listing.photos.length > 0 && <FontAwesomeIcon icon={faImage} size={"7x"} />}
                                <div className={styles.content}>
                                    <h4>{listing.make.name}</h4>
                                    <h3>{listing.model.name}</h3>
                                    <p>{listing.description}</p>
                                    <p className={styles.price}>{listing.price}</p>
                                    <div className={styles.actions}>
                                        <button  onClick={() => {context.toggleAccount(); navigate(`/product/${listing.id}`)}}>View</button>
                                        <button style={{background: 'white', color: '#010038', border: "2px solid #010038"}} onClick={() => {context.toggleAccount(); navigate(`/sell/?listing=${listing.id}`)}}>Edit</button>
                                        <button style={{'backgroundColor': 'crimson'}} onClick={() => deleteListing(listing.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                    <div style={{display: activeTab == "saved-listings" ? "block" : "none"}}>
                        <h2>Saved Listings</h2>
                        {savedListings && savedListings.map((listing, index) => (
                            <div key={index} className={styles.listing}>
                                {listing.photos.length > 0 && <img src={`${url}${listing.photos[0].photo}`} alt="listing" />}
                                {!listing.photos.length > 0 && <FontAwesomeIcon icon={faImage} size={"7x"} />}
                                <div className={styles.content}>
                                    <h4>{listing.make.name}</h4>
                                    <h3>{listing.model.name}</h3>
                                    <p className={styles.price}>{listing.price}</p>
                                    <div className={styles.actions}>
                                    <button  onClick={() => {context.toggleAccount(); navigate(`/product/${listing.id}`)}}>View</button>
                                        <button 
                                            onClick={() => removeSavedListing(listing.id)}
                                            style={{background: 'white', color: 'crimson', border: "2px solid crimson"}}
                                        >Remove</button>
                                    </div>
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