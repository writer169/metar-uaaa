// 1. Импортируем модуль 'metar-parser'
import pkg from 'metar-parser';

// 2. Извлекаем функцию 'parse' из импортированного модуля.
// Мы используем несколько вариантов, чтобы гарантировать, что функция будет найдена.
const metarParser = pkg.parse || pkg.default || pkg;
const parse = metarParser.parse || metarParser; 

// Аэропорт, который нас интересует
const airportICAO = 'UAAA';

// Стандартный обработчик Vercel
export default async function handler(request, response) {

  // ИСПРАВЛЕННАЯ ОПЕЧАТКА: airportICAO
  const url = `https://aviationweather.gov/api/data/metar?ids=${airportICAO}&format=json`;

  try {
    const apiResponse = await fetch(url);
    if (!apiResponse.ok) {
      return response.status(apiResponse.status).json({ error: 'Ошибка при запросе к API погоды' });
    }

    const data = await apiResponse.json();
    const metarData = data[0];

    if (!metarData || !metarData.rawOb) {
      return response.status(404).json({ error: 'Поле rawOb не найдено в ответе API' });
    }

    const rawMetarString = metarData.rawOb;

    // 3. Вызываем функцию 'parse', которая теперь гарантированно является функцией
    const parsedData = parse(rawMetarString);

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    
    return response.status(200).json(parsedData);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Внутренняя ошибка сервера или ошибка парсинга' });
  }
}