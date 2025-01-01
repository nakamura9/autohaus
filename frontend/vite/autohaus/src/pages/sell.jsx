import React, { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faTrash } from '@fortawesome/free-solid-svg-icons'
import styles from '../styles/sell.module.css'
import Search from '../components/search'
import Pills from '../components/pills'
import ImageUploadWidget from '../components/upload'
import CountrySelect from '../components/country'
import axios from '../utils/http'
import { url } from '../constants'
import Context from '../provider'


const Tab = ({children, active}) => {
  return (
    <div className={styles.tab} style={{display: active ? "block": "none"}}>
        {children}
    </div>
  )
}


const SellPage = () => {
  // tab params
  const tabs = ["Vehicle", "Images", "Seller"]
  const [active, setActive]  = React.useState(0)
  // form params
  const [images, setImages ] = React.useState([])
  const [country, setCountry] = React.useState("ZW")
  const [make, setMake] = React.useState(null)
  const [model, setModel] = React.useState(null)
  const [modelFilters, setModelFilters] = React.useState({})
  const [fuelType, setFuelType] = React.useState(null)
  const [transmission, setTransmission] = React.useState(null)
  const [mileage, setMileage] = React.useState(null)
  const [condition, setCondition] = React.useState("Non-Runner")
  const [name, setName] = React.useState(null)
  const [email, setEmail] = React.useState(null)
  const [phone, setPhone] = React.useState(null)
  const [location, setLocation] = React.useState(null)
  const [price, setPrice] = React.useState(0)
  const [negotiable, setNegotiable] = React.useState(false)
  const [description, setDescription] = React.useState(null)
  const context = useContext(Context)

  React.useEffect(() => {
    console.log(context)
    if(!context.user)
      return;

    setName(`${context.user.first_name} ${context.user.last_name}`)
    setEmail(context.user.email)
    setPhone(context.user.phone)
    setLocation(context.user.city)
    setCountry(context.user.country)
  }, [context.user])

  const handleMake = (value)  => {
    setMake(value)
    setModel(null)
    setModelFilters({make: value})
  }

  const validate = () => {
    return true
  }

  const on_submit = () => {
    
  }

  const submit = () => {
    if(!validate()) 
      return;

    axios.post(`${url}/api/create-vehicle/`, {
      images: images,
      country: country,
      make: make,
      model: model,
      fuel_type: fuelType,
      transmission: transmission,
      mileage: mileage,
      condition: condition,
      name: name,
      email: email,
      phone: phone,
      location: location,
      price: price,
      negotiable: negotiable,
      description: description,
    }).then((data) => {
      console.log(data)
      on_submit()
    }).catch(err => {
      alert("Cannot submit vehicle")
    })

  }

  return (
    <>
    <ul className={styles.sellTabs}>
      {tabs.map((t, i) => <li key={i} onClick={() => setActive(i)} className={i == active ? styles.active : null}>{t}</li>)}
    </ul>
    
    <div  className={styles.sellContainer}>
      <Tab active={active == 0} >
          <div style={{marginLeft: "8px", marginBottom: "12px"}}>
            <Search label="Make" model="make" placeholder={"Search Makes"} onChange={handleMake} />
            <Search label="Model" model="model" placeholder={"Search Model"} filters={modelFilters} onChange={setModel} />
          </div>
          <label >Fuel Type</label>
          <Pills options={["PETROL", "DIESEL"]} onChange={setFuelType} />
          <label >Transmission</label>
          <Pills options={["MANUAL", "AUTOMATIC"]} onChange={setTransmission} />
          <label htmlFor="model_field">Mileage</label>
          <div className={styles.inputContainer}>
            <input type="text" id="mileage_field" onChange={e => setMileage(e.target.value)} /> <b>KM</b>
          </div>
          <label >Condition</label>
          <Pills 
            options={["Non-Runner", "Needs Work", "Fair", "Good", "Excellent", "New"]} 
            onChange={setCondition} />
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
          <input type="text" id="name_field" onChange={e => setName(e.target.value)} value={name} />
        </div>
        <label htmlFor="email_field">Email</label>
        <div className={styles.inputContainer}>
          <input type="email" id="email_field" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <label htmlFor="phone_field">Phone</label>
        <div className={styles.inputContainer}>
          <CountrySelect value={country} onChange={(e) => setCountry(e.target.value)} />
          <input type="text" id="phone_field" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <label htmlFor="city_field">City</label>

        <Search model="city" placeholder={"Search Cities"} onChange={setLocation} value={location} />
        <br />
        <label htmlFor="price_field">Price</label>
        <div className={styles.inputContainer}>
          <input type="text" id="price_field" onChange={e => setPrice(e.target.value)} />
        </div>
        <label htmlFor="price_field">Negotiable</label>
        <div className={styles.inputContainer}>
          <input type="checkbox" id="price_field" onChange={e => setNegotiable(e.target.value == "on" )} />
        </div>
        <label htmlFor="description_field">Description</label>
        <div className={styles.inputContainer}>
          <textarea id="description_field" onChange={e => setDescription(e.target.value)} />
        </div>
      </Tab>
      <div className={styles.sellFooter}>
            <button onClick={() => {if(active > 0) setActive(active -1);}}>Previous</button>
            <button onClick={() => {if(active < 2) setActive(active  + 1);}}>Next</button>
            <button onClick={submit}>Submit</button>
        
      </div>    
    </div>
    
    </>
  )
}

export default SellPage