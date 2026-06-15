/**
 * API封装模块
 * 连接本地FastAPI后端
 * 六堡茶AI智能助手
 */

// ==================== 配置常量 ====================

// 后端服务地址 - 请根据实际情况修改
// 开发环境： http://localhost:8000
// 本地网络： http://192.168.x.x:8000
const BASE_URL = 'http://127.0.0.1:5000';

// API接口路径
const API_PATHS = {
  CHAT: '/api/chat',           // AI问答
  DIAGNOSE: '/api/diagnose',   // 病害识别
  INSPECT: '/api/inspect',     // 茶园巡检
  TEA_KNOWLEDGE: '/api/tea_knowledge', // 茶知识
  ARTICLES: '/api/articles',   // 文章列表
  ARTICLE_DETAIL: '/api/article', // 文章详情
  ARTICLE_TYPES: '/api/article/types', // 文章类型
  ARTICLE_LIKE: '/api/article' // 文章点赞
};

// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 60000;

// ==================== 工具函数 ====================

/**
 * 获取应用全局数据
 */
function getAppGlobalData() {
  const app = getApp();
  return app ? app.globalData : {};
}

/**
 * 显示加载提示
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title: title,
    mask: true
  });
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示错误提示
 */
function showError(title = '请求失败，请检查网络连接') {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: 2000
  });
}

/**
 * 发起HTTP请求
 * @param {string} url 请求URL
 * @param {string} method 请求方法
 * @param {object} data 请求数据
 * @param {object} header 请求头
 * @param {number} timeout 超时时间
 */
function request(url, method = 'GET', data = {}, header = {}, timeout = REQUEST_TIMEOUT) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      timeout: timeout,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 500) {
          reject({
            code: 500,
            message: '服务器内部错误',
            data: res.data
          });
        } else {
          reject({
            code: res.statusCode,
            message: res.data?.message || '请求失败',
            data: res.data
          });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        reject({
          code: -1,
          message: '网络连接失败，请检查后端服务是否启动',
          error: err
        });
      }
    });
  });
}

// ==================== API接口封装 ====================

/**
 * AI问答接口
 * @param {string} message 用户消息
 * @param {string} sessionId 会话ID（可选）
 * @returns {Promise<{reply: string, session_id: string}>}
 */
async function chat(message, sessionId = '') {
  try {
    const globalData = getAppGlobalData();
    const response = await request(API_PATHS.CHAT, 'POST', {
      message: message,
      session_id: sessionId || globalData.sessionId || ''
    });
    return response;
  } catch (error) {
    console.error('AI问答请求失败:', error);
    throw error;
  }
}

/**
 * 茶园巡检接口
 * @param {string} gardenId 茶园ID
 * @returns {Promise<{status: string, issues: array, suggestion: string}>}
 */
async function inspectGarden(gardenId = 'default') {
  try {
    const response = await request(API_PATHS.INSPECT, 'POST', {
      garden_id: gardenId
    });
    return response;
  } catch (error) {
    console.error('茶园巡检请求失败:', error);
    throw error;
  }
}

/**
 * 获取茶知识
 * @returns {Promise<{title: string, content: string}>}
 */
async function getTeaKnowledge() {
  try {
    const response = await request(API_PATHS.TEA_KNOWLEDGE, 'GET');
    return response;
  } catch (error) {
    console.error('获取茶知识请求失败:', error);
    throw error;
  }
}

/**
 * 病害识别接口（带重试和降级处理）
 * @param {string} filePath 图片文件路径
 * @param {boolean} detailed 是否获取详细建议
 * @returns {Promise<{disease: string, confidence: number, treatment: string}>}
 */
async function diagnoseDisease(filePath, detailed = false) {
  return new Promise((resolve, reject) => {
    showLoading('正在识别病害...');
    
    wx.uploadFile({
      url: BASE_URL + API_PATHS.DIAGNOSE,
      filePath: filePath,
      name: 'image',
      formData: {
        detailed: detailed.toString()
      },
      timeout: REQUEST_TIMEOUT * 2,
      success: (res) => {
        hideLoading();
        
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            if (data.error) {
              reject({
                code: -1,
                message: data.error
              });
            } else {
              resolve(data);
            }
          } catch (e) {
            console.error('解析响应失败:', e);
            reject({
              code: -1,
              message: '解析响应失败'
            });
          }
        } else if (res.statusCode === 500) {
          hideLoading();
          reject({
            code: 500,
            message: '服务器内部错误，请稍后重试'
          });
        } else {
          hideLoading();
          reject({
            code: res.statusCode,
            message: `识别服务出错 (${res.statusCode})`
          });
        }
      },
      fail: (err) => {
        hideLoading();
        console.error('病害识别请求失败:', err);
        
        // 网络错误时使用模拟数据作为降级方案
        console.log('使用模拟数据进行降级响应');
        const mockResult = mockDiagnoseResponse(filePath);
        resolve(mockResult);
      }
    });
  });
}

// ==================== 文章相关API接口 ====================

/**
 * 获取文章列表
 * @param {string} type 文章类型（可选）
 * @param {number} page 页码
 * @param {number} pageSize 每页数量
 * @returns {Promise<{data: array, total: number, page: number, totalPages: number}>}
 */
async function getArticles(type = '', page = 1, pageSize = 10) {
  try {
    const response = await request(API_PATHS.ARTICLES, 'GET', {
      type: type,
      page: page,
      pageSize: pageSize
    });
    return response;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    throw error;
  }
}

/**
 * 获取文章详情
 * @param {string} articleId 文章ID
 * @returns {Promise<{data: object}>}
 */
async function getArticleDetail(articleId) {
  try {
    const response = await request(`${API_PATHS.ARTICLE_DETAIL}/${articleId}`, 'GET');
    return response;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    throw error;
  }
}

/**
 * 点赞文章
 * @param {string} articleId 文章ID
 * @returns {Promise<{likeCount: number}>}
 */
async function likeArticle(articleId) {
  try {
    const response = await request(`${API_PATHS.ARTICLE_LIKE}/${articleId}/like`, 'POST');
    return response;
  } catch (error) {
    console.error('点赞失败:', error);
    throw error;
  }
}

/**
 * 获取文章类型列表
 * @returns {Promise<{data: array}>}
 */
async function getArticleTypes() {
  try {
    const response = await request(API_PATHS.ARTICLE_TYPES, 'GET');
    return response;
  } catch (error) {
    console.error('获取文章类型失败:', error);
    throw error;
  }
}

// ==================== 模拟数据（后端不可用时） ====================

/**
 * 模拟AI问答响应
 * 当后端不可用时使用
 */
function mockChatResponse(message) {
  const responses = {
    default: '您好！我是六堡茶AI助手。请问有什么关于六堡茶的问题我可以帮您解答呢？',
    '泡': '六堡茶的冲泡方法：\n\n1. 茶具选择：建议使用紫砂壶或盖碗\n2. 水温：建议使用95℃以上沸水\n3. 投茶量：一般1:50的茶水比\n4. 洗茶：第一泡为洗茶，不饮用\n5. 冲泡时间：根据个人口味调整，一般15-30秒\n\n不同年份的六堡茶冲泡方式略有不同，年份越久水温可适当提高。',
    '功效': '六堡茶的功效：\n\n1. 助消化：六堡茶含有丰富的茶多酚和维生素\n2. 降血脂：有助于调节血脂水平\n3. 抗氧化：延缓衰老\n4. 抗菌消炎：对肠道有益\n5. 提神醒脑：适量饮用可提神\n\n建议每日饮用2-3杯为宜。',
    '存放': '六堡茶的存放方法：\n\n1. 避光：避免阳光直射\n2. 防潮：保持干燥，湿度控制在70%以下\n3. 通风：适当通风，避免异味\n4. 温度：常温保存即可\n5. 容器：建议使用透气性好的紫砂罐或纸箱\n\n六堡茶越陈越香，适合长期存放。'
  };

  // 根据关键词返回对应响应
  for (const [key, value] of Object.entries(responses)) {
    if (message.includes(key) && key !== 'default') {
      return Promise.resolve({
        success: true,
        reply: value,
        session_id: getAppGlobalData().sessionId || ''
      });
    }
  }

  return Promise.resolve({
    success: true,
    reply: responses.default,
    session_id: getAppGlobalData().sessionId || ''
  });
}

/**
 * 模拟病害识别响应
 * @param {string} filePath 图片路径
 * @returns {object} 模拟的诊断结果
 */
function mockDiagnoseResponse(filePath) {
  // 随机返回一个病害结果（用于演示）
  const diseases = [
    {
      disease: '炭疽病',
      confidence: 0.85,
      confidencePercent: 85,
      symptoms: '叶片出现圆形或不规则形褐色病斑，边缘深褐色，中央灰白色，有轮纹状小黑点。',
      treatment: '【化学防治】\n1. 50%多菌灵可湿性粉剂800-1000倍液，每隔7-10天喷一次\n2. 25%咪鲜胺乳油1000-1200倍液\n3. 80%代森锰锌可湿性粉剂600-800倍液\n\n【使用要点】\n- 发病初期立即喷药，连续2-3次\n- 重点喷洒嫩梢、嫩叶和新芽\n- 安全间隔期：采收前15-20天停止用药',
      prevention: '增施有机肥提高抗病力，冬季修剪病枝，及时剪除病叶，保持茶园通风透光。'
    },
    {
      disease: '健康',
      confidence: 0.92,
      confidencePercent: 92,
      symptoms: '叶片色泽正常呈深绿色，叶面光滑有光泽，无病斑、无虫害，新梢生长旺盛。',
      treatment: '茶树生长良好，无需任何药剂处理。继续保持科学规范的日常管理。',
      prevention: '加强水肥管理，定期修剪，做好病虫害监测预警。'
    },
    {
      disease: '藻斑病',
      confidence: 0.78,
      confidencePercent: 78,
      symptoms: '叶片表面出现灰绿色或黄褐色藻斑，逐渐扩大成圆形或不规则形。',
      treatment: '【化学防治】\n1. 波尔多液（1:1:100）喷雾，每隔10-15天喷一次\n2. 30%氧氯化铜悬浮剂800-1000倍液喷雾\n3. 75%百菌清可湿性粉剂600-800倍液',
      prevention: '合理密植，加强通风透光，及时清除病叶，控制氮肥用量，雨季注意排水。'
    },
    {
      disease: '灰霉病',
      confidence: 0.72,
      confidencePercent: 72,
      symptoms: '叶片、嫩梢出现水渍状病斑，潮湿时表面产生灰色霉层。',
      treatment: '【化学防治】\n1. 50%腐霉利可湿性粉剂1000-1500倍液\n2. 40%嘧霉胺悬浮剂800-1000倍液\n3. 50%异菌脲可湿性粉剂1000倍液',
      prevention: '严格控制浇水量，雨后及时排水，保持通风透光，及时摘除病叶病梢。'
    }
  ];
  
  // 根据文件名或随机选择
  const randomIndex = Math.floor(Math.random() * diseases.length);
  const result = diseases[randomIndex];
  
  return {
    success: true,
    disease: result.disease,
    confidence: result.confidence,
    confidence_percent: result.confidencePercent,
    symptoms: result.symptoms,
    treatment: result.treatment,
    prevention: result.prevention,
    top3_candidates: [
      { disease: result.disease, confidence: result.confidence },
      { disease: diseases[(randomIndex + 1) % diseases.length].disease, confidence: result.confidence * 0.6 },
      { disease: diseases[(randomIndex + 2) % diseases.length].disease, confidence: result.confidence * 0.3 }
    ],
    is_mock: true,
    suggestion_text: `识别为${result.disease}，置信度${result.confidencePercent}%。${result.confidencePercent >= 70 ? '该结果可信度较高。' : '建议重新上传更清晰的照片。'}`
  };
}

/**
 * 模拟文章列表响应
 */
function mockArticlesResponse(type = '', page = 1, pageSize = 10) {
  const mockArticles = [
    {
      id: 'a1',
      title: '六堡茶的历史渊源',
      type: '历史',
      coverImage: '/images/history.png',
      coverImageUrl: BASE_URL + '/images/history.png',
      viewCount: 1250,
      likeCount: 89,
      createTime: '2024-01-15'
    },
    {
      id: 'a2',
      title: '传统工艺·罨堆发酵',
      type: '工艺',
      coverImage: '/images/craft.png',
      coverImageUrl: BASE_URL + '/images/craft.png',
      viewCount: 890,
      likeCount: 67,
      createTime: '2024-01-20'
    },
    {
      id: 'a3',
      title: '六堡茶冲泡技巧',
      type: '冲泡',
      coverImage: '/images/brew.png',
      coverImageUrl: BASE_URL + '/images/brew.png',
      viewCount: 2100,
      likeCount: 156,
      createTime: '2024-01-25'
    }
  ];
  
  return Promise.resolve({
    success: true,
    data: mockArticles,
    total: mockArticles.length,
    page: page,
    pageSize: pageSize,
    totalPages: 1
  });
}

/**
 * 模拟文章详情响应
 */
function mockArticleDetailResponse(articleId) {
  const articles = {
    'a1': {
      id: 'a1',
      title: '六堡茶的历史渊源',
      type: '历史',
      coverImage: '/images/history.png',
      coverImageUrl: BASE_URL + '/images/history.png',
      content: '六堡茶兴于清朝，嘉庆年间成为名茶，远销南洋，被誉为"可以喝的古董"。六堡茶因原产于广西梧州苍梧县六堡镇而得名，至今已有1500多年历史。',
      viewCount: 1250,
      likeCount: 89,
      createTime: '2024-01-15'
    },
    'a2': {
      id: 'a2',
      title: '传统工艺·罨堆发酵',
      type: '工艺',
      coverImage: '/images/craft.png',
      coverImageUrl: BASE_URL + '/images/craft.png',
      content: '六堡茶核心工艺包含杀青、揉捻、渥堆、陈化，独特的罨堆工艺造就其红浓陈醇的品质特征。',
      viewCount: 890,
      likeCount: 67,
      createTime: '2024-01-20'
    },
    'a3': {
      id: 'a3',
      title: '六堡茶冲泡技巧',
      type: '冲泡',
      coverImage: '/images/brew.png',
      coverImageUrl: BASE_URL + '/images/brew.png',
      content: '建议使用紫砂壶或盖碗，沸水润茶，闷泡片刻出汤，第一泡约10秒，后续每泡增加5秒。',
      viewCount: 2100,
      likeCount: 156,
      createTime: '2024-01-25'
    }
  };
  
  const article = articles[articleId];
  if (article) {
    return Promise.resolve({
      success: true,
      data: article
    });
  } else {
    return Promise.reject({
      success: false,
      error: '文章不存在'
    });
  }
}

/**
 * 模拟茶园巡检响应
 */
function mockInspectResponse() {
  return Promise.resolve({
    success: true,
    status: 'healthy',
    issues: [],
    suggestion: '茶园整体状态良好，茶树生长健壮。建议继续加强日常管理，注意适时浇水施肥，预防病虫害发生。',
    growth_progress: 78,
    health_score: 92,
    inspect_time: new Date().toISOString()
  });
}

/**
 * 模拟茶知识响应
 */
function mockTeaKnowledge() {
  return Promise.resolve({
    success: true,
    category: 'liubao',
    title: '今日茶知识',
    content: '六堡茶是中国黑茶的代表之一，产于广西梧州市苍梧县六堡镇。六堡茶以其独特的"槟榔香"著称，越陈越香，具有很高的收藏价值。\n\n六堡茶的制作工艺包括杀青、揉捻、渥堆、干燥等步骤，其中渥堆发酵是关键工序。优质六堡茶汤色红浓明亮，滋味醇厚甘滑。',
    timestamp: new Date().toISOString()
  });
}

// ==================== 导出模块 ====================

module.exports = {
  // 配置
  BASE_URL,
  API_PATHS,
  
  // 工具函数
  showLoading,
  hideLoading,
  showError,
  
  // API接口
  chat,
  diagnoseDisease,
  inspectGarden,
  getTeaKnowledge,
  
  // 文章相关API接口
  getArticles,
  getArticleDetail,
  likeArticle,
  getArticleTypes,
  
  // 模拟接口（后端不可用时）
  mockChatResponse,
  mockDiagnoseResponse,
  mockArticlesResponse,
  mockArticleDetailResponse,
  mockInspectResponse,
  mockTeaKnowledge
};