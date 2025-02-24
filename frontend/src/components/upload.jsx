import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Upload = () => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [file, setFile] = useState(null);
    const [prediction, setPrediction] = useState(null);  // Ensure this state updates per request
    const [showTable, setShowTable] = useState(false);

    // Handle image upload
    const handleImageUpload = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
            };
            reader.readAsDataURL(selectedFile);
            setFile(selectedFile);
        }
    };

    // Handle form submission and fetch prediction from the API
    const handleSubmit = async () => {
        if (!file) {
            alert('Please upload an image first.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/predict/', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();

                // Make sure prediction updates each time based on response
                const roundedCost = Math.round(result.estimated_cost);
                setPrediction({
                    square_feet: Math.round(result.square_feet),
                    beds: Math.round(result.beds),
                    baths: Math.round(result.baths),
                    garages: Math.round(result.garages),
                    estimated_cost: roundedCost
                });
                setShowTable(true);  // Show the table after prediction
            } else {
                alert('Error during upload or prediction.');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload the image. Please try again.');
        }
    };

    const calculateMaterialCosts = () => {
        if (!prediction) return {};  

        const { square_feet, beds, baths, garages} = prediction;  

        return {
            foundation: {
                cement: (12 * square_feet/9),
                rebar: (0.75 * square_feet/10),
                gravel: (20 * square_feet/20),
                quarry_stone: (30 * square_feet/28),
                dpc: (10 * square_feet/60),
                brick_force: (20 * square_feet/150),
                bricks: (0.2 * square_feet/0.20),
                anchor_bolts: (0.50 * square_feet/8),
            },
            roofing: {
                asbestos: (20 * square_feet/30),
                roof_decking: (25 * square_feet/70),
                ridges: (5 * square_feet/50),
                roofing_nails: (10 * square_feet/200),
            },
            walls: {
                pit_sand: (20 * square_feet/45),
                river_sand: (20 * square_feet/50),
                cement: (13 * square_feet/15),
                bricks: (0.2 * square_feet/0.15),
                siding_nails: (0.5 * square_feet/100),
                air_vents: (3 * 2 * (beds + baths + garages + 2)),

            },
            windowsAndDoors: {
                windows: (9 * 4 * (beds + baths + garages + 2)),
                doors: (60 * (baths + beds + garages + 2)),
                door_frames: (54 * (beds + baths + garages + 2)),
                sliding_glass_doors: (200 ),
                window_frame: (28 * 2 * (beds + baths + garages + 2)),
            },
            interiorFinishing: {
                tiles: (1 * square_feet/10),
                interior_paint: (25 * square_feet/100),
                ceiling: (11 * square_feet/10),
            },
        };
    };

    const materialCosts = prediction ? calculateMaterialCosts() : {};

    const generatePDF = () => {
        const doc = new jsPDF();

        const headers = ['Material', 'Unit Price (USD)', 'Quantity', 'Cost (USD)'];

        // Function to add a section to the PDF
        const addSectionToPDF = (title, data) => {
            const startY = doc.autoTable.previous ? doc.autoTable.previous.finalY + 20 : 20; // Start position
            doc.setFontSize(12);
            doc.text(title, 20, startY); // Ensure title is a string and startY is a number
            doc.autoTable({
                head: [headers],
                body: data.map(item => [
                    item.material, 
                    item.unitPrice.toFixed(2), 
                    item.quantity, 
                    item.cost
                ]),
                startY: startY + 10, // Start table below the title
            });
        };

        // Prepare data for each section
        const foundationData = [
            { material: 'Cement', unitPrice: 12, quantity: (materialCosts.foundation.cement / 12).toFixed(0), cost: (materialCosts.foundation.cement).toFixed(0) },
            { material: 'Bricks', unitPrice: 0.20, quantity: (materialCosts.foundation.bricks / 0.2).toFixed(0), cost: (materialCosts.foundation.bricks).toFixed(0) },
            { material: 'Rebar', unitPrice: 0.75, quantity: (materialCosts.foundation.rebar / 0.75).toFixed(0), cost: (materialCosts.foundation.rebar).toFixed(0) },
            { material: 'Gravel', unitPrice: 20, quantity: (materialCosts.foundation.gravel / 20).toFixed(0), cost: (materialCosts.foundation.gravel).toFixed(0) },
            { material: 'Quarry Stones', unitPrice: 30, quantity: (materialCosts.foundation.quarry_stone / 30).toFixed(0), cost: (materialCosts.foundation.quarry_stone).toFixed(0) },
            { material: 'DPC', unitPrice: 10, quantity: (materialCosts.foundation.dpc / 10).toFixed(0), cost: (materialCosts.foundation.dpc).toFixed(0) },
            { material: 'Brick Force', unitPrice: 20, quantity: (materialCosts.foundation.brick_force / 20).toFixed(0), cost: (materialCosts.foundation.brick_force).toFixed(0) },
            { material: 'Anchor Bolts', unitPrice: 0.50, quantity: (materialCosts.foundation.anchor_bolts / 0.5).toFixed(0), cost: (materialCosts.foundation.anchor_bolts).toFixed(0) },
        ];

        const wallsData = [
            { material: 'Pit Sand', unitPrice: 20, quantity: (materialCosts.walls.pit_sand / 20).toFixed(0), cost: (materialCosts.walls.pit_sand).toFixed(0) },
            { material: 'River Sand', unitPrice: 20, quantity: (materialCosts.walls.river_sand / 20).toFixed(0), cost: (materialCosts.walls.river_sand).toFixed(0) },
            { material: 'Cement', unitPrice: 13, quantity: (materialCosts.walls.cement / 13).toFixed(0), cost: (materialCosts.walls.cement).toFixed(0) },
            { material: 'Bricks', unitPrice: 0.20, quantity: (materialCosts.walls.bricks / 0.2).toFixed(0), cost: (materialCosts.walls.bricks).toFixed(0) },
            { material: 'Siding Nails', unitPrice: 0.50, quantity: (materialCosts.walls.siding_nails / 0.5).toFixed(0), cost: (materialCosts.walls.siding_nails).toFixed(0) },
            { material: 'Air Vents', unitPrice: 3, quantity: (materialCosts.walls.air_vents / 3).toFixed(0), cost: (materialCosts.walls.air_vents).toFixed(0) },
        ];

        const roofingData = [
            { material: 'Asbestos', unitPrice: 20, quantity: (materialCosts.roofing.asbestos / 20).toFixed(0), cost: (materialCosts.roofing.asbestos).toFixed(0) },
            { material: 'Roof Decking', unitPrice: 25, quantity: (materialCosts.roofing.roof_decking / 25).toFixed(0), cost: (materialCosts.roofing.roof_decking).toFixed(0) },
            { material: 'Ridges', unitPrice: 5, quantity: (materialCosts.roofing.ridges / 5).toFixed(0), cost: (materialCosts.roofing.ridges).toFixed(0) },
            { material: 'Roofing Nails', unitPrice: 10, quantity: (materialCosts.roofing.roofing_nails / 10).toFixed(0), cost: (materialCosts.roofing.roofing_nails).toFixed(0) },
        ];

        const windowsAndDoorsData = [
            { material: 'Windows', unitPrice: 9 * 4, quantity: (materialCosts.windowsAndDoors.windows / 9).toFixed(0), cost: (materialCosts.windowsAndDoors.windows).toFixed(0) },
            { material: 'Doors', unitPrice: 60, quantity: (materialCosts.windowsAndDoors.doors / 60).toFixed(0), cost: (materialCosts.windowsAndDoors.doors).toFixed(0) },
            { material: 'Door Frames', unitPrice: 54, quantity: (materialCosts.windowsAndDoors.door_frames / 54).toFixed(0), cost: (materialCosts.windowsAndDoors.door_frames).toFixed(0) },
            { material: 'Sliding Glass Doors', unitPrice: 200, quantity: (materialCosts.windowsAndDoors.sliding_glass_doors).toFixed(0), cost: (materialCosts.windowsAndDoors.sliding_glass_doors).toFixed(0) },
            { material: 'Window Frames', unitPrice: 28 * 2, quantity: (materialCosts.windowsAndDoors.window_frame / 28).toFixed(0), cost: (materialCosts.windowsAndDoors.window_frame).toFixed(0) },
        ];

        const interiorFinishingData = [
            { material: 'Tiles', unitPrice: 1, quantity: (materialCosts.interiorFinishing.tiles).toFixed(0), cost: (materialCosts.interiorFinishing.tiles).toFixed(0) },
            { material: 'Interior Paint', unitPrice: 25, quantity: (materialCosts.interiorFinishing.interior_paint / 25).toFixed(0), cost: (materialCosts.interiorFinishing.interior_paint).toFixed(0) },
            { material: 'Ceiling', unitPrice: 11, quantity: (materialCosts.interiorFinishing.ceiling / 11).toFixed(0), cost: (materialCosts.interiorFinishing.ceiling).toFixed(0) },
        ];

        // Add all sections to the PDF
        addSectionToPDF('Foundation', foundationData);
        addSectionToPDF('Walls', wallsData);
        addSectionToPDF('Roofing', roofingData);
        addSectionToPDF('Windows and Doors', windowsAndDoorsData);
        addSectionToPDF('Interior Finishing', interiorFinishingData);

        // Save the PDF
        doc.save('material_costs.pdf');
    };

    return (
        <div className="flex flex-col items-center mb-4 pb-10 px-8 mx-4 rounded-3xl bg-gray-100 border-4 border-blue-600 min-h-screen">
            <h2 className="w-full text-2xl font-bold text-center leading-10 tracking-widest text-gray-700 pb-10 pt-6">
                Upload Floor Plan
            </h2>

            <div className="flex flex-col items-center w-full">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-4 px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none focus:border-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-400"
                />

                {uploadedImage && (
                    <div className="mt-5">
                        <img
                            src={uploadedImage}
                            alt="Uploaded Floor Plan"
                            className="h-64 w-auto rounded-lg border-2 border-blue-600"
                        />
                    </div>
                )}

                <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-400 max-w-xs mx-auto"
                    onClick={handleSubmit}
                >
                    Get Estimated Cost
                </button>
            </div>

            {showTable && prediction && (
                <div className="col-span-12 mt-5 w-full">
                    <div className="grid gap-2 grid-cols-1 lg:grid-cols-1">
                    <button
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-400 max-w-xs mx-auto"
                                onClick={generatePDF}
                            >
                                Download PDF
                            </button>
                        <div className="h-1"></div>
                        <div className="bg-white p-4 shadow-lg rounded-lg w-full">
                            <h1 className="font-bold text-2xl text-center tracking-widest text-gray-700 pb-2 pt-2">Estimations</h1>
                           
                            <div className="mt-4">
                                <div className="flex flex-col">
                                    <div className="-my-2 overflow-x-auto">
                                        <div className="py-2 align-middle inline-block min-w-full">
                                            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg bg-white">
                                                <table className="min-w-full divide-y divide-gray-500">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">SQUARE FEET</th>
                                                            <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">KITCHEN</th>
                                                            <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">LIVING ROOM</th>
                                                            <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">BEDS</th>
                                                            <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">BATHS</th>
                                                            <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">GARAGES</th>
                                                            <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">COST (USD)</th>
                                                            <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">LABOUR COST (USD)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-center">{prediction.square_feet}</td>
                                                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-center">1</td>
                                                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-center">1</td>
                                                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-center">{prediction.beds}</td>
                                                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-center">{prediction.baths}</td>
                                                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-center">{prediction.garages}</td>
                                                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-center">${prediction.estimated_cost}</td>
                                                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-center">${(prediction.estimated_cost * 0.2).toFixed(0) }</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-2"></div>

                        <div className="mt-8 bg-white p-4 shadow-lg rounded-lg w-full">
                            <h1 className="font-bold text-2xl text-center tracking-widest text-gray-700 pb-2 pt-2">
                                Foundation
                            </h1>

                            <div className="overflow-x-auto mt-4">
                                <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
                                    <table className="min-w-full leading-normal divide-y divide-gray-500">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Quantity
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Price per Unit
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Cost (USD)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Cement</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.cement / 12 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$12</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.cement ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Bricks</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.bricks / 0.2 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$0.20</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.bricks ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Rebar</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.rebar / 0.75 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$0.75</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.rebar ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Gravel</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.gravel / 20).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$20</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.gravel).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Quarry stones</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.quarry_stone / 30 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$30</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.quarry_stone ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">DPC</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.dpc / 10 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$10</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.dpc ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Brick force</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.brick_force / 20 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$20</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.brick_force ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Anchor bolts</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.anchor_bolts / 0.5).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$0.50</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.foundation.anchor_bolts ).toFixed(0)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>


                        <div className="mt-8 bg-white p-4 shadow-lg rounded-lg w-full">
                            <h1 className="font-bold text-2xl text-center tracking-widest text-gray-700 pb-2 pt-2">
                                Roofing 
                            </h1>

                            <div className="overflow-x-auto mt-4">
                                <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
                                    <table className="min-w-full leading-normal divide-y divide-gray-500">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Quantity
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Price per Unit
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Cost (USD)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Asbestos</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.roofing.asbestos / 20 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$20</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.roofing.asbestos ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Roof Decking</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.roofing.roof_decking / 25 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$25</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.roofing.roof_decking ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Ridges</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.roofing.ridges / 5 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$5</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.roofing.ridges ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Roofing nails</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.roofing.roofing_nails / 10 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$10</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.roofing.roofing_nails ).toFixed(0)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-white p-4 shadow-lg rounded-lg w-full">
                            <h1 className="font-bold text-2xl text-center tracking-widest text-gray-700 pb-2 pt-2">
                                Walls
                            </h1>

                            <div className="overflow-x-auto mt-4">
                                <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
                                    <table className="min-w-full leading-normal divide-y divide-gray-500">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Quantity
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Price per Unit
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Cost (USD)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Pit sand</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.pit_sand / 20 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$20</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.pit_sand ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">River sand</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.river_sand / 20).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$20</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.river_sand ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Cement</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.cement / 13 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$13</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.cement ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Bricks</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.bricks / 0.2 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$0.2</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.bricks ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Siding nails</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.siding_nails / 0.5 ).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$0.5</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.siding_nails ).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Air vents</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.air_vents / 3).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$3</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.walls.air_vents).toFixed(0)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-white p-4 shadow-lg rounded-lg w-full">
                            <h1 className="font-bold text-2xl text-center tracking-widest text-gray-700 pb-2 pt-2">
                                Windows and Doors
                            </h1>

                            <div className="overflow-x-auto mt-4">
                                <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
                                    <table className="min-w-full leading-normal divide-y divide-gray-500">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Quantity
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Price per Unit
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Cost (USD)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Window panels</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.windowsAndDoors.windows / 9).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$9</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.windowsAndDoors.windows).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Doors</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.windowsAndDoors.doors / 60).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$60</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.windowsAndDoors.doors).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Door frames</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.windowsAndDoors.door_frames / 54).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$54</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.windowsAndDoors.door_frames).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Sliding glass doors</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.windowsAndDoors.sliding_glass_doors / 200).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$200</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.windowsAndDoors.sliding_glass_doors).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Window frames</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.windowsAndDoors.window_frame / 28).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$28</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.windowsAndDoors.window_frame).toFixed(0)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-white p-4 shadow-lg rounded-lg w-full">
                            <h1 className="font-bold text-2xl text-center tracking-widest text-gray-700 pb-2 pt-2">
                                Interior Finishing
                            </h1>

                            <div className="overflow-x-auto mt-4">
                                <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
                                    <table className="min-w-full leading-normal divide-y divide-gray-500">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Quantity
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Price per Unit
                                                </th>
                                                <th className="px-6 py-3 bg-gray-400 text-xs leading-4 font-bold text-gray-800 uppercase tracking-wider">
                                                    Cost (USD)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Tiles</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.interiorFinishing.tiles).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$1.00</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.interiorFinishing.tiles).toFixed(0)}</td>
                                            </tr>

                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Interior paint</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.interiorFinishing.interior_paint / 25).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$25</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.interiorFinishing.interior_paint).toFixed(0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center bg-gray-400">Ceiling</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.interiorFinishing.ceiling / 11).toFixed(0)}</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">$11</td>
                                                <td className="px-6 py-3 border-b border-gray-200 text-center">{(materialCosts.interiorFinishing.ceiling).toFixed(0)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="h-2"></div>

                        

                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;
