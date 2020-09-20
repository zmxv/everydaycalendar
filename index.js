console.log('This web app serves as a virtual substitute of Every Day Calendar'); 
console.log('It stores all your achievements in your browser without sending anything to the server.'); 

(function () {
    var year = new Date().getFullYear();
    // state is an array of 61 six-bit integers that represents
    // up to 366 days of progress. Each year's state is serialized as
    // 61 printable characters ranging from "*" to "i".
    var state = loadState(year);
    var board = document.getElementById("board");
    renderBoard(year);

    // bind events
    addListener('click', '.flip', flipBoard);
    addListener('mousedown', '.lit', toggleCell);
    addListener('touchstart', '.lit', toggleCell);
    addListener('mouseover', '.lit', toggleCell, function(event) {
        return 'buttons' in event && event.buttons > 0;
    });

    function flipBoard() {
        var inner = document.getElementById("inner");
        inner.className = inner.className ? "" : "flipped";
    }

    function renderBoard(year) {
        board.innerHTML = "";
        // render bolts
        for (var r = 0; r < 5; r++) {
            for (var c = 0; c < 4; c++) {
                if (r == 0 || r == 4 || c == 0 || c == 3) {
                    addDiv("bolt", 23 + c * 186, 23 + r * 235);
                }
            }
        }
        // render month labels
        for (var i = 0; i < 12; i++) {
            var div = addDiv("mon", 49 + i * 44, 57);
            div.style.backgroundPositionY = -80 - i * 24 + "px";
        }
        // render cells
        var d = new Date(year, 0, 1), i = 0;
        while (d.getFullYear() == year) {
            renderCell(d.getMonth(), d.getDate() - 1, i++);
            d.setDate(d.getDate() + 1);
        }
    }

    function renderCell(mon, day, index) {
        var x = 49 + mon * 44, y = 82 + day * 28;
        if (day) {
            addDiv("dots", x, y - 5);
        }
        addDiv("dim", x, y).innerHTML = day + 1;
        var lit = addDiv("lit", x, y);
        lit.innerHTML = day + 1;
        lit.setAttribute("data-index", index);
        lit.style.opacity = getBit(state, index) ? 1 : 0;
    }

    function toggleCell(e) {
        e.preventDefault();
        var lit = e.target;
        var index = parseInt(lit.getAttribute("data-index"));
        lit.style.opacity = toggleBit(state, index) ? 1 : 0;
        storeState(year, state);
    }

    function addDiv(cls, x, y, parent) {
        var div = document.createElement("div");
        div.className = cls;
        div.style.left = x + "px";
        div.style.top = y + "px";
        (parent || board).appendChild(div);
        return div;
    }

    function addListener(event, match, action, check) {
        document.addEventListener(event, function (event) {
            if (event.target.matches(match)) {
                if(check) {
                    if(check(event)) {
                        action(event);
                    }
                }
                else {
                    action(event);
                }
            }
        }, {passive: false});
    }

    function storeState(year, state) {
        localStorage.setItem(year, state.reduce(function(s, v) {
            return s + String.fromCharCode(42 + v);
        }, ""));
    }

    function loadState(year) {
        var a = [], s = localStorage.getItem(year);
        for (var i = 0; i < 61; i++) {
            var cc = (s && s.charCodeAt(i)) || 0;
            a.push(cc >= 42 && cc < 42 + 64 ? cc - 42: 0);
        }
        return a;
    }

    function getBit(state, index) {
        return state[index / 6 | 0] & (1 << (index % 6));
    }

    function toggleBit(state, index) {
        return (state[index / 6 | 0] ^= 1 << (index % 6)) & (1 << (index % 6));
    }
})();
