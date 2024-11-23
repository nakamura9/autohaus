import axios from 'axios';
import React from 'react'
import {url} from '../constants'

function Index() {
    const [data, setData] = React.useState([])

    React.useEffect(() => {
        axios.get(`${url}/vehicle/`).then((response) => {
            console.log(response.data)
            setData(response.data.results)
        })
    }, [])

    return (
        <div>
            <div>
            <ul>
                <li>Buy</li>
                <li>Sell</li>
            </ul>
            
            {data.map(d => (
                <div>
                    <p>{d.year} {d.make.name} {d.model.name}</p>
                    <p>{d.price}</p>
                </div>
            ))}
            </div>
            
        </div>
    )
}

export default Index;