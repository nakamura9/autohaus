import React from 'react'
import styles from '../styles/buy.module.css'
import Search from '../components/search'
import FieldGroup from '../components/field_group'
import axios from 'axios'
import { url } from '../constants'
import Vehicle from '../components/card'
import { TailSpin } from 'react-loader-spinner'


const BuyPage = () => {
    const [results, setResults] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [make, setMake] = React.useState(null)
    const [model, setModel] = React.useState(null)
    const [transmission, setTransmission] = React.useState(null)
    const [fuelType, setFuelType] = React.useState(null)
    const [drivetrain, setDrivetrain] = React.useState(null)
    const [minYear, setMinYear] = React.useState(1900)
    const [maxYear, setMaxYear] = React.useState(new Date().getFullYear())
    const [minMileage, setMinMileage] = React.useState(0)
    const [maxMileage, setMaxMileage] = React.useState(null)
    const [minPrice, setMinPrice] = React.useState(0)
    const [maxPrice, setMaxPrice] = React.useState(null)
    const [sortBy, setSortBy] = React.useState("price")


    const search = () => {
        setLoading(true)
        axios.get(`${url}/api/search-vehicles/`, {
            params: {
                make: make,
                model: model,
                transmission: transmission,
                fuel_type: fuelType,
                drivetrain: drivetrain,
                min_year: minYear,
                max_year: maxYear,
                min_mileage: minMileage,
                max_mileage: maxMileage,
                min_price: minPrice,
                max_price: maxPrice,
                sort_by: sortBy,
            
            }
        })
            .then(res => {
                setResults(res.data)
                setLoading(false)
            }).catch(err => {
                alert("Cannot search vehicles")
                setLoading(false)
            })
    }

    return (<>
        <div className={styles.search}>
        <div>
            <h4>SEARCH</h4>
            <div className={styles.searchFields}>
                <div className={styles.searchWrapper}>
                    <Search placeholder={"Make"} model={"make"} onChange={setMake} value={make} />
                </div>
                <Search placeholder={"Model"} model={"model"} onChange={setModel} value={model}/>
                <div className={styles.inputContainer} >
                    <select onChange={e => setTransmission(e.target.value)} value={transmission}>
                        <option>Transmission Type</option>
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                    </select>
                </div>
                <div className={styles.inputContainer}>
                    <select onChange={e => setFuelType(e.target.value)} value={fuelType}>
                        <option>Fuel Type</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                    </select>
                </div>
                <div className={styles.inputContainer}>
                    <select onChange={e => setDrivetrain(e.target.value)} value={drivetrain}>
                        <option>Drivetrain</option>
                        <option value="front_wheel_drive">4x2 (Front wheel drive)</option>
                        <option value="real_wheel_drive">4x2 (Rear wheel drive)</option>
                        <option value="all_wheel_drive">4x4 (All Wheel Drive)</option>
                    </select>
                </div>
                
                <FieldGroup label={"Year"} min={minYear} max={maxYear} onMax={value => setMaxYear(value)} onMin={value => setMinYear(value)} />
                <FieldGroup label={"Mileage"} min={minMileage} max={maxMileage} onMax={value => setMaxMileage(value)} onMin={value => setMinMileage(value)} />
                <FieldGroup label={"Price"} min={minPrice} max={maxPrice} onMax={value => setMaxPrice(value)} onMin={value => setMinPrice(value)} />
                
                
                <div className={styles.inputContainer} >
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option>Sort by</option>
                        <option value="price">Price - Descending</option>
                        <option value="-price">Price - Ascending</option>
                        <option value="mileage">Mileage - Descending</option>
                        <option value="-mileage">Mileage - Ascending</option>
                        <option value="year">Year - Discending</option>
                        <option value="-year">Year - Ascending</option>
                    </select>
                </div>
                <button onClick={search}>Filter</button>
            </div>
        </div>
    </div>
    {loading ? <div className={styles.loading}><TailSpin /> </div>: <div className={styles.results}>
        {results.map((vehicle, index) => (
            <Vehicle {...vehicle} />
        ))}
    </div>}
    </>)
}
    


export default BuyPage