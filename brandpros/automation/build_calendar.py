#!/usr/bin/env python3
"""Builds ../07-content-calendar.csv (30-day BrandPros launch calendar).

Edit the SHORTS / FB_POSTS / CAROUSELS / LONGFORM tables below and re-run:
    python3 automation/build_calendar.py
All times are America/Chicago (Metricool brand timezone).
"""
import csv
import datetime as dt
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "07-content-calendar.csv"
HANDLE = "@brandpros"

PILLARS = {
    "M": "The $1B Mistake",
    "D": "Dead Brands",
    "H": "How They Make Money",
    "C": "The Comeback",
    "F": "Founder Files",
    "W": "Brand Wars",
}
BASE_TAGS = {
    "M": ["#business", "#brandhistory", "#businessmistakes"],
    "D": ["#nostalgia", "#deadbrands", "#brandhistory"],
    "H": ["#business", "#howtheymakemoney", "#businessmodel"],
    "C": ["#comeback", "#business", "#brandhistory"],
    "F": ["#founderstory", "#entrepreneur", "#brandhistory"],
    "W": ["#brandwars", "#business", "#brandhistory"],
}

# date, id, pillar, title, hook/caption line, question, topic hashtag, script link, fact-check note
SHORTS = [
    ("2026-10-05", "S01", "M", "Blockbuster Could've Bought Netflix for $50M",
     "The famous mistake isn't the real one. Blockbuster actually started beating Netflix years later.",
     "Would you have bought Netflix?", "#blockbuster", "05-scripts/S01-blockbuster-netflix.md",
     "$50M ask per Marc Randolph's book; late-fee figure; Total Access dates; 1 store left in Bend OR"),
    ("2026-10-06", "S02", "H", "Costco's $1.50 Hot Dog Is a Trick (a Good One)",
     "Same price since 1985, on purpose. The hot dog isn't the product. The card is.",
     "What's your Costco must-buy?", "#costco", "05-scripts/S02-costco-hot-dog.md",
     "$1.50 still current; Jelinek/Sinegal quote wording; latest 10-K membership fees vs operating income"),
    ("2026-10-07", "S05", "F", "The Colonel Sanders Myth (the True Story Is Better)",
     "1,009 rejections? No solid source. What's documented: a new highway nearly wiped him out in his 60s.",
     "Which founder myth should we check next?", "#kfc", "05-scripts/S05-colonel-sanders-myth.md",
     "I-75 bypass timeline; nickel-per-chicken fee; 600+ outlets by 1964; $2M sale"),
    ("2026-10-08", "C01", "M", "Blockbuster's Late-Fee Machine",
     "Late fees were reportedly one of Blockbuster's biggest money-makers, and the thing customers hated most.",
     "What's the worst late fee you ever paid?", "#blockbuster", "06-longform-outlines/LF01-blockbuster.md (cutdown of Ch. 2)",
     "Late-fee revenue (~$800M / ~16% of revenue, 2000) must be sourced or cut"),
    ("2026-10-09", "S08", "W", "Adidas vs. Puma: Brother vs. Brother",
     "Two brothers split up in 1948 and the whole town picked a side.",
     "Team Adidas or Team Puma?", "#adidas", "05-scripts/S08-adidas-vs-puma.md",
     "Jesse Owens 1936 shoes; 'town of bent necks' source; cemetery detail"),
    ("2026-10-10", "S10", "D", "The World's Biggest Store Chain Became... Foot Locker?",
     "Woolworth didn't vanish. Its sneaker side project took over the whole company.",
     "What did you buy at Woolworth's?", "#woolworth", "05-scripts/S10-woolworth-foot-locker.md",
     "1879 Utica/Lancaster; Woolworth Building paid in cash; 1997 closures; Venator 1998 / Foot Locker 2001"),
    ("2026-10-11", "I-73", "F", "Walt Disney Lost His First Hit Character",
     "Walt lost Oswald the Lucky Rabbit to his distributor in 1928, so he drew a mouse. Disney got Oswald back in 2006.",
     "Did you know Oswald existed?", "#disney", "04-video-ideas.md #73 (script from template)",
     "1928 Oswald rights loss; 2006 reacquisition via the Al Michaels deal"),
    ("2026-10-12", "S09", "H", "McDonald's Isn't Really in the Burger Business",
     "Most McDonald's restaurants are franchised, and the franchisees pay McDonald's rent.",
     "What's your go-to McDonald's order?", "#mcdonalds", "05-scripts/S09-mcdonalds-real-estate.md",
     "% franchised and rent share from latest 10-K; Sonneborn quote is a paraphrase"),
    ("2026-10-13", "S04", "M", "Kodak Invented the Digital Camera. In 1975.",
     "8 pounds. 0.01 megapixels. 23 seconds per photo, saved to a cassette tape.",
     "Did your family have a Kodak camera?", "#kodak", "05-scripts/S04-kodak-digital-camera.md",
     "Sasson specs; 'that's cute' quote wording; mid-2000s digital camera ranking"),
    ("2026-10-14", "I-23", "D", "Pan Am Had a Waiting List for the Moon",
     "After 1968, Pan Am took reservations for future Moon flights. Tens of thousands signed up.",
     "Would you have signed up?", "#panam", "04-video-ideas.md #23 (script from template)",
     "'First Moon Flights Club' membership count (~90,000+) and card details"),
    ("2026-10-15", "C02", "H", "Costco's Store Brand Is Bigger Than Most Fortune 500 Companies",
     "Kirkland Signature alone brings in tens of billions a year. New full story on our channel today.",
     "Best Kirkland product?", "#costco", "06-longform-outlines/LF02-costco.md (cutdown of Ch. 4)",
     "Kirkland annual sales from latest Costco disclosure"),
    ("2026-10-16", "S03", "W", "New Coke: 79 Days That Shook Coca-Cola",
     "Coke won the taste tests and still lost. 'We're not that dumb, and we're not that smart.'",
     "Team Coke or Team Pepsi?", "#newcoke", "05-scripts/S03-new-coke.md",
     "Launch/return dates; ~200k taste tests; ~400k complaints; Keough quote"),
    ("2026-10-17", "I-58", "C", "Marvel Went Bankrupt. Then Disney Paid $4 Billion.",
     "Marvel filed for bankruptcy in 1996. In 2009 Disney agreed to buy it for about $4 billion.",
     "Best Marvel movie?", "#marvel", "04-video-ideas.md #58 (script from template)",
     "1996 Chapter 11; film-rights sales; 2009 Disney deal ~$4B"),
    ("2026-10-18", "C03", "H", "The Rotisserie Chicken That Loses Money on Purpose",
     "Costco has kept its rotisserie chicken at $4.99 for years and built its own poultry operation to do it.",
     "Do you buy the Costco chicken?", "#costco", "06-longform-outlines/LF02-costco.md (cutdown of Ch. 5)",
     "$4.99 price and duration; Nebraska poultry plant (2019)"),
    ("2026-10-19", "S06", "D", "Toys \"R\" Us Didn't Die Because of Amazon",
     "The 2005 buyout left it paying hundreds of millions a year in interest. Full story Thursday.",
     "What was on your Toys \"R\" Us wish list?", "#toysrus", "05-scripts/S06-toys-r-us.md",
     "$6.6B LBO; ~$400M/yr interest; job count; current brand status"),
    ("2026-10-20", "I-42", "H", "Rolex Is Owned by a Foundation",
     "No shareholders to please. The world's most famous watchmaker is owned by a foundation.",
     "Would you ever buy a Rolex?", "#rolex", "04-video-ideas.md #42 (script from template)",
     "Hans Wilsdorf Foundation ownership wording"),
    ("2026-10-21", "I-3", "M", "Snapple: Bought for $1.7B, Sold for $300M",
     "Quaker Oats bought Snapple in 1994 and sold it 27 months later for about $1.4B less.",
     "What's your Snapple flavor?", "#snapple", "04-video-ideas.md #3 (script from template)",
     "Dec 1994 $1.7B purchase; 1997 $300M sale to Triarc"),
    ("2026-10-22", "C04", "D", "Toys \"R\" Us Sued Amazon, and Won",
     "In 2000 they signed a 10-year deal. It ended in court. Full story is live now.",
     "Did you know they had a deal?", "#toysrus", "06-longform-outlines/LF03-toys-r-us.md (cutdown of Ch. 4)",
     "Deal terms; 2004 suit; 2006 ruling"),
    ("2026-10-23", "S07", "C", "LEGO Almost Went Broke. Then It Went Back to the Brick.",
     "Too many pieces, too many side-businesses. Doing less saved it.",
     "What was your favorite LEGO set?", "#lego", "05-scripts/S07-lego-comeback.md",
     "2004 loss; element counts; Knudstorp age; parks sale; year LEGO passed Mattel"),
    ("2026-10-24", "C05", "D", "Wait, Toys \"R\" Us Is Back?",
     "The stores closed in 2018, but the brand has been making a comeback.",
     "Have you been to one of the new ones?", "#toysrus", "06-longform-outlines/LF03-toys-r-us.md (cutdown of Ch. 7)",
     "Current store/shop-in-shop status on publish date"),
    ("2026-10-25", "I-43", "H", "Pepsi Once Got Paid in Soviet Warships",
     "In 1989 a trade deal left Pepsi briefly holding submarines and warships, which it sold for scrap.",
     "Weirdest payment you've ever heard of?", "#pepsi", "04-video-ideas.md #43 (script from template)",
     "1989 barter deal: number and type of vessels; scrap sale"),
    ("2026-10-26", "I-21", "D", "Sears Sold Houses by Mail",
     "From 1908 to 1940 you could order a house from the Sears catalog. Many are still standing.",
     "Is there a Sears house in your town?", "#sears", "04-video-ideas.md #21 (script from template; collab with @history.pros)",
     "Modern Homes years (1908-1940) and ~70,000+ kits sold"),
    ("2026-10-27", "I-41", "H", "Starbucks Is Kind of a Bank",
     "Money loaded on gift cards and the app sits with Starbucks until you spend it, and a lot of it is never spent.",
     "How much is on your Starbucks app right now?", "#starbucks", "04-video-ideas.md #41 (script from template)",
     "Stored-value card liability from latest 10-K"),
    ("2026-10-28", "I-59", "C", "Ford Put Its Own Logo Up as Collateral",
     "In 2006 Ford borrowed billions against nearly everything it owned, including the blue oval. It avoided a bailout.",
     "Ford, Chevy, or something else?", "#ford", "04-video-ideas.md #59 (script from template)",
     "2006 ~$23.6B financing; blue oval pledged; no 2009 bankruptcy"),
    ("2026-10-29", "C06", "D", "The Sears Wish Book",
     "Before online wish lists, kids circled toys in the Sears Christmas catalog. Full Sears story is live now.",
     "What did you circle in the Wish Book?", "#sears", "06-longform-outlines/LF04-sears.md (cutdown of Ch. 4)",
     "Wish Book launch year (1933)"),
    ("2026-10-30", "I-50", "H", "A School Controls the Hershey Company",
     "Milton Hershey left his fortune to a school for kids, and its trust still controls the company.",
     "Favorite Halloween candy?", "#hershey", "04-video-ideas.md #50 (script from template)",
     "Hershey Trust voting control percentage"),
    ("2026-10-31", "I-94", "W", "The Hershey Connection Behind M&M's",
     "Mars needed chocolate during WWII rationing. The second 'M' tells you who helped.",
     "M&M's or Reese's Pieces?", "#halloween", "04-video-ideas.md #94 (script from template)",
     "Forrest Mars / Bruce Murrie partnership (1941); Hershey chocolate supply"),
    ("2026-11-01", "I-74", "F", "Henry Ford's Failed Company Became Cadillac",
     "Ford left his second car company in 1902. It was renamed Cadillac.",
     "Which car brand origin should we do next?", "#cadillac", "04-video-ideas.md #74 (script from template)",
     "Henry Ford Company (1901) to Cadillac (1902) timeline"),
    ("2026-11-02", "I-26", "D", "RadioShack Sold One of the First Personal Computers",
     "The TRS-80 launched in 1977. So how did RadioShack miss the computer revolution?",
     "What did you buy at RadioShack?", "#radioshack", "04-video-ideas.md #26 (script from template)",
     "TRS-80 1977 launch and sales; store count at peak"),
    ("2026-11-03", "C08", "C", "LEGO Sold Its Theme Parks to Survive",
     "In 2005 LEGO sold control of Legoland to stay alive. Full comeback story Thursday.",
     "Have you been to Legoland?", "#lego", "06-longform-outlines/LF05-lego.md (teaser for Ch. 5)",
     "2005 Legoland sale to Blackstone/Merlin"),
]

LONGFORM = [  # YouTube Thursday 14:00, Facebook native Saturday 10:00
    ("2026-10-08", "LF01", "M", "Blockbuster Could've Bought Netflix for $50M. That's Not What Killed It.",
     "#blockbuster", "06-longform-outlines/LF01-blockbuster.md",
     "Remember Friday nights at Blockbuster? 📼 Everyone says Netflix killed it. The real story is stranger. What was your go-to rental?"),
    ("2026-10-15", "LF02", "H", "How Costco Actually Makes Money (It's Not the Groceries)",
     "#costco", "06-longform-outlines/LF02-costco.md",
     "Costco's hot dog has been $1.50 since 1985, and that's the key to the whole business. Here's how Costco really makes money. Are you a member?"),
    ("2026-10-22", "LF03", "D", "What Really Happened to Toys \"R\" Us",
     "#toysrus", "06-longform-outlines/LF03-toys-r-us.md",
     "The bike wall, the giraffe, the wish list. 🦒 What really happened to Toys \"R\" Us, and why it wasn't just Amazon. What's your favorite memory?"),
    ("2026-10-29", "LF04", "D", "Sears Was Amazon Before Amazon. So What Happened?",
     "#sears", "06-longform-outlines/LF04-sears.md",
     "Sears sold everything, even houses, by mail, decades before Amazon. So what happened? Did your family order from the Sears catalog?"),
]

FB_POSTS = [  # Mon/Wed/Fri 10:00 illustrated image + question
    ("2026-10-05", "D", "Friday night. The new-release wall. The race to grab the last copy. 📼 What movie did you always rent from Blockbuster?"),
    ("2026-10-07", "H", "Quick poll: are you a Costco person or a Sam's Club person? 🛒 (Our story on why Costco's hot dog is still $1.50 drops on YouTube next week.)"),
    ("2026-10-09", "W", "Coke or Pepsi? You have to pick one for the rest of your life. 🥤"),
    ("2026-10-12", "D", "Name a store you miss that doesn't exist anymore. We'll tell the story of the most popular answer. 👇"),
    ("2026-10-14", "M", "Which was the bigger business mistake? A) Blockbuster passing on Netflix B) Kodak shelving its own digital camera"),
    ("2026-10-16", "D", "The lunch counter. The candy by the pound. The goldfish. What do you remember about Woolworth's? 🐠"),
    ("2026-10-19", "D", "The bike wall. The video game tickets. The giraffe. What's your favorite Toys \"R\" Us memory? 🦒"),
    ("2026-10-21", "H", "Which brand do you think makes more money from something other than what it sells? McDonald's, Starbucks, or Costco? (Answer in our videos this month.)"),
    ("2026-10-23", "C", "What toy from your childhood would you buy again today? 🧱"),
    ("2026-10-26", "D", "Did your family get the Sears catalog? What was the first thing you flipped to? 📖"),
    ("2026-10-28", "D", "Kmart, Montgomery Ward, Circuit City, RadioShack. Which one do you miss the most?"),
    ("2026-10-30", "H", "Halloween question: what's the best candy to get in your trick-or-treat bag? 🍫 (And do you know who really owns it?)"),
    ("2026-11-02", "F", "Which founder story should we tell next: Walt Disney, Colonel Sanders, or Milton Hershey? 👇"),
]

CAROUSELS = [  # Instagram Sunday 18:00, 6-8 illustrated slides
    ("2026-10-11", "M", "5 Billion-Dollar Mistakes in 5 Slides",
     "Blockbuster, Kodak, Snapple, Yahoo, New Coke. Which one would you have avoided? Swipe →"),
    ("2026-10-18", "H", "How 4 Famous Brands Really Make Money",
     "Costco = memberships. McDonald's = rent. Starbucks = your prepaid balance. Rolex = a foundation. Swipe for the details →"),
    ("2026-10-25", "D", "Dead Brands Starter Pack",
     "Blockbuster, Toys \"R\" Us, Woolworth, Pan Am, Circuit City. Which one do you miss? Swipe →"),
    ("2026-11-01", "D", "Sears: From Watches to Houses to Gone",
     "The whole Sears story in 8 slides. Full video on our YouTube. Swipe →"),
]

SHORT_TIMES = {  # (weekday_time, weekend_time)
    "TikTok": ("18:00", "12:00"),
    "Instagram": ("10:00", "10:00"),
    "YouTube": ("16:00", "16:00"),
    "Facebook": ("12:00", "12:00"),
}


def dayname(d):
    return dt.date.fromisoformat(d).strftime("%a")


def is_weekend(d):
    return dt.date.fromisoformat(d).weekday() >= 5


def row(date, time, platform, fmt, pid, pillar, title, caption, tags, script, link_note="", fact="", status="Draft"):
    tag_str = " ".join(tags)
    full = f"{caption}\n\n{tag_str}".strip() if tag_str else caption
    return {
        "date": date, "day": dayname(date), "time_ct": time, "platform": platform, "format": fmt,
        "post_id": pid, "pillar": PILLARS[pillar], "title": title, "caption": caption,
        "hashtags": tag_str, "caption_with_hashtags": full, "linked_script": script,
        "link_note": link_note, "fact_check_before_posting": fact, "status": status,
    }


rows = []
for date, pid, p, title, hook, q, topic, script, fact in SHORTS:
    wk = 1 if is_weekend(date) else 0
    base = BASE_TAGS[p]
    lf_note = "Set Shorts 'Related video' to the matching long-form or series playlist"
    rows.append(row(date, SHORT_TIMES["Instagram"][wk], "Instagram", "Reel", pid, p, title,
                    f"{hook}\n\n{q} 👇\n\nFollow {HANDLE} for the stories behind the brands.",
                    base + [topic, "#businessstory"], script, "Cover = cartoon + 3-word hook", fact))
    rows.append(row(date, SHORT_TIMES["Facebook"][wk], "Facebook", "Reel", pid, p, title,
                    f"{hook} {q}", [topic] + (["#nostalgia"] if p == "D" else []), script, "", fact))
    rows.append(row(date, SHORT_TIMES["YouTube"][wk], "YouTube", "Short", pid, p, title + " #shorts",
                    f"{hook} {q}\n\nThe stories behind the brands. Subscribe for weekly full-length stories.",
                    ["#shorts", topic, base[0]], script, lf_note, fact))
    rows.append(row(date, SHORT_TIMES["TikTok"][wk], "TikTok", "Short video", pid, p, title,
                    f"{hook} {q}", base[:2] + [topic, "#learnontiktok"], script,
                    "Pin a comment with the source", fact))

for date, pid, p, title, topic, script, fb_caption in LONGFORM:
    rows.append(row(date, "14:00", "YouTube", "Long-form video (10-15 min)", pid, p, title,
                    "First 2 lines = hook + keywords. Then chapters, sources list, disclosed sponsor/affiliate block, related videos (see outline).",
                    ["#business", "#brandhistory", topic], script,
                    "2 thumbnails in Test & Compare; end screen -> next long-form", "Clear every [VERIFY] in the outline"))
    sat = (dt.date.fromisoformat(date) + dt.timedelta(days=2)).isoformat()
    rows.append(row(sat, "10:00", "Facebook", "Native long-form video", pid, p, title,
                    fb_caption,
                    [topic], script, "Upload the native file (no YouTube link)", "Same as the YouTube version"))

for date, p, text in FB_POSTS:
    rows.append(row(date, "10:00", "Facebook", "Image + question", "FB-" + date[5:].replace("-", ""), p,
                    "Community question", text, [], "12-visual-automation.md (image prompt)",
                    "Illustrated image in house style", ""))

for date, p, title, text in CAROUSELS:
    rows.append(row(date, "18:00", "Instagram", "Carousel (6-8 slides)", "IGC-" + date[5:].replace("-", ""), p, title,
                    f"{text}\n\nSave this for later and follow {HANDLE}.", BASE_TAGS[p] + ["#businessfacts"],
                    "Reuses art from that week's Shorts", "Slide 1 = hook, last slide = CTA", "Same facts as the source Shorts"))

rows.sort(key=lambda r: (r["date"], r["time_ct"], r["platform"]))
with OUT.open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    w.writeheader()
    w.writerows(rows)
print(f"Wrote {len(rows)} rows to {OUT}")
