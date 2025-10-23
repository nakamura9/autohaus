import React from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from '../utils/http'
import { url } from '../constants'
import Vehicle from '../components/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
// using tailwind for seller header styling

const SellerPage = () => {
  const { id } = useParams()
  const [seller, setSeller] = React.useState(null)
  const [vehicles, setVehicles] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    // fetch seller details
    axios.get(`${url}/seller/${id}/`).then(res => {
      setSeller(res.data)
    }).catch(err => {
      console.error(err)
    })

    // fetch vehicles for seller
    axios.get(`${url}/vehicle/?seller=${id}`).then(res => {
      if(res.data)
          setVehicles(res.data.results);
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      {seller && (
        <div className="flex items-center gap-4 mb-4">
          {seller.photo ? (
            <img src={seller.photo} alt={seller.name} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-gray-400" size="2x" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold leading-none">{seller.name}</h2>
            <div className="text-sm text-gray-500">{seller.city && seller.city.name}</div>
            <div className="text-sm text-blue-500 font-semibold">Ads: {seller.number_of_ads || 0}</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap">
        {vehicles.map(v => (
          <Vehicle key={v.id} {...v} />
        ))}
      </div>
    </div>
  )
}

export default SellerPage
