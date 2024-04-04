const puppeteer = require("puppeteer");
const { setTimeout } = require("timers/promises");
const fs = require("fs");
const skinsData = fs.readFileSync("./price database.json");
const skins = JSON.parse(skinsData);
const wears = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];
const wearBounds = [0,0.07,0.15,0.37,0.44]; // top bound of each wear
const allCollections = [
  "Anubis Collection",
  "Ancient Collection",
  "Assault Collection",
  "Aztec Collection",
  "Baggage Collection",
  "Bank Collection",
  "Blacksite Collection",
  "Cache Collection",
  "Canals Collection",
  "Chop Shop Collection",
  "Cobblestone Collection",
  "Dust Collection",
  "Dust II Collection",
  "2021 Dust II Collection",
  "Gods and Monsters Collection",
  "Havoc Collection",
  "Inferno Collection",
  "2018 Inferno Collection",
  "Italy Collection",
  "Lake Collection",
  "Militia Collection",
  "Mirage Collection",
  "2021 Mirage Collection",
  "Norse Collection",
  "Nuke Collection",
  "2018 Nuke Collection",
  "Office Collection",
  "Overpass Collection",
  "Rising Sun Collection",
  "Safehouse Collection",
  "St. Marc Collection",
  "Train Collection",
  "2021 Train Collection",
  "Vertigo Collection",
  "2021 Vertigo Collection",
  "Alpha Collection",
  "Control Collection",
  "CS:GO Weapon Case",
  "eSports 2013 Case",
  "Operation Bravo Case",
  "CS:GO Weapon Case 2",
  "Winter Offensive Weapon Case",
  "eSports 2013 Winter Case",
  "CS:GO Weapon Case 3",
  "Operation Phoenix Weapon Case",
  "Huntsman Weapon Case",
  "Operation Breakout Weapon Case",
  "eSports 2014 Summer Case",
  "Operation Vanguard Weapon Case",
  "Chroma Case",
  "Chroma 2 Case",
  "Falchion Case",
  "Shadow Case",
  "Revolver Case",
  "Operation Wildfire Case",
  "Chroma 3 Case",
  "Gamma Case",
  "Gamma 2 Case",
  "Glove Case",
  "Spectrum Case",
  "Operation Hydra Case",
  "Spectrum 2 Case",
  "Clutch Case",
  "Horizon Case",
  "Danger Zone Case",
  "Prisma Case",
  "CS20 Case",
  "Shattered Web Case",
  "Prisma 2 Case",
  "Fracture Case",
  "Operation Broken Fang Case",
  "Snakebite Case",
  "Operation Riptide Case",
  "Dreams & Nightmares Case",
  "Recoil Case",
  "Revolution Case",
  "Kilowatt Case",
];
// default steam fee for CS2 is 15% or 0.15
const TOTAL_FEE = 0.15;
var os = require("os");
var pricesRetrieved = 0;
// console.log(skins['Kilowatt Case'].Classified[1]);

// let weapon = skins['Kilowatt Case'].Classified[1].weapon;
// let skin = skins['Kilowatt Case'].Classified[1].skin;
// let wear = "Factory New";
// let link = `https://steamcommunity.com/market/listings/730/${weapon} | ${skin} (${wear})`
//retrievePrice(link, 3);
let novaGila = {
  collection: "Glove Case",
  quality: "Restricted",
  index: 1, // index of the weapon in the specified quality in the specified collection
  wear: 0.09,
};
let scarEnforcer = {
  collection: "Prisma 2 Case",
  quality: "Restricted",
  index: 1,
  wear: 0.09,
};
// 9x Nova Gila, 1x SCAR-20 Enforcer, all 0.09 wear
// expected output: 0.045 mecha industries, 0.0675 shallow grave, 0.063 wasteland princess, 0.0585 phantom disruptor, 0.09 disco tech, 0.09 justice
// inSkin = [novaGila, novaGila, novaGila, novaGila, novaGila, novaGila, novaGila, novaGila, novaGila, scarEnforcer];
// let outSkins, outWears = calculateOutcome(inSkin);
// console.log(outSkins);
// console.log(outWears);

//singleCollectionTradeups("Kilowatt Case");
singleCollectionTradeupsSmart("Kilowatt Case");

// minTimeSinceLastModified default value is 1 week in milliseconds
async function updateAllPrices(minTimeSinceLastModified = 604_800_000) {
  for (const collection of allCollections) {
    await updateCollectionPrices(collection, minTimeSinceLastModified);
  }
}

// minTimeSinceLastModified default value is 1 week in milliseconds
async function updateCollectionPrices(collection, minTimeSinceLastModified = 604_800_000) {
  for (const quality in skins[collection]) {
    for (const skin in skins[collection][quality]) {
      for (let i = 0; i < wears.length; i++) {
        try {
          if (Date.now() - skins[collection][quality][skin]["Last Modified"][wears[i]] < minTimeSinceLastModified) {
            continue;
          }
        } catch (error) {}
        // url format: `https://steamcommunity.com/market/listings/730/${weapon} | ${skin} (${wear})`
        let weapon = skins[collection][quality][skin].weapon;
        let gunSkin = skins[collection][quality][skin].skin;
        let wear = wears[i];
        let link = `https://steamcommunity.com/market/listings/730/${weapon} | ${gunSkin} (${wear})`;
        let price = await retrievePrice(link);
        // upon retrieval wait 3 seconds so steam doesn't hate us
        await setTimeout(3000);
        // if no price is found, skip to the next skin
        if (price == -1) {
          continue;
        }
        try {
          skins[collection][quality][skin]["Prices"][wears[i]] = price;
        } catch (error) {
          skins[collection][quality][skin]["Prices"] = {};
          skins[collection][quality][skin]["Prices"][wears[i]] = await price;
        }
        try {
          skins[collection][quality][skin]["Last Modified"][wears[i]] = Date.now();
        } catch (error) {
          skins[collection][quality][skin]["Last Modified"] = {};
          skins[collection][quality][skin]["Last Modified"][wears[i]] = Date.now();
        }
      }
    }
  }
  const skinsString = JSON.stringify(skins);

  fs.writeFileSync("price database.json", skinsString, "utf-8", (err) => {
    if (err) throw err;
    console.log(collection + " added to file");
  });
  console.log(collection + " added to file");
}

function allTradeups() {
  for (const collection of allCollections) {
    console.log("Trade-Ups for " + collection);
    singleCollectionTradeups(collection);
  }
}
function singleQualityTradeups() {
  // combine tradeups across all collections, but only with skins from a single quality
}
// acts similarly to singleCollectionTradeups, but also recognizes min-wear and max-wear, making wear changes possible and more chances to profit
function singleCollectionTradeupsSmart(collection) {
  // if min-wear != 0 || max-wear != 1, find potential wear jumps and avg input wear required to do the jump
  // also if max-wear < 1 then need to notate the increased avg in wear needed to get to wears
  // otherwise operates the same and singleCollectionTradeups
  let collectionSkins = retrieveCollectionSkins(collection);
  let cheapestPrices = findCheapestPrices(collectionSkins);

  // go through each collection, skipping the first one
  for (let c = 1; c < collectionSkins.length; c++) {
    // go through each skin in the collection
    for (const s in collectionSkins[c]) {
      let wearUpgradePotential = false;
      let wearDowngradePotential = false;
      // if the skin is not 0-1 wear range, see wear jumps and report required avg_wear
      if (collectionSkins[c][s]['min-wear'] != 0) {
        console.log("up potential");
        wearUpgradePotential = true;
      }
      if (collectionSkins[c][s]['max-wear'] != 1) {
        console.log("down potential");
        wearDowngradePotential = true;
      }
      for (const wear of wears) {
        if (wearUpgradePotential || wearDowngradePotential) {
          console.log(collectionSkins[c][s]);
        } else {
  
        }
      }
    }
  }
}

// *** currently ignorant of min-wear and max-wear, assumes bs makes a bs, mw makes a mw, etc, so it may be incorrect ***
// outputs profitable trade-ups within a single collection
function singleCollectionTradeups(collection) {
  let collectionSkins = retrieveCollectionSkins(collection);
  // returns the actual prices instead of indexes of the cheapest prices for clarity and similarity to other arrays
  let cheapestPrices = findCheapestPrices(collectionSkins);
  let averagePrices = calculateAveragePrices(collectionSkins);
  let averageProfits = calculateAverageProfit(cheapestPrices, averagePrices);
  // only list profitable (on averaged) outputs
  for (const quality in averageProfits) {
    for (const wear in averageProfits) {
      if (averageProfits[quality][wear] > 0) {
        // TODO: output this to a file that can be retrieved after the program expires
        let averagePricesQualityIndex = parseInt(quality) + 1;
        if (cheapestPrices[quality][wear] * 10 < cheapestPrices[averagePricesQualityIndex][wear]) {
          console.log("**********PERFECT TRADEUP!**********");
        }
        console.log(
          "Profitable Tradeup: tradeup item quality " +
            quality +
            " and wear " +
            wear +
            " 10 * " +
            cheapestPrices[quality][wear] +
            " < " +
            averagePrices[averagePricesQualityIndex][wear] +
            ", which profits " +
            averageProfits[quality][wear]
        );
        let skinIndex = findIndexOfPrice(cheapestPrices[quality][wear], collectionSkins, quality, wear);
        let profitableSkin = collectionSkins[quality][skinIndex];
        console.log(profitableSkin.weapon + " | " + profitableSkin.skin + " | " + wears[wear] + " | " + cheapestPrices[quality][wear] + "\n");
      }
    }
  }
}
function findIndexOfPrice(price, collectionSkins, quality, wear) {
  for (let i = 0; i < collectionSkins[quality].length; i++) {
    let skinPrice = collectionSkins[quality][i]["Prices"][wears[wear]];
    if (skinPrice == price) {
      return i;
    }
  }
}
// expects outputs of findCheapestPrices and calculateAveragePrices
// returns an array of profits in the format of [[proft_fn, profit_mw, ...], [profit_fn, ...]]
function calculateAverageProfit(cheapestPrices, averagePrices) {
  let averageProfits = [];
  for (let i = 1; i < averagePrices.length; i++) {
    let qualityProfits = [];
    for (const wear in averagePrices[i]) {
      let profit = averagePrices[i][wear] * TOTAL_FEE - 10 * cheapestPrices[i - 1][wear];
      qualityProfits.push(profit);
    }
    averageProfits.push(qualityProfits);
  }
  return averageProfits;
}
// when given an array of skins of qualities, finds the average price of each wear tier for a quality
// returns prices in the format of [[fn, mw, ft, ww, bs], [fn, ...], ...] or [Mil-Spec, Restricted, ...]
function calculateAveragePrices(collectionSkins) {
  let averagePrices = [];
  for (const quality in collectionSkins) {
    // will have all 5 wears
    let qualityAverages = [];
    for (const wear of wears) {
      // will have just this wear
      let sum = 0;
      let count = 0;
      for (const skin in collectionSkins[quality]) {
        count++;
        sum += collectionSkins[quality][skin]["Prices"][wear];
      }
      qualityAverages.push(sum / count);
    }
    averagePrices.push(qualityAverages);
  }
  return averagePrices;
}
// retrieves the prices of the cheapest skin in arrays, expects it in the format retrieveCollectionSkins outputs
// returns prices in the format of [[fn, mw, ft, ww, bs], [fn, ...], ...] or [Mil-Spec, Restricted, ...]
function findCheapestPrices(collectionSkins) {
  let cheapestPrices = [];
  for (const quality in collectionSkins) {
    let wearPrices = [];
    // for each wear in a quality, get the cheapest price
    for (const wear of wears) {
      let cheapestPrice;
      for (const skin in collectionSkins[quality]) {
        if (!cheapestPrice || cheapestPrice.length < 1) {
          try {
            if (collectionSkins[quality][skin]["Prices"][wear]) {
              cheapestPrice = collectionSkins[quality][skin]["Prices"][wear];
            }
            continue;
          } catch (error) {
            continue;
          }
        } else {
          let skinPrice;
          try {
            skinPrice = collectionSkins[quality][skin]["Prices"][wear];
            if (skinPrice < cheapestPrice) {
              cheapestPrice = skinPrice;
            }
          } catch (error) {
            continue;
          }
        }
      }
      // for this wear, add it to the wearPrices
      wearPrices.push(cheapestPrice);
    }
    // for this quality, add all of the wearPrices
    cheapestPrices.push(wearPrices);
  }
  return cheapestPrices;
}
// retrieves all skins from the collection from the .json and returns an array with skin objects at the ends
// returns collectionSkins of length = num of qualities in collection, that contains arrays for each quality that ontains skin objects for each skin in that quality
function retrieveCollectionSkins(collection) {
  let collectionSkins = [];
  for (const quality in skins[collection]) {
    let qualitySkins = [];
    for (const skin in skins[collection][quality]) {
      qualitySkins.push(skins[collection][quality][skin]);
    }
    collectionSkins.push(qualitySkins);
  }
  return collectionSkins;
}
// given 10 "inputSkins" calculate the probability and wear of each skin from the trade-up
// inputSkins will be a list of Arrays, each array will be constructed like this: {collection, quality, index, wear}
// recontructed skin from array to retrieve from JSON would be: skins[collection][quality][index]
function calculateOutcome(inputSkins) {
  // error handling (exactly 10 skins that exist, have possible wear, and are of the same quality)
  if (inputSkins.length != 10) {
    console.log("There are not exactly 10 input skins, there are " + inputSkins.length);
    return;
  }
  for (let i = 1; i < inputSkins.length; i++) {
    if (!inputSkins[i - 1] || !inputSkins[i]) {
      console.log("Input skin missing! At index " + (i - 1) + " or " + i);
      return;
    }
    if (inputSkins[0].wear < 0 || inputSkins[0].wear > 1) {
      console.log(`Impossible wear! At index 0 (${inputSkins[0].wear})`);
      return;
    }
    if (inputSkins[i].wear < 0 || inputSkins[i].wear > 1) {
      console.log(`Impossible wear! At index ${i} (${inputSkins[i].wear})`);
      return;
    }
    if (inputSkins[i - 1].quality != inputSkins[i].quality) {
      console.log(`Quality mismatch! At index ${i - 1} (${inputSkins[i - 1].quality}) and index ${i} (${inputSkins[i].quality})`);
      return;
    }
    try {
      skins[inputSkins[i].collection][inputSkins[i].quality][inputSkins[i].index];
    } catch (error) {
      console.log(`No such weapon found in collection "${inputSkins[i].collection}" with quality "${inputSkins[i].quality}" and index ${inputSkins[i].index}`);
      return;
    }
  }
  // then figure out the next rarity (and ensure that all skins can trade up to it)
  let inQuality = inputSkins[0].quality;
  let qualities = ["Consumer Grade", "Industrial Grade", "Mil-Spec", "Restricted", "Classified", "Covert"];
  let outQuality = qualities[1 + qualities.findIndex((x) => x == inQuality)];
  for (let i = 0; i < inputSkins.length; i++) {
    try {
      skins[inputSkins[i].collection][outQuality][0];
    } catch (error) {
      console.log(`Skin at index ${i} cannot be upgraded to ${outQuality}`);
    }
  }
  // figure out which collections/skins are involved
  let outputSkins = [];
  for (let i = 0; i < inputSkins.length; i++) {
    for (let j = 0; j < skins[inputSkins[i].collection][outQuality].length; j++) {
      outputSkins.push(skins[inputSkins[i].collection][outQuality][j]);
    }
  }
  let totalCount = outputSkins.length;
  let uniqueSkins = [];
  for (let i = 0; i < totalCount; i++) {
    if (uniqueSkins.indexOf(outputSkins[i]) == -1) {
      uniqueSkins.push(outputSkins[i]);
    }
  }
  let uniqueSkinsCount = [];
  for (let i = 0; i < outputSkins.length; i++) {
    let currentCount = 0;
    for (let j = 0; j < outputSkins.length; j++) {
      if (uniqueSkins[i] == outputSkins[j]) {
        currentCount++;
      }
    }
    if (currentCount > 0) {
      uniqueSkinsCount.push(currentCount);
    }
  }
  // calculate percent chance for each skin
  let uniqueSkinsProbability = [];
  for (let i = 0; i < uniqueSkins.length; i++) {
    let probability = uniqueSkinsCount[i] / totalCount;
    uniqueSkinsProbability.push(probability);
  }
  // calculate wear of each output skin (categorizing into fn, mw, ft, ww, bs)
  // start by calculating average wear
  // outWear = avgWear(maxWear - minWear) + minWear
  let sumWears = 0;
  for (let i = 0; i < 10; i++) {
    sumWears += inputSkins[i].wear;
  }
  let averageWear = sumWears / 10;
  // fixes float math
  averageWear = Math.round(averageWear * 10 ** 16) / 10 ** 16;
  let outWears = [];
  for (let i = 0; i < uniqueSkins.length; i++) {
    let scaledWear = averageWear * (uniqueSkins[i].max_wear - uniqueSkins[i].min_wear) + uniqueSkins[i].min_wear;
    // fixes float math
    scaledWear = Math.round(scaledWear * 10 ** 16) / 10 ** 16;
    outWears.push(scaledWear);
  }
  return [uniqueSkins, outWears];
}
function calculateWearTarget(outputSkin, targetWear) {
  // use the equation: (targetWear - minWear) / (maxWear - minWear) = avgWearNeeded
  // double check with an online tradeup calculator before using
  let avgWearNeeded = (targetWear - outputSkin.min_wear) / (outputSkin.max_wear - outputSkin.min_wear);
  console.log("avgWearNeeded: " + avgWearNeeded);
  return avgWearNeeded;
}
// retrieves the median price of a skin from the steam market based on the buy orders
// url format: `https://steamcommunity.com/market/listings/730/${weapon} | ${skin} (${wear})`
// url example: https://steamcommunity.com/market/listings/730/Zeus x27 | Olympus (Factory New)
async function retrievePrice(url, maxAttempts = 2) {
  let [buyPrices, buyQuantities] = await getRawPrice(url, maxAttempts);
  if (buyPrices == -1 || buyQuantities == -1) {
    return -1;
  }
  //console.log(buyPrices);
  //console.log(buyQuantities);
  let ordersIllustrated = [];
  for (let i = 0; i < buyQuantities.length - 1; i++) {
    for (let j = 0; j < parseInt(buyQuantities[i]); j++) {
      ordersIllustrated.push(buyPrices[i]);
    }
  }
  let medianPrice = ordersIllustrated[Math.floor(ordersIllustrated.length / 2)];
  if (typeof medianPrice != "string" || medianPrice.length < 2) {
    return -1;
  }
  medianPrice = parseFloat(medianPrice.substring(1));
  console.log(url + " | " + medianPrice);
  pricesRetrieved++;

  return medianPrice;
}
async function getRawPrice(url, maxAttempts) {
  let browser = null;
  // for mac installation doesn't locate automatically, use other if not on mac
  if (os.type() == "Darwin") {
    browser = await puppeteer.launch({
      executablePath: "/Users/brycewood/.cache/puppeteer/chrome/mac_arm-122.0.6261.69/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
      timeout: 300_000,
    });
  } else {
    browser = await puppeteer.launch({
      timeout: 300_000,
    });
  }
  const page = await browser.newPage();

  await page.goto(url);
  let buyPrices = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("#market_commodity_buyreqeusts_table > table > tbody > tr > td:nth-child(1)")).map((x) => x.textContent);
  });
  let attemptCount = 1;
  while (buyPrices.length < 1 && attemptCount < maxAttempts) {
    console.log("No buy price found, retrying in 5 seconds");
    await setTimeout(5000);
    buyPrices = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("#market_commodity_buyreqeusts_table > table > tbody > tr > td:nth-child(1)")).map((x) => x.textContent);
    });
    attemptCount++;
  }
  if (attemptCount >= 3 || buyPrices.length < 1) {
    console.log("No buy price found, giving up | " + url);
    browser.removeAllListeners();
    await browser.close();
    return [-1, -1];
  }

  const buyQuantities = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("#market_commodity_buyreqeusts_table > table > tbody > tr > td:nth-child(2)")).map((x) => x.textContent);
  });
  browser.removeAllListeners();
  await browser.close();
  return [buyPrices, buyQuantities];
}

function instantiateTheUninstatiated() {
  for (const collection in skins) {
    for (const quality in skins[collection]) {
      for (const skin in skins[collection][quality]) {
        for (let i = 0; i < wears.length; i++) {
          try {
            let price = skins[collection][quality][skin]["Prices"][wears[i]];
            if (price == undefined || price == -1) {
              skins[collection][quality][skin]["Prices"][wears[i]] = -1;
              skins[collection][quality][skin]["Last Modified"][wears[i]] = Date.now();
              console.log("here");
            }
          } catch (error) {
            skins[collection][quality][skin]["Prices"] = {};
            skins[collection][quality][skin]["Prices"][wears[i]] = -1;
            console.log("here");
            try {
            } catch (error) {
              skins[collection][quality][skin]["Last Modified"] = {};
              skins[collection][quality][skin]["Last Modified"][wears[i]] = Date.now();
            }
          }
        }
      }
    }
  }
}

// only needs to be run when the prices and times are not instantiated, which only happens
// if new collection is not added with prices
//instantiateTheUninstatiated();

// const skinsString = JSON.stringify(skins);
// fs.writeFileSync("price database.json", skinsString, "utf-8", (err) => {
//   if (err) throw err;
// });

/*
updateAllPrices().then(() => {
  console.log("Number of Prices Retrieved in this Session: " + pricesRetrieved);
  process.exit();
});
*/