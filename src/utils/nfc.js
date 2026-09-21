// NFC - يشتغل على Android Chrome فقط

export async function readNFC() {
  if (!('NDEFReader' in window)) {
    throw new Error('NFC غير مدعوم - يتطلب Android Chrome')
  }
  return new Promise((resolve, reject) => {
    const reader = new NDEFReader()
    const timer = setTimeout(() => {
      reject(new Error('انتهى وقت انتظار الكارت (15 ثانية)'))
    }, 15000)
    reader.scan()
      .then(() => {
        reader.onreading = event => {
          clearTimeout(timer)
          resolve(event.serialNumber || 'NFC_' + Date.now())
        }
        reader.onerror = () => {
          clearTimeout(timer)
          reject(new Error('خطأ في قراءة الكارت'))
        }
      })
      .catch(err => {
        clearTimeout(timer)
        reject(new Error('تعذر تشغيل NFC: ' + err.message))
      })
  })
}
