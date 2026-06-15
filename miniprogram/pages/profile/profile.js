// pages/profile/profile.js
const api = require('../../utils/api.js');

const app = getApp();

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '茶友_007',
      role: '六堡茶爱好者'
    },
    stats: {
      diagnoseCount: 0,
      chatCount: 0,
      favoriteCount: 0
    },
    menuItems: [
      { icon: '📋', title: '诊断记录', url: '/miniprogram/pages/history/history', type: 'page' },
      { icon: '💬', title: '对话历史', url: '/miniprogram/pages/chat/chat', type: 'history' },
      { icon: '⭐', title: '收藏的知识', url: '/miniprogram/pages/favorites/favorites', type: 'page' },  
      { icon: '🌱', title: '我的茶园', url: '/miniprogram/pages/garden/garden', type: 'page' },
      { icon: '📊', title: '数据统计', url: '', type: 'stats' }
    ],
    settings: [
      { icon: '🔔', title: '消息通知', type: 'switch', value: true },
      { icon: '🗺️', title: '位置权限', type: 'setting', settingType: 'location' },
      { icon: '📷', title: '相机权限', type: 'setting', settingType: 'camera' },
      { icon: '🌙', title: '深色模式', type: 'switch', value: false }
    ],
    isLoading: false
  },

  onLoad(options) {
    this.loadUserInfo();
    this.loadAllStats();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    this.loadAllStats();
  },

  loadUserInfo() {
    try {
      let userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ userInfo: userInfo });
      } else {
        const defaultUserInfo = {
          avatarUrl: '',
          nickName: '茶友_' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
          role: '六堡茶爱好者'
        };
        this.setData({ userInfo: defaultUserInfo });
        wx.setStorageSync('userInfo', defaultUserInfo);
      }
      
      if (app.globalData) {
        app.globalData.userInfo = this.data.userInfo;
      }
    } catch (e) {
      console.error('加载用户信息失败', e);
    }
  },

  loadAllStats() {
    this.setData({ isLoading: true });
    
    const BASE_URL = api.BASE_URL || 'http://172.18.106.153:5000';
    
    wx.request({
      url: `${BASE_URL}/api/diagnose/images/list`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        if (res.data && res.data.success) {
          const diagnoseCount = res.data.total;
          this.loadChatCount(diagnoseCount);
        } else {
          this.loadStatsFromLocal();
        }
      },
      fail: (err) => {
        console.error('从后端加载统计失败:', err);
        this.loadStatsFromLocal();
      }
    });
  },

  loadChatCount(diagnoseCount) {
    try {
      const chatHistory = wx.getStorageSync('chat_history') || [];
      const chatCount = chatHistory.filter(msg => msg.role === 'user').length;
      const favorites = wx.getStorageSync('favorites') || [];
      const favoriteCount = favorites.length;
      
      this.setData({
        stats: {
          diagnoseCount: diagnoseCount,
          chatCount: chatCount,
          favoriteCount: favoriteCount
        },
        isLoading: false
      });
      
      if (app.globalData) {
        app.globalData.diagnoseCount = diagnoseCount;
        app.globalData.chatCount = chatCount;
        app.globalData.favoriteCount = favoriteCount;
      }
      
      console.log('📊 统计数据加载完成:', this.data.stats);
    } catch (e) {
      console.error('加载对话次数失败', e);
      this.setData({ isLoading: false });
    }
  },

  loadStatsFromLocal() {
    try {
      const diagnoseHistory = wx.getStorageSync('diagnose_history') || [];
      const diagnoseCount = diagnoseHistory.length;
      const chatHistory = wx.getStorageSync('chat_history') || [];
      const chatCount = chatHistory.filter(msg => msg.role === 'user').length;
      const favorites = wx.getStorageSync('favorites') || [];
      const favoriteCount = favorites.length;
      
      this.setData({
        stats: {
          diagnoseCount: diagnoseCount,
          chatCount: chatCount,
          favoriteCount: favoriteCount
        },
        isLoading: false
      });
      
      console.log('📊 统计数据加载完成(本地降级):', this.data.stats);
    } catch (e) {
      console.error('加载统计数据失败', e);
      this.setData({ isLoading: false });
    }
  },

  refreshStats() {
    wx.showToast({ title: '刷新中...', icon: 'loading', duration: 500 });
    this.loadAllStats();
  },

  editProfile() {
    wx.showActionSheet({
      itemList: ['修改昵称', '更换头像'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.editNickName();
        } else if (res.tapIndex === 1) {
          this.changeAvatar();
        }
      }
    });
  },

  editNickName() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入昵称',
      defaultValue: this.data.userInfo.nickName,
      success: (res) => {
        if (res.confirm && res.content) {
          const newUserInfo = { ...this.data.userInfo, nickName: res.content };
          this.setData({ userInfo: newUserInfo });
          this.saveUserInfo(newUserInfo);
          wx.showToast({ title: '修改成功', icon: 'success' });
        }
      }
    });
  },

  changeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        const newUserInfo = { ...this.data.userInfo, avatarUrl: tempFilePath };
        this.setData({ userInfo: newUserInfo });
        this.saveUserInfo(newUserInfo);
        wx.showToast({ title: '头像已更新', icon: 'success' });
      },
      fail: (err) => {
        console.error('选择图片失败', err);
        wx.showToast({ title: '获取图片失败', icon: 'none' });
      }
    });
  },

  saveUserInfo(userInfo) {
    try {
      wx.setStorageSync('userInfo', userInfo);
      if (app.globalData) {
        app.globalData.userInfo = userInfo;
      }
    } catch (e) {
      console.error('保存用户信息失败', e);
    }
  },

  onMenuItemTap(e) {
    const item = e.currentTarget.dataset.item;
    
    switch (item.type) {
      case 'page':
        if (item.url) {
          wx.navigateTo({
            url: item.url,
            fail: () => {
              wx.showToast({ title: '页面开发中', icon: 'none' });
            }
          });
        }
        break;
      case 'history':
        this.showChatHistory();
        break;
      case 'favorites':
        this.showFavorites();
        break;
      case 'stats':
        this.showDetailStats();
        break;
      default:
        break;
    }
  },

  showChatHistory() {
    const chatHistory = wx.getStorageSync('chat_history') || [];
    if (chatHistory.length === 0) {
      wx.showModal({
        title: '提示',
        content: '暂无对话历史\n\n去聊天页面和AI对话吧',
        showCancel: false
      });
      return;
    }
    
    const userMessages = chatHistory.filter(msg => msg.role === 'user');
    const totalMessages = chatHistory.length;
    const historyList = chatHistory.slice(-20).map(msg => ({
      role: msg.role === 'user' ? '👤 我' : '🤖 AI茶博士',
      content: msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content,
      time: msg.time || ''
    }));
    
    const content = `📊 对话统计\n\n共 ${userMessages.length} 次提问，${totalMessages} 条对话\n\n最近对话：\n${historyList.map(h => `${h.role}：${h.content}`).join('\n\n')}`;
    
    wx.showModal({
      title: '对话历史',
      content: content,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#2E7D32'
    });
  },

  showFavorites() {
    // 跳转到收藏页面
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    });
  },

  showDetailStats() {
    const { stats } = this.data;
    const content = `
📊 详细统计数据

🔬 病害识别：${stats.diagnoseCount} 次
💬 AI提问：${stats.chatCount} 次
⭐ 知识收藏：${stats.favoriteCount} 条

━━━━━━━━━━━━━━━━
📌 说明：
• 病害识别 = 保存的诊断图片数
• 提问次数 = 聊天中的提问数量
• 收藏数量 = 收藏的文章/知识数
    `;
    
    wx.showModal({
      title: '数据统计',
      content: content,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#2E7D32'
    });
  },

  onSettingSwitch(e) {
    const index = e.currentTarget.dataset.index;
    const newValue = e.detail.value;
    const settings = [...this.data.settings];
    settings[index].value = newValue;
    this.setData({ settings: settings });
    
    try {
      wx.setStorageSync('settings', settings);
      wx.showToast({ title: newValue ? '已开启' : '已关闭', icon: 'success', duration: 1000 });
    } catch (err) {
      console.error('保存设置失败', err);
    }
  },

  openSetting(e) {
    wx.openSetting({
      success: (res) => {
        console.log('设置成功', res);
        wx.showToast({ title: '设置成功', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '设置失败', icon: 'none' });
      }
    });
  },

  showAbout() {
    wx.showModal({
      title: '关于六堡茶AI助手',
      content: '版本：1.0.0\n\n六堡茶AI智能助手，为您提供专业的六堡茶知识问答、病害识别、茶园管理等功能。\n\n基于AI大模型技术支持，让茶文化更智能。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？这将清除诊断记录、对话历史等本地数据。',
      confirmColor: '#F44336',
      confirmText: '清空',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          try {
            const userInfo = wx.getStorageSync('userInfo');
            wx.clearStorageSync();
            if (userInfo) {
              wx.setStorageSync('userInfo', userInfo);
            }
            
            this.setData({
              stats: {
                diagnoseCount: 0,
                chatCount: 0,
                favoriteCount: 0
              }
            });
            
            wx.showToast({ title: '缓存已清除', icon: 'success' });
          } catch (e) {
            console.error('清除失败', e);
            wx.showToast({ title: '清除失败', icon: 'none' });
          }
        }
      }
    });
  },

  onPullDownRefresh() {
    this.loadAllStats();
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '已刷新', icon: 'success', duration: 1000 });
    }, 1000);
  },

  onShareAppMessage() {
    return {
      title: '六堡茶AI助手 - 您的智能茶文化助手',
      path: '/pages/index/index'
    };
  }
});