/* BAD ROYALE · 2026-10-30-dark-cartridge. Facts: brand/badroyale/sources (official map + news). */
window.SCENE = TPL.map({
 "title": [
  "The cursed cartridge",
  "is on the map"
 ],
 "map": "labels",
 "shots": [
  {
   "p": 0,
   "x": 885.0,
   "y": 1106.1,
   "z": 1.5
  },
  {
   "p": 1,
   "x": 1010,
   "y": 1010,
   "z": 0.55,
   "ease": "out5",
   "whoosh": 1
  },
  {
   "p": 2,
   "x": 885.0,
   "y": 1106.1,
   "z": 1.6,
   "ease": "out5",
   "whoosh": 1
  },
  {
   "p": "end",
   "x": 885.0,
   "y": 1106.1,
   "z": 1.7
  }
 ],
 "pins": [
  {
   "x": 885.0,
   "y": 1106.1,
   "p": 0,
   "dt": 0.35,
   "label": "Dark Cartridge",
   "lx": -220,
   "ly": 90
  }
 ],
 "toasts": [
  {
   "p": 3,
   "label": "IN-GAME NEWS",
   "text": "Corrupting everything it touches",
   "color": "#FF4FD8"
  }
 ],
 "caption": "#EpicPartner That cursed cartridge has a real spot on the Fortnite map 👀\nUse code BAD in the Item Shop 💛\n#fortnite #fortnitemares #fortnitemap",
 "claims": [
  {
   "text": "The Dark Cartridge is a named spot on the map",
   "source": "map.json",
   "match": [
    "Dark Cartridge"
   ]
  },
  {
   "text": "A cursed cartridge is spreading through the island, corrupting everything it touches",
   "source": "news.json",
   "match": [
    "A cursed cartridge is spreading through the Island, corrupting everything it touches"
   ]
  },
  {
   "text": "It's close to the middle of the island",
   "source": "map-labels.png",
   "visual": "POI at map pixel (885, 1106); island centre about (1010, 1010)"
  }
 ]
});
