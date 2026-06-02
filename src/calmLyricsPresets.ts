export interface LofiPreset {
  name: string;
  description: string;
  vibe: "dreamy" | "melancholy" | "hopeful" | "neon";
  lines: string[];
}

export const calmLofiPresets: LofiPreset[] = [
  // NATURE & SLEEP (1-10)
  {
    name: "Moonlit Forest Campfire",
    description: "Crackling campfire wood, rustling pine needles, and quiet smoke rising to meet the constellations.",
    vibe: "dreamy",
    lines: [
      "Embers rise like stardust in the dark",
      "A tiny fire leaves a lasting mark",
      "Trees are whispering under sky so deep",
      "Softly guiding all our thoughts to sleep"
    ]
  },
  {
    name: "Arctic Wind & Northern Lights",
    description: "Cold howling wind outside a cozy insulated dome, with green aurora curtains dancing over glaciers.",
    vibe: "hopeful",
    lines: [
      "Cosmic curtains dancing in the night",
      "Emerald ribbons of cold solar light",
      "Winds are singing from the northern end",
      "Healing every broken path, my friend"
    ]
  },
  {
    name: "Hidden Waterfall Sanctuary",
    description: "Deep water rumble, spray mist on mountain fern, and ancient rocks smoothed by continuous time.",
    vibe: "dreamy",
    lines: [
      "Water crashing down the mossy stone",
      "In this secret place we're not alone",
      "Mist is rising in the forest stream",
      "Flowing softly like a peaceful dream"
    ]
  },
  {
    name: "Tropical Rainforest Dawn",
    description: "Exotic songbirds tuning their morning flutes as fresh morning mist rises off giant jungle leaves.",
    vibe: "hopeful",
    lines: [
      "Morning breaking on the jungle vine",
      "Golden sunbeams start to align",
      "Ancient trees are reaching for the sky",
      "Watching quiet clouds go sailing by"
    ]
  },
  {
    name: "Snowfall on Pine Cabins",
    description: "Subtle muffled silence of a heavy winter storm dropping soft white sheets on a cedar woodland cabin.",
    vibe: "dreamy",
    lines: [
      "Snowflakes landing soft upon the sill",
      "Forest sleeping beautiful and still",
      "Keep the fireplace burning warm and bright",
      "Safe inside the quiet winter night"
    ]
  },
  {
    name: "Misty Lake Sunrise",
    description: "Soft lap of fresh water on wooden rowboats, heavy morning fog, and first light through the reeds.",
    vibe: "dreamy",
    lines: [
      "Foggy waters stretching wide and clear",
      "Peaceful mornings now are drawing near",
      "Quiet oars are dipping in the blue",
      "Waking up to see the world anew"
    ]
  },
  {
    name: "Thunderstorm Above Mountains",
    description: "Deep atmospheric thunder echo, soft rain on stone cliffs, and dark clouds rolling over jagged peaks.",
    vibe: "melancholy",
    lines: [
      "Rolling thunder in the mountain peak",
      "Words of comfort that we do not speak",
      "Heavy raindrops washing off the stone",
      "Finding safety in the great unknown"
    ]
  },
  {
    name: "Bamboo Garden Breeze",
    description: "Dry rustling of hollow bamboo shoots and soft wind chimes colliding on a sunny afternoon.",
    vibe: "hopeful",
    lines: [
      "Hollow bamboo swaying in the wind",
      "All our restless thoughts are disciplined",
      "Wind chimes ringing soft and crystal clear",
      "Gentle presence holding us so near"
    ]
  },
  {
    name: "Desert Night Under Stars",
    description: "Cool dry breeze across vast sand ripples, with infinite starry clarity above red canyon walls.",
    vibe: "melancholy",
    lines: [
      "Cool sand shifting under starry heights",
      "Distant desert putting out its lights",
      "Vastness calling to the weary mind",
      "Peace is something that we both will find"
    ]
  },
  {
    name: "Lavender Fields at Twilight",
    description: "Gentle hum of nocturnal pollinators and the relaxing herbal scent of sweet violet waves.",
    vibe: "dreamy",
    lines: [
      "Purple fields are waving in the grey",
      "As the sunlit hours fade away",
      "Sweet aromas soothing every fears",
      "Wiping off the weight of passing years"
    ]
  },

  // OCEAN & COASTAL (11-20)
  {
    name: "Lighthouse Through the Fog",
    description: "A distant periodic warning horn, sweeping warm light beams, and cold harbor waters.",
    vibe: "melancholy",
    lines: [
      "Staring through the heavy sea fog sheet",
      "Hoping that our wandering eyes will meet",
      "Lighthouse sweeping circles in the dark",
      "Leaving on the tide a golden mark"
    ]
  },
  {
    name: "Midnight Tide Reflections",
    description: "Salty sea foam, dark rolling swells, and a giant silver moon reflected in tidal pools.",
    vibe: "dreamy",
    lines: [
      "Deep ocean lifting up its hands",
      "Sinking down into the coastal sands",
      "Silver moonlight riding on the wave",
      "Keeping every little hope we gave"
    ]
  },
  {
    name: "Seagulls & Harbor Dreams",
    description: "Creaking wood docks, distant ship bells, and beach gulls glides on Atlantic harbor breezes.",
    vibe: "hopeful",
    lines: [
      "Harbor boats are creaking in the bay",
      "Dreaming of the lands so far away",
      "Gentle birds are sailing on the breeze",
      "Slowing down our anxious thoughts with ease"
    ]
  },
  {
    name: "Stormy Atlantic Coast",
    description: "Heavy deep surf crashing violently on black igneous rock cliffs, bringing oceanic power.",
    vibe: "melancholy",
    lines: [
      "Crashing waves upon the dark stone shore",
      "Hear the mighty ancient ocean roar",
      "Winds of change are blowing from the east",
      "Until the stormy weather has decreased"
    ]
  },
  {
    name: "Sunset Sailboat Horizons",
    description: "Rhythmic creaks of canvas sails, water slapping the hull, and a slow orange horizon descent.",
    vibe: "hopeful",
    lines: [
      "Gliding smooth across the golden line",
      "Leaving all our heavy plans behind",
      "Canvas sails are catching evening air",
      "Sailing past the borders of despair"
    ]
  },
  {
    name: "Coral Reef Drift",
    description: "Subtle sub-surface marine hydrophone audio, bubbling sea vents, and tranquil ocean waves.",
    vibe: "dreamy",
    lines: [
      "Floating deep beneath the rolling crest",
      "This is where the busy mind can rest",
      "Bubbles rising slow toward the sun",
      "Knowing that the healing has begun"
    ]
  },
  {
    name: "Moonlit Beach Bonfire",
    description: "Warm dry driftwood fire crackling on a sandy beach, accompanied by low rolling sea waves.",
    vibe: "hopeful",
    lines: [
      "Driftwood burning orange in the sand",
      "Holding quiet secrets in our hand",
      "Sea waves washing up to greet the spark",
      "Shining bright and cozy in the dark"
    ]
  },
  {
    name: "Hidden Island Lagoon",
    description: "Extremely gentle, glassy water ripples inside a circular protective volcanic reef cave.",
    vibe: "dreamy",
    lines: [
      "Quiet waters locked inside the stone",
      "Finding beauty when we're all alone",
      "Reflections dancing on the cavern dome",
      "Finally we've found our peaceful home"
    ]
  },
  {
    name: "Ocean Pier at Midnight",
    description: "Water splashing against seaweed-covered wooden pillars, with distant boardwalk neon lights.",
    vibe: "melancholy",
    lines: [
      "Underneath the wooden boardwalk beam",
      "Life is floating like an endless dream",
      "Neon reflections shimmering in blue",
      "Sending out our midnight thoughts to you"
    ]
  },
  {
    name: "Coastal Cliff Winds",
    description: "Vast winds howling up grass plains over steep oceanside rock drops, refreshing the mind.",
    vibe: "hopeful",
    lines: [
      "Winds are sweeping up the grassy height",
      "Sailing out into the stellar night",
      "Looking down upon the surging sea",
      "Breathe in deep and let your soul be free"
    ]
  },

  // URBAN LOFI (21-30)
  {
    name: "Tokyo Neon Rain",
    description: "Hissing taxi tires over damp blacktop, hum of vending machines, and soft rain on clear umbrellas.",
    vibe: "neon",
    lines: [
      "Shibuya streets are glowing in the rain",
      "Washing off the shadows and the pain",
      "Neon signs are blinking green and red",
      "Whispering the words we never said"
    ]
  },
  {
    name: "Seoul Rooftop Midnight",
    description: "Thrum of far city traffic from twenty floors up, cold night air, and distant train bridges.",
    vibe: "neon",
    lines: [
      "Looking out across the city lights",
      "Counting up these beautiful cold nights",
      "Seoul is sleeping under misty haze",
      "Lost inside a warm nostalgic daze"
    ]
  },
  {
    name: "New York After Hours",
    description: "Steam venting from dark steel grates, distant blue sirens, and the late-night hum of Manhattan.",
    vibe: "melancholy",
    lines: [
      "Steam is rising from the concrete floor",
      "We don't need to chase things anymore",
      "Distant yellow cabs go passing by",
      "Underneath the cloudy midtown sky"
    ]
  },
  {
    name: "Empty Subway Reverie",
    description: "Screaming metal wheels on curves, hollow platform reverb, and flickering fluorescent tube lights.",
    vibe: "melancholy",
    lines: [
      "Riding trains that have no destination",
      "Waiting at an empty subway station",
      "Echoes of the steps we left behind",
      "Searching for the peace we hope to find"
    ]
  },
  {
    name: "Paris Cafe at Dawn",
    description: "Scraping of iron bistro chairs, early bakeries opening, and soft rain on cobblestone paths.",
    vibe: "hopeful",
    lines: [
      "Raindrops glistening on cobblestones",
      "Sipping coffee, writing down our poems",
      "French accords are drifting in the air",
      "Letting go of every heavy care"
    ]
  },
  {
    name: "Hong Kong Night Market Echoes",
    description: "Distant hum of market merchants, rattling fans, and rain droplets falling on canopy sheets.",
    vibe: "neon",
    lines: [
      "Canopy drops are marking out the beat",
      "Wandering down the crowded narrow street",
      "Glowing lanterns lighting up the dusk",
      "Breathe in sweet nostalgia, clean and just"
    ]
  },
  {
    name: "London Fog & Vinyl",
    description: "Soft crackle of a warm turntable in a damp brick townhome, watching streetlamps outline fog.",
    vibe: "melancholy",
    lines: [
      "Thick London fog is pressing on the glass",
      "Watching quiet hours slowly pass",
      "Turntables rotating real slow",
      "Basking in the golden fireplace glow"
    ]
  },
  {
    name: "Cyberpunk Alley Frequency",
    description: "Humming neon wires, static interference, and low-frequency bass echoing from hidden basement clubs.",
    vibe: "neon",
    lines: [
      "Circuit boards are hummin' in the dark",
      "Looking for a tiny digital spark",
      "Neon shadows shelter our retreat",
      "Slowing down the high speed city beat"
    ]
  },
  {
    name: "Midnight Taxi Window",
    description: "Muffled highway rumble, clicking windshield wipers, and warm streetlights melting across glass.",
    vibe: "dreamy",
    lines: [
      "Headlights melting on the window pane",
      "Driving through the cold midnight rain",
      "Clicking wipers trace a steady rhythm",
      "Washed away the old regrets we carried with 'em"
    ]
  },
  {
    name: "Downtown Neon Reflection",
    description: "Steady splash of puddle droplets reflecting giant commercial monitors in empty business sectors.",
    vibe: "neon",
    lines: [
      "Commercial screens are flashing in the night",
      "Painting empty streets with silver light",
      "Puddle ripples break the corporate beam",
      "Living in a temporary dream"
    ]
  },

  // COZY & STUDY (31-40)
  {
    name: "Library After Closing Time",
    description: "The deep, heavy silence of high wood bookshelves, ticking pendulum clocks, and paper rustling.",
    vibe: "dreamy",
    lines: [
      "Quiet aisles of long-forgotten books",
      "Settle down in comfortable nooks",
      "Ticking clocks are marking out the time",
      "Fitting thoughts together in a rhyme"
    ]
  },
  {
    name: "Fireplace & Ancient Books",
    description: "Sharp dry crackling of oak wood logs, smell of old paper pages, and warmth from brick hearths.",
    vibe: "dreamy",
    lines: [
      "Fire crackles cozy on the hearth",
      "Far away from troubles of the earth",
      "Leathery covers whisper of the past",
      "Safe inside, the stillness holds at last"
    ]
  },
  {
    name: "Study Session at 2AM",
    description: "Scratching mechanical pencils on heavy paper, mug taps on desks, and absolute late-night focus.",
    vibe: "hopeful",
    lines: [
      "Pencil lines are tracing out the code",
      "Traveling down this quiet midnight road",
      "Warm mugs resting right beside our hands",
      "Building up our bright tomorrow lands"
    ]
  },
  {
    name: "Warm Attic During Rain",
    description: "Louder rain impacts on slanted wood roof shingles, with soft carpets and dusty stored items.",
    vibe: "dreamy",
    lines: [
      "Rain is drummin' loud upon the roof",
      "Keep your spirit isolated and stormproof",
      "Soft rugs warming up the cedar floor",
      "Tell the busy world to lock its door"
    ]
  },
  {
    name: "Typewriter & Candlelight",
    description: "Heavy organic key snaps, bell rings, carriage returns, and the soft flicker of soy candles.",
    vibe: "melancholy",
    lines: [
      "Typewriter keys are striking in the dark",
      "Leaving a nostalgic, permanent mark",
      "Candle flames are dancing in the breeze",
      "Setting and relaxing at our ease"
    ]
  },
  {
    name: "Cabin Journaling Retreat",
    description: "Creaking rocking chairs on wooden porches, mountain forest crickets, and fountain pens gliding on notebooks.",
    vibe: "hopeful",
    lines: [
      "Fountain pens are flowing on the page",
      "Stepping out of life's frantic stage",
      "Rocking chair is creaking on the wood",
      "Things are finally turning out for good"
    ]
  },
  {
    name: "Vintage Bookstore Silence",
    description: "Soft clock bells, sliding wooden ladder rumbles, and the comfortable scent of old ink.",
    vibe: "dreamy",
    lines: [
      "Shelves are stretching high up to the beam",
      "Sinking down into a vintage dream",
      "Ink and paper soothe the busy head",
      "Everything is calm, the words are read"
    ]
  },
  {
    name: "Winter Coffeehouse Escape",
    description: "Muffled espresso steam, soft keyboard clicks, and heavy wind blowing snow against wide windows.",
    vibe: "hopeful",
    lines: [
      "Muffled steam and cozy coffee taste",
      "No more rushing, no more anxious waste",
      "Snow is swirling white outside the pane",
      "Warmth is where our hearts will now remain"
    ]
  },
  {
    name: "University Dorm Night",
    description: "Soft hum of computer tower fans, shared laughter down hallways, and focused desk lamps.",
    vibe: "hopeful",
    lines: [
      "Desk lamps lining up our little space",
      "Working hard to find our rightful place",
      "Quiet hum of memory and drive",
      "This is where we feel so much alive"
    ]
  },
  {
    name: "Writer's Desk & Thunder",
    description: "Distant rumbles, light breeze rustling reference notes, and steady rain splashing on patio railings.",
    vibe: "melancholy",
    lines: [
      "Midnight writer drafting through the storm",
      "Keeping all our inner thoughts so warm",
      "Distant thunder punctuates our rhyme",
      "Perfect focus in this quiet time"
    ]
  },

  // EMOTIONAL & NOSTALGIC (41-50)
  {
    name: "Letters Never Sent",
    description: "Sighs of old pages, scratch of pencil graphite, and quiet rain tapping bedroom windows.",
    vibe: "melancholy",
    lines: [
      "Wrote your name and folded up the sheet",
      "Knowing that we'll never truly meet",
      "Letters resting in a wooden drawer",
      "Unsent feelings walking out the door"
    ]
  },
  {
    name: "Last Train Home",
    description: "Quiet train car hum, rattling hand straps, and watching blurred station lights pass in the dark.",
    vibe: "melancholy",
    lines: [
      "Half asleep upon the final line",
      "Hoping that your journey turned out fine",
      "Fluorescent tubes are buzzing above head",
      "Thinking of the things we should have said"
    ]
  },
  {
    name: "Polaroids From Summer",
    description: "Rattling fan breeze, crickets outside, and looking at faded rectangular photos from years ago.",
    vibe: "hopeful",
    lines: [
      "Summer photos fading on the wall",
      "Learning how to catch you when you fall",
      "Salty smiles frozen in the sun",
      "Believing that our journey's just begun"
    ]
  },
  {
    name: "The Day We Almost Met",
    description: "Distant crowd noise filtered through glass, soft rain, and reflective major-seventh chords.",
    vibe: "melancholy",
    lines: [
      "Crossed the platform right as you walked by",
      "Underneath the damp and heavy sky",
      "Just a second away from hello",
      "Where did all those years and memories go"
    ]
  },
  {
    name: "Forgotten Voice Mail",
    description: "Aesthetic low-fidelity telephone speaker hiss, warm cassette tape tape, and digital tape hum.",
    vibe: "melancholy",
    lines: [
      "Your recording crackles on the tape",
      "No way for this memory to escape",
      "Hearing how you laughed so long ago",
      "Holding on to things that had to go"
    ]
  },
  {
    name: "Empty Swing at Sunset",
    description: "Creaking metal chain links, evening wind in poplar trees, and orange sky fading to black.",
    vibe: "melancholy",
    lines: [
      "Chains are creaking on the empty swing",
      "Wondering what tomorrow's light will bring",
      "Sunset painting shadows on the grass",
      "Watch the silent playground hours pass"
    ]
  },
  {
    name: "Waiting at the Red Light",
    description: "Rhythmic clicking turn signal noise, soft dashboard glow, and rain splashing across roads.",
    vibe: "neon",
    lines: [
      "Turn signal clicking out a steady beat",
      "Idle engines on the empty street",
      "Watching neon pools of red and green",
      "The quietest escape we've ever seen"
    ]
  },
  {
    name: "Childhood Streetlights",
    description: "Summer evening field insects, orange sodium light vapor hum, and remote suburb acoustics.",
    vibe: "dreamy",
    lines: [
      "Sodium warmth is lighting up the lane",
      "In this quiet space we find no pain",
      "Chasing fireflies until the night",
      "Underneath the warm suburbian light"
    ]
  },
  {
    name: "Ghosts of Old Conversations",
    description: "Quiet room echo, wind through window cracks, and the melancholic ticking of wall clocks.",
    vibe: "melancholy",
    lines: [
      "Whispers echoing from ancient rooms",
      "Fading out like autumn flower blooms",
      "Every clock is marking out your name",
      "Even though the seasons ain't the same"
    ]
  },
  {
    name: "Stars We Promised To Watch",
    description: "Quiet grass crickets, breathing loops, and the vast expanding white noise of the Milky Way.",
    vibe: "dreamy",
    lines: [
      "Looking at the starry sky alone",
      "Drafting letters on this little phone",
      "Promised we would watch the constellation",
      "With the deepest late-night observation"
    ]
  },

  // HIDDEN SEO GOLD PRESETS (51-60)
  {
    name: "ADHD Focus Rain Mix",
    description: "Binaural brown noise, fast tempo lofi, and continuous heavy rain to lock in hyperfocus.",
    vibe: "neon",
    lines: [
      "Heavy rain blocks out the outer world",
      "Visions and agendas now unfurled",
      "Hyperfocus locks the busy mind",
      "Leaving all distractions far behind"
    ]
  },
  {
    name: "Deep Work Forest Radio",
    description: "Active bird chirps, rustling leaves, and deep concentration frequencies.",
    vibe: "hopeful",
    lines: [
      "Birds are chirping early in the trees",
      "Settle into working with great ease",
      "Deep focus hums in every single cord",
      "Patience is your ultimate reward"
    ]
  },
  {
    name: "Study With Owl Sounds",
    description: "Woodland owl hoots, ticking libraries, and focused typewriter strokes.",
    vibe: "melancholy",
    lines: [
      "Nocturnal guardians call from the pine",
      "Working on this late-night design",
      "Typewriter typing under misty light",
      "Guiding our academic steps tonight"
    ]
  },
  {
    name: "Sleep With Ocean Waves",
    description: "Deep rolling surf waves and alpha frequency synthesizer sheets.",
    vibe: "dreamy",
    lines: [
      "Rolling oceans wash upon the bed",
      "Resting your exhausted sandy head",
      "Alpha waves are sweeping in the dark",
      "Fading out the day's persistent spark"
    ]
  },
  {
    name: "Birdsong Meditation Channel",
    description: "Nightingale flutes, wind chimes, and calming meditation drones.",
    vibe: "hopeful",
    lines: [
      "Singing flutes are rising from the nest",
      "This is where all spirits find their rest",
      "Calming wind chimes playing in the sun",
      "True recovery has now begun"
    ]
  },
  {
    name: "Rain For Reading Sessions",
    description: "Rhythmic slate rain, crackling fireplaces, and quiet page turning.",
    vibe: "dreamy",
    lines: [
      "Pages turning softly by the spark",
      "Rain is dropping rhythms in the dark",
      "Books are bridges to another shore",
      "We don't need to struggle anymore"
    ]
  },
  {
    name: "Coding Through The Night",
    description: "Mechanical keyboard blue switches, hum of servers, and clean electronic pulses.",
    vibe: "neon",
    lines: [
      "Blue keys clicking in the silent room",
      "Building programs through midnight gloom",
      "Electronic signals running bright",
      "Coding past the borders of the night"
    ]
  },
  {
    name: "Relaxing Nature Radio",
    description: "Streams of forest breeze, grass crickets, and soothing melody chords.",
    vibe: "dreamy",
    lines: [
      "Rivers flowing through the grassy plain",
      "Washing off our worries and our pain",
      "Crickets singing under starry sky",
      "As the late night hours go sailing by"
    ]
  },
  {
    name: "Peaceful Train Journey Sounds",
    description: "Tracks click-clack, rain on train window, and long horns in mountain gorges.",
    vibe: "dreamy",
    lines: [
      "Clicking tracks are singing us to sleep",
      "All these peaceful records we will keep",
      "Train horns echoing in mountain air",
      "Comforting our spirits everywhere"
    ]
  },
  {
    name: "Coffee Shop Focus Ambience",
    description: "Muffled cups, background chat hum, and rain on pavement cafe roofs.",
    vibe: "hopeful",
    lines: [
      "Espresso steaming in virtual space",
      "Everyone has found their proper place",
      "Raindrops drumming on the bistro cloth",
      "Resting safe beneath our cozy froth"
    ]
  },

  // VIRAL PRESETS (61-70)
  {
    name: "Messages To My Future Self",
    description: "Aesthetic cosmic clock, warm space pads, and hopeful piano patterns.",
    vibe: "hopeful",
    lines: [
      "Dear future self, are you doing fine?",
      "Looking back across the bridge of time",
      "Hope you found the love we started here",
      "Hope you live without a single fear"
    ]
  },
  {
    name: "The Universe Is Listening",
    description: "Solar wind sweeps, star twinkles, and ambient synthesizer waves.",
    vibe: "dreamy",
    lines: [
      "Sailing out into the cosmic deep",
      "Guarding secrets that the planets keep",
      "Solar winds are whistling in our ears",
      "Warranting a peace for all these years"
    ]
  },
  {
    name: "Signal To Someone I Miss",
    description: "Longing chord loops, rain on roof, and distant harbor foghorns.",
    vibe: "melancholy",
    lines: [
      "Sending signal pulses in the dark",
      "Hoping that they land a tiny spark",
      "Missing you across the starry sea",
      "Wondering if you still think of me"
    ]
  },
  {
    name: "If We Met Again",
    description: "Staggered chords, soft winds, and emotional tape delays.",
    vibe: "melancholy",
    lines: [
      "If we met again upon the street",
      "Would our careful glances even meet?",
      "Or would we walk on like standard strangers",
      "Muffled down by life's persistent dangers"
    ]
  },
  {
    name: "Broadcast To The Stars",
    description: "Deep space telemetry hum and expansive planetary frequencies.",
    vibe: "dreamy",
    lines: [
      "Beaming signals up to outer space",
      "Looking for another cozy place",
      "Planets spinning in their ancient ring",
      "Listen as the stellar choirs sing"
    ]
  },
  {
    name: "Midnight Confession Booth",
    description: "Quiet room, crackle and hiss of analog microphones, and soft rain sweeps.",
    vibe: "melancholy",
    lines: [
      "Confessions whispered in the quiet room",
      "Letting go of all our heavy gloom",
      "Microphones are keeping secrets safe",
      "Safe from any other judgmental waif"
    ]
  },
  {
    name: "Echoes From Another Timeline",
    description: "Reversed guitar swells, digital delays, and neon rain showers.",
    vibe: "neon",
    lines: [
      "Living in a different sort of day",
      "Where we chose to stay and never stray",
      "Reversed echoes calling to my head",
      "All the happy paths we didn't tread"
    ]
  },
  {
    name: "Radio From A Parallel World",
    description: "Unfamiliar chord intervals, retro radio dials, and static textures.",
    vibe: "neon",
    lines: [
      "Tuned into a frequency so rare",
      "Music waves are floating in the air",
      "Parallel signals coming from the sky",
      "Giving us a different reason why"
    ]
  },
  {
    name: "Lost Frequencies Of The Heart",
    description: "Dampened lowpass piano chords, rain on vinyl, and quiet sighs.",
    vibe: "melancholy",
    lines: [
      "Lowpass pianos crying in the dusk",
      "Turning all our worries into dust",
      "Frequencies of heartbeats slow and clear",
      "Letting you know that we hold you dear"
    ]
  },
  {
    name: "One Last Goodnight",
    description: "Subtle sleeping heartbeat, extremely slow synth melody, and cricket lullaby.",
    vibe: "dreamy",
    lines: [
      "Heartbeats slowing as the night closes",
      "Fading like the summer yellow roses",
      "Rest your heavy eyes and say goodbye",
      "Underneath the vast protective sky"
    ]
  },

  // ULTRA-UNIQUE EXCLUSIVES (71-80)
  {
    name: "Abandoned Space Station Broadcast",
    description: "Hollow corridors, emergency signals, solar sirens, and static background hiss.",
    vibe: "neon",
    lines: [
      "Steel corridors are empty and cold",
      "Sagas of the astronauts of old",
      "Starlight shining through the broken pane",
      "Waiting for our crew to come again"
    ]
  },
  {
    name: "Martian Sunset Radio",
    description: "Red desert winds, mechanical rover dust hums, and cosmic synth tracks.",
    vibe: "melancholy",
    lines: [
      "Red hills stretching far as eye can see",
      "Robots wandering so peacefully",
      "Solar cells are fading in the dust",
      "Settle in, for sleeping is a must"
    ]
  },
  {
    name: "Lunar Observatory Dreams",
    description: "Cold telescope telescope hum, lunar craters, and deep space exploration sounds.",
    vibe: "dreamy",
    lines: [
      "Looking from the crater to the earth",
      "Re-examining our place of birth",
      "Telescope motor humming low",
      "As the stellar rivers softly flow"
    ]
  },
  {
    name: "Deep Ocean Research Vessel",
    description: "Muffled metal submarine hull clicks, sonars, and massive oceanic current rumbles.",
    vibe: "melancholy",
    lines: [
      "Sonar clicking in the velvet black",
      "No map leading to the surface back",
      "Currents warming up the silent depth",
      "As the ocean takes another breath"
    ]
  },
  {
    name: "Signal From The Arctic Circle",
    description: "Howling blizzard wind, creaking ice sheets, and remote research radio codes.",
    vibe: "dreamy",
    lines: [
      "Howling blizzard outside frozen doors",
      "Drawing maps across the wooden floors",
      "Morse code beeping on the radio band",
      "Holding tight to this cold isolated land"
    ]
  },
  {
    name: "Floating City After Dark",
    description: "Cloud winds, distant hover engines, and sparkling high-altitude synth leads.",
    vibe: "neon",
    lines: [
      "Floating high above the stormy crowd",
      "Resting cozy in our cyber cloud",
      "Hover ships go whispering right by",
      "Streaking silver outlines in the sky"
    ]
  },
  {
    name: "Neon Observatory Frequency",
    description: "Pulsar data signals, electronic scope motors, and starry atmospheres.",
    vibe: "neon",
    lines: [
      "Pulsars ticking rhythm in the dark",
      "Chasing a divine, eternal spark",
      "Frequency is aligned to the star",
      "Showing us exactly who we are"
    ]
  },
  {
    name: "Stargazer's Emergency Channel",
    description: "Urgent but comforting SOS codes, retro frequency sweeps, and warm synth sheets.",
    vibe: "hopeful",
    lines: [
      "Comforting signals beaming down to you",
      "Everything we say is pure and true",
      "SOS means you are not alone",
      "Even if you block your cellular phone"
    ]
  },
  {
    name: "Cloud Kingdom Radio",
    description: "Ethereal angelic synths, high altitude winds, and crystal crystal keys.",
    vibe: "dreamy",
    lines: [
      "Angelic pathways open in the white",
      "Floating through the high celestial light",
      "Flutes of wind are singing in our ear",
      "Washing off our worries and our fear"
    ]
  },
  {
    name: "Interstellar Sleep Transmission",
    description: "Extremely long-form cosmic waves, soothing alpha brain wave sync, and starry static.",
    vibe: "dreamy",
    lines: [
      "Interstellar signals carry bright",
      "Through the infinite galactic night",
      "Breathe in deep and let the stellar code",
      "Lead you down your designated road"
    ]
  },
  {
    name: "Tamil Sangam Forest Harmony",
    description: "Quiet woodland sounds with soothing Tamil lyrics from classical poetry celebrating nature and peace.",
    vibe: "dreamy",
    lines: [
      "Kurinji nilatthin amaidhi ingu malarattum",
      "Kaatrin isayil thuyaram ellam marayattum",
      "Iravaana vaanathil minmeengal olirgiradhu",
      "Manadhil thooimaiyum amaidhiyum niraigiradhu"
    ]
  },
  {
    name: "Telugu Deccan River Flow",
    description: "Serene stream murmurs from the Deccan plateau with comforting Telugu chants of wellness.",
    vibe: "dreamy",
    lines: [
      "Ee koti chukkala madhya prasanthatha neeku",
      "Prathisaari neevu thirigi swasa theesuko",
      "Manasu loni aalochanalanni aagiponi",
      "Swarala sangeetham aathmani sparsi-sthundi"
    ]
  }
];
