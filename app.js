// =================================================================
// ZETAA2'S JAVASCRIPT CORE LOGIC
// =================================================================

// 1. Fucking Element Selectors
const canvas = document.getElementById('vector-canvas'); 
const btnOpen = document.getElementById('btn-open');
const btnSave = document.getElementById('btn-save');
const fileInput = document.getElementById('file-input');
const leftSidebar = document.getElementById('left-sidebar');

// State to track the currently active tool
let activeTool = 'select'; 

// =================================================================
// 2. Fucking File Input Logic (Open SVG) 📥
// =================================================================

/**
 * Handles the reading and rendering of an imported SVG file.
 */
function handleFileSelect() {
    const file = fileInput.files[0];
    if (!file) {
        console.error("No file selected, Alpha. Try again.");
        return;
    }

    const reader = new FileReader();

    // The function that runs once the file is fully loaded
    reader.onload = (e) => {
        const svgContent = e.target.result;
        
        // Fucking replacement of the canvas content with the new SVG data
        // We'll only replace the *children* of the main SVG to keep its attributes
        canvas.innerHTML = svgContent;
        
        console.log("SVG loaded successfully into the canvas.");
    };

    // Read the file as a plain text string
    reader.readAsText(file);
}

// Event listener to monitor the hidden file input for file selection
fileInput.addEventListener('change', handleFileSelect);

// Event listener for the visible 'Open' button to trigger the file input click
btnOpen.addEventListener('click', () => {
    fileInput.click();
});

// =================================================================
// 3. Fucking File Output Logic (Save SVG) 📤
// =================================================================

/**
 * Saves the current state of the canvas as a downloadable SVG file.
 */
function saveFile() {
    // Serialize the current SVG element into an XML string
    const svgData = new XMLSerializer().serializeToString(canvas);
    
    // Create a Blob (a file-like object) from the SVG data
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    
    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.download = 'zeta-masterpiece.svg'; // Your desired default filename

    // Programmatically click the link to start the download
    tempLink.click();

    // Clean up the temporary URL and link (fucking professional)
    URL.revokeObjectURL(url);
    tempLink.remove();
    
    console.log("SVG file download initiated: zeta-masterpiece.svg");
}

// Event listener for the Save button
btnSave.addEventListener('click', saveFile);

// =================================================================
// 4. Fucking Tool Switching Logic (Preparation) ⚙️
// =================================================================

/**
 * Handles switching the currently active tool based on button click.
 */
function handleToolSwitch(e) {
    if (e.target.classList.contains('tool-btn')) {
        // Extract the tool ID, e.g., 'tool-pen' -> 'pen'
        const newTool = e.target.id.replace('tool-', '');
        
        // Optional: Remove 'active' class from all buttons
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        
        // Set new active tool and add 'active' class
        activeTool = newTool;
        e.target.classList.add('active');
        
        console.log(`Active tool switched to: ${activeTool}`);
    }
}

// Event listener for the left sidebar buttons
leftSidebar.addEventListener('click', handleToolSwitch);

// Optional: Give the default tool an active look on load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tool-select').classList.add('active');
});

// =================================================================
// END OF CORE LOGIC
// =================================================================
