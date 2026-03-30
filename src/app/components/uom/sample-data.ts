/**
 * UOM Module — Sample Dataset
 *
 * 105 realistic unit-of-measure records spanning all 14 categories,
 * with a mix of Standard / Custom types and In Use / Unused statuses.
 */

import type { UomCategory } from "./CategoryBadge";
import type { UomType } from "./TypeLabel";

export interface UomUnit {
  id: string;
  name: string;
  symbol: string;
  category: UomCategory;
  description: string;
  type: UomType;
  inUse: boolean;
  inUseCount?: number;
}

export const SAMPLE_UNITS: UomUnit[] = [
  // ── Length (12) ──
  { id: "L01", name: "Meter", symbol: "m", category: "Length", description: "SI base unit of length", type: "Standard", inUse: true, inUseCount: 14 },
  { id: "L02", name: "Centimeter", symbol: "cm", category: "Length", description: "One hundredth of a meter", type: "Standard", inUse: true, inUseCount: 9 },
  { id: "L03", name: "Millimeter", symbol: "mm", category: "Length", description: "One thousandth of a meter", type: "Standard", inUse: true, inUseCount: 7 },
  { id: "L04", name: "Kilometer", symbol: "km", category: "Length", description: "One thousand meters", type: "Standard", inUse: true, inUseCount: 3 },
  { id: "L05", name: "Inch", symbol: "in", category: "Length", description: "Imperial unit equal to 25.4 mm", type: "Standard", inUse: true, inUseCount: 11 },
  { id: "L06", name: "Foot", symbol: "ft", category: "Length", description: "Imperial unit equal to 12 inches", type: "Standard", inUse: true, inUseCount: 8 },
  { id: "L07", name: "Yard", symbol: "yd", category: "Length", description: "Imperial unit equal to 3 feet", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "L08", name: "Mile", symbol: "mi", category: "Length", description: "Imperial unit equal to 5280 feet", type: "Standard", inUse: false },
  { id: "L09", name: "Micrometer", symbol: "\u00B5m", category: "Length", description: "One millionth of a meter", type: "Standard", inUse: false },
  { id: "L10", name: "Nanometer", symbol: "nm", category: "Length", description: "One billionth of a meter", type: "Standard", inUse: false },
  { id: "L11", name: "Custom Rod", symbol: "rod", category: "Length", description: "Historical surveying unit", type: "Custom", inUse: false },
  { id: "L12", name: "Custom Chain", symbol: "ch", category: "Length", description: "Surveyor's chain, 66 feet", type: "Custom", inUse: true, inUseCount: 1 },

  // ── Area (6) ──
  { id: "A01", name: "Square Meter", symbol: "m\u00B2", category: "Area", description: "SI derived unit of area", type: "Standard", inUse: true, inUseCount: 6 },
  { id: "A02", name: "Square Foot", symbol: "ft\u00B2", category: "Area", description: "Imperial unit of area", type: "Standard", inUse: true, inUseCount: 5 },
  { id: "A03", name: "Hectare", symbol: "ha", category: "Area", description: "10,000 square meters", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "A04", name: "Acre", symbol: "ac", category: "Area", description: "Imperial unit, approx 4047 m\u00B2", type: "Standard", inUse: true, inUseCount: 3 },
  { id: "A05", name: "Square Kilometer", symbol: "km\u00B2", category: "Area", description: "1,000,000 square meters", type: "Standard", inUse: false },
  { id: "A06", name: "Square Inch", symbol: "in\u00B2", category: "Area", description: "Imperial unit of area", type: "Standard", inUse: false },

  // ── Volume (10) ──
  { id: "V01", name: "Liter", symbol: "L", category: "Volume", description: "Metric unit equal to 1 cubic decimeter", type: "Standard", inUse: true, inUseCount: 12 },
  { id: "V02", name: "Milliliter", symbol: "mL", category: "Volume", description: "One thousandth of a liter", type: "Standard", inUse: true, inUseCount: 8 },
  { id: "V03", name: "Cubic Meter", symbol: "m\u00B3", category: "Volume", description: "SI derived unit of volume", type: "Standard", inUse: true, inUseCount: 4 },
  { id: "V04", name: "Gallon (US)", symbol: "gal", category: "Volume", description: "US liquid gallon, 3.785 L", type: "Standard", inUse: true, inUseCount: 6 },
  { id: "V05", name: "Fluid Ounce", symbol: "fl oz", category: "Volume", description: "US fluid ounce, 29.57 mL", type: "Standard", inUse: true, inUseCount: 3 },
  { id: "V06", name: "Cubic Foot", symbol: "ft\u00B3", category: "Volume", description: "Imperial unit of volume", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "V07", name: "Barrel", symbol: "bbl", category: "Volume", description: "42 US gallons, petroleum standard", type: "Standard", inUse: true, inUseCount: 1 },
  { id: "V08", name: "55GAL", symbol: "55GAL", category: "Volume", description: "Standard 55-gallon drum", type: "Custom", inUse: true, inUseCount: 4 },
  { id: "V09", name: "Custom Tote", symbol: "tote", category: "Volume", description: "275-gallon IBC tote container", type: "Custom", inUse: true, inUseCount: 2 },
  { id: "V10", name: "Quart", symbol: "qt", category: "Volume", description: "US liquid quart, 0.946 L", type: "Standard", inUse: false },

  // ── Mass (10) ──
  { id: "M01", name: "Kilogram", symbol: "kg", category: "Mass", description: "SI base unit of mass", type: "Standard", inUse: true, inUseCount: 15 },
  { id: "M02", name: "Gram", symbol: "g", category: "Mass", description: "One thousandth of a kilogram", type: "Standard", inUse: true, inUseCount: 10 },
  { id: "M03", name: "Milligram", symbol: "mg", category: "Mass", description: "One thousandth of a gram", type: "Standard", inUse: true, inUseCount: 5 },
  { id: "M04", name: "Metric Ton", symbol: "t", category: "Mass", description: "1,000 kilograms", type: "Standard", inUse: true, inUseCount: 4 },
  { id: "M05", name: "Pound", symbol: "lb", category: "Mass", description: "Imperial unit equal to 0.4536 kg", type: "Standard", inUse: true, inUseCount: 12 },
  { id: "M06", name: "Ounce", symbol: "oz", category: "Mass", description: "Imperial unit, 1/16 of a pound", type: "Standard", inUse: true, inUseCount: 7 },
  { id: "M07", name: "Stone", symbol: "st", category: "Mass", description: "Imperial unit equal to 14 pounds", type: "Standard", inUse: false },
  { id: "M08", name: "Short Ton", symbol: "ton", category: "Mass", description: "US ton, 2000 pounds", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "M09", name: "Long Ton", symbol: "LT", category: "Mass", description: "Imperial ton, 2240 pounds", type: "Standard", inUse: false },
  { id: "M10", name: "Custom Bale", symbol: "bale", category: "Mass", description: "Standard bale weight for cotton", type: "Custom", inUse: true, inUseCount: 3 },

  // ── Quantity (10) ──
  { id: "Q01", name: "Each", symbol: "ea", category: "Quantity", description: "Individual count unit", type: "Standard", inUse: true, inUseCount: 22 },
  { id: "Q02", name: "Dozen", symbol: "dz", category: "Quantity", description: "Group of 12 items", type: "Standard", inUse: true, inUseCount: 5 },
  { id: "Q03", name: "Pair", symbol: "pr", category: "Quantity", description: "Group of 2 items", type: "Standard", inUse: true, inUseCount: 4 },
  { id: "Q04", name: "Gross", symbol: "gro", category: "Quantity", description: "Group of 144 items", type: "Standard", inUse: false },
  { id: "Q05", name: "Piece", symbol: "pc", category: "Quantity", description: "Individual piece", type: "Standard", inUse: true, inUseCount: 8 },
  { id: "Q06", name: "Box", symbol: "box", category: "Quantity", description: "Standard shipping box", type: "Standard", inUse: true, inUseCount: 6 },
  { id: "Q07", name: "Pallet", symbol: "plt", category: "Quantity", description: "Standard shipping pallet", type: "Standard", inUse: true, inUseCount: 3 },
  { id: "Q08", name: "Bundle (Old)", symbol: "bndl", category: "Quantity", description: "Legacy bundle grouping unit", type: "Custom", inUse: false },
  { id: "Q09", name: "Custom Case", symbol: "case", category: "Quantity", description: "Internal case packaging unit", type: "Custom", inUse: true, inUseCount: 7 },
  { id: "Q10", name: "Ream", symbol: "rm", category: "Quantity", description: "500 sheets of paper", type: "Standard", inUse: true, inUseCount: 1 },

  // ── Time (8) ──
  { id: "T01", name: "Second", symbol: "s", category: "Time", description: "SI base unit of time", type: "Standard", inUse: true, inUseCount: 5 },
  { id: "T02", name: "Minute", symbol: "min", category: "Time", description: "60 seconds", type: "Standard", inUse: true, inUseCount: 4 },
  { id: "T03", name: "Hour", symbol: "h", category: "Time", description: "3,600 seconds", type: "Standard", inUse: true, inUseCount: 9 },
  { id: "T04", name: "Day", symbol: "d", category: "Time", description: "86,400 seconds", type: "Standard", inUse: true, inUseCount: 3 },
  { id: "T05", name: "Week", symbol: "wk", category: "Time", description: "7 days", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "T06", name: "Month", symbol: "mo", category: "Time", description: "Calendar month", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "T07", name: "Year", symbol: "yr", category: "Time", description: "365.25 days", type: "Standard", inUse: true, inUseCount: 1 },
  { id: "T08", name: "Millisecond", symbol: "ms", category: "Time", description: "One thousandth of a second", type: "Standard", inUse: false },

  // ── Temperature (5) ──
  { id: "TP01", name: "Degree Celsius", symbol: "\u00B0C", category: "Temperature", description: "Common temperature scale", type: "Standard", inUse: true, inUseCount: 6 },
  { id: "TP02", name: "Degree Fahrenheit", symbol: "\u00B0F", category: "Temperature", description: "Imperial temperature scale", type: "Standard", inUse: true, inUseCount: 4 },
  { id: "TP03", name: "Kelvin", symbol: "K", category: "Temperature", description: "SI base unit of temperature", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "TP04", name: "Rankine", symbol: "\u00B0R", category: "Temperature", description: "Absolute Fahrenheit scale", type: "Standard", inUse: false },
  { id: "TP05", name: "Delisle", symbol: "\u00B0De", category: "Temperature", description: "Historical temperature scale", type: "Custom", inUse: false },

  // ── Force (4) ──
  { id: "F01", name: "Newton", symbol: "N", category: "Force", description: "SI derived unit of force", type: "Standard", inUse: true, inUseCount: 3 },
  { id: "F02", name: "Kilonewton", symbol: "kN", category: "Force", description: "1,000 newtons", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "F03", name: "Pound-Force", symbol: "lbf", category: "Force", description: "Imperial unit of force", type: "Standard", inUse: true, inUseCount: 1 },
  { id: "F04", name: "Dyne", symbol: "dyn", category: "Force", description: "CGS unit of force", type: "Standard", inUse: false },

  // ── Pressure (6) ──
  { id: "PR01", name: "Pascal", symbol: "Pa", category: "Pressure", description: "SI derived unit of pressure", type: "Standard", inUse: true, inUseCount: 4 },
  { id: "PR02", name: "Kilopascal", symbol: "kPa", category: "Pressure", description: "1,000 pascals", type: "Standard", inUse: true, inUseCount: 3 },
  { id: "PR03", name: "Bar", symbol: "bar", category: "Pressure", description: "100,000 pascals", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "PR04", name: "PSI", symbol: "psi", category: "Pressure", description: "Pounds per square inch", type: "Standard", inUse: true, inUseCount: 8 },
  { id: "PR05", name: "Atmosphere", symbol: "atm", category: "Pressure", description: "Standard atmospheric pressure", type: "Standard", inUse: false },
  { id: "PR06", name: "Torr", symbol: "Torr", category: "Pressure", description: "1/760 of an atmosphere", type: "Standard", inUse: false },

  // ── Energy (6) ──
  { id: "E01", name: "Joule", symbol: "J", category: "Energy", description: "SI derived unit of energy", type: "Standard", inUse: true, inUseCount: 5 },
  { id: "E02", name: "Kilojoule", symbol: "kJ", category: "Energy", description: "1,000 joules", type: "Standard", inUse: true, inUseCount: 3 },
  { id: "E03", name: "Calorie", symbol: "cal", category: "Energy", description: "Energy to heat 1g water by 1\u00B0C", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "E04", name: "Kilocalorie", symbol: "kcal", category: "Energy", description: "1,000 calories, food energy unit", type: "Standard", inUse: true, inUseCount: 1 },
  { id: "E05", name: "Watt-Hour", symbol: "Wh", category: "Energy", description: "Energy of 1 watt for 1 hour", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "E06", name: "BTU", symbol: "BTU", category: "Energy", description: "British thermal unit", type: "Standard", inUse: true, inUseCount: 4 },

  // ── Power (5) ──
  { id: "PW01", name: "Watt", symbol: "W", category: "Power", description: "SI derived unit of power", type: "Standard", inUse: true, inUseCount: 7 },
  { id: "PW02", name: "Kilowatt", symbol: "kW", category: "Power", description: "1,000 watts", type: "Standard", inUse: true, inUseCount: 5 },
  { id: "PW03", name: "Megawatt", symbol: "MW", category: "Power", description: "1,000,000 watts", type: "Standard", inUse: false },
  { id: "PW04", name: "Horsepower", symbol: "hp", category: "Power", description: "Approx 745.7 watts", type: "Standard", inUse: true, inUseCount: 3 },
  { id: "PW05", name: "Custom kVA", symbol: "kVA", category: "Power", description: "Kilovolt-ampere, apparent power", type: "Custom", inUse: true, inUseCount: 2 },

  // ── Electrical (6) ──
  { id: "EL01", name: "Ampere", symbol: "A", category: "Electrical", description: "SI base unit of electric current", type: "Standard", inUse: true, inUseCount: 4 },
  { id: "EL02", name: "Volt", symbol: "V", category: "Electrical", description: "SI derived unit of voltage", type: "Standard", inUse: true, inUseCount: 5 },
  { id: "EL03", name: "Ohm", symbol: "\u2126", category: "Electrical", description: "SI derived unit of resistance", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "EL04", name: "Farad", symbol: "F", category: "Electrical", description: "SI derived unit of capacitance", type: "Standard", inUse: false },
  { id: "EL05", name: "Henry", symbol: "H", category: "Electrical", description: "SI derived unit of inductance", type: "Standard", inUse: false },
  { id: "EL06", name: "Coulomb", symbol: "C", category: "Electrical", description: "SI derived unit of electric charge", type: "Standard", inUse: false },

  // ── Frequency (5) ──
  { id: "FR01", name: "Hertz", symbol: "Hz", category: "Frequency", description: "SI unit of frequency, cycles per second", type: "Standard", inUse: true, inUseCount: 3 },
  { id: "FR02", name: "Kilohertz", symbol: "kHz", category: "Frequency", description: "1,000 hertz", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "FR03", name: "Megahertz", symbol: "MHz", category: "Frequency", description: "1,000,000 hertz", type: "Standard", inUse: true, inUseCount: 1 },
  { id: "FR04", name: "Gigahertz", symbol: "GHz", category: "Frequency", description: "1,000,000,000 hertz", type: "Standard", inUse: false },
  { id: "FR05", name: "RPM", symbol: "rpm", category: "Frequency", description: "Revolutions per minute", type: "Standard", inUse: true, inUseCount: 2 },

  // ── Other SI (12) ──
  { id: "O01", name: "Mole", symbol: "mol", category: "Other SI", description: "SI base unit of amount of substance", type: "Standard", inUse: true, inUseCount: 2 },
  { id: "O02", name: "Candela", symbol: "cd", category: "Other SI", description: "SI base unit of luminous intensity", type: "Standard", inUse: false },
  { id: "O03", name: "Lumen", symbol: "lm", category: "Other SI", description: "SI derived unit of luminous flux", type: "Standard", inUse: true, inUseCount: 1 },
  { id: "O04", name: "Lux", symbol: "lx", category: "Other SI", description: "SI derived unit of illuminance", type: "Standard", inUse: true, inUseCount: 1 },
  { id: "O05", name: "Becquerel", symbol: "Bq", category: "Other SI", description: "SI unit of radioactivity", type: "Standard", inUse: false },
  { id: "O06", name: "Gray", symbol: "Gy", category: "Other SI", description: "SI unit of absorbed dose", type: "Standard", inUse: false },
  { id: "O07", name: "Sievert", symbol: "Sv", category: "Other SI", description: "SI unit of equivalent dose", type: "Standard", inUse: false },
  { id: "O08", name: "Katal", symbol: "kat", category: "Other SI", description: "SI unit of catalytic activity", type: "Standard", inUse: false },
  { id: "O09", name: "Weber", symbol: "Wb", category: "Other SI", description: "SI unit of magnetic flux", type: "Standard", inUse: false },
  { id: "O10", name: "Tesla", symbol: "T", category: "Other SI", description: "SI unit of magnetic flux density", type: "Standard", inUse: false },
  { id: "O11", name: "Siemens", symbol: "S", category: "Other SI", description: "SI unit of electrical conductance", type: "Standard", inUse: false },
  { id: "O12", name: "Steradian", symbol: "sr", category: "Other SI", description: "SI unit of solid angle", type: "Standard", inUse: false },
];