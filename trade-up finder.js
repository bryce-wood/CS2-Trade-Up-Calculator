const puppeteer = require("puppeteer");
const { setTimeout } = require("timers/promises");
const fs = require("fs");
const skinsData = fs.readFileSync("./price database.json");
const skins = JSON.parse(skinsData);
var os = require("os");
var requestCount = 0;
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

//singleCollectionTradeups('Kilowatt Case');

updateCollectionPrices("Kilowatt Case");

async function updateAllPrices() {
  let allCollections = [
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
  for (const collection of allCollections) {
    updateCollectionPrices(collection);
  }
}

async function updateCollectionPrices(collection) {
  let wears = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];
  for (const quality in skins[collection]) {
    for (const skin in skins[collection][quality]) {
      for (let i = 0; i < wears.length; i++) {
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
}

// to retrieve all items once, with 5 second delay between items, it'll take a little under 3 hours
// I think that the delay can be as little as 3 seconds, which would take a little under 2 hours
function allTradeups() {
  // find profitable tradeups across all collections and all rarities
  // *** NEEDS TO BE EXTREMELY OPTIMIZED ***
}

function singleQualityTradeups() {
  // combine tradeups across all collections, but only with skins from a single quality
}

// rewrite to use smaller functions and reference prices in database when possible
// for prices in database log the price and the time submitted
async function singleCollectionTradeups(collection) {
  // with given collection name, calculate profitable tradeups within the single collection
  // start by gathering the price and target wear of all wear jumps of every highest tier item (skins[collection].length-1)
  let wears = ["Battle-Scarred", "Well-Worn", "Field-Tested", "Minimal Wear", "Factory New"];
  let collectionSkins = [];
  for (const grade in skins[collection]) {
    let gradeGroup = [];
    for (const skin of skins[collection][grade]) {
      gradeGroup.push(skin);
    }
    collectionSkins.push(gradeGroup);
  }

  let collectionPrices = [];
  for (const grade of collectionSkins) {
    let gradeGroup = [];
    for (const currentSkin of grade) {
      let skinGroup = [];
      for (const wear of wears) {
        // if skin cannot be x wear, dont search for it
        let link = `https://steamcommunity.com/market/listings/730/${currentSkin.weapon} | ${currentSkin.skin} (${wear})`;
        console.log(link);
        let price = await retrievePrice(link, 3); // can be extremely optimized with proxies
        requestCount++;
        skinGroup.push(price);
      }
      gradeGroup.push(skinGroup);
    }
    collectionPrices.push(gradeGroup);
  }

  console.log(collectionPrices);
  // clean up prices
  for (let i = 0; i < collectionPrices.length; i++) {
    for (let j = 0; j < collectionPrices[i].length; j++) {
      for (let k = 0; k < collectionPrices[i][j].length; k++) {
        if (!(typeof collectionPrices[i][j][k] === "number")) {
          // if not a number (-1) then must be in the format $X.XX
          // remove dollar sign and parse float
          collectionPrices[i][j][k] = parseFloat(collectionPrices[i][j][k].substring(1));
        }
      }
    }
  }

  // for each grade in the collection find the max, min, and average price
  // [[grade1bs, grade1ww, etc], [grade2bs, grade3ww]]
  let mins = [];
  let maxes = [];
  let averages = [];
  for (const grade of collectionPrices) {
    let maxNum = Number.MAX_SAFE_INTEGER;
    let gradeMins = [maxNum, maxNum, maxNum, maxNum, maxNum]; // [bsMin, wwMin, ftMin, mwMin, fnMin]
    let gradeMaxes = [0, 0, 0, 0, 0];
    let gradeSums = [0, 0, 0, 0, 0];
    let gradeCount = [0, 0, 0, 0, 0];
    let gradeAverages = [0, 0, 0, 0, 0];
    for (const currentSkin of grade) {
      for (let i = 0; i < currentSkin.length; i++) {
        if (currentSkin[i] == -1) {
          continue;
        }
        gradeCount[i]++;
        if (currentSkin[i] < gradeMins[i]) {
          gradeMins[i] = currentSkin[i];
        }
        if (currentSkin[i] > gradeMaxes[i]) {
          gradeMaxes[i] = currentSkin[i];
        }
        gradeSums[i] += currentSkin[i];
      }
    }
    for (let i = 0; i < gradeAverages.length; i++) {
      gradeAverages[i] = gradeSums[i] / gradeCount[i];
    }
    mins.push(gradeMins);
    maxes.push(gradeMaxes);
    averages.push(gradeAverages);
  }
  console.log(mins);
  console.log(maxes);
  console.log(averages);
  // if 10*price < avgUpTierProfit, log it as a profitable tradeup and calculate profit and chance of profit for each item
  for (let i = 0; i < averages.length - 1; i++) {
    for (let j = 0; j < wears.length; j++) {
      // includes 15% cut steam takes
      if (mins[i][j] * 10 < maxes[i + 1][j] * 0.85) {
        // log potentially profitable tradeup
        console.log(`Getting ${wears[j]} Grade ${i} Skins from the ${colllection} for $${mins[i][j]} each and trade-up to something worth $${maxes[i + 1][j]} can profit`);
      }
      if (mins[i][j] * 10 < averages[i + 1][j] * 0.85) {
        // log typicaly profitable tradeup
        console.log(`Getting ${wears[j]} Grade ${i} Skins from the ${colllection} for $${mins[i][j]} each and trade-up to something worth $${averages[i + 1][j]} typically profits`);
      }
      if (mins[i][j] * 10 < mins[i + 1][j] * 0.85) {
        // log always profitable tradeup ***
        console.log(`Getting ${wears[j]} Grade ${i} Skins from the ${colllection} for $${mins[i][j]} each and trade-up to something worth $${mins[i + 1][j]} always profits`);
      }
    }
  }

  return 0;
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
  console.log(avgWearNeeded);
  return avgWearNeeded;
}

// retrieves the median price of a skin from the steam market based on the buy orders
// url format: `https://steamcommunity.com/market/listings/730/${weapon} | ${skin} (${wear})`
// url example: https://steamcommunity.com/market/listings/730/Zeus x27 | Olympus (Factory New)
async function retrievePrice(url, maxAttempts = 1) {
  let buyPrices,
    buyQuantities = getRawPrice(url, maxAttempts);
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
  console.log(medianPrice);

  return medianPrice;
}

async function getRawPrice(url, maxAttempts) {
  let browser = null;
  // for mac installation doesn't locate automatically, use other if not on mac
  if (os.type() == "Darwin") {
    browser = await puppeteer.launch({executablePath: '/Users/brycewood/.cache/puppeteer/chrome/mac_arm-122.0.6261.69/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
  } else {
    browser = await puppeteer.launch();
  }
  const page = await browser.newPage();

  await page.goto(url);

  let buyPrices = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("#market_commodity_buyreqeusts_table > table > tbody > tr > td:nth-child(1)")).map((x) => x.textContent);
  });
  let attemptCount = 1;
  while (buyPrices.length < 1 && attemptCount < maxAttempts) {
    console.log("No buy prices found, retrying in 5 seconds");
    await setTimeout(5000);
    console.log("Retrieving price... " + attemptCount);
    buyPrices = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("#market_commodity_buyreqeusts_table > table > tbody > tr > td:nth-child(1)")).map((x) => x.textContent);
    });
    attemptCount++;
  }
  if (attemptCount >= 3 || buyPrices.length < 1) {
    console.log("No buy price found, giving up");
    return -1;
  }

  const buyQuantities = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("#market_commodity_buyreqeusts_table > table > tbody > tr > td:nth-child(2)")).map((x) => x.textContent);
  });

  await browser.close();
  return [buyPrices, buyQuantities];
}

/*
const skinsString = JSON.stringify(skins);

fs.writeFileSync("price database.json", skinsString, "utf-8", (err) => {
  if (err) throw err;
  console.log("Data added to file");
});
*/