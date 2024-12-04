import React from 'react'
import styles from '../styles/components.module.css'


const FieldGroup = ({label, onMin, onMax}) => {
    const [min, setMin] = React.useState(null)
    const [max, setMax] = React.useState(null)
    React.useEffect(() => {
        onMin(min)
    }, [min])
    React.useEffect(() => {
        onMax(max)
    }, [max])
    return (
        <div className={styles.fieldGroup}>
            <label>{label}</label>
            <div className={styles.fieldGroupFields}>
                <input value={min} onChange={e => setMin(e.target.value)} type="text" placeholder='Min' />
                <input value={max} onChange={e => setMax(e.target.value)} type="text"  placeholder='Max' />
            </div>
        </div>
    )
}

export default FieldGroup