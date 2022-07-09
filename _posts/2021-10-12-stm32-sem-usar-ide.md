---
layout: post
title: Ferramentas livres para desenvolvimento embarcado
excerpt: Passo a passo detalhado de como instalar ferramentas livres para desenvolvimento Cortex-M 
tags: [make, openocd, gcc, gnu, choco]
comments: true
---

{% include toc.html %}

Veja abaixo o passo á passo necessário para você baixar as ferramentas necessárias para
desenvolvimento em controladores Cortex-M. Nesse artigo cito informações especificas
sobre a STM, mas o manual é válido para qualquer fornecedor.

# Arm Embedded Tool Chain

Contém conjunto de ferramentas necessárias para validação, teste e compilação de programas
desenvolvidos para processadores Cortext de 32 bits. (Os modelos Cortex-M, Cortex-R e A).

## GNU/Linux 

Baixe a última versão disponível no [site oficial.](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads)
Salve o arquivo preferencialmente no diretório `/usr/share`.

Feito isso descompacte os arquivos e exclua o arquivo zipado:

```
sudo tar xjf gcc-arm-none-eabi-your-version.bz2 -C /usr/share/
rm gcc-arm-none-eabi-your-version.bz2
```

Apos isso você deverá criar links simbólicos para que esses programas fiquem disponíveis através do
sistema inteiro:

```
sudo ln -s /usr/share/gcc-arm-none-eabi-your-version/bin/* /usr/bin/
```

Pode ser que seja necessário também instalar ferramentas adicionais como `libncurses` e `libtinfo`.

```
arm-none-eabi-gcc --version
arm-none-eabi-g++ --version
arm-none-eabi-gdb --version
arm-none-eabi-size --version
```

Para verificar a instalação abra uma nova janela do terminal e digite:

```
arm-none-eabi-gcc --version
arm-none-eabi-g++ --version
arm-none-eabi-gdb --version
arm-none-eabi-size --version
```

## Windows

Baixe o instalar do [site oficial.](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads)
E execute e siga as instruções do Wizard.

Para verificar a instalação abra uma janela CMD (Tecla Windows + R, digite CMD) e digite:

```
arm-none-eabi-gcc --version
arm-none-eabi-g++ --version
arm-none-eabi-gdb --version
arm-none-eabi-size --version
```

## Mac

A forma mais fácil de instalar essa e as outras ferramentas será utilizando a ferramenta `Brew`, 
se você ainda não tem, você poderá instalar executando o comando a baixo:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Após sua instalação você precisará apenas executar o comando a baixo:

```
brew install --cask gcc-arm-embedded
```

Para verificar a instalação abra uma nova janela do terminal e digite:

```
arm-none-eabi-gcc --version
arm-none-eabi-g++ --version
arm-none-eabi-gdb --version
arm-none-eabi-size --version
```

# OpenOCD 

É ferramenta que faz intermediação de comunicação entre o computador e o controlador, é usado
principalmente como ferramenta para ajudar na depuração, mas também pode ser usado como gravador.
Funciona como um servidor GDB, responsável por receber as solicitações feitas por clientes GDB e 
também como um servidor telnet.

## GNU/Linux

Para as versões mais atuais do OpenOCD você precisará `libftdi` (mesmo que você possua um conector
ST-Link).

A forma mais fácil de instalar é usando seu gerenciador de pacotes.

No Debian por exemplo, você precisa executar:
```
sudo apt install openocd
```

Verifique qual é o seu gerenciador de pacotes, provavelmente não será muito diferente disso.

Para verificar se foi instalado corretamente, digite:

```
openocd --version
```

A resposta deve ser algo como:

```
Open On-Chip Debugger 0.11.0
Licensed under GNU GPL v2
For bug reports, read
	http://openocd.org/doc/doxygen/bugs.html
```

## Windows

O jeito mais fácil é através da ferramenta [chocolatey](https://chocolatey.org/install) um 
gerenciador de pacotes especifico para Windows.
Baixe o choco através desse link, faça a sua instalação depois execute o comando no prompt de
comando:

```
choco install openocd 
```

Você pode baixar também a versão mais recente diretamente do repositório através [deste link](https://github.com/openocd-org/openocd/releases/).
O arquivo se encontra no final da página e terá nome parecido com `openocd-v0.x.x-i686-w64-mingw32.tar.gz`
onde `x.x` será o número da última versão disponível.

Para verificar se foi instalado corretamente, abra o prompt e digite:

```
openocd --version
```

A resposta deve ser algo como:

```
Open On-Chip Debugger 0.11.0
Licensed under GNU GPL v2
For bug reports, read
	http://openocd.org/doc/doxygen/bugs.html
```


## Mac

Para o Mac como sempre, a forma mais fácil de instalar será utilizando a ferramenta `Brew`, pelo
comando:

```
brew install open-ocd
```

Para verificar se foi instalado corretamente, digite:

```
openocd --version
```

A resposta deve ser algo como:

```
Open On-Chip Debugger 0.11.0
Licensed under GNU GPL v2
For bug reports, read
	http://openocd.org/doc/doxygen/bugs.html
```


# GNU Make

Ferramenta utilizada para ajudar na execução de tarefas repetitivas, ele também determina quais
parte do programa precisam ser recompiladas e executa as tarefas relacionadas automaticamente.

## Linux e Mac

Ele já vem instalado por padrão nesses sistemas. 

## Windows 

O jeito mais fácil é através da ferramenta [chocolatey](https://chocolatey.org/install) um 
gerenciador de pacotes especifico para Windows.
Baixe o choco através desse link, faça a sua instalação depois execute o comando no prompt de
comando:

```
choco install make
```

Você também pode instalar direto através do [link](http://gnuwin32.sourceforge.net/install.html),
mas atenção, diferente do `choco`, você terá que instalar as dependências e fazer a configuração
manualmente.

# CMSIS

A melhor forma de você obter a versão mais recente é direto através do repositório do github, pelo
endereço https://github.com/STMicroelectronics/STM32CubeF1/tags. Você pode baixar os arquivos
clicando diretamente no link "zip", que fica ao lado da data da última publicação. Se você quiser,
pode `clonar` a última versão direto da `master` ou `main` do projeto.

Se você estiver seguindo nosso curso através do Youtube, execute o código abaixo no diretório 
inicial do seu projeto:

{% highlight bash %}
git clone --depth 1 ssh@github.com:STMicroelectronics/STM32CubeF1.git stm32 && rm -rf $_/.git
{% endhighlight %}

Ele é reponsável em baixar os arquivos mais atuais dentro de um diretório chamado `stm32` onde for
executado.

## Conclusão

Apenas com as ferramentas acima, você será capaz de desenvolver para qualquer processador da linha
Cortex-M, A e R em todas as plataformas e sistemas operacionais. E como você pode ter notado, elas
evoluíram muito e sua instalação esta cada vez mais fácil. Agora é só você baixar e começar a
programar.

