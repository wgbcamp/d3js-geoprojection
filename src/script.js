// import d3
import * as d3 from "d3";

//capture video
// var mediaRecorder;

//  navigator.mediaDevices.getDisplayMedia({ video: true, preferCurrentTab: true })
//         .then(function(stream) {

//             const options = {
//                 videoBitsPerSecond: 500000000,
//             };

//             mediaRecorder = new MediaRecorder(stream, options);

//             let chunks = [];

//             mediaRecorder.ondataavailable = (e) => {
//                 if (e.data && e.data.size > 0) {
//                     chunks.push(e.data);
//                 }
//             }

//             mediaRecorder.onstop = function () {
//                 const blob = new Blob(chunks, { type: 'image/png' });
//                 const url = URL.createObjectURL(blob);
//                 const a = document.createElement('a');
//                 a.href = url;
//                 a.download = 'canvas-recording.mp4';
//                 if (window.confirm("Download video?")) {
//                     a.click();
//                 }
//             }

//             mediaRecorder.start();

//         })
//         .catch(function(err) {
//             console.log("Error accessing display media:", err);
//         });

// testing screen recording frames to png
// const start = async () => {
//     const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
// }

// start();

// svg dimensions
const height = 500;
const width = 940;

// svg container
const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

// d3 projection
var projection;

// d3 path generator
var path;

//variables for json files
var geoJson;
var commitments;

// array of country centroids
var centroids = [

];

// array of commitment types
var types = [
    {name: "GRA", color: "rgb(255, 255,255)"}, 
    {name: "PRGT", color: "rgb(183, 47, 49)"}, 
    {name: "RST", color: "rgb(76, 123, 58)"}
];

// fetch geoJson file
const dataPoints = async () => {
    var getData = await fetch('data/custom.geo.json');
    geoJson = await getData.json();
    var getCommmitments = await fetch(`data/output.json`);
    commitments = await getCommmitments.json();

    // assign projection and path values
    projection = d3.geoOrthographic().fitSize([width, height], geoJson).rotate([-10, 0]);
    path = d3.geoPath().projection(projection);

    // calculate centroids for every country
    for (var i = 0; i < geoJson.features.length; i++) {
        for (var a = 0; a < commitments.length; a++) {
            if (geoJson.features[i].properties.admin == commitments[a].Member) {
                centroids.push({
                    coordinates: path.centroid(geoJson.features[i]),
                    name: geoJson.features[i].properties.admin,
                    flag: `flags/${geoJson.features[i].properties.admin.replaceAll(/[- ]/g, "_").toLowerCase()}.png`
                });
                console.log(geoJson.features[i].properties.admin.replaceAll(/[- ]/g, "_").toLowerCase());
                break;
            }
        }
        if (i == geoJson.features.length - 1) {
            console.log(centroids);
        }
    }
    console.log(geoJson);

    // appends a path including all features (boundaries) (works with countries & provinces)
    svg.selectAll("path")
        .data(geoJson.features)
        .join("path")
            .attr("d", path)
            .attr("fill", "rgba(72, 153, 210, 1)")
            .attr("stroke", "black")
            .attr("stroke-width", 0);

};

dataPoints();

// year ticker
var year = 1952;

// testing rotation
var rotation = [0,0];
// d3.timer((elapsed) => {
//     const rotate = projection.rotate();
//     projection.rotate([
//         rotate[0] - 1,
//         rotate[1]
//     ]);
//     path = d3.geoPath().projection(projection);
//     svg.selectAll("path")
//         .attr("d", path);
//         console.log(elapsed)

//     }, 1000);

setInterval(() => {
    rotation[0] = rotation[0] - 1;
            path = d3.geoPath().projection(projection.rotate(rotation));

            svg.selectAll("path")
            .data(geoJson.features)
            .join("path")
            .attr("d", path)
            .attr("fill", "rgba(72, 153, 210, 1)")
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        
        
}, 20);

// setInterval(() => {
//     if (year <= 2025) {

//         // clear images from document
//         var previousFlags;
//         previousFlags = document.querySelectorAll('.flagImage');
//         for (var i = 0; i < previousFlags.length; i++) {
//             previousFlags[i].remove();
//         }


//         for (var i = 0; i < commitments.length; i++) {
//             if (commitments[i].Year == year) {
//                 console.log(commitments[i]);

//                 // append the flag images to the map
//                 for (var a = 0; a < centroids.length; a++) {
//                     if (commitments[i].Member == centroids[a].name) {
//                         for (var b = 0; b < types.length; b++) {
//                             if (types[b].name == commitments[i].Type) {
//                                 svg.append("rect")
//                                 .attr("x", centroids[a].coordinates[0] - 25)
//                                 .attr("y", centroids[a].coordinates[1] - 18)
//                                 .attr("width", 50)
//                                 .attr("height", 36)
//                                 .attr("fill", types[b].color)
//                                 .attr("class", "flagImage")
//                                 .attr("class", "fadeInFlag");
//                             }
//                         }

//                     svg.append("image")
//                         .attr("href", centroids[a].flag)
//                         .attr("x", centroids[a].coordinates[0] - 25.5)
//                         .attr("y", centroids[a].coordinates[1] - 18.5)
//                         .attr("width", 49)
//                         .attr("height", 35)
//                         .attr("id", centroids[a].name)
//                         .attr("class", "flagImage")
//                         .attr("class", "fadeInFlag");
//                     } 
//                 }
//             }
//         }
//         year++;
//     } else {
//         // mediaRecorder.stop();
//     }
// }, 5000, year);


// append svg to #map div
map.append(svg.node());
