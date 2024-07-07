import { initializeTone, isInitialized, handleFileChange, playPause, toneFFT, playStatus, loadStatus } from "./audio";
import { chartPath } from "./chart";

export const initializeContentScript = () => {
    const chart = document.querySelector('div[data-attrid="Converter"]');

    if (chart) {
        const currencyValue = "0";
        console.log("Exchange rate chart found");
        console.log(chart);

        // * 左上のデカい文字
        editHugeNumberDOM(currencyValue, false);

        // * 時刻
        editTimeDOM(0, 0);

        // * 入力欄削除
        (
            chart.querySelector("#knowledge-currency__updatable-data-column")?.children[2].children[0] as Element
        ).innerHTML = "";

        // * グラフ初期化
        editChartDOM([-Infinity, -Infinity], false);

        // * コントローラ
        const playButton = document.createElement("button");
        playButton.textContent = "Play";
        playButton.addEventListener("click", async () => {
            if (!isInitialized) {
                await initializeTone();
            }
            playPause();
        });

        const loadButton = document.createElement("button");
        loadButton.textContent = "Load";
        loadButton.addEventListener("click", () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "audio/*";
            fileInput.style.display = "none";
            fileInput.addEventListener("change", async (e) => {
                if (!isInitialized) await initializeTone();
                handleFileChange(e);
            });

            document.body.appendChild(fileInput);

            fileInput.click();
        });

        (
            chart.querySelector("#knowledge-currency__updatable-data-column")?.children[2].children[0] as Element
        ).appendChild(playButton);

        (
            chart.querySelector("#knowledge-currency__updatable-data-column")?.children[2].children[0] as Element
        ).appendChild(loadButton);
    }
};

export const regularValueChange = () => {
    let levels: number[] = Array.from(toneFFT.getValue());

    let isBadApple = loadStatus[1].toLowerCase().includes("bad apple");

    const roundBase = 100;
    const currencyValue = String(Math.round(levels[0] * roundBase) / roundBase);

    // * 左上のデカい文字
    editHugeNumberDOM(currencyValue, isBadApple);

    // * 時刻
    editTimeDOM(playStatus[1], playStatus[2]);

    // * グラフ（ファイル名が Bad Apple!! だと Bad Apple!! の影絵が流れる）
    editChartDOM(levels, isBadApple);
};

// * DOM 操作
const editHugeNumberDOM = (value: string, isBadApple: boolean) => {
    const chart = document.querySelector('div[data-attrid="Converter"]');

    value = isBadApple ? "Bad Apple!!" : value;

    if (chart) {
        (chart.querySelector("#knowledge-currency__updatable-data-column")?.children[0] as Element).setAttribute(
            "data-exchange-rate",
            value
        );

        (
            chart
                .querySelector("#knowledge-currency__updatable-data-column")
                ?.children[0].children[1].querySelector("span") as Element
        ).textContent = value;

        (
            chart
                .querySelector("#knowledge-currency__updatable-data-column")
                ?.children[0].children[1].querySelector("span") as Element
        ).setAttribute("data-value", value);

        (
            chart
                .querySelector("#knowledge-currency__updatable-data-column")
                ?.children[0].children[1].querySelectorAll("span")[1] as Element
        ).setAttribute("data-name", value);
    }
};

const editTimeDOM = (firstTime: number, secondTime: number) => {
    const chart = document.querySelector('div[data-attrid="Converter"]');

    if (chart) {
        (
            chart
                .querySelector("#knowledge-currency__updatable-data-column")
                ?.children[1].querySelector("span") as Element
        ).textContent = `${formatTime(firstTime)} / ${formatTime(secondTime)} · `;
    }
};

const editChartDOM = (values: number[], isBadApple: boolean) => {
    const chart = document.querySelector('div[data-attrid="Converter"]');
    if (chart) {
        (
            chart
                .querySelector("#knowledge-currency__updatable-chart-column")
                ?.querySelector("svg.uch-psvg")
                ?.querySelectorAll("path")[0] as Element
        ).setAttribute("d", chartPath(values, isBadApple, Math.floor(playStatus[1] * 15)));

        (
            chart
                .querySelector("#knowledge-currency__updatable-chart-column")
                ?.querySelector("svg.uch-psvg")
                ?.querySelectorAll("path")[1] as Element
        ).setAttribute("d", chartPath(values, isBadApple, Math.floor(playStatus[1] * 15)));

        if (isBadApple) {
            (
                chart
                    .querySelector("#knowledge-currency__updatable-chart-column")
                    ?.querySelector("svg.uch-psvg")
                    ?.querySelectorAll("path")[0] as Element
            ).setAttribute("transform", `translate(${(4800 * (140 / 3600) - 140) / 2},140) scale(1,-1)`);

            (
                chart
                    .querySelector("#knowledge-currency__updatable-chart-column")
                    ?.querySelector("svg.uch-psvg")
                    ?.querySelectorAll("path")[1] as Element
            ).setAttribute("transform", `translate(${(4800 * (140 / 3600) - 140) / 2},140) scale(1,-1)`);
        }
    }
};

const formatTime = (seconds: number) => {
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
