
const PRODUCTS_DATA = [
    {
        id: '1',
        name: 'Laptop Pro X',
        description: 'Powerful laptop for professionals. Intel i9, 32GB RAM, 1TB SSD.',
        price: 120000,
        image: 'C:\Users\Ketan\OneDrive\Desktop\ecommerce-platform\laptop.jpg',
        category: 'Electronics'
    },
    {
        id: '2',
        name: 'Wireless Headphones',
        description: 'Noise-cancelling headphones with great sound quality.',
        price: 8500,
        image: 'C:\Users\Ketan\OneDrive\Desktop\ecommerce-platform\headphone.jpg',
        category: 'Electronics'
    },
    {
        id: '3',
        name: 'Designer T-Shirt',
        description: 'Comfortable and stylish cotton t-shirt.',
        price: 1200,
        image: 'C:\Users\Ketan\OneDrive\Desktop\ecommerce-platform\tshirt.jpg',
        category: 'Clothing' 
    },
    {
        id: '4',
        name: 'Fiction Novel: The Enigma',
        description: 'A thrilling mystery novel that will keep you on the edge of your seat.',
        price: 450,
        image: 'C:\Users\Ketan\OneDrive\Desktop\ecommerce-platform\novel.jpg',
        category: 'Books'
    },
    {
        id: '5',
        name: 'Smartphone Elite',
        description: 'Latest smartphone with amazing camera and battery life.',
        price: 75000,
        image: 'C:\Users\Ketan\OneDrive\Desktop\ecommerce-platform\smartphone.jpg',
        category: 'Electronics'
    },
    {
        id: '6',
        name: 'Bluetooth Speaker Mini',
        description: 'Compact and portable speaker with powerful sound.',
        price: 2500,
        image: 'C:\Users\Ketan\OneDrive\Desktop\ecommerce-platform\mini.jpg',
        category: 'Electronics'
    },
    {
        id: '7',
        name: 'Gaming Mouse Pro',
        description: 'High-precision gaming mouse with customizable RGB lighting and ergonomic design.',
        price: 3500,
        image: 'C:\Users\Ketan\OneDrive\Desktop\ecommerce-platform\mouse.jpg',
        category: 'Gaming' // New category
    },
    {
        id: '8',
        name: 'Smart Watch X',
        description: 'Track your fitness, heart rate, and notifications on the go.',
        price: 15000,
        image: 'C:\Users\Ketan\OneDrive\Desktop\ecommerce-platform\watch.jpg',
        category: 'Wearables' // New category
    },
    {
        id: '9',
        name: 'Espresso Machine Deluxe',
        description: 'Brew cafe-quality espresso at home with this professional machine.',
        price: 25000,
        image: 'C:\Users\Ketan\OneDrive\Desktop\ecommerce-platform\headphone.jpg',
        category: 'Home & Kitchen' // New category
    },
    {
        id: '10',
        name: 'Yoga Mat Eco-Friendly',
        description: 'Non-slip, durable, and environmentally friendly yoga mat.',
        price: 1800,
        image: 'https://via.placeholder.com/150/20B2AA/FFFFFF?text=YogaMat',
        category: 'Sports & Fitness' // New category
    },
    {
        id: '11',
        name: 'Noise Cancelling Earbuds',
        description: 'Ultra-compact earbuds with superior noise cancellation for travel or commute.',
        price: 6000,
        image: 'https://via.placeholder.com/150/9932CC/FFFFFF?text=Earbuds',
        category: 'Electronics'
    },
    {
        id: '12',
        name: '4K Smart TV 55-inch',
        description: 'Vibrant 4K display with smart features for endless entertainment.',
        price: 65000,
        image: 'https://via.placeholder.com/150/6A5ACD/FFFFFF?text=SmartTV',
        category: 'Electronics'
    },
    {
        id: '13',
        name: 'Ergonomic Office Chair',
        description: 'Designed for comfort and support during long working hours. Adjustable features.',
        price: 18000,
        image: 'https://via.placeholder.com/150/D2B48C/000000?text=OfficeChair',
        category: 'Home Office' // New category
    },
    {
        id: '14',
        name: 'Digital Camera DSLR',
        description: 'Professional DSLR camera for stunning photos and videos. Includes lens kit.',
        price: 80000,
        image: 'https://via.placeholder.com/150/808080/FFFFFF?text=Camera',
        category: 'Photography' // New category
    },
    {
        id: '15',
        name: 'Electric Toothbrush Sonic',
        description: 'Advanced sonic technology for superior plaque removal and gum health.',
        price: 4500,
        image: 'https://via.placeholder.com/150/ADFF2F/000000?text=Toothbrush',
        category: 'Health & Personal Care'
    },
    {
        id: '16',
        name: 'Portable Hard Drive 2TB',
        description: 'High-speed external hard drive for all your storage needs. USB 3.0 compatible.',
        price: 7000,
        image: 'https://via.placeholder.com/150/FFDEAD/000000?text=HDD',
        category: 'Computer Accessories' // New category
    },
    {
        id: '17',
        name: 'Robot Vacuum Cleaner',
        description: 'Intelligent robot vacuum with powerful suction and smart mapping.',
        price: 30000,
        image: 'https://via.placeholder.com/150/BDB76B/FFFFFF?text=RobotVacuum',
        category: 'Smart Home' // New category
    },
    {
        id: '18',
        name: 'Acoustic Guitar Starter Kit',
        description: 'Complete kit for aspiring musicians. Includes guitar, bag, picks, and tuner.',
        price: 12000,
        image: 'https://via.placeholder.com/150/8B4513/FFFFFF?text=Guitar',
        category: 'Musical Instruments' // New category
    },
    {
        id: '19',
        name: 'Camping Tent 4-Person',
        description: 'Spacious and durable tent, easy to set up, perfect for family camping trips.',
        price: 9500,
        image: 'https://via.placeholder.com/150/5F9EA0/FFFFFF?text=Tent',
        category: 'Outdoor & Camping' // New category
    },
    {
        id: '20',
        name: 'Stainless Steel Water Bottle',
        description: 'Insulated, keeps drinks cold for 24 hours and hot for 12 hours. 1 Liter capacity.',
        price: 800,
        image: 'https://via.placeholder.com/150/4682B4/FFFFFF?text=WaterBottle',
        category: 'Kitchen & Dining' // New category
    }
];

// This is a common JS module export pattern for Node.js
// If this file is used directly in the browser via <script src="..."></script>
// then module.exports will not work.
// For browser usage, you would simply have 'const PRODUCTS_DATA = [...]'
// and access PRODUCTS_DATA directly in other scripts loaded after it.
module.exports = PRODUCTS_DATA;