let currentDS = 'stack';
let dataStorage = {
    stack: [], queue: [], list: [],
    tree: { root: null }, graph: { nodes: [], edges: [] },
    sort: [45, 12, 89, 7, 31, 63],
    search: [10, 23, 35, 48, 59, 72, 88]
};

const canvas = document.getElementById('canvas');
const pInput = document.getElementById('primary-input');
const sInput = document.getElementById('algo-selector');
const expText = document.getElementById('explanation-text');
const portalTitle = document.getElementById('portal-title');
const peekBtn = document.getElementById('btn-peek');

function switchDS(type) {
    currentDS = type;
    
    document.querySelectorAll('.menu-tab').forEach(btn => btn.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');
    
    const names = { 
        stack: 'Stack Operations', queue: 'Queue Operations', 
        list: 'Linked List', tree: 'Binary Search Tree', 
        graph: 'Graph Network', sort: 'Sorting', search: 'Searching' 
    };
    portalTitle.textContent = names[type];

    sInput.classList.add('hidden');
    pInput.classList.remove('hidden');
    peekBtn.classList.remove('hidden');
    pInput.placeholder = "Enter Value";
    document.getElementById('btn-insert').classList.remove('hidden');
    document.getElementById('btn-delete').classList.remove('hidden');

    if (type === 'stack') {
        document.getElementById('btn-insert').textContent = 'Push Element';
        document.getElementById('btn-delete').textContent = 'Pop Element';
        peekBtn.textContent = 'Peek Top';
    } else if (type === 'queue') {
        document.getElementById('btn-insert').textContent = 'Enqueue Item';
        document.getElementById('btn-delete').textContent = 'Dequeue Item';
        peekBtn.textContent = 'Inspect Front';
    } else if (type === 'graph') {
        peekBtn.classList.add('hidden');
        sInput.classList.remove('hidden');
        document.getElementById('btn-insert').textContent = 'Add/Link Node';
        document.getElementById('btn-delete').textContent = 'Clear Graph';
        updateDropdownOptions();
    } else if (type === 'sort') {
        peekBtn.classList.add('hidden');
        pInput.classList.add('hidden');
        sInput.classList.remove('hidden');
        sInput.innerHTML = `
            <option value="bubble">Bubble Sort</option>
            <option value="selection">Selection Sort</option>
            <option value="insertion">Insertion Sort</option>`;
        document.getElementById('btn-insert').textContent = 'Execute Sort';
        document.getElementById('btn-delete').textContent = 'Shuffle Array';
    } else if (type === 'search') {
        peekBtn.classList.add('hidden');
        sInput.classList.remove('hidden');
        sInput.innerHTML = `
            <option value="linear">Linear Search</option>
            <option value="binary">Binary Search</option>`;
        pInput.placeholder = "Search Target";
        document.getElementById('btn-insert').textContent = 'Find Key';
        document.getElementById('btn-delete').classList.add('hidden');
    } else {
        peekBtn.classList.add('hidden');
        document.getElementById('btn-insert').textContent = 'Insert Node';
        document.getElementById('btn-delete').textContent = type === 'tree' ? 'Clear Tree' : 'Delete Head';
    }

    clearInputs();
    renderMaster();
    expText.innerHTML = `Workspace switched to <span class="highlight">${names[type]}</span>. Ready for input.`;
}

function updateDropdownOptions() {
    if (currentDS !== 'graph') return;
    const selector = document.getElementById('algo-selector');
    const currentSelection = selector.value;
    
    selector.innerHTML = `<option value="">(Optional) Connect to Target</option>`;
    
    dataStorage.graph.nodes.forEach(nodeVal => {
        const opt = document.createElement('option');
        opt.value = nodeVal;
        opt.textContent = `Node ${nodeVal}`;
        selector.appendChild(opt);
    });
    
    selector.value = currentSelection;
}

function triggerInsert() {
    const val = parseInt(pInput.value);
    if (currentDS === 'sort') { runSorting(sInput.value); return; }
    if (currentDS === 'search') { runSearching(sInput.value, val); return; }
    if (isNaN(val)) return alert("Please enter a valid number.");

    switch(currentDS) {
        case 'stack':
            dataStorage.stack.push(val);
            updateTerminal(`Element <span class="highlight">${val}</span> was pushed onto the top of the stack. (Last In, First Out rule).`, 'O(1)');
            break;
            
        case 'queue':
            dataStorage.queue.push(val);
            updateTerminal(`Element <span class="highlight">${val}</span> was added (enqueued) to the back of the queue. (First In, First Out rule).`, 'O(1)');
            break;
            
        case 'list':
            dataStorage.list.push(val);
            updateTerminal(`Element <span class="highlight">${val}</span> was added to the end of the Linked List.`, 'O(1)');
            break;
            
        case 'tree':
            if(!dataStorage.tree.root) dataStorage.tree.root = { val, left: null, right: null };
            else sortBST(dataStorage.tree.root, val);
            updateTerminal(`Node <span class="highlight">${val}</span> was added to the Binary Search Tree. Smaller values go left, larger values go right.`, 'O(log N)');
            break;

        case 'graph':
            if (!dataStorage.graph.nodes.includes(val)) {
                dataStorage.graph.nodes.push(val);
            }
            const targetVal = parseInt(sInput.value);
            if (!isNaN(targetVal) && targetVal !== val) {
                dataStorage.graph.edges.push([val, targetVal]);
                updateTerminal(`Created a line connection (edge) between Node <span class="highlight">${val}</span> and Node <span class="highlight">${targetVal}</span>.`, 'O(1)');
            } else {
                updateTerminal(`Added a new separate Node <span class="highlight">${val}</span> to the graph network view.`, 'O(1)');
            }
            updateDropdownOptions();
            break;
    }
    
    clearInputs();
    renderMaster();
}

function triggerPeek() {
    let arr = dataStorage[currentDS];
    if (!arr || arr.length === 0) {
        updateTerminal(`Cannot read values. The structure is currently empty.`, 'O(1)');
        return;
    }

    if (currentDS === 'stack') {
        let topIdx = arr.length - 1;
        highlightNodes(topIdx);
        updateTerminal(`Peeking top element: The top value on the stack is <span class="highlight">${arr[topIdx]}</span>. No items were removed.`, 'O(1)');
    } else if (currentDS === 'queue') {
        highlightNodes(0);
        updateTerminal(`Inspecting front element: The next item waiting in line to be processed is <span class="highlight">${arr[0]}</span>.`, 'O(1)');
    }
}

function triggerDelete() {
    if (currentDS === 'tree') { dataStorage.tree.root = null; updateTerminal('Cleared the entire tree structure successfully.', 'O(1)'); renderMaster(); return; }
    if (currentDS === 'graph') { dataStorage.graph = { nodes: [], edges: [] }; updateDropdownOptions(); updateTerminal('Cleared the entire graph network successfully.', 'O(1)'); renderMaster(); return; }
    if (currentDS === 'sort') {
        dataStorage.sort = Array.from({length: 6}, () => Math.floor(Math.random() * 90) + 10);
        updateTerminal('Shuffled the layout with a brand new set of random numbers.', 'O(1)');
        renderMaster();
        return;
    }

    let activeArr = dataStorage[currentDS];
    if(activeArr.length === 0) {
        updateTerminal(`Underflow Error: The structure is empty. Nothing can be deleted!`, 'O(1)');
        return;
    }

    let popped = currentDS === 'stack' ? activeArr.pop() : activeArr.shift();
    const wording = currentDS === 'stack' ? 'popped from the top of the stack' : 'dequeued from the front of the queue';
    updateTerminal(`Element <span class="highlight">${popped}</span> was successfully removed (${wording}).`, 'O(1)');
    renderMaster();
}

async function runSorting(algoType) {
    let arr = dataStorage.sort;
    if (algoType === 'bubble') {
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                highlightNodes(j, j + 1); await delay(400);
                if (arr[j] > arr[j + 1]) {
                    updateTerminal(`Comparing ${arr[j]} and ${arr[j+1]}. Since ${arr[j]} is larger, we swap them.`, 'O(N²)');
                    let t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
                    renderMaster(); highlightNodes(j, j + 1);
                }
            }
        }
        updateTerminal(`<strong>Bubble Sort Finished:</strong> Looped through the array, checked side-by-side items, and bubbled up the largest values to the end.`, 'O(N²) Worst Case');
    } else if (algoType === 'selection') {
        for (let i = 0; i < arr.length; i++) {
            let min = i;
            for (let j = i + 1; j < arr.length; j++) {
                highlightNodes(j, min); await delay(300);
                if (arr[j] < arr[min]) min = j;
            }
            updateTerminal(`Found the smallest value remaining. Swapping item ${arr[min]} into sorted spot position [${i}].`, 'O(N²)');
            let t = arr[i]; arr[i] = arr[min]; arr[min] = t; renderMaster();
        }
        updateTerminal(`<strong>Selection Sort Finished:</strong> Repeatedly selected the smallest number from the unsorted section and shifted it to the front lines.`, 'O(N²) Runtime');
    } else if (algoType === 'insertion') {
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i], j = i - 1;
            while (j >= 0 && arr[j] > key) {
                highlightNodes(j, j + 1); await delay(350);
                updateTerminal(`Sliding ${arr[j]} to the right because it is larger than our active value (${key}).`, 'O(N²)');
                arr[j + 1] = arr[j]; j = j - 1; renderMaster();
            }
            arr[j + 1] = key; renderMaster();
        }
        updateTerminal(`<strong>Insertion Sort Finished:</strong> Sorted items step-by-step by shifting elements backward into their exact fitting spot.`, 'O(N²) Avg Scale');
    }
    flagAllNodesSuccess();
}

async function runSearching(algoType, targetKey) {
    let arr = dataStorage.search;
    if (isNaN(targetKey)) return alert("Please enter a target number to find.");
    renderMaster();

    if (algoType === 'linear') {
        for (let i = 0; i < arr.length; i++) {
            highlightNodes(i); await delay(500);
            if (arr[i] === targetKey) {
                setNodeSuccess(i);
                updateTerminal(`<strong>Target Found!</strong> Element <span class="highlight">${targetKey}</span> was located by checking one-by-one at index position [${i}].`, 'O(N) Count');
                return;
            }
            updateTerminal(`Checking index [${i}]: Value ${arr[i]} does not match target ${targetKey}. Moving next...`, 'O(N)');
        }
    } else if (algoType === 'binary') {
        arr.sort((a,b) => a-b); renderMaster();
        let low = 0, high = arr.length - 1;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            highlightNodes(mid); await delay(800);
            if (arr[mid] === targetKey) {
                setNodeSuccess(mid);
                updateTerminal(`<strong>Target Found!</strong> Bisection midpoint value perfectly matches target <span class="highlight">${targetKey}</span> at center index [${mid}].`, 'O(log N)');
                return;
            } else if (arr[mid] < targetKey) {
                low = mid + 1;
                updateTerminal(`Midpoint (${arr[mid]}) is smaller than target (${targetKey}). Throwing away the left half.`, 'O(log N)');
            } else {
                high = mid - 1;
                updateTerminal(`Midpoint (${arr[mid]}) is larger than target (${targetKey}). Throwing away the right half.`, 'O(log N)');
            }
        }
    }
    updateTerminal(`<strong>Search Complete:</strong> Element <span class="highlight">${targetKey}</span> does not exist inside the active array.`, 'Not Found');
}

function highlightNodes(...indices) {
    const nodes = canvas.querySelectorAll('.node');
    nodes.forEach(n => n.classList.remove('highlighted'));
    indices.forEach(idx => { if(nodes[idx]) nodes[idx].classList.add('highlighted'); });
}
function setNodeSuccess(idx) {
    const nodes = canvas.querySelectorAll('.node');
    if(nodes[idx]) nodes[idx].classList.add('success-state');
}
function flagAllNodesSuccess() { canvas.querySelectorAll('.node').forEach(n => n.classList.add('success-state')); }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function sortBST(node, val) {
    if(val < node.val) {
        if(!node.left) node.left = { val, left: null, right: null };
        else sortBST(node.left, val);
    } else {
        if(!node.right) node.right = { val, left: null, right: null };
        else sortBST(node.right, val);
    }
}

function updateTerminal(msg, complexity) { expText.innerHTML = `${msg}<br><span class="complexity-tag">Time Complexity: ${complexity}</span>`; }
function clearInputs() { pInput.value = ''; }
function resetCurrentStructure() {
    if(currentDS === 'tree') dataStorage.tree.root = null;
    else if(currentDS === 'graph') { dataStorage.graph = { nodes: [], edges: [] }; updateDropdownOptions(); }
    else if(currentDS === 'sort') dataStorage.sort = [45, 12, 89, 7, 31, 63];
    else if(currentDS === 'search') dataStorage.search = [10, 23, 35, 48, 59, 72, 88];
    else dataStorage[currentDS] = [];
    renderMaster();
    updateTerminal("Reset complete. Workspace cleared.", "O(1)");
}

function renderMaster() {
    canvas.innerHTML = ''; canvas.className = `canvas ${currentDS}-view`;
    
    if(['stack','queue','list','sort','search'].includes(currentDS)) {
        dataStorage[currentDS].forEach((val, i) => {
            const b = document.createElement('div'); b.className = 'node'; b.textContent = val; canvas.appendChild(b);
            if(currentDS === 'list' && i < dataStorage.list.length - 1) {
                const a = document.createElement('div'); a.className = 'arrow'; a.textContent = '➔'; canvas.appendChild(a);
            }
        });
    } else if (currentDS === 'tree') { 
        buildTree(dataStorage.tree.root, canvas, 50, 40, 25); 
    } else if (currentDS === 'graph') {
        const coords = {};
        
        dataStorage.graph.nodes.forEach((val, idx) => {
            const rad = (idx / dataStorage.graph.nodes.length) * 2 * Math.PI;
            const x = 200 + 120 * Math.cos(rad);
            const y = 140 + 90 * Math.sin(rad);
            coords[val] = { x, y };
        });

        if (dataStorage.graph.edges.length > 0) {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.style.position = 'absolute'; svg.style.width = '100%'; svg.style.height = '100%';
            svg.style.top = '0'; svg.style.left = '0'; svg.style.pointerEvents = 'none';
            canvas.appendChild(svg);

            dataStorage.graph.edges.forEach(([src, dest]) => {
                if (coords[src] && coords[dest]) {
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", `${coords[src].x + 30}px`);
                    line.setAttribute("y1", `${coords[src].y + 30}px`);
                    line.setAttribute("x2", `${coords[dest].x + 30}px`);
                    line.setAttribute("y2", `${coords[dest].y + 30}px`);
                    line.setAttribute("stroke", "rgba(0, 242, 254, 0.4)");
                    line.setAttribute("stroke-width", "2");
                    svg.appendChild(line);
                }
            });
        }

        Object.keys(coords).forEach(val => {
            const n = document.createElement('div');
            n.className = 'node graph-node'; n.style.left = `${coords[val].x}px`; n.style.top = `${coords[val].y}px`;
            n.textContent = val; canvas.appendChild(n);
        });
    }
}

function buildTree(node, frame, x, y, d, parentX = null, parentY = null) {
    if (!node) return;

    if (parentX !== null && parentY !== null) {
        const svg = frame.querySelector('#tree-svg') || document.createElementNS("http://www.w3.org/2000/svg", "svg");
        if (!frame.querySelector('#tree-svg')) {
            svg.id = 'tree-svg'; svg.style.position = 'absolute'; svg.style.width = '100%'; svg.style.height = '100%';
            svg.style.top = '0'; svg.style.left = '0'; svg.style.pointerEvents = 'none'; frame.appendChild(svg);
        }
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", `${parentX}%`); line.setAttribute("y1", `${parentY + 30}px`);
        line.setAttribute("x2", `${x}%`); line.setAttribute("y2", `${y + 30}px`);
        line.setAttribute("stroke", "rgba(255, 255, 255, 0.15)"); line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
    }

    const t = document.createElement('div');
    t.className = 'node tree-node'; t.style.left = `calc(${x}% - 30px)`; t.style.top = `${y}px`;
    t.textContent = node.val; frame.appendChild(t);

    buildTree(node.left, frame, x - d, y + 85, d * 0.5, x, y);
    buildTree(node.right, frame, x + d, y + 85, d * 0.5, x, y);
}

switchDS('stack');