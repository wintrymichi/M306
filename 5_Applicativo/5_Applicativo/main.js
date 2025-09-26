var toneRefInput = document.getElementById("toneRefInput");
var toneDesc = document.getElementById("toneDesc");


var guitarChords= {
    mi_basso: 82.41,  // E2
    la: 110.00, // A2
    re: 146.83, // D3
    sol: 196.00, // G3
    si: 246.94, // B3
    mi_alto: 329.63   // E4
  };
  
var ukuleleChords = {
    do: 261.63,  // C4
    mi: 329.63,  // E4
    sol: 392.00, // G4
    la: 440.00   // A4
  };



function updateToneRefValue() {
    toneDesc.innerHTML = toneRefInput.value;

}











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


function init() {
    updateToneRefValue();
    updateChordsHz();
    var tuneBar = document.getElementById("tuneBar");

    var tuneBar = document.getElementById("tuneBar");
    var tuneIndicator = document.getElementById("tuneIndicator");

    var barWidth = tuneBar.offsetWidth;
    var indicatorWidth = tuneIndicator.offsetWidth;


    var centerPosition = (barWidth - indicatorWidth) / 2;


    tuneIndicator.style.position = "absolute"; 
    tuneIndicator.style.left = centerPosition + "px";



}

micToggle=false;
function toggleMic() {
    var button = document.getElementById("toggleMicButton");
    if(micToggle) {
        button.innerHTML="<p class='material-icons' style='font-size:30px'>mic</p><p>Attiva microfono</p>"
    }
    else {
        button.innerHTML="<p class='material-icons' style='font-size:30px'>mic_off</p><p>Disattiva microfono</p>"

    }

    micToggle =! micToggle;

}






var currentInstrument = 0

function  updateChordsHz() {
    var div = document.getElementById("instrumentChords");
    div.innerHTML = "";

    if (currentInstrument == 0) {
        for (var i in guitarChords) {
            div.innerHTML += "<p>"+ i + "<span>" + guitarChords[i]+"</span></p>"
        }
    }
    else if (currentInstrument == 1) {
        for (var i in ukuleleChords) {
            div.innerHTML += "<p>"+ i + "<span>" + guitarChords[i]+"Hz<</span></p>"
        }
    }


    var tuneFreq = parseFloat(document.getElementById("toneDesc").innerHTML);
    var semitone = Math.pow(2, 1/12); // proporzione costante per ogni semitono

    // --- Chitarra (Mi2 - La2 - Re3 - Sol3 - Si3 - Mi4) ---
    guitarChords = {
        mi_basso: tuneFreq * Math.pow(semitone, -29), // E2
        la:       tuneFreq * Math.pow(semitone, -24), // A2
        re:       tuneFreq * Math.pow(semitone, -19), // D3
        sol:      tuneFreq * Math.pow(semitone, -14), // G3
        si:       tuneFreq * Math.pow(semitone, -10), // B3
        mi_alto:  tuneFreq * Math.pow(semitone, -5)   // E4
    };

    // --- Ukulele (Sol4 - Do4 - Mi4 - La4) ---
    ukuleleChords = {
        sol: tuneFreq * Math.pow(semitone, -2), // G4
        do:  tuneFreq * Math.pow(semitone, -9), // C4
        mi:  tuneFreq * Math.pow(semitone, -5), // E4
        la:  tuneFreq                          // A4
    };

    
}



  toneRefInput.addEventListener('input', () => {
    updateToneRefValue();
    updateChordsHz();

    
  });
