import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"; 


const ProductPage = ({id}) => (
    <div>
        <div>

        </div>
        <div>
            <h2>Nissan Serena</h2>
            <h4>$18,000.00</h4>
        </div>
        <div>
            <img />
            <div>
                <h5>Seller</h5>
                <p>Number of Ads: 1</p>
            </div>
        </div>
        <div>
            <div>
                <FontAwesomeIcon icon="fa-dial" />
                <span>Mileage</span>
                <span>120,000 KM</span>
            </div>
            <div>
                <FontAwesomeIcon  icon="fa-fuel" />
                <span>Fuel</span>
                <span>Petrol</span>
            </div>
            <div>
                <FontAwesomeIcon  icon="fa-car"/>
                <span>Drivetrain</span>
                <span>4 x 4</span>
            </div>
            <div>
                <FontAwesomeIcon  icon="fa-engine"/>
                <span>Engine</span>
                <span>3.0 L</span>
            </div>
        </div>
        <div>
            <h4>Contact Seller</h4>
            <button>
                <FontAwesomeIcon icon="fa-brands fa-whatsapp" />
            </button>
            <button>
                <FontAwesomeIcon icon="fa-phone" />
            </button>
            <button>
                <FontAwesomeIcon icon="fa-envelope" />
            </button>
            <button>
                <FontAwesomeIcon icon="fa-chat" />
            </button>
        </div>
    </div>
)

export default ProductPage