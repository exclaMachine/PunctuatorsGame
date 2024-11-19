const twoWordPalindromes = [
  {
    "word1": "abut",
    "middle": null,
    "word2": "tuba",
    "palindrome": "abut tuba"
  },
  {
    "word1": "agar",
    "middle": null,
    "word2": "raga",
    "palindrome": "agar raga"
  },
  {
    "word1": "ah",
    "middle": null,
    "word2": "ha",
    "palindrome": "ah ha"
  },
  {
    "word1": "ah",
    "middle": "a",
    "word2": "aha",
    "palindrome": "ah aha"
  },
  {
    "word1": "ajar",
    "middle": null,
    "word2": "raja",
    "palindrome": "ajar raja"
  },
  {
    "word1": "am",
    "middle": null,
    "word2": "ma",
    "palindrome": "am ma"
  },
  {
    "word1": "animal",
    "middle": null,
    "word2": "lamina",
    "palindrome": "animal lamina"
  },
  {
    "word1": "are",
    "middle": null,
    "word2": "era",
    "palindrome": "are era"
  },
  {
    "word1": "are",
    "middle": "s",
    "word2": "sera",
    "palindrome": "are sera"
  },
  {
    "word1": "ate",
    "middle": null,
    "word2": "eta",
    "palindrome": "ate eta"
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
    "word1": "avid",
    "middle": null,
    "word2": "diva",
    "palindrome": "avid diva"
  },
  {
    "word1": "bad",
    "middle": null,
    "word2": "dab",
    "palindrome": "bad dab"
  },
  {
    "word1": "bag",
    "middle": null,
    "word2": "gab",
    "palindrome": "bag gab"
  },
  {
    "word1": "ban",
    "middle": null,
    "word2": "nab",
    "palindrome": "ban nab"
  },
  {
    "word1": "bard",
    "middle": null,
    "word2": "drab",
    "palindrome": "bard drab"
  },
  {
    "word1": "bat",
    "middle": null,
    "word2": "tab",
    "palindrome": "bat tab"
  },
  {
    "word1": "bat",
    "middle": "s",
    "word2": "stab",
    "palindrome": "bat stab"
  },
  {
    "word1": "bats",
    "middle": null,
    "word2": "stab",
    "palindrome": "bats stab"
  },
  {
    "word1": "bed",
    "middle": null,
    "word2": "deb",
    "palindrome": "bed deb"
  },
  {
    "word1": "bin",
    "middle": null,
    "word2": "nib",
    "palindrome": "bin nib"
  },
  {
    "word1": "bog",
    "middle": null,
    "word2": "gob",
    "palindrome": "bog gob"
  },
  {
    "word1": "brag",
    "middle": null,
    "word2": "garb",
    "palindrome": "brag garb"
  },
  {
    "word1": "bro",
    "middle": null,
    "word2": "orb",
    "palindrome": "bro orb"
  },
  {
    "word1": "bud",
    "middle": null,
    "word2": "dub",
    "palindrome": "bud dub"
  },
  {
    "word1": "bun",
    "middle": null,
    "word2": "nub",
    "palindrome": "bun nub"
  },
  {
    "word1": "bun",
    "middle": "s",
    "word2": "snub",
    "palindrome": "bun snub"
  },
  {
    "word1": "buns",
    "middle": null,
    "word2": "snub",
    "palindrome": "buns snub"
  },
  {
    "word1": "bur",
    "middle": null,
    "word2": "rub",
    "palindrome": "bur rub"
  },
  {
    "word1": "bur",
    "middle": "d",
    "word2": "drub",
    "palindrome": "bur drub"
  },
  {
    "word1": "bur",
    "middle": "g",
    "word2": "grub",
    "palindrome": "bur grub"
  },
  {
    "word1": "burg",
    "middle": null,
    "word2": "grub",
    "palindrome": "burg grub"
  },
  {
    "word1": "bus",
    "middle": null,
    "word2": "sub",
    "palindrome": "bus sub"
  },
  {
    "word1": "but",
    "middle": null,
    "word2": "tub",
    "palindrome": "but tub"
  },
  {
    "word1": "but",
    "middle": "s",
    "word2": "stub",
    "palindrome": "but stub"
  },
  {
    "word1": "cod",
    "middle": null,
    "word2": "doc",
    "palindrome": "cod doc"
  },
  {
    "word1": "dam",
    "middle": null,
    "word2": "mad",
    "palindrome": "dam mad"
  },
  {
    "word1": "debut",
    "middle": null,
    "word2": "tubed",
    "palindrome": "debut tubed"
  },
  {
    "word1": "deem",
    "middle": null,
    "word2": "meed",
    "palindrome": "deem meed"
  },
  {
    "word1": "deer",
    "middle": null,
    "word2": "reed",
    "palindrome": "deer reed"
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
    "word1": "def",
    "middle": null,
    "word2": "fed",
    "palindrome": "def fed"
  },
  {
    "word1": "dew",
    "middle": null,
    "word2": "wed",
    "palindrome": "dew wed"
  },
  {
    "word1": "dew",
    "middle": "a",
    "word2": "awed",
    "palindrome": "dew awed"
  },
  {
    "word1": "dial",
    "middle": null,
    "word2": "laid",
    "palindrome": "dial laid"
  },
  {
    "word1": "dial",
    "middle": "p",
    "word2": "plaid",
    "palindrome": "dial plaid"
  },
  {
    "word1": "diaper",
    "middle": null,
    "word2": "repaid",
    "palindrome": "diaper repaid"
  },
  {
    "word1": "diaper",
    "middle": "p",
    "word2": "prepaid",
    "palindrome": "diaper prepaid"
  },
  {
    "word1": "dim",
    "middle": null,
    "word2": "mid",
    "palindrome": "dim mid"
  },
  {
    "word1": "dim",
    "middle": "a",
    "word2": "amid",
    "palindrome": "dim amid"
  },
  {
    "word1": "dog",
    "middle": null,
    "word2": "god",
    "palindrome": "dog god"
  },
  {
    "word1": "don",
    "middle": null,
    "word2": "nod",
    "palindrome": "don nod"
  },
  {
    "word1": "doom",
    "middle": null,
    "word2": "mood",
    "palindrome": "doom mood"
  },
  {
    "word1": "door",
    "middle": null,
    "word2": "rood",
    "palindrome": "door rood"
  },
  {
    "word1": "door",
    "middle": "b",
    "word2": "brood",
    "palindrome": "door brood"
  },
  {
    "word1": "draw",
    "middle": null,
    "word2": "ward",
    "palindrome": "draw ward"
  },
  {
    "word1": "draw",
    "middle": "a",
    "word2": "award",
    "palindrome": "draw award"
  },
  {
    "word1": "draw",
    "middle": "s",
    "word2": "sward",
    "palindrome": "draw sward"
  },
  {
    "word1": "drawer",
    "middle": null,
    "word2": "reward",
    "palindrome": "drawer reward"
  },
  {
    "word1": "dray",
    "middle": null,
    "word2": "yard",
    "palindrome": "dray yard"
  },
  {
    "word1": "dual",
    "middle": null,
    "word2": "laud",
    "palindrome": "dual laud"
  },
  {
    "word1": "edit",
    "middle": null,
    "word2": "tide",
    "palindrome": "edit tide"
  },
  {
    "word1": "eel",
    "middle": null,
    "word2": "lee",
    "palindrome": "eel lee"
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
    "middle": null,
    "word2": "he",
    "palindrome": "eh he"
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
    "word1": "em",
    "middle": null,
    "word2": "me",
    "palindrome": "em me"
  },
  {
    "word1": "emir",
    "middle": null,
    "word2": "rime",
    "palindrome": "emir rime"
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
    "word1": "emit",
    "middle": null,
    "word2": "time",
    "palindrome": "emit time"
  },
  {
    "word1": "ergo",
    "middle": null,
    "word2": "ogre",
    "palindrome": "ergo ogre"
  },
  {
    "word1": "evil",
    "middle": null,
    "word2": "live",
    "palindrome": "evil live"
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
    "word1": "flog",
    "middle": null,
    "word2": "golf",
    "palindrome": "flog golf"
  },
  {
    "word1": "flow",
    "middle": null,
    "word2": "wolf",
    "palindrome": "flow wolf"
  },
  {
    "word1": "gal",
    "middle": null,
    "word2": "lag",
    "palindrome": "gal lag"
  },
  {
    "word1": "gal",
    "middle": "f",
    "word2": "flag",
    "palindrome": "gal flag"
  },
  {
    "word1": "gal",
    "middle": "s",
    "word2": "slag",
    "palindrome": "gal slag"
  },
  {
    "word1": "gar",
    "middle": null,
    "word2": "rag",
    "palindrome": "gar rag"
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
    "word1": "gas",
    "middle": null,
    "word2": "sag",
    "palindrome": "gas sag"
  },
  {
    "word1": "gel",
    "middle": null,
    "word2": "leg",
    "palindrome": "gel leg"
  },
  {
    "word1": "girt",
    "middle": null,
    "word2": "trig",
    "palindrome": "girt trig"
  },
  {
    "word1": "gnat",
    "middle": null,
    "word2": "tang",
    "palindrome": "gnat tang"
  },
  {
    "word1": "got",
    "middle": null,
    "word2": "tog",
    "palindrome": "got tog"
  },
  {
    "word1": "gulp",
    "middle": null,
    "word2": "plug",
    "palindrome": "gulp plug"
  },
  {
    "word1": "gum",
    "middle": null,
    "word2": "mug",
    "palindrome": "gum mug"
  },
  {
    "word1": "gum",
    "middle": "s",
    "word2": "smug",
    "palindrome": "gum smug"
  },
  {
    "word1": "gums",
    "middle": null,
    "word2": "smug",
    "palindrome": "gums smug"
  },
  {
    "word1": "gut",
    "middle": null,
    "word2": "tug",
    "palindrome": "gut tug"
  },
  {
    "word1": "ho",
    "middle": null,
    "word2": "oh",
    "palindrome": "ho oh"
  },
  {
    "word1": "ho",
    "middle": "o",
    "word2": "ooh",
    "palindrome": "ho ooh"
  },
  {
    "word1": "hoop",
    "middle": null,
    "word2": "pooh",
    "palindrome": "hoop pooh"
  },
  {
    "word1": "it",
    "middle": null,
    "word2": "ti",
    "palindrome": "it ti"
  },
  {
    "word1": "keel",
    "middle": null,
    "word2": "leek",
    "palindrome": "keel leek"
  },
  {
    "word1": "keel",
    "middle": "s",
    "word2": "sleek",
    "palindrome": "keel sleek"
  },
  {
    "word1": "keep",
    "middle": null,
    "word2": "peek",
    "palindrome": "keep peek"
  },
  {
    "word1": "know",
    "middle": null,
    "word2": "wonk",
    "palindrome": "know wonk"
  },
  {
    "word1": "lager",
    "middle": null,
    "word2": "regal",
    "palindrome": "lager regal"
  },
  {
    "word1": "lap",
    "middle": null,
    "word2": "pal",
    "palindrome": "lap pal"
  },
  {
    "word1": "lap",
    "middle": "o",
    "word2": "opal",
    "palindrome": "lap opal"
  },
  {
    "word1": "leer",
    "middle": null,
    "word2": "reel",
    "palindrome": "leer reel"
  },
  {
    "word1": "leer",
    "middle": "c",
    "word2": "creel",
    "palindrome": "leer creel"
  },
  {
    "word1": "leper",
    "middle": null,
    "word2": "repel",
    "palindrome": "leper repel"
  },
  {
    "word1": "lever",
    "middle": null,
    "word2": "revel",
    "palindrome": "lever revel"
  },
  {
    "word1": "liar",
    "middle": null,
    "word2": "rail",
    "palindrome": "liar rail"
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
    "middle": null,
    "word2": "pool",
    "palindrome": "loop pool"
  },
  {
    "word1": "loop",
    "middle": "s",
    "word2": "spool",
    "palindrome": "loop spool"
  },
  {
    "word1": "loot",
    "middle": null,
    "word2": "tool",
    "palindrome": "loot tool"
  },
  {
    "word1": "loot",
    "middle": "s",
    "word2": "stool",
    "palindrome": "loot stool"
  },
  {
    "word1": "looter",
    "middle": null,
    "word2": "retool",
    "palindrome": "looter retool"
  },
  {
    "word1": "lop",
    "middle": null,
    "word2": "pol",
    "palindrome": "lop pol"
  },
  {
    "word1": "mar",
    "middle": null,
    "word2": "ram",
    "palindrome": "mar ram"
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
    "word1": "mar",
    "middle": "g",
    "word2": "gram",
    "palindrome": "mar gram"
  },
  {
    "word1": "mar",
    "middle": "t",
    "word2": "tram",
    "palindrome": "mar tram"
  },
  {
    "word1": "mart",
    "middle": null,
    "word2": "tram",
    "palindrome": "mart tram"
  },
  {
    "word1": "mat",
    "middle": null,
    "word2": "tam",
    "palindrome": "mat tam"
  },
  {
    "word1": "may",
    "middle": null,
    "word2": "yam",
    "palindrome": "may yam"
  },
  {
    "word1": "meet",
    "middle": null,
    "word2": "teem",
    "palindrome": "meet teem"
  },
  {
    "word1": "moor",
    "middle": null,
    "word2": "room",
    "palindrome": "moor room"
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
    "middle": null,
    "word2": "tom",
    "palindrome": "mot tom"
  },
  {
    "word1": "mot",
    "middle": "a",
    "word2": "atom",
    "palindrome": "mot atom"
  },
  {
    "word1": "mu",
    "middle": null,
    "word2": "um",
    "palindrome": "mu um"
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
    "word1": "nap",
    "middle": null,
    "word2": "pan",
    "palindrome": "nap pan"
  },
  {
    "word1": "nap",
    "middle": "s",
    "word2": "span",
    "palindrome": "nap span"
  },
  {
    "word1": "net",
    "middle": null,
    "word2": "ten",
    "palindrome": "net ten"
  },
  {
    "word1": "new",
    "middle": null,
    "word2": "wen",
    "palindrome": "new wen"
  },
  {
    "word1": "nip",
    "middle": null,
    "word2": "pin",
    "palindrome": "nip pin"
  },
  {
    "word1": "nip",
    "middle": "s",
    "word2": "spin",
    "palindrome": "nip spin"
  },
  {
    "word1": "nit",
    "middle": null,
    "word2": "tin",
    "palindrome": "nit tin"
  },
  {
    "word1": "no",
    "middle": null,
    "word2": "on",
    "palindrome": "no on"
  },
  {
    "word1": "no",
    "middle": "c",
    "word2": "con",
    "palindrome": "no con"
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
    "word1": "no",
    "middle": "s",
    "word2": "son",
    "palindrome": "no son"
  },
  {
    "word1": "no",
    "middle": "t",
    "word2": "ton",
    "palindrome": "no ton"
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
    "word1": "not",
    "middle": null,
    "word2": "ton",
    "palindrome": "not ton"
  },
  {
    "word1": "now",
    "middle": null,
    "word2": "won",
    "palindrome": "now won"
  },
  {
    "word1": "nut",
    "middle": null,
    "word2": "tun",
    "palindrome": "nut tun"
  },
  {
    "word1": "nut",
    "middle": "s",
    "word2": "stun",
    "palindrome": "nut stun"
  },
  {
    "word1": "nuts",
    "middle": null,
    "word2": "stun",
    "palindrome": "nuts stun"
  },
  {
    "word1": "pacer",
    "middle": null,
    "word2": "recap",
    "palindrome": "pacer recap"
  },
  {
    "word1": "par",
    "middle": null,
    "word2": "rap",
    "palindrome": "par rap"
  },
  {
    "word1": "par",
    "middle": "c",
    "word2": "crap",
    "palindrome": "par crap"
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
    "middle": null,
    "word2": "trap",
    "palindrome": "part trap"
  },
  {
    "word1": "part",
    "middle": "s",
    "word2": "strap",
    "palindrome": "part strap"
  },
  {
    "word1": "pat",
    "middle": null,
    "word2": "tap",
    "palindrome": "pat tap"
  },
  {
    "word1": "pay",
    "middle": null,
    "word2": "yap",
    "palindrome": "pay yap"
  },
  {
    "word1": "per",
    "middle": null,
    "word2": "rep",
    "palindrome": "per rep"
  },
  {
    "word1": "per",
    "middle": "p",
    "word2": "prep",
    "palindrome": "per prep"
  },
  {
    "word1": "pis",
    "middle": null,
    "word2": "sip",
    "palindrome": "pis sip"
  },
  {
    "word1": "pit",
    "middle": null,
    "word2": "tip",
    "palindrome": "pit tip"
  },
  {
    "word1": "pot",
    "middle": null,
    "word2": "top",
    "palindrome": "pot top"
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
    "word1": "pus",
    "middle": null,
    "word2": "sup",
    "palindrome": "pus sup"
  },
  {
    "word1": "rat",
    "middle": null,
    "word2": "tar",
    "palindrome": "rat tar"
  },
  {
    "word1": "rat",
    "middle": "s",
    "word2": "star",
    "palindrome": "rat star"
  },
  {
    "word1": "rats",
    "middle": null,
    "word2": "star",
    "palindrome": "rats star"
  },
  {
    "word1": "raw",
    "middle": null,
    "word2": "war",
    "palindrome": "raw war"
  },
  {
    "word1": "rebut",
    "middle": null,
    "word2": "tuber",
    "palindrome": "rebut tuber"
  },
  {
    "word1": "redraw",
    "middle": null,
    "word2": "warder",
    "palindrome": "redraw warder"
  },
  {
    "word1": "remit",
    "middle": null,
    "word2": "timer",
    "palindrome": "remit timer"
  },
  {
    "word1": "rot",
    "middle": null,
    "word2": "tor",
    "palindrome": "rot tor"
  },
  {
    "word1": "saw",
    "middle": null,
    "word2": "was",
    "palindrome": "saw was"
  },
  {
    "word1": "spat",
    "middle": null,
    "word2": "taps",
    "palindrome": "spat taps"
  },
  {
    "word1": "spot",
    "middle": null,
    "word2": "tops",
    "palindrome": "spot tops"
  },
  {
    "word1": "sway",
    "middle": null,
    "word2": "yaws",
    "palindrome": "sway yaws"
  },
  {
    "word1": "tort",
    "middle": null,
    "word2": "trot",
    "palindrome": "tort trot"
  },
  {
    "word1": "trow",
    "middle": null,
    "word2": "wort",
    "palindrome": "trow wort"
  },
  {
    "word1": "way",
    "middle": null,
    "word2": "yaw",
    "palindrome": "way yaw"
  }
];
module.exports = twoWordPalindromes;