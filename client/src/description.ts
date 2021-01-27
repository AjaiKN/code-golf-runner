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
    <li>abc<li>abc-assembler<li>ada-gnat<li>agda<li>algol68g<li>aliceml<li>apl-dyalog<li>apl-dyalog-classic<li>apl-dyalog-extended<li>apl-dzaima<li>apl-ngn<li>appleseed<li>asperix<li>assembly-as<li>assembly-fasm<li>assembly-gcc<li>assembly-jwasm<li>assembly-nasm<li>ats2<li>attache<li>awk<li>bash<li>bc<li>beanshell<li>boo<li>bosh<li>bracmat<li>brat<li>c-clang<li>c-gcc<li>c-tcc<li>caboose<li>cakeml<li>calc2<li>ceylon<li>charm<li>chapel<li>checkedc<li>cheddar<li>cil-mono<li>cixl<li>clean<li>clips<li>clisp<li>clojure<li>cobol-gnu<li>cobra<li>coconut<li>coffeescript<li>coffeescript2<li>cpp-clang<li>cpp-gcc<li>cpy<li>cryptol<li>crystal<li>cs-core<li>cs-csc<li>cs-csi<li>cs-mono<li>cs-mono-shell<li>curry-pakcs<li>curry-sloth<li>cyclone<li>d<li>dafny<li>dart<li>dash<li>dc<li>dg<li>dscript<li>ec<li>ecpp-c<li>ecpp-cpp<li>dyvil<li>ed<li>egel<li>elf<li>elixir<li>emacs-lisp<li>erlang-escript<li>es<li>euphoria3<li>euphoria4<li>factor<li>fantom<li>farnsworth<li>felix<li>fish-shell<li>focal<li>forth-gforth<li>fortran-gfortran<li>fs-core<li>fs-mono<li>funky<li>funky2<li>gap<li>gema<li>gnuplot<li>go<li>granule<li>groovy<li>gwion<li>hades<li>haskell<li>haskell-gofer<li>haskell-hugs<li>haskell-literate<li>haxe<li>hobbes<li>huginn<li>hy<li>icon<li>idris<li>ink<li>io<li>j<li>jq<li>jx<li>java-jdk<li>java-openjdk<li>javascript-babel-node<li>javascript-node<li>javascript-spidermonkey<li>javascript-v8<li>joy<li>julia<li>julia1x<li>julia5<li>julia6<li>julia7<li>k-kona<li>k-ngn<li>k-ok<li>koberi-c<li>koka<li>kotlin<li>ksh<li>lean<li>lily<li>llvm<li>lua<li>lua-luajit<li>lua-openresty<li>m4<li>make<li>mamba<li>mathematica<li>mathics<li>maxima<li>moonscript<li>mouse<li>mouse2002<li>mouse83<li>mumps<li>my-basic<li>nial<li>nim<li>oberon-07<li>object-pascal-fpc<li>objective-c-clang<li>objective-c-gcc<li>occam-pi<li>ocaml<li>octave<li>odin<li>osh<li>pari-gp<li>pascal-fpc<li>perl4<li>perl5<li>perl5-cperl<li>perl6<li>perl6-niecza<li>phoenix<li>php<li>physica<li>picolisp<li>pike<li>pilot-pspilot<li>pilot-rpilot<li>pony<li>positron<li>postscript-xpost<li>powershell<li>powershell-core<li>prolog-ciao<li>prolog-swi<li>proton<li>proton2<li>ps-core<li>pure<li>purescript<li>python1<li>python2<li>python2-cython<li>python2-iron<li>python2-jython<li>python2-pypy<li>python3<li>python38pr<li>python3-cython<li>python3-pypy<li>python3-stackless<li>qs-core<li>r<li>racket<li>rad<li>rapira<li>reason<li>rebol<li>rebol3<li>red<li>rexx<li>ring<li>rk<li>roda<li>ruby<li>rust<li>scala<li>scheme-chez<li>scheme-chicken<li>scheme-gambit<li>scheme-guile<li>sed<li>sed-gnu<li>sfk<li>shnap<li>sidef<li>simula<li>sisal<li>sml-mlton<li>snobol4<li>spim<li>sqlite<li>squirrel<li>stacked<li>swift4<li>tcl<li>tcsh<li>templat<li>typescript<li>ubasic<li>ursala<li>vala<li>vb-core<li>visual-basic-net-mono<li>visual-basic-net-vbc<li>vlang<li>vsl<li>wasm<li>wren<li>yabasic<li>yash<li>ybc<li>z3<li>zephyr<li>zig<li>zkl<li>zoidberg<li>zsh
  </ul>
</details>
<br>
`

export default description
