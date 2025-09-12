debugToggle = false;
function showDebug() {
    debugDiv = document.getElementById("debugDiv");

    if (debugToggle) {
        debugDiv.style.display = "block";
    }
    else {
        debugDiv.style.display = "none";
    }
    debugToggle =! debugToggle;
}