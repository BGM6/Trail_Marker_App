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
		this._getPosition();
		//Toggles between cadence elevation when going from cycling to running
		inputType.addEventListener('change', this._toggleElevationField);
	}

	_getPosition() {
		if (navigator.geolocation)
			navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
				alert('Could not get your position');
			});
	}

	_loadMap(position) {
		const {latitude} = position.coords;
		const {longitude} = position.coords;

		const coords = [latitude, longitude];

		this.#map = L.map('map').setView(coords, 13);

		L.tileLayer('https://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(this.#map);

		//Map Marker Code
		this.#map.on('click', this._showForm.bind(this));


	}

	_showForm(mapE) {
		this.#mapEvent = mapE;
		form.classList.remove('hidden');
		inputDistance.focus();

	}

	_hideForm() {
		//Empty inputs;
		inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
	}

	_toggleElevationField() {
		inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
		inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
	}

	_newWorkout(e) {
		e.preventDefault();

	}

}

const app = new App();

