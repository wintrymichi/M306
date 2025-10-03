var toneRefInput = document.getElementById("toneRefInput");
var toneDesc = document.getElementById("toneDesc");

const guitarButton = document.getElementById("guitarButton");
const ukuleleButton = document.getElementById("ukuleleButton");
const customButton = document.getElementById("customButton");

var currentButton = guitarButton;
var currentInstrument = 0

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

  var customChords = {
    add_new_chord: "?"
  }



function updateToneRefValue() {
    toneDesc.innerHTML = toneRefInput.value;
}

function init() {
    updateToneRefValue();
    updateChordsHz();

    //centra la barra dell'accordatore
    var tuneBar = document.getElementById("tuneBar");

    var tuneBar = document.getElementById("tuneBar");
    var tuneIndicator = document.getElementById("tuneIndicator");

    var barWidth = tuneBar.offsetWidth;
    var indicatorWidth = tuneIndicator.offsetWidth;


    var centerPosition = (barWidth - indicatorWidth) / 2;


    tuneIndicator.style.position = "absolute"; 
    tuneIndicator.style.left = centerPosition + "px";



}

let micToggle = false;
let micStream = null; //lo stream del suono catturato dal microfono
let audioCtx = null; //audio web audio API
let analyser = null; //permettere di leggere le frequenze
let freqAnimation = null; //l'animazione

async function toggleMic() {
    const button = document.getElementById("toggleMicButton");

    if (!micToggle) {
        // ATTIVA microfono
        button.innerHTML = "<p class='material-icons' style='font-size:30px'>mic_off</p><p>Disattiva microfono</p>";
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true }); //chiede al browser di usare il microfono
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(micStream); //prende lo stream del microfono e lo trasforma in un audio node. Lo rende ora uno stream elaborabile

            analyser = audioCtx.createAnalyser(); //è un oggetto che serve ad analizzare lo stream in audio node.  non lo modifica, lo analizza solo
            analyser.fftSize = 2048; //fast fourier transform --> algoritmo che scompone un suono come un equalizzatore. 2048 è la grandezza del campione audio, deve essere una potenza di 2. può essere grande ma dopo diventa pesante, anche se è più preciso
    
            // 🔹 Crea un gain per amplificare il microfono (utile per frequenze basse)
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = 5; // puoi regolare da 1 a 10 se serve più/meno volume

            // 🔹 Crea filtro passa-basso a 500 Hz
            const lowpassFilter = audioCtx.createBiquadFilter();
            lowpassFilter.type = "lowpass";
            lowpassFilter.frequency.value = 500;

            // 🔹 Collega tutto: mic → gain → filtro → analyser
            source.connect(gainNode);
            gainNode.connect(lowpassFilter);
            lowpassFilter.connect(analyser);

            // 🔹 Imposta smoothing per rendere più stabili i valori bassi
            analyser.smoothingTimeConstant = 0.8;

            const bufferLength = analyser.frequencyBinCount; //chiede all'analizzatore quanti valori di frequenza esistono (fft/2)
            const dataArray = new Uint8Array(bufferLength); //crea un array lungo quanto tutti i valori di frequenza che esistono. da 0 a 255. Indica quanto è forte una frequenza.

            function updateFrequency() {

                analyser.getByteFrequencyData(dataArray); //riempie l'array con i valori attuali che trasmette il microfono

                let max = -Infinity; //qualsiasi valore sarà maggiore  a questo
                let index = -1;
                for (let i = 0; i < bufferLength; i++) {
                    if (dataArray[i] > max) {
                        max = dataArray[i];
                        index = i;
                    }
                }

                //trova il picco di potenza massima (max) e index è la casella dove c'è il picco di potenza massima, in frequenza. Questo vuol dire che index è la frequenza più forte che è stata rilevata.

                const nyquist = audioCtx.sampleRate / 2; //sample rate è quante volte al secondo il suono viene campionato, di solito 48000 o 44100. Nyquist è la frequenza più alta che posso rappresentare, si fa /2 perché il resto sarebbe confuso e non sarebbe in grado di rilevare la frequensza
                const freq = index * nyquist / bufferLength;

                document.getElementById("tuneFreq").innerHTML = freq;

                //sampleRate = 48000 → Nyquist = 24000 Hz
                //fftSize = 2048 → bufferLength = 1024 caselle
                //Ogni casella vale 24000 / 1024 ≈ 23,4 Hz.


                freqAnimation = requestAnimationFrame(updateFrequency);
            }

            updateFrequency();

        } catch (err) {
            console.error("Errore accesso microfono:", err);
        }

    } else {
        // DISATTIVA microfono
        button.innerHTML = "<p class='material-icons' style='font-size:30px'>mic</p><p>Attiva microfono</p>";

        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            micStream = null;
        }

        if (freqAnimation) {
            cancelAnimationFrame(freqAnimation);
            freqAnimation = null;
        }

        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
    }

    micToggle = !micToggle;
}


function  updateChordsHz() {
    var div = document.getElementById("instrumentChords");
    div.innerHTML = "";

    if (currentInstrument == 0) {
        for (var i in guitarChords) {
            div.innerHTML += "<p>"+ i + "<span>" + guitarChords[i]+" Hz</span></p>"
        }
    }
    else if (currentInstrument == 1) {
        for (var i in ukuleleChords) {
            div.innerHTML += "<p>"+ i + "<span>" + ukuleleChords[i]+" Hz</span></p>"
        }
    }

    else if (currentInstrument == 2) {
        for (var i in customChords) {

            if(i == "add_new_chord") {
                div.innerHTML += "<p class='button' onclick='addNewChord()'>Aggiungi una nuova corda<span>"+ customChords[i]+" Hz</span></p>"
            }
            else {
                div.innerHTML += "<p>"+ i + "<span>"+ customChords[i]+" Hz</span></p>"

            }

        }
    }


    var tuneFreq = parseFloat(document.getElementById("toneDesc").innerHTML);
    var semitone = Math.pow(2, 1/12); // proporzione costante per ogni semitono

    guitarChords = {
        mi_basso: Math.floor(tuneFreq * Math.pow(semitone, -29)), // E2
        la:       Math.floor(tuneFreq * Math.pow(semitone, -24)), // A2
        re:       Math.floor(tuneFreq * Math.pow(semitone, -19)), // D3
        sol:      Math.floor(tuneFreq * Math.pow(semitone, -14)), // G3
        si:       Math.floor(tuneFreq * Math.pow(semitone, -10)), // B3
        mi_alto:  Math.floor(tuneFreq * Math.pow(semitone, -5))   // E4
    };

    ukuleleChords = {
        sol: Math.floor(tuneFreq * Math.pow(semitone, -2)), // G4
        do:  Math.floor(tuneFreq * Math.pow(semitone, -9)), // C4
        mi:  Math.floor(tuneFreq * Math.pow(semitone, -5)), // E4
        la:  tuneFreq                          // A4
    };

    
}
function selectInstrument(selectedInstrument) {

    currentInstrument = selectedInstrument;
    currentButton.className="instrumentTypeButton"
    if (currentInstrument == 0) {
        currentButton = guitarButton;
    }
    else if (currentInstrument == 1) {
        currentButton = ukuleleButton;
    }
    else if (currentInstrument == 2) {
        currentButton = customButton;
    }
    currentButton.className = " instrumentTypeButton selected"
    updateChordsHz();
}
  toneRefInput.addEventListener('input', () => {
    updateToneRefValue();
    updateChordsHz();
});


function addNewChord() {
    var name = prompt("Inserisci il nome della corda");
    var tone = prompt("Inserisci la frequenza della corda in Hz");
    customChords[name] = tone;
    updateChordsHz();

}