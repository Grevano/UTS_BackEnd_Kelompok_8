const weatherStationService = require('./weather-stations-service.js');
/**Note: Ingat! tambahkan weatherStationService.
 * di depan fungsi yang dipanggil dari weather-station-service.js
 */

const addWeatherStation = async (req, res) => {
  if (req.user.role !== "student") {
    try {
      const message = await weatherStationService.createWeatherStation(req.body);
      res.status(200).json({ message });
    } catch (error) {
      if (error.name === 'ValidationError') {
        //Mmebuat array berisi berbagai error
        const errors = Object.values(error.errors).map(err => err.message);
        //Menggabungkan error tsb dengan koma
        return res.status(400).json({ error: errors.join(', ') });
      }
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(401).json({ message: "You are not authorised to access this content" });
  }
};

const addSensorReadingsForStation = async (req, res) => {
  if (req.user.role !== "student") {
    try {
      const message = await weatherStationService.insertSensorReadings(req.params.deviceName, req.body);
      res.status(200).json({ message });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(401).json({ message: "You are not authorised to access this content" });
  }
};

const getMaxPrecipitation = async (req, res) => {
  try {
    const deviceName = req.params.deviceName;

    const result = await weatherStationService.getMaxPrecipitation(deviceName);

    res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getSensorReadingsByDate = async (req, res) => {
  try {
    const { deviceName, date } = req.params;
    const result = await weatherStationService.getReadingsByDateService(deviceName, date);

    res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteSensorReadingsInRange = async (req, res) => {
  if (req.user.role !== "student") {
    try {
      const deviceName = req.params.deviceName;
      const { startDate, endDate } = req.query;

      const { deletedCount, notFound } = await weatherStationService.deleteSensorReadingsInRange(
        deviceName,
        startDate,
        endDate
      );

      if (notFound) {
        return res.status(404).json({ message: "No data found in the provided date range" });
      }

      return res.status(200).json({ message: `${deletedCount} ${deviceName} readings deleted` });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(401).json({ message: "You are not authorised to access this content" });
  }
};
  
async function getStations(request, response, next) {
  try {
    const offset = request.query.offset || 0;
    const limit = request.query.limit || 20;
    const users = await weatherStationService.getStations(offset, limit);

    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}
//function create API to: GET | /weather-stations/max-temperature
//get max temperature in data range for all data
//API Results example: { "deviceName= Station-XYZ",
//"maxTemperature =50.64"}
const getMaxTemperature = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
  
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required query parameters." });
      }
  
      const result = await weatherStationService.getMaxTemperatureInRange(startDate, endDate);
  
      if (result.length === 0) {
        return res.status(404).json({ message: "No data found in the provided date range." });
      }
  
      res.status(200).json(result[0]);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: error.message });
    }
  };


//Mau dibikin module.export aja?
module.exports = {
  addWeatherStation,
  addSensorReadingsForStation,
  getMaxPrecipitation,
  getSensorReadingsByDate,
  deleteSensorReadingsInRange,
  getStations,
  getMaxTemperature,
}