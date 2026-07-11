你好，我是徐昊，今天我们来继续学习AI时代的软件工程。

上节课，我们系统性地介绍了使用大语言模型（Large Language Model，LLM）辅助软件开发的思路，也就是遵从测试驱动开发（Test Driven Development，TDD）的节奏，并与LLM结对编程（Pair Programming）完成需求。

那么，让我们使用这个思路，重新做一遍第15节课的例子，看看这一次有什么不一样。需求和之前是一样的：

> 我们中的大多数人都不得不时不时地解析一下命令行参数。如果我们没有一个方便的工具，那么我们就简单地处理一下传入main函数的字符串数组。有很多开源工具可以完成这个任务，但它们可能并不能完全满足我们的要求。所以我们再写一个吧。  
>    
> 传递给程序的参数由标志和值组成。标志应该是一个字符，前面有一个减号。每个标志都应该有零个或多个与之相关的值。例如：  
>    
> -l -p 8080 -d /usr/logs  
>    
> “l”（日志）没有相关的值，它是一个布尔标志，如果存在则为true，不存在则为false。“p”（端口）有一个整数值，“d”（目录）有一个字符串值。标志后面如果存在多个值，则该标志表示一个列表：  
>    
> -g this is a list -d 1 2 -3 5  
>    
> “g” 表示一个字符串列表\[“this”, “is”, “a”, “list”]，"d"标志表示一个整数列表\[1, 2, -3, 5]。  
>    
> 如果参数中没有指定某个标志，那么解析器应该指定一个默认值。例如，false代表布尔值，0代表数字， `""` 代表字符串，\[]代表列表。如果给出的参数与模式不匹配，重要的是给出一个好的错误信息，准确地解释什么是错误的。  
>    
> 确保你的代码是可扩展的，即如何增加新的数值类型是直接和明显的。

## 测试先行

这次做的时候我们会有一些不一样的地方。按照我们[上节课](https://time.geekbang.org/column/article/766281)讲的内容，首先要做的是明确架构和测试策略，然后进行任务分解。目前的需求非常简单，我们知道这是一个单体的应用，最简单的做法就是使用一个类完成所有的功能。需要的测试也就是对于这个类的功能测试。因而，我们目前的任务分解主要围绕功能需求进行。

通过如下的模板，我们可以使用LLM帮助我们分解任务：

> 功能需求
> ====
>
> {requirement}  
>    
> 任务
> ====
>
> 请根据上面的功能需求，列出需要测试的场景。描述场景，并给出相关的测试数据。

![](https://static001.geekbang.org/resource/image/2d/ec/2d739a4c3ae67615fd44f1be6be8deec.jpg?wh=2020x3333)  
简单阅读GPT的返回结果，我们就能发现几个错误：

1. 场景中存在大量的重复覆盖，比如2、4、6实际测试的是同样的场景。
2. 场景8实际不可测试，而且LLM在理解题目的时候，认为 “-l -p -d -g” 是唯一需要支持的参数，而不是通过配置可以扩展的设计。这就完全误解了题目的意思。

对比我们第一次使用LLM直接生成代码的情况，就会发现这些对于需求的误解是一直存在的，只不过第一次LLM生成的是生产代码，而这一次我们让它生产了测试列表。也就是说，**LLM从需求中提取到的知识是相同的。这些知识会被LLM应用到不同的场景中去**。**不正确的生产代码和不正确的测试列表，是同一份知识的不同表现形式**。

但是这里有个关键差别：**以自然语言产生的测试/任务列表，我们更容易发现错误，并提出反馈。而以代码形式表示的功能代码，我们却很难在第一时间发现错误。**因此我们就更需要在更早的时候提出反馈，避免错误的累积。

目前最重要的问题是，LLM认为 “-l -p -d -g” 是必需的参数，而不是通过可以配置的设计。我们首先要反馈调整这个问题：

> 需求中的-l -p -d -g 是例子，并不是必须支持的参数。参数是可配置，可扩展的。比如，用户配置了-x为int类型，那么就可以通过-x 100 指定。如果用户没有配置-p为int类型，那么-p就是非法参数。请按照这个补充，列出需要测试的场景。描述场景，并给出相关的测试数据。

GPT给出的结果如下图所示。

![](https://static001.geekbang.org/resource/image/3d/34/3da905eb5cb57e33b05fe245a0d7df34.jpg?wh=2000x3369)

这一次明显比之前的理解好了很多。虽然测试间仍然存在重复的情况，以及场景4这个更复杂的情况，处理得过于简单了，但是这些并不影响我们目前的操作。

接下来，我们可以让LLM帮助我们生产测试代码：

> 请不要考虑custom type的情况，测试的场景生成junit junpiter测试。  
> 要求：
>
> - 每个场景对应一个测试方法。
> - 被测试的类叫ArgumentParser。它的构造函数接受Map&lt;String, ArgumentType&gt;作为参数配置；
> - ArgumentParser的parse方法返回Map&lt;String, Object&gt;作为解析结果；
> - 验证时，通过从Map中获取对应参数值，完成验证

![](https://static001.geekbang.org/resource/image/af/e0/af705c7407ec7c71050908e3e58afbe0.jpg?wh=2000x377)

```plain
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.Map;

public class ArgumentParserTest {

    private ArgumentParser parser;

    @BeforeEach
    void setUp() {
        // 在每个测试前初始化解析器
        Map<String, ArgumentType> config = new HashMap<>();
        config.put("-l", ArgumentType.BOOLEAN);
        config.put("-p", ArgumentType.INTEGER);
        config.put("-d", ArgumentType.STRING);
        config.put("-g", ArgumentType.STRING_LIST);
        parser = new ArgumentParser(config);
    }

    @Test
    void testBooleanFlag() {
        // 测试布尔标志
        String input = "-l";
        Map<String, Object> result = parser.parse(input);
        assertTrue((Boolean) result.get("-l"));
    }

    @Test
    void testIntegerValue() {
        // 测试整数值
        String input = "-p 8080";
        Map<String, Object> result = parser.parse(input);
        assertEquals(8080, result.get("-p"));
    }

    @Test
    void testStringValue() {
        // 测试字符串值
        String input = "-d /usr/logs";
        Map<String, Object> result = parser.parse(input);
        assertEquals("/usr/logs", result.get("-d"));
    }

    @Test
    void testStringListValue() {
        // 测试字符串列表值
        String input = "-g this is a list";
        Map<String, Object> result = parser.parse(input);
        assertArrayEquals(new String[]{"this", "is", "a", "list"}, ((Object[]) result.get("-g")));
    }

    @Test
    void testDefaultValues() {
        // 测试默认值
        String input = "-l -p -d";
        Map<String, Object> result = parser.parse(input);
        assertTrue((Boolean) result.get("-l"));
        assertEquals(0, result.get("-p"));
        assertEquals("", result.get("-d"));
    }

    @Test
    void testMixedParameters() {
        // 测试混合参数
        String input = "-l -p 8080 -d /usr/logs -g this is a list";
        Map<String, Object> result = parser.parse(input);
        assertTrue((Boolean) result.get("-l"));
        assertEquals(8080, result.get("-p"));
        assertEquals("/usr/logs", result.get("-d"));
        assertArrayEquals(new String[]{"this", "is", "a", "list"}, ((Object[]) result.get("-g")));
    }

    @Test
    void testIllegalValue() {
        // 测试非法值
        String input = "-p not_an_integer";
        assertThrows(IllegalValueException.class, () -> parser.parse(input));
    }

    @Test
    void testUnconfiguredParameter() {
        // 测试未配置参数
        String input = "-x custom_value";
        assertThrows(UnconfiguredParameterException.class, () -> parser.parse(input));
    }
}

```

![](https://static001.geekbang.org/resource/image/7e/f7/7e5116b12635c78b0000e653b39cf8f7.jpg?wh=2000x397)

## 生成生产代码

不得不说，虽然与LLM给出的测试场景不太相关，但是LLM给出的测试代码质量还是非常不错的。那么，接下来我们就可以生成生产代码了。

> 请按照需求，生成ArgumentParser以及相关类，可以通过这组测试。

![](https://static001.geekbang.org/resource/image/5f/09/5fb01221bda2ab538007de6bfe3d0009.jpg?wh=2000x429)

```plain
import java.util.HashMap;
import java.util.Map;
public class ArgumentParser {
    private Map<String, ArgumentType> config;
    public ArgumentParser(Map<String, ArgumentType> config) {
        this.config = config;
    }
    public Map<String, Object> parse(String input) {
        Map<String, Object> result = new HashMap<>();
        String[] tokens = input.split("\\s+");
        for (int i = 0; i < tokens.length; i++) {
            String token = tokens[i];
            if (config.containsKey(token)) {
                ArgumentType type = config.get(token);
                switch (type) {
                    case BOOLEAN:
                        result.put(token, true);
                        break;
                    case INTEGER:
                        i++;
                        try {
                            result.put(token, Integer.parseInt(tokens[i]));
                        } catch (NumberFormatException e) {
                            throw new IllegalValueException("Illegal value for parameter: " + tokens[i - 1]);
                        }
                        break;
                    case STRING:
                        i++;
                        result.put(token, tokens[i]);
                        break;
                    case STRING_LIST:
                        i++;
                        result.put(token, tokens[i].split(" "));
                        break;
                    default:
                        // Handle custom types if needed
                        break;
                }
            } else {
                throw new UnconfiguredParameterException("Unconfigured parameter: " + token);
            }
        }
        return result;
    }
}
enum ArgumentType {
    BOOLEAN,
    INTEGER,
    STRING,
    STRING_LIST,
    CUSTOM_TYPE // Add more types as needed
}
class IllegalParameterException extends RuntimeException {
    public IllegalParameterException(String message) {
        super(message);
    }
}
class IllegalValueException extends RuntimeException {
    public IllegalValueException(String message) {
        super(message);
    }
}
class UnconfiguredParameterException extends RuntimeException {
    public UnconfiguredParameterException(String message) {
        super(message);
    }
}
```

![](https://static001.geekbang.org/resource/image/08/3f/08e0a06ec28bdb89f8c4e4c4b876313f.jpg?wh=2000x385)

那么接下来，让我们跑一下测试看看结果。

![](https://static001.geekbang.org/resource/image/1d/42/1dcd21a520489c0dfd5bf5b867d23b42.jpg?wh=2896x2062)

一共8个测试，通过了5个失败了3个。其中比较重要的是testStringListValue，错误信息是这样的：

```plain
@Test
void testStringListValue() {
    // 测试字符串列表值
    String input = "-g this is a list";
    Map<String, Object> result = parser.parse(input);
    assertArrayEquals(new String[]{"this", "is", "a", "list"}, ((Object[]) result.get("-g")));
}
```

> UnconfiguredParameterException: Unconfigured parameter: is  
> at ArgumentParser.parse(ArgumentParser.java:45)  
> at ArgumentParserTest.testStringListValue(ArgumentParserTest.java:51)  
> at java.base/java.lang.reflect.Method.invoke(Method.java:580)  
> at java.base/java.util.ArrayList.forEach(ArrayList.java:1596)  
> at java.base/java.util.ArrayList.forEach(ArrayList.java:1596)

也就是说，目前代码中只能处理单值的情况，并不能处理多值的情况。那么我们可以让LLM帮助我们修改：

> 执行测试的错误信息如下，请根据错误信息，修改ArgumentParse的代码：  
>    
> UnconfiguredParameterException: Unconfigured parameter: is  
> at ArgumentParser.parse(ArgumentParser.java:45)  
> at ArgumentParserTest.testStringListValue(ArgumentParserTest.java:51)  
> at java.base/java.lang.reflect.Method.invoke(Method.java:580)  
> at java.base/java.util.ArrayList.forEach(ArrayList.java:1596)  
> at java.base/java.util.ArrayList.forEach(ArrayList.java:1596)

![](https://static001.geekbang.org/resource/image/c5/yb/c582b3404d4b50c40cb7b6b3a15c4yyb.jpg?wh=2000x2090)

此时需要注意，ChatGPT尝试通过修改测试的方式蒙混过关。我们需要坚守目前**生产代码领航员的角色**，对GPT作出要求：

> 不是测试的问题，请修改ArgumentParser的逻辑

![](https://static001.geekbang.org/resource/image/96/ce/9689f38156315f2811c9ab1fc2141dce.jpg?wh=2000x389)

```plain
public class ArgumentParser {
    private Map<String, ArgumentType> config;
    public ArgumentParser(Map<String, ArgumentType> config) {
        this.config = config;
    }
    public Map<String, Object> parse(String input) {
        Map<String, Object> result = new HashMap<>();
        String[] tokens = input.split("\\s+");
        for (int i = 0; i < tokens.length; i++) {
            String token = tokens[i];
            if (config.containsKey(token)) {
                ArgumentType type = config.get(token);
                switch (type) {
                    case BOOLEAN:
                        result.put(token, true);
                        break;
                    case INTEGER:
                        i++;
                        try {
                            result.put(token, Integer.parseInt(tokens[i]));
                        } catch (NumberFormatException e) {
                            throw new IllegalValueException("Illegal value for parameter: " + tokens[i - 1]);
                        }
                        break;
                    case STRING:
                        i++;
                        result.put(token, tokens[i]);
                        break;
                    case STRING_LIST:
                        i++;
                        List<String> stringList = new ArrayList<>();
                        while (i < tokens.length && !tokens[i].startsWith("-")) {
                            stringList.add(tokens[i]);
                            i++;
                        }
                        result.put(token, stringList.toArray(new String[0]));
                        i--;  // Decrement to correctly process the next token in the loop
                        break;
                    default:
                        // Handle custom types if needed
                        break;
                }
            } else {
                throw new UnconfiguredParameterException("Unconfigured parameter: " + token);
            }
        }
        return result;
    }
}
```

![](https://static001.geekbang.org/resource/image/eb/78/eb72cd139988702fbe5dede0e65dab78.jpg?wh=2000x392)

我们再次运行测试：

![](https://static001.geekbang.org/resource/image/c7/61/c77183a21d50d0958bc652ac7a5fd061.jpg?wh=2928x2045)

就这时我们会发现只剩了一个没有通过的测试。而仔细查看会发现这个测试构造有问题。我们也不需要通过LLM再次修改了。自己直接改掉就行：

```plain
@Test
void testDefaultValues() {
    // 测试默认值
    String input = "";
    Map<String, Object> result = parser.parse(input);
    assertFalse((Boolean) result.get("-l"));
    assertEquals(0, result.get("-p"));
    assertEquals("", result.get("-d"));
}
```

再次执行，仍然失败，这时候我们发现代码中并没有对于默认值的处理。反馈给LLM：

> 目前代码中没有对于默认值的处理，请求改变ArgumentParser的逻辑，让它能够通过下面的测试：  
>    
> @Test  
> void testDefaultValues() {  
>     // 测试默认值  
>     String input = “”;  
>     Map&lt;String, Object&gt; result = parser.parse(input);  
>     assertFalse((Boolean) result.get(“-l”));  
>     assertEquals(0, result.get(“-p”));  
>     assertEquals(“”, result.get(“-d”));  
> }

![](https://static001.geekbang.org/resource/image/e9/72/e9d947c9afd5516f711e92dfd8ded472.jpg?wh=2000x391)

```plain
public class ArgumentParser {
    private Map<String, ArgumentType> config;
    public ArgumentParser(Map<String, ArgumentType> config) {
        this.config = config;
    }
    public Map<String, Object> parse(String input) {
        Map<String, Object> result = new HashMap<>();
        String[] tokens = input.split("\\s+");
        if (tokens.length == 1 && tokens[0].isEmpty()) {
            // Handle empty input
            setDefaultValues(result);
            return result;
        }
        for (int i = 0; i < tokens.length; i++) {
            String token = tokens[i];
            if (config.containsKey(token)) {
                ArgumentType type = config.get(token);
                switch (type) {
                    case BOOLEAN:
                        result.put(token, true);
                        break;
                    case INTEGER:
                        i++;
                        try {
                            result.put(token, Integer.parseInt(tokens[i]));
                        } catch (NumberFormatException e) {
                            throw new IllegalValueException("Illegal value for parameter: " + tokens[i - 1]);
                        }
                        break;
                    case STRING:
                        i++;
                        result.put(token, tokens[i]);
                        break;
                    case STRING_LIST:
                        i++;
                        List<String> stringList = new ArrayList<>();
                        while (i < tokens.length && !tokens[i].startsWith("-")) {
                            stringList.add(tokens[i]);
                            i++;
                        }
                        result.put(token, stringList.toArray(new String[0]));
                        i--;  // Decrement to correctly process the next token in the loop
                        break;
                    default:
                        // Handle custom types if needed
                        break;
                }
            } else {
                throw new UnconfiguredParameterException("Unconfigured parameter: " + token);
            }
        }
        return result;
    }
    private void setDefaultValues(Map<String, Object> result) {
        for (Map.Entry<String, ArgumentType> entry : config.entrySet()) {
            String param = entry.getKey();
            ArgumentType type = entry.getValue();
            if (!result.containsKey(param)) {
                switch (type) {
                    case BOOLEAN:
                        result.put(param, false);
                        break;
                    case INTEGER:
                        result.put(param, 0);
                        break;
                    case STRING:
                        result.put(param, "");
                        break;
                    case STRING_LIST:
                        result.put(param, new String[0]);
                        break;
                    default:
                        // Handle custom types if needed
                        break;
                }
            }
        }
    }
}
```

![](https://static001.geekbang.org/resource/image/14/53/1430f70db5716410a4bae76e0c335c53.jpg?wh=2000x399)

现在我们再来跑一次测试，结果如下。

![](https://static001.geekbang.org/resource/image/b7/be/b7605094fca653c2a429c727dbb29cbe.jpg?wh=2917x2079)

## 小结

到此为止，我们基本上完成了这个功能。对比第一次实现这个功能，我们迭代的次数更少，完成的过程中更有把握，严重的设计问题在早期就得到了重视。

我们做出的改变有这么几个：

- 通过测试列表，更加关注与LLM对齐对于知识的理解；
- 以测试驱动的方式，遵守“红-绿-重构”的节奏；
- 按照“导航员-司机”的模式与LLM结对。

这些改变让我们在获得速度提升的时候，保证了代码的质量，得到了真正的效率提升。

## 思考题

请总结在这个过程中，我们使用了哪些认知行为模式。

欢迎你在留言区分享自己的思考或疑惑，我们会把精彩内容置顶供大家学习讨论。
<div><strong>精选留言（8）</strong></div><ul>
<li><span>Gojustforfun</span> 👍（2） 💬（2）<p>我一直有一个疑问，到底是任务列表？还是测试列表？

还是先根据软件架构和测试策略将需求切到足够小，形成任务列表，在针对任务列表中的每个任务写出测试，从而形成测试列表。

之前提到过用户故事及验收条件，用户故事需要根据软件架构和测试策略再切分吗？验收条件，是不是就是测试列表或者测试列表的一部分？

后面会有复杂点的例子，介绍需求如何从用户故事，到被不同软件架构，测试策略组合影响，从而导出不同的任务列表，进而导出测试列列表的过程吗？</p>2024-04-15</li><br/><li><span>起个名称吧</span> 👍（0） 💬（1）<p>我认为应该是庞杂+清晰
庞杂的认知行为模式，从gpt给与的需求拆分的任务列表，我们和llm进行认知对齐，帮其弥补llm认知需求的差异，在该模式下我们根据对齐的任务列表生成测试代码和生产代码
清晰的认知行为模式，根据测试代码执行进行测试来发现生产代码上的遗漏，发现错误,与llm进行交互调整生产代码，最终完成测试的通过。
这里有两个疑问

1. 假设根据测试代码执行发现未知的错误(此时无法与gpt进行交互)，我们也不理解改错误的信息，我们此时就需要debug一步步调试，此时我们本身又处于复杂模式下(探索-感知-响应)，而可以和llm交互后我们又处于清晰模式下(感知-分类-响应)。我们因为一个llm帮助我们的认知行为发生了两个重大的变更吗？
2. TDD测试驱动,红-绿-重构，这节课里没看到重构循环,感觉缺少了点啥</p>2024-04-15</li><br/><li><span>FARO_Z</span> 👍（2） 💬（0）<p>感觉 LLM 只能比较好的生成单点功能的代码，一般也就是工具类

如果涉及到业务上下文，不是歇菜，就是要喂大量 promot 进行调校。有这功夫代码早写完了

感觉目前 LLM 对于程序员最大的帮助在于阅读源码上面，对于已有内容 LLM 能作为一个很好的索引器，帮助快速理清代码上下文。至于很多业务驱动的工程，还是先不要动 LLM 提升工作效率的念头了吧</p>2024-08-13</li><br/><li><span>范飞扬</span> 👍（2） 💬（0）<p>感谢老师，已经用到工作中了。
目前我们只让GPT进行了需求分解。
盲猜一波，接下来应该让gpt，不仅根据需求分解，还要根据架构，分解成功能上下文的任务项。

再根据任务项，列出测试场景和测试数据。
然后生成测试用例。
最后生成代码。

（这其中，我觉得还可以提供现有测试类的代码作为few shot，而且测试类也蕴含了SUT的API如何使用的信息）</p>2024-04-16</li><br/><li><span>aoe</span> 👍（1） 💬（0）<p>学习后收获了 2 个模版
练习后获得经验：需要认真检查 AI 列出的测试场景，不然会出现奇怪的代码！

实用的 AI 模版
======

列出测试场景
----------------

功能需求
====

{requirement}

任务
====

请根据上面的功能需求，列出需要测试的场景。描述场景，并给出相关的测试数据。

编写测试代码
----------------

请生成 junit junpiter 测试
要求：
每个场景对应一个测试方法
使用 Kotlin 编写
使用 TDD 中的 should style 编写测试

详见 https:&#47;&#47;wyyl1.com&#47;post&#47;28&#47;17</p>2024-04-15</li><br/><li><span>6点无痛早起学习的和尚</span> 👍（0） 💬（0）<p>有个问题，那如何把 TDD 与 LLM 结合写业务代码呢？
如果按照 16 节的内容，逻辑就是拆分一个业务功能的架构，比如 http 层、业务逻辑层、数据层
然后对业务逻辑层写清楚诉求，然后跟 LLM 结队编程吗？运用本篇内容</p>2024-05-04</li><br/><li><span>术子米德</span> 👍（0） 💬（0）<p>&#47;&#47; Question by EnigmaWU: generate could missing ut code for me
&#47;&#47; Answer from ChatCopilot:
TEST(CC_parseCmdLineArgs, LogSavingDir) {
CC_CmdLineArgs_T CmdLineArgs;
char *argv[] = {(char *)&quot;test&quot;, (char *)&quot;-d&quot;, (char *)&quot;&#47;path&#47;to&#47;log&quot;};
EXPECT_EQ(CC_SUCCESS, CC_parseCmdLineArgs(3, argv, &amp;CmdLineArgs));
EXPECT_FALSE(CmdLineArgs.IsLoggingEnabled);
EXPECT_EQ(0, CmdLineArgs.RecvPort);
EXPECT_STREQ(&quot;&#47;path&#47;to&#47;log&quot;, CmdLineArgs.pLogSavingDir);
}

TEST(CC_parseCmdLineArgs, InvalidArgs) {
CC_CmdLineArgs_T CmdLineArgs;
char *argv[] = {(char *)&quot;test&quot;, (char *)&quot;invalid&quot;};
EXPECT_EQ(CC_FAIL, CC_parseCmdLineArgs(2, argv, &amp;CmdLineArgs));
}

TEST(CC_parseCmdLineArgs, MissingValueForPort) {
CC_CmdLineArgs_T CmdLineArgs;
char *argv[] = {(char *)&quot;test&quot;, (char *)&quot;-p&quot;};
EXPECT_EQ(CC_FAIL, CC_parseCmdLineArgs(2, argv, &amp;CmdLineArgs));
}

TEST(CC_parseCmdLineArgs, MissingValueForDir) {
CC_CmdLineArgs_T CmdLineArgs;
char *argv[] = {(char *)&quot;test&quot;, (char *)&quot;-d&quot;};
EXPECT_EQ(CC_FAIL, CC_parseCmdLineArgs(2, argv, &amp;CmdLineArgs));
}

TEST(CC_parseCmdLineArgs, NonNumericPort) {
CC_CmdLineArgs_T CmdLineArgs;
char *argv[] = {(char *)&quot;test&quot;, (char *)&quot;-p&quot;, (char *)&quot;nonnumeric&quot;};
EXPECT_EQ(CC_FAIL, CC_parseCmdLineArgs(3, argv, &amp;CmdLineArgs));
}

TEST(CC_parseCmdLineArgs, MultipleSameArgs) {
CC_CmdLineArgs_T CmdLineArgs;
char *argv[] = {(char *)&quot;test&quot;, (char *)&quot;-l&quot;, (char *)&quot;-l&quot;};
EXPECT_EQ(CC_SUCCESS, CC_parseCmdLineArgs(3, argv, &amp;CmdLineArgs));
EXPECT_TRUE(CmdLineArgs.IsLoggingEnabled);
}

TEST(CC_parseCmdLineArgs, ArgsInDifferentOrder) {
CC_CmdLineArgs_T CmdLineArgs;
char *argv[] = {(char *)&quot;test&quot;, (char *)&quot;-p&quot;, (char *)&quot;1234&quot;, (char *)&quot;-l&quot;, (char *)&quot;-d&quot;, (char *)&quot;&#47;path&#47;to&#47;log&quot;};
EXPECT_EQ(CC_SUCCESS, CC_parseCmdLineArgs(6, argv, &amp;CmdLineArgs));
EXPECT_TRUE(CmdLineArgs.IsLoggingEnabled);
EXPECT_EQ(1234, CmdLineArgs.RecvPort);
EXPECT_STREQ(&quot;&#47;path&#47;to&#47;log&quot;, CmdLineArgs.pLogSavingDir);
}</p>2024-04-15</li><br/><li><span>术子米德</span> 👍（0） 💬（0）<p>&#47;&#47; Chat with Copilot, Question by EnigmaWU:
&#47;&#47; #file:CC_parseCmdLineArgs.c #file:CC_parseCmdLineArgsTest_byCopilot.cxx
&#47;&#47; what UT already written and what UT is missed?

&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;&#47;
&#47;&#47; Answer from ChatCopilot:
&#47;**
The unit tests that are already written for the CC_parseCmdLineArgs function in the CC_parseCmdLineArgsTest_byCopilot.cxx file
are:

NullCmdLineArgs: Tests the function with argc as 0 and argv as NULL.
NullCmdLineArgsPtr: Tests the function with argc as 0, argv as NULL, and pCmdLineArgs as NULL.
NoArgs: Tests the function with no command line arguments.
LoggingEnabled: Tests the function with the logging enabled argument -l.
RecvPort: Tests the function with the receive port argument -p and a value.
LogSavingDir: Tests the function with the log saving directory argument -d and a value.
AllArgs: Tests the function with all possible arguments.
The unit tests that are missing could be:

InvalidArgs: Tests the function with invalid arguments that do not start with -.
MissingValueForPort: Tests the function with the -p argument but without a value following it.
MissingValueForDir: Tests the function with the -d argument but without a value following it.
NonNumericPort: Tests the function with a non-numeric value for the -p argument.
MultipleSameArgs: Tests the function with multiple instances of the same argument.
ArgsInDifferentOrder: Tests the function with all possible arguments in a different order.
**&#47;</p>2024-04-15</li><br/>
</ul>
