import { AREAS, CARD_DEFS, CROPS, PEOPLE } from "./data.js";

const dateKey = (state) => `${state.week}-${state.day}`;

function personIdFor(value) {
  if (typeof value === "string" && PEOPLE[value]) return value;
  if (typeof value === "string") return CARD_DEFS[value]?.personId ?? null;
  return value?.meta?.personId ?? CARD_DEFS[value?.typeId]?.personId ?? null;
}

export function ensurePeopleMemory(state) {
  state.memoryBook ??= {};
  state.memoryBook.people = state.memoryBook.people && typeof state.memoryBook.people === "object"
    ? state.memoryBook.people
    : {};
  Object.keys(PEOPLE).forEach((personId) => {
    const record = state.memoryBook.people[personId] ?? {};
    record.moments = Array.isArray(record.moments)
      ? record.moments.filter((moment) => moment && typeof moment.id === "string")
      : [];
    state.memoryBook.people[personId] = record;
  });
  return state.memoryBook.people;
}

export function personForCard(value) {
  const personId = personIdFor(value);
  return personId ? PEOPLE[personId] ?? null : null;
}

export function relationshipStateFor(state, value) {
  const personId = personIdFor(value);
  if (!personId) return null;
  const people = ensurePeopleMemory(state);
  const moments = people[personId].moments;
  const uniqueMoments = [...new Map(moments.map((moment) => [moment.signature ?? moment.id, moment])).values()];
  const uniqueDates = new Set(uniqueMoments.map((moment) => `${moment.week}-${moment.day}`));
  const shared = uniqueMoments.some((moment) => moment.kind === "share");
  if (uniqueMoments.length >= 4 && uniqueDates.size >= 2 && shared) return "Close";
  if (uniqueMoments.length >= 2) return "Familiar";
  return "New";
}

export function syncPeopleForDate(state, { preservePositions = false } = {}) {
  ensurePeopleMemory(state);
  const scheduleDay = ((Math.max(1, state.day) - 1) % 7) + 1;
  Object.values(PEOPLE).forEach((person) => {
    const item = state.cards.find((card) => card.id === person.cardId);
    if (!item) return;
    const appearance = person.schedule.find((entry) => entry.day === scheduleDay) ?? null;
    item.meta.personId = person.id;
    if (!appearance) {
      item.meta.absent = true;
      delete item.meta.areaId;
      return;
    }
    const enteredArea = item.meta.absent || item.meta.areaId !== appearance.areaId;
    delete item.meta.absent;
    item.meta.areaId = appearance.areaId;
    if (!preservePositions || enteredArea) {
      item.x = appearance.x;
      item.y = appearance.y;
    }
  });
  return state;
}

function momentSignature(state, action, produce) {
  if (action === "share_produce") {
    const definition = CARD_DEFS[produce?.typeId];
    if (definition?.cropState !== "produce") return null;
    return `share:${definition.cropId}:${definition.quality ?? "ordinary"}`;
  }
  if (action === "spend_time") return `spend:${state.cards.find((card) => card.typeId === "farmer")?.meta.areaId}:${state.weather}`;
  return null;
}

export function availablePersonAction(state, source, target, carried = null) {
  if (source?.typeId !== "farmer" || !personForCard(target) || target.meta.absent) return null;
  const person = personForCard(target);
  const moments = ensurePeopleMemory(state)[person.id].moments;
  if (moments.some((moment) => `${moment.week}-${moment.day}` === dateKey(state))) return null;
  const action = carried ? "share_produce" : "spend_time";
  const signature = momentSignature(state, action, carried);
  if (!signature || moments.some((moment) => moment.signature === signature)) return null;
  return action;
}

function isFavorite(person, state, action, produce) {
  if (action === "spend_time") {
    return person.interests.weather.includes(state.weather)
      || person.interests.areas.includes(state.cards.find((card) => card.typeId === "farmer")?.meta.areaId);
  }
  const definition = CARD_DEFS[produce?.typeId];
  return person.interests.crops.includes(definition?.cropId)
    || person.interests.qualities.includes(definition?.quality ?? "ordinary");
}

function rememberThisWeek(state, memory) {
  state.seasonStats ??= {};
  state.seasonStats.memories = Array.isArray(state.seasonStats.memories) ? state.seasonStats.memories : [];
  if (!state.seasonStats.memories.some((entry) => entry.id === memory.id)) state.seasonStats.memories.push(memory);
}

function momentText(person, state, action, produce, favorite) {
  const area = AREAS.find((entry) => entry.id === state.cards.find((card) => card.typeId === "farmer")?.meta.areaId)?.name ?? "the valley";
  if (action === "share_produce") {
    const crop = CROPS[CARD_DEFS[produce.typeId].cropId];
    const quality = CARD_DEFS[produce.typeId].quality === "choice" ? "Choice " : "";
    return favorite
      ? `${person.name} especially remembered sharing ${quality}${crop.name} at ${area}.`
      : `${person.name} remembered sharing ${quality}${crop.name} at ${area}.`;
  }
  return favorite
    ? `${person.name} especially remembered a ${state.weather} moment at ${area}.`
    : `${person.name} remembered a ${state.weather} moment at ${area}.`;
}

export function applyPersonMoment(state, action, target, produce, events = []) {
  const person = personForCard(target);
  const record = person && ensurePeopleMemory(state)[person.id];
  const signature = momentSignature(state, action, produce);
  if (!person || !record || !signature) return { ok: false };
  if (target.meta.absent
    || record.moments.some((moment) => `${moment.week}-${moment.day}` === dateKey(state))
    || record.moments.some((moment) => moment.signature === signature)) return { ok: false };
  const before = relationshipStateFor(state, person.id);
  const favorite = isFavorite(person, state, action, produce);
  const moment = {
    id: `person:${person.id}:${signature}`,
    signature,
    kind: action === "share_produce" ? "share" : "spend",
    week: state.week,
    day: state.day,
    areaId: target.meta.areaId,
    weather: state.weather,
    favorite,
    firstMeeting: record.moments.length === 0,
  };
  if (produce) {
    const definition = CARD_DEFS[produce.typeId];
    moment.cropId = definition.cropId;
    moment.quality = definition.quality ?? null;
    if ((produce.meta.amount ?? 1) > 1) produce.meta.amount -= 1;
    else state.cards = state.cards.filter((card) => card.id !== produce.id);
  }
  record.moments.push(moment);
  const text = momentText(person, state, action, produce, favorite);
  events.push(text);
  const after = relationshipStateFor(state, person.id);
  if (moment.firstMeeting) {
    rememberThisWeek(state, {
      id: `person-meeting:${person.id}`,
      kind: "person_meeting",
      personId: person.id,
      week: state.week,
      day: state.day,
      text: `${person.name} became part of the valley's remembered days.`,
    });
  }
  if (favorite) {
    rememberThisWeek(state, {
      id: `favorite:${person.id}:${signature}`,
      kind: "favorite_moment",
      personId: person.id,
      week: state.week,
      day: state.day,
      text,
    });
  }
  if (before !== after) {
    const stateText = after === "Close"
      ? `${person.name} now feels close to the farm's life.`
      : `${person.name} has become a familiar face.`;
    rememberThisWeek(state, {
      id: `relationship:${person.id}:${after.toLowerCase()}`,
      kind: "relationship",
      personId: person.id,
      week: state.week,
      day: state.day,
      text: stateText,
    });
    events.push(stateText);
  }
  return { ok: true, moment, relationship: after };
}

function scheduleLabel(person) {
  return person.schedule
    .map((entry) => `Day ${entry.day} · ${AREAS.find((area) => area.id === entry.areaId)?.name ?? entry.areaId}`)
    .join(" · ");
}

function interestsLabel(person) {
  const cropNames = person.interests.crops.map((cropId) => CROPS[cropId]?.name).filter(Boolean);
  const qualities = person.interests.qualities.includes("choice") ? ["Choice Produce"] : [];
  const weather = person.interests.weather.map((value) => value === "rainy" ? "Rain" : "Sun");
  return [...qualities, ...cropNames, ...weather].join(" · ");
}

export function personDetails(state, value) {
  const person = personForCard(value);
  if (!person) return null;
  const moments = ensurePeopleMemory(state)[person.id].moments;
  return {
    ...person,
    relationship: relationshipStateFor(state, person.id),
    scheduleLabel: scheduleLabel(person),
    interestsLabel: interestsLabel(person),
    moments: moments.map((moment) => {
      if (moment.kind === "share") {
        const crop = CROPS[moment.cropId];
        return `${moment.favorite ? "Favorite · " : ""}Shared ${moment.quality === "choice" ? "Choice " : ""}${crop?.name ?? "produce"} · W${moment.week} Day ${moment.day}`;
      }
      const area = AREAS.find((entry) => entry.id === moment.areaId)?.name ?? moment.areaId;
      return `${moment.favorite ? "Favorite · " : ""}${moment.weather === "rainy" ? "Rainy" : "Sunny"} time at ${area} · W${moment.week} Day ${moment.day}`;
    }),
  };
}
