const hasValue = value => value !== undefined && value !== null && value !== ""

const firstValue = (...values) => values.find(hasValue)

const valueFromArrayOrObject = value => {
  if (Array.isArray(value)) return valueFromArrayOrObject(value[0])
  if (value && typeof value === "object") {
    return firstValue(value.value, value.text, value.description, value.name)
  }
  return value
}

const unwrapWeatherResponse = response =>
  response?.data?.data ?? response?.data ?? response

export const normalizeWeather = response => {
  const payload = unwrapWeatherResponse(response)
  const current =
    payload?.currentWeather ||
    payload?.current ||
    payload?.weather?.current ||
    payload?.current_condition?.[0] ||
    payload

  if (!current || typeof current !== "object") return null

  const condition = valueFromArrayOrObject(
    firstValue(
      current.weatherCondition,
      current.condition,
      current.description,
      current.conditionDescription,
      current.weatherDescription,
      current.weatherDesc,
      current.currentCondition,
      current.lang_vi,
      current.weatherText,
    ),
  )

  return {
    temperature: firstValue(
      current.temperature,
      current.temperatureC,
      current.tempC,
      current.temp_C,
      current.temp_c,
      current.temp,
      current.temperatureCelsius,
    ),
    apparentTemperature: firstValue(
      current.apparentTemperature,
      current.apparent_temperature,
    ),
    condition: condition || "Chưa cập nhật",
    humidity: firstValue(
      current.humidity,
      current.humidityPercent,
      current.relativeHumidity,
    ),
    windSpeed: firstValue(
      current.windSpeed,
      current.windSpeedKmph,
      current.windSpeedKph,
      current.windspeedKmph,
      current.wind_speed,
    ),
    windDirection: firstValue(
      current.windDirection,
      current.winddir16Point,
      current.windDirectionText,
    ),
    updatedAt: firstValue(
      current.updatedAt,
      current.observationTime,
      current.lastUpdated,
      payload?.updatedAt,
      payload?.lastUpdated,
    ),
    iconCode: firstValue(current.weatherCode, current.iconCode, current.code),
  }
}
