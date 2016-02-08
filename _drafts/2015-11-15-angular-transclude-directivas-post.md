---
layout: post
title: Transclude de um jeito que até você vai entender
excerpt: "Transclude é aquele tipo de palavrão que a gente demora para enteder, mas só até agora."
modified: 2013-05-31
tags: [intro, beginner, jekyll, tutorial]
comments: true
image:
  feature: sample-image-5.jpg
  credit: WeGraphics
  creditlink: http://wegraphics.net/downloads/free-ultimate-blurred-background-pack/
---

{% include _toc.html %}

Tá ai, um assunto que deixa muita gente perdida, mesmo o material sobre diretivas ser bem diverso e ter muita gente falando a respeito, é bastante comum encontrar desenvolvedores que ainda não entendem bem como transclude no angular funciona.

Este texto não tem a intenção de ensinar você a usar transclude, [a documentação do Angular é suficiente para isso](https://docs.angularjs.org/guide/directive#creating-a-directive-that-wraps-other-elements), mas sim a como entender parte deste processo e ajudar na descoberta de bugs.

## Herança por cadeia de protótipos 

Antes de começar, acho que vale a pena uma revisão (ou introdução) sobre herança em javascript, já que por si só é bastante confusa para maior parte dos desenvolvedores com experiência em outras linguagens de alto nível (Java, C++, C#, [insira sua preferida aqui]) e que pode atrapalhar no entendimento.

Javascript sendo uma linguagem dinâmica permite que todas as suas instancias de objetos hajam como se fossem "grandes caixas" que aceitam que qualquer coisa sejam jogada nelas, até mesmo outras caixas!

Porém mesmo com toda essa aparente baderna há um pouco de organização, já que cada "caixa" possui uma característica especial, uma propriedade chamada \_\_proto\_\_, que nada mais é do que uma referencia que aponta para a caixa usada como "modelo", sendo consultada sempre que a "cópia" não possuir a **propriedade** que o compilador estiver atrás, caso ele não encontrei ele procurará no \_\_proto\_\_ do modelo e assim por diante até encontrar ou \_\_proto\_\_ seja igual a <code>null</code>.

Confuso? Parece mas não é. Veja este exemplo:

{% highlight js linenos %}
  var caixaCinza = { 
    cor: 'cinza', 
    tamanho:'15x15x15'
  }; //Instancia de objeto literal (__proto__ é igual a null); 
  
  var caixaAzul =  Object.create(caixaCinza); // *dica* Nunca altere  __proto__ diretamente (ex.: caixaAzul.__proto__ = caixaCinza).
  caixaAzul.cor = 'azul';// <-- Não estou sobrescrevendo, mas sim definindo propriedade cor a este objeto
 
  console.log('caixaCinza', caixaCinza.cor); // <<-- imprime cinza
  console.log('caixaCinza', caixaCinza.tamanho); // <<- imprime 15x15x15
  
  console.log('caixaAzul', caixaAzul.cor); // <<-- imprime azul (propriedade existe no objeto)
  console.log('caixaAzul', caixaAzul.tamanho); // <<-- imprime 15x15x15 (obtido a partir da cadeia de prototype);
  
{% endhighlight %}

Reparou que mesmo eu não tendo definido propriedade "tamanho" para o objeto <code>caixaAzul</code> ao consultar ele me retornou 15x15x15? Isso acontece por que o interpretador encontrou esta propriedade buscando a partir da cadeia (no nosso exemplo o primeiro \_\_proto__ porém podia está N níveis).

O maior problema ocorre(ou melhor as dúvidas) por que, enquanto o objeto 'filho' não possuir aquela propriedade, qualquer alteração feita na propriedade do objeto 'pai' é refletida no filho, e caso alterada no filho esse "vínculo" é "quebrado" (note as aspas já que se você excluir a propriedade o suposto vínculo volta a funcionar);

{% highlight js linenos %}
  caixaCinza.tamanho = "10x10x10";
  console.log('caixaCinza', caixaCinza.tamanho); // <<- imprime 10x10x10
  console.log('caixaAzul', caixaAzul.tamanho); // <<- imprime 10x10x10 (peguei da referencia)
{% endhighlight %}
 
 Mas se: 
 
 {% highlight js linenos %}
  caixaAzul.tamanho = "5x5x5";
  console.log('caixaCinza', caixaCinza.tamanho); // <<- imprime 10x10x10
  console.log('caixaAzul', caixaAzul.tamanho); // <<- imprime 5x5x5 (peguei do proprio objeto)
{% endhighlight %}

**Preste atenção** a partir de agora se você alterar caixaCinza.tamanho este valor não será refletido na caixaAzul, já que o interpretador irá encontrar esta propriedade no próprio objeto caixaAzul
{: .notice}

### Do lulismo ao técnico

Deixando as analogias de lado e falando tecnicamente, javascript é uma linguagem de programação orientada a objetos altamente abstrata e como tal lida com objetos, claro que ela também possui valores primitivos, mas estes também podem ser convertidos em objetos quando necessário.

Um objeto é uma coleção de propriedades que possui uma propriedade de referencia de protótipo ou \[\[prototype]], esta que pode ser outro objeto ou <code>null</code>. Este comportamento ou herança por cadeia de protótipos, é tido por alguns como ponto fraco do javascript, porém ele é bem mais poderoso que o modelo “clássico” de herança e ao contrário do que se parece, fácil de ser compreendido.

Primeiro entenda que cada vez que você atribui um valor a uma propriedade(existente ou não) para um objeto, o interpretador internamente cria uma propriedade única a este objeto que passa a ser proprietário exclusivo dela.

Segundo, como o interpretador busca os valores destas propriedades(a raiz de todo mal). 


# Transclude
Talvez você nem saiba, mas este comportamento está bem presente no seu dia a dia, mesmo que você não esteja usando outra framework, o transclude é bastante usado entre as diretivas do core do angular, quem nunca usou ng-if por exemplo?

Desconhecer o seu funcionamento pode trazer muita frustração e dor de cabeça para o desenvolvedor e ser um prato cheio para os bugs ou comportamentos misteriosos. 

## Mas o que é? 

Transclusão, embora esta palavra pareça um palavrão, nada mais é do que o processo de inserir conteúdo de um documento dentro de outro por referencia,já na documentação do Angular é dito que "A opção de transclude muda a forma como os scopes são combinados. Faz com que o conteúdo da diretiva tenha acesso ao escopo que está fora dela, ao invés do seu próprio." Porém ela não explica como isso é feito pela API e nem qual é o seu impacto no scopo interno da diretiva.


# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

### Body text

Lorem ipsum dolor sit amet, test link adipiscing elit. **This is strong**. Nullam dignissim convallis est. Quisque aliquam.

![Smithsonian Image]({{ site.url }}/images/3953273590_704e3899d5_m.jpg)
{: .image-pull-right}

*This is emphasized*. Donec faucibus. Nunc iaculis suscipit dui. 53 = 125. Water is H2O. Nam sit amet sem. Aliquam libero nisi, imperdiet at, tincidunt nec, gravida vehicula, nisl. The New York Times (That’s a citation). Underline.Maecenas ornare tortor. Donec sed tellus eget sapien fringilla nonummy. Mauris a ante. Suspendisse quam sem, consequat at, commodo vitae, feugiat in, nunc. Morbi imperdiet augue quis tellus.

HTML and CSS are our tools. Mauris a ante. Suspendisse quam sem, consequat at, commodo vitae, feugiat in, nunc. Morbi imperdiet augue quis tellus. Praesent mattis, massa quis luctus fermentum, turpis mi volutpat justo, eu volutpat enim diam eget metus.

### Blockquotes

> Lorem ipsum dolor sit amet, test link adipiscing elit. Nullam dignissim convallis est. Quisque aliquam.

## List Types

### Ordered Lists

1. Item one
   1. sub item one
   2. sub item two
   3. sub item three
2. Item two

### Unordered Lists

* Item one
* Item two
* Item three

## Tables

| Header1 | Header2 | Header3 |
|:--------|:-------:|--------:|
| cell1   | cell2   | cell3   |
| cell4   | cell5   | cell6   |
|----
| cell1   | cell2   | cell3   |
| cell4   | cell5   | cell6   |
|=====
| Foot1   | Foot2   | Foot3
{: rules="groups"}

## Code Snippets

{% highlight css %}
#container {
  float: left;
  margin: 0 -240px 0 0;
  width: 100%;
}
{% endhighlight %}

## Buttons

Make any link standout more when applying the `.btn` class.

{% highlight html %}
<a href="#" class="btn btn-success">Success Button</a>
{% endhighlight %}

<div markdown="0"><a href="#" class="btn">Primary Button</a></div>
<div markdown="0"><a href="#" class="btn btn-success">Success Button</a></div>
<div markdown="0"><a href="#" class="btn btn-warning">Warning Button</a></div>
<div markdown="0"><a href="#" class="btn btn-danger">Danger Button</a></div>
<div markdown="0"><a href="#" class="btn btn-info">Info Button</a></div>

## Notices

**Watch out!** You can also add notices by appending `{: .notice}` to a paragraph.
{: .notice}
