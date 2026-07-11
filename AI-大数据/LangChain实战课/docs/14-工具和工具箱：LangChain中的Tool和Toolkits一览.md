你好，我是黄佳，欢迎来到LangChain实战课！

这节课我们来一起看一看LangChain中各种强大的工具（Tool），以及如何使用它们。

在之前的几节课中，我们深入讲解了LangChain中的代理。未来的AI Agent，应该就是以LLM为核心控制器的代理系统。而**工具，则是代理身上延展出的三头六臂，是代理的武器，代理通过工具来与世界进行交互，控制并改造世界**。

## 工具是代理的武器

LangChain之所以强大，第一是大模型的推理能力强大，第二则是工具的执行能力强大！孙猴子法力再强，没有金箍棒，也降伏不了妖怪。大模型再能思考，没有工具也不行。

工具是代理可以用来与世界交互的功能。这些工具可以是通用实用程序（例如搜索），也可以是其他链，甚至其他的代理。

那么到底什么是工具？在LangChain中，工具是如何发挥作用的？

LangChain通过提供一个统一的框架来集成功能的具体实现。在这个框架中，每个功能都被封装成一个工具。每个工具都有自己的输入和输出，以及处理这些输入和生成输出的方法。

当代理接收到一个任务时，它会根据任务的类型和需求，通过大模型的推理，来选择合适的工具处理这个任务。这个选择过程可以基于各种策略，例如基于工具的性能，或者基于工具处理特定类型任务的能力。

一旦选择了合适的工具，LangChain就会将任务的输入传递给这个工具，然后工具会处理这些输入并生成输出。这个输出又经过大模型的推理，可以被用作其他工具的输入，或者作为最终结果，被返回给用户。

![](https://static001.geekbang.org/resource/image/eb/b6/ebcyyaccd79133c03f417c45c225d1b6.png?wh=1456x636 "LLM 和工具之间相互依存")

通过这种方式，LangChain 大大延展了大模型的功能。大模型的推理，加上工具的调用，都集成在一个系统中，而这个系统可以处理多种类型的任务。这提高了系统的灵活性和可扩展性，也大大简化了开发者的工作。

## 如何加载工具

在程序中，可以使用以下代码片段加载工具。

```plain
from langchain.agents import load_tools
tool_names = [...]
tools = load_tools(tool_names)
```

某些工具（例如链、代理）可能需要 LLM 来初始化它们。

```plain
from langchain.agents import load_tools
tool_names = [...]
llm = ...
tools = load_tools(tool_names, llm=llm)
```

## LangChain 支持的工具一览

下面，我给你列出目前LangChain中所支持的工具。

![](https://static001.geekbang.org/resource/image/e2/5b/e2f8a0318b4f1da7f0e756e87761d95b.jpg?wh=1459x2148)

当然这个列表随着时间的推移会越来越长，也就意味着LangChain的功能会越来越强大。

## 使用 arXiv 工具开发科研助理

其中有一些工具，比如SerpAPI，你已经用过了，这里我们再来用一下arXiv工具。arXiv本身就是一个论文研究的利器，里面的论文数量比AI顶会还早、还多、还全。那么把它以工具的形式集成到LangChain中，能让你在研究学术最新进展时如虎添翼。

> arXiv是一个提供免费访问的预印本库，供研究者在正式出版前上传和分享其研究工作。它成立于1991年，最初是作为物理学预印本数据库开始的，但后来扩展到了数学、计算机科学、生物学、经济学等多个领域。  
>    
> 预印本是研究者完成的、但尚未经过同行评议或正式出版的论文。Arxiv允许研究者上传这些预印本，使其他研究者可以在正式出版之前查看、评论和使用这些工作。这样，研究的发现可以更快地传播和分享，促进学术交流。

```plain
# 设置OpenAI API的密钥
import os
os.environ["OPENAI_API_KEY"] = 'Your Key'

# 导入库
from langchain.chat_models import ChatOpenAI
from langchain.agents import load_tools, initialize_agent, AgentType

# 初始化模型和工具
llm = ChatOpenAI(temperature=0.0)
tools = load_tools(
    ["arxiv"],
)

# 初始化链
agent_chain = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)

# 运行链
agent_chain.run("介绍一下2005.14165这篇论文的创新点?")
```

首先，我们还是来研究一下ZERO\_SHOT\_REACT\_DESCRIPTION这个Agent是怎么通过提示来引导模型调用工具的。

> “prompts”: [  
>     "Answer the following questions as best you can. You have access to the following tools:\\n\\n

首先告诉模型，要尽力回答问题，但是可以访问下面的工具。

> **arxiv:** A wrapper around Arxiv.org Useful for when you need to answer questions about Physics, Mathematics, Computer Science, Quantitative Biology, Quantitative Finance, Statistics, Electrical Engineering, and Economics from scientific articles on arxiv.org. Input should be a search query.\\n\\n

arxiv工具：一个围绕Arxiv.org的封装工具。当你需要回答关于物理学、数学、计算机科学、定量生物学、定量金融、统计学、电气工程和经济学的问题时，来自arxiv.org上的科学文章非常有用。同时还告诉模型：输入这个工具的内容应该是搜索查询。

> Use the following format:\\n\\n

指导模型输出下面的内容。

> Question: the input question you must answer\\n （问题：需要回答的问题）  
> Thought: you should always think about what to do\\n （思考：应该总是思考下一步做什么）  
> Action: the action to take, should be one of \[arxiv]\\n （行动：从具体工具列表中选择行动——这里只有arxiv一个工具）  
> Action Input: the input to the action\\n （行动的输入：输入工具的内容）  
> Observation: the result of the action\\n… （观察：工具返回的结果）  
> (this Thought/Action/Action Input/Observation can repeat N times)\\n （上面 Thought/Action/Action Input/Observation 的过程将重复N次）  
> Thought: I now know the final answer\\n （现在我知道最终答案了）  
> Final Answer: the final answer to the original input question\\n\\n （原始问题的最终答案）

> **Begin!**\\n\\n

现在开始！

> **Question**: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models’这篇论文的创新点\\n

真正的问题在此。

> Thought:"

开始思考吧！

然后，我们来看看Chain的运行过程。

![](https://static001.geekbang.org/resource/image/6e/57/6e1195d608d47fbe5b67131c1fe32357.jpg?wh=1041x1519)

其中，代理的思考过程中的第一个返回结果如下：

> “text”: " I need to read the paper to understand the innovation\\n （思考：我需要阅读文章才能理解创新点）  
> Action: arxiv\\n （行动：arxiv工具）  
> Action Input: ‘Chain-of-Thought Prompting Elicits Reasoning in Large Language Models’", （行动的输入：论文的标题）

因为在之前的提示中，LangChain告诉大模型，对于Arxiv工具的输入总是以搜索的形式出现，因此尽管我指明了论文的ID，Arxiv还是根据这篇论文的关键词搜索到了3篇相关论文的信息。

模型对这些信息进行了总结，认为信息已经完善，并给出了最终答案。

> Thought: I now know the final answer

想法：我现在知道了最终答案。

> Final Answer: The innovation of the paper ‘Chain-of-Thought Prompting Elicits Reasoning in Large Language Models’ is the introduction of a simple method called chain of thought prompting, where a few chain of thought demonstrations are provided as exemplars in prompting, which significantly improves the ability of large language models to perform complex reasoning."

最终答案：这篇名为《链式思考提示促使大型语言模型进行推理》的论文的创新之处在于，引入了一种简单的方法，即链式思考提示，在提示中提供了一些链式思考的示例，这大大提高了大型语言模型执行复杂推理的能力。

## LangChain 中的工具箱一览

下面，我给你列出了目前LangChain中所支持的工具箱。每个工具箱中都有一系列工具。

![](https://static001.geekbang.org/resource/image/c8/27/c87be0638409b278c2657a66f45aa927.jpg?wh=1223x1314)

## 使用 Gmail 工具箱开发个人助理

刚才，你使用了arXiv工具帮助你做了一些科研工作。你当然还希望你的AI Agent能够成为你的全能自动助理，你开发出的智能应用应该能帮你检查邮件、写草稿，甚至发邮件、写文档，对吧？

上面这一切的一切，LangChain当然能够安排上！

- 通过Gmail工具箱，你可以通过LangChain应用检查邮件、删除垃圾邮件，甚至让它帮你撰写邮件草稿。
- 通过Office365工具箱，你可以让LangChain应用帮你读写文档、总结文档，甚至做PPT。
- 通过GitHub工具箱，你可以指示LangChain应用来检查最新的代码，Commit Changes、Merge Branches，甚至尝试让大模型自动回答 Issues 中的问题——反正大模型解决代码问题的能力本来就更强。

这些都不再是梦想。

下面咱们从一个最简单的应用开始。

**目标：我要让AI应用来访问我的Gmail邮件，让他每天早晨检查一次我的邮箱，看看“易速鲜花”的客服有没有给我发信息。**（因为我可能正在焦急地等待他们的退款😁）

现在开始。

### 第一步：在 Google Cloud 中设置你的应用程序接口

这个步骤你要跟着Gmail API的官方配置[链接](https://developers.google.com/gmail/api/quickstart/python?hl=zh-cn#authorize_credentials_for_a_desktop_application)完成，这个和LangChain无关。蛮复杂的，你需要有点耐心。跟着流程一步步配置就好了。

下面是我在这个设置过程中截取的一部分图片，只是供你参考。详细配置你要follow Google的官方说明。

![](https://static001.geekbang.org/resource/image/8a/21/8a3c72f48c231bd2d886b4d99e9f3321.jpg?wh=1170x854 "创建你的 Project（每人有 12 个免费的 Project）")

![](https://static001.geekbang.org/resource/image/38/ab/3822d1effb90c855c133acdecea2eaab.jpg?wh=1930x711 "Gmail API")

![](https://static001.geekbang.org/resource/image/96/f3/96a788e8a1f7d4f32e3d23eb94cce8f3.jpg?wh=1688x1172 "Enable 它")

![](https://static001.geekbang.org/resource/image/0f/29/0f746cfa48ba60c0fe98e657cb3yyb29.jpg?wh=1925x810 "Create Credentials")

下面这个OAuth同意屏幕里面的配置非常重要，你的智能代理能做什么，不能做什么，就看你怎么给权限了！

![](https://static001.geekbang.org/resource/image/19/2f/195ec3590bb075ecff42911f13d2f22f.jpg?wh=823x1214)

所有设置都完成之后，在OAuth客户段已创建这个页面，你拥有了开发密钥。

![](https://static001.geekbang.org/resource/image/f6/b0/f6829a70c320161a1002ee3380c5b1b0.jpg?wh=506x509 "可以下载的开发密钥")

### 第二步：根据密钥生成开发 Token

在这一步之前，你可能需要安装一些相关的包。

```plain
pip install --upgrade google-api-python-client 
pip install --upgrade google-auth-oauthlib
pip install --upgrade google-auth-httplib2
```

然后，把密钥下载下来，保存为credentials.json。

运行下面的代码，生成token.json。

```plain
from __future__ import print_function

import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']



def main():
    """Shows basic usage of the Gmail API.
    Lists the user's Gmail labels.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=8088)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        # Call the Gmail API
        service = build('gmail', 'v1', credentials=creds)
        results = service.users().labels().list(userId='me').execute()
        labels = results.get('labels', [])

        if not labels:
            print('No labels found.')
            return
        print('Labels:')
        for label in labels:
            print(label['name'])

    except HttpError as error:
        # TODO(developer) - Handle errors from gmail API.
        print(f'An error occurred: {error}')



if __name__ == '__main__':
    main()
```

这是Google API网站提供的标准示例代码，里面给了读取权限（gmail.readonly）的Token，如果你要编写邮件，甚至发送邮件，需要根据需求来调整权限。更多细节可以参阅Google API的[文档](https://cloud.google.com/compute/docs/apis?hl=zh-cn)。

这个程序会生成一个token.json文件，是有相关权限的开发令牌。这个文件在LangChain应用中需要和密钥一起使用。

![](https://static001.geekbang.org/resource/image/54/78/541c541b377063b49d74ddc53f41d578.jpg?wh=304x55)

把密钥和Token文件都放在程序的同一个目录中，你就可以开始开发应用程序了。

![](https://static001.geekbang.org/resource/image/f2/b4/f23144b35b44fef8d900d0d50c9da6b4.jpg?wh=147x52)

### 第三步：用 LangChain 框架开发 Gmail App

这段代码的核心目的是连接到Gmail API，查询用户的邮件，并通过LangChain的Agent框架智能化地调用API（用语言而不是具体API），与邮件进行互动。

```plain
# 设置OpenAI API的密钥
import os
os.environ["OPENAI_API_KEY"] = 'Your Key' 

# 导入与Gmail交互所需的工具包
from langchain.agents.agent_toolkits import GmailToolkit

# 初始化Gmail工具包
toolkit = GmailToolkit()

# 从gmail工具中导入一些有用的功能
from langchain.tools.gmail.utils import build_resource_service, get_gmail_credentials

# 获取Gmail API的凭证，并指定相关的权限范围
credentials = get_gmail_credentials(
    token_file="token.json",  # Token文件路径
    scopes=["https://mail.google.com/"],  # 具有完全的邮件访问权限
    client_secrets_file="credentials.json",  # 客户端的秘密文件路径
)
# 使用凭证构建API资源服务
api_resource = build_resource_service(credentials=credentials)
toolkit = GmailToolkit(api_resource=api_resource)

# 获取工具
tools = toolkit.get_tools()
print(tools)

# 导入与聊天模型相关的包
from langchain.chat_models import ChatOpenAI
from langchain.agents import initialize_agent, AgentType

# 初始化聊天模型
llm = ChatOpenAI(temperature=0, model='gpt-4')

# 通过指定的工具和聊天模型初始化agent
agent = initialize_agent(
    tools=toolkit.get_tools(),
    llm=llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
)

# 使用agent运行一些查询或指令
result = agent.run(
    "今天易速鲜花客服给我发邮件了么？最新的邮件是谁发给我的？"
)

# 打印结果
print(result) 
```

代码的核心部分主要是连接到Gmail API，获取用户的邮件数据，并通过特定的 Agent 查询这些数据。

你的请求是查询今天是否收到了来自“易速鲜花客服”的邮件，以及最新邮件的发送者是谁。**这个请求是模糊的，是自然语言格式，具体调用什么API，由Agent、Tool也就是Gmail API它俩商量着来。**这与我们之前所进行的清晰的、具体API调用式的应用开发迥然不同。

第一次运行程序，会进行一些确认，并让我Login我的Gmail。

![](https://static001.geekbang.org/resource/image/0e/37/0e2a7df295caa50512552e05ea3def37.jpg?wh=562x146)

![](https://static001.geekbang.org/resource/image/32/51/3208ff117674ebf3f08eac6118393e51.jpg?wh=488x664)

![](https://static001.geekbang.org/resource/image/0c/30/0cc81560c4bc412104b5144a474c5530.jpg?wh=546x119)

之后，我就得到了智能助手的回答！

![](https://static001.geekbang.org/resource/image/45/cf/455f8cb0138cd3860869e5eee74f8ecf.jpg?wh=1296x605)

她说：**主人，看起来你没有收到“易速鲜花”的邮件耶，还需要我帮你做些什么吗？**真的很贴心，这样的话，我每天早晨就不需要自己去检查邮件啦！

后来，我又问她，那么谁给我发来了新邮件呢？

![](https://static001.geekbang.org/resource/image/c9/e4/c95a8e75cdc78a7da4960c8f2yyf8be4.jpg?wh=1291x159)

她告诉我说，Medium - Programing 给我发了一篇 VS code 的 10 个 tips 的文章，还有Kubernetes的点子啥的。

嗯，这是我订阅的内容。下一步，我还可以让她针对这些内容给我总结总结！这也是她的强项！

## 总结时刻

学到现在，你应该对LangChain 的核心价值有了更深的感悟吧。它的价值，在于它将模型运行和交互的复杂性进行了封装和抽象化，为开发者提供了一个更简单、更直观的接口来利用大模型。

- **集成多模型和多策略：**LangChain 提供了一种方法，使得多个模型或策略能够在一个统一的框架下工作。例如，arXiv 是一个单独的工具，它负责处理特定的任务。这种工具可以与其他工具（例如用于处理自然语言查询或者数据库查询的工具）一起作为一个集成的系统存在。这样，你可以轻松地创建一个系统，该系统可以处理多种类型的输入并执行多种任务，而不必为每个任务单独写代码。
- **更易于交互和维护：**通过 LangChain，你可以更方便地管理和维护你的工具和模型。LangChain 提供的工具和代理（Agent）抽象使得开发者可以将关注点从底层实现细节转向实现应用的高层逻辑。而且，LangChain封装了像模型的加载、输入输出的处理、工具的调度等底层任务，使得开发者能够更专注于如何组合这些工具以解决实际问题。
- **适应性：**LangChain 提供的架构允许你轻松地添加新的工具或模型，或者替换现有的工具或模型。这种灵活性使得你的系统可以很容易地适应新的需求或改变。
- **可解释性：**LangChain 还提供了对模型决策的可解释性。在你的示例中，LangChain 提供的对话历史和工具选择的记录可以帮助理解系统做出某些决策的原因。

总的来说，尽管直接调用模型可能对于单一任务或简单应用来说足够了，但是当你需要处理更复杂的场景，例如需要协调多个模型或工具，或者需要处理多种类型的输入时，使用像 LangChain 这样的框架可以大大简化你的工作。

## 思考题

1. 上面Gmail的示例中我只是展示了邮件读取功能，你能否让你的AI助理帮你写邮件的草稿甚至发送邮件？
2. 你可否尝试使用GitHub工具开发一些App来自动完成一部分GitHub任务，比如查看Issues、Merge Branches之类的事儿。

提示：参考此[链接](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app)创建 GitHub App，以及LangChain的[参考文档](https://python.langchain.com/docs/integrations/toolkits/github)。

![](https://static001.geekbang.org/resource/image/1b/2e/1bc0dcd6e05133f934ed926cdcc9eb2e.jpg?wh=1898x851)  
![](https://static001.geekbang.org/resource/image/e0/ea/e037cf6460826e189811ea2af4bb96ea.jpg?wh=1281x747)

期待在留言区看到你的分享，如果你觉得内容对你有帮助，也欢迎分享给有需要的朋友！最后如果你学有余力，可以进一步学习下面的延伸阅读。

## 延伸阅读

1. 文档：LangChain中集成的所有[工具](https://python.langchain.com/docs/integrations/tools/)
2. 文档：LangChain中集成的所有[工具箱](https://python.langchain.com/docs/integrations/toolkits/)
3. 文档：Google Cloud [API](https://cloud.google.com/compute/docs/apis?hl=zh-cn)
4. 文档：Github REST [API](https://support.github.com/features/rest-api)

<div><strong>精选留言（10）</strong></div><ul>
<li><span>Geek_995b81</span> 👍（3） 💬（1）<p>老师好，那我们可以自定义工具吗？比如某个实际场景，我需要调用到某个内部系统的API，通过API返回的信息我再做提取，然后将提取到的信息重新给LLM推理</p>2023-10-31</li><br/><li><span>抽象派</span> 👍（2） 💬（1）<p>老师，文中“甚至尝试让大模型自动回答 Issues 中的问题——反正大模型解决代码问题的能力本来就更强。”是怎样实现让大模型理解项目系统代码的？例如：一个web项目，我给出一个接口，大模型能从给定的接口出发自顶向下，分析出每一层的调用关系和依赖关系。</p>2023-10-10</li><br/><li><span>阿斯蒂芬</span> 👍（2） 💬（1）<p>怎么理解Tool和Toolkits 的异同呢？</p>2023-10-09</li><br/><li><span>liyinda0000</span> 👍（0） 💬（2）<p>老师，你有遇到过这个问题吗？
不使用openai封装agent，使用的是私有模型比如qwen-1.8b时封装的agent不能调用tools，不知道什么原因？</p>2024-05-11</li><br/><li><span>enbool</span> 👍（0） 💬（1）<p>老师，怎么进群啊？</p>2023-10-10</li><br/><li><span>yanyu-xin</span> 👍（1） 💬（0）<p>不使用openai封装agent，使用的是私有模型比如qwen-1.8b时封装的agent是可以很好调用tools。
将“使用 arXiv 工具开发科研助理”到代码修改、输出如下：

旧代码：
llm = ChatOpenAI(temperature=0.0)
新代码：
llm = ChatOpenAI(
api_key= &quot;DASHSCOPE_API_KEY&quot;, #换为你的 key
base_url=&quot;https:&#47;&#47;dashscope.aliyuncs.com&#47;compatible-mode&#47;v1&quot;, # 填写 DashScope base_url
model=&quot;qwen-1.8b-chat&quot; # 其他通义模型也可以 &quot;qwen-long&quot; 、&quot;qwen-max&quot;
)

#### 运行结果

&gt;&gt; from langchain.agents import load_tools
with new imports of:
&gt;&gt; from langchain_community.agent_toolkits.load_tools import load_tools
（略）
&gt; Entering new AgentExecutor chain...
我应该使用arxiv来查找相关信息。
Action: arxiv
Action Input: &quot;2005.14165&quot;
Observation: Published: 2020-07-22
Title: Language Models are Few-Shot Learners
Authors: （略）
Thought: 我现在可以作答了。
Final Answer: 2005年发表的一项研究《语言模型是少样本学习者》对语言模型进行了创新性的研究。研究发现，通过预训练在大量文本数据上进行，以及针对特定任务进行微调的方 法，这些方法通常具有跨任务通用性，但在架构上仍然需要特定的任务强化学习数据集。相比之下，人类可以从少量或简单的指示中完成新的语言任务，而目前的自然语言处理系统在 这方面仍做得不好。研究人员展示了，在少样本情况下，可以极大地提高任务通用性和少样本性能，并有时甚至可以达到与先前的细粒度微调方法相当的竞争力。具体来说，他们训练 了GPT-3，这是一款拥有175亿参数、比以前任何非稀疏语言模型都要多的自注意力语言模型，然后测试其在少数样本设置下的表现。在所有任务上，GPT-3都无需梯度更新或微调即可应用，而是在文本交互的情况下对模型进行指定的任务和少数样本演示。GPT-3在许多NLP任务（包括翻译、问答、缺失填入等）中表现出色，还包括一些需要实时推理或领域适应的任务 ，如解开单词、将一个新词放入句子中或执行三进制算术。同时，研究人员还识别了一些大型Web语料库上的任务，其中GPT-3的少数样本学习仍然存在挑战，以及一些任务中的方法问 题，这些问题与在大型Web语料库上训练算法有关。最后，研究人员发现GPT-3可以在人工评估者难以区分的人类文章中生成样本来。他们讨论了这项发现及其广泛的社会影响，以及GPT-3的一般性影响。
&gt; Finished chain. </p>2024-08-10</li><br/><li><span>张申傲</span> 👍（0） 💬（0）<p>第14讲打卡~
通过合理地编排多种Tools，一个多功能的智能助手就出来了~</p>2024-07-17</li><br/><li><span>rs勿忘初心</span> 👍（0） 💬（0）<p>比较好奇自然语言-&gt;参数抽取是哪个环节做的？如果的业务自己开发的API，涉及的参数较多（比如4-5个），能很好的处理么？</p>2024-07-02</li><br/><li><span>左可</span> 👍（0） 💬（0）<p>(this Thought&#47;Action&#47;Action Input&#47;Observation can repeat N times)\n——老师，这个可以让模型自主决定回溯多少次，如果稍微复杂的问题，是否有可能模型找不到最终答案？这种情况是如何跳出的？使用者是如何控制这个异常场景处理的？</p>2024-03-21</li><br/><li><span>Longerian</span> 👍（0） 💬（2）<p>I should search for the paper with the identifier &quot;2005.14165&quot; on arxiv to find out its innovative points.
Action: arxiv
Action Input: 2005.14165
Observation: Published: 2020-07-22
Title: Language Models are Few-Shot Learners
Authors: Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, Dario Amodei
Summary: Recent work has demonstrated substantial gains on many NLP tasks and
benchmarks by pre-training on a large corpus of text followed by fine-tuning on
a specific task. While typically task-agnostic in architecture, this method
still requires task-specific fine-tuning datasets of thousands or tens

为何我执行了搜到的论文和文中的不一样，开始胡说八道了。</p>2024-03-14</li><br/>
</ul>
