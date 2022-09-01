/* globals localStorage */

// Feature 13 - Provide Default Values
const STORAGE_KEY = 'CyclistRecording'

// Feature 2 - Add a Trip
class Trip{	// eslint-disable-line no-unused-vars
	constructor(newRecordID, newTrip, date, terrain, distance, targetTimeFinished, estimatedSpeed){
		this.id = newRecordID
		this.tripName = newTrip
		this.date = date
		this.terrain = terrain
		this.distance = Number(distance)
		this.targetTimeFinished = Number(targetTimeFinished)
		this.estimatedSpeed = Math.round(estimatedSpeed,2)
		this.done = false // FEATURE 13. Provide default values
	}
	
}


// FEATURE 1 - Create a whole which acts as a Facade for parts
class Cyclist{// eslint-disable-line no-unused-vars
	constructor(){
		this.recorded_trip = []
		// these 8 attibutes are used to support editing a trip
		this.updateTrip = null
		this.beforeUpdateTripCache = ''
		this.beforeUpdateDistanceCache = 0
		this.beforeUpdateTimeCache = 0
		this.beforeUpdateDatecache = ''
		this.beforeUpdateTerrain = ''
		this.beforeStatus = ''
		this.estimatedSpeed = 0 // FEATURE 13. Provide default values
	}
	// Checks Date format whether its in dd-mm-yyyy
	checkDate(dated){
		var separate_date = dated.split('-')
		var date_separated = new Date(separate_date[2], separate_date[1] - 1, separate_date[0])
		return date_separated && (date_separated.getMonth() + 1) == separate_date[1]
	}
	// Feature 2 - Add a Trip
	addTrip(newTrip, date, terrain, distance, targetTimeFinished){
		// Cleansing Data
		newTrip = newTrip.trim()
		terrain = terrain.trim()
		// Formatting Data
		distance = Number(distance)
		targetTimeFinished = Number(targetTimeFinished)
		let isDateValid = this.checkDate(date)
		// Feature 10 -	Validate inputs
		if (!newTrip || !isDateValid || !terrain || !distance || !targetTimeFinished){
			return
		}
		// FEATURE 13 - Provide default values
		const newRecordID = this.recorded_trip.length + 1
		// FEATURE 11 - A calculation within a part
		this.estimatedSpeed = distance/targetTimeFinished
		const aNewRecord = new Trip(newRecordID, newTrip, date, terrain, Number(distance), Number(targetTimeFinished), this.estimatedSpeed)
		this.recorded_trip.push(aNewRecord)
	}
	
	// FEATURE 15 - Get all trips
	getAllTrips(){
		return this.recorded_trip
	}
	// FEATURE 12. A calculation across many trips	
	getDistanceSum(){
		// FEATURE 13 - Provide default values
		var sum = 0
		for(var listlength = 0; listlength < this.recorded_trip.length; listlength++){
			sum += Number(this.recorded_trip[listlength].distance)
		}
		return sum
	}
	// Returns the number of trips whether active or inactive
	getSum(){
		return this.recorded_trip.length
	}
	//  FEATURE 6. Save all trips to LocalStorage
	saveTrip(){
		const savingRecord = localStorage.setItem(STORAGE_KEY, JSON.stringify(this.recorded_trip))
		return savingRecord
	}
	// FEATURE 7. Load all trips from LocalStorage
	unloadTrip(){
		// FEATURE 13. Provide default values
		const unloadingJSON = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
		this.recorded_trip = unloadingJSON
	}
	// FEATURE 3. Sort trips from highest to lowest distance
    sortHighestTrip () {
        this.recorded_trip.sort(function (x, y) {
          if (x.distance < y.distance) {
            return 1 // X goes down after Y
          }
          if (x.distance > y.distance) {
            return -1 // X is first then Y
          }
          return 0 // x must equal to y - trip order will remain the same
        })
      }
	  // FEATURE 3. Sort Trips from lowest to highest distance
    sortLowestTrip () {
        this.recorded_trip.sort(function (x, y) {
          if (x.distance > y.distance) {
            return 1
          }
          if (x.distance < y.distance) {
            return -1
          }
          return 0 // x must equal to y - trip order will remain the same
        })
      }
	// FEATURE 5. Delete a selected part	  
	removeTrip(selectedRecordedTrip){
		const recordIndex = this.recorded_trip.findIndex((trip) => trip.id == selectedRecordedTrip)
		const removeAction = this.recorded_trip.splice(recordIndex, 1)
		return removeAction
	}
	// FEATURE 12. A calculation across many parts!
	// FEATURE 4. Filter parts	
	getTripsTBD(){
		const activeTrip = this.recorded_trip.filter(trip => trip.done == false)
		return activeTrip
	}
	// FEATURE 12. A calculation across many parts
	getTripsRemaining(){
		const remainingTrip = this.getTripsTBD().length
		return remainingTrip
	}
	// FEATURE 12. A calculation across many parts!
	// FEATURE 4. Filter parts
	getTripsDone(){
		const filterToTrue = this.recorded_trip.filter(trip => trip.done == true)
		return filterToTrue
	}
	// FEATURE 12. A calculation across many parts
	getAllTripsDone(){
		const setTripToZero = this.getTripsRemaining() === 0
		return setTripToZero
	}
	// Set all active trips to be done
	tripAllDone(){
		this.recorded_trip.forEach(function(trip){
			trip.done = true
		})
	}
	// FEATURE 8. Update/edit a part
	// copies the trip record
	updateTripRecord(trip){
		this.beforeUpdateTripCache = trip.tripName
		this.beforeUpdateTerrain = trip.terrain
		this.beforeUpdateDatecache = trip.date
		this.beforeUpdateDistanceCache = Number(trip.distance)
		this.beforeUpdateTimeCache = Number(trip.targetTimeFinished)
		this.beforeStatus = trip.done
		this.updateTrip = trip

	}
	// FEATURE 8. Update/edit a part
	endTripUpdate(trip){
		// FEATURE 10 - Validate inputs
		if (!trip){
			return
		}
		this.updateTrip = null
		// Cleansing Data
		trip.tripName = trip.tripName.trim()
		trip.terrain = trip.terrain.trim()
		// Formatting Data
		trip.distance = Number(trip.distance)
		trip.targetTimeFinished = Number(trip.targetTimeFinished)
		trip.estimatedSpeed = Math.round(Number(trip.distance/trip.targetTimeFinished),2)
		trip.done = trip.done
		const checkdate = this.checkDate(trip.date)
		// Validating Data
		if (!trip.tripName || !trip.distance || !trip.targetTimeFinished || !trip.terrain || !checkdate){
			this.removeTrip(trip)
		}
	}
	// Feature 9 - Discard/revert edits to a part
	discardTripUpdate(trip){
		this.updateTrip = null
		trip.tripName = this.beforeUpdateTripCache
		trip.date = this.beforeUpdateDatecache
		trip.terrain = this.beforeUpdateTerrain
		trip.distance = this.beforeUpdateDistanceCache
		trip.targetTimeFinished = this.beforeUpdateTimeCache
		trip.done = this.beforeStatus
	}
	// Feature 14 - Find a part given a search criterion
	findTrip(trip){
		// filter words based in starting letter
		return this.recorded_trip.filter((plannedTrip) =>{return plannedTrip.tripName.startsWith(trip)})
	}
	// FEATURE 5 - Delete a selected part
	deleteDone(){
		this.recorded_trip = this.getTripsTBD()
	}
}