mapboxgl.accessToken = "pk.eyJ1IjoiYW1sYW40NSIsImEiOiJjbHp3YWljN3EwZ2FnMmtzZHdzOXFzMWZ2In0.qISvY3zDc53Wbxdg0pCx8A";
const map = new mapboxgl.Map({
container: 'map', // container ID
center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
zoom: 9 // starting zoom
});
const marker=new mapboxgl.Marker({color:"red"}).setLngLat(coordinates).addTo(map);
