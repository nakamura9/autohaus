import React from 'react'
import axios from 'axios'
import {url} from '../constants'
import styles from '../styles/search.module.css'

const Search = ({placeholder, model}) => {
    const [value, setValue] = React.useState('')
    const [id, setId] = React.useState(null)
    const [options, setOptions] = React.useState([{name: "Honda Fit", description: "hello", thumb: "https://picsum.photos/200"}])
    const [searchVisible, setSearchVisible] = React.useState(false)


    React.useEffect(() => {
        console.log(value)
        if(value.length > 0) {
            axios.get(`${url}/api/search/${model}/?q=${value}`).then((data) => {
                setOptions(data.data.results)
                setSearchVisible(true)
            })
        } else {
            setOptions([])
            setSearchVisible(false)
        }
    }, [value])

    const onSelect = (option) => {
        setValue(option.title)
        setId(option.id)
        setSearchVisible(false)
    }

    return (
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
                        {opt.thumb && <img src={opt.thumb} alt="" width={48} height={48} />}
                    </div>
                    <div className={styles.optText}>
                        <b>{opt.title}</b><br />
                        {opt.description}
                    </div>
                </div>
            ))}</div>)}
        </div>
    )
}

export default Search