//Word list thanks to https://gist.github.com/tomByrer/cb5c9fae362c896ecd02

const homophones = {
  ad: ["add"],
  add: ["ad"],
  ade: ["aid"],
  aid: ["ade"],
  affect: ["effect"],
  effect: ["affect"],
  ail: ["ale"],
  ale: ["ail"],
  air: ["ere", "err", "heir"],
  ere: ["air", "err", "heir"],
  err: ["air", "ere", "heir"],
  heir: ["air", "ere", "err"],
  aisle: ["I’ll", "isle"],
  "I’ll": ["aisle", "isle"],
  isle: ["aisle", "I’ll"],
  ait: ["ate", "eight"],
  ate: ["eight"],
  eight: ["ate"],
  all: ["awl"],
  awl: ["all"],
  allowed: ["aloud"],
  aloud: ["allowed"],
  ant: ["aunt"],
  aunt: ["ant"],
  ante: ["anti"],
  anti: ["ante"],
  ar: ["are", "r"],
  are: ["ar", "r"],
  r: ["ar", "are"],
  arc: ["ark"],
  ark: ["arc"],
  ascent: ["assent"],
  assent: ["ascent"],
  away: ["aweigh"],
  aweigh: ["away"],
  aye: ["eye", "I"],
  eye: ["I", "aye"],
  I: ["eye", "aye"],
  bail: ["bale"],
  bale: ["bail"],
  bait: ["bate"],
  bate: ["bait"],
  bald: ["bawled"],
  bawled: ["bald"],
  ball: ["bawl"],
  bawl: ["ball"],
  band: ["banned"],
  banned: ["band"],
  bare: ["bear"],
  bear: ["bare"],
  base: ["bass"],
  bass: ["base"],
  b: ["be", "bee"],
  be: ["bee"],
  bee: ["be"],
  beach: ["beech"],
  beech: ["beach"],
  beat: ["beet"],
  beet: ["beat"],
  beau: ["bough", "bow"],
  bough: ["beau", "bow"],
  bow: ["beau", "bough"],
  been: ["bin"],
  bin: ["been"],
  beer: ["bier"],
  bier: ["beer"],
  berth: ["birth"],
  birth: ["berth"],
  bight: ["bite", "byte"],
  bite: ["bight", "byte"],
  byte: ["bight", "bite"],
  billed: ["build"],
  build: ["billed"],
  blew: ["blue"],
  blue: ["blew"],
  bloc: ["block"],
  block: ["bloc"],
  boar: ["bore"],
  bore: ["boar"],
  board: ["bored"],
  bored: ["board"],
  boarder: ["border"],
  border: ["boarder"],
  bode: ["bowed"],
  bowed: ["bode"],
  bolder: ["boulder"],
  boulder: ["bolder"],
  born: ["borne", "bourn", "bourne"],
  borne: ["born", "bourn", "bourne"],
  bourn: ["born", "borne", "bourne"],
  bourne: ["born", "borne", "bourn"],
  boy: ["buoy"],
  buoy: ["boy"],
  brake: ["break"],
  break: ["brake"],
  bread: ["bred"],
  bred: ["bread"],
  bridal: ["bridle"],
  bridle: ["bridal"],
  broach: ["brooch"],
  brooch: ["broach"],
  brouse: ["brows"],
  brows: ["brouse"],
  but: ["butt"],
  butt: ["but"],
  buy: ["by", "bye"],
  by: ["bye", "buy"],
  bye: ["by", "buy"],
  c: ["sea", "see"],
  sea: ["cee", "see"],
  see: ["cee", "sea"],
  cache: ["cash"],
  cash: ["cache"],
  capital: ["capitol"],
  capitol: ["capital"],
  caret: ["carrot", "carat", "karat"],
  carrot: ["caret", "carat", "karat"],
  carat: ["caret", "carrot", "karat"],
  karat: ["caret", "carrot", "carat"],
  cast: ["caste"],
  caste: ["cast"],
  cay: ["key", "quay"],
  key: ["cay", "quay"],
  quay: ["cay", "key"],
  cede: ["seed"],
  seed: ["cede"],
  cee: ["sea", "see"],
  cel: ["cell", "sell"],
  cell: ["sell"],
  sell: ["cell"],
  cellar: ["seller"],
  seller: ["cellar"],
  censer: ["censor", "sensor"],
  censor: ["censer", "sensor"],
  sensor: ["censer", "censor"],
  census: ["senses"],
  senses: ["census"],
  cent: ["scent", "sent"],
  scent: ["cent", "sent"],
  sent: ["cent", "scent"],
  cents: ["sense"],
  sense: ["cents"],
  cereal: ["serial"],
  serial: ["cereal"],
  chased: ["chaste"],
  chaste: ["chased"],
  chews: ["choose"],
  choose: ["chews"],
  chili: ["chilly"],
  chilly: ["chili"],
  choral: ["coral"],
  coral: ["choral"],
  chorale: ["corral"],
  corral: ["chorale"],
  chute: ["shoot"],
  shoot: ["chute"],
  cite: ["sight", "site"],
  sight: ["cite", "site"],
  site: ["cite", "sight"],
  clause: ["claws"],
  claws: ["clause"],
  close: ["clothes"],
  clothes: ["close"],
  coarse: ["course"],
  course: ["coarse"],
  cocks: ["cox"],
  cox: ["cocks"],
  colonel: ["kernel"],
  kernel: ["colonel"],
  complement: ["compliment"],
  compliment: ["complement"],
  coo: ["coup"],
  coup: ["coo"],
  core: ["corps"],
  corps: ["core"],
  creak: ["creek"],
  creek: ["creak"],
  crews: ["cruise"],
  cruise: ["crews"],
  cue: ["queue"],
  queue: ["q"],
  cygnet: ["signet"],
  signet: ["cygnet"],
  cymbal: ["symbol"],
  symbol: ["cymbal"],
  d: ["dee"],
  dam: ["damn"],
  damn: ["dam"],
  days: ["daze"],
  daze: ["days"],
  dear: ["deer"],
  deer: ["dear"],
  defused: ["diffused"],
  diffused: ["defused"],
  dew: ["do", "due"],
  do: ["dew", "due"],
  due: ["dew", "do"],
  die: ["dye"],
  dye: ["die"],
  died: ["dyed"],
  dyed: ["died"],
  disc: ["disk"],
  disk: ["disc"],
  discreet: ["discrete"],
  discrete: ["discreet"],
  discussed: ["disgust"],
  disgust: ["discussed"],
  doe: ["dough"],
  dough: ["doe"],
  doughs: ["doze"],
  doze: ["doughs"],
  draft: ["draught"],
  draught: ["draft"],
  earn: ["urn"],
  erne: ["earn", "urn"],
  urn: ["earn"],
  em: ["m"],
  m: ["em"],
  ewe: ["yew", "you"],
  u: ["ewe", "yew", "you"],
  yew: ["ewe", "you"],
  you: ["ewe", "yew"],
  facts: ["fax"],
  fax: ["facts"],
  fain: ["feign"],
  feign: ["fain"],
  fair: ["fare"],
  fare: ["fair"],
  fairy: ["ferry"],
  ferry: ["fairy"],
  faze: ["phase"],
  phase: ["faze"],
  feat: ["feet"],
  feet: ["feat"],
  file: ["phial"],
  phial: ["file"],
  find: ["fined"],
  fined: ["find"],
  fir: ["fur"],
  fur: ["fir"],
  flair: ["flare"],
  flare: ["flair"],
  flea: ["flee"],
  flee: ["flea"],
  flew: ["flu", "flue"],
  flu: ["flew", "flue"],
  flue: ["flew", "flu"],
  flocks: ["phlox"],
  phlox: ["flocks"],
  floe: ["flow"],
  flow: ["floe"],
  flour: ["flower"],
  flower: ["flour"],
  for: ["fore", "four"],
  fore: ["for", "four"],
  four: ["for", "fore"],
  foreword: ["forward"],
  forward: ["foreword"],
  forth: ["fourth"],
  fourth: ["forth"],
  foul: ["fowl"],
  fowl: ["foul"],
  frees: ["freeze", "frieze"],
  freeze: ["frees", "frieze"],
  frieze: ["frees", "freeze"],
  friar: ["fryer"],
  fryer: ["friar"],
  g: ["gee"],
  gait: ["gate"],
  gate: ["gait"],
  gene: ["jean"],
  jean: ["gene"],
  gild: ["guild"],
  guild: ["gild"],
  gneiss: ["nice"],
  nice: ["gneiss"],
  gnu: ["knew", "new", "nu"],
  knew: ["gnu", "new", "nu"],
  new: ["gnu", "knew", "nu"],
  nu: ["gnu", "knew", "new"],
  gored: ["gourd"],
  gourd: ["gored"],
  gorilla: ["guerrilla"],
  guerrilla: ["gorilla"],
  grate: ["great"],
  great: ["grate"],
  grays: ["graze"],
  graze: ["grays"],
  grisly: ["grizzly"],
  grizzly: ["grisly"],
  groan: ["grown"],
  grown: ["groan"],
  guessed: ["guest"],
  guest: ["guessed"],
  guide: ["guyed"],
  guyed: ["guide"],
  gym: ["Jim"],
  Jim: ["gym"],
  hail: ["hale"],
  hale: ["hail"],
  hair: ["hare"],
  hare: ["hair"],
  hairy: ["Harry"],
  Harry: ["hairy"],
  hall: ["haul"],
  haul: ["hall"],
  halve: ["have"],
  have: ["halve"],
  hart: ["heart"],
  heart: ["hart"],
  hay: ["hey"],
  hey: ["hay"],
  "he'd": ["heed"],
  heed: ["he'd"],
  heal: ["heel", "he'll"],
  heel: ["heal", "he'll"],
  "he'll": ["heal", "heel"],
  hear: ["here"],
  here: ["hear"],
  heard: ["herd"],
  herd: ["heard"],
  heroin: ["heroine"],
  heroine: ["heroin"],
  hew: ["hue"],
  hue: ["hew"],
  hi: ["high"],
  high: ["hi"],
  higher: ["hire"],
  hire: ["higher"],
  him: ["hymm", "hymn"],
  hymm: ["him", "hymn"],
  hymn: ["him", "hymm"],
  hoar: ["whore"],
  whore: ["hoar"],
  hoard: ["horde"],
  horde: ["hoard"],
  hoarse: ["horse"],
  horse: ["hoarse"],
  hoes: ["hose"],
  hose: ["hoes"],
  hold: ["holed"],
  holed: ["hold"],
  hole: ["whole"],
  whole: ["hole"],
  holey: ["holy", "wholly"],
  holy: ["holey", "wholly"],
  wholly: ["holey", "holy"],
  hour: ["our"],
  our: ["hour"],
  idle: ["idol", "idyl", "idyll"],
  idol: ["idle", "idyl", "idyll"],
  idyl: ["idle", "idol", "idyll"],
  idyll: ["idle", "idol", "idyl"],
  ileum: ["ilium"],
  ilium: ["ileum"],
  in: ["inn"],
  inn: ["in"],
  incite: ["insight"],
  insight: ["incite"],
  its: ["it's", "it’s"],
  "it's": ["its", "it’s"],
  "it’s": ["its", "it's"],
  jam: ["jamb"],
  jamb: ["jam"],
  jeans: ["genes"],
  genes: ["jeans"],
  jewel: ["joule"],
  joule: ["jewel"],
  knap: ["nap"],
  nap: ["knap"],
  knead: ["kneed", "need"],
  kneed: ["knead", "need"],
  need: ["knead", "kneed"],
  knight: ["night"],
  night: ["knight"],
  knit: ["nit"],
  nit: ["knit"],
  knot: ["naught", "not"],
  naught: ["knot", "not"],
  not: ["knot", "naught"],
  know: ["no"],
  no: ["know"],
  knows: ["nose", "noes", "no's"],
  nose: ["knows", "noes", "no's"],
  noes: ["knows", "nose", "no's"],
  "no's": ["knows", "nose", "noes"],
  lay: ["lei"],
  lei: ["lay"],
  lays: ["laze", "leas", "leis"],
  laze: ["lays", "leas", "leis"],
  leas: ["lays", "laze", "leis"],
  leis: ["lays", "laze", "leas"],
  leach: ["leech"],
  leech: ["leach"],
  lead: ["led"],
  led: ["lead"],
  leak: ["leek"],
  leek: ["leak"],
  lean: ["lien"],
  lien: ["lean"],
  leased: ["least"],
  least: ["leased"],
  lends: ["lens"],
  lens: ["lends"],
  lessen: ["lesson"],
  lesson: ["lessen"],
  liable: ["libel"],
  libel: ["liable"],
  liar: ["lyre"],
  lyre: ["liar"],
  lie: ["lye"],
  lye: ["lie"],
  links: ["lynx"],
  lynx: ["links"],
  load: ["lode", "lowed"],
  lode: ["load", "lowed"],
  lowed: ["load", "lode"],
  loan: ["lone"],
  lone: ["loan"],
  lochs: ["locks", "lox"],
  locks: ["lochs", "lox"],
  lox: ["lochs", "locks"],
  loot: ["lute"],
  lute: ["loot"],
  made: ["maid"],
  maid: ["made"],
  mail: ["male"],
  male: ["mail"],
  main: ["mane"],
  mane: ["main"],
  maize: ["maze"],
  maze: ["maize"],
  mall: ["maul"],
  maul: ["mall"],
  manner: ["manor"],
  manor: ["manner"],
  marshal: ["marshall", "martial"],
  marshall: ["marshal", "martial"],
  martial: ["marshal", "marshall"],
  massed: ["mast"],
  mast: ["massed"],
  mean: ["mien"],
  mien: ["mean"],
  meat: ["meet", "mete"],
  meet: ["meat", "mete"],
  mete: ["meat", "meet"],
  medal: ["meddle"],
  meddle: ["medal"],
  might: ["mite"],
  mite: ["might"],
  mince: ["mints"],
  mints: ["mince"],
  mind: ["mined"],
  mined: ["mind"],
  miner: ["minor"],
  minor: ["miner"],
  missed: ["mist"],
  mist: ["missed"],
  moan: ["mown"],
  mown: ["moan"],
  moat: ["mote"],
  mote: ["moat"],
  mode: ["mowed"],
  mowed: ["mode"],
  moo: ["moue"],
  moue: ["moo"],
  mooed: ["mood"],
  mood: ["mooed"],
  moor: ["more"],
  more: ["moor"],
  moose: ["mousse"],
  mousse: ["moose"],
  morning: ["mourning"],
  mourning: ["morning"],
  muscle: ["mussel"],
  mussel: ["muscle"],
  mussed: ["must"],
  must: ["mussed"],
  mustard: ["mustered"],
  mustered: ["mustard"],
  navel: ["naval"],
  naval: ["navel"],
  nay: ["nee", "neigh"],
  nee: ["nay", "neigh"],
  neigh: ["nay", "nee"],
  nays: ["neighs"],
  neighs: ["nays"],
  none: ["nun"],
  nun: ["none"],
  o: ["oh", "owe"],
  oh: ["owe"],
  owe: ["o", "oh"],
  oar: ["or", "ore"],
  or: ["oar", "ore"],
  ore: ["oar", "or"],
  one: ["won"],
  won: ["one"],
  overdo: ["overdue"],
  overdue: ["overdo"],
  p: ["pea", "pee"],
  pea: ["p", "pee"],
  pee: ["p", "pea"],
  paced: ["paste"],
  paste: ["paced"],
  pail: ["pale"],
  pale: ["pail"],
  pain: ["pane"],
  pane: ["pain"],
  pair: ["pare", "pear"],
  pare: ["pair", "pear"],
  pear: ["pair", "pare"],
  palate: ["palette"],
  palette: ["palate"],
  pall: ["pawl"],
  pawl: ["pall"],
  passed: ["past"],
  past: ["passed"],
  patience: ["patients"],
  patients: ["patience"],
  pause: ["paws"],
  paws: ["pause"],
  peace: ["piece"],
  piece: ["peace"],
  peak: ["peek", "pique"],
  peek: ["peak", "pique"],
  pique: ["peak", "peek"],
  peal: ["peel"],
  peel: ["peal"],
  pearl: ["perl"],
  perl: ["pearl"],
  pedal: ["peddle"],
  peddle: ["pedal"],
  peer: ["pier"],
  pier: ["peer"],
  pi: ["pie"],
  pie: ["pi"],
  picks: ["pyx"],
  pyx: ["picks"],
  pidgin: ["pigeon"],
  pigeon: ["pidgin"],
  pistil: ["pistol"],
  pistol: ["pistil"],
  plain: ["plane"],
  plane: ["plain"],
  pleas: ["please"],
  please: ["pleas"],
  plum: ["plumb"],
  plumb: ["plum"],
  pole: ["poll"],
  poll: ["pole"],
  poor: ["pore", "pour"],
  pore: ["poor", "pour"],
  pour: ["poor", "pore"],
  praise: ["prays", "preys"],
  prays: ["praise", "preys"],
  preys: ["praise", "prays"],
  pray: ["prey"],
  prey: ["pray"],
  presence: ["presents"],
  presents: ["presence"],
  pride: ["pryed"],
  pryed: ["pride"],
  prince: ["prints"],
  prints: ["prince"],
  principal: ["principle"],
  principle: ["principal"],
  profit: ["prophet"],
  prophet: ["profit"],
  pros: ["prose"],
  prose: ["pros"],
  psalter: ["salter"],
  salter: ["psalter"],
  psi: ["si", "sigh"],
  si: ["psi", "sigh"],
  sigh: ["psi", "si"],
  q: ["queue"],
  quarts: ["quartz"],
  quartz: ["quarts"],
  quean: ["queen"],
  queen: ["quean"],
  quince: ["quints"],
  quints: ["quince"],
  rack: ["wrack"],
  wrack: ["rack"],
  racket: ["racquet"],
  racquet: ["racket"],
  rain: ["reign", "rein"],
  reign: ["rain", "rein"],
  rein: ["rain", "reign"],
  raise: ["rays", "raze"],
  rays: ["raise", "raze"],
  raze: ["raise", "rays"],
  rap: ["wrap"],
  wrap: ["rap"],
  rapt: ["wrapped"],
  wrapped: ["rapt"],
  read: ["reed"],
  red: ["read"],
  reed: ["read"],
  real: ["reel"],
  reel: ["real"],
  recede: ["reseed"],
  reseed: ["recede"],
  reek: ["wreak"],
  wreak: ["reek"],
  rest: ["wrest"],
  wrest: ["rest"],
  retch: ["wretch"],
  wretch: ["retch"],
  review: ["revue"],
  revue: ["review"],
  rho: ["roe", "row"],
  roe: ["rho", "row"],
  row: ["rho", "roe"],
  rhyme: ["rime"],
  rime: ["rhyme"],
  right: ["rite", "wright", "write"],
  rite: ["right", "wright", "write"],
  wright: ["right", "rite", "write"],
  write: ["right", "rite", "wright"],
  ring: ["wring"],
  wring: ["ring"],
  road: ["rode", "rowed"],
  rode: ["road", "rowed"],
  rowed: ["road", "rode"],
  roam: ["Rome"],
  Rome: ["roam"],
  role: ["roll"],
  roll: ["role"],
  root: ["route"],
  route: ["rout"],
  rose: ["rows"],
  rows: ["rose"],
  rote: ["wrote"],
  wrote: ["rote"],
  rough: ["ruff"],
  ruff: ["rough"],
  rout: ["route"],
  roux: ["rue"],
  rue: ["roux"],
  rye: ["wry"],
  wry: ["rye"],
  sachet: ["sashay"],
  sashay: ["sachet"],
  sacks: ["sax"],
  sax: ["sacks"],
  sail: ["sale"],
  sale: ["sail"],
  sawed: ["sod"],
  sod: ["sawed"],
  scene: ["seen"],
  seen: ["scene"],
  seam: ["seem"],
  seem: ["seam"],
  seamen: ["semen"],
  semen: ["seamen"],
  sear: ["seer"],
  seer: ["sear"],
  seas: ["sees", "seize"],
  sees: ["seas", "seize"],
  seize: ["seas", "sees"],
  serf: ["surf"],
  surf: ["serf"],
  serge: ["surge"],
  surge: ["serge"],
  sew: ["so", "sow"],
  so: ["sew", "sow"],
  sow: ["sew", "so"],
  shake: ["sheik"],
  sheik: ["shake"],
  shear: ["sheer"],
  sheer: ["shear"],
  shoe: ["shoo"],
  shoo: ["shoe"],
  shore: ["sure"],
  sure: ["shore"],
  sic: ["sick"],
  sick: ["sic"],
  side: ["sighed"],
  sighed: ["side"],
  sighs: ["size"],
  size: ["sighs"],
  sign: ["sine"],
  sine: ["sign"],
  slay: ["sleigh"],
  sleigh: ["slay"],
  sleight: ["slight"],
  slight: ["sleight"],
  slew: ["slue"],
  slue: ["slew"],
  sloe: ["slow"],
  slow: ["sloe"],
  soar: ["sore"],
  sore: ["soar"],
  soared: ["sword"],
  sword: ["soared"],
  sole: ["soul"],
  soul: ["sole"],
  some: ["sum"],
  sum: ["some"],
  son: ["sun"],
  sun: ["son"],
  sonny: ["sunny"],
  sunny: ["sonny"],
  soot: ["suit"],
  suit: ["soot"],
  spade: ["spayed"],
  spayed: ["spade"],
  staid: ["stayed"],
  stayed: ["staid"],
  stair: ["stare"],
  stare: ["stair"],
  stake: ["steak"],
  steak: ["stake"],
  stationary: ["stationery"],
  stationery: ["stationary"],
  steal: ["steel"],
  steel: ["steal"],
  straight: ["strait"],
  strait: ["straight"],
  suede: ["swayed"],
  swayed: ["suede"],
  suite: ["sweet"],
  sweet: ["suite"],
  summary: ["summery"],
  summery: ["summary"],
  sundae: ["Sunday"],
  Sunday: ["sundae"],
  t: ["tea", "tee"],
  tea: ["t", "tee"],
  tee: ["t", "tea"],
  tacks: ["tax"],
  tax: ["tacks"],
  tail: ["tale"],
  tale: ["tail"],
  tare: ["tear"],
  tear: ["tier"],
  taught: ["taut"],
  taut: ["taught"],
  team: ["teem"],
  teem: ["team"],
  tier: ["tear"],
  teas: ["tease", "tees"],
  tease: ["tees"],
  tees: ["tease"],
  tense: ["tents"],
  tents: ["tense"],
  tern: ["turn"],
  turn: ["tern"],
  their: ["there", "they're", "they’re"],
  there: ["their", "they're", "they’re"],
  "they're": ["their", "there", "they’re"],
  "they’re": ["their", "there", "they're"],
  threw: ["through"],
  through: ["threw"],
  throne: ["thrown"],
  thrown: ["throne"],
  thyme: ["time"],
  time: ["thyme"],
  tic: ["tick"],
  tick: ["tic"],
  tide: ["tied"],
  tied: ["tide"],
  tighten: ["titan"],
  titan: ["tighten"],
  to: ["too", "two"],
  too: ["to", "two"],
  two: ["to", "too"],
  toad: ["toed", "towed"],
  toed: ["toad", "towed"],
  towed: ["toad", "toed"],
  toe: ["tow"],
  tow: ["toe"],
  told: ["tolled"],
  tolled: ["told"],
  toon: ["tune"],
  tune: ["toon"],
  tough: ["tuff"],
  tuff: ["tough"],
  tracked: ["tract"],
  tract: ["tracked"],
  troop: ["troupe"],
  troupe: ["troop"],
  trussed: ["trust"],
  trust: ["trussed"],
  use: ["ewes"],
  ewes: ["use"],
  vail: ["vale", "veil"],
  vale: ["vail", "veil"],
  veil: ["vail", "vale"],
  vain: ["vane", "vein"],
  vane: ["vain", "vein"],
  vein: ["vain", "vane"],
  vary: ["very"],
  very: ["vary"],
  verses: ["versus"],
  versus: ["verses"],
  vial: ["vile"],
  vile: ["vial"],
  vice: ["vise"],
  vise: ["vice"],
  wade: ["weighed"],
  weighed: ["wade"],
  wail: ["whale"],
  whale: ["wail"],
  waist: ["waste"],
  waste: ["waist"],
  wait: ["weight"],
  weight: ["wait"],
  waive: ["wave"],
  wave: ["waive"],
  walk: ["wok"],
  wok: ["walk"],
  want: ["wont"],
  wont: ["want"],
  war: ["wore"],
  wore: ["war"],
  ware: ["wear", "where"],
  wear: ["ware", "where"],
  where: ["ware", "wear"],
  warn: ["worn"],
  worn: ["warn"],
  wax: ["whacks"],
  whacks: ["wax"],
  way: ["weigh", "whey"],
  weigh: ["way", "whey"],
  whey: ["way", "weigh"],
  we: ["wee"],
  wee: ["we"],
  "we'd": ["weed"],
  weed: ["we’d"],
  "we'll": ["wheel"],
  wheel: ["we'll"],
  "we're": ["were"],
  were: ["we're"],
  "we've": ["weave"],
  weave: ["we've"],
  weak: ["week"],
  week: ["weak"],
  weather: ["whether"],
  whether: ["weather"],
  weir: ["we’re"],
  "we’re": ["weir"],
  weld: ["welled"],
  welled: ["weld"],
  wen: ["when"],
  when: ["wen"],
  "we’d": ["weed"],
  which: ["witch"],
  witch: ["which"],
  whine: ["wine"],
  wine: ["whine"],
  whirled: ["world"],
  world: ["whirled"],
  whirred: ["word"],
  word: ["whirred"],
  "who's": ["whose"],
  whose: ["who's"],
  whoa: ["woe"],
  woe: ["whoa"],
  why: ["wye", "y"],
  wye: ["why", "y"],
  y: ["why", "wye"],
  wind: ["wined"],
  wined: ["wind"],
  wood: ["would"],
  would: ["wood"],
  worst: ["wurst"],
  wurst: ["worst"],
  yoke: ["yolk"],
  yolk: ["yoke"],
  yore: ["your", "you're"],
  your: ["you're", "yore"],
  "you’re": ["yore", "your"],
  "you'll": ["yule"],
  yule: ["you'll"],
  "you're": ["your", "yore"],
  Sioux: ["sue"],
  sue: ["Sioux"],
  Wales: ["whales"],
  whales: ["Wales"],
  "": [],
};

export const wrapHomophones = (sentence) => {
  // let placeholders = [];
  // let tempSentence = sentence.replace(/<span[^>]*>(.*?)<\/span>/g, (match) => {
  //   placeholders.push(match);
  //   return `PLACEHOLDER${placeholders.length - 1}`;
  // });

  //const words = tempSentence.split(/\b/); // Splitting by word boundary
  const words = sentence.split(/\b/); // Splitting by word boundary

  const wrapped = words.map((word) => {
    if (homophones[word]) {
      const alternatives = [word, ...homophones[word]];
      return `<span id="Phonia (Homophones)" data-homophones="${alternatives.join(
        ","
      )}" class="word-0">${word}</span>`;
    }
    return word;
  });

  return wrapped.join("");
};

// const sentence = "I’ll go to the aisle and buy some ale.";
// const sentence = '<span id="Ambigrambador">ad</span> add ade';

// const sentence2 = "Let's see if I know what I'm doing";
// const wrappedSentence = wrapHomophones(sentence, homophones);
// console.log(wrappedSentence);
