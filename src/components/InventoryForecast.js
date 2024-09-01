import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Select, Table, Thead, Tbody, Tr, Th, Td, Heading } from '@chakra-ui/react';
import ReorderPointDiagram from './ReorderPointDiagram';

const REORDER_FREQUENCIES = {
  WEEKLY: { label: 'Weekly', daysInPeriod: 7 },
  BIWEEKLY: { label: 'Bi-weekly', daysInPeriod: 14 },
  MONTHLY: { label: 'Monthly', daysInPeriod: 30 },
  QUARTERLY: { label: 'Quarterly', daysInPeriod: 90 },
  SEMIANNUALLY: { label: '6 Months', daysInPeriod: 180 },
  YEARLY: { label: 'Yearly', daysInPeriod: 365 },
};

const InventoryForecast = ({ customerData, supplyChainData, reorderFrequency, onReorderFrequencyChange, onReorderQuantityChange }) => {
  const [annualDemand, setAnnualDemand] = useState(0);
  const [reorderPoint, setReorderPoint] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(0);

  useEffect(() => {
    if (customerData.length > 0) {
      calculateMetrics();
    }
  }, [customerData, reorderFrequency]);

  const calculateMetrics = () => {
    const calculatedAnnualDemand = calculateAnnualDemand();
    console.log("Calculated Annual Demand:", calculatedAnnualDemand);
    const calculatedReorderPoint = calculateReorderPoint(calculatedAnnualDemand);
    const calculatedOrderQuantity = calculateOrderQuantity(calculatedAnnualDemand);

    setAnnualDemand(calculatedAnnualDemand);
    setReorderPoint(calculatedReorderPoint);
    setOrderQuantity(calculatedOrderQuantity);
    onReorderQuantityChange(calculatedOrderQuantity);
  };

  const calculateAnnualDemand = () => {
    return customerData.reduce((acc, customer) => {
      // Calculate annual demand for each customer
      const customerAnnualDemand = (customer.currentUnits + customer.futureUnits) * (365 / customer.consumptionFrequency);
      console.log(`Customer: ${customer.customerName}, Annual Demand: ${customerAnnualDemand}`);
      return acc + customerAnnualDemand;
    }, 0);
  };

  const calculateReorderPoint = (calculatedAnnualDemand) => {
    const dailyDemand = calculatedAnnualDemand / 365;
    const leadTime = Object.values(supplyChainData).reduce((acc, task) => acc + task.days, 0);
    const leadTimeDemand = dailyDemand * leadTime;
    const safetyStock = dailyDemand * 7; // Assuming 7 days of safety stock

    return Math.round(leadTimeDemand + safetyStock);
  };

  const calculateOrderQuantity = (calculatedAnnualDemand) => {
    const demandDuringReorderPeriod = (calculatedAnnualDemand / 365) * reorderFrequency.daysInPeriod;
    return Math.round(demandDuringReorderPeriod);
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>Inventory Forecast</Heading>
      <VStack spacing={4} align="stretch">
        <HStack>
          <Text>Reorder Frequency:</Text>
          <Select 
            value={reorderFrequency.label} 
            onChange={(e) => onReorderFrequencyChange(REORDER_FREQUENCIES[Object.keys(REORDER_FREQUENCIES).find(key => REORDER_FREQUENCIES[key].label === e.target.value)])}
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
              <Td isNumeric>{Math.round(annualDemand)}</Td>
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