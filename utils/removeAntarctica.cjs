const fs = require('fs');

const data = JSON.parse(fs.readFileSync('../source-data/land.json', 'utf8'));
const latitudeThreshold = -60;

var coordinatesElements = 0;
var child1Elements = 0;
var child2Elements = 0;
var lonLatElements = 0;
var valuesBelowThreshold = 0;


data.features.forEach(feature => {
    const geom = feature.geometry;   

        if (geom.type === 'MultiPolygon') {

            geom.coordinates = geom.coordinates.map(level1 =>
                level1.map(level2 =>
                    level2.filter(coords => coords[1] > -60)
                )
        );

        //geom.coordinates[[child1][child2][lon,lat]]
        //coordinates is a property with an array value that holds [child1]
        //[child1] holds [child2]
        //[child2] holds [lon,lat]
        //[lon,lat] is what holds the numbers

        // looping through coordinates array
        for (var a = 0; a < geom.coordinates.length; a++) {
            coordinatesElements++;

            // looping through child1 array
            for (var b = 0; b < geom.coordinates[a].length; b++) {
                child1Elements++;

                // looping through child2 array
                for (var c = 0; c < geom.coordinates[a][b].length; c++) {
                    child2Elements++;

                    // looping through [lon,lat] array
                    for (var d = 0; d < geom.coordinates[a][b][c].length; d++) {
                        lonLatElements++;
                    }
                }
            }
        }

    }
   
})

// fs.writeFileSync('land_warren.json', JSON.stringify(data));
console.log(`Elements in the coordinates array: ${coordinatesElements}.`);
console.log(`Elements in the child1 array: ${child1Elements}.`);
console.log(`Elements in the child2 array: ${child2Elements}.`);
console.log(`Elements in the [lon,lat] array: ${lonLatElements}.`);

fs.writeFileSync('../public/land_no_antarctica.json', JSON.stringify(data));

console.log("done");

