
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [viewportHeight, setViewportHeight] = React.useState<number>(window.innerHeight)
  const [viewportWidth, setViewportWidth] = React.useState<number>(window.innerWidth)

  React.useEffect(() => {
    // First check if we're in a mobile device based on user agent
    const checkIsMobileDevice = () => {
      const ua = navigator.userAgent;
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    };

    // Initialize with both screen size and user agent checks
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      const isMobileScreen = window.innerWidth < MOBILE_BREAKPOINT;
      const isMobileDevice = checkIsMobileDevice();
      
      setIsMobile(isMobileScreen || isMobileDevice);
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
      
      // Update CSS variables for mobile viewport
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
    
    // Initialize
    onChange();
    
    // Listen for changes
    mql.addEventListener("change", onChange);
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    
    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
    }
  }, [])

  return {
    isMobile: !!isMobile,
    viewportWidth,
    viewportHeight
  };
}

// For simpler use cases when you just need to know if it's mobile
export function useMobileCheck() {
  const { isMobile } = useIsMobile();
  return isMobile;
}
