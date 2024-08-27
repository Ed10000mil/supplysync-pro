import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, Heading, Select } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WhatIfScenarios = ({ customerData, supplyChainData, reorderFrequency, onReorderQuantityChange }) => {
  const [leadTimeAdjustment, setLeadTimeAdjustment] = useState(0);
  const [consumptionRateAdjustment, setConsumptionRateAdjustment] = useState(0);
  const [selectedTask, setSelectedTask] = useState('production');
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    calculateForecast();
  }, [customerData, leadTimeAdjustment, consumptionRateAdjustment, selectedTask]);

  const calculateForecast = () => {
    const adjustedSupplyChainData = {
      ...supplyChainData,
      [selectedTask]: {
        ...supplyChainData[selectedTask],
        days: supplyChainData[selectedTask].days * (1 + leadTimeAdjustment / 100)
      }
    };

    const adjustedCustomerData = customerData.map(customer => ({
      ...customer,
      consumptionFrequency: customer.consumptionFrequency / (1 + consumptionRateAdjustment / 100)
    }));

    const dailyDemand = adjustedCustomerData.reduce((acc, customer) => {
      return acc + (customer.currentUnits + customer.futureUnits) / (2 * customer.consumptionFrequency);
    }, 0);

    const newReorderPoint = calculateReorderPoint(dailyDemand * 365, adjustedSupplyChainData);

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

  const calculateReorderPoint = (annualDemand, adjustedSupplyChainData) => {
    const dailyDemand = annualDemand / 365;
    const leadTime = Object.values(adjustedSupplyChainData).reduce((acc, task) => acc + task.days, 0);
    const leadTimeDemand = dailyDemand * leadTime;

    const leadTimeVariance = Object.values(adjustedSupplyChainData).reduce((acc, task) => acc + task.variance ** 2, 0);
    const safetyStock = 1.65 * Math.sqrt(dailyDemand ** 2 * leadTimeVariance + leadTime ** 2 * (dailyDemand * 0.1) ** 2);

    return Math.round(leadTimeDemand + safetyStock);
  };

  return (
    <Box>
      <Heading as="h3" size="md" mb={4}>What-If Scenarios</Heading>
      <VStack spacing={4} align="stretch">
        <HStack>
          <Text>Adjust Lead Time for:</Text>
          <Select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)}>
            {Object.keys(supplyChainData).map(task => (
              <option key={task} value={task}>{task}</option>
            ))}
          </Select>
        </HStack>
        <HStack>
          <Text>Lead Time Adjustment:</Text>
          <Slider
            value={leadTimeAdjustment}
            min={-50}
            max={100}
            step={1}
            onChange={(v) => setLeadTimeAdjustment(v)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Text>{leadTimeAdjustment}%</Text>
        </HStack>
        <HStack>
          <Text>Consumption Rate Adjustment:</Text>
          <Slider
            value={consumptionRateAdjustment}
            min={-50}
            max={100}
            step={1}
            onChange={(v) => setConsumptionRateAdjustment(v)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Text>{consumptionRateAdjustment}%</Text>
        </HStack>
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

export default WhatIfScenarios;