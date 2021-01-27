// This file uses markdown for formatting

const description = `
You will be given a series of coding problems, and you will try to solve them using the smallest number of bytes of code.

You will use the site <https://tio.run/>. To submit your solution, click on the link icon at the top of the page, then press the copy button to the right of the “Plain URL”. Paste that into the input box below. You can make multiple submissions for a question, and only your last one will count (late submissions don’t count at all). 

Input and Output
* Your program must accept inputs given as STDIN, standard input (the “Input” section in <https://tio.run/>). The input given to your program will end with a newline.
* Your program must provide the output using STDOUT, standard output (the “Output” section in <https://tio.run/>.) Whitespace and newlines at the end of your output don’t matter.

Scoring
* For each question, participants will be ranked — first by byte count, then (to resolve ties) by submission time.
* For each question, you get
  * 8 points if you're in 1st place
  * 7 points if you're in 2nd place
  * 6 points if you're in 3rd place
  * 5 points if you're in 4rd place
  * 4 points if you're below 4th place but your submission was correct
* Late submissions don't count; if you submit your answer late, that's the same as not submitting it at all.
* If there's a tie at the end, they will be resolved using these criteria (each one applies only if there's still a tie with the previous one):
  1. Total number of questions correct
  2. Total byte count
  3. Total time

If you have any questions, please ask! Have fun and please don't try to cheat.

To see the programming languages that are allowed, go to <https://tio.run/> and **deselect “Recreational”** at the top so that only the “Practical” languages are visible. (You can also see the list of allowed languages below.)

<details>
  <summary>Click to view a list of allowed languages</summary>
  <ul>
    <li>abc</li><li>abc-assembler</li><li>ada-gnat</li><li>agda</li><li>algol68g</li><li>aliceml</li><li>apl-dyalog</li><li>apl-dyalog-classic</li><li>apl-dyalog-extended</li><li>apl-dzaima</li><li>apl-ngn</li><li>appleseed</li><li>asperix</li><li>assembly-as</li><li>assembly-fasm</li><li>assembly-gcc</li><li>assembly-jwasm</li><li>assembly-nasm</li><li>ats2</li><li>attache</li><li>awk</li><li>bash</li><li>bc</li><li>beanshell</li><li>boo</li><li>bosh</li><li>bracmat</li><li>brat</li><li>c-clang</li><li>c-gcc</li><li>c-tcc</li><li>caboose</li><li>cakeml</li><li>calc2</li><li>ceylon</li><li>charm</li><li>chapel</li><li>checkedc</li><li>cheddar</li><li>cil-mono</li><li>cixl</li><li>clean</li><li>clips</li><li>clisp</li><li>clojure</li><li>cobol-gnu</li><li>cobra</li><li>coconut</li><li>coffeescript</li><li>coffeescript2</li><li>cpp-clang</li><li>cpp-gcc</li><li>cpy</li><li>cryptol</li><li>crystal</li><li>cs-core</li><li>cs-csc</li><li>cs-csi</li><li>cs-mono</li><li>cs-mono-shell</li><li>curry-pakcs</li><li>curry-sloth</li><li>cyclone</li><li>d</li><li>dafny</li><li>dart</li><li>dash</li><li>dc</li><li>dg</li><li>dscript</li><li>ec</li><li>ecpp-c</li><li>ecpp-cpp</li><li>dyvil</li><li>ed</li><li>egel</li><li>elf</li><li>elixir</li><li>emacs-lisp</li><li>erlang-escript</li><li>es</li><li>euphoria3</li><li>euphoria4</li><li>factor</li><li>fantom</li><li>farnsworth</li><li>felix</li><li>fish-shell</li><li>focal</li><li>forth-gforth</li><li>fortran-gfortran</li><li>fs-core</li><li>fs-mono</li><li>funky</li><li>funky2</li><li>gap</li><li>gema</li><li>gnuplot</li><li>go</li><li>granule</li><li>groovy</li><li>gwion</li><li>hades</li><li>haskell</li><li>haskell-gofer</li><li>haskell-hugs</li><li>haskell-literate</li><li>haxe</li><li>hobbes</li><li>huginn</li><li>hy</li><li>icon</li><li>idris</li><li>ink</li><li>io</li><li>j</li><li>jq</li><li>jx</li><li>java-jdk</li><li>java-openjdk</li><li>javascript-babel-node</li><li>javascript-node</li><li>javascript-spidermonkey</li><li>javascript-v8</li><li>joy</li><li>julia</li><li>julia1x</li><li>julia5</li><li>julia6</li><li>julia7</li><li>k-kona</li><li>k-ngn</li><li>k-ok</li><li>koberi-c</li><li>koka</li><li>kotlin</li><li>ksh</li><li>lean</li><li>lily</li><li>llvm</li><li>lua</li><li>lua-luajit</li><li>lua-openresty</li><li>m4</li><li>make</li><li>mamba</li><li>mathematica</li><li>mathics</li><li>maxima</li><li>moonscript</li><li>mouse</li><li>mouse2002</li><li>mouse83</li><li>mumps</li><li>my-basic</li><li>nial</li><li>nim</li><li>oberon-07</li><li>object-pascal-fpc</li><li>objective-c-clang</li><li>objective-c-gcc</li><li>occam-pi</li><li>ocaml</li><li>octave</li><li>odin</li><li>osh</li><li>pari-gp</li><li>pascal-fpc</li><li>perl4</li><li>perl5</li><li>perl5-cperl</li><li>perl6</li><li>perl6-niecza</li><li>phoenix</li><li>php</li><li>physica</li><li>picolisp</li><li>pike</li><li>pilot-pspilot</li><li>pilot-rpilot</li><li>pony</li><li>positron</li><li>postscript-xpost</li><li>powershell</li><li>powershell-core</li><li>prolog-ciao</li><li>prolog-swi</li><li>proton</li><li>proton2</li><li>ps-core</li><li>pure</li><li>purescript</li><li>python1</li><li>python2</li><li>python2-cython</li><li>python2-iron</li><li>python2-jython</li><li>python2-pypy</li><li>python3</li><li>python38pr</li><li>python3-cython</li><li>python3-pypy</li><li>python3-stackless</li><li>qs-core</li><li>r</li><li>racket</li><li>rad</li><li>rapira</li><li>reason</li><li>rebol</li><li>rebol3</li><li>red</li><li>rexx</li><li>ring</li><li>rk</li><li>roda</li><li>ruby</li><li>rust</li><li>scala</li><li>scheme-chez</li><li>scheme-chicken</li><li>scheme-gambit</li><li>scheme-guile</li><li>sed</li><li>sed-gnu</li><li>sfk</li><li>shnap</li><li>sidef</li><li>simula</li><li>sisal</li><li>sml-mlton</li><li>snobol4</li><li>spim</li><li>sqlite</li><li>squirrel</li><li>stacked</li><li>swift4</li><li>tcl</li><li>tcsh</li><li>templat</li><li>typescript</li><li>ubasic</li><li>ursala</li><li>vala</li><li>vb-core</li><li>visual-basic-net-mono</li><li>visual-basic-net-vbc</li><li>vlang</li><li>vsl</li><li>wasm</li><li>wren</li><li>yabasic</li><li>yash</li><li>ybc</li><li>z3</li><li>zephyr</li><li>zig</li><li>zkl</li><li>zoidberg</li><li>zsh</li>
  </ul>
</details>
<br>
`

export default description
