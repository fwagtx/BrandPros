/* BAD ROYALE · 2026-11-01-green-hill-zone. Facts: brand/badroyale/sources (official map + news). */
window.SCENE = TPL.map({
 "title": [
  "Sonic's Green Hill Zone",
  "is in Fortnite"
 ],
 "map": "labels",
 "shots": [
  {
   "p": 0,
   "x": 599.8,
   "y": 1016.8,
   "z": 2.3
  },
  {
   "p": 1,
   "dt": 0.05,
   "x": 1010,
   "y": 1010,
   "z": 0.5,
   "ease": "out5",
   "whoosh": 1
  },
  {
   "p": 2,
   "x": 599.8,
   "y": 1016.8,
   "z": 1.6,
   "ease": "out5",
   "whoosh": 1
  },
  {
   "p": 3,
   "x": 599.8,
   "y": 1016.8,
   "z": 1.7
  },
  {
   "p": "end",
   "x": 599.8,
   "y": 1016.8,
   "z": 1.8
  }
 ],
 "pins": [
  {
   "x": 599.8,
   "y": 1016.8,
   "p": 2,
   "dt": 0.2,
   "label": "Green Hill Zone",
   "lx": -200,
   "ly": 90
  }
 ],
 "toasts": [
  {
   "p": 3,
   "label": "IN-GAME NEWS",
   "text": "Areas inspired by Sonic",
   "color": "#5BD0FF"
  }
 ],
 "caption": "#EpicPartner Sonic's Green Hill Zone is on the Fortnite map right now 💨\nUse code BAD in the Item Shop 💛\n#fortnite #sonic #fortniteoverride",
 "claims": [
  {
   "text": "Green Hill Zone is a named place on the map",
   "source": "map.json",
   "match": [
    "Green Hill Zone"
   ]
  },
  {
   "text": "Override brings areas inspired by Sonic, Tetris and Pac-Man",
   "source": "news.json",
   "match": [
    "areas inspired by gaming legends like Sonic, Tetris, and Pac-Man"
   ]
  },
  {
   "text": "It's on the west side of the island",
   "source": "map-labels.png",
   "visual": "POI at map pixel (600, 1017): west of the island centre (1010, 1010)"
  }
 ]
});
