export function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('الجهاز لا يدعم تحديد الموقع GPS'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      err => {
        const msgs = {
          1: 'تم رفض إذن الموقع - اذهب للإعدادات وامنح الإذن',
          2: 'تعذر تحديد الموقع - تأكد من تفعيل GPS',
          3: 'انتهى وقت انتظار الموقع - حاول مرة أخرى',
        }
        reject(new Error(msgs[err.code] || 'خطأ في تحديد الموقع'))
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
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
