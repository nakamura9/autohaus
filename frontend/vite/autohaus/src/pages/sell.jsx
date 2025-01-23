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
import { useNavigate, useLocation } from 'react-router-dom'
import { Carousel } from 'react-responsive-carousel'



const Tab = ({children, active}) => {
  return (
    <div className={styles.tab} style={{display: active ? "block": "none"}}>
        {children}
    </div>
  )
}

const SamplePhotoCarousel = () => {
  const slides = [
    <div className={styles.tips}>
      <h4>Tips for taking great photos</h4>
      <ul>
        <li>Use a well lit area, preferrably natural light and no flash.</li>
        <li>Shoot against a uniform background.</li>
        <li>Make sure your vehicle is fully visible.</li>
        <li>Shoot the image in auto mode.</li>
        <li>Make sure there are no blur or filter effects applied to the image.</li>
      </ul>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/front.png`} alt="placeholder" />
      </div>
      <h5>Front View</h5>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/rear.png`} alt="placeholder" />
      </div>
      <h5>Rear View</h5>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/side.png`} alt="placeholder" />
      </div>
      <h5>Side View</h5>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/front three quarter.png`} alt="placeholder" />
      </div>
      <h5>Front Three Quarter View</h5>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/rear three quarter.png`} alt="placeholder" />
      </div>
      <h5>Rear Three Quarter View</h5>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/front.png`} alt="placeholder" />
      </div>
      <h5>Dashboard View</h5>
    </div>
  ]

  return (
    <div className={styles.imgCarousel}>
      <Carousel  >
        {slides.map((s, i) => (<div key={i}>{s}</div>))}
        </Carousel>
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
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [city, setCity] = React.useState(null)
  const [price, setPrice] = React.useState(0)
  const [negotiable, setNegotiable] = React.useState(false)
  const [description, setDescription] = React.useState('')
  const [id, setID] = React.useState(null)
  const context = useContext(Context)
  const navigate = useNavigate()
  const location = useLocation()
  

  const parseParams = () => {
    let args = window.location.search
    if(!args.length > 0) {
      return 
    }
    args = args.slice(1)
    const params = new URLSearchParams(args)
    if(params.get("listing")) {
      setID(params.get("listing"))
    }
  }

  React.useEffect(parseParams, [])
  React.useEffect(parseParams, [location])

  React.useEffect(() => {
    if(!id) {
      return
    }
    axios.get(`${url}/vehicle/${id}/`).then((data) => {
      setImages(data.data.photos.map(p => ({src: p.photo, existing: true, id: p.id})))
      setCountry(data.data.country)
      setMake(data.data.make.id)
      setModel(data.data.model.id)
      setModelFilters({make: data.data.make.id})
      setFuelType(data.data.fuel_type)
      setTransmission(data.data.transmission)
      setMileage(data.data.mileage)
      setCondition(data.data.condition)
      setName(data.data.name)
      setEmail(data.data.email)
      setPhone(data.data.phone)
      setCity(data.data.location)
      setPrice(data.data.price)
      setNegotiable(data.data.negotiable)
      setDescription(data.data.description)
      
    }).catch(err => {
      console.log({err})
      context.toast("Cannot get listing")
    })
  }, [id])

  React.useEffect(() => {
    if(!context.user)
      return;

    if(name) {
      return
    }

    setName(`${context.user.first_name} ${context.user.last_name}`)
    setEmail(context.user.email)
    setPhone(context.user.phone)
    setCity(context.user.city)
    setCountry(context.user.country)
  }, [context.user])

  const handleMake = (value)  => {
    setMake(value)
    setModel(null)
    setModelFilters({make: value})
  }

  const validate = () => {
    if(!images.length) {
      context.toast("Please upload at least one image")
      return false
    }
    if(!city) {
      context.toast("A valid city must be provided")
      return false
    }
    if(!price) {
      context.toast("Please submit your vehicle with a price.")
      return false
    }
    
    if(!make) {
      context.toast("Please select a make")
      return false
    }
    
    if(!model) {
      context.toast("Please select a model")
      return false
    }
     if(!fuelType) {
      context.toast("Please select a fuel type")
      return false
    }
    if(!transmission) {
      context.toast("Please select a transmission type")
      return false
    }
    if(!mileage && mileage != 0) {
      context.toast("Please provide the mileage")
      return false
    }
    if(!condition) {
      context.toast("Please select a condition")
      return false
    }
    if(!name) {
      context.toast("Please provide your name")
      return false
    }
    if(!email) {
      context.toast("Please provide your email")
      return false
    }
    if(!phone) {
      context.toast("Please provide your phone number")
      return false
    }
    if(!country) {
      context.toast("Please provide a valid country code")
      return false
    }
    if(!description) {
      context.toast("Please provide a description for your vehicle")
      return false
    }
    return true
  }

  const on_submit = (id) => {
    resetForm()
    context.toast("Vehicle submitted successfully")
    setTimeout(() => navigate(`/product/${id}`))
  }

  const resetForm = () => {
    setActive(0)
    setImages([])
    setCountry("ZW")
    setMake(null)
    setModel(null)
    setModelFilters({})
    setFuelType(null)
    setTransmission(null)
    setMileage(null)
    setCondition("Non-Runner")
    setName('')
    setEmail('')
    setPhone('')
    setCity(null)
    setPrice(0)
    setNegotiable(false)
    setDescription('')
    setID(null)
  }

  const submit = () => {
    const payload = {
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
      location: city,
      price: price,
      negotiable: negotiable,
      description: description,
      id: id
    }
    if(!validate()) 
      return;

    axios.post(`${url}/api/create-vehicle/`, payload).then((data) => {
      on_submit(data.data.id)
    }).catch(err => {
      context.toast("Cannot submit vehicle")
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
            <Search label="Make" model="make" placeholder={"Search Makes"} onChange={handleMake} propId={make} /><br />
            <Search label="Model" model="model" placeholder={"Search Model"} filters={modelFilters} onChange={setModel} propId={model} />
          </div>
          <label >Fuel Type</label>
          <Pills options={["PETROL", "DIESEL"]} onChange={setFuelType} value={fuelType} />
          <label >Transmission</label>
          <Pills options={["MANUAL", "AUTOMATIC"]} onChange={setTransmission} value={transmission} />
          <label htmlFor="model_field">Mileage (Km)</label>
          <div className={styles.inputContainer}>
            <input value={mileage} type="text" id="mileage_field" onChange={e => setMileage(e.target.value)} /> 
          </div>
          <label >Condition</label>
          <Pills 
            options={["Non-Runner", "Needs Work", "Fair", "Good", "Excellent", "New"]} 
            onChange={setCondition}
            value={condition} />
      </Tab>
      <Tab active={active == 1}>
        <div className={styles.flex}>
        <ImageUploadWidget onUploadSuccess={(img) => setImages([...images, img])} />
        <SamplePhotoCarousel />
        </div>
        <div className={styles.capturedPhotos}>
          {images.map((img, i) => (<div key={i} className={styles.imgContainer}>
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
        <Search model="city" placeholder={"Search Cities"} onChange={setCity} propId={city} />
        <br />
        <label htmlFor="price_field">Price</label>
        <div className={styles.inputContainer}>
          <input value={price} type="text" id="price_field" onChange={e => setPrice(e.target.value)} />
        </div>
        <label htmlFor="price_field">Negotiable</label>
        <div className={styles.inputContainer}>
          <input checked={negotiable} type="checkbox" id="price_field" onChange={e => setNegotiable(e.target.value == "on" )} />
        </div>
        <label htmlFor="description_field">Description</label>
        <div className={styles.inputContainer}>
          <textarea value={description} id="description_field" onChange={e => setDescription(e.target.value)} />
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