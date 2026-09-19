export const GAME = Object.freeze({
  version: 4,
  dayLengthMs: 120_000,
  goalCoins: 3,
  storageKey: "little-valley-physical-board-v4",
});

const art = (filename) => `./assets/${filename}`;

export const CARD_DEFS = Object.freeze({
  farmer: {
    name: "Farmer",
    kind: "Person",
    description: "Does the work. One task at a time.",
    art: art("farmer.png"),
    artShape: "square",
  },
  wild_soil: {
    name: "Wild Soil",
    kind: "Land",
    description: "Grass and stones cover workable earth.",
    art: art("wild-soil.png"),
  },
  empty_plot: {
    name: "Empty Plot",
    kind: "Land",
    description: "Cleared soil waiting for seed.",
    art: art("empty-plot.png"),
  },
  planted_carrots: {
    name: "Carrot Plot",
    kind: "Crop",
    description: "Planted, but still thirsty.",
    art: art("young-carrots.png"),
  },
  watered_carrots: {
    name: "Carrot Plot",
    kind: "Crop",
    description: "Watered. Growing with time.",
    art: art("young-carrots.png"),
    badge: "Growing",
  },
  ready_carrots: {
    name: "Mature Carrots",
    kind: "Crop",
    description: "Ready to pull from the soil.",
    art: art("harvest.png"),
    badge: "Ready",
  },
  carrot_seeds: {
    name: "Carrot Seeds",
    kind: "Item",
    description: "Give to a Person, then carry to an Empty Plot.",
    art: art("carrot-seeds.png"),
    artShape: "square",
  },
  well: {
    name: "Stone Well",
    kind: "Place",
    description: "A worker can draw Water here.",
    art: art("well.png"),
  },
  water: {
    name: "Water",
    kind: "Resource",
    description: "Carry it to a thirsty crop.",
    art: art("water.png"),
  },
  carrots: {
    name: "Carrots",
    kind: "Produce",
    description: "Fresh produce for the market.",
    art: art("carrots.png"),
    artShape: "square",
  },
  roadside_market: {
    name: "Roadside Market",
    kind: "Place",
    description: "Bring produce here to sell it.",
    art: art("roadside-market.png"),
  },
  coin_purse: {
    name: "Coin Purse",
    kind: "Resource",
    description: "The farm's earnings.",
    art: art("coin-purse.png"),
    artShape: "square",
  },
});
