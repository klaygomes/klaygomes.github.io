---
layout: post
title: Covariância e contravariância no C Sharp
excerpt: Mais uma daquelas funcionalidades que você usa sem saber que elas existem.
modified: 2016-06-16
tags: [net, fSharp, programacao_funcional]
comments: true
---
{% include _toc.html %}

Primeiro precisamos definir o que seria variância e suas filhas covariância e contravariância. Para começar, você precisa entender que os sistemas de tipos da maioria das linguagens de programação orientada a objetos aceitam que tipos novos sejam criados a partir de outros usando herança, e que estes tipos novos podem ser usados em qualquer lugar onde se esperaria os tipos bases. 
Exemplo:
Se você tem uma classe _Gato_ que herda de _Animal_, poderá usá-la em qualquer método que aceite apenas _Animal_ como parâmetro.

{% highlight cs linenos %}
public abstract class Animal
{
	public abstract void BalanceRabo();
}
public class Gato : Animal
{
	public override void BalanceRabo()
	{
		System.Console.WriteLine("abalançando freneticamente");
	}
}
public static void Chame(Animal animal)
{
	animal.BalanceRabo();
}
public static void Main(string[] args)
{
	var gato = new Gato();
	Chame(gato);// <<--compila sem problemas
}
{% endhighlight %}
 

Este comportamento é chamado de Polimorfismo e provavelmente você já deve ter ouvido falar, mas o que fazer se o método ao invés de apenas um _Animal_ esperasse uma lista de _Animal_? 
Quando estamos trabalhando com containers de tipos, traduzindo: classes que só existem como uma espécie de caixas moldadas exclusivamente para acesso a tipos específicos, estas metamorfoses passam a ser chamadas de *variâncias* e são classificadas em três subgrupos *covariância*, *contravariância* e *invariância*. 
Agora que você já sabe que isso existe, vamos nos aprofundar um pouco, veja o exemplo a seguir:

{% highlight cs linenos %}
public abstract class Animal
{
	public abstract void BalanceRabo();
}
public class Gato : Animal
{
	public override void BalanceRabo()
	{
		System.Console.WriteLine("abalançando freneticamente");
	}
}

public static void Main(string[] args)
{
	Gato[] gatos = new Gato[] { new Gato(), new Gato()};
	Chame(gatos);// <<--gatos que é do tipo Gato[] é convertido para Animal[], tipo mais genérico
}

public static void Chame(Animal[] animais)
{
	foreach(var animal in animais)
		animal.BalanceRabo();
}
{% endhighlight %}

No exemplo acima, note que o tipo System.Array, container para os tipos Animal e Gato, permite sua metamorfose sempre que o tipo que ele guarda é um tipo base da outra System.Array, damos o nome dessa mutação  de covariância. Trocando em miúdos, temos que covariância ocorre sempre quando um objeto container inicializado com um tipo mais especializado pode ser assinalado a um objeto container que possui um mais básico.
 
Já a Contravariância é o contrário, onde apenas tipos especializados aceitam tipos mais básicos. 
Parece não fazer sentido, mas faz e você já deve ter utilizado contravariância no seu dia-a-dia, veja este exemplo:

{% highlight cs linenos %}
public static void Log(object data)
{
	Console.WriteLine($"Called with {data} type of {data.GetType().Name}");
}

public class Writter
{
	private string _data;
	public Writter(string data)
	{
		_data = data;
	}
	public  override string ToString()
	{
		return $"Writter says '{_data}'";
	}
}

public static void Main(string[] args)
{
	Action<string> callLogAsString = Log; //<-- Log é do tipo Action<Object> convertido para Action<string>, note que string é mais especifico que object.
	Action<Writter> callLogAsWritter = Log;
	
	callLogAsString("foo");
	callLogAsWritter(new Writter("bar"));
	
}
{% endhighlight %}

No exemplo acima, a partir da assinatura de um método genérico, foi possível converte-lo para tipo mais específico.
 
Agora vamos ver em que problemas estes tipos de metamorfoses podem nos levar. No primeiro exemplo, vimos que System.Array é covariantes, tornando possível que código como o seguinte possa ser compilado, mas falhe miseravelmente em tempo de execução:

{% highlight cs linenos %}
public class Camelo : Animal
{
	public override void BalanceRabo()
	{
		System.Console.WriteLine("abalançando levemente");
	}
	public void BebaAgua()
	{
		System.Console.WriteLine("Bebendo 5 litros de água");
	}
}
public static void Chame(Animal[] animais)
{
	foreach(var animal in animais)
		animal.BalanceRabo();
animais[0] = new Camelo();//<--aqui terei um erro em tempo de execução (ArrayTypeMismatchException)
}
{% endhighlight %}

Note que é seguro ler as propriedades e chamar métodos de containers covariantes, porém perigoso escrever. No exemplo acima, o método _Chame_ recebeu um Array de Gatos, mas tentou escrever um Camelo que obviamente não cabe, gerando erro em tempo de execução.
No C# a partir da versão 4 podemos controlar a variâncias dos nossos tipos a partir das palavras chaves in e out. 
Este controle pode ser feito apenas a partir de interfaces genéricas ou delegates genéricos, não sendo permitido em classes e outros tipos, a forma como os tipos são expostos também são controlados, neste último caso para garantir a segurança dos dados expostos pelos containers. Veja:
A palavra chave in, define tipos que são contravariantes. 

{% highlight cs linenos %}
public interface IKlay<in T>
{
	void Receba(T algo);
}
{% endhighlight %}

Tipos contravariantes são seguros para serem escritos em containers de tipos, ao contrários dos covariantes, por isso são permitidos apenas em parâmetros de entrada. 

{% highlight cs linenos %}
IKlay<Camelo> klayEspecifico = new Klay<Animal>();
klayEspecifico.Receba(new Gato());
{% endhighlight %}

Embora sejam de tipos diferentes é seguro já que o método só conhece animais (de quem gato é derivado) e não esqueça que quem realizará o trabalho será Klay<Animal> e não Klay<Camelo>.
A palavra out, define tipos covariantes que só são seguros quando lidos dos containers. Por isso, só é possível definir tipos covariantes como retorno de métodos:

{% highlight cs linenos %}
public interface IKlay<out T>
{
	T Envie();
}
IKlay<Animal > klayGenerico  = new Klay< Camelo >();
Animal enviado = klayGenerico.Envie();
{% endhighlight %}

Totalmente seguro ler o tipo enviado pelo tipo genérico covariante.

