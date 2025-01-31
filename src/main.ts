import './style.css'

//const code = `
//      let foo = "bar";
//
//      // Comments
//      function baz(a: string) {
//        console.log(a);
//      }
//`

//const code = `
//
//declare const __REACT_DEVTOOLS_GLOBAL_HOOK__: Object | void;
//
//export function injectInternals(internals: Object): boolean {
//  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
//    // No DevTools
//    return false;
//  }
//  const hook = __REACT_DEVTOOLS_GLOBAL_HOOK__;
//  if (hook.isDisabled) {
//    // This isn't a real property on the hook, but it can be set to opt out
//    // of DevTools integration and associated warnings and logs.
//    // https://github.com/facebook/react/issues/3877
//    return true;
//  }
//  if (!hook.supportsFlight) {
//    // DevTools exists, even though it doesn't support Flight.
//    return true;
//  }
//  try {
//    hook.inject(internals);
//  } catch (err) {
//    // Catch all errors because it is unsafe to throw during initialization.
//    if (__DEV__) {
//      console.error('React instrumentation encountered an error: %s.', err);
//    }
//  }
//  if (hook.checkDCE) {
//    // This is the real DevTools.
//    return true;
//  } else {
//    // This is likely a hook installed by Fast Refresh runtime.
//    return false;
//  }
//}
//`

const code = `
class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels.map(p => {
        if (p.place != this.place) return p;
        return {place: destination, address: p.address};
      }).filter(p => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}


function runRobot(state, robot, memory) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      console.log(\`Done in \${turn} turns\`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(\`Moved to \${action.direction}\`);
  }
}

`

let s = ''
let codeList = code.split('')
let isLeading = false
const PREFIX_DELIM_CHAR = '/'
const PREFIX_DELIM_MULT = 2
const MAX_MISSES = 4
let isComment = true

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

function endSession() {
	endTimer()

	document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div>
  <h1>Javascript</h1>
	<h2>Your Results</h2>
	<table>
		<thead>
			<tr>
				<td>
					Category
				</td>
				<td>
					Stat
				</td>
				</tr>
			</thead>
		<tbody>
			<tr>
				<td>
					Duration
					</td>
				<td>
					${(endTime - startTime) / 1000} sec
				</td>
			</tr>
			<tr>
				<td>
					Mistyped Keys
					</td>
				<td>
					${totalMissed}
				</td>
			</tr>
		</tbody>
	</table>
</div>
`
}

function handleKeyPress(e) {
	try {
		shiftNextKey(e.key)
	} catch (e: StatusUpdate) {
		window.document.removeEventListener('keyup', handleKeyPress)

		endSession()
		console.log('Error: ', e)
	}
}

const keyMap = new Map([
	['Enter', '⏎'],
	[' ', ' '],
])

let missCount = 0
let totalMissed = 0
function validateKey(key: string) {
	const active = document.querySelector('pre span.active')

	let keyState = active.innerHTML
	if (keyState !== ' ') {
		keyState = keyState.trim()
	}

	if (
		!(keyMap.has(key) && keyMap.get(key) === keyState) &&
		key !== keyState
	) {
		const active = document.querySelector('.active')
		missCount++
		totalMissed++
		active.classList.add('miss')
	}
}

let startTime
let endTime
function startTimer() {
	startTime = Date.now()
}
function endTimer() {
	endTime = Date.now()
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

			missCount--
			//prev.forEach((el) => el.classList.remove('miss'))
			next.classList.remove('miss')
			break
		default:
			if (missCount >= MAX_MISSES) return
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

function main() {
	startTimer()

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
}

main()
