import { useEffect, useRef, useState } from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import  * as fabric from "fabric";
import io from "socket.io-client";

const socket = io("https://career-community-connector-backend.onrender.com");

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize Fabric.js Canvas
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            isDrawingMode: true,
            backgroundColor: "#fff",
            width: 500,
            height: 300,
        });

        setCanvas(fabricCanvas);

        // Ensure brush properties
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.color = "#256";
        fabricCanvas.freeDrawingBrush.width = 3;

        // 🔹 Emit drawing event when a user draws
        fabricCanvas.on("path:created", (event) => {
            const pathData = event.path.toObject(); // Convert to JSON
            socket.emit("draw", pathData);
        });

        // 🔹 Listen for incoming draw events
        const handleDraw = (data) => {
            if (!fabricCanvas) {
                console.error("Canvas is not initialized");
                return;
            }
            
            console.log("Received data:", data);
            
            try {
                // Make sure we're working with proper data
                const objectData = typeof data === 'string' ? JSON.parse(data) : data;
                console.log("Processing data type:", objectData.type);
                
                // Create object based on type
                let fabricObject;
                
                if (objectData.type === 'Path') {
                    fabricObject = new fabric.Path(objectData.path, objectData);
                } else if (objectData.type === 'Rect') {
                    fabricObject = new fabric.Rect(objectData);
                } else if (objectData.type === 'Circle') {
                    fabricObject = new fabric.Circle(objectData);
                } else if (objectData.type === 'Polyline') {
                    fabricObject = new fabric.Polyline(objectData.points, objectData);
                } else {
                    console.warn("Unsupported object type:", objectData.type);
                    return;
                }
                
                console.log("Object created:", fabricObject);
                
                if (fabricObject) {
                    fabricCanvas.add(fabricObject);
                    fabricCanvas.renderAll();
                    console.log("Object added to canvas");
                }
            } catch (error) {
                console.error("Error handling draw data:", error);
            }
        };


        // 🔹 Listen for board clear event
        const handleClear = () => {
            fabricCanvas.clear();
            fabricCanvas.backgroundColor = "#fff";
        };

        socket.on("draw", handleDraw);
        socket.on("clear", handleClear);

        return () => {
            socket.off("draw", handleDraw);
            socket.off("clear", handleClear);
            fabricCanvas.dispose();
        };
    }, []);

    // Clear the whiteboard and notify others
    const handleClear = () => {
        if (canvas) {
            canvas.clear();
            canvas.backgroundColor = "#fff";
            socket.emit("clear");
        }
    };

    return (
        <Box bg="white" p={4} borderRadius="lg" shadow="md">
            <canvas ref={canvasRef} />
            <Box mt={4} display="flex" justifyContent="space-between">
                <IconButton
                    icon={<DeleteIcon />}
                    onClick={handleClear}
                    aria-label="Clear Board"
                    bgColor={"red.500"}
                    color={"white"}
                    _hover={{ bgColor: "red.700" }}
                />
            </Box>
        </Box>
    );
};

export default Whiteboard;