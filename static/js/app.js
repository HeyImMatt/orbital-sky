document.querySelector("#location-btn").addEventListener("click", getUserLocation);

const wwd = new WorldWind.WorldWindow("globe");
wwd.addLayer(new WorldWind.BMNGOneImageLayer());
wwd.addLayer(new WorldWind.BMNGLandsatLayer());
wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));
const satelliteLayer = new WorldWind.RenderableLayer("Satellites");
wwd.addLayer(satelliteLayer);

function getUserLocation() {
	async function successCallback(position) {
		const userData = {
			alt: position.coords.altitude ? position.coords.altitude : 0,
			label: "Your Location",
			lat: position.coords.latitude,
			long: position.coords.longitude
		};

		generatePlacemark(userData);
		const flyIn = new WorldWind.GoToAnimator(wwd);
		const userPosition = new WorldWind.Position(userData.lat, userData.long, 2000000);
		flyIn.goTo(userPosition);

		generatePlacemark(userData);
		const flyIn = new WorldWind.GoToAnimator(wwd);
		const userPosition = new WorldWind.Position(userData.lat, userData.long, 2000000);
		flyIn.goTo(userPosition);
		const resp = await axios.get(`/satellites/api/${userData.lat}/${userData.long}/${userData.alt}`);
		console.log(resp.data);
		resp.data.above.forEach((sat) => {
			const satData = {
				alt: sat.satalt,
				category: sat.category || "Uncategorized",
				icon: sat.icon || "uncategorized",
				label: `${sat.satname}`,
				lat: sat.satlat,
				long: sat.satlng
			};
			generatePlacemark(satData);
		});
	}

	navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
}

function generatePlacemark(data) {
	const placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
	placemarkAttributes.imageOffset = new WorldWind.Offset(
		WorldWind.OFFSET_FRACTION,
		0.3,
		WorldWind.OFFSET_FRACTION,
		0.0
	);
	placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
	placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
		WorldWind.OFFSET_FRACTION,
		0.5,
		WorldWind.OFFSET_FRACTION,
		1.0
	);
	placemarkAttributes.imageSource =
		data.label === "Your Location" ? "static/images/person-pin.svg" : `static/images/${data.icon}.svg`;
	const position = new WorldWind.Position(data.lat, data.long, data.alt);
	const placemark = new WorldWind.Placemark(position, true, placemarkAttributes);
	placemark.label = data.label === "Your Location" ? `${data.label}` : "";
	placemark.alwaysOnTop = true;
	satelliteLayer.addRenderable(placemark);
}
