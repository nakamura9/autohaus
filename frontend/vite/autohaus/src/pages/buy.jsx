import React from 'react'
import styles from '../styles/buy.module.css'
import Search from '../components/search'
import FieldGroup from '../components/field_group'
import axios from '../utils/http'
import { url } from '../constants'
import Vehicle from '../components/card'
import { TailSpin } from 'react-loader-spinner'
import Context from '../provider'
import { useLocation } from 'react-router-dom'


const BuyPage = () => {
    const [results, setResults] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [make, setMake] = React.useState(null)
    const [model, setModel] = React.useState(null)
    const [transmission, setTransmission] = React.useState("")
    const [fuelType, setFuelType] = React.useState("")
    const [drivetrain, setDrivetrain] = React.useState("")
    const [minYear, setMinYear] = React.useState(1900)
    const [maxYear, setMaxYear] = React.useState(new Date().getFullYear())
    const [minMileage, setMinMileage] = React.useState(0)
    const [maxMileage, setMaxMileage] = React.useState(0)
    const [minPrice, setMinPrice] = React.useState(0)
    const [maxPrice, setMaxPrice] = React.useState(0)
    const [sortBy, setSortBy] = React.useState("price")
    const context = React.useContext(Context)
    const location = useLocation()


    const search = () => {
        setLoading(true)
        const params = {
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
            sort_by: sortBy
        }
        axios.get(`${url}/api/search-vehicles/`, {
            params: params
        }).then(res => {
            setResults(res.data)
            setLoading(false)
        }).catch(err => {
            context.toast("Cannot search vehicles")
            setLoading(false)
        })
    }

    const filterOnURLParams = () => {
        if(window.location.search.length > 0 ) {
            const args = window.location.search.replace("?", "").split("&")
            args.forEach(arg => {
                const [name, value] = arg.split("=")
                switch(name) {
                    case "make":
                        setMake(value)
                        break;
                    case "model":
                        setModel(value)
                        break;
                    case "min_year":
                        setMinYear(value)
                        break;
                    case "max_year":
                        setMaxYear(value)
                        break;
                    case "transmission":
                        setTransmission(value)
                        break;
                    default:
                        break;
                }
            })
        }
    }

    React.useEffect(filterOnURLParams, [])
    React.useEffect(filterOnURLParams, [location])

    React.useEffect(search, [make, model, transmission, drivetrain, fuelType, minYear, maxYear])

    return (<>
        <div className={styles.search}>
        <div>
            <h4>SEARCH</h4>
            <div className={styles.searchFields}>
                <Search label={"Make"} placeholder={"Make"} model={"make"} onChange={setMake} value={make} />
                <Search label="Model" placeholder={"Model"} model={"model"} onChange={setModel} value={model}/>
                <div>
                    <label>Transmission</label>
                    
                    <div className={styles.inputContainer} >
                        <select onChange={e => setTransmission(e.target.value)} value={transmission}>
                            <option value="">Transmission Type</option>
                            <option value="automatic">Automatic</option>
                            <option value="manual">Manual</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label>Fuel Type</label>
                    <div className={styles.inputContainer}>
                        <select onChange={e => setFuelType(e.target.value)} value={fuelType}>
                            <option value="">Fuel Type</option>
                            <option value="petrol">Petrol</option>
                            <option value="diesel">Diesel</option>
                            <option value="electric">Electric</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label>Drivetrain</label>
                    <div className={styles.inputContainer}>
                        <select onChange={e => setDrivetrain(e.target.value)} value={drivetrain}>
                            <option value="">Drivetrain</option>
                            <option value="front_wheel_drive">4x2 (Front wheel drive)</option>
                            <option value="real_wheel_drive">4x2 (Rear wheel drive)</option>
                            <option value="all_wheel_drive">4x4 (All Wheel Drive)</option>
                        </select>
                    </div>
                    </div>
                
                <FieldGroup label={"Year"} min={minYear} max={maxYear} onMax={value => setMaxYear(value)} onMin={value => setMinYear(value)} />
                <FieldGroup label={"Mileage"} min={minMileage} max={maxMileage} onMax={value => setMaxMileage(value)} onMin={value => setMinMileage(value)} />
                <FieldGroup label={"Price"} min={minPrice} max={maxPrice} onMax={value => setMaxPrice(value)} onMin={value => setMinPrice(value)} />
            </div>
            <div>
                    <label>Sort By</label>
                    <div className={styles.inputContainer} >
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="">Sort by</option>
                            <option value="-price">Price - Descending</option>
                            <option value="price">Price - Ascending</option>
                            <option value="-mileage">Mileage - Descending</option>
                            <option value="mileage">Mileage - Ascending</option>
                            <option value="-year">Year - Discending</option>
                            <option value="year">Year - Ascending</option>
                        </select>
                    </div>
                </div>
            <button onClick={search}>Filter</button>
        </div>
    </div>
    {loading ? <div className={styles.loading}><TailSpin /> </div>: <div className={styles.results}>
        {results.map((vehicle, index) => (
            <Vehicle {...vehicle} key={index} />
        ))}
        {results.length == 0 && <div className={styles.noResults}>
            <img src={`/static/auto_app/img/searching.png`} alt="No Vehicles" />
            <p>No results found</p>
        </div>}
    </div>}
    </>)
}
    


export default BuyPage