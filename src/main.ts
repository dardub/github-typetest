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
function parse(code: string) {
	let out = code.split('')
	let is_leading_flag = true
	out = out.reduce(function (acc, c) {
		is_leading_flag = !(c !== '\n' || c !== ' ')

		if (is_leading_flag && c === ' ') {
			return acc
		}
		return [...acc, c]
	}, [])

	return out
}

function convertToTabs(numSpaces: number, code: string): string {
	const re = new RegExp('\n(\s{2})+', 'gm')
	console.log(code.match(re))
	const out = code.replaceAll(re, '->')
	console.log(code, out)
	return out
}

let s = ''
let codeList = parse(code)
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
//console.log(s)
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div>
  <h1>Hello World</h1>
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
	//console.log(e.key, idx)

	try {
		shiftNextKey(e.key)
	} catch (e: StatusUpdate) {
		window.document.removeEventListener('keyup', handleKeyPress)
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
			next = document.querySelector(
				`pre span:not(.leading, .comment):has(~ span.active)`
			)
			break
		default:
			next = document.querySelector(
				`pre span.active ~ span:not(.leading, .comment)`
			)
			break
	}
	prev.forEach((el) => el.classList.remove('active'))
	if (next === null || next === undefined) throw new TypingComplete()
	next.classList.add('active')
}
