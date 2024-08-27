import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, Heading } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const InteractiveDemandForecast = ({ customerData, supplyChainData, reorderFrequency, onReorderQuantityChange }) => {
  const [demandAdjustment, setDemandAdjustment] = useState(0);
  const [forecastData, setForecastData] = useState([]);
  const [reorderPoint, setReorderPoint] = useState(0);

  useEffect(() => {
    if (customerData.length > 0) {
      calculateForecast();
    }
  }, [customerData, demandAdjustment, reorderFrequency]);

  const calculateForecast = () => {
    const adjustedCustomerData = customerData.map(customer => ({
      ...customer,
      futureUnits: customer.futureUnits * (1 + demandAdjustment / 100)
    }));

    const dailyDemand = adjustedCustomerData.reduce((acc, customer) => {
      return acc + (customer.currentUnits + customer.futureUnits) / (2 * customer.consumptionFrequency);
    }, 0);

    const newReorderPoint = calculateReorderPoint(dailyDemand * 365);
    setReorderPoint(newReorderPoint);

    const orderQuantity = Math.round(dailyDemand * reorderFrequency.daysInPeriod);
    onReorderQuantityChange(orderQuantity);

    const forecastDays = 90; // 3 months forecast
    const forecast = [];
    let currentInventory = newReorderPoint + orderQuantity;

    for (let day = 0; day < forecastDays; day++) {
      if (day % reorderFrequency.daysInPeriod === 0 && day !== 0) {
        currentInventory = Math.min(currentInventory + orderQuantity, newReorderPoint + orderQuantity);
      }

      forecast.push({
        day,
        inventory: Math.max(0, Math.round(currentInventory)),
        reorderPoint: newReorderPoint,
      });

      currentInventory -= dailyDemand;
    }

    setForecastData(forecast);
  };

  const calculateReorderPoint = (annualDemand) => {
    const dailyDemand = annualDemand / 365;
    const leadTime = Object.values(supplyChainData).reduce((acc, task) => acc + task.days, 0);
    const leadTimeDemand = dailyDemand * leadTime;

    const leadTimeVariance = Object.values(supplyChainData).reduce((acc, task) => acc + task.variance ** 2, 0);
    const safetyStock = 1.65 * Math.sqrt(dailyDemand ** 2 * leadTimeVariance + leadTime ** 2 * (dailyDemand * 0.1) ** 2);

    return Math.round(leadTimeDemand + safetyStock);
  };

  return (
    <Box>
      <Heading as="h3" size="md" mb={4}>Interactive Demand Forecast</Heading>
      <VStack spacing={4} align="stretch">
        <HStack>
          <Text>Adjust Future Demand:</Text>
          <Slider
            value={demandAdjustment}
            min={-50}
            max={50}
            step={1}
            onChange={(v) => setDemandAdjustment(v)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Text>{demandAdjustment}%</Text>
        </HStack>
        <Text>New Reorder Point: {reorderPoint} units</Text>
        <Box height="400px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottomRight', offset: -10 }} />
              <YAxis label={{ value: 'Inventory Level', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="inventory" stroke="#8884d8" name="Inventory" />
              <Line type="monotone" dataKey="reorderPoint" stroke="#82ca9d" name="Reorder Point" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </VStack>
    </Box>
  );
};

export default InteractiveDemandForecast;