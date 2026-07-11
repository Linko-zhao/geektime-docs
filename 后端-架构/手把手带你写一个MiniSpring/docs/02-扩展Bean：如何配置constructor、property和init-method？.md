你好，我是郭屹。

上节课，我们初步实现了一个MiniSpring框架，它很原始也很简单。我们实现了一个BeanFactory，作为一个容器对Bean进行管理，我们还定义了数据源接口Resource，可以将多种数据源注入Bean。

这节课，我们继续增强IoC容器，我们要做的主要有3点。

1. 增加单例Bean的接口定义，然后把所有的Bean默认为单例模式。
2. 预留事件监听的接口，方便后续进一步解耦代码逻辑。
3. 扩展BeanDefinition，添加一些属性，现在它只有id和class两个属性，我们要进一步地丰富它。

## 构建单例的Bean

首先我们来看看如何构建单例的Bean，并对该Bean进行管理。

单例（Singleton）是指某个类在整个系统内只有唯一的对象实例。只要能达到这个目的，采用什么技术手段都是可以的。常用的实现单例的方式有不下五种，因为我们构建单例的目的是深入理解Spring框架，所以我们会按照Spring的实现方式来做。

为了和Spring框架内的方法名保持一致，我们把BeanFactory接口中定义的registryBeanDefinition方法修改为registryBean，参数修改为beanName与obj。其中，obj为Object类，指代与beanName对应的Bean的信息。你可以看下修改后的BeanFactory。

```java
public interface BeanFactory {
    Object getBean(String beanName) throws BeansException;
    Boolean containsBean(String name);
    void registerBean(String beanName, Object obj);
}
```

既然要管理单例Bean，接下来我们就定义一下SingletonBeanRegistry，将管理单例Bean的方法规范好。

```java
public interface SingletonBeanRegistry {
    void registerSingleton(String beanName, Object singletonObject);
    Object getSingleton(String beanName);
    boolean containsSingleton(String beanName);
    String[] getSingletonNames();
}
```

你看这个类的名称上带有Registry字样，所以让人一眼就能知道这里面存储的就是Bean。从代码可以看到里面的方法 名称简单直接，分别对应单例的注册、获取、判断是否存在，以及获取所有的单例Bean等操作。

接口已经定义好了，接下来我们定义一个默认的实现类。这也是从Spring里学的方法，它作为一个框架并不会把代码写死，所以这里面的很多实现类都是默认的，默认是什么意思呢？就是我们可以去替换，不用这些默认的类也是可以的。我们就按照同样的方法，来为我们的默认实现类取个名字DefaultSingletonBeanRegistry。

```java
public class DefaultSingletonBeanRegistry implements SingletonBeanRegistry {
    //容器中存放所有bean的名称的列表
    protected List<String> beanNames = new ArrayList<>();
    //容器中存放所有bean实例的map
    protected Map<String, Object> singletons = new ConcurrentHashMap<>(256);

    public void registerSingleton(String beanName, Object singletonObject) {
        synchronized (this.singletons) {
            this.singletons.put(beanName, singletonObject);
            this.beanNames.add(beanName);
        }
    }
    public Object getSingleton(String beanName) {
        return this.singletons.get(beanName);
    }
    public boolean containsSingleton(String beanName) {
        return this.singletons.containsKey(beanName);
    }
    public String[] getSingletonNames() {
        return (String[]) this.beanNames.toArray();
    }
    protected void removeSingleton(String beanName) {
        synchronized (this.singletons) {
            this.beanNames.remove(beanName);
            this.singletons.remove(beanName);
        }
    }
}
```

我们在默认的这个类中，定义了beanNames列表和singletons的映射关系，beanNames用于存储所有单例Bean的别名，singletons则存储Bean名称和实现类的映射关系。

这段代码中要留意的是，我们将 singletons 定义为了一个ConcurrentHashMap，而且在实现 registrySingleton 时前面加了一个关键字synchronized。这一切都是为了确保在多线程并发的情况下，我们仍然能安全地实现对单例Bean的管理，无论是单线程还是多线程，我们整个系统里面这个Bean总是唯一的、单例的。

还记得我们有SimpleBeanFactory这样一个简单的BeanFactory实现类吗？接下来我们修改这个类，让它继承上一步创建的DefaultSingletonBeanRegistry，确保我们通过SimpleBeanFactory创建的Bean默认就是单例的，这也和Spring本身的处理方式一致。

```java
public class SimpleBeanFactory extends DefaultSingletonBeanRegistry implements BeanFactory{
    private Map<String, BeanDefinition> beanDefinitions = new ConcurrentHashMap<>(256);
    public SimpleBeanFactory() {
    }

    //getBean，容器的核心方法
    public Object getBean(String beanName) throws BeansException {
        //先尝试直接拿bean实例
        Object singleton = this.getSingleton(beanName);
        //如果此时还没有这个bean的实例，则获取它的定义来创建实例
        if (singleton == null) {
            //获取bean的定义
            BeanDefinition beanDefinition = beanDefinitions.get(beanName);
            if (beanDefinition == null) {
                throw new BeansException("No bean.");
            }
            try {
                singleton = Class.forName(beanDefinition.getClassName()).newInstance();
            }
            //新注册这个bean实例
            this.registerSingleton(beanName, singleton);
        }
        return singleton;
    }
    public void registerBeanDefinition(BeanDefinition beanDefinition) {
        this.beanDefinitions.put(beanDefinition.getId(), beanDefinition);
    }
    public Boolean containsBean(String name) {
        return containsSingleton(name);
    }
    public void registerBean(String beanName, Object obj) {
        this.registerSingleton(beanName, obj);
    }
}

```

我们对 SimpleBeanFactory 的主要改动是增加了对containsBean和registerBean的实现。通过代码可以看出，这两处实现都是对单例Bean的操作。

这部分还有两个类需要调整：ClassPathXmlApplicationContext和XmlBeanDefinitionReader。其中ClassPathXmlApplicationContext里增加了对containsBean和registerBean的实现。

```java
public Boolean containsBean(String name) {
    return this.beanFactory.containsBean(name);
}
public void registerBean(String beanName, Object obj) {
    this.beanFactory.registerBean(beanName, obj);
}
```

XmlBeanDefinitionReader调整后如下：

```java
public class XmlBeanDefinitionReader {
    SimpleBeanFactory simpleBeanFactory;
    public XmlBeanDefinitionReader(SimpleBeanFactory simpleBeanFactory) {
        this.simpleBeanFactory = simpleBeanFactory;
    }
    public void loadBeanDefinitions(Resource resource) {
        while (resource.hasNext()) {
            Element element = (Element) resource.next();
            String beanID = element.attributeValue("id");
            String beanClassName = element.attributeValue("class");
            BeanDefinition beanDefinition = new BeanDefinition(beanID, beanClassName);
            this.simpleBeanFactory.registerBeanDefinition(beanDefinition);
        }
    }
}

```

## 增加事件监听

构建好单例Bean之后，为了监控容器的启动状态，我们要增加事件监听。

我们先定义一下ApplicationEvent和ApplicationEventPublisher。通过名字可以看出，一个是用于监听应用的事件，另一个则是发布事件。

- ApplicationEventPublisher的实现

```java
public interface ApplicationEventPublisher {
    void publishEvent(ApplicationEvent event);
}
```

- ApplicationEvent的实现

```java
public class ApplicationEvent  extends EventObject {
    private static final long serialVersionUID = 1L;
    public ApplicationEvent(Object arg0) {
        super(arg0);
    }
}
```

可以看出，ApplicationEvent继承了Java工具包内的EventObject，我们是在Java的事件监听的基础上进行了简单的封装。虽然目前还没有任何实现，但这为我们后续使用观察者模式解耦代码提供了入口。

到此为止，我们进一步增强了IoC容器，还引入了两个新概念：**单例Bean和事件监听。**其中，事件监听这部分目前只预留了入口，方便我们后续扩展。而单例Bean则是Spring框架默认的实现，我们提供了相关实现方法，并考虑到多线程高并发的场景，引入了ConcurrentHashMap来存储Bean信息。

到这一步，我们容器就变成了管理单例Bean的容器了。下面我们做一点准备工作，为后面对这些Bean注入属性值做铺垫。

## 注入

Spring中有三种属性注入的方式，分别是**Field注入、Setter注入和构造器（Constructor）注入。**Field注入是指我们给Bean里面某个变量赋值。Setter注入是提供了一个setter方法，调用setXXX()来注入值。constructor就是在构造器/构造函数里传入参数来进行注入。Field注入我们后面会实现，这节课我们先探讨Setter注入和构造器注入两种方式。

### 配置Setter注入

首先我们来看下配置，在XML文件中我们是怎么声明使用Setter注入方式的。

```xml
<beans>
    <bean id="aservice" class="com.minis.test.AServiceImpl">
        <property type="String" name="property1" value="Hello World!"/>
    </bean>
</beans>
```

由上面的示例可以看出，我们在 `<bean>` 标签下引入了 `<property>` 标签，它又包含了type、name和value，分别对应属性类型、属性名称以及赋值。你可以看一下这个Bean的代码。

```java
public class AServiceImpl {
  private String property1;

  public void setProperty1(String property1) {
    this.property1 = property1;
  }
}
```

### 配置构造器注入

接下来我们再看看怎么声明构造器注入，同样是在XML里配置。

```xml
<beans>
    <bean id="aservice" class="com.minis.test.AServiceImpl">
      <constructor-arg type="String" name="name" value="abc"/>
      <constructor-arg type="int" name="level" value="3"/>
    </bean>
</beans>
```

可以看到，与Setter注入类似，我们只是把 `<property>` 标签换成了 `<constructor-args>` 标签。

```java
public class AServiceImpl {

  private String name;
  private int level;

  public AServiceImpl(String name, int level) {
    this.name = name;
    this.level = level;
  }
}
```

由上述两种方式可以看出，**注入操作的本质，就是给Bean的各个属性进行赋值。**具体方式取决于实际情况，哪一种更便捷就可以选择哪一种。如果采用构造器注入的方式满足不了对域的赋值，也可以将构造器注入和Setter注入搭配使用。

```xml
<beans>
    <bean id="aservice" class="com.minis.test.AServiceImpl">
        <constructor-arg type="String" name="name" value="abc"/>
        <constructor-arg type="int" name="level" value="3"/>
        <property type="String" name="property1" value="Someone says"/>
        <property type="String" name="property2" value="Hello World!"/>
    </bean>
</beans>
```

现在我们已经明确了 `<property>` 和 `<constructor-args>` 标签的定义，但是只有外部的XML文件配置定义肯定是不行的，还要去实现。这就是我们接下来需要完成的工作。

## 实现属性类

与这个定义相关，我们要配置对应的属性类，分别命名为ArgumentValue和PropertyValue。

```java
public class ArgumentValue {
    private Object value;
    private String type;
    private String name;
    public ArgumentValue(Object value, String type) {
        this.value = value;
        this.type = type;
    }
    public ArgumentValue(Object value, String type, String name) {
        this.value = value;
        this.type = type;
        this.name = name;
    }
    //省略getter和setter
}
```

```java
public class PropertyValue {
    private final String name;
    private final Object value;
    public PropertyValue(String name, Object value) {
        this.name = name;
        this.value = value;
    }
    //省略getter
}
```

我们看Value这个词，后面不带“s”就表示他只是针对的某一个属性或者某一个参数，但一个Bean里面有很多属性、很多参数，所以我们就需要一个带“s”的集合类。 在Spring中也是这样的，所以我们参考Spring的方法，提供了ArgumentValues和PropertyValues两个类，封装、 增加、获取、判断等操作方法，简化调用。既给外面提供单个的参数/属性的对象，也提供集合对象。

- ArgumentValues类

```java
public class ArgumentValues {
    private final Map<Integer, ArgumentValue> indexedArgumentValues = new HashMap<>(0);
    private final List<ArgumentValue> genericArgumentValues = new LinkedList<>();
    public ArgumentValues() {
    }
    private void addArgumentValue(Integer key, ArgumentValue newValue) {
        this.indexedArgumentValues.put(key, newValue);
    }
    public boolean hasIndexedArgumentValue(int index) {
        return this.indexedArgumentValues.containsKey(index);
    }
    public ArgumentValue getIndexedArgumentValue(int index) {
        return this.indexedArgumentValues.get(index);
    }
    public void addGenericArgumentValue(Object value, String type) {
        this.genericArgumentValues.add(new ArgumentValue(value, type));
    }
    private void addGenericArgumentValue(ArgumentValue newValue) {
        if (newValue.getName() != null) {
            for (Iterator<ArgumentValue> it =
                 this.genericArgumentValues.iterator(); it.hasNext(); ) {
                ArgumentValue currentValue = it.next();
                if (newValue.getName().equals(currentValue.getName())) {
                    it.remove();
                }
            }
        }
        this.genericArgumentValues.add(newValue);
    }
    public ArgumentValue getGenericArgumentValue(String requiredName) {
        for (ArgumentValue valueHolder : this.genericArgumentValues) {
            if (valueHolder.getName() != null && (requiredName == null || !valueHolder.getName().equals(requiredName))) {
                continue;
            }
            return valueHolder;
        }
        return null;
    }
    public int getArgumentCount() {
        return this.genericArgumentValues.size();
    }
    public boolean isEmpty() {
        return this.genericArgumentValues.isEmpty();
    }
}
```

- PropertyValues类

```java
public class PropertyValues {
    private final List<PropertyValue> propertyValueList;
    public PropertyValues() {
        this.propertyValueList = new ArrayList<>(0);
    }
    public List<PropertyValue> getPropertyValueList() {
        return this.propertyValueList;
    }
    public int size() {
        return this.propertyValueList.size();
    }
    public void addPropertyValue(PropertyValue pv) {
        this.propertyValueList.add(pv);
    }
    public void addPropertyValue(String propertyName, Object propertyValue) {
        addPropertyValue(new PropertyValue(propertyName, propertyValue));
    }
    public void removePropertyValue(PropertyValue pv) {
        this.propertyValueList.remove(pv);
    }
    public void removePropertyValue(String propertyName) {
        this.propertyValueList.remove(getPropertyValue(propertyName));
    }
    public PropertyValue[] getPropertyValues() {
        return this.propertyValueList.toArray(new PropertyValue[this.propertyValueList.size()]);
    }
    public PropertyValue getPropertyValue(String propertyName) {
        for (PropertyValue pv : this.propertyValueList) {
            if (pv.getName().equals(propertyName)) {
                return pv;
            }
        }
        return null;
    }
    public Object get(String propertyName) {
        PropertyValue pv = getPropertyValue(propertyName);
        return pv != null ? pv.getValue() : null;
    }
    public boolean contains(String propertyName) {
        return getPropertyValue(propertyName) != null;
    }
    public boolean isEmpty() {
        return this.propertyValueList.isEmpty();
    }
}
```

上面这些代码整体还是比较简单的，根据各个封装方法的名称，也基本能明确它们的用途，这里就不再赘述了。对于构造器注入和Setter注入两种方式，这里我们只是初步定义相关类，做一点准备，后面我们将实现具体解析以及注入的过程。

接下来，我们还要做两件事。

1. 扩展BeanDefinition的属性，在原有id与name两个属性的基础上，新增lazyInit、dependsOn、initMethodName等属性。
2. 继续扩展BeanFactory接口，增强对Bean的处理能力。

## 扩展BeanDefinition

我们先给BeanDefinition和BeanFactory增加新的接口，新增接口基本上是适配BeanDefinition新增属性的。

我们给BeanDefinition类添加了哪些属性呢？一起来看下。

```java
public class BeanDefinition {
    String SCOPE_SINGLETON = "singleton";
    String SCOPE_PROTOTYPE = "prototype";
    private boolean lazyInit = false;
    private String[] dependsOn;
    private ArgumentValues constructorArgumentValues;
    private PropertyValues propertyValues;
    private String initMethodName;
    private volatile Object beanClass;
    private String id;
    private String className;
    private String scope = SCOPE_SINGLETON;
    public BeanDefinition(String id, String className) {
        this.id = id;
        this.className = className;
    }
    //省略getter和setter
}
```

从上面代码可以看出，之前我们只有id和className属性，现在增加了scope属性，表示bean是单例模式还是原型模式，还增加了lazyInit属性，表示Bean要不要在加载的时候初始化，以及初始化方法initMethodName的声明，当一个Bean构造好并实例化之后是否要让框架调用初始化方法。还有dependsOn属性记录Bean之间的依赖关系，最后还有构造器参数和property列表。

## 集中存放BeanDefinition

接下来，我们新增BeanDefinitionRegistry接口。它类似于一个存放BeanDefinition的仓库，可以存放、移除、获取及判断BeanDefinition对象。所以，我们初步定义四个接口对应这四个功能，分别是register、remove、get、contains。

```java
public interface BeanDefinitionRegistry {
    void registerBeanDefinition(String name, BeanDefinition bd);
    void removeBeanDefinition(String name);
    BeanDefinition getBeanDefinition(String name);
    boolean containsBeanDefinition(String name);
}
```

随后调整BeanFactory，新增Singleton、Prototype的判断，获取Bean的类型。

```java
public interface BeanFactory {
    Object getBean(String name) throws BeansException;
    boolean containsBean(String name);
    boolean isSingleton(String name);
    boolean isPrototype(String name);
    Class<?> getType(String name);
}
```

通过代码可以看到，我们让SimpleBeanFactory实现了BeanDefinitionRegistry，这样SimpleBeanFactory既是一个工厂同时也是一个仓库，你可以看下调整后的部分代码。

```java
public class SimpleBeanFactory extends DefaultSingletonBeanRegistry implements BeanFactory, BeanDefinitionRegistry{
    private Map<String, BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<>(256);
    private List<String> beanDefinitionNames = new ArrayList<>();

    public void registerBeanDefinition(String name, BeanDefinition beanDefinition) {
        this.beanDefinitionMap.put(name, beanDefinition);
        this.beanDefinitionNames.add(name);
        if (!beanDefinition.isLazyInit()) {
            try {
                getBean(name);
            } catch (BeansException e) {
            }
        }
    }
    public void removeBeanDefinition(String name) {
        this.beanDefinitionMap.remove(name);
        this.beanDefinitionNames.remove(name);
        this.removeSingleton(name);
    }
    public BeanDefinition getBeanDefinition(String name) {
        return this.beanDefinitionMap.get(name);
    }
    public boolean containsBeanDefinition(String name) {
        return this.beanDefinitionMap.containsKey(name);
    }
    public boolean isSingleton(String name) {
        return this.beanDefinitionMap.get(name).isSingleton();
    }
    public boolean isPrototype(String name) {
        return this.beanDefinitionMap.get(name).isPrototype();
    }
    public Class<?> getType(String name) {
        return this.beanDefinitionMap.get(name).getClass();
    }
}
```

修改完BeanFactory这个核心之后，上层对应的 ClassPathXmlApplicationContext部分作为外部集成包装也需要修改。

```java
public class ClassPathXmlApplicationContext implements BeanFactory, 
ApplicationEventPublisher{
    public void publishEvent(ApplicationEvent event) {
    }
    public boolean isSingleton(String name) {
        return false;
    }
    public boolean isPrototype(String name) {
        return false;
    }
    public Class<?> getType(String name) {
        return null;
    }
}
```

## 小结

![](https://static001.geekbang.org/resource/image/48/8d/4868fb2cc4f11bd1e578c9c68430d58d.jpg?wh=3736x2085)

这节课，我们模仿Spring构造了单例Bean，还增加了容器事件监听处理，完善了BeanDefinition的属性。此外，参照Spring的实现，我们增加了一些有用的特性，例如lazyInit，initMethodName等等，BeanFactory也做了相应的修改。同时，我们还提前为构造器注入、Setter注入提供了基本的实例类，这为后面实现上述两种依赖注入方式提供了基础。

通过对上一节课原始IoC容器的扩展和丰富，它已经越来越像Spring框架了。

完整源代码参见 [https://github.com/YaleGuo/minis](https://github.com/YaleGuo/minis)

## 课后题

学完这节课，我也给你留一道思考题。你认为构造器注入和Setter注入有什么异同？它们各自的优缺点是什么？欢迎你在留言区与我交流讨论，也欢迎你把这节课分享给需要的朋友。我们下节课见！
<div><strong>精选留言（15）</strong></div><ul>
<li><span>姐姐</span> 👍（36） 💬（5）<p>这节课的类开始爆炸了，一开始看得很没头绪，但是俗话说“书读百遍，其义自见”，俗话很有道理，最后决定从simpleBeanFactory和ClassPathXmlApplicationContext两个角度，总结一下自己的理解和感悟，当做是自己的笔记：1. 从SimpleBeanFactory的角度看，首先理理三个接口BeanFactory、BeanDefinitionRegistry、SingletonBeanRegistry，对于这三个接口，其中BeanFactory、BeanDefinitionRegistry是由SimpleBeanFactory直接实现的，而对于SingletonBeanRegistry，SimpleBeanFactory继承了它的实现类DefaultSingletonBeanRegistry，起初我很疑惑，为什么SimpleBeanFactory不同时声明实现SingletonBeanRegistry并且继承它的默认实现类呢，但是后来想想也许SimpleBeanFactory对外只希望外界知道自己是一个beanFactory和beanDefinitionRegistry，至于singletonBeanRegistry，它只希望作为一种内部的能力来使用，所以继承一个已经实现的类来拥有能力，但是声明接口的时候不声明这个接口。理清了这三个以后，再来看看内部的细节逻辑，SimpleBeanFactory的registerBeanDefinition方法中每注册一个beanDefinition，如果不是懒加载的就立刻调用getBean，而getBean方法会从SimpleBeanFactory继承的DefaultSingletonBeanRegistry能力中判断bean是否存，不存在创建并注册进DefaultSingletonBeanRegistry。2.ClassPathXmlApplicationContext  它的组装逻辑和上一节一样，但是现在XmlBeanDefinitionReader在遍历resource向simplebeanfactory注册的时候，由于simplebeanfactory注册时候会创建非懒bean,所以现在applicationContext启动的时候就会创建所有非懒加载bean，上一节课的容器创建完并不会创建bean,要到获取bean的时候才创建bean，对getBean方法的调用提前到注册beanDefinition的时候了；ClassPathXmlApplicationContext实现了ApplicationEventPublisher，所以可以猜测以后容器不仅是容器，还兼具发布事件的功能。 这节课最大收获是加深了对实现接口和继承类的理解，如果一个类声明它实现了某个接口，那么它偏向于告诉外部它是那个接口，你可以把它当成那个接口来用，如果一个类继承了某个实现类，这时候也可以把它当成这个实现类来用，但是我想它更偏向于获得该实现类的能力，如果它既想获得能力又想对外提供能力，那么它可以同时声明实现接口和继承接口的某些实现类，再自己修改增强某些方法。</p>2023-03-23</li><br/><li><span>咕噜咕噜</span> 👍（10） 💬（1）<p>构造器注入：适合于强制依赖，适合在创建对象的同时必须要初始化的变量。但是要注入的依赖多了可能构造器会相对臃肿；循环依赖问题无法有效解决，会在启动的时候报错。
setter注入：适合于可选依赖，当没有提供它们时，类应该能够正常工作。相对更加灵活，可以多次调用，循环依赖问题spring可以通过三级缓存解决。</p>2023-03-17</li><br/><li><span>聪聪不匆匆</span> 👍（8） 💬（2）<p>老师可以将每一章的各个类之间UML关系提供一下吗 方便学习缕清楚创建过程 和 各个组件依赖关系 谢谢老师</p>2023-03-16</li><br/><li><span>陈小远</span> 👍（7） 💬（2）<p>这节课在内容上能看懂，但是在编码实操的时候有些难受——老师的源码都是完成品，而课件中并没有给出满足当前进度的可运行代码，一些迭代性的改动也并没有顾及会对其它部分实现的影响，比如BeanFactory中registerBean突然没有了，导致跟进课程实操方面有点打脑壳</p>2023-03-18</li><br/><li><span>爱学习的王呱呱</span> 👍（5） 💬（7）<p>老师好，有点没理解 synchronized + ConcurrentHashMap 同时使用的意义。
我理解HashMap在多线程下的问题有两个 1. 不同key但是相同hashcode会造成元素覆盖；2. 死循环。但是ConcurrentHashMap不存在这个问题了，为什么还需要synchronized呢。</p>2023-06-05</li><br/><li><span>Geek_e298ce</span> 👍（4） 💬（3）<p>有一个问题不太明白, 为什么要有BeanFactory和SingletonBeanRegistry这两个接口呢</p>2023-04-02</li><br/><li><span>故作</span> 👍（3） 💬（2）<p>感觉代码真的贴的不是很用心，看专栏里的代码，会觉得有些东西莫名其妙，以至于一头雾水，然后去看git上的代码，发现是没有这一看不懂的内容的。蛮气愤的，明明开篇词里说每一小步都是可运行的，结果，从这一章开始，就不行了。能理解无法把所有代码都放里边，但是，因为开篇词里的这句话，导致白白浪费了很多时间。这一章，质量真的很低，很不用心</p>2023-06-30</li><br/><li><span>浅行</span> 👍（3） 💬（1）<p>郭老师，有个地方不太理解，经过前面的一些设计，XmlBeanDefinitionReader构造方法不得不将BeanFactory改为实现类SimpleBeanFactory，这样可扩展性是否就变差了呢？如果实际开发中遇到这种情况有什么好的解决思路吗？请郭老师指点一下，谢谢</p>2023-03-15</li><br/><li><span>__@Wong</span> 👍（2） 💬（1）<p>看了两节，这个课程对于缺少基础的人来说有一定的难度。本课程对学习者来说需要对Spring, 设计模式准则以及常用设计模式有一定的基础，并有一定代码设计功底。如果想要通过本课程学习企业Spring开发，不太建议，不如看Spring的书籍更来得有效。如果想要学习下Spring的设计，本课程非常适用。</p>2023-05-13</li><br/><li><span>未聞花名</span> 👍（2） 💬（1）<p>老师贴代码可以保留下包名，或者脑图里的类可以带上包名，这样可以按着思路写，不用去翻github的代码了</p>2023-03-20</li><br/><li><span>KernelStone</span> 👍（1） 💬（1）<p>我找到的一条主线是这样的。beans.xml -&gt; AServiceImpl -&gt; ArgumentValue &amp; PropertyValue -&gt; ArgumentValues &amp; PropertyValues -&gt; BeanDefinition -&gt; BeanDefinitionRegistry -&gt; XmlBeanDefinitionReader -&gt; BeanFactory -&gt; SingletonBeanRegistry -&gt; DefaultSingletonBeanRegistry -&gt; SimpleBeanFactory。主要还是围绕着扩充Bean定义，属性注入去完成的，这个顺序看下来比较好理解。其余的就是ApplicationEvent +ApplicationEventPublisher预留事件监听机制的扩展点、和重新组装ClassPathXmlApplicationContext。

当然同学们评论很精彩，学到了一些代码细节。再次感谢。

</p>2023-05-24</li><br/><li><span>Fiftten2001</span> 👍（1） 💬（1）<p>更改一下我的问题，singleton = Class.forName(beanDefinition.getClassName()).newInstance();这行代码在多线程情况下还是会生成多个对象的吧，这样的话单例是指单例了什么，如果是说get的时候每次都拿到的是同一个singleton，synchronized和concurrent保证了不会在多线程情况下，put或者remove发生导致的运行时崩溃，但是前后两次访问返回的singleton可能并不是同一个吧，这时候是不是应该在synchronized代码块中再次判断是否已经有了beanName对应的singletonObject然后再执行put和add</p>2023-04-19</li><br/><li><span>Fiftten2001</span> 👍（1） 💬（2）<p>疑惑的是上一讲中，Bean实例本就是注册进hashMap的，即BeanFactory的singletons中本就由beanDefinition的id和classpath构成key和value，无论加不加synchronized不都是只有一个么...（菜鸡大学生，如果问题太蠢，请轻点嘲笑，望解惑）</p>2023-04-19</li><br/><li><span>瓜瓜王几</span> 👍（1） 💬（1）<p>第二章代码看了3天，终于这一波算是看懂理解了，DefaultSingletonBeanRegistry将第一章中SimpleBeanFactory里面保存的singletons拆分出来管理了，用于存储真正的Bean对象(beanName,Object)，SimpleBeanFactory仅保存createBean，containsBean等和Bean操作相关的内容，其余相比第一章就是多了setter注入和构造器注入的内容，老师的代码并不复杂，自己还是要多多努力，认真看还是能看懂滴~~~开心.jpg</p>2023-03-20</li><br/><li><span>浅行</span> 👍（1） 💬（2）<p>发现了个小问题，配置构造器注入章节下：
与 Setter 注入类似，我们只是把标签换成了标签
这里好像少了点什么</p>2023-03-15</li><br/>
</ul>
