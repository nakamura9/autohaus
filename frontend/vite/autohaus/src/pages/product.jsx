import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"; 
import Spinner from '../components/spinner';
import {useParams} from 'react-router-dom'
import axios from '../utils/http';
import { url } from '../constants';
import styles from '../styles/product.module.css'
import { faCar, faEnvelope, faEyeSlash, faHandshake, faImage, faImagePortrait, faPhone, faSave, faSms, faTrash} from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import Context from '../provider';
import { useContext } from 'react';
import Vehicle from '../components/card';
import {Link} from 'react-router-dom'

const ProductPage = () => {
    const [product, setProduct] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [similarListings, setSimilarListings] = React.useState([])
    const [saved, setSaved] = React.useState(false)
    const {id} = useParams()
    const context = useContext(Context)


    // Generate or retrieve session ID for tracking unique visitors
    const getSessionId = () => {
        let sessionId = localStorage.getItem('autohaus_session_id')
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            localStorage.setItem('autohaus_session_id', sessionId)
        }
        return sessionId
    }

    // Record page impression
    const recordImpression = (vehicleId) => {
        axios.post(`${url}/api/impressions/record/`, {
            vehicle_id: vehicleId,
            referrer: document.referrer || '',
            session_id: getSessionId()
        }).catch(err => {
            // Silently fail - don't interrupt user experience for analytics
            console.debug('Impression recording failed:', err)
        })
    }

    React.useEffect(() => {
        axios.get(`${url}/vehicle/${id}/`).then(res => {
            setProduct(res.data)
            setSaved(res.data.is_saved)
            setLoading(false)
        })

        axios.get(`${url}/api/related-listings/${id}/`).then(res => {
            console.log(res.data)
            setSimilarListings(res.data)
        })

        // Record impression when page loads
        recordImpression(id)
    }, [id])

    const toggleListing = () => {
        if(saved) { 
            axios.post(`${url}/api/saved-listings/delete/${product.saved_listing_id}/`).then((data) => {
                if(!data.data.status == "success") {
                    context.toast("Cannot get remove saved listing")
                } else {
                    setSaved(false)
                    context.toast("Removed Saved Listing")
                }
            }).catch(err => {
                context.toast("Cannot get remove saved listing")
            })
        } else {
            axios.post(`${url}/api/save-listing/`, {
                vehicle: id
            }).then(res => {
                console.log(res.data)
                if(res.data.status == "success"){
                    setSaved(true)
                    context.toast("Listing saved")
                } else {
                    context.toast("Cannot save listing")
                }
            })
        }
        
    }

    const openWhatsapp = () => {
        window.open(`https://wa.me/${product.seller.country}${product.seller.phone_number}?text=Hi, I am interested in your ${product.make.name} ${product.model.name}. Is it still available?`)
    }

    const openDialer = () => {
        window.open(`tel:${product.seller.country}${product.seller.phone_number}`)
    }

    const openEmail = () => {
        window.open(`mailto:${product.seller.email}`)
    }

    const openSMS = () => {
        window.open(`sms:${product.seller.country}${product.seller.phone_number}`)
    }

    if(loading) 
        return <Spinner />;

    return (
        <div className={styles.container}>
            <div className={styles.row}>
            <div className={styles.column}>
                <div className={styles.carousel}>
                    <Carousel>
                    {product.photos.length > 0
                        ? product.photos.map(p => (<img src={p.photo.indexOf("http") > -1 ? p.photo : `${url}${p.photo}`} loading="lazy" />))
                        : <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', backgroundColor: '#f0f0f0'}}>
                            <FontAwesomeIcon icon={faCar} size="10x" color="#ccc" />
                          </div>
                    }
                    </Carousel>
                </div>

            </div>
            <div className={styles.column}>
                <div className={styles.productHeader}>
                    <div>
                        {!product.make.logo && <FontAwesomeIcon icon={faImage} size={"3x"} />}
                        {product.make.logo && <img src={product.make.logo} alt={product.make.name} width={64} height={64} />}
                    </div>
                    <div>
                        <b>{product.make.name}</b>
                        <h2 style={{marginTop: "0px", marginBottom: "0.75rem",fontSize: "2rem"}}>{product.model.name}</h2>
                        <h4 style={{textAlign: "right", color: "#47b5ff", fontSize: "1.5rem", marginTop: "0px", marginBottom: "1rem"}}>$18,000.00</h4>
                    </div>
                </div>
                <button onClick={toggleListing} className={styles.saveButton} style={{backgroundColor: saved ? "crimson" : null}}>
                    <FontAwesomeIcon icon={saved ? faTrash : faSave}  /> {saved ? "Remove" : "Save"} 
                </button>
                <div className={styles.sellerDetails}>
                    <div className={styles.sellerImage}>
                    {product.seller.photo && <img src={product.seller.photo} alt={product.seller.name}/>}
                    {!product.seller.photo && <FontAwesomeIcon icon={faImagePortrait} size={"3x"} />}
                    </div>
                    <div>
                        <div className="font-bold">
                            {
                            product.seller.is_dealer 
                            ? <><FontAwesomeIcon icon={faHandshake} /> Dealer</> 
                            : <><FontAwesomeIcon icon={faEyeSlash} /> Private Seller</>}
                        </div>
                        <h5 className="text-lg mb-0">Seller: {product.seller.name}</h5>
                        <p className="text-sm">Number of Ads: {product.seller.number_of_ads}</p>
                        <Link to={`/seller/${product.seller.id}`} className="uppercase text-sm font-bold my-3 p-2 rounded-sm">View Other Listings </Link>
                    </div>
                </div>
                <div className={styles.primaryAttributes}>
                    <div>
                        <img src={`${url}/static/auto_app/img/dashboard.png`} />
                        <div className={styles.attrContainer}>
                            <span className={styles.attrName}>Mileage</span>
                            <span className={styles.attrValue}>{product.mileage} KM</span>
                        </div>
                    </div>
                    <div>
                    <img src={`${url}/static/auto_app/img/gasoline-pump.png`} />
                        <div className={styles.attrContainer}>
                            <span className={styles.attrName}>Fuel</span>
                            <span className={styles.attrValue}>{product.fuel_type}</span>
                        </div>
                    </div>
                    <div>
                        <img src={`${url}/static/auto_app/img/axle.png`} />
                        <div className={styles.attrContainer}>
                            <span className={styles.attrName}>Drivetrain</span>
                            <span className={styles.attrValue}>{product.drivetrain.replaceAll("_", " ")}</span>
                        </div>
                    </div>
                    <div>
                        <img src={`${url}/static/auto_app/img/reduced.png`} />
                        <div className={styles.attrContainer}>
                            <span className={styles.attrName}>Engine</span>
                            <span className={styles.attrValue}>{product.engine}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.contact}>
                    <h4>Contact Seller</h4>
                    <div>
                    
                    {product.seller.whatsapp && (<button onClick={openWhatsapp} >
                        <FontAwesomeIcon icon={faWhatsapp} size="2x" color="#44FF44" />
                    </button>)}
                    <button onClick={openDialer}>
                        <FontAwesomeIcon icon={faPhone} size="2x" color="#007bff" />
                    </button>
                    <button onClick={openEmail}>
                        <FontAwesomeIcon icon={faEnvelope} size="2x" color="#ccc" />
                    </button>
                    <button>
                        <FontAwesomeIcon icon={faSms} size="2x"  />
                    </button>
                    </div>
                </div>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.column}>
                    <div className={styles.secondaryAttributes}>
                            <h5>Vehicle Attributes</h5>
                            <div className={styles.table}>
                                <div  className={styles.tableRow}>
                                    <div className={styles.tableCol}>Make</div>
                                    <div className={styles.tableCol}>{product.make.name}</div>
                                </div>
                                <div  className={styles.tableRow}>
                                    <div className={styles.tableCol}>Model</div>
                                    <div className={styles.tableCol}>{product.model.name}</div>
                                </div>
                                <div  className={styles.tableRow}>
                                    <div className={styles.tableCol}>Year</div>
                                    <div className={styles.tableCol}>{product.year}</div>
                                </div>
                                <div  className={styles.tableRow}>
                                    <div className={styles.tableCol}>Transmission</div>
                                    <div className={styles.tableCol}>{product.transmission}</div>
                                </div>
                                <div  className={styles.tableRow}>
                                    <div className={styles.tableCol}>Fuel Type</div>
                                    <div className={styles.tableCol}>{product.fuel_type}</div>
                                </div>
                                <div  className={styles.tableRow}>
                                    <div className={styles.tableCol}>Drivetrain</div>
                                    <div className={styles.tableCol}>{product.drivetrain}</div>
                                </div>
                                <div  className={styles.tableRow}>
                                    <div className={styles.tableCol}>Engine</div>
                                    <div className={styles.tableCol}>{product.engine}</div>
                                </div>
                                <div  className={styles.tableRow}>
                                    <div className={styles.tableCol}>Car Class</div>
                                    <div className={styles.tableCol}>{product.car_class}</div>
                                </div>
                                
                            </div>
                        </div>
                </div>
            </div>
            <h4>Related Listings</h4>

            <div className={styles.row}>
                <div className={styles.listingsContainer}>
                    <div className={styles.listings}>
                        {similarListings.map((d, i) => (
                            <Vehicle {...d} key={i}/>
                        ))}
                    </div>
                </div>
            </div>
    </div>
    )
}

export default ProductPage