// pages/history/history.js
const api = require('../../utils/api.js');

Page({
  data: {
    historyList: [],
    isLoading: true,
    imageList: []
  },

  onShow() {
    this.loadImagesFromBackend();
  },

  onPullDownRefresh() {
    this.loadImagesFromBackend();
    wx.stopPullDownRefresh();
  },

  /**
   * 从后端images文件夹直接加载图片列表
   */
  loadImagesFromBackend() {
    this.setData({ isLoading: true });
    
    const BASE_URL = api.BASE_URL || 'http://172.18.106.153:5000';
    
    wx.request({
      url: `${BASE_URL}/api/diagnose/images/list`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        
        console.log('后端返回图片列表:', res.data);
        
        if (res.data && res.data.success) {
          const images = res.data.data;
          const BASE_URL = api.BASE_URL || 'http://127.0.0.1:5000';
          
          const imageList = images.map((item, index) => ({
            id: Date.now() + index,
            fileName: item.fileName,
            disease: item.disease,
            path: `${BASE_URL}${item.imageUrl}`,
            saveTime: this.formatSaveTime(item.saveTime),
            confidence: '—' // 从文件名无法获取置信度
          }));
          
          this.setData({
            imageList: imageList,
            isLoading: false
          });
          console.log('显示图片数量:', imageList.length);
        } else {
          this.setData({ isLoading: false });
          wx.showToast({ title: '加载失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('加载图片失败:', err);
        this.setData({ isLoading: false });
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  /**
   * 格式化保存时间
   */
  formatSaveTime(timeStr) {
    if (!timeStr) return '未知时间';
    // 将 20241215_143025 格式化为 2024-12-15 14:30:25
    const parts = timeStr.split('_');
    if (parts.length !== 2) return timeStr;
    const date = parts[0];
    const time = parts[1];
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    const hour = time.substring(0, 2);
    const minute = time.substring(2, 4);
    const second = time.substring(4, 6);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },

  /**
   * 手动刷新
   */
  manualSync() {
    console.log('手动刷新开始...');
    this.loadImagesFromBackend();
    wx.showToast({ title: '已刷新', icon: 'success' });
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    const current = this.data.imageList[index];
    if (current && current.path) {
      wx.previewImage({
        urls: [current.path],
        current: current.path
      });
    }
  },

  /**
   * 删除单张图片
   */
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const imageToDelete = this.data.imageList[index];
    const that = this;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除这张图片吗？删除后无法恢复。',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          that.deleteFromBackend(imageToDelete, index);
        }
      }
    });
  },

  /**
   * 从后端删除图片
   */
  deleteFromBackend(imageToDelete, index) {
    const BASE_URL = api.BASE_URL || 'http://127.0.0.1:5000';
    const fileName = imageToDelete.fileName;
    
    wx.showLoading({ title: '删除中...', mask: true });
    
    wx.request({
      url: `${BASE_URL}/api/diagnose/image/delete/${fileName}`,
      method: 'DELETE',
      success: (res) => {
        wx.hideLoading();
        console.log('删除响应:', res.data);
        
        if (res.data && res.data.success) {
          // 从列表中移除
          const newImageList = this.data.imageList.filter((_, i) => i !== index);
          this.setData({ imageList: newImageList });
          wx.showToast({ title: '已删除', icon: 'success' });
        } else {
          wx.showToast({ title: res.data.message || '删除失败', icon: 'error' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('删除失败:', err);
        wx.showToast({ title: '删除失败', icon: 'error' });
      }
    });
  },

  /**
   * 删除所有图片
   */
  deleteAllImages() {
    if (this.data.imageList.length === 0) return;
    
    wx.showModal({
      title: '提示',
      content: `确定要删除全部 ${this.data.imageList.length} 张图片吗？此操作不可恢复。`,
      confirmColor: '#F44336',
      confirmText: '清空',
      success: (res) => {
        if (res.confirm) {
          this.deleteAllFromBackend();
        }
      }
    });
  },

  /**
   * 清空后端所有图片
   */
  deleteAllFromBackend() {
    const BASE_URL = api.BASE_URL || 'http://127.0.0.1:5000';
    
    wx.showLoading({ title: '清空中...', mask: true });
    
    wx.request({
      url: `${BASE_URL}/api/diagnose/images/delete-all`,
      method: 'DELETE',
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.success) {
          this.setData({ imageList: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
        } else {
          wx.showToast({ title: '清空失败', icon: 'error' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('清空失败:', err);
        wx.showToast({ title: '清空失败', icon: 'error' });
      }
    });
  },

  /**
   * 保存图片到相册
   */
  saveImageToAlbum(e) {
    const index = e.currentTarget.dataset.index;
    const imagePath = this.data.imageList[index].path;
    
    if (!imagePath) {
      wx.showToast({ title: '图片路径无效', icon: 'error' });
      return;
    }
    
    wx.saveImageToPhotosAlbum({
      filePath: imagePath,
      success: () => {
        wx.showToast({ title: '已保存到相册', icon: 'success' });
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '提示',
            content: '需要您授权保存图片到相册',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          wx.showToast({ title: '保存失败', icon: 'error' });
        }
      }
    });
  }
});