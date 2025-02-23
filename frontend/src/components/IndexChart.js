// const response = await fetch('https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=EWS&apikey=WUNUMFYJIU9YDTHL');
// demo api has unlimited calls. prod api has a limit of 20 calls a day

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

/**
 * Sorts an array of objects based on a specified date column. Each object in the array should have a property with a date string
 * that corresponds to the column name provided. The dates are compared and sorted in ascending order.
 *
 * @param {Object[]} array - The array of objects to be sorted.
 * @param {string} col - The column name that contains date strings in each object of the array.
 * @returns {Object[]} - The sorted array of objects. Note that the sorting is done in place, modifying the original array.
 *
 */
function sortData(array, col) {
  return array.sort((a, b) => new Date(a[col]) - new Date(b[col]));
}


/**
 * Rebases the price data in an array of objects based on the first object's prices. Each object in the array
 * should have properties `indexPrice` and `historicalPrice`. The function calculates new prices as a percentage
 * relative to these base prices, adding `rebasedIndexPrice` and `rebasedHistoricalPrice` properties to each object.
 *
 * @param {Object[]} mergedData - An array of objects, each containing `indexPrice` and `historicalPrice` properties.
 * @returns {Object[]} - An array of objects where each object includes the original properties along with
 *                       `rebasedIndexPrice` and `rebasedHistoricalPrice` representing the rebased prices as percentages
 *                       of the first object's prices.
 *
 */
function rebaseMergedData(mergedData) {
  if (mergedData.length === 0) return [];

  const baseIndexPrice = mergedData[0].indexPrice;
  const baseHistoricalPrice = mergedData[0].historicalPrice;

  return mergedData.map(data => ({
    ...data,
    rebasedIndexPrice: (data.indexPrice / baseIndexPrice) * 100,
    rebasedHistoricalPrice: (data.historicalPrice / baseHistoricalPrice) * 100
  }));
}

/**
 * Merge two arrays of data objects, `indexData` and `historicalData`, based on their `date` properties.
 * Each object in the `indexData` array should contain a `date` and `adjustedClose`, and each object in
 * the `historicalData` array should contain a `date` and `Psf`. The function aligns data by matching dates,
 * combining `adjustedClose` from `indexData` and `Psf` from `historicalData` into a single object.
 *
 * @param {Object[]} indexData - An array of objects, each containing a `date` and `adjustedClose` property.
 * @param {Object[]} historicalData - An array of objects, each containing a `date` and `Psf` property.
 * @returns {Object[]} - An array of merged objects where each object includes `date`, `indexPrice` (from `adjustedClose`),
 *                       and `historicalPrice` (from `Psf`) properties for dates that appear in both input arrays.
 *
 */
function mergeChartData(indexData, historicalData) {
  const mergedData = [];
  let i = 0, j = 0;
  while (i < indexData.length && j < historicalData.length) {
    if (indexData[i].date === historicalData[j].date) {
      mergedData.push({
        date: indexData[i].date,
        indexPrice: indexData[i].adjustedClose,
        historicalPrice: historicalData[j].Psf
      });
      i++;
      j++;
    } else if (new Date(indexData[i].date) < new Date(historicalData[j].date)) {
      i++;
    } else {
      j++;
    }
  }
  return mergedData;
}

/**
 * Renders a line chart to display financial data trends, specifically comparing index fund performance
 * and historical resale prices over time. The component handles data fetching, processing, and dynamic resizing
 * of the chart based on viewport changes.
 *
 * Props:
 * @param {Object} avgPriceData - Data object containing average price information which may include various metrics
 *                                like "RecordsAveragePrice" used to plot historical price trends.
 *
 * State:
 * @state {Array} chartData - Stores the chart data that is displayed.
 * @state {Object} chartDimensions - Stores the current dimensions of the chart, which are updated on window resize.
 *
 * Behavior:
 * - On mount and whenever `avgPriceData` changes, the component fetches index data from an API and processes it along
 *   with the `avgPriceData` to create a unified data structure for visualization.
 * - The chart dimensions are updated on window resize to maintain responsiveness.
 * - Uses Recharts' `LineChart` for rendering the data.
 *
 * Note:
 * Ensure that the API key for fetching index data is valid and the API is operational. Handle API and data processing
 * errors gracefully to maintain user experience.
 *
 * @returns {React.Element} A component that displays a line chart based on provided financial data.
 */
function IndexChart({ avgPriceData }) {

  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null); 
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: window.innerHeight * 0.25 });

  // Handle resizing chart dimensions
  const handleResize = () => {
    if (chartRef.current) {
      setChartDimensions({
        width: chartRef.current.offsetWidth * 0.95,
        height: window.innerHeight * 0.25
      });
    }
  };

  // Call handleResize on window resize
  useEffect(() => {
    handleResize();  
    window.addEventListener('resize', handleResize);  
    return () => window.removeEventListener('resize', handleResize);  
  }, []);

  // Fetch Index and process data for IndexChart
  useEffect(() => {
    async function fetchIndexData() {
      try {
        const response = await fetch('https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=IBM&apikey=demo');
        const result = await response.json();
        if (!result["Monthly Adjusted Time Series"]) {
          console.error('No data found');
          return;
        }
        const indexData = Object.entries(result["Monthly Adjusted Time Series"]).map(([date, info]) => ({
          date: date.substring(0, 7),
          adjustedClose: parseFloat(info["5. adjusted close"])
        }));

        let historicalData = [];
        if (avgPriceData && avgPriceData.getRecordsAveragePrice) {
          historicalData = avgPriceData.getRecordsAveragePrice.map(item => ({
            date: item._id.substring(0, 7),
            Psf: item.Psf
          }));
        }

        const sortedIndexData = sortData(indexData, 'date');
        const sortedHistoricalData = sortData(historicalData, 'date');
        const mergedData = mergeChartData(sortedIndexData, sortedHistoricalData);
        const rebasedData = rebaseMergedData(mergedData);

        setChartData(rebasedData);
      } catch (error) {
        console.error('Failed to fetch or process index data:', error);
      }
    }

    fetchIndexData();
  }, [avgPriceData]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '100%' }}>
      {(!avgPriceData || !avgPriceData.getRecordsAveragePrice.length) ? (
        <p>No data found.</p>
      ) : (
        <LineChart width={chartDimensions.width} height={chartDimensions.height} data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="rebasedIndexPrice" name="Index Fund Performance" stroke="#8884d8" dot={false} />
          <Line type="monotone" dataKey="rebasedHistoricalPrice" name="Historical Resale Prices" stroke="#ff7300" dot={false} />
        </LineChart>
      )}
    </div>
  );
}

export default IndexChart;
