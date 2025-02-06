import { setCursorToStart } from "common/helpers";
import { RefObject, useEffect } from "react";

export const useCursorToStart = (containerRef: RefObject<HTMLDivElement>) => {
    useEffect(() => {
        const realInput = containerRef.current?.querySelector("input");
        if (realInput) {
            realInput.addEventListener("focus", () => setCursorToStart(realInput));
        }
    }, [containerRef]);
};
