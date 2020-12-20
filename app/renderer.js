// DOM elements
const linksSection = document.querySelector('.links')
const errorMessage = document.querySelector('.error-message')
const newLinkForm = document.querySelector('.new-link-form')
const newLinkURL = document.querySelector('.new-link-url')
const newLinkButton = document.querySelector('.new-link-button')
const clearStorageButton = document.querySelector('.clear-storage')
//DOM APIS
const parser = new DOMParser()
const { shell } = require('electron')
const parserResponse = (text) => {
  return parser.parseFromString(text, 'text/html')
}
const findTitle = (nodes) => {
  return nodes.querySelector('title').innerText
}
const storeLink = (title, url) => {
  localStorage.setItem(url, JSON.stringify({ url, title }))
}
const getLinks = () => {
  return Object.keys(localStorage).map((key) =>
    JSON.parse(localStorage.getItem(key))
  )
}
const createLinkElement = (link) => {
  return `
    <div class='link-elemento'>
     <h3>${link.title} </h3>
     <a href='${link.url}' target='_blank'>${link.url} </a>
    </div>
    `
}
const renderLinks = () => {
  const linksElement = getLinks().map(createLinkElement).join(' ')
  linksSection.innerHTML = linksElement
}
const clearForm = () => {
  newLinkURL.value = null
}
const handleError = (error, url) => {
  errorMessage.innerHTML = `
  <span> Hubo un error agregando "${url}": ${error.message}</span>
    
    `.trim()
  clearForm()
  setTimeout(() => {
    errorMessage.innerHTML = null
  }, 5000)
}
//eventos
renderLinks()
newLinkURL.addEventListener('keyup', () => {
  newLinkButton.disabled = !newLinkURL.validity.valid
})
newLinkForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const url = newLinkURL.value
  try {
    const response = await fetch(url)
    const text = await response.text()
    const html = parserResponse(text)
    const title = findTitle(html)
    storeLink(title, url)
    clearForm()
    renderLinks()
  } catch (error) {
    handleError(error, url)
  }
})
clearStorageButton.addEventListener('click', () => {
  localStorage.clear()
  linksSection.innerHTML = ''
})
linksSection.addEventListener('click', (e) => {
  if (e.target.href) {
    e.preventDefault()
    shell.openExternal(e.target.href)
  }
})
