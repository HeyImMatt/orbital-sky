const locationBtn = document.querySelector("#location-btn");
locationBtn.addEventListener("click", getUserLocation);

const wwd = new WorldWind.WorldWindow("globe");
wwd.addLayer(new WorldWind.BMNGOneImageLayer());
wwd.addLayer(new WorldWind.BMNGLandsatLayer());
wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));
const satelliteLayer = new WorldWind.RenderableLayer("Satellites");
wwd.addLayer(satelliteLayer);

function getUserLocation() {
	buttonClicked();
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
		const resp = await axios.get(`/satellites/api/${userData.lat}/${userData.long}/${userData.alt}`);
		createSatList(resp.data.above);

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
		dataLoaded();
	}

	function errorCallback(err) {
		console.log(err);
		alert("Something went wrong. Please try again and be sure to allow your location to be used.");
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
	placemark.label = data.label;
	placemark.alwaysOnTop = true;
	satelliteLayer.addRenderable(placemark);
}

function createSatList(data) {
	const satList = document.querySelector("#sat-list");
	data.forEach((sat) => {
		const li = document.createElement("li");
		li.textContent = sat.satname;
		li.className = "list-group-item list-group-item-action";
		li.addEventListener("click", () => {
			renderSatModal(sat);
		});
		li.setAttribute("data-toggle", "modal");
		li.setAttribute("data-target", "sat-modal");
		satList.append(li);
	});
}

async function renderSatModal(sat) {
	$("#sat-modal").modal("show");
	$("#sat-name").append(
		`<span class="spinner-border spinner-border-sm mr-5" role="status" aria-hidden="true"></span>`
	);
	const additionalInfo = document.querySelector("#additional-info");
	additionalInfo.innerHTML = "";
	const resp = await axios.get(`/satellites/api/${sat.satid}`);
	const dbData = resp.data.satellite;
	document.querySelector("#sat-name").textContent = sat.satname;
	document.querySelector("#sat-coords").textContent = `${sat.satlat}, ${sat.satlng}`;
	document.querySelector("#sat-launch-date").textContent = sat.launchDate;
	if (dbData !== "not found") {
		addData(dbData);
	}

	function addData(dataSource) {
		for (const [ k, v ] of Object.entries(dataSource)) {
			const tr = document.createElement("tr");
			const td1 = document.createElement("td");
			const td2 = document.createElement("td");
			td1.innerHTML = `<b>${k}</b>`;
			td2.innerHTML = `${v}`;
			tr.appendChild(td1);
			tr.appendChild(td2);
			additionalInfo.appendChild(tr);
		}
	}
}

function buttonClicked() {
	locationBtn.innerText = "";
	$("#location-btn").prepend(
		`<span class="spinner-border spinner-border-sm mr-5" role="status" aria-hidden="true"></span>`
	);
	locationBtn.removeEventListener("click", getUserLocation);
}

function dataLoaded() {
	$(".spinner-border").remove();
	locationBtn.addEventListener("click", () => {
		window.location.reload();
	});
	locationBtn.textContent = "Start Over";
}
