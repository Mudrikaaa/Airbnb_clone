"""48 seed listings. Coordinates are real neighbourhood-level locations; prices are INR per night.

`host` matches a user `key` in users.py. `amenities` names must exist in amenities.py.
Images are assigned in seed.py from photos.json based on `category`.
"""

# Almost every Airbnb has these; listed once to keep the entries readable.
ESSENTIALS = ["Wifi", "Smoke alarm", "First aid kit"]

LISTINGS = [
    # ------------------------------------------------------------------ Goa & Mumbai (Aarav)
    {
        "host": "aarav",
        "title": "Sea-breeze Portuguese villa with private pool",
        "property_type": "villa", "category": "pools",
        "city": "Anjuna", "state": "Goa", "country": "India",
        "address": "Mazal Vaddo, Anjuna, Goa 403509",
        "lat": 15.5733, "lng": 73.7407,
        "price": 14500, "cleaning": 2500, "guests": 8, "bedrooms": 4, "beds": 5, "baths": 4,
        "amenities": ESSENTIALS + ["Kitchen", "Pool", "Air conditioning", "Free parking on premises",
                                   "Garden", "Washing machine", "Coffee maker", "TV"],
        "description": "A 120-year-old Indo-Portuguese home with oxblood walls, a deep balcão and a "
        "pool hidden behind frangipani trees. Four airy bedrooms open onto a shared verandah where "
        "breakfast tends to stretch until noon.\n\nAnjuna flea market is a ten-minute walk; the beach, "
        "about fifteen. Our caretaker Savio lives next door and can arrange a cook, a scooter or a "
        "boat to Chapora on request.",
    },
    {
        "host": "aarav",
        "title": "Beach hut steps from Palolem Bay",
        "property_type": "cottage", "category": "beach",
        "city": "Palolem", "state": "Goa", "country": "India",
        "address": "Palolem Beach Road, Canacona, Goa 403702",
        "lat": 15.0100, "lng": 74.0232,
        "price": 4200, "cleaning": 800, "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1,
        "amenities": ESSENTIALS + ["Beach access", "Air conditioning", "Self check-in"],
        "description": "Fall asleep to the sound of waves. This raised wooden hut sits right at the "
        "quiet southern end of Palolem, with a hammock on the porch and the sea about forty steps away.\n\n"
        "It's simple — a comfortable double bed, a clean ensuite with hot water, and AC for the "
        "afternoons — but you won't spend much time inside. Kayaks to Butterfly Beach leave from right "
        "in front.",
    },
    {
        "host": "aarav",
        "title": "Whitewashed artist's studio in Assagao",
        "property_type": "cottage", "category": "tropical",
        "city": "Assagao", "state": "Goa", "country": "India",
        "address": "Saunta Vaddo, Assagao, Goa 403507",
        "lat": 15.5985, "lng": 73.7690,
        "price": 6800, "cleaning": 1200, "guests": 3, "bedrooms": 1, "beds": 2, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Garden", "Dedicated workspace", "Coffee maker",
                                   "Free parking on premises", "Pets allowed"],
        "description": "My painter friend built this studio among cashew trees, and the north-facing "
        "light is still the best thing about it. Polished red-oxide floors, a long work table, linen "
        "everywhere and a little kitchen for slow mornings.\n\nAssagao is Goa's quiet, leafy side — "
        "great cafés, no traffic. You'll want a scooter; Vagator beach is a 12-minute ride.",
    },
    {
        "host": "aarav",
        "title": "Sunset-view apartment near Candolim beach",
        "property_type": "apartment", "category": "beach",
        "city": "Candolim", "state": "Goa", "country": "India",
        "address": "Murrod Vaddo, Candolim, Goa 403515",
        "lat": 15.5180, "lng": 73.7623,
        "price": 5500, "cleaning": 1000, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Pool", "Air conditioning", "TV", "Washing machine",
                                   "Beach access", "Self check-in"],
        "description": "Top-floor two-bedroom in a small gated complex with a shared pool. The west-"
        "facing balcony catches every sunset over the Arabian Sea.\n\nIdeal for families or two "
        "couples: both bedrooms have their own bathrooms, and the kitchen is properly stocked. "
        "Candolim beach is a five-minute walk past the bakery that sells the best poee in town.",
    },
    {
        "host": "aarav",
        "title": "Sea-facing loft on Bandstand",
        "property_type": "loft", "category": "city",
        "city": "Mumbai", "state": "Maharashtra", "country": "India",
        "address": "Bandstand Promenade, Bandra West, Mumbai 400050",
        "lat": 19.0544, "lng": 72.8206,
        "price": 9800, "cleaning": 1500, "guests": 3, "bedrooms": 1, "beds": 2, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Dedicated workspace", "TV",
                                   "Washing machine", "Coffee maker", "Self check-in"],
        "description": "A double-height loft with floor-to-ceiling windows looking straight at the "
        "sea. Watch the monsoon roll in from the sofa, or join the evening walkers on the promenade "
        "below.\n\nBandra's best food is on your doorstep — from Irani cafés to cocktail bars on "
        "Chapel Road. Fast fibre internet and a proper desk make it a solid work base too.",
    },
    {
        "host": "aarav",
        "title": "Art deco flat in Colaba",
        "property_type": "apartment", "category": "city",
        "city": "Mumbai", "state": "Maharashtra", "country": "India",
        "address": "Wodehouse Road, Colaba, Mumbai 400005",
        "lat": 18.9067, "lng": 72.8147,
        "price": 7200, "cleaning": 1200, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "TV", "Washing machine", "Heating"],
        "description": "High ceilings, teak doors and the original 1930s terrazzo floors — this "
        "second-floor flat is a slice of old Bombay. It's been gently updated with good mattresses, "
        "strong AC and a modern kitchen.\n\nThe Gateway of India, Kala Ghoda's galleries and Leopold "
        "Café are all walkable. Expect a bit of street noise in the mornings; earplugs are provided.",
    },
    {
        "host": "aarav",
        "title": "Mango-orchard villa in Alibaug",
        "property_type": "villa", "category": "pools",
        "city": "Alibaug", "state": "Maharashtra", "country": "India",
        "address": "Awas Village, Alibaug, Maharashtra 402201",
        "lat": 18.6414, "lng": 72.8722,
        "price": 18000, "cleaning": 3000, "guests": 10, "bedrooms": 5, "beds": 6, "baths": 5,
        "amenities": ESSENTIALS + ["Kitchen", "Pool", "Air conditioning", "Garden", "Free parking on premises",
                                   "TV", "Breakfast", "Pets allowed", "Washing machine"],
        "description": "Two acres of Alphonso mango trees, a 15-metre pool and five bedrooms built "
        "around a central courtyard. It's our family's weekend escape from Mumbai and it shows — "
        "board games, a hammock in every corner and a cook who makes a legendary prawn koliwada.\n\n"
        "Take the ferry from the Gateway; we'll pick you up from Mandwa jetty. Awas beach is a "
        "five-minute cycle away.",
    },
    # ------------------------------------------------------------------ Rajasthan (Priya)
    {
        "host": "priya",
        "title": "Pink City haveli suite near Hawa Mahal",
        "property_type": "guesthouse", "category": "heritage",
        "city": "Jaipur", "state": "Rajasthan", "country": "India",
        "address": "Tripolia Bazaar, Old City, Jaipur 302002",
        "lat": 26.9239, "lng": 75.8267,
        "price": 6500, "cleaning": 900, "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1,
        "amenities": ESSENTIALS + ["Air conditioning", "Breakfast", "TV", "Heating"],
        "description": "A private suite on the first floor of our 200-year-old family haveli, with "
        "hand-painted walls, a carved jharokha window seat and a four-poster bed.\n\nBreakfast is "
        "served in the courtyard each morning — try the pyaaz kachori. Hawa Mahal is a four-minute "
        "walk through the bazaar, and the rooftop has one of the best views of the old city at dusk.",
    },
    {
        "host": "priya",
        "title": "Courtyard haveli with rooftop dining",
        "property_type": "house", "category": "heritage",
        "city": "Jaipur", "state": "Rajasthan", "country": "India",
        "address": "Chandpol Bazaar, Old City, Jaipur 302001",
        "lat": 26.9196, "lng": 75.8235,
        "price": 11000, "cleaning": 1800, "guests": 6, "bedrooms": 3, "beds": 4, "baths": 3,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Breakfast", "Free parking on premises",
                                   "TV", "Washing machine"],
        "description": "Have the whole haveli to yourselves: three bedrooms arranged around a "
        "sunlit courtyard with a tulsi plant at its heart, and a rooftop where we set up dinner under "
        "the stars.\n\nOur housekeeper Kamla-ji cooks a superb dal baati churma — ask a day ahead. "
        "City Palace and Jantar Mantar are about 15 minutes on foot.",
    },
    {
        "host": "priya",
        "title": "Lake Pichola view room in an old haveli",
        "property_type": "guesthouse", "category": "lakefront",
        "city": "Udaipur", "state": "Rajasthan", "country": "India",
        "address": "Gangaur Ghat Marg, Udaipur 313001",
        "lat": 24.5764, "lng": 73.6835,
        "price": 7800, "cleaning": 1000, "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1,
        "amenities": ESSENTIALS + ["Air conditioning", "Lake access", "Breakfast", "Coffee maker"],
        "description": "Wake up to boats drifting past the City Palace. This room sits right on "
        "Gangaur Ghat, with a window seat over the water and a shared terrace for sunset.\n\n"
        "It's a heritage building, so the stairs are steep and the doors are low — part of the "
        "charm. Bagore ki Haveli's evening dance show is next door.",
    },
    {
        "host": "priya",
        "title": "Lakeside villa with private jharokha",
        "property_type": "villa", "category": "lakefront",
        "city": "Udaipur", "state": "Rajasthan", "country": "India",
        "address": "Fateh Sagar Lake Road, Udaipur 313004",
        "lat": 24.6012, "lng": 73.6726,
        "price": 16500, "cleaning": 2500, "guests": 8, "bedrooms": 4, "beds": 5, "baths": 4,
        "amenities": ESSENTIALS + ["Kitchen", "Pool", "Air conditioning", "Lake access", "Garden",
                                   "Free parking on premises", "TV", "Breakfast"],
        "description": "A white marble villa on the quieter shore of Fateh Sagar, with Aravalli hills "
        "on one side and the lake on the other. The upstairs jharokha is where you'll spend your "
        "evenings.\n\nFour ensuite bedrooms, a plunge pool and a lawn big enough for a family "
        "cricket match. Our driver can take you to Sajjangarh for sunset.",
    },
    {
        "host": "priya",
        "title": "Desert cottage near the Sam sand dunes",
        "property_type": "cottage", "category": "desert",
        "city": "Jaisalmer", "state": "Rajasthan", "country": "India",
        "address": "Sam Road, Jaisalmer 345001",
        "lat": 26.8303, "lng": 70.5145,
        "price": 5200, "cleaning": 700, "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1,
        "amenities": ESSENTIALS + ["Air conditioning", "Breakfast", "Free parking on premises"],
        "description": "A mud-plastered cottage at the edge of the Thar, where the dunes start almost "
        "at the door. Nights are silent apart from the occasional camel bell, and the stars are "
        "extraordinary.\n\nWe can arrange a sunrise camel ride and a folk music evening around the "
        "fire. Pack a jacket from November to February — desert nights get cold.",
    },
    {
        "host": "priya",
        "title": "Golden sandstone house inside the fort",
        "property_type": "house", "category": "heritage",
        "city": "Jaisalmer", "state": "Rajasthan", "country": "India",
        "address": "Jaisalmer Fort, Jaisalmer 345001",
        "lat": 26.9124, "lng": 70.9126,
        "price": 8400, "cleaning": 1200, "guests": 4, "bedrooms": 2, "beds": 3, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Breakfast", "Heating"],
        "description": "One of the few homes still lived in inside Sonar Qila, the 'golden fort'. "
        "Carved sandstone walls, cool stone floors and a terrace looking out across the whole city.\n\n"
        "Cars can't enter the fort, so we'll meet you at the gate and help with bags. Jain temples "
        "and the palace museum are a few lanes away.",
    },
    {
        "host": "priya",
        "title": "Blue City rooftop home under Mehrangarh",
        "property_type": "house", "category": "heritage",
        "city": "Jodhpur", "state": "Rajasthan", "country": "India",
        "address": "Navchokiya, Brahmpuri, Jodhpur 342001",
        "lat": 26.2978, "lng": 73.0185,
        "price": 5900, "cleaning": 900, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "TV"],
        "description": "Indigo walls, a rooftop that stares straight up at Mehrangarh Fort and the "
        "call of peacocks in the morning. This little house sits deep in the blue lanes of "
        "Brahmpuri.\n\nTwo double rooms, a simple kitchen and a rooftop charpoy for afternoon naps. "
        "The clock tower market and the stepwell at Toorji are 15 minutes on foot.",
    },
    {
        "host": "priya",
        "title": "Desert farmhouse with camel trails",
        "property_type": "farmhouse", "category": "desert",
        "city": "Pushkar", "state": "Rajasthan", "country": "India",
        "address": "Ganahera Road, Pushkar 305022",
        "lat": 26.4897, "lng": 74.5511,
        "price": 6200, "cleaning": 1000, "guests": 6, "bedrooms": 3, "beds": 4, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Garden", "Free parking on premises", "Breakfast",
                                   "Pets allowed"],
        "description": "A working rose farm on the edge of Pushkar, with three simple rooms, a "
        "shaded verandah and fields that turn pink in winter. Our camels, Raja and Moti, are very "
        "photogenic.\n\nIt's a 10-minute drive to the holy lake and the ghats. Come in November for "
        "the camel fair — but book early.",
    },
    # ------------------------------------------------------------------ Himalayas (Kabir)
    {
        "host": "kabir",
        "title": "Pine-wood cabin in Old Manali",
        "property_type": "cabin", "category": "cabins",
        "city": "Manali", "state": "Himachal Pradesh", "country": "India",
        "address": "Old Manali Road, Manali 175131",
        "lat": 32.2490, "lng": 77.1820,
        "price": 5600, "cleaning": 900, "guests": 4, "bedrooms": 2, "beds": 3, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Heating", "Mountain view", "Indoor fireplace",
                                   "Coffee maker", "Pets allowed"],
        "description": "A deodar-and-pine cabin above the apple orchards of Old Manali, with a "
        "wood stove, thick quilts and a balcony facing the snow peaks.\n\nThe cafés of Old Manali "
        "are a 10-minute walk downhill (and a slightly longer walk back up). Great base for the "
        "Hampta Pass or Bhrigu Lake treks — I'm happy to help plan.",
    },
    {
        "host": "kabir",
        "title": "Snow-view chalet near Solang Valley",
        "property_type": "cabin", "category": "mountains",
        "city": "Manali", "state": "Himachal Pradesh", "country": "India",
        "address": "Palchan, Solang Valley Road, Manali 175131",
        "lat": 32.3166, "lng": 77.1570,
        "price": 8900, "cleaning": 1500, "guests": 6, "bedrooms": 3, "beds": 4, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Heating", "Mountain view", "Indoor fireplace", "Hot tub",
                                   "Free parking on premises", "TV"],
        "description": "Ski in the morning, hot tub under the stars at night. This three-bedroom "
        "chalet is ten minutes from the Solang ropeway, with a wide deck looking straight at "
        "the Pir Panjal range.\n\nIn winter we'll help with ski hire and lessons; in summer, it's "
        "paragliding and river walks. Roads can close after heavy snowfall — we'll keep you updated.",
    },
    {
        "host": "kabir",
        "title": "Riverside cottage in Parvati Valley",
        "property_type": "cottage", "category": "mountains",
        "city": "Kasol", "state": "Himachal Pradesh", "country": "India",
        "address": "Chhalal Village, Kasol 175105",
        "lat": 32.0100, "lng": 77.3150,
        "price": 3800, "cleaning": 600, "guests": 3, "bedrooms": 1, "beds": 2, "baths": 1,
        "amenities": ESSENTIALS + ["Heating", "Mountain view", "Garden", "Coffee maker"],
        "description": "Cross the footbridge from Kasol and follow the river for five minutes — "
        "this stone cottage sits right above the rushing Parvati. The sound of the water is "
        "constant and wonderful.\n\nSimple, warm and clean. Kheerganga and Tosh are easy day trips, "
        "and the Israeli bakery in Kasol does excellent shakshuka.",
    },
    {
        "host": "kabir",
        "title": "Ganga-view studio in Tapovan",
        "property_type": "apartment", "category": "mountains",
        "city": "Rishikesh", "state": "Uttarakhand", "country": "India",
        "address": "Tapovan, Laxman Jhula Road, Rishikesh 249192",
        "lat": 30.1290, "lng": 78.3230,
        "price": 3500, "cleaning": 500, "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Mountain view", "Dedicated workspace"],
        "description": "A bright studio with a balcony over the Ganga and the forested hills beyond. "
        "Morning yoga on the balcony is basically mandatory.\n\nWalk to Laxman Jhula, the Beatles "
        "Ashram and a dozen yoga schools. The rafting put-in is a short drive upstream.",
    },
    {
        "host": "kabir",
        "title": "Yoga retreat cottage with garden",
        "property_type": "cottage", "category": "countryside",
        "city": "Rishikesh", "state": "Uttarakhand", "country": "India",
        "address": "Shivpuri Road, Rishikesh 249192",
        "lat": 30.1080, "lng": 78.2960,
        "price": 4600, "cleaning": 700, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Garden", "Breakfast", "Free parking on premises"],
        "description": "Two cottages share a big organic garden and a covered yoga deck — you'll "
        "have one of them to yourselves. Mornings start with birdsong and fresh chai.\n\nOur "
        "neighbour runs drop-in Hatha classes at 7am. Town is a 15-minute drive, so this is for "
        "people who actually want peace and quiet.",
    },
    {
        "host": "kabir",
        "title": "Colonial cottage on Camel's Back Road",
        "property_type": "cottage", "category": "mountains",
        "city": "Mussoorie", "state": "Uttarakhand", "country": "India",
        "address": "Camel's Back Road, Mussoorie 248179",
        "lat": 30.4598, "lng": 78.0751,
        "price": 7400, "cleaning": 1200, "guests": 5, "bedrooms": 2, "beds": 3, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Heating", "Indoor fireplace", "Mountain view", "TV",
                                   "Garden"],
        "description": "A 1920s stone cottage with a tin roof, bay windows and a fireplace that "
        "actually gets used. On a clear day you can see the snowline of the Bandarpunch range.\n\n"
        "Camel's Back Road is car-free and perfect for evening walks; Mall Road is ten minutes away. "
        "Fog rolls in most afternoons in the monsoon — bring a book.",
    },
    {
        "host": "kabir",
        "title": "Cabin in the deodars above McLeod Ganj",
        "property_type": "cabin", "category": "cabins",
        "city": "Dharamshala", "state": "Himachal Pradesh", "country": "India",
        "address": "Dharamkot, McLeod Ganj, Dharamshala 176219",
        "lat": 32.2426, "lng": 76.3213,
        "price": 4900, "cleaning": 800, "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1,
        "amenities": ESSENTIALS + ["Heating", "Mountain view", "Coffee maker", "Dedicated workspace"],
        "description": "A tiny timber cabin up in Dharamkot, surrounded by deodar forest with the "
        "Dhauladhar peaks above. It has one cosy room, a writing desk by the window and a porch "
        "made for reading.\n\nThe Triund trek starts a short walk away. McLeod Ganj and the Dalai "
        "Lama temple are 20 minutes downhill.",
    },
    {
        "host": "kabir",
        "title": "Ladakhi mud-brick home with Stok views",
        "property_type": "house", "category": "mountains",
        "city": "Leh", "state": "Ladakh", "country": "India",
        "address": "Changspa Road, Leh 194101",
        "lat": 34.1526, "lng": 77.5771,
        "price": 6100, "cleaning": 900, "guests": 4, "bedrooms": 2, "beds": 3, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Heating", "Mountain view", "Garden", "Breakfast"],
        "description": "A traditional Ladakhi home of sun-dried mud brick and poplar beams, with a "
        "barley field out front and Stok Kangri filling the view.\n\nPlease rest your first day — "
        "Leh is at 3,500 m. Shanti Stupa is a short walk, and we can arrange permits and drivers "
        "for Nubra and Pangong.",
    },
    # ------------------------------------------------------------------ South India (Ananya)
    {
        "host": "ananya",
        "title": "Coffee estate bungalow in Madikeri",
        "property_type": "house", "category": "countryside",
        "city": "Madikeri", "state": "Karnataka", "country": "India",
        "address": "Galibeedu Road, Madikeri, Kodagu 571201",
        "lat": 12.4244, "lng": 75.7382,
        "price": 9200, "cleaning": 1500, "guests": 8, "bedrooms": 4, "beds": 5, "baths": 3,
        "amenities": ESSENTIALS + ["Kitchen", "Garden", "Breakfast", "Free parking on premises",
                                   "Indoor fireplace", "Coffee maker", "Pets allowed"],
        "description": "My grandfather's planter's bungalow, set in 30 acres of coffee and pepper. "
        "Red-tiled roof, a long verandah and a dining table that seats twelve.\n\nJoin a plantation "
        "walk, watch the beans being sun-dried, and taste coffee you can't buy in shops. Abbey Falls "
        "is a 20-minute drive.",
    },
    {
        "host": "ananya",
        "title": "Rainforest cabin with plantation walks",
        "property_type": "cabin", "category": "cabins",
        "city": "Virajpet", "state": "Karnataka", "country": "India",
        "address": "Siddapur Road, Virajpet, Kodagu 571218",
        "lat": 12.3375, "lng": 75.8069,
        "price": 5400, "cleaning": 900, "guests": 3, "bedrooms": 1, "beds": 2, "baths": 1,
        "amenities": ESSENTIALS + ["Garden", "Breakfast", "Coffee maker", "Free parking on premises"],
        "description": "A wooden cabin on stilts at the edge of the forest, with a glass wall "
        "facing the canopy. You'll hear Malabar whistling thrushes before you see them.\n\n"
        "Breakfast is brought over from the main house — akki roti and fresh-ground coffee. The "
        "Dubare elephant camp is a short drive away.",
    },
    {
        "host": "ananya",
        "title": "Tea-garden cottage with misty mornings",
        "property_type": "cottage", "category": "mountains",
        "city": "Munnar", "state": "Kerala", "country": "India",
        "address": "Chithirapuram, Munnar, Idukki 685565",
        "lat": 10.0889, "lng": 77.0595,
        "price": 5800, "cleaning": 900, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Heating", "Mountain view", "Garden", "Breakfast"],
        "description": "Rolling tea bushes in every direction and clouds that drift right through "
        "the garden. This cottage sits in a working estate, a short drive from Munnar town.\n\n"
        "Ask for a tour of the tea factory, then hike up to Lockhart Gap. The cottage is heated — "
        "mornings can be a crisp 10°C.",
    },
    {
        "host": "ananya",
        "title": "Backwater villa with private jetty",
        "property_type": "villa", "category": "lakefront",
        "city": "Alappuzha", "state": "Kerala", "country": "India",
        "address": "Kainakary, Alappuzha 688501",
        "lat": 9.4981, "lng": 76.3388,
        "price": 10500, "cleaning": 1800, "guests": 6, "bedrooms": 3, "beds": 3, "baths": 3,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Lake access", "Breakfast", "Garden",
                                   "TV"],
        "description": "A Kerala-style villa on a quiet canal, with a private jetty and a canoe for "
        "exploring the backwaters at dawn. Coconut palms, paddy fields and kingfishers everywhere.\n\n"
        "Our cook makes karimeen pollichathu with fish from the lake. We can book a day on a "
        "kettuvallam houseboat, which picks you up right from the jetty.",
    },
    {
        "host": "ananya",
        "title": "Clifftop cottage above Varkala beach",
        "property_type": "cottage", "category": "beach",
        "city": "Varkala", "state": "Kerala", "country": "India",
        "address": "North Cliff, Varkala 695141",
        "lat": 8.7379, "lng": 76.7163,
        "price": 4800, "cleaning": 700, "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1,
        "amenities": ESSENTIALS + ["Air conditioning", "Beach access", "Coffee maker", "Self check-in"],
        "description": "Perched on the red laterite cliffs, with the whole Arabian Sea in front of "
        "you. The little terrace is the best seat in Varkala for sunset.\n\nSteps lead down to the "
        "beach; the clifftop cafés are right outside. Ayurvedic massage places are everywhere — I "
        "can recommend a good one.",
    },
    {
        "host": "ananya",
        "title": "French Quarter heritage home",
        "property_type": "house", "category": "heritage",
        "city": "Puducherry", "state": "Puducherry", "country": "India",
        "address": "Rue Romain Rolland, White Town, Puducherry 605001",
        "lat": 11.9340, "lng": 79.8340,
        "price": 8600, "cleaning": 1200, "guests": 6, "bedrooms": 3, "beds": 3, "baths": 3,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Garden", "Breakfast", "TV",
                                   "Washing machine"],
        "description": "A mustard-yellow colonial house with green shutters, a bougainvillea-draped "
        "courtyard and tall rooms that stay cool even in May.\n\nThe Promenade is two blocks away "
        "and the best croissants in town are around the corner. Rent bicycles and visit Auroville "
        "for the day.",
    },
    {
        "host": "ananya",
        "title": "Nilgiri hill cottage with fireplace",
        "property_type": "cottage", "category": "mountains",
        "city": "Ooty", "state": "Tamil Nadu", "country": "India",
        "address": "Fern Hill, Ooty 643004",
        "lat": 11.4102, "lng": 76.6950,
        "price": 6300, "cleaning": 1000, "guests": 4, "bedrooms": 2, "beds": 3, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Heating", "Indoor fireplace", "Garden", "Mountain view",
                                   "Free parking on premises"],
        "description": "An English-style cottage among eucalyptus and pine, with a rose garden, "
        "a fireplace and a kettle that's never cold.\n\nRide the toy train to Coonoor, walk around "
        "the lake, or just sit on the porch with homemade chocolate. Nights get properly chilly.",
    },
    {
        "host": "ananya",
        "title": "Indiranagar loft for remote work",
        "property_type": "loft", "category": "city",
        "city": "Bengaluru", "state": "Karnataka", "country": "India",
        "address": "12th Main Road, Indiranagar, Bengaluru 560038",
        "lat": 12.9784, "lng": 77.6408,
        "price": 4500, "cleaning": 700, "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Dedicated workspace", "Coffee maker",
                                   "Washing machine", "Self check-in", "Gym", "TV"],
        "description": "Built for long stays: a standing desk, 300 Mbps fibre, an espresso machine "
        "and a building gym. The mezzanine bedroom keeps work and sleep separate.\n\nIndiranagar's "
        "breweries and restaurants are a short walk, and the metro is five minutes away. Weekly and "
        "monthly discounts available.",
    },
    {
        "host": "ananya",
        "title": "Hillside hut above Om Beach",
        "property_type": "cottage", "category": "beach",
        "city": "Gokarna", "state": "Karnataka", "country": "India",
        "address": "Om Beach Road, Gokarna 581326",
        "lat": 14.5199, "lng": 74.3245,
        "price": 3200, "cleaning": 500, "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1,
        "amenities": ESSENTIALS + ["Beach access", "Breakfast"],
        "description": "A laterite-and-thatch hut on the hill above Om Beach, with a hammock, a "
        "sea view and nothing much else to do. That's the point.\n\nWalk the coastal trail to Half "
        "Moon and Paradise beaches. Power cuts happen occasionally — there's an inverter for fans "
        "and lights.",
    },
    # ------------------------------------------------------------------ Asia & NYC (Sofia)
    {
        "host": "sofia",
        "title": "Jungle villa near Radhanagar Beach",
        "property_type": "villa", "category": "tropical",
        "city": "Havelock Island", "state": "Andaman and Nicobar Islands", "country": "India",
        "address": "Radhanagar Road, Swaraj Dweep 744211",
        "lat": 11.9840, "lng": 92.9520,
        "price": 12500, "cleaning": 2000, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 2,
        "amenities": ESSENTIALS + ["Air conditioning", "Beach access", "Garden", "Breakfast",
                                   "Coffee maker"],
        "description": "A thatched villa tucked into the rainforest, a 7-minute walk from what "
        "many call Asia's best beach. Outdoor rain shower, a big daybed on the deck and giant "
        "trees all around.\n\nWe arrange scuba with a PADI centre nearby and the ferry transfer "
        "from Port Blair. Mobile signal is patchy — enjoy it.",
    },
    {
        "host": "sofia",
        "title": "Rice-terrace villa with infinity pool",
        "property_type": "villa", "category": "pools",
        "city": "Ubud", "state": "Bali", "country": "Indonesia",
        "address": "Jalan Raya Tegallalang, Ubud, Bali 80561",
        "lat": -8.5069, "lng": 115.2625,
        "price": 21000, "cleaning": 3000, "guests": 6, "bedrooms": 3, "beds": 3, "baths": 3,
        "amenities": ESSENTIALS + ["Kitchen", "Pool", "Air conditioning", "Breakfast", "Garden",
                                   "Free parking on premises", "TV"],
        "description": "An infinity pool that seems to pour straight into the Tegallalang rice "
        "terraces. Three open-air pavilions, each with its own bathroom and a canopy bed.\n\n"
        "Floating breakfast in the pool is included every morning. Our driver Made can take you "
        "to Tirta Empul, the monkey forest and the best babi guling in Ubud.",
    },
    {
        "host": "sofia",
        "title": "Bamboo jungle house in Canggu",
        "property_type": "house", "category": "tropical",
        "city": "Canggu", "state": "Bali", "country": "Indonesia",
        "address": "Jalan Pantai Berawa, Canggu, Bali 80361",
        "lat": -8.6478, "lng": 115.1385,
        "price": 13500, "cleaning": 2000, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Pool", "Air conditioning", "Dedicated workspace",
                                   "Coffee maker", "Self check-in"],
        "description": "Sculpted entirely from bamboo by a local architect, this two-bedroom house "
        "curves around a plunge pool and a jungle garden. It feels like a treehouse, with proper "
        "AC.\n\nBerawa beach and the surf breaks are a 5-minute scooter ride. Canggu's cafés and "
        "co-working spaces are all nearby.",
    },
    {
        "host": "sofia",
        "title": "Clifftop surf villa in Uluwatu",
        "property_type": "villa", "category": "beach",
        "city": "Uluwatu", "state": "Bali", "country": "Indonesia",
        "address": "Jalan Labuansait, Pecatu, Bali 80361",
        "lat": -8.8291, "lng": 115.0849,
        "price": 17500, "cleaning": 2500, "guests": 6, "bedrooms": 3, "beds": 3, "baths": 3,
        "amenities": ESSENTIALS + ["Kitchen", "Pool", "Air conditioning", "Beach access", "TV",
                                   "Washing machine", "Gym"],
        "description": "Perched above Padang Padang with a view of the Indian Ocean from every "
        "room. Surfers will find board racks and an outdoor shower; everyone else will find the "
        "sunset bar.\n\nBingin, Padang and Uluwatu breaks are all within ten minutes. The Kecak "
        "fire dance at Uluwatu Temple is unmissable.",
    },
    {
        "host": "sofia",
        "title": "Compact designer apartment in Shibuya",
        "property_type": "apartment", "category": "city",
        "city": "Tokyo", "state": "Tokyo", "country": "Japan",
        "address": "Jingumae, Shibuya City, Tokyo 150-0001",
        "lat": 35.6595, "lng": 139.7005,
        "price": 11000, "cleaning": 1800, "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Heating", "Washing machine",
                                   "Self check-in", "Dedicated workspace"],
        "description": "Small but cleverly designed: hinoki wood, a fold-down desk, a deep "
        "soaking tub and blackout blinds for jet lag. Sleeps two comfortably.\n\nShibuya Crossing "
        "is an 8-minute walk; Harajuku and Omotesando even closer. A pocket Wi-Fi is included for "
        "exploring the city.",
    },
    {
        "host": "sofia",
        "title": "Traditional machiya townhouse in Gion",
        "property_type": "house", "category": "heritage",
        "city": "Kyoto", "state": "Kyoto", "country": "Japan",
        "address": "Gionmachi Minamigawa, Higashiyama Ward, Kyoto 605-0074",
        "lat": 35.0037, "lng": 135.7788,
        "price": 19500, "cleaning": 2500, "guests": 4, "bedrooms": 2, "beds": 4, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Heating", "Garden", "Self check-in"],
        "description": "A 100-year-old wooden machiya with tatami rooms, sliding shoji screens, a "
        "tiny moss garden and a cedar bathtub. You'll sleep on thick futons, Japanese style.\n\n"
        "Step out into the lantern-lit lanes of Gion; Yasaka Shrine and Kiyomizu-dera are walking "
        "distance. Please note the stairs are steep, as in all machiya.",
    },
    {
        "host": "sofia",
        "title": "Sunlit brownstone floor in Brooklyn",
        "property_type": "apartment", "category": "city",
        "city": "New York", "state": "New York", "country": "United States",
        "address": "Hancock Street, Bedford-Stuyvesant, Brooklyn, NY 11216",
        "lat": 40.6872, "lng": -73.9418,
        "price": 22000, "cleaning": 3500, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Heating", "Washing machine", "TV",
                                   "Coffee maker", "Pets allowed"],
        "description": "The whole parlour floor of an 1890s brownstone: 12-foot ceilings, original "
        "plaster mouldings, a marble fireplace (decorative) and huge windows over a tree-lined "
        "street.\n\nThe A/C train gets you to Manhattan in 20 minutes. Bed-Stuy's coffee shops, "
        "bakeries and bars are all within a few blocks.",
    },
    {
        "host": "sofia",
        "title": "SoHo loft with exposed brick",
        "property_type": "loft", "category": "city",
        "city": "New York", "state": "New York", "country": "United States",
        "address": "Greene Street, SoHo, New York, NY 10012",
        "lat": 40.7233, "lng": -74.0030,
        "price": 32000, "cleaning": 4000, "guests": 3, "bedrooms": 1, "beds": 2, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Heating", "Dedicated workspace", "TV",
                                   "Washing machine", "Gym"],
        "description": "A classic cast-iron loft: exposed brick, timber beams, a chef's kitchen "
        "and a living room big enough to host a dinner party.\n\nYou're in the middle of SoHo's "
        "galleries and boutiques, with Washington Square Park, the West Village and Chinatown all "
        "within a 15-minute walk.",
    },
    # ------------------------------------------------------------------ Europe (Lucas)
    {
        "host": "lucas",
        "title": "Haussmann apartment in Le Marais",
        "property_type": "apartment", "category": "city",
        "city": "Paris", "state": "Île-de-France", "country": "France",
        "address": "Rue de Turenne, 3rd arrondissement, 75003 Paris",
        "lat": 48.8575, "lng": 2.3580,
        "price": 24000, "cleaning": 3000, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Heating", "Washing machine", "Coffee maker", "TV",
                                   "Dedicated workspace"],
        "description": "Herringbone parquet, marble fireplaces and tall French windows opening "
        "onto a wrought-iron balcony. It's on the 4th floor — with a tiny lift that fits one person "
        "and a suitcase.\n\nPlace des Vosges, the Picasso Museum and the falafel queue on Rue des "
        "Rosiers are all minutes away.",
    },
    {
        "host": "lucas",
        "title": "Artist's attic in Montmartre",
        "property_type": "loft", "category": "city",
        "city": "Paris", "state": "Île-de-France", "country": "France",
        "address": "Rue Lepic, 18th arrondissement, 75018 Paris",
        "lat": 48.8867, "lng": 2.3431,
        "price": 15500, "cleaning": 2000, "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1,
        "amenities": ESSENTIALS + ["Kitchen", "Heating", "Coffee maker", "Self check-in"],
        "description": "Sloped ceilings, a skylight above the bed and a view across the rooftops "
        "to the Eiffel Tower. Six flights up, no lift — your reward is that view.\n\nThe Sacré-Cœur "
        "is a 5-minute climb; the bakery downstairs won the city's best baguette award. Perfect for "
        "a couple.",
    },
    {
        "host": "lucas",
        "title": "Tiled townhouse in Alfama with river view",
        "property_type": "house", "category": "heritage",
        "city": "Lisbon", "state": "Lisbon", "country": "Portugal",
        "address": "Rua de São Miguel, Alfama, 1100-544 Lisboa",
        "lat": 38.7110, "lng": -9.1300,
        "price": 14000, "cleaning": 2000, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Heating", "Washing machine", "TV"],
        "description": "A narrow azulejo-clad townhouse in Lisbon's oldest neighbourhood, with a "
        "rooftop terrace overlooking the Tagus and the terracotta roofs below.\n\nFado drifts up "
        "from the tavernas most nights. Tram 28 stops around the corner, and São Jorge Castle is a "
        "short (steep) walk.",
    },
    {
        "host": "lucas",
        "title": "Countryside quinta near Sintra",
        "property_type": "farmhouse", "category": "countryside",
        "city": "Sintra", "state": "Lisbon", "country": "Portugal",
        "address": "Estrada de Colares, 2710-405 Sintra",
        "lat": 38.7980, "lng": -9.3880,
        "price": 18500, "cleaning": 2800, "guests": 8, "bedrooms": 4, "beds": 5, "baths": 3,
        "amenities": ESSENTIALS + ["Kitchen", "Pool", "Garden", "Free parking on premises",
                                   "Indoor fireplace", "Pets allowed", "Washing machine"],
        "description": "A restored 18th-century quinta between the Sintra hills and the Atlantic, "
        "with a vineyard, a citrus orchard and a pool fed by spring water.\n\nPena Palace is 15 "
        "minutes by car; the wild beaches of Praia da Adraga, 10. Lisbon is 40 minutes away when "
        "you need the city.",
    },
    {
        "host": "lucas",
        "title": "Matterhorn-view chalet in Zermatt",
        "property_type": "cabin", "category": "mountains",
        "city": "Zermatt", "state": "Valais", "country": "Switzerland",
        "address": "Hinterdorfstrasse, 3920 Zermatt",
        "lat": 46.0207, "lng": 7.7491,
        "price": 38000, "cleaning": 5000, "guests": 6, "bedrooms": 3, "beds": 4, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Heating", "Indoor fireplace", "Mountain view", "Hot tub",
                                   "Washing machine", "TV"],
        "description": "A larch-wood chalet with the Matterhorn framed in the living-room window. "
        "Heated boot room, a wood fireplace and a hot tub on the balcony for après-ski.\n\nThe "
        "Sunnegga funicular is a 5-minute walk. Zermatt is car-free — the electric taxi from the "
        "station drops you right at the door.",
    },
    {
        "host": "lucas",
        "title": "Stone farmhouse among Tuscan vineyards",
        "property_type": "farmhouse", "category": "countryside",
        "city": "Greve in Chianti", "state": "Tuscany", "country": "Italy",
        "address": "Via di Lamole, 50022 Greve in Chianti",
        "lat": 43.5636, "lng": 11.3550,
        "price": 26000, "cleaning": 3500, "guests": 8, "bedrooms": 4, "beds": 5, "baths": 3,
        "amenities": ESSENTIALS + ["Kitchen", "Pool", "Garden", "Free parking on premises",
                                   "Indoor fireplace", "Washing machine", "Breakfast"],
        "description": "A 16th-century casale wrapped in Sangiovese vines and olive groves, with "
        "a long pergola for dinners and a pool that looks across the Chianti hills.\n\nThe "
        "neighbouring winery offers tastings, and Florence is 45 minutes away. Our caretaker "
        "Giulia runs a pasta-making class on Saturdays.",
    },
    {
        "host": "lucas",
        "title": "Cave house with caldera plunge pool",
        "property_type": "house", "category": "pools",
        "city": "Oia", "state": "South Aegean", "country": "Greece",
        "address": "Nikolaou Nomikou, Oia 847 02, Santorini",
        "lat": 36.4618, "lng": 25.3753,
        "price": 29000, "cleaning": 3500, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 2,
        "amenities": ESSENTIALS + ["Pool", "Air conditioning", "Breakfast", "Coffee maker", "Kitchen"],
        "description": "Carved into the cliff in classic Santorini style — whitewashed walls, "
        "vaulted ceilings and a private plunge pool looking straight over the caldera.\n\nThe "
        "famous Oia sunset happens right in front of your terrace, minus the crowds. There are "
        "about 60 steps down from the village path; we arrange porters for luggage.",
    },
    {
        "host": "lucas",
        "title": "Lakefront apartment in Bellagio",
        "property_type": "apartment", "category": "lakefront",
        "city": "Bellagio", "state": "Lombardy", "country": "Italy",
        "address": "Salita Serbelloni, 22021 Bellagio",
        "lat": 45.9850, "lng": 9.2600,
        "price": 23500, "cleaning": 3000, "guests": 4, "bedrooms": 2, "beds": 2, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Air conditioning", "Heating", "Lake access", "TV",
                                   "Coffee maker"],
        "description": "A bright apartment with a balcony right above Lake Como, where ferries "
        "glide past to Varenna and Menaggio. Mornings start with espresso and mountain views.\n\n"
        "Villa Melzi's gardens are a short lakeside stroll, and you can hire a wooden boat from "
        "the harbour below for the day.",
    },
    {
        "host": "lucas",
        "title": "Atlantic beach house in Comporta",
        "property_type": "house", "category": "beach",
        "city": "Comporta", "state": "Setúbal", "country": "Portugal",
        "address": "Rua dos Pescadores, 7580-612 Comporta",
        "lat": 38.3800, "lng": -8.7860,
        "price": 19000, "cleaning": 2800, "guests": 6, "bedrooms": 3, "beds": 3, "baths": 2,
        "amenities": ESSENTIALS + ["Kitchen", "Beach access", "Garden", "Free parking on premises",
                                   "Pets allowed", "Washing machine"],
        "description": "A reed-roofed fisherman's cabana turned relaxed beach house, surrounded by "
        "rice fields and umbrella pines. Linen, sand-coloured walls and bare feet all week.\n\n"
        "The dunes and the endless empty beach are a 7-minute bike ride (bikes included). Storks "
        "nest on the chimney every spring.",
    },
]
