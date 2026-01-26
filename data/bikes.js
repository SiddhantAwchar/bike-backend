const bikes = [
    {
        id: 1,
        name: "Yamaha R15",
        price: 95000,
        year: 2021,
        type: "sports",
        status: "available",
        images: [
            "r15.jpg",
            "apache.jpg",
            "pulsar.jpg"
        ],
        description: "Single owner, well maintained, excellent condition"
    },
    {
        id: 2,
        name: "Royal Enfield Classic 350",
        price: 125000,
        year: 2020,
        type: "cruiser",
        status: "sold",
        images: [
            "royal-enfield.jpg",
            "apache.jpg",
            "pulsar.jpg"
        ],
        description: "Powerful cruiser, premium feel"
    },
    {
        id: 3,
        name: "Honda Activa",
        price: 48000,
        year: 2023,
        type: "scooter",
        status: "available",
        images: [
            "activa.jpg",
            "activa.jpg",
            "activa.jpg"
        ],
        description: "Almost new scooter, smooth ride"
    }
];

module.exports = bikes;
