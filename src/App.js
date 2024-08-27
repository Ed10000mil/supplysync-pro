import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import { ChakraProvider, Box, VStack, HStack, Heading, Text, useToast, Container } from '@chakra-ui/react';
import FileUpload from './components/FileUpload';
import GanttChart from './components/GanttChart';
import InventoryForecast from './components/InventoryForecast';
import Dashboard from './components/Dashboard';
import InteractiveDemandForecast from './components/InteractiveDemandForecast';
import WhatIfScenarios from './components/WhatIfScenarios';
import AdvancedAnalyticsDashboard from './components/AdvancedAnalyticsDashboard';

const App = () => {
  const [customerData, setCustomerData] = useState([]);
  const [supplyChainData, setSupplyChainData] = useState({
    production: { minDays: 15, threshold1: 15000, threshold2: 40000, variance: 0.2, days: 15 },
    shipping: { days: 25, variance: 0.3 },
    customsClearance: { days: 2, variance: 0.6 },
    inventoryCheck: { days: 2, variance: 0.4 }
  });
  const [reorderFrequency, setReorderFrequency] = useState({ label: 'Monthly', daysInPeriod: 30 });
  const [reorderQuantity, setReorderQuantity] = useState(0);
  const toast = useToast();

  useEffect(() => {
    console.log("Customer Data:", customerData);
    console.log("Supply Chain Data:", supplyChainData);
  }, [customerData, supplyChainData]);

  const handleFileUpload = (data) => {
    console.log("Received uploaded data:", data);
    setCustomerData(data);
    toast({
      title: "Data uploaded successfully",
      description: `Loaded ${data.length} customer records`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleReorderQuantityChange = (quantity) => {
    setReorderQuantity(quantity);
  };

  return (
    <ChakraProvider>
      <Router>
        <Box minHeight="100vh" bg="gray.50">
          <Container maxW="container.xl" py={5}>
            <VStack spacing={8} align="stretch">
              <Heading as="h1" size="xl" textAlign="center" color="blue.600">
                Lilianfeld Candles
              </Heading>
              <HStack as="nav" spacing={4} justify="center" bg="white" p={4} borderRadius="md" boxShadow="sm">
                <NavLink to="/" style={({ isActive }) => isActive ? { fontWeight: "bold", color: "blue" } : undefined}>
                  <Text as="span" _hover={{ color: "blue.500" }}>Dashboard</Text>
                </NavLink>
                <NavLink to="/upload" style={({ isActive }) => isActive ? { fontWeight: "bold", color: "blue" } : undefined}>
                  <Text as="span" _hover={{ color: "blue.500" }}>Upload Data</Text>
                </NavLink>
                <NavLink to="/gantt" style={({ isActive }) => isActive ? { fontWeight: "bold", color: "blue" } : undefined}>
                  <Text as="span" _hover={{ color: "blue.500" }}>Gantt Chart</Text>
                </NavLink>
                <NavLink to="/forecast" style={({ isActive }) => isActive ? { fontWeight: "bold", color: "blue" } : undefined}>
                  <Text as="span" _hover={{ color: "blue.500" }}>Inventory Forecast</Text>
                </NavLink>
                <NavLink to="/interactive" style={({ isActive }) => isActive ? { fontWeight: "bold", color: "blue" } : undefined}>
                  <Text as="span" _hover={{ color: "blue.500" }}>Interactive Forecast</Text>
                </NavLink>
                <NavLink to="/what-if" style={({ isActive }) => isActive ? { fontWeight: "bold", color: "blue" } : undefined}>
                  <Text as="span" _hover={{ color: "blue.500" }}>What-If Scenarios</Text>
                </NavLink>
                <NavLink to="/analytics" style={({ isActive }) => isActive ? { fontWeight: "bold", color: "blue" } : undefined}>
                  <Text as="span" _hover={{ color: "blue.500" }}>Advanced Analytics</Text>
                </NavLink>
              </HStack>
              <Box bg="white" p={6} borderRadius="md" boxShadow="md">
                <Routes>
                  <Route path="/" element={<Dashboard customerData={customerData} supplyChainData={supplyChainData} />} />
                  <Route path="/upload" element={<FileUpload onFileUpload={handleFileUpload} />} />
                  <Route path="/gantt" element={<GanttChart customerData={customerData} supplyChainData={supplyChainData} />} />
                  <Route path="/forecast" element={
                    customerData.length > 0 ? (
                      <InventoryForecast 
                        customerData={customerData} 
                        supplyChainData={supplyChainData} 
                        reorderFrequency={reorderFrequency}
                        onReorderFrequencyChange={setReorderFrequency}
                        onReorderQuantityChange={handleReorderQuantityChange}
                      />
                    ) : (
                      <Text>Please upload customer data first.</Text>
                    )
                  } />
                  <Route path="/interactive" element={
                    customerData.length > 0 ? (
                      <InteractiveDemandForecast 
                        customerData={customerData} 
                        supplyChainData={supplyChainData}
                        reorderFrequency={reorderFrequency}
                        onReorderQuantityChange={handleReorderQuantityChange}
                      />
                    ) : (
                      <Text>Please upload customer data first.</Text>
                    )
                  } />
                  <Route path="/what-if" element={
                    customerData.length > 0 ? (
                      <WhatIfScenarios 
                        customerData={customerData} 
                        supplyChainData={supplyChainData}
                        reorderFrequency={reorderFrequency}
                        onReorderQuantityChange={handleReorderQuantityChange}
                      />
                    ) : (
                      <Text>Please upload customer data first.</Text>
                    )
                  } />
                  <Route path="/analytics" element={
                    customerData.length > 0 ? (
                      <AdvancedAnalyticsDashboard 
                        customerData={customerData} 
                        supplyChainData={supplyChainData}
                        reorderFrequency={reorderFrequency}
                        reorderQuantity={reorderQuantity}
                      />
                    ) : (
                      <Text>Please upload customer data first.</Text>
                    )
                  } />
                </Routes>
              </Box>
            </VStack>
          </Container>
        </Box>
      </Router>
    </ChakraProvider>
  );
};

export default App;