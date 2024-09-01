import React from 'react';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReorderPointDiagram = ({ customerData, supplyChainData, reorderFrequency, reorderPoint, orderQuantity }) => {
  const generateInventoryData = () => {
    const data = [];
    const dailyDemand = calculateDailyDemand();
    let currentInventory = reorderPoint + orderQuantity;
    const daysToSimulate = 365; // Simulate for a year

    for (let day = 0; day <= daysToSimulate; day++) {
      // Add order quantity when inventory reaches reorder point
      if (currentInventory <= reorderPoint && day % reorderFrequency.daysInPeriod === 0) {
        currentInventory += orderQuantity;
      }

      data.push({
        day,
        inventory: Math.max(0, Math.round(currentInventory)),
        reorderPoint: reorderPoint,
      });

      currentInventory -= dailyDemand;
    }

    return data;
  };

  const calculateDailyDemand = () => {
    const annualDemand = customerData.reduce((acc, customer) => {
      return acc + ((customer.currentUnits + customer.futureUnits) * (365 / customer.consumptionFrequency));
    }, 0);
    return annualDemand / 365;
  };

  const data = generateInventoryData();

  return (
    <Box mt={8}>
      <Heading as="h3" size="md" mb={4}>Inventory Level Over Time</Heading>
      <VStack spacing={4} align="stretch">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottomRight', offset: -10 }} />
            <YAxis label={{ value: 'Inventory Level', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="inventory" stroke="#8884d8" dot={false} name="Inventory" />
            <Line type="monotone" dataKey="reorderPoint" stroke="#82ca9d" strokeDasharray="5 5" name="Reorder Point" />
          </LineChart>
        </ResponsiveContainer>
        <Text>Reorder Point: {reorderPoint} units</Text>
      </VStack>
    </Box>
  );
};

export default ReorderPointDiagram;