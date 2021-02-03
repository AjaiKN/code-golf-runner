// This file uses markdown for formatting

const description = `
You will be given a series of coding problems, and you will try to solve them using the smallest number of bytes of code.

You will use the site <https://tio.run/>. 
To submit your solution, click on the link icon at the top of the page, then press the copy button to the right of the “Plain URL”. 
Paste that into the input box below. 
You can make multiple submissions for a question, and only your last one will count (late submissions don’t count at all). 
(Note: in <https://tio.run/>, the URL in the browser bar won't change automatically when you change the code. 
You have to actually press the copy URL button whenever you change your code.)

Input and Output
* Your program must accept inputs given as STDIN, standard input (the “Input” section in <https://tio.run/>). The input given to your program will end with a newline.
* Your program must provide the output using STDOUT, standard output (the “Output” section in <https://tio.run/>). Whitespace and newlines at the end of your output don’t matter.

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
You may use the Internet to look up stuff about your programming language, for example, but don't collaborate with others or Google the specific question.

To see the programming languages that are allowed, go to <https://tio.run/> and **deselect “Recreational”** at the top so that only the “Practical” languages are visible. (You can also see the list of allowed languages below.)

<details>
  <summary>Click to view a list of allowed languages</summary>
  <ul class="languages-list"><li>ABC<li>ABC-assembler<li>Ada (GNAT)<li>Agda<li>ALGOL 68 (Genie)<li>Alice ML<li>APL (Dyalog Unicode)<li>APL (Dyalog Classic)<li>APL (Dyalog Extended)<li>APL (dzaima/APL)<li>APL (ngn/apl)<li>Appleseed<li>ASPeRiX<li>Assembly (as, x64, Linux)<li>Assembly (fasm, x64, Linux)<li>Assembly (gcc, x64, Linux)<li>Assembly (JWasm, x64, Linux)<li>Assembly (nasm, x64, Linux)<li>ATS2<li>Attache<li>AWK<li>Bash<li>bc<li>BeanShell<li>Boo<li>bosh<li>Bracmat<li>Brat<li>C (clang)<li>C (gcc)<li>C (tcc)<li>Caboose<li>CakeML<li>calc (TTK)<li>Ceylon<li>Charm<li>Chapel<li>Checked C<li>Cheddar<li>CIL (Mono IL assembler)<li>cixl<li>Clean<li>CLIPS<li>Common Lisp<li>Clojure<li>COBOL (GNU)<li>Cobra<li>Coconut<li>CoffeeScript 1<li>CoffeeScript 2<li>C++ (clang)<li>C++ (gcc)<li>CPY<li>Cryptol<li>Crystal<li>C# (.NET Core)<li>C# (Visual C# Compiler)<li>C# (Visual C# Interactive Compiler)<li>C# (Mono C# compiler)<li>C# (Mono C# Shell)<li>Curry (PAKCS)<li>Curry (Sloth)<li>Cyclone<li>D<li>Dafny<li>Dart<li>Dash<li>dc<li>dg<li>DScript<li>eC<li>ecpp + C (gcc)<li>ecpp + C++ (gcc)<li>Dyvil<li>ed<li>Egel<li>ELF (x86/x64, Linux)<li>Elixir<li>Emacs Lisp<li>Erlang (escript)<li>es<li>Euphoria 3<li>Euphoria 4<li>Factor<li>Fantom<li>Farnsworth<li>Felix<li>fish<li>FOCAL-69<li>Forth (gforth)<li>Fortran (GFortran)<li>F# (.NET Core)<li>F# (Mono)<li>Funky<li>Funky 2<li>GAP<li>Gema<li>gnuplot<li>Go<li>Granule<li>Groovy<li>Gwion<li>HadesLang<li>Haskell<li>Haskell 1.2 (Gofer)<li>Haskell 98 (Hugs)<li>Literate Haskell<li>Haxe<li>Hobbes<li>Huginn<li>Hy<li>Icon<li>Idris<li>ink<li>Io<li>J<li>jq<li>Jx<li>Java (JDK)<li>Java (OpenJDK 8)<li>JavaScript (Babel Node)<li>JavaScript (Node.js)<li>JavaScript (SpiderMonkey)<li>JavaScript (V8)<li>Joy<li>Julia 0.4<li>Julia 1.0<li>Julia 0.5<li>Julia 0.6<li>Julia 0.7<li>K (Kona)<li>K (ngn/k)<li>K (oK)<li>Kobeři-C<li>Koka<li>Kotlin<li>ksh<li>Lean<li>Lily<li>LLVM IR<li>Lua<li>Lua (LuaJIT)<li>Lua (OpenResty)<li>M4<li>Make<li>Mamba<li>Wolfram Language (Mathematica)<li>Mathics<li>Maxima<li>Moonscript<li>Mouse-79<li>Mouse-2002<li>Mouse-83<li>MUMPS<li>MY-BASIC<li>Nial<li>Nim<li>Oberon-07<li>Object Pascal (FPC)<li>Objective-C (clang)<li>Objective-C (gcc)<li>occam-pi<li>OCaml<li>Octave<li>Odin<li>OSH<li>Pari/GP<li>Pascal (FPC)<li>Perl 4<li>Perl 5<li>Perl 5 (cperl)<li>Perl 6<li>Perl 6 (Niecza)<li>Phoenix<li>PHP<li>Physica<li>PicoLisp<li>Pike<li>PILOT (psPILOT)<li>PILOT (RPilot)<li>Pony<li>Positron<li>PostScript (xpost)<li>PowerShell<li>PowerShell Core<li>Prolog (Ciao)<li>Prolog (SWI)<li>Proton<li>Proton 2.0<li>P#<li>Pure<li>PureScript<li>Python 1<li>Python 2<li>Python 2 (Cython)<li>Python 2 (IronPython)<li>Python 2 (Jython)<li>Python 2 (PyPy)<li>Python 3<li>Python 3.8 (pre-release)<li>Python 3 (Cython)<li>Python 3 (PyPy)<li>Python 3 (Stackless)<li>Q#<li>R<li>Racket<li>RAD<li>Rapira<li>Reason<li>REBOL<li>REBOL 3<li>Red<li>Rexx (Regina)<li>Ring<li>rk<li>Röda<li>Ruby<li>Rust<li>Scala<li>Chez Scheme<li>CHICKEN Scheme<li>Gambit Scheme (gsi)<li>Guile<li>sed 4.2.2<li>sed<li>sfk<li>Shnap<li>Sidef<li>Simula (cim)<li>SISAL<li>Standard ML (MLton)<li>SNOBOL4 (CSNOBOL4)<li>Assembly (MIPS, SPIM)<li>SQLite<li>Squirrel<li>Stacked<li>Swift<li>Tcl<li>tcsh<li>TemplAt<li>TypeScript<li>uBASIC<li>Ursala<li>Vala<li>Visual Basic .NET (.NET Core)<li>Visual Basic .NET (Mono)<li>Visual Basic .NET (VBC)<li>V (vlang.io)<li>VSL<li>WebAssembly (WaWrapper)<li>Wren<li>Yabasic<li>yash<li>B (ybc)<li>Z3<li>Zephyr<li>Zig<li>zkl<li>Zoidberg<li>Zsh</ul>
</details>
<br>
`

export default description
