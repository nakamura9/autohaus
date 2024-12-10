import React from 'react'
import styles from '../styles/components.module.css'


const FieldGroup = ({label, onMin, onMax, minValue, maxValue}) => {
    return (
        <div className={styles.fieldGroup}>
            <label>{label}</label>
            <div className={styles.fieldGroupFields}>
                <input value={minValue} onChange={e => onMin(e.target.value)} type="text" placeholder='Min' />
                <input value={maxValue} onChange={e => onMax(e.target.value)} type="text"  placeholder='Max' />
            </div>
        </div>
    )
}

export default FieldGroup