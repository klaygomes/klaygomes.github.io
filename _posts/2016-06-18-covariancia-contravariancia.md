---
layout: post
title: Covariance and contravariance in C Sharp
excerpt: One more of those features you use without knowing it exists.
modified: 2016-06-18
tags: [net, CSharp, functional_programming, curiosities]
comments: true
---

{% include toc.html %}

First, we need to define what variance is, along with its daughters, covariance and contravariance. To start, you need to understand that the type systems of most object-oriented programming languages allow new types to be created from other ones using inheritance, and that these new types can be used anywhere the base types would be expected. 

![Simple inheritance](/images/heranca.png)

Example:

If you have a class _Cat_ that inherits from _Animal_, you can use it in any method that accepts only _Animal_ as a parameter:

{% highlight csharp linenos %}
public abstract class Animal
{
	public abstract void WagTail();
}
public class Cat : Animal
{
	public override void WagTail()
	{
		System.Console.WriteLine("wagging frantically");
	}
}
public static void Call(Animal animal)
{
	animal.WagTail();
}
public static void Main(string[] args)
{
	var cat = new Cat();
	Call(cat);// <<--compiles without problems
}
{% endhighlight %}
 

This behavior is called **Polymorphism**, and you have probably heard about it already, but what do you do if the method, instead of just one _Animal_, expected a list of _Animal_? 

When we are working with type containers (in plain words: classes that only exist as a kind of box shaped exclusively to give access to specific types), these metamorphoses start being called *variances*, and they are classified into three subgroups: **covariance**, **contravariance**, and **invariance**. 

Now that you know this exists, let's dig a little deeper; look at the following example:

{% highlight csharp linenos %}
public abstract class Animal
{
	public abstract void WagTail();
}
public class Cat : Animal
{
	public override void WagTail()
	{
		System.Console.WriteLine("wagging frantically");
	}
}

public static void Main(string[] args)
{
	Cat[] cats = new Cat[] { new Cat(), new Cat()};
	Call(cats);// <<--cats, which is of type Cat[], is converted to Animal[], a more generic type
}

public static void Call(Animal[] animals)
{
	foreach(var animal in animals)
		animal.WagTail();
}
{% endhighlight %}

In the example above, note that the *System.Array* type, the container for the Animal and Cat types, allows its metamorphosis whenever the type it holds is a base type of the other *System.Array*'s type; we call this mutation covariance. 

![Covariance direction](/images/covariancia.png)

In other words, covariance happens whenever a container object initialized with a more specialized type can be assigned to a container object that holds a more basic one.
 
Contravariance, on the other hand, is the opposite, where only specialized types accept more basic types. 

![Contravariance direction](/images/contravariancia.png)

It doesn't seem to make sense, but it does, and you have probably already used contravariance in your day-to-day work; look at this example:

{% highlight csharp linenos %}
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
	Action<string> callLogAsString = Log; //<-- Log is of type Action<Object>, converted to Action<string>; note that string is more specific than object.
	Action<Writter> callLogAsWritter = Log;
	
	callLogAsString("foo");
	callLogAsWritter(new Writter("bar"));
	
}
{% endhighlight %}

In the example above, starting from the signature of a generic method, it was possible to convert it to a more specific type.
 
Now let's see what problems these kinds of metamorphoses can get us into. In the first example, we saw that System.Array is covariant, which makes it possible for the following code to compile but fail miserably at runtime:

{% highlight csharp linenos %}
public class Camel : Animal
{
	public override void WagTail()
	{
		System.Console.WriteLine("wagging gently");
	}
	public void DrinkWater()
	{
		System.Console.WriteLine("Drinking 5 liters of water");
	}
}
public static void Call(Animal[] animals)
{
	foreach(var animal in animals)
		animal.WagTail();
animals[0] = new Camel();//<--here I will get a runtime error (ArrayTypeMismatchException)
}
{% endhighlight %}

Note that it is **safe to read** properties and call methods of covariant containers, but **dangerous to write**. In the example above, the _Call_ method received an Array of Cats, but tried to write a Camel, which obviously doesn't fit, causing a runtime error.

In C#, starting from version 4, we can control the variance of our types using the _in_ and _out_ keywords. 

This control can only be done on generic interfaces or generic delegates; it is not allowed on classes and other types. The way the types are exposed is also controlled, in this last case to guarantee the safety of the data exposed by the containers. Look:
The in keyword defines types that are contravariant. 

{% highlight csharp linenos %}
public interface IKlay<in T>
{
	void Receive(T something);
}

IKlay<Camel> specificKlay = new Klay<Animal>();
specificKlay.Receive(new Cat());
{% endhighlight %}

Although they are of different types, it is safe, since the method only knows about animals (which cat derives from), and don't forget that the one doing the work will be Klay<Animal> and not Klay<Camel>.
The out keyword defines covariant types, which are only safe when read from the containers. That's why it is only possible to define covariant types as method return types:

{% highlight csharp linenos %}
public interface IKlay<out T>
{
	T Send();
}
IKlay<Animal > genericKlay  = new Klay< Camel >();
Animal sent = genericKlay.Send();
{% endhighlight %}

It is totally safe to read the type sent by the covariant generic type.
