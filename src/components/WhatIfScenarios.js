import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, Heading, Select } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WhatIfScenarios = ({ customerData, supplyChainData, reorderFrequency, onReorderQuantityChange }) => {
  const [leadTimeAdjustment, setLeadTimeAdjustment] = useState(0);
  const [consumptionRateAdjustment, setConsumptionRateAdjustment] = useState(0);
  const [selectedTask, setSelectedTask] = useState('production');
  const [forecastData, setForecastData] = useState([]);
  const [annualDemand, setAnnualDemand] = useState(0);
  const [reorderPoint, setReorderPoint] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(0);

  useEffect(() => {
    calculateScenario();
  }, [customerData, leadTimeAdjustment, consumptionRateAdjustment, selectedTask, reorderFrequency]);

  const calculateScenario = () => {
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

    const calculatedAnnualDemand = calculateAnnualDemand(adjustedCustomerData);
    const calculatedReorderPoint = calculateReorderPoint(calculatedAnnualDemand, adjustedSupplyChainData);
    const calculatedOrderQuantity = calculateOrderQuantity(calculatedAnnualDemand);

    setAnnualDemand(calculatedAnnualDemand);
    setReorderPoint(calculatedReorderPoint);
    setOrderQuantity(calculatedOrderQuantity);
    onReorderQuantityChange(calculatedOrderQuantity);

    const forecastDays = 365;
    const dailyDemand = calculatedAnnualDemand / 365;
    let currentInventory = calculatedReorderPoint + calculatedOrderQuantity;
    const forecast = [];

    for (let day = 0; day < forecastDays; day++) {
      if (currentInventory <= calculatedReorderPoint && day % reorderFrequency.daysInPeriod === 0) {
        currentInventory += calculatedOrderQuantity;
      }

      forecast.push({
        day,
        inventory: Math.max(0, Math.round(currentInventory)),
        reorderPoint: calculatedReorderPoint,
      });

      currentInventory -= dailyDemand;
    }

    setForecastData(forecast);
  };

  const calculateAnnualDemand = (adjustedData) => {
    return adjustedData.reduce((acc, customer) => {
      return acc + ((customer.currentUnits + customer.futureUnits) * (365 / customer.consumptionFrequency));
    }, 0);
  };

  const calculateReorderPoint = (calculatedAnnualDemand, adjustedSupplyChainData) => {
    const dailyDemand = calculatedAnnualDemand / 365;
    const leadTime = Object.values(adjustedSupplyChainData).reduce((acc, task) => acc + task.days, 0);
    const leadTimeDemand = dailyDemand * leadTime;
    const safetyStock = dailyDemand * 7; // Assuming 7 days of safety stock
    return Math.round(leadTimeDemand + safetyStock);
  };

  const calculateOrderQuantity = (calculatedAnnualDemand) => {
    return Math.round((calculatedAnnualDemand / 365) * reorderFrequency.daysInPeriod);
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
        <Text>Annual Demand: {Math.round(annualDemand)} units</Text>
        <Text>Reorder Point: {reorderPoint} units</Text>
        <Text>Order Quantity: {orderQuantity} units</Text>
        <Box height="400px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottomRight', offset: -10 }} />
              <YAxis label={{ value: 'Inventory Level', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="inventory" stroke="#8884d8" dot={false} name="Inventory" />
              <Line type="monotone" dataKey="reorderPoint" stroke="#82ca9d" strokeDasharray="5 5" name="Reorder Point" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </VStack>
    </Box>
  );
};

export default WhatIfScenarios;