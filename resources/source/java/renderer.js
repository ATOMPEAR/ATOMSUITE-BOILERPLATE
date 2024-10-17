// This file is executed in the renderer process
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('ping').addEventListener('click', async () => {
    const response = await window.electronAPI.ping()
    console.log(response) // Should log 'pong'
  })
})

