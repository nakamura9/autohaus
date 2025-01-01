import {TailSpin} from 'react-loader-spinner'
import styles from '../styles/components.module.css'

export default function Spinner(props) {
    return <div className={styles.spinner}>
        <TailSpin 
              arialLabel="loading-indicator" 
              type="TailSpin" 
              color="teal" 
              height={80} 
              width={80} 
           />
    </div>
}