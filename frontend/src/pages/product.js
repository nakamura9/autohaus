import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"; 
import Spinner from '../components/spinner';
import {useParams} from 'react-router-dom'
import axios from 'axios';
import { url } from '../constants';
import styles from '../styles/product.module.css'
import {faCar, faEnvelope, faMap, faMessage, faPhone, faSms} from '@fortawesome/free-solid-svg-icons'
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
                <div className={styles.secondaryAttributes}></div>
            </div>
            <div className={styles.column}>
                <div>
                    <b>{product.make.name}</b>
                    <h2 style={{marginTop: "0px", marginBottom: "0.75rem",fontSize: "2rem"}}>{product.model.name}</h2>
                    <h4 style={{textAlign: "right", color: "#47b5ff", fontSize: "1.5rem", marginTop: "0px"}}>$18,000.00</h4>
                </div>
                <div>
                    <img />
                    <div>
                        <h5>Seller: {product.seller.name}</h5>
                        <p>Number of Ads: 1</p>
                    </div>
                </div>
                <div className={styles.primaryAttributes}>
                    <div>
                        <FontAwesomeIcon icon={faMap} />
                        <span>Mileage</span><br />
                        <span>{product.mileage} KM</span>
                    </div>
                    <div>
                        <FontAwesomeIcon  icon={"fa-fuel"} />
                        <span>Fuel</span><br />
                        <span>{product.fuel_type}</span>
                    </div>
                    <div>
                        <FontAwesomeIcon  icon={faCar}/>
                        <span>Drivetrain</span><br />
                        <span>{product.drivetrain}</span>
                    </div>
                    <div>
                        <FontAwesomeIcon  icon="fa-engine"/>
                        <span>Engine</span><br />
                        <span>{product.engine} L</span>
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