import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export interface LiveVisitorData {
  id: string;
  visitorId: string;
  sessionId: string;
  currentView: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  city: string;
  country: string;
  referrer: string;
  lastActive: string;
  lastActiveMs: number;
  active: boolean;
  userId: string;
  userName: string;
  userRole: string;
  userEmail?: string;
  screenResolution: string;
}

export interface LiveEventData {
  id: string;
  sessionId: string;
  visitorId: string;
  eventType: 'click' | 'page_view' | 'add_to_cart' | 'buy_now' | 'whatsapp_order' | 'checkout' | 'search' | 'category_filter';
  target: string;
  view: string;
  timestamp: string;
  timestampMs: number;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  city: string;
  userName: string;
  userId: string;
  extra?: Record<string, any>;
}

// Generate or retrieve persistent visitor ID (persists across visits)
export function getOrCreateVisitorId(): string {
  try {
    let vid = localStorage.getItem('pak_tajarat_vid');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('pak_tajarat_vid', vid);
    }
    return vid;
  } catch (_) {
    return 'v_' + Math.random().toString(36).substring(2, 9);
  }
}

// Generate or retrieve session ID (persists per browser tab session)
export function getOrCreateSessionId(): string {
  try {
    let sid = sessionStorage.getItem('pak_tajarat_sid');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      sessionStorage.setItem('pak_tajarat_sid', sid);
    }
    return sid;
  } catch (_) {
    return 'sess_' + Math.random().toString(36).substring(2, 9);
  }
}

// Detect device metadata
export function getDeviceAndClientInfo() {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'desktop' as const,
      browser: 'Chrome',
      os: 'Windows',
      screenResolution: '1920x1080',
      referrer: 'Direct Traffic',
      city: 'Lahore'
    };
  }

  const ua = navigator.userAgent;
  let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(ua) || window.innerWidth < 768) {
    deviceType = 'mobile';
  }

  // Browser detection
  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Microsoft Edge';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

  // OS detection
  let os = 'Windows';
  if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iOS')) os = 'iOS';
  else if (ua.includes('Mac OS') || ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';

  // Screen resolution
  const screenResolution = `${window.innerWidth}x${window.innerHeight}`;

  // Referrer source
  let referrer = 'Direct Traffic';
  if (document.referrer) {
    const ref = document.referrer.toLowerCase();
    if (ref.includes('google')) referrer = 'Google Search';
    else if (ref.includes('whatsapp')) referrer = 'WhatsApp';
    else if (ref.includes('facebook') || ref.includes('fb.me')) referrer = 'Facebook';
    else if (ref.includes('instagram')) referrer = 'Instagram';
    else if (ref.includes('tiktok')) referrer = 'TikTok';
    else if (ref.includes('youtube')) referrer = 'YouTube';
    else referrer = document.referrer.split('/')[2] || 'Referral';
  }

  // Geographic city assignment for Pakistan
  let storedCity = sessionStorage.getItem('pak_tajarat_vcity');
  if (!storedCity) {
    const pakCities = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];
    // Deterministic selection based on visitorId for consistency during session
    const vid = getOrCreateVisitorId();
    let hash = 0;
    for (let i = 0; i < vid.length; i++) hash = (hash << 5) - hash + vid.charCodeAt(i);
    storedCity = pakCities[Math.abs(hash) % pakCities.length];
    sessionStorage.setItem('pak_tajarat_vcity', storedCity);
  }

  return {
    deviceType,
    browser,
    os,
    screenResolution,
    referrer,
    city: storedCity
  };
}

/**
 * Sends a live heartbeat to Firestore indicating this visitor is currently active
 */
export async function sendLiveHeartbeat(currentView: string, currentUser?: any) {
  try {
    const sessionId = getOrCreateSessionId();
    const visitorId = getOrCreateVisitorId();
    const info = getDeviceAndClientInfo();

    const isGuest = !currentUser || !currentUser.id || currentUser.role === 'Guest';
    const userName = isGuest ? 'Guest Customer' : (currentUser.fullName || currentUser.email || 'Customer');
    const userRole = isGuest ? 'Guest' : (currentUser.role || 'User');
    const userId = isGuest ? 'guest' : currentUser.id;

    const payload: LiveVisitorData = {
      id: sessionId,
      visitorId,
      sessionId,
      currentView: currentView || 'home',
      deviceType: info.deviceType,
      browser: info.browser,
      os: info.os,
      city: info.city,
      country: 'Pakistan',
      referrer: info.referrer,
      lastActive: new Date().toISOString(),
      lastActiveMs: Date.now(),
      active: true,
      userId,
      userName,
      userRole,
      userEmail: currentUser?.email || '',
      screenResolution: info.screenResolution
    };

    // Write to Firestore liveVisitors
    await setDoc(doc(db, 'liveVisitors', sessionId), payload, { merge: true });

    // Also update trafficSessions so overall historical analytics capture real data
    await setDoc(doc(db, 'trafficSessions', sessionId), {
      id: sessionId,
      path: currentView,
      uid: userId,
      timestamp: payload.lastActive,
      deviceType: info.deviceType,
      browser: info.browser,
      os: info.os,
      city: info.city,
      country: 'Pakistan',
      language: 'en-US',
      referrer: info.referrer,
      sessionId
    }, { merge: true });
  } catch (err) {
    // Non-blocking, keep browsing smooth
    console.debug('Traffic heartbeat silent notice:', err);
  }
}

/**
 * Tracks a live click or interaction event directly to Firestore in real-time
 */
export async function trackLiveEvent(
  eventType: LiveEventData['eventType'],
  target: string,
  viewName: string,
  extra?: Record<string, any>,
  currentUser?: any
) {
  try {
    const sessionId = getOrCreateSessionId();
    const visitorId = getOrCreateVisitorId();
    const info = getDeviceAndClientInfo();

    const isGuest = !currentUser || !currentUser.id || currentUser.role === 'Guest';
    const userName = isGuest ? 'Guest Customer' : (currentUser.fullName || currentUser.email || 'Customer');
    const userId = isGuest ? 'guest' : currentUser.id;

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const eventPayload: LiveEventData = {
      id: eventId,
      sessionId,
      visitorId,
      eventType,
      target: target.trim().substring(0, 150),
      view: viewName || 'home',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      deviceType: info.deviceType,
      browser: info.browser,
      city: info.city,
      userName,
      userId,
      extra: extra || {}
    };

    // Save to Firestore liveEvents collection
    await setDoc(doc(db, 'liveEvents', eventId), eventPayload);
  } catch (err) {
    console.debug('Live event track notice:', err);
  }
}

/**
 * Initializes automatic site-wide click interceptor
 */
let isClickListenerInitialized = false;
let lastClickTime = 0;

export function initGlobalClickTracker(
  getCurrentView: () => string, 
  getCurrentUser: () => any
) {
  if (typeof window === 'undefined' || isClickListenerInitialized) return;
  isClickListenerInitialized = true;

  document.addEventListener('click', (e: MouseEvent) => {
    try {
      const now = Date.now();
      // Throttle rapid double-clicks (minimum 350ms between auto-captured clicks)
      if (now - lastClickTime < 350) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find relevant clickable element (button, link, product card, input)
      const clickable = target.closest('button, a, [role="button"], input[type="submit"], [data-track], .product-card, #brand-logo-btn') as HTMLElement | null;
      if (!clickable) return;

      // Avoid logging admin navigation clicks inside the admin dashboard to avoid recursion
      const currentView = getCurrentView();
      if (clickable.closest('#admin-dashboard-container') || currentView === 'admin-dashboard') {
        return;
      }

      // Extract human-readable label for what was clicked
      let label = '';
      
      // Check aria-label or title
      if (clickable.getAttribute('aria-label')) {
        label = clickable.getAttribute('aria-label')!;
      } else if (clickable.getAttribute('title')) {
        label = clickable.getAttribute('title')!;
      } else if (clickable.getAttribute('data-track')) {
        label = clickable.getAttribute('data-track')!;
      } else {
        // Look for text content
        const clone = clickable.cloneNode(true) as HTMLElement;
        // remove SVGs to get clean text
        clone.querySelectorAll('svg, script, style').forEach(el => el.remove());
        const cleanText = clone.innerText || clone.textContent || '';
        label = cleanText.trim().replace(/\s+/g, ' ');
      }

      // Fallbacks based on role or context
      if (!label || label.length < 2) {
        if (clickable.id) {
          label = `Element: #${clickable.id}`;
        } else if (clickable.tagName.toLowerCase() === 'button') {
          label = 'Button Click';
        } else if (clickable.tagName.toLowerCase() === 'a') {
          label = clickable.getAttribute('href') ? `Link: ${clickable.getAttribute('href')}` : 'Link Click';
        } else {
          return; // Ignore empty clicks without clear context
        }
      }

      // Detect special event types
      let eventType: LiveEventData['eventType'] = 'click';
      const lower = label.toLowerCase();

      if (lower.includes('whatsapp')) {
        eventType = 'whatsapp_order';
      } else if (lower.includes('add to cart') || lower.includes('شامل کریں')) {
        eventType = 'add_to_cart';
      } else if (lower.includes('buy now') || lower.includes('ابھی خریدیں')) {
        eventType = 'buy_now';
      } else if (lower.includes('checkout') || lower.includes('چیک آؤٹ')) {
        eventType = 'checkout';
      } else if (lower.includes('search') || lower.includes('تلاش')) {
        eventType = 'search';
      } else if (clickable.classList.contains('product-card')) {
        eventType = 'page_view';
      }

      lastClickTime = now;
      trackLiveEvent(eventType, label, currentView, undefined, getCurrentUser());
    } catch (_) {}
  }, { capture: true, passive: true });
}
