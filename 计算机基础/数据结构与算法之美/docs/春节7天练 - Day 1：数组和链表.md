你好，我是王争。首先祝你新年快乐！

专栏的正文部分已经结束，相信这半年的时间，你学到了很多，究竟学习成果怎样呢？

我整理了数据结构和算法中必知必会的30个代码实现，从今天开始，分7天发布出来，供你复习巩固所用。你可以每天花一点时间，来完成测验。测验完成后，你可以根据结果，回到相应章节，有针对性地进行复习。

除此之外，@Smallfly 同学还整理了一份配套的LeetCode练习题，你也可以一起练习一下。在此，我谨代表我本人对@Smallfly 表示感谢！

另外，我还为假期坚持学习的同学准备了丰厚的春节加油礼包。

1. 2月5日-2月14日，只要在专栏文章下的留言区写下你的答案，参与答题，并且留言被精选，即可获得极客时间10元无门槛优惠券。
2. 7篇中的所有题目，只要回答正确3道及以上，即可获得极客时间99元专栏通用阅码。
3. 如果7天连续参与答题，并且每天的留言均被精选，还可额外获得极客时间价值365元的每日一课年度会员。

---

## 关于数组和链表的几个必知必会的代码实现

### 数组

- 实现一个支持动态扩容的数组
- 实现一个大小固定的有序数组，支持动态增删改操作
- 实现两个有序数组合并为一个有序数组

### 链表

- 实现单链表、循环链表、双向链表，支持增删操作
- 实现单链表反转
- 实现两个有序的链表合并为一个有序链表
- 实现求链表的中间结点

## 对应的LeetCode练习题（@Smallfly 整理）

### 数组

- Three Sum（求三数之和）

英文版：[https://leetcode.com/problems/3sum/](https://leetcode.com/problems/3sum/)

中文版：[https://leetcode-cn.com/problems/3sum/](https://leetcode-cn.com/problems/3sum/)

- Majority Element（求众数）

英文版：[https://leetcode.com/problems/majority-element/](https://leetcode.com/problems/majority-element/)

中文版：[https://leetcode-cn.com/problems/majority-element/](https://leetcode-cn.com/problems/majority-element/)

- Missing Positive（求缺失的第一个正数）

英文版：[https://leetcode.com/problems/first-missing-positive/](https://leetcode.com/problems/first-missing-positive/)

中文版：[https://leetcode-cn.com/problems/first-missing-positive/](https://leetcode-cn.com/problems/first-missing-positive/)

### 链表

- Linked List Cycle I（环形链表）

英文版：[https://leetcode.com/problems/linked-list-cycle/](https://leetcode.com/problems/linked-list-cycle/)

中文版：[https://leetcode-cn.com/problems/linked-list-cycle/](https://leetcode-cn.com/problems/linked-list-cycle/)

- Merge k Sorted Lists（合并k个排序链表）

英文版：[https://leetcode.com/problems/merge-k-sorted-lists/](https://leetcode.com/problems/merge-k-sorted-lists/)

中文版：[https://leetcode-cn.com/problems/merge-k-sorted-lists/](https://leetcode-cn.com/problems/merge-k-sorted-lists/)

---

做完题目之后，你可以点击“请朋友读”，把测试题分享给你的朋友，说不定就帮他解决了一个难题。

祝你取得好成绩！明天见！
<div><strong>精选留言（15）</strong></div><ul>
<li><span>William</span> 👍（4） 💬（1）<p>特地新开了一个git仓库，https:&#47;&#47;github.com&#47;Si3ver&#47;LeetCode。刷完5道题，思路大致写一下。1.数组三数之和，时间复杂度是O(n^2)，先排序，外层i遍历数组，内层左右双指针，寻找两数之和 = -nums[i]。 2. 求数组中出现次数大于一半的数字。复杂度O(n)，是利用摩尔投票法。3.求缺失的最小正整数，复杂度O(n)，思路是哈希表统计。4.环形链表用快慢指针。5.合并k个有序链表，用的是两两归并，据说用堆会更快，这个有待补充。</p>2019-02-06</li><br/><li><span>峰</span> 👍（4） 💬（1）<p>第三题，看这题，我就会想到用快排的思想在一堆数中求第n大。于是乎我就套，先把负数全部移掉，o(n)不影响。然后每轮迭代随机取个数n，比它小的放左边，比他大的放右边。比如说第一轮迭代，左边的数据个数小于n-1那么必然在左边。但这里有个问题是数据是可以重复的，怎么办，想呀想，我就选定n后，开始扫描，如果是1我就放第一个位置，如果是2我就放第二个位置，如果再有1，发现重复了，不用移动了，这样我就能计算小于n大于n的正整数有多少种了，然后就能迭代下去了。当然里面还有些细节，比如如果n很大已超过了数组长度，那说明那个数一定在左边。</p>2019-02-05</li><br/><li><span>Ben</span> 👍（2） 💬（1）<p>class Solution(object):
    def threeSum(self, nums):
        &quot;&quot;&quot;
        :type nums: List[int]
        :rtype: List[List[int]]
        通过hash结构缓存去重值及出现的次数

        将值按正负区分, 将正负列表中的数字求和, 判断和的相反数是否仍存在于字典中
        &quot;&quot;&quot;
        #将输入列表的值作为索引, 对应出现的次数作为新的字典结构的值
        dic = {}
        for ele in nums:
            if ele not in dic:
                dic[ele] = 0
            dic[ele] += 1
        # 存在3个0的特殊情况
        if 0 in dic and dic[0] &gt; 2:
            rst = [[0, 0, 0]]
        else:
            rst = []

        pos = [p for p in dic if p &gt; 0]
        neg = [n for n in dic if n &lt; 0]

        # 若全为正或负值, 不存在和为0的情况
        for p in pos:
            for n in neg:
                inverse = -(p + n)
                if inverse in dic:
                    if inverse == p and dic[p] &gt; 1:
                        rst.append([n, p, p])
                    elif inverse == n and dic[n] &gt; 1:
                        rst.append([n, n, p])
                    # 去重: 小于负值且大于正值可以排除掉重复使用二者之间的值
                    elif inverse &lt; n or inverse &gt; p or inverse == 0:
                        rst.append([n, inverse, p])
        return rst
    def majorityElement(self, nums):
        &quot;&quot;&quot;
        :type nums: List[int]
        :rtype: int
        hash反存值和出现的次数
        &quot;&quot;&quot;
        #利用字典表反存值:出现的次数
        dic = {}
        for i in nums:
            if i not in dic:
                dic[i] = 1
            else:
                dic[i] +=1

        #根据列表获取值最大的索引
        vs = list(dic.values())
        return list(dic.keys())[vs.index(max(vs))]
    def firstMissingPositiveFast(self, nums):
        &quot;&quot;&quot;
        :type nums: List[int]
        :rtype: int
        &quot;&quot;&quot;
        n = 1
        while n in nums:
            n +=1
        return n</p>2019-02-14</li><br/><li><span>acqierement</span> 👍（2） 💬（1）<p>自己总结了链表的部分算法，链表算是很简单的数据结构了，只要你心里有一个个节点的概念，必要时画图看一下还是很简单的。
      1.单链表反转  反转比较简单,就是要有一个先前节点prev和当前节点cur，要有一个临时节点保存cur的下一个节点（cur.next），否则反转之后你就找不到下一个节点了。然后让head指向前一个节点prev。之后继续移动cur和prev节点进行下一次反转
    public ListNode reverse(ListNode head) {
    	ListNode prev = null;
    	ListNode cur = head;
    	while(cur != null) {
    		ListNode temp = cur.next;
    		cur.next = prev;
    		prev = cur;
    		cur = temp;
    	}
    	return prev;
    }
    2.两个有序的链表合并   思路就是自己创建一个链表，每次从两个链表头中找到较小的那个节点，接到自己的那个链表中。说着很简单，但还是有很多细节要注意。
    public ListNode mergeTwoLists(ListNode l1,ListNode l2) {
    	if (l1  == null) return l2;
    	if (l2 == null) return l1;
    	ListNode head = new ListNode(0);
    	ListNode cur = head;
    	while(l1 != null &amp;&amp; l2 != null) {
    		if (l1.val &lt; l2.val) {
    			cur.next = l1;
    			l1 = l1.next;
    		}else {
    			cur.next = l2;
    			l2 = l2.next;
    		}
            cur = cur.next;
    	}
    	if (l1 == null) cur.next = l2;
    	if (l2 == null) cur.next = l1;
    	return head.next;
    }

    3.求链表的中间结点(如果是偶数，返回中间两个中靠右的那个）

这个问题就很简单了，环的检测也可以用到这种方法。就是用快慢指针，快的前进两步，慢的前进一步，等到快的指针到结尾时，慢的指针就到了中点。
public ListNode findCenter(ListNode head) {
ListNode slow = head;
ListNode fast = head;
while(fast != null &amp;&amp; fast.next != null) {
slow = slow.next;
fast = fast.next.next;
}
return slow;
}</p>2019-02-05</li><br/><li><span>赵菁垚</span> 👍（1） 💬（1）<p>王老师，请教您一个问题，想参加NOIP c++考这些算法吗？</p>2019-08-08</li><br/><li><span>神盾局闹别扭</span> 👍（1） 💬（1）<p>加油礼包的福利在哪里领呢？</p>2019-02-18</li><br/><li><span>Neo_Zhang</span> 👍（1） 💬（1）<p>Three Sum（求三数之和）Go语言：
func threeSum(nums []int) [][]int {
results := [][]int{}
n := len(nums)
if n == 0 || n &lt; 3 {
return results
}
sort.Ints(nums) &#47;&#47;首先，对数组进行排序
for i := 0; i &lt; n-2; i++ {
if i &gt; 0 &amp;&amp; nums[i] == nums[i-1] { &#47;&#47;如果相邻两个数相等
continue
}
target := -nums[i]
left := i + 1
right := n - 1  
for left &lt; right {
sum := nums[left] + nums[right]
if sum == target {
results = append(results, []int{nums[left], nums[right], nums[i]})
left++
right--
for left &lt; right &amp;&amp; nums[left] == nums[left-1] {
left++
}
for left &lt; right &amp;&amp; nums[right] == nums[right+1] {
right--
}
} else if sum &gt; target {
right--
} else if sum &lt; target {
left++
}
}

    }
    return results

}
</p>2019-02-12</li><br/><li><span>欢乐小熊</span> 👍（1） 💬（1）<p>链表篇
1. 翻转单链表
&#47;*翻转单链表*&#47;
void reversalList(Node&lt;int&gt;* head) {
	Node&lt;int&gt;* p = head;
	Node&lt;int&gt;* prev = NULL;
	Node&lt;int&gt;* temp = NULL;
	while (p) {
		&#47;&#47; 1. 保存要遍历的下一个结点
		temp = p-&gt;next;
		&#47;&#47; 2. 将 node-&gt;next 指向前驱结点
		p-&gt;next = prev;
		&#47;&#47; 3. 更新前驱结点
		prev = p;
		&#47;&#47; 4. 更新下一个要遍历的结点
		p = temp;
	}
}

2. 将两个有序的单链表合并
   &#47;* 合并两个有序链表, 将 list2 合并到 list1 中 _&#47;
   Node&lt;int&gt;_ mergeOrderList(Node&lt;int&gt;* list1, Node&lt;int&gt;* list2) {
   &#47;&#47; 记录 list2 的头结点
   Node&lt;int&gt;* head = list2;
   &#47;&#47; 创建哨兵, 用于处理将 list2 中的元素插入到 list1 头结点前面的情况
   Node&lt;int&gt;* sentry = new Node&lt;int&gt;(-1);
   sentry-&gt;next = list1;
   &#47;&#47; 记录 list1 要遍历的元素
   Node&lt;int&gt;* node = sentry;
   Node&lt;int&gt;* temp = NULL;
   while (node-&gt;next &amp;&amp; head) {
   if (node-&gt;next-&gt;data &gt; head-&gt;data) {
   temp = head-&gt;next;
   head-&gt;next = node-&gt;next;
   node-&gt;next = head;
   head = temp;
   }
   else {
   node = node-&gt;next;
   }
   }
   &#47;&#47; 若 list2 的头结点不为 NULL, 则说明 list1 中的元素提前遍历结束了
   &#47;&#47; 剩下的 list2 中的元素均比 list1 中的大
   &#47;&#47; 直接将 list1 的尾结点连接到 list2 的首结点即可
   if (head) {
   node-&gt;next = head;
   }
   &#47;&#47; 释放哨兵结点内存
   list1 = sentry-&gt;next;
   sentry-&gt;next = NULL;
   delete(sentry);
   return list1;
   }

3. 求单链表的中间结点
   &#47;* 查询单链表的中间结点 _&#47;
   template&lt;typename E&gt;
   Node&lt;E&gt;_ findMidNode(Node&lt;E&gt;* head, Node&lt;E&gt;** mid_node) {
   if (!head) {
   return NULL;
   }
   Node&lt;E&gt;* fast = head;
   Node&lt;E&gt;* slow = head;
   while (fast &amp;&amp; fast-&gt;next &amp;&amp; fast-&gt;next-&gt;next) {
   &#47;&#47; 快指针走两步
   fast = fast-&gt;next-&gt;next;
   &#47;&#47; 慢指针走一步
   slow = slow-&gt;next;
   }
   *mid_node = slow;
   }</p>2019-02-12</li><br/><li><span>ALAN</span> 👍（1） 💬（1）<p>array answer:
   import java.util.Arrays;

public class Array1 {
public int n;
public int cur;
public static int ary[]; &#47;&#47;dynamic expand
public static int fix[]; &#47;&#47;fixed array
public Array1(int size) {
n=size;
ary=new int [n];
}

    &#47;&#47;dynamic expand
    public void insert(int ele) {
    	if(cur==ary.length) {

    		ary=Arrays.copyOf(ary, ary.length*2);
    		System.out.println(&quot;length:&quot;+ary.length);

    	}
    	ary[cur]=ele;
    	cur++;

    }
    &#47;&#47;fixed array --add
    public void  add(int ele) {
    	if(cur==fix.length) {
    		return;
    	}
    	fix[cur]=ele;
    	cur++;
    }
    &#47;&#47;fixed array --delete
    public void delete() {
    	if(cur==-1)
    		return ;
    	fix[cur]=0;
    	cur--;
    }
    &#47;&#47;fixed array --update
    public void update(int index,int ele) {
    	if(index&gt;=0 &amp;&amp; index&lt;fix.length)
    		fix[index]=ele;
    }
    &#47;&#47;merge
    public int[] merge(int[] a,int[] b ) {
    	int[]c =new int[a.length+b.length];
    	int j=0,k=0;
    	for(int i=0;i&lt;a.length+b.length;i++) {
    		if(j==a.length) {
    			c[i]=b[k];
    			k++;
    			continue;
    		}else if(k==b.length){
    			c[i]=a[j];
    			j++;
    			continue;

    		}
    		if(a[j]&lt;b[k]) {
    			c[i]=a[j];
    			j++;
    		}else {
    			c[i]=b[k];
    			k++;
    		}

    	}

    	return c;
    }

}
</p>2019-02-07</li><br/><li><span>陈小白( ´･ᴗ･` )</span> 👍（0） 💬（1）<p>这些题，我都做了一遍，除了那个“求缺失的第一个正数“没有相处方法，其它的都是自己做出来了。尤其最后那个”合并 k 个排序链表“，其实以前我也看过一次，当时的想法觉得是一个个取出来，然后排序然后再遍历。学完这堂课之后，看完题目，咦，这不是合并两个链表么？哦，合并多个，怎么处理多个问题？好像可以分治归并，嗯，好像是可以。我了个去，就有那种顿塞的感觉，那种开心。谢谢这门课。也谢谢老师，虽然课程里面还有很多没有明白，不过有些数据结构，算法，细细品味，好爽。
</p>2019-10-06</li><br/><li><span>coldpark</span> 👍（0） 💬（1）<p>缺失的第一个正数那个题，如果让用额外内存空间还行，如果严格按照题意就是一道智力题，请问这种题在面时中遇到的多吗？</p>2019-10-05</li><br/><li><span>二哥不再迷茫</span> 👍（0） 💬（1）<p>Missing Positive；循环n次和2n次，时间复杂度都算是O(n)吧，空间复杂度也是如此!
根据他们的思路变通来的，不知道对不对，请老师帮忙看看，哈哈哈，现在老师是不是都不维护了。
public static int getFirstMissingPositive(int[] nums){
        int result = 1;

        int[] arr = new int[nums.length+1];
        for(int i =0;i&lt;nums.length;i++){
            if(nums[i] &lt; arr.length &amp;&amp; nums[i] &gt; 0){
                arr[nums[i]] = nums[i];
            }
        }
        for(int j=1;j&lt;arr.length;j++){
            if(arr[j] == j){
                result = j+1;
            }else {
                result = j;
                break;
            }

        }

        return result;

    }</p>2019-04-10</li><br/><li><span>hopeful</span> 👍（0） 💬（1）<p>&#47;&#47;支持动态扩容的数组

public class MyArray {
Object[] object ;
private int capacity;
private int count;
MyArray(int capacity){
this.capacity = capacity;
this.object = new Object[capacity];
this.count = 0;
}
public Object get(int i) {
if(i&lt;0 || i&gt;=count) {
return null;
}else {
return object[i];
}
}
public int size() {
return this.count;
}
public int capacity() {
return this.capacity;
}
public void add(int j, Object o) {
if((count+1)&gt;=capacity) {
Object[] ob = new Object[2*capacity];
System.arraycopy(object, 0, ob, 0, count);
this.object = ob;
this.capacity = object.length;
}
if(j &lt; 0 || j &gt; count) {
System.out.println(&quot;位置不合法&quot;);
return false;
}
for (int i = count; i &gt; j; i--) {
object[i] = object[i-1];
}
object[j] = o;
count++;
return true;
}
public void addFirst(Object o) {
if((count+1)&gt;=capacity) {
Object[] ob = new Object[2*capacity];
System.arraycopy(object, 0, ob, 0, count);
this.object = ob;
this.capacity = object.length;
}
for (int i = count; i &gt; 0; i--) {
object[i] = object[i-1];
}
object[0] = o;
count++;
}
public void addLast(Object o) {
if((count+1)&gt;=capacity) {
Object[] ob = new Object[2*capacity];
System.arraycopy(object, 0, ob, 0, count);
this.object = ob;
this.capacity = object.length;
}
object[this.size()] = o;
count++;
}
public boolean delete(int index) {
if(index &lt; 0 || index &gt;= count)
return false;
for (int i = index + 1; i &lt; count; i++) {
object[i-1] = object[i];
}
count--;
return true;
}
public Object[] list() {
Object[] o = new Object[this.size()];
for (int i = 0; i &lt; o.length; i++) {
o[i] = object[i];
}
return o;
}
}
</p>2019-02-13</li><br/><li><span>xumc</span> 👍（0） 💬（1）<p>数组基础 - 有序数组 （2）
func (array *OrderArray) Remove(val int) {
	index := array.Find(val)
	if index == -1 {
		return
	}

    for i := index; i &lt; len(*array)-1; i++ {
    	(*array)[i] = (*array)[i+1]
    }
    &#47;&#47;清除最后一个节点
    (*array) = (*array)[0 : len(*array)-1]

}

&#47;&#47;a := OrderArray{9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 11, 12}
&#47;&#47;a.RemoveAll(9)
func (array *OrderArray) RemoveAll(val int) {
indexs := array.FindAll(val)
if len(indexs) == 0 {
return
}

    sort.Ints(indexs)
    start := indexs[0]
    leng := len(indexs)

    for i := start; i+leng &lt; len(*array); i++ {
    	(*array)[i] = (*array)[i+leng]
    }
    &#47;&#47;清除最后n节点
    (*array) = (*array)[0 : len(*array)-leng]

}

func (array *OrderArray) Set(index int, val int) {
leng := len(*array)
if index &gt; leng || index &lt; 0 || leng == 0 {
panic(&quot;cannot set&quot;)
}

    if (leng == 1 &amp;&amp; index == 0) || (index == 0) &amp;&amp; val &lt;= (*array)[1] || (index == leng-1 &amp;&amp; val &gt;= (*array)[leng-2]) {
    	(*array)[index] = val
    	return
    }
    if val &gt; (*array)[index+1] || val &lt; (*array)[index-1] {
    	panic(&quot;cannot set&quot;)
    }
    (*array)[index] = val

}

基础薄弱，其他我慢慢写，谢谢老师。</p>2019-02-13</li><br/><li><span>未来的胡先森</span> 👍（0） 💬（1）<p>「三数之和」
解题思路：

1、先将一维数组升序排序，第 1 、2、3 三个数也按照升序选取，但出现符合题目要求的组合出现则加入要返回的二维数组中。

2、在新的组合出现时判断是否与前一个组合相同，若是则放弃该组合。

3、初始化申请二维数组大小为 64 若不够则扩充 2 倍大小。

4、优化代码，防止超时。第 1 个数为正数时即可结束循环，将三重循环优化成双重循环。
代码
int compare(const void _a, const void *b)
{
return (*(int_)a - _(int_)b);
}
int** threeSum(int* nums, int numsSize, int* returnSize)
{
qsort(nums, numsSize, sizeof(int), compare);
int flag = numsSize, size = 64;
for (int i = 0; i &lt; numsSize; i++)
if (nums[i] &gt; 0)
{
flag = i; break;
}
if (flag == 0 || flag &gt; numsSize - 2)
flag = numsSize - 2;
int **arrys = (int **)malloc(size * sizeof(int *));
*returnSize = 0;
for (int i = 0; i &lt; flag; i++)
{
int start = i + 1, end = numsSize - 1;
if (i &gt; 0 &amp;&amp; nums[i] == nums[i - 1])
continue;
while (start &lt; end)
{
int sum = nums[i] + nums[start] + nums[end];
if (sum== 0)
{
if (start &gt; i + 1 &amp;&amp; nums[start] == nums[start - 1])
{
start++; continue;
}
arrys[_returnSize] = (int_)malloc(3 * sizeof(int));
arrys[*returnSize][0] = nums[i]; arrys[*returnSize][1] = nums[start]; arrys[*returnSize][2] = nums[end];
printf(&quot;%d %d %d\n&quot;, arrys[*returnSize][0], arrys[*returnSize][1], arrys[*returnSize][2]);
(*returnSize)++;
if (size == *returnSize)
{
size &lt;&lt;= 1;
arrys = (int **)realloc(arrys, sizeof(int *) * size);
}
start++; end--;&#47;&#47;因为是从小到大排序，start 增大 则第 3 个数需要减小
continue;
}
else if (sum &gt; 0)
end--;
else
{
start++;&#47;&#47; end = numsSize - 1;
}
}
}
return arrys;
}</p>2019-02-12</li><br/>
</ul>
