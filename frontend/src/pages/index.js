import axios from 'axios';
import React from 'react'
import {url} from '../constants'
import styles from '../styles/index.module.css'
import Search from '../components/search';

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
                <li>Sell</li>
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
                <h5>Featured Listings</h5>
                {data.map(d => (
                    <div>
                        <p>{d.year} {d.make.name} {d.model.name}</p>
                        <p>{d.price}</p>
                    </div>
                ))}
            </div>
            
        </main>
    )
}

export default Index;