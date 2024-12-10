import React from 'react'
import styles from '../styles/components.module.css'
import {Carousel} from 'react-responsive-carousel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import { url } from '../constants'

export default function Vehicle({photos, price, make, model, currency, id}) {
    return (
        <div className={styles.card}>
            <div className={styles.cardImg}>
                {photos && photos.length > 0 && (
                    <Carousel infiniteLoop showIndicators={false} showThumbs={false}>
                        {photos.map(p => (<img src={p.photo.indexOf("http") > -1 ? p.photo : `${url}${p.photo}`} loading="lazy" />))}
                    </Carousel>
                )}
                {!photos || photos.length == 0 && (
                    <FontAwesomeIcon icon={faImage} size="8x" color="#ccc" />
                )}
            </div>
            <a href={`/product/${id}`}>
                <div className={styles.cardBody}>
                    <p>
                        <b className={styles.make}>{make.name}</b><br />
                        {model.name}<br />
                    <div className={styles.cardPrice}>{currency ? currency.symbol : "USD"} {price}</div></p>
                </div>
            </a>
        </div>
    )
}