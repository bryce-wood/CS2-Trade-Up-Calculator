const https = require("https");
const parser = require("node-html-parser");
const fs = require("fs");

getSite();

function getSite() {
	console.log("fetching site!");
	let options = {
		hostname: "counterstrike.fandom.com",
		path: "/wiki/Skins/List",
		method: "GET",
		headers: {
		}
	}

	let response = "";
	let skins = [];
    
	let req = https.request(options, (res) => {
		res.on('data', d => {
			response += d.toString();
		});

		res.on('end', () => {
			let root = parser.parse(response);
			console.log(root);
			let collectionNames = [];
			root.querySelectorAll("h4").forEach(el => {
				// console.log(el.childNodes[-1].childNodes[0]);
				collectionNames.push(el.querySelector('a').childNodes[0].rawText);
			});

			let k = 0;

			root.querySelectorAll(".wikitable").forEach(table => {
                let test = new Array();
                let nextCollection = [];

                nextCollection.push(collectionNames[k]);

                nextCollection.push(new Array()); // Consumer Grade
                nextCollection[1].push("Consumer Grade"); // starts at index 1 bc the collection name is in index 0
                nextCollection.push(new Array()); // Industrial Grade
                nextCollection[2].push("Industrial Grade");
                nextCollection.push(new Array()); // Mil-Spec
                nextCollection[3].push("Mil-Spec");
                nextCollection.push(new Array()); // Restricted
                nextCollection[4].push("Restricted");
                nextCollection.push(new Array()); // Classified
                nextCollection[5].push("Classified");
                nextCollection.push(new Array()); // Covert
                nextCollection[6].push("Covert");
                nextCollection.push(new Array()); // Other
                nextCollection[7].push("Other");

				table.querySelectorAll('tr').forEach((row, idx) => {
					if (idx == 0) {
						return;
					}

					let skin = {};

					skin.weapon = row.querySelector('a').childNodes[0].rawText;
					skin.skin = row.querySelectorAll('span')[0].childNodes[0].rawText;
                    skin.min_wear = 0;
                    skin.max_wear = 1;

                    switch(row.querySelectorAll('span')[1].childNodes[0].rawText) {
                        case "Consumer Grade":
                            nextCollection[1].push(skin);
                            break;
                        case "Industrial Grade":
                            nextCollection[2].push(skin);
                            break;
                        case "Mil-Spec":
                            nextCollection[3].push(skin);
                            break;
                        case "Restricted":
                            nextCollection[4].push(skin);
                            break;
                        case "Classified":
                            nextCollection[5].push(skin);
                            break;
                        case "Covert":
                            nextCollection[6].push(skin);
                            break;
                        default:
                            skin.quality = row.querySelectorAll('span')[1].childNodes[0].rawText;
                            nextCollection[7].push(skin);
                    }

                    //nextCollection.push(skin);
				});
                for (var i = nextCollection.length-1; i > 0; i--) {
                    if(nextCollection[i].length <= 1) {
                        nextCollection.splice(i, 1);
                    }
                }
                skins.push(nextCollection);
				k++;

			})
            fs.writeFile("data.json", JSON.stringify(skins), (error) => {
              if (error) {
                console.error(error);
                throw error;
              }
              console.log("data.json written correctly");
            });
		})
	});

	req.end();
}