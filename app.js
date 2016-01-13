var mapboxKey = 'pk.eyJ1IjoiZ3NjcGxhbm5pbmciLCJhIjoiRVZMNXpsQSJ9.5OxUlJTCDplPkdkKNlB91A';

var map = L.map('map', {
    attributionControl: false
})
    .setView([38.054772, -84.483393], 17);

L.control.attribution().addAttribution("<a href='http://www.zillow.com/' target='_blank'>Zillow.com</a>").addTo(map);

var base = new L.tileLayer.grayscale('http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    id: 'lexhousingstudies.ombga57e',
    accessToken: mapboxKey,
    quotaDividerTune: 9
}).addTo(map);

var grapi;
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = (props ?
        '<h3>' + props.ADDRESS + '</h3><hr /><b>Zestimate: $</b>' + props.zest
        : 'Hover over a parcel for Zillow Zestimate');
};

info.addTo(map)

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 1.5,
        color: '#FFFF33',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
	grapi.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function getColor(d) {
	return d == null ? "#67676c": 
        d >= 90000 ? "#d7191c":
		d >= 80000 ? "#fdae61":
		d >= 70000 ? "#ffffbf":
		d >= 60000 ? "#abd9e9":
		d >= 0 ? "#2c7bb6":
			"#67676c";
}

function style(feature) {
	return {
		fillColor:getColor(feature.properties.zest),
		weight: 1,
		opacity: 1,
		color: "white",
		fillOpacity: 0.6
	}
}

grapi = new L.GeoJSON.AJAX("Parcels_tract3_zillow.geojson", {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend'),
	grades = [0, 60000, 70000, 80000, 90000],
	labels = [];
	div.innerHTML = '<h4>Residential Zillow Zestimates (As of 1/10/16)</h4>'
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML += '<i style="background:' + getColor(grades[i]+1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i+1] + '<br>' : '+');
	}
    div.innerHTML += '<br><i style="background:#67676c"></i> Non-Residential / No Data';
	return div;
};
legend.addTo(map);