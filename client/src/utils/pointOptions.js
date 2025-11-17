import { formatNumberWithSpaces, compactNumber } from "./functions";

import crystaux from "../assets/crystaux.webp";
import iscoin from "../assets/iscoin.webp";
import dragon_egg from "../assets/dragon_egg.webp";
import beacon from "../assets/beacon.webp";
import sponge from "../assets/sponge.webp";

export const WEEKLY_OPTIONS = {
  crystaux: {
    multiplier: 100,
    label: "Crystaux",
    format: (p) =>
      `${formatNumberWithSpaces(p)} = ${compactNumber(p * 100)} Crystaux`,
    requiredAmount: 100,
    icon: crystaux,
  },
  iscoin: {
    multiplier: 2000000,
    label: "IsCoin",
    format: (p) =>
      `${formatNumberWithSpaces(p)} = ${compactNumber(p * 2000000)} $`,
    requiredAmount: 10000,
    icon: iscoin,
  },
};

export const ISVALUE_OPTIONS = {
  dragonegg: {
    multiplier: 1500000000,
    label: "DragonEgg",
    format: (p) =>
      `${formatNumberWithSpaces(p)} = ${compactNumber(p * 1500000000)} $`,
    icon: dragon_egg,
  },
  beacon: {
    multiplier: 150000000,
    label: "Beacon",
    format: (p) =>
      `${formatNumberWithSpaces(p)} = ${compactNumber(p * 150000000)} $`,
    icon: beacon,
  },
  sponge: {
    multiplier: 15000000,
    label: "Sponge",
    format: (p) =>
      `${formatNumberWithSpaces(p)} = ${compactNumber(p * 15000000)} $`,
    icon: sponge,
  },
};
