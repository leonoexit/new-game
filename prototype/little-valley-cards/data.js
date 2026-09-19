export const GAME = Object.freeze({
  version: 12,
  goalCoins: 6,
  cropGrowthDays: 1,
  seedBundleCost: 2,
  seedBundleAmount: 2,
  wateringCanCapacity: 2,
  storageKey: "little-valley-physical-board-v12",
});

export const AREAS = Object.freeze([
  Object.freeze({ id: "farm", name: "Home Farm", landmarkId: "farm-landmark" }),
  Object.freeze({ id: "town", name: "Valley Town", landmarkId: "town-landmark" }),
]);

const art = (filename) => `./assets/${filename}`;

export const CARD_DEFS = Object.freeze({
  farmer: {
    name: "Farmer",
    kind: "Person",
    description: "Does the work, carries one item, and harvests mature crops by hand.",
    art: art("farmer.png"),
    artShape: "square",
  },
  wild_soil: {
    name: "Wild Soil",
    kind: "Land",
    description: "Grass and stones cover workable earth.",
    art: art("wild-soil.png"),
  },
  cleared_ground: {
    name: "Cleared Ground",
    kind: "Land",
    description: "The grass is cut. The firm soil still needs the Hoe.",
    art: art("cleared-ground.png"),
    badge: "Untilled",
  },
  empty_plot: {
    name: "Empty Plot",
    kind: "Land",
    description: "Cleared soil waiting for seed.",
    art: art("empty-plot.png"),
  },
  watered_empty_plot: {
    name: "Watered Plot",
    kind: "Land",
    description: "Cleared and watered soil waiting for seed.",
    art: art("watered-plot.png"),
    badge: "Watered",
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
    art: art("watered-carrots.png"),
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
    description: "A Person can pick these up for an Empty Plot.",
    art: art("carrot-seeds.png"),
    artShape: "square",
    portable: true,
  },
  hoe: {
    name: "Hoe",
    kind: "Tool",
    description: "A persistent Tool for tilling Cleared Ground into a Plot.",
    art: art("hoe.png"),
    artShape: "square",
    portable: true,
  },
  watering_can: {
    name: "Watering Can",
    kind: "Tool",
    description: "Refill it at the Stone Well, then water thirsty crops.",
    art: art("watering-can.png"),
    artShape: "square",
    portable: true,
  },
  sickle: {
    name: "Sickle",
    kind: "Tool",
    description: "A persistent Tool for cutting grass from Wild Soil.",
    art: art("sickle.png"),
    artShape: "square",
    portable: true,
  },
  well: {
    name: "Stone Well",
    kind: "Well",
    description: "Refills a carried Watering Can. It never creates a container.",
    art: art("well.png"),
  },
  carrots: {
    name: "Carrots",
    kind: "Produce",
    description: "Fresh produce for the market.",
    art: art("carrots.png"),
    artShape: "square",
    portable: true,
  },
  general_store: {
    name: "General Store",
    kind: "Store",
    description: "Buy two Carrot Seeds for two coins. Purchases enter the Hand.",
    art: art("general-store.png"),
  },
  shipping_bin: {
    name: "Shipping Bin",
    kind: "Farm",
    description: "Ship produce now. Collect the earnings at day's end.",
    art: art("shipping-bin.png"),
  },
  home_farm_landmark: {
    name: "Home Farm",
    kind: "Landmark",
    description: "The farm's persistent landmark and travel destination.",
    art: art("home-farm-landmark.png"),
  },
  valley_town_landmark: {
    name: "Valley Town",
    kind: "Landmark",
    description: "The town's persistent landmark and travel destination.",
    art: art("valley-town-landmark.png"),
  },
});
