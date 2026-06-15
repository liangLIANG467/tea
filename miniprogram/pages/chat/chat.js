// pages/chat/chat.js
const api = require('../../utils/api.js');

Page({
  data: {
    currentSessionId: '',
    sessionList: [],
    messageList: [],
    inputText: '',
    isLoading: false,
    scrollToView: '',
    showSessionList: false,
    suggestQuestions: [
      '六堡茶有什么功效？',
      '六堡茶如何冲泡？',
      '六堡茶的制作工艺',
      '如何鉴别六堡茶的好坏？',
      '六堡茶的历史由来',
      '六堡茶的产地在哪里？'
    ]
  },

  onLoad(options) {
    this.loadSessionList();
    this.createNewSession();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.loadSessionList();
  },

  loadSessionList() {
    try {
      const sessions = wx.getStorageSync('chat_sessions') || [];
      sessions.sort((a, b) => b.updateTime - a.updateTime);
      this.setData({ sessionList: sessions });
    } catch (e) {
      console.error('加载会话列表失败', e);
    }
  },

  saveSessionList(sessions) {
    try {
      wx.setStorageSync('chat_sessions', sessions);
      this.setData({ sessionList: sessions });
    } catch (e) {
      console.error('保存会话列表失败', e);
    }
  },

  saveSession(sessionId, messages) {
    try {
      let sessions = wx.getStorageSync('chat_sessions') || [];
      const now = Date.now();
      
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg 
        ? firstUserMsg.content.substring(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '')
        : '新对话';
      
      const existingIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = {
          ...sessions[existingIndex],
          title: title,
          messageCount: messages.length,
          updateTime: now,
          messages: messages.slice(-50)
        };
      } else {
        sessions.push({
          id: sessionId,
          title: title,
          messageCount: messages.length,
          createTime: now,
          updateTime: now,
          messages: messages.slice(-50)
        });
      }
      
      if (sessions.length > 20) {
        sessions = sessions.slice(-20);
      }
      
      this.saveSessionList(sessions);
    } catch (e) {
      console.error('保存会话失败', e);
    }
  },

  createNewSession() {
    const newSessionId = this.generateSessionId();
    this.setData({
      currentSessionId: newSessionId,
      messageList: [],
      showSessionList: false,
      inputText: ''
    });
    this.addWelcomeMessage();
  },

  addWelcomeMessage() {
    const welcomeMessage = {
      id: Date.now(),
      role: 'assistant',
      content: '您好！我是AI茶博士，请问有什么可以帮您？\n\n💡 我可以帮您解答：\n• 六堡茶的功效与作用\n• 正确的冲泡方法\n• 传统制作工艺\n• 品质鉴别技巧\n• 历史文化知识',
      time: this.formatTime(new Date())
    };
    
    this.setData({ messageList: [welcomeMessage] });
    this.saveSession(this.data.currentSessionId, this.data.messageList);
  },

  switchSession(e) {
    const sessionId = e.currentTarget.dataset.id;
    const sessions = this.data.sessionList;
    const session = sessions.find(s => s.id === sessionId);
    
    if (session && session.messages) {
      this.setData({
        currentSessionId: sessionId,
        messageList: session.messages,
        showSessionList: false
      });
      this.scrollToBottom();
    } else {
      this.loadSessionMessages(sessionId);
    }
  },

  loadSessionMessages(sessionId) {
    try {
      const sessions = wx.getStorageSync('chat_sessions') || [];
      const session = sessions.find(s => s.id === sessionId);
      if (session && session.messages) {
        this.setData({
          currentSessionId: sessionId,
          messageList: session.messages,
          showSessionList: false
        });
        this.scrollToBottom();
      }
    } catch (e) {
      console.error('加载会话消息失败', e);
    }
  },

  deleteSession(e) {
    const sessionId = e.currentTarget.dataset.id;
    e.stopPropagation();
    
    wx.showModal({
      title: '删除对话',
      content: '确定要删除这个对话吗？',
      confirmColor: '#F44336',
      confirmText: '删除',
      success: (res) => {
        if (res.confirm) {
          try {
            let sessions = wx.getStorageSync('chat_sessions') || [];
            sessions = sessions.filter(s => s.id !== sessionId);
            this.saveSessionList(sessions);
            
            if (sessionId === this.data.currentSessionId) {
              this.createNewSession();
            }
            
            wx.showToast({ title: '已删除', icon: 'success' });
          } catch (e) {
            console.error('删除会话失败', e);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  /**
   * 清空所有对话（同时清除存储中的聊天记录）
   */
  clearAllSessions() {
    wx.showModal({
      title: '清空所有对话',
      content: '确定要删除所有历史对话吗？此操作将清除聊天记录统计。',
      confirmColor: '#F44336',
      confirmText: '清空',
      success: (res) => {
        if (res.confirm) {
          try {
            // 清除会话列表
            wx.removeStorageSync('chat_sessions');
            // 清除聊天记录存储（影响统计数据）
            wx.removeStorageSync('chat_history');
            
            this.setData({ sessionList: [] });
            this.createNewSession();
            
            wx.showToast({ title: '已清空', icon: 'success' });
          } catch (e) {
            console.error('清空失败', e);
            wx.showToast({ title: '清空失败', icon: 'none' });
          }
        }
      }
    });
  },

  /**
   * 清空当前对话（同时清除存储）
   */
  clearCurrentConversation() {
    wx.showModal({
      title: '清空对话',
      content: '确定要清空当前对话吗？这将清除本对话的聊天记录统计。',
      confirmColor: '#F44336',
      confirmText: '清空',
      success: (res) => {
        if (res.confirm) {
          try {
            // 删除当前会话
            let sessions = wx.getStorageSync('chat_sessions') || [];
            sessions = sessions.filter(s => s.id !== this.data.currentSessionId);
            this.saveSessionList(sessions);
            
            // 注意：不清除 chat_history，因为其他会话可能还有记录
            // 如果希望完全清除，可以取消下面的注释
            // wx.removeStorageSync('chat_history');
            
            this.createNewSession();
            
            wx.showToast({ title: '已清空', icon: 'success' });
          } catch (e) {
            console.error('清空当前对话失败', e);
            wx.showToast({ title: '清空失败', icon: 'none' });
          }
        }
      }
    });
  },

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  sendMessage() {
    const content = this.data.inputText.trim();
    if (!content || this.data.isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content,
      time: this.formatTime(new Date())
    };
    
    const newMessageList = [...this.data.messageList, userMessage];
    this.setData({
      messageList: newMessageList,
      inputText: '',
      isLoading: true
    });
    
    this.saveSession(this.data.currentSessionId, newMessageList);
    this.scrollToBottom();

    this.handleQuestion(content);
  },

  /**
   * 判断问题是否完全匹配推荐问题
   */
  isExactlyRecommendQuestion(question) {
    const recommendQuestions = [
      '六堡茶有什么功效？',
      '六堡茶如何冲泡？',
      '六堡茶的制作工艺',
      '如何鉴别六堡茶的好坏？',
      '六堡茶的历史由来',
      '六堡茶的产地在哪里？'
    ];
    
    const q = question.trim().replace(/[？?！!。，,]/g, '');
    for (let recQ of recommendQuestions) {
      const cleanRecQ = recQ.replace(/[？?！!。，,]/g, '');
      if (q === cleanRecQ || question.includes(recQ)) {
        return true;
      }
    }
    return false;
  },

  /**
   * 处理用户问题（分类处理）
   */
  handleQuestion(question) {
    if (this.isExactlyRecommendQuestion(question)) {
      console.log('匹配推荐问题，使用本地知识库回答');
      this.getMockResponse(question);
    } else {
      console.log('调用 AI 模型回答');
      this.callAIApi(question);
    }
  },

  /**
   * 保存对话历史（用于统计提问次数）
   */
  saveChatHistory(question, answer) {
    try {
      let chatHistory = wx.getStorageSync('chat_history') || [];
      
      // 添加用户消息
      chatHistory.push({
        id: Date.now(),
        role: 'user',
        content: question,
        time: this.formatTime(new Date())
      });
      
      // 添加AI回复
      chatHistory.push({
        id: Date.now() + 1,
        role: 'assistant',
        content: answer.substring(0, 200),
        time: this.formatTime(new Date())
      });
      
      // 只保留最近100条记录
      if (chatHistory.length > 100) {
        chatHistory = chatHistory.slice(-100);
      }
      
      wx.setStorageSync('chat_history', chatHistory);
      console.log('✅ 对话历史已保存，当前共', chatHistory.length, '条');
    } catch (e) {
      console.error('保存对话历史失败', e);
    }
  },

  /**
   * 调用AI接口（用于所有非推荐问题）
   */
  callAIApi(question) {
    if (api && typeof api.chat === 'function') {
      api.chat(question, this.data.currentSessionId)
        .then(res => {
          console.log('AI响应成功:', res);
          
          const replyText = res.reply || this.formatAIResponse(res);
          
          const assistantMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: replyText,
            time: this.formatTime(new Date())
          };
          
          const newMessageList = [...this.data.messageList, assistantMessage];
          this.setData({
            messageList: newMessageList,
            isLoading: false
          });
          
          this.saveSession(this.data.currentSessionId, newMessageList);
          
          // 保存对话历史到全局存储（用于统计）
          this.saveChatHistory(question, replyText);
          
          this.scrollToBottom();
        })
        .catch(err => {
          console.error('AI请求失败', err);
          const fallbackMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: '抱歉，AI服务暂时不可用。我是六堡茶AI助手，您可以问我关于六堡茶的问题，如功效、冲泡方法、制作工艺等。',
            time: this.formatTime(new Date())
          };
          const newMessageList = [...this.data.messageList, fallbackMessage];
          this.setData({
            messageList: newMessageList,
            isLoading: false
          });
          this.saveSession(this.data.currentSessionId, newMessageList);
          this.scrollToBottom();
        });
    } else {
      console.error('api.chat 方法不存在');
      const fallbackMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '我是六堡茶AI助手，专门为您解答六堡茶相关问题。请问您想了解六堡茶的哪方面？如功效、冲泡方法、制作工艺等。',
        time: this.formatTime(new Date())
      };
      const newMessageList = [...this.data.messageList, fallbackMessage];
      this.setData({
        messageList: newMessageList,
        isLoading: false
      });
      this.saveSession(this.data.currentSessionId, newMessageList);
      this.scrollToBottom();
    }
  },

  formatAIResponse(res) {
    if (typeof res === 'string') return res;
    if (res.message) return res.message;
    if (res.response) return res.response;
    if (res.reply) return res.reply;
    return '收到您的问题了，我正在思考中...';
  },

  /**
   * 获取推荐问题的模拟回复（仅用于6个推荐问题）
   */
  getMockResponse(question) {
    setTimeout(() => {
      let reply = '';
      const q = question.toLowerCase();
      
      if (q.includes('功效') || q.includes('好处') || q.includes('作用') || q.includes('保健')) {
        reply = '🍵 六堡茶具有祛湿解暑、消食去腻、降脂减肥、抗氧化等功效。长期饮用有助于调节肠胃功能，促进新陈代谢，是健康的养生茶饮。';
      } 
      else if (q.includes('冲泡') || q.includes('怎么泡') || q.includes('如何泡') || q.includes('煮')) {
        reply = '🍃 六堡茶冲泡建议：\n\n1️⃣ 选用紫砂壶或盖碗\n2️⃣ 沸水润茶1-2遍\n3️⃣ 100°C沸水冲泡\n4️⃣ 前三泡快速出汤（5-10秒）\n5️⃣ 后续每泡适当延长5-10秒\n6️⃣ 也可煮饮，风味更佳浓郁';
      } 
      else if (q.includes('制作') || q.includes('工艺') || q.includes('渥堆') || q.includes('发酵')) {
        reply = '🏺 六堡茶传统制作工艺：\n\n杀青 → 揉捻 → 渥堆 → 复揉 → 干燥\n\n其中"渥堆"是形成六堡茶独特品质的关键工序，需要在特定温湿度条件下进行发酵，使茶叶产生独特的槟榔香和陈香。';
      } 
      else if (q.includes('鉴别') || q.includes('好坏') || q.includes('品质') || q.includes('真假')) {
        reply = '🔍 鉴别六堡茶品质四步法：\n\n✓ 观色：茶汤红浓明亮，如琥珀色\n✓ 闻香：有独特的槟榔香或陈香，无异味\n✓ 品味：醇厚顺滑，回甘明显，无苦涩\n✓ 看叶底：柔软有活性，色泽均匀';
      } 
      else if (q.includes('历史') || q.includes('由来') || q.includes('起源') || q.includes('文化')) {
        reply = '📜 六堡茶产于广西梧州市苍梧县六堡镇，有1500多年历史。清代嘉庆年间成为名茶，远销南洋，被誉为"可以喝的古董"，其"茶船古道"是重要的茶叶贸易通道。';
      } 
      else if (q.includes('产地') || q.includes('哪里') || q.includes('六堡镇')) {
        reply = '📍 六堡茶产自广西梧州市苍梧县六堡镇，核心产区以"四柳"最为著名——黑石、恭州、蚕村、大宁。';
      }
      else {
        reply = '🍃 我是六堡茶AI助手，可以为您解答：\n\n• 六堡茶有什么功效？\n• 六堡茶如何冲泡？\n• 六堡茶的制作工艺\n• 如何鉴别六堡茶的好坏？\n• 六堡茶的历史文化\n• 六堡茶的储存方法\n\n请问您想了解哪方面？';
      }
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: reply,
        time: this.formatTime(new Date())
      };
      
      const newMessageList = [...this.data.messageList, assistantMessage];
      this.setData({
        messageList: newMessageList,
        isLoading: false
      });
      
      this.saveSession(this.data.currentSessionId, newMessageList);
      
      // 保存对话历史到全局存储（用于统计）
      this.saveChatHistory(question, reply);
      
      this.scrollToBottom();
    }, 500);
  },

  sendSuggest(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ inputText: text });
    this.sendMessage();
  },

  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  toggleSessionList() {
    this.setData({ showSessionList: !this.data.showSessionList });
    if (!this.data.showSessionList) {
      this.loadSessionList();
    }
  },

  closeSessionList() {
    this.setData({ showSessionList: false });
  },

  scrollToBottom() {
    setTimeout(() => {
      this.setData({ scrollToView: 'bottom-space' });
    }, 100);
  },

  navigateBack() {
    wx.navigateBack();
  },

  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  onPullDownRefresh() {
    this.loadSessionList();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  onShareAppMessage() {
    return {
      title: '六堡茶AI助手 - AI茶博士智能问答',
      path: '/miniprogram/pages/chat/chat'
    };
  }
});