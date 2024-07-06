import * as Tone from "tone";
import { regularValueChange } from "./dom";

export let isInitialized: boolean = false;

export const initializeTone = async () => {
    await Tone.start();

    Tone.getTransport().scheduleRepeat(() => {
        playStatus[1] = Tone.getTransport().seconds;
        regularValueChange();
    }, 0.05);

    console.log("Tone.js initialized");

    isInitialized = true;
};

export let loadStatus: [boolean, string] = [true, ""];
export let playStatus: [Tone.PlaybackState, number, number] = ["stopped", 0, 0];
export let player: Tone.Player;
export let toneFFT: Tone.FFT;
let transportStopper: number;

const setPlayer = async (file: File) => {
    const reader = new FileReader();

    const onLoad = new Promise<ArrayBuffer>((resolve, reject) => {
        reader.onload = () => {
            resolve(reader.result as ArrayBuffer);
        };
        reader.onerror = reject;
    });

    reader.readAsArrayBuffer(file);

    try {
        if (player) player.dispose();
        if (transportStopper) Tone.getTransport().clear(transportStopper);

        const audioData = await onLoad;
        const audioBuffer = await Tone.getContext().decodeAudioData(audioData);
        const toneAudioBuffer = new Tone.ToneAudioBuffer(audioBuffer);

        player = new Tone.Player(toneAudioBuffer);
        playStatus[2] = player.buffer.duration;

        toneFFT = new Tone.FFT({ normalRange: false, size: 512, smoothing: 0 });
        player.sync().start(0).stop(playStatus[2]).connect(toneFFT).toDestination();

        transportStopper = Tone.getTransport().schedule(() => {
            console.log("audio ended");
            Tone.getTransport().stop();
            playStatus[0] = Tone.getTransport().state;
        }, playStatus[2]);

        await Tone.loaded();

        reader.onload = null;
        reader.onerror = null;

        regularValueChange();
    } catch (error) {
        console.error("Audio file decoding error:", error);
        throw error;
    }
};

export const playPause = () => {
    if (loadStatus[0]) {
        if (Tone.getTransport().state !== "started") {
            console.info("start");
            Tone.getTransport().start();
        } else {
            console.info("pause");
            Tone.getTransport().pause();
        }
        playStatus[0] = Tone.getTransport().state;
    }
};

export const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        console.log("loading...");

        Tone.getTransport().stop();
        playStatus[0] = Tone.getTransport().state;

        Tone.getTransport().seconds = 0;
        playStatus[1] = Tone.getTransport().seconds;

        loadStatus = [false, ""];
        setPlayer(file).then(() => {
            loadStatus = [true, file.name];
            console.info(`loaded: ${file.name}`);
        });
    }
};
