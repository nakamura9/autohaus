import axios from '../utils/http';
import React from 'react'
import {url} from '../constants'
import styles from '../styles/index.module.css'
import Vehicle from '../components/card';
import SellerCard from '../components/sellerCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';


const Brand = ({name, logo, query}) => {
    return (
        <Link className={styles.brandLink} to={`/buy?${query}`}>
            <div className={styles.brand}>
                <div className={styles.brandImg}>
                    <img src={`${url}${logo}`} alt={name} />
                </div>
                <h5>{name}</h5>
            </div>
        </Link>
    )
}


function Index() {
    const [data, setData] = React.useState([])
    const [recommendedListings, setRecommendedListings] = React.useState([])

    React.useEffect(() => {
        axios.get(`${url}/api/latest-listings/`).then((response) => {
            setData(response.data)
        })

        axios.get(`${url}/api/recommended-listings/`).then((response) => {
            setRecommendedListings(response.data)
        })

        // fetch top sellers from backend
        axios.get(`${url}/seller/top/`).then(res => {
            if(res.data && Array.isArray(res.data)){
                setTopSellers(res.data)
            }
        }).catch(err => console.error(err))
    }, [])

    const [topSellers, setTopSellers] = React.useState([])

    return (
        <main className={styles.main} >
            <div className={styles.hero}>
                <ul className={styles.heroTabs}>
                    <li className={styles.active}>Buy</li>
                    <li><Link to="/sell">Sell</Link></li>
                </ul>
                <div className={styles.tabs}>
                    <div className={styles.buyTab}>
                        <Link className={styles.brandLink} to="/buy">
                            <div className={styles.buyButton} >
                                <img src={url + "/static/auto_app/img/sedan.png"} alt="Sedans" />
                                <h6>Sedans</h6>
                            </div>
                        </Link>
                        <Link className={styles.brandLink} to="/buy">
                            <div className={styles.buyButton}>
                                <img src={url + "/static/auto_app/img/truck.png"} alt="Trucks" />
                                <h6>Trucks</h6>
                            </div>
                        </Link>
                        <Link className={styles.brandLink} to="/buy">
                            <div className={styles.buyButton}>
                                <img src={url + "/static/auto_app/img/suv-car.png"} alt="SUV" />
                                <h6>SUVs</h6>
                            </div>
                        </Link>
                        <Link className={styles.brandLink} to="/buy">
                            <div className={styles.buyButton}>
                                <img src={url + "/static/auto_app/img/pickup-truck.png"} alt="Pickups" />
                                <h6>Commercial</h6>
                            </div>
                        </Link>
                        <Link className={styles.brandLink} to="/buy">
                            <div className={styles.buyButton}>
                                <img src={url + "/static/auto_app/img/hatchback.png"} alt="" />
                                <h6>Hatchbacks</h6>
                            </div>
                        </Link>
                        <Link className={styles.brandLink} to="/buy">
                            <div className={styles.buyButton}>
                                <FontAwesomeIcon icon={faQuestionCircle} size={"3x"} />
                                <h6>Other</h6>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <div>
                <h4 className="text-xl my-4">Featured Brands</h4>
                <div className={styles.brandsContainer}>
                    <div className={styles.brands}>
                        <Brand 
                            name="Honda"
                            query="make=14"
                            logo="/make_logos/honda-logo.png"
                        />
                        <Brand 
                            name="Toyota"
                            query="make=28"
                            logo="/make_logos/toyota-logo.png"
                        />
                        <Brand
                            name="Volkswagen"
                            query="make=38"
                            logo="/make_logos/volkswagen-logo.png"
                        />
                        <Brand 
                            name="Mercedes"
                            query="make=32"
                            logo="/make_logos/mercedes-benz-logo.png"
                        />
                        <Brand
                            name="Ford"
                            query="make=9"
                            logo="/make_logos/ford-logo.png"
                        />
                        <Brand
                            name="BMW"
                            query="make=27"
                            logo="/make_logos/bmw-logo.png"
                        />
                        <Brand
                            name="Kia"
                            query="make=20"
                            logo="/make_logos/kia-logo.png"
                        />
                        <Brand
                            name="Mazda"
                            query="make=4"
                            logo="/make_logos/mazda-logo.png"
                        />
                    
                    </div>
                </div>
                
            </div>
            
            
            <div>
                <h4 className="text-xl my-4">Latest Listings</h4>
                <div className={styles.listingsContainer}>
                    <div className={styles.listings}>
                        {data.map((d, i) => (
                            <Vehicle {...d}  key={i}/>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-xl my-4">Top Dealers</h4>
                <div className={styles.listingsContainer}>
                    <div className={styles.listings}>
                        {topSellers.map((s, i) => (
                            <SellerCard {...s} key={i} />
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-xl my-4">Recommended for you</h4>
                <div className={styles.listingsContainer}>
                    <div className={styles.listings}>
                        {recommendedListings.map((d, i) => (
                            <Vehicle {...d} key={i}/>
                        ))}
                    </div>
                </div>
            </div>
            
        </main>
    )
}

export default Index;