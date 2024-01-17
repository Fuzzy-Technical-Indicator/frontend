import type { BarPrice, PriceFormatterFn } from 'lightweight-charts';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

const K = 1000;
const M = 1000 * K;

export const priceFn: PriceFormatterFn = (price: BarPrice) => {
    return `${price.toFixed(2).padEnd(10)}`;
};

export const formatterM: PriceFormatterFn = (price: BarPrice) => {
    const value = price / M;
    return `${value.toFixed(2)}M`.padEnd(10);
};

export const chartTheme = {
    layout: {
        background: {
            color: '#1A1A1A'
        },
        lineColor: '#000000',
        textColor: '#A6A6A6'
    },
    grid: {
        vertLines: { color: '#313131' },
        horzLines: { color: '#313131' }
    }
};

export const tickers = [
    'ETH/USDT',
    'BTC/USDT',
    'BNB/USDT',
    'AAPL/USD',
    'IBM/USD',
    'JPM/USD',
    'MSFT/USD',
    'NKE/USD',
    'TSLA/USD'
];

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
    y?: number;
    x?: number;
    start?: number;
    duration?: number;
};

export const flyAndScale = (
    node: Element,
    params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;

    const scaleConversion = (
        valueA: number,
        scaleA: [number, number],
        scaleB: [number, number]
    ) => {
        const [minA, maxA] = scaleA;
        const [minB, maxB] = scaleB;

        const percentage = (valueA - minA) / (maxA - minA);
        const valueB = percentage * (maxB - minB) + minB;

        return valueB;
    };

    const styleToString = (
        style: Record<string, number | string | undefined>
    ): string => {
        return Object.keys(style).reduce((str, key) => {
            if (style[key] === undefined) return str;
            return str + `${key}:${style[key]};`;
        }, "");
    };

    return {
        duration: params.duration ?? 200,
        delay: 0,
        css: (t) => {
            const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
            const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
            const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

            return styleToString({
                transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                opacity: t
            });
        },
        easing: cubicOut
    };
};