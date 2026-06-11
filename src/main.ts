import "./styles/main.css";

// Phase 0 placeholder — replaced by the real terminal engine in Phase 1.
const terminal = document.querySelector<HTMLElement>("#terminal")!;

terminal.innerHTML = `
  <div class="line"><span class="prompt">raswanth@portfolio:~$</span> echo "hello, world"</div>
  <div class="line">hello, world</div>
  <div class="line"><span class="prompt">raswanth@portfolio:~$</span> <span class="cursor"></span></div>
`;
