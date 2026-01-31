const toggleBtn = document.getElementById("toggleBtn");
const video = document.getElementById("video");

let running = false;
let audioCtx, oscillator, micStream, micInterval, camStream;

toggleBtn.onclick = async () => {
  if (!running) {
    running = true;
    toggleBtn.textContent = "⏹ STOP HARDWARE TEST";
    toggleBtn.classList.add("running");

    // Speaker
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      oscillator = audioCtx.createOscillator();
      oscillator.frequency.value = 440;
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      speakerStatus.textContent = "Tone playing (440Hz)";
    } catch { speakerStatus.textContent = "Audio unavailable"; }

    // Microphone
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(micStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      micInterval = setInterval(() => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a,b)=>a+b,0)/data.length;
        micLevel.style.width = Math.min(avg,100) + "%";
      }, 100);
      micStatus.textContent = "Listening…";
    } catch { micStatus.textContent = "Microphone unavailable"; }

    // Camera
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = camStream;
      camStatus.textContent = "Camera active";
    } catch { camStatus.textContent = "Camera unavailable"; }

  } else {
    running = false;
    toggleBtn.textContent = "▶ START HARDWARE TEST";
    toggleBtn.classList.remove("running");

    // Stop speaker
    if (oscillator) { oscillator.stop(); oscillator = null; }
    if (audioCtx) { audioCtx.close(); audioCtx = null; }
    speakerStatus.textContent = "Stopped";

    // Stop mic
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    clearInterval(micInterval);
    micLevel.style.width = "0%";
    micStatus.textContent = "Stopped";

    // Stop camera
    if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
    video.srcObject = null;
    camStatus.textContent = "Stopped";
  }
};
