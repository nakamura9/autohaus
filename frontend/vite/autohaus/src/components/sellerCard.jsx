import React from 'react'
import { Link } from 'react-router-dom'
import styles from '../styles/components.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImagePortrait } from '@fortawesome/free-solid-svg-icons'

export default function SellerCard({id, name, photo, number_of_ads, city}) {
    return (
        <div className={styles.card}>
            <Link to={`/seller/${id}`}>
                <div className={styles.cardImg} style={{height: 120}}>
                    {photo ? (
                        <img src={photo} alt={name} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                    ) : (
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                            <FontAwesomeIcon icon={faImagePortrait} size="4x" color="#ccc" />
                        </div>
                    )}
                </div>
                <div className={styles.cardBody}>
                    <div>
                        <b className={styles.make}>{name}</b><br />
                        <div style={{fontSize: '0.9rem'}}>{city && city.name}</div>
                        <div className={styles.cardPrice} style={{fontSize: '0.95rem'}}>{number_of_ads || 0} Listings</div>
                    </div>
                </div>
            </Link>
        </div>
    )
}
