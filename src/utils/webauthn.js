// WebAuthn - يدعم بصمة الإصبع وFace ID عبر Platform Authenticator

export async function registerWebAuthn(employeeId, employeeName) {
  if (!window.PublicKeyCredential) {
    throw new Error('الجهاز لا يدعم المصادقة البيومترية (بصمة/Face ID)')
  }
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'TechnoHR', id: window.location.hostname },
      user: {
        id: new TextEncoder().encode(employeeId),
        name: employeeId,
        displayName: employeeName,
      },
      pubKeyCredParams: [
        { alg: -7,   type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
    },
  })
  // حوّل الـ rawId لـ base64 للتخزين في الشيت
  return btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))
}

export async function verifyWebAuthn(credentialIdB64) {
  if (!window.PublicKeyCredential) {
    throw new Error('الجهاز لا يدعم المصادقة البيومترية')
  }
  const rawId = Uint8Array.from(atob(credentialIdB64), c => c.charCodeAt(0))
  const result = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ id: rawId, type: 'public-key', transports: ['internal'] }],
      userVerification: 'required',
      timeout: 60000,
    },
  })
  return !!result
}
