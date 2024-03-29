document.addEventListener('paste', (evt) => {
    if (evt.target.nodeName.toLowerCase() === "input") return;
    const tableClipboard = (evt.clipboardData || window.clipboardData).getData('text');
    const table = tableClipboard.split("\n").map(row => row.split("\t").map(cell => cell.replace("\r", ""))).filter(row => (row.filter(cell => cell !== '')).length > 0);
    const tableWidth = table[0].length;

    const settings = {
        position: document.querySelector('#position').value || "H",
        centering: document.querySelector('#centering').checked,
        bold: document.querySelector('#bold').checked,
        math: document.querySelector('#math').checked,
        borders: !document.querySelector('#borders').checked,
        alignment: document.querySelector('#alignment').value || "l",
        caption_on_top: document.querySelector('#caption_position').value === "top"
    };

    const caption = `\\caption{${document.querySelector('input#caption')?.value || "My Table"}}`;

    const latexRaw = `
        \\begin{table}[${settings.position}]
            ${settings.centering ? "\\centering" : ""}
            ${settings.caption_on_top ? `${caption}
            \\vspace{10pt}` : ""}
            \\begin{tabular}{${((settings.borders ? "|" : " ").concat(settings.alignment)).repeat(tableWidth)}${settings.borders ? "|" : " "}}
                ${settings.borders ? "\\hline" : ""} ${table.map((row, i) => {
        return `
                ${row.map((cell, j) => {
            if (i === 0 && settings.bold) {
                if (settings.math) {
                    return `$\\mathbf{${escapeLatexMath(cell)}}$ ${j < tableWidth - 1 ? "& " : "\\\\"}`;
                } else {
                    return `\\textbf{${escapeLatex(cell)}} ${j < tableWidth - 1 ? "& " : "\\\\"}`;
                }
            } else {
                if (settings.math) {
                    return `${escapeLatexMath(cell) !== "" ? `$${escapeLatexMath(cell)}$` : ''} ${j < tableWidth - 1 ? "& " : "\\\\"}`;
                } else {
                    return `${escapeLatex(cell)} ${j < tableWidth - 1 ? "& " : "\\\\"}`;
                }
            }
        }).join("")}
                ${settings.borders ? "\\hline" : ""}`;
    }).join("")}
            \\end{tabular}
            ${!settings.caption_on_top ? caption : ""}                
            \\label{${document.querySelector('input#caption')?.value ? "tab:" + handleize(document.querySelector('input').value) : "tab:my-table"}}
        \\end{table}
    `;

    const latexLines = latexRaw.split("\n").map(line => line.trim()).filter(Boolean);
    var latex = "";
    var tab = 0;
    for (let line of latexLines) {
        if (line.includes("\\end{")) tab--;
        latex += "\t".repeat(tab) + line + "\n";
        if (line.includes("\\begin{")) tab++;
    }

    navigator.clipboard.writeText(latex);
    showLatex(latex);
});

const showLatex = (latex) => {
    const container = document.querySelector('.paste_container');
    const paste = container.querySelectorAll('.paste');
    const success = container.querySelector('.success');
    paste.forEach(elem => elem.style.display = "none");
    success.querySelector("#latex").innerHTML = latex;
    window.Prism.highlightAll();
    success.style.display = "block";

    setTimeout(() => {
        paste.forEach(elem => elem.style.display = (elem.classList.contains("mobile") && window.innerWidth < 1000) || (!elem.classList.contains("mobile") && window.innerWidth >= 1000) ? "block" : "none");
        success.style.display = "none";
    }, 15000);
};

const escapeLatex = (latex) => {
    return latex.toString().trim()
        .replace(/#/g, '\\#')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\[/g, '{\[}')
        .replace(/\]/g, '{\]}')
        .replace(/%/g, '\\%');

};

const escapeLatexMath = (latex) => {
    return latex.replace(/ä/g, '\\ddot{a}')
        .replace(/ö/g, '\\ddot{o}')
        .replace(/ü/g, '\\ddot{u}')
        .replace(/Ä/g, '\\ddot{A}')
        .replace(/Ö/g, '\\ddot{O}')
        .replace(/Ü/g, '\\ddot{U}')
        .replace(/%/g, '\\%')
        .replace(/°/g, '{}^{\\circ}')
        .replace(/ß/g, 'ss');
};

const handleize = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};


const setCopyrightYear = () => {
    const copy = document.querySelector(".copy #year");
    const from = 2022;
    const now = new Date().getFullYear();
    if (from < now) copy.innerHTML = `${from} - ${now}`;
    else copy.innerHTML = from;
};

setCopyrightYear();
