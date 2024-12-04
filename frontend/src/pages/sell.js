import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faTrash } from '@fortawesome/free-solid-svg-icons'
import styles from '../styles/sell.module.css'
import Search from '../components/search'
import Pills from '../components/pills'
import ImageUploadWidget from '../components/upload'
import CountrySelect from '../components/country'


const Tab = ({children, active}) => {
  return (
    <div className={styles.tab} style={{display: active ? "block": "none"}}>
        {children}
    </div>
  )
}


const SellPage = () => {
  const tabs = ["Vehicle", "Images", "Seller"]
  const [active, setActive]  = React.useState(0)
  const [images, setImages ] = React.useState([])
  const [country, setCountry] = React.useState("ZW")

  return (
    <>
    <ul className={styles.sellTabs}>
      {tabs.map((t, i) => <li key={i} onClick={() => setActive(i)} className={i == active ? styles.active : null}>{t}</li>)}
    </ul>
    
    <div  className={styles.sellContainer}>
      <Tab active={active == 0} >
          <div>
            <label htmlFor="make_field">Make</label>
            <Search model="make" placeholder={"Search Makes"} />
          </div>
          <label htmlFor="model_field">Model</label>
          <Search model="model" placeholder={"Search Model"} />
          <label >Fuel Type</label>
          <Pills options={["PETROL", "DIESEL"]} />
          <label >Transmission</label>
          <Pills options={["MANUAL", "AUTOMATIC"]} />
          <label htmlFor="model_field">Mileage</label>
          <div className={styles.inputContainer}>
            <input type="text" id="mileage_field" /> <b>KM</b>
          </div>
          <label >Condition</label>
          <Pills options={["Non-Runner", "Needs Work", "Fair", "Good", "Excellent", "New"]} />
      </Tab>
      <Tab active={active == 1}>
        <ImageUploadWidget onUploadSuccess={(img) => setImages([...images, img])} />
        <div className={styles.imgCarousel}>
          {images.map((img, i) => (<div className={styles.imgContainer}>
            <div onClick={() => {
              const newImages = [...images]
              newImages.splice(i, 1)
              setImages(newImages)
            }} className={styles.remove}>
              <FontAwesomeIcon icon={faTrash} color="white" />
            </div>
            <div className={styles.imageWrapper}><img width={112}  style={{height: "auto"}} src={img.src} key={i} /></div>
          </div>))}
        </div>
      </Tab>
      <Tab active={active == 2}>
        <label htmlFor="name_field">Name</label>
        <div className={styles.inputContainer}>
          <input type="text" id="name_field" />
        </div>
        <label htmlFor="email_field">Email</label>
        <div className={styles.inputContainer}>
          <input type="text" id="email_field" />
        </div>
        <label htmlFor="phone_field">Phone</label>
        <div className={styles.inputContainer}>
          <CountrySelect value={country} onChange={(e) => setCountry(e.target.value)} />
          <input type="text" id="phone_field" />
        </div>
        <label htmlFor="location_field">Location</label>
        <div className={styles.inputContainer}>
          <input type="text" id="location_field" />
        </div>
        <label htmlFor="price_field">Price</label>
        <div className={styles.inputContainer}>
          <input type="text" id="price_field" />
        </div>
        <label htmlFor="description_field">Description</label>
        <div className={styles.inputContainer}>
          <textarea id="description_field" />
        </div>
      </Tab>
      <div className={styles.sellFooter}>
            <button onClick={() => {if(active > 0) setActive(active -1);}}>Previous</button>
            <button onClick={() => {if(active < 2) setActive(active  + 1);}}>Next</button>
            <button>Submit</button>
        
      </div>    
    </div>
    
    </>
  )
}

export default SellPage