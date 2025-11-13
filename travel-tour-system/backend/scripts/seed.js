/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure we load the backend .env regardless of CWD
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const TourPackage = require('../models/TourPackage');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Review = require('../models/Review');
const connectDB = require('../config/db');

async function ensureAdminUser() {
  const adminEmail = 'admin@example.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    admin = await User.create({
      name: 'Sarah Anderson',
      email: adminEmail,
      password: passwordHash,
      phone: '+10000000000',
      role: 'admin',
      isEmailVerified: true,
    });
  } else if (admin.role !== 'admin') {
    // Ensure existing user has admin role
    admin.role = 'admin';
    await admin.save();
  }
  return admin;
}

function sampleTours(createdById, indiaOnly = false) {
  // Define popular city templates and map to full tour docs
  const globalTemplates = [
    { dest: 'Paris', country: 'France', days: 5, price: 850, rating: 4.8, reviewCount: 245, img: 'https://images.unsplash.com/photo-1543340713-8a9c47fb79aa?q=80&w=1200&auto=format&fit=crop', featured: true, tags: ['city','museum','romantic'] },
    { dest: 'London', country: 'United Kingdom', days: 5, price: 820, rating: 4.6, reviewCount: 189, img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop', tags: ['city','history'] },
    { dest: 'Rome', country: 'Italy', days: 5, price: 799, rating: 4.7, reviewCount: 312, img: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1200&auto=format&fit=crop', tags: ['ancient','food'] },
    { dest: 'Barcelona', country: 'Spain', days: 4, price: 699, rating: 4.5, reviewCount: 156, img: 'https://images.unsplash.com/photo-1464790719320-516ecd75af6c?q=80&w=1200&auto=format&fit=crop', tags: ['architecture','beach'] },
    { dest: 'Amsterdam', country: 'Netherlands', days: 4, price: 749, rating: 4.4, reviewCount: 128, img: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=1200&auto=format&fit=crop', tags: ['canals','bike'] },
    { dest: 'Berlin', country: 'Germany', days: 4, price: 650, rating: 4.3, reviewCount: 94, img: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop', tags: ['history','culture'] },
    { dest: 'Prague', country: 'Czech Republic', days: 4, price: 599, rating: 4.6, reviewCount: 203, img: 'https://images.unsplash.com/photo-1526152501824-8f39f9c90d9f?q=80&w=1200&auto=format&fit=crop', tags: ['old town','romantic'] },
    { dest: 'Vienna', country: 'Austria', days: 4, price: 699, rating: 4.5, reviewCount: 176, img: 'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?q=80&w=1200&auto=format&fit=crop', tags: ['music','palaces'] },
    { dest: 'Interlaken', country: 'Switzerland', days: 7, price: 1499, rating: 4.9, reviewCount: 567, img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', tags: ['mountains','scenic'], featured: true },
    { dest: 'Venice', country: 'Italy', days: 3, price: 549, rating: 4.7, reviewCount: 298, img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop', tags: ['canals','romantic'] },
    { dest: 'Florence', country: 'Italy', days: 4, price: 699, rating: 4.8, reviewCount: 334, img: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200&auto=format&fit=crop', tags: ['art','renaissance'] },
    { dest: 'New York', country: 'USA', days: 5, price: 950, rating: 4.6, reviewCount: 445, img: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?q=80&w=1200&auto=format&fit=crop', tags: ['city','skyline'] },
    { dest: 'San Francisco', country: 'USA', days: 4, price: 899, rating: 4.5, reviewCount: 267, img: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1200&auto=format&fit=crop', tags: ['bridge','bay'] },
    { dest: 'Toronto', country: 'Canada', days: 4, price: 749, rating: 4.4, reviewCount: 112, img: 'https://images.unsplash.com/photo-1486649567693-aaa9b2e59385?q=80&w=1200&auto=format&fit=crop', tags: ['city','multicultural'] },
    { dest: 'Vancouver', country: 'Canada', days: 4, price: 799, rating: 4.7, reviewCount: 198, img: 'https://images.unsplash.com/photo-1506045412240-22980140a405?q=80&w=1200&auto=format&fit=crop', tags: ['coast','nature'] },
    { dest: 'Kyoto', country: 'Japan', days: 4, price: 799, rating: 4.9, reviewCount: 401, img: 'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1200&auto=format&fit=crop', tags: ['temples','culture'] },
    { dest: 'Seoul', country: 'South Korea', days: 4, price: 699, rating: 4.6, reviewCount: 287, img: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=1200&auto=format&fit=crop', tags: ['city','food'] },
    { dest: 'Singapore', country: 'Singapore', days: 4, price: 799, rating: 4.5, reviewCount: 156, img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200&auto=format&fit=crop', tags: ['city','gardens'] },
    { dest: 'Bangkok', country: 'Thailand', days: 4, price: 549, rating: 4.4, reviewCount: 312, img: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop', tags: ['temples','street food'] },
    { dest: 'Bali', country: 'Indonesia', days: 6, price: 649, rating: 4.7, reviewCount: 478, img: 'https://images.unsplash.com/photo-1543248939-2ec0dfc73f16?q=80&w=1200&auto=format&fit=crop', tags: ['beach','culture'], featured: true },
    { dest: 'Dubai', country: 'UAE', days: 4, price: 899, rating: 4.3, reviewCount: 223, img: 'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?q=80&w=1200&auto=format&fit=crop', tags: ['luxury','city'] },
    { dest: 'Istanbul', country: 'Turkey', days: 4, price: 599, rating: 4.6, reviewCount: 289, img: 'https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1200&auto=format&fit=crop', tags: ['historic','bazaars'] },
    { dest: 'Cairo', country: 'Egypt', days: 4, price: 549, rating: 4.5, reviewCount: 176, img: 'https://images.unsplash.com/photo-1544989164-5d36f3e39fb8?q=80&w=1200&auto=format&fit=crop', tags: ['pyramids','history'] },
    { dest: 'Cape Town', country: 'South Africa', days: 5, price: 849, rating: 4.8, reviewCount: 334, img: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1200&auto=format&fit=crop', tags: ['coast','mountain'] },
  ];

  const indiaTemplates = [
    { dest: 'Mumbai', country: 'India', days: 4, price: 449, rating: 4.6, reviewCount: 267, tags: ['city','coast'], featured: true },
    { dest: 'Delhi', country: 'India', days: 4, price: 399, rating: 4.5, reviewCount: 198, tags: ['heritage','city'], featured: true },
    { dest: 'Bengaluru', country: 'India', days: 3, price: 349, rating: 4.3, reviewCount: 145, tags: ['garden','tech'], featured: true },
    { dest: 'Chennai', country: 'India', days: 3, price: 329, rating: 4.4, reviewCount: 112, tags: ['coast'], featured: true },
    { dest: 'Hyderabad', country: 'India', days: 3, price: 339, rating: 4.5, reviewCount: 156, tags: ['heritage','food'], featured: true },
    { dest: 'Kolkata', country: 'India', days: 3, price: 329, rating: 4.3, reviewCount: 128, tags: ['culture'], featured: true },
    { dest: 'Pune', country: 'India', days: 3, price: 319, rating: 4.4, reviewCount: 134, tags: ['city','tech'], featured: true },
    { dest: 'Ahmedabad', country: 'India', days: 3, price: 299, rating: 4.2, reviewCount: 98, tags: ['heritage','business'], featured: true },
    { dest: 'Jaipur', country: 'India', days: 3, price: 359, rating: 4.7, reviewCount: 289, tags: ['palaces','heritage'], featured: true },
    { dest: 'Lucknow', country: 'India', days: 3, price: 309, rating: 4.4, reviewCount: 115, tags: ['heritage','culture'], featured: true },
    { dest: 'Goa', country: 'India', days: 5, price: 499, rating: 4.8, reviewCount: 412, tags: ['beach','party','relaxation'], featured: true }
  ];

  const cityTemplates = indiaOnly ? indiaTemplates : globalTemplates;

  // Curated location-specific images per destination (Unsplash IDs)
  const curatedImages = {
    // India curated - user provided URLs only
    Mumbai: [
      'https://mumbaidreamtours.com/wp-content/uploads/2023/02/VAT04981-8bce281f29694d65b03fe7eec2c1cd56-1.jpg'
    ],
    Delhi: [
      'https://th.bing.com/th/id/R.03952e62d060d39db9083ddb21e840bb?rik=z41GnTa89bIZ%2bg&riu=http%3a%2f%2fupload.wikimedia.org%2fwikipedia%2fcommons%2fb%2fb8%2fRed-Fort%2cDelhi.JPG&ehk=tQWcXPaxmXxQz3c1LmZ8LJhcaamrLnas5IBsmc96cYA%3d&risl=1&pid=ImgRaw&r=0'
    ],
    Bengaluru: [
      'https://wallpaperaccess.com/full/6999881.jpg'
    ],
    Chennai: [
      'https://wallpapers.com/images/hd/chennai-kapaleeswarar-temple-0cnpafwjksiaz1j4.jpg'
    ],
    Hyderabad: [
      'https://tse2.mm.bing.net/th/id/OIP.zanlai4-ATBxmFAv2qT2-gHaFj?rs=1&pid=ImgDetMain'
    ],
    Kolkata: [
      'https://th.bing.com/th/id/OIP.rUfv07oLJBKjzDlevkZuigHaEO?rs=1&pid=ImgDetMain'
    ],
    Pune: [
      'https://tse3.mm.bing.net/th/id/OIP.ui_pzRRcTxkAM6igA30mzAHaEu?rs=1&pid=ImgDetMain'
    ],
    Ahmedabad: [
      'https://i.ytimg.com/vi/mzNFOGapnco/maxresdefault.jpg'
    ],
    Jaipur: [
      'https://th.bing.com/th/id/R.d376b3158ab5a241218706943ff402d9?rik=C7kfPUiAgXzwXg&riu=http%3a%2f%2fwww.travelstart.co.za%2fblog%2fwp-content%2fuploads%2f2019%2f08%2fJaipur-47.jpg&ehk=RRqQBR0tLICjlqaEyGnyLr3MEDPZoo4383EBtUc8Gn4%3d&risl=&pid=ImgRaw&r=0'
    ],
    Lucknow: [
      'https://cdn.britannica.com/28/170728-050-AD5F144B/Great-Imambara-Lucknow-Uttar-Pradesh-India.jpg'
    ],
    Goa: [
      'https://tse2.mm.bing.net/th/id/OIP.gbnveQtvbVaEc-sUye8bFgHaEK?rs=1&pid=ImgDetMain'
    ],
    Paris: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop', // Eiffel
      'https://images.unsplash.com/photo-1462917882517-e150004895fa?q=80&w=1200&auto=format&fit=crop' // Seine
    ],
    London: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop', // Tower Bridge
      'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1200&auto=format&fit=crop' // Big Ben
    ],
    Rome: [
      'https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1200&auto=format&fit=crop', // Colosseum
      'https://images.unsplash.com/photo-1526483360412-f4dbaf036963?q=80&w=1200&auto=format&fit=crop' // Roman Forum
    ],
    Barcelona: [
      'https://images.unsplash.com/photo-1464790719320-516ecd75af6c?q=80&w=1200&auto=format&fit=crop', // Sagrada Familia
      'https://images.unsplash.com/photo-1502491879858-029b6b59fb5f?q=80&w=1200&auto=format&fit=crop' // Park Guell
    ],
    Amsterdam: [
      'https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=1200&auto=format&fit=crop', // Canals
      'https://images.unsplash.com/photo-1506086679524-493c64fdfaa6?q=80&w=1200&auto=format&fit=crop'
    ],
    Berlin: [
      'https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop', // Brandenburg Gate
      'https://images.unsplash.com/photo-1520950237264-6e0f35a47e26?q=80&w=1200&auto=format&fit=crop'
    ],
    Prague: [
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Prague_Charles_Bridge.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/7/73/Prague_Old_Town_Square_view_from_astronomical_clock_tower.jpg'
    ],
    Vienna: [
      'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?q=80&w=1200&auto=format&fit=crop', // Schonbrunn
      'https://images.unsplash.com/photo-1531572753322-ad063cecc140?q=80&w=1200&auto=format&fit=crop'
    ],
    Interlaken: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', // Alps
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop'
    ],
    Venice: [
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop', // Canals
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1200&auto=format&fit=crop'
    ],
    Florence: [
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200&auto=format&fit=crop', // Duomo
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1200&auto=format&fit=crop'
    ],
    'New York': [
      'https://cdn.pixabay.com/photo/2016/10/20/18/23/new-york-1755231_1280.jpg', // New York skyline
      'https://cdn.pixabay.com/photo/2017/03/31/21/34/new-york-2192520_1280.jpg' // Statue of Liberty
    ],
    'San Francisco': [
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1200&auto=format&fit=crop', // Golden Gate
      'https://images.unsplash.com/photo-1507746211714-4fca48ee50c1?q=80&w=1200&auto=format&fit=crop'
    ],
    Toronto: [
      'https://images.unsplash.com/photo-1486649567693-aaa9b2e59385?q=80&w=1200&auto=format&fit=crop', // CN Tower
      'https://images.unsplash.com/photo-1506045412240-22980140a405?q=80&w=1200&auto=format&fit=crop'
    ],
    Vancouver: [
      'https://images.unsplash.com/photo-1506045412240-22980140a405?q=80&w=1200&auto=format&fit=crop', // Skyline
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=1200&auto=format&fit=crop'
    ],
    Kyoto: [
      'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1200&auto=format&fit=crop', // Fushimi Inari
      'https://images.unsplash.com/photo-1459156212016-c812468e2115?q=80&w=1200&auto=format&fit=crop'
    ],
    Seoul: [
      'https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=1200&auto=format&fit=crop', // Gyeongbokgung
      'https://images.unsplash.com/photo-1526481280698-8fcc13fd3679?q=80&w=1200&auto=format&fit=crop'
    ],
    Singapore: [
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200&auto=format&fit=crop', // Marina Bay
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop'
    ],
    Bangkok: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop', // Wat Arun
      'https://images.unsplash.com/photo-1544531588-2affa6d123bf?q=80&w=1200&auto=format&fit=crop'
    ],
    Bali: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', // Rice terraces
      'https://images.unsplash.com/photo-1543248939-2ec0dfc73f16?q=80&w=1200&auto=format&fit=crop'
    ],
    Dubai: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Burj Khalifa
      'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' // Dubai skyline with Burj Al Arab
    ],
    Istanbul: [
      'https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1200&auto=format&fit=crop', // Hagia Sophia
      'https://images.unsplash.com/photo-1508170754725-6f8d5f1d2a3b?q=80&w=1200&auto=format&fit=crop'
    ],
    Cairo: [
      'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/e/e3/The_Great_Sphinx_of_Giza_-_Giza%2C_Egypt.jpg'
    ],
    'Cape Town': [
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1200&auto=format&fit=crop', // Table Mountain
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop'
    ],
    'Maasai Mara': [
      'https://images.unsplash.com/photo-1543248939-2ec0dfc73f16?q=80&w=1200&auto=format&fit=crop', // Safari
      'https://images.unsplash.com/photo-1508675801641-1611b0f70fef?q=80&w=1200&auto=format&fit=crop'
    ]
  };

  return cityTemplates.map((c) => ({
    title: `${c.dest} City Highlights`,
    description: `Discover ${c.dest} with curated experiences across iconic sights, local neighborhoods, and must-try food.`,
    shortDescription: `${c.days}-day ${c.dest} highlights tour.`,
    destination: c.dest,
    country: c.country,
    duration: c.days,
    price: c.price,
    originalPrice: Math.round(c.price * 1.15),
    discount: 0,
    images: (curatedImages[c.dest] || []).slice(0,2).map((url) => ({ url })) ,
    itinerary: [
      { day: 1, title: 'Arrival & Orientation', description: `Arrive in ${c.dest} and explore the surroundings.` },
      { day: 2, title: 'Iconic Sights', description: 'Guided tour of the most famous landmarks.' }
    ],
    inclusions: ['Hotel', 'Breakfast'],
    exclusions: ['International Flights'],
    highlights: ['Iconic Landmark', 'Old Town / Downtown'],
    difficulty: c.days >= 6 ? 'moderate' : 'easy',
    groupSize: { min: 1, max: 20 },
    cancellationPolicy: c.days >= 6 ? 'Free cancellation up to 14 days before departure.' : 'Free cancellation up to 7 days before departure.',
    startDate: new Date(),
    endDate: new Date(Date.now() + (c.days - 1) * 24 * 60 * 60 * 1000),
    isFeatured: Boolean(c.featured),
    tags: c.tags,
    rating: {
      average: c.rating || 4.5,
      count: c.reviewCount || Math.floor(Math.random() * 300) + 50
    },
    bookings: { total: 0, available: 20 },
    createdBy: createdById,
  }));
}

function sampleDestinations() {
  return [
    {
      name: 'Paris',
      country: 'France',
      description: 'The City of Light, renowned for art, fashion, gastronomy and culture.',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Seine River', 'Notre-Dame'],
      bestTimeToVisit: ['April', 'May', 'June', 'September', 'October'],
      tags: ['city', 'romantic', 'museum'],
      isPopular: true,
      image: { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop' }
    },
    {
      name: 'Maasai Mara',
      country: 'Kenya',
      description: 'Famous for its exceptional population of lions, leopards, cheetahs and the annual migration.',
      highlights: ['Great Migration', 'Big Five', 'Savannah'],
      bestTimeToVisit: ['July', 'August', 'September', 'October'],
      tags: ['wildlife', 'safari', 'nature'],
      isPopular: true,
      image: { url: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop' }
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      description: 'Island of the Gods with stunning beaches, volcanic mountains and iconic rice paddies.',
      highlights: ['Ubud', 'Uluwatu', 'Tanah Lot'],
      bestTimeToVisit: ['April', 'May', 'June', 'September'],
      tags: ['beach', 'island', 'wellness'],
      isPopular: true,
      image: { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop' }
    }
  ];
}

function sampleHotels() {
  return [
    // Paris
    {
      name: 'Hotel Lumiere',
      destination: 'Paris',
      country: 'France',
      category: 'budget',
      rating: 4.1,
      pricePerNight: 95,
      amenities: ['WiFi', 'Breakfast', '24h Reception'],
      address: '10 Rue de Paris, 75000 Paris, France'
    },
    {
      name: 'Paris Central Suites',
      destination: 'Paris',
      country: 'France',
      category: 'standard',
      rating: 4.5,
      pricePerNight: 160,
      amenities: ['WiFi', 'Breakfast', 'Gym', 'Bar'],
      address: '25 Avenue de la République, 75011 Paris, France'
    },
    {
      name: 'Grand Royale Paris',
      destination: 'Paris',
      country: 'France',
      category: 'luxury',
      rating: 4.8,
      pricePerNight: 350,
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Concierge'],
      address: '2 Place Vendôme, 75001 Paris, France'
    },
    // Maasai Mara
    {
      name: 'Savannah Budget Camp',
      destination: 'Maasai Mara',
      country: 'Kenya',
      category: 'budget',
      rating: 4.0,
      pricePerNight: 70,
      amenities: ['Meals', 'Guided Walks'],
      address: 'Talek, Narok County, Kenya'
    },
    {
      name: 'Mara Plains Lodge',
      destination: 'Maasai Mara',
      country: 'Kenya',
      category: 'standard',
      rating: 4.6,
      pricePerNight: 210,
      amenities: ['All-inclusive', 'Game Drives', 'WiFi'],
      address: 'Olare Motorogi Conservancy, Kenya'
    },
    {
      name: 'Royal Savannah Luxury Camp',
      destination: 'Maasai Mara',
      country: 'Kenya',
      category: 'luxury',
      rating: 4.9,
      pricePerNight: 480,
      amenities: ['All-inclusive', 'Private Guide', 'Pool', 'Spa'],
      address: 'Masai Mara National Reserve, Kenya'
    },
    // Bali
    {
      name: 'Ubud Garden Inn',
      destination: 'Bali',
      country: 'Indonesia',
      category: 'budget',
      rating: 4.2,
      pricePerNight: 40,
      amenities: ['WiFi', 'Breakfast', 'Airport Shuttle'],
      address: 'Jl. Raya Ubud, Ubud, Bali, Indonesia'
    },
    {
      name: 'Kuta Beach Resort',
      destination: 'Bali',
      country: 'Indonesia',
      category: 'standard',
      rating: 4.5,
      pricePerNight: 120,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
      address: 'Jl. Pantai Kuta, Kuta, Bali, Indonesia'
    },
    {
      name: 'Nusa Dua Palace',
      destination: 'Bali',
      country: 'Indonesia',
      category: 'luxury',
      rating: 4.9,
      pricePerNight: 390,
      amenities: ['WiFi', 'Private Beach', 'Spa', 'Butler'],
      address: 'Nusa Dua, Bali, Indonesia'
    }
  ];
}

async function run() {
  try {
    // Fallback to local Mongo if env var missing
    if (!process.env.MONGODB_URI) {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/travel-tour-system';
    }
    await connectDB();
    const admin = await ensureAdminUser();

    const reset = process.argv.includes('--reset') || process.env.SEED_RESET === 'true';
    const indiaOnly = process.argv.includes('--india') || process.env.SEED_INDIA === 'true';
    const customArg = process.argv.find((a) => a.startsWith('--custom='));
    const customFile = customArg ? customArg.split('=')[1] : (process.env.SEED_CUSTOM_FILE || null);
    let customTemplates = null;
    if (customFile) {
      try {
        const full = path.isAbsolute(customFile) ? customFile : path.join(__dirname, customFile);
        const raw = fs.readFileSync(full, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) customTemplates = parsed;
        console.log(`Loaded custom templates from ${full} (${customTemplates?.length || 0})`);
      } catch (e) {
        console.warn('Failed to load custom templates file:', e.message);
      }
    }
    if (reset) {
      await TourPackage.deleteMany({});
      console.log('Cleared existing tours.');
    }

    // Seed destinations
    const destCount = await Destination.countDocuments();
    if (destCount === 0 || reset) {
      if (reset) await Destination.deleteMany({});
      if (customTemplates) {
        const destDocs = Array.from(new Map(customTemplates.map(c => ([`${c.dest}|${c.country}`, {
          name: c.dest,
          country: c.country,
          highlights: c.highlights || [],
          tags: c.tags || [],
          image: c.images && c.images[0] ? { url: c.images[0] } : undefined,
          isPopular: true
        }]))).values());
        await Destination.insertMany(destDocs);
        console.log('Seeded custom destinations.');
      } else if (indiaOnly) {
        await Destination.insertMany([
          { name: 'Mumbai', country: 'India', highlights: ['Gateway of India', 'Marine Drive'], tags: ['city','coast'], image: { url: 'https://mumbaidreamtours.com/wp-content/uploads/2023/02/VAT04981-8bce281f29694d65b03fe7eec2c1cd56-1.jpg' }, isPopular: true },
          { name: 'Delhi', country: 'India', highlights: ['Red Fort', 'Qutub Minar', 'India Gate'], tags: ['heritage','city'], image: { url: 'https://th.bing.com/th/id/R.03952e62d060d39db9083ddb21e840bb?rik=z41GnTa89bIZ%2bg&riu=http%3a%2f%2fupload.wikimedia.org%2fwikipedia%2fcommons%2fb%2fb8%2fRed-Fort%2cDelhi.JPG&ehk=tQWcXPaxmXxQz3c1LmZ8LJhcaamrLnas5IBsmc96cYA%3d&risl=1&pid=ImgRaw&r=0' }, isPopular: true },
          { name: 'Bengaluru', country: 'India', highlights: ['Lalbagh', 'Cubbon Park', 'Vidhana Soudha'], tags: ['city','garden','tech'], image: { url: 'https://wallpaperaccess.com/full/6999881.jpg' }, isPopular: true },
          { name: 'Chennai', country: 'India', highlights: ['Marina Beach', 'Kapaleeshwarar Temple'], tags: ['coast'], image: { url: 'https://wallpapers.com/images/hd/chennai-kapaleeswarar-temple-0cnpafwjksiaz1j4.jpg' } },
          { name: 'Hyderabad', country: 'India', highlights: ['Charminar', 'Golconda Fort'], tags: ['heritage','food'], image: { url: 'https://tse2.mm.bing.net/th/id/OIP.zanlai4-ATBxmFAv2qT2-gHaFj?rs=1&pid=ImgDetMain' } },
          { name: 'Kolkata', country: 'India', highlights: ['Victoria Memorial', 'Howrah Bridge'], tags: ['culture'], image: { url: 'https://th.bing.com/th/id/OIP.rUfv07oLJBKjzDlevkZuigHaEO?rs=1&pid=ImgDetMain' } },
          { name: 'Pune', country: 'India', highlights: ['Shaniwar Wada', 'Aga Khan Palace'], tags: ['city','tech'], image: { url: 'https://tse3.mm.bing.net/th/id/OIP.ui_pzRRcTxkAM6igA30mzAHaEu?rs=1&pid=ImgDetMain' } },
          { name: 'Ahmedabad', country: 'India', highlights: ['Sabarmati Ashram', 'Jama Masjid'], tags: ['heritage','business'], image: { url: 'https://i.ytimg.com/vi/mzNFOGapnco/maxresdefault.jpg' } },
          { name: 'Jaipur', country: 'India', highlights: ['Amber Fort', 'Hawa Mahal'], tags: ['palaces','heritage'], image: { url: 'https://th.bing.com/th/id/R.d376b3158ab5a241218706943ff402d9?rik=C7kfPUiAgXzwXg&riu=http%3a%2f%2fwww.travelstart.co.za%2fblog%2fwp-content%2fuploads%2f2019%2f08%2fJaipur-47.jpg&ehk=RRqQBR0tLICjlqaEyGnyLr3MEDPZoo4383EBtUc8Gn4%3d&risl=&pid=ImgRaw&r=0' }, isPopular: true },
          { name: 'Lucknow', country: 'India', highlights: ['Bara Imambara', 'Rumi Darwaza'], tags: ['heritage','culture'], image: { url: 'https://cdn.britannica.com/28/170728-050-AD5F144B/Great-Imambara-Lucknow-Uttar-Pradesh-India.jpg' } },
          { name: 'Goa', country: 'India', highlights: ['Beaches', 'Churches', 'Nightlife'], tags: ['beach','party','relaxation'], image: { url: 'https://tse2.mm.bing.net/th/id/OIP.gbnveQtvbVaEc-sUye8bFgHaEK?rs=1&pid=ImgDetMain' }, isPopular: true }
        ]);
        console.log('Seeded India destinations.');
      } else {
        await Destination.insertMany(sampleDestinations());
        console.log('Seeded sample destinations.');
      }
    } else {
      console.log('Destinations already exist. Skipping seeding.');
    }

    // Seed hotels
    const hotelCount = await Hotel.countDocuments();
    if (hotelCount === 0 || reset) {
      if (reset) await Hotel.deleteMany({});
      if (customTemplates) {
        const hotelDocs = customTemplates.map(c => ({
          name: `${c.dest} Central Hotel`,
          destination: c.dest,
          country: c.country,
          category: 'standard',
          rating: 4.4,
          pricePerNight: Math.max(60, Math.min(260, Math.round((c.price || 800) / (c.days || 3)))) ,
          amenities: ['WiFi','Breakfast']
        }));
        await Hotel.insertMany(hotelDocs);
        console.log('Seeded custom hotels.');
      } else if (indiaOnly) {
        await Hotel.insertMany([
          { name: 'The Imperial', destination: 'Delhi', country: 'India', category: 'luxury', rating: 4.7, pricePerNight: 220, amenities: ['WiFi','Spa','Restaurant'] },
          { name: 'Taj Mahal Palace', destination: 'Mumbai', country: 'India', category: 'luxury', rating: 4.8, pricePerNight: 300, amenities: ['WiFi','Pool','Sea View'] },
          { name: 'Trident Jaipur', destination: 'Jaipur', country: 'India', category: 'standard', rating: 4.5, pricePerNight: 120, amenities: ['WiFi','Pool'] },
          { name: 'ITC Mughal', destination: 'Agra', country: 'India', category: 'standard', rating: 4.4, pricePerNight: 110, amenities: ['WiFi','Spa','Restaurant'] },
          { name: 'Brijrama Palace', destination: 'Varanasi', country: 'India', category: 'luxury', rating: 4.6, pricePerNight: 180, amenities: ['WiFi','Restaurant'] },
          { name: 'Taj Exotica', destination: 'Goa', country: 'India', category: 'luxury', rating: 4.7, pricePerNight: 250, amenities: ['WiFi','Pool','Beach Access'] },
          { name: 'The Oberoi Grand', destination: 'Kolkata', country: 'India', category: 'luxury', rating: 4.7, pricePerNight: 200, amenities: ['WiFi','Pool'] },
          { name: 'ITC Grand Chola', destination: 'Chennai', country: 'India', category: 'luxury', rating: 4.7, pricePerNight: 210, amenities: ['WiFi','Spa','Pool'] },
          { name: 'The Leela Palace', destination: 'Bengaluru', country: 'India', category: 'luxury', rating: 4.7, pricePerNight: 220, amenities: ['WiFi','Spa','Pool'] },
          { name: 'Hyatt Hyderabad', destination: 'Hyderabad', country: 'India', category: 'standard', rating: 4.4, pricePerNight: 130, amenities: ['WiFi','Gym'] },
          { name: 'Taj Lake Palace', destination: 'Udaipur', country: 'India', category: 'luxury', rating: 4.9, pricePerNight: 320, amenities: ['WiFi','Spa','Lake View'] },
          { name: 'Aloha On The Ganges', destination: 'Rishikesh', country: 'India', category: 'standard', rating: 4.3, pricePerNight: 100, amenities: ['WiFi','Yoga'] },
          { name: 'Brunton Boatyard', destination: 'Kochi', country: 'India', category: 'standard', rating: 4.5, pricePerNight: 140, amenities: ['WiFi','Sea View'] }
        ]);
        console.log('Seeded India hotels.');
      } else {
        await Hotel.insertMany(sampleHotels());
        console.log('Seeded sample hotels.');
      }
    } else {
      console.log('Hotels already exist. Skipping seeding.');
    }

    const existing = await TourPackage.countDocuments();
    if (existing === 0 || reset) {
      if (reset) await TourPackage.deleteMany({});
      const tours = customTemplates ? customTemplates.map((c) => {
        const tourImages = (c.images || []).slice(0, 2).map(url => ({ url }));
        console.log(`Tour ${c.dest} images:`, JSON.stringify(tourImages));
        return {
        title: c.title || `${c.dest} City Highlights`,
        description: c.description || `Discover ${c.dest} with curated experiences across iconic sights and neighborhoods.`,
        shortDescription: c.shortDescription || `${c.days || 3}-day ${c.dest} highlights tour.`,
        destination: c.dest,
        country: c.country,
        duration: c.days || 3,
        price: c.price || 800,
        originalPrice: c.originalPrice || Math.round((c.price || 800) * 1.15),
        discount: c.discount || 0,
        images: (c.images || []).slice(0, 2).map(url => ({ url })),
        itinerary: c.itinerary || [
          { day: 1, title: 'Arrival & Orientation', description: `Arrive in ${c.dest} and explore the surroundings.` },
          { day: 2, title: 'Iconic Sights', description: 'Guided tour of the famous landmarks.' }
        ],
        inclusions: c.inclusions || ['Hotel','Breakfast'],
        exclusions: c.exclusions || ['International Flights'],
        highlights: c.highlights || ['Iconic Landmark'],
        difficulty: c.difficulty || 'easy',
        groupSize: c.groupSize || { min: 1, max: 20 },
        cancellationPolicy: c.cancellationPolicy || 'Free cancellation up to 7 days before departure.',
        startDate: new Date(),
        endDate: new Date(Date.now() + ((c.days || 3) - 1) * 24 * 60 * 60 * 1000),
        isFeatured: Boolean(c.featured),
        tags: c.tags || [],
        bookings: { total: 0, available: (c.groupSize?.max || 20) },
        createdBy: admin._id,
      };
      }) : sampleTours(admin._id, indiaOnly);
      
      // Debug: Log first tour's images
      if (tours.length > 0) {
        console.log('Sample tour images structure:', JSON.stringify(tours[0].images));
      }
      
      await TourPackage.insertMany(tours);
      console.log(`Seeded ${tours.length} ${customTemplates ? 'custom' : (indiaOnly ? 'India' : 'sample')} tours.`);
    } else if (existing < 20) {
      // Top up to at least 20 tours if database has fewer
      const base = customTemplates ? customTemplates.map((c) => ({
        title: c.title || `${c.dest} City Highlights`,
        description: c.description || `Discover ${c.dest}.`,
        shortDescription: c.shortDescription || `${c.days || 3}-day ${c.dest} highlights tour.`,
        destination: c.dest,
        country: c.country,
        duration: c.days || 3,
        price: c.price || 800,
        originalPrice: c.originalPrice || Math.round((c.price || 800) * 1.15),
        discount: c.discount || 0,
        images: (c.images || []).slice(0, 2).map(url => ({ url })),
        itinerary: c.itinerary || [
          { day: 1, title: 'Arrival & Orientation', description: `Arrive in ${c.dest}.` }
        ],
        inclusions: c.inclusions || ['Hotel','Breakfast'],
        exclusions: c.exclusions || ['International Flights'],
        highlights: c.highlights || ['Iconic Landmark'],
        difficulty: c.difficulty || 'easy',
        groupSize: c.groupSize || { min: 1, max: 20 },
        cancellationPolicy: c.cancellationPolicy || 'Free cancellation up to 7 days before departure.',
        startDate: new Date(),
        endDate: new Date(Date.now() + ((c.days || 3) - 1) * 24 * 60 * 60 * 1000),
        isFeatured: Boolean(c.featured),
        tags: c.tags || [],
        bookings: { total: 0, available: (c.groupSize?.max || 20) },
        createdBy: admin._id,
      })) : sampleTours(admin._id, indiaOnly);
      const toInsert = base.slice(0, 20 - existing);
      await TourPackage.insertMany(toInsert);
      console.log(`Added ${toInsert.length} additional tours (now at least 20).`);
    } else {
      console.log('Tours already exist. Skipping seeding.');
    }

    // Seed sample reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0 || reset) {
      if (reset) await Review.deleteMany({});
      
      // Get all tours to add reviews
      const tours = await TourPackage.find();
      const testUser = await User.findOne({ email: 'admin@example.com' });
      
      if (tours.length > 0 && testUser) {
        // Create test reviewers
        const reviewer1 = testUser;
        let reviewer2 = await User.findOne({ email: 'reviewer2@example.com' });
        if (!reviewer2) {
          reviewer2 = await User.create({
            name: 'Jane Smith',
            email: 'reviewer2@example.com',
            password: await require('bcryptjs').hash('Password123', 12),
            phone: '+11111111111',
            role: 'user',
            isEmailVerified: true,
          });
        }
        
        let reviewer3 = await User.findOne({ email: 'reviewer3@example.com' });
        if (!reviewer3) {
          reviewer3 = await User.create({
            name: 'John Doe',
            email: 'reviewer3@example.com',
            password: await require('bcryptjs').hash('Password123', 12),
            phone: '+12222222222',
            role: 'user',
            isEmailVerified: true,
          });
        }
        
        const sampleReviews = [];
        
        // Add 2 reviews to each tour (cycling through reviewers)
        for (let i = 0; i < Math.min(tours.length, 25); i++) {
          const reviewersArray = [reviewer1, reviewer2, reviewer3];
          const reviewer = reviewersArray[i % 3];
          
          const titles = [
            'Absolutely Amazing!',
            'Great Experience',
            'Perfect Vacation!',
            'Good Value',
            'Unforgettable Journey!',
            'Incredible Experience!',
            'Highly Satisfied',
            'Beyond Expectations!',
            'Worth Every Penny',
            'Fantastic Tour!'
          ];
          
          const comments = [
            'This tour exceeded all my expectations. The guides were knowledgeable and friendly, the accommodations were excellent, and every moment was memorable. Highly recommended!',
            'Had a wonderful time on this tour. The itinerary was well-planned and the tour operator was very professional. Only minor issue was the weather, but that\'s beyond anyone\'s control.',
            'Everything was perfect! From the moment we were picked up to the final goodbye. The accommodations were beautiful, food was delicious, and the activities were so much fun. Will definitely book again!',
            'Good tour at a reasonable price. The guide was very informative and shared interesting facts about the destinations. Food quality could have been better, but overall a solid experience.',
            'This was the best vacation I\'ve ever had. The scenery was breathtaking, the people were amazing, and the experience will stay with me forever. Thank you for making this possible!',
            'One of the best tours I\'ve ever been on. Every detail was perfectly planned and executed. The tour guide was exceptional and made the experience even more special.',
            'Very satisfied with the tour. Great value for money and excellent service throughout. Would definitely recommend to friends and family.',
            'Absolutely loved every minute! The destinations were stunning, the accommodation was top-notch, and the meals were delicious. Can\'t wait to book another tour!',
            'Amazing tour with wonderful people. The itinerary was well-balanced and we got to see and experience so much. Definitely worth the investment!',
            'Fantastic experience from start to finish. Professional staff, amazing locations, and great food. This tour company really knows how to deliver!'
          ];
          
          const travelTypes = ['couple', 'family', 'solo', 'friends', 'business'];
          const ratings = [5, 4, 5, 4, 5, 4, 5, 4, 5, 4];
          
          sampleReviews.push({
            user: reviewer._id,
            tourPackage: tours[i]._id,
            booking: null,
            rating: ratings[i % ratings.length],
            title: titles[i % titles.length],
            comment: comments[i % comments.length],
            wouldRecommend: true,
            travelDate: new Date(Date.now() - (Math.random() * 60 * 24 * 60 * 60 * 1000)),
            travelerType: travelTypes[i % travelTypes.length],
            status: 'approved',
            isVerified: true
          });
        }
        
        await Review.insertMany(sampleReviews);
        console.log(`Seeded ${sampleReviews.length} sample reviews.`);
      }
    } else {
      console.log('Reviews already exist. Skipping seeding.');
    }
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();


