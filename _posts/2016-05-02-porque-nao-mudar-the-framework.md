---
layout: post
title: Por que continuar com stack .NET da Microsoft
excerpt: Por que decidi não mudar de stack quando surgiu oportunidade dentro da empresa.
modified: 2016-05-05
tags: [net, governanca]
comments: true
---
{% include _toc.html %}

Esse ano, tivemos oportunidade de conhecer e decidir se seria ou não viável migrarmos de tecnologia Microsoft para ambiente Linux utilizando Python. Resolvi escrever este artigo como resumo de nossas reuniões e o porquê da minha decisão em continuar utilizando a stack da Microsoft.

## Motivações técnicas.

**Conceitos avançados sobre aplicações escaláveis são abstraídas dos desenvolvedores**. No framework .NET temos suporte nativo a multithreading e paralelismo através de sintaxe de açúcar (async e await). Não é necessário que os programadores tenham conhecimento sobre essas técnicas mais avançadas para que façam uso delas. Já no Python, é necessário que a arquitetura e infraestrutura do projeto sejam escritas desde o início com isso em mente.

C# por ser uma linguagem compilada em tempo de execução, por natureza é **mais rápida do que linguagens interpretadas**. Em comparação com o Python pode ser de até 50.000%

**O que pode tornar aplicação mais difícil de manter**, já que para contornar este problema, Python permite que ações que necessitem mais do uso de CPU sejam escritas em C++, demandando um profissional que saiba sobre essa linguagem e as implicações em sua interoperabilidade.

**É mais fácil manter aplicações com linguagens tipadas**. Com uma linguagem altamente tipada, embora a produtividade durante desenvolvimento de novas funcionalidades possa ficar comprometida em detrimento a linguagens dinâmicas, este tempo é compensado durante a manutenção.  Boa parte dos custos com desenvolvimento ocorrem durante a manutenção, linguagens dinâmicas necessitam que os programadores sejam mais disciplinados e tenham bom conhecimento sobre ambiente em que estão desenvolvendo para que produzam aplicações mais robustas e de manutenção mais fácil.

**Compilação como ferramenta de qualidade de código**. Uma das vantagens das linguagens interpretadas sobre as compiladas é o custo da compilação durante o workflow de desenvolvimento. Porém ela pode se tornar uma desvantagem, já que, erros como de sintaxe, chamadas a propriedades ou métodos inexistentes apenas são pegos durante a execução do código, exigindo um esforço maior de cobertura de testes o que no final aumenta o custo de desenvolvimento.

**Maturidade da equipe**. Hoje nossa equipe possui ótimos profissionais com excelente background na arquitetura Microsoft, com migração, seria necessário adaptar e aguardar a curva de aprendizado. Lembre-se sua equipe é tão boa quanto seu pior programador.

## Infraestrutura Cloud

Tanto as soluções da Google como da Microsoft são excelentes, altamente escaláveis, baratas e seguras. Soluções da Microsoft levam vantagens de preço para algumas soluções, exemplo: Para uma máquina virtual do tipo micro, valor mínimo cobrado na Google Cloud fica em torno de 130 dólares(450 reais), já na plataforma da Microsoft 17 dólares e localização de seus Data Centers, não há servidores do Google no Brasil ainda. Porém, é possível que acordos comerciais ou detalhes de implementação compensem valores pagos. No mercado atual não há vantagens ou desvantagens que determinem a escolha de uma por outra, todas são integradas com seus respectivos ambientes de desenvolvimento e ambas permitem publicação de aplicações inteiras através de um click.

## Resultado

Novo projeto começa em Julho, vamos fazer em .NET e em C#. A versão escolhida para desenvolvimento será 4.6.1, MVC 5 / WebAPI 2 com o uso do SignalR.

Neste momento nossa equipe e eu estamos planejando a arquitetura, desenvolvendo infraestrutura e validando em cima de Sketchs com caso de usos complexos. Próximos artigos atualizarei com detalhes de como está ficando.
