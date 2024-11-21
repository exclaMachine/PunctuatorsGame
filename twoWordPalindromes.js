const twoWordPalindromes = [
  {
    "word1": "aha",
    "middle": "a",
    "word2": "ha",
    "palindrome": "aha ha"
  },
  {
    "word1": "ah",
    "middle": "a",
    "word2": "aha",
    "palindrome": "ah aha"
  },
  {
    "word1": "amp",
    "middle": "p",
    "word2": "ma",
    "palindrome": "amp ma"
  },
  {
    "word1": "area",
    "middle": "a",
    "word2": "era",
    "palindrome": "area era"
  },
  {
    "word1": "are",
    "middle": "s",
    "word2": "sera",
    "palindrome": "are sera"
  },
  {
    "word1": "ate",
    "middle": "b",
    "word2": "beta",
    "palindrome": "ate beta"
  },
  {
    "word1": "ate",
    "middle": "f",
    "word2": "feta",
    "palindrome": "ate feta"
  },
  {
    "word1": "ate",
    "middle": "z",
    "word2": "zeta",
    "palindrome": "ate zeta"
  },
  {
    "word1": "bade",
    "middle": "e",
    "word2": "dab",
    "palindrome": "bade dab"
  },
  {
    "word1": "band",
    "middle": "d",
    "word2": "nab",
    "palindrome": "band nab"
  },
  {
    "word1": "bane",
    "middle": "e",
    "word2": "nab",
    "palindrome": "bane nab"
  },
  {
    "word1": "bang",
    "middle": "g",
    "word2": "nab",
    "palindrome": "bang nab"
  },
  {
    "word1": "bank",
    "middle": "k",
    "word2": "nab",
    "palindrome": "bank nab"
  },
  {
    "word1": "bate",
    "middle": "e",
    "word2": "tab",
    "palindrome": "bate tab"
  },
  {
    "word1": "bath",
    "middle": "h",
    "word2": "tab",
    "palindrome": "bath tab"
  },
  {
    "word1": "bats",
    "middle": "s",
    "word2": "tab",
    "palindrome": "bats tab"
  },
  {
    "word1": "bat",
    "middle": "s",
    "word2": "stab",
    "palindrome": "bat stab"
  },
  {
    "word1": "bind",
    "middle": "d",
    "word2": "nib",
    "palindrome": "bind nib"
  },
  {
    "word1": "bogy",
    "middle": "y",
    "word2": "gob",
    "palindrome": "bogy gob"
  },
  {
    "word1": "brow",
    "middle": "w",
    "word2": "orb",
    "palindrome": "brow orb"
  },
  {
    "word1": "bung",
    "middle": "g",
    "word2": "nub",
    "palindrome": "bung nub"
  },
  {
    "word1": "bunk",
    "middle": "k",
    "word2": "nub",
    "palindrome": "bunk nub"
  },
  {
    "word1": "buns",
    "middle": "s",
    "word2": "nub",
    "palindrome": "buns nub"
  },
  {
    "word1": "bun",
    "middle": "s",
    "word2": "snub",
    "palindrome": "bun snub"
  },
  {
    "word1": "bunt",
    "middle": "t",
    "word2": "nub",
    "palindrome": "bunt nub"
  },
  {
    "word1": "bur",
    "middle": "d",
    "word2": "drub",
    "palindrome": "bur drub"
  },
  {
    "word1": "burg",
    "middle": "g",
    "word2": "rub",
    "palindrome": "burg rub"
  },
  {
    "word1": "bur",
    "middle": "g",
    "word2": "grub",
    "palindrome": "bur grub"
  },
  {
    "word1": "burl",
    "middle": "l",
    "word2": "rub",
    "palindrome": "burl rub"
  },
  {
    "word1": "burn",
    "middle": "n",
    "word2": "rub",
    "palindrome": "burn rub"
  },
  {
    "word1": "burp",
    "middle": "p",
    "word2": "rub",
    "palindrome": "burp rub"
  },
  {
    "word1": "burr",
    "middle": "r",
    "word2": "rub",
    "palindrome": "burr rub"
  },
  {
    "word1": "bury",
    "middle": "y",
    "word2": "rub",
    "palindrome": "bury rub"
  },
  {
    "word1": "burgh",
    "middle": "h",
    "word2": "grub",
    "palindrome": "burgh grub"
  },
  {
    "word1": "bush",
    "middle": "h",
    "word2": "sub",
    "palindrome": "bush sub"
  },
  {
    "word1": "buss",
    "middle": "s",
    "word2": "sub",
    "palindrome": "buss sub"
  },
  {
    "word1": "bust",
    "middle": "t",
    "word2": "sub",
    "palindrome": "bust sub"
  },
  {
    "word1": "busy",
    "middle": "y",
    "word2": "sub",
    "palindrome": "busy sub"
  },
  {
    "word1": "but",
    "middle": "s",
    "word2": "stub",
    "palindrome": "but stub"
  },
  {
    "word1": "butt",
    "middle": "t",
    "word2": "tub",
    "palindrome": "butt tub"
  },
  {
    "word1": "coda",
    "middle": "a",
    "word2": "doc",
    "palindrome": "coda doc"
  },
  {
    "word1": "code",
    "middle": "e",
    "word2": "doc",
    "palindrome": "code doc"
  },
  {
    "word1": "dame",
    "middle": "e",
    "word2": "mad",
    "palindrome": "dame mad"
  },
  {
    "word1": "damn",
    "middle": "n",
    "word2": "mad",
    "palindrome": "damn mad"
  },
  {
    "word1": "damp",
    "middle": "p",
    "word2": "mad",
    "palindrome": "damp mad"
  },
  {
    "word1": "deer",
    "middle": "b",
    "word2": "breed",
    "palindrome": "deer breed"
  },
  {
    "word1": "deer",
    "middle": "c",
    "word2": "creed",
    "palindrome": "deer creed"
  },
  {
    "word1": "deer",
    "middle": "g",
    "word2": "greed",
    "palindrome": "deer greed"
  },
  {
    "word1": "deft",
    "middle": "t",
    "word2": "fed",
    "palindrome": "deft fed"
  },
  {
    "word1": "defy",
    "middle": "y",
    "word2": "fed",
    "palindrome": "defy fed"
  },
  {
    "word1": "dew",
    "middle": "a",
    "word2": "awed",
    "palindrome": "dew awed"
  },
  {
    "word1": "dewy",
    "middle": "y",
    "word2": "wed",
    "palindrome": "dewy wed"
  },
  {
    "word1": "dial",
    "middle": "p",
    "word2": "plaid",
    "palindrome": "dial plaid"
  },
  {
    "word1": "diaper",
    "middle": "p",
    "word2": "prepaid",
    "palindrome": "diaper prepaid"
  },
  {
    "word1": "dim",
    "middle": "a",
    "word2": "amid",
    "palindrome": "dim amid"
  },
  {
    "word1": "dime",
    "middle": "e",
    "word2": "mid",
    "palindrome": "dime mid"
  },
  {
    "word1": "doge",
    "middle": "e",
    "word2": "god",
    "palindrome": "doge god"
  },
  {
    "word1": "dona",
    "middle": "a",
    "word2": "nod",
    "palindrome": "dona nod"
  },
  {
    "word1": "done",
    "middle": "e",
    "word2": "nod",
    "palindrome": "done nod"
  },
  {
    "word1": "dong",
    "middle": "g",
    "word2": "nod",
    "palindrome": "dong nod"
  },
  {
    "word1": "door",
    "middle": "b",
    "word2": "brood",
    "palindrome": "door brood"
  },
  {
    "word1": "draw",
    "middle": "a",
    "word2": "award",
    "palindrome": "draw award"
  },
  {
    "word1": "drawl",
    "middle": "l",
    "word2": "ward",
    "palindrome": "drawl ward"
  },
  {
    "word1": "drawn",
    "middle": "n",
    "word2": "ward",
    "palindrome": "drawn ward"
  },
  {
    "word1": "draw",
    "middle": "s",
    "word2": "sward",
    "palindrome": "draw sward"
  },
  {
    "word1": "drawers",
    "middle": "s",
    "word2": "reward",
    "palindrome": "drawers reward"
  },
  {
    "word1": "eel",
    "middle": "f",
    "word2": "flee",
    "palindrome": "eel flee"
  },
  {
    "word1": "eel",
    "middle": "g",
    "word2": "glee",
    "palindrome": "eel glee"
  },
  {
    "word1": "eh",
    "middle": "s",
    "word2": "she",
    "palindrome": "eh she"
  },
  {
    "word1": "eh",
    "middle": "t",
    "word2": "the",
    "palindrome": "eh the"
  },
  {
    "word1": "emu",
    "middle": "u",
    "word2": "me",
    "palindrome": "emu me"
  },
  {
    "word1": "emir",
    "middle": "c",
    "word2": "crime",
    "palindrome": "emir crime"
  },
  {
    "word1": "emir",
    "middle": "g",
    "word2": "grime",
    "palindrome": "emir grime"
  },
  {
    "word1": "emir",
    "middle": "p",
    "word2": "prime",
    "palindrome": "emir prime"
  },
  {
    "word1": "ergot",
    "middle": "t",
    "word2": "ogre",
    "palindrome": "ergot ogre"
  },
  {
    "word1": "evil",
    "middle": "a",
    "word2": "alive",
    "palindrome": "evil alive"
  },
  {
    "word1": "evil",
    "middle": "o",
    "word2": "olive",
    "palindrome": "evil olive"
  },
  {
    "word1": "flown",
    "middle": "n",
    "word2": "wolf",
    "palindrome": "flown wolf"
  },
  {
    "word1": "gala",
    "middle": "a",
    "word2": "lag",
    "palindrome": "gala lag"
  },
  {
    "word1": "gale",
    "middle": "e",
    "word2": "lag",
    "palindrome": "gale lag"
  },
  {
    "word1": "gal",
    "middle": "f",
    "word2": "flag",
    "palindrome": "gal flag"
  },
  {
    "word1": "gall",
    "middle": "l",
    "word2": "lag",
    "palindrome": "gall lag"
  },
  {
    "word1": "gal",
    "middle": "s",
    "word2": "slag",
    "palindrome": "gal slag"
  },
  {
    "word1": "garb",
    "middle": "b",
    "word2": "rag",
    "palindrome": "garb rag"
  },
  {
    "word1": "gar",
    "middle": "b",
    "word2": "brag",
    "palindrome": "gar brag"
  },
  {
    "word1": "gar",
    "middle": "c",
    "word2": "crag",
    "palindrome": "gar crag"
  },
  {
    "word1": "gar",
    "middle": "d",
    "word2": "drag",
    "palindrome": "gar drag"
  },
  {
    "word1": "gash",
    "middle": "h",
    "word2": "sag",
    "palindrome": "gash sag"
  },
  {
    "word1": "gasp",
    "middle": "p",
    "word2": "sag",
    "palindrome": "gasp sag"
  },
  {
    "word1": "geld",
    "middle": "d",
    "word2": "leg",
    "palindrome": "geld leg"
  },
  {
    "word1": "girth",
    "middle": "h",
    "word2": "trig",
    "palindrome": "girth trig"
  },
  {
    "word1": "gums",
    "middle": "s",
    "word2": "mug",
    "palindrome": "gums mug"
  },
  {
    "word1": "gum",
    "middle": "s",
    "word2": "smug",
    "palindrome": "gum smug"
  },
  {
    "word1": "guts",
    "middle": "s",
    "word2": "tug",
    "palindrome": "guts tug"
  },
  {
    "word1": "hob",
    "middle": "b",
    "word2": "oh",
    "palindrome": "hob oh"
  },
  {
    "word1": "hod",
    "middle": "d",
    "word2": "oh",
    "palindrome": "hod oh"
  },
  {
    "word1": "hoe",
    "middle": "e",
    "word2": "oh",
    "palindrome": "hoe oh"
  },
  {
    "word1": "hog",
    "middle": "g",
    "word2": "oh",
    "palindrome": "hog oh"
  },
  {
    "word1": "hon",
    "middle": "n",
    "word2": "oh",
    "palindrome": "hon oh"
  },
  {
    "word1": "ho",
    "middle": "o",
    "word2": "ooh",
    "palindrome": "ho ooh"
  },
  {
    "word1": "hop",
    "middle": "p",
    "word2": "oh",
    "palindrome": "hop oh"
  },
  {
    "word1": "hot",
    "middle": "t",
    "word2": "oh",
    "palindrome": "hot oh"
  },
  {
    "word1": "how",
    "middle": "w",
    "word2": "oh",
    "palindrome": "how oh"
  },
  {
    "word1": "hoops",
    "middle": "s",
    "word2": "pooh",
    "palindrome": "hoops pooh"
  },
  {
    "word1": "its",
    "middle": "s",
    "word2": "ti",
    "palindrome": "its ti"
  },
  {
    "word1": "keel",
    "middle": "s",
    "word2": "sleek",
    "palindrome": "keel sleek"
  },
  {
    "word1": "known",
    "middle": "n",
    "word2": "wonk",
    "palindrome": "known wonk"
  },
  {
    "word1": "lap",
    "middle": "o",
    "word2": "opal",
    "palindrome": "lap opal"
  },
  {
    "word1": "leer",
    "middle": "c",
    "word2": "creel",
    "palindrome": "leer creel"
  },
  {
    "word1": "leery",
    "middle": "y",
    "word2": "reel",
    "palindrome": "leery reel"
  },
  {
    "word1": "liar",
    "middle": "f",
    "word2": "frail",
    "palindrome": "liar frail"
  },
  {
    "word1": "liar",
    "middle": "t",
    "word2": "trail",
    "palindrome": "liar trail"
  },
  {
    "word1": "loop",
    "middle": "s",
    "word2": "spool",
    "palindrome": "loop spool"
  },
  {
    "word1": "loopy",
    "middle": "y",
    "word2": "pool",
    "palindrome": "loopy pool"
  },
  {
    "word1": "loot",
    "middle": "s",
    "word2": "stool",
    "palindrome": "loot stool"
  },
  {
    "word1": "lope",
    "middle": "e",
    "word2": "pol",
    "palindrome": "lope pol"
  },
  {
    "word1": "mar",
    "middle": "c",
    "word2": "cram",
    "palindrome": "mar cram"
  },
  {
    "word1": "mar",
    "middle": "d",
    "word2": "dram",
    "palindrome": "mar dram"
  },
  {
    "word1": "mare",
    "middle": "e",
    "word2": "ram",
    "palindrome": "mare ram"
  },
  {
    "word1": "mar",
    "middle": "g",
    "word2": "gram",
    "palindrome": "mar gram"
  },
  {
    "word1": "mark",
    "middle": "k",
    "word2": "ram",
    "palindrome": "mark ram"
  },
  {
    "word1": "marl",
    "middle": "l",
    "word2": "ram",
    "palindrome": "marl ram"
  },
  {
    "word1": "mart",
    "middle": "t",
    "word2": "ram",
    "palindrome": "mart ram"
  },
  {
    "word1": "mar",
    "middle": "t",
    "word2": "tram",
    "palindrome": "mar tram"
  },
  {
    "word1": "mate",
    "middle": "e",
    "word2": "tam",
    "palindrome": "mate tam"
  },
  {
    "word1": "math",
    "middle": "h",
    "word2": "tam",
    "palindrome": "math tam"
  },
  {
    "word1": "matt",
    "middle": "t",
    "word2": "tam",
    "palindrome": "matt tam"
  },
  {
    "word1": "mayo",
    "middle": "o",
    "word2": "yam",
    "palindrome": "mayo yam"
  },
  {
    "word1": "moor",
    "middle": "b",
    "word2": "broom",
    "palindrome": "moor broom"
  },
  {
    "word1": "moor",
    "middle": "g",
    "word2": "groom",
    "palindrome": "moor groom"
  },
  {
    "word1": "mot",
    "middle": "a",
    "word2": "atom",
    "palindrome": "mot atom"
  },
  {
    "word1": "mote",
    "middle": "e",
    "word2": "tom",
    "palindrome": "mote tom"
  },
  {
    "word1": "moth",
    "middle": "h",
    "word2": "tom",
    "palindrome": "moth tom"
  },
  {
    "word1": "mu",
    "middle": "b",
    "word2": "bum",
    "palindrome": "mu bum"
  },
  {
    "word1": "mu",
    "middle": "c",
    "word2": "cum",
    "palindrome": "mu cum"
  },
  {
    "word1": "mud",
    "middle": "d",
    "word2": "um",
    "palindrome": "mud um"
  },
  {
    "word1": "mug",
    "middle": "g",
    "word2": "um",
    "palindrome": "mug um"
  },
  {
    "word1": "mu",
    "middle": "g",
    "word2": "gum",
    "palindrome": "mu gum"
  },
  {
    "word1": "mu",
    "middle": "h",
    "word2": "hum",
    "palindrome": "mu hum"
  },
  {
    "word1": "mum",
    "middle": "m",
    "word2": "um",
    "palindrome": "mum um"
  },
  {
    "word1": "mu",
    "middle": "m",
    "word2": "mum",
    "palindrome": "mu mum"
  },
  {
    "word1": "mu",
    "middle": "r",
    "word2": "rum",
    "palindrome": "mu rum"
  },
  {
    "word1": "mu",
    "middle": "s",
    "word2": "sum",
    "palindrome": "mu sum"
  },
  {
    "word1": "mu",
    "middle": "y",
    "word2": "yum",
    "palindrome": "mu yum"
  },
  {
    "word1": "nape",
    "middle": "e",
    "word2": "pan",
    "palindrome": "nape pan"
  },
  {
    "word1": "nap",
    "middle": "s",
    "word2": "span",
    "palindrome": "nap span"
  },
  {
    "word1": "news",
    "middle": "s",
    "word2": "wen",
    "palindrome": "news wen"
  },
  {
    "word1": "newt",
    "middle": "t",
    "word2": "wen",
    "palindrome": "newt wen"
  },
  {
    "word1": "nip",
    "middle": "s",
    "word2": "spin",
    "palindrome": "nip spin"
  },
  {
    "word1": "nite",
    "middle": "e",
    "word2": "tin",
    "palindrome": "nite tin"
  },
  {
    "word1": "no",
    "middle": "c",
    "word2": "con",
    "palindrome": "no con"
  },
  {
    "word1": "nod",
    "middle": "d",
    "word2": "on",
    "palindrome": "nod on"
  },
  {
    "word1": "no",
    "middle": "d",
    "word2": "don",
    "palindrome": "no don"
  },
  {
    "word1": "no",
    "middle": "e",
    "word2": "eon",
    "palindrome": "no eon"
  },
  {
    "word1": "no",
    "middle": "h",
    "word2": "hon",
    "palindrome": "no hon"
  },
  {
    "word1": "no",
    "middle": "i",
    "word2": "ion",
    "palindrome": "no ion"
  },
  {
    "word1": "nor",
    "middle": "r",
    "word2": "on",
    "palindrome": "nor on"
  },
  {
    "word1": "no",
    "middle": "s",
    "word2": "son",
    "palindrome": "no son"
  },
  {
    "word1": "not",
    "middle": "t",
    "word2": "on",
    "palindrome": "not on"
  },
  {
    "word1": "no",
    "middle": "t",
    "word2": "ton",
    "palindrome": "no ton"
  },
  {
    "word1": "now",
    "middle": "w",
    "word2": "on",
    "palindrome": "now on"
  },
  {
    "word1": "no",
    "middle": "w",
    "word2": "won",
    "palindrome": "no won"
  },
  {
    "word1": "no",
    "middle": "y",
    "word2": "yon",
    "palindrome": "no yon"
  },
  {
    "word1": "note",
    "middle": "e",
    "word2": "ton",
    "palindrome": "note ton"
  },
  {
    "word1": "nuts",
    "middle": "s",
    "word2": "tun",
    "palindrome": "nuts tun"
  },
  {
    "word1": "nut",
    "middle": "s",
    "word2": "stun",
    "palindrome": "nut stun"
  },
  {
    "word1": "par",
    "middle": "c",
    "word2": "crap",
    "palindrome": "par crap"
  },
  {
    "word1": "pare",
    "middle": "e",
    "word2": "rap",
    "palindrome": "pare rap"
  },
  {
    "word1": "park",
    "middle": "k",
    "word2": "rap",
    "palindrome": "park rap"
  },
  {
    "word1": "part",
    "middle": "t",
    "word2": "rap",
    "palindrome": "part rap"
  },
  {
    "word1": "par",
    "middle": "t",
    "word2": "trap",
    "palindrome": "par trap"
  },
  {
    "word1": "par",
    "middle": "w",
    "word2": "wrap",
    "palindrome": "par wrap"
  },
  {
    "word1": "part",
    "middle": "s",
    "word2": "strap",
    "palindrome": "part strap"
  },
  {
    "word1": "party",
    "middle": "y",
    "word2": "trap",
    "palindrome": "party trap"
  },
  {
    "word1": "pate",
    "middle": "e",
    "word2": "tap",
    "palindrome": "pate tap"
  },
  {
    "word1": "path",
    "middle": "h",
    "word2": "tap",
    "palindrome": "path tap"
  },
  {
    "word1": "perk",
    "middle": "k",
    "word2": "rep",
    "palindrome": "perk rep"
  },
  {
    "word1": "perm",
    "middle": "m",
    "word2": "rep",
    "palindrome": "perm rep"
  },
  {
    "word1": "per",
    "middle": "p",
    "word2": "prep",
    "palindrome": "per prep"
  },
  {
    "word1": "pert",
    "middle": "t",
    "word2": "rep",
    "palindrome": "pert rep"
  },
  {
    "word1": "piss",
    "middle": "s",
    "word2": "sip",
    "palindrome": "piss sip"
  },
  {
    "word1": "pita",
    "middle": "a",
    "word2": "tip",
    "palindrome": "pita tip"
  },
  {
    "word1": "pith",
    "middle": "h",
    "word2": "tip",
    "palindrome": "pith tip"
  },
  {
    "word1": "pity",
    "middle": "y",
    "word2": "tip",
    "palindrome": "pity tip"
  },
  {
    "word1": "pot",
    "middle": "a",
    "word2": "atop",
    "palindrome": "pot atop"
  },
  {
    "word1": "pot",
    "middle": "s",
    "word2": "stop",
    "palindrome": "pot stop"
  },
  {
    "word1": "push",
    "middle": "h",
    "word2": "sup",
    "palindrome": "push sup"
  },
  {
    "word1": "puss",
    "middle": "s",
    "word2": "sup",
    "palindrome": "puss sup"
  },
  {
    "word1": "rate",
    "middle": "e",
    "word2": "tar",
    "palindrome": "rate tar"
  },
  {
    "word1": "rats",
    "middle": "s",
    "word2": "tar",
    "palindrome": "rats tar"
  },
  {
    "word1": "rat",
    "middle": "s",
    "word2": "star",
    "palindrome": "rat star"
  },
  {
    "word1": "redrawn",
    "middle": "n",
    "word2": "warder",
    "palindrome": "redrawn warder"
  },
  {
    "word1": "rote",
    "middle": "e",
    "word2": "tor",
    "palindrome": "rote tor"
  },
  {
    "word1": "sawn",
    "middle": "n",
    "word2": "was",
    "palindrome": "sawn was"
  },
  {
    "word1": "spate",
    "middle": "e",
    "word2": "taps",
    "palindrome": "spate taps"
  },
  {
    "word1": "torte",
    "middle": "e",
    "word2": "trot",
    "palindrome": "torte trot"
  },
  {
    "word1": "ways",
    "middle": "s",
    "word2": "yaw",
    "palindrome": "ways yaw"
  }
];
module.exports = twoWordPalindromes;