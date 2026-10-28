/* BAD ROYALE · 2026-11-03-override-explained. Facts: brand/badroyale/sources (official map + news). */
window.SCENE = TPL.news({
 "kicker": "IN-GAME NEWS",
 "tile": "Fortnite: Override Is Here!",
 "tileSize": 60,
 "quote": [
  {
   "p": 1,
   "text": "Break the rules. Change the game!"
  },
  {
   "p": 2,
   "text": "Activate Overrides to switch up the game"
  },
  {
   "p": 3,
   "text": "explore areas inspired by gaming legends like Sonic, Tetris, and Pac-Man"
  }
 ],
 "points": [
  {
   "p": 4,
   "label": "ON THE MAP",
   "text": "7 Override Consoles"
  }
 ],
 "caption": "#EpicPartner Fortnite Override, explained in 15 seconds ⚡\nUse code BAD in the Item Shop 💛\n#fortnite #fortniteoverride #fortnitenews",
 "claims": [
  {
   "text": "Break the rules. Change the game!",
   "source": "news.json",
   "match": [
    "Break the rules. Change the game!"
   ]
  },
  {
   "text": "Activate Overrides to switch up the game",
   "source": "news.json",
   "match": [
    "Activate Overrides to switch up the game"
   ]
  },
  {
   "text": "Areas inspired by Sonic, Tetris and Pac-Man",
   "source": "news.json",
   "match": [
    "areas inspired by gaming legends like Sonic, Tetris, and Pac-Man"
   ]
  },
  {
   "text": "7 Override Consoles on the map",
   "source": "map.json",
   "match": [
    "Override Console"
   ],
   "count": {
    "Override Console": 7
   }
  }
 ],
 "hook": [
  "Override",
  "in 15 seconds"
 ]
});
