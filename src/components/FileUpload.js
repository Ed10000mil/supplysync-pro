import React, { useState } from 'react';
import { Box, Button, VStack, Text, useToast, Heading, Input } from '@chakra-ui/react';
import Papa from 'papaparse';

const FileUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const toast = useToast();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          console.log("Full parsed results:", results);
          console.log("Headers:", results.data[0]);
          
          const processedData = results.data.slice(1).map((row, index) => {
            const item = {
              customerName: row[0],
              currentUnits: parseInt(row[1]),
              futureUnits: parseInt(row[2]),
              consumptionFrequency: parseInt(row[3])
            };
            console.log(`Row ${index + 1}:`, item);
            return item;
          }).filter(item => {
            const isValid = !isNaN(item.currentUnits) && !isNaN(item.futureUnits) && !isNaN(item.consumptionFrequency);
            if (!isValid) {
              console.log("Filtered out invalid item:", item);
            }
            return isValid;
          });
          
          console.log("Processed data:", processedData);
          
          if (processedData.length > 0) {
            onFileUpload(processedData);
            toast({
              title: "File uploaded successfully",
              description: `Loaded ${processedData.length} customer records`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          } else {
            toast({
              title: "Error uploading file",
              description: "No valid data found in the file. Please check the file contents.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        },
        header: false,
        error: (error) => {
          console.error("Papa Parse error:", error);
          toast({
            title: "Error uploading file",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      });
    }
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>Upload Customer Data</Heading>
      <VStack spacing={4} align="stretch">
        <Text>Upload a CSV file with the following columns: CustomerName, CurrentUnits, FutureOrders, ConsumptionFrequency</Text>
        <Input type="file" accept=".csv" onChange={handleFileChange} />
        <Button colorScheme="blue" onClick={handleUpload} disabled={!file}>
          Upload CSV
        </Button>
        {file && <Text>Selected file: {file.name}</Text>}
      </VStack>
    </Box>
  );
};

export default FileUpload;