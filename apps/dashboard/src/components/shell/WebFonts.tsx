import { Platform } from 'react-native';
import { useEffect } from 'react';

/** Loads Inter + JetBrains Mono on web so the type tokens actually render. */
export function WebFonts() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    if (document.getElementById('ody-fonts')) return;

    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    preconnect.id = 'ody-fonts';

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';

    document.head.appendChild(preconnect);
    document.head.appendChild(stylesheet);
  }, []);

  return null;
}
