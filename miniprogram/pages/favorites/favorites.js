// pages/favorites/favorites.js
Page({
  data: {
    favorites: [],
    filteredFavorites: [],
    isLoading: true,
    activeTab: 'all',
    tabs: [
      { id: 'all', name: '全部' },
      { id: 'article', name: '文章' },
      { id: 'knowledge', name: '茶知识' }
    ]
  },

  onShow() {
    console.log('=== 收藏页面显示 ===');
    this.loadFavorites();
  },

  onLoad() {
    console.log('=== 收藏页面加载 ===');
  },

  onPullDownRefresh() {
    this.loadFavorites();
    wx.stopPullDownRefresh();
  },

  manualRefresh() {
    wx.showToast({ title: '刷新中...', icon: 'loading', duration: 500 });
    this.loadFavorites();
  },

  loadFavorites() {
    this.setData({ isLoading: true });
    
    try {
      let favorites = wx.getStorageSync('favorites') || [];
      
      console.log('原始收藏数据:', favorites);
      
      const formattedFavorites = favorites.map((item, index) => {
        let coverImageUrl = '';
        if (item.coverImage) {
          let filename = item.coverImage;
          if (filename.includes('/')) {
            filename = filename.split('/').pop();
          }
          if (filename.includes('\\')) {
            filename = filename.split('\\').pop();
          }
          // 使用本地图片路径（小程序本地资源）
          coverImageUrl = `/miniprogram/images/${filename}`;
        }
        
        return {
          id: item.id || index,
          type: item.type || (item.articleId ? 'article' : 'knowledge'),
          articleId: item.articleId || item.id,
          title: item.title || (item.type === 'knowledge' ? '今日茶知识' : '文章'),
          content: item.content || '',
          coverImage: item.coverImage || '',
          coverImageUrl: coverImageUrl,
          collectTime: item.collectTime || item.saveTime || '未知时间'
        };
      });
      
      console.log('格式化后数据:', formattedFavorites);
      
      this.setData({ 
        favorites: formattedFavorites,
        isLoading: false 
      });
      
      this.filterFavorites();
      
      if (formattedFavorites.length > 0) {
        wx.showToast({ title: `加载${formattedFavorites.length}条收藏`, icon: 'none', duration: 1500 });
      }
      
    } catch (e) {
      console.error('加载收藏失败', e);
      this.setData({ isLoading: false });
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
  },

  filterFavorites() {
    const { favorites, activeTab } = this.data;
    let filtered = [];
    
    if (activeTab === 'all') {
      filtered = favorites;
    } else if (activeTab === 'article') {
      filtered = favorites.filter(item => item.type === 'article');
    } else if (activeTab === 'knowledge') {
      filtered = favorites.filter(item => item.type === 'knowledge');
    }
    
    this.setData({ filteredFavorites: filtered });
    console.log('筛选后列表:', filtered.length, '条');
  },

  switchTab(e) {
    const tabId = e.currentTarget.dataset.id;
    this.setData({ activeTab: tabId });
    this.filterFavorites();
  },

  viewDetail(e) {
    const item = e.currentTarget.dataset.item;
    console.log('查看详情:', item);
    
    if (item.type === 'article' && item.articleId) {
      wx.navigateTo({
        url: `/miniprogram/pages/detail/detail?id=${item.articleId}`,
        fail: (err) => {
          console.error('跳转失败', err);
          wx.showToast({ title: '文章不存在', icon: 'none' });
        }
      });
    } else if (item.type === 'knowledge') {
      wx.showModal({
        title: '📖 茶知识',
        content: item.content || item.title,
        confirmText: '知道了',
        confirmColor: '#2E7D32',
        showCancel: false
      });
    } else {
      wx.showModal({
        title: item.title || '收藏内容',
        content: item.content || '暂无内容',
        confirmText: '知道了',
        confirmColor: '#2E7D32'
      });
    }
  },

  // 图片加载失败时使用默认占位图
  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    const { filteredFavorites } = this.data;
    if (filteredFavorites[index]) {
      // 使用默认占位图
      filteredFavorites[index].coverImageUrl = '/miniprogram/images/default.png';
      this.setData({ filteredFavorites });
    }
  },

  deleteFavoriteByIndex(e) {
    const item = e.currentTarget.dataset.item;
    const that = this;
    
    wx.showModal({
      title: '提示',
      content: `确定要删除"${item.title || '这条收藏'}"吗？`,
      confirmColor: '#F44336',
      confirmText: '删除',
      success: (res) => {
        if (res.confirm) {
          that.deleteFavorite(item);
        }
      }
    });
  },

  deleteFavorite(item) {
    try {
      let favorites = wx.getStorageSync('favorites') || [];
      
      if (item.type === 'article' && item.articleId) {
        favorites = favorites.filter(f => !(f.type === 'article' && f.articleId === item.articleId));
      } else if (item.type === 'knowledge') {
        favorites = favorites.filter(f => !(f.type === 'knowledge' && f.content === item.content));
      } else {
        favorites = favorites.filter(f => f.id !== item.id);
      }
      
      wx.setStorageSync('favorites', favorites);
      this.loadFavorites();
      
      wx.showToast({ title: '已移除', icon: 'success' });
      
      const pages = getCurrentPages();
      const profilePage = pages.find(p => p.route === 'pages/profile/profile');
      if (profilePage) {
        profilePage.setData({ 'stats.favoriteCount': favorites.length });
      }
      
    } catch (e) {
      console.error('删除失败', e);
      wx.showToast({ title: '操作失败', icon: 'error' });
    }
  },

  clearAllFavorites() {
    if (this.data.favorites.length === 0) return;
    
    wx.showModal({
      title: '提示',
      content: `确定要清空全部 ${this.data.favorites.length} 条收藏吗？`,
      confirmColor: '#F44336',
      confirmText: '清空',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('favorites');
          this.setData({ favorites: [], filteredFavorites: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
          
          const pages = getCurrentPages();
          const profilePage = pages.find(p => p.route === 'pages/profile/profile');
          if (profilePage) {
            profilePage.setData({ 'stats.favoriteCount': 0 });
          }
        }
      }
    });
  }
});