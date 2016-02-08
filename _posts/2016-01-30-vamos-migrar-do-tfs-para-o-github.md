---
layout: post
title: Migrando do TFVC para o Git
excerpt: Relato de como migrar do TFVC para o GIT na visão de um programador .NET
modified: 2016-01-30
tags: [github, tutorial, visual-studio]
comments: true
---
{% include _toc.html %}

Quase 10 anos depois vamos começar a usar o GIT. Acompanhe nossa história e veja um pequeno manual para você aproveitar o que já sabe sobre o TFVC para aprender a usar o GIT no Visual Studio. Neste artigos abordo apenas sobre versionamento de arquivos, as ferramentas colaborativas, checkin police, issue tracker e etc terão sua vez assim que formos nos adaptando com o Github.

##Nossa pequena história

Lembro como se fosse ontem a animação ao configurar o cliente do TFVC, naquela época estavamos migrando do então famigerado [Microsoft SourceSafe](https://msdn.microsoft.com/pt-br/library/3h0544kx%28v%3Dvs.80%29.aspx), para esse que então era promeça de dias melhores no ambiente de trabalho.

O Team Foundation Version Control era lindo, vinha com a promessa de ser a ferramenta ideal para o versionamento de arquivos para projetos maiores, robusto e totalmente configurável com seu maravilhoso `diff` e `merging` que realmente **funcionavam** fizeram sucesso (e ainda fazem) dentro da nossa equipe. 

Davamos a deus as anotações `\\DONEBY:` e as horas perdias com `mergins` praticamente manuais. Os ventos da mudança assobiavam no nosso escritório. 

Quase 10 anos depois, novamente movidos pela necessidade, estamos migrando, desta vez do, amado e companheiro TFVC, para o GIT. Mas por quê? Parece bobo, mas a principal razão é de ele não ser rápido o suficiente.

Embora não exista um limite para a quantidade de itens que você possa ter em um mesmo `workspace`, quando este número cresce, a performance do Visual Studio reduz drasticamente, isso é indescutível. Claro, existem [formas de reduzir este efeito](http://stackoverflow.com/questions/28022712/visual-studio-2013-tfs-slow), mas o fato é que há um momento que não adianta mais, e assim somos obrigados a buscar novas opções.

Agora o GIT, que além de ser um exelente controlador de versões, robusto, mantido por uma comunidade enorme, tem como principal promessa ser [extremamente rápido](https://git-scm.com/about/small-and-fast).

E como tem sido! Nossos testes iniciais mostraram que usá-lo com o Visual Studio tornará nosso trabalho incontáveis minutos mais rápidos. Exemplo claro fica quando decidimos mudar de uma `branch` para outra, processo que no TFS levava em média até um minuto completo, com o GIT acontece quase que instantaneamente[^1]. 

Provando ser uma escolha natural para quem se acostumou com um produto que é fácil de usar e funciona.

## Passos iniciais com o GIT para um Desenvolvedor TFVC

Git é muito mais simples do que o TFVC e a primeira coisa que você perceberá ao a usá-lo 
será sua terminologia, alguns conceitos um pouco diferentes e falta e/ou inclusão de recursos, que acabam fazendo com que tudo pareça confuso, mas fique tranquilo, abaixo listo as principais diferenças entre os dois.

### Adeus workspaces

Um recurso obrigatório e muito importante no TFVC **não existe** no GIT. Para você começar a trabalhar com o GIT não é preciso que você crie workspaces, configurando diretórios, local de arquivos, permissões e etc. Apenas escolha um diretório no seu computador `clone` o repositório que você deseja trabalhar e mãos a obra.

### Nada de Check in ou Check out's

Git não possui conceito de `lock` de arquivos, você pode editar e 'submeter' qualquer arquivo a qualquer momento para o repositório central em qualquer `branch`[^2], mas atenção `checkout` no GIT tem [outro significado](https://git-scm.com/docs/git-checkout).

Isso tem um efeito interessante, para evitar dores de cabeças futuras desde o início as equipes se veêm na obrigação de concordarem entre sim e trabalharem seguindo determinado padrão para garantir que não hajam problemas de conflitos. 

Dentre eles o mais conhecido e utilizado é o [git-flow](http://nvie.com/posts/a-successful-git-branching-model/) que basicamente usa `branchs` para organizar as atualizações sobre a base de código. 

### Repositórios locais e no servidor

Assim como o TFVC possui repositórios locais e no servidor o GIT também, mas conceitualmente diferentes. 

No TFVC quando você usa a opção de repositório local, a cada operação (checkin, checkout, shelve etc) o TFVC verifica *o conteúdo de cada arquivo* no workspace com os arquivos que estão no repositório do servidor, já para repositórios no servidor a verificação é apenas no byte informativo de readonly.

Já no GIT é diferente, você sempre trabalhará no seu repositório local enviando apenas para o servidor quando o trabalho estiver prontos.

### Commits, fetch, pull, push e sync

No TFVC existem basicamente duas formas de você trabalhar com arquivos:

 - `check out` que basicamente diz ao TFVC que você deseja editar o arquivo e o `check in` onde você envia as alterações feitas para o repositório central visível a todos.
 - `shelve` and `unshelve` análogo ao anterior, porém as alterações ficam apenas disponíveis para você.
   
Já no GIT o fluxo de trabalho é diferente, primeiro é preciso que você entenda que o seus arquivos sempre estarão em um de quatro estados diferentes:

 - `untracked` como nome já diz, são arquivos em que o git não está acompanhando. Arquivos que não estavam presentes no último commit e ainda não foram `staged`.
 - `unmodified` arquivos que constavam no último commit e não foram modificados
 - `modified` arquivos que constavam no último commit e foram modificados mas ainda não foram stageds.
 - `staged` arquivos que estão prontos para fazer parte do próximo commit

#### Fluxo de estados dos arquivos
![Fluxo de estados dos arquivos](/images/lifecycle.png)
<small>De onde e para onde um arquivo pode 'pular' durante seu ciclo, fonte: https://git-scm.com/</small>

#### commit

Uma boa analogia seria compará-los com o recurso de restauração do windows, onde 'pontos de restauração' são gravados antes de alterações importantes sejam feitas no sistema, permitindo que, caso as coisas deêm errado, você possa retornar a uma versão segura. 

Os commits no GIT são uma ferramenta importante, que permitem que os desenvolvedores além de salvarem seu progresso demarcando pontos seguros, podem servir como uma exelente forma na [automatização de documetanção](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit). 

Não se esqueça que **apenas os arquivos stageds** são gravados pelo commit.


[^1]: Computador com 16GB de RAM, SSD, processador I7 e conexão com a internet de 10MB em fibra ótica dedicada, usando os serviços do GitHub e Visual Studio Team Services.

[^2]: Se você possui permissão de escrita é claro.
[^3]: shelve se refere a opção de você enviar alterações que só podem ser vistas por você no repositório central.