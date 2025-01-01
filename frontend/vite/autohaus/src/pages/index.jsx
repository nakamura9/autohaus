import axios from '../utils/http';
import React from 'react'
import {url} from '../constants'
import styles from '../styles/index.module.css'
import Search from '../components/search';
import Vehicle from '../components/card';
import sedan from '../assets/images/sedan.png'
import hatchback from '../assets/images/hatchback.png'
import pickup from '../assets/images/pickup-truck.png'
import suv from '../assets/images/suv-car.png'
import truck from '../assets/images/truck.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';


function Index() {
    const [data, setData] = React.useState([])

    React.useEffect(() => {
        axios.get(`${url}/vehicle/`).then((response) => {
            console.log(response.data)
            setData(response.data.results)
        })
    }, [])

    return (
        <main className={styles.main} >
            <div className={styles.hero}>
            <ul className={styles.heroTabs}>
                <li className={styles.active}>Buy</li>
                <li><Link to="/sell">Sell</Link></li>
            </ul>
            <div className={styles.tabs}>
                <div className={styles.buyTab}>
                    <Link to="/buy">
                        <div className={styles.buyButton} >
                            <img src={sedan} alt="" />
                            <h6>Sedans</h6>
                        </div>
                    </Link>
                    <Link to="/buy">
                        <div className={styles.buyButton}>
                            <img src={pickup} alt="" />
                            <h6>Trucks</h6>
                        </div>
                    </Link>
                    <Link to="/buy">
                        <div className={styles.buyButton}>
                            <img src={suv} alt="" />
                            <h6>SUVs</h6>
                        </div>
                    </Link>
                    <Link to="/buy">
                        <div className={styles.buyButton}>
                            <img src={truck} alt="" />
                            <h6>Commercial</h6>
                        </div>
                    </Link>
                    <Link to="/buy">
                        <div className={styles.buyButton}>
                            <img src={hatchback} alt="" />
                            <h6>Hatchbacks</h6>
                        </div>
                    </Link>
                    <Link to="/buy">
                        <div className={styles.buyButton}>
                            <FontAwesomeIcon icon={faQuestionCircle} size={"3x"} />
                            <h6>Other</h6>
                        </div>
                    </Link>
                </div>
            </div>
            
            </div>
            <div>
                <h5>Featured Brands</h5>
                
            </div>
            
            <div>
                <h5>Featured Listings</h5>
                <div className={styles.listingsContainer}>
                    <div className={styles.listings}>
                        {data.map(d => (
                            <Vehicle {...d} />
                        ))}
                    </div>
                </div>
            </div>
            
        </main>
    )
}

export default Index;