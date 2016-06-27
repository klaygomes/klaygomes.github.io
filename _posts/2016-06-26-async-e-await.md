---
layout: post
title: Introdução a async e await
excerpt: Pequena introdução do uso do async e await no .NET (Artigo traduzido)
modified: 2016-06-26
tags: [net, CSharp, async, curiosidades]
comments: true
---
{% include _toc.html %}

> Este artigo é uma tradução e adaptação autorizada do original "[Async and Await](http://blog.stephencleary.com/2012/02/async-and-await.html)", de autoria do MVP Stephen Cleary. 

## Introduzindo as palavras-chaves
Irei usar alguns conceitos que serão explicados posteriormente, por isso, acalme-se e concentre-se nesta primeira parte. 

Métodos assíncronos tem a seguinte aparência:

{% highlight csharp linenos %}
public async Task DoSomethingAsync()
{
  // No mundo real, nós enventualmente fariamos alguma coisa…
  // Para este exemplo, vou apenas esperar de forma assícrona por 100ms.
  await Task.Delay(100);
}
{% endhighlight %}

A palavra-chave **async** habilita a palavra-chave **await** naquele método e modifica como o resultado é tratado. E isso é tudo que _async_ faz! Não faz com que ele rode em um _thread pool_ ou algum tipo de magia negra, a palavra-chave _async_ apenas habilita a palavra-chave _await_(e gerencia o retorno dos métodos).

O início de um método async é executado como qualquer outro, ou seja, roda de forma **síncrona** até que ele alcance o primeiro _await_ (ou lance uma exceção).

A palavra-chave **await** é onde as coisas se tornam assíncronas. _await_ é como um **operador unário**: Ele recebe um argumento simples, um _awaitable_ (uma operação assíncrona) e o examina para ver se ele já completou; se ele estiver completado, o método apenas continua(de forma síncrona) como um método normal, mas se o _await_ notar que o _awaitable_ ainda não completou, ele atua de forma assíncrona, pedindo para o _awaitable_ rodar o restante do método até que se complete e **devolve à execução para quem chamou o método _async_**.

Mais tarde, quando o _awaitable_ completar, ele executará o restante do método _async_. Se você usar a palavra-chave _await_ em um _awaitable_ padrão(tal como Task), o restante do método _async_ irá executar no **contexto** que foi capturado antes do _await_ ter sido retornado.

Gosto de pensar no _await_ como _**a**synchronous **wait**_(espera assíncrona). Isso quer dizer que o método _async_ **pausa** até que o _awaitable_ complete (então ele espera), mas a _thread_ atual não é **bloqueada** (por isso ele é assíncrono);

## Awaitables

Como eu mencionei _await_ recebe um argumento – um _awaitable_ – que é uma operação assíncrona. Existem dois tipos disponíveis de _awaitables_ no Framework .NET: _Task&lt;T&gt;_ e _Task_.

Há também outros _awaitable_: métodos especiais tais como _Task.Yield_ que retornam _awaitables_ que não são Tasks e o *Runtime WinRT* que possui tem um _awaitable_ não gerenciado. Você também pode criar o seu próprio (geralmente por razões de performance) ou usar métodos de extensão para fazer um tipo que não é _awaitable_ se tornar um. Isso é tudo que direi sobre como criar os seus próprios _awaitables_, já que em todo o tempo que eu usei _async/await_ poucas vezes tive que escrever um para mim. Se você quiser saber mais sobre como escrever um personalizado, veja o [blog do time de parallel](http://blogs.msdn.com/b/pfxteam/) e o [blog do Jon Skeet](https://codeblog.jonskeet.uk/category/async/).

Um ponto importante sobre os _awaitable_ é: **O tipo que é _awaitable_ e não o método**. Em outras palavras, você pode usar o _await_ em um resultado de um método _async_ que retorna uma _Task_... Porque o método retorna uma Task, *não* por que ele é _async_. Logo, você também pode usar o _await_ no resultado de um método não assíncrono que retorna uma Task.

{% highlight csharp linenos %}
public async Task NewStuffAsync()
{
  // Use await e se divirta com a coisa nova
  await ...
}

public Task MyOldTaskParallelLibraryCode()
{
  // Note que este método não é async então não podemos usar await aqui
  ...
}

public async Task ComposeAsync()
{
  // Nós podemos chamar o await em Tasks, não importando de onde elas vieram.      await NewStuffAsync();
  await MyOldTaskParallelLibraryCode();
}
{% endhighlight %}

**Dica**: Se você tem um método assíncrono muito simples, você pode escreve-lo sem usar a palavra-chave _await_ (ex. usando Task.FromResult). Se você puder escrever sem, **faça** e também remova a palavra chave _async_. Um método não _async_ que retorna um _Task.FromResult_ é mais eficiente que um método _async_ que retorna um valor. 
{: .notice}

## Tipos de retorno

Métodos _async_ podem retornar _Task&lt;T&gt;_, _Task_ e _void_. Na maioria dos casos, você deverá retornar um _Task&lt;T&gt;_ ou _Task_ e **void** apenas quando **realmente** for necessário.

Por que retornar _Task&lt;T&gt;_ ou _Task_? Por que eles são _awaitables_ e _void_ **não**.  Se você tem um método assíncrono que retorna uma _Task_, você poderá passar o resultado para um _await_, já com o _void_, você não terá nada o que passar, em resumo, você só deve usar _void_ quando estiver escrevendo _event handlers_ assíncronos. 

**Dica**: Você também pode usar _async void_ para outros tipos de ações, ex. um método único do tipo _static async void MainAsync()_ para aplicações de console. Porém, este uso do _async void_ tem seus próprios problemas; veja [Async Console Programs](http://blog.stephencleary.com/2012/02/async-console-programs.html). O caso de uso principal para métodos _async void_ é para _event handlers_ onde a conclusão/retorno do método não é importante.
{: .notice}

## Retornando valores

Métodos assíncronos retornando _Task_ ou _void_ não possuem um valor de retorno, já os métodos que retornam _Task&lt;T&gt;_ deve retornar um valor do tipo _T_.

{% highlight csharp linenos %}
public async Task<int> CalculateAnswer()
{
  await Task.Delay(100); // (Probably should be longer...)

  // Retorna um "int" não uma "Task<int>"
  return 42;
}
{% endhighlight %}

É um pouco estranho de se acostumar, mas há [boas razões](http://blog.stephencleary.com/2011/09/async-ctp-why-do-keywords-work-that-way.html) por trás deste design.

## Contexto

Em nossa introdução, eu mencionei que quando você usa a palavra-chave await em um tipo awaitable padrão, ele irá capturar o “contexto” e depois aplicá-lo ao restante do método, mas o que exatamente é este “Contexto”?

### Uma resposta simples:

* Se você está na _thread de UI_, então o contexto será o de UI.
* Se você estiver espondendo a uma requisição ASP.NET, então ele será o contexto da requisição.
* Caso contrário, geralmente será o contexto do _thread pool_.

### Reposta complexa:

* Se o _SynchronizationContext.Current_ não for _null_, então ele será o atual _SynchronizationContext_. (Os contexto de UI e requisição do asp.net são _SynchronizationContexts_)
* Caso contrário, será o TaskScheduler atual (TaskScheduler.Default é o contexto do thread pool).
O que isso quer dizer no mundo real?Uma coisa,  a captura e recuperação e dos contextos de UI/ASP.NET são feitos de forma transparente.

{% highlight csharp linenos %}
// Exemplo de WinForms (Funciona do mesmo jeito para WPF).
private async void DownloadFileButton_Click(object sender, EventArgs e)
{
  // Uma vez que a gente espera assíncronamente, a thread de UI não é bloqueada pelo download do arquivo.
  await DownloadFileAsync(fileNameTextBox.Text);

  // Após a conclusão, nós retomamos no context de UI e podemos acessar facilmanete elementos de UI.
  resultTextBox.Text = "File downloaded!";
}

// Exemplo em ASP.NET
protected async void MyButton_Click(object sender, EventArgs e)
{
  // Já que a gente está esperando de forma assíncrona, a thread do ASP.NET não é bloqueada pelo download do arquivo.
  // isso permite que ela fique disponível para executar outros requests neste meio tempo.
  await DownloadFileAsync(...);

  // Depois de finalizado, retomamos o context e podemos acessar os dados do request atual.
  // Nós poderemos estar em outra thread, mas nós teremos o mesmo context ASP.NET.
  Response.Write("File downloaded!");
}
{% endhighlight %}

Isso é ótimo para _event handlers_, mas nem sempre será o que você irá precisar para maioria do código (que será boa parte código assíncrono que você escreverá).

## Evitando o Contexto

Na maior parte do tempo, você não precisa voltar ao contexto principal. Boa parte dos métodos assíncronos são projetados com composição em mente: Eles usam o _await_ de outras operações, cada um representando uma operação assíncrona por si mesma (podendo ser compostas por outras). Neste caso, você pode dizer ao _awaiter_ para não capturar o contexto atual chamando _ConfigureAwait_ e passando _false_ para ele. Exemplo:

{% highlight csharp linenos %}
private async Task DownloadFileAsync(string fileName)
{
  // Use HttpClient or whatever to download the file contents.
  var fileContents = await DownloadFileContentsAsync(fileName).ConfigureAwait(false);

  // Note that because of the ConfigureAwait(false), we are not on the original context here.
  // Instead, we're running on the thread pool.

  // Write the file contents out to a disk file.
  await WriteToDiskAsync(fileName, fileContents).ConfigureAwait(false);

  // The second call to ConfigureAwait(false) is not *required*, but it is Good Practice.
}

// WinForms example (it works exactly the same for WPF).
private async void DownloadFileButton_Click(object sender, EventArgs e)
{
  // Since we asynchronously wait, the UI thread is not blocked by the file download.
  await DownloadFileAsync(fileNameTextBox.Text);

  // Since we resume on the UI context, we can directly access UI elements.
  resultTextBox.Text = "File downloaded!";
}
{% endhighlight %}

O que é importante notar com este exemplo é cada _nível_ de chamada de um método assíncrono tem seu próprio contexto. *DownloadFileButton_Click* inicia no contexto da UI, chama *DownloadFileAsync*. *DownloadFileAsync* também inicia no contexto da UI, mas então o deixa para trás ao chamar _ConfigureAwait(false)_. O resto do método _DownloadFileAsync_ executa no contexto da _thread pool_. Porém quando _DownloadFileAsync_ completa, o _DownloadFileButton_Click_ continua, ele, de fato, continua no contexto da UI.

Uma boa regra a seguir é de sempre usar _ConfigureAwait(false)_ a menos que você saiba que realmente irá precisar do contexto.

## Async Composition

Até agora nós apenas consideramos composição serial: um método assíncrono aguarda por uma operação a cada tempo, mas também é possível iniciar várias operações e esperar por uma (ou todas) completarem. Você pode fazer isso iniciando operações, mas não usando await imediatamente. 
{% highlight csharp linenos %}
public async Task DoOperationsConcurrentlyAsync()
{
  Task[] tasks = new Task[3];
  tasks[0] = DoOperation0Async();
  tasks[1] = DoOperation1Async();
  tasks[2] = DoOperation2Async();

  // Neste ponto, todas as três tarefas estão rodando ao mesmo tempo. 
  // Agora a gente await todas elas de uma vez.
  await Task.WhenAll(tasks);
}

public async Task<int> GetFirstToRespondAsync()
{
  // Chama dois web services; Pega a primeira resposta
  Task<int>[] tasks = new[] { WebService1Async(), WebService2Async() };

  // Await pelo primeiro a responder
  Task<int> firstTask = await Task.WhenAny(tasks);

  // Retorna o resultado
  return await firstTask;
}
{% endhighlight %}

Ao usar composição concorrente (Task.WhenAll ou Task.WhenAny), você pode executar operações concorrentes simples. Você também pode usar estes métodos junto com Task.Run para fazer computações simples em paralelo. Mas isso não é um substituto para a Task Parallel Liberay – qualquer operação que faça uso intensivo de CPU e operações paralelas devem fazer através da TPL.

## Orientações
Leia o documento da [Task-based asynchronous (TAP)](http://www.microsoft.com/download/en/details.aspx?id=19957). Ele é extremamente bem escrito e inclui informações sobre o design da api e uso apropriado das palavras chaves _async_ e _await_ assim como inclusão de eventos de cancelamento e progresso. 

 Existem muitas novas técnicas compatíveis com _await_ que devem ser usadas ao invés das técnicas antigas onde há bloqueio da aplicação. Se você tem alguns desses antigos exemplos no seu código novo com async, você está fazendo isso errado:

| Antigo | Novo | Descrição |
|:--------|:-------|:--------|
| task.Wait|await task|Aguarda/await uma task completar.|
|Task.Result|await task|Pega o resultado de uma task completada|
|Task.WaitAny|await Task.WhenAny|Aguarda/await que uma de uma coleção de tasks complete.|
|Task.WaitAll|await Task.WhenAll|Aguarda/await que todas as tasks de uma coleção complete|
|Thread.Sleep|await Task.Delay|Aguarda/await por um periodo de tempo.|
|Task constructor|Task.Run or TaskFactory.StartNew|Cria uma task baseada em código|
{: rules="groups"}
		
## Próximos passos
Stephen Cleary publicou um artigo na MSDN intitulado [Best pratices in Asynchronous Programming (Melhores práticas em programação assíncrona)](http://msdn.microsoft.com/en-us/magazine/jj991977.aspx) que explica de forma mais completa as orientações sobre "evite void async", "assíncrono por todo caminho" e "configure o contexto".
A [documentação oficial da MSDN](http://msdn.microsoft.com/en-us/library/hh191443.aspx) é muito boa; Eles incluem uma versão online do documento [Task-based Asynchronous Pattern](http://msdn.microsoft.com/en-us/library/hh873175.aspx) que é excelente e cobre os designs dos métodos assíncronos. 
A equipe _async_ publicou uma faq sobre _async/await_, um grande lugar para continuar aprendendo sobre _async_. Eles possuem destaques dos melhores posts e vídeos por lá. E também qualquer [blog post do Stephen Toub](http://blogs.msdn.com/b/pfxteam) é bem instrutivo. 
E claro, outro recurso é o blog do [Stephen Cleary](http://blog.stephencleary.com/).  Todo este material em inglês.




