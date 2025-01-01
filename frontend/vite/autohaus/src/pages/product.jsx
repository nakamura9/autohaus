import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"; 
import Spinner from '../components/spinner';
import {useParams} from 'react-router-dom'
import axios from '../utils/http';
import { url } from '../constants';
import styles from '../styles/product.module.css'
import {faBottleWater, faCar, faCarAlt, faEnvelope, faImage, faImagePortrait, faMap, faMessage, faPhone, faSave, faSms} from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const ProductPage = () => {
    const [product, setProduct] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const {id} = useParams()


    React.useEffect(() => {
        axios.get(`${url}/vehicle/${id}/`).then(res => {
            setProduct(res.data)
            setLoading(false)
        })
    }, [id])

    const saveListing = () => {
        axios.post(`${url}/api/save-listing/`, {
            vehicle: id
        }).then(res => {
            if(res.data.success){
                alert("Listing saved")
            }
        })
    }

    if(loading) 
        return <Spinner />;

    return (
        <div className={styles.container}>
            <div className={styles.column}>
                <div className={styles.carousel}>
                    <Carousel>
                    {product.photos.map(p => (<img src={p.photo.indexOf("http") > -1 ? p.photo : `${url}${p.photo}`} loading="lazy" />))}
                    </Carousel>
                </div>
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
            <div className={styles.column}>
                <div className={styles.productHeader}>
                    <div>
                        <img src={product.make.logo} alt={product.make.name} width={64} height={64} />
                    </div>
                    <div>
                        <b>{product.make.name}</b>
                        <h2 style={{marginTop: "0px", marginBottom: "0.75rem",fontSize: "2rem"}}>{product.model.name}</h2>
                        <h4 style={{textAlign: "right", color: "#47b5ff", fontSize: "1.5rem", marginTop: "0px", marginBottom: "1rem"}}>$18,000.00</h4>
                    </div>
                </div>
                <button onClick={saveListing} className={styles.saveButton}>
                    <FontAwesomeIcon icon={faSave}  /> Save 
                </button>
                <div className={styles.sellerDetails}>
                    <div className={styles.sellerImage}>
                    {product.seller.photo && <img src={product.seller.photo} alt={product.seller.name}/>}
                    {!product.seller.photo && <FontAwesomeIcon icon={faImagePortrait} size={"3x"} />}
                    </div>
                    <div>
                        <h5>Seller: {product.seller.name}</h5>
                        <p>Number of Ads: 1</p>
                    </div>
                </div>
                <div className={styles.primaryAttributes}>
                    <div>
                        <FontAwesomeIcon icon={faMap} size="3x" />
                        <div className={styles.attrContainer}>
                            <span className={styles.attrName}>Mileage</span>
                            <span className={styles.attrValue}>{product.mileage} KM</span>
                        </div>
                    </div>
                    <div>
                        <FontAwesomeIcon  icon={faBottleWater} size="3x" />
                        <div className={styles.attrContainer}>
                            <span className={styles.attrName}>Fuel</span>
                            <span className={styles.attrValue}>{product.fuel_type}</span>
                        </div>
                    </div>
                    <div>
                        <FontAwesomeIcon  icon={faCar} size="3x"/>
                        <div className={styles.attrContainer}>
                            <span className={styles.attrName}>Drivetrain</span>
                            <span className={styles.attrValue}>{product.drivetrain.replaceAll("_", " ")}</span>
                        </div>
                    </div>
                    <div>
                        <FontAwesomeIcon  icon={faCarAlt} size="3x"/>
                        <div className={styles.attrContainer}>
                            <span className={styles.attrName}>Engine</span>
                            <span className={styles.attrValue}>{product.engine}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.contact}>
                    <h4>Contact Seller</h4>
                    <div>
                    <button>
                        <FontAwesomeIcon icon={faWhatsapp} size="2x" color="#44FF44" />
                    </button>
                    <button>
                        <FontAwesomeIcon icon={faPhone} size="2x" color="#007bff" />
                    </button>
                    <button>
                        <FontAwesomeIcon icon={faEnvelope} size="2x" color="#ccc" />
                    </button>
                    <button>
                        <FontAwesomeIcon icon={faSms} size="2x"  />
                    </button>
                    </div>
                </div>
            </div>
    </div>
    )
}

export default ProductPage