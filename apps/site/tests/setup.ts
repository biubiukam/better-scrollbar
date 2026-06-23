// Install the ResizeObserver polyfill used by jsdom tests.
import ResizeObserverPolyfill from "resize-observer-polyfill"
window.ResizeObserver = ResizeObserverPolyfill
