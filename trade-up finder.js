const puppeteer = require('puppeteer');
const { setTimeout } = require('timers/promises');
const skins = require('./cs2_skins_database.json');

var requestCount = 0;
// console.log(skins['Kilowatt Case'].Classified[1]);

// let weapon = skins['Kilowatt Case'].Classified[1].weapon;
// let skin = skins['Kilowatt Case'].Classified[1].skin;
// let wear = "Factory New";

// let link = `https://steamcommunity.com/market/listings/730/${weapon} | ${skin} (${wear})`

//retrievePrice(link);

let novaGila = {
    collection: "Glove Case",
    quality: "Restricted",
    index: 1, // index of the weapon in the specified quality in the specified collection
    wear: 0.09
}

let scarEnforcer = {
    collection: "Prisma 2 Case",
    quality: "Restricted",
    index: 1,
    wear: 0.09
}

// 9x Nova Gila, 1x SCAR-20 Enforcer, all 0.09 wear
// expected output: 0.045 mecha industries, 0.0675 shallow grave, 0.063 wasteland princess, 0.0585 phantom disruptor, 0.09 disco tech, 0.09 justice
inSkin = [novaGila, novaGila, novaGila, novaGila, novaGila, novaGila, novaGila, novaGila, novaGila, scarEnforcer];
//let outSkins, outWears = calculateOutcome(inSkin);
//console.log(outSkins);
//console.log(outWears);

singleCollectionTradeups('Blacksite Collection');

// to retrieve all items once, with 5 second delay between items, it'll take a little under 3 hours
// I think that the delay can be as little as 3 seconds, which would take a little under 2 hours
function allTradeups() {
    // find profitable tradeups across all collections and all rarities
    // *** NEEDS TO BE EXTREMELY OPTIMIZED ***
}

function singleQualityTradeups() {
    // combine tradeups across all collections, but only with skins from a single quality
}

function singleCollectionTradeups(collection) {
    // with given collection name, calculate profitable tradeups within the single collection
    // start by gathering the price and target wear of all wear jumps of every highest tier item (skins[collection].length-1)
    let wears = ['Battle-Scarred', 'Well-Worn', 'Field-Tested', 'Minimal Wear', 'Factory New'];
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
                let link = `https://steamcommunity.com/market/listings/730/${currentSkin.weapon} | ${currentSkin.skin} (${wear})`;
                let price = retrievePrice(link);
                requestCount++;
                skinGroup.push(price);
            }
            gradeGroup.push(skinGroup);
        }
        collectionPrices.push(gradeGroup);
    }

    console.log(collectionPrices);
    // then find the price and target wear, etc. of the second highest tier item
    // if 10*price < avgUpTierProfit, log it as a profitable tradeup and calculate profit and chance of profit for each item

    // repeat down to the lowest tier (will prob want a for loop)

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
        if (!inputSkins[i-1] || !inputSkins[i]) {
            console.log("Input skin missing! At index " + (i-1) + " or " + i);
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
        if (inputSkins[i-1].quality != inputSkins[i].quality) {
            console.log(`Quality mismatch! At index ${i-1} (${inputSkins[i-1].quality}) and index ${i} (${inputSkins[i].quality})`);
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
    let outQuality = qualities[1 + qualities.findIndex( (x) => x == inQuality)];
    for (let i = 0; i < inputSkins.length; i++) {
        try {
            skins[inputSkins[i].collection][outQuality][0];
        } catch (error) {
            console.log(`Skin at index ${i} cannot be upgraded to ${outQuality}`)
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
    averageWear = Math.round(averageWear * 10**16) / 10**16;
    let outWears = [];
    for (let i = 0; i < uniqueSkins.length; i++) {
        let scaledWear = averageWear * (uniqueSkins[i].max_wear - uniqueSkins[i].min_wear) + uniqueSkins[i].min_wear;
        // fixes float math
        scaledWear = Math.round(scaledWear * 10**16) / 10**16;
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
async function retrievePrice(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);

    const buyPrices = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("#market_commodity_buyreqeusts_table > table > tbody > tr > td:nth-child(1)")).map(x => x.textContent);
    });

    if (buyPrices.length < 1) {
        console.log("No buy prices found, retrying in 5 seconds");
        await setTimeout(5000);
        console.log("Retrieving price...");
        return retrievePrice(url);
    }

    const buyQuantities = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("#market_commodity_buyreqeusts_table > table > tbody > tr > td:nth-child(2)")).map(x => x.textContent);
    });
    
    await browser.close();

    console.log(buyPrices);
    console.log(buyQuantities);
    let ordersIllustrated = [];
    
    for (let i = 0; i < buyQuantities.length-1; i++) {
        for (let j = 0; j < parseInt(buyQuantities[i]); j++) {
            ordersIllustrated.push(buyPrices[i]);
        }
    }
    
    let medianPrice = ordersIllustrated[Math.floor(ordersIllustrated.length/2)];
    console.log(medianPrice);

    return medianPrice;
}

console.log("number of requests: " + requestCount);