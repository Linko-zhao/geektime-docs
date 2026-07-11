你好，我是王争。初二好！

为了帮你巩固所学，真正掌握数据结构和算法，我整理了数据结构和算法中，必知必会的30个代码实现，分7天发布出来，供你复习巩固所用。今天是第二篇。

和昨天一样，你可以花一点时间，来完成测验。测验完成后，你可以根据结果，回到相应章节，有针对性地进行复习。

---

## 关于栈、队列和递归的几个必知必会的代码实现

### 栈

- 用数组实现一个顺序栈
- 用链表实现一个链式栈
- 编程模拟实现一个浏览器的前进、后退功能

### 队列

- 用数组实现一个顺序队列
- 用链表实现一个链式队列
- 实现一个循环队列

### 递归

- 编程实现斐波那契数列求值f(n)=f(n-1)+f(n-2)
- 编程实现求阶乘n!
- 编程实现一组数据集合的全排列

## 对应的LeetCode练习题（@Smallfly 整理）

### 栈

- Valid Parentheses（有效的括号）

英文版：[https://leetcode.com/problems/valid-parentheses/](https://leetcode.com/problems/valid-parentheses/)

中文版：[https://leetcode-cn.com/problems/valid-parentheses/](https://leetcode-cn.com/problems/valid-parentheses/)

- Longest Valid Parentheses（最长有效的括号）

英文版：[https://leetcode.com/problems/longest-valid-parentheses/](https://leetcode.com/problems/longest-valid-parentheses/)

中文版：[https://leetcode-cn.com/problems/longest-valid-parentheses/](https://leetcode-cn.com/problems/longest-valid-parentheses/)

- Evaluate Reverse Polish Notatio（逆波兰表达式求值）

英文版：[https://leetcode.com/problems/evaluate-reverse-polish-notation/](https://leetcode.com/problems/evaluate-reverse-polish-notation/)

中文版：[https://leetcode-cn.com/problems/evaluate-reverse-polish-notation/](https://leetcode-cn.com/problems/evaluate-reverse-polish-notation/)

### 队列

- Design Circular Deque（设计一个双端队列）

英文版：[https://leetcode.com/problems/design-circular-deque/](https://leetcode.com/problems/design-circular-deque/)

中文版：[https://leetcode-cn.com/problems/design-circular-deque/](https://leetcode-cn.com/problems/design-circular-deque/)

- Sliding Window Maximum（滑动窗口最大值）

英文版：[https://leetcode.com/problems/sliding-window-maximum/](https://leetcode.com/problems/sliding-window-maximum/)

中文版：[https://leetcode-cn.com/problems/sliding-window-maximum/](https://leetcode-cn.com/problems/sliding-window-maximum/)

### 递归

- Climbing Stairs（爬楼梯）

英文版：[https://leetcode.com/problems/climbing-stairs/](https://leetcode.com/problems/climbing-stairs/)

中文版：[https://leetcode-cn.com/problems/climbing-stairs/](https://leetcode-cn.com/problems/climbing-stairs/)

---

昨天的第一篇，是关于数组和链表的，如果你错过了，点击文末的“上一篇”，即可进入测试。

祝你取得好成绩！明天见！
<div><strong>精选留言（15）</strong></div><ul>
<li><span>Abner</span> 👍（0） 💬（1）<p>java实现一个循环队列
代码如下：
package queue;

public class CircularQueue {

    private String[] data;
    private int size;
    private int head;
    private int tail;

    public CircularQueue(int capacity) {
        data = new String[capacity];
        size = capacity;
        head = 0;
        tail = 0;
    }

    public boolean enqueue(String item) {
        if ((tail + 1) % size == head) {
            return false;
        }
        data[tail] = item;
        tail = (tail + 1) % size;
        return true;
    }

    public String dequeue() {
        if (head == tail) {
            return null;
        }
        String value = data[head];
        head = (head + 1) % size;
        return value;
    }

    public void printAll() {
        if (0 == size) {
            return ;
        }
        for (int i = head;i % size != tail;i++) {
            System.out.print(data[i] + &quot; &quot;);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        CircularQueue circularQueue = new CircularQueue(5);
        circularQueue.enqueue(&quot;hello1&quot;);
        circularQueue.enqueue(&quot;hello2&quot;);
        circularQueue.enqueue(&quot;hello3&quot;);
        circularQueue.enqueue(&quot;hello4&quot;);
        circularQueue.dequeue();
        circularQueue.printAll();
    }

}
</p>2019-02-12</li><br/><li><span>神盾局闹别扭</span> 👍（0） 💬（1）<p>全排列实现：
void Dopermute(char *pstr, char *pBegin)
{
	if (*pBegin == &#39;\0&#39;)
		printf(&quot;%s\n&quot;, pstr);

    for (char *pCur = pBegin; *pCur != &#39;\0&#39;; pCur++)
    {

    	char temp = *pBegin;
    	*pBegin = *pCur;
    	*pCur = temp;

    	Dopermute_v2(pstr, pBegin + 1);

    	temp = *pBegin;
    	*pBegin = *pCur;
    	*pCur = temp;

    }

}
void Permute(char* pstr)
{
if (pstr == nullptr)
return;
Dopermute(pstr, pstr);
}</p>2019-02-09</li><br/><li><span>molybdenum</span> 👍（0） 💬（1）<p>老师新年好 这是我的作业

https:&#47;&#47;blog.csdn.net&#47;github_38313296&#47;article&#47;details&#47;86819684</p>2019-02-09</li><br/><li><span>菜菜</span> 👍（0） 💬（1）<p>求斐波那契数列，当然最经典的算法就是递归，但是递归的效率非常低，因为中间过车会计算大量重复的子节点。在《剑指Offer》一书中，提到了一个自下而上计算的方法。我们知道f(0)=0,f(1)=1,再计算f(2),f(3)一直到f(n)。这样，时间复杂度就是O(n)。</p>2019-02-06</li><br/><li><span>李皮皮皮皮皮</span> 👍（11） 💬（1）<p>基础数据结构和算法是基石，灵活运用是解题的关键。栈，队列这些数据结构说到底就是给顺序表添加约束，更便于解决某一类问题。学习中培养算法的设计思想是非常关键的。而且思想是可以通用的。之前读《暗时间》一书，收获颇深。书中介绍之正推反推我在做程序题时竟出奇的好用。</p>2019-02-05</li><br/><li><span>Abner</span> 👍（3） 💬（0）<p>java用数组实现一个顺序栈
代码如下：
package stack;

public class ArrayStack {

    private String[] data;
    private int count;
    private int size;

    public ArrayStack(int n) {
        this.data = new String[n];
        this.count = 0;
        this.size = n;
    }

    public boolean push(String value) {
        if (count == size) {
            return false;
        } else {
            data[count] = value;
            count++;
            return true;
        }
    }

    public String pop() {
        if (count == 0) {
            return null;
        } else {
            count--;
            return data[count];
        }
    }

}
</p>2019-02-11</li><br/><li><span>Abner</span> 👍（2） 💬（0）<p>java用递归实现斐波那契数列
代码如下：
package recursion;

public class Fib {

    public long calFib(long n) {
        if (n == 0 || n == 1) {
            return 1;
        } else {
            return calFib(n - 1) + calFib(n - 2);
        }
    }

    public static void main(String[] args) {
        Fib fib = new Fib();
        long result = fib.calFib(5);
        System.out.println(result);
    }

}
</p>2019-02-11</li><br/><li><span>Abner</span> 👍（2） 💬（0）<p>java用递归实现求解n!
代码如下：
package recursion;

public class Fac {

    public long calFac(long n) {
        if (n == 0) {
            return 1;
        }
        return calFac(n - 1) * n;
    }

    public static void main(String[] args) {
        Fac fac = new Fac();
        long result = fac.calFac(10);
        System.out.println(result);
    }

}</p>2019-02-11</li><br/><li><span>kai</span> 👍（2） 💬（0）<p>1. 编程实现斐波那契数列求值 f(n)=f(n-1)+f(n-2）
public class Fibonacci {
public static int fib(int n) {
if (n &lt;= 0) {
return 0;
}
if (n == 1) {
return 1;
}

        return  fib(n-1) + fib(n-2);
    }

}

2. Climbing Stairs（爬楼梯）
   public class ClimbStairs {
   public int climbFloor(int n) {
   if (n == 1 || n == 2) {
   return n;
   }

        return climbFloor(n - 1) + climbFloor(n - 2);

   }

   public int climbFloorIter(int n) {
   if (n == 1 || n == 2) {
   return n;
   }

        int jump1 = 1;
        int jump2 = 2;
        int jumpN = 0;

        for (int i = 3; i &lt;= n; i++) {
            jumpN = jump1 + jump2;

            jump1 = jump2;
            jump2 = jumpN;
        }

        return jumpN;

   }
   }

3. Sliding Window Maximum（滑动窗口最大值)
   import java.util.ArrayList;
   import java.util.LinkedList;

public class MaxNumOfSlidingWindow {
public ArrayList&lt;Integer&gt; maxInWindows(int [] num, int size)
{
ArrayList&lt;Integer&gt; res = new ArrayList&lt;&gt;();

        if (num == null || num.length &lt;= 0 || size &lt;= 0 || size &gt; num.length) {
            return res;
        }

        LinkedList&lt;Integer&gt; qMax = new LinkedList&lt;&gt;();  &#47;&#47; 双端队列：左端更新max,右端添加数据

        int left = 0;

        for (int right = 0; right &lt; num.length; right++) {
            &#47;&#47; 更新右端数据
            while (!qMax.isEmpty() &amp;&amp; num[qMax.peekLast()] &lt;= num[right]) {
                qMax.pollLast();
            }

            qMax.addLast(right);

            &#47;&#47; 更新max：如果max的索引不在窗口内,则更新
            if (qMax.peekFirst() == right - size) {
                qMax.pollFirst();
            }

            &#47;&#47; 待窗口达到size，输出max
            if (right &gt;= size-1) {
                res.add(num[qMax.peekFirst()]);
                left++;
            }
        }

        return res;
    }

}</p>2019-02-11</li><br/><li><span>Abner</span> 👍（1） 💬（0）<p>java用链表实现一个链式栈
代码如下：
package stack;

public class LinkedStack {

    private Node top = null;

    public static class Node {

        private String data;
        private Node next;

        public Node(String data, Node next) {
            this.data = data;
            this.next = next;
        }

        public String getData() {
            return data;
        }
    }

    public void push(String item) {
        Node newNode = new Node(item, null);
        if (top == null) {
            top = newNode;
        } else {
            newNode.next = top;
            top = newNode;
        }
    }

    public String pop() {
        if (top == null) {
            return null;
        }
        String value = top.data;
        top = top.next;
        return value;
    }

    public void printAll() {
        Node pNode = top;
        while (pNode != null) {
            System.out.print(pNode.data + &quot; &quot;);
            pNode = pNode.next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        LinkedStack linkedStack = new LinkedStack();
        linkedStack.push(&quot;haha&quot;);
        linkedStack.push(&quot;nihao&quot;);
        linkedStack.printAll();
    }

}
</p>2019-02-12</li><br/><li><span>Abner</span> 👍（1） 💬（0）<p>java用数组实现一个顺序队列
代码如下：
package queue;

public class ArrayQueue {

    private String[] data;
    private int size;
    private int head;
    private int tail;

    public ArrayQueue(int capacity) {
        data = new String[capacity];
        size = capacity;
        head = 0;
        tail = 0;
    }

    public boolean enqueue(String value) {
        if (tail == size) {
            return false;
        }
        data[tail] = value;
        tail++;
        return true;
    }

    public String dequeue() {
        if (tail == 0) {
            return null;
        }
        String value = data[head];
        head++;
        return value;
    }

}
</p>2019-02-11</li><br/><li><span>ALAN</span> 👍（1） 💬（0）<p>import java.util.Arrays;

&#47;** *
*Stack 1 solution
*&#47;
public class StackArray {

    public Object[] arr = new Object[10];
    public int count;

    public void push(Object ele) {
    	if (count == arr.length) { &#47;&#47; expand size
    		arr = Arrays.copyOf(arr, arr.length * 2);
    	}
    	arr[count] = ele;
    	count++;
    }

    public Object pop() {
    	if (count == 0)
    		return null;
    	if (count &lt; arr.length &#47; 2) {
    		arr = Arrays.copyOf(arr, arr.length &#47; 2);
    	}
    	return arr[--count];

    }

}

&#47;** *
*Stack 2 solution
*&#47;
class StackLinked {
Node head;
Node tail;

    public void push(Object ele) {

    	if (head == null) {
    		head = new Node(ele);
    		tail = head;
    	} else {
    		Node node = new Node(ele);
    		tail.next = node;
    		node.prev = tail;
    		tail = node;
    	}
    }

    public Object pop() {
    	if (tail == null)
    		return null;
    	Node node = tail;
    	if (tail == head) {
    		head = null;
    		tail = null;
    	} else
    		tail = tail.prev;
    	return node;

    }

}
class Node {
Node prev;
Node next;
Object value;

    public Node(Object ele) {
    	value = ele;
    }

}</p>2019-02-08</li><br/><li><span>TryTs</span> 👍（1） 💬（0）<p>之前有个类似的题，走楼梯，装苹果，就是把苹果装入盘子，可以分为有一个盘子为空（递归），和全部装满没有空的情况，找出状态方程，递归就可以列出来了。我觉得最关键是要列出状态方程，之前老师类似于说的不需要关注特别细节，不要想把每一步都要想明白，快速排序与递归排序之类的算法，之前总是想把很细节的弄懂，却发现理解有困难。</p>2019-02-06</li><br/><li><span>杨建斌(young)</span> 👍（0） 💬（0）<p>滑动窗口最大值
public static void main(String[] args) {

        PriorityQueue&lt;Integer[]&gt; queue = new PriorityQueue(3, new Comparator&lt;Integer[]&gt;() {
            @Override
            public int compare(Integer[] o1, Integer[] o2) {
                if (o1[0] == o2[0]) {
                    return o2[1] - o1[1];
                }
                return o2[0] - o1[0];
            }
        });

        int[] nums = new int[]{7, 3, -1, -3, 5, 3, 6, 7};
        for (int i = 0; i &lt; 3; i++) {
            queue.add(new Integer[]{nums[i], i});
        }

        int[] ret = new int[nums.length - 3 + 1];
        ret[0] = queue.peek()[0];
        for (int i = 3; i &lt; nums.length; i++) {
            queue.add(new Integer[]{nums[i], i});
            if (queue.peek()[1] &lt; i - 3 + 1) {
                queue.poll();
            }
            ret[i - 3 + 1] = queue.peek()[0];
        }

        System.out.println(ret);


    }</p>2023-06-29</li><br/><li><span>杨建斌(young)</span> 👍（0） 💬（0）<p>双端队列
    static class MyCircularDeque {
        private int[] elements;
        &#47;&#47;获得双端队列的最后rear一个元素

        private int rear, front;
        &#47;&#47;内容个数
        private int capacity;



        public boolean insertFront(int value) {
            if (elements.length == capacity) {
                return false;
            }
            if (capacity == 0) {
                rear = front = 0;
            } else {
                front = front - 1;
                if (front &lt; 0) {
                    front += elements.length;
                }
            }
            elements[front] = value;
            capacity++;
            return true;
        }

        public boolean insertLast(int value) {
            if (elements.length == capacity) {
                return false;
            }
            if (capacity == 0) {
                rear = front = 0;
            } else {
                rear = (rear + 1) % elements.length;
            }
            elements[rear] = value;
            capacity++;
            return true;
        }

        public boolean deleteFront() {
            if (capacity == 0) {
                return false;
            }
            int idx = front;
            front = front + 1;
            if (front &gt; elements.length) {
                front = 0;
            }
            elements[idx] = -1;
            capacity--;
            return true;
        }

        public boolean deleteLast() {
            if (capacity == 0) {
                return false;
            }
            int idx = rear;
            rear = rear - 1;
            elements[idx] = -1;
            capacity--;
            return true;
        }

        public int getFront() {
            if (front != -1) {
                return elements[front];
            }
            return -1;
        }

        public int getRear() {
            if (rear != -1) {
                return elements[rear];
            }
            return -1;
        }
    }</p>2023-06-29</li><br/>

</ul>
