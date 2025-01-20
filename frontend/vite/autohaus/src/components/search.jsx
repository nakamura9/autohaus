import React from 'react'
import axios from '../utils/http'
import {url} from '../constants'
import styles from '../styles/search.module.css'

const Search = ({placeholder, model, onChange, label, filters, propId, muted}) => {
    const [value, setValue] = React.useState('')
    const [id, setId] = React.useState(null)
    const [options, setOptions] = React.useState([{name: "Honda Fit", description: "hello", thumb: "https://picsum.photos/200"}])
    const [searchVisible, setSearchVisible] = React.useState(false)

    React.useEffect(() => {
        if(propId) {
            setId(propId)
        }
    }, [])

    React.useEffect(() => {
        if(propId) {
            setId(propId)
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    'id': propId
                }
            }

            axios.get(
                `${url}/api/search/${model}/`,
                config
            ).then((data) => {
                setOptions(data.data.results)
                if(data.data.results.length > 0 ) {
                    const search_match = data.data.results[0]
                    setValue(search_match.title)
                    setOptions(data.data.results)
                } else {
                    setId(null)
                }
            }).catch(err => {
                console.log(err)
            })
        }
    }, [propId])

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
            const match = options.filter(opt => opt.title == value)
            if(match.length > 0) {
                setId(match[0].id)
                setSearchVisible(false)
            } else {
                
                axios.get(
                    `${url}/api/search/${model}/`,
                    config
                ).then((data) => {
                    setOptions(data.data.results)
                    if(data.data.results.length > 0 ) {
                        const search_match = data.data.results.filter(opt => opt.title == value)
                        if(search_match.length == 0) {
                            setSearchVisible(true)
                            setId(null)
                        }
                    }
                }).catch(err => {
                    console.log(err)
                })
            }
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

        if(id && !value) {
            axios.get(
                `${url}/${model}/${id}/`
            ).then((data) => {
                setValue(data.data.name)
                setSearchVisible(false)
            })
        }
    }, [id])


    const borderStyle = {}
    const inputStyle = {}
    if(muted) {
        borderStyle.border = "1px solid #999"
        inputStyle.color = "#000"
    }

    return (
        <div>
            {label && <label>{label}</label>}
            <div className={styles.searchContainer} style={borderStyle}>
                
                <input 
                    style={inputStyle}
                    className={styles.searchInput}
                    type="text"
                    placeholder={placeholder}
                    onChange={(evt) => setValue(evt.target.value)}
                    value={value}
                />
                {searchVisible && (<div className={styles.options}>{options.map(opt => (
                    <div key={opt.id} className={styles.option} onClick={() => onSelect(opt)}>
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