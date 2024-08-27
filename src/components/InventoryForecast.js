import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Select, Table, Thead, Tbody, Tr, Th, Td, Heading } from '@chakra-ui/react';
import ReorderPointDiagram from './ReorderPointDiagram';

const REORDER_FREQUENCIES = {
  WEEKLY: { label: 'Weekly', daysInPeriod: 7 },
  MONTHLY: { label: 'Monthly', daysInPeriod: 30 },
  QUARTERLY: { label: 'Quarterly', daysInPeriod: 90 },
  BIANNUAL: { label: '6 Months', daysInPeriod: 180 },
  YEARLY: { label: 'Yearly', daysInPeriod: 365 },
};

const InventoryForecast = ({ customerData, supplyChainData, onReorderQuantityChange }) => {
  const [reorderFrequency, setReorderFrequency] = useState(REORDER_FREQUENCIES.MONTHLY);
  const [totalDemand, setTotalDemand] = useState(0);
  const [reorderPoint, setReorderPoint] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(0);

  useEffect(() => {
    if (customerData.length > 0) {
      calculateMetrics();
    }
  }, [customerData, reorderFrequency]);

  const calculateMetrics = () => {
    const annualDemand = calculateAnnualDemand();
    const demandPerPeriod = (annualDemand / 365) * reorderFrequency.daysInPeriod;
    const orderQty = Math.round(demandPerPeriod);
    const reorderPt = calculateReorderPoint(annualDemand);

    setTotalDemand(annualDemand);
    setOrderQuantity(orderQty);
    setReorderPoint(reorderPt);
    onReorderQuantityChange(orderQty);
  };

  const calculateAnnualDemand = () => {
    return customerData.reduce((acc, customer) => {
      const dailyDemand = (customer.currentUnits + customer.futureUnits) / (2 * customer.consumptionFrequency);
      return acc + (dailyDemand * 365);
    }, 0);
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
      <Heading as="h2" size="lg" mb={6}>Inventory Forecast</Heading>
      <VStack spacing={4} align="stretch">
        <HStack>
          <Text>Reorder Frequency:</Text>
          <Select 
            value={reorderFrequency.label} 
            onChange={(e) => setReorderFrequency(Object.values(REORDER_FREQUENCIES).find(f => f.label === e.target.value))}
          >
            {Object.values(REORDER_FREQUENCIES).map(freq => (
              <option key={freq.label} value={freq.label}>{freq.label}</option>
            ))}
          </Select>
        </HStack>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Metric</Th>
              <Th isNumeric>Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Annual Demand (units)</Td>
              <Td isNumeric>{Math.round(totalDemand)}</Td>
            </Tr>
            <Tr>
              <Td>Reorder Point (units)</Td>
              <Td isNumeric>{reorderPoint}</Td>
            </Tr>
            <Tr>
              <Td>Order Quantity (units)</Td>
              <Td isNumeric>{orderQuantity}</Td>
            </Tr>
            <Tr>
              <Td>Reorder Frequency</Td>
              <Td isNumeric>{reorderFrequency.label}</Td>
            </Tr>
          </Tbody>
        </Table>
      </VStack>
      <ReorderPointDiagram 
        customerData={customerData} 
        supplyChainData={supplyChainData} 
        reorderFrequency={reorderFrequency}
        reorderPoint={reorderPoint}
        orderQuantity={orderQuantity}
      />
    </Box>
  );
};

export default InventoryForecast;