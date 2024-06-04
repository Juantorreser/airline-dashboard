//Airport Class
class Airport{
    constructor(name, city, country, elevationFt, geoLocation) {
        this.name = name;
        this.city = city;
        this.country = country;
        this.elevationFt = elevationFt;
        this.geoLocation = geoLocation;
        this.latitude = null;
        this.longitude = null;
    }

}

// Flight Class
class Flight{
    constructor(speed, type, seatsRemaining, pricePerKm, extraFuel, maxTakeOff, img, from, to) {
        this.speed = speed;
        this.type = type;
        this.seatsRemaining = seatsRemaining;
        this.pricePerKm = pricePerKm;
        this.extraFuel = extraFuel;
        this.maxTakeOffAlt = maxTakeOff;
        this.img = img;
        this.totalCost = null;
        this.duration = [];//Hours, mins
        this.from = from;
        this.to = to;
    }


}

//Passenger class
class Passenger{
    constructor(fName, lName, age, address, city, state, country, phone, email, flight) {
        this.name = `${fName} ${lName}`
        this.age = age;
        this.address = `${address}, ${city}, ${state}, ${country}`;
        this.phone = phone;
        this.email = email;
        this.flight = flight;
    }
}


$(document).ready(() => {
    $('#flights').hide();// Hide catalog

    // CartIcon Animation
    $('#cartIcon').hover(function (){
        $(this).attr('src', 'images/cartActive.png');
    }, function (){
        $(this).attr('src', 'images/cart.png');
    });
    // END OF CartIcon Animation

    //-----DISPLAY MAP-----
    let userLat = 15.326572;//Default Lat to create map if location is Not Available
    let userLon = -76.157227;//Default Lon to create map if location is Not Available
    let map;
    let showAirports;
    let line = null;
    let distance = null;
    let selectedAirport1 = null;
    let selectedAirport2 = null;
    let alertModal = new bootstrap.Modal($('#alertModal'));
    let checkoutModal = new bootstrap.Modal($('#checkoutModal'));
    let airportList = [];
    let flightList = [];
    let passengerList = [];
    let cartTotalSeats = 0;
    //Currency Formatter for prices
    const formatter = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD'
    });

    // Override Default Icons
    let airportIcon = L.icon({ //Airports' Marker
        iconUrl: './images/marker.png',
        iconSize: [45, 45]
    });

    let userIcon = L.icon({ //User's Marker
        iconUrl: './images/pin.png',
        iconSize: [35, 35]
    })

    // Create Leaflet Map
    map = L.map('map').setView([userLat, userLon], 1);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    //Set Map's view to user location
    let setMapView = (lat, lon) =>{
        map.setView([lat,lon],6);
        L.marker([lat, lon]).addTo(map).bindPopup('You Are Here').setIcon(userIcon);

    }
    //Get user Location
    let getLocation = (position) =>{
        userLat = position.coords.latitude;
        userLon = position.coords.longitude;
        setMapView(userLat, userLon);
    }
    //geoLocation API Call
    navigator.geolocation.getCurrentPosition(getLocation);

    //Add airports to map
    showAirports = () =>{
        $.each(airportList, (i, airport) => {
            let marker = L.marker([airport.latitude, airport.longitude]).addTo(map).setIcon(airportIcon)
                    .bindPopup(`
                        <div class="card airportCard" style="width: 15rem;">
                            <div class="card-body">
                                <h5 class="card-title">${airport.name}</h5>
                            </div>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">${airport.city}, ${airport.country}</li>
                                <li class="list-group-item">Elevation Ft: ${airport.elevationFt}</li>
                                <li id="weather${i}" class="list-group-item">a</li>
                            </ul>
                        </div>
                    `);
            $(marker._icon).click(() =>{ //Marker Click Listener
                //Set selected airports' locations
                if (selectedAirport1 != null){
                    selectedAirport2 = airport;
                    showWeather(airport.latitude,  airport.longitude, i);
                }

                if (selectedAirport1 === null){
                    selectedAirport1 = airport;
                    showWeather(airport.latitude,  airport.longitude, i);
                }

                if (selectedAirport1 != null && selectedAirport2 != null){
                    drawLine(selectedAirport1.latitude, selectedAirport1.longitude,
                                  selectedAirport2.latitude, selectedAirport2.longitude);

                    displayDistance();
                }

            })
        });
    }

    //Get lat and lon from Geographic Location of airports
    let getLatLong = (geoLocation) =>{
        const [latStr, lonStr] = geoLocation.split(' '); //Split the coordinates on the whiteSpace

        let latDir;
        let lonDir;
        //Get number values of the coordinates
        let lat = parseInt(latStr).toString();
        let lon = parseInt(lonStr).toString();

        //Get Direction i.e 'N,S,E,W'
        if (geoLocation.includes("S")){
            latDir = 'S';
        } else latDir = 'N';

        if (geoLocation.includes("E")){
            lonDir = 'E';
        } else lonDir = 'W';

        //Convert to latitude and longitude
        if (lat.length === 2) { //Latitude
            let int = 0 //Get the integer Part
            let decimal = parseFloat(lat.slice(0)) / 60 //Get the Decimal part
            lat = (int + decimal).toFixed(4); //Combine both values and parse Float

        } else if (lat.length === 3) { //Latitude
            let int = parseFloat(lat.slice(0, 1)); //Get the integer Part
            let decimal = parseFloat(lat.slice(1)) / 60 //Get the Decimal part
            lat = (int + decimal).toFixed(4); //Combine both values and parse Float

        } else if (lat.length === 4){
            let int = parseFloat(lat.slice(0,2)); //Get the integer Part
            let decimal = parseFloat(lat.slice(2)) / 60 //Get the Decimal part
            lat = (int + decimal).toFixed(4); //Combine both values and parse Float

        } else if (lat.length === 5){
            let int = parseFloat(lat.slice(0,3)); //Get the integer Part
            let decimal = parseFloat(lat.slice(3)) / 60 //Get the Decimal part
            lat = (int + decimal).toFixed(4); //Combine both values and parse Float
        }

        if (lon.length === 2) { //Longitude
            let int = 0
            let decimal = parseFloat(lon.slice(0)) / 60 //Get the Decimal part
            lon = (int + decimal).toFixed(4); //Combine both values and parse Float
        } else if (lon.length === 3) { //Longitude
            let int = parseFloat(lon.slice(0, 1)); //Get the integer Part
            let decimal = parseFloat(lon.slice(1)) / 60 //Get the Decimal part
            lon = (int + decimal).toFixed(4); //Combine both values and parse Float

        } else if (lon.length === 4){
            let int = parseFloat(lon.slice(0,2)); //Get the integer Part
            let decimal = parseFloat(lon.slice(2)) / 60 //Get the Decimal part
            lon = (int + decimal).toFixed(4); //Combine both values and parse Float

        } else if (lon.length === 5){
            let int = parseFloat(lon.slice(0,3)); //Get the integer Part
            let decimal = parseFloat(lon.slice(3)) / 60 //Get the Decimal part
            lon = (int + decimal).toFixed(4); //Combine both values and parse Float
        }

        //Make values negative if necessary
        if (latDir === 'S') lat = lat * -1;
        if (latDir === 'N') lat = lat *1;
        if (latDir === 'E') lon = lon *1;
        if (lonDir === 'W') lon = lon * -1;


        return {lat, lon}; //Return Object to retrieve values of each airport

    }

    // Parse Json File to Create Airports
    let createAirports = () => {
        $.getJSON('public/mAirports.json', (data) => {
            $.each(data, (i, place) =>{
                //Create airport Objects
                const airport = new Airport(place['Airport Name'],
                                                    place['City Name'],
                                                    place['Country'],
                                                    place['elevationInFt'],
                                                    place['Geographic Location']);

                let latLong = getLatLong(airport.geoLocation); //Get latitude and longitude of each airport
                airport.latitude = latLong.lat;
                airport.longitude = latLong.lon;
                airportList.push(airport);
            });
            showAirports();
        });
    }
    createAirports();

    //---Weather API---
    let apiKey = "e6fe7d34b60da603f9d41d268da9ef6d";
    //Function to Show weather
    let showWeather = (lat, lon, i) =>{
        let api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        // Parse Json from Api
        $.getJSON(api, (data) => {
            let temperature = `${(data.main.temp - 273.15).toFixed(1)} °C`; //Get Temperature
            let weatherDesc = data.weather[0].description; //Get weather Description

            // Display weather Info
            $(`#weather${i}`).html(`Weather: ${temperature} | ${weatherDesc}`);
        });
    }


    //-----SELECT AIRPORTS-----
    let drawLine = (lat1, lon1, lat2, lon2) =>{
        // Remove previous line
        if (typeof drawLine.previousLine !== 'undefined') {
            map.removeLayer(drawLine.previousLine);
        }
        // Create a new line between airports
        line = L.polyline([[lat1, lon1], [lat2, lon2]], { color: 'red' }).addTo(map);

        // Store the reference to the new line
        drawLine.previousLine = line;
    }

    //Display Distance
    let displayDistance = () =>{

        let latlong1 = L.latLng(selectedAirport1.latitude, selectedAirport1.longitude);
        let latlong2 = L.latLng(selectedAirport2.latitude, selectedAirport2.longitude);

        // Calculate the distance in kilometers
        distance = latlong1.distanceTo(latlong2) / 1000;
        distance = parseFloat(distance.toFixed(2));

        $('#flightDistance').html(`Distance: ${distance}km`).fadeIn();
    }

    //Functionality to clear Selection
    $('#btnClear').click(() =>{
        selectedAirport1 = null;
        selectedAirport2 = null;
        map.removeLayer(line);
        $('#flightDistance').fadeOut();
        $('#flights').fadeOut();
    })

    //---END OF SELECT AIRPORTS---

    //---FLIGHTS CATALOG---

    //Search flight listener
    $('#btnSearchFlights').click(() =>{
        if (selectedAirport1 === null || selectedAirport2 === null){
            return;
        }
        createFlights();
        setTimeout(scrollToFlights, 20);
    });

    //Scroll to flights
    let scrollToFlights = () =>{
        let section =  $('#flights').offset().top - $('.navbar').height();
        $('html, body').animate({
            scrollTop: section
        }, 1000);
    }

    //Create flights
    let createFlights = () =>{
        flightList = [];
        $.getJSON('public/fake_flights.json', (data) => {
            $.each(data, (i, flight) =>{
                //Create flight Objects
                const plane = new Flight(flight['speed_kph'],
                    flight['type_of_plane'],
                    flight['seats_remaining'],
                    flight['price_per_km'],
                    flight['extraFuelCharge'],
                    flight['maxTakeOffAlt'],
                    flight['img'],
                    `${selectedAirport1.name}, ${selectedAirport1.city}, ${selectedAirport1.country}`,
                    `${selectedAirport2.name}, ${selectedAirport2.city}, ${selectedAirport2.country}`
                );
                // flight.fromTo.push(selectedAirport1.name);
                flightList.push(plane);
            });
            displayFlights();
        });
    }

    let displayFlights = () =>{
        let catalog = $('#catalog');

        catalog.html(""); //Clear Catalog
        $('#flights').fadeIn(); //Show catalog section
        //Loop and display each flight
        $.each(flightList, (i, flight) =>{
            flight.totalCost = flight.pricePerKm * distance;
            let time = distance / flight.speed;
            let hours = Math.floor(time);
            let mins = Math.round((time - hours) * 60);
            flight.duration.push(hours);
            flight.duration.push(mins);
            catalog.append(`
                <div class="card m-4 shadow" style="width: 18rem;">
                    <img src="${flight.img}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title p-1 m-1 border-bottom">${flight.type}</h5>
                        <p class="card-text p-1 m-1 border-bottom">From: ${flight.from} <br>To: ${flight.to}</p>
                        <p class="card-text p-1 m-1 border-bottom">Seats remaining: ${flight.seatsRemaining}</p>
                        <p class="card-text p-1 m-1 border-bottom">Duration: ${flight.duration[0]} hours and ${flight.duration[1]} minutes</p>
                        <p class="card-text p-1 m-1 border-bottom">Speed: ${flight.speed}Km/h</p>
                        <p class="card-text fw-bold p-1 m-1 ">Total Cost:  ${formatter.format(flight.totalCost)}</p>
                        <button id="addFlight${i}" class="btn bg-primary">Add to Cart</button>
                    </div>
                </div>
            `);
            $(`#addFlight${i}`).click(() =>{ //Add Flight to Cart Btn
                if (flight.seatsRemaining > 1){
                    flight.seatsRemaining --;
                    cart.push(flight);
                    showCart(flight);
                    //Modal Confirmation
                    $('#alertModal .modal-title').html('Success');
                    $('#alertModal .modal-body').html('This flight have been added to your cart!');
                    alertModal.show();
                    setTimeout(()=>{
                        alertModal.hide();
                    }, 1500);
                } else if (flight.seatsRemaining === 1){ //Disable button if there are no more seats
                    flight.seatsRemaining --;
                    cart.push(flight);
                    showCart(flight);
                    $(`#addFlight${i}`).addClass('disabled').html('No Seats Remaining');
                }

            });

        })

    }


    //Switch Display Layout
    $('#displayGrid').click(()=>{
        $('#catalog').removeClass('row flex-nowrap overflow-auto').addClass('d-flex flex-wrap justify-content-center');
        $('#displayGrid').addClass('activeDisplay');
        $('#displayRow').removeClass('activeDisplay');
    })

    $('#displayRow').click(() =>{
        $('#catalog').addClass('row flex-nowrap overflow-auto').removeClass('d-flex flex-wrap justify-content-center');
        $('#displayRow').addClass('activeDisplay');
        $('#displayGrid').removeClass('activeDisplay');
    })

    //---CART---
    let cart;

    //On load show only empty cart
    $('#cartItems').addClass('visually-hidden');
    $('#cartBtn').addClass('visually-hidden');

    //Update the Cart
    let showCart = () =>{
        if (cart.length === 0){
            //On load show only empty cart
            $('#cartItems').addClass('visually-hidden');
            $('#cartBtn').addClass('visually-hidden');
            $('#cartEmpty').removeClass('visually-hidden');
            $('#displayCartItems').html('');
            cartTotalSeats = 0;
        } else{
            $('#cartEmpty').addClass('visually-hidden');
            //Add new item to cart
            $('#cartItems').removeClass('visually-hidden');
            $('#displayCartItems').html(''); //Clear Cart
            //Add all items on cart
            $.each(cart, (i, item) =>{
                $('#displayCartItems').append(`
                    <div class="card mb-3 shadow border-2" style="max-width: 100%;">
                        <div class="d-flex flex-row justify-content-between">
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">Plane: ${item.type}</h5>
                                    <p class="card-text p-1 m-1 border-bottom">From: ${item.from} <br>To: ${item.to}</p>
                                    <p class="card-text">Duration: ${item.duration[0]} hours and ${item.duration[1]} minutes</p>
                                    <p class="card-text">Seats After Booking: ${item.seatsRemaining}</p>
                                    <p class="card-text"><small class="text-body-secondary fw-bold">Total Cost: ${formatter.format(item.totalCost)}</small></p>
                                </div>
                            </div>
                            <button id="delete${i}" class="btn text-danger fs-2">🗑️</button>
                        </div>
                    </div>
                `);
                //Delete from cart listener
                $(`#delete${i}`).click( () =>{
                    item.seatsRemaining ++;
                    deleteFromCart(i);
                })
                //Update Total Price
                cartTotalSeats = cart.length;
            })

            $('#cartTotalSeats').html(`${cartTotalSeats}`);
            //Show Action Buttons
            $('#cartBtn').removeClass('visually-hidden');
        }

        storeCart();
    }
    //Clear ALL items in cart
    let clearCart = () =>{
        let length = cart.length;

        for (let i = 0; i < length ; i++){
            cart[0].seatsRemaining ++;
            cart.splice(0, 1);
        }

        $.each(flightList, (i, flight) =>{
            $(`#addFlight${i}`).removeClass('disabled').html('Add to Cart');
        })
        cartTotalSeats = 0;
        showCart();
    }
    $('#clearCart').click(() =>{
        clearCart();
    });

    //Delete Product From Cart
    let deleteFromCart = (i) =>{
        cartTotalSeats --;
        cart.splice(i, 1);
        showCart();
        $(`#addFlight${i}`).removeClass('disabled').html('Add to Cart');
    }

    //Store Cart information in local Storage
    let storeCart = () =>{
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    let storedCart = localStorage.getItem('cart');
    if (storedCart) {
        // Parse the JSON and store it into cart
        cart = JSON.parse(storedCart);
        showCart();
    } else {
        cart = [];
    }
    //---CHECkOUT---
    //Variables
    let modalBody = $('#checkoutModal .modal-body');
    let modalFooter = $('#checkoutModal .modal-footer');
    //User info

    //BOOKING DETAILS
    let bookingDetails = () =>{
        //Display checkout Modal
        $('#checkoutModal .modal-title').html('Checkout');
        checkoutModal.show();

        // 1 - BOOKING DETAILS
        modalBody.html(''); //Clear Modal Body
        modalFooter.html('')//Clear Modal Footer
        modalBody.append(`
            <p class="text-center fs-5 fw-medium">Booking Details</p>
            <div class="progress mb-4" role="progressbar" aria-label="Example with label" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar bg-primary" style="width: 25%">25%</div>
            </div>
        `);
        //Display each cart item
        $.each(cart, (i, item) =>{
            modalBody.append(`
                <div class="card mb-3 shadow border-2" style="max-width: 100%;">
                    <div class="d-flex flex-row justify-content-between">
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">Plane: ${item.type}</h5>
                                <p class="card-text">Duration: ${item.duration[0]} hours and ${item.duration[1]} minutes</p>
                                <p class="card-text">Seats After Booking: ${item.seatsRemaining}</p>
                                <p class="card-text"><small class="text-body-secondary fw-bold">Total Cost: ${formatter.format(item.totalCost)}</small></p>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
        //Display total of seats being booked
        modalBody.append(`
            <p class="fs-5 fw-bold">Total Seats: ${cartTotalSeats}</p>
        `);
        //Display Buttons
        modalFooter.append(`
            <button type="button" class="btn bg-secondary" data-bs-dismiss="modal">Cancel</button>
            <button id="passengerDetailsBtn" type="button" class="btn bg-primary pe-4 ps-4">Next</button> 
        `);
        $('#passengerDetailsBtn').click(passengerDetails);
    }

    //PASSENGER DETAILS
    let currentFlight = 0;
    let currentPassenger =  0;
    let passengerDetails = () =>{
        modalBody.html('');
        modalFooter.html('');
        $('#checkoutModal .modal-title').html('Checkout');

        //Update progress Bar
        modalBody.append(`
            <p class="text-center fs-5 fw-medium">Passenger Details</p>
            <div class="progress mb-4" role="progressbar" aria-label="Example with label" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar bg-primary" style="width: 50%">50%</div>
            </div>
        `);

        //Passenger Details Form

        modalBody.append(`
            <div class="card mb-3 shadow border-2" style="max-width: 100%;">
                <div class="d-flex flex-row justify-content-between">
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">Plane: ${cart[currentFlight].type}</h5>
                            <p class="card-text">Duration: ${cart[currentFlight].duration[0]} hours and ${cart[currentFlight].duration[1]} minutes</p>
                            <p class="card-text">Seats After Booking: ${cart[currentFlight].seatsRemaining}</p>
                            <p class="card-text"><small class="text-body-secondary fw-bold">Total Cost: ${formatter.format(cart[currentFlight].totalCost)}</small></p>
                        </div>
                    </div>
                </div>
            </div>
        `);
        //Passenger Form
        modalBody.append(`
            <form>
                <div class="input-group flex-nowrap mt-3">
                    <span class="input-group-text" >&#128100;</span>
                    <input type="text" id="firstName" class="form-control" placeholder="First Name" aria-label="FirstName">
                </div>
                
                <div class="input-group flex-nowrap mt-3">
                    <span class="input-group-text" >&#128100;</span>
                    <input type="text" id="lastName" class="form-control" placeholder="Last Name" aria-label="lastName">
                </div>
                
                <div class="input-group flex-nowrap mt-3">
                    <span class="input-group-text" >✉️</span>
                    <input type="email" id="email" class="form-control" placeholder="Email Address" aria-label="email">
                </div>
                
                <div class="input-group flex-nowrap mt-3">
                    <span class="input-group-text" >🔢</span>
                    <input type="number" id="age" class="form-control" placeholder="Age" aria-label="age">
                </div>
                
                <div class="input-group flex-nowrap mt-3">
                    <span class="input-group-text" >📫</span>
                    <input type="text" id="address" class="form-control" placeholder="Address" aria-label="address">
                </div>
                
                <div class="input-group flex-nowrap mt-3">
                    <span class="input-group-text" >📍</span>
                    <input type="text" id="city" class="form-control" placeholder="City" aria-label="city">
                </div>
                
                <div class="input-group flex-nowrap mt-3">
                    <span class="input-group-text" >📍</span>
                    <input type="text" id="state" class="form-control" placeholder="State" aria-label="state">
                </div>
                
                <div class="input-group flex-nowrap mt-3">
                    <span class="input-group-text" >📍</span>
                    <input type="text" id="country" class="form-control" placeholder="Country" aria-label="country">
                </div>
                
                <div class="input-group flex-nowrap mt-3">
                    <span class="input-group-text" >☎️</span>
                    <input type="tel" id="phoneNum" class="form-control" placeholder="Phone Number" aria-label="phoneNum">
                </div>
            </form>
        `);

        currentPassenger = currentFlight;
        //Next and previous flight btns
        if (currentFlight === 0 && cart.length === 1){

        }else if (currentFlight === 0 && cart.length > 1){
            modalBody.append(`
            <button id="nextFlight" type="button" class="btn bg-white pe-4 ps-4 mt-3 shadow">Next Flight ></button> 
        `);
        } else if (currentFlight === cart.length - 1){
            modalBody.append(`
            <button id="prevFlight" type="button" class="btn bg-white pe-4 ps-4 mt-3 shadow">< Previous Flight</button> 
        `);
        } else{
            modalBody.append(`
            <button id="prevFlight" type="button" class="btn bg-white pe-4 ps-4 mt-3 shadow">< Previous Flight</button> 
            <button id="nextFlight" type="button" class="btn bg-white pe-4 ps-4 mt-3 shadow">Next Flight ></button> 
        `);
        }

        $('#nextFlight').click(() =>{
            if (passengerValidation()){
                currentFlight ++;
                passengerDetails();
            }
        });
        $('#prevFlight').click(() =>{
            currentFlight --;
            passengerDetails();
        });

        //Display buttons
        modalFooter.append(`
            <button type="button" class="btn bg-secondary" data-bs-dismiss="modal">Cancel</button>
            <button id="bookingDetailsBtn" type="button" class="btn bg-primary pe-4 ps-4">Previous</button> 
        `);
        if (currentFlight === cart.length - 1){
            modalFooter.append(`
                <button id="confirmBookingBtn" type="button" class="btn bg-primary pe-4 ps-4">Next</button> 
            `);
        }
        $('#bookingDetailsBtn').click(bookingDetails);
        $('#confirmBookingBtn').click(() =>{
            if (passengerValidation()){
                confirmBooking();
            }
        });
    }

    //Passenger info validation
    let passengerValidation = () =>{

        currentPassenger = currentFlight;
        passengerList.length = currentFlight;

        //Input fields
        let fNameField = $('#firstName');
        let lNameField = $('#lastName');
        let addressField = $('#address');
        let cityField = $('#city');
        let stateField = $('#state');
        let countryField = $('#country');
        let ageField = $('#age');
        let emailField = $('#email');
        let phoneField = $('#phoneNum');

        //Get form Information
        let validated = true;
        let errorMsg =  '';
        let fNameVal = fNameField.val();
        let lNameVal = lNameField.val();
        let addressVal = addressField.val();
        let cityVal = cityField.val();
        let stateVal = stateField.val();
        let countryVal = countryField.val();
        let ageVal = ageField.val();
        let emailVal = emailField.val();
        let phoneVal = phoneField.val();

        //Check Each Field
        //First Name Validation
        if (fNameVal=== ''){
            errorMsg += ('- First Name Can NOT Be Blank<br>');
            validated = false;

            fNameField.html('');
            fNameField.addClass('is-invalid');

        } else if (/\s/.test(fNameVal)){
            errorMsg += '- First Name Can NOT Contain Spaces<br>';
            validated = false;

            fNameField.val('');
            fNameField.addClass('is-invalid');

        } else {
            fNameField.removeClass('is-invalid');
            fNameField.addClass('is-valid');
        }

        //Last Name Validation
        if (lNameVal === ''){
            errorMsg += '- Last Name Can NOT Be Blank<br>';
            validated = false;

            lNameField.val('');
            lNameField.addClass('is-invalid');

        } else if (/\s/.test(lNameVal)){
            errorMsg += '- Last Name Can NOT Contain Spaces<br>';
            validated = false;

            lNameField.val('');
            lNameField.addClass('is-invalid');

        } else {
            lNameField.removeClass('is-invalid');
            lNameField.addClass('is-valid');
        }

        //Email Validation
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailVal === ''){
            errorMsg += '- Email Can NOT Be Blank<br>';
            validated = false;

            emailField.val('')
            emailField.addClass('is-invalid');

        } else if (!emailRegex.test(emailVal)){
            errorMsg += '- Email Must Use A Correct Format: example@domain.com<br>';
            validated = false;

            emailField.val('');
            emailField.addClass('is-invalid');

        } else {
            emailField.removeClass('is-invalid');
            emailField.addClass('is-valid');
        }

        //Age Validation
        if (ageVal <=0 || ageVal > 120){
            errorMsg += '- Age Should Be Within 1 - 120 Range<br>';
            validated = false;

            ageField.val('');
            ageField.addClass('is-invalid');

        } else {
            ageField.removeClass('is-invalid');
            ageField.addClass('is-valid');
        }

        //Phone Number Validation
        let phoneRegex = /^(?:\d{10}|\d{3}[-\s]\d{3}[-\s]\d{4})$/;

        if (phoneVal === ''){
            errorMsg += '- Phone Number Can NOT Be Blank<br>';
            validated = false;

            phoneField.val('');
            phoneField.addClass('is-invalid');

        } else if (!phoneRegex.test(phoneVal)){
            errorMsg += '- Phone Number Must Use A Correct Format: 000-000-0000 or 0000000000 or 000 000 0000<br>';
            validated = false;

            phoneField.val('');
            phoneField.addClass('is-invalid');

        } else {
            phoneField.removeClass('is-invalid');
            phoneField.addClass('is-valid');
        }

        //Address Validation
        if (addressVal === ''){
            errorMsg += '- Address Can NOT Be Blank <br>';
            validated = false;

            addressField.addClass('is-invalid');

        } else {
            addressField.removeClass('is-invalid');
            addressField.addClass('is-valid');
        }

        //City Validation
        if (cityVal === ''){
            errorMsg += '- City Can NOT Be Blank <br>';
            validated = false;

            cityField.addClass('is-invalid');

        } else {
            cityField.removeClass('is-invalid');
            cityField.addClass('is-valid');
        }

        //State Validation
        if (stateVal === ''){
            errorMsg += '- State Can NOT Be Blank <br>';
            validated = false;

            stateField.addClass('is-invalid');

        } else {
            stateField.removeClass('is-invalid');
            stateField.addClass('is-valid');
        }

        //Country Validation
        if (countryVal === ''){
            errorMsg += '- Country Can NOT Be Blank <br>';
            validated = false;

            countryField.addClass('is-invalid');

        } else {
            countryField.removeClass('is-invalid');
            countryField.addClass('is-valid');
        }

        //If form is validated create passenger object
        if (!validated){
            $('#checkoutModal #error').html(`${errorMsg}`);
        } else {
            $('#checkoutModal #error').html('');
            let passenger = new Passenger(
                fNameVal,
                lNameVal,
                ageVal,
                addressVal,
                cityVal,
                stateVal,
                countryVal,
                phoneVal,
                emailVal,
                cart[currentFlight]
            );
            passengerList.push(passenger);
        }

        return validated;
    }

    let confirmBooking = () =>{
        $('#checkoutModal .modal-title').html('Checkout');
        modalBody.html('');
        modalFooter.html('');

        //Update progress Bar
        modalBody.append(`
            <p class="text-center fs-5 fw-medium">Confirm Booking</p>
            <div class="progress mb-4" role="progressbar" aria-label="Example with label" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar bg-primary" style="width: 75%">75%</div>
            </div>
        `);

        //Display each passenger info
        $.each(passengerList, (i, passenger) =>{
           modalBody.append(`
                <div class="card mb-3 shadow border-2" style="max-width: 100%;">
                    <div class="d-flex flex-row justify-content-between">
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">Passenger Information</h5>
                                <p class="card-text">Name: ${passenger.name}</p>
                                <p class="card-text">Age: ${passenger.age}</p>
                                <p class="card-text">Address: ${passenger.address}</p>
                                <p class="card-text">Phone Number: ${passenger.phone}</p>
                                <p class="card-text">Email: ${passenger.email}</p>
                                <!--FLight Info-->
                                <div class="card mb-3 shadow border-2" style="max-width: 100%;">
                                    <div class="d-flex flex-row justify-content-between">
                                        <div class="col-md-8">
                                            <div class="card-body">
                                                <h5 class="card-title">Plane: ${cart[i].type}</h5>
                                                <p class="card-text">Duration: ${cart[i].duration[0]} hours and ${cart[i].duration[1]} minutes</p>
                                                <p class="card-text">Seats After Booking: ${cart[i].seatsRemaining}</p>
                                                <p class="card-text"><small class="text-body-secondary fw-bold">Total Cost: ${formatter.format(cart[i].totalCost)}</small></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
           `);
        });

        //Display total of seats being booked
        modalBody.append(`
            <p class="fs-5 fw-bold">Total Seats: ${cartTotalSeats}</p>
        `);
        //Display buttons
        modalFooter.append(`
            <button type="button" class="btn bg-secondary" data-bs-dismiss="modal">Cancel</button>
            <button id="passengerDetailsBtn" type="button" class="btn bg-primary pe-4 ps-4">Previous</button> 
            <button id="showBookingBtn" type="button" class="btn bg-primary pe-4 ps-4">Confirm</button> 
        `);
        $('#passengerDetailsBtn').click(passengerDetails);
        $('#showBookingBtn').click(showBooking);
    }

    let showBooking = () =>{

        modalBody.html('');
        modalFooter.html('');
        $('#checkoutModal .modal-title').html('Booking Confirmed');

        //Update progress Bar
        modalBody.append(`
            <p class="text-center fs-5 fw-medium">Booking Confirmed Successfully</p>
            <div class="progress mb-4" role="progressbar" aria-label="Example with label" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar bg-primary" style="width: 100%">100%</div>
            </div>
        `);

        //Display total of seats being booked
        modalBody.append(`
            <p class="fs-5 fw-bold">Total Seats Booked: ${cartTotalSeats}</p>
        `);

        //Display buttons
        modalFooter.append(`
            <button type="button" class="btn bg-primary" data-bs-dismiss="modal">Close</button>
        `);

        displayFlights();
        //Clear Cart
        $.each(cart, (i, item) =>{
            deleteFromCart(0);
        });


    }
    //Btns' listeners for checkout
    $('#checkoutCart').click(bookingDetails);



})

