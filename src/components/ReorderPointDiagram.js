import React from 'react';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';

const ReorderPointDiagram = ({ customerData, supplyChainData, reorderFrequency, reorderPoint, orderQuantity }) => {
  const generateInventoryData = () => {
    const data = [];
    const dailyDemand = customerData.reduce((acc, customer) => {
      return acc + (customer.currentUnits + customer.futureUnits) / (2 * customer.consumptionFrequency);
    }, 0);
    
    let currentInventory = reorderPoint + orderQuantity;
    const leadTime = Object.values(supplyChainData).reduce((acc, task) => acc + task.days, 0);
    
    for (let day = 0; day <= 365; day++) {
      if (day % reorderFrequency.daysInPeriod === 0 && day !== 0) {
        currentInventory = Math.min(currentInventory + orderQuantity, reorderPoint + orderQuantity);
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
            <ReferenceLine y={reorderPoint} label="Reorder Point" stroke="red" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="inventory" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="reorderPoint" stroke="red" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
        <Text>Reorder Point: {reorderPoint} units</Text>
        <Text>Order Quantity: {orderQuantity} units</Text>
        <Text>Reorder Frequency: {reorderFrequency.label}</Text>
      </VStack>
    </Box>
  );
};

export default ReorderPointDiagram;