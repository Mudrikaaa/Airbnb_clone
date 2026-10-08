"""Seed users: 6 hosts (2 superhosts) followed by 4 guests.

Listings reference hosts by `key`, so reordering this list never breaks the seed.
Avatars are Unsplash portraits (free licence), checked by scripts/check_images.py.
"""

AVATAR = "https://images.unsplash.com/{}?auto=format&fit=crop&w=256&h=256&q=80"

USERS = [
    # --- Hosts ---
    {
        "key": "aarav",
        "name": "Aarav Mehta",
        "email": "aarav@example.com",
        "avatar": "photo-1625241152315-4a698f74ceb7",
        "is_superhost": True,
        "joined": "2017-03-14",
        "bio": "Born in Mumbai, raised on Goan fish curry. I restore old Portuguese homes and love "
        "pointing guests to the beach shacks the guidebooks haven't found yet.",
    },
    {
        "key": "priya",
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "avatar": "photo-1615751596346-9df8006e5381",
        "is_superhost": True,
        "joined": "2016-11-02",
        "bio": "Fourth-generation Jaipurwali. My family has looked after havelis across Rajasthan "
        "for decades, and I'm happiest sharing chai on a rooftop at sunset.",
    },
    {
        "key": "kabir",
        "name": "Kabir Singh",
        "email": "kabir@example.com",
        "avatar": "photo-1527980965255-d3b416303d12",
        "is_superhost": False,
        "joined": "2019-06-21",
        "bio": "Trekker, part-time ski instructor and full-time mountain person. I split my year "
        "between Manali, Rishikesh and wherever the snow is good.",
    },
    {
        "key": "ananya",
        "name": "Ananya Iyer",
        "email": "ananya@example.com",
        "avatar": "photo-1623605931891-d5b95ee98459",
        "is_superhost": False,
        "joined": "2018-01-09",
        "bio": "Coffee planter's daughter from Coorg. I host across South India and will happily "
        "share my amma's recipe for kadumbuttu if you ask nicely.",
    },
    {
        "key": "lucas",
        "name": "Lucas Moreau",
        "email": "lucas@example.com",
        "avatar": "photo-1484684096794-03e03b5e713e",
        "is_superhost": False,
        "joined": "2015-08-30",
        "bio": "Parisian architect who caught the travel bug. I look after a handful of homes in "
        "France, Portugal, Italy and Switzerland that I'd want to stay in myself.",
    },
    {
        "key": "sofia",
        "name": "Sofia Tanaka",
        "email": "sofia@example.com",
        "avatar": "photo-1583058905141-deef2de746bb",
        "is_superhost": False,
        "joined": "2020-02-17",
        "bio": "Half Japanese, half Brazilian, always somewhere in between. I manage stays in "
        "Tokyo, Kyoto, Bali, the Andamans and New York.",
    },
    # --- Guests ---
    {
        "key": "rohan",
        "name": "Rohan Gupta",
        "email": "rohan@example.com",
        "avatar": "photo-1555084227-36e282495e1c",
        "is_superhost": False,
        "joined": "2021-04-05",
        "bio": "Software engineer in Bengaluru. Weekends are for road trips with my dog Biscuit.",
    },
    {
        "key": "meera",
        "name": "Meera Nair",
        "email": "meera@example.com",
        "avatar": "photo-1752330161425-ffd3ccc05f84",
        "is_superhost": False,
        "joined": "2022-09-12",
        "bio": "Food writer from Kochi, always chasing the next great breakfast.",
    },
    {
        "key": "daniel",
        "name": "Daniel Brooks",
        "email": "daniel@example.com",
        "avatar": "photo-1779281128550-8cc634361a17",
        "is_superhost": False,
        "joined": "2019-12-01",
        "bio": "Photographer from Seattle, slowly working through a list of the world's best sunrises.",
    },
    {
        "key": "arjun",
        "name": "Arjun Rao",
        "email": "arjun@example.com",
        "avatar": "photo-1622012070740-4f753ebb9bad",
        "is_superhost": False,
        "joined": "2023-05-20",
        "bio": "Med student who travels on a budget and reviews honestly.",
    },
]
