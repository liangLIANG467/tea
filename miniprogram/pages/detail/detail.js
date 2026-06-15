// pages/detail/detail.js
const api = require('../../utils/api.js');

Page({
  data: {
    detail: null,
    isLoading: true,
    isLiked: false,
    isCollected: false,
    shareTitle: '',
    sharePath: '',
    shareImageUrl: ''
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      this.loadArticle(id);
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  async loadArticle(id) {
    this.setData({ isLoading: true });
    
    try {
      const result = await api.getArticleDetail(id);
      
      if (result.success && result.data) {
        // 设置分享数据
        this.setData({
          detail: result.data,
          isLoading: false,
          shareTitle: result.data.title,
          sharePath: `/pages/detail/detail?id=${result.data.id}`,
          shareImageUrl: result.data.coverImageUrl || result.data.coverImage
        });
        wx.setNavigationBarTitle({ title: result.data.title });
        
        this.checkCollectStatus();
      } else {
        throw new Error('文章不存在');
      }
    } catch (error) {
      console.error('加载文章失败:', error);
      this.setData({ isLoading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /**
   * 检查收藏状态
   */
  checkCollectStatus() {
    try {
      const favorites = wx.getStorageSync('favorites') || [];
      const isCollected = favorites.some(item => 
        item.type === 'article' && item.articleId === this.data.detail?.id
      );
      this.setData({ isCollected });
    } catch (e) {
      console.error('检查收藏状态失败', e);
    }
  },

  /**
   * 显示分享菜单（点击分享按钮时弹出选择）
   */
  showShareMenu() {
    const that = this;
    
    wx.showActionSheet({
      itemList: ['发送给好友', '分享到朋友圈', '收藏文章', '复制链接'],
      itemColor: '#2E7D32',
      success(res) {
        switch (res.tapIndex) {
          case 0:
            // 发送给好友 - 提示用户点击右上角分享
            that.shareToFriend();
            break;
          case 1:
            // 分享到朋友圈
            that.shareToTimeline();
            break;
          case 2:
            // 收藏文章
            that.toggleCollect();
            break;
          case 3:
            // 复制链接
            that.copyLink();
            break;
        }
      },
      fail(err) {
        console.log('取消分享', err);
      }
    });
  },

  /**
   * 分享给好友（提示用户点击右上角）
   */
  shareToFriend() {
    wx.showModal({
      title: '分享文章',
      content: '请点击右上角"···"按钮，选择"发送给好友"',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#2E7D32'
    });
  },

  /**
   * 分享到朋友圈（提示用户点击右上角）
   */
  shareToTimeline() {
    wx.showModal({
      title: '分享到朋友圈',
      content: '请点击右上角"···"按钮，选择"分享到朋友圈"',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#2E7D32'
    });
  },

  /**
   * 切换点赞
   */
  async toggleLike() {
    if (this.data.isLiked) {
      wx.showToast({ title: '已经点过赞了', icon: 'none' });
      return;
    }
    
    try {
      const result = await api.likeArticle(this.data.detail.id);
      if (result.success) {
        this.setData({
          'detail.likeCount': result.likeCount,
          isLiked: true
        });
        wx.showToast({ title: '点赞成功', icon: 'success' });
        wx.vibrateShort({ type: 'light' });
      }
    } catch (error) {
      console.error('点赞失败:', error);
      wx.showToast({ title: '点赞失败', icon: 'error' });
    }
  },

  /**
   * 切换收藏
   */
  toggleCollect() {
    if (this.data.isCollected) {
      this.removeFromFavorites();
    } else {
      this.addToFavorites();
    }
  },

  /**
   * 添加到收藏
   */
  addToFavorites() {
    try {
      let favorites = wx.getStorageSync('favorites') || [];
      const { detail } = this.data;
      
      if (!detail) return;
      
      const exists = favorites.some(item => item.type === 'article' && item.articleId === detail.id);
      
      if (exists) {
        wx.showToast({ title: '已收藏过了', icon: 'none' });
        return;
      }
      
      const newFavorite = {
        id: Date.now(),
        type: 'article',
        articleId: detail.id,
        title: detail.title,
        content: detail.content ? detail.content.substring(0, 100) : '',
        coverImage: detail.coverImage,
        collectTime: this.formatTime(new Date())
      };
      
      favorites.unshift(newFavorite);
      wx.setStorageSync('favorites', favorites);
      
      this.setData({ isCollected: true });
      wx.showToast({ title: '收藏成功', icon: 'success' });
      wx.vibrateShort({ type: 'light' });
      
    } catch (e) {
      console.error('收藏失败', e);
      wx.showToast({ title: '收藏失败', icon: 'error' });
    }
  },

  /**
   * 取消收藏
   */
  removeFromFavorites() {
    try {
      let favorites = wx.getStorageSync('favorites') || [];
      const { detail } = this.data;
      
      if (!detail) return;
      
      favorites = favorites.filter(item => 
        !(item.type === 'article' && item.articleId === detail.id)
      );
      
      wx.setStorageSync('favorites', favorites);
      
      this.setData({ isCollected: false });
      wx.showToast({ title: '已取消收藏', icon: 'success' });
      
    } catch (e) {
      console.error('取消收藏失败', e);
      wx.showToast({ title: '操作失败', icon: 'error' });
    }
  },

  /**
   * 复制链接
   */
  copyLink() {
    const { detail } = this.data;
    if (!detail) return;
    
    // 生成分享文本
    const link = `${detail.title}\n\n${detail.content ? detail.content.substring(0, 100) : ''}...\n\n—— 来自六堡茶AI助手`;
    
    wx.setClipboardData({
      data: link,
      success: () => {
        wx.showToast({ title: '内容已复制', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '复制失败', icon: 'error' });
      }
    });
  },

  /**
   * 预览封面图片
   */
  previewImage() {
    const { detail } = this.data;
    if (!detail) return;
    
    const imageUrl = detail.coverImageUrl || detail.coverImage;
    
    wx.previewImage({
      urls: [imageUrl],
      current: imageUrl
    });
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  /**
   * 页面分享给好友（右上角菜单）
   */
  onShareAppMessage() {
    const { shareTitle, sharePath, shareImageUrl } = this.data;
    return {
      title: shareTitle || '六堡茶知识',
      path: sharePath || '/pages/index/index',
      imageUrl: shareImageUrl
    };
  },

  /**
   * 分享到朋友圈（右上角菜单）
   */
  onShareTimeline() {
    const { shareTitle, sharePath, shareImageUrl } = this.data;
    return {
      title: shareTitle || '六堡茶知识',
      query: sharePath ? sharePath.split('?')[1] : '',
      imageUrl: shareImageUrl
    };
  },

  /**
   * 返回上一页
   */
  navigateBack() {
    wx.navigateBack();
  }
});