import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { DataGrid } from "@mui/x-data-grid";

function ResultsComponent() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const columns = [
    { field: "details", headerName: "Details", flex: 1, minWidth: 150 },
    { field: "prediction", headerName: "Prediction", flex: 0.4},
    {
      field: "preventiveMeasures",
      headerName: "Preventive Measures",
      flex: 1
    },
    { field: "symptoms", headerName: "Symptoms", flex: 1 },
    { field: "treatments", headerName: "Treatments", flex: 1, minWidth: 50 },
  ];

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    try {
      const response = await fetch("http://localhost:3000/results");
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      setError("Failed to fetch results");
    }
  }

  const rows = [
    {
      _id: "64772ff006c9a3e625d10204",
      prediction: "Apple___Cedar_apple_rust",
      details:
        "\nCedar-apple rust is a fungal disease caused by th…nd is most common in the eastern United States.\n\n",
      symptoms:
        "\nOn apple trees, the disease causes yellow spots o…s orange-brown galls on the branches and twigs.\n\n",
      treatments:
        "\nThe best way to treat cedar-apple rust is to prun… fungicides can be used to control the disease.\n\n",
    },
  ];

  return (
    <div>
      <Navbar />
      {error && <p>{error}</p>}
      <div style={{ height: 400, width: "100%" }}>
        {results.length > 0 && (
          <DataGrid
            getRowId={(row) => row._id}
            rows={results}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
          />
        )}
      </div>
    </div>
  );
}

export default ResultsComponent;
