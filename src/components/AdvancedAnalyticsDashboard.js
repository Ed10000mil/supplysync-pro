import React, { useState, useEffect } from 'react';
import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Heading, VStack } from '@chakra-ui/react';

const INVENTORY_COST_PER_UNIT_PER_YEAR = 0.05;

const AdvancedAnalyticsDashboard = ({ customerData, supplyChainData, reorderFrequency, reorderQuantity }) => {
  const [kpis, setKpis] = useState({});

  useEffect(() => {
    calculateKPIs();
  }, [customerData, supplyChainData, reorderFrequency, reorderQuantity]);

  const calculateKPIs = () => {
    const annualDemand = customerData.reduce((acc, customer) => {
      return acc + ((customer.currentUnits + customer.futureUnits) / 2) * (365 / customer.consumptionFrequency);
    }, 0);

    const averageInventory = (reorderQuantity / 2) + calculateReorderPoint(annualDemand);
    const inventoryTurnoverRatio = annualDemand / averageInventory;
    const holdingCosts = averageInventory * INVENTORY_COST_PER_UNIT_PER_YEAR;
    const averageDaysOfSupply = (averageInventory / annualDemand) * 365;

    setKpis({
      inventoryTurnoverRatio,
      holdingCosts,
      averageInventory,
      averageDaysOfSupply,
    });
  };

  const calculateReorderPoint = (annualDemand) => {
    const dailyDemand = annualDemand / 365;
    const safetyStock = dailyDemand * 7; // Assuming 7 days of safety stock
    return Math.round(safetyStock);
  };

  return (
    <Box>
      <Heading as="h3" size="lg" mb={6}>Advanced Analytics Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Stat>
          <StatLabel fontSize="xl">Inventory Turnover Ratio</StatLabel>
          <StatNumber fontSize="4xl">{kpis.inventoryTurnoverRatio?.toFixed(2)}</StatNumber>
          <StatHelpText fontSize="lg">times per year</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="xl">Annual Holding Costs</StatLabel>
          <StatNumber fontSize="4xl">${kpis.holdingCosts?.toFixed(2)}</StatNumber>
          <StatHelpText fontSize="lg">per year</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="xl">Average Inventory</StatLabel>
          <StatNumber fontSize="4xl">{kpis.averageInventory?.toFixed(0)}</StatNumber>
          <StatHelpText fontSize="lg">units</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="xl">Average Days of Supply</StatLabel>
          <StatNumber fontSize="4xl">{kpis.averageDaysOfSupply?.toFixed(1)}</StatNumber>
          <StatHelpText fontSize="lg">days</StatHelpText>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default AdvancedAnalyticsDashboard;