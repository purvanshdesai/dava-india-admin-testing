'use client'

const audioContext =
  typeof window !== 'undefined'
    ? new ((window as any).AudioContext || (window as any).webkitAudioContext)()
    : null
let audioBuffer: any

async function loadAudio() {
  if (!audioContext) return // Prevent errors in SSR
  const response = await fetch('/sounds/bell-notification.mp3') // Load sound file
  const arrayBuffer = await response.arrayBuffer()
  audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
}

export const playNotificationSound = async () => {
  if (!audioBuffer || !audioContext) return

  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(audioContext.destination)
  source.start(0)

  // try {
  //   console.log('Play notification')
  //   const audio = new Audio('/sounds/bell-notification.mp3')

  //   audio?.load()

  //   audio.currentTime = 0

  //   audio
  //     .play()
  //     .then(() => console.log('Sound played'))
  //     .catch((err: any) => console.error('Error playing sound:', err))
  // } catch (err) {
  //   console.log('Error playing sound:', err)
  // }
}

// Load audio when the page loads
if (typeof window !== 'undefined') {
  loadAudio()
}
