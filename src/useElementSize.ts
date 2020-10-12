import { useState, useEffect, RefObject } from "react";
import { debounce } from "lodash";


// Note: ResizeObserver is buggy with SVG refs so its better to wrap in a containing div which is filled by the inner SVG
export const useElementSize = (ref: RefObject<Element>, defaultWidth = 1, defaultHeight = 1, throttle = 150) => {
    const [width, setWidth] = useState<number>(defaultWidth);
    const [height, setHeight] = useState<number>(defaultHeight);

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        let mounted = true;
        setWidth(ref.current.clientWidth);
        setHeight(ref.current.clientHeight);

        // Use ResizeObserver API if available in browser
        if (window.ResizeObserver) {
            const resizeObserver = new window.ResizeObserver(debounce(([element]) => {
                if (!element || !mounted) {
                    return;
                }

                setWidth(element.target.clientWidth);
                setHeight(element.target.clientHeight);
            }, throttle));

            resizeObserver.observe(ref.current);

            return () => {
                mounted = false;
                resizeObserver.disconnect();
            };
        } else { // or fallback to window resize
            const resizeHandler = debounce(() => {
                if (!mounted || !ref.current) {
                    return;
                }

                setWidth(ref.current.clientWidth);
                setHeight(ref.current.clientHeight);
            }, throttle);

            window.addEventListener("resize", resizeHandler);

            return () => {
                mounted = false;
                window.removeEventListener("resize", resizeHandler);
            };
        }

    }, [ref.current]);

    return [width, height];
};
