---
layout: post
title: "CALL's - Como elas fazem uso da Stack"
excerpt: "Este pequeno artigo fala sobre procedures(funções) e como elas usam a pilha para passar variáveis."
modified: 2009-04-02
tags: [traducao, beginner, tutorial, IA32, assembly]
comments: true
---
{% include _toc.html %}
 
	/_//_                                                    
	/`\//_|/_/ 
		_/ -.- .-.. .- -.-- __________________Assembly IA-32 
		---------------------------------------------
	=-------- CALL's - Como elas fazem uso da Stack ----------= 
		--------------------------------------------- 

	
## Introdução
	
Este pequeno artigo fala sobre procedures(funções) e como elas usam a pilha para passar variáveis. Ele poderá ser muito
util principalmente para iniciantes. Eu não acho que crackers experientes terão muito proveito deste, porém se você não sabe
como a pilha funciona, o que uma procedure faz e como os parametros são passados para ela, então este documento poderá ajuda-lo e muito. Eu também gostaria de avisar que todos nós somos responsáveis por nossas próprias ações. Eu não serei responsável por nenhum ato ilegal que seja tomado com o conhecimento providenciado aqui. Então, se ajeite em uma posição confortável divita-se :)

## Ferramentas Necessárias								 
	
Tudo que você vai precisará será:

- Algum espaço em seu celebro
- Um drink; Um long island-ice tea dá para o gasto: 
	- 4 dedos de rum, 
	- 4 dedos de tequila, 
	- 4 dedos de whiskey, 
	- 4   dedos de vodka, 
	- Um pouco de suco de limão e preencha o resto com coca-cola. Uma delicia!

## Porque usar procedures?	
	
Eu tenho certeza que você já se perguntou o que é uma 
procedure. Qual sua utilidade? Imagine que você esta desen-
volvendo um programa que tenha que escrever alguns caracteres 
na tela com uma certa frequencia por exemplo. Este texto não
será o mesmo todas as vezes, mas a rotina, o código para tra-
zer os caracteres a tela será sempre o mesmo. 

Sendo assim, para fazer isso,você teria que escrever o mesmo código
repetida vezes para cada mensagem que você desejasse exibir 
na tela, porém há uma maneira mais fácil. Apenas escreva o 
código uma vez, logo após lhe de um nome, uma referencia, como por 
exemplo "write_to_screen" e então, a parti de agora tudo o que 
você precisa fazer é chamar esta função. Mas espere, há outro
problema: Nos temos diferente mensagens, então, nos iremos 
precisar de uma variável, algo como MSG que guardaria a 
mensagem que nos queremos imprimir e é claro nos teremos 
que passa-la a função. Esta tarefa se pareceria assim, caso 
fosse escrito em uma linguagem de alto nível como C++.

	Exemplo:
		write_to_screen(LPSTR *msg);

Mas como seria em Assembly? Seria mais ou menos assim:

	Exemplo:
		push 	MSG				;insiro MSG na pilha
		call	write_to_screen	;chamo a procedure

Este exemplo mostra dois tópicos que foram explicados neste 
tutorial. O que uma chamada a procedure é e porque você precisa
 passar variáveis
para ela. Agora que você sabe para que serve uma procedure e o 
que ela tem de melhor, talvez você esteja
confuso por causa do push, então nossa próxima etapa é falar 
um pouco mais sobre a pilha.


## A PILHA
	
A pilha é uma estrutura que guarda valores. Estes valores
sempre possuem 4 bytes (= 1 DWORD) de comprimento. Ela funciona
em LIFO, sigla para Last In First Out que em português quer dizer
O primeiro que entra é o ultimo a sair. 

Isso quer dizer que um valor
que foi recentemente colocado na pilha será removido primeiro. Há apenas dois
comandos, instruções, para trabalhar com a pilha. estes são chamados push e pop.
push insere um valor na pilha e pop remove este valor.

	Exemplo:
	
	push a		Pilha= {a}
	push b		Pilha= {a,b}
	push c		Pilha= {a,b,c}
	pop eax		Pilha= {a,b} eax = c
	pop ebx		Pilha= {a} eax = c; ebx = b
	push eax   	Pilha= {a,c} eax = c; ebx = b
	push 5		Pilha= {a,c,5} eax = c; ebx = b
	
Mas push e pop também fazem coisas adicionais. para entender, nós precisamos primeiro
dá uma olhada para o registrador `ESP` (Apontador de pilha). Este registrador sempre terá uma 
referencia para o inicio da pilha. ou melhor o ultimo valor que foi colocado lá. a pilha sempre cresce de um valor alto de memória para um baixo,
então se você incluir um valor `ESP` será subtraido por 4, se você remover um valor `ESP` será incrementado por 4.

	Exemplo:

	ESP = 7E0000; EAX = 01020304
	: ...
	:7DFFF0 12 34 56 78 00 00 00 00-00 00 00 00 00 00 00 00
	:7E0000 00 00 00 00 00 00 00 00-00 00 00 00 00 00 00 00

	Este é o estado inicial da pilha preenchido com 78563421.

	Agora se você inserir EAX na pilha você terá:
	
	ESP = ESP - 4 = 7DFFF0                      ESP Aqui
	: ...                                       |
	:7DFFF0 00 00 00 00 00 00 00 00-00 00 00 00 04 03 02 01
	:7E0000 12 34 56 78 00 00 00 00-00 00 00 00 00 00 00 00

	Como você pode ver, o apontador de pilha é ajustado
	e o valor é escrito na posição correta da memória.


	pop ebx
	
	Agora você removeu o valor:
	
	ESP = ESP + 4 = 7E0000		EBX = 01020304
	
	:7DFFF0 00 00 00 00 00 00 00 00-00 00 00 00 04 03 02 01
	:7E0000 12 34 56 78 00 00 00 00-00 00 00 00 00 00 00 00
			|
			ESP aponta para cá.
			Note que o valor removido não foi modificado!
			
É claro qu evocê também pode adcionar ou subtrair algo de `ESP`.
Vamos ver o que acontece se nós adcionarmos 1 a `ESP`

	INC ESP ; ESP = ESP + 1 = 7E0001
	
	:7DFFF0 00 00 00 00 00 00 00 00-00 00 00 00 04 03 02 01
	:7E0000 12 34 56 78 00 00 00 00-00 00 00 00 00 00 00 00
			   |
			   ESP agora aponta para cá.

Vamos agora remover um valor:

	pop EBX
	ESP = ESP + 4 = 7E0005
	:7DFFF0 00 00 00 00 00 00 00 00-00 00 00 00 04 03 02 01
	:7E0000 12 34 56 78 00 00 00 00-00 00 00 00 00 00 00 00
						   |
						   ESP agora aponta para cá.

E `EBX` ficou com o valor 00785634. Note que após esta operação a pilha ficou
"fora de ordem", então você deve sempre apenas adcionar multiplos de 4 a `ESP`.

Agora que você sabe como a pilha funciona e o que ela faz, vamos analisar as procedures
mais profundamente:


## PROCEDURES - Suas entranhas

Como você viu, a pilha é um lugar ideal para guardar valores. Vamos agora dá uma nova olhada
ao nosso pequeno primeiro exemplo que mostramos anteriormente. Agora com o nosso novo conheicmneot
podemos entender o que acontece e té mesmo perceber um bug sério.

	push MSG              ; Não irá funcionar, já que a pilha só pode guadar 4 bytes!
	call write_to_screen  ; então a procedure irá ler o valor de MSG da pilha

Fica claro que termos que passar o endereço de MSG ao invés de seu valor. Nos podemos fazer
isso facilmente com com o comando(instrução) `LEA EAX, MSG`. AX agora possui o endereço de MSG. Logo após nos 
o inserimos com `PUSH EAX`.  Vamos transcrever este processo e ver o que realmente esta acontecendo:

	Antes do PUSH:
	
	 dados: EAX = 00000000
		  :00450000 31 32 33 34 35 36 37 38-39 30 00 00 00 00 00 00   1234567890......

	 pilha: ESP = 007E0000
		  :007DFFF0 00 00 00 00 00 00 00 00-00 00 00 00 04 03 02 01
		  :007E0000 12 34 56 78 00 00 00 00-00 00 00 00 00 00 00 00

	Depois do PUSH:

		 :00412l00 LEA EAX, MSG  ; nada muda exeto que EAX agora vale 00450000
		 :00412104 push eax	  ; os dados continuam no lugar, porém a pilha muda
              ; pilha: ESP = 007DFFFC                         ............ address
              ;      :007DFFF0 00 00 00 00 00 00 00 00-00 00 00 00 00 00 45 00
              ;      :007E0000 12 34 56 78 00 00 00 00-00 00 00 00 00 00 00 00
				     :00412105 call write_to_screen
              ; insere a sequqencia na tela.
			  ; short break ---
				     :00412110 próxima instrução...

Mas o que a instrução call irá fazer? Ela irá fazer algo muito importante. Ela irá automáticamente 
salvar o endereço dá próxima instrução na pilha. Mas porque? Porque esta é uma chamada a procedure e 
não um JMP e depois que a procedure tiver feito seu trabalho, o programa deve continuar de onde 
parou antes da rotinar se chamada. Ou seja, isto é tudo que call é. Ser responsável em salvar o endereço 
da próxima instrução na pilha para que o PC saiba onde por onde prosseguir.
Vamos ver como a pilha se parece depois de encontrar uma instrução call

	Exemplo:

		pilha: ESP = 007DFFF8             ........... endereço de retorno salvo na stack
			 :007DFFF0 00 00 00 00 00 00 00 00-10 21 41 00 00 00 45 00
			 :007E0000 12 34 56 78 00 00 00 00-00 00 00 00 00 00 00 00

e o controle de execução pulará para onde call aponta. Sendo assim, sempre que você entra
em uma procedure você tem no topo da pilha o endereço de retorno. Agora existe apenas um 
questão a resolver: Como a procedure ler os dados da pilha?



## Lendo dados da stack

Esta é a parte mais interessante e há várias formas de se fazer, a primeira possibilidade
é retirar o valor de retorno usando pop e salvar em algum lugar, depois retirar o valor
dos dados restantes também usando pop e depois reincluir usando push o endereço de retorno.
Esta tarefa pode ser complicada especiamente se você tem muitos valores em uma chamada 
enorme, o que forçará você a salvar os valores novamente na stack por que você não pode
guarda-los todos em um registrador de dados. Pode funcionar para pequenas chamadas com 
poucos parametros. 

Então qual seria outro jeito? É fácil, basta você salvar EBP na stack
e depois guadar o endereço da stack dentro de EMP usando a instrução `mov EBP, ESP` 
agora você pode endereçar todas as variáveis que são relativas a EBP  através de
`mov eax, [EBP+20]`, desta forma você terá maior controle da stack, você também poderá
continuar usando a stack normalmente na chamada tendo que apenas ter certeza que o valor
de retorno estará no topo da stack que você salvou em EBP quando você sair da chamada.

Vamos olhar este exemplos simples que eu extrai de um MP3 CD Maker com o Win32DASM:

	beginning of the call
	:004301A1 push ebp                    ; ebp foi salvo
	:004301A2 mov ebp, esp                ; agora ebp aponta para o top da stack
										; você não precisa mais se preocupar com pushes e pops
										; por que você acessa os paramentros usando EBP como referencia agora
	:004301A4 mov eax, dword ptr [ebp+08] ; é igual a pop eax, pop eax mas você perderia o valor de retorno
	:004301A7 push esi                    ; salva outro valor
	.
	. call routine unimportant.
	. leaving the call
	:004301FF pop esi                     ; recupera  esi
	:00430200 pop ebp                     ; recupera o ponteiro de base original
	:00430201 ret                         ; agora o endereço de retorno esta no topo da stack


**Dica** Você pode ver algo como `mov eax, [ebp+10]`, agora você renomear a variável `[ebp+10]` por que ela sempre apontará para o mesma chamada. Em uma chamada protegida com nome e serial, por exemplo, você poderia dizer que `[ebp+10]` e o nome e `[ebp+14]` é o serial. Isso fará com que programas e especialmente deadlistings muito mais fáceis de serem lidas. 
Agora com todo este conhecimento você já pode dá uma olhada em alguns codesnippets extraídos com o Win32DASM.
{: .notice}


Tradução por Cleiton Gomes em 02/04/2009, artigo original:
http://www.woodmann.com/krobar/beginner/168.htm


.EOF
