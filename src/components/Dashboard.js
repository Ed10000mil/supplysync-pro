import React, { useState, useEffect } from 'react';
import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Heading, Select } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TIME_FRAMES = {
  DAILY: { label: 'Daily', days: 1 },
  WEEKLY: { label: 'Weekly', days: 7 },
  MONTHLY: { label: 'Monthly', days: 30 },
  QUARTERLY: { label: 'Quarterly', days: 90 },
  YEARLY: { label: 'Yearly', days: 365 },
};

const Dashboard = ({ customerData }) => {
  const [timeFrame, setTimeFrame] = useState(TIME_FRAMES.MONTHLY);
  const [totalDemand, setTotalDemand] = useState(0);
  const [demandTrend, setDemandTrend] = useState([]);

  useEffect(() => {
    calculateDemand();
    generateDemandTrend();
  }, [customerData, timeFrame]);

  const calculateDemand = () => {
    const demand = customerData.reduce((acc, customer) => {
      const dailyDemand = (customer.currentUnits + customer.futureUnits) / (2 * customer.consumptionFrequency);
      return acc + (dailyDemand * timeFrame.days);
    }, 0);
    setTotalDemand(Math.round(demand));
  };

  const generateDemandTrend = () => {
    const trend = customerData.map((customer, index) => ({
      name: customer.customerName || `Customer ${index + 1}`,
      current: (customer.currentUnits / customer.consumptionFrequency) * timeFrame.days,
      future: (customer.futureUnits / customer.consumptionFrequency) * timeFrame.days,
    }));
    setDemandTrend(trend);
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>Dashboard</Heading>
      <Select 
        value={timeFrame.label} 
        onChange={(e) => setTimeFrame(Object.values(TIME_FRAMES).find(f => f.label === e.target.value))}
        mb={4}
      >
        {Object.values(TIME_FRAMES).map(frame => (
          <option key={frame.label} value={frame.label}>{frame.label} Demand</option>
        ))}
      </Select>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mb={10}>
        <Stat>
          <StatLabel>Total Demand</StatLabel>
          <StatNumber>{totalDemand}</StatNumber>
          <StatHelpText>units per {timeFrame.label.toLowerCase()}</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Number of Customers</StatLabel>
          <StatNumber>{customerData.length}</StatNumber>
        </Stat>
      </SimpleGrid>
      <Box height="400px">
        <Heading as="h3" size="md" mb={4}>Demand Trend ({timeFrame.label})</Heading>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={demandTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="current" stroke="#8884d8" name="Current Demand" />
            <Line type="monotone" dataKey="future" stroke="#82ca9d" name="Future Demand" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Dashboard;