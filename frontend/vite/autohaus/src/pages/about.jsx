import styles from '../styles/about.module.css'



const AboutPage = () => (
    <div className={styles.container}>
        <h1 className={styles.title}>About Autohaus</h1>
        <div className={styles.content}>
            <p>Welcome to Autohaus, your trusted online marketplace for buying and selling quality vehicles. We connect buyers with verified dealers and private sellers, making the car buying experience seamless, transparent, and reliable.</p>

            <p>Our platform features an extensive inventory of vehicles from premium brands including Honda, Toyota, Volkswagen, Mercedes-Benz, Ford, BMW, Kia, and Mazda. Whether you're looking for a sedan, SUV, truck, hatchback, or commercial vehicle, we provide advanced search tools to help you find exactly what you need.</p>

            <p>At Autohaus, we're committed to building trust in the online automotive marketplace. Our personalized recommendation system learns your preferences to surface the most relevant listings, while our verified dealer network ensures quality and peace of mind. We empower both buyers and sellers with the tools they need to make confident decisions in their automotive journey.</p>
        </div>
    </div>
)

export default AboutPage