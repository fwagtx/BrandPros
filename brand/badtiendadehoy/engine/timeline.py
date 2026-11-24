"""The fixed 62-second timeline of the shop video (taken from the owner's usecodebad reference video).
Segments: intro, bundle, 8 items, the "¿qué vas a comprar?" grid, the creator-code screen.
render.js has the same numbers (keep them in sync)."""
STARTS = [0.0, 4.767, 11.867, 16.667, 21.367, 26.2, 31.0, 35.733, 40.433, 45.167, 49.967, 56.967]
END = 62.167
# music sections for brand/_shared/video/music.py
SECTIONS = [[0, "intro"], [4.767, "main"], [49.967, "grid"], [56.967, "end"]]
