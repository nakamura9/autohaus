import React from 'react'
import axios from '../utils/http'
import {url} from '../constants'
import styles from '../styles/search.module.css'

const Search = ({placeholder, model, onChange, label, filters}) => {
    const [value, setValue] = React.useState('')
    const [id, setId] = React.useState(null)
    const [options, setOptions] = React.useState([{name: "Honda Fit", description: "hello", thumb: "https://picsum.photos/200"}])
    const [searchVisible, setSearchVisible] = React.useState(false)


    React.useEffect(() => {
        if(value && value.length > 0) {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    'q': value
                }
            }
            if(filters) {
                config.params.filters = JSON.stringify(filters)
            }
            axios.get(
                `${url}/api/search/${model}/`,
                config
            ).then((data) => {
                setOptions(data.data.results)
                setSearchVisible(true)
            })
        } else {
            setOptions([])
            setSearchVisible(false)
            setValue(null)
            setId(null)
        }
    }, [value])

    const onSelect = (option) => {
        setValue(option.title)
        setId(option.id)
        setSearchVisible(false)
    }

    React.useEffect(() => {
        if(onChange) {
            onChange(id)
        }
    }, [id])

    return (
        <div>
            {label && <label>{label}</label>}
            <div className={styles.searchContainer}>
                
                <input 
                    className={styles.searchInput}
                    type="text"
                    placeholder={placeholder}
                    onChange={(evt) => setValue(evt.target.value)}
                    value={value}
                />
                {searchVisible && (<div className={styles.options}>{options.map(opt => (
                    <div className={styles.option} onClick={() => onSelect(opt)}>
                        <div className={styles.optImg}>
                            {opt.thumb && <img src={`${url}/${opt.thumb}`} alt="" width={48} height={48} />}
                        </div>
                        <div className={styles.optText}>
                            <b>{opt.title}</b><br />
                            {opt.description}
                        </div>
                    </div>
                ))}</div>)}
            </div>
        </div>
        
    )
}

export default Search