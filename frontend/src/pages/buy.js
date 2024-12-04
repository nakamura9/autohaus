import React from 'react'
import styles from '../styles/buy.module.css'
import Search from '../components/search'
import FieldGroup from '../components/field_group'


const BuyPage = () => (
    <div className={styles.search}>
        <div>
            <h4>SEARCH</h4>
            <div className={styles.searchFields}>
                <div className={styles.searchWrapper}>
                    <Search placeholder={"Make"} model={"make"} />
                </div>
                <Search placeholder={"Model"} model={"model"} />
                <div className={styles.inputContainer}>
                    <select>
                        <option>Transmission Type</option>
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                    </select>
                </div>
                <div className={styles.inputContainer}>
                    <select>
                        <option>Fuel Type</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                    </select>
                </div>
                <div className={styles.inputContainer}>
                    <select>
                        <option>Drivetrain</option>
                        <option value="4x2">4x2 (2 wheel drive)</option>
                        <option value="4x4">4x4 (4 by 4)</option>
                    </select>
                </div>
                
                <FieldGroup label={"Year"} onMax={value => console.log(value)} onMin={value => console.log(value)} />
                <FieldGroup label={"Mileage"} onMax={value => console.log(value)} onMin={value => console.log(value)} />
                <FieldGroup label={"Price"} onMax={value => console.log(value)} onMin={value => console.log(value)} />
                
                
                <div className={styles.inputContainer}>
                    <select>
                        <option value="1">Sort by</option>
                        <option value="2">Price</option>
                        <option value="3">Mileage</option>
                        <option value="4">Year</option>
                    </select>
                </div>
                <button>Filter</button>
            </div>
        </div>
    </div>
)

export default BuyPage