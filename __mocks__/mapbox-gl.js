const mockMap = {
  on: jest.fn(),
  once: jest.fn(),
  remove: jest.fn(),
  addSource: jest.fn(),
  addLayer: jest.fn(),
  getSource: jest.fn(),
  getLayer: jest.fn(),
  isStyleLoaded: jest.fn().mockReturnValue(true),
}

const Map = jest.fn().mockImplementation(() => mockMap)

const Marker = jest.fn().mockImplementation(() => ({
  setLngLat: jest.fn().mockReturnThis(),
  setPopup: jest.fn().mockReturnThis(),
  addTo: jest.fn().mockReturnThis(),
}))

const Popup = jest.fn().mockImplementation(() => ({
  setHTML: jest.fn().mockReturnThis(),
}))

module.exports = { Map, Marker, Popup, accessToken: '' }
