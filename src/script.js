// import d3
import * as d3 from "d3";
import * as htmlToImage from 'html-to-image';

// svg dimensions
const height = 2160;
const width = 3840;

// svg container
const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "testing");

// d3 projection
var projection;
var backgroundProjection;

// d3 path generator
var path;
var backgroundPath;

//variables for json files
var geoJson;
var background;
var commitments;

// array of country centroids
var centroids = [];

// array of commitment types
var types = [
    {name: "GRA", color: "rgba(255, 255, 255, 0.77)"}, 
    {name: "PRGT", color: "rgb(183, 47, 49)"}, 
    {name: "RST", color: "rgb(76, 123, 58)"}
];

// fetch geoJson file
const dataPoints = async () => {
    var getData = await fetch('/d3js-geoprojection/countries.json');
    geoJson = await getData.json();
    console.log("geoJson:")
    console.log(geoJson);
    var getBackground = await fetch('/d3js-geoprojection/land.json');
    background = await getBackground.json();
    console.log("background:")
    console.log(background);

    var getCommmitments = await fetch(`/d3js-geoprojection/output.json`);
    commitments = await getCommmitments.json();

    // assign projection and path values
    projection = d3.geoNaturalEarth1().fitSize([width, 2860], geoJson).rotate([-10, 0]);
    path = d3.geoPath().projection(projection);
    backgroundProjection = d3.geoNaturalEarth1().fitSize([width, 2860], background).rotate([-10, 0]);
    backgroundPath = d3.geoPath().projection(backgroundProjection);

    // calculate centroids for every country
    for (var i = 0; i < geoJson.features.length; i++) {
        for (var a = 0; a < commitments.length; a++) {
            if (geoJson.features[i].properties.ADMIN == commitments[a].Member) {
                centroids.push({
                    coordinates: path.centroid(geoJson.features[i]),
                    name: geoJson.features[i].properties.ADMIN,
                    flag: `/d3js-geoprojection/flags/${geoJson.features[i].properties.ADMIN.replaceAll(/[- ]/g, "_").toLowerCase()}.png`
                });
                // console.log(geoJson.features[i].properties.ADMIN.replaceAll(/[- ]/g, "_").toLowerCase());
                break;
            }
        }
        if (i == geoJson.features.length - 1) {
            console.log("centroids:")
            console.log(centroids);
        }
    }

    // appends the path landmass geojson
    svg.selectAll("path")
    .data(background.features)
    .join("path")
        .attr("d", backgroundPath)
        .attr("fill", "rgba(72, 153, 210, 1)");
};

dataPoints();

// convert svg to png
const convertSvgToPng = () => {
    const svgElement = document.getElementById('map');

    htmlToImage.toPng(svgElement, {
        width: 3840,
        height: 2160,
        pixelRatio: 1
    })
        .then(function (dataUrl) {
            const img = new Image();
            img.src = dataUrl;
            document.body.appendChild(img);
            console.log(img);

            const link = document.createElement('a');
            link.download = `Year_${year}.png`;
            link.href = dataUrl;
            link.click();
            year++;
        })
        .catch(function (error) {
            console.error(error);
        });
}


// year ticker
var year = 1952;

// svg flag height
const flagWidth = 63;
const flagHeight = 47;

// array to store space consumed by all flag images
let rectangles = [];
var lines = [];
var flagsDrawn = 0;

// placing source specific dots
const dotPlacement = (x, y, color, multiplier) => {
    // add the dot next to the flag
    svg.append("circle")
        .attr("cx", x + 120)
        .attr("cy", y + (20 * multiplier))
        .attr("r", 6)
        .attr("fill", color)
        .attr("class", "flagImage");
}


setInterval(() => {
    // stop counter when year hits 2025
    if (year <= 2025) {

        var invalidSpaces = [];

        // clear images from svg tag
        var previousFlags = [];
        previousFlags = document.querySelectorAll('.flagImage');
        for (var i = 0; i < previousFlags.length; i++) {
            previousFlags[i].remove();
        }

        // store flag objects to track which assets have been loaded for the year
        var currentFlags = [];

        // loop through the commitments json object
        for (var i = 0; i < commitments.length; i++) {
            
            // track the array element that represents the current flag for the current commitment
            var currentFlagIndex = 0;

            // only continue the rest of the code block if the commitment object's year property matches
            if (commitments[i].Year == year) {
                // console.log(commitments[i]);

                // If currentFlag array length is greater than 0, then find if it exists.
                // If currentFlag array length is 0, then push to array
                if (currentFlags.length > 0) {
                    for (var g = 0; g < currentFlags.length; g++) {

                        // if flag name already exists in currentFlags array, then just set currentFlagIndex to its position
                        if (currentFlags[g].name == commitments[i].Member) {
                            currentFlagIndex = g;
                            break;
                        }
                    }

                    // if the currentFlagIndex was not updated, then push the commitment object's member property
                    if (currentFlagIndex == 0) {
                        currentFlags.push({name: commitments[i].Member, flagPosition: "", status: "none", typeArray: [], dotCount: 1});
                    }
                } else {           
                    // push the commitment object's member property with a blank flagPosition value to the currentFlags array
                    currentFlags.push({name: commitments[i].Member, flagPosition: "", status: "none", typeArray: [], dotCount: 1});
                }

                // loop through the centroids array
                for (var a = 0; a < centroids.length; a++) {
                    
                    // run code only if the member property matches a centroids name property
                    if (commitments[i].Member == centroids[a].name) {     

                        // loop through the loan types array
                        for (var b = 0; b < types.length; b++) {

                            // only run if a loan types name matches a commitment type value
                            if (types[b].name == commitments[i].Type) {

                                // loop through the currentFlags array and place a dot if the flag has been placed
                                // otherwise place the flag and track the status as "placed"
                                for (var e = 0; e < currentFlags.length; e++) {
                                    if (currentFlags[e].name == commitments[i].Member && currentFlags[e].flagPosition != "") {
                                        currentFlags[e].dotCount++;
                                        console.log(currentFlags[e]);

                                        // if commitment type is not included in the typeArray of the element in the currentFlags array
                                        // then run the dotPlacement function and add the type to the type array
                                        // this prevents multiple dots of the same color from appearing 
                                        // if (!currentFlags[e].typeArray.includes(types[b].name)) {
                                        // dotPlacement(currentFlags[currentFlagIndex].flagPosition.x,
                                        //     currentFlags[currentFlagIndex].flagPosition.y,
                                        //     types[b].color, currentFlags[e].dotCount
                                        // );
                                        // currentFlags[e].typeArray.push(types[b].name);   
                                        // }
  
                                        break;
                                    
                                    // run the drawNonIntersectingLine function and push the type to the typeArray if no flag has been placed
                                    } else if ((currentFlags[e].name == commitments[i].Member) && (currentFlags[e].status == "none")) {
                                        drawNonIntersectingLine(centroids[a].coordinates[0], centroids[a].coordinates[1], e);
                                        currentFlags[e].status = "placed";
                                        currentFlags[e].typeArray.push(types[b].name);
                                        break;
                                    }
                                }
                                                  
                                // Function to draw a line without intersections
                                function drawNonIntersectingLine(startX, startY, flagArrayPosition) {
                                    // let attempts = 0;
                                    // while (attempts < 1000) {
                                        var length = 50; 
                                        let endX = startX;
                                        let endY = startY - length;

                                        var newLine = { x1: startX, y1: startY, x2: endX, y2: endY };
                                        // var newRect = { yMin: newLine.y2 - flagHeight / 2, 
                                        //                 yMax: newLine.y2 + flagHeight / 2,
                                        //                 xMin: newLine.x2 - flagWidth / 2,
                                        //                 xMax: newLine.x2 + flagWidth / 2
                                        //                 };

                                        var attempts = [];
                                        if (invalidSpaces == []) {

                                        } else {
                                            for (var f = 0; f < invalidSpaces.length; f++) {
                                                // while (Math.abs(invalidSpaces[f].x2 - newLine.x2) < 63) {
                                                //     newLine.x2 = newLine.x2 + Math.random() * 100;
                                                //     invalidSpaces.push(newLine);
                                                // }            
                                                // if ((Math.abs(invalidSpaces[f].x2 - newLine.x2) < 63) && (Math.abs(invalidSpaces[f].y2 - newLine.y2) < 47)) {
                                                //     console.log("YES");
                                                //     // invalidSpaces.push(newLine);
                                                //     // newLine.x2 = newLine.x2 + 100;
                                                // }

                                                while ((Math.abs(invalidSpaces[f].x2 - newLine.x2) < 63) && (Math.abs(invalidSpaces[f].y2 - newLine.y2) < 47)) {
                                                    var sameAttemptDetect = false;
                                                    // if (attempts.length > 0) {
                                                    //     for (var z = 0; z < attempts.length; z++) {
                                                    //         if (newLine == attempts[z]) {
                                                    //             console.log("same attempt detected");
                                                    //             console.log(newLine);
                                                    //             sameAttemptDetect = true;
                                                    //             break;
                                                    //         }
                                                    //     }
                                                    // }

                                                    if (sameAttemptDetect == false) {
                                                        attempts.push(newLine);
                                                    }

                                                   
                                                    console.log("YES");
                                                    newLine.y2 = newLine.y2 -  100;
                                                    f = 0;
                                                }
                                                if (commitments[i].Member == "Senegal" && f == invalidSpaces.length-1) {        
                                                    console.log(`SENEGAL PASSED with a width check of ${Math.abs(invalidSpaces[f].x2 - newLine.x2)}
                                                        and a height check of ${Math.abs(invalidSpaces[f].y2 - newLine.y2)}`);
                                                }
                                            }
                                        }

                                            // push to lines array
                                            lines.push(newLine);
                                            invalidSpaces.push(newLine);


                                         


                                            // Draw the line
                                            svg.append("line")
                                                .attr("x1", newLine.x1)
                                                .attr("y1", newLine.y1)
                                                .attr("x2", newLine.x2)
                                                .attr("y2", newLine.y2)
                                                .attr("stroke", "rgb(180, 180, 180")
                                                .attr("stroke-width", 2)
                                                .attr("class", "flagImage");
                                            
                                            // Make the circle...
                                            svg.append("circle")
                                                .attr("cx", (centroids[a].coordinates[0] - (flagWidth / 2)) + (flagWidth / 2))
                                                .attr("cy", (centroids[a].coordinates[1] - (flagHeight / 2)) + (flagHeight / 2))
                                                .attr("r", 5)
                                                .attr("fill", "white")
                                                .attr("class", "flagImage");
                                            
                                            // append box shadow and then image
                                            const defs = svg.append("defs");

                                            const filter = defs.append("filter")
                                                .attr("id", "boxShadow")
                                                .attr("x", "-20%")
                                                .attr("y", "-20%")
                                                .attr("width", "140%")
                                                .attr("height", "140%");

                                            filter.append("feDropShadow")
                                                .attr("dx", 0)
                                                .attr("dy", 4)
                                                .attr("stdDeviation", 6)
                                                .attr("flood-color", "black")
                                                .attr("flood-opacity", 0.3);

                                            svg.append("image")
                                                .attr("href", centroids[a].flag)
                                                .attr("x", newLine.x2 - flagWidth /2)
                                                .attr("y", newLine.y2 - flagHeight /2)
                                                .attr("width", flagWidth)
                                                .attr("height", flagHeight)
                                                .attr("id", centroids[a].name)
                                                .attr("class", "flagImage")
                                                .attr("filter", "url(#boxShadow");

                                            // store the flag position of the last added element
                                            if (currentFlags[flagArrayPosition].flagPosition == "") {
                                                currentFlags[flagArrayPosition].flagPosition = {x: (newLine.x2 - flagWidth / 2), y: (newLine.y2 - flagHeight / 2)};
                                            }
                                            flagsDrawn++;
                                            console.log("flagsDrawn");
                                            console.log(flagsDrawn);

                                        //    dotPlacement(currentFlags[flagArrayPosition].flagPosition.x, 
                                        //     currentFlags[flagArrayPosition].flagPosition.y, 
                                        //     types[b].color, 1
                                        //     );
                                            return; // done
                                        
                                    // }
                                    // console.warn("Could not place a non-intersecting line after many tries.");
                                }                                                         
                            }
                        }
                    } 
                }
            }
        }
        // convertSvgToPng();
        year++;
    } else {
        // mediaRecorder.stop();
    }
}, 2000, year);


// append svg to #map div
map.append(svg.node());
