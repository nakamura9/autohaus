import axios from 'axios';
import React from 'react'
import {url} from '../constants'
import styles from '../styles/index.module.css'
import Search from '../components/search';
import Vehicle from '../components/card';


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
                <li><a href="/sell">Sell</a></li>
            </ul>
            <div className={styles.tabs}>
                <div className={styles.buyTab}>
                    <div className={styles.buyButton}>
                        <img src="" alt="" />
                        <h6>Sedans</h6>
                    </div>
                    <div className={styles.buyButton}>
                        <img src="" alt="" />
                        <h6>Trucks</h6>
                    </div>
                    <div className={styles.buyButton}>
                        <img src="" alt="" />
                        <h6>SUVs</h6>
                    </div>
                    <div className={styles.buyButton}>
                        <img src="" alt="" />
                        <h6>Commercial</h6>
                    </div>
                    <div className={styles.buyButton}>
                        <img src="" alt="" />
                        <h6>Hatchbacks</h6>
                    </div>
                    <div className={styles.buyButton}>
                        <img src="" alt="" />
                        <h6>Other</h6>
                    </div>
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