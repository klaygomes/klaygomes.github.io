---
layout: post
title: "Entendendo o Coração do STM32: O Sistema de Clock"
excerpt: O sistema de clock do STM32 é seu coração. Ele usa fontes como HSI/HSE e o PLL para gerar o SYSCLK de 72 MHz, ditando o ritmo de todo o MCU.
tags: [stm32, hsi, hse, pll, sysclk]
comments: true
---

{% include toc.html %}

O sistema de clock é como o pulso do seu microcontrolador (MCU), o coração que dita o ritmo de tudo. No caso do STM32, que é um chip bem complexo e cheio de periféricos, entender como esse "coração" funciona é fundamental.

Pensa comigo: nem tudo no seu projeto precisa rodar na velocidade máxima. Um simples LED piscando não precisa da mesma velocidade que um processamento de dados via USB. Além disso, quanto mais rápido o clock, mais energia o chip consome e mais sensível ele fica a interferências.

## As Fontes de Clock do STM32
O STM32 tem cinco fontes de clock, que são como as "usinas de energia" que geram o ritmo para o chip.

> **Nota:** O diagrama a seguir ilustra a árvore de clocks do STM32. Ele mostra como as fontes de clock (HSI, HSE, LSI, LSE) são selecionadas, multiplicadas pelo PLL e distribuídas para os diferentes barramentos e periféricos.

![Diagrama de clock do STM32, como a Figura 11 do manual de referência RM0008](/images/stm32-clock-tree-RM0008.png)

Olhando o diagrama, a gente pode dividir essas fontes em duas categorias:

- **Velocidade**: Fontes de alta velocidade (para performance) e de baixa velocidade (para economia de energia).
- **Origem**: Fontes internas (já vêm no chip) e externas (você precisa conectar um cristal de quartzo).

### Vamos conhecer cada uma delas:

- **`HSI` (High Speed Internal)**: Um oscilador interno de 8 MHz. É prático porque já está lá, pronto para usar, mas não é o mais preciso.

- **`HSE` (High Speed External)**: O oscilador externo de alta velocidade (geralmente de 4 a 16 MHz). Você conecta um cristal do lado de fora, e ele te dá um sinal de clock bem mais estável e preciso que o `HSI`. É o mais recomendado para a maioria das aplicações sérias.

- **`LSI` (Low Speed Internal)**: Um "reloginho" interno de 40 kHz. Ele consome pouca energia e serve para alimentar periféricos que não precisam de velocidade, como o Watchdog (`IWDG`), que "vigia" o sistema pra ver se ele não travou.

- **`LSE` (Low Speed External)**: Outro relógio de baixa velocidade, mas este é externo e super preciso, com 32.768 kHz. É a escolha ideal para o Relógio de Tempo Real (`RTC`), que precisa marcar as horas e datas corretamente, mesmo que o resto do chip esteja "dormindo".

- **`PLL` (Phase-Locked Loop)**: Esse cara não é uma fonte original, mas sim um multiplicador. Ele pega o sinal do `HSI` ou do `HSE` e o multiplica para gerar uma frequência bem mais alta, podendo chegar a 72 MHz. É o truque para fazer o STM32 rodar a toda velocidade.

## O Caminho do Clock: Do Início ao Fim
O diagrama que vimos antes mostra todo o fluxo do clock. Vamos seguir o caminho:

1.  **Seleção do Clock Principal (`SYSCLK`)**: As fontes de alta velocidade (`HSI`, `HSE` e o `PLL`) chegam a uma chave seletora. Aqui, o sistema escolhe qual delas será o `SYSCLK`, o clock principal que vai alimentar quase tudo no chip. Na maioria das vezes, a gente configura para usar o `PLL` a 72 MHz.

2.  **Distribuição para os Barramentos**: Depois de escolhido, o `SYSCLK` é distribuído. Ele passa por divisores de frequência (prescalers) para gerar clocks mais lentos para diferentes partes do chip:

    - **`HCLK`**: É o clock do barramento `AHB`, onde estão a CPU, a memória e o `DMA`. Geralmente, ele roda na mesma velocidade do `SYSCLK` (72 MHz).
    - **`PCLK1`**: É o clock do barramento `APB1`, onde ficam os periféricos mais lentos (até 36 MHz), como `I2C`, `USARTs` e o `CAN`.
    - **`PCLK2`**: Clock do barramento `APB2`, que alimenta os periféricos mais rápidos (até 72 MHz), como a `GPIO`, o `SPI1` e o `ADC`.

### Clocks Especiais:

- **`USB`**: O periférico USB precisa de um clock exato de 48 MHz. Esse sinal vem direto do `PLL`, passando por um divisor especial.
- **`RTC`**: O relógio de tempo real tem sua própria chave seletora, podendo usar o `LSE`, o `LSI` ou até o `HSE` dividido por 128.
- **`MCO` (Microcontroller Clock Output)**: Uma mão na roda para debugar! Você pode configurar um pino (o `PA8`) para "cuspir" um dos clocks internos. Assim, você pode medi-lo com um osciloscópio e ter certeza de que tudo está configurado certo.

## Configurando Tudo no Código (`SystemInit`)
Toda essa configuração é feita no início da execução do seu código, dentro de uma função chamada `SystemInit`. Por padrão, os projetos do STM32 já vêm com essa função configurada para o seguinte cenário:

1.  Habilitar o `HSE` (assumindo um cristal externo de 8 MHz).
2.  Configurar o `PLL` para multiplicar o `HSE` por 9 (8 MHz * 9 = 72 MHz).
3.  Selecionar o `PLL` como a fonte do `SYSCLK`.
4.  Configurar os divisores dos barramentos `AHB`, `APB1` e `APB2`.

O resultado final é o que a gente vê na maioria dos projetos:

| Nome do Clock                  | Velocidade Padrão |
| ------------------------------ | ----------------- |
| `SYSCLK` (Clock do Sistema)      | 72 MHz            |
| `HCLK` (Clock do Barramento AHB) | 72 MHz            |
| `PCLK1` (Clock do Barramento APB1)| 36 MHz            |
| `PCLK2` (Clock do Barramento APB2)| 72 MHz            |
| Clock do `PLL`                   | 72 MHz            |

E o mais importante de tudo: **nenhum periférico funciona se o seu clock não estiver habilitado!** Sempre que for usar um timer, uma porta serial ou qualquer outra coisa, a primeira coisa a fazer no código é ligar o "relógio" dele.