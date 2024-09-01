import React, { useState, useEffect } from 'react';
import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Heading, VStack } from '@chakra-ui/react';

const INVENTORY_COST_PER_UNIT_PER_YEAR = 0.05;
const ORDER_COST = 100; // Assumed cost per order

const AdvancedAnalyticsDashboard = ({ customerData, supplyChainData, reorderFrequency, reorderQuantity }) => {
  const [kpis, setKpis] = useState({});

  useEffect(() => {
    calculateKPIs();
  }, [customerData, supplyChainData, reorderFrequency, reorderQuantity]);

  const calculateKPIs = () => {
    const annualDemand = calculateAnnualDemand();
    console.log("Calculated Annual Demand:", annualDemand); // Debugging log
    const averageInventory = reorderQuantity / 2; // Assuming constant usage
    const inventoryTurnoverRatio = annualDemand / (2* averageInventory);
    const holdingCosts = averageInventory * INVENTORY_COST_PER_UNIT_PER_YEAR;
    const orderingCosts = (annualDemand / reorderQuantity) * ORDER_COST;
    const totalAnnualCost = holdingCosts + orderingCosts;
    const averageDaysOfSupply = (averageInventory / annualDemand) * 365;
    const serviceLevel = calculateServiceLevel(annualDemand);

    setKpis({
      annualDemand,
      inventoryTurnoverRatio,
      holdingCosts,
      orderingCosts,
      totalAnnualCost,
      averageInventory,
      averageDaysOfSupply,
      serviceLevel,
    });
  };

  const calculateAnnualDemand = () => {
    const totalDemand = customerData.reduce((acc, customer) => {
      const dailyDemand = (customer.currentUnits + customer.futureUnits) / (customer.consumptionFrequency);
      const annualDemand = dailyDemand * 365;
      console.log(`Customer: ${customer.customerName}, Annual Demand: ${annualDemand}`); // Debugging log
      return acc + annualDemand;
    }, 0);
    return totalDemand;
  };

  const calculateServiceLevel = (annualDemand) => {
    // This is a simplified calculation. In reality, service level would depend on more factors.
    const dailyDemand = annualDemand / 365;
    const leadTime = Object.values(supplyChainData).reduce((acc, task) => acc + task.days, 0);
    const safetyStock = reorderQuantity - (dailyDemand * leadTime);
    return Math.min(0.99, Math.max(0.5, 1 - (dailyDemand / safetyStock)));
  };

  return (
    <Box>
      <Heading as="h3" size="lg" mb={6}>Advanced Analytics Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Stat>
          <StatLabel fontSize="xl">Annual Demand</StatLabel>
          <StatNumber fontSize="4xl">{Math.round(kpis.annualDemand)}</StatNumber>
          <StatHelpText fontSize="lg">units per year</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="xl">Inventory Turnover Ratio</StatLabel>
          <StatNumber fontSize="4xl">{kpis.inventoryTurnoverRatio?.toFixed(2)}</StatNumber>
          <StatHelpText fontSize="lg">times per year</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="xl">Period Holding Costs</StatLabel>
          <StatNumber fontSize="4xl">${kpis.holdingCosts?.toFixed(2)}</StatNumber>
          <StatHelpText fontSize="lg">per year</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="xl">Period Ordering Costs</StatLabel>
          <StatNumber fontSize="4xl">${kpis.orderingCosts?.toFixed(2)}</StatNumber>
          <StatHelpText fontSize="lg">per year</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="xl">Total Period Cost</StatLabel>
          <StatNumber fontSize="4xl">${kpis.totalAnnualCost?.toFixed(2)}</StatNumber>
          <StatHelpText fontSize="lg">per year</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="xl">Average Inventory</StatLabel>
          <StatNumber fontSize="4xl">{Math.round(kpis.averageInventory)}</StatNumber>
          <StatHelpText fontSize="lg">units</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="xl">Average Days of Supply</StatLabel>
          <StatNumber fontSize="4xl">{kpis.averageDaysOfSupply?.toFixed(1)}</StatNumber>
          <StatHelpText fontSize="lg">days</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="xl">Service Level</StatLabel>
          <StatNumber fontSize="4xl">{(kpis.serviceLevel * 100).toFixed(2)}%</StatNumber>
          <StatHelpText fontSize="lg">estimated</StatHelpText>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default AdvancedAnalyticsDashboard;