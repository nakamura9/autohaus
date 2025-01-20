import React from 'react'
import styles from '../styles/components.module.css'


const Pills = ({options, onChange, value}) => {
    const [active, setActive] = React.useState(0)
    React.useEffect(() => {
        onChange(options[active])
    }, [active])

    React.useEffect(() => {
        if(value) {
            setActive(options.indexOf(value))
        }
    }, [value])

  return (
    <div className={options.length < 3 ? styles.toggleButtons : styles.conditionButtons}>
        {options.map((option, i) => ((
            <div 
                key={i}
                className={active == i ? styles.active: null}
                onClick={() => setActive(i)}
            >
                {option}
            </div>
        )))}
    </div>
  )
}

export default Pills