import { badApple } from "./badApple";

export const chartPath = (values: number[], isBadApple: boolean = false, frame?: number) => {
    let path: string = "";

    if (!isBadApple) {
        const arrayLength = values.length;

        for (let i = 0; i < arrayLength; i++) {
            if (i === 0) {
                path += "M ";
                let logX = logScale(i + 1, 1, arrayLength);
                let remappedX = remap(logX, 0, 1, 0, 250);
                path += `${String(Math.round(remappedX * 100) / 100)} `;
                let remappedY = Math.min(140, remap(values[i], -80, 0, 140, 0));
                path += `${String(Math.round(remappedY * 100) / 100)} `;
            } else {
                path += "L ";
                let logX = logScale(i + 1, 1, arrayLength);
                let remappedX = remap(logX, 0, 1, 0, 250);
                path += `${String(Math.round(remappedX * 100) / 100)} `;
                let remappedY = Math.min(140, remap(values[i], -80, 0, 140, 0));
                path += `${String(Math.round(remappedY * 100) / 100)} `;
            }
        }

        path += "L 2000 0 L 2000 1000 L -1000 1000";

        return path;
    } else {
        path += scaleSvgPath(badApple[frame ?? 3000], 140 / 3600, 140 / 3600);

        return path;
    }
};

const remap = (n: number, start1: number, stop1: number, start2: number, stop2: number) => {
    if (!isFinite(n)) {
        return start2;
    }
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};

const logScale = (value: number, min: number, max: number) => {
    return (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min));
};

const scaleSvgPath = (path: string, coefficientX: number, coefficientY: number): string => {
    const numberPattern = /-?\d*\.?\d+/g;

    const scaledPath = path.replace(numberPattern, (match) => {
        const num = parseFloat(match);
        if (!isNaN(num)) {
            if (match.includes(".") || match.includes("-")) {
                return (num * coefficientX).toString();
            } else {
                return (num * coefficientY).toString();
            }
        } else {
            return match;
        }
    });

    return scaledPath;
};
