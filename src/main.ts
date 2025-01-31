import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

const code = `
      let foo = "bar";

      // Comments
      function baz(a: string) {
        console.log(a);
      }
`
let s = ''
let codeList = code.split('')
let isLeading = false
const PREFIX_DELIM_CHAR = '/'
const PREFIX_DELIM_MULT = 2
let isComment = true
for (let [i, c] of codeList.entries()) {
	if (c === '\n') {
		isLeading = true
		isComment = false
		s += `<span class="initial return">⏎\n</span>`
	} else if (c === ' ' && isLeading) {
		s += '<span class="initial leading"> </span>'
	} else if (
		c === PREFIX_DELIM_CHAR &&
		isLeading &&
		codeList[i + PREFIX_DELIM_MULT - 1] === PREFIX_DELIM_CHAR
	) {
		// Check if start of comment
		isComment = true
		isLeading = false
		s += `<span class="initial comment">${c}</span>`
	} else if (isComment) {
		s += `<span class="initial comment">${c}</span>`
	} else {
		isLeading = false
		s += `<span class="initial">${c}</span>`
	}
}
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div>
  <h1>Javascript</h1>
  <pre class="code">
    ${s}
  </pre>
</div>
`

//setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
// Initialize current selected
window.document.querySelector('pre span.initial').classList.add('active')

window.document.addEventListener('keyup', handleKeyPress)

type Status = 'COMPLETE'
class StatusUpdate {
	status: Status
	constructor(status: Status) {
		this.status = status
	}
}

class TypingComplete extends StatusUpdate {
	constructor() {
		super('COMPLETE')
	}
}

function handleKeyPress(e) {
	// verify if key pressed matches key in idx array
	// if it doesn't match, set a "miss" class to the element
	// chnage the cursor to be red instead of green

	try {
		console.log('e', e)
		shiftNextKey(e.key)
	} catch (e: StatusUpdate) {
		window.document.removeEventListener('keyup', handleKeyPress)
	}
}

const keyMap = new Map([
	['Enter', '⏎'],
	[' ', ' '],
])

function validateKey(key: string) {
	const active = document.querySelector('pre span.active')
	//console.log('active', active.innerHTML)
	//Ignore the following keys

	let keyState = active.innerHTML
	if (keyState !== ' ') {
		keyState = keyState.trim()
	}

	if (
		!(keyMap.has(key) && keyMap.get(key) === keyState) &&
		key !== keyState
	) {
		const active = document.querySelector('.active')
		active.classList.add('miss')
	}
}

function shiftNextKey(key: string) {
	const prev = document.querySelectorAll('pre span.active')
	let next
	switch (key) {
		// Ignore when key modifiers are used
		// TODO: Instead create whitelist of characters instead of skipping modifiers
		case 'Shift':
		case 'Meta':
		case 'Alt':
		case 'Control':
			return
		case 'Backspace':
			next = prev[0].previousSibling
			if (!next || next.nodeType !== 1) {
				// This means you are at the start of the code
				return
			}
			while (
				next?.classList?.contains('leading') ||
				next?.classList?.contains('comment')
			) {
				next = next.previousSibling
			}

			break
		default:
			// Any valid keystroke should be handled by default case
			validateKey(key)
			next = document.querySelector(
				`pre span.active ~ span:not(.leading, .comment)`
			)
			break
	}
	prev.forEach((el) => el.classList.remove('active'))
	if (next === null || next === undefined) throw new TypingComplete()
	next.classList.add('active')
}
