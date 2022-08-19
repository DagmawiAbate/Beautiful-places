const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
]

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid // { pid: 'p1' }

  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place',
      500
    )
    return next(error)
  }

  if (!place) {
    const error = new HttpError(
      'Could not find a place for the provided id.',
      404
    )
    return next(error)
  }

  res.json({ place: place.toObject( {getters: true }) }) // => { place } => { place: place }
}

// function getPlacesById() { ... }
// const getPlacesById = function() { ... }

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid

  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId
  })

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find a places for the provided user id.', 404)
    )
  }

  res.json({ places })
}

const createPlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }

  const { title, description, address, creator } = req.body

  let coordinates
  try {
    coordinates = await getCoordsForAddress(address)
  } catch (error) {
    return next(error)
  }

  // const title = req.body.title;
  const createdPlace = new Place({
    title: title,
    description,
    address,
    location: coordinates,
    image:
      'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=388&q=80',
    creator
  })

  try {
    await createdPlace.save()
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again.')
    return next(error)
  }

  res.status(201).json({ place: createdPlace }, 500)
}

const updatePlace = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422)
  }

  const { title, description } = req.body
  const placeId = req.params.pid

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) }
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId)
  updatedPlace.title = title
  updatedPlace.description = description

  DUMMY_PLACES[placeIndex] = updatedPlace

  res.status(200).json({ place: updatedPlace })
}

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid
  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError('Could not find a place for that id.', 404)
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId)
  res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
