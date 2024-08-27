import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { Chart } from 'react-google-charts';

const GanttChart = ({ customerData, supplyChainData, reorderQuantity }) => {
  const calculateProductionTime = () => {
    const totalDemand = customerData.reduce((acc, customer) => acc + customer.currentUnits, 0);
    const productionQuantity = Math.max(totalDemand, reorderQuantity);
    
    if (productionQuantity > supplyChainData.production.threshold2) {
      return 25;
    } else if (productionQuantity > supplyChainData.production.threshold1) {
      return 20;
    } else {
      return supplyChainData.production.minDays;
    }
  };

  const productionTime = calculateProductionTime();

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const data = [
    [
      { type: 'string', label: 'Task ID' },
      { type: 'string', label: 'Task Name' },
      { type: 'string', label: 'Resource' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' },
    ],
    [
      'Planning',
      'Planning and Scheduling',
      'Planning Team',
      new Date(2024, 0, 1),
      addDays(new Date(2024, 0, 1), 5),
      5 * 24,
      100,
      null,
    ],
    [
      'Production',
      'Production',
      'Production Team',
      addDays(new Date(2024, 0, 1), 5),
      addDays(new Date(2024, 0, 1), 5 + productionTime),
      productionTime * 24,
      100,
      'Planning',
    ],
    [
      'QualityControl',
      'Quality Control',
      'QC Team',
      addDays(new Date(2024, 0, 1), 5 + productionTime),
      addDays(new Date(2024, 0, 1), 5 + productionTime + 2),
      2 * 24,
      100,
      'Production',
    ],
    [
      'Packaging',
      'Packaging',
      'Packaging Team',
      addDays(new Date(2024, 0, 1), 5 + productionTime + 2),
      addDays(new Date(2024, 0, 1), 5 + productionTime + 4),
      2 * 24,
      100,
      'QualityControl',
    ],
    [
      'Shipping',
      'Shipping',
      'Logistics Team',
      addDays(new Date(2024, 0, 1), 5 + productionTime + 4),
      addDays(new Date(2024, 0, 1), 5 + productionTime + 4 + supplyChainData.shipping.days),
      supplyChainData.shipping.days * 24,
      100,
      'Packaging',
    ],
    [
      'CustomsClearance',
      'Customs Clearance',
      'Customs Team',
      addDays(new Date(2024, 0, 1), 5 + productionTime + 4 + supplyChainData.shipping.days),
      addDays(new Date(2024, 0, 1), 5 + productionTime + 4 + supplyChainData.shipping.days + supplyChainData.customsClearance.days),
      supplyChainData.customsClearance.days * 24,
      100,
      'Shipping',
    ],
    [
      'InventoryCheck',
      'Inventory Check',
      'Inventory Team',
      addDays(new Date(2024, 0, 1), 5 + productionTime + 4 + supplyChainData.shipping.days + supplyChainData.customsClearance.days),
      addDays(new Date(2024, 0, 1), 5 + productionTime + 4 + supplyChainData.shipping.days + supplyChainData.customsClearance.days + supplyChainData.inventoryCheck.days),
      supplyChainData.inventoryCheck.days * 24,
      100,
      'CustomsClearance',
    ],
  ];

  const options = {
    height: 400,
    gantt: {
      trackHeight: 30,
      criticalPathEnabled: true,
      criticalPathStyle: {
        stroke: '#e64a19',
        strokeWidth: 2,
      },
    },
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>Supply Chain Gantt Chart</Heading>
      <Chart
        chartType="Gantt"
        width="100%"
        height="400px"
        data={data}
        options={options}
      />
    </Box>
  );
};

export default GanttChart;