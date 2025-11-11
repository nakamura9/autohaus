import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faImage, faListAlt, faTimes} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import styles from '../styles/account.module.css'
import Context from '../provider'
import axios from '../utils/http'
import { url } from '../constants'
import CountrySelect from './country'
import ImageUploadWidget from './upload'
import Search from './search'


const EmptyList = ({listLabel}) => {
    return (<div className="w-full flex justify-center">
        <div className="flex justify-center items-center bg-gray-300 w-36 h-36 rounded-full ">
        <div className="flex flex-col">
            <FontAwesomeIcon color="#999" icon={faListAlt} size={"3x"} />
            <span className="bold text-lg">{listLabel}</span>
        </div>
    </div>
    </div>)
}


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
    // Using context for tab state instead of local state
    const [plans, setPlans] = React.useState([])
    const [subscriptionHistory, setSubscriptionHistory] = React.useState([])
    const [activeSubscription, setActiveSubscription] = React.useState(null)

    
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
        if(context.accountActiveTab == "my-listings"){
            getAccountListings()
        }else if(context.accountActiveTab == "saved-listings"){
            getSavedListings()
        } else if (context.accountActiveTab == "subscriptions"){
            getPlans()
            getSubscriptionHistory()
        }
    }, [context.accountActiveTab])

    const getSavedListings = () => {
        axios.get(`${url}/api/saved-listings/`).then((data) => {
            setSavedListings(data.data)
        }).catch(err => {
            context.toast("Cannot get saved listings")
        })
    }

    const getAccountListings = () => {
        axios.get(`${url}/api/account-listings/`).then((data) => {
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
        }).then((resp) => {
            if(resp.data.status == "success"){
                context.setUser(resp.data.user)
                context.toggleAccount()
                context.toast("Account details updated successfully")
            }else {
                context.toast("Error updating account")
            }
            
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

    const getPlans = () => {
        axios.get(`${url}/billing/plans/`).then((data) => {
            setPlans(data.data)
        }).catch(err => {
            context.toast("Cannot retrieve available subscription plans")
        })
    }

    const getSubscriptionHistory = () => {
        axios.get(`${url}/billing/subscription-history/`).then((data) => {
            setSubscriptionHistory(data.data)
        }).catch(err => {
            context.toast("Cannot retrieve subscription history")
        })
    }

    return (
        <div className={styles.overlay}  style={{display: context.accountVisible ? 'block': 'none'}}>
            <div className={styles.card} style={{width: "90vw"}}>
                <ul className={styles.tabs}>
                    <li 
                        onClick={() => context.setAccountTab("my-details")} 
                        className={context.accountActiveTab == "my-details" ? styles.active : ""}
                    >Account&nbsp;Details</li>
                    <li 
                        onClick={() => context.setAccountTab("my-listings")} 
                        className={context.accountActiveTab == "my-listings" ? styles.active : ""}
                    >Listings</li>
                    <li 
                        onClick={() => context.setAccountTab("saved-listings")} 
                        className={context.accountActiveTab == "saved-listings" ? styles.active : ""}
                    >Saved&nbsp;Listings</li>
                    <li 
                        onClick={() => context.setAccountTab("subscriptions")} 
                        className={context.accountActiveTab == "subscriptions" ? styles.active : ""}
                    >Subscriptions</li>
                </ul>
                <div className={styles.close} onClick={context.toggleAccount}>
                    <FontAwesomeIcon icon={faTimes} size={"2x"} color="white" />
                </div>

                <div className={styles.tabContainer}>
                    <div style={{display: context.accountActiveTab == "my-details" ? "block" : "none"}}>
                        {context.user && (
                            <div >
                                <div className="flex gap-4">
                                    <div className="flex-1 max-w-sm">
                                        
                                        <div className={[styles.row, "w-full", "gap-2"].join(" ")}>
                                            <div className="flex-1">
                                                <label  className={styles.label}>First Name</label>
                                                <div className={styles.inputContainer}><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
                                            </div>
                                            <div className="flex-1">
                                                <label  className={styles.label}>Last Name</label>
                                                <div className={styles.inputContainer}><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
                                            </div>
                                        </div>
                                        <label className={[styles.label, "mb-2", "block"].join(" ")}>Email</label>
                                        <output>
                                            {email}
                                        </output>
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
                                            <input type="checkbox" checked={whatsapp} onChange={e => setWhatsapp(!whatsapp)} />
                                        </div>
                                    </div>
                                    <div className="flex-1 max-w-sm">
                                        <div className={styles.photoContainer}>
                                            {photo && <img src={photo} alt="profile" />}
                                            <ImageUploadWidget onUploadSuccess={setPhoto} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 justify-center ">
                                    <button onClick={updateAccount} type="button">Update Account Details</button>
                                    <button type="button">Reset Password</button>
                                    <button type="button">Delete Account</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div style={{display: context.accountActiveTab == "my-listings" ? "block" : "none"}}>
                        
                        <button className={"!w-36"} onClick={() => {
                            context.toggleAccount()
                            navigate("/sell")
                        }} >Create Listing</button>
                        {myListings.length == 0 && <EmptyList listLabel={"No Items"} />}
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
                    <div style={{display: context.accountActiveTab == "saved-listings" ? "block" : "none"}}>
                        {savedListings.length == 0 && <EmptyList listLabel={"No Items"} />}
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
                    <div style={{display: context.accountActiveTab == "subscriptions" ? "block" : "none"}}>
                        <h5 className="text-lg text-bold text-blue-900 mb-4">Available Plans</h5>
                        {plans && plans.map((plan, index) => (
                            <div key={index} className={styles.plan}>
                                <strong className="block">{plan.name}</strong>
                                <em className="block">{plan.price}</em>
                                <p>{plan.description}</p>
                                <button onClick={() => {
                                    context.toggleAccount()
                                    axios.post(`${url}/billing/checkout/${plan.id}/`)
                                        .then(res => {
                                            if(res.data.success) {
                                                context.toast(`Subscribed to ${plan.name} successfully`)
                                                location.href = res.data.url
                                            } else {
                                                context.toast("Cannot subscribe to plan")
                                            }
                                        })
                                        .catch(err => {
                                            context.toast("Cannot subscribe to plan")
                                        })
                                }}>Subscribe</button>
                            </div>
                        ))}
                        {activeSubscription && (<>
                            <h5>Active Subscription</h5>

                        </>)}
                        <h5 className="text-lg text-bold text-blue-900 my-4">Subscription History</h5>
                        {subscriptionHistory.length == 0 && (
                            <EmptyList listLabel={"No Items"} />
                        )}
                        {subscriptionHistory.length > 0 && (
                            <table className={styles.subscriptionTable}>
                                <thead>
                                    <tr>
                                        <th>Plan</th>
                                        <th>Created At</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptionHistory && subscriptionHistory.map((sub, index) => (
                                        <tr key={index} className={styles.subscription}>
                                            <td>{sub.plan.name}</td>
                                            <td>{new Date(sub.created_at).toDateString()}</td>
                                            <td>{sub.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>    
    )
}

export default AccountScreen
