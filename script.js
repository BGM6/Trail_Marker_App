'use strict';

class Workout {
	date = new Date();
	id = Date.now() + ''.slice(-10);

	constructor(coords, distance, duration) {
		this.coords = coords; //[lat, lng]
		this.distance = distance; // miles
		this.duration = duration;  // mins
	}

	_setDescription() {
		const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
	}
}

class Hiking extends Workout {
	type = 'hiking';

	constructor(coords, distance, duration, cadence) {
		super(coords, distance, duration,);
		this.cadence = cadence;
		this.calcPace();
		this._setDescription();
	}

	calcPace() {
		this.pace = this.duration / this.distance;
		return this.pace;
	}
}

class Cycling extends Workout {
	type = 'cycling';

	constructor(coords, distance, duration, elevationGain) {
		super(coords, distance, duration,);
		this.elevationGain = elevationGain;
		this.calcSpeed();
		this._setDescription();
	}

	calcSpeed() {
		this.speed = this.distance / this.duration * 60;
		return this.speed;
	}
}

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
		//This calls the app to get the position instead of call it outside the class we can call it here
		this._getPosition();
		//Get data from localStorage
		this._getLocalStorage();
		//Leaves the marker on the mpa once the data is entered
		form.addEventListener('submit', this._newWorkout.bind(this));
		//Toggles between cadence elevation when going from cycling to running
		inputType.addEventListener('change', this._toggleElevationField);
		containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
		this.#workouts.forEach(work => {
			this._renderWorkoutMarker(work);
		})

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
		//Helper functions;
		const validInputs = (...inputs) => inputs.every(input => Number.isFinite(input));
		const allPositive = (...inputs) => inputs.every(input => input > 0);
		//Get data from form
		const type = inputType.value;
		const distance = +inputDistance.value;
		const duration = +inputDuration.value;
		const {lat, lng} = this.#mapEvent.latlng;
		let workout;

		//If activity is running, create running Object
		if (type === 'hiking') {
			const cadence = +inputCadence.value;
			//Check if data is valid
			if (
				!validInputs(distance, duration, cadence) ||
				!allPositive(distance, duration, cadence)
			)
				return alert('Input have to be positive numbers!');

			workout = new Hiking([lat, lng], distance, duration, cadence);

		}
		//If activity is cycling, create cycling Object
		if (type === 'cycling') {
			const elevation = +inputElevation.value;
			//Check if data is valid
			if (!validInputs(distance, duration, elevation) ||
				!allPositive(distance, duration)
			)
				return alert('Input have to be positive numbers!');

			workout = new Cycling([lat, lng], distance, duration, elevation);
		}

		//Add New object to workout Array
		this.#workouts.push(workout);
		console.log(workout);
		//Render workout on map as marker
		this._renderWorkout(workout);
		//Render workout on list
		this._renderWorkoutMarker(workout);
		//Hide form + clear input fields
		this._hideForm();
		//Clear input field
		inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
		//Set local storage to all workouts
		this._setLocalStorage();
	}

	_renderWorkoutMarker(workout) {
		L.marker(workout.coords)
			.addTo(this.#map).bindPopup(L.popup({
				maxWidth: 250,
				minWidth: 100,
				autoClose: false,
				closeOnClick: false,
				className: `${workout.type}-popup`,
			})
		).setPopupContent(`${workout.type === 'hiking' ? '🏃' : '‍♂️'} ${workout.description}`)
			.openPopup();
	}

	_renderWorkout(workout) {
		let html = `
        <li class="workout ${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">Hiking on April 14</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'hiking' ? '🥾' : '‍🚴'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">mi</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏲</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          `;

		if (workout.type === 'hiking')
			html += `
            <div class="workout__details">
            <span class="workout__icon">🚀</span>
            <span class="workout__value">${workout.pace}</span>
            <span class="workout__unit">min/mi</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
            `;

		if (workout.type === 'cycling')
			html += `
                <div class="workout__details">
            <span class="workout__icon">🚀</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">mi/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">mi</span>
          </div>
        </li>
                `;

		form.insertAdjacentHTML('afterend', html);
	}

	_moveToPopup(e) {
		// BUGFIX: When we click on a workout before the map has loaded, we get an error. But there is an easy fix:
		if (!this.#map) return;

		const workoutEl = e.target.closest('.workout');

		if (!workoutEl) return;

		const workout = this.#workouts.find(
			work => work.id === workoutEl.dataset.id
		);
		this.#map.setView(workout.coords, this.#mapZoomLevel, {
			animate: true,
			pan: {
				duration: 1,
			},
		});
	}

	_setLocalStorage() {
		localStorage.setItem('workouts', JSON.stringify(this.#workouts));
	}

	_getLocalStorage() {
		const data = JSON.parse(localStorage.getItem('workouts'));
		console.log(data);
		if (!data) return;
		this.#workouts = data;
		this.#workouts.forEach(work => {
			this._renderWorkout(work);
		});
	}

	reset() {
		localStorage.removeItem('workouts');
		location.reload();
	}
}

const app = new App();

