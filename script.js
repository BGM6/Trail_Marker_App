'use strict';
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
	//Private instance properties
	#map;
	#mapZoomLevel = 13;
	#mapEvent;
	#workouts = [];

	constructor() {

	}

	_getPosition() {

	}

	_loadMap() {

	}

	// _getCurrentPosition() {
	//
	// }
}

if (navigator.geolocation)
	navigator.geolocation.getCurrentPosition(
		function (position) {
			const {latitude} = position.coords;
			const {longitude} = position.coords;

			const coords = [latitude, longitude];

			const map = L.map('map').setView(coords, 13);

			L.tileLayer('https://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);

			L.marker(coords).addTo(map)
				.bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
				.openPopup();

		}, function () {
			alert('Could not get your position');
		});


const app = new App();
