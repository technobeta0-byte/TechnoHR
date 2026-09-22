// ── الموقع الأخير المحفوظ (cache في الذاكرة طوال الجلسة) ──
let _cachedLocation = null
let _cachedAt = 0
let _watchId = null

const CACHE_TTL_MS = 60_000   // قبول موقع عمره أقل من 60 ثانية
const STALE_TTL_MS = 300_000  // موقع "قديم" يمكن استخدامه كـ fallback (5 دقائق)

/**
 * يبدأ مراقبة الموقع في الخلفية بمجرد استيراد الملف
 * بحيث لما الموظف يضغط "تسجيل حضور" يكون الموقع جاهز فوراً
 */
export function startLocationWatch() {
  if (!navigator.geolocation || _watchId !== null) return

  _watchId = navigator.geolocation.watchPosition(
    (pos) => {
      _cachedLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }
      _cachedAt = Date.now()
    },
    () => { /* مش مشكلة لو فشل الـ watch */ },
    {
      enableHighAccuracy: false,   // أسرع - دقة متوسطة (Network/WiFi based)
      timeout: 10000,
      maximumAge: 30000,
    }
  )
}

export function stopLocationWatch() {
  if (_watchId !== null) {
    navigator.geolocation.clearWatch(_watchId)
    _watchId = null
  }
}

/**
 * يرجع الموقع بأسرع طريقة ممكنة:
 * 1. لو في cache حديث (< 60s) → يرجعه فوراً (0ms تقريباً)
 * 2. لو في cache قديم (< 5min) → يحاول يجدد ويرجع الجديد أو القديم كـ fallback
 * 3. لو مفيش → يطلب موقع جديد بدقة متوسطة وتايم أوت 8 ثانية
 */
export function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('الجهاز لا يدعم تحديد الموقع GPS'))
      return
    }

    const age = Date.now() - _cachedAt

    // ── Cache حديث: إرجع فوراً ──────────────────────────────────────────
    if (_cachedLocation && age < CACHE_TTL_MS) {
      resolve(_cachedLocation)
      return
    }

    // ── طلب موقع جديد بدقة متوسطة (أسرع بكتير) ──────────────────────────
    let resolved = false

    // فالباك: لو عندنا موقع قديم نرجعه بعد 3 ثواني لو الجديد اتأخر
    let fallbackTimer = null
    if (_cachedLocation && age < STALE_TTL_MS) {
      fallbackTimer = setTimeout(() => {
        if (!resolved) {
          resolved = true
          resolve(_cachedLocation)  // استخدم القديم كـ fallback
        }
      }, 3000)
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (fallbackTimer) clearTimeout(fallbackTimer)
        if (resolved) return  // الـ fallback سبق

        resolved = true
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        _cachedLocation = loc
        _cachedAt = Date.now()
        resolve(loc)
      },
      (err) => {
        if (fallbackTimer) clearTimeout(fallbackTimer)

        // لو في موقع قديم استخدمه بدل رسالة الخطأ
        if (!resolved && _cachedLocation && age < STALE_TTL_MS) {
          resolved = true
          resolve(_cachedLocation)
          return
        }

        if (!resolved) {
          resolved = true
          const msgs = {
            1: 'تم رفض إذن الموقع - اذهب للإعدادات وامنح الإذن',
            2: 'تعذر تحديد الموقع - تأكد من تفعيل GPS',
            3: 'انتهى وقت انتظار الموقع - حاول مرة أخرى',
          }
          reject(new Error(msgs[err.code] || 'خطأ في تحديد الموقع'))
        }
      },
      {
        enableHighAccuracy: false,  // ← أسرع بكتير (Network/WiFi بدل GPS)
        timeout: 8000,              // ← 8 ثانية بدل 12
        maximumAge: 30000,          // ← قبول cache عمره 30 ثانية
      }
    )
  })
}

export function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}
