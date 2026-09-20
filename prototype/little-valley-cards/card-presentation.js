import { CARD_DEFS, GAME, cropForType } from "./data.js";
import { relationshipStateFor } from "./person-system.js";
import { qualityNameFor } from "./quality-system.js";

const FAMILY_BY_KIND = Object.freeze({
  Person: "person",
  Crop: "crop",
  Land: "land",
  Tool: "tool",
  Item: "item",
  Produce: "item",
  Landmark: "landmark",
  Store: "service",
  Farm: "service",
  Well: "service",
});

export function cardFamilyFor(item) {
  return FAMILY_BY_KIND[CARD_DEFS[item?.typeId]?.kind] ?? "service";
}

export function primaryStatusFor(state, item, context = {}) {
  const definition = CARD_DEFS[item.typeId];
  if (Object.hasOwn(context, "primaryStatus")) return context.primaryStatus;
  if (definition.personId) return relationshipStateFor(state, definition.personId);
  if (item.typeId === "farmer") return context.carrying ? "Carrying" : "Ready";
  if (qualityNameFor(item)) return qualityNameFor(item);
  if (item.meta.tended) return "Tended";
  if (definition.kind === "Landmark") return context.active ? "Here" : null;
  if (item.typeId === "watering_can") {
    const charges = item.meta.charges ?? 0;
    if (charges === GAME.wateringCanCapacity) return "Full";
    if (charges > 0) return `${charges} Water`;
    return "Empty";
  }
  if (item.typeId === "shipping_bin" && context.shipment?.amount > 0) return "Queued";
  return definition.badge ?? null;
}

function progressFor(item) {
  const definition = CARD_DEFS[item.typeId];
  if (!["thirsty", "watered"].includes(definition.cropState)) return null;
  const crop = cropForType(item.typeId);
  const total = item.meta.growthTotalDays ?? crop?.growthDays ?? GAME.cropGrowthDays;
  const remaining = item.meta.growthRemainingDays ?? total;
  return { value: Math.max(0, Math.min(1, 1 - remaining / total)), label: `${remaining}d` };
}

export function cardPresentation(state, item, context = {}) {
  const definition = CARD_DEFS[item.typeId];
  return {
    family: cardFamilyFor(item),
    familyLabel: definition.kind === "Produce" ? "Produce" : definition.kind,
    title: context.title ?? definition.name,
    primaryStatus: primaryStatusFor(state, item, context),
    quantity: (item.meta.amount ?? 1) > 1 ? item.meta.amount : null,
    progress: progressFor(item),
    detail: context.detail ?? definition.description,
    interactionState: context.interactionState ?? "idle",
    art: context.art ?? definition.art,
    artShape: definition.artShape ?? "landscape",
  };
}
