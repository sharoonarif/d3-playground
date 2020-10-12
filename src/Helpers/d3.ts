import { DefaultArcObject, interpolate, Arc, ValueFn, BaseType, Selection, interpolateNumber } from "d3";

export type BaseSelection = Selection<BaseType, {}, any, undefined>;
export type ArcTweenGenerator = (newAngle: number, oldAngle?: number) => ValueFn<BaseType, DefaultArcObject, (t: number) => string>;
export type NumberTweenGenerator = (newNumber: number, oldNumber?: number) => (t: number) => void;
export type GradientOptions = {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
};

const defaultGradientOptions: GradientOptions = {
    x1: 0,
    x2: 1,
    y1: 0,
    y2: 1
};

export const createArcTween = (arcGenerator: Arc<any, DefaultArcObject>): ArcTweenGenerator => {
    return (newAngle: number, oldAngle?: number) => {
        return d => {
            const i = interpolate(oldAngle || 0, newAngle);

            return (t: number) => {
                d.endAngle = i(t);
                return arcGenerator(d) || "";
            };
        };
    };
};

export const createNumberTween = (selection: BaseSelection, formatNumber?: (v: number) => string): NumberTweenGenerator => {
    return (newNumber: number, oldNumber?: number) => {
        const i = interpolateNumber(oldNumber || 0, newNumber);
        return (t: any) => {
            const interpolated = i(t);
            const textValue = formatNumber ? formatNumber(interpolated) : `${interpolated}`;
            selection.text(textValue);
        };
    };
};

export const addGradient = (svg: BaseSelection, id: string, stops: Array<{ offset: number, color: string }>, options?: GradientOptions) => {
    const gradientOptions = {
        ...defaultGradientOptions,
        ...options
    };

    svg.append("linearGradient")
        .attr("id", id)
        .attr("gradientUnits", "objectBoundingBox")
        .attr("x1", gradientOptions.x1).attr("y1", gradientOptions.y1)
        .attr("x2", gradientOptions.x2).attr("y2", gradientOptions.y2)
        .selectAll("stop")
        .data(stops)
        .enter()
        .append("stop")
        .attr("offset", x => x.offset)
        .attr("stop-color", x => x.color);
};