import React, { useState } from "react"; // Importing React and useState hook
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"; // Importing drag-and-drop components
import { Bar } from "react-chartjs-2"; // Importing Bar chart component from Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js"; // Importing necessary chart elements from Chart.js
import "./App.css"; // Importing CSS styles

// Register the components needed for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Initial workout blocks with IDs, names, and distances
const initialBlocks = [
  { id: "1", content: "Warm-up", km: 2 },
  { id: "2", content: "Active", km: 5 },
  { id: "3", content: "Cool-down", km: 3 },
  { id: "4", content: "Step Repeats", km: 4 },
  { id: "5", content: "Ramp Up", km: 6 },
  { id: "6", content: "Ramp Down", km: 4 },
];

const App = () => {
  // State variables to manage workout blocks, graph data, and logs
  const [blocks, setBlocks] = useState(initialBlocks);
  const [graphData, setGraphData] = useState([]);
  const [log, setLog] = useState([]);

  // Function to handle the end of a drag-and-drop operation
  const handleDragEnd = (result) => {
    // If there's no destination, exit the function
    if (!result.destination) return;

    // Get the dragged block from the original index
    const draggedBlock = blocks[result.source.index];

    // Add the dragged block to the graph data
    addToGraph(draggedBlock);
  };

  // Function to add a block to the graph data
  const addToGraph = (block) => {
    setGraphData((prev) => {
      // Check if the block already exists in the graph data
      const existingBlock = prev.find((b) => b.content === block.content);
      if (existingBlock) {
        // If it exists, update the count
        return prev.map((b) =>
          b.content === block.content ? { ...b, count: b.count + 1 } : b
        );
      } else {
        // If it doesn't exist, add it to the graph data with count 1
        return [...prev, { ...block, count: 1 }];
      }
    });
    // Add the block to the workout log
    addToLog(block);
  };

  // Function to add a block to the log
  const addToLog = (block) => {
    // Create a log entry with a unique ID
    const logEntry = { id: Date.now(), content: `${block.content}`, km: block.km };
    // Update the log state with the new entry
    setLog((prevLog) => [...prevLog, logEntry]);
  };

  // Function to delete a log entry
  const deleteLogEntry = (logId) => {
    // Update the log by filtering out the deleted entry
    setLog((prevLog) => prevLog.filter((entry) => entry.id !== logId));
    
    // Update the graph data by reducing the count of the deleted block
    setGraphData((prevGraph) =>
      prevGraph
        .map((block) =>
          block.content === log.find(entry => entry.id === logId).content
            ? { ...block, count: block.count > 1 ? block.count - 1 : 0 }
            : block
        )
        .filter((block) => block.count > 0) // Remove blocks with count 0
    );
  };

  // Function to reset all logs and graph data
  const resetAll = () => {
    setLog([]); // Clear the log
    setGraphData([]); // Clear the graph data
  };

  // Preparing chart data for the Bar chart
  const chartData = {
    labels: graphData.map((block) => block.content), // X-axis labels
    datasets: [
      {
        label: 'Workout Count', // Label for the dataset
        data: graphData.map((block) => block.count), // Data points for the chart
        backgroundColor: graphData.map((_, index) => `hsl(${index * 60}, 50%, 60%)`), // Different colors for each bar
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <header className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-bold text-purple-700">Fitness Planner</h1>
        <button
          onClick={resetAll}
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700"
        >
          Reset
        </button>
      </header>

      <main className="grid grid-cols-3 gap-6">
        {/* Workout Blocks Section */}
        <section className="bg-white p-6 shadow-md rounded-lg col-span-1">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Available Workout Blocks</h2>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="workoutBlocks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {blocks.map((block, index) => (
                    <Draggable key={block.id} draggableId={block.id} index={index}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          onClick={() => addToGraph(block)} // Also allows adding on click
                          className="p-4 bg-blue-400 text-white rounded-lg transition-transform transform hover:scale-105 cursor-pointer"
                        >
                          {block.content} - {block.km} km
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </section>

        {/* Graph Section */}
        <section className="bg-white p-6 shadow-md rounded-lg col-span-2">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Workout Visualization</h2>
          <div className="bg-gray-200 p-4 h-80">
            {graphData.length === 0 ? (
              <p className="text-gray-600">No workouts added yet.</p>
            ) : (
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            )}
          </div>
        </section>

        {/* Log Section */}
        <section className="col-span-3 bg-white p-6 shadow-md rounded-lg mt-4">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Workout Log</h2>
          <div className="bg-gray-200 p-4 h-40 overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-gray-600">No workouts logged yet.</p>
            ) : (
              <ul>
                {log.map((entry) => (
                  <li key={entry.id} className="flex justify-between p-3 bg-green-400 text-black my-2 rounded-lg">
                    <span>{entry.content} - {entry.km} km</span>
                    <button
                      onClick={() => deleteLogEntry(entry.id)}
                      className="bg-red-600 text-white p-1 rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App; // Exporting the App component
