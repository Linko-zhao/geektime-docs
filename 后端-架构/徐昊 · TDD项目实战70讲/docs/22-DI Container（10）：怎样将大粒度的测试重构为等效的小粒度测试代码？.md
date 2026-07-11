你好，我是徐昊。今天我们继续使用TDD的方式实现注入依赖容器。

## 回顾代码与任务列表

到目前为止，我们的代码是这样的：

```
ContextConfig.java:

package geektime.tdd.di;

import java.util.*;
import static java.util.List.of;

public class ContextConfig {
    private Map<Class<?>, ComponentProvider<?>> providers = new HashMap<>();

    public <Type> void bind(Class<Type> type, Type instance) {
        providers.put(type, new ComponentProvider<Type>() {
            @Override
            public Type get(Context context) {
                return instance;
            }
            @Override
            public List<Class<?>> getDependencies() {
                return of();
            }
        });
    }

    public <Type, Implementation extends Type>
    void bind(Class<Type> type, Class<Implementation> implementation) {
        providers.put(type, new ConstructorInjectionProvider<>(implementation));
    }

    public Context getContext() {
        providers.keySet().forEach(component -> checkDependencies(component, new Stack<>()));
        return new Context() {
            @Override
            public <Type> Optional<Type> get(Class<Type> type) {
                return Optional.ofNullable(providers.get(type)).map(provider -> (Type) provider.get(this));
            }
        };
    }

    private void checkDependencies(Class<?> component, Stack<Class<?>> visiting) {
        for (Class<?> dependency: providers.get(component).getDependencies()) {
            if (!providers.containsKey(dependency)) throw new DependencyNotFoundException(component, dependency);
            if (visiting.contains(dependency)) throw new CyclicDependenciesFoundException(visiting);
            visiting.push(dependency);
            checkDependencies(dependency, visiting);
            visiting.pop();
        }
    }

    interface ComponentProvider<T> {
        T get(Context context);
        List<Class<?>> getDependencies();
    }
}

ConstructorInjectionProvider.java:

package geektime.tdd.di;

import jakarta.inject.Inject;
import java.lang.reflect.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import static java.util.Arrays.stream;
import static java.util.stream.Stream.concat;

class ConstructorInjectionProvider<T> implements ContextConfig.ComponentProvider<T> {

    private Constructor<T> injectConstructor;
    private List<Field> injectFields;
    private List<Method> injectMethods;

    public ConstructorInjectionProvider(Class<T> component) {
        if (Modifier.isAbstract(component.getModifiers())) throw new IllegalComponentException();
        this.injectConstructor = getInjectConstructor(component);
        this.injectFields = getInjectFields(component);
        this.injectMethods = getInjectMethods(component);
        if (injectFields.stream().anyMatch(f -> Modifier.isFinal(f.getModifiers()))) throw new IllegalComponentException();
        if (injectMethods.stream().anyMatch(m -> m.getTypeParameters().length != 0)) throw new IllegalComponentException();
    }

    @Override
    public T get(Context context) {
        try {
            Object[] dependencies = stream(injectConstructor.getParameters())
                    .map(p -> context.get(p.getType()).get())
                    .toArray(Object[]::new);
            T instance = injectConstructor.newInstance(dependencies);
            for (Field field : injectFields)
                field.set(instance, context.get(field.getType()).get());
            for (Method method : injectMethods)
                method.invoke(instance, stream(method.getParameterTypes()).map(t -> context.get(t).get())
                        .toArray(Object[]::new));
            return instance;
        } catch (InvocationTargetException | InstantiationException | IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<Class<?>> getDependencies() {
        return concat(concat(stream(injectConstructor.getParameters()).map(Parameter::getType),
                        injectFields.stream().map(Field::getType)),
                injectMethods.stream().flatMap(m -> stream(m.getParameterTypes()))
        ).toList();
    }

    private static <T> List<Method> getInjectMethods(Class<T> component) {
        List<Method> injectMethods = new ArrayList<>();
        Class<?> current = component;
        while (current != Object.class) {
            injectMethods.addAll(stream(current.getDeclaredMethods()).filter(m -> m.isAnnotationPresent(Inject.class))
                    .filter(m -> injectMethods.stream().noneMatch(o -> o.getName().equals(m.getName()) &&
                            Arrays.equals(o.getParameterTypes(), m.getParameterTypes())))
                    .filter(m -> stream(component.getDeclaredMethods()).filter(m1 -> !m1.isAnnotationPresent(Inject.class))
                            .noneMatch(o -> o.getName().equals(m.getName()) &&
                                    Arrays.equals(o.getParameterTypes(), m.getParameterTypes())))
                    .toList());
            current = current.getSuperclass();
        }
        Collections.reverse(injectMethods);
        return injectMethods;
    }

    private static <T> List<Field> getInjectFields(Class<T> component) {
        List<Field> injectFields = new ArrayList<>();
        Class<?> current = component;
        while (current != Object.class) {
            injectFields.addAll(stream(current.getDeclaredFields()).filter(f -> f.isAnnotationPresent(Inject.class))
                    .toList());
            current = current.getSuperclass();
        }
        return injectFields;
    }

    private static <Type> Constructor<Type> getInjectConstructor(Class<Type> implementation) {
        List<Constructor<?>> injectConstructors = stream(implementation.getConstructors())
                .filter(c -> c.isAnnotationPresent(Inject.class)).collect(Collectors.toList());
        if (injectConstructors.size() > 1) throw new IllegalComponentException();
        return (Constructor<Type>) injectConstructors.stream().findFirst().orElseGet(() -> {
            try {
                return implementation.getDeclaredConstructor();
            } catch (NoSuchMethodException e) {
                throw new IllegalComponentException();
            }
        });
    }
}

Context.java:
package geektime.tdd.di;


import java.util.Optional;


public interface Context {
    <Type> Optional<Type> get(Class<Type> type);
}
```

任务列表状态为：

- 无需构造的组件——组件实例
- 如果注册的组件不可实例化，则抛出异常

  - 抽象类
  - 接口

- 构造函数注入

  - 无依赖的组件应该通过默认构造函数生成组件实例
  - 有依赖的组件，通过Inject标注的构造函数生成组件实例
  - 如果所依赖的组件也存在依赖，那么需要对所依赖的组件也完成依赖注入
  - 如果组件有多于一个Inject标注的构造函数，则抛出异常
  - 如果组件没有Inject标注的构造函数，也没有默认构造函数（新增任务）
  - 如果组件需要的依赖不存在，则抛出异常
  - 如果组件间存在循环依赖，则抛出异常

- 字段注入

  - 通过Inject标注将字段声明为依赖组件
  - 如果字段为final则抛出异常
  - 依赖中应包含Inject Field声明的依赖

- 方法注入

  - 通过Inject标注的方法，其参数为依赖组件
  - 通过Inject标注的无参数方法，会被调用
  - 按照子类中的规则，覆盖父类中的Inject方法
  - 如果方法定义类型参数，则抛出异常
  - 依赖中应包含Inject Method声明的依赖

- 对Provider类型的依赖

  - 注入构造函数中可以声明对于Provider的依赖
  - 注入字段中可以声明对于Provider的依赖
  - 注入方法中可声明对于Provider的依赖

- 自定义Qualifier的依赖

  - 注册组件时，可额外指定Qualifier
  - 注册组件时，可从类对象上提取Qualifier
  - 寻找依赖时，需同时满足类型与自定义Qualifier标注
  - 支持默认Qualifier——Named

- Singleton生命周期

  - 注册组件时，可额外指定是否为Singleton
  - 注册组件时，可从类对象上提取Singleton标注
  - 对于包含Singleton标注的组件，在容器范围内提供唯一实例
  - 容器组件默认不是Single生命周期

- 自定义Scope标注

  - 可向容器注册自定义Scope标注的回调

## 视频演示

让我们进入今天的部分：

## 思考题

在进入下节课之前，希望你能认真思考如下两个问题，并选择最有感触的一道进行回答。

1. 你是怎么发现坏味道的？在重构的过程中，都使用了哪些重构手法呢？
2. 如果要对ContainerTest进行文档化改造，你会怎么做呢？

欢迎把你的想法分享在留言区，也欢迎把你的项目代码的链接分享出来。相信经过你的思考与实操，学习效果会更好！
<div><strong>精选留言（6）</strong></div><ul>
<li><span>张铁林</span> 👍（3） 💬（0）<p>https:&#47;&#47;github.com&#47;vfbiby&#47;tdd-di-container&#47;tree&#47;main&#47;doc
在这下面有每一章的“心法”，照着练，就不用看视频了，全程尽量跟着老师的步骤来。</p>2022-04-29</li><br/><li><span>aoe</span> 👍（1） 💬（0）<p>测试变文档

- 从文档角度优化测试
- 使用 @Nested 将功能分组
- 测试天然不是文档，而是你实现过程的记录
- 对测试进行足够提取和刻意的组织后才能变成真正的文档</p>2022-05-04</li><br/><li><span>临风</span> 👍（1） 💬（0）<p>代码坏味道就是你看了代码觉得不好理解的地方，本质就是为了提高代码的可维护性和可读性。之前我写代码的时候容易考虑很多，导致代码过度设计。后面学习代码重构手法之后，配合上TDD的使用，就有充足信心，减少甚至不考虑未来的拓展性问题。因为将来代码改动时，你可以通过重构的手法，使其适应改动的方向，再进行代码功能的增添，使代码能一直保持很高的可读性。
  另外对于测试代码的重构，老师的“测试天然表现的是开发实现的逻辑，测试天然不是文档”的观点让我印象深刻。之前也听过，你不要让别人通过逐行看代码来理解代码逻辑，而是要通过测试用例来告诉别人你的代码逻辑和功能，直到完成测试的重构才彻底明白了这一观点的由来。
  上次作业完成的时候，和老师的实现略有不同，经过老师的提示后，进行了重构。期间充分体会到TDD的好处，由于测试的充分覆盖，你的每个功能点都不用害怕代码的重构会不小心改坏了。看着简洁的代码，竟莫名有点小成就感。
  最后有个问题想问老师，这个container是因为只有自己一个人写，可以随心所欲。实际项目中，如何才能在缺少测试用例的情况下进行一定的代码重构呢？老师会建议直接复用代码，还是有其它好的方法呢？
  https:&#47;&#47;github.com&#47;lenwind&#47;TDD-Learn</p>2022-05-02</li><br/><li><span>奇小易</span> 👍（0） 💬（0）<p>Q: 如何发现坏味道？
  本文出现两个坏味道，
  一个是一个测试类的上下文中存在粒度(测试范围)不同的测试。
  另一个是测试本身不具有文档的性质，不好理解。
  据此可知，好的测试需要具备文档化的特点，好的测试需要在同一上下文保持一致的粒度，保持一致的命名思路。
  这些良好测试的特点就是用于识别坏味道的指导方针。</p>2022-06-03</li><br/><li><span>davix</span> 👍（0） 💬（0）<p>老師可否講講測試粒度的選擇、組織？TDD適不適合測試金字塔各個層？
  縱然大粒度測試應該少，但前提是大粒度測試的低效（如難維護的依賴，易出錯等）。如果像本項目這樣的純內存裡的測試，大粒度不是更合適嗎？更有利於內部的重構。</p>2022-05-25</li><br/><li><span>张铁林</span> 👍（0） 💬（0）<p>https:&#47;&#47;github.com&#47;vfbiby&#47;tdd-di-container
  我来贴一下代码，没有每一步小的做提交，主要是为了方便回滚到上一课，再来练习。</p>2022-04-29</li><br/>

</ul>
