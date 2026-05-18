import { useEffect } from "react";

const SCROLLED_CLASS = "app-header-scrolled";
const SCROLL_THRESHOLD = 1;

export const useAppHeaderScroll = (): void => {
    useEffect(() => {
        const updateScrolledState = () => {
            document.documentElement.classList.toggle(
                SCROLLED_CLASS,
                window.scrollY > SCROLL_THRESHOLD
            );
        };

        updateScrolledState();
        window.addEventListener("scroll", updateScrolledState, { passive: true });

        return () => {
            window.removeEventListener("scroll", updateScrolledState);
            document.documentElement.classList.remove(SCROLLED_CLASS);
        };
    }, []);
};
