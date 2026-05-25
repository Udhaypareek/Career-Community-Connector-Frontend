import { useEffect, useRef, useState } from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import  * as fabric from "fabric";

const Whiteboard = ({ socket, roomId }) => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Ensure this socket is in the room so draw events are bidirectional
        if (socket && roomId) {
            socket.emit("join chat", roomId);
        }

        // Initialize Fabric.js Canvas
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            isDrawingMode: true,
            backgroundColor: "#fff",
            width: Math.min(500, window.innerWidth - 72),
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
            socket?.emit("draw", { roomId, pathData });
        });

        // 🔹 Listen for incoming draw events
        const handleDraw = async (data) => {
            if (!fabricCanvas) {
                console.error("Canvas is not initialized");
                return;
            }

            try {
                const objectData = typeof data === "string" ? JSON.parse(data) : data;
                const [fabricObject] = await fabric.util.enlivenObjects([objectData]);

                if (fabricObject) {
                    fabricCanvas.add(fabricObject);
                    fabricCanvas.renderAll();
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

        socket?.on("draw", handleDraw);
        socket?.on("clear", handleClear);

        return () => {
            socket?.off("draw", handleDraw);
            socket?.off("clear", handleClear);
            fabricCanvas.dispose();
        };
    }, [socket, roomId]);

    // Clear the whiteboard and notify others
    const handleClear = () => {
        if (canvas) {
            canvas.clear();
            canvas.backgroundColor = "#fff";
            socket?.emit("clear", { roomId });
        }
    };

    return (
        <Box bg="white" p={4} borderRadius="lg" shadow="md" overflowX="auto">
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
